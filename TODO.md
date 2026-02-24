# SMAJ PI HUB Backend - Implementation TODO

## Phase 1: Project Setup ✅
- [x] Create backend directory structure (smajpihub-backend/)
- [x] Update package.json with all required dependencies
- [x] Create config files (db.js, index.js, .env)
- [x] Generate RSA key pair for RS256 JWT signing (utils/generateKeys.js)

## Phase 2: Database Models ✅
- [x] Create User model (wallet address, role, profile)
- [x] Create Service model (name, description, price, vendor)
- [x] Create Order model (user, service, status, timestamp)

## Phase 3: Core Utilities ✅
- [x] Implement JWT signing with RS256 (utils/jwt.js)
- [x] Implement wallet signature verification (utils/wallet.js)
- [x] Create error handling middleware (middleware/errorHandler.js)

## Phase 4: Authentication & Sessions ✅
- [x] Create JWT auth middleware (middleware/auth.js)
- [x] Create wallet connection endpoint (POST /api/connect-wallet)
- [x] Create user info endpoint (GET /api/user)
- [x] Create logout endpoint (POST /api/logout)

## Phase 5: SSO Integration ✅
- [x] Create SSO token endpoint (GET /api/sso-token)
- [x] Configure CORS for SMAJ STORE domain
- [x] Add public key endpoint for SMAJ STORE verification

## Phase 6: Services & Marketplace ✅
- [x] Create services list endpoint (GET /api/services)
- [x] Create service details endpoint (GET /api/services/:id)
- [x] Create create order endpoint (POST /api/order)
- [x] Create orders list endpoint (GET /api/orders)

## Phase 7: Security & Best Practices ✅
- [x] Add rate limiting to all endpoints
- [x] Add helmet for security headers
- [x] Add request logging (morgan)
- [x] Configure production settings

## Phase 8: Testing & Integration
- [ ] Install npm dependencies
- [ ] Start the server
- [ ] Test wallet connection flow
- [ ] Test SSO token generation
- [ ] Test service/order endpoints

---

## Files Created

```
smajpihub-backend/
├── config/
│   ├── db.js
│   └── index.js
├── controllers/
│   ├── walletController.js
│   ├── serviceController.js
│   └── orderController.js
├── middleware/
│   ├── auth.js
│   └── errorHandler.js
├── models/
│   ├── User.js
│   ├── Service.js
│   └── Order.js
├── routes/
│   ├── auth.js
│   ├── services.js
│   └── orders.js
├── utils/
│   ├── jwt.js
│   ├── wallet.js
│   └── generateKeys.js
├── .env
├── package.json
├── server.js
└── README.md
```

## API Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/connect-wallet` | POST | No | Connect Pi wallet |
| `/api/user` | GET | Yes | Get current user |
| `/api/logout` | POST | Yes | Logout |
| `/api/sso-token` | GET | Yes | Get SSO token for SMAJ STORE |
| `/api/services` | GET | No | List services |
| `/api/services/:id` | GET | No | Get service details |
| `/api/services` | POST | Yes | Create service |
| `/api/order` | POST | Yes | Create order |
| `/api/orders` | GET | Yes | Get user orders |
| `/api/public-key` | GET | No | Get public key for token verification |

---

## Next Steps

1. Install dependencies: `cd smajpihub-backend && npm install`
2. Generate keys: `npm run generate-keys`
3. Start server: `npm run dev`
4. Test endpoints using the API
