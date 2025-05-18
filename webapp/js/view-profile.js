ipali = '10.7.241.116'

document.addEventListener('DOMContentLoaded', function() {
    
    // Get user ID from localStorage or URL parameter
    const cmsId = JSON.parse(localStorage.getItem('cmsId')) ;
    console.log('CMS ID:', cmsId);
    
    // If no userId is found, redirect to login
    if (!cmsId) {
        window.location.href = 'login.html';
        return;
    }
    
    // Initialize the profile page
    initializeProfile(cmsId);
    
    // Setup event listeners
    setupEventListeners();
});

// Helper function to get URL parameters
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// Initialize the profile page
async function initializeProfile(cmsId) {
    try {
        // Fetch user profile data
        const userData = await fetchUserProfile(cmsId);
        
        // Fetch user sessions data
        const sessionsData = await fetchUserSessions(cmsId);
        console.log('Sessions Data:', sessionsData);
        
        // Populate UI with user data
        populateUserProfile(userData);
        
        // Update sessions count and rating
        updateUserStats(sessionsData);
        
        // Update upcoming sessions
        updateUpcomingSessions(sessionsData);
        
        // Show/hide tutor section based on user role
        toggleTutorSection(userData);
        
    } catch (error) {
        console.error('Error initializing profile:', error);
        showErrorMessage('Failed to load profile data. Please try again later.');
    }
}

// Fetch user profile data
async function fetchUserProfile(cmsId) {
    try {
        console.log('Fetching user profile for CMS ID:', cmsId);
        const response = await fetch(`http://${ipali}:8077/api/students/cms/${cmsId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
    }
}

// Fetch user sessions data
async function fetchUserSessions(cmsId) {
    try {
        const response = await fetch(`http://${ipali}:8077/api/meetings/student/${cmsId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching user sessions:', error);
        throw error;
    }
}

// Populate user profile data in the UI
async function populateUserProfile(userData) {
    console.log('User Data:', userData);
    // Basic profile info
    document.getElementById('profileName').textContent = userData.name;
    document.getElementById('displayName').textContent = userData.name;
    document.getElementById('displayCmsId').textContent = userData.cmsId || 'N/A';
    document.getElementById('displayBatch').textContent = userData.batch || 'N/A';
    document.getElementById('displaySemester').textContent = userData.semester || 'N/A';
    document.getElementById('displayPhone').textContent = userData.phoneNumber || 'N/A';
    document.getElementById('displayEmail').textContent = userData.email || 'N/A';
    document.getElementById('activeSince').textContent = userData.activeSince || '2025';
    console.log(':', userData);
    // Toggle Student/Tutor badges
    if (userData.isTutor) {
        console.log('User is a tutor');
        document.getElementById('tutorBadge').classList.remove('d-none');
        document.getElementById('tutorDashboardLink').classList.remove('d-none');
            tutorCourses = await getStudentCourses(userData.cmsId);
            populateTutorCourses(tutorCourses);
        
    }
}
// get the courses from the API
async function getStudentCourses(cmsId) {
  const url = `http://${ipali}:8077/api/students/courses/${cmsId}`;

  return fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to fetch courses for ${cmsId}. Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('Courses:', data);
      return data; // You can return this data to use it elsewhere
    })
    .catch(error => {
      console.error('Error fetching student courses:', error);
      return null; // or throw error if you want to handle it upstream
    });
}

// Populate tutor courses
function populateTutorCourses(courses) {
    const tutorCoursesListElement = document.getElementById('tutorCoursesList');
    tutorCoursesListElement.innerHTML = '';
    
    
    courses.forEach(course => {
        console.log('Tutor Courses:', course);
        console.log('Course:', course.courseName);
        console.log('Proficiency Level:', course.proficiencyLevel);
        const courseElement = document.createElement('div');
        courseElement.className = 'col-md-6 mb-2';
        
        courseElement.innerHTML = `
            <div class="course-badge p-2 rounded d-flex align-items-center">
                <div class="course-icon me-2 bg-soft-primary rounded p-1">
                    <i class="fas fa-book text-primary"></i>
                </div>
                <div>
                    <span class="d-block">${course.courseName}</span>
                    <small class="text-muted">Proficiency: ${course.proficiencyLevel}/10</small>
                </div>
            </div>
        `;
        
        tutorCoursesListElement.appendChild(courseElement);
    });
}
async function updateUserStats() {
    try {
        const cmsId = JSON.parse(localStorage.getItem('cmsId')) ;
        console.log('Updating user stats for CMS ID:', cmsId);
        // Fetch session count
        const countResponse = await fetch(`http://${ipali}:8077/api/meetings/completed/count/student/${cmsId}`);
        const countData = await countResponse.json();
        const sessionsCount = countData;
        document.getElementById('sessionsCount').textContent = sessionsCount;
        console.log('Sessions Count:', sessionsCount);
        // Fetch average rating directly
        const ratingsResponse = await fetch(`http://${ipali}:8077/api/feedbacks/rating/tutor/${cmsId}`);
        const ratingsData = await ratingsResponse.json();
        console.log('Ratings Data:', ratingsData.averageRating);
        // Assuming the API returns: { averageRating: 4.5 }
        const averageRating = ratingsData.averageRating;
        document.getElementById('userRating').textContent = averageRating;

    } catch (error) {
        console.error('Failed to update user stats:', error);
        document.getElementById('sessionsCount').textContent = '0';
        document.getElementById('userRating').textContent = '0.0';
    }
}



// Update upcoming sessions
function updateUpcomingSessions(sessionsData) {
    const upcomingSessionsElement = document.getElementById('upcomingSessions');
    
    // Clear previous content except the "View All" button
    const viewAllButton = upcomingSessionsElement.querySelector('.text-center');
    upcomingSessionsElement.innerHTML = '';
    
    if (viewAllButton) {
        upcomingSessionsElement.appendChild(viewAllButton);
    }
    
    // Check if there are upcoming sessions
    if (!sessionsData || !sessionsData.upcomingSessions || sessionsData.upcomingSessions.length === 0) {
        const noSessionsElement = document.createElement('div');
        noSessionsElement.className = 'text-center py-3';
        noSessionsElement.innerHTML = '<p class="text-muted mb-0">No upcoming sessions</p>';
        upcomingSessionsElement.insertBefore(noSessionsElement, viewAllButton);
        return;
    }
    
    // Sort sessions by date
    const upcomingSessions = sessionsData.upcomingSessions.sort((a, b) => {
        return new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time);
    });
    
    // Display up to 3 upcoming sessions
    upcomingSessions.slice(0, 3).forEach((session, index) => {
        const sessionElement = document.createElement('div');
        sessionElement.className = `session-item d-flex align-items-center p-2 ${index < upcomingSessions.length - 1 ? 'border-bottom' : ''}`;
        
        // Determine icon based on course subject
        let iconClass = 'fa-book';
        let bgClass = 'bg-soft-primary';
        let textClass = 'text-primary';
        
        if (session.courseCode.startsWith('CS')) {
            iconClass = 'fa-laptop-code';
        } else if (session.courseCode.startsWith('MTH')) {
            iconClass = 'fa-square-root-alt';
            bgClass = 'bg-soft-success';
            textClass = 'text-success';
        }
        
        sessionElement.innerHTML = `
            <div class="session-icon me-3 ${bgClass} p-2 rounded">
                <i class="fas ${iconClass} ${textClass}"></i>
            </div>
            <div class="session-info">
                <h6 class="mb-1">${session.courseCode} - ${session.topic}</h6>
                <p class="small mb-0 text-muted">${formatSessionDate(session.date)}, ${session.time} with ${session.partnerName}</p>
            </div>
        `;
        
        upcomingSessionsElement.insertBefore(sessionElement, viewAllButton);
    });
}

// Format session date (Today, Tomorrow, or actual date)
function formatSessionDate(dateStr) {
    const sessionDate = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    
    if (sessionDate.toDateString() === today.toDateString()) {
        return 'Today';
    } else if (sessionDate.toDateString() === tomorrow.toDateString()) {
        return 'Tomorrow';
    } else {
        return sessionDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
}

// Toggle tutor section visibility
function toggleTutorSection(userData) {
    const tutorSection = document.getElementById('tutorSection');
    const modeSwitcher = document.getElementById('modeSwitcherSessions');
    
    if (userData.roles && userData.roles.includes('tutor')) {
        tutorSection.classList.remove('d-none');
        
        // If user is both student and tutor, show mode switcher
        if (userData.roles.includes('student')) {
            modeSwitcher.classList.remove('d-none');
        }
    }
}

// Setup event listeners
function setupEventListeners() {
    // Mode switcher buttons
    const studentModeBtn = document.getElementById('studentModeBtn');
    const tutorModeBtn = document.getElementById('tutorModeBtn');
    
    if (studentModeBtn && tutorModeBtn) {
        studentModeBtn.addEventListener('click', function() {
            switchMode('student');
            studentModeBtn.classList.add('active');
            tutorModeBtn.classList.remove('active');
        });
        
        tutorModeBtn.addEventListener('click', function() {
            switchMode('tutor');
            tutorModeBtn.classList.add('active');
            studentModeBtn.classList.remove('active');
        });
    }
    
    // Home logo click event
    const homeLogo = document.getElementById('homeLogo');
    if (homeLogo) {
        homeLogo.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'index.html';
        });
    }
}

// Switch between student and tutor mode
async function switchMode(mode) {
    const userId = localStorage.getItem('userId') || getUrlParameter('userId');
    
    try {
        // // Fetch sessions based on the selected mode
        // const response = await fetch(`${API_BASE_URL}/users/${userId}/sessions?mode=${mode}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const sessionsData = await response.json();
        
        // Update UI with the new data
        updateUpcomingSessions(sessionsData);
        
    } catch (error) {
        console.error('Error switching mode:', error);
        showErrorMessage('Failed to load session data. Please try again later.');
    }
}

// Show error message
function showErrorMessage(message) {
    // You could implement a toast notification or other UI feedback here
    alert(message);
}