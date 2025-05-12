document.addEventListener('DOMContentLoaded', function() {
    // Add the footer to every page that includes this script
    const footerContainer = document.createElement('footer');
    footerContainer.className = 'footer mt-5 py-4 bg-light';
    footerContainer.innerHTML = `
        <div class="container">
            <div class="row">
                <div class="col-md-4 mb-3 mb-md-0">
                    <h5 class="mb-3"><span class="brand-edu">Edu</span><span class="brand-connect">Connect</span></h5>
                    <p class="text-muted">Connecting students with peer tutors since 2025.</p>
                </div>
                <div class="col-md-3 mb-3 mb-md-0">
                    <h5>Links</h5>
                    <ul class="nav flex-column">
                        <li class="nav-item"><a href="index.html" class="nav-link text-muted p-0 mb-2">Home</a></li>
                        <li class="nav-item"><a href="about.html" class="nav-link text-muted p-0 mb-2">About Us</a></li>
                        <li class="nav-item"><a href="#" class="nav-link text-muted p-0 mb-2">Contact</a></li>
                    </ul>
                </div>
               
                <div class="col-md-2 mb-3 mb-md-0">
                    <h5>Social</h5>
                    <div class="social-links">
                        <a href="#" class="text-muted me-2"><i class="fab fa-facebook-f"></i></a>
                        <a href="#" class="text-muted me-2"><i class="fab fa-twitter"></i></a>
                        <a href="#" class="text-muted me-2"><i class="fab fa-instagram"></i></a>
                        <a href="#" class="text-muted"><i class="fab fa-linkedin-in"></i></a>
                    </div>
                </div>
            </div>
            <hr class="my-3">
            <div class="row align-items-center">
                <div class="col-md-6 text-center text-md-start">
                    <p class="text-muted mb-md-0">&copy; 2025 EduConnect. All rights reserved.</p>
                </div>
                <div class="col-md-6 text-center text-md-end">
                    <ul class="nav justify-content-center justify-content-md-end">
                        <li class="nav-item"><a href="#" class="nav-link text-muted px-2">Privacy Policy</a></li>
                        <li class="nav-item"><a href="#" class="nav-link text-muted px-2">Terms of Use</a></li>
                    </ul>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(footerContainer);
});
