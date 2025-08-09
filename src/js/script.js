// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({ 
        behavior: "smooth",
        block: "start"
      });
    }
  });
});

// Professional rotating phrases for hero section
const phrases = [
  "Informaticien spécialisé<br>IA & Data Science appliquée à la santé",
  "Expert en modélisation d'algorithmes<br>d'apprentissage automatique",
  "Développeur de solutions data-driven<br>pour le secteur biomédical",
  "Recherche, innovation et développement<br>au service de la santé numérique"
];

let currentPhraseIndex = 0;

function rotateHeroText() {
  const heroText = document.querySelector(".hero p");
  if (heroText) {
    heroText.style.opacity = 0;
    
    setTimeout(() => {
      heroText.innerHTML = phrases[currentPhraseIndex % phrases.length];
      heroText.style.opacity = 1;
      currentPhraseIndex++;
    }, 500);
  }
}

// Start text rotation after page load
window.addEventListener('load', () => {
  setInterval(rotateHeroText, 4000);
});

// Scroll animations for sections
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, observerOptions);

// Observe all sections for scroll animations
document.addEventListener('DOMContentLoaded', () => {
  const sections = document.querySelectorAll('.section');
  sections.forEach(section => {
    section.classList.add('loading');
    observer.observe(section);
  });
  
  // Add loading class to body for initial animation
  document.body.classList.add('loading');
});

// Header scroll effect
let lastScrollTop = 0;
const header = document.querySelector('header');

window.addEventListener('scroll', () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  
  if (scrollTop > lastScrollTop && scrollTop > 100) {
    // Scrolling down
    header.style.transform = 'translateY(-100%)';
  } else {
    // Scrolling up
    header.style.transform = 'translateY(0)';
  }
  
  lastScrollTop = scrollTop;
});

// Active navigation highlighting
function highlightActiveNav() {
  const sections = document.querySelectorAll('.section[id]');
  const navLinks = document.querySelectorAll('nav a[href^="#"]');
  
  let currentSection = '';
  
  sections.forEach(section => {
    const sectionTop = section.offsetTop - 150;
    const sectionHeight = section.clientHeight;
    
    if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
      currentSection = section.getAttribute('id');
    }
  });
  
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${currentSection}`) {
      link.classList.add('active');
    }
  });
}

window.addEventListener('scroll', highlightActiveNav);

// Performance optimization: debounce scroll events
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Apply debouncing to scroll-heavy functions
window.addEventListener('scroll', debounce(highlightActiveNav, 10));

// Keyboard navigation accessibility
document.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    document.body.classList.add('using-keyboard');
  }
});

document.addEventListener('mousedown', () => {
  document.body.classList.remove('using-keyboard');
});

// Preload critical images
function preloadImages() {
  const imageUrls = [
    './assets/images/pp_b.png',
    './assets/images/pp.png',
    './assets/images/pp_d.png'
  ];
  
  imageUrls.forEach(url => {
    const img = new Image();
    img.src = url;
  });
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', preloadImages);

// Ajout : Menu hamburger responsive
function initResponsiveMenu(){
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('primary-nav');
  if(!toggle || !nav) return;
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('open');
  });
  nav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      if(window.innerWidth <= 1000){
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  });
  window.addEventListener('resize', () => {
    if(window.innerWidth > 1000){
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded','false');
    }
  });
}

document.addEventListener('DOMContentLoaded', initResponsiveMenu);
