// ============================================
// NAVAVED - Ayurvedic Products Website
// JavaScript Functionality — Enhanced & Fixed
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
        description: "Kolhapuri Masala Mirchi - Dried Stuffed Chillies with traditional spiciness of Kolhapur. We use thin and a bit spicy green chillies with stuffing of traditionally used spices serving mouth watering flavours. Our Masala Mirchi is sun-dried with no chemicals and preservatives added.",
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
    },
    guavajam: {
        name: "Guava Jam",
        tagline: "Amrut Fruit - Power of Health",
        tag: "Healthy",
        image: "assets/products/guava_jam.jpeg",
        description: "Guava (Peru) Jam offers numerous health benefits due to its rich content of Vitamin C, fiber, and antioxidants - including improved immunity, better digestion, heart health, and enhanced skin. It is packed with vitamins (A, C) and minerals (Potassium, Magnesium) that help fight infections, regulate blood sugar, lower blood pressure, and reduce signs of aging. However, moderation is key due to sugar content.",
        ingredients: [
            "Fresh Guava Pulp",
            "Sugar",
            "Pectin (440)",
            "Acidity Regulator (330)",
            "Preservative (211)"
        ],
        benefits: [
            "Immunity Booster: High Vitamin C content strengthens the immune system, fights cold and flu",
            "Aids Digestion: Fiber (Pectin) promotes healthy digestion and helps with constipation",
            "Heart Health: Potassium and fiber help regulate blood pressure and cholesterol, reducing heart disease risk",
            "Skin Health: Antioxidants and Vitamin A protect skin from damage, reduce aging, and enhance glow",
            "Blood Sugar Control: Antioxidants and fiber help regulate blood sugar levels, beneficial for diabetics",
            "Antioxidant Power: Rich in flavonoids, lycopene and other compounds that fight cell damage and inflammation"
        ],
        price: "₹55 (105g)",
        sizes: "105g"
    },
    garlicpickle: {
        name: "Garlic Pickle",
        tagline: "Homemade Lasun Lonche - Guard of Heart",
        tag: "Homemade",
        image: "assets/products/lasun_lonche.jpeg",
        description: "Our Homemade Garlic Pickle (Lasun Lonche) is a perfect blend of taste and health. Known as a 'Guard of Heart', it combines traditional spices with the powerful medicinal benefits of garlic. Garlic is an excellent source of Vitamins C and B, along with essential minerals like Iron, Calcium, and Potassium.",
        ingredients: [
            "Fresh Garlic Cloves",
            "Edible Oil",
            "Chilli Powder",
            "Turmeric",
            "Salt",
            "Mustard Seeds",
            "Fenugreek"
        ],
        benefits: [
            "Boosts Immunity: Strengthens the body's natural defense system",
            "Reduces Cholesterol: Helps lower bad cholesterol levels",
            "Controls Blood Pressure: Assists in regulating blood pressure",
            "Improves Blood Circulation: Enhances blood flow throughout the body",
            "Aids Digestion: Supports better digestive function",
            "Rich in Vitamins C & B: Excellent source of essential vitamins",
            "Mineral Powerhouse: Contains Iron, Calcium, and Potassium",
            "Anti-inflammatory: Helps reduce inflammation in the body"
        ],
        price: "₹75 (100g)",
        sizes: "100g"
    }
};

// ============================================
// SAFE DOM ELEMENT GETTERS
// ============================================
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');
const modal = document.getElementById('productModal');
const statNumbers = document.querySelectorAll('.stat-number');
const scrollProgress = document.getElementById('scrollProgress');
const preloader = document.getElementById('preloader');
const backToTopBtn = document.getElementById('backToTop');
const whatsappFloat = document.getElementById('whatsappFloat');

// ============================================
// PRELOADER — FIXED: works on both fast & slow loads
// ============================================
let preloaderDismissed = false;

function hidePreloader() {
    if (preloaderDismissed || !preloader) return;
    preloaderDismissed = true;

    preloader.classList.add('hidden');
    setTimeout(() => {
        preloader.style.display = 'none';
    }, 600);
}

// If page is already loaded (cached), hide immediately
if (document.readyState === 'complete') {
    setTimeout(hidePreloader, 300);
} else {
    window.addEventListener('load', () => {
        setTimeout(hidePreloader, 600);
    });
}

// Absolute fallback — never block content for more than 3 seconds
setTimeout(hidePreloader, 3000);

// ============================================
// SCROLL PROGRESS BAR
// ============================================
function updateScrollProgress() {
    if (!scrollProgress) return;
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;
    const scrollPercent = (scrollTop / docHeight) * 100;
    scrollProgress.style.width = scrollPercent + '%';
}

// ============================================
// NAVIGATION
// ============================================
function handleNavbarScroll() {
    if (!navbar) return;
    if (window.scrollY > 80) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}

// Mobile Menu Toggle
if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });
}

// Close mobile menu when clicking a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        if (navToggle) navToggle.classList.remove('active');
        if (navMenu) navMenu.classList.remove('active');
        document.body.style.overflow = '';
    });
});

// Active link highlighting on scroll
const sections = document.querySelectorAll('section[id]');

function highlightNavLink() {
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 120;
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

// ============================================
// BACK TO TOP & WHATSAPP FLOAT VISIBILITY
// ============================================
function handleFloatingButtons() {
    const scrollY = window.scrollY;

    if (backToTopBtn) {
        backToTopBtn.classList.toggle('visible', scrollY > 400);
    }
    if (whatsappFloat) {
        whatsappFloat.classList.toggle('visible', scrollY > 200);
    }
}

if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ============================================
// UNIFIED SCROLL HANDLER (debounced with rAF)
// ============================================
let scrollTicking = false;

window.addEventListener('scroll', () => {
    if (!scrollTicking) {
        requestAnimationFrame(() => {
            handleNavbarScroll();
            highlightNavLink();
            updateScrollProgress();
            handleFloatingButtons();
            animateCounters();
            scrollTicking = false;
        });
        scrollTicking = true;
    }
}, { passive: true });

// ============================================
// PRODUCT MODAL
// ============================================
function openProductModal(productId) {
    const product = products[productId];
    if (!product || !modal) return;

    document.getElementById('modalImage').src = product.image;
    document.getElementById('modalImage').alt = product.name;
    document.getElementById('modalTag').textContent = product.tag;
    document.getElementById('modalTitle').textContent = product.name;
    document.getElementById('modalSubtitle').textContent = product.tagline;
    document.getElementById('modalDescription').textContent = product.description;
    document.getElementById('modalPrice').textContent = product.price;

    const ingredientsList = document.getElementById('modalIngredients');
    ingredientsList.innerHTML = product.ingredients
        .map(ing => `<li>${ing}</li>`)
        .join('');

    const benefitsList = document.getElementById('modalBenefits');
    benefitsList.innerHTML = product.benefits
        .map(benefit => `<li>${benefit}</li>`)
        .join('');

    const sizesElement = document.getElementById('modalSizes');
    if (sizesElement && product.sizes) {
        sizesElement.textContent = product.sizes;
    }

    // Show modal with body scroll lock
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // On mobile, scroll modal to top
    const modalContent = modal.querySelector('.modal-content');
    if (modalContent) modalContent.scrollTop = 0;
}

function closeProductModal() {
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Close modal on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
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
    if (!highlightsSection) return;

    const sectionTop = highlightsSection.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;

    if (sectionTop < windowHeight * 0.85) {
        countersAnimated = true;

        statNumbers.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'));
            const duration = 2000;
            const step = target / (duration / 16);
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

// ============================================
// REVIEWS MARQUEE DUPLICATION
// ============================================
function setupMarquee() {
    const track = document.querySelector('.marquee-track');
    if (!track) return;

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
        const href = this.getAttribute('href');
        if (href === '#') return; // skip empty anchors

        e.preventDefault();
        const target = document.querySelector(href);
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
// INTERSECTION OBSERVER — FIXED
// Safely handles elements already in viewport
// ============================================
function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top < (window.innerHeight || document.documentElement.clientHeight) &&
        rect.bottom > 0
    );
}

function setupRevealAnimations() {
    // Use CSS class for initial hidden state (applied via JS, not CSS)
    // This way, if JS fails, content is still visible
    const revealSelectors = '.product-card, .team-card, .stat-card, .choose-card, .timeline-item, .vision-card';
    const revealElements = document.querySelectorAll(revealSelectors);

    // Only setup observer if supported
    if (!('IntersectionObserver' in window)) {
        // Fallback: just show everything
        return;
    }

    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                cardObserver.unobserve(entry.target);
            }
        });
    }, { root: null, rootMargin: '0px 0px -30px 0px', threshold: 0.05 });

    revealElements.forEach(el => {
        // If already in viewport, animate immediately
        if (isElementInViewport(el)) {
            el.classList.add('reveal-item');
            // Use a microtask to ensure the browser renders the initial state first
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    el.classList.add('animate-in');
                });
            });
        } else {
            el.classList.add('reveal-item');
            cardObserver.observe(el);
        }
    });

    // Section headers
    const headerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                headerObserver.unobserve(entry.target);
            }
        });
    }, { root: null, rootMargin: '0px', threshold: 0.15 });

    document.querySelectorAll('.section-header').forEach(header => {
        if (isElementInViewport(header)) {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    header.classList.add('animate-in');
                });
            });
        } else {
            headerObserver.observe(header);
        }
    });
}

// ============================================
// INITIALIZE
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    setupMarquee();
    animateCounters();
    highlightNavLink();
    setupRevealAnimations();
    handleNavbarScroll();
    handleFloatingButtons();
    updateScrollProgress();
});

// Make functions globally available
window.openProductModal = openProductModal;
window.closeProductModal = closeProductModal;
