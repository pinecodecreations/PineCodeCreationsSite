// Select DOM elements
const bodyElement = document.querySelector("body");
const navbarMenu = document.querySelector("#pc-navigation");
const hamburgerMenu = document.querySelector("#pc-navigation .pc-toggle");

// Function to toggle the aria-expanded attribute
function toggleAriaExpanded(element) {
    const isExpanded = element.getAttribute("aria-expanded");
    element.setAttribute(
        "aria-expanded",
        isExpanded === "false" ? "true" : "false",
    );
}

// Function to toggle the menu open or closed
function toggleMenu() {
    hamburgerMenu.classList.toggle("pc-active");
    navbarMenu.classList.toggle("pc-active");
    bodyElement.classList.toggle("pc-open");
    toggleAriaExpanded(hamburgerMenu);

    // Keep the scrolled styling while the mobile menu is open.
    if (navbarMenu.classList.contains("pc-active")) {
        navbarMenu.classList.add("pc-navigation-scrolled");
    } else if (window.scrollY === 0) {
        navbarMenu.classList.remove("pc-navigation-scrolled");
    }
}

// Add click event listener to the hamburger menu
hamburgerMenu.addEventListener("click", toggleMenu);

// Add click event listener to the navbar menu to handle clicks on the pseudo-element
navbarMenu.addEventListener("click", function (event) {
    if (
        event.target === navbarMenu &&
        navbarMenu.classList.contains("pc-active")
    ) {
        toggleMenu();
    }
});

// Function to handle dropdown toggle
function toggleDropdown(element) {
    element.classList.toggle("pc-active");
    const dropdownButton = element.querySelector(".pc-dropdown-button");
    if (dropdownButton) {
        toggleAriaExpanded(dropdownButton);
    }
}

// Add event listeners to each dropdown element for accessibility
const dropdownElements = document.querySelectorAll(".pc-dropdown");
dropdownElements.forEach((element) => {
    let escapePressed = false;

    element.addEventListener("focusout", function (event) {
        // Skip the focusout logic if escape was pressed
        if (escapePressed) {
            escapePressed = false;
            return;
        }

        // If the focus has moved outside the dropdown, remove the active class from the dropdown
        if (!element.contains(event.relatedTarget)) {
            element.classList.remove("pc-active");
            const dropdownButton = element.querySelector(".pc-dropdown-button");

            if (dropdownButton) {
                toggleAriaExpanded(dropdownButton);
            }
        }
    });

    element.addEventListener("keydown", function (event) {
        if (element.classList.contains("pc-active")) {
            event.stopPropagation();
        }

        // Pressing Enter or Space will toggle the dropdown and adjust the aria-expanded attribute
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            toggleDropdown(element);
        }

        // Pressing Escape will remove the active class from the dropdown. The stopPropagation above will stop the hamburger menu from closing
        if (event.key === "Escape") {
            escapePressed = true;
            toggleDropdown(element);
        }
    });

    // Handles dropdown menus on mobile - the matching media query (max-width: 63.9375rem) is necessary so that clicking the dropdown button on desktop does not add the active class and thus interfere with the hover state
    const maxWidthMediaQuery = window.matchMedia("(max-width: 63.9375rem)");
    if (maxWidthMediaQuery.matches) {
        element.addEventListener("click", () => toggleDropdown(element));
    }
});

const links = document.querySelectorAll(".pc-li-link");
links.forEach(link => {
  if (link.href === window.location.href) {
    link.classList.add("cs-active");
  }
  else {
    link.classList.remove("cs-active");
  }
});

// Pressing Enter will redirect to the href
const dropdownLinks = document.querySelectorAll(".pc-drop-li > .pc-li-link");
dropdownLinks.forEach((link) => {
    link.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            window.location.href = this.href;
        }
    });
});

// If you press Escape and the hamburger menu is open, close it
document.addEventListener("keydown", (event) => {
    if (
        event.key === "Escape" &&
        hamburgerMenu.classList.contains("pc-active")
    ) {
        toggleMenu();
    }
});

function syncNavigationScrolledState() {
    if (window.scrollY > 0 || navbarMenu.classList.contains('pc-active')) {
        navbarMenu.classList.add('pc-navigation-scrolled');
    } else {
        navbarMenu.classList.remove('pc-navigation-scrolled');
    }
}

syncNavigationScrolledState();
window.addEventListener('scroll', syncNavigationScrolledState);

//CONTACT FORM
if (window.location.pathname === '/contact/') {
  const handleSubmit = event => {
    event.preventDefault();
  
    const myForm = event.target;
    const formData = new FormData(myForm);
  
    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(formData).toString()
    })
      .then(() => {
        const alert = document.getElementById('successAlert');
        alert.style.display = 'flex'; // Show the alert
        myForm.style.display = 'none';
      })
      .catch(error => alert(error));
  };
  
  document.querySelector("form").addEventListener("submit", handleSubmit);
  
}


//CONTACT FORM
if (window.location.pathname === '/faq/') {
  const faqItems = Array.from(document.querySelectorAll('.pc-faq-item'));
          for (const item of faqItems) {
              const onClick = () => {
              item.classList.toggle('active')
          }
          item.addEventListener('click', onClick)
          }

          class FAQFilter {
          filtersSelector = '.pc-option'
          FAQselector = '.pc-faq-group'
          activeClass = 'pc-active'
          hiddenClass = 'pc-hidden'

          constructor() {
              const $filters = document.querySelectorAll(this.filtersSelector)
              this.$activeFilter = $filters[0]
              this.$images = document.querySelectorAll(this.FAQselector)

              this.$activeFilter.classList.add(this.activeClass)

              for (const $filter of $filters) {
              $filter.addEventListener('click', () => this.onClick($filter))
              }
          }

          onClick($filter) {
              this.filter($filter.dataset.filter)

              const { activeClass } = this

              this.$activeFilter.classList.remove(activeClass)
              $filter.classList.add(activeClass)

              this.$activeFilter = $filter
          }

          filter(filter) {
              const showAll = filter == 'all'
              const { hiddenClass } = this

              for (const $image of this.$images) {
              const show = showAll || $image.dataset.category == filter
              $image.classList.toggle(hiddenClass, !show)
              }
          }
          }

          new FAQFilter()
}

