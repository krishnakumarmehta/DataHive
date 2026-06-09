import { useState } from 'react';
import { useBusiness } from '../context/BusinessContext';
import { formatCurrency } from '../utils/helpers';
import { Plus, Search, Edit3, Trash2, Users, X, Mail, Phone, MapPin } from 'lucide-react';
import './Pages.css';

const Customers = () => {
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useBusiness();
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', city: ''
  });

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openAddModal = () => {
    setEditingCustomer(null);
    setFormData({ name: '', email: '', phone: '', city: '' });
    setShowModal(true);
  };

  const openEditModal = (customer) => {
    setEditingCustomer(customer);
    setFormData({ name: customer.name, email: customer.email, phone: customer.phone, city: customer.city });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingCustomer) {
      updateCustomer(editingCustomer.id, formData);
    } else {
      addCustomer(formData);
    }
    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      deleteCustomer(id);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <h2>{customers.length} Customers</h2>
          <p>Manage your customer database</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal} id="add-customer-btn">
          <Plus size={18} /> Add Customer
        </button>
      </div>

      <div className="page-filters card">
        <div className="filter-search">
          <Search size={18} className="filter-search-icon" />
          <input type="text" placeholder="Search by name, email or city..."
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="input" />
        </div>
      </div>

      <div className="customer-grid">
        {filteredCustomers.map((customer, i) => (
          <div key={customer.id} className="customer-card card animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="customer-card-header">
              <div className="customer-avatar">{customer.name.split(' ').map(w => w[0]).join('').slice(0, 2)}</div>
              <div className="customer-info">
                <h4>{customer.name}</h4>
                <span className={`badge badge-${customer.status === 'active' ? 'success' : 'danger'}`}>{customer.status}</span>
              </div>
            </div>
            <div className="customer-card-body">
              <div className="customer-detail">
                <Mail size={14} /> <span>{customer.email}</span>
              </div>
              <div className="customer-detail">
                <Phone size={14} /> <span>{customer.phone}</span>
              </div>
              <div className="customer-detail">
                <MapPin size={14} /> <span>{customer.city}</span>
              </div>
            </div>
            <div className="customer-card-stats">
              <div className="customer-stat">
                <span className="customer-stat-value">{customer.totalOrders}</span>
                <span className="customer-stat-label">Orders</span>
              </div>
              <div className="customer-stat">
                <span className="customer-stat-value">{formatCurrency(customer.totalSpent)}</span>
                <span className="customer-stat-label">Total Spent</span>
              </div>
            </div>
            <div className="customer-card-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => openEditModal(customer)}>
                <Edit3 size={14} /> Edit
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(customer.id)} style={{ color: 'var(--danger-400)' }}>
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="empty-state">
          <Users size={48} />
          <h3>No customers found</h3>
          <p>Try adjusting your search or add a new customer</p>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingCustomer ? 'Edit Customer' : 'Add New Customer'}</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="input-group">
                <label>Full Name *</label>
                <input className="input" placeholder="Customer name" value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div className="input-group">
                <label>Email *</label>
                <input className="input" type="email" placeholder="email@example.com" value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })} required />
              </div>
              <div className="form-row">
                <div className="input-group">
                  <label>Phone</label>
                  <input className="input" placeholder="+91 XXXXX XXXXX" value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                </div>
                <div className="input-group">
                  <label>City</label>
                  <input className="input" placeholder="City name" value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {editingCustomer ? 'Update Customer' : 'Add Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
