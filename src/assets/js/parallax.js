// Parallax scrolling effect for hero section
(function() {
  'use strict';
  
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initParallax);
  } else {
    initParallax();
  }
  
  function initParallax() {
    const parallaxLayers = document.querySelectorAll('.parallax-layer');
    const parallaxHero = document.getElementById('parallax-hero');
    
    if (!parallaxLayers.length || !parallaxHero) {
      console.warn('Parallax elements not found');
      return;
    }
    
    console.log('Parallax initialized with', parallaxLayers.length, 'layers');
    
    let ticking = false;
    
    function updateParallax() {
      const scrolled = window.pageYOffset || window.scrollY;
      const heroRect = parallaxHero.getBoundingClientRect();
      const heroTop = heroRect.top + scrolled;
      const heroHeight = heroRect.height;
      
      // Apply parallax when hero section is visible
      if (scrolled < heroTop + heroHeight && heroRect.top < window.innerHeight) {
        parallaxLayers.forEach((layer, index) => {
          const speed = parseFloat(layer.getAttribute('data-speed')) || 0.5;
          // Reversed parallax calculation - layers move up as you scroll down
          const yPos = -(scrolled * speed * 0.3);
          layer.style.transform = `translateY(${yPos}px)`;
        });
      }
      
      ticking = false;
    }
    
    function requestTick() {
      if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }
    
    // Listen for scroll events with passive for better performance
    window.addEventListener('scroll', requestTick, { passive: true });
    
    // Also listen for resize
    window.addEventListener('resize', requestTick, { passive: true });
    
    // Initial call
    updateParallax();
  }
})();
