from pathlib import Path

folders = {
    'smaj-store': {
        'title': 'SMAJ STORE',
        'vision': 'Blockchain-based marketplace with vendor verification, escrow, and Pi payments so every purchase stays trustworthy.',
        'todos': [
            'Mirror the SMAJ PI HUB layout while adapting product/marketplace flows and vendor verification signals.',
            'Ensure the shared Pi wallet experience (GCV pricing, escrow, verification) syncs with the gateway state.',
            'Prototype product catalog, dual USD/Pi pricing display, and escrow/ratings visibility on each card.',
            'Plan vendor onboarding flow that captures identity, verification documents, and trust badges.',
            'Document how SMAJ Token rewards, loyalty, and fee discounts tie into store purchases.'
        ]
    },
    'smaj-food-delivery': {
        'title': 'SMAJ FOOD DELIVERY',
        'vision': 'Direct-to-customer delivery experience with verified restaurants, live tracking, and loyalty rewards.',
        'todos': [
            'Design ordering flow that keeps wallet-based auth and shared identity from the hub.',
            'Map verified restaurant listings, delivery tracking UI, and loyalty cashback tied to SMAJ Token.',
            'Define API contract for menus, geolocation, ETA updates, and Pi payment captures.',
            'Create placeholders for rider verification, ratings, and fraud detection powered by AI signals.',
            'Capture telemetry for delivery zones, SLAs, and loyalty/GCV-driven promotions.'
        ]
    },
    'smaj-pi-jobs': {
        'title': 'SMAJ PI JOBS',
        'vision': 'Verified jobs/freelance board that secures payments, profiles, and smart contracts per listing.',
        'todos': [
            'Blueprint verified profile creation tied to wallet identity and trust badges.',
            'Outline escrow/job milestone handling with Pi payments and SMAJ Token staking for guarantees.',
            'Sketch matching UI leveraging AI guidance for tasks, talents, and recommendations.',
            'Document resume/portfolio storage, contract templates, and dispute workflow hooks.',
            'Plan analytics/dashboard surfaces for reputation, payouts, and fraud risk signals.'
        ]
    },
    'smaj-pi-health': {
        'title': 'SMAJ PI HEALTH',
        'vision': 'Telemedicine hub connecting verified providers, records, and Pi-based access/escrow.',
        'todos': [
            'Outline secure wallet-based sign-in tied to health identity and consent management.',
            'Plan patient-provider discovery with verification badges, specialties, and license proof.',
            'Sketch appointment scheduling, teleconsultation, and secure health record sharing.',
            'Define Pi billing workflow with escrow, wellness credits, and SMAJ Token incentives.',
            'Integrate AI-assisted triage, fraud flags, and trust prompts for high-risk interactions.'
        ]
    },
    'smaj-pi-edu': {
        'title': 'SMAJ PI EDU',
        'vision': 'Decentralized learning platform featuring verified courses, certifications, and personalized AI paths.',
        'todos': [
            'Plan course catalog structure, verified instructor profiles, and accreditation metadata.',
            'Map AI-guided learning paths, recommendations, and progress tracking inside the hub.',
            'Define Pi payment/subscription options with SMAJ Token loyalty or staking perks.',
            'Design credential issuance workflow (certificates, badges, transcripts) tied to identity.',
            'Capture analytics needs for completion rates, skills demand, and tutoring match insights.'
        ]
    },
    'smaj-pi-transport': {
        'title': 'SMAJ PI TRANSPORT',
        'vision': 'Transport/delivery orchestration with verified drivers, route optimization, and Pi payments.',
        'todos': [
            'Design driver onboarding with identity verification, background checks, and trust badges.',
            'Outline booking/dispatch flows embedding wallet-based payments and SMAJ Token incentives for reliability.',
            'Define live tracking, ETA updates, and route optimization hooks (AI suggestions).',
            'Detail delivery confirmation, proof-of-service capture, and escrow release triggers.',
            'Plan analytics for utilization, driver ratings, and anomaly detection (fraud monitoring).'
        ]
    },
    'smaj-pi-agro': {
        'title': 'SMAJ PI AGRO',
        'vision': 'Transparent marketplace connecting farmers, buyers, and suppliers with pricing and Pi transactions.',
        'todos': [
            'Define product listings with provenance, traceability, and GCV-linked Pi quoting.',
            'Blueprint cooperative onboarding (farmer groups, certifications, logistics partners).',
            'Detail matching engine for demand/supply and AI-assisted pricing forecasts.',
            'Plan logistics/rating capture, payment escrow, and dispute resolution for seasonal goods.',
            'Document SMAJ Token usage for loyalty, bulk discounts, and co-op governance.'
        ]
    },
    'smaj-pi-energy': {
        'title': 'SMAJ PI ENERGY',
        'vision': 'Unified utility payment flow for electricity, water, and gas with usage tracking.',
        'todos': [
            'Map meter ingestion, usage dashboards, and Pi billing cycles per service.',
            'Define wallet-bill linking, autopay thresholds, and GCV conversions for consistent pricing.',
            'Design reconciliation/escrow flows for disputed meters or outages.',
            'Plan integrations with regional providers, compliance requirements, and verified vendor badges.',
            'Highlight SMAJ Token perks for timely payments and energy-saving achievements.'
        ]
    },
    'smaj-pi-charity': {
        'title': 'SMAJ PI CHARITY',
        'vision': 'Traceable donation infrastructure for verified NGOs with impact reporting.',
        'todos': [
            'Curate verified charity directory with impact data, trust signals, and compliance badges.',
            'Outline Pi donation flows with transparent ledgers, receipts, and escrow milestone releases.',
            'Plan reporting dashboards showing fund destinations, KPI achievements, and AI-curated matching.',
            'Document SMAJ Token matching or governance voting on funding priorities.',
            'Define fraud/risk monitoring and alerting for suspicious donation patterns.'
        ]
    },
    'smaj-pi-housing': {
        'title': 'SMAJ PI HOUSING',
        'vision': 'Verified housing and property marketplace with fraud protection and escrow deposits.',
        'todos': [
            'Draft listing standards (verified owners, rich media, escrow-ready contracts).',
            'Plan wallet-authenticated touring/booking flows with deposit/escrow release logic tied to Pi.',
            'Define fraud-detection signals and identity checks for landlords and tenants.',
            'Design ratings/review trails for properties, neighborhood trust data, and AI recommendations.',
            'Capture integration points with local utilities for deposit bundling.'
        ]
    },
    'smaj-pi-events': {
        'title': 'SMAJ PI EVENTS',
        'vision': 'Event discovery, ticketing, and organizer verification leveraging NFTs.',
        'todos': [
            'Outline event creation wizard with verified organizers, ticket tiers, and Pi pricing.',
            'Plan ticket issuance (standard + NFT passes) and wallet displays showing ownership.',
            'Define discovery layers with AI recommendations based on interest and attendance history.',
            'Document fraud prevention (scalping, fake events) through verification and blockchain audit trails.',
            'Sketch post-event impact reporting and SMAJ Token rewards for attendees/organizers.'
        ]
    },
    'smaj-pi-swap': {
        'title': 'SMAJ PI SWAP',
        'vision': 'Second-hand and peer-to-peer exchange platform supporting the circular economy.',
        'todos': [
            'Define listing flow with verification, Pi pricing, condition grading, and confidence scores.',
            'Design peer review, escrow/inspection, and return workflows tied to wallet auth.',
            'Plan AI-powered matching (items to buyers) and fraud detection for bad actors.',
            'Document reputation updates with SMAJ Token staking and rewards.',
            'Outline logistics or pickup coordination with transport modules.'
        ]
    },
    'smaj-token-hub': {
        'title': 'SMAJ TOKEN HUB',
        'vision': 'Native asset powering rewards, governance, staking, loyalty/cashback, and GCV-tied discounts.',
        'todos': [
            'Document staking model, governance UX, and reward distribution aligned with SMAJ activity.',
            'Map token tie-ins for loyalty, cashback, and fee discounts across all platforms.',
            'Define shared GCV oracle/pricing service keeping Pi valuations aligned and transparent.',
            'Plan analytics for token circulation, burn/reward pools, and compliance reporting.',
            'Highlight how Pi payments coexist with SMAJ Token incentives for economic clarity.'
        ]
    }
}

root = Path('apps')
for slug, meta in folders.items():
    folder = root / slug
    folder.mkdir(parents=True, exist_ok=True)
    readme = folder / 'README.md'
    lines = [f\"# {meta['title']}\", '', '## Vision and focus', meta['vision'], '', '## TODOs (aligned with the white paper)']
    lines.extend(f\"- {item}\" for item in meta['todos'])
    readme.write_text('\\n'.join(lines) + '\\n', encoding='utf-8')
print(f'Readmes created for {len(folders)} directories.')
