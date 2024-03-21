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

function showSection(sectionId) {
  const sections = document.querySelectorAll("main section");
  sections.forEach((section) => {
    section.style.display = "none";
  });

  const selectedSection = document.getElementById(sectionId);
  if (selectedSection) {
    selectedSection.style.display = "block";
  }
}
document.addEventListener("DOMContentLoaded", function () {
  showSection(defaultSection);
});

function changeNavItem(element, title) {
  document.querySelectorAll(".nav-link").forEach((navItem) => {
    navItem.classList.remove("active");
  });

  element.classList.add("active");

  document.getElementById("dashboard-title").innerText = title;
  document.getElementById("current-route").innerText = `/${title
    .toLowerCase()
    .replace(/\s+/g, "-")}`;

  document.getElementById("dashboard-content").style.display =
    title === "Dashboard" ? "block" : "none";
  document.getElementById("manage-students-content").style.display =
    title === "Manage Students" ? "block" : "none";
  document.getElementById("add-students-content").style.display =
    title === "Add Students" ? "block" : "none";
  document.getElementById("manage-teachers-content").style.display =
    title === "Manage Teachers" ? "block" : "none";
  document.getElementById("add-teachers-content").style.display =
    title === "Add Teachers" ? "block" : "none";
}
