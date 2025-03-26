document.addEventListener('DOMContentLoaded', () => {
    console.log('Signup page loaded');
    
    const signupForm = document.getElementById('signupForm');
    const signupStatus = document.getElementById('signup-status');
    
    if (!signupForm) {
        console.error('ERROR: signupForm not found!');
    } else {
        console.log('signupForm found successfully');
    }
    
    if (!signupStatus) {
        console.error('ERROR: signupStatus not found!');
    } else {
        console.log('signupStatus found successfully');
    }
    
    // Check if Firebase is initialized
    if (typeof firebase === 'undefined') {
        console.error('ERROR: Firebase is not defined. Check if the Firebase SDK is loaded correctly.');
    } else {
        console.log('Firebase is defined');
        try {
            // Check if auth is available
            if (firebase.auth) {
                console.log('Firebase auth is available');
            } else {
                console.error('ERROR: Firebase auth is not available');
            }
        } catch (e) {
            console.error('ERROR checking Firebase auth:', e);
        }
    }
    
    // Helper function to show status messages
    function showMessage(message, isError = false) {
        console.log('Showing message:', message, 'isError:', isError);
        signupStatus.textContent = message;
        signupStatus.style.display = 'block';
        signupStatus.style.backgroundColor = isError ? '#ffdddd' : '#ddffdd';
        signupStatus.style.color = isError ? '#990000' : '#006600';
        
        // Hide the message after 5 seconds
        setTimeout(() => {
            signupStatus.style.display = 'none';
        }, 5000);
    }
    
    // Email/Password Signup
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            console.log('Signup form submitted');
            e.preventDefault();
            
            const displayName = document.getElementById('displayName').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            console.log('Form values:', {
                displayName: displayName ? '(provided)' : '(empty)',
                email: email ? '(provided)' : '(empty)',
                password: password ? '(provided)' : '(empty)', 
                confirmPassword: confirmPassword ? '(provided)' : '(empty)'
            });
            
            // Validate passwords match
            if (password !== confirmPassword) {
                console.log('Passwords do not match');
                showMessage('Passwords do not match', true);
                return;
            }
            
            // Validate password strength (minimum 6 characters)
            if (password.length < 6) {
                console.log('Password too short');
                showMessage('Password must be at least 6 characters long', true);
                return;
            }
            
            showMessage('Creating your account...');
            console.log('Attempting to create user with email and password');
            
            // Create user with email and password
            try {
                firebase.auth().createUserWithEmailAndPassword(email, password)
                    .then((userCredential) => {
                        // Signed up 
                        console.log('User created successfully');
                        const user = userCredential.user;
                        
                        // Update the display name
                        console.log('Updating display name');
                        return user.updateProfile({
                            displayName: displayName
                        });
                    })
                    .then(() => {
                        console.log('User profile updated with display name');
                        showMessage('Account created successfully! Redirecting...');
                        
                        // Redirect to dashboard after successful signup
                        setTimeout(() => {
                            window.location.href = 'dashboard.html';
                        }, 1500);
                    })
                    .catch((error) => {
                        console.error('Signup error:', error.code, error.message);
                        
                        // Handle specific error codes
                        if (error.code === 'auth/email-already-in-use') {
                            showMessage('This email is already registered. Please log in instead.', true);
                        } else if (error.code === 'auth/invalid-email') {
                            showMessage('Please enter a valid email address.', true);
                        } else if (error.code === 'auth/weak-password') {
                            showMessage('Password is too weak. Please use a stronger password.', true);
                        } else {
                            showMessage('Signup failed: ' + error.message, true);
                        }
                    });
            } catch (error) {
                console.error('Exception during createUserWithEmailAndPassword:', error);
                showMessage('Signup failed: ' + error.message, true);
            }
        });
    }
}); 