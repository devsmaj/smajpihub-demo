const crypto = require('crypto');
const config = require('../config');

/**
 * Verify a Pi Network wallet signature
 * In production, this would verify against Pi's blockchain
 * For now, we implement a simplified verification that works with Pi SDK signatures
 * 
 * @param {string} walletAddress - The wallet address that signed the message
 * @param {string} signature - The signature to verify
 * @param {string} message - The original message that was signed
 * @returns {boolean} True if signature is valid
 */
function verifyWalletSignature(walletAddress, signature, message) {
  if (!walletAddress || !signature || !message) {
    return false;
  }

  // In production, you would:
  // 1. Use Pi Network's SDK or API to verify the signature
  // 2. Check the signature against the blockchain
  // 3. Validate the wallet address format
  
  // For development/sandbox mode, we'll accept a simplified signature
  if (config.piNetworkSandbox) {
    return verifySandboxSignature(walletAddress, signature, message);
  }

  // Production verification would go here
  // This is a placeholder for real Pi Network signature verification
  return verifyProductionSignature(walletAddress, signature, message);
}

/**
 * Sandbox signature verification
 * Accepts mock signatures for development
 */
function verifySandboxSignature(walletAddress, signature, message) {
  // In sandbox mode, we accept any signature that:
  // 1. Is a valid format (base64 or hex)
  // 2. The message contains the wallet address
  
  // Check if message contains wallet address (Pi SDK typically does this)
  if (!message.includes(walletAddress)) {
    return false;
  }

  // Accept mock signatures for testing
  // In production, remove this and use proper verification
  const mockSignatures = [
    'mock_signature',
    'test_signature',
    'sandbox_signature'
  ];
  
  if (mockSignatures.includes(signature)) {
    return true;
  }

  // Try to verify as a proper signature
  try {
    // Check if signature is valid base64 or hex
    const isValidBase64 = /^[A-Za-z0-9+/=]+$/.test(signature);
    const isValidHex = /^[0-9a-fA-F]+$/.test(signature);
    
    return isValidBase64 || isValidHex;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

/**
 * Production signature verification
 * This would integrate with Pi Network's actual verification
 */
function verifyProductionSignature(walletAddress, signature, message) {
  // In production, you would call Pi Network's API
  // Example: await Pi.verifySignature(walletAddress, signature, message);
  
  // For now, implement basic validation
  if (!isValidWalletAddress(walletAddress)) {
    return false;
  }

  // Validate signature format
  if (!signature || signature.length < 10) {
    return false;
  }

  // TODO: Add actual Pi Network signature verification
  // This requires:
  // 1. Pi Network API credentials
  // 2. Integration with Pi SDK
  // 3. Blockchain verification
  
  console.log('Warning: Using placeholder production verification');
  return true;
}

/**
 * Validate Pi wallet address format
 * @param {string} address - Wallet address to validate
 * @returns {boolean} True if valid format
 */
function isValidWalletAddress(address) {
  if (!address || typeof address !== 'string') {
    return false;
  }

  // Pi wallet addresses typically start with certain prefixes
  // and have a specific length
  const piAddressRegex = /^[A-Za-z0-9]{20,60}$/;
  return piAddressRegex.test(address);
}

/**
 * Generate a challenge message for wallet signing
 * @param {string} walletAddress - The user's wallet address
 * @returns {string} Challenge message
 */
function generateChallengeMessage(walletAddress) {
  const timestamp = Date.now();
  const nonce = crypto.randomBytes(16).toString('hex');
  
  return `Sign this message to connect your Pi wallet to SMAJ PI HUB.\n\nWallet: ${walletAddress}\nTimestamp: ${timestamp}\nNonce: ${nonce}\n\nThis request will not trigger a blockchain transaction or cost any Pi.`;
}

/**
 * Extract wallet address from auth data
 * Pi SDK returns user data with wallet info
 * @param {Object} authData - Authentication data from Pi SDK
 * @returns {string|null} Wallet address
 */
function extractWalletAddress(authData) {
  if (!authData) return null;
  
  // Try to get wallet from auth data
  const user = authData.user || authData;
  
  if (user.wallets && Array.isArray(user.wallets) && user.wallets.length > 0) {
    // Return the primary wallet address
    const primaryWallet = user.wallets.find(w => w.primary) || user.wallets[0];
    return primaryWallet.address;
  }
  
  // Fallback: try to get from auth result
  if (user.address) {
    return user.address;
  }
  
  return null;
}

module.exports = {
  verifyWalletSignature,
  isValidWalletAddress,
  generateChallengeMessage,
  extractWalletAddress,
  verifySandboxSignature,
  verifyProductionSignature
};
