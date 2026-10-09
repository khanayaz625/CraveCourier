import bcrypt from 'bcryptjs';
import { getStore } from '../config/db.js';
import { generateToken } from '../middleware/authMiddleware.js';
import { sendRealSMS } from '../services/smsService.js';

// @desc   Register user
// @route  POST /api/auth/register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;
    const store = getStore();

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    const userExists = store.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (userExists) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = {
      _id: `user-${Date.now()}`,
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: role || 'customer',
      phone: phone || '',
      address: '',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
      favorites: [],
      createdAt: new Date().toISOString()
    };

    store.users.push(newUser);

    const token = generateToken(newUser);

    res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      phone: newUser.phone,
      address: newUser.address,
      avatar: newUser.avatar,
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Authenticate user & get token
// @route  POST /api/auth/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const store = getStore();

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = store.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
      address: user.address || '',
      avatar: user.avatar,
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get user profile
// @route  GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const store = getStore();
    const user = store.users.find(u => u._id === req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      avatar: user.avatar,
      favorites: user.favorites || []
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Update user profile
// @route  PUT /api/auth/profile
export const updateProfile = async (req, res) => {
  try {
    const store = getStore();
    const userIndex = store.users.findIndex(u => u._id === req.user._id);
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, phone, address, avatar } = req.body;
    if (name) store.users[userIndex].name = name;
    if (phone !== undefined) store.users[userIndex].phone = phone;
    if (address !== undefined) store.users[userIndex].address = address;
    if (avatar) store.users[userIndex].avatar = avatar;

    const updated = store.users[userIndex];
    res.json({
      _id: updated._id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      phone: updated.phone,
      address: updated.address,
      avatar: updated.avatar
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Google Sign-In / OAuth integration
// @route  POST /api/auth/google
export const googleAuth = async (req, res) => {
  try {
    let { email, name, avatar, googleId, credential } = req.body;
    const store = getStore();

    // If real Google Identity Services JWT credential token was passed
    if (credential && (!email || !name)) {
      try {
        const payloadBase64 = credential.split('.')[1];
        const decodedPayload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf8'));
        if (decodedPayload.email) {
          email = decodedPayload.email;
          name = decodedPayload.name || name || email.split('@')[0];
          avatar = decodedPayload.picture || avatar;
          googleId = decodedPayload.sub || googleId;
        }
      } catch (jwtErr) {
        console.warn('JWT parse notice:', jwtErr.message);
      }
    }

    if (!email) {
      return res.status(400).json({ message: 'Google account email is required' });
    }

    let user = store.users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      // Create new Google User
      user = {
        _id: `user-g-${Date.now()}`,
        name: name || email.split('@')[0],
        email: email.toLowerCase(),
        googleId: googleId || `g_${Date.now()}`,
        authProvider: 'google',
        role: 'customer',
        phone: '',
        address: 'Indiranagar, Bengaluru, Karnataka',
        avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
        favorites: [],
        createdAt: new Date().toISOString()
      };
      store.users.push(user);
    } else {
      if (avatar && !user.avatar) user.avatar = avatar;
      if (googleId) user.googleId = googleId;
      user.authProvider = 'google';
    }

    const token = generateToken(user);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
      address: user.address || '',
      avatar: user.avatar,
      authProvider: 'google',
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Generate & send 6-digit OTP to mobile number
// @route  POST /api/auth/send-otp
export const sendOTP = async (req, res) => {
  try {
    let { phone, fast2smsKey, twoFactorKey, twilioSid, twilioToken, twilioFrom } = req.body;
    const store = getStore();

    if (!phone) {
      return res.status(400).json({ message: 'Mobile phone number is required' });
    }

    // Normalize phone number (remove spaces, dashes, ensure +91 standard or 10 digits)
    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    let normalizedPhone = cleanPhone;
    if (cleanPhone.length === 10) {
      normalizedPhone = `+91${cleanPhone}`;
    }

    if (normalizedPhone.length < 10) {
      return res.status(400).json({ message: 'Please provide a valid 10-digit mobile number' });
    }

    // Generate secure 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 mins validity

    if (!store.otps) store.otps = {};
    store.otps[normalizedPhone] = {
      otp,
      expiresAt,
      attempts: 0
    };

    // Dispatch real SMS via configured SMS Gateways (Fast2SMS, 2Factor, Twilio, MSG91)
    const customKeys = { fast2smsKey, twoFactorKey, twilioSid, twilioToken, twilioFrom };
    const smsResult = await sendRealSMS(normalizedPhone, otp, customKeys);

    res.json({
      success: true,
      message: smsResult.deliveredRealSMS 
        ? `Real SMS OTP delivered to ${normalizedPhone} via ${smsResult.provider}` 
        : `Verification code generated for ${normalizedPhone}`,
      phone: normalizedPhone,
      otp, // Provided for instant developer testing
      smsProvider: smsResult.provider,
      deliveredRealSMS: smsResult.deliveredRealSMS || false,
      expiresIn: 300
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Verify OTP & authenticate / store user credentials in database
// @route  POST /api/auth/verify-otp
export const verifyOTP = async (req, res) => {
  try {
    let { phone, otp, name, role } = req.body;
    const store = getStore();

    if (!phone || !otp) {
      return res.status(400).json({ message: 'Mobile number and 6-digit OTP are required' });
    }

    // Normalize phone number
    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    let normalizedPhone = cleanPhone;
    if (cleanPhone.length === 10) {
      normalizedPhone = `+91${cleanPhone}`;
    }

    if (!store.otps) store.otps = {};
    const otpRecord = store.otps[normalizedPhone];

    // Master fallback OTP for rapid testing: '123456'
    const isMasterOTP = otp === '123456';
    const isMatchingOTP = otpRecord && otpRecord.otp === otp.trim();

    if (!isMasterOTP) {
      if (!otpRecord) {
        return res.status(400).json({ message: 'No OTP requested for this mobile number. Please request a new OTP.' });
      }

      if (Date.now() > otpRecord.expiresAt) {
        delete store.otps[normalizedPhone];
        return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
      }

      if (!isMatchingOTP) {
        otpRecord.attempts = (otpRecord.attempts || 0) + 1;
        if (otpRecord.attempts >= 5) {
          delete store.otps[normalizedPhone];
          return res.status(400).json({ message: 'Too many incorrect attempts. Please request a fresh OTP.' });
        }
        return res.status(400).json({ message: 'Invalid OTP entered. Please check and try again.' });
      }
    }

    // Clear used OTP
    delete store.otps[normalizedPhone];

    // Check if user already exists with this phone number (matching last 10 digits)
    const targetDigits = cleanPhone.slice(-10);
    let user = store.users.find(u => {
      const uDigits = (u.phone || '').replace(/[^0-9]/g, '').slice(-10);
      return uDigits && uDigits === targetDigits;
    });

    if (!user) {
      // Create new user in database store with default customer role
      const lastFour = normalizedPhone.slice(-4);
      user = {
        _id: `user-p-${Date.now()}`,
        name: name?.trim() || `Foodie #${lastFour}`,
        email: `${normalizedPhone.replace('+', '')}@crave-user.com`,
        phone: normalizedPhone,
        role: 'customer',
        authProvider: 'phone',
        address: 'Indiranagar, Bengaluru, Karnataka',
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(normalizedPhone)}`,
        favorites: [],
        createdAt: new Date().toISOString()
      };
      store.users.push(user);
    } else {
      if (name && name.trim() && !user.name) {
        user.name = name.trim();
      }
    }

    const token = generateToken(user);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      address: user.address || '',
      avatar: user.avatar,
      authProvider: 'phone',
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get current SMS gateway status
// @route  GET /api/auth/sms-config
export const getSmsConfig = async (req, res) => {
  res.json({
    fast2smsConfigured: !!(process.env.FAST2SMS_API_KEY && process.env.FAST2SMS_API_KEY.trim()),
    twoFactorConfigured: !!(process.env.TWOFACTOR_API_KEY && process.env.TWOFACTOR_API_KEY.trim()),
    twilioConfigured: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER),
    activeProviders: [
      process.env.FAST2SMS_API_KEY ? 'Fast2SMS' : null,
      process.env.TWOFACTOR_API_KEY ? '2Factor.in' : null,
      process.env.TWILIO_ACCOUNT_SID ? 'Twilio' : null
    ].filter(Boolean)
  });
};

// @desc   Save SMS Gateway credentials dynamically
// @route  POST /api/auth/sms-config
export const saveSmsConfig = async (req, res) => {
  try {
    const { fast2smsKey, twoFactorKey, twilioSid, twilioToken, twilioFrom } = req.body;
    import('fs').then(fs => {
      import('path').then(path => {
        const envPath = path.resolve(process.cwd(), '.env');
        let envContent = '';
        try {
          envContent = fs.readFileSync(envPath, 'utf8');
        } catch (e) {
          envContent = '';
        }

        if (fast2smsKey !== undefined) {
          process.env.FAST2SMS_API_KEY = fast2smsKey;
          envContent = envContent.replace(/FAST2SMS_API_KEY=.*/g, `FAST2SMS_API_KEY=${fast2smsKey}`);
          if (!envContent.includes('FAST2SMS_API_KEY=')) envContent += `\nFAST2SMS_API_KEY=${fast2smsKey}`;
        }
        if (twoFactorKey !== undefined) {
          process.env.TWOFACTOR_API_KEY = twoFactorKey;
          envContent = envContent.replace(/TWOFACTOR_API_KEY=.*/g, `TWOFACTOR_API_KEY=${twoFactorKey}`);
          if (!envContent.includes('TWOFACTOR_API_KEY=')) envContent += `\nTWOFACTOR_API_KEY=${twoFactorKey}`;
        }
        if (twilioSid !== undefined) {
          process.env.TWILIO_ACCOUNT_SID = twilioSid;
          envContent = envContent.replace(/TWILIO_ACCOUNT_SID=.*/g, `TWILIO_ACCOUNT_SID=${twilioSid}`);
          if (!envContent.includes('TWILIO_ACCOUNT_SID=')) envContent += `\nTWILIO_ACCOUNT_SID=${twilioSid}`;
        }
        if (twilioToken !== undefined) {
          process.env.TWILIO_AUTH_TOKEN = twilioToken;
          envContent = envContent.replace(/TWILIO_AUTH_TOKEN=.*/g, `TWILIO_AUTH_TOKEN=${twilioToken}`);
          if (!envContent.includes('TWILIO_AUTH_TOKEN=')) envContent += `\nTWILIO_AUTH_TOKEN=${twilioToken}`;
        }
        if (twilioFrom !== undefined) {
          process.env.TWILIO_PHONE_NUMBER = twilioFrom;
          envContent = envContent.replace(/TWILIO_PHONE_NUMBER=.*/g, `TWILIO_PHONE_NUMBER=${twilioFrom}`);
          if (!envContent.includes('TWILIO_PHONE_NUMBER=')) envContent += `\nTWILIO_PHONE_NUMBER=${twilioFrom}`;
        }

        fs.writeFileSync(envPath, envContent.trim() + '\n', 'utf8');
      });
    });

    res.json({
      success: true,
      message: 'SMS Gateway credentials updated successfully. Real SMS is now active.'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

