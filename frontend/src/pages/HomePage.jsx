import { useState, useEffect, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useProducts } from '../hooks/useProducts';
import { LoadingState, ErrorState } from '../components/common/StateComponents';

/* ========================================
   NAVAVED — HomePage
   Renders ALL sections of the landing page.
   Products section is dynamic from API.
   Everything else is static (same as original).
======================================== */

// ── Preloader ──
function Preloader({ visible }) {
  if (!visible) return null;
  return (
    <div className={`preloader${visible ? '' : ' hidden'}`} id="preloader">
      <div className="preloader-inner">
        <div className="preloader-logo">
          <img src="/assets/logo/logo.png" alt="NAVAVED Logo" />
        </div>
        <div className="preloader-spinner"></div>
        <p className="preloader-text">Loading Goodness...</p>
      </div>
    </div>
  );
}

// ── Navbar ──
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`} id="navbar">
      <div className="nav-container">
        <a href="#home" className="nav-logo">
          <img src="/assets/logo/logo.png" alt="NAVAVED Logo" />
        </a>
        <button
          className={`nav-toggle${menuOpen ? ' active' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
        >
          <span className="hamburger"></span>
        </button>
        <ul className={`nav-menu${menuOpen ? ' active' : ''}`}>
          <li><a href="#home" className="nav-link" onClick={() => setMenuOpen(false)}>Home</a></li>
          <li><a href="#story" className="nav-link" onClick={() => setMenuOpen(false)}>Our Story</a></li>
          <li><a href="#products" className="nav-link" onClick={() => setMenuOpen(false)}>Products</a></li>
          <li><a href="#quality" className="nav-link" onClick={() => setMenuOpen(false)}>Quality</a></li>
          <li><a href="#team" className="nav-link" onClick={() => setMenuOpen(false)}>Team</a></li>
          <li>
            <a href="https://wa.me/919225802549?text=Hello%20NAVAVED!%20I%20am%20interested%20in%20your%20Ayurvedic%20products." target="_blank" rel="noopener noreferrer" className="nav-link nav-cta">
              <i className="fab fa-whatsapp"></i> WhatsApp Us
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
}

// ── Hero ──
function HeroSection() {
  return (
    <section className="hero" id="home">
      <div className="hero-bg-decoration">
        <div className="hero-circle hero-circle-1"></div>
        <div className="hero-circle hero-circle-2"></div>
        <div className="hero-circle hero-circle-3"></div>
      </div>
      <div className="hero-centered">
        <div className="hero-badge">
          <i className="fas fa-seedling"></i>
          <span>NAVAVED Agro Food &amp; Products LLP</span>
        </div>
        <div className="hero-taglines">
          <div className="tagline-english">
            <span className="brand-name">Navaved</span>
            <span className="brand-slogan">~ A new breath of a healthy life...</span>
          </div>
          <div className="tagline-divider"></div>
          <div className="tagline-marathi">
            <span className="brand-name">नववेद</span>
            <span className="brand-slogan">~ निरोगी आयुष्याचा एक नवा श्वास ...</span>
          </div>
        </div>
        <h1 className="hero-title">
          <span className="title-line">An Natural Blend</span>
          <span className="title-highlight">with a Traditional Touch</span>
        </h1>
        <p className="hero-subtitle">A brand promoting purity and health. We meticulously produce high-quality, chemical-free food products using traditional methods.</p>
        <div className="hero-ethos">
          <span className="ethos-tag"><i className="fas fa-gem"></i> Purity</span>
          <span className="ethos-tag"><i className="fas fa-history"></i> Tradition</span>
          <span className="ethos-tag"><i className="fas fa-leaf"></i> Sustainability</span>
          <span className="ethos-tag"><i className="fas fa-heart"></i> Wellness</span>
          <span className="ethos-tag"><i className="fas fa-handshake"></i> Trust</span>
          <span className="ethos-tag"><i className="fas fa-award"></i> 100% Chemical-Free</span>
        </div>
        <div className="hero-benefits">
          {['100% Natural Ingredients','No Sulphur, Artificial Colours or Preservatives','Traditional Wisdom, Modern Quality','From Kolhapur, Maharashtra'].map((b,i) => (
            <div className="benefit-item" key={i}><i className="fas fa-check-circle"></i><span>{b}</span></div>
          ))}
        </div>
        <div className="hero-buttons">
          <a href="#products" className="btn btn-primary"><i className="fas fa-shopping-bag"></i> Explore Products</a>
          <a href="#story" className="btn btn-secondary"><i className="fas fa-book-open"></i> Our Story</a>
        </div>
      </div>
      <div className="hero-scroll"><a href="#products"><i className="fas fa-chevron-down"></i></a></div>
    </section>
  );
}

// ── Story ──
function StorySection() {
  return (
    <section className="story" id="story">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">The NAVAVED Story</span>
          <h2 className="section-title">Our Commitment to Purity</h2>
          <p className="section-subtitle">From pandemic awareness to your kitchen - our journey of bringing authentic Ayurveda</p>
        </div>
        <div className="story-content">
          <div className="story-timeline">
            {[
              { icon: 'fa-lightbulb', title: '2020-21: The Awakening', text: 'During Corona Pandemic, health consciousness made people turn to Ayurveda. We realized - other medicines cure diseases, but Ayurveda prevents them.' },
              { icon: 'fa-flask', title: 'The Innovation', text: 'Explored Ayurvedic infusions, realized growing concern about sugar, and thought of jaggery as a healthier substitute. Collaborated jaggery with ayurvedic ingredients.' },
              { icon: 'fa-rocket', title: 'NAVAVED is Born', text: 'Researched products with unique natural ingredients. The overwhelming response from customers built a local provider into a trusted company.' },
            ].map((item, i) => (
              <div className="timeline-item" key={i}>
                <div className="timeline-icon"><i className={`fas ${item.icon}`}></i></div>
                <div className="timeline-content"><h3>{item.title}</h3><p>{item.text}</p></div>
              </div>
            ))}
          </div>
          <div className="story-vision">
            <div className="vision-card">
              <div className="vision-icon"><i className="fas fa-eye"></i></div>
              <h3>Our Vision</h3>
              <p>To be the most trusted name in natural, Ayurvedic food products, promoting holistic health across every household.</p>
            </div>
            <div className="vision-card">
              <div className="vision-icon"><i className="fas fa-bullseye"></i></div>
              <h3>Our Mission</h3>
              <p>To meticulously produce high-quality, chemical-free food products using traditional methods, empowering consumers with healthier choices.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Product Modal ──
function ProductModal({ product, onClose }) {
  if (!product) return null;

  const priceDisplay = product.variants
    ?.map(v => `₹${v.price} (${v.quantity}${v.unit})`)
    .join(' | ') || '';
  const sizesDisplay = product.variants
    ?.map(v => `${v.quantity}${v.unit}`)
    .join(', ') || '';

  const whatsappMsg = `Hello NAVAVED! I am interested in ordering *${product.prod_name}* (${product.tagline}). Price: ${priceDisplay}. Please share more details about availability and delivery.`;
  const whatsappHref = `https://wa.me/919225802549?text=${encodeURIComponent(whatsappMsg)}`;

  const imgSrc = product.image_url?.startsWith('http')
    ? product.image_url
    : product.image_url || '/assets/logo/logo.png';

  return (
    <div className="modal active" onClick={onClose}>
      <div className="modal-overlay"></div>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><i className="fas fa-times"></i></button>
        <div className="modal-body">
          <div className="modal-image">
            <img src={imgSrc} alt={product.prod_name} />
          </div>
          <div className="modal-details">
            <span className="modal-tag">{product.badge || 'Premium Product'}</span>
            <h2 className="modal-title">{product.prod_name}</h2>
            <p className="modal-subtitle">{product.tagline}</p>
            <div className="modal-section">
              <h4><i className="fas fa-info-circle"></i> Description</h4>
              <p>{product.description}</p>
            </div>
            {product.ingredients?.length > 0 && (
              <div className="modal-section">
                <h4><i className="fas fa-list"></i> Key Ingredients</h4>
                <ul className="ingredients-list">
                  {product.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
                </ul>
              </div>
            )}
            {product.benefits?.length > 0 && (
              <div className="modal-section">
                <h4><i className="fas fa-heart"></i> Benefits</h4>
                <ul className="benefits-list">
                  {product.benefits.map((b, i) => <li key={i}>{b}</li>)}
                </ul>
              </div>
            )}
            <div className="modal-pricing">
              <div className="price-info">
                <div className="price-tag">
                  <span className="price-label">Price Range</span>
                  <span className="price-value">{priceDisplay}</span>
                </div>
                <div className="size-tag">
                  <span className="size-label">Sizes</span>
                  <span className="size-value">{sizesDisplay}</span>
                </div>
              </div>
              <p className="delivery-note"><i className="fas fa-truck"></i> Delivery charges extra</p>
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                <i className="fab fa-whatsapp"></i> Order on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Products Section (DYNAMIC) ──
function ProductsSection({ products, loading, error, refetch }) {
  const [selectedProduct, setSelectedProduct] = useState(null);

  const badgeClasses = {
    'Bestseller': '',
    'Premium': 'new',
    'Spicy': 'spicy',
    'Healthy': 'healthy',
    'Homemade': 'homemade',
  };

  return (
    <section className="products" id="products">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Our Collection</span>
          <p className="section-subtitle">Discover our range of authentic natural products crafted with love and tradition</p>
        </div>

        {loading && <LoadingState message="Waking up server... loading products" />}
        {error && <ErrorState message={error} onRetry={refetch} />}

        {!loading && !error && (
          <div className="products-grid">
            {products.map(product => {
              const priceTag = product.variants
                ?.map(v => `₹${v.price} (${v.quantity}${v.unit})`)
                .join(' | ') || '';
              const imgSrc = product.image_url?.startsWith('http')
                ? product.image_url
                : product.image_url || '/assets/logo/logo.png';

              return (
                <div className="product-card" key={product.product_id}>
                  <div className="product-image">
                    <img src={imgSrc} alt={product.prod_name} />
                    {product.badge && (
                      <div className={`product-badge ${badgeClasses[product.badge] || ''}`}>{product.badge}</div>
                    )}
                  </div>
                  <div className="product-info">
                    <h3 className="product-name">{product.prod_name}</h3>
                    <p className="product-tagline">{product.tagline}</p>
                    <span className="product-price-tag">{priceTag}</span>
                    <button className="btn-details" onClick={() => setSelectedProduct(product)}>
                      <i className="fas fa-eye"></i> View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="stores-cta">
          <a href="/stores" className="btn btn-secondary stores-cta-btn">
            <i className="fas fa-store"></i> Find Stores Near You
          </a>
          <p className="stores-cta-text">Available at 25+ authorized retailers across Maharashtra &amp; Karnataka</p>
        </div>
      </div>

      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </section>
  );
}

// ── Combos (Static) ──
function CombosSection({ products }) {
  // Build combo data from fetched products for WhatsApp messages
  const getProduct = (slug) => products.find(p => p.slug === slug);
  const getImg = (slug) => {
    const p = getProduct(slug);
    return p?.image_url?.startsWith('http') ? p.image_url : (p?.image_url || '/assets/logo/logo.png');
  };

  return (
    <section className="combos" id="combos">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Save More</span>
          <h2 className="section-title">Product Combos</h2>
          <p className="section-subtitle">Bundle your favourites together and enjoy special combo pricing</p>
        </div>
        <div className="combos-grid">
          {/* Combo 1: Health Starter */}
          <div className="combo-card">
            <div className="combo-badge">Popular</div>
            <div className="combo-header">
              <div className="combo-icon"><i className="fas fa-seedling"></i></div>
              <h3 className="combo-name">Health Starter Pack</h3>
              <p className="combo-desc">Perfect for beginners — start your Ayurvedic journey</p>
            </div>
            <div className="combo-products">
              <div className="combo-product-item"><img src={getImg('aayurgul')} alt="Aayurgul" /><span>Aayurgul (215g)</span></div>
              <span className="combo-plus"><i className="fas fa-plus"></i></span>
              <div className="combo-product-item"><img src={getImg('annapurna')} alt="Annapurna" /><span>Annapurna (50g)</span></div>
            </div>
            <div className="combo-pricing">
              <div className="combo-original"><span className="combo-original-label">Original Total</span><span className="combo-original-price">₹135</span></div>
              <div className="combo-offer"><span className="combo-offer-label">Combo Price</span><span className="combo-offer-price">₹120</span></div>
              <div className="combo-savings">You Save ₹15</div>
            </div>
            <a href="https://wa.me/919225802549?text=Hello%20NAVAVED!%20I%20would%20like%20to%20order%20the%20*Health%20Starter%20Pack*%20combo%20at%20%E2%82%B9120." target="_blank" rel="noopener noreferrer" className="btn btn-primary combo-cta">
              <i className="fab fa-whatsapp"></i> Order This Combo
            </a>
          </div>

          {/* Combo 2: Family Wellness */}
          <div className="combo-card combo-featured">
            <div className="combo-badge featured">Best Value</div>
            <div className="combo-header">
              <div className="combo-icon"><i className="fas fa-home"></i></div>
              <h3 className="combo-name">Family Wellness Kit</h3>
              <p className="combo-desc">Complete nutrition for the whole family</p>
            </div>
            <div className="combo-products">
              <div className="combo-product-item"><img src={getImg('aayurgul')} alt="Aayurgul" /><span>Aayurgul (480g)</span></div>
              <span className="combo-plus"><i className="fas fa-plus"></i></span>
              <div className="combo-product-item"><img src={getImg('annapurna')} alt="Annapurna" /><span>Annapurna (200g)</span></div>
              <span className="combo-plus"><i className="fas fa-plus"></i></span>
              <div className="combo-product-item"><img src={getImg('guavajam')} alt="Guava Jam" /><span>Guava Jam (105g)</span></div>
            </div>
            <div className="combo-pricing">
              <div className="combo-original"><span className="combo-original-label">Original Total</span><span className="combo-original-price">₹385</span></div>
              <div className="combo-offer"><span className="combo-offer-label">Combo Price</span><span className="combo-offer-price">₹349</span></div>
              <div className="combo-savings">You Save ₹36</div>
            </div>
            <a href="https://wa.me/919225802549?text=Hello%20NAVAVED!%20I%20would%20like%20to%20order%20the%20*Family%20Wellness%20Kit*%20combo%20at%20%E2%82%B9349." target="_blank" rel="noopener noreferrer" className="btn btn-primary combo-cta">
              <i className="fab fa-whatsapp"></i> Order This Combo
            </a>
          </div>

          {/* Combo 3: Kolhapuri Spice */}
          <div className="combo-card">
            <div className="combo-badge spicy">Spicy</div>
            <div className="combo-header">
              <div className="combo-icon"><i className="fas fa-pepper-hot"></i></div>
              <h3 className="combo-name">Kolhapuri Spice Box</h3>
              <p className="combo-desc">For lovers of authentic Kolhapuri flavour</p>
            </div>
            <div className="combo-products">
              <div className="combo-product-item"><img src={getImg('masalamirchi')} alt="Masala Mirchi" /><span>Masala Mirchi (50g)</span></div>
              <span className="combo-plus"><i className="fas fa-plus"></i></span>
              <div className="combo-product-item"><img src={getImg('garlicpickle')} alt="Garlic Pickle" /><span>Garlic Pickle (100g)</span></div>
              <span className="combo-plus"><i className="fas fa-plus"></i></span>
              <div className="combo-product-item"><img src={getImg('annapurna')} alt="Annapurna" /><span>Annapurna (50g)</span></div>
            </div>
            <div className="combo-pricing">
              <div className="combo-original"><span className="combo-original-label">Original Total</span><span className="combo-original-price">₹170</span></div>
              <div className="combo-offer"><span className="combo-offer-label">Combo Price</span><span className="combo-offer-price">₹150</span></div>
              <div className="combo-savings">You Save ₹20</div>
            </div>
            <a href="https://wa.me/919225802549?text=Hello%20NAVAVED!%20I%20would%20like%20to%20order%20the%20*Kolhapuri%20Spice%20Box*%20combo%20at%20%E2%82%B9150." target="_blank" rel="noopener noreferrer" className="btn btn-primary combo-cta">
              <i className="fab fa-whatsapp"></i> Order This Combo
            </a>
          </div>

          {/* Combo 4: Complete Collection */}
          <div className="combo-card">
            <div className="combo-badge collection">All-in-One</div>
            <div className="combo-header">
              <div className="combo-icon"><i className="fas fa-gift"></i></div>
              <h3 className="combo-name">Complete Collection</h3>
              <p className="combo-desc">Try everything — all 5 NAVAVED products</p>
            </div>
            <div className="combo-products combo-products-wrap">
              {['aayurgul','annapurna','masalamirchi','guavajam','garlicpickle'].map((slug,i,arr) => (
                <span key={slug} style={{ display: 'contents' }}>
                  <div className="combo-product-item">
                    <img src={getImg(slug)} alt={slug} />
                    <span>{getProduct(slug)?.prod_name || slug}</span>
                  </div>
                  {i < arr.length - 1 && <span className="combo-plus"><i className="fas fa-plus"></i></span>}
                </span>
              ))}
            </div>
            <div className="combo-pricing">
              <div className="combo-original"><span className="combo-original-label">Original Total</span><span className="combo-original-price">₹325</span></div>
              <div className="combo-offer"><span className="combo-offer-label">Combo Price</span><span className="combo-offer-price">₹279</span></div>
              <div className="combo-savings">You Save ₹46</div>
            </div>
            <a href="https://wa.me/919225802549?text=Hello%20NAVAVED!%20I%20would%20like%20to%20order%20the%20*Complete%20Collection*%20combo%20at%20%E2%82%B9279." target="_blank" rel="noopener noreferrer" className="btn btn-primary combo-cta">
              <i className="fab fa-whatsapp"></i> Order This Combo
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Quality ──
function QualitySection() {
  const cards = [
    { icon: 'fa-certificate', title: 'FSSAI Certified', text: 'Food Safety and Standards Authority of India compliant - your guarantee of safety and quality.' },
    { icon: 'fa-flask', title: 'Rigorous Testing', text: 'Regular testing for purity, nutritional content, and absence of contaminants.' },
    { icon: 'fa-route', title: 'Full Traceability', text: 'From farm to finished product, we ensure complete transparency.' },
    { icon: 'fa-rocket', title: 'DPIIT Registered Start-up', text: 'Recognized by the Department for Promotion of Industry and Internal Trade under the Government of India\'s Startup India initiative.' },
    { icon: 'fa-hands-helping', title: 'Social Impact', text: 'Creating job opportunities for women in local areas and ensuring fair trade practices.' },
    { icon: 'fab fa-amazon', title: 'Available on Amazon', text: 'Shop conveniently on Amazon India, health food stores, and Ayurvedic pharmacies.' },
  ];
  return (
    <section className="why-choose" id="quality">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Why Choose NAVAVED</span>
          <h2 className="section-title">Quality &amp; Certifications</h2>
          <p className="section-subtitle">Our commitment to excellence, purity, and your well-being</p>
        </div>
        <div className="choose-grid">
          {cards.map((c,i) => (
            <div className="choose-card" key={i}>
              <div className="choose-icon"><i className={`${c.icon.startsWith('fab') ? '' : 'fas '}${c.icon}`}></i></div>
              <h3>{c.title}</h3>
              <p>{c.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Highlights ──
function HighlightsSection() {
  const stats = [
    { icon: 'fa-box-open', target: 5000, label: 'Products Sold' },
    { icon: 'fa-smile', target: 2500, label: 'Happy Customers' },
    { icon: 'fa-award', target: 5, label: 'Years Experience' },
    { icon: 'fa-leaf', target: 5, label: 'Product Varieties' },
  ];
  const [counts, setCounts] = useState(stats.map(() => 0));
  const [animated, setAnimated] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !animated) {
        setAnimated(true);
        stats.forEach((s, i) => {
          const duration = 2000;
          const step = s.target / (duration / 16);
          let current = 0;
          const update = () => {
            current += step;
            if (current < s.target) {
              setCounts(prev => { const n = [...prev]; n[i] = Math.ceil(current); return n; });
              requestAnimationFrame(update);
            } else {
              setCounts(prev => { const n = [...prev]; n[i] = s.target; return n; });
            }
          };
          requestAnimationFrame(update);
        });
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [animated]);

  return (
    <section className="highlights" id="highlights" ref={ref}>
      <div className="highlights-bg"></div>
      <div className="container">
        <div className="section-header light">
          <span className="section-tag">Our Journey</span>
          <h2 className="section-title">Business Highlights</h2>
          <p className="section-subtitle">Numbers that speak for our commitment to quality and customer satisfaction</p>
        </div>
        <div className="stats-grid">
          {stats.map((s,i) => (
            <div className="stat-card" key={i}>
              <div className="stat-icon"><i className={`fas ${s.icon}`}></i></div>
              <div className="stat-number">{counts[i].toLocaleString()}+</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Team ──
function TeamSection() {
  return (
    <section className="team" id="team">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Meet Our Team</span>
          <h2 className="section-title">The People Behind NAVAVED</h2>
          <p className="section-subtitle">Passionate individuals dedicated to bringing you the best of Ayurveda</p>
        </div>
        <div className="team-grid team-single">
          <div className="team-card">
            <div className="team-image">
              <img src="/assets/team/nilesh-awati.jpg" alt="Nilesh Awati - Founder" className="team-photo" />
              <div className="team-social">
                <a href="https://wa.me/919225802549" target="_blank" rel="noopener noreferrer" className="social-icon whatsapp"><i className="fab fa-whatsapp"></i></a>
                <a href="tel:+919225802549" className="social-icon phone"><i className="fas fa-phone"></i></a>
              </div>
            </div>
            <div className="team-info">
              <h3 className="team-name">Nilesh Awati</h3>
              <p className="team-role">Founder</p>
              <a href="tel:+919225802549" className="team-phone"><i className="fas fa-phone-alt"></i> +91 92258 02549</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Reviews (Static) ──
function ReviewsSection() {
  const reviews = [
    { name: 'Sachin Mali', location: 'USA', text: '"Aayurgul has completely changed my morning routine. The taste is amazing and I feel so energetic throughout the day!"' },
    { name: 'Raju Khambe', location: 'Mumbai', text: '"Best mouth freshener I\'ve ever tried! Annapurna is now a must-have after every meal in our family."' },
    { name: 'Vikram Landage', location: 'Mumbai', text: '"Pure, authentic, and effective. NAVAVED products have earned a permanent place in my kitchen."' },
    { name: 'Shilpa Kothawale', location: 'Ichalkaranji', text: '"My family loves Aayurgul. It reminds us of traditional recipes. Quality is exceptional!"' },
    { name: 'Dr. Vidya Jagatap', location: 'Healthcare Professional', text: '"As a healthcare professional, I appreciate the authentic Ayurvedic formulation. Highly recommended!"' },
    { name: 'Madan Lohar', location: 'Kolhapur', text: '"Switched from regular jaggery to Aayurgul. The difference in taste and quality is remarkable!"' },
    { name: 'Dr. Surykant Bharamgunde', location: 'Kolhapur', text: '"Excellent products with genuine Ayurvedic benefits. The purity sets NAVAVED apart!"' },
    { name: 'Minakshi Bichakar', location: 'Kodoli', text: '"The Masala Mirchi is absolutely authentic! Brings back the traditional Kolhapuri taste. Love it!"' },
    { name: 'Shivam Tandale', location: 'Sangli', text: '"Great quality products! Using Annapurna daily after meals. Natural and healthy alternative."' },
    { name: 'Miss Priyanka Khobare', location: 'Delhi', text: '"100% chemical-free products! I recommend NAVAVED to everyone who cares about their health."' },
  ];

  return (
    <section className="reviews" id="reviews">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Testimonials</span>
          <h2 className="section-title">What Our Customers Say</h2>
          <p className="section-subtitle">Real experiences from our valued customers</p>
        </div>
      </div>
      <div className="reviews-marquee">
        <div className="marquee-track">
          {[...reviews, ...reviews].map((r, i) => (
            <div className="review-card" key={i}>
              <div className="review-stars">{[...Array(5)].map((_,j)=><i className="fas fa-star" key={j}></i>)}</div>
              <p className="review-text">{r.text}</p>
              <div className="review-author">
                <div className="author-avatar">{r.name[0]}</div>
                <div className="author-info"><h4>{r.name}</h4><span>{r.location}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Footer ──
function Footer() {
  return (
    <footer className="footer" id="contact">
      <div className="footer-wave">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V0H1380C1320 0 1200 0 1080 0C960 0 840 0 720 0C600 0 480 0 360 0C240 0 120 0 60 0H0V120Z" fill="currentColor" />
        </svg>
      </div>
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <img src="/assets/logo/logo.png" alt="NAVAVED Logo" className="footer-logo" />
            <p className="footer-tagline">An Natural Blend with a Traditional Touch</p>
            <p className="footer-desc">Bringing you authentic organic products for a healthy and energetic life.</p>
            <div className="footer-social">
              <a href="https://www.instagram.com/navaved__agro" target="_blank" rel="noopener noreferrer" className="social-link"><i className="fab fa-instagram"></i></a>
              <a href="https://wa.me/919225802549" target="_blank" rel="noopener noreferrer" className="social-link"><i className="fab fa-whatsapp"></i></a>
            </div>
          </div>
          <div className="footer-links">
            <h3>Quick Links</h3>
            <ul>
              <li><a href="#home">Home</a></li>
              <li><a href="#products">Products</a></li>
              <li><a href="/stores">Where to Buy</a></li>
              <li><a href="#team">Our Team</a></li>
              <li><a href="#reviews">Reviews</a></li>
            </ul>
          </div>
          <div className="footer-contact">
            <h3>Contact Us</h3>
            <ul>
              <li><i className="fas fa-phone-alt"></i><a href="tel:+919225802549">+91 92258 02549</a></li>
              <li><i className="fas fa-envelope"></i><a href="mailto:navavedagro@gmail.com">navavedagro@gmail.com</a></li>
              <li><i className="fas fa-map-marker-alt"></i><span>A/P Jakhale, Warananagar, Satyawati Colony, Plot No. 135, Tal.: Panhala, Dist.: Kolhapur, Maharashtra, India 416113</span></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 NAVAVED. All Rights Reserved.</p>
          <p>Made with <i className="fas fa-heart"></i> for Ayurveda</p>
        </div>
      </div>
    </footer>
  );
}

// ── Scroll Progress + Back to Top + WhatsApp Float ──
function FloatingElements() {
  const [showTop, setShowTop] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      setShowTop(window.scrollY > 400);
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) setProgress((window.scrollY / docHeight) * 100);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <div className="scroll-progress" style={{ width: `${progress}%` }}></div>
      <a href="https://wa.me/919225802549?text=Hello%20NAVAVED!" target="_blank" rel="noopener noreferrer" className={`whatsapp-float${showTop ? ' visible' : ''}`} aria-label="Chat on WhatsApp">
        <i className="fab fa-whatsapp"></i>
        <span className="whatsapp-tooltip">Chat with us!</span>
      </a>
      {showTop && (
        <button className="back-to-top visible" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top">
          <i className="fas fa-arrow-up"></i>
        </button>
      )}
    </>
  );
}

// ══════════════════════════════════════
// ── HOME PAGE ──
// ══════════════════════════════════════
export default function HomePage() {
  const { products, loading, error, refetch } = useProducts();
  const [preloaderVisible, setPreloaderVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setPreloaderVisible(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Helmet>
        <title>NAVAVED | Ayurvedic Food Products - Chemical-Free &amp; Natural | Kolhapur</title>
        <meta name="description" content="NAVAVED - Authentic Ayurvedic food products from Kolhapur. Chemical-free jaggery powder, mukhvas, pickles & more. FSSAI certified, 100% natural." />
        <link rel="canonical" href="https://navavedagro.in/" />
      </Helmet>

      <Preloader visible={preloaderVisible} />
      <FloatingElements />
      <Navbar />
      <HeroSection />
      <StorySection />
      <ProductsSection products={products} loading={loading} error={error} refetch={refetch} />
      <CombosSection products={products} />
      <QualitySection />
      <HighlightsSection />
      <TeamSection />
      <ReviewsSection />
      <Footer />
    </>
  );
}
