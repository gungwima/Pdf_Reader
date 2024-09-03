const modal = document.querySelector(".jsModal");
const openModalBtn = document.querySelector(".jsOpenModalBtn");
const closeBtn = modal.querySelector(".close");
const buttons = document.querySelectorAll(".button");

// Modal
const initModal = () => {
  buttons.forEach((button) => {
    button.addEventListener("click", function () {
      const activeButton = document.querySelector(".button.special");
      if (activeButton) {
        activeButton.classList.remove("special");
      }
      this.style.backgroundColor = "";
      this.classList.add("special");
    });
  });

  const toggleButton = (activeButton, inactiveButton) => {
    
  }
  // When the user clicks the button, open the modal
  openModalBtn.addEventListener("click", () => {
    if (modal.style.display === "block") {
      modal.style.display = "none";
    } else {
      modal.style.display = "block";
    }
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
};

export { initModal };
