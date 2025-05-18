
ipali = '10.7.241.116'
// Global variables

let currentTutor = null;
const API_BASE_URL = "https://api.educonnect.com/v1"; // Replace with your actual API base URL

// Document ready function
document.addEventListener("DOMContentLoaded", function() {
    // Initialize the dashboard
    initializeDashboard();
    
    // Add event listeners
    document.getElementById("searchRequestsBtn").addEventListener("click", searchRequests);
    document.getElementById("requestSearchInput").addEventListener("keyup", function(event) {
        if (event.key === "Enter") {
            searchRequests();
        }
    });
    
    // Initialize tabs functionality
    document.querySelectorAll('#tutorTabs .nav-link').forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            
            // Hide all tab panes
            document.querySelectorAll('.tab-pane').forEach(pane => {
                pane.classList.remove('show', 'active');
            });
            
            // Show the target tab pane
            document.getElementById(targetId).classList.add('show', 'active');
            
            // Update active tab
            document.querySelectorAll('#tutorTabs .nav-link').forEach(link => {
                link.classList.remove('active');
            });
            this.classList.add('active');
            
            // Reload data for the selected tab
            if (targetId === 'openRequests') {
                loadOpenRequests();
            } else if (targetId === 'myResponses') {
                loadMyResponses();
            } else if (targetId === 'upcomingMeetings') {
                loadUpcomingMeetings();
            }
        });
    });

});

// Initialize the dashboard
async function initializeDashboard() {
    try {
        // Get current tutor information
        await getCurrentTutor();
        
        // Load initial data
        loadOpenRequests();
        loadMyResponses();
        loadUpcomingMeetings();
        updateStatistics();

    } catch (error) {
        showError("Error initializing dashboard: " + error.message);
    }
}

// Get current tutor information
async function getCurrentTutor() {
    try {
        // fetching the cms id of the logged in user
        const cmsId = localStorage.getItem('cmsId');
        // converting the cms to json
        const parsedCmsId = JSON.parse(cmsId);
        const response = await fetch(`http://${ipali}:8077/api/students/name/${parsedCmsId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        currentTutor = await response.json();
        console.log(currentTutor)
        document.getElementById("tutorName").textContent = currentTutor.name || "Tutor";
        return currentTutor;
    } catch (error) {
        console.error("Error fetching tutor data:", error);
        // Fallback to session storage or localStorage if available
        const storedTutor = sessionStorage.getItem('currentTutor');
        if (storedTutor) {
            currentTutor = JSON.parse(storedTutor);
            document.getElementById("tutorName").textContent = currentTutor.firstName || "Tutor";
        }
    }
}

// Load open tutoring requests
async function loadOpenRequests() {
    const container = document.getElementById("openRequestsList");
    container.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div></div>';
    
    cms = window.localStorage.getItem('cmsId');
    cmsId = JSON.parse(cms);
    

    try {
        const response = await fetch(`http://${ipali}:8077/api/requests/tutorCmsId/${cmsId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const requests = await response.json();
        renderOpenRequests(requests);
    } catch (error) {
        container.innerHTML = `<div class="alert alert-danger">Error loading requests: ${error.message}</div>`;
    }
}

// Render open tutoring requests
function renderOpenRequests(requests) {
    const container = document.getElementById("openRequestsList");
    
    if (requests.length === 0) {
        container.innerHTML = '<div class="alert alert-info">No open tutoring requests available.</div>';
        return;
    }
    let countactiveRequests = 0;
    let html = '';
    requests.forEach(request => {
        countactiveRequests++;
        html += `
    <div class="card mb-3 request-card animate__animated animate__fadeIn">
        <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
                <div>
                    <h5 class="card-title">${escapeHtml(request.courseCode)} - ${escapeHtml(request.courseName)}</h5>
                </div>
                <span class="badge ${getStatusBadgeClass(request.status)}">${escapeHtml(request.status)}</span>
            </div>
            <p class="card-text">${escapeHtml(request.description)}</p>
            <div class="d-flex justify-content-between align-items-center">
                <div class="text-muted">
                    <small>
                        Posted by: <b>${escapeHtml(request.studentName)}</b> · Preferred Time: ${formatDate(request.preferredTime)}
                    </small>
                </div>
                <button class="btn btn-primary btn-sm respond-btn" data-request-id="${request.requestId}">
                    Respond
                </button>
            </div>
        </div>
    </div>
`;

    });
    
    
    container.innerHTML = html;
    document.getElementById("activeRequestsCount").textContent = countactiveRequests || 0;
    
    // Add event listeners to respond buttons
document.querySelectorAll('.respond-btn').forEach(button => {
    button.addEventListener('click', function () {
        const requestId = this.getAttribute('data-request-id');

        // Log the requestId for debugging
        console.log("Selected requestId:", requestId);

        // Find the request with the matching ID
        const request = requests.find(req => String(req.requestId) === String(requestId));

        if (request) {
            respondToRequest(request);
        } else {
            console.error("Request not found for ID:", requestId);
            showError("Unable to find the corresponding request.");
        }
    });
});

}
// respond to a tutoring request
function respondToRequest(request) {
    console.log(request);

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
                        <p><strong>Course:</strong> ${request.courseCode} - ${request.courseName}</p>
                        <p><strong>Scheduled for:</strong> ${formatDate(request.preferredTime)} at ${formatTime(request.preferredTime)}</p>
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

    const existingModal = document.getElementById('respondModal');
    if (existingModal) {
        existingModal.remove();
    }

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const respondModal = new bootstrap.Modal(document.getElementById('respondModal'));
    respondModal.show();

    document.getElementById('submitResponse').addEventListener('click', async () => {
        const responseMessage = document.getElementById('responseMessage').value;
        const cmsId = JSON.parse(window.localStorage.getItem('cmsId'));
        const responseData = {
            requestId: request.requestId,
            cmsId: cmsId,
            message: responseMessage
        };

        console.log("Response Data:", responseData);

        try {
            const response = await fetch(`http://${ipali}:8077/api/requests/respond`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`
                },
                body: JSON.stringify(responseData)
            });

            if (!response.ok) {
                throw new Error(`Server responded with status ${response.status}`);
            }

            respondModal.hide();

            showSuccess(`You've responded to ${request.studentName}'s request for ${request.courseCode} - ${request.courseName}.`);

            loadOpenRequests();
            loadMyResponses();

        } catch (error) {
            showError("Failed to submit response: " + error.message);
        }
    });
}


// Load tutor's responses
async function loadMyResponses() {
    const container = document.getElementById("myResponsesList");
    container.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div></div>';
    cmsId = window.localStorage.getItem('cmsId');
    parseCmsId = JSON.parse(cmsId);
    
    try {
        const response = await fetch(`http://${ipali}:8077/api/requests/tutorResponses/${parseCmsId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const responses = await response.json();
        console.log(responses)
        renderMyResponses(responses);
    } catch (error) {
        container.innerHTML = `<div class="alert alert-danger">Error loading responses: ${error.message}</div>`;
    }
}

// Render tutor's responses
function renderMyResponses(responses) {
    const container = document.getElementById("myResponsesList");
    
    if (responses.length === 0) {
        container.innerHTML = '<div class="alert alert-info">You haven\'t responded to any tutoring requests yet.</div>';
        return;
    }
    
    let html = '';
    responses.forEach(response => {
        html += `
            <div class="card mb-3 response-card animate__animated animate__fadeIn">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h5 class="card-title">${escapeHtml(response.courseCode)} - ${escapeHtml(response.courseName)} </h5>
                            <h6 class="card-subtitle mb-2 text-muted">${escapeHtml(response.requestDescription)}</h6>
                        </div>
                        <span class="badge ${getStatusBadgeClass(response.responseStatus)}">${escapeHtml(response.responseStatus)}</span>
                    </div>
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="text-muted">
                            <small>Student: ${escapeHtml(response.studentName)}</small>
                        </div>
                        <div>
                                <button class="btn btn-outline-danger btn-sm cancel-response-btn" data-response-id="${response.responseId}">Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    
    document.querySelectorAll('.cancel-response-btn').forEach(button => {
        button.addEventListener('click', function() {
            const responseId = this.getAttribute('data-response-id');
            cancelResponse(responseId);
        });
    });
}

// Load upcoming meetings
async function loadUpcomingMeetings() {
    const container = document.getElementById("upcomingMeetingsList");
    container.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div></div>';
    cms = window.localStorage.getItem('cmsId');
    cmsId = JSON.parse(cms);
    
    try {
        const response = await fetch(`http://${ipali}:8077/api/meetings/tutor/${cmsId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const meetings = await response.json();
        console.log("meetings", meetings)   
        renderUpcomingMeetings(meetings);
    } catch (error) {
        container.innerHTML = `<div class="alert alert-danger">Error loading meetings: ${error.message}</div>`;
    }
}

// Render upcoming meetings
function renderUpcomingMeetings(meetings) {
    const container = document.getElementById("upcomingMeetingsList");

    if (meetings.length === 0) {
        container.innerHTML = '<div class="alert alert-info">No upcoming meetings scheduled.</div>';
        return;
    }

    let html = '';
    meetings.forEach(meeting => {
        const meetingDate = new Date(meeting.scheduledTime);
        const isToday = isDateToday(meetingDate);

        html += `
            <div class="card mb-3 meeting-card ${isToday ? 'border-primary' : ''} animate__animated animate__fadeIn">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h5 class="card-title">${escapeHtml(meeting.courseCode)} - ${escapeHtml(meeting.courseName)}</h5>
                            <h6 class="card-subtitle mb-2 text-muted">Scheduled tutoring session</h6>
                        </div>
                        ${isToday ? '<span class="badge bg-primary">Today</span>' : ''}
                    </div>
                    <div class="mt-3">
                        <div class="meeting-info">
                            <i class="far fa-calendar-alt"></i> ${formatDate(meeting.scheduledTime)}
                        </div>
                        <div class="meeting-info">
                            <i class="far fa-clock"></i> ${formatTime(meeting.scheduledTime)}
                        </div>
                        <div class="meeting-info">
                            <i class="far fa-user"></i> With ${escapeHtml(meeting.name)}
                        </div>
                        <div class="meeting-info">
                            <i class="fas fa-phone"></i> ${escapeHtml(meeting.studentPhone)}
                        </div>
                    </div>
                    <div class="d-flex justify-content-end mt-3">
                        <button class="btn btn-outline-secondary btn-sm me-2 meeting-details-btn" data-meeting-id="${meeting.id || ''}">Details</button>
                        ${meeting.joinUrl ? `<a href="${meeting.joinUrl}" class="btn btn-success btn-sm" target="_blank">Join Meeting</a>` : ''}
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;

    // Add event listeners to details buttons
    document.querySelectorAll('.meeting-details-btn').forEach(button => {
        button.addEventListener('click', function () {
            const meetingId = this.getAttribute('data-meeting-id');
            if (meetingId) showMeetingDetails(meetingId);
        });
    });
}


// Show meeting details
async function showMeetingDetails(meetingId) {
    const modalBody = document.getElementById("meetingDetailsContent");
    modalBody.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div></div>';
    
    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById("meetingDetailsModal"));
    modal.show();
    
    try {
        const response = await fetch(`${API_BASE_URL}/tutoring/meetings/${meetingId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const meeting = await response.json();
        
        let html = `
            <div class="meeting-details">
                <h4>${escapeHtml(meeting.title)}</h4>
                <p class="text-muted">${escapeHtml(meeting.course)} - ${escapeHtml(meeting.topic)}</p>
                
                <div class="meeting-detail-item">
                    <strong>Date:</strong> ${formatDate(meeting.scheduledTime)}
                </div>
                <div class="meeting-detail-item">
                    <strong>Time:</strong> ${formatTime(meeting.scheduledTime)} (${meeting.duration} minutes)
                </div>
                <div class="meeting-detail-item">
                    <strong>Student:</strong> ${escapeHtml(meeting.studentName)}
                </div>
                <div class="meeting-detail-item">
                    <strong>Meeting Method:</strong> ${escapeHtml(meeting.meetingMethod)}
                </div>
                ${meeting.location ? `
                <div class="meeting-detail-item">
                    <strong>Location:</strong> ${escapeHtml(meeting.location)}
                </div>` : ''}
                <div class="meeting-detail-item">
                    <strong>Status:</strong> <span class="badge ${getStatusBadgeClass(meeting.status)}">${escapeHtml(meeting.status)}</span>
                </div>
                ${meeting.notes ? `
                <div class="meeting-detail-item mt-3">
                    <strong>Notes:</strong>
                    <p>${escapeHtml(meeting.notes)}</p>
                </div>` : ''}
                
                ${meeting.joinUrl ? `
                <div class="mt-4 text-center">
                    <a href="${meeting.joinUrl}" class="btn btn-success" target="_blank">Join Meeting</a>
                </div>` : ''}
            </div>
        `;
        
        modalBody.innerHTML = html;
    } catch (error) {
        modalBody.innerHTML = `<div class="alert alert-danger">Error loading meeting details: ${error.message}</div>`;
    }
}

// Update dashboard statistics
async function updateStatistics() {
    try {
        cms = window.localStorage.getItem('cmsId');
        cmsId = JSON.parse(cms);
        // completed session count
        const response = await fetch(`http://${ipali}:8077/api/meetings/completed/count/student/${cmsId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const stats = await response.json();
        
        document.getElementById("completedSessionsCount").textContent = stats || 0;
    } catch (error) {
        console.error("Error updating statistics:", error);
    }
}

// Search tutoring requests
async function searchRequests() {
    const searchTerm = document.getElementById("requestSearchInput").value.trim();
    
    const container = document.getElementById("openRequestsList");
    container.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div></div>';
    
    try {
        const response = await fetch(`${API_BASE_URL}/tutoring/requests/search?query=${encodeURIComponent(searchTerm)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const requests = await response.json();
        renderOpenRequests(requests);
    } catch (error) {
        container.innerHTML = `<div class="alert alert-danger">Error searching requests: ${error.message}</div>`;
    }
}

// Cancel a response to a request
async function cancelResponse(responseId) {
    if (!confirm("Are you sure you want to cancel this response?")) {
        return;
    }

    cms = window.localStorage.getItem('cmsId');
    cmsId = JSON.parse(cms);

    try {
        const response = await fetch(`http://${ipali}:8077/api/requests/deleteResponse/${cmsId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ responseId: responseId })  // Send responseId in the request body
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        loadMyResponses();
        showSuccess("Response cancelled successfully.");
    } catch (error) {
        showError("Error cancelling response: " + error.message);
    }
}


// Helper Functions

// Get authentication token from localStorage
function getAuthToken() {
    return localStorage.getItem('authToken') || '';
}

// Format date for display
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Format time for display
function formatTime(dateString) {
    const options = { hour: 'numeric', minute: '2-digit', hour12: true };
    return new Date(dateString).toLocaleTimeString(undefined, options);
}

// Check if a date is today
function isDateToday(date) {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
}

// Get CSS class for status badge
function getStatusBadgeClass(status) {
    switch (status.toLowerCase()) {
        case 'accepted':
        case 'completed':
            return 'bg-success';
        case 'pending':
            return 'bg-warning text-dark';
        case 'cancelled':
        case 'rejected':
            return 'bg-danger';
        default:
            return 'bg-secondary';
    }
}

// Show success message
function showSuccess(message) {
    // Create toast notification
    const toastId = 'toast-' + Date.now();
    const toastHtml = `
        <div id="${toastId}" class="toast align-items-center text-white bg-success border-0" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;
    
    // Add toast to container (create if it doesn't exist)
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }
    
    toastContainer.insertAdjacentHTML('beforeend', toastHtml);
    
    // Show the toast
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, { autohide: true, delay: 3000 });
    toast.show();
}

// Show error message
function showError(message) {
    // Create toast notification
    const toastId = 'toast-' + Date.now();
    const toastHtml = `
        <div id="${toastId}" class="toast align-items-center text-white bg-danger border-0" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;
    
    // Add toast to container (create if it doesn't exist)
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }
    
    toastContainer.insertAdjacentHTML('beforeend', toastHtml);
    
    // Show the toast
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, { autohide: true, delay: 5000 });
    toast.show();
}

// Escape HTML to prevent XSS
function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}