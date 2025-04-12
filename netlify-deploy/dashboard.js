document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('evaluationForm');
  const profileButton = document.getElementById('profileButton');
  const profileDropdown = document.getElementById('profileDropdown');
  const userDisplayName = document.getElementById('user-display-name');
  const logoutButton = document.getElementById('logout-button');

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

  // Function to handle long-running requests
  async function handleLongRequest(timeout) {
    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        const loadingText = document.querySelector(".loading-text");
        if (loadingText) {
          loadingText.textContent =
            "This is taking longer than expected. Please wait...";

          // Add cancel button after timeout
          if (!document.querySelector(".cancel-btn")) {
            const cancelBtn = document.createElement("button");
            cancelBtn.className = "cancel-btn";
            cancelBtn.textContent = "Cancel";
            document.querySelector(".loading-overlay").appendChild(cancelBtn);

            cancelBtn.addEventListener("click", () => {
              hideLoadingState();
              resolve(() => clearTimeout(timeoutId));
              reject(new Error("Request cancelled by user"));
            });
          }
        }
      }, timeout);

      // Clear timeout on resolve
      resolve(() => clearTimeout(timeoutId));
    });
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

      // Debug: Log the form data being sent
      console.log("Form data being sent:", formData);

      // Show enhanced loading state
      showLoadingState("Getting ready to process your data...");

      // Start the timeout handler
      const clearTimeout = await handleLongRequest(5000);

      try {
        // Try to check API availability first
        showLoadingState("Connecting to the server...");

        // First try to ping the endpoint to wake up the server
        await fetch(`${apiUrl}/test`).catch(() => {
          // If ping fails, we still proceed with the main request
          console.log(
            "API ping failed, but continuing with prediction request"
          );
        });

        // Now send the actual prediction request
        showLoadingState("Analyzing data...");

        const response = await fetch(`${apiUrl}/predict`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(formData),
        });

        // Clear the timeout since request completed
        clearTimeout();

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to get prediction");
        }

        const responseData = await response.json();

        // Debug: Log the response data
        console.log("Response data received:", responseData);

        // Store both form data and results
        const userDetails = {
          ...formData,
          results: responseData,
        };

        // Debug: Log what we're storing in localStorage
        console.log("Storing in localStorage:", userDetails);

        localStorage.setItem("userDetails", JSON.stringify(userDetails));

        // Redirect to results page
        window.location.href = "results.html";
      } catch (networkError) {
        // Clear timeout
        clearTimeout();
        hideLoadingState();

        console.error("Network error:", networkError);
        console.error("Error stack:", networkError.stack);

        if (
          networkError.message.includes("Failed to fetch") ||
          networkError.message.includes("NetworkError")
        ) {
          alert(
            `The server appears to be offline or unreachable. The backend might be experiencing issues or starting up. Please try again in a minute.`
          );
        } else {
          // Show a more detailed error message
          alert(
            `Error: ${networkError.message}\n\nPlease check the browser console for more details.`
          );
        }
      }
    } catch (error) {
      hideLoadingState();
      console.error("Form error:", error);
      console.error("Error stack:", error.stack);
      alert(
        `Form Error: ${error.message}\n\nPlease check the browser console for more details.`
      );
    }
  });
});

// Loading state functions
function showLoadingState(message) {
  // Remove existing overlay if any
  hideLoadingState();

  // Create overlay
  const overlay = document.createElement("div");
  overlay.className = "loading-overlay";

  // Create spinner
  const spinner = document.createElement("div");
  spinner.className = "loading-spinner";
  overlay.appendChild(spinner);

  // Create text
  const text = document.createElement("div");
  text.className = "loading-text";
  text.textContent = message || "Loading...";
  overlay.appendChild(text);

  // Add to body
  document.body.appendChild(overlay);
}

function hideLoadingState() {
  const overlay = document.querySelector(".loading-overlay");
  if (overlay) {
    overlay.remove();
  }
}
