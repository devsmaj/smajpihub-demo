# SMAJ PI HUB Backend

Secure backend for SMAJ PI HUB that handles wallet connections, user sessions, and Single Sign-On (SSO) integration with SMAJ STORE.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Endpoints](#api-endpoints)
- [SSO Integration](#sso-integration)
- [Security](#security)
- [Running the Server](#running-the-server)

## Features

- **Wallet Connection**: Connect Pi Network wallets with signature verification
- **User Sessions**: JWT-based session management with RS256 signing
- **Single Sign-On (SSO)**: Generate tokens for SMAJ STORE integration
- **Service Marketplace**: List and manage services
- **Order Management**: Create and track orders
- **Role-based Access**: Buyer, Vendor, and Admin roles

## Tech Stack

- Node.js + Express
- MongoDB (Mongoose ODM)
- JWT (RS256 signing)
- Pi Network Wallet Verification
- Redis (optional for session caching)

## Project Structure

```
smajpihub-backend/
├── config/
│   ├── db.js          # Database connection
│   └── index.js       # Configuration loader
├── controllers/
│   ├── walletController.js   # Wallet & auth operations
│   ├── serviceController.js # Service CRUD
│   └── orderController.js    # Order management
├── middleware/
│   ├── auth.js        # JWT authentication
│   └── errorHandler.js # Error handling
├── models/
│   ├── User.js        # User model
│   ├── Service.js    # Service model
│   └── Order.js      # Order model
├── routes/
│   ├── auth.js       # Auth routes
│   ├── services.js  # Service routes
│   └── orders.js    # Order routes
├── utils/
│   ├── jwt.js        # JWT signing/verification
│   ├── wallet.js    # Wallet verification
│   └── generateKeys.js # Key generation script
├── server.js         # Express server entry point
├── package.json
└── .env              # Environment variables
```

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Installation

1. Navigate to the backend directory:
```
bash
cd smajpihub-backend
```

2. Install dependencies:
```
bash
npm install
```

3. Generate RSA key pair for JWT signing:
```
bash
npm run generate-keys
```

4. Configure environment variables (see `.env` file)

## Configuration

Edit the `.env` file to configure:

```
env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/smajpihub

# Redis Configuration (optional)
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT Configuration
JWT_EXPIRES_IN=1h

# CORS Configuration
CORS_ORIGIN=http://localhost:5500,https://officialsmaj.github.io

# Pi Network Configuration
PI_NETWORK_SANDBOX=true

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/connect-wallet` | Connect Pi wallet | No |
| GET | `/api/user` | Get current user | Yes |
| POST | `/api/logout` | Logout user | Yes |
| PUT | `/api/user/profile` | Update profile | Yes |
| PUT | `/api/user/role` | Update user role | Yes |
| GET | `/api/sso-token?service=smajstore` | Get SSO token | Yes |

### Services

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/services` | List all services | No |
| GET | `/api/services/categories` | List categories | No |
| GET | `/api/services/:id` | Get service details | No |
| POST | `/api/services` | Create service | Yes (Vendor) |
| PUT | `/api/services/:id` | Update service | Yes |
| DELETE | `/api/services/:id` | Delete service | Yes |

### Orders

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/order` | Create order | Yes |
| GET | `/api/orders` | List user orders | Yes |
| GET | `/api/order/:id` | Get order details | Yes |
| PUT | `/api/order/:id/status` | Update order status | Yes (Vendor) |
| PUT | `/api/order/:id/payment` | Update payment | Yes (Admin) |

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api` | API information |
| GET | `/api/public-key` | Get public key for token verification |

## SSO Integration

### How SSO Works

1. User logs in to SMAJ PI HUB via wallet connection
2. User requests SSO token for SMAJ STORE
3. Backend generates JWT signed with RS256
4. Backend redirects to SMAJ STORE with token in URL
5. SMAJ STORE verifies token using public key
6. User is automatically logged in to SMAJ STORE

### Getting the Public Key

SMAJ STORE needs the public key to verify SSO tokens. Get it from:

```
GET http://localhost:3000/api/public-key
```

Or use the production URL when deployed.

### Token Payload

```
json
{
  "wallet_address": "user_wallet_address",
  "role": "buyer/vendor",
  "type": "sso",
  "service": "smajstore",
  "exp": 1234567890
}
```

### Redirect URL Format

```
https://officialsmaj.github.io/smaj-store/?token=<JWT_TOKEN>
```

## Security

- **RS256 JWT Signing**: Asymmetric encryption for secure token handling
- **Token Expiry**: Tokens expire after 1 hour
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Configured for allowed origins only
- **Helmet**: Security headers
- **Input Validation**: All inputs are validated

## Running the Server

### Development

```
bash
npm run dev
```

### Production

```
bash
npm start
```

### Server URL

- Local: `http://localhost:3000`
- Health check: `http://localhost:3000/health`

## Testing SSO

1. Start the server
2. Connect wallet:
```
bash
curl -X POST http://localhost:3000/api/connect-wallet \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "your_wallet_address",
    "signature": "test_signature",
    "message": "Connect wallet: your_wallet_address"
  }'
```

3. Get SSO token (use the token from step 2):
```
bash
curl -X GET "http://localhost:3000/api/sso-token?service=smajstore" \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

4. The response will include a `redirectUrl` that you can use to access SMAJ STORE

## License

MIT
