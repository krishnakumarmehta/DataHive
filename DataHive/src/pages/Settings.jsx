import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User, Building2, Mail, Phone, MapPin, Globe,
  Save, Key, Bell, Palette, Shield, CreditCard
} from 'lucide-react';
import './Pages.css';

const Settings = () => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    city: user?.city || '',
    businessName: user?.businessName || '',
    businessType: user?.businessType || '',
    website: user?.website || '',
    description: user?.description || '',
    gstNumber: user?.gstNumber || '',
    apiKey: user?.apiKey || '',
  });
  const [saved, setSaved] = useState(false);

  const [notifications, setNotifications] = useState({
    emailOrders: true,
    emailCustomers: true,
    emailReports: false,
    pushOrders: true,
    pushStock: true,
  });

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const result = await updateProfile(formData);
    if (result && result.success === false) {
      alert(result.error || 'Failed to update profile');
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'business', label: 'Business', icon: Building2 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'api', label: 'API & Integrations', icon: Key },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <h2>Settings</h2>
          <p>Manage your account and business preferences</p>
        </div>
      </div>

      <div className="settings-layout">
        {/* Settings Tabs */}
        <div className="settings-tabs card">
          {tabs.map(tab => (
            <button key={tab.id}
              className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}>
              <tab.icon size={18} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="settings-content card animate-fade-in">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile}>
              <h3 className="settings-section-title">Personal Information</h3>
              <div className="settings-form-grid">
                <div className="input-group">
                  <label>Full Name</label>
                  <input className="input" value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className="input-group">
                  <label>Email Address</label>
                  <input className="input" type="email" value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })} />
                </div>
                <div className="input-group">
                  <label>Phone Number</label>
                  <input className="input" value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                </div>
                <div className="input-group">
                  <label>City</label>
                  <input className="input" value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })} />
                </div>
              </div>
              <div className="settings-save">
                <button type="submit" className="btn btn-primary" id="save-profile-btn">
                  <Save size={18} /> Save Changes
                </button>
                {saved && <span className="save-success">✅ Changes saved successfully!</span>}
              </div>
            </form>
          )}

          {/* Business Tab */}
          {activeTab === 'business' && (
            <form onSubmit={handleSaveProfile}>
              <h3 className="settings-section-title">Business Information</h3>
              <div className="settings-form-grid">
                <div className="input-group">
                  <label>Business Name</label>
                  <input className="input" value={formData.businessName}
                    onChange={e => setFormData({ ...formData, businessName: e.target.value })} />
                </div>
                <div className="input-group">
                  <label>Business Type</label>
                  <input className="input" value={formData.businessType}
                    onChange={e => setFormData({ ...formData, businessType: e.target.value })} />
                </div>
                <div className="input-group">
                  <label>Website</label>
                  <input className="input" value={formData.website}
                    onChange={e => setFormData({ ...formData, website: e.target.value })} />
                </div>
                <div className="input-group">
                  <label>GST Number</label>
                  <input className="input" value={formData.gstNumber}
                    onChange={e => setFormData({ ...formData, gstNumber: e.target.value })} />
                </div>
              </div>
              <div className="input-group" style={{ marginTop: '16px' }}>
                <label>Business Description</label>
                <textarea className="textarea" value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })} rows={4} />
              </div>
              <div className="settings-save">
                <button type="submit" className="btn btn-primary">
                  <Save size={18} /> Save Changes
                </button>
                {saved && <span className="save-success">✅ Changes saved successfully!</span>}
              </div>
            </form>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div>
              <h3 className="settings-section-title">Email Notifications</h3>
              <div className="notification-options">
                {[
                  { key: 'emailOrders', label: 'New order notifications', desc: 'Get notified when a new order is placed' },
                  { key: 'emailCustomers', label: 'New customer signups', desc: 'Get notified when a new customer registers' },
                  { key: 'emailReports', label: 'Weekly reports', desc: 'Receive weekly business performance reports' },
                ].map(opt => (
                  <div key={opt.key} className="notification-item">
                    <div>
                      <p className="notification-label">{opt.label}</p>
                      <p className="notification-desc">{opt.desc}</p>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" checked={notifications[opt.key]}
                        onChange={e => setNotifications({ ...notifications, [opt.key]: e.target.checked })} />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                ))}
              </div>

              <h3 className="settings-section-title" style={{ marginTop: '32px' }}>Push Notifications</h3>
              <div className="notification-options">
                {[
                  { key: 'pushOrders', label: 'Order updates', desc: 'Real-time order status changes' },
                  { key: 'pushStock', label: 'Low stock alerts', desc: 'Get alerted when products are running low' },
                ].map(opt => (
                  <div key={opt.key} className="notification-item">
                    <div>
                      <p className="notification-label">{opt.label}</p>
                      <p className="notification-desc">{opt.desc}</p>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" checked={notifications[opt.key]}
                        onChange={e => setNotifications({ ...notifications, [opt.key]: e.target.checked })} />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* API Tab */}
          {activeTab === 'api' && (
            <div>
              <h3 className="settings-section-title">AI Chatbot Configuration</h3>
              <p className="settings-desc">Connect your Google Gemini API key to power the AI chatbot with real AI responses based on your data.</p>
              <form onSubmit={handleSaveProfile}>
                <div className="input-group" style={{ marginTop: '16px' }}>
                  <label>Gemini API Key</label>
                  <input className="input" type="password" placeholder="AIza..."
                    value={formData.apiKey} onChange={e => setFormData({ ...formData, apiKey: e.target.value })} />
                </div>
                <div className="settings-save" style={{ marginTop: '16px', justifyContent: 'flex-start' }}>
                  <button type="submit" className="btn btn-primary btn-sm">
                    <Save size={16} /> Save API Key
                  </button>
                  {saved && <span className="save-success">✅ Saved!</span>}
                </div>
              </form>
              <p className="settings-hint" style={{ marginTop: '8px' }}>
                Get your API key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" style={{ color: 'var(--primary-400)' }}>Google AI Studio</a>
              </p>

              <h3 className="settings-section-title" style={{ marginTop: '32px' }}>Email Integration</h3>
              <p className="settings-desc">Connect your email to receive business notifications.</p>
              <div className="integration-cards">
                <div className="integration-card">
                  <div className="integration-icon">📧</div>
                  <div>
                    <h4>Gmail</h4>
                    <p>Connect your Gmail account</p>
                  </div>
                  <button className="btn btn-secondary btn-sm">Connect</button>
                </div>
                <div className="integration-card">
                  <div className="integration-icon">📨</div>
                  <div>
                    <h4>Outlook</h4>
                    <p>Connect your Outlook account</p>
                  </div>
                  <button className="btn btn-secondary btn-sm">Connect</button>
                </div>
              </div>

              <h3 className="settings-section-title" style={{ marginTop: '32px' }}>Website Integration</h3>
              <p className="settings-desc">Connect your website to sync data automatically.</p>
              <div className="input-group" style={{ marginTop: '12px' }}>
                <label>Website URL</label>
                <input className="input" placeholder="https://www.yourbusiness.com" value={formData.website}
                  onChange={e => setFormData({ ...formData, website: e.target.value })} />
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div>
              <h3 className="settings-section-title">Change Password</h3>
              <div className="settings-form-grid" style={{ maxWidth: '400px' }}>
                <div className="input-group">
                  <label>Current Password</label>
                  <input className="input" type="password" placeholder="Enter current password" />
                </div>
                <div className="input-group">
                  <label>New Password</label>
                  <input className="input" type="password" placeholder="Enter new password" />
                </div>
                <div className="input-group">
                  <label>Confirm New Password</label>
                  <input className="input" type="password" placeholder="Confirm new password" />
                </div>
              </div>
              <div className="settings-save">
                <button className="btn btn-primary">
                  <Shield size={18} /> Update Password
                </button>
              </div>

              <h3 className="settings-section-title" style={{ marginTop: '32px' }}>Danger Zone</h3>
              <div className="danger-zone">
                <div>
                  <h4>Delete Account</h4>
                  <p>Permanently delete your account and all data</p>
                </div>
                <button className="btn btn-danger btn-sm">Delete Account</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
