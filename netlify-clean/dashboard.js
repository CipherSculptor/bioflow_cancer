// Dashboard.js - Complete rewrite with same functionality but no bloodGroup references
document.addEventListener('DOMContentLoaded', () => {
  // Get DOM elements
  const form = document.getElementById('evaluationForm');
  const profileButton = document.getElementById('profileButton');
  const profileDropdown = document.getElementById('profileDropdown');
  const userDisplayName = document.getElementById('user-display-name');
  const logoutButton = document.getElementById('logout-button');

  // Toggle profile dropdown
  if (profileButton) {
    profileButton.addEventListener("click", (e) => {
      e.stopPropagation();
      profileDropdown.classList.toggle("show");
    });
  }

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (profileButton && !profileButton.contains(e.target)) {
      profileDropdown.classList.remove("show");
    }
  });

  // Logout functionality
  if (logoutButton) {
    logoutButton.addEventListener("click", (e) => {
      e.preventDefault();
      
      try {
        firebase.auth().signOut().then(() => {
          console.log("User signed out successfully");
          // Clear any stored data
          localStorage.clear();
          // Redirect to login page
          window.location.href = "index.html";
        }).catch((error) => {
          console.error("Error signing out:", error);
          alert("Failed to sign out: " + error.message);
        });
      } catch (error) {
        console.error("Error during logout:", error);
        // Fallback redirect
        window.location.href = "index.html";
      }
    });
  }

  // Update API URL to work with Netlify environment variables
  const apiUrl = window.netlifyEnv?.API_URL || "http://localhost:5070";
  console.log("Using API URL:", apiUrl);

  // Form submission handler
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      console.log("Form submitted");

      // Get form elements
      const nameInput = document.getElementById("userName");
      const ageInput = document.getElementById("userAge");
      const genderSelect = document.getElementById("userGender");
      const permittivityInput = document.getElementById("userPermittivity");
      
      // Get submit button for state management
      const submitBtn = form.querySelector('.evaluate-btn');
      
      try {
        // Validate inputs
        if (!nameInput || nameInput.value.trim() === "") {
          throw new Error("Name is required");
        }
        
        if (!ageInput || ageInput.value === "") {
          throw new Error("Age is required");
        }
        
        if (!genderSelect || !genderSelect.value) {
          throw new Error("Gender is required");
        }
        
        if (!permittivityInput || permittivityInput.value === "") {
          throw new Error("Permittivity value is required");
        }
        
        // Parse numeric values
        const age = parseInt(ageInput.value);
        const permittivity = parseFloat(permittivityInput.value);
        
        if (isNaN(age)) {
          throw new Error("Age must be a valid number");
        }
        
        if (isNaN(permittivity)) {
          throw new Error("Permittivity must be a valid number");
        }
        
        // Create request data object - explicitly only include needed fields
        const requestData = {
          name: nameInput.value.trim(),
          age: age,
          gender: genderSelect.value,
          permittivity: permittivity
        };
        
        console.log("Request data:", requestData);
        
        // Update button state
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = "Processing...";
        }
        
        // First check if API is available
        try {
          console.log("Testing API connection...");
          const testResponse = await fetch(`${apiUrl}/test`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json'
            }
          });
          
          if (!testResponse.ok) {
            throw new Error(`API test failed with status: ${testResponse.status}`);
          }
          
          console.log("API connection successful");
          
          // Now send the actual prediction request
          console.log("Sending prediction request...");
          const response = await fetch(`${apiUrl}/predict`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify(requestData)
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error("API error response:", errorText);
            throw new Error(`API request failed with status: ${response.status}`);
          }
          
          // Parse response
          const responseData = await response.json();
          console.log("API response:", responseData);
          
          // Store only the necessary data in localStorage
          const userDetails = {
            name: requestData.name,
            age: requestData.age,
            gender: requestData.gender,
            permittivity: requestData.permittivity,
            results: responseData
          };
          
          // Clear any existing data first
          localStorage.removeItem("userDetails");
          
          // Store new data
          localStorage.setItem("userDetails", JSON.stringify(userDetails));
          console.log("Data stored in localStorage");
          
          // Redirect to results page
          window.location.href = "results.html";
        } catch (apiError) {
          console.error("API error:", apiError);
          
          // Reset button state
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Evaluate";
          }
          
          // Show error message
          alert(`Failed to connect to the API server at ${apiUrl}. Please make sure the server is running.\n\nError: ${apiError.message}`);
        }
      } catch (validationError) {
        console.error("Validation error:", validationError);
        
        // Reset button state
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Evaluate";
        }
        
        // Show error message
        alert(validationError.message);
      }
    });
  } else {
    console.error("Form element not found");
  }
});
