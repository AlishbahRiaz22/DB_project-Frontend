document.addEventListener('DOMContentLoaded', () => {
    // Mock data (in a real application, this would come from a backend)
    const tutorData = {
        name: 'John Doe',
        availability: true,
        stats: {
            activeRequests: 3,
            completedSessions: 14
        },
        courses: [
            { id: 'CS101', name: 'Introduction to Programming', proficiency: 9 },
            { id: 'CS201', name: 'Data Structures', proficiency: 7 },
            { id: 'MTH101', name: 'Calculus I', proficiency: 8 }
        ],
        openRequests: [
            {
                id: 1,
                studentName: 'Sarah Parker',
                studentId: 'SP123',
                course: 'CS101',
                courseName: 'Introduction to Programming',
                topic: 'Arrays and Loops',
                description: 'I need help understanding nested loops and multidimensional arrays.',
                date: '2025-05-10',
                time: '14:00',
                status: 'open',
                responded: false
            },
            {
                id: 2,
                studentName: 'Michael Brown',
                studentId: 'MB456',
                course: 'CS201',
                courseName: 'Data Structures',
                topic: 'Binary Trees',
                description: 'Having trouble with tree traversal algorithms.',
                date: '2025-05-12',
                time: '15:30',
                status: 'open',
                responded: false
            },
            {
                id: 3,
                studentName: 'Emily Davis',
                studentId: 'ED789',
                course: 'MTH101',
                courseName: 'Calculus I',
                topic: 'Derivatives',
                description: 'Need help with chain rule applications.',
                date: '2025-05-15',
                time: '10:00',
                status: 'open',
                responded: false
            }
        ],
        myResponses: [
            {
                id: 4,
                studentName: 'Alex Johnson',
                studentId: 'AJ234',
                course: 'CS101',
                courseName: 'Introduction to Programming',
                topic: 'Functions and Parameters',
                description: 'I need help understanding function callbacks.',
                date: '2025-05-08',
                time: '16:00',
                status: 'responded',
                responseDate: '2025-05-05'
            },
            {
                id: 5,
                studentName: 'Jessica Wilson',
                studentId: 'JW567',
                course: 'MTH101',
                courseName: 'Calculus I',
                topic: 'Integration Techniques',
                description: 'Struggling with integration by parts.',
                date: '2025-05-09',
                time: '11:30',
                status: 'responded',
                responseDate: '2025-05-06'
            }
        ],
        upcomingMeetings: [
            {
                id: 6,
                studentName: 'David Lee',
                studentId: 'DL345',
                course: 'CS201',
                courseName: 'Data Structures',
                topic: 'Hash Tables',
                description: 'Need help implementing collision resolution strategies.',
                date: '2025-05-11',
                time: '13:00',
                status: 'confirmed',
                location: 'Library Study Room 3'
            },
            {
                id: 7,
                studentName: 'Sophia Martinez',
                studentId: 'SM678',
                course: 'CS101',
                courseName: 'Introduction to Programming',
                topic: 'Object-Oriented Programming',
                description: 'Confused about inheritance and polymorphism.',
                date: '2025-05-13',
                time: '14:30',
                status: 'confirmed',
                location: 'Online (Zoom)'
            }
        ],
        allMeetings: [
            {
                id: 6,
                studentName: 'David Lee',
                studentId: 'DL345',
                course: 'CS201',
                courseName: 'Data Structures',
                topic: 'Hash Tables',
                date: '2025-05-11',
                time: '13:00',
                status: 'upcoming'
            },
            {
                id: 7,
                studentName: 'Sophia Martinez',
                studentId: 'SM678',
                course: 'CS101',
                courseName: 'Introduction to Programming',
                topic: 'Object-Oriented Programming',
                date: '2025-05-13',
                time: '14:30',
                status: 'upcoming'
            },
            {
                id: 8,
                studentName: 'Ryan Taylor',
                studentId: 'RT901',
                course: 'MTH101',
                courseName: 'Calculus I',
                topic: 'Limits',
                date: '2025-05-02',
                time: '15:00',
                status: 'completed'
            },
            {
                id: 9,
                studentName: 'Olivia Rodriguez',
                studentId: 'OR234',
                course: 'CS101',
                courseName: 'Introduction to Programming',
                topic: 'Basic Algorithms',
                date: '2025-05-05',
                time: '11:00',
                status: 'completed'
            },
            {
                id: 10,
                studentName: 'Ethan Wilson',
                studentId: 'EW567',
                course: 'CS201',
                courseName: 'Data Structures',
                topic: 'Linked Lists',
                date: '2025-05-07',
                time: '16:30',
                status: 'canceled'
            }
        ]
    };    // Initialize the dashboard
    function initDashboard() {
        // Set user name and stats
        document.getElementById('tutorName').textContent = tutorData.name;
        document.getElementById('activeRequestsCount').textContent = tutorData.stats.activeRequests;
        document.getElementById('completedSessionsCount').textContent = tutorData.stats.completedSessions;

        // Load data for all tabs
        loadOpenRequests();
        loadMyResponses();
        loadUpcomingMeetings();
        
        // Set up event listeners
        setupEventListeners();
    }    // Load user data if available
    function checkUserAuthAndType() {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            // Update tutor data with actual user data
            tutorData.name = user.name;
            
            // If user has tutor courses, update the courses array
            if (user.courses && Array.isArray(user.courses) && user.courses.length > 0) {
                tutorData.courses = user.courses.map(course => ({
                    id: course.courseId,
                    name: getCourseNameById(course.courseId),
                    proficiency: course.proficiency
                }));
            }
        }
        // In a real app, we would fetch more tutor-specific data here
    }    // Availability status function removed

    // Load open tutoring requests
    function loadOpenRequests() {
        const openRequestsList = document.getElementById('openRequestsList');
        
        // Filter requests based on tutor courses
        const matchingRequests = tutorData.openRequests.filter(request => 
            tutorData.courses.some(course => course.id === request.course)
        );

        if (matchingRequests.length === 0) {
            openRequestsList.innerHTML = '<div class="alert alert-info">No matching requests found for your courses.</div>';
            return;
        }

        openRequestsList.innerHTML = matchingRequests.map(request => `
            <div class="request-card card mb-3">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-top mb-2">
                        <h5 class="card-title">${request.course} - ${request.topic}</h5>
                        <span class="badge bg-primary">${formatDateTime(request.date, request.time)}</span>
                    </div>
                    <h6 class="card-subtitle mb-2 text-muted">Student: ${request.studentName}</h6>
                    <p class="card-text">${request.description}</p>
                    <div class="d-flex justify-content-end">
                        <button class="btn btn-outline-secondary me-2 view-details-btn" data-request-id="${request.id}">
                            View Details
                        </button>
                        <button class="btn btn-primary respond-btn" data-request-id="${request.id}">
                            Respond to Request
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Add event listeners to the respond buttons
        document.querySelectorAll('.respond-btn').forEach(btn => {
            btn.addEventListener('click', () => respondToRequest(btn.dataset.requestId));
        });
        
        // Add event listeners to the view details buttons
        document.querySelectorAll('.view-details-btn').forEach(btn => {
            btn.addEventListener('click', () => viewRequestDetails(btn.dataset.requestId));
        });
    }

    // Load my responses
    function loadMyResponses() {
        const myResponsesList = document.getElementById('myResponsesList');
        
        if (tutorData.myResponses.length === 0) {
            myResponsesList.innerHTML = '<div class="alert alert-info">You haven\'t responded to any requests yet.</div>';
            return;
        }

        myResponsesList.innerHTML = tutorData.myResponses.map(response => `
            <div class="response-card card mb-3">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-top mb-2">
                        <h5 class="card-title">${response.course} - ${response.topic}</h5>
                        <span class="badge bg-secondary">Responded on ${response.responseDate}</span>
                    </div>
                    <h6 class="card-subtitle mb-2 text-muted">Student: ${response.studentName}</h6>
                    <p class="card-text">${response.description}</p>
                    <p class="card-text">
                        <small class="text-muted">
                            Waiting for student to accept or decline your response.
                        </small>
                    </p>
                </div>
            </div>
        `).join('');
    }

    // Load upcoming meetings
    function loadUpcomingMeetings() {
        const upcomingMeetingsList = document.getElementById('upcomingMeetingsList');
        
        if (tutorData.upcomingMeetings.length === 0) {
            upcomingMeetingsList.innerHTML = '<div class="alert alert-info">You don\'t have any upcoming meetings.</div>';
            return;
        }

        upcomingMeetingsList.innerHTML = tutorData.upcomingMeetings.map(meeting => `
            <div class="meeting-card card mb-3">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-top mb-2">
                        <h5 class="card-title">${meeting.course} - ${meeting.topic}</h5>
                        <span class="badge bg-success">${formatDateTime(meeting.date, meeting.time)}</span>
                    </div>
                    <h6 class="card-subtitle mb-2 text-muted">Student: ${meeting.studentName}</h6>
                    <p class="card-text">${meeting.description}</p>
                    <p class="card-text">
                        <i class="fas fa-map-marker-alt"></i> Location: ${meeting.location}
                    </p>
                    <div class="d-flex justify-content-end">
                        <button class="btn btn-outline-secondary me-2 view-details-btn" data-meeting-id="${meeting.id}">
                            View Details
                        </button>
                        <button class="btn btn-danger cancel-meeting-btn" data-meeting-id="${meeting.id}">
                            Cancel Meeting
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Add event listeners to the meeting action buttons
        document.querySelectorAll('.view-details-btn').forEach(btn => {
            btn.addEventListener('click', () => viewMeetingDetails(btn.dataset.meetingId));
        });
        
        document.querySelectorAll('.cancel-meeting-btn').forEach(btn => {
            btn.addEventListener('click', () => cancelMeeting(btn.dataset.meetingId));
        });
    }

    // Load all meetings    // All Meetings section removed// Respond to a tutoring request
    function respondToRequest(requestId) {
        const request = tutorData.openRequests.find(req => req.id.toString() === requestId);
        if (!request) return;

        // Create a Bootstrap modal for tutor response
        const modalHTML = `
            <div class="modal fade" id="respondModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Respond to Request</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <p><strong>Student:</strong> ${request.studentName}</p>
                            <p><strong>Course:</strong> ${request.course} - ${request.courseName}</p>
                            <p><strong>Topic:</strong> ${request.topic}</p>
                            <p><strong>Scheduled for:</strong> ${request.date} at ${request.time}</p>
                            <p><strong>Description:</strong> ${request.description}</p>
                            
                            <div class="form-group mt-3">
                                <label for="responseMessage" class="form-label">Your Response (optional)</label>
                                <textarea class="form-control" id="responseMessage" rows="3" 
                                    placeholder="Add any details or questions for the student..."></textarea>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" id="submitResponse">Submit Response</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove any existing modal
        const existingModal = document.getElementById('respondModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add the modal to the document
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Initialize and show the modal
        const respondModal = new bootstrap.Modal(document.getElementById('respondModal'));
        respondModal.show();
        
        // Add event listener for the submit button
        document.getElementById('submitResponse').addEventListener('click', () => {
            const responseMessage = document.getElementById('responseMessage').value;
            
            // Update the request status
            request.status = 'responded';
            request.responded = true;
            
            // Add to my responses
            tutorData.myResponses.push({
                ...request,
                responseDate: new Date().toISOString().split('T')[0],
                responseMessage: responseMessage
            });
            
            // Remove from open requests
            tutorData.openRequests = tutorData.openRequests.filter(req => req.id !== request.id);
            
            // Update stats
            tutorData.stats.activeRequests++;
            
            // Hide the modal
            respondModal.hide();
            
            // Show success message
            showNotification(`You've responded to ${request.studentName}'s request for ${request.course} - ${request.topic}.`);
            
            // Reload the requests lists
            loadOpenRequests();
            loadMyResponses();
        });
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

    // View request details
    function viewRequestDetails(requestId) {
        const request = tutorData.openRequests.find(req => req.id.toString() === requestId) || 
                        tutorData.myResponses.find(res => res.id.toString() === requestId);
        
        if (!request) return;
        
        // In a real app, this would show a modal with details
        alert(`
            Course: ${request.course} - ${request.courseName}
            Topic: ${request.topic}
            Student: ${request.studentName} (${request.studentId})
            Date & Time: ${request.date} at ${request.time}
            Description: ${request.description}
        `);
    }

    // View meeting details
    function viewMeetingDetails(meetingId) {
        const meeting = [...tutorData.upcomingMeetings, ...tutorData.allMeetings]
                        .find(m => m.id.toString() === meetingId);
        
        if (!meeting) return;

        // In a real app, this would show a modal with details
        alert(`
            Course: ${meeting.course} - ${meeting.courseName || ''}
            Topic: ${meeting.topic}
            Student: ${meeting.studentName} (${meeting.studentId})
            Date & Time: ${meeting.date} at ${meeting.time}
            Status: ${capitalizeFirstLetter(meeting.status)}
            ${meeting.location ? 'Location: ' + meeting.location : ''}
        `);
    }

    // Cancel a meeting
    function cancelMeeting(meetingId) {
        const confirmed = confirm("Are you sure you want to cancel this meeting?");
        if (!confirmed) return;

        // Update the meeting status in both arrays
        const upcomingMeeting = tutorData.upcomingMeetings.find(m => m.id.toString() === meetingId);
        const allMeeting = tutorData.allMeetings.find(m => m.id.toString() === meetingId);
        
        if (upcomingMeeting) {
            tutorData.upcomingMeetings = tutorData.upcomingMeetings.filter(m => m.id.toString() !== meetingId);
        }
        
        if (allMeeting) {
            allMeeting.status = 'canceled';
        }

        alert("Meeting has been canceled.");
        
        // Reload meeting lists
        loadUpcomingMeetings();
        loadAllMeetings();    }    // Setup event listeners
    function setupEventListeners() {

        // Search requests
        document.getElementById('searchRequestsBtn').addEventListener('click', () => {
            const searchTerm = document.getElementById('requestSearchInput').value.toLowerCase();
            if (!searchTerm) {
                loadOpenRequests();
                return;
            }

            const openRequestsList = document.getElementById('openRequestsList');
            const filteredRequests = tutorData.openRequests.filter(request => 
                request.course.toLowerCase().includes(searchTerm) ||
                request.topic.toLowerCase().includes(searchTerm) ||
                request.description.toLowerCase().includes(searchTerm)
            );

            if (filteredRequests.length === 0) {
                openRequestsList.innerHTML = '<div class="alert alert-info">No requests match your search.</div>';
                return;
            }

            // Reuse the same rendering function but with filtered data
            openRequestsList.innerHTML = filteredRequests.map(request => `
                <div class="request-card card mb-3">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-top mb-2">
                            <h5 class="card-title">${request.course} - ${request.topic}</h5>
                            <span class="badge bg-primary">${formatDateTime(request.date, request.time)}</span>
                        </div>
                        <h6 class="card-subtitle mb-2 text-muted">Student: ${request.studentName}</h6>
                        <p class="card-text">${request.description}</p>
                        <div class="d-flex justify-content-end">
                            <button class="btn btn-outline-secondary me-2 view-details-btn" data-request-id="${request.id}">
                                View Details
                            </button>
                            <button class="btn btn-primary respond-btn" data-request-id="${request.id}">
                                Respond to Request
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');

            // Re-add event listeners
            document.querySelectorAll('.respond-btn').forEach(btn => {
                btn.addEventListener('click', () => respondToRequest(btn.dataset.requestId));
            });
            
            document.querySelectorAll('.view-details-btn').forEach(btn => {
                btn.addEventListener('click', () => viewRequestDetails(btn.dataset.requestId));
            });
        });

        // Search on enter key
        document.getElementById('requestSearchInput').addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('searchRequestsBtn').click();
            }
        });        // Tab switching to update content
        document.querySelectorAll('#tutorTabs a[data-bs-toggle="tab"]').forEach(tab => {
            tab.addEventListener('shown.bs.tab', (e) => {
                const targetId = e.target.getAttribute('href');
                
                if (targetId === '#openRequests') {
                    loadOpenRequests();
                } else if (targetId === '#myResponses') {
                    loadMyResponses();
                } else if (targetId === '#upcomingMeetings') {
                    loadUpcomingMeetings();
                }
            });
        });
    }

    // Helper function to format date and time
    function formatDateTime(date, time) {
        return `${date} at ${time}`;
    }

    // Helper function to get row class based on status
    function getRowClass(status) {
        switch(status) {
            case 'completed': return 'table-success';
            case 'upcoming': return '';
            case 'canceled': return 'table-danger';
            default: return '';
        }
    }

    // Helper function to get badge class based on status
    function getStatusBadgeClass(status) {
        switch(status) {
            case 'completed': return 'bg-success';
            case 'upcoming': return 'bg-primary';
            case 'canceled': return 'bg-danger';
            default: return 'bg-secondary';
        }
    }    // Helper function to capitalize first letter
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    // Helper function to get course name by ID
    function getCourseNameById(courseId) {
        const courseMap = {
            'CS101': 'Introduction to Programming',
            'CS201': 'Data Structures',
            'CS301': 'Database Systems',
            'MTH101': 'Calculus I',
            'MTH201': 'Linear Algebra',
            'PHY101': 'Physics I',
            'ENG101': 'English Composition'
        };
        
        return courseMap[courseId] || courseId;
    }

    // Initialize the dashboard
    initDashboard();
});
