const checkbox = document.querySelector(".jsCheck");
var rightColumn = document.querySelector(".jsRightColumn");
let leftColumn = document.querySelector(".jsLeftColumn");

// Function to hide the right column
const hideRightColumn = () => {
  if (window.innerWidth > 865) {
    rightColumn.style.right = "-28%";
    leftColumn.style.marginRight = "0";
    rightColumn.style.width = "0%";
    leftColumn.style.width = "100%";
  } else {
    rightColumn.style.display = "none";
    leftColumn.style.width = "100%";
  }
};

// Function to show the right column
const showRightColumn = () => {
  if (window.innerWidth > 865) {
    rightColumn.style.width = "28%";
    leftColumn.style.width = "70%";
    rightColumn.style.right = "0";
  } else {
    rightColumn.style.display = "block";
    rightColumn.style.width = "100%";
    leftColumn.style.width = "100%";
    rightColumn.style.right = "0";
  }
};

// Function to adjust columns based on window size and checkbox state
const adjustColumns = () => {
  if (checkbox.checked) {
    showRightColumn();
  } else {
    hideRightColumn();
  }
};

// Initial check to show/hide right column based on checkbox state
const initCheckbox = () => {
  adjustColumns();
  checkbox.addEventListener("change", adjustColumns);
};

// Adjust columns on window resize
window.addEventListener("resize", adjustColumns);

export { initCheckbox };
