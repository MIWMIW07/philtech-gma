// student-dashboard.js - UMS Dashboard Functionality + Firebase Integration

// Make Firebase functions available globally
let auth, db, storage, serverTimestamp;

// Initialize when imported
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the dashboard
    const dashboard = document.querySelector('.student-dashboard');
    if (dashboard) {
        initDashboard();
    }
});

// Main Dashboard Initialization
function initDashboard() {
    console.log('Initializing PHILTECH UMS Dashboard...');
    
    // Initialize UI Components
    initMobileMenu();
    initThemeToggler();
    initProgressCircles();
    initTimetableNavigation();
    
    // Check if Firebase is loaded (it should be from login.html)
    if (typeof firebase !== 'undefined') {
        // Wait for Firebase to be ready
        setTimeout(() => {
            loadFirebaseData();
            setupFirebaseListeners();
        }, 1000);
    } else {
        console.warn('Firebase not loaded yet. Dashboard will load when available.');
    }
}

// ===== UI COMPONENTS =====

// Mobile Menu Toggle
function initMobileMenu() {
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const nav = document.querySelector('.dashboard-nav');
    const sidebar = document.querySelector('.dashboard-sidebar');
    
    if (mobileBtn) {
        mobileBtn.onclick = function() {
            nav.classList.toggle('active');
        };
    }
    
    // Close menus when clicking outside
    document.addEventListener('click', function(event) {
        if (nav && !event.target.closest('.dashboard-nav') && !event.target.closest('#mobile-menu-btn')) {
            nav.classList.remove('active');
        }
        if (sidebar && !event.target.closest('.dashboard-sidebar') && !event.target.closest('#mobile-menu-btn')) {
            sidebar.classList.remove('active');
        }
    });
}

// Theme Toggler
function initThemeToggler() {
    const toggler = document.querySelector('.theme-toggler');
    
    if (!toggler) return;
    
    // Apply saved theme
    const applySavedTheme = () => {
        const isDarkMode = localStorage.getItem('philtech-dark-theme') === 'true';
        if (isDarkMode) {
            document.body.classList.add('dark-theme');
            toggler.querySelector('span:nth-child(1)').classList.remove('active');
            toggler.querySelector('span:nth-child(2)').classList.add('active');
        } else {
            document.body.classList.remove('dark-theme');
            toggler.querySelector('span:nth-child(1)').classList.add('active');
            toggler.querySelector('span:nth-child(2)').classList.remove('active');
        }
    };
    
    // Initial theme
    applySavedTheme();
    
    // Toggle theme
    toggler.onclick = function() {
        document.body.classList.toggle('dark-theme');
        
        const spans = toggler.querySelectorAll('span');
        spans[0].classList.toggle('active');
        spans[1].classList.toggle('active');
        
        localStorage.setItem('philtech-dark-theme', document.body.classList.contains('dark-theme'));
    };
}

// Progress Circles for Attendance
function initProgressCircles() {
    const subjectCards = document.querySelectorAll('.subject-card');
    subjectCards.forEach(card => {
        const progress = card.getAttribute('data-progress');
        if (progress) {
            const progressArc = card.querySelector('.progress-arc');
            if (progressArc) {
                const offset = 283 - (283 * progress / 100);
                progressArc.style.strokeDashoffset = offset;
                
                // Set CSS variable for dynamic updates
                card.style.setProperty('--progress', progress);
            }
        }
    });
}

// Timetable Navigation
function initTimetableNavigation() {
    const prevBtn = document.getElementById('prevDay');
    const nextBtn = document.getElementById('nextDay');
    const timetablePrev = document.getElementById('timetablePrev');
    const timetableNext = document.getElementById('timetableNext');
    
    let currentDay = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    
    function updateTimetable(dayIndex) {
        const title = document.querySelector('.timetable-header h2');
        if (title) {
            title.textContent = `${dayNames[dayIndex]}'s Schedule`;
        }
        
        // For now, show loading state
        const container = document.querySelector('.timetable-table tbody');
        if (container) {
            container.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; padding: 2rem;">
                        <div class="loading-spinner" style="margin: 0 auto 1rem;"></div>
                        <p>Loading schedule...</p>
                    </td>
                </tr>
            `;
        }
        
        // In a real implementation, you would load schedule data from Firebase
        // loadTimetableForDay(dayIndex);
    }
    
    function navigateDay(direction) {
        if (direction === 'next') {
            currentDay = (currentDay + 1) % 7;
        } else {
            currentDay = (currentDay - 1 + 7) % 7;
        }
        updateTimetable(currentDay);
    }
    
    // Add event listeners
    if (prevBtn) prevBtn.onclick = () => navigateDay('prev');
    if (nextBtn) nextBtn.onclick = () => navigateDay('next');
    if (timetablePrev) timetablePrev.onclick = () => navigateDay('prev');
    if (timetableNext) timetableNext.onclick = () => navigateDay('next');
    
    // Initial load
    updateTimetable(currentDay);
}

// ===== FIREBASE INTEGRATION =====

// Load Firebase Data
async function loadFirebaseData() {
    try {
        console.log('Attempting to load Firebase data...');
        
        // Try multiple ways to get Firebase instances
        let auth = window.auth;
        let db = window.db;
        
        if (!auth || !db) {
            // Try getting from firebase namespace
            if (typeof firebase !== 'undefined') {
                console.log('Getting Firebase from global namespace');
                auth = firebase.auth();
                db = firebase.firestore();
                window.auth = auth;
                window.db = db;
            }
        }
        
        if (!auth || !db) {
            console.warn('Firebase not initialized yet, retrying...');
            setTimeout(loadFirebaseData, 500);
            return;
        }
        
        const user = auth.currentUser;
        if (!user) {
            console.warn('No user logged in');
            return;
        }
        
        console.log('Loading Firebase data for:', user.email);
        
        // Update user info
        updateUserInfo(user);
        
        // Load data
        await Promise.allSettled([
            loadAnnouncements(),
            loadGrades(user.uid),
            loadSchedule(),
            checkGradeRequestStatus(user.uid)
        ]);
        
    } catch (error) {
        console.error('Error loading Firebase data:', error);
        showNotification('Error loading dashboard data', 'error');
    }
}

// Setup Firebase Listeners
function setupFirebaseListeners() {
    // Listen for auth state changes
    if (window.onAuthStateChanged && auth) {
        window.onAuthStateChanged(auth, (user) => {
            if (user) {
                loadFirebaseData();
            }
        });
    }
}

// Update User Information
function updateUserInfo(user) {
    const name = user.displayName || user.email.split('@')[0];
    const nameCapitalized = name.charAt(0).toUpperCase() + name.slice(1);
    
    // Update all name fields
    const nameElements = document.querySelectorAll('.user-name');
    nameElements.forEach(el => {
        el.textContent = nameCapitalized;
    });
    
    // Update avatar
    const avatar = document.querySelector('.avatar-placeholder');
    if (avatar) {
        avatar.textContent = name.charAt(0).toUpperCase();
    }
    
    // Update email
    const emailElements = document.querySelectorAll('.user-email');
    emailElements.forEach(el => {
        el.textContent = user.email;
    });
    
    // Update profile form
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    if (profileName) profileName.value = user.displayName || '';
    if (profileEmail) profileEmail.value = user.email;
}

// Load Announcements from Firebase
async function loadAnnouncements() {
    try {
        if (!db) return;
        
        const { collection, getDocs, query, orderBy, limit } = window.firebaseFirestore;
        
        const announcementsRef = collection(db, 'announcements');
        const q = query(announcementsRef, orderBy('createdAt', 'desc'), limit(5));
        const querySnapshot = await getDocs(q);
        
        const container = document.getElementById('recentAnnouncements');
        if (!container) return;
        
        if (querySnapshot.empty) {
            container.innerHTML = '<p class="text-muted">No announcements yet</p>';
            return;
        }
        
        let html = '';
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const date = data.createdAt?.toDate() || new Date();
            const formattedDate = date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
            
            html += `
                <div class="announcement-item">
                    <h4>${data.title || 'Announcement'}</h4>
                    <p>${data.content || 'No content'}</p>
                    <div class="announcement-date">${formattedDate}</div>
                </div>
            `;
        });
        
        container.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading announcements:', error);
    }
}

// Load Grades from Firebase
async function loadGrades(userId) {
    try {
        if (!db || !userId) return;
        
        const { collection, getDocs, query, where, orderBy } = window.firebaseFirestore;
        
        const gradesRef = collection(db, 'grades');
        const q = query(gradesRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const container = document.getElementById('gradeRecords');
        if (!container) return;
        
        if (querySnapshot.empty) {
            container.innerHTML = `
                <div class="loading-state">
                    <div>📊</div>
                    <p>No grades available yet</p>
                </div>
            `;
            return;
        }
        
        let totalGrade = 0;
        let gradeCount = 0;
        let html = '';
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const gradeValue = parseFloat(data.grade) || 0;
            const date = data.createdAt?.toDate() || new Date();
            const formattedDate = date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
            
            totalGrade += gradeValue;
            gradeCount++;
            
            let gradeClass = 'grade-average';
            let gradeText = 'Average';
            
            if (gradeValue >= 90) {
                gradeClass = 'grade-excellent';
                gradeText = 'Excellent';
            } else if (gradeValue >= 80) {
                gradeClass = 'grade-good';
                gradeText = 'Good';
            } else if (gradeValue >= 75) {
                gradeClass = 'grade-average';
                gradeText = 'Average';
            } else {
                gradeClass = 'grade-poor';
                gradeText = 'Needs Improvement';
            }
            
            html += `
                <div class="grade-item">
                    <div class="grade-header">
                        <h4>${data.course || 'General Grade'}</h4>
                        <span class="grade-badge ${gradeClass}">${gradeText}</span>
                    </div>
                    <div class="grade-value">${gradeValue}%</div>
                    <p class="text-muted" style="text-align: center;">${formattedDate}</p>
                </div>
            `;
        });
        
        container.innerHTML = html;
        
        // Update average grade
        if (gradeCount > 0) {
            const average = Math.round(totalGrade / gradeCount);
            const avgElement = document.getElementById('avgGrade');
            if (avgElement) {
                avgElement.textContent = `${average}%`;
            }
        }
        
    } catch (error) {
        console.error('Error loading grades:', error);
    }
}

// Load Schedule from Firebase
async function loadSchedule() {
    try {
        if (!db) return;
        
        const { collection, getDocs } = window.firebaseFirestore;
        
        const scheduleRef = collection(db, 'schedule');
        const querySnapshot = await getDocs(scheduleRef);
        
        const container = document.getElementById('timetableContent');
        if (!container) return;
        
        if (querySnapshot.empty) {
            container.innerHTML = `
                <div class="loading-state">
                    <div>📅</div>
                    <p>No schedule uploaded yet</p>
                </div>
            `;
            return;
        }
        
        const scheduleDoc = querySnapshot.docs[0];
        const scheduleData = scheduleDoc.data();
        
        if (scheduleData.imageUrl) {
            container.innerHTML = `
                <img src="${scheduleData.imageUrl}" 
                     alt="Class Schedule" 
                     style="width: 100%; border-radius: var(--border-radius-1);"
                     onerror="this.onerror=null; this.parentElement.innerHTML='<p>Error loading schedule image</p>'">
                <p class="text-muted" style="text-align: center; margin-top: 0.5rem;">
                    Last updated: ${scheduleData.uploadedAt?.toDate().toLocaleDateString() || 'Recently'}
                </p>
            `;
        }
        
    } catch (error) {
        console.error('Error loading schedule:', error);
    }
}

// Check Grade Request Status
async function checkGradeRequestStatus(userId) {
    try {
        if (!db || !userId) return;
        
        const { collection, getDocs, query, where, orderBy, limit } = window.firebaseFirestore;
        
        const requestsRef = collection(db, 'gradeRequests');
        const q = query(
            requestsRef, 
            where('userId', '==', userId), 
            orderBy('requestedAt', 'desc'), 
            limit(1)
        );
        
        const querySnapshot = await getDocs(q);
        const requestBtn = document.getElementById('requestGradeBtn');
        const statusContainer = document.getElementById('requestStatus');
        
        if (!requestBtn || !statusContainer) return;
        
        if (!querySnapshot.empty) {
            const latestRequest = querySnapshot.docs[0].data();
            
            if (latestRequest.status === 'pending') {
                requestBtn.disabled = true;
                requestBtn.textContent = 'Request Pending';
                requestBtn.style.background = 'var(--color-info)';
                
                statusContainer.innerHTML = `
                    <div class="request-status">
                        <p>
                            <span>⏳</span>
                            Your grade request is being processed. You'll be notified once completed.
                        </p>
                    </div>
                `;
            } else if (latestRequest.status === 'completed') {
                requestBtn.disabled = false;
                requestBtn.textContent = 'Request New Grade Copy';
                requestBtn.style.background = '';
                statusContainer.innerHTML = '';
            }
        }
        
    } catch (error) {
        console.error('Error checking grade request status:', error);
    }
}

// ===== DASHBOARD FUNCTIONS =====

// Request Grade Function
window.requestGrade = async function() {
    try {
        if (!auth || !db) {
            showNotification('Please wait for Firebase to initialize', 'warning');
            return;
        }
        
        const user = auth.currentUser;
        if (!user) {
            showNotification('Please log in first', 'error');
            return;
        }
        
        const { collection, addDoc } = window.firebaseFirestore;
        
        const gradeRequestData = {
            userId: user.uid,
            studentName: user.displayName || user.email.split('@')[0],
            studentEmail: user.email,
            status: 'pending',
            requestedAt: serverTimestamp ? serverTimestamp() : new Date()
        };
        
        await addDoc(collection(db, 'gradeRequests'), gradeRequestData);
        
        showNotification('Grade request submitted successfully!', 'success');
        
        // Update UI
        const requestBtn = document.getElementById('requestGradeBtn');
        const statusContainer = document.getElementById('requestStatus');
        
        if (requestBtn) {
            requestBtn.disabled = true;
            requestBtn.textContent = 'Request Pending';
            requestBtn.style.background = 'var(--color-info)';
        }
        
        if (statusContainer) {
            statusContainer.innerHTML = `
                <div class="request-status">
                    <p>
                        <span>⏳</span>
                        Your grade request is being processed. You'll be notified once completed.
                    </p>
                </div>
            `;
        }
        
        // Reload grades
        await loadGrades(user.uid);
        
    } catch (error) {
        console.error('Error requesting grade:', error);
        showNotification('Error submitting request: ' + error.message, 'error');
    }
};

// Update Profile Function
window.updateProfile = async function() {
    try {
        if (!auth || !db) {
            showNotification('Please wait for Firebase to initialize', 'warning');
            return;
        }
        
        const user = auth.currentUser;
        if (!user) {
            showNotification('Please log in first', 'error');
            return;
        }
        
        const newName = document.getElementById('profileName')?.value;
        if (!newName || newName.trim() === '') {
            showNotification('Please enter a valid name', 'error');
            return;
        }
        
        const { updateProfile: firebaseUpdateProfile } = window.firebaseAuth;
        const { doc, setDoc } = window.firebaseFirestore;
        
        // Update Firebase Auth profile
        await firebaseUpdateProfile(user, { displayName: newName });
        
        // Update Firestore user document
        await setDoc(doc(db, 'users', user.uid), {
            displayName: newName,
            email: user.email,
            updatedAt: serverTimestamp ? serverTimestamp() : new Date()
        }, { merge: true });
        
        showNotification('Profile updated successfully!', 'success');
        
        // Update UI
        updateUserInfo(user);
        
    } catch (error) {
        console.error('Error updating profile:', error);
        showNotification('Error updating profile: ' + error.message, 'error');
    }
};

// Change Password Function
window.changePassword = function() {
    showNotification('Please use "Forgot Password" on login page to reset your password', 'info');
};

// Section Navigation
window.showSection = function(sectionId) {
    // Update navigation
    const navLinks = document.querySelectorAll('.dashboard-nav a');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('onclick')?.includes(sectionId)) {
            link.classList.add('active');
        }
    });
    
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        
        // Load section-specific data
        switch(sectionId) {
            case 'grades':
                if (auth?.currentUser) {
                    loadGrades(auth.currentUser.uid);
                }
                break;
            case 'announcements':
                loadAnnouncements();
                break;
            case 'timetable':
                loadSchedule();
                break;
        }
    }
    
    // Close mobile menu
    const mobileNav = document.querySelector('.dashboard-nav');
    if (mobileNav) {
        mobileNav.classList.remove('active');
    }
};

// Show Full Timetable
window.showFullTimetable = function() {
    const modal = document.getElementById('fullTimetableModal');
    if (modal) {
        modal.classList.add('active');
        loadFullTimetable();
    }
};

// Close Full Timetable
window.closeFullTimetable = function() {
    const modal = document.getElementById('fullTimetableModal');
    if (modal) {
        modal.classList.remove('active');
    }
};

// Load Full Timetable
async function loadFullTimetable() {
    try {
        if (!db) return;
        
        const { collection, getDocs } = window.firebaseFirestore;
        
        const scheduleRef = collection(db, 'schedule');
        const querySnapshot = await getDocs(scheduleRef);
        const container = document.getElementById('fullTimetableContent');
        
        if (!container) return;
        
        if (querySnapshot.empty) {
            container.innerHTML = '<p class="text-muted">No schedule available</p>';
            return;
        }
        
        const scheduleDoc = querySnapshot.docs[0];
        const scheduleData = scheduleDoc.data();
        
        if (scheduleData.imageUrl) {
            container.innerHTML = `
                <img src="${scheduleData.imageUrl}" 
                     alt="Full Schedule" 
                     style="width: 100%; border-radius: var(--border-radius-1);">
            `;
        }
        
    } catch (error) {
        console.error('Error loading full timetable:', error);
    }
}

// ===== UTILITY FUNCTIONS =====

// Show Notification
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelectorAll('.notification');
    existing.forEach(notif => notif.remove());
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const icon = type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ️';
    
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${icon}</span>
            <span class="notification-message">${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 5000);
}

// Refresh Assignments
window.refreshAssignments = function() {
    showNotification('Refreshing assignments...', 'info');
    // In a real implementation, this would reload assignments from Firebase
    setTimeout(() => {
        showNotification('Assignments refreshed', 'success');
    }, 1000);
};

// Toggle Sidebar (Mobile)
window.toggleSidebar = function() {
    const sidebar = document.querySelector('.dashboard-sidebar');
    if (sidebar) {
        sidebar.classList.toggle('active');
    }
};

// Logout Handler (from Firebase)
window.handleLogout = async function() {
    if (!auth) {
        window.location.href = 'login.html';
        return;
    }
    
    try {
        const { signOut } = window.firebaseAuth;
        await signOut(auth);
        showNotification('Logged out successfully', 'success');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
    } catch (error) {
        console.error('Error logging out:', error);
        showNotification('Error logging out', 'error');
    }
};

// Initialize when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDashboard);
} else {
    initDashboard();
}

async function loadQuickGrades(user) {
    try {
        const gradesQuery = query(
            collection(db, 'grades'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc'),
            limit(3)
        );
        
        const gradesSnap = await getDocs(gradesQuery);
        const container = document.getElementById('quickGrades');
        
        if (gradesSnap.empty) {
            container.innerHTML = `
                <div style="text-align: center; padding: 1.5rem;">
                    <div style="font-size: 2rem; color: var(--text-tertiary); margin-bottom: 0.5rem;">📊</div>
                    <p style="color: var(--text-tertiary); font-size: 0.9rem;">No grades available</p>
                    <button onclick="requestGrade()" style="margin-top: 0.5rem; padding: 0.5rem 1rem; background: var(--primary-color); color: white; border: none; border-radius: var(--radius-sm); font-size: 0.875rem; cursor: pointer;">
                        Request Grades
                    </button>
                </div>
            `;
            return;
        }
        
        container.innerHTML = '';
        gradesSnap.forEach((doc) => {
            const data = doc.data();
            const gradeValue = parseFloat(data.grade) || 0;
            
            // Determine grade status
            let status = 'Good';
            let statusClass = 'grade-good';
            
            if (gradeValue >= 90) {
                status = 'Excellent';
                statusClass = 'grade-excellent';
            } else if (gradeValue >= 80) {
                status = 'Good';
                statusClass = 'grade-good';
            } else if (gradeValue >= 75) {
                status = 'Passing';
                statusClass = 'grade-warning';
            } else {
                status = 'Needs Improvement';
                statusClass = 'grade-danger';
            }
            
            container.innerHTML += `
                <div class="grade-item">
                    <div class="grade-header">
                        <h4>${data.course || 'Course'}</h4>
                        <span class="grade-badge ${statusClass}">${status}</span>
                    </div>
                    <div class="grade-value">${gradeValue}%</div>
                    <small class="text-muted">${data.createdAt?.toDate().toLocaleDateString() || 'Recently'}</small>
                </div>
            `;
        });
        
    } catch (error) {
        console.error('Error loading quick grades:', error);
        document.getElementById('quickGrades').innerHTML = `
            <div style="text-align: center; color: var(--error-color); padding: 1rem;">
                Error loading grades
            </div>
        `;
    }
}

async function loadRecentActivity(user) {
    try {
        const activityQuery = query(
            collection(db, 'activity'),
            where('userId', '==', user.uid),
            orderBy('timestamp', 'desc'),
            limit(5)
        );
        
        const activitySnap = await getDocs(activityQuery);
        const container = document.getElementById('recentActivityFeed');
        
        if (activitySnap.empty) {
            container.innerHTML = `
                <div style="text-align: center; padding: 1.5rem;">
                    <div style="font-size: 2rem; color: var(--text-tertiary); margin-bottom: 0.5rem;">📝</div>
                    <p style="color: var(--text-tertiary); font-size: 0.9rem;">No recent activity</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = '';
        activitySnap.forEach((doc) => {
            const data = doc.data();
            const time = data.timestamp?.toDate() || new Date();
            const timeAgo = getTimeAgo(time);
            
            let icon = '📝';
            if (data.type === 'grade_submission') icon = '📊';
            if (data.type === 'announcement_view') icon = '📢';
            if (data.type === 'login') icon = '🔐';
            
            container.innerHTML += `
                <div class="activity-item">
                    <div class="activity-avatar">
                        ${icon}
                    </div>
                    <div class="activity-content">
                        <h4>${data.title || 'Activity'}</h4>
                        <p class="text-muted">${data.description || ''} - ${timeAgo}</p>
                    </div>
                </div>
            `;
        });
        
    } catch (error) {
        console.error('Error loading activity:', error);
    }
}

// Helper function for time display
function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return date.toLocaleDateString();
}

// Add this function to show schedule history
async function loadScheduleHistory(user) {
    try {
        const scheduleQuery = query(
            collection(db, 'schedule'),
            orderBy('uploadedAt', 'desc')
        );
        
        const scheduleSnap = await getDocs(scheduleQuery);
        const container = document.getElementById('scheduleContent');
        
        if (scheduleSnap.empty) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem;">
                    <div style="font-size: 2rem; color: var(--text-tertiary); margin-bottom: 1rem;">📅</div>
                    <p style="color: var(--text-tertiary);">No schedule available</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = '';
        scheduleSnap.forEach((doc, index) => {
            const data = doc.data();
            const date = data.uploadedAt?.toDate().toLocaleDateString() || 'Unknown date';
            
            container.innerHTML += `
                <div class="schedule-item ${data.isCurrent ? 'current-schedule' : ''}" style="margin-bottom: 1.5rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                        <h4 style="color: var(--text-primary);">
                            ${data.isCurrent ? '📌 Current Schedule' : 'Schedule'} 
                            ${!data.isCurrent ? `(${date})` : ''}
                        </h4>
                        ${data.isCurrent ? `<span style="background: var(--success-color); color: white; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.75rem;">Current</span>` : ''}
                    </div>
                    
                    <img src="${data.imageUrl}" 
                         style="width: 100%; border-radius: var(--radius-sm); box-shadow: var(--shadow-sm); cursor: pointer;" 
                         alt="Schedule ${date}"
                         onclick="openScheduleImage('${data.imageUrl}')">
                    
                    <div style="margin-top: 0.5rem; font-size: 0.875rem; color: var(--text-secondary);">
                        Uploaded: ${date} by ${data.uploadedBy || 'Admin'}
                    </div>
                </div>
            `;
        });
        
    } catch (error) {
        console.error('Error loading schedule:', error);
        container.innerHTML = `
            <div style="text-align: center; color: var(--error-color); padding: 2rem;">
                Error loading schedule
            </div>
        `;
    }
}

// Add modal for full-size schedule view
function openScheduleImage(url) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    modal.innerHTML = `
        <div style="position: relative;">
            <button onclick="this.parentElement.parentElement.remove()" style="position: absolute; top: -40px; right: 0; background: none; border: none; color: white; font-size: 2rem; cursor: pointer;">×</button>
            <img src="${url}" style="max-width: 90vw; max-height: 90vh; border-radius: 8px;">
        </div>
    `;
    
    document.body.appendChild(modal);
}