ipali = "10.7.241.116";

document.addEventListener("DOMContentLoaded", () => {
  // Set current mode for profile page session display
  localStorage.setItem("currentMode", "student");

  // Get user data from localStorage
  const storedUser = JSON.parse(localStorage.getItem("user")) || {};
  const cmsId = storedUser.cmsId || localStorage.getItem("cmsId");

  if (!cmsId) {
    console.error("No CMS ID found. Please login again.");
    // Redirect to login page if no CMS ID is found
    window.location.href = "../index.html";
    return;
  }

  // Initialize the dashboard
  function initDashboard() {
    // Fetch student name
    fetchStudentName();

    // Always show switch profile button, but logic will determine if user becomes tutor or goes to tutor dashboard
    const switchProfileBtn = document.getElementById("switchProfileBtn");
    switchProfileBtn.classList.remove("d-none");

    // Load course options
    loadCourseOptions();

    // Load recent requests
    loadRequests(true);

    // load meetings
    loadscheduledmeetings();

    // Add event listeners
    setupEventListeners();
  }

  function fetchStudentName() {
    console.log("Fetching student name for CMS ID:", cmsId);
    fetch(`http://${ipali}:8077/api/students/name/${cmsId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Student data:", data);
        // Update the student name in the welcome message
        document.getElementById("studentName").textContent =
          data.name || "Student";
      })
      .catch((error) => {
        console.error("There was a problem fetching student name:", error);
        document.getElementById("studentName").textContent = "Student";
      });
  }

  function loadCourseOptions() {
    const courseSelect = document.getElementById("requestCourse");
    courseSelect.innerHTML = '<option value="">Select Course</option>';

    fetch(`http://${ipali}:8077/api/courses`)
      .then((response) => {
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
      })
      .then((courses) => {
        console.log("Courses:", courses);
        courses.forEach((course) => {
          const option = document.createElement("option");
          option.value = course.id;
          option.textContent = `${course.courseCode} - ${course.courseName}`;
          courseSelect.appendChild(option);
        });
      })
      .catch((error) => {
        console.error("Error fetching courses:", error);
        showNotification(
          "Failed to load courses. Please try again later.",
          "danger",
          "fa-exclamation-circle"
        );
      });
  }

  function loadRequests(recentOnly = false) {
    const requestsList = document.getElementById("requestsList");
    requestsList.innerHTML =
      '<div class="text-center"><div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div></div>';

    fetch(`http://${ipali}:8077/api/requests/student/${cmsId}`)
      .then((response) => {
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
      })
      .then((requests) => {
        if (requests.length === 0) {
          requestsList.innerHTML =
            '<p class="text-center">No tutoring requests found. Create your first request!</p>';
          return;
        }

        // Sort requests by date (newest first)
        requests.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Apply limit if recentOnly is true
        const displayRequests = recentOnly ? requests.slice(0, 5) : requests;

        requestsList.innerHTML = displayRequests
          .map((request) => {
            console.log("Request:", request);
            const [date, time] = request.preferredTime.split("T"); // "2025-05-15", "14:00:00"
            const formattedDate = formatDate(date);
            const formattedTime = time.slice(0, 5); // "14:00"

            return `
      <div class="request-card card mb-3">
        <div class="card-body">
          <h6 class="card-title d-flex justify-content-between">
            <span>${request.courseCode} - ${request.courseName}</span>
            <span class="badge ${request.status === "OPEN"
                ? "bg-warning"
                : request.status === "ACCEPTED"
                  ? "bg-success"
                  : "bg-secondary"
              }">${request.status}</span>
          </h6>
          <p class="card-text">
            <small class="text-muted">
              Scheduled for: ${formattedDate} at ${formattedTime}
            </small>
          </p>
          ${renderTutorResponses(request)}
        </div>
      </div>
    `;
          })
          .join("");

        // Add event listeners for accept/decline buttons
        document.querySelectorAll(".accept-tutor").forEach((btn) => {
          btn.addEventListener("click", (e) =>
            acceptTutor(
              e.target.dataset.requestId,
              e.target.dataset.responseId,
              e.target.dataset.prefferedTime,
              e.target.dataset.meetingType
            )
          );
        });

        document.querySelectorAll(".decline-tutor").forEach((btn) => {
          btn.addEventListener("click", (e) =>
            declineTutor(e.target.dataset.responseId)
          );
        });

        // Add event listeners for complete request buttons
        document.querySelectorAll(".complete-request-btn").forEach((btn) => {
          btn.addEventListener("click", (e) => {
            const meetingId = btn.getAttribute("data-meeting-id");
              console.log("Meeting ID:", meetingId);
            showSessionFeedbackModal(meetingId);
          });
        });
      })
      .catch((error) => {
        console.error("Error fetching requests:", error);
        requestsList.innerHTML =
          '<p class="text-center text-danger"><i class="fas fa-exclamation-circle"></i> Failed to load tutoring requests. Please try again later.</p>';
      });
  }

  function formatDate(dateString) {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function renderTutorResponses(request) {
    console.log("request id: ", request.requestId);

    // Only handle OPEN status
    if (request.status === "OPEN") {
      if (!request.responses || request.responses.length === 0) {
        return '<p class="card-text"><small>No tutor responses yet</small></p>';
      }

      return `
      <div class="tutor-responses">
        <small>Tutor Responses:</small>
        ${request.responses
          .map(
            (tutor) => `
            <div 
              class="tutor-response d-flex justify-content-between align-items-center mt-2"
              data-response-id="${tutor.responseId}"
              data-request-id="${request.requestId}"
              data-tutor-name="${tutor.responderName}"
            >
              <span>${tutor.responderName} (Rating: ${tutor.responderPopularityPoint || "New"
              }⭐)</span>
              <div class="btn-group btn-group-sm">
                <button class="btn btn-success accept-tutor"
                        data-request-id="${request.requestId}"
                        data-response-id="${tutor.responseId}"
                        data-tutor-name="${tutor.responderName}"
                        data-preffered-time="${request.preferredTime}"
                        data-meeting-type="${request.meetingType}"> 
                  Accept
                </button>
                <button class="btn btn-danger decline-tutor"
                        data-request-id="${request.requestId}"
                        data-response-id="${tutor.responseId}"
                        data-tutor-name="${tutor.responderName}"
                        data-preffered-time="${request.preferredTime}"
                        data-meeting-type="${request.meetingType}">
                  Decline
                </button>
              </div>
            </div>
          `
          )
          .join("")}
      </div>
    `;
    }

    // Do not render anything for non-OPEN statuses
    return "";
  }

  function setupEventListeners() {
    // Switch to Tutor button functionality
    document
      .getElementById("switchToTutorBtn")
      .addEventListener("click", (e) => {
        e.preventDefault();

        // Check if user is already a tutor
        fetch(`http://${ipali}:8077/api/students/istutor/${cmsId}`)
          .then((response) => response.json())
          .then((data) => {
            console.log("Tutor status:", data);
            if (data.isTutor) {
              // If already a tutor, redirect directly to tutor dashboard
              window.location.href = "tutor-dashboard.html";
            } else {
              // If not a tutor, show the "Become a Tutor" modal
              const becomeATutorModal = new bootstrap.Modal(
                document.getElementById("becomeATutorModal")
              );

              // Populate course selection
              populateTutorCourseSelection();

              becomeATutorModal.show();
            }
          })
          .catch((error) => {
            console.error("Error checking tutor status:", error);
            showNotification(
              "Could not verify tutor status. Please try again.",
              "danger"
            );
          });
      });

    // Process tutor application
    document
      .getElementById("submitTutorApplication")
      .addEventListener("click", () => {
        const bio = document.getElementById("tutorBio").value;
        const isAgreed = document.getElementById("agreementCheck").checked;

        // Check if form is complete
        if (!isAgreed) {
          showNotification(
            "Please complete all fields and agree to the terms",
            "warning",
            "fa-exclamation-circle"
          );
          return;
        }

        // Get selected courses with proficiency
        const selectedCourses = [];
        document
          .querySelectorAll(".tutor-course-checkbox:checked")
          .forEach((checkbox) => {
            const courseId = checkbox.value;
            const proficiencySlider = document.getElementById(
              `proficiency-${courseId}`
            );

            selectedCourses.push({
              courseId: courseId,
              proficiencyLevel: proficiencySlider
                ? parseInt(proficiencySlider.value)
                : 5,
            });
          });

        if (selectedCourses.length === 0) {
          showNotification(
            "Please select at least one course to tutor",
            "warning",
            "fa-exclamation-circle"
          );
          return;
        }

        // Create tutor application data
        const tutorData = {
          isTutor: true,
          expertizeCourses: selectedCourses,
        };
        console.log("Submitting tutor application:", tutorData);

        // Send tutor application to backend
        fetch(`http://${ipali}:8077/api/students/becomeTutor/${cmsId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(tutorData),
        })
          .then((response) => {
            if (!response.ok) throw new Error("Failed to register as tutor");
            return response.json();
          })
          .then((data) => {
            // Close modal
            const modal = bootstrap.Modal.getInstance(
              document.getElementById("becomeATutorModal")
            );
            modal.hide();

            showNotification(
              "Congratulations! You are now a tutor.",
              "success",
              "fa-check-circle"
            );

            // Update local storage
            const storedUser = JSON.parse(localStorage.getItem("user")) || {};
            storedUser.isTutor = true;
            localStorage.setItem("user", JSON.stringify(storedUser));

            // Redirect to tutor dashboard after a brief delay
            setTimeout(() => {
              window.location.href = "tutor-dashboard.html";
            }, 1500);
          })
          .catch((error) => {
            console.error("Error registering as tutor:", error);
            showNotification(
              "Failed to register as tutor. Please try again later.",
              "danger",
              "fa-exclamation-circle"
            );
          });
      });

    // Show all requests button
    document
      .getElementById("showAllRequestsBtn")
      .addEventListener("click", () => {
        loadRequests(false);
      });

    // New request form submission
    document.getElementById("submitRequest").addEventListener("click", () => {
      date = document.getElementById("requestDate").value;
      time = document.getElementById("requestTime").value;
      const fullTime = time.length === 5 ? `${time}:00` : time;

      const formData = {
        courseId: document.getElementById("requestCourse").value,
        meetingType: document.getElementById("requestMeetingType").value,
        description: document.getElementById("requestDescription").value,

        preferredTime: `${date}T${fullTime}`,
        cmsId: cmsId,
      };

      // Validate form
      if (
        !formData.courseId ||
        !formData.meetingType ||
        !formData.description ||
        !formData.preferredTime ||
        !formData.cmsId
      ) {
        showNotification(
          "Please fill in all fields",
          "warning",
          "fa-exclamation-circle"
        );
        return;
      }

      console.log("Submitting request:", formData);
      // Send request to backend
      fetch(`http://${ipali}:8077/api/requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
        .then((response) => {
          console.log("Response status:", response.status);
          if (!response.ok) throw new Error("Failed to create request");
          return response.json();
        })
        .then((data) => {
          showNotification(
            "Request submitted successfully! Tutors will be notified.",
            "success",
            "fa-paper-plane"
          );

          // Close modal and reset form
          const modal = bootstrap.Modal.getInstance(
            document.getElementById("newRequestModal")
          );
          modal.hide();
          document.getElementById("newRequestForm").reset();

          // Reload requests
          loadRequests(true);
        })
        .catch((error) => {
          console.error("Error creating request:", error);
          showNotification(
            "Failed to submit request. Please try again later.",
            "danger",
            "fa-exclamation-circle"
          );
        });
    });

    // Feedback button
    document.getElementById("feedbackBtn").addEventListener("click", () => {
      // First, load tutors for the dropdown
      fetch(`http://${ipali}:8077/api/tutors`)
        .then((response) => {
          if (!response.ok) throw new Error("Failed to fetch tutors");
          return response.json();
        })
        .then((tutors) => {
          const tutorSelect = document.getElementById("tutorSelect");
          tutorSelect.innerHTML = '<option value="">Choose a tutor</option>';

          tutors.forEach((tutor) => {
            const option = document.createElement("option");
            option.value = tutor.id;
            option.textContent = tutor.name;
            tutorSelect.appendChild(option);
          });

          // Now show the modal
          const feedbackModal = new bootstrap.Modal(
            document.getElementById("feedbackModal")
          );
          feedbackModal.show();
        })
        .catch((error) => {
          console.error("Error fetching tutors:", error);
          showNotification(
            "Failed to load tutors. Please try again later.",
            "danger",
            "fa-exclamation-circle"
          );
        });
    });

    // Submit feedback
    document.getElementById("submitFeedback").addEventListener("click", () => {
      const formData = {
        tutorId: document.getElementById("tutorSelect").value,
        studentId: cmsId,
        rating: document.querySelector('input[name="rating"]:checked')?.value,
        comment: document.getElementById("feedbackText").value,
      };

      // Validate form
      if (!formData.tutorId || !formData.rating || !formData.comment) {
        showNotification(
          "Please fill in all feedback fields",
          "warning",
          "fa-exclamation-circle"
        );
        return;
      }

      // Send feedback to backend
      fetch(`http://${ipali}:8077/api/feedback/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
        .then((response) => {
          if (!response.ok) throw new Error("Failed to submit feedback");
          return response.json();
        })
        .then((data) => {
          showNotification(
            "Feedback submitted successfully! Thank you for your input.",
            "success",
            "fa-star"
          );

          // Close modal and reset form
          const modal = bootstrap.Modal.getInstance(
            document.getElementById("feedbackModal")
          );
          modal.hide();
          document.getElementById("feedbackForm").reset();
        })
        .catch((error) => {
          console.error("Error submitting feedback:", error);
          showNotification(
            "Failed to submit feedback. Please try again later.",
            "danger",
            "fa-exclamation-circle"
          );
        });


        
    });

    // Submit session feedback
    document
      .getElementById("submitSessionFeedback")
      .addEventListener("click", () => {
        const formData = {
          meetingId: document.getElementById("feedbackRequestId").value,
          rating: document.getElementById("sessionRating").value,
          comments: document.getElementById("sessionFeedbackText").value,
        };

        // Validate form
        if (!formData.rating) {
          showNotification(
            "Please provide a rating",
            "warning",
            "fa-exclamation-circle"
          );
          return;
        }
        console.log("Form data:", formData);
        if (!formData.comments.trim()) {

          showNotification(
            "Please provide feedback about your session",
            "warning",
            "fa-exclamation-circle"
          );
          return;
        }

        completeMeetingRequest(formData.meetingId);
        // Send feedback to backend
        fetch(`http://${ipali}:8077/api/feedbacks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        })
          .then((response) => {
            if (!response.ok)
              throw new Error("Failed to complete request and submit feedback");
            return response.json();
          })
          .then((data) => {
            // Show success message
            showNotification(
              "Feedback submitted successfully! The tutoring request has been marked as completed.",
              "success",
              "fa-check-circle"
            );

            // Close modal and reset form
            const modal = bootstrap.Modal.getInstance(
              document.getElementById("completeRequestModal")
            );
            modal.hide();

            // Reload requests to update UI
            loadRequests(true);
          })
          .catch((error) => {
            console.error("Error completing request:", error);
            showNotification(
              "Failed to complete request. Please try again later.",
              "danger",
              "fa-exclamation-circle"
            );
          });

          
      });
  }

  // change the state of the meeting to completed
  function completeMeetingRequest(meetingId) {
  fetch(`http://${ipali}:8077/api/meetings/complete/${meetingId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`Failed to complete meeting. Status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    showNotification("Meeting marked as completed!", "success", "fa-check-circle");
    // Optionally refresh the meeting list
    loadscheduledmeetings(); // if you want to reload after completion
  })
  .catch(error => {
    console.error("Error completing meeting:", error);
    showNotification("Failed to complete meeting", "danger", "fa-times-circle");
  });
}



  function acceptTutor(requestId, responseId, preferredTime, meetingType) {
    console.log("Accepting tutor with requestId:", requestId);
    console.log("Accepting tutor with responseId:", responseId);

    fetch(`http://${ipali}:8077/api/meetings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "requestId" : parseInt(requestId),
      "selectedResponseId": parseInt(responseId),
      "meetingDate": preferredTime,
      "meetingType": meetingType,
        
      }),
    })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to accept tutor");
        return response.json();
      })
      .then((data) => {
        showNotification(
          "Tutor accepted successfully! You can now schedule a session.",
          "success",
          "fa-calendar-check"
        );
        loadRequests(true);
      })
      .catch((error) => {
        console.error("Error accepting tutor:", error);
        showNotification(
          "Failed to accept tutor. Please try again later.",
          "danger",
          "fa-exclamation-circle"
        );
      });
  }

  function declineTutor(responseId) {
    console.log("Declining tutor with responseId:", responseId);
    fetch(`http://${ipali}:8077/api/requests/deleteResponse`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        responseId: responseId,
      }),
    })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to decline tutor");
        return response.json();
      })
      .then((data) => {
        showNotification("Tutor response has been declined", "info");
        loadRequests(true);
      })
      .catch((error) => {
        console.error("Error declining tutor:", error);
        showNotification(
          "Failed to decline tutor. Please try again later.",
          "danger",
          "fa-exclamation-circle"
        );
      });
  }

  // Show session feedback modal
  // Show session feedback modal and reset form & stars
function showSessionFeedbackModal(requestId) {
  // Set the hidden input value
  document.getElementById("feedbackRequestId").value = requestId;

  // Reset stars and form inputs
  document.querySelectorAll(".star-rating").forEach((star) => {
    star.classList.remove("active");
    star.classList.replace("fas", "far");
  });
  document.getElementById("sessionRating").value = "";
  document.getElementById("ratingText").textContent = "Click to rate";
  document.getElementById("sessionFeedbackText").value = "";

  // Show the modal
  const modalEl = document.getElementById("sessionFeedbackModal");
  const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
  modal.show();
}


  // Initialize star rating event listeners once
function initStarRating() {
  document.querySelectorAll(".star-rating").forEach((star) => {
    star.addEventListener("click", function () {
      const rating = this.dataset.rating;
      document.getElementById("sessionRating").value = rating;

      // Update visual feedback
      document.querySelectorAll(".star-rating").forEach((s) => {
        if (s.dataset.rating <= rating) {
          s.classList.replace("far", "fas");
          s.classList.add("active");
        } else {
          s.classList.replace("fas", "far");
          s.classList.remove("active");
        }
      });

      // Update rating text
      const ratingTexts = [
        "",
        "Poor",
        "Fair",
        "Good",
        "Very Good",
        "Excellent",
      ];
      document.getElementById("ratingText").textContent = ratingTexts[rating];
    });
  });
}

  // Populate tutor course selection for the Become a Tutor modal
  function populateTutorCourseSelection() {
    const courseSelectionContainer = document.getElementById(
      "tutorCourseSelection"
    );
    // Clear previous content
    courseSelectionContainer.innerHTML = "";

    // Fetch courses from API
    fetch(`http://${ipali}:8077/api/courses`)
      .then((response) => {
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
      })
      .then((courses) => {
        console.log("Courses:", courses);
        courses.forEach((course) => {
          const courseItem = document.createElement("div");
          courseItem.className = "course-item mb-3 p-3 border rounded";

          // Create course checkbox
          const checkboxDiv = document.createElement("div");
          checkboxDiv.className = "d-flex align-items-center mb-2";

          const checkbox = document.createElement("input");
          checkbox.type = "checkbox";
          checkbox.className = "form-check-input tutor-course-checkbox me-2";
          checkbox.id = `course-${course.id}`;
          checkbox.value = course.id;

          const label = document.createElement("label");
          label.className = "form-check-label";
          label.htmlFor = `course-${course.id}`;
          label.textContent = `${course.courseCode} - ${course.courseName}`;

          checkboxDiv.appendChild(checkbox);
          checkboxDiv.appendChild(label);
          courseItem.appendChild(checkboxDiv);

          // Create proficiency slider
          const proficiencyDiv = document.createElement("div");
          proficiencyDiv.className = "proficiency-slider d-none";

          proficiencyDiv.innerHTML = `
            <label class="form-label d-flex justify-content-between">
              <span>Proficiency Level:</span>
              <span class="proficiency-value" id="proficiency-value-${course.id}">5</span>
            </label>
            <input type="range" class="form-range" min="1" max="10" value="5" 
                   id="proficiency-${course.id}" onInput="document.getElementById('proficiency-value-${course.id}').textContent = this.value">
          `;

          courseItem.appendChild(proficiencyDiv);
          courseSelectionContainer.appendChild(courseItem);

          // Show/hide proficiency slider when checkbox is checked/unchecked
          checkbox.addEventListener("change", () => {
            proficiencyDiv.className = checkbox.checked
              ? "proficiency-slider"
              : "proficiency-slider d-none";
          });
        });
      })
      .catch((error) => {
        console.error("Error fetching courses:", error);
        courseSelectionContainer.innerHTML =
          '<p class="text-danger">Failed to load courses. Please refresh the page and try again.</p>';
      });
  }

  // Show a notification message
  function showNotification(message, type = "success", icon = null) {
    // Determine icon based on notification type if not specified
    if (!icon) {
      switch (type) {
        case "success":
          icon = "fa-check-circle";
          break;
        case "warning":
          icon = "fa-exclamation-triangle";
          break;
        case "danger":
          icon = "fa-exclamation-circle";
          break;
        case "info":
          icon = "fa-info-circle";
          break;
        default:
          icon = "fa-bell";
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
    let notificationContainer = document.querySelector(
      ".notification-container"
    );
    if (!notificationContainer) {
      notificationContainer = document.createElement("div");
      notificationContainer.className =
        "notification-container position-fixed p-3";
      notificationContainer.style.top = "70px";
      notificationContainer.style.right = "20px";
      notificationContainer.style.zIndex = "1050";
      document.body.appendChild(notificationContainer);
    }

    // Add the notification
    notificationContainer.insertAdjacentHTML("beforeend", notificationHTML);

    // Add animation class
    const notification = notificationContainer.lastElementChild;

    // Auto-remove after 5 seconds
    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => notification.remove(), 150);
    }, 5000);

    // Return the notification element in case we need to manipulate it further
    return notification;
  }


  // Open the complete request form
function openCompleteRequestForm(meetingId) {
  // const meeting = window.scheduledMeetings.find(m => m.id === meetingId);
  // if (!meeting) {
  //   console.error("Meeting not found for ID:", meetingId);
  //   return;
  // }
  console.log("Meeting ID:", meetingId);
  // Show the correct modal
  const modalEl = document.getElementById("completeRequestModal");
  const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
  modal.show();
  // Set values in the form
  document.getElementById("feedbackRequestId").value = meetingId;
  document.getElementById("feedbackTutorId").value = meeting.tutorId;
  document.getElementById("feedbackTutorName").textContent = meeting.tutorName;

  // Reset stars and form
  document.querySelectorAll(".star-rating").forEach((star) => {
    star.classList.remove("active");
    star.classList.replace("fas", "far");
  });
  document.getElementById("sessionRating").value = "";
  document.getElementById("ratingText").textContent = "Click to rate";
  document.getElementById("sessionFeedbackText").value = "";

  
}


  function loadscheduledmeetings() {
    const meetingsList = document.getElementById("meetingsList");

    // Show loading spinner
    meetingsList.innerHTML = `
    <div class="loading-spinner text-center py-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
  `;

    // Fetch from API
    fetch(`http://${ipali}:8077/api/meetings/student/${cmsId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`API responded with status ${response.status}`);
        }
        return response.json();
      })
      .then((meetings) => {
        if (!meetings.length) {
          meetingsList.innerHTML = `<p class="text-center text-muted py-3">No meetings found.</p>`;
          return;
        }

        console.log("Meetings:", meetings);
        
        const html = meetings
          .map(
            (meeting) => `
        <div class="meeting-item border-bottom py-3">
          <h6 class="mb-1">${meeting.courseCode} - ${meeting.courseName}</h6>
          <p class="mb-1"><strong>Tutor:</strong> ${meeting.tutorName} (${meeting.tutorPhone
              })</p>
          <p class="mb-1"><strong>Rating:</strong> ${meeting.tutorRating || "Not Rated"
              }</p>
          <p class="mb-1"><strong>Status:</strong> ${meeting.meetingStatus}</p>
          <p class="mb-2"><strong>Scheduled Time:</strong> ${new Date(
                meeting.scheduledTime
              ).toLocaleString()}</p>
          <button class="btn btn-sm btn-primary complete-request-btn" data-meeting-id="${meeting.id}">Complete Request</button>

        </div>
      `
          )
          .join("");



        meetingsList.innerHTML = html;

                  // Attach event listeners to all Complete Request buttons
document.querySelectorAll('.complete-request-btn').forEach(button => {
  button.addEventListener('click', (e) => {
    const meetingId = e.target.getAttribute('data-meeting-id');
    openCompleteRequestForm(meetingId);
  });
});
        // Save data globally for form access
        window.scheduledMeetings = meetings;
      })
      .catch((error) => {
        meetingsList.innerHTML = `<p class="text-danger text-center py-3">Failed to load meetings.</p>`;
        console.error("Error loading meetings:", error);
      });
  }



  // Initialize the dashboard
  initDashboard();

  initStarRating();
});
