import { useState } from 'react';
import { useBusiness } from '../context/BusinessContext';
import { formatDate } from '../utils/helpers';
import { Plus, Search, Trash2, FileText, Upload, Download, FolderOpen, X, File } from 'lucide-react';
import './Pages.css';

const Documents = () => {
  const { documents, addDocument, deleteDocument } = useBusiness();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({ name: '', category: 'General', size: '', type: 'pdf', content: '' });
  const [selectedDoc, setSelectedDoc] = useState(null);

  const categories = ['all', ...new Set(documents.map(d => d.category))];

  const filteredDocs = documents.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || d.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleUpload = (e) => {
    e.preventDefault();
    addDocument({
      ...uploadForm,
      size: uploadForm.size || '1.0 MB',
    });
    setShowUploadModal(false);
    setUploadForm({ name: '', category: 'General', size: '', type: 'pdf', content: '' });
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const type = file.name.split('.').pop().toLowerCase();
      const sizeStr = (file.size / 1024 / 1024).toFixed(1) + ' MB';
      
      const reader = new FileReader();
      reader.onload = (event) => {
        addDocument({
          name: file.name,
          type: type,
          size: sizeStr,
          category: 'General',
          content: event.target.result,
        });
      };
      
      // If it's a text-based file, read it!
      const isText = file.type.startsWith('text/') || 
                     ['txt', 'csv', 'json', 'md', 'log', 'xml', 'js', 'jsx', 'html', 'css'].includes(type);
      if (isText) {
        reader.readAsText(file);
      } else {
        // For binary files, store simulated text info
        addDocument({
          name: file.name,
          type: type,
          size: sizeStr,
          category: 'General',
          content: `Uploaded file details: Name: ${file.name}, Type: ${type}, Size: ${sizeStr}. (Binary file content is not readable)`,
        });
      }
    });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      deleteDocument(id);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Legal': return '📜';
      case 'Tax': return '🧾';
      case 'Products': return '📦';
      case 'Reports': return '📊';
      case 'Invoices': return '💰';
      default: return '📁';
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <h2>{documents.length} Documents</h2>
          <p>Manage your business documents and files</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
            <Upload size={18} /> Quick Upload
            <input type="file" multiple accept=".pdf,.doc,.docx,.jpg,.png,.txt,.csv,.json,.md" onChange={handleFileSelect} style={{ display: 'none' }} />
          </label>
          <button className="btn btn-primary" onClick={() => setShowUploadModal(true)} id="add-document-btn">
            <Plus size={18} /> Add Document
          </button>
        </div>
      </div>

      <div className="page-filters card">
        <div className="filter-search">
          <Search size={18} className="filter-search-icon" />
          <input type="text" placeholder="Search documents..."
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="input" />
        </div>
        <div className="filter-actions">
          <select className="select" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Category Summary */}
      <div className="doc-categories-grid">
        {categories.filter(c => c !== 'all').map(cat => {
          const count = documents.filter(d => d.category === cat).length;
          return (
            <div key={cat} className="doc-category-card card" onClick={() => setFilterCategory(cat)} style={{ cursor: 'pointer' }}>
              <span className="doc-category-icon">{getCategoryIcon(cat)}</span>
              <span className="doc-category-name">{cat}</span>
              <span className="doc-category-count">{count} files</span>
            </div>
          );
        })}
      </div>

      {/* Documents List */}
      <div className="documents-list">
        {filteredDocs.map((doc, i) => (
          <div key={doc.id} className="document-item card animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="doc-icon" onClick={() => setSelectedDoc(doc)} style={{ cursor: 'pointer' }}>
              <FileText size={24} />
            </div>
            <div className="doc-info" onClick={() => setSelectedDoc(doc)} style={{ cursor: 'pointer' }}>
              <h4>{doc.name}</h4>
              <div className="doc-meta">
                <span className="badge badge-primary">{doc.type.toUpperCase()}</span>
                <span>{doc.size}</span>
                <span>{formatDate(doc.uploadDate)}</span>
                <span className="badge badge-success">{doc.category}</span>
              </div>
            </div>
            <div className="doc-actions">
              <button className="btn btn-ghost btn-sm" title="View Content" onClick={() => setSelectedDoc(doc)}>
                <FolderOpen size={16} />
              </button>
              <button className="btn btn-ghost btn-sm" title="Download">
                <Download size={16} />
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(doc.id)} style={{ color: 'var(--danger-400)' }}>
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredDocs.length === 0 && (
        <div className="empty-state">
          <FolderOpen size={48} />
          <h3>No documents found</h3>
          <p>Upload your business documents here</p>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Document</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowUploadModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpload} className="modal-form">
              <div className="input-group">
                <label>Document Name *</label>
                <input className="input" placeholder="e.g., Invoice #001" value={uploadForm.name}
                  onChange={e => setUploadForm({ ...uploadForm, name: e.target.value })} required />
              </div>
              <div className="form-row">
                <div className="input-group">
                  <label>Category</label>
                  <select className="select" value={uploadForm.category}
                    onChange={e => setUploadForm({ ...uploadForm, category: e.target.value })}>
                    <option>General</option>
                    <option>Legal</option>
                    <option>Tax</option>
                    <option>Products</option>
                    <option>Reports</option>
                    <option>Invoices</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>File Type</label>
                  <select className="select" value={uploadForm.type}
                    onChange={e => setUploadForm({ ...uploadForm, type: e.target.value })}>
                    <option value="pdf">PDF</option>
                    <option value="doc">DOC</option>
                    <option value="txt">TXT</option>
                    <option value="csv">CSV</option>
                    <option value="md">Markdown</option>
                    <option value="jpg">Image</option>
                    <option value="xlsx">Excel</option>
                  </select>
                </div>
              </div>
              <div className="input-group">
                <label>File Size</label>
                <input className="input" placeholder="e.g., 2.5 MB" value={uploadForm.size}
                  onChange={e => setUploadForm({ ...uploadForm, size: e.target.value })} />
              </div>
              <div className="input-group">
                <label>Document Content / Text Details (Optional)</label>
                <textarea className="textarea" placeholder="Paste or type document text (e.g., business policy, product description, FAQ sheet) so that Gemini AI Chatbot can read and answer from it..." value={uploadForm.content || ''}
                  onChange={e => setUploadForm({ ...uploadForm, content: e.target.value })} rows={5}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowUploadModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Document</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Content Modal */}
      {selectedDoc && (
        <div className="modal-overlay" onClick={() => setSelectedDoc(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', width: '90%' }}>
            <div className="modal-header">
              <div>
                <h2>{selectedDoc.name}</h2>
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <span className="badge badge-primary">{selectedDoc.type.toUpperCase()}</span>
                  <span className="badge badge-success">{selectedDoc.category}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Size: {selectedDoc.size}</span>
                </div>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setSelectedDoc(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body" style={{ padding: '20px 0', maxHeight: '400px', overflowY: 'auto' }}>
              <h4 style={{ marginBottom: '8px', color: 'var(--text-secondary)' }}>Document Text / Information:</h4>
              <div style={{
                whiteSpace: 'pre-wrap',
                backgroundColor: 'var(--bg-secondary)',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                fontFamily: 'monospace',
                fontSize: '14px',
                lineHeight: '1.6'
              }}>
                {selectedDoc.content || '_No text content uploaded for this file._'}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setSelectedDoc(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;
