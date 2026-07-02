import { useBusiness } from '../context/BusinessContext';
import { formatCurrency } from '../utils/helpers';
import {
  Package, ShoppingCart, Users, TrendingUp, IndianRupee,
  ArrowUpRight, ArrowDownRight, Clock, Truck, CheckCircle2,
  AlertCircle, Activity
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import './Dashboard.css';
import './Pages.css';

const Dashboard = () => {
  const { products, orders, customers, salesData, activities, getStats } = useBusiness();
  const stats = getStats();

  const isNewUser = salesData.length === 0 && orders.length === 0 && products.length === 0;

  const statCards = [
    {
      label: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      change: isNewUser ? 'No orders yet' : '+12.5%',
      trend: isNewUser ? 'neutral' : 'up',
      icon: IndianRupee,
      gradient: 'stat-gradient-1',
    },
    {
      label: 'Total Orders',
      value: stats.totalOrders,
      change: isNewUser ? 'No orders yet' : '+8.2%',
      trend: isNewUser ? 'neutral' : 'up',
      icon: ShoppingCart,
      gradient: 'stat-gradient-2',
    },
    {
      label: 'Total Products',
      value: stats.totalProducts,
      change: isNewUser ? 'Add your first product' : `${stats.activeProducts} active`,
      trend: 'neutral',
      icon: Package,
      gradient: 'stat-gradient-3',
    },
    {
      label: 'Total Customers',
      value: stats.totalCustomers,
      change: isNewUser ? 'No customers yet' : '+3 this month',
      trend: isNewUser ? 'neutral' : 'up',
      icon: Users,
      gradient: 'stat-gradient-4',
    },
  ];

  const orderStatusData = [
    { name: 'Delivered', value: orders.filter(o => o.status === 'delivered').length, color: '#10b981' },
    { name: 'Shipped', value: orders.filter(o => o.status === 'shipped').length, color: '#6366f1' },
    { name: 'Processing', value: orders.filter(o => o.status === 'processing').length, color: '#f59e0b' },
    { name: 'Pending', value: orders.filter(o => o.status === 'pending').length, color: '#f97316' },
    { name: 'Cancelled', value: orders.filter(o => o.status === 'cancelled').length, color: '#ef4444' },
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'order': return <ShoppingCart size={16} />;
      case 'product': return <Package size={16} />;
      case 'customer': return <Users size={16} />;
      case 'sale': return <TrendingUp size={16} />;
      default: return <Activity size={16} />;
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="chart-tooltip-label">{label}</p>
          {payload.map((entry, i) => (
            <p key={i} style={{ color: entry.color }}>
              {entry.name}: {entry.name === 'orders' ? entry.value : formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="dashboard">
      {/* Stats Cards */}
      <div className="stats-grid">
        {statCards.map((stat, i) => (
          <div key={i} className={`stat-card card-glass animate-fade-in-up stagger-${i + 1}`}>
            <div className="stat-card-header">
              <div className={`stat-icon ${stat.gradient}`}>
                <stat.icon size={22} />
              </div>
              <div className={`stat-trend ${stat.trend}`}>
                {stat.trend === 'up' && <ArrowUpRight size={14} />}
                {stat.trend === 'down' && <ArrowDownRight size={14} />}
                <span>{stat.change}</span>
              </div>
            </div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="dashboard-charts">
        <div className="chart-card card animate-fade-in-up">
          <div className="chart-header">
            <h3>Revenue Overview</h3>
            <span className="badge badge-primary">Last 6 months</span>
          </div>
          <div className="chart-container">
            {salesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={salesData}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `₹${v/1000}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="url(#revenueGradient)" strokeWidth={2} name="Revenue" />
                  <Area type="monotone" dataKey="profit" stroke="#a855f7" fill="url(#profitGradient)" strokeWidth={2} name="Profit" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state" style={{ height: 280 }}>
                <TrendingUp size={36} style={{ color: 'var(--primary-400)' }} />
                <p>No revenue data yet.<br/>Add orders to see your chart.</p>
              </div>
            )}
          </div>
        </div>

        <div className="chart-card card animate-fade-in-up stagger-2">
          <div className="chart-header">
            <h3>Orders by Month</h3>
            <span className="badge badge-success">{isNewUser ? 'No data' : 'Growing'}</span>
          </div>
          <div className="chart-container">
            {salesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="orders" fill="url(#barGradient)" radius={[6, 6, 0, 0]} name="orders" />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state" style={{ height: 280 }}>
                <ShoppingCart size={36} style={{ color: 'var(--primary-400)' }} />
                <p>No orders yet.<br/>Start by adding your first order.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="dashboard-bottom">
        {/* Recent Orders */}
        <div className="card animate-fade-in-up">
          <div className="chart-header">
            <h3>Recent Orders</h3>
            <span className="badge badge-primary">{orders.length} total</span>
          </div>
          <div className="recent-orders">
            {orders.length > 0 ? orders.slice(0, 5).map((order) => (
              <div key={order.id} className="recent-order-item">
                <div className="order-item-left">
                  <span className="order-id">{order.id}</span>
                  <span className="order-customer">{order.customer}</span>
                </div>
                <div className="order-item-right">
                  <span className="order-amount">{formatCurrency(order.total)}</span>
                  <span className={`badge badge-${order.status === 'delivered' ? 'success' : order.status === 'shipped' ? 'primary' : order.status === 'cancelled' ? 'danger' : 'warning'}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            )) : (
              <div className="empty-state" style={{ padding: '32px 0' }}>
                <ShoppingCart size={32} style={{ color: 'var(--text-muted)' }} />
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No orders yet. Add your first order!</p>
              </div>
            )}
          </div>
        </div>

        {/* Order Status Summary */}
        <div className="card animate-fade-in-up stagger-2">
          <div className="chart-header">
            <h3>Order Status</h3>
          </div>
          <div className="order-status-list">
            {orderStatusData.map((item) => (
              <div key={item.name} className="status-item">
                <div className="status-item-left">
                  <span className="status-dot" style={{ background: item.color }}></span>
                  <span>{item.name}</span>
                </div>
                <div className="status-item-right">
                  <span className="status-count">{item.value}</span>
                  <div className="status-bar">
                    <div
                      className="status-bar-fill"
                      style={{
                        width: `${orders.length ? (item.value / orders.length) * 100 : 0}%`,
                        background: item.color
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="chart-header" style={{ marginTop: '24px' }}>
            <h3>Recent Activity</h3>
          </div>
          <div className="activity-list">
            {activities.slice(0, 4).map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className="activity-icon">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="activity-content">
                  <p>{activity.message}</p>
                  <span>{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
