import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import ChatWidget from '../chatbot/ChatWidget';
import './Layout.css';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="layout-main">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="layout-content">
          {children}
        </main>
      </div>
      <ChatWidget />
    </div>
  );
};

export default Layout;
