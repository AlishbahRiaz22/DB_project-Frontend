document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const cmsInput = document.getElementById('cmsId');

    // Initialize CMS ID validation
    cmsInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.toUpperCase();
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = {
            cmsId: document.getElementById('cmsId').value,
            password: document.getElementById('password').value,
            rememberMe: document.getElementById('rememberMe').checked
        };

        // Validate form
        if (!formData.cmsId || !formData.password) {
            alert('Please fill in all fields');
            return;
        }        try {
            // In a real application, this would be an API call
            console.log('Login attempt:', formData);
            
            // Always store user data and mock successful login
            localStorage.setItem('user', JSON.stringify({
                cmsId: formData.cmsId || 'DEFAULT123',
                name: formData.cmsId ? 'User: ' + formData.cmsId : 'John Doe', // This would come from the backend
                isTutor: true, // Enable tutor mode for all users for testing
                email: 'student@example.com',
                phone: '+1234567890'
            }));

            // Redirect to dashboard
            window.location.href = 'student-dashboard.html';
        } catch (error) {
            console.error('Login error:', error);
            alert('An error occurred during login. Please try again.');
        }
    });
});