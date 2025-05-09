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

document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    const tutorCheckbox = document.getElementById('isTutor');
    const tutorSection = document.getElementById('tutorSection');
    const coursesList = document.getElementById('coursesList');

    // Initialize phone number validation
    const phoneInput = document.getElementById('phone');
    phoneInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^0-9+]/g, '');
    });

    // Initialize CMS ID validation (assuming format like FA21-BCS-001)
    const cmsInput = document.getElementById('cmsId');
    cmsInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.toUpperCase();
    });

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

    // Toggle tutor section visibility
    tutorCheckbox.addEventListener('change', () => {
        tutorSection.classList.toggle('d-none', !tutorCheckbox.checked);
        if (tutorCheckbox.checked && coursesList.children.length === 0) {
            createCourseElements();
        }
    });

    // Form submission handler
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Validate passwords match
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        // Collect form data
        const formData = {
            cmsId: document.getElementById('cmsId').value,
            fullName: document.getElementById('fullName').value,
            phone: document.getElementById('phone').value,
            batch: document.getElementById('batch').value,
            semester: document.getElementById('semester').value,
            email: document.getElementById('email').value,
            password: password,
            isTutor: tutorCheckbox.checked,
            courses: []
        };

        // Basic validation
        if (!formData.cmsId.match(/^[A-Z]{2}\d{2}-[A-Z]{3}-\d{3}$/)) {
            alert('Please enter a valid CMS ID (e.g., FA21-BCS-001)');
            return;
        }

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
        }

        try {
            // In a real application, this would be an API call
            console.log('Form submitted with data:', formData);

            // Store user data in localStorage (in a real app, this would be handled by the backend)
            localStorage.setItem('user', JSON.stringify({
                cmsId: formData.cmsId,
                name: formData.fullName,
                isTutor: formData.isTutor,
                courses: formData.courses
            }));

            alert('Account created successfully! Redirecting to dashboard...');
            window.location.href = 'student-dashboard.html';
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('An error occurred while creating your account. Please try again.');
        }
    });
});