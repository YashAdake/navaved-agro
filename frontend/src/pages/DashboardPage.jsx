import { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/client';

/* ========================================
   Admin Dashboard
   - Products Manager (CRUD + status toggle)
   - Stores Manager (CRUD + status toggle)
======================================== */

// ── Sidebar ──
function Sidebar({ onLogout }) {
  return (
    <aside className="dash-sidebar">
      <div className="dash-sidebar-header">
        <img src="/assets/logo/logo.png" alt="NAVAVED" className="dash-logo" />
        <h2>Dashboard</h2>
      </div>
      <nav className="dash-nav">
        <NavLink to="/dashboard/products" className={({ isActive }) => `dash-nav-link${isActive ? ' active' : ''}`}>
          <i className="fas fa-box"></i> Products
        </NavLink>
        <NavLink to="/dashboard/stores" className={({ isActive }) => `dash-nav-link${isActive ? ' active' : ''}`}>
          <i className="fas fa-store"></i> Stores
        </NavLink>
      </nav>
      <div className="dash-sidebar-footer">
        <a href="/" className="dash-nav-link"><i className="fas fa-globe"></i> View Site</a>
        <button onClick={onLogout} className="dash-nav-link dash-logout"><i className="fas fa-sign-out-alt"></i> Logout</button>
      </div>
    </aside>
  );
}

// ═══════════════════════════════════════
// PRODUCTS MANAGER
// ═══════════════════════════════════════
function ProductsManager() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editProduct, setEditProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await API.getAdminProducts();
      setProducts(res.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleToggle = async (id) => {
    try {
      await API.toggleProductStatus(id);
      fetchProducts();
    } catch (e) { alert(e.message); }
  };

  const handleSave = async (data) => {
    try {
      if (editProduct) {
        await API.updateProduct(editProduct.product_id, data);
      } else {
        await API.createProduct(data);
      }
      setShowForm(false);
      setEditProduct(null);
      fetchProducts();
    } catch (e) { alert(e.message); }
  };

  return (
    <div className="dash-content">
      <div className="dash-content-header">
        <h1><i className="fas fa-box"></i> Products</h1>
        <button className="btn btn-primary" onClick={() => { setEditProduct(null); setShowForm(true); }}>
          <i className="fas fa-plus"></i> Add Product
        </button>
      </div>

      {loading ? (
        <div className="dash-loading"><div className="loading-spinner"></div><p>Loading products...</p></div>
      ) : (
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Tagline</th>
                <th>Variants</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.product_id} className={p.status === 'INACTIVE' ? 'inactive-row' : ''}>
                  <td><img src={p.image_url?.startsWith('http') ? p.image_url : (p.image_url || '/assets/logo/logo.png')} alt={p.prod_name} className="dash-thumb" /></td>
                  <td><strong>{p.prod_name}</strong><br /><small className="text-muted">{p.slug}</small></td>
                  <td>{p.tagline}</td>
                  <td>{p.variants?.map(v => `₹${v.price} (${v.quantity}${v.unit})`).join(', ')}</td>
                  <td>
                    <button className={`status-pill ${p.status === 'ACTIVE' ? 'active' : 'inactive'}`} onClick={() => handleToggle(p.product_id)}>
                      {p.status}
                    </button>
                  </td>
                  <td>
                    <button className="btn-icon" onClick={() => { setEditProduct(p); setShowForm(true); }} title="Edit">
                      <i className="fas fa-edit"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <ProductForm
          product={editProduct}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditProduct(null); }}
        />
      )}
    </div>
  );
}

// ── Product Form Modal ──
function ProductForm({ product, onSave, onClose }) {
  const [form, setForm] = useState({
    prod_name: product?.prod_name || '',
    slug: product?.slug || '',
    tagline: product?.tagline || '',
    badge: product?.badge || '',
    description: product?.description || '',
    ingredients: product?.ingredients || [],
    benefits: product?.benefits || [],
    image_url: product?.image_url || '',
    sort_order: product?.sort_order || 0,
    status: product?.status || 'ACTIVE',
    variants: product?.variants?.map(v => ({ quantity: v.quantity, unit: v.unit, price: v.price })) || [{ quantity: '', unit: 'g', price: '' }],
  });
  const [newIngredient, setNewIngredient] = useState('');
  const [newBenefit, setNewBenefit] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  // Variant handlers
  const addVariant = () => setForm(prev => ({ ...prev, variants: [...prev.variants, { quantity: '', unit: 'g', price: '' }] }));
  const removeVariant = (i) => setForm(prev => ({ ...prev, variants: prev.variants.filter((_,idx) => idx !== i) }));
  const updateVariant = (i, field, value) => setForm(prev => {
    const v = [...prev.variants]; v[i] = { ...v[i], [field]: value }; return { ...prev, variants: v };
  });

  // Tag handlers
  const addTag = (field, value, setter) => {
    if (value.trim()) {
      setForm(prev => ({ ...prev, [field]: [...prev[field], value.trim()] }));
      setter('');
    }
  };
  const removeTag = (field, i) => setForm(prev => ({ ...prev, [field]: prev[field].filter((_,idx) => idx !== i) }));

  // Image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await API.uploadImage(file);
      handleChange('image_url', res.data.image_url);
    } catch (err) { alert('Upload failed: ' + err.message); }
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const data = {
      ...form,
      sort_order: parseInt(form.sort_order) || 0,
      variants: form.variants.filter(v => v.quantity && v.price).map(v => ({
        quantity: parseInt(v.quantity),
        unit: v.unit,
        price: parseFloat(v.price),
      })),
    };
    await onSave(data);
    setSaving(false);
  };

  return (
    <div className="dash-modal-overlay" onClick={onClose}>
      <div className="dash-modal" onClick={e => e.stopPropagation()}>
        <div className="dash-modal-header">
          <h2>{product ? 'Edit Product' : 'Add Product'}</h2>
          <button onClick={onClose} className="dash-modal-close"><i className="fas fa-times"></i></button>
        </div>
        <form onSubmit={handleSubmit} className="dash-form">
          <div className="form-row">
            <div className="form-group"><label>Product Name *</label><input value={form.prod_name} onChange={e => handleChange('prod_name', e.target.value)} required /></div>
            <div className="form-group"><label>Slug</label><input value={form.slug} onChange={e => handleChange('slug', e.target.value)} placeholder="auto-generated" /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Tagline</label><input value={form.tagline} onChange={e => handleChange('tagline', e.target.value)} /></div>
            <div className="form-group">
              <label>Badge</label>
              <select value={form.badge} onChange={e => handleChange('badge', e.target.value)}>
                <option value="">None</option>
                {['Bestseller','Premium','Spicy','Healthy','Homemade','New'].map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group"><label>Description</label><textarea value={form.description} onChange={e => handleChange('description', e.target.value)} rows={3} /></div>

          {/* Image Upload */}
          <div className="form-group">
            <label>Product Image</label>
            <div className="image-upload-area">
              {form.image_url && <img src={form.image_url.startsWith('http') ? form.image_url : form.image_url} alt="Preview" className="image-preview" />}
              <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
              {uploading && <small>Uploading...</small>}
              <input value={form.image_url} onChange={e => handleChange('image_url', e.target.value)} placeholder="Or enter image URL" style={{ marginTop: 8 }} />
            </div>
          </div>

          {/* Variants */}
          <div className="form-group">
            <label>Price Variants *</label>
            {form.variants.map((v, i) => (
              <div key={i} className="variant-row">
                <input type="number" placeholder="Qty" value={v.quantity} onChange={e => updateVariant(i, 'quantity', e.target.value)} min="1" />
                <select value={v.unit} onChange={e => updateVariant(i, 'unit', e.target.value)}>
                  {['g','ml','kg','pcs','L'].map(u => <option key={u} value={u}>{u}</option>)}
                </select>
                <input type="number" placeholder="Price ₹" value={v.price} onChange={e => updateVariant(i, 'price', e.target.value)} min="0" step="0.01" />
                {form.variants.length > 1 && <button type="button" className="btn-icon danger" onClick={() => removeVariant(i)}><i className="fas fa-trash"></i></button>}
              </div>
            ))}
            <button type="button" className="btn-add" onClick={addVariant}><i className="fas fa-plus"></i> Add Variant</button>
          </div>

          {/* Ingredients Tags */}
          <div className="form-group">
            <label>Ingredients</label>
            <div className="tags-container">
              {form.ingredients.map((t,i) => <span key={i} className="tag">{t} <button type="button" onClick={() => removeTag('ingredients', i)}>&times;</button></span>)}
            </div>
            <div className="tag-input-row">
              <input value={newIngredient} onChange={e => setNewIngredient(e.target.value)} placeholder="Add ingredient"
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag('ingredients', newIngredient, setNewIngredient))} />
              <button type="button" className="btn-add" onClick={() => addTag('ingredients', newIngredient, setNewIngredient)}>Add</button>
            </div>
          </div>

          {/* Benefits Tags */}
          <div className="form-group">
            <label>Benefits</label>
            <div className="tags-container">
              {form.benefits.map((t,i) => <span key={i} className="tag">{t} <button type="button" onClick={() => removeTag('benefits', i)}>&times;</button></span>)}
            </div>
            <div className="tag-input-row">
              <input value={newBenefit} onChange={e => setNewBenefit(e.target.value)} placeholder="Add benefit"
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag('benefits', newBenefit, setNewBenefit))} />
              <button type="button" className="btn-add" onClick={() => addTag('benefits', newBenefit, setNewBenefit)}>Add</button>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group"><label>Sort Order</label><input type="number" value={form.sort_order} onChange={e => handleChange('sort_order', e.target.value)} /></div>
            <div className="form-group">
              <label>Status</label>
              <select value={form.status} onChange={e => handleChange('status', e.target.value)}>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          <div className="dash-form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : (product ? 'Update' : 'Create')}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// STORES MANAGER
// ═══════════════════════════════════════
function StoresManager() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editStore, setEditStore] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const res = await API.getAdminStores();
      setStores(res.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchStores(); }, []);

  const handleToggle = async (id) => {
    try {
      await API.toggleStoreStatus(id);
      fetchStores();
    } catch (e) { alert(e.message); }
  };

  const handleSave = async (data) => {
    try {
      if (editStore) {
        await API.updateStore(editStore.store_id, data);
      } else {
        await API.createStore(data);
      }
      setShowForm(false);
      setEditStore(null);
      fetchStores();
    } catch (e) { alert(e.message); }
  };

  return (
    <div className="dash-content">
      <div className="dash-content-header">
        <h1><i className="fas fa-store"></i> Stores</h1>
        <button className="btn btn-primary" onClick={() => { setEditStore(null); setShowForm(true); }}>
          <i className="fas fa-plus"></i> Add Store
        </button>
      </div>

      {loading ? (
        <div className="dash-loading"><div className="loading-spinner"></div><p>Loading stores...</p></div>
      ) : (
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Store Name</th>
                <th>Owner</th>
                <th>Region</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stores.map(s => (
                <tr key={s.store_id} className={s.status === 'INACTIVE' ? 'inactive-row' : ''}>
                  <td><strong>{s.store_name}</strong><br /><small className="text-muted">{s.slug}</small></td>
                  <td>{[s.owner_fname, s.owner_lname].filter(Boolean).join(' ') || '—'}</td>
                  <td>{s.region || '—'}</td>
                  <td>{s.contacts?.map(c => c.mobile_number).join(', ') || '—'}</td>
                  <td>
                    <button className={`status-pill ${s.status === 'ACTIVE' ? 'active' : 'inactive'}`} onClick={() => handleToggle(s.store_id)}>
                      {s.status}
                    </button>
                  </td>
                  <td>
                    <button className="btn-icon" onClick={() => { setEditStore(s); setShowForm(true); }} title="Edit">
                      <i className="fas fa-edit"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <StoreForm
          store={editStore}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditStore(null); }}
        />
      )}
    </div>
  );
}

// ── Store Form Modal ──
function StoreForm({ store, onSave, onClose }) {
  const [form, setForm] = useState({
    store_name: store?.store_name || '',
    slug: store?.slug || '',
    owner_fname: store?.owner_fname || '',
    owner_lname: store?.owner_lname || '',
    region: store?.region || '',
    email: store?.email || '',
    tagline: store?.tagline || '',
    has_whatsapp: store?.has_whatsapp || false,
    whatsapp_number: store?.whatsapp_number || '',
    sort_order: store?.sort_order || 0,
    status: store?.status || 'ACTIVE',
    addresses: store?.addresses?.map(a => ({
      address_line1: a.address_line1, address_line2: a.address_line2 || '',
      city: a.city || '', state: a.state || '', pincode: a.pincode || '',
    })) || [{ address_line1: '', address_line2: '', city: '', state: '', pincode: '' }],
    contacts: store?.contacts?.map(c => ({ mobile_number: c.mobile_number })) || [{ mobile_number: '' }],
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  // Address handlers
  const addAddress = () => setForm(prev => ({ ...prev, addresses: [...prev.addresses, { address_line1: '', address_line2: '', city: '', state: '', pincode: '' }] }));
  const removeAddress = (i) => setForm(prev => ({ ...prev, addresses: prev.addresses.filter((_,idx) => idx !== i) }));
  const updateAddress = (i, field, value) => setForm(prev => {
    const a = [...prev.addresses]; a[i] = { ...a[i], [field]: value }; return { ...prev, addresses: a };
  });

  // Contact handlers
  const addContact = () => setForm(prev => ({ ...prev, contacts: [...prev.contacts, { mobile_number: '' }] }));
  const removeContact = (i) => setForm(prev => ({ ...prev, contacts: prev.contacts.filter((_,idx) => idx !== i) }));
  const updateContact = (i, value) => setForm(prev => {
    const c = [...prev.contacts]; c[i] = { mobile_number: value }; return { ...prev, contacts: c };
  });

  const regions = ['Pune', 'Kolhapur', 'Sangli & Satara', 'Mumbai', 'Ahmednagar', 'Karnataka', 'Ratnagiri', 'Other'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const data = {
      ...form,
      sort_order: parseInt(form.sort_order) || 0,
      addresses: form.addresses.filter(a => a.address_line1.trim()),
      contacts: form.contacts.filter(c => c.mobile_number.trim()),
    };
    await onSave(data);
    setSaving(false);
  };

  return (
    <div className="dash-modal-overlay" onClick={onClose}>
      <div className="dash-modal" onClick={e => e.stopPropagation()}>
        <div className="dash-modal-header">
          <h2>{store ? 'Edit Store' : 'Add Store'}</h2>
          <button onClick={onClose} className="dash-modal-close"><i className="fas fa-times"></i></button>
        </div>
        <form onSubmit={handleSubmit} className="dash-form">
          <div className="form-row">
            <div className="form-group"><label>Store Name *</label><input value={form.store_name} onChange={e => handleChange('store_name', e.target.value)} required /></div>
            <div className="form-group"><label>Slug</label><input value={form.slug} onChange={e => handleChange('slug', e.target.value)} placeholder="auto-generated" /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Owner First Name</label><input value={form.owner_fname} onChange={e => handleChange('owner_fname', e.target.value)} /></div>
            <div className="form-group"><label>Owner Last Name</label><input value={form.owner_lname} onChange={e => handleChange('owner_lname', e.target.value)} /></div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Region</label>
              <select value={form.region} onChange={e => handleChange('region', e.target.value)}>
                <option value="">Select Region</option>
                {regions.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={e => handleChange('email', e.target.value)} /></div>
          </div>
          <div className="form-group"><label>Tagline</label><input value={form.tagline} onChange={e => handleChange('tagline', e.target.value)} /></div>
          <div className="form-row">
            <div className="form-group" style={{ flex: 'none' }}>
              <label><input type="checkbox" checked={form.has_whatsapp} onChange={e => handleChange('has_whatsapp', e.target.checked)} /> Has WhatsApp</label>
            </div>
            {form.has_whatsapp && (
              <div className="form-group"><label>WhatsApp Number</label><input value={form.whatsapp_number} onChange={e => handleChange('whatsapp_number', e.target.value)} /></div>
            )}
          </div>

          {/* Addresses */}
          <div className="form-group">
            <label>Addresses</label>
            {form.addresses.map((a, i) => (
              <div key={i} className="dynamic-section">
                <input placeholder="Address Line 1 *" value={a.address_line1} onChange={e => updateAddress(i, 'address_line1', e.target.value)} />
                <input placeholder="Address Line 2" value={a.address_line2} onChange={e => updateAddress(i, 'address_line2', e.target.value)} />
                <div className="form-row">
                  <input placeholder="City" value={a.city} onChange={e => updateAddress(i, 'city', e.target.value)} />
                  <input placeholder="State" value={a.state} onChange={e => updateAddress(i, 'state', e.target.value)} />
                  <input placeholder="Pincode" value={a.pincode} onChange={e => updateAddress(i, 'pincode', e.target.value)} />
                </div>
                {form.addresses.length > 1 && <button type="button" className="btn-remove" onClick={() => removeAddress(i)}><i className="fas fa-trash"></i> Remove</button>}
              </div>
            ))}
            <button type="button" className="btn-add" onClick={addAddress}><i className="fas fa-plus"></i> Add Address</button>
          </div>

          {/* Contacts */}
          <div className="form-group">
            <label>Phone Numbers</label>
            {form.contacts.map((c, i) => (
              <div key={i} className="variant-row">
                <input placeholder="Mobile Number" value={c.mobile_number} onChange={e => updateContact(i, e.target.value)} />
                {form.contacts.length > 1 && <button type="button" className="btn-icon danger" onClick={() => removeContact(i)}><i className="fas fa-trash"></i></button>}
              </div>
            ))}
            <button type="button" className="btn-add" onClick={addContact}><i className="fas fa-plus"></i> Add Contact</button>
          </div>

          <div className="form-row">
            <div className="form-group"><label>Sort Order</label><input type="number" value={form.sort_order} onChange={e => handleChange('sort_order', e.target.value)} /></div>
            <div className="form-group">
              <label>Status</label>
              <select value={form.status} onChange={e => handleChange('status', e.target.value)}>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          <div className="dash-form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : (store ? 'Update' : 'Create')}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// DASHBOARD PAGE (MAIN)
// ═══════════════════════════════════════
export default function DashboardPage() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/dashboard-login');
  };

  return (
    <div className="dash-layout">
      <Sidebar onLogout={handleLogout} />
      <main className="dash-main">
        <header className="dash-topbar">
          <span>Welcome, <strong>{user?.user_name || 'Admin'}</strong></span>
          <span className="role-badge">{user?.role || 'ADMIN'}</span>
        </header>
        <Routes>
          <Route index element={<ProductsManager />} />
          <Route path="products" element={<ProductsManager />} />
          <Route path="stores" element={<StoresManager />} />
        </Routes>
      </main>
    </div>
  );
}
