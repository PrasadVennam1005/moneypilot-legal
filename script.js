/* ==========================================================================
   MoneyPilot Landing Page Interactions (script.js)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // --- MOBILE NAV MENU TOGGLE ---
  const mobileNavToggle = document.getElementById('mobile-nav-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (mobileNavToggle && navMenu) {
    mobileNavToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      const isOpen = navMenu.classList.contains('open');
      mobileNavToggle.setAttribute('aria-expanded', isOpen);
      mobileNavToggle.innerHTML = isOpen 
        ? `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>` // Close icon
        : `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>`; // Menu icon
    });

    // Close menu when clicking links
    const navLinks = navMenu.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        mobileNavToggle.setAttribute('aria-expanded', false);
        mobileNavToggle.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>`;
      });
    });
  }

  // --- DARK / LIGHT THEME TOGGLE ---
  const themeToggleBtn = document.getElementById('theme-toggle');
  const savedTheme = localStorage.getItem('moneypilot-theme') || 'dark';
  
  // Set initial theme
  document.documentElement.setAttribute('data-theme', savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('moneypilot-theme', newTheme);
    });
  }

  // --- FAQ ACCORDION ---
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close all other FAQ items
      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
          otherItem.querySelector('.faq-answer').style.maxHeight = null;
        }
      });

      // Toggle current FAQ item
      item.classList.toggle('active');

      if (isActive) {
        answer.style.maxHeight = null;
      } else {
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  // --- COUNTER & PROGRESS BAR ANIMATIONS (IntersectionObserver) ---
  const countUpElement = (el, target, duration = 1500) => {
    let start = 0;
    const increment = target / (duration / 16);
    const updateCount = () => {
      start += increment;
      if (start < target) {
        el.textContent = Math.floor(start).toLocaleString();
        requestAnimationFrame(updateCount);
      } else {
        el.textContent = target.toLocaleString();
      }
    };
    updateCount();
  };

  const analyticsSection = document.getElementById('analytics');
  let animatedAnalytics = false;

  const observerOptions = {
    root: null,
    threshold: 0.2
  };

  const analyticsObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animatedAnalytics) {
        animatedAnalytics = true;
        
        // 1. Animate progress bars
        const fills = entry.target.querySelectorAll('.analytics-fill');
        fills.forEach(fill => {
          const targetWidth = fill.getAttribute('data-width') || '0%';
          fill.style.width = targetWidth;
        });

        // 2. Animate counter numbers
        const counters = entry.target.querySelectorAll('.animate-val');
        counters.forEach(counter => {
          const targetNum = parseInt(counter.getAttribute('data-target') || '0', 10);
          countUpElement(counter, targetNum);
        });

        // 3. Animate SVG chart path
        const chartPath = entry.target.querySelector('.chart-path');
        if (chartPath) {
          chartPath.style.strokeDashoffset = '0';
        }

        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  if (analyticsSection) {
    analyticsObserver.observe(analyticsSection);
  }

  // --- SCREENSHOTS HORIZONTAL CAROUSEL CONTROLS ---
  const scroller = document.querySelector('.scroller');
  const dotsContainer = document.getElementById('scroller-dots');
  const slides = document.querySelectorAll('.scroller > .entry');

  if (scroller && dotsContainer && slides.length > 0) {
    // Dynamically build dot navigations
    slides.forEach((slide, idx) => {
      const dot = document.createElement('button');
      dot.classList.add('scroller-dot');
      if (idx === 0) dot.classList.add('active');
      dot.setAttribute('aria-label', `Go to screenshot ${idx + 1}`);
      dot.addEventListener('click', () => {
        const slideWidth = slide.clientWidth;
        const gap = parseInt(window.getComputedStyle(scroller).gap || '0', 10);
        scroller.scrollTo({
          left: idx * (slideWidth + gap),
          behavior: 'smooth'
        });
      });
      dotsContainer.appendChild(dot);
    });

    // Update active dot on scroll
    const dots = dotsContainer.querySelectorAll('.scroller-dot');
    scroller.addEventListener('scroll', () => {
      const scrollPos = scroller.scrollLeft;
      const slideWidth = slides[0].clientWidth;
      const gap = parseInt(window.getComputedStyle(scroller).gap || '0', 10);
      const activeIndex = Math.round(scrollPos / (slideWidth + gap));
      
      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === activeIndex);
      });
    });
  }

  // --- SCROLL-DRIVEN ANIMATION JS FALLBACK FOR UNSUPPORTED BROWSERS ---
  const sdaSupported = CSS.supports('(animation-timeline: view()) and (animation-range: entry)');
  
  if (!sdaSupported && scroller && slides.length > 0) {
    const animations = new Map();

    slides.forEach(slide => {
      // Simple scaling/opacity animation for entries matching the CSS @keyframes slideEffect fallback
      const animation = slide.animate(
        [
          { transform: 'scale(0.85)', opacity: '0.6' },
          { transform: 'scale(1.02)', opacity: '1', offset: 0.5 },
          { transform: 'scale(0.85)', opacity: '0.6' }
        ],
        {
          duration: 1, // Controlled programmatically
          fill: 'both'
        }
      );
      animation.pause();
      animations.set(slide, animation);
    });

    const updateSdaFallback = () => {
      const scrollerRect = scroller.getBoundingClientRect();
      const scrollerWidth = scrollerRect.width;

      slides.forEach(slide => {
        const animation = animations.get(slide);
        if (!animation) return;

        const slideRect = slide.getBoundingClientRect();
        // Calculate progress of the slide's center relative to the scroller's viewport
        const slideCenter = slideRect.left + slideRect.width / 2;
        const progress = (slideCenter - scrollerRect.left) / scrollerWidth;
        
        // Bind currentTime to range [0, 1] matching animation duration
        // We clamp progress between 0 and 1
        const clampedProgress = Math.max(0, Math.min(1, progress));
        animation.currentTime = clampedProgress;
      });
    };

    scroller.addEventListener('scroll', updateSdaFallback);
    window.addEventListener('resize', updateSdaFallback);
    updateSdaFallback();
  }
});
