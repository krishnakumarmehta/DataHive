import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// ── Helpers ──────────────────────────────────────────────
const USERS_KEY = 'datahive_local_users';
const SESSION_KEY = 'datahive_user';

const getLocalUsers = () => JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
const saveLocalUsers = (users) => localStorage.setItem(USERS_KEY, JSON.stringify(users));
const getSession = () => {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch { return null; }
};
const saveSession = (user) => localStorage.setItem(SESSION_KEY, JSON.stringify(user));
const clearSession = () => localStorage.removeItem(SESSION_KEY);

// ── Provider ─────────────────────────────────────────────
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const saved = getSession();
    if (saved) setUser(saved);
    setLoading(false);
  }, []);

  // ── Login ─────────────────────────────────────────────
  const login = async (email, password) => {
    // Built-in admin / demo account
    if (email === '0krishnakumarmehta@gmail.com' && password === 'Krishna@123') {
      const adminUser = {
        id: 'admin-001',
        name: 'Krishna Kumar Mehta',
        email: '0krishnakumarmehta@gmail.com',
        businessName: 'DataHive Business',
        businessType: 'Business Intelligence',
        phone: '',
        city: '',
        website: '',
        apiKey: '',
        documents: [],
        createdAt: new Date().toISOString(),
      };
      setUser(adminUser);
      saveSession(adminUser);
      return { success: true };
    }

    // Check locally registered users
    const users = getLocalUsers();
    const match = users.find(u => u.email === email);

    if (!match) {
      return { success: false, error: 'No account found with this email. Please register first.' };
    }
    if (match.password !== password) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    // Login successful
    const sessionUser = { ...match };
    delete sessionUser.password;
    setUser(sessionUser);
    saveSession(sessionUser);
    return { success: true };
  };

  // ── Register ──────────────────────────────────────────
  const register = async (userData) => {
    const users = getLocalUsers();

    // Check for duplicate email
    const exists = users.find(u => u.email === userData.email);
    if (exists) {
      return { success: false, error: 'An account with this email already exists. Please login.' };
    }

    // Basic validation
    if (!userData.email || !userData.password) {
      return { success: false, error: 'Email and password are required.' };
    }

    const newUser = {
      id: 'user-' + Date.now(),
      name: userData.name || '',
      email: userData.email,
      password: userData.password,
      businessName: userData.businessName || '',
      businessType: userData.businessType || '',
      phone: userData.phone || '',
      city: userData.city || '',
      website: userData.website || '',
      description: userData.description || '',
      gstNumber: userData.gstNumber || '',
      apiKey: '',
      documents: userData.documents || [],
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveLocalUsers(users);

    // Log user in immediately after registration
    const sessionUser = { ...newUser };
    delete sessionUser.password;
    setUser(sessionUser);
    saveSession(sessionUser);

    return { success: true };
  };

  // ── Logout ────────────────────────────────────────────
  const logout = async () => {
    setUser(null);
    clearSession();
  };

  // ── Update Profile ────────────────────────────────────
  const updateProfile = async (updates) => {
    try {
      const currentUser = getSession();
      if (!currentUser) return { success: false, error: 'Not logged in.' };

      const updatedUser = { ...currentUser, ...updates };
      setUser(updatedUser);
      saveSession(updatedUser);

      // Also update in the users list (if not admin)
      if (!currentUser.id.startsWith('admin-')) {
        const users = getLocalUsers();
        const idx = users.findIndex(u => u.id === currentUser.id);
        if (idx !== -1) {
          users[idx] = { ...users[idx], ...updates };
          saveLocalUsers(users);
        }
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || 'Update failed' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
