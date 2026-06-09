import { useState } from 'react';
import { useBusiness } from '../context/BusinessContext';
import { formatCurrency } from '../utils/helpers';
import {
  Plus, Search, Edit3, Trash2, Package, X, Grid, List,
  Laptop, Coffee, Briefcase, Droplets, Dumbbell, Zap, Home, Shirt
} from 'lucide-react';
import './Pages.css';

// Gradient colors for product cards based on category
const categoryConfig = {
  'Electronics':     { gradient: 'linear-gradient(135deg,#6366f1,#4338ca)', icon: Laptop },
  'Food & Beverage': { gradient: 'linear-gradient(135deg,#10b981,#059669)', icon: Coffee },
  'Accessories':     { gradient: 'linear-gradient(135deg,#f59e0b,#d97706)', icon: Briefcase },
  'Home & Kitchen':  { gradient: 'linear-gradient(135deg,#06b6d4,#0284c7)', icon: Home },
  'Sports':          { gradient: 'linear-gradient(135deg,#ef4444,#dc2626)', icon: Dumbbell },
  'Clothing':        { gradient: 'linear-gradient(135deg,#ec4899,#be185d)', icon: Shirt },
  'default':         { gradient: 'linear-gradient(135deg,#6366f1,#a855f7)', icon: Package },
};

const getCategoryConfig = (category) =>
  categoryConfig[category] || categoryConfig['default'];

const Products = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useBusiness();
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [filterCategory, setFilterCategory] = useState('all');
  const [formData, setFormData] = useState({
    name: '', category: '', price: '', stock: '', sku: '', description: ''
  });

  const categories = ['all', ...new Set(products.map(p => p.category))];

  const filteredProducts = products.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({ name: '', category: '', price: '', stock: '', sku: '', description: '' });
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name, category: product.category,
      price: product.price.toString(), stock: product.stock.toString(),
      sku: product.sku, description: product.description || '',
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
    };
    editingProduct ? updateProduct(editingProduct.id, productData) : addProduct(productData);
    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) deleteProduct(id);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h2>{filteredProducts.length} Products</h2>
          <p>Manage your product inventory</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal} id="add-product-btn">
          <Plus size={18} /> Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="page-filters card">
        <div className="filter-search">
          <Search size={17} className="filter-search-icon" />
          <input type="text" placeholder="Search products by name or SKU…"
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="input" id="product-search" />
        </div>
        <div className="filter-actions">
          <select className="select" value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
            ))}
          </select>
          <div className="view-toggle">
            <button className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}><Grid size={16} /></button>
            <button className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}><List size={16} /></button>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="product-grid">
          {filteredProducts.map((product, i) => {
            const config = getCategoryConfig(product.category);
            const Icon = config.icon;
            return (
              <div key={product.id} className="product-card card animate-fade-in-up"
                style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="product-card-image" style={{ background: config.gradient }}>
                  <Icon size={40} color="rgba(255,255,255,0.85)" />
                  <span className={`product-status-dot ${product.status}`}></span>
                </div>
                <div className="product-card-body">
                  <h4 className="product-name">{product.name}</h4>
                  <p className="product-category">{product.category}</p>
                  <div className="product-meta">
                    <span className="product-price">{formatCurrency(product.price)}</span>
                    <span className={`badge badge-${product.stock > 20 ? 'success' : product.stock > 0 ? 'warning' : 'danger'}`}>
                      {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                    </span>
                  </div>
                  <p className="product-sku">SKU: {product.sku}</p>
                </div>
                <div className="product-card-actions">
                  <button className="btn btn-ghost btn-sm" onClick={() => openEditModal(product)}>
                    <Edit3 size={14} /> Edit
                  </button>
                  <button className="btn btn-ghost btn-sm"
                    onClick={() => handleDelete(product.id)}
                    style={{ color: 'var(--danger-400)' }}>
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>SKU</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => {
                const config = getCategoryConfig(product.category);
                const Icon = config.icon;
                return (
                  <tr key={product.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: 8,
                          background: config.gradient,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <Icon size={18} color="white" />
                        </div>
                        <strong>{product.name}</strong>
                      </div>
                    </td>
                    <td>{product.category}</td>
                    <td><strong>{formatCurrency(product.price)}</strong></td>
                    <td>{product.stock}</td>
                    <td><code style={{ color: 'var(--primary-400)', fontSize: '0.8rem' }}>{product.sku}</code></td>
                    <td>
                      <span className={`badge badge-${product.status === 'active' ? 'success' : 'danger'}`}>
                        {product.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEditModal(product)}>
                          <Edit3 size={14} />
                        </button>
                        <button className="btn btn-ghost btn-sm"
                          onClick={() => handleDelete(product.id)}
                          style={{ color: 'var(--danger-400)' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {filteredProducts.length === 0 && (
        <div className="empty-state">
          <Package size={48} />
          <h3>No products found</h3>
          <p>Try adjusting your search or add a new product</p>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="input-group">
                <label>Product Name *</label>
                <input className="input" placeholder="Enter product name" value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div className="form-row">
                <div className="input-group">
                  <label>Category *</label>
                  <input className="input" placeholder="e.g., Electronics" value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })} required />
                </div>
                <div className="input-group">
                  <label>SKU *</label>
                  <input className="input" placeholder="e.g., SKU-001" value={formData.sku}
                    onChange={e => setFormData({ ...formData, sku: e.target.value })} required />
                </div>
              </div>
              <div className="form-row">
                <div className="input-group">
                  <label>Price (₹) *</label>
                  <input className="input" type="number" min="0" placeholder="0" value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })} required />
                </div>
                <div className="input-group">
                  <label>Stock Quantity *</label>
                  <input className="input" type="number" min="0" placeholder="0" value={formData.stock}
                    onChange={e => setFormData({ ...formData, stock: e.target.value })} required />
                </div>
              </div>
              <div className="input-group">
                <label>Description</label>
                <textarea className="textarea" placeholder="Product description…" value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" id="save-product-btn">
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
