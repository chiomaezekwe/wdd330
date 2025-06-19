    const form = document.getElementById('feedback-form');
    const thankYou = document.getElementById('thank-you-message');

    form.addEventListener('submit', function(e) {
      e.preventDefault();

      form.reset();
      thankYou.style.display = 'block';
    });

    document.addEventListener("DOMContentLoaded", function () {
    const menuToggle = document.getElementById("menu-toggle");
    const closeMenu = document.getElementById("close-menu");
    const navbar = document.querySelector(".navbar");

    //Will show the nav menu
    menuToggle.addEventListener("click", () => {
      navbar.style.display = "flex";
    });

    //To hide the nav menu
    closeMenu.addEventListener("click", () => {
      navbar.style.display = "none";
    });
  });