import { initCheckbox } from "./checkbox.js";
import { initPdf } from "./pdf.js";
import { initModal } from "./modal.js";
import { initMetadata, updateMetadata } from "./metadata.js";
import { initSwitchButton } from "./switchButton.js";

document.addEventListener("DOMContentLoaded", () => {
  // initCheckbox();
  initPdf();
  // initModal();
  initMetadata();
  updateMetadata();
  initSwitchButton();
});
