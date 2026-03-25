# SMAJ PI JOBS - Freelance Marketplace

A comprehensive freelance marketplace frontend built with HTML, CSS, and JavaScript. Part of the SMAJ Ecosystem powered by SMAJ PI HUB.

## Overview

SMAJ PI JOBS is a blockchain-powered freelance marketplace where freelancers can find work and clients can post jobs. The platform features wallet connection through SMAJ PI HUB, secure smart contract payments, and AI-powered job matching.

## Folder Structure

```
smaj-pi-jobs/
├── index.html          # Home page
├── jobs.html           # Browse jobs page
├── job-details.html    # Job details page
├── post-job.html       # Post a new job
├── dashboard.html      # User dashboard
├── css/
│   ├── variables.css   # CSS custom properties
│   ├── style.css       # Main styles
│   └── responsive.css  # Responsive design
├── js/
│   ├── wallet.js       # Wallet connection (SMAJ PI HUB)
│   ├── jobs.js         # Job data and functions
│   └── main.js         # Main application logic
└── assets/
    ├── images/
    └── icons/
```

## Features

### 1. Wallet Connection (SMAJ PI HUB)
- Connect wallet button in header
- Wallet modal with connection options
- Display connected wallet address
- Balance display (SMAJ Tokens)
- Disconnect wallet option
- Connection persists in localStorage

### 2. Job Listings
- Browse all available jobs
- Filter by category, budget, experience level
- Search functionality
- Sort by recent, budget, proposals
- Job cards with key information

### 3. Job Details
- Full job description
- Client information and ratings
- Budget and timeline
- Skills required
- Apply button (requires wallet connection)

### 4. Post Job
- Job creation form
- Category and experience level selection
- Budget setting (fixed, hourly, monthly)
- Duration selection
- Skills input
- Requires wallet connection to post

### 5. Dashboard
- User statistics (balance, active jobs, completed jobs, rating)
- Active jobs overview
- Recent transactions table
- Connected wallet display
- Sidebar navigation

## Pages

| Page | Description |
|------|-------------|
| `index.html` | Home page with hero, categories, featured jobs |
| `jobs.html` | Browse and search all jobs with filters |
| `job-details.html` | View full job details and apply |
| `post-job.html` | Create a new job posting |
| `dashboard.html` | User dashboard with stats and activity |

## Wallet Integration

The wallet connection simulates SMAJ PI HUB integration:

1. Click "Connect Wallet" in the header
2. The wallet modal opens
3. Click "Connect SMAJ PI HUB"
4. A simulated wallet address is generated
5. Random SMAJ token balance is assigned
6. Connection persists across page refreshes

## Running the Project

Simply open the HTML files in a web browser:

```bash
# Option 1: Open directly
open index.html

# Option 2: Use a local server
npx serve .
```

## Technologies Used

- **HTML5** - Semantic markup
- **CSS3** - Custom properties, Grid, Flexbox, Animations
- **JavaScript (ES6+)** - Modern JavaScript features
- **localStorage** - Persistent wallet connection

## SMAJ Ecosystem

SMAJ PI JOBS is part of the SMAJ Ecosystem - a unified digital platform connecting:

- SMAJ STORE - E-Commerce
- SMAJ FOOD DELIVERY - Food Delivery
- SMAJ PI JOBS - Freelancing
- SMAJ PI HEALTH - Healthcare
- SMAJ PI EDU - Education
- SMAJ PI TRANSPORT - Transport
- SMAJ PI AGRO - Agriculture
- SMAJ PI ENERGY - Utilities
- SMAJ PI CHARITY - Charity
- SMAJ PI HOUSING - Real Estate
- SMAJ PI EVENTS - Events
- SMAJ PI SWAP - Second-hand Marketplace
- SMAJ TOKEN - Native Currency

## License

This project is for demonstration purposes as part of the SMAJ Ecosystem white paper.

---

Built with ❤️ by SMAJ PI HUB

