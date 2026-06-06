import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useSearchParams } from 'react-router-dom';
import { 
  FileText, 
  Upload, 
  Trash2, 
  Sparkles, 
  MessageSquare, 
  Send, 
  Bot, 
  User, 
  Eye, 
  AlertCircle,
  FileCheck
} from 'lucide-react';

const DocumentAnalysis = () => {
  const { getAuthHeaders } = useAuth();
  const [searchParams] = useSearchParams();
  const fileIdParam = searchParams.get('fileId');

  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileDetail, setFileDetail] = useState(null);
  
  // Q&A States
  const [question, setQuestion] = useState('');
  const [qaHistory, setQaHistory] = useState([]);
  const [qaLoading, setQaLoading] = useState(false);
  
  // Upload States
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  
  const fileInputRef = useRef(null);
  const qaEndRef = useRef(null);

  // Fetch user files
  const fetchFiles = async () => {
    try {
      const response = await fetch('/api/files', {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setFiles(data.files);
        
        // Handle URL parameter query
        if (fileIdParam) {
          const match = data.files.find(f => f.id === fileIdParam);
          if (match) handleSelectFile(match);
        } else if (data.files.length > 0 && !selectedFile) {
          handleSelectFile(data.files[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load files:', err);
    }
  };

  // Fetch full details of selected file
  const handleSelectFile = async (fileObj) => {
    setSelectedFile(fileObj);
    setQaHistory([]);
    setFileDetail(null);
    
    try {
      const response = await fetch(`/api/files/${fileObj.id}`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setFileDetail(data.file);
      }
    } catch (err) {
      console.error('Failed to load file details:', err);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [fileIdParam]);

  useEffect(() => {
    qaEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [qaHistory, qaLoading]);

  // Handle file upload
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const headers = getAuthHeaders();
      delete headers['Content-Type']; // Let browser set multipart boundary

      const response = await fetch('/api/files/upload', {
        method: 'POST',
        headers: headers,
        body: formData
      });
      
      const data = await response.json();
      if (data.success) {
        setFiles([data.file, ...files]);
        handleSelectFile(data.file);
      } else {
        setUploadError(data.error || 'Failed to upload file');
      }
    } catch (err) {
      setUploadError('Failed to establish server connection.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Handle file deletion
  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const response = await fetch(`/api/files/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        const remaining = files.filter(f => f.id !== id);
        setFiles(remaining);
        if (selectedFile?.id === id) {
          if (remaining.length > 0) {
            handleSelectFile(remaining[0]);
          } else {
            setSelectedFile(null);
            setFileDetail(null);
          }
        }
      }
    } catch (err) {
      console.error('Failed to delete file:', err);
    }
  };

  // Handle Q&A Submit
  const handleQaSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim() || !selectedFile || qaLoading) return;

    const userQuestion = question;
    setQuestion('');
    setQaLoading(true);

    const tempHistory = [...qaHistory, { role: 'user', content: userQuestion }];
    setQaHistory(tempHistory);

    try {
      const response = await fetch(`/api/files/${selectedFile.id}/query`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ question: userQuestion })
      });
      const data = await response.json();
      if (data.success) {
        setQaHistory([...tempHistory, { role: 'assistant', content: data.answer }]);
      } else {
        setQaHistory([...tempHistory, { role: 'assistant', content: `Error: ${data.error}` }]);
      }
    } catch (err) {
      setQaHistory([...tempHistory, { role: 'assistant', content: 'Connection error. Could not query document.' }]);
    } finally {
      setQaLoading(false);
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
      
      {/* Left Column: File List & Uploader */}
      <div className="glass-panel p-6 rounded-3xl flex flex-col space-y-6 lg:col-span-1 overflow-hidden h-full">
        <div className="space-y-1">
          <h3 className="font-bold text-white text-lg flex items-center gap-2">
            <FileText className="text-indigo-400" size={20} />
            Document Center
          </h3>
          <p className="text-slate-400 text-xs">Upload files for AI analysis</p>
        </div>

        {/* Upload Button */}
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleUpload}
            accept=".pdf,.docx,.txt,image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full py-6 border-2 border-dashed border-white/10 hover:border-brandPurple/40 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all cursor-pointer group disabled:opacity-50"
          >
            {uploading ? (
              <div className="w-6 h-6 border-2 border-brandPurple border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Upload size={24} className="group-hover:text-indigo-400 transition-colors" />
                <span className="text-sm font-semibold">Upload PDF, DOCX, TXT</span>
                <span className="text-[10px] text-slate-500">Max size: 10MB</span>
              </>
            )}
          </button>
          {uploadError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl mt-3 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle size={14} />
              <span>{uploadError}</span>
            </div>
          )}
        </div>

        {/* List of Files */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-1">Your Library</h4>
          {files.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No files uploaded.
            </div>
          ) : (
            files.map((f) => (
              <div
                key={f.id}
                onClick={() => handleSelectFile(f)}
                className={`p-3 rounded-xl cursor-pointer flex items-center justify-between border transition-all
                  ${selectedFile?.id === f.id
                    ? 'bg-brandPurple/15 text-indigo-300 border-brandPurple/20 shadow'
                    : 'bg-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10 border-white/5'
                  }
                `}
              >
                <div className="flex items-center gap-3 overflow-hidden mr-2">
                  <FileCheck size={16} className={selectedFile?.id === f.id ? 'text-indigo-400' : 'text-slate-500'} />
                  <div className="overflow-hidden">
                    <p className="font-semibold text-xs truncate text-slate-200">{f.originalName}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{formatSize(f.size)}</p>
                  </div>
                </div>
                <button
                  onClick={(e) => handleDelete(f.id, e)}
                  className="p-1.5 rounded hover:bg-white/10 text-slate-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Area: Parsed Info, Summary & Q&A */}
      <div className="lg:col-span-2 flex flex-col gap-6 h-full overflow-hidden">
        {fileDetail ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 overflow-hidden">
            
            {/* Summary Panel */}
            <div className="glass-panel p-6 rounded-3xl flex flex-col space-y-4 overflow-hidden h-full">
              <div className="border-b border-white/5 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="text-indigo-400" size={18} />
                  <h3 className="font-bold text-white text-base">AI Executive Summary</h3>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-semibold">
                  ANALYSIS OK
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto text-sm text-slate-300 leading-relaxed space-y-4 pr-1">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Document Metadata</h4>
                  <div className="grid grid-cols-2 gap-y-2 text-xs">
                    <div><span className="text-slate-500">Name:</span> <span className="font-semibold text-slate-300">{fileDetail.originalName}</span></div>
                    <div><span className="text-slate-500">Format:</span> <span className="font-semibold text-slate-300">{fileDetail.mimeType.split('/').pop().toUpperCase()}</span></div>
                    <div><span className="text-slate-500">Uploaded:</span> <span className="font-semibold text-slate-300">{new Date(fileDetail.createdAt).toLocaleDateString()}</span></div>
                    <div><span className="text-slate-500">Size:</span> <span className="font-semibold text-slate-300">{formatSize(fileDetail.size)}</span></div>
                  </div>
                </div>

                <div className="whitespace-pre-line prose prose-invert max-w-none">
                  {fileDetail.summary}
                </div>
              </div>
            </div>

            {/* Q&A Chat Panel */}
            <div className="glass-panel p-6 rounded-3xl flex flex-col space-y-4 overflow-hidden h-full">
              <div className="border-b border-white/5 pb-3 flex items-center gap-2">
                <MessageSquare className="text-indigo-400" size={18} />
                <h3 className="font-bold text-white text-base">Q&A Assistant</h3>
              </div>

              {/* Chat Thread */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {qaHistory.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                      <Sparkles size={20} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold text-white">Ask anything about this document</h4>
                      <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                        Query specific sentences, request numbers, ask for a recap of details, or extract concepts.
                      </p>
                    </div>
                  </div>
                ) : (
                  qaHistory.map((qa, index) => (
                    <div key={index} className={`flex gap-3 max-w-[90%] ${qa.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] shrink-0 font-bold
                        ${qa.role === 'user' ? 'bg-indigo-600' : 'bg-gradient-to-tr from-brandPurple to-brandViolet'}
                      `}>
                        {qa.role === 'user' ? <User size={12} /> : <Bot size={12} />}
                      </div>
                      <div className={`px-4 py-2.5 rounded-2xl border text-xs leading-relaxed
                        ${qa.role === 'user'
                          ? 'bg-indigo-600/15 border-indigo-500/20 text-indigo-100 rounded-tr-none'
                          : 'bg-[#0f111a] border-white/5 text-slate-200 rounded-tl-none'
                        }
                      `}>
                        {qa.content}
                      </div>
                    </div>
                  ))
                )}
                {qaLoading && (
                  <div className="flex gap-3 mr-auto">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-brandPurple to-brandViolet flex items-center justify-center text-white shrink-0">
                      <Bot size={12} />
                    </div>
                    <div className="px-4 py-3 bg-[#0f111a] border border-white/5 rounded-2xl rounded-tl-none flex items-center gap-1.5 shrink-0">
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                  </div>
                )}
                <div ref={qaEndRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={handleQaSubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask a question about this file..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  disabled={qaLoading}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brandPurple/40 focus:border-brandPurple transition-all disabled:opacity-50 text-xs"
                />
                <button
                  type="submit"
                  disabled={!question.trim() || qaLoading}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-brandPurple to-brandViolet hover:from-indigo-600 hover:to-purple-600 text-white shadow shadow-indigo-500/15 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
                >
                  <Send size={14} />
                </button>
              </form>

            </div>

          </div>
        ) : (
          <div className="glass-panel flex-1 rounded-3xl flex flex-col items-center justify-center text-center p-8 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Eye size={28} className="animate-pulse" />
            </div>
            <div className="space-y-1 max-w-sm">
              <h4 className="text-lg font-bold text-white">Select a Document</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Click an uploaded file from the library center or upload a new one to view its parsed results and start document-specific AI queries.
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default DocumentAnalysis;
