import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { registerUser, verifyOTP, loginUser, getUserById, comparePassword, hashPassword } from '../services/auth';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { supabaseAdmin } from '../db/supabaseAdmin';
import { env } from '../config/env';
import { logger } from '../config/logger';

export const register = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('role').optional().isIn(['student', 'security']),
  
  async (req: Request, res: Response): Promise<void> => {
    res.status(400).json({ error: 'Sign up is handled by Supabase. Please use the frontend registration form.' });
  },
];

export const verify = [
  body('userId').notEmpty(),
  body('otp').isLength({ min: 6, max: 6 }),
  
  async (req: Request, res: Response): Promise<void> => {
    res.json({ message: 'Email verification is now handled by Supabase.' });
  },
];

export const createLocalUser = [
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Email must be a valid email address')
    .normalizeEmail(),
  body('name')
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 1, max: 120 }).withMessage('Name must be between 1 and 120 characters')
    .trim(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  body('role')
    .notEmpty().withMessage('Role is required')
    .isIn(['student', 'security']).withMessage('Role must be either "student" or "security"'),
  
  async (req: Request, res: Response): Promise<void> => {
    try {
      logger.debug('createLocalUser request received');

      // Validate request body
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => {
          const field = 'param' in err ? err.param : 'unknown';
          return `${field}: ${err.msg}`;
        }).join(', ');
        logger.debug('createLocalUser validation error', { errorMessages });
        res.status(400).json({ 
          message: "Validation failed", 
          errors: errors.array(),
          details: errorMessages
        });
        return;
      }

      // Extract and validate fields from request body
      const { email, password, role, name } = req.body;
      
      // Additional validation check (after express-validator)
      if (!email || typeof email !== 'string') {
        res.status(400).json({ 
          message: "Email is required and must be a string"
        });
        return;
      }

      if (!password || typeof password !== 'string') {
        res.status(400).json({ 
          message: "Password is required and must be a string"
        });
        return;
      }

      if (!role || typeof role !== 'string') {
        res.status(400).json({ 
          message: "Role is required and must be a string"
        });
        return;
      }

      if (!name || typeof name !== 'string' || !name.trim()) {
        res.status(400).json({
          message: "Name is required and must be a string"
        });
        return;
      }

      if (role !== 'student' && role !== 'security') {
        res.status(400).json({ 
          message: "Role must be either 'student' or 'security'"
        });
        return;
      }

      // Normalize email (lowercase and trim)
      const normalizedEmail = email.toLowerCase().trim();
      const normalizedName = String(name).trim();
      
      // Ensure password is a string (no modification)
      const passwordString = String(password);

      logger.debug('createLocalUser processing', { email: normalizedEmail, role });

      // Check if user already exists locally
      const { data: existingUser, error: checkError } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', normalizedEmail)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 = not found, which is fine
        logger.error('createLocalUser database check failed', checkError);
        res.status(500).json({ message: "Failed to check if user exists" });
        return;
      }

      if (existingUser) {
        logger.info('createLocalUser user already exists', normalizedEmail);
        res.status(409).json({ message: "User already exists in local database" });
        return;
      }

      // Hash the password using bcrypt.hash (single hash, not double)
      const passwordHash = await hashPassword(passwordString);
      
      if (!passwordHash || typeof passwordHash !== 'string') {
        logger.error('createLocalUser password hash failed or invalid', { 
          hasHash: !!passwordHash, 
          hashType: typeof passwordHash 
        });
        res.status(500).json({ message: "Failed to hash password" });
        return;
      }

      // Create user in local database
      const { data: user, error: insertError } = await supabaseAdmin
        .from('users')
        .insert({
          email: normalizedEmail,
          password_hash: passwordHash,
          name: normalizedName,
          role: role,
          is_verified: false, // Will be set to true after email verification
          security_approved: role !== 'security',
        })
        .select()
        .single();

      if (insertError) {
        logger.error('createLocalUser database insert failed', insertError);
        res.status(500).json({ 
          message: "Failed to create local user",
          error: insertError.message
        });
        return;
      }

      if (!user) {
        logger.error('createLocalUser user not returned after insert');
        res.status(500).json({ message: "Failed to create local user" });
        return;
      }
      logger.info('createLocalUser success', { id: user.id, email: user.email, role: user.role });
      
      res.status(201).json({
        message: "Local user created successfully",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          security_approved: user.security_approved,
        },
      });
    } catch (error: any) {
      logger.error('createLocalUser unexpected error', error);
      res.status(500).json({ 
        message: "Failed to create local user",
        error: error.message || "Internal server error"
      });
    }
  },
];

export const login = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ message: "Validation failed", errors: errors.array() });
        return;
      }

      const { email, password } = req.body;
      const normalizedEmail = email.toLowerCase();

      if (normalizedEmail === env.adminEmail().toLowerCase() && env.adminBootstrapEnabled()) {
        try {
          const { data: usersList } = await supabaseAdmin.auth.admin.listUsers();
          const authUser = usersList?.users?.find((u) => u.email?.toLowerCase() === normalizedEmail);

          if (!authUser) {
            await supabaseAdmin.auth.admin.createUser({
              email: normalizedEmail,
              password: env.adminPassword(),
              email_confirm: true,
              user_metadata: {
                role: 'admin',
                name: 'Admin',
              },
            });
          } else {
            await supabaseAdmin.auth.admin.updateUserById(authUser.id, {
              password: env.adminPassword(),
              user_metadata: {
                role: 'admin',
                name: 'Admin',
              },
            });
          }
        } catch (bootstrapError: any) {
          logger.warn('Admin bootstrap warning:', bootstrapError?.message || bootstrapError);
        }

        const passwordHash = await hashPassword(env.adminPassword());
        const { data: existingAdmin } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('email', normalizedEmail)
          .maybeSingle();

        if (existingAdmin?.id) {
          await supabaseAdmin
            .from('users')
            .update({
              password_hash: passwordHash,
              role: 'admin',
              name: 'Admin',
              is_verified: true,
              security_approved: true,
            })
            .eq('id', existingAdmin.id);
        } else {
          await supabaseAdmin
            .from('users')
            .insert({
              email: normalizedEmail,
              password_hash: passwordHash,
              role: 'admin',
              name: 'Admin',
              is_verified: true,
              security_approved: true,
            });
        }
      }

      logger.debug('Login attempt', normalizedEmail);

      // Step 1: Retrieve user via SupabaseAdmin email lookup
      // Note: getUserByEmail doesn't exist, using listUsers with email filter
      const { data: usersList, error: adminError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (adminError) {
        logger.error('Login failure: Supabase lookup failed');
        res.status(500).json({
          message: "Server error verifying account"
        });
        return;
      }

      // Step 2: Verify the user exists in Supabase Auth
      const supabaseUser = usersList?.users?.find(u => u.email?.toLowerCase() === normalizedEmail);
      
      if (!supabaseUser) {
        logger.debug('Login failure: user not found');
        res.status(404).json({
          message: "User not found"
        });
        return;
      }

      // Step 3: Verify email_confirmed_at is NOT null
      if (!supabaseUser.email_confirmed_at) {
        logger.debug('Login failure: email not verified');
        res.status(400).json({
          message: "Email not verified yet. Please check your inbox."
        });
        return;
      }

      // Step 4: Retrieve the corresponding user from the local database
      const { data: localUser, error: dbError } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', normalizedEmail)
        .single();

      if (dbError && dbError.code !== 'PGRST116') { // PGRST116 = not found
        logger.error('Login failure: database lookup error');
        res.status(500).json({
          message: "Server error retrieving user data"
        });
        return;
      }

      let finalUser: any;
      let userRole: 'student' | 'security' | 'admin';

      // Step 5: Validate the password using ONLY local database
      if (!localUser) {
        logger.debug('Login failure: user not found in local database');
        res.status(401).json({
          message: "Invalid email or password"
        });
        return;
      }

      // Verify password with local hash
      const passwordMatch = await comparePassword(password, localUser.password_hash);
      
      if (!passwordMatch) {
        logger.debug('Login failure: password mismatch');
        res.status(401).json({
          message: "Invalid email or password"
        });
        return;
      }

      if (localUser.role === 'security' && !localUser.security_approved) {
        res.status(403).json({
          message: 'Security account pending admin approval'
        });
        return;
      }
      
      finalUser = localUser;
      userRole = localUser.role;

      // Step 6: Generate and return JWT
      const payload = {
        userId: finalUser.id,
        email: finalUser.email,
        role: userRole,
      };

      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);

      // Set refresh token as HTTP-only cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: env.isProduction,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({
        user: {
          id: finalUser.id,
          email: finalUser.email,
          name: finalUser.name,
          role: userRole,
          security_approved: finalUser.security_approved,
        },
        accessToken,
      });
    } catch (error: any) {
      logger.error('Login failure: unexpected error', error.message || error);
      res.status(500).json({ message: "Login failed" });
    }
  },
];

export const me = async (req: Request, res: Response): Promise<void> => {
  try {
    // This endpoint requires authentication middleware
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const user = await getUserById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: (user as any).name,
        role: user.role,
        is_verified: user.is_verified,
        security_approved: (user as any).security_approved,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
