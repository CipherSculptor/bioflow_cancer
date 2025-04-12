document.addEventListener("DOMContentLoaded", () => {
  const profileButton = document.getElementById("profileButton");
  const profileDropdown = document.getElementById("profileDropdown");

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

  try {
    // Load user details and results
    const userData = JSON.parse(localStorage.getItem("userDetails") || "{}");
    console.log("User data from localStorage:", userData);

    // Check if we have prediction results
    if (!userData.results) {
      console.error("No results found in localStorage");
      alert("No results found. Redirecting to dashboard.");
      window.location.href = "dashboard.html";
      return;
    }

    // Display results in the form
    document.getElementById("resultName").value = userData.results.name || "-";

    // Blood group has been removed from the API

    // Display hemoglobin with status
    const hemoglobinInput = document.getElementById("resultHemoglobin");
    hemoglobinInput.value = userData.results.hemoglobin || "-";
    if (userData.results.hemoglobin_status) {
      applyStatusStyling(hemoglobinInput, userData.results.hemoglobin_status);
    }

    // Display RBC count with status
    const rbcInput = document.getElementById("resultRBCCount");
    rbcInput.value = userData.results.rbc_count || "-";
    if (userData.results.rbc_status) {
      applyStatusStyling(rbcInput, userData.results.rbc_status);
    }

    // Display platelets count with status
    const plateletsInput = document.getElementById("resultPlateletsCount");
    plateletsInput.value = userData.results.platelets_count || "-";
    if (userData.results.platelets_status) {
      applyStatusStyling(plateletsInput, userData.results.platelets_status);
    }

    // Add WBC count display if it exists in the page
    const wbcInput = document.getElementById("resultWBCCount");
    if (wbcInput && userData.results.wbc_count) {
      wbcInput.value = userData.results.wbc_count;
      if (userData.results.wbc_status) {
        applyStatusStyling(wbcInput, userData.results.wbc_status);
      }
    }

    console.log("Results displayed successfully");
  } catch (error) {
    console.error("Error loading results:", error);
    alert("Error loading results: " + error.message);
  }
});

// Function to apply styling based on status
function applyStatusStyling(element, status) {
  // Remove any existing status classes
  element.classList.remove("status-low", "status-normal", "status-high");

  // Add appropriate status class
  element.classList.add(`status-${status}`);

  // Add a status indicator element after the input
  const container = element.parentElement;

  // Remove any existing status indicators
  const existingIndicator = container.querySelector(".status-indicator");
  if (existingIndicator) {
    container.removeChild(existingIndicator);
  }

  // Create new status indicator
  const statusIndicator = document.createElement("div");
  statusIndicator.className = `status-indicator ${status}`;
  statusIndicator.textContent =
    status.charAt(0).toUpperCase() + status.slice(1);
  container.appendChild(statusIndicator);
}

// Function to generate and download PDF
function generatePDF() {
  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Add header
    doc.setFontSize(22);
    doc.setTextColor(120, 3, 3);
    doc.text("BioFlow - Blood Test Results", 105, 20, { align: "center" });

    // Add date
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    const today = new Date();
    doc.text(`Date: ${today.toLocaleDateString()}`, 105, 30, {
      align: "center",
    });

    // Add content
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);

    const name = document.getElementById("resultName").value;
    // Blood group has been removed from the API
    const hemoglobin = document.getElementById("resultHemoglobin").value;
    const rbcCount = document.getElementById("resultRBCCount").value;
    const plateletsCount = document.getElementById(
      "resultPlateletsCount"
    ).value;
    const wbcCount = document.getElementById("resultWBCCount")?.value || "";

    // Get status information if available
    const userData = JSON.parse(localStorage.getItem("userDetails") || "{}");
    const hemoglobinStatus = userData.results?.hemoglobin_status || "";
    const rbcStatus = userData.results?.rbc_status || "";
    const plateletsStatus = userData.results?.platelets_status || "";
    const wbcStatus = userData.results?.wbc_status || "";

    // Add results with status
    doc.text(`Name: ${name}`, 20, 50);
    // Blood group has been removed from the API

    // Hemoglobin with status
    doc.text(`Hemoglobin: ${hemoglobin}`, 20, 90);
    if (hemoglobinStatus) {
      doc.setFontSize(12);
      setStatusColor(doc, hemoglobinStatus);
      doc.text(`Status: ${hemoglobinStatus.toUpperCase()}`, 150, 90);
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
    }

    // RBC Count with status
    doc.text(`RBC Count: ${rbcCount}`, 20, 110);
    if (rbcStatus) {
      doc.setFontSize(12);
      setStatusColor(doc, rbcStatus);
      doc.text(`Status: ${rbcStatus.toUpperCase()}`, 150, 110);
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
    }

    // WBC Count with status (if available)
    let currentY = 130;
    if (wbcCount) {
      doc.text(`WBC Count: ${wbcCount}`, 20, currentY);
      if (wbcStatus) {
        doc.setFontSize(12);
        setStatusColor(doc, wbcStatus);
        doc.text(`Status: ${wbcStatus.toUpperCase()}`, 150, currentY);
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
      }
      currentY += 20;
    }

    // Platelets Count with status
    doc.text(`Platelets Count: ${plateletsCount}`, 20, currentY);
    if (plateletsStatus) {
      doc.setFontSize(12);
      setStatusColor(doc, plateletsStatus);
      doc.text(`Status: ${plateletsStatus.toUpperCase()}`, 150, currentY);
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
    }

    // Add footer
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(
      "This report is generated by BioFlow. Results are based on machine learning predictions.",
      105,
      250,
      { align: "center" }
    );

    // Save the PDF
    doc.save(`BioFlow_Report_${name.replace(/\s+/g, "_")}.pdf`);

    console.log("PDF generated successfully");
  } catch (error) {
    console.error("Error generating PDF:", error);
    alert("Error generating PDF: " + error.message);
  }
}

// Helper function to set PDF text color based on status
function setStatusColor(doc, status) {
  switch (status) {
    case "low":
      doc.setTextColor(255, 0, 0); // Red
      break;
    case "high":
      doc.setTextColor(255, 165, 0); // Orange
      break;
    case "normal":
      doc.setTextColor(0, 128, 0); // Green
      break;
    default:
      doc.setTextColor(0, 0, 0); // Black
  }
}
