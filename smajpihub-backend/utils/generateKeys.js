const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Generate RSA key pair for JWT signing
function generateKeyPair() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  });

  return { publicKey, privateKey };
}

// Save keys to files
function saveKeys(publicKey, privateKey) {
  const keysDir = path.join(__dirname, '..', 'keys');
  
  // Create keys directory if it doesn't exist
  if (!fs.existsSync(keysDir)) {
    fs.mkdirSync(keysDir, { recursive: true });
  }
  
  fs.writeFileSync(path.join(keysDir, 'private.pem'), privateKey);
  fs.writeFileSync(path.join(keysDir, 'public.pem'), publicKey);
  
  console.log('Keys generated and saved successfully!');
  console.log(`Private key: ${path.join(keysDir, 'private.pem')}`);
  console.log(`Public key: ${path.join(keysDir, 'public.pem')}`);
}

// Main execution
const { publicKey, privateKey } = generateKeyPair();
saveKeys(publicKey, privateKey);

console.log('\n--- PUBLIC KEY (share this with SMAJ STORE) ---\n');
console.log(publicKey);
console.log('\n--- PRIVATE KEY (keep this secret) ---\n');
console.log(privateKey);
