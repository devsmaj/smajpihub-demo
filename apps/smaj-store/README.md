# SMAJ STORE

## Vision and focus
Blockchain-based marketplace with vendor verification, decentralized escrow, and Pi payments that mirror the SMAJ PI HUB branding.

## Front-end TODO (white paper alignment)

### 1. Layout & Branding
- [ ] Reuse header/footer, typography, and theming from `../../css/style.css` so the store feels like the main ecosystem portal.
- [ ] Build hero, ecosystem, and trust sections that repeat the white paper messaging, mission text, and CTAs.
- [ ] Implement a two-column layout with a vertical category sidebar and a responsive product grid.
- [ ] Mirror sidebar styles for Electronics, Fashion, Digital Assets, Health, Energy, Agro, Events, etc., with hover/active states matching the gateway look.
- [ ] Surface the shared “Wallet Connection” status indicator and `Home` link back to `../../index.html`.

### 2. Product Experience
- [ ] Create a 4-column grid (desktop) that gracefully shrinks to 2 and 1 column on smaller breakpoints via `css/store-layout.css`.
- [ ] Display placeholder images, vendor names, “Verified Vendor” badges, and trust copy per card (sourced from white paper verification model).
- [ ] Show dual pricing: USD (formatted via Intl) and Pi (calculated using GCV: 1 PI = $314,159) with 7 decimal places.
- [ ] Provide “Buy with Pi” and “Add to Cart” buttons reusing `.btn-primary`/`.btn-secondary` styles.
- [ ] Add escrow/trust overlays (e.g., badge icons, compliance chips) to reinforce the white paper’s verification flow.

### 3. Wallet & Ecosystem Integration
- [ ] Load `../../js/wallet.js` and `../../js/main.js` so wallet detection, connection flows, and menu hamburger logic are shared.
- [ ] Listen for `smaj:wallet-changed` to update the hero indicator (`#walletConnectionState`) with shortened addresses.
- [ ] Ensure the hero CTA and nav restore to `Home` and discovery pages inside the pi-enabled hub.
- [ ] Keep the product rendering logic in `apps/smaj-store/js/store.js` so GCV conversions happen before the DOM paints.

### 4. White Paper Storytelling
- [ ] Repeat the white paper’s “13 Integrated Platforms” grid or summary section to explain how SMAJ STORE fits inside the ecosystem.
- [ ] Highlight SMAJ Token utility (rewards, governance, staking, loyalty/cashback, fee discounts) beside Pi pricing to reflect the token chapter.
- [ ] Add AI + verification storytelling: include cards referencing AI guidance, fraud monitoring, and verified identity layers.
- [ ] Link to “How Pricing Works” resources (CTA or modal) describing the GCV anchor and Pi pricing certainty.

### 5. Accessibility & Responsiveness
- [ ] Ensure semantic headings/ARIA roles for hero, sidebar, and product grid (aria-live on price updates, `section` wrappers).
- [ ] Provide keyboard-friendly navigation for sidebar links and CTA buttons.
- [ ] Guarantee good contrast and maintain the gradient/backdrop styles seen in the white paper assets.

### 6. Next Steps / Integration
- [ ] Define real catalog data schema (name, description, vendor, USD, Pi, category, verification status, escrow state).
- [ ] Plan vendor onboarding flow capturing identity docs and trust badges (per the verification system section).
- [ ] Prepare data/UX for escrow milestones, dispute reports, and rated delivery statuses referenced in the white paper.
- [ ] Sketch analytics dashboards for trust signals, wallet-connected shopping, and SMAJ Token reward distribution.
