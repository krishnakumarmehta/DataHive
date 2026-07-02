// ============================================================
//  DataHive AI Chatbot Engine  (pattern-matching + data-aware)
//  English language responses
//  To upgrade to real AI: replace getResponse() with an API call
//  to OpenAI / Gemini using the user's API key from Settings.
// ============================================================

export class ChatEngine {
  constructor(businessData, userInfo) {
    this.products  = [];
    this.orders    = [];
    this.customers = [];
    this.salesData = [];
    this.documents = [];
    this.user      = {};
    this.conversationHistory = [];
    this.lastTopic = null;
    this.update(businessData, userInfo);
  }

  // Called every time from ChatWidget so data is always fresh
  update(businessData, userInfo) {
    if (businessData) {
      this.products  = businessData.products  || [];
      this.orders    = businessData.orders    || [];
      this.customers = businessData.customers || [];
      this.salesData = businessData.salesData || [];
      this.documents = businessData.documents || [];
    }
    if (userInfo) {
      this.user = userInfo;
    }
  }

  // ── main entry point ──────────────────────────────────────
  async getResponse(message) {
    const raw = message.trim();
    const msg = raw.toLowerCase();
    this.conversationHistory.push({ role: 'user', content: raw });

    let reply = '';

    const apiKey = this.user?.apiKey || import.meta.env.VITE_GEMINI_API_KEY;

    if (apiKey) {
      try {
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(apiKey);

        const systemContext = `
          You are DataHive AI, a highly intelligent and helpful business assistant for ${this.user.businessName || 'the user'}.
          Your job is to answer questions based ONLY on the provided business data below. If the user asks about something not present in the data or documents, politely state that you do not have that information.
          Always reply in a friendly, professional tone. Always respond in ENGLISH only, regardless of what language the user writes in.
          Use Markdown for formatting (bold, lists).

          BUSINESS CONTEXT:
          - Owner Name: ${this.user.name || 'User'}
          - Business Name: ${this.user.businessName || 'My Business'}

          CURRENT BUSINESS DATA:
          Products: ${JSON.stringify(this.products, null, 2)}
          Orders: ${JSON.stringify(this.orders, null, 2)}
          Customers: ${JSON.stringify(this.customers, null, 2)}
          Sales Data: ${JSON.stringify(this.salesData, null, 2)}

          BUSINESS DOCUMENTS & UPLOADED CONTENTS:
          ${this.documents && this.documents.length > 0 ? this.documents.map((d, i) => `
          [Document ${i + 1}]
          Name: ${d.name}
          Category: ${d.category}
          Content/Details:
          """
          ${d.content || 'No text content available.'}
          """`).join('\n') : 'No documents uploaded yet.'}
        `;

        reply = await this.tryGeminiModels(genAI, systemContext, raw);
        if (reply) {
          this.conversationHistory.push({ role: 'assistant', content: reply });
          return reply;
        }
      } catch (error) {
        console.error("Gemini API Error:", error);
      }
    } else {
      reply = `⚠️ **Demo Mode Active**\n\nNo Gemini API Key found. To enable full AI responses:\n1. Go to **Settings → API & Integrations** and save your API key.\n2. Or create a **.env** file in the project root with \`VITE_GEMINI_API_KEY="YOUR_KEY"\`.\n\n*(Offline pattern-based responses are active for now)*\n\n---\n\n`;
    }

    // ── greetings ──
    if (this.match(msg, ['hi', 'hello', 'hey', 'namaste', 'namaskar', 'helo', 'good morning', 'good evening'])) {
      reply += this.greet();

    // ── help ──
    } else if (this.match(msg, ['help', 'features', 'what can', 'commands', 'guide', 'kya kar', 'madad'])) {
      reply += this.help();

    // ── thanks ──
    } else if (this.match(msg, ['thank', 'thanks', 'shukriya', 'dhanyavad', 'great', 'awesome', 'perfect', 'bahut acha', 'badhiya', 'accha'])) {
      reply += `You're welcome! 😊 Happy to help. Feel free to ask anything else!`;

    // ── bye ──
    } else if (this.match(msg, ['bye', 'goodbye', 'alvida', 'phir milenge', 'ok bye'])) {
      reply += `Goodbye! 👋 I'm always here whenever you need help. Wishing you great success! 🚀`;

    // ── overview / summary ──
    } else if (this.match(msg, ['overview', 'summary', 'report', 'how is', 'stats', 'statistics', 'kya chal', 'sab batao', 'business kaisa', 'business ka'])) {
      reply += this.overview();
      this.lastTopic = 'overview';

    // ── products ──
    } else if (this.match(msg, ['product', 'products', 'item', 'items', 'inventory', 'catalog', 'maal', 'kitne product', 'kaun sa product'])) {
      reply += this.products_query(msg);
      this.lastTopic = 'products';

    // ── stock queries ──
    } else if (this.match(msg, ['stock', 'out of stock', 'low stock', 'khatam'])) {
      reply += this.products_query(msg);
      this.lastTopic = 'products';

    // ── specific order ID ──
    } else if (msg.match(/ord-[\w-]+/i)) {
      reply += this.find_order(msg);
      this.lastTopic = 'orders';

    // ── orders ──
    } else if (this.match(msg, ['order', 'orders', 'delivery', 'deliveries', 'shipped', 'shipment', 'pending', 'processing', 'kitne order', 'order status'])) {
      reply += this.orders_query(msg);
      this.lastTopic = 'orders';

    // ── customers ──
    } else if (this.match(msg, ['customer', 'customers', 'client', 'clients', 'buyer', 'buyers', 'top customer', 'best customer', 'vip', 'kitne customer', 'sabhi customer', 'list'])) {
      const namedCustomer = this.findCustomerByName(msg);
      if (namedCustomer) {
        reply += this.customer_detail(namedCustomer);
      } else {
        reply += this.customers_query(msg);
      }
      this.lastTopic = 'customers';

    // ── sales / revenue / profit ──
    } else if (this.match(msg, ['sale', 'sales', 'revenue', 'profit', 'income', 'earning', 'turnover', 'target', 'money', 'paisa', 'kitna kama', 'kamai', 'kitna revenue'])) {
      reply += this.sales_query(msg);
      this.lastTopic = 'sales';

    // ── documents ──
    } else if (this.match(msg, ['document', 'documents', 'file', 'files', 'pdf', 'invoice', 'certificate', 'kitne file'])) {
      reply += this.documents_query(msg);
      this.lastTopic = 'documents';

    // ── "tell me about X" patterns ──
    } else if (this.match(msg, ['ka detail', 'ke baare', 'ke bare', 'batao', 'bata', 'kaun hai', 'who is', 'tell me about', 'show me', 'dikhao', 'dikha'])) {
      const namedCustomer = this.findCustomerByName(msg);
      const namedProduct  = this.findProductByName(msg);
      const namedOrder    = msg.match(/ord-[\w-]+/i);

      if (namedOrder) {
        reply += this.find_order(msg);
      } else if (namedCustomer) {
        reply += this.customer_detail(namedCustomer);
      } else if (namedProduct) {
        reply += this.product_detail(namedProduct);
      } else {
        reply += this.fallback_suggest(msg);
      }

    // ── catch-all: try name matching against all data ──
    } else {
      const namedCustomer = this.findCustomerByName(msg);
      const namedProduct  = this.findProductByName(msg);

      if (namedCustomer) {
        reply += this.customer_detail(namedCustomer);
      } else if (namedProduct) {
        reply += this.product_detail(namedProduct);
      } else {
        reply += this.fallback();
      }
    }

    this.conversationHistory.push({ role: 'assistant', content: reply });
    return reply;
  }

  async tryGeminiModels(genAI, systemContext, raw) {
    const modelCandidates = [
      'gemini-2.0-flash',
      'gemini-1.5-flash-latest',
      'gemini-1.5-flash',
    ];

    const geminiHistory = this.conversationHistory.slice(0, -1).map(h => ({
      role: h.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: h.content }]
    }));

    let lastError = null;

    for (const modelName of modelCandidates) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: systemContext
        });

        const chat = model.startChat({ history: geminiHistory });
        const result = await chat.sendMessage(raw);
        const text = result?.response?.text?.();
        if (text) return text;
      } catch (error) {
        lastError = error;
        const status = error?.status || error?.response?.status;
        if (status !== 404) {
          throw error;
        }
      }
    }

    if (lastError) {
      console.warn('Gemini model fallback exhausted, using offline chatbot.', lastError);
    }
    return '';
  }

  // ── helpers ───────────────────────────────────────────────
  match(text, patterns) {
    const cleanText = text.toLowerCase();
    const words = cleanText.split(/\W+/);
    return patterns.some(p => {
      const cleanPattern = p.toLowerCase();
      if (cleanPattern.includes(' ')) {
        const regex = new RegExp(`\\b${cleanPattern}\\b`, 'i');
        return regex.test(cleanText);
      }
      return words.includes(cleanPattern);
    });
  }

  findProductByName(text) {
    const cleanText = text.toLowerCase();
    let bestMatch = null;
    let bestScore = 0;

    for (const p of this.products) {
      const words = p.name.toLowerCase().split(/\s+/);
      let score = 0;
      for (const w of words) {
        if (w.length > 2 && cleanText.includes(w)) score++;
      }
      if (score > bestScore) {
        bestScore = score;
        bestMatch = p;
      }
    }
    return bestScore > 0 ? bestMatch : null;
  }

  findCustomerByName(text) {
    const cleanText = text.toLowerCase();

    for (const c of this.customers) {
      if (cleanText.includes(c.name.toLowerCase())) return c;
    }

    let bestMatch = null;
    let bestScore = 0;

    for (const c of this.customers) {
      const nameParts = c.name.toLowerCase().split(/\s+/);
      let score = 0;
      for (const part of nameParts) {
        if (part.length >= 2 && cleanText.includes(part)) score++;
      }
      if (score > bestScore) {
        bestScore = score;
        bestMatch = c;
      }
    }
    if (bestScore > 0) return bestMatch;

    for (const c of this.customers) {
      if (c.email && cleanText.includes(c.email.toLowerCase())) return c;
    }

    return null;
  }

  statusEmoji(status) {
    return { delivered: '✅', shipped: '🚚', processing: '⏳', pending: '⏰', cancelled: '❌' }[status] || '📦';
  }

  fmt(n) {
    const num = Number(n);
    if (isNaN(num)) return '₹0';
    return `₹${num.toLocaleString('en-IN')}`;
  }

  // ── response builders ─────────────────────────────────────

  greet() {
    const hour = new Date().getHours();
    const timeGreet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    return `${timeGreet}, **${this.user.name || 'there'}**! 👋\n\nI'm **DataHive AI** — your personal assistant for **${this.user.businessName || 'your business'}**.\n\nHere's what you can ask me:\n• "Give me a business summary"\n• "How many products do I have?"\n• "Show pending orders"\n• "Who are my top customers?"\n\nHow can I help you today?`;
  }

  help() {
    return `🤖 **Here's what I can help you with:**\n\n` +
      `📦 **Products**\n   → "How many products?" / "Show out of stock" / "Low stock items"\n\n` +
      `📋 **Orders**\n   → "Pending orders" / "Recent orders" / "Status of ORD-2024-001"\n\n` +
      `👥 **Customers**\n   → "Top customers" / "Details for Rahul" / "Inactive customers"\n\n` +
      `💰 **Sales**\n   → "What's my revenue?" / "Best month?" / "Profit margin"\n\n` +
      `📁 **Documents**\n   → "Show documents" / "How many files?"\n\n` +
      `📊 **Overview**\n   → "Give me a business summary"\n\n` +
      `💡 **Tip:** Just type any customer or product name directly — I'll find it instantly!`;
  }

  overview() {
    const totalRev   = this.orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + (o.total || 0), 0);
    const pending    = this.orders.filter(o => ['pending','processing'].includes(o.status)).length;
    const outOfStock = this.products.filter(p => p.stock === 0).length;
    const newCustomers = this.customers.filter(c => c.totalOrders === 0 || !c.totalOrders).length;
    const health     = pending > 5 || outOfStock > 2
      ? '⚠️ Some items need your attention'
      : '✅ Everything looks great!';

    return `📊 **Business Overview — ${this.user.businessName || 'Your Business'}**\n\n` +
      `💰 Revenue: **${this.fmt(totalRev)}**\n` +
      `📦 Products: **${this.products.length}** (${this.products.filter(p=>p.status==='active').length} active${outOfStock ? `, ⚠️ ${outOfStock} out of stock` : ''})\n` +
      `📋 Orders: **${this.orders.length}** (${pending} need attention)\n` +
      `👥 Customers: **${this.customers.length}**${newCustomers ? ` (${newCustomers} new, no orders yet)` : ''}\n` +
      `📁 Documents: **${this.documents.length}** files\n\n` +
      `**Business Health:** ${health}`;
  }

  products_query(msg) {
    if (this.match(msg, ['out of stock', 'khatam', 'unavailable'])) {
      const oos = this.products.filter(p => p.stock === 0);
      if (!oos.length) return '✅ All products are in stock! Nothing is out of stock.';
      return `⚠️ **Out of Stock (${oos.length} products):**\n\n` +
        oos.map(p => `• **${p.name}** — SKU: ${p.sku}`).join('\n');
    }
    if (this.match(msg, ['low stock', 'low', 'running low', 'almost out'])) {
      const low = this.products.filter(p => p.stock > 0 && p.stock < 20);
      if (!low.length) return '✅ All products have sufficient stock (20+ units)!';
      return `⚠️ **Low Stock Alert (${low.length} products):**\n\n` +
        low.map(p => `• **${p.name}** — only **${p.stock}** units left`).join('\n');
    }
    if (this.match(msg, ['expensive', 'costly', 'highest price', 'most expensive'])) {
      const top = [...this.products].sort((a,b) => b.price - a.price).slice(0,5);
      return `💰 **Top 5 Most Expensive Products:**\n\n` +
        top.map((p,i) => `${i+1}. **${p.name}** — ${this.fmt(p.price)}`).join('\n');
    }
    if (this.match(msg, ['cheap', 'cheapest', 'lowest price', 'budget', 'sasta'])) {
      const low = [...this.products].sort((a,b) => a.price - b.price).slice(0,5);
      return `🏷️ **Top 5 Cheapest Products:**\n\n` +
        low.map((p,i) => `${i+1}. **${p.name}** — ${this.fmt(p.price)}`).join('\n');
    }
    if (this.match(msg, ['category', 'categories', 'type', 'types'])) {
      const cats = {};
      this.products.forEach(p => cats[p.category] = (cats[p.category]||0)+1);
      return `📂 **Product Categories:**\n\n` +
        Object.entries(cats).map(([c,n]) => `• **${c}**: ${n} products`).join('\n');
    }
    if (this.match(msg, ['value', 'worth', 'total value', 'inventory value'])) {
      const val = this.products.reduce((s,p) => s + (p.price||0) * (p.stock||0), 0);
      return `💎 **Total Inventory Value:** ${this.fmt(val)}\n\n(${this.products.length} products × stock × price)`;
    }
    if (this.match(msg, ['list', 'all', 'show all', 'dikhao', 'sabhi'])) {
      return `📦 **All Products (${this.products.length}):**\n\n` +
        this.products.map(p =>
          `• **${p.name}** — ${this.fmt(p.price)} | Stock: ${p.stock === 0 ? '❌ Out' : p.stock}`
        ).join('\n');
    }

    const totalVal = this.products.reduce((s,p) => s + (p.price||0)*(p.stock||0), 0);
    return `📦 **Product Summary:**\n\n` +
      `• Total: **${this.products.length}** products\n` +
      `• Active: **${this.products.filter(p=>p.status==='active').length}** ✅\n` +
      `• Out of stock: **${this.products.filter(p=>p.stock===0).length}** ⚠️\n` +
      `• Low stock (<20): **${this.products.filter(p=>p.stock>0&&p.stock<20).length}** ⚠️\n` +
      `• Inventory value: **${this.fmt(totalVal)}**\n\n` +
      `_Type a product name to get its details!_`;
  }

  orders_query(msg) {
    if (msg.match(/ord-[\w-]+/i)) return this.find_order(msg);

    if (this.match(msg, ['pending', 'new order', 'unprocessed'])) {
      const list = this.orders.filter(o => o.status === 'pending');
      if (!list.length) return '✅ No pending orders right now!';
      return `⏰ **Pending Orders (${list.length}):**\n\n` +
        list.map(o => `• **${o.id}** — ${o.customer} — ${this.fmt(o.total)}`).join('\n');
    }
    if (this.match(msg, ['processing', 'process'])) {
      const list = this.orders.filter(o => o.status === 'processing');
      if (!list.length) return '✅ No orders currently processing!';
      return `⏳ **Processing Orders (${list.length}):**\n\n` +
        list.map(o => `• **${o.id}** — ${o.customer} — ${this.fmt(o.total)}`).join('\n');
    }
    if (this.match(msg, ['shipped', 'shipping', 'dispatch', 'dispatched'])) {
      const list = this.orders.filter(o => o.status === 'shipped');
      if (!list.length) return '✅ No shipped orders at the moment!';
      return `🚚 **Shipped Orders (${list.length}):**\n\n` +
        list.map(o => `• **${o.id}** — ${o.customer}`).join('\n');
    }
    if (this.match(msg, ['delivered', 'complete', 'completed'])) {
      const list = this.orders.filter(o => o.status === 'delivered');
      return `✅ **Delivered Orders: ${list.length}**\n\nTotal delivered revenue: **${this.fmt(list.reduce((s,o)=>s+(o.total||0),0))}**`;
    }
    if (this.match(msg, ['cancelled', 'cancel', 'return', 'refund'])) {
      const list = this.orders.filter(o => o.status === 'cancelled');
      if (!list.length) return '✅ No cancelled orders!';
      return `❌ **Cancelled Orders (${list.length}):**\n\n` +
        list.map(o => `• **${o.id}** — ${o.customer} — ${this.fmt(o.total)}`).join('\n') +
        `\n\nTotal lost value: **${this.fmt(list.reduce((s,o)=>s+(o.total||0),0))}**`;
    }
    if (this.match(msg, ['recent', 'latest', 'last', 'newest'])) {
      const list = this.orders.slice(0,5);
      return `📋 **Recent 5 Orders:**\n\n` +
        list.map(o => `• **${o.id}** | ${o.customer} | ${this.fmt(o.total)} | ${this.statusEmoji(o.status)} ${o.status}`).join('\n');
    }
    if (this.match(msg, ['list', 'all', 'show all', 'dikhao', 'sabhi'])) {
      return `📋 **All Orders (${this.orders.length}):**\n\n` +
        this.orders.map(o =>
          `• **${o.id}** — ${o.customer} — ${this.fmt(o.total)} ${this.statusEmoji(o.status)}`
        ).join('\n');
    }

    return `📋 **Order Summary:**\n\n` +
      `• Total: **${this.orders.length}**\n` +
      `• Pending: **${this.orders.filter(o=>o.status==='pending').length}** ⏰\n` +
      `• Processing: **${this.orders.filter(o=>o.status==='processing').length}** ⏳\n` +
      `• Shipped: **${this.orders.filter(o=>o.status==='shipped').length}** 🚚\n` +
      `• Delivered: **${this.orders.filter(o=>o.status==='delivered').length}** ✅\n` +
      `• Cancelled: **${this.orders.filter(o=>o.status==='cancelled').length}** ❌\n\n` +
      `_Type an Order ID for specific details (e.g. ORD-2024-001)_`;
  }

  find_order(msg) {
    const match = msg.match(/ord-[\w-]+/i);
    if (!match) return `❓ Please type the Order ID correctly, e.g. **ORD-2024-001**`;
    const order = this.orders.find(o => o.id.toLowerCase() === match[0].toLowerCase());
    if (!order) return `❌ **${match[0].toUpperCase()}** not found. Please check the Order ID.`;
    return `📋 **Order ${order.id}**\n\n` +
      `• Customer: **${order.customer}**\n` +
      `• Items: ${Array.isArray(order.items) ? order.items.join(', ') : order.items || 'N/A'}\n` +
      `• Total: **${this.fmt(order.total)}**\n` +
      `• Status: ${this.statusEmoji(order.status)} **${order.status}**\n` +
      `• Date: ${order.date || 'N/A'}\n` +
      `• Payment: ${order.paymentMethod || 'N/A'}`;
  }

  customers_query(msg) {
    const namedCustomer = this.findCustomerByName(msg);

    if (namedCustomer && !this.match(msg, ['top', 'list', 'all', 'inactive', 'city'])) {
      return this.customer_detail(namedCustomer);
    }

    if (this.match(msg, ['top', 'best', 'highest', 'vip', 'most spent'])) {
      const top = [...this.customers].sort((a,b)=>(b.totalSpent||0)-(a.totalSpent||0)).slice(0,5);
      return `🏆 **Top 5 Customers (by spending):**\n\n` +
        top.map((c,i) => `${i+1}. **${c.name}** — ${this.fmt(c.totalSpent||0)} (${c.totalOrders||0} orders)`).join('\n');
    }
    if (this.match(msg, ['inactive', 'lost', 'churned'])) {
      const list = this.customers.filter(c=>c.status==='inactive');
      if (!list.length) return '✅ All customers are currently active!';
      return `⚠️ **Inactive Customers (${list.length}):**\n\n` +
        list.map(c => `• **${c.name}** — ${c.email || 'No email'}`).join('\n');
    }
    if (this.match(msg, ['new', 'recently added', 'no orders'])) {
      const newOnes = this.customers.filter(c => !c.totalOrders || c.totalOrders === 0);
      if (!newOnes.length) return '✅ All customers have placed at least one order!';
      return `🆕 **New Customers (no orders yet): ${newOnes.length}**\n\n` +
        newOnes.map(c => `• **${c.name}** — ${c.email || 'No email'} — ${c.city || 'No city'}`).join('\n');
    }
    if (this.match(msg, ['city', 'location', 'where', 'region'])) {
      const cities = {};
      this.customers.forEach(c => cities[c.city||'Unknown'] = (cities[c.city||'Unknown']||0)+1);
      return `🗺️ **Customers by City:**\n\n` +
        Object.entries(cities).sort((a,b)=>b[1]-a[1]).map(([c,n])=>`• **${c}**: ${n} customers`).join('\n');
    }
    if (this.match(msg, ['email', 'contact', 'phone', 'number', 'details'])) {
      return `📧 **Customer Contact List:**\n\n` +
        this.customers.map(c => `• **${c.name}** — ${c.email||'No email'} — ${c.phone||'No phone'}`).join('\n');
    }
    if (this.match(msg, ['list', 'all', 'show all', 'dikhao', 'sabhi'])) {
      return `👥 **All Customers (${this.customers.length}):**\n\n` +
        this.customers.map(c =>
          `• **${c.name}** — ${c.city||'?'} — ${c.totalOrders||0} orders — ${this.fmt(c.totalSpent||0)}`
        ).join('\n');
    }

    const totalSpent = this.customers.reduce((s,c)=>s+(c.totalSpent||0),0);
    const topSpender = [...this.customers].sort((a,b)=>(b.totalSpent||0)-(a.totalSpent||0))[0];
    return `👥 **Customer Summary:**\n\n` +
      `• Total: **${this.customers.length}**\n` +
      `• Active: **${this.customers.filter(c=>c.status==='active').length}** ✅\n` +
      `• New (0 orders): **${this.customers.filter(c=>!c.totalOrders||c.totalOrders===0).length}**\n` +
      `• Top spender: **${topSpender?.name||'N/A'}** (${this.fmt(topSpender?.totalSpent||0)})\n` +
      `• Total lifetime value: **${this.fmt(totalSpent)}**\n\n` +
      `💡 _Type a customer name like "Show Rahul's details" — I'll find them instantly!_`;
  }

  customer_detail(c) {
    const orders = this.orders.filter(o =>
      o.customer &&
      c.name &&
      o.customer.toLowerCase().includes(c.name.split(' ')[0].toLowerCase())
    );

    let lines = `👤 **${c.name}**\n\n`;
    lines += `• Email: ${c.email || '—'}\n`;
    lines += `• Phone: ${c.phone || '—'}\n`;
    lines += `• City: ${c.city || '—'}\n`;
    lines += `• Status: ${c.status === 'active' || !c.status ? '✅ Active' : '⚠️ Inactive'}\n`;

    const orderCount = c.totalOrders || orders.length || 0;
    const totalSpent = c.totalSpent || orders.reduce((s,o)=>s+(o.total||0),0) || 0;

    lines += `\n**Order History:**\n`;
    lines += `• Total Orders: **${orderCount}**\n`;
    lines += `• Total Spent: **${this.fmt(totalSpent)}**\n`;

    if (orders.length > 0) {
      lines += `\n**Recent Orders:**\n`;
      orders.slice(0, 3).forEach(o => {
        lines += `• ${o.id} — ${this.fmt(o.total)} — ${this.statusEmoji(o.status)} ${o.status}\n`;
      });
    } else if (orderCount === 0) {
      lines += `• _No orders placed yet_\n`;
    }

    if (c.lastOrder && c.lastOrder !== 'N/A') {
      lines += `• Last Order: ${c.lastOrder}\n`;
    }

    return lines;
  }

  product_detail(p) {
    const stockStatus = p.stock === 0
      ? '❌ OUT OF STOCK'
      : p.stock < 20
      ? `⚠️ Low (${p.stock} left)`
      : `✅ ${p.stock} units`;

    return `📦 **${p.name}**\n\n` +
      `• Category: ${p.category || '—'}\n` +
      `• Price: **${this.fmt(p.price)}**\n` +
      `• Stock: ${stockStatus}\n` +
      `• SKU: ${p.sku || '—'}\n` +
      `• Status: ${p.status === 'active' || !p.status ? '✅ Active' : '❌ Inactive'}\n` +
      (p.description ? `• Description: ${p.description}` : '');
  }

  sales_query(msg) {
    if (!this.salesData.length) {
      return `📊 No sales data available yet. Start adding orders to see your analytics!`;
    }

    const totalRev    = this.salesData.reduce((s,d)=>s+(d.revenue||0),0);
    const totalProfit = this.salesData.reduce((s,d)=>s+(d.profit||0),0);
    const totalOrd    = this.salesData.reduce((s,d)=>s+(d.orders||0),0);
    const margin      = totalRev > 0 ? ((totalProfit/totalRev)*100).toFixed(1) : 0;
    const best        = [...this.salesData].sort((a,b)=>b.revenue-a.revenue)[0];
    const worst       = [...this.salesData].sort((a,b)=>a.revenue-b.revenue)[0];
    const avgOrder    = totalOrd > 0 ? Math.round(totalRev/totalOrd) : 0;

    if (this.match(msg, ['best month', 'highest month', 'peak', 'top month'])) {
      return `🏆 **Best Month: ${best?.month}**\n\n• Revenue: **${this.fmt(best?.revenue)}**\n• Profit: **${this.fmt(best?.profit)}**\n• Orders: **${best?.orders}**`;
    }
    if (this.match(msg, ['worst', 'lowest', 'minimum', 'worst month'])) {
      return `📉 **Lowest Month: ${worst?.month}**\n\n• Revenue: **${this.fmt(worst?.revenue)}**\n• Orders: **${worst?.orders}**`;
    }
    if (this.match(msg, ['margin', 'profit margin', 'percentage', 'percent', '%'])) {
      return `📊 **Profit Margin: ${margin}%**\n\nTotal Revenue: ${this.fmt(totalRev)}\nTotal Profit: ${this.fmt(totalProfit)}`;
    }
    if (this.match(msg, ['avg', 'average', 'per order', 'average order'])) {
      return `🛒 **Average Order Value: ${this.fmt(avgOrder)}**\n\n(${totalOrd} orders, total ${this.fmt(totalRev)})`;
    }
    if (this.match(msg, ['monthly', 'breakdown', 'month wise', 'month by month'])) {
      return `📅 **Monthly Sales:**\n\n` +
        this.salesData.map(d => `• **${d.month}**: ${this.fmt(d.revenue)} | ${d.orders} orders | Profit: ${this.fmt(d.profit)}`).join('\n');
    }

    return `💰 **Sales Summary (Last 6 Months):**\n\n` +
      `• Total Revenue: **${this.fmt(totalRev)}**\n` +
      `• Total Profit: **${this.fmt(totalProfit)}**\n` +
      `• Profit Margin: **${margin}%**\n` +
      `• Total Orders: **${totalOrd}**\n` +
      `• Avg Order Value: **${this.fmt(avgOrder)}**\n` +
      `• Best Month: **${best?.month}** (${this.fmt(best?.revenue)})\n\n` +
      `📈 **Monthly Trend:**\n` +
      this.salesData.map(d=>`• ${d.month}: ${this.fmt(d.revenue)} (${d.orders} orders)`).join('\n');
  }

  documents_query(msg) {
    if (!this.documents.length) {
      return `📁 No documents uploaded yet. Go to the Documents page to upload your files!`;
    }
    const cats = {};
    this.documents.forEach(d => cats[d.category||'General'] = (cats[d.category||'General']||0)+1);
    return `📁 **Documents (${this.documents.length} files):**\n\n` +
      `**By Category:**\n` +
      Object.entries(cats).map(([c,n]) => `• ${c}: ${n} file(s)`).join('\n') +
      `\n\n**Recent Uploads:**\n` +
      this.documents.slice(0,4).map(d => `• **${d.name}** (${d.size||'?'}) — ${d.uploadDate||'?'}`).join('\n');
  }

  fallback_suggest(msg) {
    const allNames = this.customers.map(c => c.name);
    const allProducts = this.products.map(p => p.name);

    return `🔍 I couldn't find an exact match.\n\n` +
      `**Available customers:**\n${allNames.slice(0,5).map(n=>`• ${n}`).join('\n')}${allNames.length>5?`\n• ...and ${allNames.length-5} more`:''}\n\n` +
      `**Available products:**\n${allProducts.slice(0,4).map(n=>`• ${n}`).join('\n')}${allProducts.length>4?`\n• ...and ${allProducts.length-4} more`:''}\n\n` +
      `_Try the correct name or type **help** to see all commands._`;
  }

  fallback() {
    const allNames = this.customers.map(c => c.name.split(' ')[0]);
    const hint = allNames.length > 0
      ? `\n\n💡 **Available customers:** ${allNames.slice(0,4).join(', ')}${allNames.length>4?'...':''}`
      : '';

    return `🤔 I didn't quite understand that.\n\nTry asking something like:\n` +
      `• "Give me a business summary"\n` +
      `• "Show pending orders"\n` +
      `• "Details for Rahul" _(customer name)_\n` +
      `• "Headphones stock" _(product name)_\n` +
      `• "Who are my top customers?"\n` +
      `${hint}\n\nOr type **help** to see all available commands.`;
  }
}

export const getWelcomeMessage = (userName, businessName) => {
  return `👋 Hello **${userName || 'there'}**! I'm your **DataHive AI Assistant**.\n\nI know everything about **${businessName || 'your business'}** — products, orders, customers, and sales — all in one place!\n\n💡 Type any **customer name** or **product name** directly and I'll pull up the details instantly!\n\nTry: *"Give me a business summary"* or *"How many products do I have?"*`;
};
