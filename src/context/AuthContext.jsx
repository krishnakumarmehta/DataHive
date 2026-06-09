import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

const mapSupabaseUser = (sbUser) => {
  if (!sbUser) return null;
  const metadata = sbUser.user_metadata || {};
  return {
    id: sbUser.id,
    email: sbUser.email,
    name: metadata.name || '',
    businessName: metadata.businessName || '',
    businessType: metadata.businessType || '',
    phone: metadata.phone || '',
    city: metadata.city || '',
    website: metadata.website || '',
    description: metadata.description || '',
    gstNumber: metadata.gstNumber || '',
    apiKey: metadata.apiKey || '',
    documents: metadata.documents || [],
    createdAt: sbUser.created_at,
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check if demo user is stored locally
    const savedUser = localStorage.getItem('datahive_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      if (parsed.id === 'demo-001') {
        setUser(parsed);
        setLoading(false);
        return;
      }
    }

    // 2. Otherwise check active Supabase session
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (session && session.user) {
          setUser(mapSupabaseUser(session.user));
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Error fetching session:', err);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // 3. Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const currentSaved = localStorage.getItem('datahive_user');
      const isDemo = currentSaved && JSON.parse(currentSaved).id === 'demo-001';

      if (isDemo && event !== 'SIGNED_OUT') {
        setUser(mapSupabaseUser(session?.user));
        localStorage.removeItem('datahive_user');
      } else if (!isDemo) {
        if (session && session.user) {
          setUser(mapSupabaseUser(session.user));
        } else {
          setUser(null);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    // Demo login fallback
    if (email === 'demo@datahive.com' && password === 'demo123') {
      const demoUser = {
        id: 'demo-001',
        name: 'Rajesh Kumar',
        email: 'demo@datahive.com',
        businessName: 'Kumar Electronics',
        businessType: 'Retail & E-Commerce',
        phone: '+91 99876 54321',
        city: 'Mumbai',
        website: 'www.kumarelectronics.com',
        apiKey: '',
        documents: [],
      };
      setUser(demoUser);
      localStorage.setItem('datahive_user', JSON.stringify(demoUser));
      return { success: true };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      setUser(mapSupabaseUser(data.user));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            businessName: userData.businessName,
            businessType: userData.businessType,
            phone: userData.phone || '',
            city: userData.city || '',
            website: userData.website || '',
            description: userData.description || '',
            gstNumber: userData.gstNumber || '',
            documents: userData.documents || [],
          }
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      setUser(mapSupabaseUser(data.user));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || 'Registration failed' };
    }
  };

  const logout = async () => {
    const currentSaved = localStorage.getItem('datahive_user');
    const isDemo = currentSaved && JSON.parse(currentSaved).id === 'demo-001';

    setUser(null);
    localStorage.removeItem('datahive_user');

    if (!isDemo) {
      await supabase.auth.signOut();
    }
  };

  const updateProfile = async (updates) => {
    const currentSaved = localStorage.getItem('datahive_user');
    const isDemo = currentSaved && JSON.parse(currentSaved).id === 'demo-001';

    if (isDemo) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('datahive_user', JSON.stringify(updatedUser));
      return { success: true };
    }

    try {
      const { data, error } = await supabase.auth.updateUser({
        data: {
          name: updates.name,
          businessName: updates.businessName,
          businessType: updates.businessType,
          phone: updates.phone,
          city: updates.city,
          website: updates.website,
          description: updates.description,
          gstNumber: updates.gstNumber,
          apiKey: updates.apiKey,
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      setUser(mapSupabaseUser(data.user));
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

