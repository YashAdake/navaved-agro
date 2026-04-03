import { Helmet } from 'react-helmet-async';
import { useStores } from '../hooks/useStores';
import { LoadingState, ErrorState, EmptyState } from '../components/common/StateComponents';

function StoreCard({ store }) {
  return (
    <div className="store-card">
      <h3 className="store-name">{store.store_name}</h3>
      {store.tagline && <p className="store-tagline">"{store.tagline}"</p>}
      <ul className="store-details">
        {(store.owner_fname || store.owner_lname) && (
          <li><i className="fas fa-user"></i> {[store.owner_fname, store.owner_lname].filter(Boolean).join(' ')}</li>
        )}
        {store.addresses?.map((addr, i) => (
          <li key={i}>
            <i className="fas fa-map-marker-alt"></i>
            {[addr.address_line1, addr.address_line2, addr.city && `${addr.city}${addr.pincode ? ' - ' + addr.pincode : ''}`].filter(Boolean).join(', ')}
          </li>
        ))}
        {store.email && <li><i className="fas fa-envelope"></i> {store.email}</li>}
      </ul>
      {(store.contacts?.length > 0 || store.has_whatsapp) && (
        <div className="store-contact">
          {store.contacts?.map((c, i) => (
            <a href={`tel:${c.mobile_number}`} key={i}><i className="fas fa-phone"></i> {c.mobile_number}</a>
          ))}
          {store.has_whatsapp && store.whatsapp_number && (
            <a href={`https://wa.me/91${store.whatsapp_number}`} className="whatsapp" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-whatsapp"></i> WhatsApp
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export default function StoresPage() {
  const { stores, loading, error, refetch } = useStores();
  const regions = Object.keys(stores);

  return (
    <>
      <Helmet>
        <title>Where to Buy NAVAVED Products | Authorized Stores</title>
        <meta name="description" content="Find NAVAVED Ayurvedic products near you. 25+ authorized retailers across Maharashtra & Karnataka." />
        <link rel="canonical" href="https://navavedagro.in/stores" />
      </Helmet>

      {/* Navbar */}
      <nav className="navbar scrolled" id="navbar">
        <div className="nav-container">
          <a href="/" className="nav-logo"><img src="/assets/logo/logo.png" alt="NAVAVED Logo" /></a>
          <a href="/" className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '0.9rem' }}>
            <i className="fas fa-home"></i> Back to Home
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="stores-hero">
        <div className="container">
          <a href="/" className="back-home"><i className="fas fa-arrow-left"></i> Back to Home</a>
          <h1><i className="fas fa-store"></i> Where to Buy</h1>
          <p>Find NAVAVED Ayurvedic products at these authorized retailers near you</p>
        </div>
      </section>

      {/* Stores Listing */}
      <section className="stores-section">
        <div className="container">
          {loading && <LoadingState message="Waking up server... loading stores" />}
          {error && <ErrorState message={error} onRetry={refetch} />}
          {!loading && !error && regions.length === 0 && (
            <EmptyState message="No stores found" icon="fas fa-store-slash" />
          )}

          {!loading && !error && regions.map(region => (
            <div key={region}>
              <h2 className="region-title"><i className="fas fa-map-marker-alt"></i> {region}</h2>
              <div className="stores-grid">
                {stores[region].map(store => (
                  <StoreCard key={store.store_id} store={store} />
                ))}
              </div>
            </div>
          ))}

          {/* CTA */}
          {!loading && (
            <div style={{ textAlign: 'center', padding: 'var(--spacing-xl) 0', background: 'var(--cream)', borderRadius: 'var(--radius-lg)', marginTop: 'var(--spacing-xl)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--secondary)', marginBottom: 'var(--spacing-sm)' }}>Want to Stock NAVAVED Products?</h3>
              <p style={{ color: 'var(--dark-light)', marginBottom: 'var(--spacing-md)' }}>Become an authorized retailer and bring authentic Ayurvedic products to your customers.</p>
              <a href="https://wa.me/919225802549?text=Hello%20NAVAVED!%20I%20am%20interested%20in%20stocking%20your%20products." target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                <i className="fab fa-whatsapp"></i> Contact Us on WhatsApp
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-bottom" style={{ paddingTop: 'var(--spacing-lg)' }}>
            <p>&copy; 2026 NAVAVED Agro Food & Products LLP. All Rights Reserved.</p>
            <p>Made with <i className="fas fa-heart" style={{ color: 'var(--primary)' }}></i> for Ayurveda</p>
          </div>
        </div>
      </footer>

      {/* Stores page inline styles (same as original) */}
      <style>{`
        .stores-hero { background: linear-gradient(135deg, var(--secondary-dark) 0%, var(--secondary) 100%); padding: 120px 0 60px; text-align: center; color: var(--white); }
        .stores-hero h1 { font-family: var(--font-display); font-size: 2.5rem; margin-bottom: var(--spacing-sm); }
        .stores-hero p { opacity: 0.9; font-size: 1.1rem; }
        .stores-section { padding: var(--spacing-xl) 0; }
        .region-title { font-family: var(--font-display); font-size: 1.8rem; color: var(--secondary); margin-bottom: var(--spacing-lg); padding-bottom: var(--spacing-sm); border-bottom: 3px solid var(--primary); display: inline-block; }
        .stores-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: var(--spacing-lg); margin-bottom: var(--spacing-xxl); }
        .store-card { background: var(--white); border-radius: var(--radius-lg); padding: var(--spacing-lg); box-shadow: var(--shadow-md); transition: var(--transition-normal); border-left: 4px solid var(--primary); }
        .store-card:hover { transform: translateY(-5px); box-shadow: var(--shadow-lg); }
        .store-name { font-family: var(--font-display); font-size: 1.3rem; color: var(--secondary); margin-bottom: var(--spacing-xs); }
        .store-tagline { color: var(--primary); font-style: italic; font-size: 0.9rem; margin-bottom: var(--spacing-sm); }
        .store-details { list-style: none; padding: 0; margin: 0; }
        .store-details li { display: flex; align-items: flex-start; gap: var(--spacing-sm); margin-bottom: var(--spacing-xs); color: var(--dark-light); font-size: 0.95rem; }
        .store-details li i { color: var(--primary); margin-top: 3px; min-width: 16px; }
        .store-contact { display: flex; flex-wrap: wrap; gap: var(--spacing-sm); margin-top: var(--spacing-md); padding-top: var(--spacing-md); border-top: 1px solid var(--cream-dark); }
        .store-contact a { display: inline-flex; align-items: center; gap: var(--spacing-xs); padding: var(--spacing-xs) var(--spacing-sm); background: var(--cream); border-radius: var(--radius-sm); color: var(--secondary); font-size: 0.85rem; transition: var(--transition-normal); text-decoration: none; }
        .store-contact a:hover { background: var(--primary); color: var(--white); }
        .store-contact a.whatsapp:hover { background: #25D366; }
        .back-home { display: inline-flex; align-items: center; gap: var(--spacing-xs); color: var(--white); opacity: 0.9; margin-bottom: var(--spacing-md); transition: var(--transition-normal); text-decoration: none; }
        .back-home:hover { opacity: 1; }
        @media (max-width: 768px) { .stores-hero h1 { font-size: 2rem; } .stores-grid { grid-template-columns: 1fr; } }
      `}</style>
    </>
  );
}
