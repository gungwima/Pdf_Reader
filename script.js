document.addEventListener("DOMContentLoaded", (event) => {
  const checkbox = document.getElementById("check");
  const rightColumn = document.querySelector(".right-column");
  const leftColumn = document.querySelector(".left-column");
  const fullWidthButton = document.getElementById("fullWidthButton");
  const fullViewButton = document.getElementById("fullView");
  const scrollableContent = document.querySelector(".scrollable-content");

  // Initial check to show/hide right column based on checkbox state
  if (checkbox.checked) {
    showRightColumn();
  } else {
    hideRightColumn();
  }

  checkbox.addEventListener("change", () => {
    if (checkbox.checked) {
      showRightColumn();
    } else {
      hideRightColumn();
    }
  });

  fullWidthButton.addEventListener("click", () => {
    toggleFullWidthView();
  });
  fullViewButton.addEventListener("click", () => {
    toggleFullView();
  });

  function showRightColumn() {
    rightColumn.classList.remove("hidden");
    leftColumn.classList.remove("full-width");
  }

  function hideRightColumn() {
    rightColumn.classList.add("hidden");
    leftColumn.classList.add("full-width");
  }

  function toggleFullWidthView() {
    scrollableContent.classList.add("full-view");
  }

  function toggleFullView() {
    scrollableContent.classList.remove("full-view");
  }
});

// Get the modal element
const modal = document.getElementById("myModal");

// Get the button that opens the modal
const openModalBtn = document.getElementById("openModalBtn");

// Get the <span> element that closes the modal
const closeBtn = modal.querySelector(".close");

// When the user clicks the button, open the modal
openModalBtn.addEventListener("click", () => {
  modal.style.display = "block";
});

// When the user clicks on <span> (x), close the modal
closeBtn.addEventListener("click", () => {
  modal.style.display = "none";
});

// When the user clicks anywhere outside of the modal, close it
window.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.style.display = "none";
  }
});

//for zoom in and zoom out button
let zoomLevel = 100;

function zoomIn() {
  zoomLevel += 10;
  if (zoomLevel > 200) zoomLevel = 200; // limit zoom level to 200%
  updateZoom();
}

function zoomOut() {
  zoomLevel -= 10;
  if (zoomLevel < 50) zoomLevel = 50; // limit zoom level to 50%
  updateZoom();
}

function updateZoom() {
  document.querySelector(".maximizeButton span").innerText = zoomLevel + "%";
  const scale = zoomLevel / 100;
  document.querySelector(".boxTop").style.transform = `scale(${scale})`;

  // Iterasi untuk setiap elemen di dalam .boxTop.scrollable-content
  boxTopContent.forEach((element) => {
    element.style.transform = `scale(${1 / scale})`;
  });
}

// button for download
document.getElementById("download-btn").addEventListener("click", function () {
  var content = document.getElementById("content");

  var opt = {
    margin: 1,
    filename: "content.pdf",
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
  };

  // Use html2pdf to convert the content to PDF and download it
  html2pdf().set(opt).from(content).save();
});
// end button for download
