document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("evaluationForm");
  const profileButton = document.getElementById("profileButton");
  const profileDropdown = document.getElementById("profileDropdown");
  const userDisplayName = document.getElementById("user-display-name");
  const logoutButton = document.getElementById("logout-button");

  // Check authentication state
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      // User is signed in
      console.log("User is signed in:", user);

      // Update display name
      if (user.displayName) {
        userDisplayName.textContent = user.displayName;
      } else if (user.email) {
        // If no display name, use email without domain
        userDisplayName.textContent = user.email.split("@")[0];
      }

      // Store user info in localStorage for other pages
      localStorage.setItem("userEmail", user.email);
      if (user.displayName) {
        localStorage.setItem("userName", user.displayName);
      }

      // Optionally pre-fill the name field if it exists
      const nameInput = document.getElementById("userName");
      if (nameInput && user.displayName) {
        nameInput.value = user.displayName;
      }
    } else {
      // No user is signed in, redirect to login
      console.log("No user is signed in. Redirecting to login...");
      window.location.href = "index.html";
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

  // Update API URL to work with Netlify environment variables
  const apiUrl = window.netlifyEnv?.API_URL || "http://localhost:5070";

  // Show a better loading indicator
  function showLoadingState() {
    const submitBtn = form.querySelector(".evaluate-btn");
    submitBtn.disabled = true;
    submitBtn.textContent = "Processing...";

    // Add loading overlay if it doesn't exist
    if (!document.getElementById("loading-overlay")) {
      const loadingOverlay = document.createElement("div");
      loadingOverlay.id = "loading-overlay";
      loadingOverlay.innerHTML = `
                <div class="loading-spinner"></div>
                <p>Analyzing data...</p>
            `;
      document.body.appendChild(loadingOverlay);
    }
    document.getElementById("loading-overlay").style.display = "flex";
  }

  // Hide loading state
  function hideLoadingState() {
    const submitBtn = form.querySelector(".evaluate-btn");
    submitBtn.disabled = false;
    submitBtn.textContent = "Evaluate";

    const loadingOverlay = document.getElementById("loading-overlay");
    if (loadingOverlay) {
      loadingOverlay.style.display = "none";
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      // Get form elements by ID
      const nameInput = document.getElementById("userName");
      const ageInput = document.getElementById("userAge");
      const genderSelect = document.getElementById("userGender");
      const permittivityInput = document.getElementById("userPermittivity");

      console.log("Form elements:", {
        nameInput: nameInput ? nameInput.value : "not found",
        ageInput: ageInput ? ageInput.value : "not found",
        genderSelect: genderSelect ? genderSelect.value : "not found",
        permittivityInput: permittivityInput
          ? permittivityInput.value
          : "not found",
      });

      // Validate gender
      if (!genderSelect || !genderSelect.value) {
        throw new Error("Gender is required");
      }

      // Validate age
      if (!ageInput || ageInput.value === "") {
        throw new Error("Age is required");
      }

      // Validate permittivity value
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
        permittivity: permittivityValue, // Using the parsed float value
      };

      console.log("Form data being sent:", formData);

      // Show loading state
      showLoadingState();

      // Set a timeout to handle long-running requests
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(
          () => reject(new Error("Request timed out after 20 seconds")),
          20000
        );
      });

      // Send data to API with timeout
      console.log("Sending request to API...");
      try {
        // First try to access the test endpoint to check connectivity
        const testResponse = await Promise.race([
          fetch(`${apiUrl}/test`),
          timeoutPromise,
        ]);
        console.log("Test endpoint response:", testResponse.status);

        // Now send the actual prediction request with timeout
        const response = await Promise.race([
          fetch(`${apiUrl}/predict`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(formData),
          }),
          timeoutPromise,
        ]);

        console.log("API response status:", response.status);

        const responseData = await response.json();
        console.log("API response data:", responseData);

        if (!response.ok) {
          throw new Error(responseData.error || "Failed to get prediction");
        }

        // Store both form data and results
        localStorage.setItem(
          "userDetails",
          JSON.stringify({
            ...formData,
            results: responseData,
          })
        );

        console.log("Redirecting to results page...");
        // Redirect to results page
        window.location.href = "results.html";
      } catch (networkError) {
        console.error("Network error details:", networkError);
        hideLoadingState();

        if (networkError.message.includes("timed out")) {
          alert(
            `The request is taking longer than expected. The server might be busy or experiencing issues. Please try again in a moment.`
          );
        } else {
          alert(
            `Failed to connect to the API server at ${apiUrl}. Please make sure the server is running.\n\nError: ${networkError.message}`
          );
        }
      }
    } catch (error) {
      console.error("Error details:", error);
      hideLoadingState();
      alert(`An error occurred: ${error.message}`);
    }
  });
});
