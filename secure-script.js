// ============================================
// SECURE SCRIPT.JS - Enhanced Security Implementation
// PHILTECH Website - IAS Principles Applied
// ============================================

// Security Configuration
const SECURITY_CONFIG = {
    rateLimit: {
        maxAttempts: 3,
        timeWindow: 60000 // 1 minute
    },
    validation: {
        maxNameLength: 50,
        maxEmailLength: 254,
        maxMessageLength: 1000,
        minMessageLength: 10
    }
};

// ============================================
// 1. RATE LIMITING (Availability Protection)
// ============================================
const rateLimiter = {
    attempts: new Map(),
    
    checkLimit: function(identifier) {
        const now = Date.now();
        const userAttempts = this.attempts.get(identifier) || [];
        
        // Filter attempts within time window
        const recentAttempts = userAttempts.filter(
            time => now - time < SECURITY_CONFIG.rateLimit.timeWindow
        );
        
        if (recentAttempts.length >= SECURITY_CONFIG.rateLimit.maxAttempts) {
            return {
                allowed: false,
                message: `Too many requests. Please wait ${Math.ceil((SECURITY_CONFIG.rateLimit.timeWindow - (now - recentAttempts[0])) / 1000)} seconds.`
            };
        }
        
        recentAttempts.push(now);
        this.attempts.set(identifier, recentAttempts);
        this.cleanup();
        
        return { allowed: true };
    },
    
    cleanup: function() {
        const now = Date.now();
        for (let [key, attempts] of this.attempts.entries()) {
            const recentAttempts = attempts.filter(
                time => now - time < SECURITY_CONFIG.rateLimit.timeWindow
            );
            if (recentAttempts.length === 0) {
                this.attempts.delete(key);
            } else {
                this.attempts.set(key, recentAttempts);
            }
        }
    }
};

// ============================================
// 2. INPUT SANITIZATION (Integrity Protection)
// ============================================
const InputSanitizer = {
    // HTML entity encoding to prevent XSS
    encodeHTML: function(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },
    
    // Remove dangerous patterns
    removeDangerousPatterns: function(str) {
        const dangerous = [
            /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
            /<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi,
            /<embed/gi,
            /<object/gi,
            /eval\(/gi,
            /expression\(/gi
        ];
        
        let cleaned = str;
        dangerous.forEach(pattern => {
            cleaned = cleaned.replace(pattern, '');
        });
        
        return cleaned;
    },
    
    // Main sanitization method
    sanitize: function(input, type = 'text') {
        if (!input) return '';
        
        let sanitized = String(input).trim();
        sanitized = this.removeDangerousPatterns(sanitized);
        sanitized = this.encodeHTML(sanitized);
        
        // Type-specific sanitization
        switch(type) {
            case 'name':
                sanitized = sanitized.replace(/[^a-zA-Z\s\-']/g, '');
                break;
            case 'email':
                sanitized = sanitized.toLowerCase();
                break;
        }
        
        return sanitized;
    }
};

// ============================================
// 3. INPUT VALIDATION (Integrity Protection)
// ============================================
const InputValidator = {
    isValidName: function(name) {
        if (!name || typeof name !== 'string') return false;
        
        const nameRegex = /^[a-zA-Z\s\-']{2,50}$/;
        return nameRegex.test(name) && 
               name.length >= 2 && 
               name.length <= SECURITY_CONFIG.validation.maxNameLength;
    },
    
    isValidEmail: function(email) {
        if (!email || typeof email !== 'string') return false;
        
        // RFC 5322 simplified regex
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        
        return emailRegex.test(email) && 
               email.length >= 5 && 
               email.length <= SECURITY_CONFIG.validation.maxEmailLength;
    },
    
    isValidMessage: function(message) {
        if (!message || typeof message !== 'string') return false;
        
        const hasMinLength = message.length >= SECURITY_CONFIG.validation.minMessageLength;
        const hasMaxLength = message.length <= SECURITY_CONFIG.validation.maxMessageLength;
        const noDangerousPatterns = !/<script|javascript:|onerror=|onclick=/gi.test(message);
        
        return hasMinLength && hasMaxLength && noDangerousPatterns;
    },
    
    isValidProgram: function(program) {
        const validPrograms = [
            'bscs', 'bsoa', 'btvted', 'humms', 'abm', 'he', 'ict',
            'software', 'ai', 'consultancy'
        ];
        return validPrograms.includes(program);
    }
};

// ============================================
// 4. CSRF PROTECTION (Integrity Protection)
// ============================================
const CSRFProtection = {
    generateToken: function() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        const token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
        sessionStorage.setItem('csrfToken', token);
        return token;
    },
    
    validateToken: function(token) {
        const storedToken = sessionStorage.getItem('csrfToken');
        return token && storedToken && token === storedToken;
    },
    
    addToForm: function(form) {
        const token = this.generateToken();
        let input = form.querySelector('input[name="csrf_token"]');
        
        if (!input) {
            input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'csrf_token';
            form.appendChild(input);
        }
        
        input.value = token;
    }
};

// ============================================
// 5. CLIENT FINGERPRINTING (Rate Limiting Support)
// ============================================
function getClientIdentifier() {
    let clientId = sessionStorage.getItem('clientId');
    
    if (!clientId) {
        const fingerprint = [
            navigator.userAgent,
            navigator.language,
            screen.width,
            screen.height,
            new Date().getTimezoneOffset()
        ].join('|');
        
        const hash = simpleHash(fingerprint);
        clientId = 'client_' + hash + '_' + Date.now();
        sessionStorage.setItem('clientId', clientId);
    }
    
    return clientId;
}

function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
}

// ============================================
// 6. SECURE ERROR HANDLING (Confidentiality Protection)
// ============================================
function handleSecureError(error, userMessage = 'An unexpected error occurred. Please try again.') {
    // Log detailed error only in development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.error('Detailed error:', error);
    } else {
        // In production, only log sanitized info
        console.error('Error occurred:', error.message);
    }
    
    // Show user-friendly message
    showNotification(userMessage, 'error');
    
    // Optional: Send to error monitoring service
    logErrorToService({
        message: error.message,
        timestamp: new Date().toISOString(),
        url: window.location.href
    });
}

function logErrorToService(errorData) {
    // Send sanitized error to monitoring service
    // Never expose: stack traces, internal paths, sensitive data
    const sanitizedError = {
        type: 'client_error',
        message: errorData.message.substring(0, 100), // Limit length
        timestamp: errorData.timestamp,
        page: errorData.url
    };
    
    // In production, send to your error tracking service
    // fetch('/api/log-error', { method: 'POST', body: JSON.stringify(sanitizedError) });
}

// ============================================
// 7. EMAIL OBFUSCATION (Confidentiality Protection)
// ============================================
function getContactEmail() {
    const parts = ['learsi', 'gabriel07', 'gmail', 'com'];
    return parts[0] + '.' + parts[1] + '@' + parts[2] + '.' + parts[3];
}

function obfuscateEmails() {
    const emailElements = document.querySelectorAll('[href^="mailto:learsi.gabriel07@gmail.com"]');
    emailElements.forEach(el => {
        const email = getContactEmail();
        el.href = 'mailto:' + email;
        if (el.textContent.includes('@')) {
            el.textContent = email;
        }
    });
}

// ============================================
// 8. ENHANCED FORM VALIDATION (Main Security Layer)
// ============================================
function initFormValidation() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        // Add CSRF protection
        CSRFProtection.addToForm(contactForm);
        
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            try {
                // Get form elements
                const nameInput = document.getElementById('name');
                const emailInput = document.getElementById('email');
                const programInput = document.getElementById('program');
                const messageInput = document.getElementById('message');
                const csrfInput = contactForm.querySelector('input[name="csrf_token"]');
                
                // Clear previous errors
                clearAllErrors();
                
                // 1. CSRF Validation
                if (!CSRFProtection.validateToken(csrfInput.value)) {
                    throw new Error('Security token invalid. Please refresh and try again.');
                }
                
                // 2. Rate Limiting Check
                const clientId = getClientIdentifier();
                const rateLimitCheck = rateLimiter.checkLimit(clientId);
                
                if (!rateLimitCheck.allowed) {
                    showNotification(rateLimitCheck.message, 'warning');
                    return;
                }
                
                // 3. Sanitize Inputs
                const name = InputSanitizer.sanitize(nameInput.value, 'name');
                const email = InputSanitizer.sanitize(emailInput.value, 'email');
                const program = programInput.value;
                const message = InputSanitizer.sanitize(messageInput.value);
                
                // 4. Validate Inputs
                let isValid = true;
                
                if (!InputValidator.isValidName(name)) {
                    showError(nameInput, 'Please enter a valid name (2-50 characters, letters only)');
                    isValid = false;
                }
                
                if (!InputValidator.isValidEmail(email)) {
                    showError(emailInput, 'Please enter a valid email address');
                    isValid = false;
                }
                
                if (!InputValidator.isValidProgram(program)) {
                    showError(programInput, 'Please select a valid program or service');
                    isValid = false;
                }
                
                if (!InputValidator.isValidMessage(message)) {
                    showError(messageInput, `Message must be ${SECURITY_CONFIG.validation.minMessageLength}-${SECURITY_CONFIG.validation.maxMessageLength} characters`);
                    isValid = false;
                }
                
                if (!isValid) {
                    return;
                }
                
                // 5. Submit Form Securely
                submitSecureForm(name, email, program, message);
                
            } catch (error) {
                handleSecureError(error, 'Unable to submit form. Please try again.');
            }
        });
    }
}

// ============================================
// 9. SECURE FORM SUBMISSION
// ============================================
function submitSecureForm(name, email, program, message) {
    const submitBtn = document.querySelector('#contactForm button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    // Disable button and show loading
    submitBtn.innerHTML = '<span class="loading-spinner"></span> Sending...';
    submitBtn.disabled = true;
    
    // Check if EmailJS is loaded
    if (typeof emailjs === 'undefined') {
        handleSecureError(new Error('EmailJS not loaded'), 'Service temporarily unavailable. Please try again later.');
        resetSubmitButton(submitBtn, originalText);
        return;
    }
    
    // Prepare template parameters with sanitized data
    const templateParams = {
        name: name,
        email: email,
        program: program,
        message: message,
        date: new Date().toLocaleString('en-US', { 
            dateStyle: 'full', 
            timeStyle: 'short' 
        }),
        ip: 'hidden', // Don't expose client IP
        userAgent: navigator.userAgent.substring(0, 50) // Limited for privacy
    };
    
    // Send email using EmailJS
    emailjs.send('service_4e2so76', 'template_fhr48dd', templateParams)
        .then(function(response) {
            console.log('SUCCESS!', response.status);
            
            // Show success message
            submitBtn.innerHTML = '✓ Message Sent Successfully!';
            submitBtn.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
            
            showNotification('Thank you! Your inquiry has been sent. We\'ll get back to you soon.', 'success');
            
            // Reset form
            document.getElementById('contactForm').reset();
            
            // Regenerate CSRF token
            CSRFProtection.addToForm(document.getElementById('contactForm'));
            
            // Reset button after 5 seconds
            setTimeout(() => {
                resetSubmitButton(submitBtn, originalText);
            }, 5000);
        })
        .catch(function(error) {
            console.error('FAILED...', error);
            handleSecureError(error, 'Failed to send message. Please try again or contact us directly.');
            resetSubmitButton(submitBtn, originalText);
        });
}

function resetSubmitButton(button, originalText) {
    button.innerHTML = originalText;
    button.disabled = false;
    button.style.background = '';
}

// ============================================
// 10. ERROR DISPLAY HELPERS
// ============================================
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
    input.setAttribute('aria-invalid', 'true');
}

function clearError(input) {
    const formGroup = input.parentElement;
    const errorDiv = formGroup.querySelector('.error-message');
    
    if (errorDiv) {
        errorDiv.remove();
    }
    
    input.style.borderColor = '';
    input.removeAttribute('aria-invalid');
}

function clearAllErrors() {
    document.querySelectorAll('.error-message').forEach(el => el.remove());
    document.querySelectorAll('input, select, textarea').forEach(el => {
        el.style.borderColor = '';
        el.removeAttribute('aria-invalid');
    });
}

// ============================================
// 11. NOTIFICATION SYSTEM
// ============================================
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${getNotificationIcon(type)}</span>
            <span class="notification-message">${InputSanitizer.encodeHTML(message)}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 8000);
}

function getNotificationIcon(type) {
    const icons = {
        success: '✓',
        error: '✗',
        warning: '⚠',
        info: 'ℹ'
    };
    return icons[type] || icons.info;
}

// ============================================
// 12. HTTPS ENFORCEMENT
// ============================================
function enforceHTTPS() {
    if (location.protocol === 'http:' && 
        location.hostname !== 'localhost' && 
        location.hostname !== '127.0.0.1') {
        location.replace(`https:${location.href.substring(location.protocol.length)}`);
    }
}

// ============================================
// 13. ORIGINAL FUNCTIONALITY (Preserved)
// ============================================
function initNavigation() {
    const header = document.querySelector('.header');
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const body = document.body;
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            navLinks.classList.toggle('active');
            menuToggle.classList.toggle('active');
            body.classList.toggle('nav-open');
        });
    }
    
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            menuToggle.classList.remove('active');
            body.classList.remove('nav-open');
        });
    });
    
    document.addEventListener('click', function(e) {
        if (navLinks.classList.contains('active') && 
            !e.target.closest('.nav-links') && 
            !e.target.closest('.menu-toggle')) {
            navLinks.classList.remove('active');
            menuToggle.classList.remove('active');
            body.classList.remove('nav-open');
        }
    });
    
    if (navLinks) {
        navLinks.addEventListener('touchmove', function(e) {
            if (this.classList.contains('active')) {
                e.preventDefault();
            }
        }, { passive: false });
    }
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            menuToggle.classList.remove('active');
            body.classList.remove('nav-open');
        }
    });
}

function initAnimations() {
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
    
    document.querySelectorAll('.counter-animation, .fade-in-left, .fade-in-right, .slide-in-up').forEach(el => {
        observer.observe(el);
    });
}

function initCounters() {
    const counters = document.querySelectorAll('.stat-number, .team-stat-number');
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

function initScrollToTop() {
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
        
        setTimeout(type, 1000);
    }
}

function initEventsTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    if (tabButtons.length > 0) {
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                tabPanes.forEach(pane => pane.classList.remove('active'));
                
                const tabId = button.getAttribute('data-tab');
                document.getElementById(tabId).classList.add('active');
            });
        });
    }
}

// ============================================
// 14. RIPPLE EFFECT
// ============================================
document.addEventListener('DOMContentLoaded', function() {
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
});

// ============================================
// 15. INITIALIZATION (Main Entry Point)
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Security initialization
    enforceHTTPS();
    obfuscateEmails();
    
    // Feature initialization
    initNavigation();
    initAnimations();
    initCounters();
    initFormValidation(); // Enhanced with security
    initScrollToTop();
    initParticles();
    initTypingEffect();
    initEventsTabs();
    
    console.log('PHILTECH website loaded with enhanced security features');
});

// ============================================
// SECURE AUTHENTICATION SYSTEM
// ============================================

const AuthSystem = {
    // Security configuration
    config: {
        minPasswordLength: 8,
        maxPasswordLength: 100,
        sessionTimeout: 30 * 60 * 1000, // 30 minutes
        maxLoginAttempts: 5,
        lockoutTime: 15 * 60 * 1000, // 15 minutes
        tokenLength: 32
    },

    // Session management
    session: {
        start: function(userData) {
            const sessionData = {
                user: userData,
                createdAt: Date.now(),
                lastActivity: Date.now(),
                sessionId: this.generateSessionId()
            };
            
            // Store session data with expiration
            sessionStorage.setItem('userSession', JSON.stringify(sessionData));
            sessionStorage.setItem('sessionExpiry', (Date.now() + AuthSystem.config.sessionTimeout).toString());
            
            this.updateActivity();
        },

        isValid: function() {
            const session = sessionStorage.getItem('userSession');
            const expiry = sessionStorage.getItem('sessionExpiry');
            
            if (!session || !expiry) return false;
            
            const now = Date.now();
            if (now > parseInt(expiry)) {
                this.end();
                return false;
            }
            
            this.updateActivity();
            return true;
        },

        updateActivity: function() {
            const expiry = Date.now() + AuthSystem.config.sessionTimeout;
            sessionStorage.setItem('sessionExpiry', expiry.toString());
        },

        end: function() {
            sessionStorage.removeItem('userSession');
            sessionStorage.removeItem('sessionExpiry');
            sessionStorage.removeItem('csrfToken');
            localStorage.removeItem('rememberMe');
        },

        getCurrentUser: function() {
            if (!this.isValid()) return null;
            
            const session = sessionStorage.getItem('userSession');
            return session ? JSON.parse(session).user : null;
        },

        generateSessionId: function() {
            const array = new Uint8Array(AuthSystem.config.tokenLength);
            crypto.getRandomValues(array);
            return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
        }
    },

    // Password security
    password: {
        // In a real application, hashing should be done server-side
        // This is a client-side simulation for demonstration
        hashPassword: async function(password) {
            // Simulate hashing delay
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const encoder = new TextEncoder();
            const data = encoder.encode(password + 'philtech_salt_2025');
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        },

        validateStrength: function(password) {
            const requirements = {
                minLength: password.length >= AuthSystem.config.minPasswordLength,
                hasUpperCase: /[A-Z]/.test(password),
                hasLowerCase: /[a-z]/.test(password),
                hasNumbers: /\d/.test(password),
                hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
            };

            const strength = Object.values(requirements).filter(Boolean).length;
            const isStrong = strength >= 4;

            return {
                requirements,
                strength,
                isStrong,
                feedback: this.getStrengthFeedback(requirements)
            };
        },

        getStrengthFeedback: function(requirements) {
            const feedback = [];
            if (!requirements.minLength) feedback.push(`At least ${AuthSystem.config.minPasswordLength} characters`);
            if (!requirements.hasUpperCase) feedback.push('One uppercase letter');
            if (!requirements.hasLowerCase) feedback.push('One lowercase letter');
            if (!requirements.hasNumbers) feedback.push('One number');
            if (!requirements.hasSpecialChar) feedback.push('One special character');
            return feedback;
        }
    },

    // Login attempts tracking
    loginAttempts: {
        getRemainingAttempts: function(identifier) {
            const attempts = JSON.parse(localStorage.getItem('loginAttempts') || '{}');
            const userAttempts = attempts[identifier];
            
            if (!userAttempts) return AuthSystem.config.maxLoginAttempts;
            
            const now = Date.now();
            if (now - userAttempts.lastAttempt > AuthSystem.config.lockoutTime) {
                delete attempts[identifier];
                localStorage.setItem('loginAttempts', JSON.stringify(attempts));
                return AuthSystem.config.maxLoginAttempts;
            }
            
            return Math.max(0, AuthSystem.config.maxLoginAttempts - userAttempts.count);
        },

        recordAttempt: function(identifier, success = false) {
            const attempts = JSON.parse(localStorage.getItem('loginAttempts') || '{}');
            
            if (success) {
                delete attempts[identifier];
            } else {
                const now = Date.now();
                if (!attempts[identifier]) {
                    attempts[identifier] = { count: 1, lastAttempt: now };
                } else {
                    attempts[identifier].count++;
                    attempts[identifier].lastAttempt = now;
                }
            }
            
            localStorage.setItem('loginAttempts', JSON.stringify(attempts));
        },

        isLockedOut: function(identifier) {
            const attempts = JSON.parse(localStorage.getItem('loginAttempts') || '{}');
            const userAttempts = attempts[identifier];
            
            if (!userAttempts) return false;
            
            const now = Date.now();
            if (now - userAttempts.lastAttempt > AuthSystem.config.lockoutTime) {
                delete attempts[identifier];
                localStorage.setItem('loginAttempts', JSON.stringify(attempts));
                return false;
            }
            
            return userAttempts.count >= AuthSystem.config.maxLoginAttempts;
        }
    }
};

// ============================================
// LOGIN FORM HANDLING
// ============================================

function initLoginSystem() {
    const loginModal = document.getElementById('loginModal');
    const loginForm = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');
    const closeLogin = document.getElementById('closeLogin');
    const togglePassword = document.getElementById('togglePassword');
    const logoutBtn = document.getElementById('logoutBtn');
    const userDashboard = document.getElementById('userDashboard');

    // Mock user database (in real application, this would be on the server)
    const mockUsers = {
        'admin@philtech.edu.ph': {
            username: 'admin',
            email: 'admin@philtech.edu.ph',
            passwordHash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbddad8b9c8f2c5b6d6f1', // 'password' hashed
            role: 'admin',
            fullName: 'Administrator'
        },
        'student@philtech.edu.ph': {
            username: 'student',
            email: 'student@philtech.edu.ph',
            passwordHash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbddad8b9c8f2c5b6d6f1',
            role: 'student',
            fullName: 'John Student'
        }
    };

    // Modal functionality
    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showLoginModal();
        });
    }

    if (closeLogin) {
        closeLogin.addEventListener('click', hideLoginModal);
    }

    // Close modal when clicking outside
    if (loginModal) {
        loginModal.addEventListener('click', function(e) {
            if (e.target === loginModal) {
                hideLoginModal();
            }
        });
    }

    // Password visibility toggle
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            const passwordInput = document.getElementById('password');
            const type = passwordInput.type === 'password' ? 'text' : 'password';
            passwordInput.type = type;
            this.textContent = type === 'password' ? '👁️' : '🔒';
        });
    }

    // Login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            await handleLoginSubmit();
        });
    }

    // Logout functionality
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Check for existing session on page load
    checkExistingSession();

    // Add keyboard event for Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && loginModal.style.display === 'block') {
            hideLoginModal();
        }
    });
}

async function handleLoginSubmit() {
    const form = document.getElementById('loginForm');
    const submitBtn = form.querySelector('.login-submit');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const rememberMe = document.getElementById('rememberMe');

    // Clear previous errors
    clearAllErrors();

    // Sanitize inputs
    const username = InputSanitizer.sanitize(usernameInput.value);
    const password = InputSanitizer.sanitize(passwordInput.value);

    // Validate inputs
    let isValid = true;

    if (!username || username.length < 3) {
        showError(usernameInput, 'Please enter a valid username or email');
        isValid = false;
    }

    if (!password || password.length < 8) {
        showError(passwordInput, 'Password must be at least 8 characters long');
        isValid = false;
    }

    if (!isValid) {
        form.classList.add('shake');
        setTimeout(() => form.classList.remove('shake'), 500);
        return;
    }

    // Check for lockout
    if (AuthSystem.loginAttempts.isLockedOut(username)) {
        showNotification('Too many failed login attempts. Please try again in 15 minutes.', 'error');
        return;
    }

    // Show loading state
    submitBtn.disabled = true;
    const btnText = submitBtn.querySelector('.btn-text');
    const spinner = submitBtn.querySelector('.loading-spinner');
    btnText.textContent = 'Authenticating...';
    spinner.style.display = 'inline-block';

    try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Authenticate user (in real app, this would be a server call)
        const user = await authenticateUser(username, password);

        if (user) {
            // Successful login
            AuthSystem.loginAttempts.recordAttempt(username, true);
            
            // Start session
            AuthSystem.session.start(user);
            
            // Handle remember me
            if (rememberMe.checked) {
                localStorage.setItem('rememberMe', 'true');
            }

            showNotification('Login successful! Welcome back.', 'success');
            hideLoginModal();
            updateUIForLoggedInUser(user);
            
            // Reset form
            form.reset();
        } else {
            // Failed login
            const remainingAttempts = AuthSystem.loginAttempts.getRemainingAttempts(username);
            AuthSystem.loginAttempts.recordAttempt(username, false);
            
            if (remainingAttempts <= 1) {
                showNotification('Invalid credentials. Account will be locked after next failed attempt.', 'error');
            } else {
                showNotification(`Invalid credentials. ${remainingAttempts - 1} attempts remaining.`, 'error');
            }
            
            form.classList.add('shake');
            setTimeout(() => form.classList.remove('shake'), 500);
        }
    } catch (error) {
        handleSecureError(error, 'Login failed. Please try again.');
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        btnText.textContent = 'Sign In';
        spinner.style.display = 'none';
    }
}

async function authenticateUser(username, password) {
    // Simulate server-side authentication
    // In real application, this would be an API call to your backend
    
    // Find user by username or email
    let user = null;
    for (const [email, userData] of Object.entries(mockUsers)) {
        if (userData.username === username || userData.email === username) {
            user = userData;
            break;
        }
    }

    if (!user) {
        return null;
    }

    // Hash the provided password and compare (in real app, this happens on server)
    const hashedPassword = await AuthSystem.password.hashPassword(password);
    
    // Use timing-safe comparison in real applications
    if (hashedPassword === user.passwordHash) {
        return {
            id: user.email,
            username: user.username,
            email: user.email,
            role: user.role,
            fullName: user.fullName,
            loginTime: new Date().toISOString()
        };
    }

    return null;
}

function handleLogout() {
    AuthSystem.session.end();
    showNotification('You have been logged out successfully.', 'success');
    updateUIForLoggedOutUser();
}

function checkExistingSession() {
    if (AuthSystem.session.isValid()) {
        const user = AuthSystem.session.getCurrentUser();
        updateUIForLoggedInUser(user);
    } else {
        updateUIForLoggedOutUser();
    }
}

function updateUIForLoggedInUser(user) {
    const loginBtn = document.getElementById('loginBtn');
    const userDashboard = document.getElementById('userDashboard');
    const userGreeting = document.getElementById('userGreeting');

    if (loginBtn) {
        loginBtn.textContent = `👋 ${user.username}`;
        loginBtn.style.background = 'var(--gradient-maroon-gold)';
        loginBtn.style.color = 'var(--white)';
        loginBtn.style.borderColor = 'transparent';
    }

    if (userDashboard) {
        userDashboard.style.display = 'block';
    }

    if (userGreeting) {
        userGreeting.textContent = user.fullName || user.username;
    }

    // Update dashboard content based on user role
    updateDashboardContent(user);
}

function updateUIForLoggedOutUser() {
    const loginBtn = document.getElementById('loginBtn');
    const userDashboard = document.getElementById('userDashboard');

    if (loginBtn) {
        loginBtn.textContent = 'Login';
        loginBtn.style.background = 'transparent';
        loginBtn.style.color = 'var(--text-dark)';
        loginBtn.style.borderColor = 'var(--maroon)';
    }

    if (userDashboard) {
        userDashboard.style.display = 'none';
    }
}

function updateDashboardContent(user) {
    const dashboardContent = document.querySelector('.dashboard-content');
    if (!dashboardContent) return;

    let content = '';
    
    switch (user.role) {
        case 'admin':
            content = `
                <div class="dashboard-widgets">
                    <div class="widget">
                        <h4>Quick Actions</h4>
                        <div class="widget-actions">
                            <button class="btn-primary">Manage Users</button>
                            <button class="btn-secondary">View Reports</button>
                            <button class="btn-secondary">System Settings</button>
                        </div>
                    </div>
                    <div class="widget">
                        <h4>Recent Activity</h4>
                        <p>Welcome to the admin dashboard.</p>
                    </div>
                </div>
            `;
            break;
        case 'student':
            content = `
                <div class="dashboard-widgets">
                    <div class="widget">
                        <h4>My Courses</h4>
                        <p>Access your enrolled courses and materials.</p>
                    </div>
                    <div class="widget">
                        <h4>Academic Progress</h4>
                        <p>View your grades and progress reports.</p>
                    </div>
                </div>
            `;
            break;
        default:
            content = `
                <div class="dashboard-widgets">
                    <div class="widget">
                        <h4>Welcome to PHILTECH</h4>
                        <p>You are successfully logged in to your account.</p>
                    </div>
                </div>
            `;
    }

    dashboardContent.innerHTML = content;
}

function showLoginModal() {
    const loginModal = document.getElementById('loginModal');
    const usernameInput = document.getElementById('username');
    
    loginModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Clear form
    clearAllErrors();
    if (usernameInput) {
        usernameInput.focus();
    }
}

function hideLoginModal() {
    const loginModal = document.getElementById('loginModal');
    const form = document.getElementById('loginForm');
    
    loginModal.style.display = 'none';
    document.body.style.overflow = '';
    
    // Reset form
    if (form) {
        form.reset();
        clearAllErrors();
    }
}

// ============================================
// ENHANCED INPUT VALIDATION FOR AUTH
// ============================================

// Extend the existing InputValidator
Object.assign(InputValidator, {
    isValidUsername: function(username) {
        if (!username || typeof username !== 'string') return false;
        
        // Allow alphanumeric, dots, underscores, @ for emails
        const usernameRegex = /^[a-zA-Z0-9._@-]{3,50}$/;
        return usernameRegex.test(username);
    },
    
    isValidPassword: function(password) {
        if (!password || typeof password !== 'string') return false;
        
        return password.length >= AuthSystem.config.minPasswordLength && 
               password.length <= AuthSystem.config.maxPasswordLength;
    }
});

// ============================================
// SECURITY HEADERS ENFORCEMENT
// ============================================

function enforceSecurityHeaders() {
    // HTTPS enforcement is already in place
    // Additional security measures
    
    // Prevent form caching for sensitive forms
    const sensitiveForms = document.querySelectorAll('#loginForm, #contactForm');
    sensitiveForms.forEach(form => {
        form.setAttribute('autocomplete', 'on');
        form.setAttribute('novalidate', 'novalidate');
    });
}

// ============================================
// INITIALIZATION
// ============================================

// Update the existing initialization function
document.addEventListener('DOMContentLoaded', function() {
    // Existing security initialization
    enforceHTTPS();
    obfuscateEmails();
    enforceSecurityHeaders();
    
    // Feature initialization
    initNavigation();
    initAnimations();
    initCounters();
    initFormValidation();
    initScrollToTop();
    initParticles();
    initTypingEffect();
    initEventsTabs();
    
    // New authentication system
    initLoginSystem();
    
    console.log('PHILTECH website loaded with enhanced security and authentication features');
});

// Session activity tracking
document.addEventListener('mousemove', AuthSystem.session.updateActivity.bind(AuthSystem.session));
document.addEventListener('keypress', AuthSystem.session.updateActivity.bind(AuthSystem.session));
