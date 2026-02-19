




document.addEventListener('DOMContentLoaded', () => {

  const emblaNode = document.querySelector('.embla');

  // Exit if carousel doesn't exist on this page
  if (!emblaNode) return;

  const viewportNode = emblaNode.querySelector('.embla__viewport');
  const dotsContainer = emblaNode.querySelector('.dots');

  let embla;

  // ---------- Dots ----------

  const buildDots = () => {
    // Clear existing dots
    dotsContainer.innerHTML = '';

    const snapCount = embla.scrollSnapList().length;

    // Hide dot container entirely when only one snap position
    dotsContainer.style.display = snapCount <= 1 ? 'none' : '';

    for (let i = 0; i < snapCount; i++) {
      const dot = document.createElement('button');
      dot.classList.add('dot');
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => embla.scrollTo(i));
      dotsContainer.appendChild(dot);
    }

    updateActiveDot();
  };

  const updateActiveDot = () => {
    const index = embla.selectedScrollSnap();
    dotsContainer.querySelectorAll('.dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
  };

  // ---------- Init ----------

  const initEmbla = () => {
    if (embla) embla.destroy();

    embla = EmblaCarousel(viewportNode, {
      loop: true,
      slidesToScroll: 1,
      containScroll: 'trimSnaps',
      align: 'start',
    });

    buildDots();

    embla.on('select', updateActiveDot);
    embla.on('reInit', buildDots);
  };

  initEmbla();

  // ---------- Breakpoint change detection ----------
  // Only rebuild when crossing a breakpoint, not on every pixel of resize

  const breakpoints = [
    window.matchMedia('(max-width: 767px)'),
    window.matchMedia('(min-width: 768px) and (max-width: 1199px)'),
    window.matchMedia('(min-width: 1200px)'),
  ];

  breakpoints.forEach(mq => {
    mq.addEventListener('change', e => {
      if (e.matches) {
        // Breakpoint crossed — reInit so Embla recalculates snap list, then rebuild dots
        embla.reInit();
      }
    });
  });

  // ---------- Auto-scroll ----------

  setInterval(() => embla.scrollNext(), 5000);

});
