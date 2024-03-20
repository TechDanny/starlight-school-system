document.addEventListener("DOMContentLoaded", function () {
    const homeContent = document.querySelector(".home-content");
    homeContent.style.opacity = 1;
  
    const aboutImage = document.querySelector(".about-image img");
    const aboutContent = document.querySelector(".about-content");
  
    const contactContent = document.querySelector(".contact-content");
    const contactSocial = document.querySelector(".contact-social");
  
    window.addEventListener("scroll", function () {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
  
      if (scrollPosition > windowHeight / 2) {
        homeContent.style.opacity = 1;
        aboutImage.style.opacity = 1;
        aboutContent.style.opacity = 1;
        contactContent.style.opacity = 1;
        contactSocial.style.opacity = 1;
      }
    });
  });
  
  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }
  
  const backToTopBtn = document.getElementById("backToTopBtn");
  if (window.location.pathname == "/") {
    backToTopBtn.style.display = "none";
  }
  
  window.addEventListener("scroll", function () {
    if (window.location.pathname !== "/") {
      if (window.scrollY > window.innerHeight / 2) {
        backToTopBtn.style.display = "block";
      } else {
        backToTopBtn.style.display = "none";
      }
    }
  });
  
  document.getElementById("currentYear").innerHTML = new Date().getFullYear();