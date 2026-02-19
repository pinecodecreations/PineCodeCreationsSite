




document.addEventListener('DOMContentLoaded', () => {


  const emblaNode = document.querySelector('.embla');
  
  // Exit if carousel doesn't exist on this page
  if (!emblaNode) return;
  
  const viewportNode = emblaNode.querySelector('.embla__viewport');
  const prevBtn = document.querySelector('.prev');
  const nextBtn = document.querySelector('.next');
  const dotsContainer = emblaNode.querySelector('.dots'); // Dots container

  // Initialize Embla
  let embla;
  const createEmbla = () => {
    // Detect screen width to set the number of slides shown
    const isDesktop = window.matchMedia('(min-width: 768px)').matches;
    const perSlide = isDesktop ? 2 : 1; // Show 3 slides on desktop, 1 on mobile

    embla = EmblaCarousel(viewportNode, {
      loop: true,               // Enable looping
      slidesToScroll: 1,        // Scroll only one slide at a time
      containScroll: 'trimSnaps', // Keep the carousel aligned
    });

    // Update number of visible slides when window is resized
    window.addEventListener('resize', () => {
      const isDesktop = window.matchMedia('(min-width: 768px)').matches;
      embla.reInit(); // Re-initialize the carousel
    });

    // Create dots based on the number of slides
    const slideCount = embla.scrollSnapList().length;

    // Hide dots if there's only one snap position
    if (slideCount <= 1) {
      dotsContainer.style.display = 'none';
    }

    for (let i = 0; i < slideCount; i++) {
      const dot = document.createElement('button');
      dot.classList.add('dot');
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => embla.scrollTo(i)); // Scroll to specific slide when clicked
      dotsContainer.appendChild(dot);
    }

    // Update dots' active state on slide change
    embla.on('select', () => {
      const index = embla.selectedScrollSnap();
      const dots = dotsContainer.querySelectorAll('.dot');
      dots.forEach(dot => dot.classList.remove('active')); // Remove active state from all dots
      dots[index].classList.add('active'); // Add active state to the current dot
    });

    // Initially update active dot
    embla.on('init', () => {
      const index = embla.selectedScrollSnap();
      const dots = dotsContainer.querySelectorAll('.dot');
      dots[index].classList.add('active');
    });
  };

  createEmbla();


  // Auto loop: automatically scroll to the next slide every 5 seconds
  const autoLoop = () => {
    setInterval(() => {
      embla.scrollNext(); // Auto-scroll every 5 seconds
    }, 5000);
  };

  autoLoop(); // Start auto-loop
});
