document.addEventListener('DOMContentLoaded', () => {
    const editProfileForm = document.getElementById('editProfileForm');
    const tutorCheckbox = document.getElementById('isTutor');
    const tutorSection = document.getElementById('tutorSection');
    const coursesList = document.getElementById('coursesList');

    // Course list data (in a real application, this would come from a backend)
    const courses = [
        { id: 'CS101', name: 'Introduction to Programming' },
        { id: 'CS201', name: 'Data Structures' },
        { id: 'CS301', name: 'Database Systems' },
        { id: 'MTH101', name: 'Calculus I' },
        { id: 'MTH201', name: 'Linear Algebra' },
        { id: 'PHY101', name: 'Physics I' },
        { id: 'ENG101', name: 'English Composition' }
    ];    // Load user data
    function loadUserData() {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (!userData) {
            // Use default data if no user data exists
            return;
        }

        // Fill form with user data
        document.getElementById('cmsId').value = userData.cmsId;
        document.getElementById('fullName').value = userData.name;
        document.getElementById('phone').value = userData.phone || '';
        document.getElementById('batch').value = userData.batch || '';
        document.getElementById('semester').value = userData.semester || '';
        document.getElementById('email').value = userData.email || '';
        tutorCheckbox.checked = userData.isTutor;        // Show tutor section if user is a tutor
        if (userData.isTutor) {
            // Show tutor section
            tutorSection.classList.remove('d-none');
            
            // Show tutor dashboard link in navigation
            const tutorDashboardLink = document.getElementById('tutorDashboardLink');
            if (tutorDashboardLink) {
                tutorDashboardLink.classList.remove('d-none');
            }
            
            createCourseElements();
            // Set selected courses and proficiency levels
            if (userData.courses) {
                userData.courses.forEach(course => {
                    const checkbox = document.getElementById(`course-${course.courseId}`);
                    if (checkbox) {
                        checkbox.checked = true;
                        const sliderContainer = checkbox.closest('.course-item').querySelector('.proficiency-slider');
                        const slider = document.getElementById(`proficiency-${course.courseId}`);
                        const valueDisplay = sliderContainer.querySelector('.proficiency-value');
                        
                        sliderContainer.classList.remove('d-none');
                        slider.value = course.proficiency;
                        valueDisplay.textContent = course.proficiency;
                    }
                });
            }
        }
    }

    // Create course selection elements
    function createCourseElements() {
        coursesList.innerHTML = courses.map(course => `
            <div class="course-item mb-3 border rounded p-3">
                <div class="d-flex align-items-center justify-content-between">
                    <div class="form-check">
                        <input type="checkbox" class="form-check-input course-checkbox" 
                               id="course-${course.id}" value="${course.id}">
                        <label class="form-check-label" for="course-${course.id}">${course.name}</label>
                    </div>
                </div>
                <div class="proficiency-slider mt-2 d-none">
                    <label class="form-label d-flex justify-content-between">
                        <span>Proficiency Level</span>
                        <span class="proficiency-value">5</span>
                    </label>
                    <input type="range" class="form-range" min="1" max="10" value="5"
                           id="proficiency-${course.id}">
                    <div class="d-flex justify-content-between">
                        <small>Beginner</small>
                        <small>Expert</small>
                    </div>
                </div>
            </div>
        `).join('');

        // Add event listeners for course checkboxes
        document.querySelectorAll('.course-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const courseItem = e.target.closest('.course-item');
                const sliderContainer = courseItem.querySelector('.proficiency-slider');
                sliderContainer.classList.toggle('d-none', !e.target.checked);
            });
        });

        // Add event listeners for proficiency sliders
        document.querySelectorAll('input[type="range"]').forEach(slider => {
            slider.addEventListener('input', (e) => {
                const courseItem = e.target.closest('.course-item');
                courseItem.querySelector('.proficiency-value').textContent = e.target.value;
            });
        });
    }

    // Initialize phone number validation
    const phoneInput = document.getElementById('phone');
    phoneInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^0-9+]/g, '');
    });

    // Toggle tutor section visibility
    tutorCheckbox.addEventListener('change', () => {
        tutorSection.classList.toggle('d-none', !tutorCheckbox.checked);
        if (tutorCheckbox.checked && coursesList.children.length === 0) {
            createCourseElements();
        }
    });

    // Form submission handler
    editProfileForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Collect form data
        const formData = {
            cmsId: document.getElementById('cmsId').value,
            name: document.getElementById('fullName').value,
            phone: document.getElementById('phone').value,
            batch: document.getElementById('batch').value,
            semester: document.getElementById('semester').value,
            email: document.getElementById('email').value,
            isTutor: tutorCheckbox.checked,
            courses: []
        };

        // Basic validation
        if (!formData.phone.match(/^\+?[\d-]{10,}$/)) {
            alert('Please enter a valid phone number');
            return;
        }

        // If user is a tutor, collect course proficiencies
        if (tutorCheckbox.checked) {
            const selectedCourses = document.querySelectorAll('.course-checkbox:checked');
            
            if (selectedCourses.length === 0) {
                alert('Please select at least one course to teach');
                return;
            }

            selectedCourses.forEach(checkbox => {
                formData.courses.push({
                    courseId: checkbox.value,
                    proficiency: document.getElementById(`proficiency-${checkbox.value}`).value
                });
            });
        }        try {
            // In a real application, this would be an API call
            console.log('Profile updated with data:', formData);            
            // Update stored user data
            localStorage.setItem('user', JSON.stringify(formData));

            // Show notification (using alert for now)
            alert('Profile updated successfully!');
            
            // Redirect to the appropriate dashboard based on tutor status
            if (formData.isTutor && window.confirm('Your profile has been updated to include tutor status. Would you like to go to the tutor dashboard?')) {
                window.location.href = 'tutor-dashboard.html';
            } else {
                window.location.href = 'student-dashboard.html';
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('An error occurred while updating your profile. Please try again.');
        }
    });

    // Load user data when page loads
    loadUserData();
});