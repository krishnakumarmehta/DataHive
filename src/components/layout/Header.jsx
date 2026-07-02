import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, Bell, Search } from 'lucide-react';
import './Header.css';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/products': 'Products',
  '/orders': 'Orders',
  '/customers': 'Customers',
  '/sales': 'Sales & Analytics',
  '/documents': 'Documents',
  '/settings': 'Settings',
};

const Header = ({ onMenuClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const title = pageTitles[location.pathname] || 'Dashboard';

  return (
    <header className="header">
      <div className="header-left">
        <button className="header-menu-btn" onClick={onMenuClick}>
          <Menu size={22} />
        </button>
        <div className="header-title-section">
          <h2 className="header-title">{title}</h2>
          <p className="header-subtitle">Welcome back, {user?.name?.split(' ')[0] || 'User'}</p>
        </div>
      </div>

      <div className="header-center">
        <div className="header-search">
          <Search size={18} className="header-search-icon" />
          <input
            type="text"
            placeholder="Search products, orders, customers..."
            className="header-search-input"
          />
        </div>
      </div>

      <div className="header-right">
        <button className="header-notification-btn" id="notifications-btn">
          <Bell size={20} />
          <span className="notification-dot"></span>
        </button>
        <div 
          className="header-avatar" 
          id="user-avatar"
          onClick={() => navigate('/settings')}
          title="Profile Settings"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              navigate('/settings');
            }
          }}
        >
          {user?.name?.charAt(0) || 'U'}
        </div>
      </div>
    </header>
  );
};

export default Header;
