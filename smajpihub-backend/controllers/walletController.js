const User = require('../models/User');
const LoginActivity = require('../models/LoginActivity');
const { generateSessionToken } = require('../utils/jwt');
const { verifyWalletSignature, isValidWalletAddress } = require('../utils/wallet');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * POST /api/connect-wallet
 * Connect Pi wallet and create session
 */
const connectWallet = asyncHandler(async (req, res) => {
  const { walletAddress, signature, message, username, role } = req.body;

  // Validate required fields
  if (!walletAddress || !signature) {
    return res.status(400).json({
      success: false,
      message: 'Wallet address and signature are required.'
    });
  }

  // Validate wallet address format
  if (!isValidWalletAddress(walletAddress)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid wallet address format.'
    });
  }

  // Verify signature
  const messageToVerify = message || `Connect wallet: ${walletAddress}`;
  const isValidSignature = verifyWalletSignature(walletAddress, signature, messageToVerify);

  if (!isValidSignature) {
    return res.status(401).json({
      success: false,
      message: 'Invalid wallet signature. Please sign the message with your Pi wallet.'
    });
  }

  // Normalize wallet address
  const normalizedAddress = walletAddress.toLowerCase();

  // Find or create user
  let user = await User.findOne({ walletAddress: normalizedAddress });

  if (!user) {
    // Create new user
    user = await User.create({
      walletAddress: normalizedAddress,
      username: username || '',
      role: role || 'buyer',
      isVerified: true,
      lastLogin: new Date()
    });
  } else {
    // Update existing user
    if (username) user.username = username;
    if (role && user.role === 'buyer') user.role = role;
    user.lastLogin = new Date();
    await user.save();
  }

  // Track login activity
  await LoginActivity.create({
    user: user._id,
    ip: req.ip,
    userAgent: req.headers['user-agent']
  });

  // Generate session token
  const { token, expiresAt, expiresIn } = generateSessionToken(user);

  res.status(200).json({
    success: true,
    message: 'Wallet connected successfully.',
    token,
    expiresAt,
    expiresIn,
    user: {
      walletAddress: user.walletAddress,
      username: user.username,
      role: user.role,
      profile: user.profile
    }
  });
});

/**
 * GET /api/user
 * Get current user info
 */
const getUser = asyncHandler(async (req, res) => {
  // req.user is attached by auth middleware
  const user = req.user;

  res.status(200).json({
    success: true,
    user: {
      walletAddress: user.walletAddress,
      username: user.username,
      email: user.email,
      role: user.role,
      profile: user.profile,
      isVerified: user.isVerified,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt
    }
  });
});

/**
 * POST /api/logout
 * Logout user (client-side token removal)
 */
const logout = asyncHandler(async (req, res) => {
  // In a stateless JWT setup, logout is handled client-side
  // Optionally, you could implement token blacklisting with Redis
  
  res.status(200).json({
    success: true,
    message: 'Logged out successfully.'
  });
});

/**
 * PUT /api/user/profile
 * Update user profile
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { username, fullName, email, phone, country, bio } = req.body;
  const user = req.user;

  // Update fields
  if (username) user.username = username;
  if (email) user.email = email;

  user.profile = user.profile || {};
  if (fullName) {
    user.profile.fullName = fullName;
  }
  if (phone) user.profile.phone = phone;
  if (country) user.profile.country = country;
  if (bio) {
    user.profile.bio = bio;
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully.',
    user: {
      walletAddress: user.walletAddress,
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role,
      profile: user.profile
    }
  });
});

/**
 * POST /api/user/avatar
 * Update user avatar
 */
const updateAvatar = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image file uploaded.' });
  }

  // In a real app, you'd upload req.file.buffer to a cloud storage
  // (S3, Cloudinary, etc.) and save the URL.
  // For this example, we'll save it as a base64 string.
  const avatarUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

  user.profile = user.profile || {};
  user.profile.avatar = avatarUrl;
  await user.save();

  res.status(200).json({ success: true, message: 'Avatar updated.', avatarUrl });
});
/**
 * PUT /api/user/role
 * Update user role
 */
const updateRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const user = req.user;

  // Validate role
  const validRoles = ['buyer', 'vendor', 'admin'];
  if (!role || !validRoles.includes(role)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid role. Must be buyer, vendor, or admin.'
    });
  }

  user.role = role;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Role updated successfully.',
    user: {
      walletAddress: user.walletAddress,
      role: user.role
    }
  });
});

/**
 * GET /api/sso-token
 * Generate SSO token for SMAJ STORE
 */
const getSSOToken = asyncHandler(async (req, res) => {
  const { service } = req.query;
  
  // Verify service parameter
  if (!service || service !== 'smajstore') {
    return res.status(400).json({
      success: false,
      message: 'Invalid service. Only smajstore is supported.'
    });
  }

  const user = req.user;

  // Generate SSO token
  const { token, expiresAt, expiresIn } = require('../utils/jwt').generateSSOToken(user);

  // Create redirect URL
  const redirectUrl = `https://officialsmaj.github.io/smaj-store/?token=${token}`;

  res.status(200).json({
    success: true,
    message: 'SSO token generated successfully.',
    redirectUrl,
    token,
    expiresAt,
    expiresIn
  });
});

module.exports = {
  connectWallet,
  getUser,
  logout,
  updateProfile,
  updateAvatar,
  updateRole,
  getSSOToken
};
