import { updateMetadata } from "./metadata.js";
import { populateModalIndex } from "./pdf.js";
import { data } from "./data/issue-example.js";
import { pageNum } from "./pdf.js";

const modal = document.querySelector(".jsModal");
const openModalBtn = document.querySelector(".jsOpenModalBtn");
const closeBtn = modal.querySelector(".close");
const buttons = document.querySelectorAll(".button");
const toggleButton = document.querySelector(".jsCheck"); // Mengganti checkbox dengan button biasa
const rightColumn = document.querySelector(".jsRightColumn");
const leftColumn = document.querySelector(".jsLeftColumn");

// Modal
const initSwitchButton = () => {
  // Handle button clicks to switch "special" class
  buttons.forEach((button) => {
    button.addEventListener("click", function () {
      console.log('Button clicked:', this);
      // Check if the clicked button is already active
      if (this.classList.contains("special")) {
        // If yes, deactivate it
        this.classList.remove("special");
        this.style.backgroundColor = "grey"; // Deactivate the button
        hideRightColumn(); // Hide the right column
      } else {
        // If no, deactivate all buttons first
        deactivateAllButtons();
        // Activate the clicked button
        this.classList.add("special");
        this.style.backgroundColor = "#e06e38"; // Set active button color
        updateMetadata(pageNum); // Update metadata based on the button clicked
        showRightColumn(); // Show the right column
      }
    });
  });

  // Open/close the modal and toggle right column when the button is clicked
  openModalBtn.addEventListener("click", () => {
    console.log('Open Modal Button clicked');
    if (openModalBtn.classList.contains('active')) {
      openModalBtn.classList.remove('active');
      openModalBtn.style.backgroundColor = 'grey';
      modal.style.display = 'none';
      hideRightColumn();
    } else {
      deactivateAllButtons(); // Deactivate all buttons first
      openModalBtn.classList.add('active');
      openModalBtn.style.backgroundColor = '#e06e38';
      populateModalIndex(data.indexes); // Tampilkan isi modal index
      showRightColumn();
    }
  });

  // Close the modal when the close button (x) is clicked
  closeBtn.addEventListener("click", () => {
    console.log('Close Button clicked');
    modal.style.display = "none";
    openModalBtn.classList.remove('active');
    openModalBtn.style.backgroundColor = 'grey';
    hideRightColumn();
  });

  // Close the modal when clicking outside of it
  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      console.log('Clicked outside modal');
      modal.style.display = "none";
      openModalBtn.classList.remove('active');
      openModalBtn.style.backgroundColor = 'grey';
      hideRightColumn();
    }
  });

  // Hide the right column
  const hideRightColumn = () => {
    console.log('Hiding right column');
    if (window.innerWidth > 865) {
      rightColumn.style.right = "-28%";
      rightColumn.style.width = "0%";
      leftColumn.style.width = "100%";
    } else {
      rightColumn.style.display = "none";
      leftColumn.style.width = "100%";
    }
  };

  // Show the right column
  const showRightColumn = () => {
    console.log('Showing right column');
    if (window.innerWidth > 865) {
      rightColumn.style.width = "28%";
      leftColumn.style.width = "70%";
      rightColumn.style.right = "0";
    } else {
      rightColumn.style.display = "block";
      rightColumn.style.width = "100%";
      leftColumn.style.width = "100%";
    }
  };

  // Adjust columns based on window size and button state
  const adjustColumns = () => {
    console.log('Adjusting columns');
    if (openModalBtn.classList.contains('active')) {
      populateModalIndex(data.indexes); // Tampilkan isi modal index
      showRightColumn();
    } else if (toggleButton.classList.contains('active')) { // Cek status button biasa
      updateMetadata(pageNum); // Tampilkan metadata untuk halaman saat ini
      showRightColumn();
    } else {
      hideRightColumn();
    }
  };

  // Initialize the toggle button state
  const initToggleButton = () => {
    console.log('Initializing toggle button');
    toggleButton.classList.add('active');
    toggleButton.style.backgroundColor = '#e06e38'; // Set initial background color
    updateMetadata(pageNum); // Tampilkan metadata untuk halaman saat ini
    showRightColumn();

    toggleButton.addEventListener("click", () => {
      console.log('Toggle button clicked');
      if (toggleButton.classList.contains('active')) {
        toggleButton.classList.remove('active');
        toggleButton.style.backgroundColor = 'grey';
        hideRightColumn();
      } else {
        deactivateAllButtons(); // Deactivate all buttons first
        toggleButton.classList.add('active');
        toggleButton.style.backgroundColor = '#e06e38';
        updateMetadata(pageNum); // Tampilkan metadata untuk halaman saat ini
        showRightColumn();
      }
    });
  };

  initToggleButton();

  // Adjust columns on window resize
  window.addEventListener("resize", adjustColumns);

  const deactivateAllButtons = () => {
    console.log('Deactivating all buttons');
    buttons.forEach((button) => {
      button.classList.remove('special');
      button.style.backgroundColor = 'grey'; // Ensure background color is grey
    });
    openModalBtn.classList.remove('active');
    openModalBtn.style.backgroundColor = 'grey';
    toggleButton.classList.remove('active');
    toggleButton.style.backgroundColor = 'grey'; // Ensure background color is grey
  };

  // Initial call to set the correct state
  adjustColumns();
};

// Export the function
export { initSwitchButton };