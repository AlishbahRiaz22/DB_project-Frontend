ipali = '10.7.48.193'


// filepath: e:\2nd_semester\OOP\project\webapp\js\student-dashboard.js
document.addEventListener("DOMContentLoaded", () => {
  // Set current mode for profile page session display
  localStorage.setItem("currentMode", "student");

  // Get user data from localStorage or use mock data
  const storedUser = JSON.parse(localStorage.getItem("user")) || {};

  // Mock data (in a real application, this would come from a backend)
  // const userData = {
  //     name: storedUser.name || 'John Doe',
  //     isTutor: storedUser.isTutor || false,
  //     requests: [
  //         {
  //             id: 1,
  //             course: 'CS101',
  //             topic: 'Arrays and Loops',
  //             date: '2025-05-10',
  //             time: '14:00',
  //             status: 'pending',
  //             responses: [
  //                 { tutorId: 1, tutorName: 'Alice Smith', rating: 4.5 },
  //                 { tutorId: 2, tutorName: 'Bob Johnson', rating: 4.8 }
  //             ]
  //         },
  //         {
  //             id: 2,
  //             course: 'MTH101',
  //             topic: 'Derivatives',
  //             date: '2025-05-12',
  //             time: '15:30',
  //             status: 'accepted',
  //             acceptedTutor: { tutorId: 3, tutorName: 'Carol Williams', rating: 4.9 }
  //         },
  //         {
  //             id: 3,
  //             course: 'CS201',
  //             topic: 'Algorithm Analysis',
  //             date: '2025-05-05',
  //             time: '13:00',
  //             status: 'completed',
  //             acceptedTutor: { tutorId: 2, tutorName: 'Bob Johnson', rating: 4.8 },
  //             feedback: {
  //                 rating: 5,
  //                 comment: "Bob was extremely helpful and patient. He explained complex concepts in a simple way."
  //             }
  //         }
  //     ]
  // };

//   // fetch the api for the name of the student
fetch(`http://ipali:8077/api/students/name/${cmsId}`)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json(); // Parse the JSON from the response
    })
    .then(data => {
        console.log('Student data:', data);
        // Handle the data (e.g., display it on the page)
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });


  // Initialize the dashboard
  function initDashboard() {
    // Set user name
    // document.getElementById("studentName").textContent = userData.name;

    // Always show switch profile button, but logic will determine if user becomes tutor or goes to tutor dashboard
    const switchProfileBtn = document.getElementById("switchProfileBtn");
    switchProfileBtn.classList.remove("d-none");

    // Load course options
    loadCourseOptions();

    // Load recent requests
    loadRequests(true);

    // Add event listeners
    setupEventListeners();
  }

  function loadCourseOptions() {
    const courseSelect = document.getElementById("requestCourse");
    // here we would fetch api the backend for courses
    fetch("http://ipali:8077/api/courses")
      .then((response) => {
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
      })
      .then(createCourseElements)
      .catch((error) => {
        console.error("Error fetching courses:", error);
        alert("Failed to load courses. Please try again later.");
      });

    data.forEach((course) => {
      const option = document.createElement("option");
      option.value = course.id;
      option.textContent = `${course.id} - ${course.name}`;
      courseSelect.appendChild(option);
    });
  }

  function loadRequests(recentOnly = false) {
    const requestsList = document.getElementById("requestsList");
    let requests = userData.requests;

    if (recentOnly) {
      requests = requests.slice(0, 3); // Show only 3 most recent requests
    }

    requestsList.innerHTML = requests
      .map(
        (request) => `
            <div class="request-card card mb-3">
                <div class="card-body">
                    <h6 class="card-title d-flex justify-content-between">
                        <span>${request.course} - ${request.topic}</span>
                        <span class="badge ${
                          request.status === "pending"
                            ? "bg-warning"
                            : request.status === "accepted"
                            ? "bg-success"
                            : "bg-secondary"
                        }">${request.status}</span>
                    </h6>
                    <p class="card-text">
                        <small class="text-muted">
                            Scheduled for: ${request.date} at ${request.time}
                        </small>
                    </p>
                    ${renderTutorResponses(request)}
                </div>
            </div>
        `
      )
      .join("");

    // Add event listeners for accept/decline buttons
    document.querySelectorAll(".accept-tutor").forEach((btn) => {
      btn.addEventListener("click", (e) =>
        acceptTutor(e.target.dataset.requestId, e.target.dataset.tutorId)
      );
    });

    document.querySelectorAll(".decline-tutor").forEach((btn) => {
      btn.addEventListener("click", (e) =>
        declineTutor(e.target.dataset.requestId, e.target.dataset.tutorId)
      );
    });

    // Add event listeners for complete request buttons
    document.querySelectorAll(".complete-request-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const requestId = e.target.closest(".complete-request-btn").dataset
          .requestId;
        const tutorId = e.target.closest(".complete-request-btn").dataset
          .tutorId;
        const tutorName = e.target.closest(".complete-request-btn").dataset
          .tutorName;
        showSessionFeedbackModal(requestId, tutorId, tutorName);
      });
    });
  }

  function renderTutorResponses(request) {
    if (request.status === "completed") {
      return `
                <div class="completed-request">
                    <div class="d-flex justify-content-between align-items-center">
                        <small class="text-primary">
                            <i class="fas fa-check-double"></i> 
                            Completed with ${request.acceptedTutor.tutorName} 
                            (Your Rating: ${
                              request.feedback ? request.feedback.rating : "N/A"
                            }⭐)
                        </small>
                        <span class="badge bg-secondary">Completed</span>
                    </div>
                    ${
                      request.feedback
                        ? `
                        <div class="mt-2">
                            <small class="text-muted fst-italic">"${request.feedback.comment}"</small>
                        </div>
                    `
                        : ""
                    }
                </div>
            `;
    }

    if (request.status === "accepted") {
      return `
                <div class="accepted-tutor">
                    <div class="d-flex justify-content-between align-items-center">
                        <small class="text-success">
                            <i class="fas fa-check-circle"></i> 
                            Accepted Tutor: ${request.acceptedTutor.tutorName} 
                            (Rating: ${request.acceptedTutor.rating}⭐)
                        </small>
                        <button class="btn btn-sm btn-outline-primary complete-request-btn" 
                                data-request-id="${request.id}" 
                                data-tutor-id="${request.acceptedTutor.tutorId}"
                                data-tutor-name="${request.acceptedTutor.tutorName}">
                            <i class="fas fa-check me-1"></i> Complete Request
                        </button>
                    </div>
                </div>
            `;
    }

    if (!request.responses || request.responses.length === 0) {
      return '<p class="card-text"><small>No tutor responses yet</small></p>';
    }

    return `
            <div class="tutor-responses">
                <small>Tutor Responses:</small>
                ${request.responses
                  .map(
                    (tutor) => `
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
                `
                  )
                  .join("")}
            </div>
        `;
  }

  function setupEventListeners() {
    // Switch to Tutor button functionality
    document
      .getElementById("switchToTutorBtn")
      .addEventListener("click", (e) => {
        e.preventDefault();
        if (userData.isTutor) {
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
      });

    // Process tutor application
    document
      .getElementById("submitTutorApplication")
      .addEventListener("click", () => {
        const bio = document.getElementById("tutorBio").value;
        const isAgreed = document.getElementById("agreementCheck").checked;

        // Check if form is complete
        if (!bio || !isAgreed) {
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
              id: courseId,
              proficiency: proficiencySlider
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

        // In a real app, this would be an API call
        console.log("Tutor application submitted:", {
          bio,
          courses: selectedCourses,
        });

        // Update user data
        userData.isTutor = true;
        userData.tutorBio = bio;
        userData.tutorCourses = selectedCourses;

        // Update localStorage
        const storedUser = JSON.parse(localStorage.getItem("user")) || {};
        storedUser.isTutor = true;
        storedUser.tutorBio = bio;
        storedUser.tutorCourses = selectedCourses;
        localStorage.setItem("user", JSON.stringify(storedUser));

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

        // Redirect to tutor dashboard after a brief delay
        setTimeout(() => {
          window.location.href = "tutor-dashboard.html";
        }, 1500);
      });

    // Show all requests button
    document
      .getElementById("showAllRequestsBtn")
      .addEventListener("click", () => {
        loadRequests(false);
      });

    // New request form submission
    document.getElementById("submitRequest").addEventListener("click", () => {
      const formData = {
        course: document.getElementById("requestCourse").value,
        topic: document.getElementById("requestTopic").value,
        description: document.getElementById("requestDescription").value,
        date: document.getElementById("requestDate").value,
        time: document.getElementById("requestTime").value,
      };

      // Validate form
      if (
        !formData.course ||
        !formData.topic ||
        !formData.description ||
        !formData.date ||
        !formData.time
      ) {
        showNotification(
          "Please fill in all fields",
          "warning",
          "fa-exclamation-circle"
        );
        return;
      }

      // In a real application, this would be an API call
      console.log("New request submitted:", formData);
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
    });

    // Feedback button
    document.getElementById("feedbackBtn").addEventListener("click", () => {
      const feedbackModal = new bootstrap.Modal(
        document.getElementById("feedbackModal")
      );
      feedbackModal.show();
    });

    // Submit feedback
    document.getElementById("submitFeedback").addEventListener("click", () => {
      const formData = {
        tutorId: document.getElementById("tutorSelect").value,
        rating: document.querySelector('input[name="rating"]:checked')?.value,
        feedback: document.getElementById("feedbackText").value,
      };

      // Validate form
      if (!formData.tutorId || !formData.rating || !formData.feedback) {
        showNotification(
          "Please fill in all feedback fields",
          "warning",
          "fa-exclamation-circle"
        );
        return;
      }

      // In a real application, this would be an API call
      console.log("Feedback submitted:", formData);
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
    });

    // Submit session feedback
    document
      .getElementById("submitSessionFeedback")
      .addEventListener("click", () => {
        const formData = {
          requestId: document.getElementById("feedbackRequestId").value,
          tutorId: document.getElementById("feedbackTutorId").value,
          rating: document.getElementById("sessionRating").value,
          feedback: document.getElementById("sessionFeedbackText").value,
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

        if (!formData.feedback.trim()) {
          showNotification(
            "Please provide feedback about your session",
            "warning",
            "fa-exclamation-circle"
          );
          return;
        }

        // In a real application, this would be an API call
        console.log("Session feedback submitted:", formData);

        // Mark request as completed in our mock data
        userData.requests.forEach((request) => {
          if (request.id.toString() === formData.requestId) {
            request.status = "completed";
            request.feedback = {
              rating: formData.rating,
              comment: formData.feedback,
            };
          }
        });

        // Show success message
        showNotification(
          "Feedback submitted successfully! The tutoring request has been marked as completed.",
          "success",
          "fa-check-circle"
        );

        // Close modal and reset form
        const modal = bootstrap.Modal.getInstance(
          document.getElementById("sessionFeedbackModal")
        );
        modal.hide();

        // Reload requests to update UI
        loadRequests(true);
      });
  }

  function acceptTutor(requestId, tutorId) {
    // In a real application, this would be an API call
    console.log(`Accepting tutor ${tutorId} for request ${requestId}`);
    showNotification(
      "Tutor accepted successfully! You can now schedule a session.",
      "success",
      "fa-calendar-check"
    );
    loadRequests(true);
  }

  function declineTutor(requestId, tutorId) {
    // In a real application, this would be an API call
    console.log(`Declining tutor ${tutorId} for request ${requestId}`);
    showNotification("Tutor response has been declined", "info");
    loadRequests(true);
  }

  // Show session feedback modal
  function showSessionFeedbackModal(requestId, tutorId, tutorName) {
    // Set values in the form
    document.getElementById("feedbackRequestId").value = requestId;
    document.getElementById("feedbackTutorId").value = tutorId;
    document.getElementById("feedbackTutorName").textContent = tutorName;

    // Reset stars and form
    document.querySelectorAll(".star-rating").forEach((star) => {
      star.classList.remove("active");
      star.classList.replace("fas", "far");
    });
    document.getElementById("sessionRating").value = "";
    document.getElementById("ratingText").textContent = "Click to rate";
    document.getElementById("sessionFeedbackText").value = "";

    // Show the modal
    const modal = new bootstrap.Modal(
      document.getElementById("sessionFeedbackModal")
    );
    modal.show();

    // Add event listeners for star rating
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

    const courses = [
      { id: "CS101", name: "Introduction to Programming" },
      { id: "CS201", name: "Data Structures" },
      { id: "MTH101", name: "Calculus I" },
      { id: "MTH201", name: "Linear Algebra" },
    ];

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
      label.textContent = `${course.id} - ${course.name}`;

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

  // Initialize the dashboard
  initDashboard();
});


