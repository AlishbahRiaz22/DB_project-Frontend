
ipali = '10.7.241.116'
document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const editProfileForm = document.getElementById('editProfileForm');
    const isTutorCheckbox = document.getElementById('isTutor');
    const tutorSection = document.getElementById('tutorSection');
    const coursesList = document.getElementById('coursesList');
    const tutorDashboardLink = document.getElementById('tutorDashboardLink');

    // Configuration
    const API_BASE_URL = 'https://api.educonnect.com/v1'; // Replace with your actual API base URL

    // Initialize profile data
    initializeProfilePage();

    // Event listeners
    isTutorCheckbox.addEventListener('change', toggleTutorSection);
    editProfileForm.addEventListener('submit', handleFormSubmit);

    /**
     * Initialize the profile page by fetching user data and courses
     */
    async function initializeProfilePage() {
        try {
            // Show loading state
            showLoadingState(true);
            
            // Get user ID from localStorage or other auth mechanism
            const cms = localStorage.getItem('cmsId');
            console.log('CMS ID:', cmsId);
            cmsId = cms ? JSON.parse(cms) : null;
            
            if (!cmsId) {
                window.location.href = 'login.html';
                return;
            }
            
            // Fetch user profile data
            const userData = await fetchUserProfile(cmsId);
            
            // Populate form with user data
            populateFormWithUserData(userData);
            
            // Initialize tutor section if applicable
            if (userData.isTutor) {
                isTutorCheckbox.checked = true;
                tutorDashboardLink.classList.remove('d-none');
                toggleTutorSection();
                
                // Populate selected courses
                populateTutorCourses(userData.courses);
            }
            
            // Hide loading state
            showLoadingState(false);
        } catch (error) {
            console.error('Error initializing profile:', error);
            showError('Failed to load profile data. Please try again later.');
            showLoadingState(false);
        }
    }

    /**
     * Fetch user profile data from API
     * @param {string} userId - The user ID
     * @returns {Promise<Object>} - User data
     */
    async function fetchUserProfile(userId) {
        try {
            const response = await fetch(`http://${ipali}:8077/api/students/cms/${cmsId}`);
            
            if (!response.ok) {
                throw new Error(`Server returned ${response.status}: ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching user profile:', error);
            throw error;
        }
    }

    /**
     * Populate form fields with user data
     * @param {Object} userData - The user profile data
     */
    function populateFormWithUserData(userData) {
        // Set form field values
        document.getElementById('cmsId').value = userData.cmsId || '';
        document.getElementById('fullName').value = userData.fullName || '';
        document.getElementById('phone').value = userData.phone || '';
        document.getElementById('batch').value = userData.batch || '';
        document.getElementById('semester').value = userData.semester || '';
        document.getElementById('email').value = userData.email || '';
        
        // Handle tutor status
        if (userData.isTutor) {
            isTutorCheckbox.checked = true;
            loadAvailableCourses();
        }
    }

    /**
     * Toggle visibility of tutor section based on checkbox state
     */
    function toggleTutorSection() {
        if (isTutorCheckbox.checked) {
            tutorSection.classList.remove('d-none');
            loadAvailableCourses();
        } else {
            tutorSection.classList.add('d-none');
        }
    }

    /**
     * Load available courses from API and create UI elements
     */
    async function loadAvailableCourses() {
        try {
            // Clear existing courses
            coursesList.innerHTML = '';
            
            // Get user's current semester
            const userSemester = document.getElementById('semester').value;
            
            // Fetch courses
            const courses = await fetchAvailableCourses(userSemester);
            
            // Create UI elements for each course
            courses.forEach(course => {
                const courseElement = createCourseElement(course);
                coursesList.appendChild(courseElement);
            });
        } catch (error) {
            console.error('Error loading courses:', error);
            showError('Failed to load available courses. Please try again later.');
        }
    }

    /**
     * Fetch available courses from API
     * @param {string} semester - User's current semester
     * @returns {Promise<Array>} - Array of course objects
     */
    async function fetchAvailableCourses(semester) {
        try {
            const response = await fetch(`http://${ipali}:8077/api/students/courses/${cmsId}`);
            
            if (!response.ok) {
                throw new Error(`Server returned ${response.status}: ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching courses:', error);
            throw error;
        }
    }

    /**
     * Create UI element for a course selection
     * @param {Object} course - Course data
     * @returns {HTMLElement} - Course selection element
     */
    function createCourseElement(course) {
        const courseDiv = document.createElement('div');
        courseDiv.className = 'course-item mb-3 p-3 border rounded';
        
        const courseHtml = `
            <div class="form-check d-flex align-items-center justify-content-between">
                <div>
                    <input type="checkbox" class="form-check-input course-checkbox" 
                           id="course-${course.id}" value="${course.id}"
                           data-course-name="${course.courseName}">
                    <label class="form-check-label" for="course-${course.id}">${course.name} (${course.code})</label>
                </div>
                <div class="proficiency-container d-none ms-3">
                    <label for="proficiency-${course.proficiencyLevel}" class="me-2">Proficiency:</label>
                    <select class="form-select form-select-sm proficiency-select" 
                            id="proficiency-${course.proficiencyLevel}" style="width: 70px">
                        ${generateProficiencyOptions()}
                    </select>
                </div>
            </div>
        `;
        
        courseDiv.innerHTML = courseHtml;
        
        // Add event listener to checkbox
        const checkbox = courseDiv.querySelector('.course-checkbox');
        const proficiencyContainer = courseDiv.querySelector('.proficiency-container');
        
        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                proficiencyContainer.classList.remove('d-none');
            } else {
                proficiencyContainer.classList.add('d-none');
            }
        });
        
        return courseDiv;
    }

    /**
     * Generate HTML options for proficiency select
     * @returns {string} - HTML options string
     */
    function generateProficiencyOptions() {
        let options = '';
        for (let i = 1; i <= 10; i++) {
            options += `<option value="${i}">${i}</option>`;
        }
        return options;
    }

    /**
     * Populate tutor courses with user's selected courses and proficiency levels
     * @param {Array} courses - User's selected courses
     */
    function populateTutorCourses(courses) {
        if (!courses || !courses.length) return;
        
        // Wait for courses to be loaded
        const checkCoursesLoaded = setInterval(() => {
            if (coursesList.children.length > 0) {
                clearInterval(checkCoursesLoaded);
                
                // Select courses and set proficiency
                courses.forEach(userCourse => {
                    const courseCheckbox = document.getElementById(`course-${userCourse.id}`);
                    if (courseCheckbox) {
                        courseCheckbox.checked = true;
                        
                        // Show and set proficiency
                        const proficiencyContainer = courseCheckbox.closest('.course-item').querySelector('.proficiency-container');
                        const proficiencySelect = document.getElementById(`proficiency-${userCourse.id}`);
                        
                        proficiencyContainer.classList.remove('d-none');
                        proficiencySelect.value = userCourse.proficiency || 5;
                    }
                });
            }
        }, 100);
        
        // Clear interval after 5 seconds to prevent infinite loop
        setTimeout(() => clearInterval(checkCoursesLoaded), 5000);
    }

    /**
     * Handle form submission
     * @param {Event} event - Form submit event
     */
    async function handleFormSubmit(event) {
        event.preventDefault();
        
        try {
            // Show loading state
            showLoadingState(true);
            
            // Get user ID from localStorage or other auth mechanism
            const userId = localStorage.getItem('userId');
            
            if (!userId) {
                window.location.href = 'login.html';
                return;
            }
            
            // Gather form data
            const formData = {
                fullName: document.getElementById('fullName').value,
                phone: document.getElementById('phone').value,
                batch: document.getElementById('batch').value,
                semester: document.getElementById('semester').value,
                email: document.getElementById('email').value,
                isTutor: isTutorCheckbox.checked
            };
            
            // If user is a tutor, add selected courses
            if (isTutorCheckbox.checked) {
                formData.courses = getSelectedCourses();
            }
            
            // Submit profile update
            await updateUserProfile(userId, formData);
            
            // Show success message
            showSuccess('Profile updated successfully!');
            
            // Update tutor dashboard link visibility
            if (isTutorCheckbox.checked) {
                tutorDashboardLink.classList.remove('d-none');
            } else {
                tutorDashboardLink.classList.add('d-none');
            }
            
            // Hide loading state
            showLoadingState(false);
        } catch (error) {
            console.error('Error updating profile:', error);
            showError('Failed to update profile. Please try again later.');
            showLoadingState(false);
        }
    }

    /**
     * Get selected courses and their proficiency levels
     * @returns {Array} - Array of selected courses
     */
    function getSelectedCourses() {
        const selectedCourses = [];
        const courseCheckboxes = document.querySelectorAll('.course-checkbox:checked');
        
        courseCheckboxes.forEach(checkbox => {
            const courseId = checkbox.value;
            const courseName = checkbox.dataset.courseName;
            const proficiencySelect = document.getElementById(`proficiency-${courseId}`);
            
            selectedCourses.push({
                id: courseId,
                name: courseName,
                proficiency: parseInt(proficiencySelect.value)
            });
        });
        
        return selectedCourses;
    }

    /**
     * Update user profile via API
     * @param {string} userId - The user ID
     * @param {Object} profileData - The profile data to update
     * @returns {Promise<Object>} - Updated user data
     */
    async function updateUserProfile(userId, profileData) {
        try {
            const response = await fetch(`${API_BASE_URL}/users/${userId}/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(profileData)
            });
            
            if (!response.ok) {
                throw new Error(`Server returned ${response.status}: ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error updating user profile:', error);
            throw error;
        }
    }

    /**
     * Show loading state
     * @param {boolean} isLoading - Whether loading is active
     */
    function showLoadingState(isLoading) {
        const submitButton = editProfileForm.querySelector('button[type="submit"]');
        
        if (isLoading) {
            submitButton.disabled = true;
            submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...';
        } else {
            submitButton.disabled = false;
            submitButton.innerHTML = 'Save Changes';
        }
    }

    /**
     * Show success message
     * @param {string} message - Success message
     */
    function showSuccess(message) {
        // Create alert element
        const alertElement = document.createElement('div');
        alertElement.className = 'alert alert-success alert-dismissible fade show mt-3';
        alertElement.role = 'alert';
        alertElement.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        // Add to page
        editProfileForm.insertAdjacentElement('beforebegin', alertElement);
        
        // Auto dismiss after 3 seconds
        setTimeout(() => {
            const bsAlert = bootstrap.Alert.getOrCreateInstance(alertElement);
            bsAlert.close();
        }, 3000);
    }

    /**
     * Show error message
     * @param {string} message - Error message
     */
    function showError(message) {
        // Create alert element
        const alertElement = document.createElement('div');
        alertElement.className = 'alert alert-danger alert-dismissible fade show mt-3';
        alertElement.role = 'alert';
        alertElement.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        // Add to page
        editProfileForm.insertAdjacentElement('beforebegin', alertElement);
        
        // Auto dismiss after 5 seconds
        setTimeout(() => {
            const bsAlert = bootstrap.Alert.getOrCreateInstance(alertElement);
            bsAlert.close();
        }, 5000);
    }
});