# SMAJ PI HUB

All-in-one platform for Pi ecosystem services with frontend pages, app-specific microsites, and backend API support.

## Overview

This repository contains:
- A frontend web platform built with HTML, CSS, and Vanilla JavaScript
- App-specific subprojects under `apps/` for service verticals such as food delivery, education, health, housing, energy, transport, charity, and more
- A backend API service in `smajpihub-backend/`

The project is designed as a hub for Pi-powered services, marketplace flows, community pages, and wallet-oriented onboarding.

## Tech Stack

- Frontend: HTML5, CSS3, Vanilla JavaScript (ES6)
- Backend: Node.js, Express, MongoDB, Redis, JWT authentication
- Utilities: Boxicons, dotenv, Helmet, rate limiting, CORS

## Repository Structure

```text
/workspaces/smajpihub-demo
|-- apps/
|   |-- smaj-food-delivery/
|   |-- smaj-pi-agro/
|   |-- smaj-pi-charity/
|   |-- smaj-pi-edu/
|   |-- smaj-pi-energy/
|   |-- smaj-pi-events/
|   |-- smaj-pi-health/
|   |-- smaj-pi-housing/
|   |-- smaj-pi-jobs/
|   |   |-- index.html
|   |   |-- dashboard.html
|   |   |-- jobs.html
|   |   |-- profile.html
|   |   `-- ...
|   |-- smaj-pi-swap/
|   |-- smaj-pi-transport/
|   |-- smaj-store/
|   `-- smaj-token-hub/
|-- assets/
|   `-- images/
|-- css/
|-- js/
|-- pages/
|-- index.html
|-- package.json
|-- package-lock.json
|-- smajpihub-backend/
|   |-- package.json
|   |-- README.md
|   |-- server.js
|   `-- config/
`-- README.md
```

## Frontend Notes

- The frontend is a static, multi-page site with shared header/footer behavior managed in `js/main.js`
- Page-specific scripts live in `js/`
- Styles are organized across `css/` and page-specific stylesheets
- `apps/` contains service-specific microsites and subpages for different Pi ecosystem verticals

## Backend Notes

- `smajpihub-backend/` is the main backend API service
- It includes Express routes, authentication utilities, session handling, and optional Redis support
- The root `package.json` also contains a separate auth API package configuration used for backend development

## Run Locally

Frontend:
1. Open the project in VS Code.
2. Use Live Server or another static file server to serve `index.html`.

Backend:
1. Navigate to `smajpihub-backend/`
2. Run `npm install`
3. Start the server with `npm run dev`

Optional root auth package:
1. Run `npm install`
2. Start with `npm run dev`

## Recommended Next Steps

- Verify desktop and mobile navigation links across all pages
- Replace placeholder `href="#"` links with production URLs
- Validate mobile menu open/close across pages
- Review SEO metadata per page: `<title>`, meta description, Open Graph tags
- Review `apps/` subprojects for consistency and content accuracy

## Known Cleanup Items

- Fix file naming typos and duplicate placeholder files as needed
- Review backend environment setup and update README in `smajpihub-backend/`
- Confirm the `apps/` folder structure aligns with the new hub architecture
