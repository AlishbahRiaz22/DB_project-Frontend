ipali = '10.7.241.116'

document.addEventListener("DOMContentLoaded", () => {
    const signupForm = document.getElementById("signupForm");
    const tutorCheckbox = document.getElementById("isTutor");
    const tutorSection = document.getElementById("tutorSection");
    const coursesList = document.getElementById("coursesList");

    const phoneInput = document.getElementById("phone");
    phoneInput.addEventListener("input", (e) => {
        e.target.value = e.target.value.replace(/[^0-9+]/g, "");
    });

    const cmsInput = document.getElementById("cmsId");
    cmsInput.addEventListener("input", (e) => {
        e.target.value = e.target.value.toUpperCase();
    });

    function createCourseElements(courses) {
        coursesList.innerHTML = courses.map(course => `
            <div class="course-item mb-3 border rounded p-3">
                <div class="d-flex align-items-center justify-content-between">
                    <div class="form-check">
                        <input type="checkbox" class="form-check-input course-checkbox" 
                               id="course-${course.id}" value="${course.id}">
                        <label class="form-check-label" for="course-${course.id}">
                            ${course.courseCode} - ${course.courseName}
                        </label>
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
        `).join("");

        document.querySelectorAll(".course-checkbox").forEach((checkbox) => {
            checkbox.addEventListener("change", (e) => {
                const courseItem = e.target.closest(".course-item");
                const sliderContainer = courseItem.querySelector(".proficiency-slider");
                sliderContainer.classList.toggle("d-none", !e.target.checked);
            });
        });

        document.querySelectorAll('input[type="range"]').forEach((slider) => {
            slider.addEventListener("input", (e) => {
                const courseItem = e.target.closest(".course-item");
                courseItem.querySelector(".proficiency-value").textContent = e.target.value;
            });
        });
    }

    tutorCheckbox.addEventListener("change", () => {
        tutorSection.classList.toggle("d-none", !tutorCheckbox.checked);

        if (tutorCheckbox.checked && coursesList.children.length === 0) {
            fetch(`http://${ipali}:8077/api/courses`)
                .then((response) => {
                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                    return response.json();
                })
                .then(createCourseElements)
                .catch((error) => {
                    console.error("Error fetching courses:", error);
                    alert("Failed to load courses. Please try again later.");
                });
        }
    });

    signupForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        const formData = {
            cmsId: document.getElementById("cmsId").value.trim(),
            name: document.getElementById("fullName").value.trim(),
            phoneNumber: document.getElementById("phone").value.trim(),
            batch: document.getElementById("batch").value,
            semester: parseInt(document.getElementById("semester").value),
            email: document.getElementById("email").value.trim(),
            password,
            isTutor: tutorCheckbox.checked,
            expertizeCourses: [],
        };

        // Validate phone number format
        if (!formData.phoneNumber.match(/^\+?[\d-]{10,}$/)) {
            alert("Please enter a valid phone number");
            return;
        }

        // If user selected to be a tutor, validate courses
        if (formData.isTutor) {
            const selectedCourses = document.querySelectorAll(".course-checkbox:checked");
            if (selectedCourses.length === 0) {
                alert("Please select at least one course to teach");
                return;
            }

            selectedCourses.forEach((checkbox) => {
                formData.expertizeCourses.push({
                    courseId: parseInt(checkbox.value),
                    proficiencyLevel: parseInt(document.getElementById(`proficiency-${checkbox.value}`).value)
                });
            });
        }

        console.log("Submitting Form Data:", formData); // Debug log

        try {
            const response = await fetch(`http:${ipali}//:8077/api/auth/signup`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.text(); // Get response as text (not JSON)
                throw new Error(errorData || "Registration failed");
            }

            const responseData = await response.text(); // Get response as text (not JSON)
            console.log("Server response:", responseData);

            // Save user info in localStorage
            localStorage.setItem("user", JSON.stringify({
                cmsId: formData.cmsId,
                name: formData.name,
                isTutor: formData.isTutor,
                expertizeCourses: formData.expertizeCourses,
            }));

            // Show alert with response from server (success message)
            alert(responseData);

            // Redirect to login page after successful registration
            window.location.href = "login.html";

        } catch (error) {
            console.error("Error submitting form:", error);
            alert("An error occurred while creating your account. Please try again.");
        }
    });
});
