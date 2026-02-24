# SMAJ PI HUB Backend - Implementation TODO

## Phase 1: Project Setup
- [ ] Create backend directory structure (smajpihub-backend/)
- [ ] Update package.json with all required dependencies
- [ ] Create config files (db.js, keys.js, env.js)
- [ ] Generate RSA key pair for RS256 JWT signing

## Phase 2: Database Models
- [ ] Create User model (wallet address, role, profile)
- [ ] Create Service model (name, description, price, vendor)
- [ ] Create Order model (user, service, status, timestamp)

## Phase 3: Core Utilities
- [ ] Implement JWT signing with RS256 (utils/jwt.js)
- [ ] Implement wallet signature verification (utils/wallet.js)
- [ ] Create error handling middleware (middleware/errorHandler.js)

## Phase 4: Authentication & Sessions
- [ ] Create JWT auth middleware (middleware/auth.js)
- [ ] Create wallet connection endpoint (POST /api/connect-wallet)
- [ ] Create user info endpoint (GET /api/user)
- [ ] Create logout endpoint (POST /api/logout)

## Phase 5: SSO Integration
- [ ] Create SSO token endpoint (GET /api/sso-token)
- [ ] Configure CORS for SMAJ STORE domain
- [ ] Test token generation and redirect flow

## Phase 6: Services & Marketplace
- [ ] Create services list endpoint (GET /api/services)
- [ ] Create service details endpoint (GET /api/service/:id)
- [ ] Create create order endpoint (POST /api/order)
- [ ] Create orders list endpoint (GET /api/orders)

## Phase 7: Security & Best Practices
- [ ] Add rate limiting to all endpoints
- [ ] Add input validation
- [ ] Add request logging
- [ ] Configure production settings

## Phase 8: Testing & Integration
- [ ] Test wallet connection flow
- [ ] Test SSO token generation
- [ ] Test service/order endpoints
- [ ] Verify frontend integration works

---

## Progress Log
### Completed:
- [x] Analyzed project structure and existing frontend code
- [x] Understood Pi SDK integration in frontend
- [x] Identified API endpoints expected by frontend

### Pending:
- All implementation tasks listed above
