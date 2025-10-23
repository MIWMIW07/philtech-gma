// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality in proper order
    initNavigation();
    initEnhancedMobileMenu();
    initEnhancedNavigation();
    initAnimations();
    initEnhancedAnimations();
    initCounters();
    initFormValidation();
    initContactForm();
    initScrollToTop();
    initParticles();
    initTypingEffect();
    initEventsTabs();
    initProgramsSearch();
    
    // Initialize ripple effects
    initRippleEffects();
});

// Enhanced navigation functionality
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
    
    // Prevent scrolling when menu is open
    if (navLinks) {
        navLinks.addEventListener('touchmove', function(e) {
            if (this.classList.contains('active')) {
                e.preventDefault();
            }
        }, { passive: false });
    }
    
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
}

// Enhanced mobile menu with backdrop
function initEnhancedMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const body = document.body;
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            navLinks.classList.toggle('active');
            menuToggle.classList.toggle('active');
            body.classList.toggle('nav-open');
            
            // Add backdrop when menu is open
            if (navLinks.classList.contains('active')) {
                createBackdrop();
            } else {
                removeBackdrop();
            }
        });
        
        // Close menu when clicking on links
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                menuToggle.classList.remove('active');
                body.classList.remove('nav-open');
                removeBackdrop();
            });
        });
    }
    
    function createBackdrop() {
        if (!document.querySelector('.nav-backdrop')) {
            const backdrop = document.createElement('div');
            backdrop.className = 'nav-backdrop';
            backdrop.addEventListener('click', closeMobileMenu);
            document.body.appendChild(backdrop);
        }
    }
    
    function removeBackdrop() {
        const backdrop = document.querySelector('.nav-backdrop');
        if (backdrop) {
            backdrop.remove();
        }
    }
    
    function closeMobileMenu() {
        const navLinks = document.querySelector('.nav-links');
        const menuToggle = document.querySelector('.menu-toggle');
        const body = document.body;
        
        if (navLinks && menuToggle) {
            navLinks.classList.remove('active');
            menuToggle.classList.remove('active');
            body.classList.remove('nav-open');
            removeBackdrop();
        }
    }
}

// Enhanced navigation with smooth scrolling
function initEnhancedNavigation() {
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Active navigation highlighting
    window.addEventListener('scroll', function() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
        
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= (sectionTop - 100)) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// Initialize animations
function initAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
            }
        });
    }, observerOptions);
    
    // Observe elements that need animation
    document.querySelectorAll('.counter-animation, .fade-in-left, .fade-in-right, .slide-in-up').forEach(el => {
        observer.observe(el);
    });
}

// Enhanced animations with Intersection Observer
function initEnhancedAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                
                // Stagger animation for child elements
                if (entry.target.classList.contains('feature-cards')) {
                    const cards = entry.target.querySelectorAll('.feature-card');
                    cards.forEach((card, index) => {
                        card.style.animationDelay = `${index * 0.1}s`;
                    });
                }
                
                if (entry.target.classList.contains('programs-grid')) {
                    const cards = entry.target.querySelectorAll('.program-card');
                    cards.forEach((card, index) => {
                        card.style.animationDelay = `${index * 0.1}s`;
                    });
                }
            }
        });
    }, observerOptions);
    
    // Observe all sections and animated elements
    document.querySelectorAll('section, .animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
}

// Initialize counter animations
function initCounters() {
    const counters = document.querySelectorAll('.stat-number');
    const speed = 200;
    
    counters.forEach(counter => {
        const target = +counter.getAttribute('data-target');
        const count = +counter.innerText;
        const increment = Math.ceil(target / speed);
        
        if (count < target) {
            counter.innerText = Math.ceil(count + increment);
            setTimeout(() => initCounters(), 1);
        } else {
            counter.innerText = target;
        }
    });
}

// Initialize form validation
function initFormValidation() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Simple validation
            const name = document.getElementById('name');
            const email = document.getElementById('email');
            const program = document.getElementById('program');
            const message = document.getElementById('message');
            
            let isValid = true;
            
            if (!name.value.trim()) {
                showError(name, 'Please enter your name');
                isValid = false;
            } else {
                clearError(name);
            }
            
            if (!email.value.trim() || !isValidEmail(email.value)) {
                showError(email, 'Please enter a valid email address');
                isValid = false;
            } else {
                clearError(email);
            }
            
            if (isValid) {
                // Simulate form submission
                const submitBtn = contactForm.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerHTML;
                
                submitBtn.innerHTML = '<span class="loading-spinner"></span> Sending...';
                submitBtn.disabled = true;
                
                setTimeout(() => {
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
                }, 1500);
            }
        });
    }
    
    function showError(input, message) {
        const formGroup = input.parentElement;
        let errorDiv = formGroup.querySelector('.error-message');
        
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            formGroup.appendChild(errorDiv);
        }
        
        errorDiv.textContent = message;
        input.style.borderColor = '#e74c3c';
    }
    
    function clearError(input) {
        const formGroup = input.parentElement;
        const errorDiv = formGroup.querySelector('.error-message');
        
        if (errorDiv) {
            errorDiv.remove();
        }
        
        input.style.borderColor = '';
    }
    
    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
}

// Enhanced Contact Form with EmailJS
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (!contactForm) return;
    
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn ? submitBtn.querySelector('.btn-text') : null;
    const loadingSpinner = submitBtn ? submitBtn.querySelector('.loading-spinner') : null;
    
    // EmailJS Configuration - REPLACE WITH YOUR ACTUAL CREDENTIALS
    const EMAILJS_CONFIG = {
        SERVICE_ID: 'service_s19nvd7',
        TEMPLATE_ID: 'template_2f5ak5h', 
        PUBLIC_KEY: 'O8tfsHGNxzPo6tvKL'
    };
    
    // Initialize EmailJS
    if (typeof emailjs !== 'undefined') {
        emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
    }
    
    // Character counter for message
    const messageTextarea = document.getElementById('message');
    const charCount = document.getElementById('charCount');
    
    if (messageTextarea && charCount) {
        messageTextarea.addEventListener('input', function() {
            const length = this.value.length;
            charCount.textContent = length;
            
            if (length > 500) {
                charCount.style.color = '#e74c3c';
            } else if (length > 400) {
                charCount.style.color = '#f39c12';
            } else {
                charCount.style.color = '#27ae60';
            }
        });
    }
    
    // Enhanced form validation
    function validateForm(formData) {
        const errors = {};
        
        // Name validation
        if (!formData.name.trim()) {
            errors.name = 'Please enter your full name';
        } else if (formData.name.trim().length < 2) {
            errors.name = 'Name must be at least 2 characters long';
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            errors.email = 'Please enter your email address';
        } else if (!emailRegex.test(formData.email)) {
            errors.email = 'Please enter a valid email address';
        }
        
        // Program validation
        if (!formData.program) {
            errors.program = 'Please select a program or service';
        }
        
        // Message validation
        if (!formData.message.trim()) {
            errors.message = 'Please enter your message';
        } else if (formData.message.trim().length < 10) {
            errors.message = 'Message must be at least 10 characters long';
        } else if (formData.message.trim().length > 500) {
            errors.message = 'Message must not exceed 500 characters';
        }
        
        return errors;
    }
    
    // Display validation errors
    function showErrors(errors) {
        // Clear all previous errors
        document.querySelectorAll('.error-message').forEach(el => {
            el.textContent = '';
            el.style.display = 'none';
        });
        
        // Show new errors
        Object.keys(errors).forEach(field => {
            const errorElement = document.getElementById(field + 'Error');
            if (errorElement) {
                errorElement.textContent = errors[field];
                errorElement.style.display = 'block';
                
                // Add error class to input
                const inputElement = document.getElementById(field);
                if (inputElement) {
                    inputElement.classList.add('error');
                }
            }
        });
    }
    
    // Clear errors when user starts typing
    document.querySelectorAll('#contactForm input, #contactForm select, #contactForm textarea').forEach(element => {
        element.addEventListener('input', function() {
            const fieldName = this.id;
            const errorElement = document.getElementById(fieldName + 'Error');
            if (errorElement) {
                errorElement.style.display = 'none';
                this.classList.remove('error');
            }
        });
    });
    
    // Form submission handler
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Honeypot check for spam
        const honeypot = document.getElementById('website');
        if (honeypot && honeypot.value !== '') {
            return; // Likely spam, don't submit
        }
        
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
            showErrors(errors);
            return;
        }
        
        // Show loading state
        if (btnText && loadingSpinner) {
            btnText.style.display = 'none';
            loadingSpinner.style.display = 'flex';
            submitBtn.disabled = true;
        }
        
        try {
            // Send email using EmailJS
            if (typeof emailjs !== 'undefined') {
                const response = await emailjs.send(
                    EMAILJS_CONFIG.SERVICE_ID,
                    EMAILJS_CONFIG.TEMPLATE_ID,
                    formData
                );
                
                // Success
                showSuccessMessage();
                contactForm.reset();
                if (charCount) {
                    charCount.textContent = '0';
                    charCount.style.color = '#27ae60';
                }
            } else {
                throw new Error('EmailJS not loaded');
            }
            
        } catch (error) {
            console.error('Email sending failed:', error);
            showErrorMessage();
        } finally {
            // Reset button state
            if (btnText && loadingSpinner) {
                btnText.style.display = 'block';
                loadingSpinner.style.display = 'none';
                submitBtn.disabled = false;
            }
        }
    });
    
    function showSuccessMessage() {
        const successMessage = document.getElementById('successMessage');
        const errorMessage = document.getElementById('errorMessage');
        
        if (errorMessage) errorMessage.style.display = 'none';
        if (successMessage) {
            successMessage.style.display = 'flex';
            
            // Auto-hide success message after 5 seconds
            setTimeout(() => {
                successMessage.style.display = 'none';
            }, 5000);
        }
    }
    
    function showErrorMessage() {
        const successMessage = document.getElementById('successMessage');
        const errorMessage = document.getElementById('errorMessage');
        
        if (successMessage) successMessage.style.display = 'none';
        if (errorMessage) errorMessage.style.display = 'flex';
    }
}

// Enhanced scroll to top button
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

// Initialize particle background
function initParticles() {
    const particlesContainer = document.getElementById('particles');
    
    if (particlesContainer) {
        const particleCount = 50;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.style.position = 'absolute';
            particle.style.width = Math.random() * 5 + 2 + 'px';
            particle.style.height = particle.style.width;
            particle.style.background = i % 2 === 0 ? 'rgba(139, 21, 56, 0.3)' : 'rgba(218, 165, 32, 0.3)';
            particle.style.borderRadius = '50%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animation = `float ${Math.random() * 6 + 4}s ease-in-out infinite`;
            particle.style.animationDelay = Math.random() * 5 + 's';
            
            particlesContainer.appendChild(particle);
        }
    }
}

// Initialize typing effect
function initTypingEffect() {
    const typingElement = document.querySelector('.typing-container');
    
    if (typingElement) {
        const texts = [
            "Shape Your Future",
            "Build Your Career",
            "Learn and Grow",
            "Achieve Excellence"
        ];
        
        let textIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let typingDelay = 100;
        let erasingDelay = 50;
        let newTextDelay = 2000;
        
        function type() {
            const currentText = texts[textIndex];
            
            if (isDeleting) {
                typingElement.textContent = currentText.substring(0, charIndex - 1);
                charIndex--;
                typingDelay = erasingDelay;
            } else {
                typingElement.textContent = currentText.substring(0, charIndex + 1);
                charIndex++;
                typingDelay = 100;
            }
            
            if (!isDeleting && charIndex === currentText.length) {
                isDeleting = true;
                typingDelay = newTextDelay;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                textIndex = (textIndex + 1) % texts.length;
                typingDelay = 500;
            }
            
            setTimeout(type, typingDelay);
        }
        
        // Start the typing effect
        setTimeout(type, 1000);
    }
}

// Initialize ripple effects
function initRippleEffects() {
    document.querySelectorAll('.ripple-effect').forEach(button => {
        button.addEventListener('click', function(e) {
            const x = e.clientX - e.target.getBoundingClientRect().left;
            const y = e.clientY - e.target.getBoundingClientRect().top;
            
            const ripples = document.createElement('span');
            ripples.classList.add('ripple');
            ripples.style.left = x + 'px';
            ripples.style.top = y + 'px';
            
            this.appendChild(ripples);
            
            setTimeout(() => {
                ripples.remove();
            }, 600);
        });
    });
}

// Initialize events tab functionality
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

// Enhanced Programs Search and Filter
function initProgramsSearch() {
    const searchInput = document.getElementById('programSearch');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const programCards = document.querySelectorAll('.program-card, .shs-card');
    const programCategories = document.querySelectorAll('.program-category');

    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            
            programCards.forEach(card => {
                const programName = card.querySelector('h3').textContent.toLowerCase();
                const programDescription = card.querySelector('p').textContent.toLowerCase();
                
                if (programName.includes(searchTerm) || programDescription.includes(searchTerm)) {
                    card.style.display = 'block';
                    card.classList.add('search-match');
                } else {
                    card.style.display = 'none';
                    card.classList.remove('search-match');
                }
            });

            // Show/hide categories based on visible cards
            programCategories.forEach(category => {
                const visibleCards = category.querySelectorAll('.program-card[style="display: block"], .shs-card[style="display: block"]');
                category.style.display = visibleCards.length > 0 ? 'block' : 'none';
            });
        });
    }

    // Filter functionality
    if (filterButtons.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                const filter = this.getAttribute('data-filter');
                
                // Update active button
                filterButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                // Filter programs
                programCategories.forEach(category => {
                    const categoryType = category.getAttribute('data-category');
                    
                    if (filter === 'all' || categoryType === filter) {
                        category.style.display = 'block';
                        category.querySelectorAll('.program-card, .shs-card').forEach(card => {
                            card.style.display = 'block';
                        });
                    } else {
                        category.style.display = 'none';
                    }
                });
            });
        });
    }
}
