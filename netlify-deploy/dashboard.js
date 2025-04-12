document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('evaluationForm');
  const profileButton = document.getElementById('profileButton');
  const profileDropdown = document.getElementById('profileDropdown');
  const userDisplayName = document.getElementById('user-display-name');
  const logoutButton = document.getElementById('logout-button');

  // Toggle profile dropdown
  profileButton.addEventListener("click", (e) => {
    e.stopPropagation();
    profileDropdown.classList.toggle("show");
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (!profileButton.contains(e.target)) {
      profileDropdown.classList.remove("show");
    }
  });

  // Logout functionality
  if (logoutButton) {
    logoutButton.addEventListener("click", (e) => {
      e.preventDefault();

      firebase
        .auth()
        .signOut()
        .then(() => {
          // Sign-out successful
          console.log("User signed out successfully");
          localStorage.removeItem("userEmail");
          localStorage.removeItem("userName");
          window.location.href = "index.html";
        })
        .catch((error) => {
          // An error happened
          console.error("Error signing out:", error);
          alert("Failed to sign out: " + error.message);
        });
    });
  }

  // Update API URL to work with Netlify environment variables
  const apiUrl = window.netlifyEnv?.API_URL || "http://localhost:5070";

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      // Get form elements by ID
      const nameInput = document.getElementById("userName");
      const ageInput = document.getElementById("userAge");
      const genderSelect = document.getElementById("userGender");
      const permittivityInput = document.getElementById("userPermittivity");

      // Basic validation
      if (!genderSelect || !genderSelect.value) {
        throw new Error("Gender is required");
      }

      if (!ageInput || ageInput.value === "") {
        throw new Error("Age is required");
      }

      if (!permittivityInput || permittivityInput.value === "") {
        throw new Error("Permittivity value is required");
      }

      // Convert permittivity to float
      const permittivityValue = parseFloat(permittivityInput.value);

      if (isNaN(permittivityValue)) {
        throw new Error("Permittivity must be a valid number");
      }

      // Create the form data object with selected values
      const formData = {
        name: nameInput ? nameInput.value : "",
        age: ageInput ? parseInt(ageInput.value) || 0 : 0,
        gender: genderSelect ? genderSelect.value : "",
        permittivity: permittivityValue
      };

      console.log("Form data being sent:", formData);

      // Show loading state
      const submitBtn = form.querySelector('.evaluate-btn');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Processing...';

      try {
        // First try to access the test endpoint to check connectivity
        await fetch(`${apiUrl}/test`);
        
        // Now send the actual prediction request
        const response = await fetch(`${apiUrl}/predict`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to get prediction');
        }
        
        const responseData = await response.json();
        console.log('API response data:', responseData);
        
        // Store both form data and results
        localStorage.setItem('userDetails', JSON.stringify({
          ...formData,
          results: responseData
        }));
        
        // Redirect to results page
        window.location.href = 'results.html';
      } catch (networkError) {
        console.error('Network error:', networkError);
        alert(`Failed to connect to the API server at ${apiUrl}. Please make sure the server is running.\n\nError: ${networkError.message}`);
        
        // Restore button state
        submitBtn.disabled = false;
        submitBtn.textContent = 'Evaluate';
      }
    } catch (error) {
      console.error('Form error:', error);
      alert(`An error occurred: ${error.message}`);
      
      // Restore button state if there was an error
      const submitBtn = form.querySelector('.evaluate-btn');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Evaluate';
      }
    }
  });
});
