document.addEventListener('DOMContentLoaded', () => {
    // Get user data from localStorage or use mock data
    const storedUser = JSON.parse(localStorage.getItem('user')) || {};
    
    // Mock data (in a real application, this would come from a backend)
    const userData = {
        name: storedUser.name || 'John Doe',
        isTutor: storedUser.isTutor || false,
        requests: [
            {
                id: 1,
                course: 'CS101',
                topic: 'Arrays and Loops',
                date: '2025-05-10',
                time: '14:00',
                status: 'pending',
                responses: [
                    { tutorId: 1, tutorName: 'Alice Smith', rating: 4.5 },
                    { tutorId: 2, tutorName: 'Bob Johnson', rating: 4.8 }
                ]
            },
            {
                id: 2,
                course: 'MTH101',
                topic: 'Derivatives',
                date: '2025-05-12',
                time: '15:30',
                status: 'accepted',
                acceptedTutor: { tutorId: 3, tutorName: 'Carol Williams', rating: 4.9 }
            }
        ]
    };

    // Initialize the dashboard
    function initDashboard() {
        // Set user name
        document.getElementById('studentName').textContent = userData.name;
        
        // Show/hide switch profile button based on tutor status
        const switchProfileBtn = document.getElementById('switchProfileBtn');
        if (userData.isTutor) {
            switchProfileBtn.classList.remove('d-none');
        }

        // Load course options
        loadCourseOptions();
        
        // Load recent requests
        loadRequests(true);
        
        // Add event listeners
        setupEventListeners();
    }

    function loadCourseOptions() {
        const courseSelect = document.getElementById('requestCourse');
        const courses = [
            { id: 'CS101', name: 'Introduction to Programming' },
            { id: 'CS201', name: 'Data Structures' },
            { id: 'MTH101', name: 'Calculus I' },
            { id: 'MTH201', name: 'Linear Algebra' }
        ];

        courses.forEach(course => {
            const option = document.createElement('option');
            option.value = course.id;
            option.textContent = `${course.id} - ${course.name}`;
            courseSelect.appendChild(option);
        });
    }

    function loadRequests(recentOnly = false) {
        const requestsList = document.getElementById('requestsList');
        let requests = userData.requests;
        
        if (recentOnly) {
            requests = requests.slice(0, 3); // Show only 3 most recent requests
        }

        requestsList.innerHTML = requests.map(request => `
            <div class="request-card card mb-3">
                <div class="card-body">
                    <h6 class="card-title d-flex justify-content-between">
                        <span>${request.course} - ${request.topic}</span>
                        <span class="badge ${request.status === 'pending' ? 'bg-warning' : 'bg-success'}">${request.status}</span>
                    </h6>
                    <p class="card-text">
                        <small class="text-muted">
                            Scheduled for: ${request.date} at ${request.time}
                        </small>
                    </p>
                    ${renderTutorResponses(request)}
                </div>
            </div>
        `).join('');

        // Add event listeners for accept/decline buttons
        document.querySelectorAll('.accept-tutor').forEach(btn => {
            btn.addEventListener('click', (e) => acceptTutor(e.target.dataset.requestId, e.target.dataset.tutorId));
        });

        document.querySelectorAll('.decline-tutor').forEach(btn => {
            btn.addEventListener('click', (e) => declineTutor(e.target.dataset.requestId, e.target.dataset.tutorId));
        });
    }

    function renderTutorResponses(request) {
        if (request.status === 'accepted') {
            return `
                <div class="accepted-tutor">
                    <small class="text-success">
                        <i class="fas fa-check-circle"></i> 
                        Accepted Tutor: ${request.acceptedTutor.tutorName} 
                        (Rating: ${request.acceptedTutor.rating}⭐)
                    </small>
                </div>
            `;
        }

        if (!request.responses || request.responses.length === 0) {
            return '<p class="card-text"><small>No tutor responses yet</small></p>';
        }

        return `
            <div class="tutor-responses">
                <small>Tutor Responses:</small>
                ${request.responses.map(tutor => `
                    <div class="tutor-response d-flex justify-content-between align-items-center mt-2">
                        <span>${tutor.tutorName} (Rating: ${tutor.rating}⭐)</span>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-success accept-tutor" 
                                    data-request-id="${request.id}" 
                                    data-tutor-id="${tutor.tutorId}">Accept</button>
                            <button class="btn btn-danger decline-tutor"
                                    data-request-id="${request.id}" 
                                    data-tutor-id="${tutor.tutorId}">Decline</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    function setupEventListeners() {
        // Show all requests button
        document.getElementById('showAllRequestsBtn').addEventListener('click', () => {
            loadRequests(false);
        });

        // New request form submission
        document.getElementById('submitRequest').addEventListener('click', () => {
            const formData = {
                course: document.getElementById('requestCourse').value,
                topic: document.getElementById('requestTopic').value,
                description: document.getElementById('requestDescription').value,
                date: document.getElementById('requestDate').value,
                time: document.getElementById('requestTime').value
            };            // Validate form
            if (!formData.course || !formData.topic || !formData.description || !formData.date || !formData.time) {
                showNotification('Please fill in all fields', 'warning', 'fa-exclamation-circle');
                return;
            }

            // In a real application, this would be an API call
            console.log('New request submitted:', formData);
            showNotification('Request submitted successfully! Tutors will be notified.', 'success', 'fa-paper-plane');
            
            // Close modal and reset form
            const modal = bootstrap.Modal.getInstance(document.getElementById('newRequestModal'));
            modal.hide();
            document.getElementById('newRequestForm').reset();
            
            // Reload requests
            loadRequests(true);
        });

        // Feedback button
        document.getElementById('feedbackBtn').addEventListener('click', () => {
            const feedbackModal = new bootstrap.Modal(document.getElementById('feedbackModal'));
            feedbackModal.show();
        });

        // Submit feedback
        document.getElementById('submitFeedback').addEventListener('click', () => {
            const formData = {
                tutorId: document.getElementById('tutorSelect').value,
                rating: document.querySelector('input[name="rating"]:checked')?.value,
                feedback: document.getElementById('feedbackText').value
            };            // Validate form
            if (!formData.tutorId || !formData.rating || !formData.feedback) {
                showNotification('Please fill in all feedback fields', 'warning', 'fa-exclamation-circle');
                return;
            }

            // In a real application, this would be an API call
            console.log('Feedback submitted:', formData);
            showNotification('Feedback submitted successfully! Thank you for your input.', 'success', 'fa-star');
            
            // Close modal and reset form
            const modal = bootstrap.Modal.getInstance(document.getElementById('feedbackModal'));
            modal.hide();
            document.getElementById('feedbackForm').reset();
        });
    }    function acceptTutor(requestId, tutorId) {
        // In a real application, this would be an API call
        console.log(`Accepting tutor ${tutorId} for request ${requestId}`);
        showNotification('Tutor accepted successfully! You can now schedule a session.', 'success', 'fa-calendar-check');
        loadRequests(true);
    }
    
    function declineTutor(requestId, tutorId) {
        // In a real application, this would be an API call
        console.log(`Declining tutor ${tutorId} for request ${requestId}`);
        showNotification('Tutor response has been declined', 'info');
        loadRequests(true);
    }
    
    // Show a notification message
    function showNotification(message, type = 'success', icon = null) {
        // Determine icon based on notification type if not specified
        if (!icon) {
            switch(type) {
                case 'success':
                    icon = 'fa-check-circle';
                    break;
                case 'warning':
                    icon = 'fa-exclamation-triangle';
                    break;
                case 'danger':
                    icon = 'fa-exclamation-circle';
                    break;
                case 'info':
                    icon = 'fa-info-circle';
                    break;
                default:
                    icon = 'fa-bell';
            }
        }
        
        const notificationHTML = `
            <div class="notification alert alert-${type} alert-dismissible fade show" role="alert">
                <div class="d-flex align-items-center">
                    <div class="me-3">
                        <i class="fas ${icon} fa-lg"></i>
                    </div>
                    <div>
                        ${message}
                    </div>
                </div>
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
        
        // Create notification container if it doesn't exist
        let notificationContainer = document.querySelector('.notification-container');
        if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.className = 'notification-container position-fixed p-3';
            notificationContainer.style.zIndex = '1050';
            document.body.appendChild(notificationContainer);
        }
        
        // Add the notification
        notificationContainer.insertAdjacentHTML('beforeend', notificationHTML);
        
        // Add animation class
        const notification = notificationContainer.lastElementChild;
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 150);
        }, 5000);
        
        // Return the notification element in case we need to manipulate it further
        return notification;
    }

    // Initialize the dashboard
    initDashboard();
});