import { data } from "./data/issue-example.js";

const rightColumn = document.querySelector(
  ".jsRightColumn.scrollableMetadata"
);
const openModalButton = document.querySelector(".jsOpenModalBtn");

const displayPageData = (pageData) => {
  rightColumn.innerHTML = "";
  let content = "";

  pageData.metadata.forEach((item) => {
    switch (item.type) {
      case "link":
        content += `
          <div class="titleOfCard">
            <div class="titleCard">
              <img src="./pdf_reader_icon/alert-icon.svg" alt="alert icon">
              <h2>${item.data.title || "Link"}</h2>
            </div>
            <p><a href="${item.data.url}" target="_blank">${
          item.data.url
        }</a></p>
          </div>
        `;
        break;
      case "text":
        content += `
          <div class="webCard">
            <h2>${item.data.title || "Text"}</h2>
            <div class="web justify">
              <img src="./pdf_reader_icon/globe-icon.svg" alt="globe icon">
              <p>${item.data.content}</p>
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
              <p><a href="${
                item.data.file_url
              }" target="_blank">Download</a></p>
            </div>
          </div>
        `;
        break;
      case "image":
        content += `
          <div class="webCard">
            <h2>Image</h2>
            <div class="web">
              <img src="${item.data.file_url}" alt="${
          item.data.name
        }" style="max-width: 100%;">
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
  rightColumn.appendChild(card);
};

export const updateMetadata = (pageNum) => {
  console.log(`Updating metadata for page number: ${pageNum}`);
  
  // Cek apakah modal aktif
  if (openModalButton.classList.contains('active')) {
    console.log("Modal is active, skipping metadata update.");
    return;
  }

  // Cek apakah data halaman sudah terisi
  if (!data.pages_data || data.pages_data.length === 0) {
    console.error("Data pages_data is empty or not defined.");
    rightColumn.innerHTML = ""; // Kosongkan kolom jika data tidak ada
    return;
  }
  
  // Cari data halaman berdasarkan nomor halaman
  const pageData = data.pages_data.find((page) => page.page_number === pageNum);
  
  if (pageData) {
    console.log(`Page data found: ${JSON.stringify(pageData)}`);
    displayPageData(pageData); // Tampilkan data halaman
  } else {
    console.log("Halaman tidak ditemukan.");
    rightColumn.innerHTML = ""; // Kosongkan kolom jika halaman tidak ditemukan
  }
};



export const initMetadata = () => {
  console.log("Initializing metadata");
  if (data.pages_data && data.pages_data.length > 0) {
    displayPageData(data.pages_data[0]);
  } else {
    console.log("No pages_data found.");
  }
};
// const displayIndexes = (indexes) => {
//   rightColumn.innerHTML = '';
//   let content = "<h2>Modal</h2><ul>";

//   indexes.forEach((index) => {
//     content += `<li>${index.entry_title} - Page ${index.page_number}</li>`; 
//   })

//   content += '</ul>';
//   rightColumn.innerHTML = content;


// }
// openModalButton.addEventListener("click", () => {
//   displayIndexes(data.indexes);
// })

document.addEventListener("DOMContentLoaded", initMetadata);
