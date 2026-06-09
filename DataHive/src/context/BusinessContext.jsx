import { createContext, useContext, useState, useEffect } from 'react';
import { mockProducts, mockOrders, mockCustomers, mockSalesData, mockDocuments, mockActivities } from '../data/mockData';
import { useAuth } from './AuthContext';

const BusinessContext = createContext(null);

export const useBusiness = () => {
  const context = useContext(BusinessContext);
  if (!context) throw new Error('useBusiness must be used within BusinessProvider');
  return context;
};

export const BusinessProvider = ({ children }) => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    if (user) {
      const userId = user.id;
      const savedProducts = localStorage.getItem(`datahive_${userId}_products`);
      const savedOrders = localStorage.getItem(`datahive_${userId}_orders`);
      const savedCustomers = localStorage.getItem(`datahive_${userId}_customers`);
      const savedDocuments = localStorage.getItem(`datahive_${userId}_documents`);
      const savedActivities = localStorage.getItem(`datahive_${userId}_activities`);

      if (userId === 'demo-001') {
        setProducts(savedProducts ? JSON.parse(savedProducts) : mockProducts);
        setOrders(savedOrders ? JSON.parse(savedOrders) : mockOrders);
        setCustomers(savedCustomers ? JSON.parse(savedCustomers) : mockCustomers);
        setDocuments(savedDocuments ? JSON.parse(savedDocuments) : mockDocuments);
        setActivities(savedActivities ? JSON.parse(savedActivities) : mockActivities);
      } else {
        setProducts(savedProducts ? JSON.parse(savedProducts) : []);
        setOrders(savedOrders ? JSON.parse(savedOrders) : []);
        setCustomers(savedCustomers ? JSON.parse(savedCustomers) : []);
        setActivities(savedActivities ? JSON.parse(savedActivities) : []);
        
        if (savedDocuments) {
          setDocuments(JSON.parse(savedDocuments));
        } else if (user.documents && Array.isArray(user.documents)) {
          const initialDocs = user.documents.map((d, index) => ({
            id: `doc-${index}-${Date.now()}`,
            name: d.name,
            type: d.name.split('.').pop() || d.type || 'pdf',
            size: d.size,
            uploadDate: new Date().toISOString().split('T')[0],
            category: 'General',
            content: `This document (${d.name}) was uploaded during registration.`,
          }));
          setDocuments(initialDocs);
        } else {
          setDocuments([]);
        }
      }
      setSalesData(mockSalesData);
    } else {
      setProducts([]);
      setOrders([]);
      setCustomers([]);
      setDocuments([]);
      setActivities([]);
    }
  }, [user]);

  // Save to localStorage on changes, scoped by user.id
  useEffect(() => {
    if (user) {
      localStorage.setItem(`datahive_${user.id}_products`, JSON.stringify(products));
    }
  }, [products, user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`datahive_${user.id}_orders`, JSON.stringify(orders));
    }
  }, [orders, user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`datahive_${user.id}_customers`, JSON.stringify(customers));
    }
  }, [customers, user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`datahive_${user.id}_documents`, JSON.stringify(documents));
    }
  }, [documents, user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`datahive_${user.id}_activities`, JSON.stringify(activities));
    }
  }, [activities, user]);

  // Product CRUD
  const addProduct = (product) => {
    const newProduct = { ...product, id: Date.now(), status: 'active' };
    setProducts(prev => [newProduct, ...prev]);
    addActivity('product', `New product added: ${product.name}`);
  };

  const updateProduct = (id, updates) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  // Order CRUD
  const addOrder = (order) => {
    const newOrder = { ...order, id: `ORD-${Date.now()}`, date: new Date().toISOString().split('T')[0] };
    setOrders(prev => [newOrder, ...prev]);
    addActivity('order', `New order ${newOrder.id} received from ${order.customer}`);
  };

  const updateOrderStatus = (id, status) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  // Customer CRUD
  const addCustomer = (customer) => {
    const newCustomer = { ...customer, id: Date.now(), totalOrders: 0, totalSpent: 0, status: 'active', lastOrder: 'N/A' };
    setCustomers(prev => [newCustomer, ...prev]);
    addActivity('customer', `New customer registered: ${customer.name}`);
  };

  const updateCustomer = (id, updates) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteCustomer = (id) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
  };

  // Document CRUD
  const addDocument = (doc) => {
    const newDoc = { ...doc, id: Date.now(), uploadDate: new Date().toISOString().split('T')[0] };
    setDocuments(prev => [newDoc, ...prev]);
    addActivity('document', `Document uploaded: ${doc.name}`);
  };

  const deleteDocument = (id) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  // Activity
  const addActivity = (type, message) => {
    const newActivity = { id: Date.now(), type, message, time: 'Just now', icon: getActivityIcon(type) };
    setActivities(prev => [newActivity, ...prev.slice(0, 9)]);
  };

  const getActivityIcon = (type) => {
    const icons = { order: 'shopping-cart', product: 'package', customer: 'user-plus', sale: 'trending-up', document: 'file-text' };
    return icons[type] || 'activity';
  };

  // Stats
  const getStats = () => {
    const totalRevenue = orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + o.total, 0);
    const totalProducts = products.length;
    const totalOrders = orders.length;
    const totalCustomers = customers.length;
    const activeProducts = products.filter(p => p.status === 'active').length;
    const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'processing').length;

    return { totalRevenue, totalProducts, totalOrders, totalCustomers, activeProducts, pendingOrders };
  };

  return (
    <BusinessContext.Provider value={{
      products, orders, customers, salesData, documents, activities,
      addProduct, updateProduct, deleteProduct,
      addOrder, updateOrderStatus,
      addCustomer, updateCustomer, deleteCustomer,
      addDocument, deleteDocument,
      getStats,
    }}>
      {children}
    </BusinessContext.Provider>
  );
};
