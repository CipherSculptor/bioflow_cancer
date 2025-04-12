// Results.js - Complete rewrite with same functionality but no bloodGroup references
document.addEventListener("DOMContentLoaded", () => {
  // Get DOM elements
  const profileButton = document.getElementById("profileButton");
  const profileDropdown = document.getElementById("profileDropdown");

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

  try {
    // Load user details and results
    console.log("Loading user details from localStorage");
    const userDetailsStr = localStorage.getItem("userDetails");
    
    if (!userDetailsStr) {
      console.error("No user details found in localStorage");
      alert("No results found. Redirecting to dashboard.");
      window.location.href = "dashboard.html";
      return;
    }
    
    console.log("Raw user details:", userDetailsStr);
    
    // Parse user data
    const userData = JSON.parse(userDetailsStr);
    console.log("Parsed user data:", userData);
    
    // Check if we have prediction results
    if (!userData.results) {
      console.error("No results found in user data");
      alert("No results found. Redirecting to dashboard.");
      window.location.href = "dashboard.html";
      return;
    }
    
    // Log available result keys for debugging
    console.log("Available result keys:", Object.keys(userData.results));
    
    // Display results in the form
    // Name
    const nameElement = document.getElementById("resultName");
    if (nameElement) {
      nameElement.value = userData.results.name || userData.name || "-";
    }
    
    // Hemoglobin
    const hemoglobinInput = document.getElementById("resultHemoglobin");
    if (hemoglobinInput) {
      hemoglobinInput.value = userData.results.hemoglobin || "-";
      if (userData.results.hemoglobin_status) {
        applyStatusStyling(hemoglobinInput, userData.results.hemoglobin_status);
      }
    }
    
    // RBC count
    const rbcInput = document.getElementById("resultRBCCount");
    if (rbcInput) {
      rbcInput.value = userData.results.rbc_count || "-";
      if (userData.results.rbc_status) {
        applyStatusStyling(rbcInput, userData.results.rbc_status);
      }
    }
    
    // WBC count
    const wbcInput = document.getElementById("resultWBCCount");
    if (wbcInput) {
      wbcInput.value = userData.results.wbc_count || "-";
      if (userData.results.wbc_status) {
        applyStatusStyling(wbcInput, userData.results.wbc_status);
      }
    }
    
    // Platelets count
    const plateletsInput = document.getElementById("resultPlateletsCount");
    if (plateletsInput) {
      plateletsInput.value = userData.results.platelets_count || "-";
      if (userData.results.platelets_status) {
        applyStatusStyling(plateletsInput, userData.results.platelets_status);
      }
    }
    
    console.log("Results displayed successfully");
  } catch (error) {
    console.error("Error loading results:", error);
    alert("Error loading results: " + error.message);
    
    // Try to recover by redirecting back to dashboard
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 3000);
  }
});

// Function to apply styling based on status
function applyStatusStyling(element, status) {
  if (!element) return;
  
  // Remove any existing status classes
  element.classList.remove("normal", "low", "high");
  
  // Add appropriate class based on status
  if (status.toLowerCase() === "normal") {
    element.classList.add("normal");
  } else if (status.toLowerCase() === "low") {
    element.classList.add("low");
  } else if (status.toLowerCase() === "high") {
    element.classList.add("high");
  }
}

// PDF generation function
function generatePDF() {
  try {
    console.log("Generating PDF");
    const { jsPDF } = window.jspdf;
    
    if (!jsPDF) {
      throw new Error("jsPDF library not loaded");
    }
    
    // Create new PDF document
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
    
    // Add header
    doc.setFontSize(22);
    doc.setTextColor(120, 3, 3);
    doc.text("BioFlow - CBC Test Results", 105, 20, { align: "center" });
    
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
    
    // Get values from form
    const name = document.getElementById("resultName")?.value || "-";
    const hemoglobin = document.getElementById("resultHemoglobin")?.value || "-";
    const rbcCount = document.getElementById("resultRBCCount")?.value || "-";
    const plateletsCount = document.getElementById("resultPlateletsCount")?.value || "-";
    const wbcCount = document.getElementById("resultWBCCount")?.value || "-";
    
    // Get user data for status information
    const userData = JSON.parse(localStorage.getItem("userDetails") || "{}");
    const hemoglobinStatus = userData.results?.hemoglobin_status || "";
    const rbcStatus = userData.results?.rbc_status || "";
    const plateletsStatus = userData.results?.platelets_status || "";
    const wbcStatus = userData.results?.wbc_status || "";
    
    // Add results with status
    doc.text(`Name: ${name}`, 20, 50);
    
    // Hemoglobin with status
    doc.text(`Hemoglobin: ${hemoglobin}`, 20, 70);
    if (hemoglobinStatus) {
      doc.setTextColor(getStatusColor(hemoglobinStatus));
      doc.text(`(${hemoglobinStatus})`, 120, 70);
      doc.setTextColor(0, 0, 0);
    }
    
    // RBC count with status
    doc.text(`RBC Count: ${rbcCount}`, 20, 90);
    if (rbcStatus) {
      doc.setTextColor(getStatusColor(rbcStatus));
      doc.text(`(${rbcStatus})`, 120, 90);
      doc.setTextColor(0, 0, 0);
    }
    
    // WBC count with status
    doc.text(`WBC Count: ${wbcCount}`, 20, 110);
    if (wbcStatus) {
      doc.setTextColor(getStatusColor(wbcStatus));
      doc.text(`(${wbcStatus})`, 120, 110);
      doc.setTextColor(0, 0, 0);
    }
    
    // Platelets count with status
    doc.text(`Platelets Count: ${plateletsCount}`, 20, 130);
    if (plateletsStatus) {
      doc.setTextColor(getStatusColor(plateletsStatus));
      doc.text(`(${plateletsStatus})`, 120, 130);
      doc.setTextColor(0, 0, 0);
    }
    
    // Add footer
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(
      "This is a computer-generated report and does not require a signature.",
      105,
      280,
      { align: "center" }
    );
    
    // Save the PDF
    doc.save(`BioFlow_CBC_Results_${name.replace(/\s+/g, "_")}.pdf`);
    console.log("PDF generated successfully");
  } catch (error) {
    console.error("Error generating PDF:", error);
    alert("Failed to generate PDF: " + error.message);
  }
}

// Helper function to get color based on status
function getStatusColor(status) {
  if (status.toLowerCase() === "normal") {
    return [0, 128, 0]; // Green
  } else if (status.toLowerCase() === "low") {
    return [255, 0, 0]; // Red
  } else if (status.toLowerCase() === "high") {
    return [255, 165, 0]; // Orange
  }
  return [0, 0, 0]; // Default black
}
