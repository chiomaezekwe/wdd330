// Will wait for the DOM to fully load
  document.addEventListener("DOMContentLoaded", function () {
    const menuToggle = document.getElementById("menu-toggle");
    const closeMenu = document.getElementById("close-menu");
    const navbar = document.querySelector(".navbar");

    // Show the nav menu
    menuToggle.addEventListener("click", () => {
      navbar.style.display = "flex";
    });

    // Hide the nav menu
    closeMenu.addEventListener("click", () => {
      navbar.style.display = "none";
    });
  });
