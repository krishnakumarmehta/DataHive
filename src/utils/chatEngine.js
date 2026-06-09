// ============================================================
//  DataHive AI Chatbot Engine  (pattern-matching + data-aware)
//  Hindi + English support
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
          Always reply in a friendly, professional tone. Use Hindi and English mixed (Hinglish) if appropriate, but adjust based on the user's language.
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
      reply = `⚠️ **Demo Mode Active**\n\nBhai, aapne Settings mein Gemini API Key set nahi kiya hai. Real AI Chatbot chalane ke liye:\n1. **Settings → API & Integrations** tab par jaakar apni API key save karein.\n2. Ya fir project ke root workspace mein ek **.env** file banakar usme \`VITE_GEMINI_API_KEY="YOUR_KEY"\` daalein.\n\n*(Offline patterns default response tab tak active rahega)*\n\n---\n\n`;
    }

    // ── greetings ──
    if (this.match(msg, ['hi', 'hello', 'hey', 'namaste', 'namaskar', 'helo', 'good morning', 'good evening', 'subah', 'shaam'])) {
      reply += this.greet();

    // ── help ──
    } else if (this.match(msg, ['help', 'kya kar', 'features', 'madad', 'what can', 'commands', 'guide'])) {
      reply += this.help();

    // ── thanks ──
    } else if (this.match(msg, ['thank', 'thanks', 'shukriya', 'dhanyavad', 'bahut acha', 'great', 'awesome', 'perfect', 'badhiya', 'accha'])) {
      reply += `Shukriya! 😊 Aapki madad karke khushi hui. Koi aur sawal ho toh zaroor poochiye!`;

    // ── bye ──
    } else if (this.match(msg, ['bye', 'goodbye', 'alvida', 'phir milenge', 'ok bye'])) {
      reply += `Alvida! 👋 Jab bhi zaroorat ho, main yahaan hoon. Business mein tarakki ho! 🚀`;

    // ── overview / summary ──
    } else if (this.match(msg, ['overview', 'summary', 'report', 'kya chal', 'sab batao', 'business kaisa', 'how is', 'stats', 'statistics', 'business ka'])) {
      reply += this.overview();
      this.lastTopic = 'overview';

    // ── products ──
    } else if (this.match(msg, ['product', 'products', 'item', 'items', 'inventory', 'catalog', 'kitne product', 'kaun sa product', 'maal'])) {
      reply += this.products_query(msg);
      this.lastTopic = 'products';

    // ── stock queries (separate from products) ──
    } else if (this.match(msg, ['stock', 'out of stock', 'low stock', 'khatam'])) {
      reply += this.products_query(msg);
      this.lastTopic = 'products';

    // ── specific order ID ──
    } else if (msg.match(/ord-[\w-]+/i)) {
      reply += this.find_order(msg);
      this.lastTopic = 'orders';

    // ── orders ──
    } else if (this.match(msg, ['order', 'orders', 'delivery', 'deliveries', 'shipped', 'shipment', 'kitne order', 'order status', 'pending', 'processing'])) {
      reply += this.orders_query(msg);
      this.lastTopic = 'orders';

    // ── customers — try specific name FIRST, then generic ──
    } else if (this.match(msg, ['customer', 'customers', 'client', 'clients', 'buyer', 'buyers', 'kitne customer', 'sabhi customer', 'list', 'top customer', 'best customer', 'vip'])) {
      // Even inside "customer" query, check if a specific name is mentioned
      const namedCustomer = this.findCustomerByName(msg);
      if (namedCustomer) {
        reply += this.customer_detail(namedCustomer);
      } else {
        reply += this.customers_query(msg);
      }
      this.lastTopic = 'customers';

    // ── sales / revenue / profit ──
    } else if (this.match(msg, ['sale', 'sales', 'revenue', 'profit', 'income', 'earning', 'kitna kama', 'kamai', 'turnover', 'target', 'money', 'paisa', 'kitna revenue'])) {
      reply += this.sales_query(msg);
      this.lastTopic = 'sales';

    // ── documents ──
    } else if (this.match(msg, ['document', 'documents', 'file', 'files', 'pdf', 'invoice', 'certificate', 'kitne file'])) {
      reply += this.documents_query(msg);
      this.lastTopic = 'documents';

    // ── "X ka detail batao" / "X ke baare mein" patterns → search everything ──
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

    // Map history to Gemini format once so each fallback tries the same context.
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
    return patterns.some(p => text.includes(p));
  }

  // Smart product finder: checks all meaningful words in the product name
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

  // Smart customer finder:
  // 1. Exact full-name match (highest priority)
  // 2. Any word of their name in the message (>=2 chars)
  // 3. Email match
  findCustomerByName(text) {
    const cleanText = text.toLowerCase();

    // Pass 1: exact full name match
    for (const c of this.customers) {
      if (cleanText.includes(c.name.toLowerCase())) return c;
    }

    // Pass 2: any part of the name (all words, including short ones ≥2 chars)
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

    // Pass 3: email match
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
    const timeGreet = hour < 12 ? 'Subah' : hour < 17 ? 'Dopahar' : 'Shaam';
    return `${timeGreet} ki namaskar, **${this.user.name || 'Sir/Madam'}**! 🙏\n\nMain **DataHive AI** hoon — **${this.user.businessName || 'aapke business'}** ka personal assistant.\n\nAap mujhse pooch sakte hain:\n• "Business ka summary batao"\n• "Kitne products hain?"\n• "Pending orders dikhao"\n• "Top customers kaun hain?"\n\nKaise madad kar sakta hoon?`;
  }

  help() {
    return `🤖 **Main in cheezon mein madad kar sakta hoon:**\n\n` +
      `📦 **Products**\n   → "Kitne products hain?" / "Out of stock dikhao" / "Low stock"\n\n` +
      `📋 **Orders**\n   → "Pending orders" / "Recent orders" / "ORD-2024-001 ka status"\n\n` +
      `👥 **Customers**\n   → "Top customers" / "Rahul ka detail" / "Priya ke baare mein batao"\n\n` +
      `💰 **Sales**\n   → "Revenue kitna hai?" / "Best month?" / "Profit margin"\n\n` +
      `📁 **Documents**\n   → "Documents dikhao" / "Kitne files hain?"\n\n` +
      `📊 **Overview**\n   → "Business ka summary batao"\n\n` +
      `💡 **Tip:** Kisi bhi customer ya product ka naam seedha type karein — main dhundh lunga!\n\n` +
      `_Hindi aur English dono mein pooch sakte hain!_ 🇮🇳`;
  }

  overview() {
    const totalRev   = this.orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + (o.total || 0), 0);
    const pending    = this.orders.filter(o => ['pending','processing'].includes(o.status)).length;
    const outOfStock = this.products.filter(p => p.stock === 0).length;
    const newCustomers = this.customers.filter(c => c.totalOrders === 0 || !c.totalOrders).length;
    const health     = pending > 5 || outOfStock > 2
      ? '⚠️ Kuch cheezein dhyan maangti hain'
      : '✅ Sab kuch badhiya chal raha hai!';

    return `📊 **Business Overview — ${this.user.businessName || 'Aapka Business'}**\n\n` +
      `💰 Revenue: **${this.fmt(totalRev)}**\n` +
      `📦 Products: **${this.products.length}** (${this.products.filter(p=>p.status==='active').length} active${outOfStock ? `, ⚠️ ${outOfStock} out of stock` : ''})\n` +
      `📋 Orders: **${this.orders.length}** (${pending} need attention)\n` +
      `👥 Customers: **${this.customers.length}**${newCustomers ? ` (${newCustomers} new, no orders yet)` : ''}\n` +
      `📁 Documents: **${this.documents.length}** files\n\n` +
      `**Business Health:** ${health}`;
  }

  products_query(msg) {
    if (this.match(msg, ['out of stock', 'khatam', 'unavailable', 'nahi hai'])) {
      const oos = this.products.filter(p => p.stock === 0);
      if (!oos.length) return '✅ Sab products stock mein hain! Koi bhi out of stock nahi.';
      return `⚠️ **Out of Stock (${oos.length} products):**\n\n` +
        oos.map(p => `• **${p.name}** — SKU: ${p.sku}`).join('\n');
    }
    if (this.match(msg, ['low stock', 'kam stock', 'khatam hone wala', 'low'])) {
      const low = this.products.filter(p => p.stock > 0 && p.stock < 20);
      if (!low.length) return '✅ Sab products ka stock theek hai (20+ units)!';
      return `⚠️ **Low Stock Alert (${low.length} products):**\n\n` +
        low.map(p => `• **${p.name}** — sirf **${p.stock}** bacha hai`).join('\n');
    }
    if (this.match(msg, ['expensive', 'mehenga', 'costly', 'highest price', 'sabse mahanga', 'sabse mehenga'])) {
      const top = [...this.products].sort((a,b) => b.price - a.price).slice(0,5);
      return `💰 **Top 5 Most Expensive Products:**\n\n` +
        top.map((p,i) => `${i+1}. **${p.name}** — ${this.fmt(p.price)}`).join('\n');
    }
    if (this.match(msg, ['cheap', 'sasta', 'lowest price', 'sabse sasta', 'budget', 'sabse kam'])) {
      const low = [...this.products].sort((a,b) => a.price - b.price).slice(0,5);
      return `🏷️ **Top 5 Cheapest Products:**\n\n` +
        low.map((p,i) => `${i+1}. **${p.name}** — ${this.fmt(p.price)}`).join('\n');
    }
    if (this.match(msg, ['category', 'categories', 'type', 'kitne category', 'kaunsa category'])) {
      const cats = {};
      this.products.forEach(p => cats[p.category] = (cats[p.category]||0)+1);
      return `📂 **Product Categories:**\n\n` +
        Object.entries(cats).map(([c,n]) => `• **${c}**: ${n} products`).join('\n');
    }
    if (this.match(msg, ['value', 'worth', 'total value', 'inventory value', 'kitna maal'])) {
      const val = this.products.reduce((s,p) => s + (p.price||0) * (p.stock||0), 0);
      return `💎 **Total Inventory Value:** ${this.fmt(val)}\n\n(${this.products.length} products × stock × price)`;
    }
    if (this.match(msg, ['list', 'sab', 'all', 'dikhao', 'sabhi'])) {
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
      `_Kisi product ka naam likhein detail ke liye!_`;
  }

  orders_query(msg) {
    if (msg.match(/ord-[\w-]+/i)) return this.find_order(msg);

    if (this.match(msg, ['pending', 'new order', 'nayi', 'unprocessed'])) {
      const list = this.orders.filter(o => o.status === 'pending');
      if (!list.length) return '✅ Koi pending order nahi hai!';
      return `⏰ **Pending Orders (${list.length}):**\n\n` +
        list.map(o => `• **${o.id}** — ${o.customer} — ${this.fmt(o.total)}`).join('\n');
    }
    if (this.match(msg, ['processing', 'process'])) {
      const list = this.orders.filter(o => o.status === 'processing');
      if (!list.length) return '✅ Koi processing order nahi hai!';
      return `⏳ **Processing Orders (${list.length}):**\n\n` +
        list.map(o => `• **${o.id}** — ${o.customer} — ${this.fmt(o.total)}`).join('\n');
    }
    if (this.match(msg, ['shipped', 'shipping', 'dispatch', 'bheja'])) {
      const list = this.orders.filter(o => o.status === 'shipped');
      if (!list.length) return '✅ Koi shipped order nahi hai!';
      return `🚚 **Shipped Orders (${list.length}):**\n\n` +
        list.map(o => `• **${o.id}** — ${o.customer}`).join('\n');
    }
    if (this.match(msg, ['delivered', 'complete', 'deliver', 'pahuncha'])) {
      const list = this.orders.filter(o => o.status === 'delivered');
      return `✅ **Delivered Orders: ${list.length}**\n\nTotal delivered revenue: **${this.fmt(list.reduce((s,o)=>s+(o.total||0),0))}**`;
    }
    if (this.match(msg, ['cancelled', 'cancel', 'return', 'refund', 'rद्द'])) {
      const list = this.orders.filter(o => o.status === 'cancelled');
      if (!list.length) return '✅ Koi cancelled order nahi hai!';
      return `❌ **Cancelled Orders (${list.length}):**\n\n` +
        list.map(o => `• **${o.id}** — ${o.customer} — ${this.fmt(o.total)}`).join('\n') +
        `\n\nTotal lost value: **${this.fmt(list.reduce((s,o)=>s+(o.total||0),0))}**`;
    }
    if (this.match(msg, ['recent', 'latest', 'naya', 'abhi', 'last'])) {
      const list = this.orders.slice(0,5);
      return `📋 **Recent 5 Orders:**\n\n` +
        list.map(o => `• **${o.id}** | ${o.customer} | ${this.fmt(o.total)} | ${this.statusEmoji(o.status)} ${o.status}`).join('\n');
    }
    if (this.match(msg, ['list', 'sab', 'all', 'dikhao', 'sabhi'])) {
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
      `_Order ID likhein specific detail ke liye (e.g. ORD-2024-001)_`;
  }

  find_order(msg) {
    const match = msg.match(/ord-[\w-]+/i);
    if (!match) return `❓ Order ID theek se likhein, e.g. **ORD-2024-001**`;
    const order = this.orders.find(o => o.id.toLowerCase() === match[0].toLowerCase());
    if (!order) return `❌ **${match[0].toUpperCase()}** nahi mila. Sahi order ID check karein.`;
    return `📋 **Order ${order.id}**\n\n` +
      `• Customer: **${order.customer}**\n` +
      `• Items: ${Array.isArray(order.items) ? order.items.join(', ') : order.items || 'N/A'}\n` +
      `• Total: **${this.fmt(order.total)}**\n` +
      `• Status: ${this.statusEmoji(order.status)} **${order.status}**\n` +
      `• Date: ${order.date || 'N/A'}\n` +
      `• Payment: ${order.paymentMethod || 'N/A'}`;
  }

  customers_query(msg) {
    // Check if a specific customer name is embedded in the query
    const namedCustomer = this.findCustomerByName(msg);

    if (namedCustomer && !this.match(msg, ['top', 'list', 'sab', 'all', 'kitne', 'inactive', 'city'])) {
      return this.customer_detail(namedCustomer);
    }

    if (this.match(msg, ['top', 'best', 'sabse acha', 'highest', 'vip', 'sabse zyada'])) {
      const top = [...this.customers].sort((a,b)=>(b.totalSpent||0)-(a.totalSpent||0)).slice(0,5);
      return `🏆 **Top 5 Customers (by spending):**\n\n` +
        top.map((c,i) => `${i+1}. **${c.name}** — ${this.fmt(c.totalSpent||0)} (${c.totalOrders||0} orders)`).join('\n');
    }
    if (this.match(msg, ['inactive', 'lost', 'chale gaye', 'purana', 'jo nahi aaye'])) {
      const list = this.customers.filter(c=>c.status==='inactive');
      if (!list.length) return '✅ Sab customers active hain!';
      return `⚠️ **Inactive Customers (${list.length}):**\n\n` +
        list.map(c => `• **${c.name}** — ${c.email || 'No email'}`).join('\n');
    }
    if (this.match(msg, ['new', 'naya', 'recently added', 'naye'])) {
      const newOnes = this.customers.filter(c => !c.totalOrders || c.totalOrders === 0);
      if (!newOnes.length) return '✅ Sab customers ne kam se kam ek order kiya hai!';
      return `🆕 **New Customers (no orders yet): ${newOnes.length}**\n\n` +
        newOnes.map(c => `• **${c.name}** — ${c.email || 'No email'} — ${c.city || 'No city'}`).join('\n');
    }
    if (this.match(msg, ['city', 'location', 'kahan se', 'kahan'])) {
      const cities = {};
      this.customers.forEach(c => cities[c.city||'Unknown'] = (cities[c.city||'Unknown']||0)+1);
      return `🗺️ **Customers by City:**\n\n` +
        Object.entries(cities).sort((a,b)=>b[1]-a[1]).map(([c,n])=>`• **${c}**: ${n} customers`).join('\n');
    }
    if (this.match(msg, ['email', 'contact', 'phone', 'number', 'details'])) {
      return `📧 **Customer Contact List:**\n\n` +
        this.customers.map(c => `• **${c.name}** — ${c.email||'No email'} — ${c.phone||'No phone'}`).join('\n');
    }
    if (this.match(msg, ['list', 'sab', 'all', 'dikhao', 'sabhi'])) {
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
      `💡 _Kisi ka naam likhein jaise "Rahul ka detail" — main turant dikhaunga!_`;
  }

  customer_detail(c) {
    const orders = this.orders.filter(o =>
      o.customer && c.name &&
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
      lines += `• _Abhi tak koi order nahi kiya_\n`;
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
      return `📊 Sales data abhi available nahi hai. Thoda time baad try karein.`;
    }

    const totalRev    = this.salesData.reduce((s,d)=>s+(d.revenue||0),0);
    const totalProfit = this.salesData.reduce((s,d)=>s+(d.profit||0),0);
    const totalOrd    = this.salesData.reduce((s,d)=>s+(d.orders||0),0);
    const margin      = totalRev > 0 ? ((totalProfit/totalRev)*100).toFixed(1) : 0;
    const best        = [...this.salesData].sort((a,b)=>b.revenue-a.revenue)[0];
    const worst       = [...this.salesData].sort((a,b)=>a.revenue-b.revenue)[0];
    const avgOrder    = totalOrd > 0 ? Math.round(totalRev/totalOrd) : 0;

    if (this.match(msg, ['best month', 'sabse acha mahina', 'highest month', 'peak', 'top month'])) {
      return `🏆 **Best Month: ${best?.month}**\n\n• Revenue: **${this.fmt(best?.revenue)}**\n• Profit: **${this.fmt(best?.profit)}**\n• Orders: **${best?.orders}**`;
    }
    if (this.match(msg, ['worst', 'lowest', 'sabse kharab', 'minimum', 'kam'])) {
      return `📉 **Lowest Month: ${worst?.month}**\n\n• Revenue: **${this.fmt(worst?.revenue)}**\n• Orders: **${worst?.orders}**`;
    }
    if (this.match(msg, ['margin', 'profit margin', 'percentage', 'percent', '%'])) {
      return `📊 **Profit Margin: ${margin}%**\n\nTotal Revenue: ${this.fmt(totalRev)}\nTotal Profit: ${this.fmt(totalProfit)}`;
    }
    if (this.match(msg, ['avg', 'average', 'per order', 'average order', 'ek order mein'])) {
      return `🛒 **Average Order Value: ${this.fmt(avgOrder)}**\n\n(${totalOrd} orders, total ${this.fmt(totalRev)})`;
    }
    if (this.match(msg, ['monthly', 'mahina', 'har mahine', 'breakdown', 'month wise', 'month by month'])) {
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
      return `📁 Abhi koi document upload nahi kiya gaya. Documents page par jakar upload karein!`;
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
    // User used "batao/dikhao" but we couldn't find a match
    const allNames = this.customers.map(c => c.name);
    const allProducts = this.products.map(p => p.name);

    return `🔍 Mujhe exact match nahi mila.\n\n` +
      `**Available customers:**\n${allNames.slice(0,5).map(n=>`• ${n}`).join('\n')}${allNames.length>5?`\n• ...aur ${allNames.length-5} aur`:''}\n\n` +
      `**Available products:**\n${allProducts.slice(0,4).map(n=>`• ${n}`).join('\n')}${allProducts.length>4?`\n• ...aur ${allProducts.length-4} aur`:''}\n\n` +
      `_Sahi naam likhein ya type karein **help**_`;
  }

  fallback() {
    const allNames = this.customers.map(c => c.name.split(' ')[0]);
    const hint = allNames.length > 0
      ? `\n\n💡 **Available customers:** ${allNames.slice(0,4).join(', ')}${allNames.length>4?'...':''}`
      : '';

    return `🤔 Mujhe samajh nahi aaya.\n\nKuch aisa poochein:\n` +
      `• "Business ka summary batao"\n` +
      `• "Pending orders dikhao"\n` +
      `• "Rahul ka detail" _(customer ka naam)_\n` +
      `• "Headphones ka stock" _(product ka naam)_\n` +
      `• "Top customers kaun hain?"\n` +
      `${hint}\n\nYa type karein **help** for all commands.`;
  }
}

export const getWelcomeMessage = (userName, businessName) => {
  return `🙏 Namaste **${userName || 'Sir/Madam'}**! Main **DataHive AI Assistant** hoon.\n\nMain **${businessName || 'aapke business'}** ke baare mein sab jaanta hoon. Products, orders, customers, sales — sab kuch ek jagah!\n\n💡 Kisi bhi **customer ka naam** ya **product ka naam** directly type karein, main turant detail dikhaunga!\n\nTry kariye: *"Business ka summary batao"* ya *"Kitne products hain?"*`;
};
