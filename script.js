// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initAnimations();
    initScrollToTop();
    initEventsTabs();
    initContactForm();
});

// ===== NAVIGATION =====
function initNavigation() {
    const header = document.querySelector('.header');
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const body = document.body;
    
    // Toggle mobile menu
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            navLinks.classList.toggle('active');
            menuToggle.classList.toggle('active');
            body.classList.toggle('nav-open');
        });
    }
    
    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            menuToggle.classList.remove('active');
            body.classList.remove('nav-open');
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (navLinks.classList.contains('active') && 
            !e.target.closest('.nav-links') && 
            !e.target.closest('.menu-toggle')) {
            navLinks.classList.remove('active');
            menuToggle.classList.remove('active');
            body.classList.remove('nav-open');
        }
    });
    
    // Header scroll effect
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    
    // Close menu on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            menuToggle.classList.remove('active');
            body.classList.remove('nav-open');
        }
    });
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ===== ANIMATIONS =====
function initAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe animated elements
    document.querySelectorAll('.feature-card, .program-card, .service-card, .value-card, .team-member, .testimonial-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// ===== SCROLL TO TOP =====
function initScrollToTop() {
    // Check if button already exists
    if (document.querySelector('.scroll-to-top')) return;
    
    const scrollBtn = document.createElement('button');
    scrollBtn.className = 'scroll-to-top';
    scrollBtn.innerHTML = '↑';
    scrollBtn.setAttribute('aria-label', 'Scroll to top');
    document.body.appendChild(scrollBtn);
    
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            scrollBtn.classList.add('visible');
        } else {
            scrollBtn.classList.remove('visible');
        }
    });
    
    scrollBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ===== EVENTS TABS =====
function initEventsTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    if (tabButtons.length > 0) {
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                tabButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                button.classList.add('active');
                
                // Hide all tab panes
                tabPanes.forEach(pane => pane.classList.remove('active'));
                
                // Show the selected tab pane
                const tabId = button.getAttribute('data-tab');
                document.getElementById(tabId).classList.add('active');
            });
        });
    }
}

// ===== CONTACT FORM =====
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (!contactForm) return;
    
    // EmailJS Configuration
    const EMAILJS_CONFIG = {
        SERVICE_ID: 'service_s19nvd7',
        TEMPLATE_ID: 'template_2f5ak5h',
        PUBLIC_KEY: 'O8tfsHGNxzPo6tvKL'
    };
    
    // Initialize EmailJS
    if (typeof emailjs !== 'undefined') {
        emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
    }
    
    // Form validation
    function validateForm(formData) {
        const errors = {};
        
        if (!formData.name.trim()) {
            errors.name = 'Please enter your full name';
        } else if (formData.name.trim().length < 2) {
            errors.name = 'Name must be at least 2 characters long';
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            errors.email = 'Please enter your email address';
        } else if (!emailRegex.test(formData.email)) {
            errors.email = 'Please enter a valid email address';
        }
        
        if (!formData.program) {
            errors.program = 'Please select a program';
        }
        
        if (!formData.message.trim()) {
            errors.message = 'Please enter your message';
        } else if (formData.message.trim().length < 10) {
            errors.message = 'Message must be at least 10 characters long';
        }
        
        return errors;
    }
    
    // Form submission handler
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone') ? document.getElementById('phone').value : '',
            program: document.getElementById('program').value,
            message: document.getElementById('message').value,
            timestamp: new Date().toLocaleString()
        };
        
        // Validate form
        const errors = validateForm(formData);
        if (Object.keys(errors).length > 0) {
            Object.keys(errors).forEach(field => {
                const input = document.getElementById(field);
                if (input) {
                    input.style.borderColor = '#e74c3c';
                    const errorMsg = document.createElement('span');
                    errorMsg.className = 'error-message';
                    errorMsg.textContent = errors[field];
                    errorMsg.style.color = '#e74c3c';
                    errorMsg.style.fontSize = '0.85rem';
                    errorMsg.style.marginTop = '0.25rem';
                    errorMsg.style.display = 'block';
                    
                    // Remove existing error message if any
                    const existingError = input.parentElement.querySelector('.error-message');
                    if (existingError) {
                        existingError.remove();
                    }
                    
                    input.parentElement.appendChild(errorMsg);
                }
            });
            return;
        }
        
        // Clear any existing errors
        document.querySelectorAll('.error-message').forEach(el => el.remove());
        document.querySelectorAll('input, select, textarea').forEach(el => {
            el.style.borderColor = '';
        });
        
        // Show loading state
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span style="display:inline-block;animation:spin 1s linear infinite;border:2px solid rgba(255,255,255,0.3);border-top:2px solid white;border-radius:50%;width:16px;height:16px;"></span> Sending...';
        submitBtn.disabled = true;
        
        try {
            // Send email using EmailJS
            if (typeof emailjs !== 'undefined') {
                await emailjs.send(
                    EMAILJS_CONFIG.SERVICE_ID,
                    EMAILJS_CONFIG.TEMPLATE_ID,
                    formData
                );
                
                // Success
                submitBtn.innerHTML = '✓ Message Sent!';
                submitBtn.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
                
                // Reset form
                contactForm.reset();
                
                // Reset button after 3 seconds
                setTimeout(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    submitBtn.style.background = '';
                }, 3000);
                
            } else {
                throw new Error('EmailJS not loaded');
            }
            
        } catch (error) {
            console.error('Email sending failed:', error);
            submitBtn.innerHTML = '✗ Error - Try Again';
            submitBtn.style.background = 'linear-gradient(135deg, #e74c3c, #c0392b)';
            
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                submitBtn.style.background = '';
            }, 3000);
        }
    });
    
    // Clear error on input
    document.querySelectorAll('#contactForm input, #contactForm select, #contactForm textarea').forEach(element => {
        element.addEventListener('input', function() {
            this.style.borderColor = '';
            const errorMsg = this.parentElement.querySelector('.error-message');
            if (errorMsg) {
                errorMsg.remove();
            }
        });
    });
}

// Add spin animation for loading spinner
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);
