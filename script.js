// ============================================
// NAVAVED - Ayurvedic Products Website
// JavaScript Functionality
// ============================================

// Product Data - Accurate information from NAVAVED company
const products = {
    aayurgul: {
        name: "Aayurgul",
        tagline: "Ayurvedic Jaggery Powder - Beyond Sweetness",
        tag: "Bestseller",
        image: "assets/products/aayurgul.jpg",
        description: "Aayurgul is India's traditional unrefined sweetener made from sugarcane juice, enhanced with beneficial Ayurvedic herbs. We adhere to using the best quality jaggery powder and natural sun-drying methods to reduce moisture content. 100% Chemical-Free - absolutely no sulphur, artificial colours, flavours, or preservatives.",
        ingredients: [
            "Pure Jaggery (Gud)",
            "Ashvagandha",
            "Shatavari",
            "Gulvel (Giloy)",
            "Cardamom",
            "Cinnamon",
            "Jeshtamadh (Licorice)",
            "Turmeric",
            "Dry Ginger",
            "Arjunsaal",
            "Brahmi"
        ],
        benefits: [
            "Boosts immunity naturally",
            "Detoxifies liver",
            "Rich in minerals & vitamins",
            "Ideal for milk, tea, coffee",
            "Perfect for traditional sweets (mithai)",
            "Great for healthy baking & cooking",
            "Suitable for Ayurvedic remedies"
        ],
        price: "₹100 (215g) | ₹200 (480g)",
        sizes: "215g, 480g"
    },
    annapurna: {
        name: "Annapurna",
        tagline: "Shahi Mukhvas - Beyond Freshness",
        tag: "Premium",
        image: "assets/products/annapurna.jpg",
        description: "Annapurna Shahi Mukhvas is an Ayurvedic Mouth Freshener with a perfect combination of taste, aroma, and health benefits. Our Shahi Mukhvas provides a sweet end to the meal without the crash that follows sugar. Prepared with natural ingredients, no added chemicals and preservatives.",
        ingredients: [
            "Fennel Seeds - for refreshing breath and aiding digestion",
            "Flax Seeds - Rich in Omega-3, fiber and anti-oxidants",
            "Ayurvedic Jaggery Powder - with numerous health benefits",
            "Premium Spices & Natural Flavors"
        ],
        benefits: [
            "Natural breath freshener",
            "Aids post-meal digestion",
            "Sweet end to meals without sugar crash",
            "Rich in Omega-3 and fiber",
            "Contains antioxidants",
            "No added chemicals or preservatives"
        ],
        price: "₹60 (50g) | ₹200 (200g)",
        sizes: "50g, 200g"
    },
    masalamirchi: {
        name: "Masala Mirchi",
        tagline: "Kolhapuri Masala Mirchi - Beyond the Spice",
        tag: "Spicy",
        image: "assets/products/masalamirchi.jpg",
        description: "Kolhapuri Masala Mirchi - Dried Stuffed Chillies with traditional spiciness of Kolhapur. We use thin and a bit spicy green chillies with stuffing of traditionally used spices serving mouth watering flavours. Our Masala Mirchi is sun-dried with no chemicals or preservatives added.",
        ingredients: [
            "Thin Spicy Green Chillies",
            "Traditional Kolhapuri Spice Mix",
            "Natural Sun-Drying Process",
            "No Chemicals or Preservatives"
        ],
        benefits: [
            "Authentic Kolhapuri taste",
            "Can be fried and consumed directly",
            "Perfect with Pohe and Dahi Bhutti",
            "Sun-dried for natural preservation",
            "No chemicals or preservatives",
            "Traditional recipe with modern quality"
        ],
        price: "₹60 (50g)",
        sizes: "50g"
    }
};

// DOM Elements
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');
const modal = document.getElementById('productModal');
const statNumbers = document.querySelectorAll('.stat-number');

// ============================================
// NAVIGATION
// ============================================

// Scroll Effect on Navbar
let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;

    if (currentScrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    lastScrollY = currentScrollY;
});

// Mobile Menu Toggle
navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
    document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
});

// Close mobile menu when clicking a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
    });
});

// Active link highlighting on scroll
const sections = document.querySelectorAll('section[id]');

function highlightNavLink() {
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

window.addEventListener('scroll', highlightNavLink);

// ============================================
// PRODUCT MODAL
// ============================================

function openProductModal(productId) {
    const product = products[productId];
    if (!product) return;

    // Populate modal content
    document.getElementById('modalImage').src = product.image;
    document.getElementById('modalImage').alt = product.name;
    document.getElementById('modalTag').textContent = product.tag;
    document.getElementById('modalTitle').textContent = product.name;
    document.getElementById('modalSubtitle').textContent = product.tagline;
    document.getElementById('modalDescription').textContent = product.description;
    document.getElementById('modalPrice').textContent = product.price;

    // Populate ingredients
    const ingredientsList = document.getElementById('modalIngredients');
    ingredientsList.innerHTML = product.ingredients
        .map(ing => `<li>${ing}</li>`)
        .join('');

    // Populate benefits
    const benefitsList = document.getElementById('modalBenefits');
    benefitsList.innerHTML = product.benefits
        .map(benefit => `<li>${benefit}</li>`)
        .join('');

    // Populate sizes if available
    const sizesElement = document.getElementById('modalSizes');
    if (sizesElement && product.sizes) {
        sizesElement.textContent = product.sizes;
    }

    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeProductModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Close modal on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeProductModal();
    }
});

// ============================================
// ANIMATED COUNTERS
// ============================================

let countersAnimated = false;

function animateCounters() {
    if (countersAnimated) return;

    const highlightsSection = document.getElementById('highlights');
    const sectionTop = highlightsSection.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;

    if (sectionTop < windowHeight * 0.8) {
        countersAnimated = true;

        statNumbers.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'));
            const duration = 2000; // 2 seconds
            const step = target / (duration / 16); // 60fps
            let current = 0;

            const updateCounter = () => {
                current += step;
                if (current < target) {
                    counter.textContent = Math.ceil(current).toLocaleString();
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target.toLocaleString() + '+';
                }
            };

            updateCounter();
        });
    }
}

window.addEventListener('scroll', animateCounters);

// ============================================
// REVIEWS MARQUEE DUPLICATION
// ============================================

function setupMarquee() {
    const track = document.querySelector('.marquee-track');
    if (!track) return;

    // Clone all review cards for seamless infinite scroll
    const cards = track.querySelectorAll('.review-card');
    cards.forEach(card => {
        const clone = card.cloneNode(true);
        track.appendChild(clone);
    });
}

// ============================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ============================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ============================================
// INTERSECTION OBSERVER FOR ANIMATIONS
// ============================================

const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.product-card, .team-card, .stat-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Add animation class
document.head.insertAdjacentHTML('beforeend', `
    <style>
        .animate-in {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    </style>
`);

// ============================================
// INITIALIZE
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    setupMarquee();
    animateCounters();
    highlightNavLink();

    // Initial navbar state
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
    }
});

// Make functions globally available
window.openProductModal = openProductModal;
window.closeProductModal = closeProductModal;
