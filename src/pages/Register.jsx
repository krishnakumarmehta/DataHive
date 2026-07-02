import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { businessCategories } from '../data/mockData';
import {
  Mail, Lock, Eye, EyeOff, Hexagon, ArrowRight, ArrowLeft,
  User, Building2, Phone, MapPin, Globe, Upload, Briefcase, ChevronRight
} from 'lucide-react';
import './Auth.css';

const Register = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    businessName: '', businessType: '', phone: '', city: '',
    website: '', description: '', gstNumber: '',
    documents: [],
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [customBusinessType, setCustomBusinessType] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const type = file.name.split('.').pop().toLowerCase();
      const sizeStr = (file.size / 1024 / 1024).toFixed(2) + ' MB';
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const fileObj = {
          name: file.name,
          size: sizeStr,
          type: type,
          content: event.target.result
        };
        setFormData(prev => ({ ...prev, documents: [...prev.documents, fileObj] }));
      };
      
      const isText = file.type.startsWith('text/') || 
                     ['txt', 'csv', 'json', 'md', 'log', 'xml', 'js', 'jsx', 'html', 'css'].includes(type);
      if (isText) {
        reader.readAsText(file);
      } else {
        const fileObj = {
          name: file.name,
          size: sizeStr,
          type: type,
          content: `Uploaded file details: Name: ${file.name}, Type: ${type}, Size: ${sizeStr}. (Binary file content is not readable)`
        };
        setFormData(prev => ({ ...prev, documents: [...prev.documents, fileObj] }));
      }
    });
  };

  const removeFile = (index) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  const validateStep = () => {
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.password) {
        setError('Please fill in all required fields');
        return false;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
    }
    if (step === 2) {
      if (!formData.businessName || !formData.businessType) {
        setError('Please fill in business name and type');
        return false;
      }
      if (formData.businessType === 'Other' && !customBusinessType.trim()) {
        setError('Please specify your business type');
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep(prev => prev + 1);
      setError('');
    }
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const finalData = {
        ...formData,
        businessType: formData.businessType === 'Other'
          ? (customBusinessType.trim() || 'Other')
          : formData.businessType,
      };
      const result = await register(finalData);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, label: 'Personal Info' },
    { num: 2, label: 'Business Details' },
    { num: 3, label: 'Connect & Upload' },
  ];

  return (
    <div className="auth-page">
      <div className="auth-bg-effects">
        <div className="auth-orb auth-orb-1"></div>
        <div className="auth-orb auth-orb-2"></div>
        <div className="auth-orb auth-orb-3"></div>
      </div>

      <div className="auth-container register-container animate-fade-in-up">
        <div className="auth-card glass">
          <div className="auth-header">
            <div className="auth-logo">
              <Hexagon size={36} />
            </div>
            <h1 className="gradient-text">Join DataHive</h1>
            <p>Register your business and get your AI assistant</p>
          </div>

          {/* Progress Steps */}
          <div className="register-steps">
            {steps.map((s, i) => (
              <div key={s.num} className={`register-step ${step >= s.num ? 'active' : ''} ${step > s.num ? 'completed' : ''}`}>
                <div className="step-number">{step > s.num ? '✓' : s.num}</div>
                <span className="step-label">{s.label}</span>
                {i < steps.length - 1 && <ChevronRight size={14} className="step-arrow" />}
              </div>
            ))}
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            {/* Step 1: Personal Info */}
            {step === 1 && (
              <div className="form-step animate-fade-in">
                <div className="input-group">
                  <label htmlFor="reg-name">Full Name *</label>
                  <div className="input-with-icon">
                    <User size={18} className="input-icon" />
                    <input id="reg-name" type="text" className="input" placeholder="Your full name"
                      value={formData.name} onChange={(e) => updateField('name', e.target.value)} required />
                  </div>
                </div>

                <div className="input-group">
                  <label htmlFor="reg-email">Email Address *</label>
                  <div className="input-with-icon">
                    <Mail size={18} className="input-icon" />
                    <input id="reg-email" type="email" className="input" placeholder="your@email.com"
                      value={formData.email} onChange={(e) => updateField('email', e.target.value)} required />
                  </div>
                </div>

                <div className="input-group">
                  <label htmlFor="reg-password">Password *</label>
                  <div className="input-with-icon">
                    <Lock size={18} className="input-icon" />
                    <input id="reg-password" type={showPassword ? 'text' : 'password'} className="input"
                      placeholder="Min 6 characters" value={formData.password}
                      onChange={(e) => updateField('password', e.target.value)} required style={{ paddingRight: '44px' }} />
                    <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="input-group">
                  <label htmlFor="reg-confirm">Confirm Password *</label>
                  <div className="input-with-icon">
                    <Lock size={18} className="input-icon" />
                    <input id="reg-confirm" type="password" className="input" placeholder="Confirm password"
                      value={formData.confirmPassword} onChange={(e) => updateField('confirmPassword', e.target.value)} required />
                  </div>
                </div>

                <button type="button" className="btn btn-primary btn-lg auth-submit" onClick={nextStep}>
                  Next <ArrowRight size={18} />
                </button>
              </div>
            )}

            {/* Step 2: Business Details */}
            {step === 2 && (
              <div className="form-step animate-fade-in">
                <div className="input-group">
                  <label htmlFor="reg-bname">Business Name *</label>
                  <div className="input-with-icon">
                    <Building2 size={18} className="input-icon" />
                    <input id="reg-bname" type="text" className="input" placeholder="Your business name"
                      value={formData.businessName} onChange={(e) => updateField('businessName', e.target.value)} required />
                  </div>
                </div>

                <div className="input-group">
                  <label htmlFor="reg-btype">Business Category *</label>
                  <select id="reg-btype" className="select" value={formData.businessType}
                    onChange={(e) => {
                      updateField('businessType', e.target.value);
                      if (e.target.value !== 'Other') setCustomBusinessType('');
                    }} required>
                    <option value="">Select category</option>
                    {businessCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>

                  {/* Custom type input — slides in when Other is selected */}
                  {formData.businessType === 'Other' && (
                    <div className="other-type-input animate-fade-in">
                      <Briefcase size={17} className="input-icon" />
                      <input
                        id="reg-btype-custom"
                        type="text"
                        className="input"
                        placeholder="e.g. Handicrafts, Jewellery, Printing..."
                        value={customBusinessType}
                        onChange={(e) => setCustomBusinessType(e.target.value)}
                        autoFocus
                        required
                      />
                    </div>
                  )}
                </div>

                <div className="input-group">
                  <label htmlFor="reg-phone">Phone Number</label>
                  <div className="input-with-icon">
                    <Phone size={18} className="input-icon" />
                    <input id="reg-phone" type="tel" className="input" placeholder="+91 XXXXX XXXXX"
                      value={formData.phone} onChange={(e) => updateField('phone', e.target.value)} />
                  </div>
                </div>

                <div className="input-group">
                  <label htmlFor="reg-city">City</label>
                  <div className="input-with-icon">
                    <MapPin size={18} className="input-icon" />
                    <input id="reg-city" type="text" className="input" placeholder="Your city"
                      value={formData.city} onChange={(e) => updateField('city', e.target.value)} />
                  </div>
                </div>

                <div className="input-group">
                  <label htmlFor="reg-gst">GST Number (Optional)</label>
                  <div className="input-with-icon">
                    <Briefcase size={18} className="input-icon" />
                    <input id="reg-gst" type="text" className="input" placeholder="22AAAAA0000A1Z5"
                      value={formData.gstNumber} onChange={(e) => updateField('gstNumber', e.target.value)} />
                  </div>
                </div>

                <div className="form-step-buttons">
                  <button type="button" className="btn btn-secondary" onClick={prevStep}>
                    <ArrowLeft size={18} /> Back
                  </button>
                  <button type="button" className="btn btn-primary" onClick={nextStep}>
                    Next <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Connect & Upload */}
            {step === 3 && (
              <div className="form-step animate-fade-in">
                <div className="input-group">
                  <label htmlFor="reg-website">Website URL (Optional)</label>
                  <div className="input-with-icon">
                    <Globe size={18} className="input-icon" />
                    <input id="reg-website" type="url" className="input" placeholder="https://www.example.com"
                      value={formData.website} onChange={(e) => updateField('website', e.target.value)} />
                  </div>
                </div>

                <div className="input-group">
                  <label htmlFor="reg-desc">Business Description</label>
                  <textarea id="reg-desc" className="textarea" placeholder="Tell us about your business..."
                    value={formData.description} onChange={(e) => updateField('description', e.target.value)}
                    rows={3} />
                </div>

                <div className="input-group">
                  <label>Upload Documents (PDF, Images)</label>
                  <div className="file-upload-area">
                    <input
                      type="file"
                      id="reg-files"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={handleFileUpload}
                      className="file-input"
                    />
                    <label htmlFor="reg-files" className="file-upload-label">
                      <Upload size={24} />
                      <span>Click to upload or drag files here</span>
                      <span className="file-upload-hint">PDF, JPG, PNG, DOC (Max 10MB each)</span>
                    </label>
                  </div>

                  {formData.documents.length > 0 && (
                    <div className="uploaded-files">
                      {formData.documents.map((file, i) => (
                        <div key={i} className="uploaded-file">
                          <span>{file.name} ({file.size})</span>
                          <button type="button" onClick={() => removeFile(i)} className="file-remove">×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="form-step-buttons">
                  <button type="button" className="btn btn-secondary" onClick={prevStep}>
                    <ArrowLeft size={18} /> Back
                  </button>
                  <button
                    type="submit"
                    className={`btn btn-primary ${loading ? 'loading' : ''}`}
                    disabled={loading}
                    id="register-btn"
                  >
                    {loading ? (
                      <span className="btn-spinner"></span>
                    ) : (
                      <>
                        Create Account <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
