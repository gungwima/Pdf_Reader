import { data } from "./data/issue-example.js";
import { updateMetadata } from "./metadata.js";

// Set workerSrc for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.9.359/pdf.worker.min.js";

let pdfDoc = null;
export let pageNum = 1;
let zoom = 1;
let currentScale = 1;
let canvasPrevious = document.querySelector(".jsPdfCanvasPrevious");
let ctxPrevious = canvasPrevious.getContext("2d", {
  willReadFrequently: true,
});
let canvasCurrent = document.querySelector(".jsPdfCanvasCurrent");
let ctxCurrent = canvasCurrent.getContext("2d", { willReadFrequently: true });
let viewport = null;

const url = "./docs/test.pdf";
const leftColumn = document.querySelector(".jsLeftColumn");
const contentContainer = document.querySelector(".jsContentContainer");
const boxTop = document.querySelector('.jsBoxTop');
const modal = document.querySelector(".jsModal");
const modalContent = document.querySelector('.jsModalContent');
const modalIndex = document.querySelector(".jsModalIndex");
const fullWidthButton = document.querySelector(".jsFullWidthButton");
const fullViewButton = document.querySelector(".jsFullView");
const zoomInButton = document.querySelector(".jsZoomIn");
const zoomOutButton = document.querySelector(".jsZoomOut");
const zoomSpan = document.querySelector(".jsZoomSpan");
const pageNumInput = document.querySelector(".jsPageNum");
const prevPageButton = document.querySelector(".jsPrevPage");
const nextPageButton = document.querySelector(".jsNextPage");
const downloadButton = document.querySelector(".jsDownloadPdf");
const printButton = document.querySelector(".jsPrintPdf");
const maximizeButton = document.querySelector(".jsMaximizeButton");
const loadingMessage = document.querySelector(".jsLoadingMessage");
const rightColumn = document.querySelector(".jsRightColumn");
const openModalButton = document.querySelector(".jsOpenModalBtn");



let isRendering = false;
let renderTaskPrevious = null;
let renderTaskCurrent = null;
let pageCache = {};
let renderedPages = new Set();

export const renderPage = async (num, isNext = true) => {
  const canvas = isNext ? canvasCurrent : canvasPrevious;
  const ctx = isNext ? ctxCurrent : ctxPrevious;

  loadingMessage.style.display = "block";

  try {
    if (isNext && renderTaskCurrent) {
      console.log(`Cancelling rendering of current page ${num}`);
      await renderTaskCurrent.cancel();
    } else if (!isNext && renderTaskPrevious) {
      console.log(`Cancelling rendering of previous page ${num}`);
      await renderTaskPrevious.cancel();
    }

    await Promise.allSettled([renderTaskCurrent?.promise, renderTaskPrevious?.promise]);

    // Move the current canvas content to the previous canvas
    if (isNext && pageNum > 1) {
      ctxPrevious.drawImage(canvasCurrent, 0, 0);
    }

    // Check if the page is in cache
    const cacheKey = `${num}@${currentScale}`;
    if (pageCache[cacheKey]) {
      console.log(`Using cached canvas for page ${num} at scale ${currentScale}`);
      const cachedCanvas = pageCache[cacheKey];

      // Ensure the current canvas has the same size as the cached canvas
      canvas.width = cachedCanvas.width;
      canvas.height = cachedCanvas.height;
      canvas.style.width = `${cachedCanvas.width / window.devicePixelRatio}px`;
      canvas.style.height = `${cachedCanvas.height / window.devicePixelRatio}px`;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(cachedCanvas, 0, 0);
    } else {
      console.log(`Rendering page ${num}`);
      const page = await pdfDoc.getPage(num);
      const viewport = page.getViewport({ scale: currentScale });

      const outputScale = window.devicePixelRatio || 1;
      const width = Math.floor(viewport.width * outputScale);
      const height = Math.floor(viewport.height * outputScale);

      // Ensure the current canvas has the same size as the new content
      canvas.width = width;
      canvas.height = height;
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Create a temporary canvas to render the page
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = width;
      tempCanvas.height = height;
      const tempCtx = tempCanvas.getContext('2d');

      const renderContext = {
        canvasContext: tempCtx,
        viewport: viewport,
        transform: outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null,
      };

      const renderTask = page.render(renderContext);
      if (isNext) {
        renderTaskCurrent = renderTask;
      } else {
        renderTaskPrevious = renderTask;
      }

      await renderTask.promise;

      // Store the rendered canvas in cache
      pageCache[cacheKey] = tempCanvas;

      // Draw the rendered canvas onto the main canvas
      ctx.drawImage(tempCanvas, 0, 0);
    }

    // Render the text layer
    await renderTextLayer(num);

    centerCanvas();
    updateMetadata(num);
  } catch (error) {
    if (error.name === 'RenderingCancelledException') {
      console.log("Rendering was cancelled");
    } else {
      console.error("Error rendering page:", error);
    }
  } finally {
    loadingMessage.style.display = "none";
  }
};

const renderTextLayer = async (pageNum) => {
  const page = await pdfDoc.getPage(pageNum);
  const viewport = page.getViewport({ scale: currentScale });

  const textContent = await page.getTextContent();

  // Clear previous text layer content to avoid overlapping
  const textLayerContainer = document.querySelector('.textLayerContainer');
  textLayerContainer.innerHTML = '';

  // Create a new textLayer div
  const textLayerDiv = document.createElement('div');
  textLayerDiv.className = 'textLayer';
  textLayerDiv.style.position = 'absolute';
  textLayerDiv.style.top = '0';
  textLayerDiv.style.left = '0';
  textLayerDiv.style.height = `${viewport.height}px`;
  textLayerDiv.style.width = `${viewport.width}px`;

  const scaleFactor = 1.3; // Adjust this value to scale the font size

  textContent.items.forEach(item => {
      const span = document.createElement('span');
      const transform = pdfjsLib.Util.transform(
          pdfjsLib.Util.transform(viewport.transform, item.transform),
          [1, 0, 0, -1, 0, 0]
      );

      const fontSize = Math.sqrt(transform[0] * transform[0] + transform[1] * transform[1]) * scaleFactor;

      // Set the span's position and size to match the text item in the PDF
      span.style.position = 'absolute';
      span.style.left = `${transform[4]}px`;
      span.style.top = `${transform[5] - fontSize}px`;
      span.style.fontSize = `${fontSize}px`;
      span.style.fontFamily = item.fontName;
      span.style.color = 'rgba(0, 0, 0, 0)'; // Set text color to transparent
      span.style.pointerEvents = 'auto';
      span.textContent = item.str;

      textLayerDiv.appendChild(span);
  });

  // Append the new text layer div to the container
  textLayerContainer.appendChild(textLayerDiv);

  // Align the textLayerContainer with the canvas
  textLayerContainer.style.position = 'absolute';
  textLayerContainer.style.left = `${canvasCurrent.offsetLeft}px`;
  textLayerContainer.style.height = `${viewport.height}px`;
  textLayerContainer.style.width = `${viewport.width}px`;
  textLayerContainer.style.transformOrigin = '0 0';
};

// Pastikan Anda memanggil renderTextLayer di fungsi renderPage dan applyZoom

const preRenderNextPage = async () => {
  if (pageNum < pdfDoc.numPages) {
    const nextPageNum = pageNum + 1;
    const cacheKey = `${nextPageNum}@${currentScale}`;

    if (!pageCache[cacheKey]) {
      console.log(`Pre-rendering page ${nextPageNum} at scale ${currentScale}`);
      try {
        const page = await pdfDoc.getPage(nextPageNum);
        const viewport = page.getViewport({ scale: currentScale });

        const outputScale = window.devicePixelRatio || 1;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;

        const renderContext = {
          canvasContext: ctx,
          viewport: viewport,
          transform: outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null,
        };

        await page.render(renderContext).promise;

        // Store the pre-rendered page in cache
        pageCache[cacheKey] = canvas;
      } catch (error) {
        console.error(`Error pre-rendering page ${nextPageNum}:`, error);
      }
    }
  }
};

console.log("Starting to load PDF from URL:", url);

export const populateModalIndex = (indexEntries) => {
  modalIndex.innerHTML = "";
  rightColumn.innerHTML = "";
  indexEntries.forEach((entry) => {
    const div = document.createElement("div");
    const a = document.createElement("a");
    const span = document.createElement("span");
    div.addEventListener("click", () => {
      pageNum = entry.page_number;
      renderPage(pageNum);
      modal.style.display = "none";
    });

    a.href = "#";
    a.textContent = entry.entry_title;
    a.addEventListener("click", () => {
      pageNum = entry.page_number;
      renderPage(pageNum);
      modal.style.display = "none";
    });

    span.textContent = entry.page_number;
    span.style.cursor = "pointer";
    span.addEventListener("click", () => {
      pageNum = entry.page_number;
      renderPage(pageNum);
      modal.style.display = "none";
    });

    div.appendChild(a);
    div.appendChild(span);
    modalIndex.appendChild(div);
  });
  modalContent.appendChild(modalIndex);
  rightColumn.appendChild(modalContent);
};


export const fetchPDF = (url) => {
  // Fetch file PDF
  fetch(url)
    .then((response) => {
      console.log("Fetch response status:", response.status);
      if (response.ok) {
        console.log("File PDF ditemukan");
        return response.arrayBuffer();
      } else {
        throw new Error("PDF File not found. Status code: " + response.status);
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
          displayErrorMessage("Failed to load PDF. Please try again later.");
        });
    })
    .catch((error) => {
      console.error("Error fetching PDF: ", error);
      displayErrorMessage(
        "Failed to fetch PDF. Please check the file path and try again."
      );
    });
};

const updatePageNumInput = (num) => {
  const pageNumber = Math.max(1, Math.min(num, pdfDoc.numPages));
  pageNumInput.value = pageNumber;
  if (pageNum <= 1) {
    prevPageButton.classList.add('disabled');
  } else {
    prevPageButton.classList.remove('disabled');
    prevPageButton.style.cursor = 'pointer';
  }
  if (pageNum >= pdfDoc.numPages) {
    nextPageButton.classList.add('disabled');
  } else {
    nextPageButton.classList.remove('disabled');
    nextPageButton.style.cursor = 'pointer';
  }
};

const displayErrorMessage = (message) => {
  const errorMessageElement = document.getElementById("errorMessage");
  const errorTextElement = document.getElementById("errorText");
  const errorCloseBtn = document.getElementById("errorCloseBtn");

  errorTextElement.textContent = message;
  errorMessageElement.classList.remove("hidden");

  setTimeout(() => {
    errorMessageElement.classList.add("hidden");
  }, 4000);

  errorCloseBtn.addEventListener("click", () => {
    errorMessageElement.classList.add("hidden");
  });
};

// Function to toggle full view
const toggleFullView = () => {
  if (
    document.fullscreenElement ||
    document.mozFullScreen ||
    document.webkitFullscreenElement ||
    document.msFullscreenElement
  ) {
    currentScale = 2;
    updateZoomSpan(currentScale);
  } else {
    currentScale = 1;
    updateZoomSpan(currentScale);
  }
  updateZoomSpan(currentScale);
  applyZoom();
};

// function to toggle full width view
const toggleFullWidthView = async () => {
  try {
    console.log("toggleFullWidthView button clicked."); // Log saat tombol ditekan

    if (
      document.fullscreenElement ||
      document.mozFullScreen ||
      document.webkitFullscreenElement ||
      document.msFullscreenElement
    ) {
      currentScale = 1;
      console.log("Fullscreen mode detected. Zoom set to 0.5.");
    } else {
      if (!viewport) {
        const pdfPage = await pdfDoc.getPage(pageNum);
        viewport = pdfPage.getViewport({ scale: 1 });
      }

      const containerHeight = contentContainer.clientHeight;
      const pageHeight = viewport.height;
      let scale = containerHeight / pageHeight;

      scale = 0.5;
      currentScale = scale;

      if (currentScale < 0.5) {
        currentScale = 0.5;
      }

      console.log(`Non-fullscreen mode detected. Zoom set to ${currentScale}.`);
    }

    updateZoomSpan(currentScale);
    applyZoom();
    console.log("applyZoom() called successfully.");

  } catch (error) {
    console.error("Error in toggleFullWidthView function:", error);
  }
};

const zoomIn = () => {
  if (pdfDoc == null) return;
  const maxZoom = document.fullscreenElement ? 3 : 2;
  if (currentScale < maxZoom) {
    currentScale = Math.min(currentScale + 0.5, maxZoom);
    applyZoom();
  }
};

const zoomOut = () => {
  if (pdfDoc == null) return;
  if (currentScale > 0.5) {
    currentScale = currentScale - 0.5;
    applyZoom();
  }
};

const updateCanvasSize = (canvas, viewport) => {
  const outputScale = window.devicePixelRatio || 1;
  canvas.width = Math.floor(viewport.width * outputScale);
  canvas.height = Math.floor(viewport.height * outputScale);
  canvas.style.width = `${viewport.width}px`;
  canvas.style.height = `${viewport.height}px`;
};

const applyZoom = async () => {
  updateZoomSpan(currentScale);
  renderedPages.clear(); // Clear the set of rendered pages
  pageCache = {}; // Clear the page cache
  try {
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: currentScale });
    
    updateCanvasSize(canvasCurrent, viewport);
    updateCanvasSize(canvasPrevious, viewport);//test

    await renderPage(pageNum, true);
    console.log("Current page rendered successfully");

    if (pageNum > 1) {
      await renderPage(pageNum - 1, false);
      console.log("Previous page rendered successfully");
    } else {
      canvasPrevious.width = 0;
      canvasPrevious.height = 0;
    }

    // Render the text layer
    await renderTextLayer(pageNum);

    centerCanvas();
    preRenderNextPage(); // Pre-render next page after zoom
    if (document.fullscreenElement && currentScale === 1) {
      boxTop.style.alignItems = 'center';
      console.log("Fullscreen mode with scale 1: align-items set to center.");
    } else if (currentScale === 0.5) {
      boxTop.style.display = 'flex';
      boxTop.style.alignItems = 'center';
    } else {
      boxTop.style.display = '';
      boxTop.style.alignItems = '';
    }
  } catch (error) {
    console.error("Error during zoom rendering:", error);
    displayErrorMessage("An error occurred while zooming. Please try again.");
  }
};

const updateZoomSpan = (scale) => {
  zoomSpan.textContent = `${Math.round(scale * 100)}%`;
};


// function to center the canvas
const centerCanvas = () => {
  canvasCurrent.style.margin = "auto";
  canvasPrevious.style.margin = "auto";
};

const onPageChange = () => {
  const newPageNum = parseInt(pageNumInput.value, 10);
  if (newPageNum > 0 && newPageNum <= pdfDoc.numPages) {
    pageNum = newPageNum;
    renderPage(pageNum).then(() => {
      preRenderNextPage();
    });
    updatePageNumInput(pageNum);
  } else {
    pageNumInput.value = pageNum;
  }
};

const onNextPage = async () => {
  if (isRendering || pageNum >= pdfDoc.numPages) return;

  isRendering = true;
  pageNum = Math.min(pageNum + 1, pdfDoc.numPages);

  if (pageNum > 1) {
    await renderPage(pageNum - 1, false);
  }

  await renderPage(pageNum, true);
  preRenderNextPage();

  canvasCurrent.classList.add("slide-in-from-right");

  setTimeout(() => {
    removeAnimationClasses();
    isRendering = false;
  }, 500);

  updatePageNumInput(pageNum);
};

const onPrevPage = () => {
  if (isRendering || pageNum <= 1) {
    return;
  }

  isRendering = true;
  pageNum--;

  renderPage(pageNum, false).then(() => {
    preRenderNextPage();
    canvasCurrent.classList.add("slide-out-to-right");

    setTimeout(() => {
      removeAnimationClasses();
      canvasCurrent.getContext('2d').drawImage(canvasPrevious, 0, 0);
      isRendering = false;
    }, 500);
  });

  updatePageNumInput(pageNum);
};

const removeAnimationClasses = () => {
  canvasCurrent.classList.remove("slide-in-from-right");
  canvasCurrent.classList.remove("slide-out-to-right")
};

const getFileNameFromUrl = (url) => {
  return url.substring(url.lastIndexOf("/") + 1);
};

const onDownloadPDF = () => {
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
      displayErrorMessage("Failed to download PDF. Please try again later.");
    });
};

const onPrintPDF = () => {
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
      displayErrorMessage("Failed to print PDF. Please try again later.");
    });
};

const onKeyDown = (event) => {
  console.log("Key pressed:", event.key);
  switch (event.key) {
    case "ArrowLeft":
      onPrevPage();
      break;
    case "ArrowRight":
      onNextPage();
      break;
    default:
      break;
  }
};

const onMaximize = () => {
  if (
    !document.fullscreenElement &&
    !document.mozFullScreen &&
    !document.webkitFullscreenElement &&
    !document.msFullscreenElement
  ) {
    // Masuk ke mode fullscreen
    if (leftColumn.requestFullscreen) {
      leftColumn.requestFullscreen();
    } else if (leftColumn.mozRequestFullScreen) {
      leftColumn.mozRequestFullScreen();
    } else if (leftColumn.webkitRequestFullscreen) {
      leftColumn.webkitRequestFullscreen();
    } else if (leftColumn.msRequestFullscreen) {
      leftColumn.msRequestFullscreen();
    }
    currentScale = 2;
    applyZoom();
    canvasCurrent.style.position = "absolute";
    canvasPrevious.style.position = "absolute";
    contentContainer.style.border = "none";
    document.addEventListener("keydown", onKeyDown);
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
    currentScale = 1;
    contentContainer.style.border = '';
    updateZoomSpan(currentScale);
    applyZoom();
  }
};


//eventlistener for escape
function handleEscapeKey(event) {
  if (event.key === "Escape") {
    console.log("Escape key pressed");

    if (
      document.fullscreenElement ||
      document.mozFullScreenElement ||
      document.webkitFullscreenElement ||
      document.msFullscreenElement
    ) {
      if (document.exitFullscreen) {
        document
          .exitFullscreen()
          .then(() => {
            console.log("Exited fullscreen mode");
            zoom = 1;
            updateZoomSpan(zoom);
            renderPage(pageNum);
          })
          .catch((err) => {
            console.error(`Gagal keluar dari mode fullscreen: ${err.message}`);
          });
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
        zoom = 1;
        updateZoomSpan(zoom);
        renderPage(pageNum);
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
        zoom = 1;
        updateZoomSpan(zoom);
        renderPage(pageNum);
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
        zoom = 1;
        updateZoomSpan(zoom);
        renderPage(pageNum);
      }
    } else {
      console.log("Not in fullscreen mode");
      zoom = 1;
      updateZoomSpan(zoom);
      renderPage(pageNum);
    }
  }
}

const testEscape = (event) => {
  if (
    document.fullscreenElement ||
    document.mozFullScreenElement ||
    document.webkitFullscreenElement ||
    document.msFullscreenElement
  ) {
    console.log(`keyboard yang saya tekan ${event.key}`);

    if (event.key === "Escape") {
      console.log("Tombol Escape ditekan. Keluar dari fullscreen.");
    }
  }
};

const exitHandler = () => {
  if (
    !document.fullscreenElement &&
    !document.webkitIsFullScreen &&
    !document.mozFullScreen &&
    !document.msFullscreenElement
  ) {
  }
};

const updatePublicationDate = (dateString, issueInt) => {
  const date = new Date(dateString);
  const options = { year: "numeric", month: "long", day: "numeric" };
  const dateFormatte = date.toLocaleDateString("en-US", options);
  const issueElement = document.querySelector(".issue");
  const publicationDateElement = document.querySelector(".publicationDate");
  issueElement.textContent = `Issue: ${issueInt}`;
  publicationDateElement.textContent = dateFormatte;
};

const updateTitleContent = () => {
  const titleElement = document.getElementById("titleContent");
  const fileName = data.file.name;
  const fileNameWithoutExtension = fileName.replace(/\.[^/.]+$/, "");
  if (titleElement) {
    titleElement.textContent = fileNameWithoutExtension;
  }
};

const initPdf = () => {
  fetchPDF(url);
  fullWidthButton.addEventListener("click", toggleFullWidthView);
  fullViewButton.addEventListener("click", toggleFullView);
  pageNumInput.addEventListener("change", onPageChange);
  prevPageButton.addEventListener("click", onPrevPage);
  nextPageButton.addEventListener("click", onNextPage);
  zoomInButton.addEventListener("click", zoomIn);
  zoomOutButton.addEventListener("click", zoomOut);
  downloadButton.addEventListener("click", onDownloadPDF);
  printButton.addEventListener("click", onPrintPDF);
  maximizeButton.addEventListener("click", onMaximize);
  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("fullscreenchange", exitHandler);
  document.addEventListener("mozfullscreenchange", exitHandler);
  document.addEventListener("webkitfullscreenchange", exitHandler);
  document.addEventListener("msfullscreenchange", exitHandler);
  document.addEventListener("keydown", handleEscapeKey);
  document.addEventListener("keydown", testEscape);
  window.addEventListener('resize', applyZoom);
  openModalButton.addEventListener("click", () => {
    populateModalIndex(data.indexes);
  })
  updatePublicationDate(data.date, data.number);
  updateTitleContent();
  if (pageNum <= 1) {
    prevPageButton.classList.add('disabled');
    prevPageButton.style.cursor = 'not-allowed';
  }
};

export { initPdf };
