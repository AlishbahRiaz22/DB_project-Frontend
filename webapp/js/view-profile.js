// Course list data (in a real application, this would come from a backend)
const courses = [
    { id: 'CS101', name: 'Introduction to Programming' },
    { id: 'CS201', name: 'Data Structures' },
    { id: 'CS301', name: 'Database Systems' },
    { id: 'MTH101', name: 'Calculus I' },
    { id: 'MTH201', name: 'Linear Algebra' },
    { id: 'PHY101', name: 'Physics I' },
    { id: 'ENG101', name: 'English Composition' }
];

// Mock statistics (in a real app, this would come from the backend)
const userStats = {
    coursesCount: 4,
    sessionsCount: 12,
    rating: 4.8,
    level: 'Advanced'
};

// Get ordinal suffix for numbers (1st, 2nd, 3rd, etc.)
function getOrdinalSuffix(num) {
    const n = parseInt(num);
    if (isNaN(n)) return '';
    
    if (n % 10 === 1 && n % 100 !== 11) return 'st';
    if (n % 10 === 2 && n % 100 !== 12) return 'nd';
    if (n % 10 === 3 && n % 100 !== 13) return 'rd';
    return 'th';
}

// Display tutor courses with proficiency levels
function displayTutorCourses(userCourses) {
    if (!userCourses || userCourses.length === 0) {
        document.getElementById('tutorCoursesList').innerHTML = 
            '<div class="col-12"><div class="alert alert-info">No courses selected yet. Go to Edit Profile to add courses you can teach.</div></div>';
        return;
    }

    const coursesList = document.getElementById('tutorCoursesList');
    const coursesHTML = userCourses.map(userCourse => {
        // Find course name from our course list
        const course = courses.find(c => c.id === userCourse.courseId) || 
            { id: userCourse.courseId, name: userCourse.courseId };
        
        // Calculate proficiency percentage for progress bar
        const proficiencyPercent = (userCourse.proficiency / 10) * 100;
        
        // Determine progress bar color and badge based on proficiency level
        let progressClass = 'bg-info';
        let badgeClass = 'bg-info';
        let levelText = 'Intermediate';
        
        if (userCourse.proficiency >= 8) {
            progressClass = 'bg-success';
            badgeClass = 'bg-success';
            levelText = 'Expert';
        } else if (userCourse.proficiency >= 5) {
            progressClass = 'bg-primary';
            badgeClass = 'bg-primary';
            levelText = 'Advanced';
        } else if (userCourse.proficiency < 3) {
            progressClass = 'bg-warning';
            badgeClass = 'bg-warning';
            levelText = 'Beginner';
        }
        
        // Get course icon based on subject
        let courseIcon = 'fas fa-book';
        if (course.id.startsWith('CS')) {
            courseIcon = 'fas fa-laptop-code';
        } else if (course.id.startsWith('MTH')) {
            courseIcon = 'fas fa-square-root-alt';
        } else if (course.id.startsWith('PHY')) {
            courseIcon = 'fas fa-atom';
        } else if (course.id.startsWith('ENG')) {
            courseIcon = 'fas fa-pen';
        }
        
        return `
        <div class="col-md-6 mb-3">
            <div class="card h-100 shadow-sm border-0 course-card">
                <div class="card-body">
                    <div class="d-flex align-items-center mb-3">
                        <div class="course-icon me-3 p-2 rounded-circle bg-light text-${progressClass.replace('bg-', '')}">
                            <i class="${courseIcon}"></i>
                        </div>
                        <h6 class="card-title mb-0">${course.id} - ${course.name}</h6>
                    </div>
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <small>Proficiency Level:</small>
                        <span class="badge ${badgeClass}">${levelText}</span>
                    </div>
                    <div class="progress" style="height: 8px;">
                        <div class="progress-bar ${progressClass}" role="progressbar" 
                            style="width: ${proficiencyPercent}%" 
                            aria-valuenow="${userCourse.proficiency}" 
                            aria-valuemin="0" aria-valuemax="10">
                        </div>
                    </div>
                    <div class="d-flex justify-content-between mt-1">
                        <small class="text-muted">Beginner</small>
                        <small class="text-muted">Expert (${userCourse.proficiency}/10)</small>
                    </div>
                </div>
            </div>
        </div>`;
    }).join('');

    coursesList.innerHTML = coursesHTML;
}

// Handle logo click to go to appropriate dashboard
document.addEventListener('DOMContentLoaded', () => {
    const homeLogo = document.getElementById('homeLogo');
    if (homeLogo) {
        homeLogo.addEventListener('click', function(e) {
            e.preventDefault();
            const currentMode = localStorage.getItem('currentMode') || 'student';
            window.location.href = currentMode === 'tutor' ? 'tutor-dashboard.html' : 'student-dashboard.html';
        });
    }
    
    // Update View All button when page loads
    const viewAllBtn = document.getElementById('viewAllSessionsBtn');
    if (viewAllBtn) {
        const currentMode = localStorage.getItem('currentMode') || 'student';
        viewAllBtn.href = currentMode === 'tutor' ? 'tutor-dashboard.html' : 'student-dashboard.html';
    }
    
    loadUserData();
});

// Update upcoming sessions based on mode (student or tutor)
function updateUpcomingSessions(mode) {
    // Mock session data (in a real app, this would come from the backend)
    const tutorSessions = [
        {
            course: 'CS101',
            courseName: 'Arrays and Loops',
            icon: 'fas fa-laptop-code',
            iconClass: 'bg-soft-primary text-primary',
            time: 'Today, 2:00 PM',
            student: 'Sarah'
        },
        {
            course: 'MTH101',
            courseName: 'Integration',
            icon: 'fas fa-square-root-alt',
            iconClass: 'bg-soft-success text-success',
            time: 'Tomorrow, 4:15 PM',
            student: 'Michael'
        }
    ];
    
    const studentSessions = [
        {
            course: 'CS101',
            courseName: 'Arrays and Loops',
            icon: 'fas fa-laptop-code',
            iconClass: 'bg-soft-primary text-primary',
            time: 'Today, 2:00 PM',
            tutor: 'Carol'
        },
        {
            course: 'MTH101',
            courseName: 'Derivatives',
            icon: 'fas fa-square-root-alt',
            iconClass: 'bg-soft-success text-success',
            time: 'Tomorrow, 3:30 PM',
            tutor: 'Alex'
        }
    ];
    
    const sessionsContainer = document.getElementById('upcomingSessions');
    if (!sessionsContainer) return;
    
    const sessions = mode === 'tutor' ? tutorSessions : studentSessions;
    
    // Update the heading of the sessions section
    const sessionCards = document.querySelectorAll('.card-header h5');
    sessionCards.forEach(header => {
        if (header.closest('.card').querySelector('#upcomingSessions')) {
            header.innerHTML = `<i class="fas fa-calendar-alt me-2 text-primary"></i> Upcoming ${mode === 'tutor' ? 'Tutoring' : 'Learning'} Sessions`;
        }
    });
    
    // Build sessions HTML
    let sessionsHTML = '';
    
    if (sessions.length === 0) {
        sessionsHTML = '<div class="alert alert-info">No upcoming sessions scheduled.</div>';
    } else {
        sessions.forEach((session, index) => {
            const isLast = index === sessions.length - 1;
            sessionsHTML += `
            <div class="session-item d-flex align-items-center p-2 ${!isLast ? 'border-bottom' : ''}">
                <div class="session-icon me-3 ${session.iconClass} p-2 rounded">
                    <i class="${session.icon}"></i>
                </div>
                <div class="session-info">
                    <h6 class="mb-1">${session.course} - ${session.courseName}</h6>
                    <p class="small mb-0 text-muted">${session.time} with ${mode === 'tutor' ? session.student : session.tutor}</p>
                </div>
            </div>`;
        });
    }
    
    // Add "View All" button with link to appropriate dashboard
    sessionsHTML += `
    <div class="text-center mt-3">
        <a href="${mode === 'tutor' ? 'tutor-dashboard.html' : 'student-dashboard.html'}" class="btn btn-sm btn-outline-primary">View All</a>
    </div>`;
    
    // Update the container content
    sessionsContainer.innerHTML = sessionsHTML;
}

// Update the home logo href based on current mode
function updateHomeLogo(mode) {
    const homeLogo = document.getElementById('homeLogo');
    if (homeLogo) {
        homeLogo.setAttribute('href', mode === 'tutor' ? 'tutor-dashboard.html' : 'student-dashboard.html');
    }
}

// Load user data
function loadUserData() {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData) {
        // Show message if no user data exists
        document.getElementById('displayName').textContent = 'No user data found';
        document.getElementById('displayCmsId').textContent = 'N/A';
        document.getElementById('displayBatch').textContent = 'N/A';
        document.getElementById('displaySemester').textContent = 'N/A';
        document.getElementById('displayPhone').textContent = 'N/A';
        document.getElementById('displayEmail').textContent = 'N/A';
        document.getElementById('profileName').textContent = 'No Profile Found';
        return;
    }

    // Fill profile with user data
    const userName = userData.name || 'Not provided';
    document.getElementById('displayName').textContent = userName;
    document.getElementById('profileName').textContent = userName;
    document.getElementById('displayCmsId').textContent = userData.cmsId || 'Not provided';
    document.getElementById('displayBatch').textContent = userData.batch || 'Not provided';
    document.getElementById('displaySemester').textContent = 
        userData.semester ? `${userData.semester}${getOrdinalSuffix(userData.semester)} Semester` : 'Not provided';
    document.getElementById('displayPhone').textContent = userData.phone || 'Not provided';    document.getElementById('displayEmail').textContent = userData.email || 'Not provided';
    
    // Set active since year (either from user data or default to current year)
    const activeSinceElement = document.getElementById('activeSince');
    if (activeSinceElement) {
        // If user has a registrationDate field, use that year
        // Otherwise default to current year
        const registrationYear = userData.registrationDate 
            ? new Date(userData.registrationDate).getFullYear() 
            : new Date().getFullYear();
        activeSinceElement.textContent = registrationYear;
    }

    // Update statistics
    document.getElementById('coursesCount').textContent = userStats.coursesCount;
    document.getElementById('sessionsCount').textContent = userStats.sessionsCount;
    document.getElementById('userRating').textContent = userStats.rating;
    
    try {
        document.getElementById('userLevel').textContent = userStats.level;
    } catch (e) {
        // Element might not exist, safely ignore
    }

    // Show tutor badge if user is a tutor
    if (userData.isTutor) {
        document.getElementById('tutorBadge').classList.remove('d-none');
        document.getElementById('tutorSection').classList.remove('d-none');
        
        // Show tutor dashboard link in navigation
        document.getElementById('tutorDashboardLink').classList.remove('d-none');
        
        // Display user's tutor courses
        displayTutorCourses(userData.courses);
          // Show mode switcher for users who are both students and tutors
        // In a real app, we'd check if they have both roles. Here we assume all users are students,
        // and some are also tutors
        const modeSwitcherSessions = document.getElementById('modeSwitcherSessions');
        if (modeSwitcherSessions) {
            modeSwitcherSessions.classList.remove('d-none');
        }
    }
    
    // Check which mode the user came from (default to student)
    const currentMode = localStorage.getItem('currentMode') || 'student';
    
    // Initialize active button in mode switcher
    if (userData.isTutor) {
        const studentModeBtn = document.getElementById('studentModeBtn');
        const tutorModeBtn = document.getElementById('tutorModeBtn');
        
        if (currentMode === 'tutor') {
            studentModeBtn.classList.remove('active');
            tutorModeBtn.classList.add('active');
        } else {
            studentModeBtn.classList.add('active');
            tutorModeBtn.classList.remove('active');
        }
    }
    
    // Update upcoming sessions and logo based on current mode
    updateUpcomingSessions(currentMode);
    updateHomeLogo(currentMode);
}

// Add event listeners for mode switcher buttons (now in the Upcoming Sessions section)
const studentModeBtn = document.getElementById('studentModeBtn');
const tutorModeBtn = document.getElementById('tutorModeBtn');

if (studentModeBtn && tutorModeBtn) {
    studentModeBtn.addEventListener('click', function() {
        if (!this.classList.contains('active')) {
            tutorModeBtn.classList.remove('active');
            this.classList.add('active');
            localStorage.setItem('currentMode', 'student');
            updateUpcomingSessions('student');
            updateHomeLogo('student');
        }
    });
      tutorModeBtn.addEventListener('click', function() {
        // Get current user data
        const userData = JSON.parse(localStorage.getItem('user')) || {};
        
        // Check if the user is already a tutor
        if (!userData.isTutor) {
            // Show the become tutor modal if user is not a tutor
            const becomeTutorModal = new bootstrap.Modal(document.getElementById('becomeTutorModal'));
            becomeTutorModal.show();
            return; // Stop here, don't switch mode
        }
        
        // Continue with regular mode switching for tutors
        if (!this.classList.contains('active')) {
            studentModeBtn.classList.remove('active');
            this.classList.add('active');
            localStorage.setItem('currentMode', 'tutor');
            updateUpcomingSessions('tutor');
            updateHomeLogo('tutor');
        }
    });
}

// Set the logo link based on current mode
const homeLogo = document.getElementById('homeLogo');
if (homeLogo) {
    homeLogo.addEventListener('click', function(e) {
        e.preventDefault();
        const currentMode = localStorage.getItem('currentMode') || 'student';
        window.location.href = currentMode === 'tutor' ? 'tutor-dashboard.html' : 'student-dashboard.html';
    });
}

// Load user data when page loads
loadUserData();

// Become a Tutor Modal Functionality
document.addEventListener('DOMContentLoaded', () => {
    const becomeTutorCheck = document.getElementById('becomeTutorCheck');
    const tutorCourseSelectionSection = document.getElementById('tutorCourseSelectionSection');
    const saveTutorProfileBtn = document.getElementById('saveTutorProfile');
    
    if (becomeTutorCheck) {
        becomeTutorCheck.addEventListener('change', function() {
            tutorCourseSelectionSection.classList.toggle('d-none', !this.checked);
            saveTutorProfileBtn.disabled = !this.checked;
            
            // If checked and course selection is empty, populate it
            if (this.checked && document.getElementById('tutorCourseSelection').children.length === 0) {
                populateTutorCourseSelection();
            }
        });
    }
    
    // Save tutor profile when button is clicked
    if (saveTutorProfileBtn) {
        saveTutorProfileBtn.addEventListener('click', function() {
            // Get selected courses and proficiency levels
            const selectedCourses = [];
            const courseCheckboxes = document.querySelectorAll('.tutor-course-checkbox:checked');
            
            courseCheckboxes.forEach(checkbox => {
                const courseId = checkbox.value;
                const proficiencyLevel = document.getElementById(`proficiency-${courseId}`).value;
                
                selectedCourses.push({
                    courseId: courseId,
                    proficiency: parseInt(proficiencyLevel)
                });
            });
            
            // Validate at least one course is selected
            if (selectedCourses.length === 0) {
                alert('Please select at least one course to teach.');
                return;
            }
            
            // Update user data in localStorage
            const userData = JSON.parse(localStorage.getItem('user')) || {};
            userData.isTutor = true;
            userData.courses = selectedCourses;
            localStorage.setItem('user', JSON.stringify(userData));
            
            // Close the modal
            const becomeTutorModal = bootstrap.Modal.getInstance(document.getElementById('becomeTutorModal'));
            becomeTutorModal.hide();
            
            // Update the UI to reflect the user is now a tutor
            document.getElementById('tutorBadge').classList.remove('d-none');
            document.getElementById('tutorSection').classList.remove('d-none');
            document.getElementById('tutorDashboardLink').classList.remove('d-none');
            document.getElementById('modeSwitcherSessions').classList.remove('d-none');
            
            // Switch to tutor mode
            const studentModeBtn = document.getElementById('studentModeBtn');
            const tutorModeBtn = document.getElementById('tutorModeBtn');
            
            studentModeBtn.classList.remove('active');
            tutorModeBtn.classList.add('active');
            localStorage.setItem('currentMode', 'tutor');
            
            // Update tutor courses display
            displayTutorCourses(selectedCourses);
            
            // Update sessions and logo
            updateUpcomingSessions('tutor');
            updateHomeLogo('tutor');
            
            // Show success message
            alert('Congratulations! You are now registered as a tutor.');
        });
    }
});
