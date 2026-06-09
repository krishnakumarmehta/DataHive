import { useBusiness } from '../context/BusinessContext';
import { formatCurrency } from '../utils/helpers';
import {
  TrendingUp, TrendingDown, IndianRupee, ShoppingCart,
  Target, Award
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import './Pages.css';

const Sales = () => {
  const { salesData, orders, customers, products } = useBusiness();

  const totalRevenue = salesData.reduce((sum, s) => sum + s.revenue, 0);
  const totalProfit = salesData.reduce((sum, s) => sum + s.profit, 0);
  const totalOrders = salesData.reduce((sum, s) => sum + s.orders, 0);
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const profitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0;

  const categoryData = products.reduce((acc, p) => {
    const existing = acc.find(item => item.name === p.category);
    if (existing) {
      existing.value += p.price * p.stock;
      existing.count += 1;
    } else {
      acc.push({ name: p.category, value: p.price * p.stock, count: 1 });
    }
    return acc;
  }, []);

  const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#10b981', '#f59e0b', '#06b6d4', '#f97316'];

  const paymentData = orders.reduce((acc, o) => {
    const existing = acc.find(item => item.name === o.paymentMethod);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: o.paymentMethod, value: 1 });
    }
    return acc;
  }, []);

  const topCustomers = [...customers].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="chart-tooltip-label">{label}</p>
          {payload.map((entry, i) => (
            <p key={i} style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' && entry.value > 100 ? formatCurrency(entry.value) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <h2>Sales & Analytics</h2>
          <p>Comprehensive business performance overview</p>
        </div>
      </div>

      {/* Sales Stats */}
      <div className="sales-stats-grid">
        <div className="sales-stat-card card-glass">
          <div className="sales-stat-icon" style={{ background: 'var(--gradient-primary)' }}>
            <IndianRupee size={22} />
          </div>
          <div className="sales-stat-content">
            <span className="sales-stat-value">{formatCurrency(totalRevenue)}</span>
            <span className="sales-stat-label">Total Revenue</span>
          </div>
        </div>
        <div className="sales-stat-card card-glass">
          <div className="sales-stat-icon" style={{ background: 'var(--gradient-success)' }}>
            <TrendingUp size={22} />
          </div>
          <div className="sales-stat-content">
            <span className="sales-stat-value">{formatCurrency(totalProfit)}</span>
            <span className="sales-stat-label">Total Profit</span>
          </div>
        </div>
        <div className="sales-stat-card card-glass">
          <div className="sales-stat-icon" style={{ background: 'var(--gradient-accent)' }}>
            <ShoppingCart size={22} />
          </div>
          <div className="sales-stat-content">
            <span className="sales-stat-value">{formatCurrency(avgOrderValue)}</span>
            <span className="sales-stat-label">Avg Order Value</span>
          </div>
        </div>
        <div className="sales-stat-card card-glass">
          <div className="sales-stat-icon" style={{ background: 'var(--gradient-warm)' }}>
            <Target size={22} />
          </div>
          <div className="sales-stat-content">
            <span className="sales-stat-value">{profitMargin}%</span>
            <span className="sales-stat-label">Profit Margin</span>
          </div>
        </div>
      </div>

      {/* Revenue & Profit Chart */}
      <div className="sales-charts-row">
        <div className="card sales-chart-card">
          <div className="chart-header">
            <h3>Revenue vs Profit Trend</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={salesData}>
              <defs>
                <linearGradient id="salesRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="salesProfitGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `₹${v / 1000}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="url(#salesRevenueGrad)" strokeWidth={2} name="Revenue" />
              <Area type="monotone" dataKey="profit" stroke="#10b981" fill="url(#salesProfitGrad)" strokeWidth={2} name="Profit" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card sales-chart-card">
          <div className="chart-header">
            <h3>Monthly Orders</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="orders" name="Orders" radius={[6, 6, 0, 0]}>
                {salesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="sales-bottom-row">
        {/* Category Distribution */}
        <div className="card">
          <div className="chart-header">
            <h3>Inventory by Category</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={100}
                dataKey="value" nameKey="name" paddingAngle={3}>
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pie-legend">
            {categoryData.map((item, i) => (
              <div key={item.name} className="pie-legend-item">
                <span className="pie-legend-dot" style={{ background: COLORS[i % COLORS.length] }}></span>
                <span>{item.name} ({item.count})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Customers */}
        <div className="card">
          <div className="chart-header">
            <h3><Award size={18} /> Top Customers</h3>
          </div>
          <div className="top-customers-list">
            {topCustomers.map((customer, i) => (
              <div key={customer.id} className="top-customer-item">
                <div className="top-customer-rank">#{i + 1}</div>
                <div className="top-customer-avatar">
                  {customer.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                </div>
                <div className="top-customer-info">
                  <span className="top-customer-name">{customer.name}</span>
                  <span className="top-customer-orders">{customer.totalOrders} orders</span>
                </div>
                <span className="top-customer-spent">{formatCurrency(customer.totalSpent)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="card">
          <div className="chart-header">
            <h3>Payment Methods</h3>
          </div>
          <div className="payment-methods-list">
            {paymentData.map((method, i) => (
              <div key={method.name} className="payment-method-item">
                <span className="payment-method-name">{method.name}</span>
                <div className="payment-method-bar-wrap">
                  <div className="payment-method-bar" style={{
                    width: `${(method.value / orders.length) * 100}%`,
                    background: COLORS[i % COLORS.length]
                  }}></div>
                </div>
                <span className="payment-method-count">{method.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sales;
