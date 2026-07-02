import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Shield, TrendingUp, BarChart3 } from 'lucide-react';
import './Auth.css';

const PARTICLES = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  duration: Math.random() * 20 + 10,
  delay: Math.random() * 10,
  opacity: Math.random() * 0.5 + 0.1,
}));

const FEATURES = [
  { icon: BarChart3, text: 'Real-time analytics & insights', color: '#818cf8' },
  { icon: Shield, text: 'Enterprise-grade security', color: '#34d399' },
  { icon: TrendingUp, text: 'Smart business forecasting', color: '#f472b6' },
  { icon: ArrowRight, text: 'Lightning-fast performance', color: '#fbbf24' },
];

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const heroRef = useRef(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleMouse = (e) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      setMousePos({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      });
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
    <div className="login-root">
      {/* ── LEFT HERO PANEL ── */}
      <div className="login-hero" ref={heroRef}>
        {/* Dynamic spotlight that follows mouse */}
        <div
          className="login-spotlight"
          style={{
            background: `radial-gradient(600px circle at ${mousePos.x}% ${mousePos.y}%, rgba(99,102,241,0.15) 0%, transparent 70%)`,
          }}
        />

        {/* Floating particles */}
        <div className="login-particles">
          {PARTICLES.map((p) => (
            <span
              key={p.id}
              className="login-particle"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                opacity: p.opacity,
                animationDuration: `${p.duration}s`,
                animationDelay: `${p.delay}s`,
              }}
            />
          ))}
        </div>

        {/* Grid overlay */}
        <div className="login-grid-overlay" />

        {/* Hero content */}
        <div className="login-hero-content">
          <div className="login-brand">
            <div className="login-logo-wrap">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5z" fill="currentColor" opacity="0.9"/>
                <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="login-brand-name">DataHive</span>
          </div>

          <div className="login-hero-text">
            <div className="login-tag">
              <span className="login-tag-dot" />
              Business Intelligence Platform
            </div>
            <h1 className="login-headline">
              Your data,<br />
              <span className="login-headline-accent">supercharged.</span>
            </h1>
            <p className="login-subline">
              Manage orders, customers, products & documents — all in one powerful dashboard.
            </p>
          </div>

          <ul className="login-features">
            {FEATURES.map(({ icon: Icon, text, color }, i) => (
              <li key={i} className="login-feature" style={{ animationDelay: `${0.1 * i}s` }}>
                <span className="login-feature-icon" style={{ color, boxShadow: `0 0 16px ${color}44` }}>
                  <Icon size={15} />
                </span>
                <span>{text}</span>
              </li>
            ))}
          </ul>


        </div>
      </div>

      {/* ── RIGHT FORM PANEL ── */}
      <div className="login-form-panel">
        <div className="login-form-inner">

          {/* Mobile logo (only visible on small screens) */}
          <div className="login-mobile-brand">
            <div className="login-logo-wrap">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5z" fill="currentColor" opacity="0.9"/>
                <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <span>DataHive</span>
          </div>

          <div className="login-form-header">
            <h2>Welcome back</h2>
            <p>Sign in to continue to your dashboard</p>
          </div>

          {error && (
            <div className="login-error-box">
              <span className="login-error-dot" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form" noValidate>
            {/* Email */}
            <div className={`lf-group ${focusedField === 'email' ? 'lf-group--focused' : ''}`}>
              <label htmlFor="login-email">Email address</label>
              <div className="lf-input-wrap">
                <Mail size={17} className="lf-icon" />
                <input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className={`lf-group ${focusedField === 'password' ? 'lf-group--focused' : ''}`}>
              <div className="lf-label-row">
                <label htmlFor="login-password">Password</label>
                <a href="#" className="lf-forgot">Forgot password?</a>
              </div>
              <div className="lf-input-wrap">
                <Lock size={17} className="lf-icon" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="lf-eye-btn"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              id="login-btn"
              className={`login-submit-btn ${loading ? 'login-submit-btn--loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <span className="login-spinner" />
              ) : (
                <>
                  Sign in <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="login-footer-text">
            Don't have an account?{' '}
            <Link to="/register" className="login-register-link">
              Create one free →
            </Link>
          </p>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Login;
