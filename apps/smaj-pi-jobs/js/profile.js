// SMAJ PI JOBS - Profile Module

// Profile Data
const profileData = {
    name: 'John Developer',
    title: 'Full Stack Developer | React & Node.js Expert',
    about: 'Passionate full-stack developer with 5+ years of experience building web applications. Specialized in React, Node.js, and blockchain development. I have successfully delivered 50+ projects for clients worldwide.',
    skills: ['React', 'Node.js', 'JavaScript', 'TypeScript', 'Python', 'Solidity', 'Web3', 'MongoDB', 'PostgreSQL', 'AWS'],
    rating: 4.9,
    reviews: 48,
    earnings: 2450,
    completedJobs: 52,
    activeJobs: 3,
    location: 'Remote',
    memberSince: 'Jan 2026',
    verified: true,
    portfolio: [
        { title: 'E-commerce Platform', tech: 'React, Node.js', icon: '🛒' },
        { title: 'Crypto Dashboard', tech: 'React, Web3', icon: '📊' },
        { title: 'Task Manager App', tech: 'Vue.js, Firebase', icon: '🎯' }
    ]
};

// Initialize Profile Page
function initProfile() {
    renderProfile();
    setupProfileEventListeners();
}

// Render Profile Data
function renderProfile() {
    // Update name
    const nameEl = document.getElementById('profileName');
    if (nameEl) nameEl.textContent = profileData.name;

    // Update title
    const titleEl = document.getElementById('profileTitle');
    if (titleEl) titleEl.textContent = profileData.title;

    // Update rating
    const ratingEl = document.getElementById('profileRating');
    if (ratingEl) ratingEl.textContent = profileData.rating;

    // Update earnings
    const earningsEl = document.getElementById('profileEarnings');
    if (earningsEl) earningsEl.textContent = profileData.earnings.toLocaleString() + ' SMAJ';

    // Update about
    const aboutEl = document.getElementById('profileAbout');
    if (aboutEl) aboutEl.textContent = profileData.about;

    // Update skills
    const skillsEl = document.getElementById('profileSkills');
    if (skillsEl) {
        skillsEl.innerHTML = profileData.skills.map(skill => 
            '<span class="job-tag">' + skill + '</span>'
        ).join('');
    }
}

// Setup Event Listeners
function setupProfileEventListeners() {
    // Edit Profile Button
    const editBtn = document.getElementById('editProfileBtn');
    if (editBtn) {
        editBtn.addEventListener('click', function() {
            showEditProfileModal();
        });
    }

    // Change Avatar Button
    const avatarBtn = document.getElementById('changeAvatarBtn');
    if (avatarBtn) {
        avatarBtn.addEventListener('click', function() {
            showToast('Avatar change coming soon!', 'info');
        });
    }
}

// Show Edit Profile Modal
function showEditProfileModal() {
    const modalHTML = `
        <div id="editProfileModal" class="modal-overlay">
            <div class="modal" style="max-width: 600px;">
                <div class="modal-header">
                    <h3 class="modal-title">Edit Profile</h3>
                    <button class="modal-close" onclick="closeModal()">✕</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label class="form-label">Full Name</label>
                        <input type="text" class="form-input" id="editName" value="${profileData.name}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Professional Title</label>
                        <input type="text" class="form-input" id="editTitle" value="${profileData.title}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">About Me</label>
                        <textarea class="form-textarea" id="editAbout">${profileData.about}</textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Skills (comma separated)</label>
                        <input type="text" class="form-input" id="editSkills" value="${profileData.skills.join(', ')}">
                    </div>
                </div>
                <div style="display: flex; gap: var(--space-md); justify-content: flex-end;">
                    <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                    <button class="btn btn-primary" onclick="saveProfile()">Save Changes</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    setTimeout(function() {
        document.getElementById('editProfileModal').classList.add('active');
    }, 100);
}

// Close Modal
function closeModal() {
    const modal = document.getElementById('editProfileModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(function() {
            modal.remove();
        }, 300);
    }
}

// Save Profile Changes
function saveProfile() {
    profileData.name = document.getElementById('editName').value;
    profileData.title = document.getElementById('editTitle').value;
    profileData.about = document.getElementById('editAbout').value;
    
    var skillsInput = document.getElementById('editSkills').value;
    profileData.skills = skillsInput.split(',').map(function(s) { return s.trim(); }).filter(function(s) { return s; });
    
    renderProfile();
    closeModal();
    showToast('Profile updated successfully!', 'success');
}

// Update Profile Stats
function updateProfileStats() {
    var walletState = window.walletModule.getWalletState();
    if (walletState.isConnected) {
        var earningsEl = document.getElementById('profileEarnings');
        if (earningsEl) {
            var totalBalance = parseFloat(walletState.balance) + profileData.earnings;
            earningsEl.textContent = totalBalance.toFixed(2) + ' SMAJ';
        }
    }
}

// Export Functions
window.profileModule = {
    initProfile: initProfile,
    renderProfile: renderProfile,
    showEditProfileModal: showEditProfileModal,
    saveProfile: saveProfile,
    getProfileData: function() { return profileData; }
};
