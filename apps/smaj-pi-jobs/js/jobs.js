// SMAJ PI JOBS - Job Data and Functions
// All budgets are in PI (Pi Network)
// 1 PI = $314,159 USD

// PI to USD conversion rate
const PI_USD_RATE = 314159;

// Convert budget (PI) to USD for display
function budgetToUSD(budgetPI) {
    return (budgetPI * PI_USD_RATE).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Format PI amount for display
function formatPIAmount(piAmount) {
    const amount = parseFloat(piAmount);
    if (amount < 0.0001) {
        return amount.toFixed(8);
    }
    return amount.toFixed(4);
}

// Sample Job Data - Budgets now in PI
const jobsData = [
    {
        id: 1,
        title: 'Build a React E-commerce Website',
        description: 'Looking for an experienced React developer to build a modern e-commerce platform with shopping cart, payment integration, and admin dashboard.',
        category: 'Web Development',
        budget: 0.00159, // ~$500 USD
        budgetType: 'fixed',
        skills: ['React', 'JavaScript', 'CSS', 'Node.js'],
        duration: '2-4 weeks',
        experience: 'Intermediate',
        client: {
            name: 'TechStore Inc.',
            rating: 4.8,
            jobsPosted: 12,
            verified: true
        },
        postedAt: '2 hours ago',
        proposals: 5,
        status: 'open'
    },
    {
        id: 2,
        title: 'Mobile App UI/UX Design',
        description: 'Need a talented UI/UX designer to create wireframes and high-fidelity mockups for a fitness tracking mobile application.',
        category: 'UI/UX Design',
        budget: 0.00095, // ~$300 USD
        budgetType: 'fixed',
        skills: ['Figma', 'UI Design', 'Prototyping', 'Mobile Design'],
        duration: '1-2 weeks',
        experience: 'Intermediate',
        client: {
            name: 'FitLife App',
            rating: 4.9,
            jobsPosted: 8,
            verified: true
        },
        postedAt: '5 hours ago',
        proposals: 12,
        status: 'open'
    },
    {
        id: 3,
        title: 'Python Data Analysis Script',
        description: 'Looking for a Python developer to create a script that analyzes sales data and generates automated reports with visualizations.',
        category: 'Data Science',
        budget: 0.00064, // ~$200 USD
        budgetType: 'fixed',
        skills: ['Python', 'Pandas', 'Matplotlib', 'Data Analysis'],
        duration: '3-5 days',
        experience: 'Beginner',
        client: {
            name: 'DataDriven Co.',
            rating: 4.7,
            jobsPosted: 5,
            verified: true
        },
        postedAt: '1 day ago',
        proposals: 3,
        status: 'open'
    },
    {
        id: 4,
        title: 'WordPress Website Customization',
        description: 'Need help customizing our WordPress theme, adding new features, and optimizing site performance for better SEO.',
        category: 'Web Development',
        budget: 0.00048, // ~$150 USD
        budgetType: 'hourly',
        skills: ['WordPress', 'PHP', 'CSS', 'SEO'],
        duration: '1 week',
        experience: 'Beginner',
        client: {
            name: 'LocalBusiness',
            rating: 4.5,
            jobsPosted: 3,
            verified: false
        },
        postedAt: '3 days ago',
        proposals: 8,
        status: 'open'
    },
    {
        id: 5,
        title: 'Logo Design for Tech Startup',
        description: 'Looking for a creative logo designer to create a modern, tech-inspired logo for our AI startup company.',
        category: 'Graphic Design',
        budget: 0.00080, // ~$250 USD
        budgetType: 'fixed',
        skills: ['Logo Design', 'Illustrator', 'Brand Identity', 'Vector Art'],
        duration: '3-5 days',
        experience: 'Intermediate',
        client: {
            name: 'AI Innovations',
            rating: 5.0,
            jobsPosted: 2,
            verified: true
        },
        postedAt: '6 hours ago',
        proposals: 15,
        status: 'open'
    },
    {
        id: 6,
        title: 'Content Writing for Blog',
        description: 'Need an experienced content writer to produce 10 SEO-optimized blog posts about digital marketing topics.',
        category: 'Content Writing',
        budget: 0.00127, // ~$400 USD
        budgetType: 'fixed',
        skills: ['Content Writing', 'SEO', 'Marketing', 'Research'],
        duration: '2 weeks',
        experience: 'Intermediate',
        client: {
            name: 'MarketingPro',
            rating: 4.6,
            jobsPosted: 20,
            verified: true
        },
        postedAt: '1 day ago',
        proposals: 18,
        status: 'open'
    },
    {
        id: 7,
        title: 'Smart Contract Development',
        description: 'Looking for a blockchain developer to create and deploy smart contracts for a DeFi project on SMAJ Network.',
        category: 'Blockchain',
        budget: 0.00318, // ~$1,000 USD
        budgetType: 'fixed',
        skills: ['Solidity', 'Smart Contracts', 'Web3', 'DeFi'],
        duration: '3-4 weeks',
        experience: 'Expert',
        client: {
            name: 'DeFi Solutions',
            rating: 4.9,
            jobsPosted: 6,
            verified: true
        },
        postedAt: '4 hours ago',
        proposals: 7,
        status: 'open'
    },
    {
        id: 8,
        title: 'Video Editing for YouTube',
        description: 'Need a skilled video editor to edit and produce engaging YouTube videos with effects, transitions, and thumbnails.',
        category: 'Video Editing',
        budget: 0.00032, // ~$100 USD
        budgetType: 'per video',
        skills: ['Premiere Pro', 'After Effects', 'Video Editing', 'Thumbnail Design'],
        duration: 'Per video',
        experience: 'Intermediate',
        client: {
            name: 'TechCreator',
            rating: 4.8,
            jobsPosted: 15,
            verified: true
        },
        postedAt: '12 hours ago',
        proposals: 10,
        status: 'open'
    },
    {
        id: 9,
        title: 'Social Media Management',
        description: 'Looking for a social media manager to handle our company accounts on Instagram, Twitter, and LinkedIn for 1 month.',
        category: 'Digital Marketing',
        budget: 0.00111, // ~$350 USD
        budgetType: 'monthly',
        skills: ['Social Media', 'Content Creation', 'Analytics', 'Marketing'],
        duration: '1 month',
        experience: 'Intermediate',
        client: {
            name: 'StartupXYZ',
            rating: 4.4,
            jobsPosted: 4,
            verified: true
        },
        postedAt: '2 days ago',
        proposals: 22,
        status: 'open'
    },
    {
        id: 10,
        title: 'Flutter Mobile App Development',
        description: 'Need a Flutter developer to build a cross-platform mobile app for inventory management with barcode scanning.',
        category: 'Mobile Development',
        budget: 0.00255, // ~$800 USD
        budgetType: 'fixed',
        skills: ['Flutter', 'Dart', 'Firebase', 'Mobile App'],
        duration: '3-5 weeks',
        experience: 'Advanced',
        client: {
            name: 'RetailTech',
            rating: 4.7,
            jobsPosted: 9,
            verified: true
        },
        postedAt: '1 day ago',
        proposals: 11,
        status: 'open'
    }
];

// Job Categories
const jobCategories = [
    { name: 'Web Development', icon: '🌐', count: 156 },
    { name: 'Mobile Development', icon: '📱', count: 89 },
    { name: 'UI/UX Design', icon: '🎨', count: 124 },
    { name: 'Data Science', icon: '📊', count: 67 },
    { name: 'Blockchain', icon: '⛓️', count: 45 },
    { name: 'Graphic Design', icon: '✏️', count: 98 },
    { name: 'Content Writing', icon: '📝', count: 112 },
    { name: 'Digital Marketing', icon: '📢', count: 78 },
    { name: 'Video Editing', icon: '🎬', count: 56 },
    { name: 'Other', icon: '🔧', count: 34 }
];

// Get all jobs
function getAllJobs() {
    return jobsData;
}

// Get job by ID
function getJobById(id) {
    return jobsData.find(job => job.id === parseInt(id));
}

// Get jobs by category
function getJobsByCategory(category) {
    return jobsData.filter(job => job.category === category);
}

// Search jobs
function searchJobs(query) {
    const searchTerm = query.toLowerCase();
    return jobsData.filter(job => 
        job.title.toLowerCase().includes(searchTerm) ||
        job.description.toLowerCase().includes(searchTerm) ||
        job.category.toLowerCase().includes(searchTerm) ||
        job.skills.some(skill => skill.toLowerCase().includes(searchTerm))
    );
}

// Filter jobs
function filterJobs(filters) {
    let filtered = [...jobsData];
    
    if (filters.category && filters.category !== 'all') {
        filtered = filtered.filter(job => job.category === filters.category);
    }
    
    if (filters.budgetMin) {
        filtered = filtered.filter(job => job.budget >= parseInt(filters.budgetMin));
    }
    
    if (filters.budgetMax) {
        filtered = filtered.filter(job => job.budget <= parseInt(filters.budgetMax));
    }
    
    if (filters.experience && filters.experience !== 'all') {
        filtered = filtered.filter(job => job.experience === filters.experience);
    }
    
    if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filtered = filtered.filter(job => 
            job.title.toLowerCase().includes(searchTerm) ||
            job.description.toLowerCase().includes(searchTerm)
        );
    }
    
    return filtered;
}

// Render job card
function renderJobCard(job) {
    const budgetUSD = budgetToUSD(job.budget);
    return `
        <div class="job-card" onclick="window.location.href='job-details.html?id=${job.id}'">
            <div class="job-card-header">
                <span class="job-category">${job.category}</span>
                <span class="job-budget">${job.budgetType === 'hourly' ? formatPIAmount(job.budget) + '/hr' : job.budgetType === 'per video' ? formatPIAmount(job.budget) + '/video' : job.budgetType === 'monthly' ? formatPIAmount(job.budget) + '/mo' : formatPIAmount(job.budget) + ' PI'}</span>
            </div>
            <h3 class="job-title">${job.title}</h3>
            <p class="job-description">${job.description}</p>
            <div class="job-budget-usd" style="font-size: var(--font-size-xs); color: var(--text-muted); margin-bottom: var(--space-sm);">
                ~$${budgetUSD} USD
            </div>
            <div class="job-tags">
                ${job.skills.slice(0, 4).map(skill => `<span class="job-tag">${skill}</span>`).join('')}
            </div>
            <div class="job-card-footer">
                <div class="job-client">
                    <div class="client-avatar">${job.client.name.charAt(0)}</div>
                    <div class="client-info">
                        <span class="client-name">${job.client.name}</span>
                        <span class="client-rating">★ ${job.client.rating}</span>
                    </div>
                </div>
                <span class="job-posted">${job.postedAt}</span>
            </div>
        </div>
    `;
}

// Render jobs grid
function renderJobsGrid(jobs, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (jobs.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔍</div>
                <h3>No jobs found</h3>
                <p>Try adjusting your search or filter criteria</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = jobs.map(job => renderJobCard(job)).join('');
}

// Render categories
function renderCategories(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = jobCategories.map(cat => `
        <div class="category-card" onclick="filterByCategory('${cat.name}')">
            <div class="category-icon">${cat.icon}</div>
            <h4 class="category-name">${cat.name}</h4>
            <span class="category-count">${cat.count} jobs</span>
        </div>
    `).join('');
}

// Filter by category
function filterByCategory(category) {
    const filtered = getJobsByCategory(category);
    renderJobsGrid(filtered, 'jobsGrid');
    document.getElementById('categoryFilter').value = category;
}

// Initialize jobs page
function initJobsPage() {
    renderJobsGrid(jobsData, 'jobsGrid');
    renderCategories('categoriesGrid');
    
    // Set up search
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            const query = searchInput ? searchInput.value : '';
            const results = query ? searchJobs(query) : jobsData;
            renderJobsGrid(results, 'jobsGrid');
        });
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const query = searchInput.value;
                const results = query ? searchJobs(query) : jobsData;
                renderJobsGrid(results, 'jobsGrid');
            }
        });
    }
    
    // Set up filters
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            const filtered = this.value === 'all' ? jobsData : getJobsByCategory(this.value);
            renderJobsGrid(filtered, 'jobsGrid');
        });
    }
}

// Initialize job details page
function initJobDetailsPage() {
    const params = new URLSearchParams(window.location.search);
    const jobId = params.get('id');
    
    if (!jobId) {
        window.location.href = 'jobs.html';
        return;
    }
    
    const job = getJobById(jobId);
    
    if (!job) {
        window.location.href = 'jobs.html';
        return;
    }
    
    // Calculate USD value
    const budgetUSD = budgetToUSD(job.budget);
    
    // Update page content
    document.getElementById('jobTitle').textContent = job.title;
    document.getElementById('jobCategory').textContent = job.category;
    document.getElementById('jobBudget').textContent = job.budgetType === 'hourly' ? formatPIAmount(job.budget) + '/hr' : job.budgetType === 'per video' ? formatPIAmount(job.budget) + '/video' : job.budgetType === 'monthly' ? formatPIAmount(job.budget) + '/mo' : formatPIAmount(job.budget) + ' PI';
    document.getElementById('jobBudgetUSD').textContent = '~$' + budgetUSD + ' USD';
    document.getElementById('jobDescription').textContent = job.description;
    document.getElementById('jobDuration').textContent = job.duration;
    document.getElementById('jobExperience').textContent = job.experience;
    document.getElementById('clientName').textContent = job.client.name;
    document.getElementById('clientRating').textContent = '★ ' + job.client.rating;
    document.getElementById('clientJobs').textContent = job.client.jobsPosted + ' jobs posted';
    
    // Render skills
    const skillsContainer = document.getElementById('jobSkills');
    if (skillsContainer) {
        skillsContainer.innerHTML = job.skills.map(skill => `<span class="job-tag">${skill}</span>`).join('');
    }
    
    // Update apply button
    const applyBtn = document.getElementById('applyJobBtn');
    if (applyBtn) {
        applyBtn.addEventListener('click', function() {
            if (!window.walletModule || !window.walletModule.getWalletState().isConnected) {
                window.walletModule.openWalletModal();
                showToast('Please connect your wallet to apply for this job', 'info');
                return;
            }
            showToast('Application submitted successfully!', 'success');
        });
    }
}

// Export functions
window.jobsModule = {
    getAllJobs: getAllJobs,
    getJobById: getJobById,
    getJobsByCategory: getJobsByCategory,
    searchJobs: searchJobs,
    filterJobs: filterJobs,
    renderJobCard: renderJobCard,
    renderJobsGrid: renderJobsGrid,
    renderCategories: renderCategories,
    filterByCategory: filterByCategory,
    initJobsPage: initJobsPage,
    initJobDetailsPage: initJobDetailsPage,
    categories: jobCategories,
    budgetToUSD: budgetToUSD,
    formatPIAmount: formatPIAmount,
    PI_USD_RATE: PI_USD_RATE
};
