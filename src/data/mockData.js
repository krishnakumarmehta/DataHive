// Mock data for DataHive platform

export const mockProducts = [
  { id: 1, name: 'Wireless Bluetooth Headphones', category: 'Electronics', price: 2999, stock: 45, status: 'active', sku: 'WBH-001', description: 'Premium noise-cancelling wireless headphones with 30hr battery life' },
  { id: 2, name: 'Organic Green Tea (100 Bags)', category: 'Food & Beverage', price: 499, stock: 200, status: 'active', sku: 'OGT-002', description: 'Premium organic green tea imported from Darjeeling' },
  { id: 3, name: 'Leather Laptop Bag', category: 'Accessories', price: 3499, stock: 30, status: 'active', sku: 'LLB-003', description: 'Genuine leather laptop bag with multiple compartments' },
  { id: 4, name: 'Stainless Steel Water Bottle', category: 'Home & Kitchen', price: 799, stock: 120, status: 'active', sku: 'SSWB-004', description: '1L insulated stainless steel bottle, keeps hot/cold for 24hrs' },
  { id: 5, name: 'Yoga Mat Premium', category: 'Sports', price: 1299, stock: 60, status: 'active', sku: 'YMP-005', description: 'Non-slip premium yoga mat 6mm thick with carrying strap' },
  { id: 6, name: 'Portable Power Bank 20000mAh', category: 'Electronics', price: 1999, stock: 0, status: 'out_of_stock', sku: 'PPB-006', description: 'Fast charging power bank with dual USB ports' },
  { id: 7, name: 'Handmade Scented Candles Set', category: 'Home & Kitchen', price: 899, stock: 85, status: 'active', sku: 'HSC-007', description: 'Set of 4 handmade soy wax candles with essential oils' },
  { id: 8, name: 'Cotton T-Shirt (Pack of 3)', category: 'Clothing', price: 1499, stock: 150, status: 'active', sku: 'CTS-008', description: 'Premium 100% cotton round neck t-shirts' },
];

export const mockOrders = [
  { id: 'ORD-2024-001', customer: 'Rahul Sharma', items: ['Wireless Bluetooth Headphones', 'Leather Laptop Bag'], total: 6498, status: 'delivered', date: '2024-12-15', paymentMethod: 'UPI' },
  { id: 'ORD-2024-002', customer: 'Priya Patel', items: ['Organic Green Tea (100 Bags)'], total: 499, status: 'shipped', date: '2024-12-18', paymentMethod: 'Credit Card' },
  { id: 'ORD-2024-003', customer: 'Amit Singh', items: ['Yoga Mat Premium', 'Stainless Steel Water Bottle'], total: 2098, status: 'processing', date: '2024-12-20', paymentMethod: 'Net Banking' },
  { id: 'ORD-2024-004', customer: 'Neha Gupta', items: ['Cotton T-Shirt (Pack of 3)'], total: 1499, status: 'pending', date: '2024-12-22', paymentMethod: 'Cash on Delivery' },
  { id: 'ORD-2024-005', customer: 'Vikram Joshi', items: ['Handmade Scented Candles Set', 'Stainless Steel Water Bottle'], total: 1698, status: 'delivered', date: '2024-12-10', paymentMethod: 'UPI' },
  { id: 'ORD-2024-006', customer: 'Ananya Reddy', items: ['Wireless Bluetooth Headphones'], total: 2999, status: 'shipped', date: '2024-12-19', paymentMethod: 'Debit Card' },
  { id: 'ORD-2024-007', customer: 'Karan Mehta', items: ['Leather Laptop Bag', 'Portable Power Bank 20000mAh'], total: 5498, status: 'cancelled', date: '2024-12-14', paymentMethod: 'Credit Card' },
  { id: 'ORD-2024-008', customer: 'Sneha Kulkarni', items: ['Organic Green Tea (100 Bags)', 'Handmade Scented Candles Set'], total: 1398, status: 'delivered', date: '2024-12-08', paymentMethod: 'UPI' },
];

export const mockCustomers = [
  { id: 1, name: 'Rahul Sharma', email: 'rahul.sharma@gmail.com', phone: '+91 98765 43210', city: 'Mumbai', totalOrders: 12, totalSpent: 45600, lastOrder: '2024-12-15', status: 'active' },
  { id: 2, name: 'Priya Patel', email: 'priya.patel@outlook.com', phone: '+91 87654 32109', city: 'Ahmedabad', totalOrders: 8, totalSpent: 23400, lastOrder: '2024-12-18', status: 'active' },
  { id: 3, name: 'Amit Singh', email: 'amit.singh@yahoo.com', phone: '+91 76543 21098', city: 'Delhi', totalOrders: 5, totalSpent: 15800, lastOrder: '2024-12-20', status: 'active' },
  { id: 4, name: 'Neha Gupta', email: 'neha.gupta@gmail.com', phone: '+91 65432 10987', city: 'Bangalore', totalOrders: 15, totalSpent: 67200, lastOrder: '2024-12-22', status: 'active' },
  { id: 5, name: 'Vikram Joshi', email: 'vikram.joshi@hotmail.com', phone: '+91 54321 09876', city: 'Pune', totalOrders: 3, totalSpent: 8900, lastOrder: '2024-12-10', status: 'inactive' },
  { id: 6, name: 'Ananya Reddy', email: 'ananya.reddy@gmail.com', phone: '+91 43210 98765', city: 'Hyderabad', totalOrders: 20, totalSpent: 89500, lastOrder: '2024-12-19', status: 'active' },
];

export const mockSalesData = [
  { month: 'Jul', revenue: 45000, orders: 32, profit: 12000 },
  { month: 'Aug', revenue: 52000, orders: 45, profit: 15600 },
  { month: 'Sep', revenue: 48000, orders: 38, profit: 13200 },
  { month: 'Oct', revenue: 61000, orders: 52, profit: 19500 },
  { month: 'Nov', revenue: 75000, orders: 68, profit: 24000 },
  { month: 'Dec', revenue: 89000, orders: 85, profit: 31200 },
];

export const mockDocuments = [
  { id: 1, name: 'Business Registration Certificate', type: 'pdf', size: '2.4 MB', uploadDate: '2024-10-15', category: 'Legal' },
  { id: 2, name: 'GST Registration', type: 'pdf', size: '1.1 MB', uploadDate: '2024-10-15', category: 'Tax' },
  { id: 3, name: 'Product Catalog 2024', type: 'pdf', size: '8.7 MB', uploadDate: '2024-11-01', category: 'Products' },
  { id: 4, name: 'Q3 Sales Report', type: 'pdf', size: '3.2 MB', uploadDate: '2024-10-05', category: 'Reports' },
  { id: 5, name: 'Invoice #INV-2024-156', type: 'pdf', size: '0.5 MB', uploadDate: '2024-12-15', category: 'Invoices' },
  { id: 6, name: 'Supplier Agreement - ABC Corp', type: 'pdf', size: '1.8 MB', uploadDate: '2024-09-20', category: 'Legal' },
];

export const mockActivities = [
  { id: 1, type: 'order', message: 'New order #ORD-2024-004 received from Neha Gupta', time: '2 hours ago', icon: 'shopping-cart' },
  { id: 2, type: 'product', message: 'Power Bank 20000mAh is now out of stock', time: '5 hours ago', icon: 'package' },
  { id: 3, type: 'customer', message: 'New customer registered: Karan Mehta', time: '1 day ago', icon: 'user-plus' },
  { id: 4, type: 'order', message: 'Order #ORD-2024-002 shipped to Priya Patel', time: '1 day ago', icon: 'truck' },
  { id: 5, type: 'sale', message: 'Monthly revenue target 80% achieved', time: '2 days ago', icon: 'trending-up' },
  { id: 6, type: 'document', message: 'Invoice #INV-2024-156 uploaded', time: '3 days ago', icon: 'file-text' },
];

export const businessCategories = [
  'Retail & E-Commerce',
  'Food & Restaurant',
  'Healthcare & Pharma',
  'Technology & Software',
  'Manufacturing',
  'Real Estate',
  'Education & Training',
  'Fashion & Apparel',
  'Agriculture',
  'Services & Consulting',
  'Automotive',
  'Travel & Hospitality',
  'Other'
];
