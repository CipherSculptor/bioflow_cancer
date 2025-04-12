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
  const apiUrl = window.netlifyEnv?.API_URL || "https://bioflow.onrender.com";

  // Add loading overlay styles if not already in CSS
  if (!document.getElementById("loading-styles")) {
    const style = document.createElement("style");
    style.id = "loading-styles";
    style.textContent = `
            #loading-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.7);
                display: flex;
                justify-content: center;
                align-items: center;
                flex-direction: column;
                z-index: 1000;
                color: white;
                font-size: 1.2rem;
            }

            .loading-spinner {
                width: 50px;
                height: 50px;
                border: 5px solid rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                border-top-color: #fff;
                animation: spin 1s ease-in-out infinite;
                margin-bottom: 20px;
            }

            @keyframes spin {
                to { transform: rotate(360deg); }
            }

            .loading-message {
                margin-top: 15px;
                text-align: center;
                max-width: 80%;
            }

            .timeout-btn {
                margin-top: 20px;
                padding: 8px 16px;
                background-color: #4d68b2;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            }

            .timeout-btn:hover {
                background-color: #3a4f87;
            }
        `;
    document.head.appendChild(style);
  }

  // Show enhanced loading state
  function showLoadingState(message = "Processing your request...") {
    // Create loading overlay if it doesn't exist
    let loadingOverlay = document.getElementById("loading-overlay");

    if (!loadingOverlay) {
      loadingOverlay = document.createElement("div");
      loadingOverlay.id = "loading-overlay";
      loadingOverlay.innerHTML = `
                <div class="loading-spinner"></div>
                <div class="loading-message">${message}</div>
            `;
      document.body.appendChild(loadingOverlay);
    } else {
      const messageEl = loadingOverlay.querySelector(".loading-message");
      if (messageEl) messageEl.textContent = message;
      loadingOverlay.style.display = "flex";
    }

    // Disable the submit button
    const submitBtn = form.querySelector(".evaluate-btn");
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Processing...";
    }
  }

  // Hide loading state
  function hideLoadingState() {
    const loadingOverlay = document.getElementById("loading-overlay");
    if (loadingOverlay) {
      loadingOverlay.style.display = "none";
    }

    // Re-enable the submit button
    const submitBtn = form.querySelector(".evaluate-btn");
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Evaluate";
    }
  }

  // Add a function to handle backend timeouts
  function handleLongRequest(timeout = 30000) {
    return new Promise((resolve, reject) => {
      // Set timeout
      const timeoutId = setTimeout(() => {
        const loadingOverlay = document.getElementById("loading-overlay");
        if (loadingOverlay) {
          const messageEl = loadingOverlay.querySelector(".loading-message");
          if (messageEl) {
            messageEl.innerHTML = `
                            The server is taking longer than expected.<br>
                            This might be because it's starting up after being inactive.<br><br>
                            <strong>Please wait</strong> or <button class="timeout-btn" id="cancel-request-btn">Cancel Request</button>
                        `;
          }

          // Add cancel button functionality
          const cancelBtn = document.getElementById("cancel-request-btn");
          if (cancelBtn) {
            cancelBtn.addEventListener("click", () => {
              hideLoadingState();
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
        permittivity: permittivityValue,
      };

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

        // Store both form data and results
        localStorage.setItem(
          "userDetails",
          JSON.stringify({
            ...formData,
            results: responseData,
          })
        );

        // Redirect to results page
        window.location.href = "results.html";
      } catch (networkError) {
        // Clear timeout
        clearTimeout();
        hideLoadingState();

        console.error("Network error:", networkError);

        if (
          networkError.message.includes("Failed to fetch") ||
          networkError.message.includes("NetworkError")
        ) {
          alert(
            `The server appears to be offline or unreachable. The backend might be experiencing issues or starting up. Please try again in a minute.`
          );
        } else {
          alert(`Error: ${networkError.message}`);
        }
      }
    } catch (error) {
      hideLoadingState();
      console.error("Form error:", error);
      alert(`Error: ${error.message}`);
    }
  });
});
