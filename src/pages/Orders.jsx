import { useState } from 'react';
import { useBusiness } from '../context/BusinessContext';
import { formatCurrency, formatDate } from '../utils/helpers';
import {
  Search, Truck, CheckCircle2, Clock, XCircle,
  Package, Plus, X, ChevronDown
} from 'lucide-react';
import './Pages.css';

const statusOptions = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const Orders = () => {
  const { orders, customers, products, addOrder, updateOrderStatus } = useBusiness();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newOrder, setNewOrder] = useState({
    customer: '', items: [], total: '', paymentMethod: 'UPI', status: 'pending'
  });
  const [itemInput, setItemInput] = useState('');

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || o.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered': return <CheckCircle2 size={13} />;
      case 'shipped':   return <Truck size={13} />;
      case 'processing':return <Package size={13} />;
      case 'pending':   return <Clock size={13} />;
      case 'cancelled': return <XCircle size={13} />;
      default: return null;
    }
  };

  const getStatusBadge = (status) => {
    const map = { delivered: 'success', shipped: 'primary', processing: 'warning', pending: 'warning', cancelled: 'danger' };
    return map[status] || 'primary';
  };

  const addItem = () => {
    if (itemInput.trim()) {
      setNewOrder(prev => ({ ...prev, items: [...prev.items, itemInput.trim()] }));
      setItemInput('');
    }
  };

  const removeItem = (idx) => {
    setNewOrder(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));
  };

  const handleAddOrder = (e) => {
    e.preventDefault();
    if (!newOrder.customer || newOrder.items.length === 0) return;
    addOrder({ ...newOrder, total: parseFloat(newOrder.total) || 0 });
    setShowAddModal(false);
    setNewOrder({ customer: '', items: [], total: '', paymentMethod: 'UPI', status: 'pending' });
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h2>{filteredOrders.length} Orders</h2>
          <p>Track and manage customer orders</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div className="page-header-stats">
            <div className="mini-stat">
              <Clock size={15} />
              <span>{orders.filter(o => o.status === 'pending').length} Pending</span>
            </div>
            <div className="mini-stat">
              <Truck size={15} />
              <span>{orders.filter(o => o.status === 'shipped').length} Shipped</span>
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)} id="add-order-btn">
            <Plus size={17} /> Add Order
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="page-filters card">
        <div className="filter-search">
          <Search size={17} className="filter-search-icon" />
          <input type="text" placeholder="Search by order ID or customer name…"
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="input" />
        </div>
        <div className="filter-actions">
          <div className="status-filter-tabs">
            {statusOptions.map(status => (
              <button key={status}
                className={`filter-tab ${filterStatus === status ? 'active' : ''}`}
                onClick={() => setFilterStatus(status)}>
                {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                {status !== 'all' && (
                  <span className="filter-tab-count">
                    {orders.filter(o => o.status === status).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Date</th>
              <th>Status</th>
              <th>Update</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(order => (
              <tr key={order.id}>
                <td><strong style={{ color: 'var(--primary-400)' }}>{order.id}</strong></td>
                <td>{order.customer}</td>
                <td>
                  <span className="order-items-cell" title={order.items.join(', ')}>
                    {order.items[0]}{order.items.length > 1 ? ` +${order.items.length - 1} more` : ''}
                  </span>
                </td>
                <td><strong>{formatCurrency(order.total)}</strong></td>
                <td>
                  <span className="badge badge-primary" style={{ fontSize: '0.72rem' }}>
                    {order.paymentMethod}
                  </span>
                </td>
                <td style={{ whiteSpace: 'nowrap' }}>{formatDate(order.date)}</td>
                <td>
                  <span className={`badge badge-${getStatusBadge(order.status)}`}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    {getStatusIcon(order.status)} {order.status}
                  </span>
                </td>
                <td>
                  <select className="select status-select"
                    value={order.status}
                    onChange={e => updateOrderStatus(order.id, e.target.value)}>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredOrders.length === 0 && (
        <div className="empty-state">
          <Package size={48} />
          <h3>No orders found</h3>
          <p>Try adjusting your filters or add a new order</p>
        </div>
      )}

      {/* Add Order Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Order</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddOrder} className="modal-form">
              <div className="input-group">
                <label>Customer Name *</label>
                <input className="input" placeholder="e.g. Rahul Sharma"
                  value={newOrder.customer}
                  onChange={e => setNewOrder({ ...newOrder, customer: e.target.value })} required />
              </div>

              <div className="input-group">
                <label>Items *</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input className="input" placeholder="Add item name and press Enter"
                    value={itemInput}
                    onChange={e => setItemInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addItem(); } }} />
                  <button type="button" className="btn btn-secondary" onClick={addItem}>Add</button>
                </div>
                {newOrder.items.length > 0 && (
                  <div className="uploaded-files" style={{ marginTop: '8px' }}>
                    {newOrder.items.map((item, i) => (
                      <div key={i} className="uploaded-file">
                        <span>{item}</span>
                        <button type="button" className="file-remove" onClick={() => removeItem(i)}>×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label>Total Amount (₹) *</label>
                  <input className="input" type="number" placeholder="0"
                    value={newOrder.total}
                    onChange={e => setNewOrder({ ...newOrder, total: e.target.value })} required />
                </div>
                <div className="input-group">
                  <label>Payment Method</label>
                  <select className="select" value={newOrder.paymentMethod}
                    onChange={e => setNewOrder({ ...newOrder, paymentMethod: e.target.value })}>
                    <option>UPI</option>
                    <option>Credit Card</option>
                    <option>Debit Card</option>
                    <option>Net Banking</option>
                    <option>Cash on Delivery</option>
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label>Initial Status</label>
                <select className="select" value={newOrder.status}
                  onChange={e => setNewOrder({ ...newOrder, status: e.target.value })}>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                </select>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" id="save-order-btn">
                  Create Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
