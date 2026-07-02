import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useBusiness } from '../../context/BusinessContext';
import {
  LayoutDashboard, Package, ShoppingCart, Users, TrendingUp,
  FileText, Settings, LogOut, Bot, X, Hexagon
} from 'lucide-react';
import './Sidebar.css';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/products', label: 'Products', icon: Package },
  { path: '/orders', label: 'Orders', icon: ShoppingCart },
  { path: '/customers', label: 'Customers', icon: Users },
  { path: '/sales', label: 'Sales & Analytics', icon: TrendingUp },
  { path: '/documents', label: 'Documents', icon: FileText },
  { path: '/settings', label: 'Settings', icon: Settings },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { orders } = useBusiness();
  const location = useLocation();

  const pendingOrdersCount = orders.filter(o => o.status === 'pending' || o.status === 'processing').length;

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-icon">
              <Hexagon size={28} />
            </div>
            <div className="logo-text">
              <h1>DataHive</h1>
              <span>AI Business Platform</span>
            </div>
          </div>
          <button className="sidebar-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-user">
          <div className="sidebar-user-avatar">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="sidebar-user-info">
            <p className="sidebar-user-name">{user?.name || 'User'}</p>
            <p className="sidebar-user-business">{user?.businessName || 'Business'}</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">MAIN MENU</div>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
              {item.path === '/orders' && pendingOrdersCount > 0 && (
                <span className="nav-badge">{pendingOrdersCount}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-ai-card">
            <Bot size={20} />
            <div>
              <p className="ai-card-title">AI Assistant</p>
              <p className="ai-card-desc">Ask anything about your business</p>
            </div>
          </div>
          <button className="sidebar-logout" onClick={logout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
