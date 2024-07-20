const checkbox = document.getElementById("check");
const rightColumn = document.querySelector(".right-column");
const leftColumn = document.querySelector(".left-column");
const fullWidthButton = document.querySelector(".fullWidthButton");
const fullViewButton = document.querySelector(".fullView");
const contentContainer = document.querySelector(".content-container");
const boxTop = document.querySelector(".boxTop");
const modal = document.getElementById("myModal");
const openModalBtn = document.getElementById("openModalBtn");
const closeBtn = modal.querySelector(".close");
const buttons = document.querySelectorAll(".btnAc");

buttons.forEach((btnAc) => {
  btnAc.addEventListener("click", () => {
    document.querySelector(".special")?.classList.remove("special");
    btnAc.classList.add("special");
  });
});

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

// Function to toggle full width view
function toggleFullWidthView() {
  canvas.classList.add("full-view");
  contentContainer.classList.add("full-view");
  boxTop.classList.add("full-view");
}

// Function to toggle full view
function toggleFullView() {
  canvas.classList.remove("full-view");
  contentContainer.classList.remove("full-view");
  boxTop.classList.remove("full-view");
}

// Full Width Button
fullWidthButton.addEventListener("click", () => {
  toggleFullWidthView();
});

//Full View Button
fullViewButton.addEventListener("click", () => {
  toggleFullView();
});

// Function to show the right column
function showRightColumn() {
  rightColumn.classList.remove("hidden-rightColumn");
  leftColumn.classList.remove("full-width");
}

// Function to hide the right column
function hideRightColumn() {
  rightColumn.classList.add("hidden-rightColumn");
  leftColumn.classList.add("full-width");
}

// Modal
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

// Button for download

//Pdf JS
const url = "docs/test.pdf";

let pdfDoc = null,
  pageNum = 1,
  zoom = 1,
  canvas = document.getElementById("pdf-canvas"),
  ctx = canvas.getContext("2d", { willReadFrequently: true }),
  zoomInButton = document.querySelector(".zoomIn"),
  zoomOutButton = document.querySelector(".zoomOut"),
  zoomSpan = document.querySelector(".maximizeButton span"),
  pageNumInput = document.getElementById("page-num"),
  prevPageButton = document.getElementById("prev-page"),
  nextPageButton = document.getElementById("next-page"),
  downloadButton = document.getElementById("download-pdf"),
  printButton = document.getElementById("print-pdf"),
  maximizeButton = document.getElementById("maximize-button");

// Set workerSrc for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.9.359/pdf.worker.min.js";

console.log("Starting to load PDF from URL:", url);

// Fetch file PDF
fetch(url)
  .then((response) => {
    console.log("Fetch response status:", response.status);
    if (response.ok) {
      console.log("File PDF ditemukan");
      return response.arrayBuffer();
    } else {
      throw new Error(
        "File PDF tidak ditemukan. Status code: " + response.status
      );
    }
  })
  .then((arrayBuffer) => {
    console.log("ArrayBuffer byte length:", arrayBuffer.byteLength);
    if (arrayBuffer.byteLength === 0) {
      throw new Error("The PDF file is empty, i.e. its size is zero bytes.");
    }
    const typedArray = new Uint8Array(arrayBuffer);
    pdfjsLib
      .getDocument({ data: typedArray })
      .promise.then((pdfDoc_) => {
        console.log("PDF loaded successfully");
        pdfDoc = pdfDoc_;
        pageNumInput.max = pdfDoc.numPages;
        renderPage(pageNum);
      })
      .catch((error) => {
        console.error("Error loading PDF: ", error);
        alert("Failed to load PDF. Please try again later.");
      });
  })
  .catch((error) => {
    console.error("Error fetching PDF: ", error);
    alert("Failed to fetch PDF. Please check the file path and try again.");
  });

function renderPage(num) {
  pdfDoc
    .getPage(num)
    .then((page) => {
      console.log("Rendering page:", num);

      // Set scale to a higher value for higher resolution
      const scale = zoom;
      const viewport = page.getViewport({ scale: scale });

      // Set canvas dimensions to match viewport dimensions
      const outputScale = window.devicePixelRatio || 1;
      canvas.width = Math.floor(viewport.width * outputScale);
      canvas.height = Math.floor(viewport.height * outputScale);
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;

      // Context to match the higher resolution
      const transform =
        outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;

      const renderContext = {
        canvasContext: ctx,
        viewport: viewport,
        transform: transform,
      };

      page
        .render(renderContext)
        .promise.then(() => {
          console.log("Page rendered successfully");
          centerCanvas();
        })
        .catch((error) => {
          console.error("Error rendering page: ", error);
          alert("Failed to render page. Please try again later.");
        });
    })
    .catch((error) => {
      console.error("Error getting page: ", error);
      alert("Failed to get page. Please try again later.");
    });

  // Update page number input value
  pageNumInput.value = num;
  // Disable/enable buttons based on the page number
  prevPageButton.disabled = num <= 1;
  nextPageButton.disabled = num >= pdfDoc.numPages;
}

function onPageChange() {
  const newPageNum = parseInt(pageNumInput.value, 10);
  if (newPageNum > 0 && newPageNum <= pdfDoc.numPages) {
    pageNum = newPageNum;
    renderPage(pageNum);
  }
}

function onPrevPage() {
  if (pageNum <= 1) {
    return;
  }
  pageNum--;
  renderPage(pageNum);
}

function onNextPage() {
  if (pageNum >= pdfDoc.numPages) {
    return;
  }
  pageNum++;
  renderPage(pageNum);
}

// function zoom in
function zoomIn() {
  if (pdfDoc == null) return;
  if (zoom < 2) {
    zoom = zoom + 0.5;
    updateZoomSpan();
    renderPage(pageNum);
  }
}

// function zoom in
function zoomOut() {
  if (pdfDoc == null) return;
  if (zoom <= 0.5) {
    return;
  }
  zoom = zoom - 0.5;
  updateZoomSpan();
  renderPage(pageNum);
}
//update pecentage zoom
function updateZoomSpan() {
  zoomSpan.textContent = `${Math.round(zoom * 100)}%`;
}

// Function to center the canvas
function centerCanvas() {
  if (zoom === 0.5) {
    canvas.style.margin = "auto";
  } else {
    canvas.style.margin = "auto";
  }
}

// Event listeners for page navigation
pageNumInput.addEventListener("change", onPageChange);
prevPageButton.addEventListener("click", onPrevPage);
nextPageButton.addEventListener("click", onNextPage);
zoomInButton.addEventListener("click", zoomIn);
zoomOutButton.addEventListener("click", zoomOut);
// Event listener for download button
downloadButton.addEventListener("click", onDownloadPDF);

function getFileNameFromUrl(url) {
  return url.substring(url.lastIndexOf("/") + 1);
}

function onDownloadPDF() {
  const fileName = getFileNameFromUrl(url);
  fetch(url)
    .then((response) => response.blob())
    .then((blob) => {
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(downloadUrl);
    })
    .catch((error) => {
      console.error("Error downloading PDF: ", error);
      alert("Failed to download PDF. Please try again later.");
    });
}

// Event listener for print button
printButton.addEventListener("click", onPrintPDF);

function onPrintPDF() {
  pdfDoc
    .getData()
    .then((data) => {
      const blob = new Blob([data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const printWindow = window.open(url);
      printWindow.addEventListener("load", () => {
        printWindow.print();
        URL.revokeObjectURL(url);
      });
    })
    .catch((error) => {
      console.error("Error printing PDF: ", error);
      alert("Failed to print PDF. Please try again later.");
    });
}

// Event listener for maximize button
maximizeButton.addEventListener("click", function () {
  if (canvas.requestFullscreen) {
    canvas.requestFullscreen();
  } else if (canvas.mozRequestFullScreen) {
    /* Firefox */
    canvas.mozRequestFullScreen();
  } else if (canvas.webkitRequestFullscreen) {
    /* Chrome, Safari & Opera */
    canvas.webkitRequestFullscreen();
  } else if (canvas.msRequestFullscreen) {
    /* IE/Edge */
    canvas.msRequestFullscreen();
  }
});

// Event listener for when entering fullscreen
document.addEventListener("fullscreenchange", exitHandler);
document.addEventListener("mozfullscreenchange", exitHandler);
document.addEventListener("webkitfullscreenchange", exitHandler);
document.addEventListener("msfullscreenchange", exitHandler);

function exitHandler() {
  if (
    !document.fullscreenElement &&
    !document.webkitIsFullScreen &&
    !document.mozFullScreen &&
    !document.msFullscreenElement
  ) {
    // Restore normal view when exiting fullscreen
    canvas.style.width = "auto";
    canvas.style.height = "auto";
  }
}

// End Pdf Js

//metadata
const container = document.querySelector(
  "#right-column.right-column.scrollable-metadata"
);

const pageData = {
  id: "1234",
  issue_id: "abcd",
  page_number: 1,
  metadata: [
    {
      type: "link",
      data: {
        id: "def",
        icon: "info-circle",
        title: "Content",
        content:
          "<p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quidem illo sequi at velit, optio temporibus debitis delectus dolorum praesentium atque necessitatibus voluptatibus blanditiis quae quam earum, a cumque, laborum aliquam?optio temporibus debitis delectus dolorum praesentium atque necessitatibus voluptatibus blanditiis quae quam earum, a cumque, laborum aliquam?</p>", // Rich text content
      },
    },
    {
      type: "text",
      data: {
        id: "tex",
        icon: "link",
        url: "https://www.google.com",
      },
    },
    {
      type: "file",
      data: {
        id: "fie",
        icon: "file-alt",
        name: "fileku",
        content_type: "pdf",
        size: 10000, // bytes
        mtime: 233019033, // ms
        uid: "file1", // uid will be used to get the file object binary
      },
    },
  ],
};

function displayPageData(data) {
  let content = ""; // to hold all the metadata content

  data.metadata.forEach((item) => {
    switch (item.type) {
      case "link":
        content += `
            <div class="titleOfCard">
              <div class="titleCard">
                <img src="./pdf_reader_icon/alert-icon.svg" alt="alert icon">
                <h2>${item.data.title}</h2>
              </div>
                <p>${item.data.content}</p>
            </div>
          `;
        break;
      case "text":
        content += `
            <div class="webCard">
              <h2>Link</h2>
                <div class="web justify">
                  <img src="./pdf_reader_icon/globe-icon.svg" alt="globe icon">
                  <p><a href="${item.data.url}" target="_blank">${item.data.url}</a></p>
                  <img src="./pdf_reader_icon/open-link-icon.svg" alt="open link icon">
                </div>
            </div>
          `;
        break;
      case "file":
        content += `
            <div class="webCard">
              <h2>File</h2>
              <div class="web">
                <p>Name: ${item.data.name}</p>
                <p>Type: ${item.data.content_type}</p>
                <p>Size: ${item.data.size} bytes</p>
                <p>Last Modified: ${new Date(
                  item.data.mtime
                ).toLocaleString()}</p>
              </div>
            </div>
          `;
        break;
      default:
        content += `<div class="webCard"><p>Unknown metadata type</p></div>`;
    }
  });

  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = content;
  container.appendChild(card);
}

displayPageData(pageData);

// end metadata
