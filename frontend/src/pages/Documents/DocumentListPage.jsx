import React, { useState, useEffect } from "react";
import { Plus, FileText, Trash2, X, Upload } from "lucide-react";
import toast from "react-hot-toast";

import documentService from "../../services/documentService";
import Spinner from "../../components/common/Spinner";
import DocumentCard from "../../components/documents/DocumentCard";

const DocumentListPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploading, setUploading] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const data = await documentService.getDocuments();
      setDocuments(data);
    } catch {
      toast.error("Failed to fetch documents.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRequest = (doc) => {
    setSelectedDoc(doc);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDoc) return;
    setDeleting(true);
    try {
      await documentService.deleteDocument(selectedDoc._id);
      setDocuments((prev) => prev.filter((d) => d._id !== selectedDoc._id));
      toast.success(`'${selectedDoc.title}' deleted.`);
      setIsDeleteModalOpen(false);
      setSelectedDoc(null);
    } catch {
      toast.error("Failed to delete document.");
    } finally {
      setDeleting(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadFile(file);
      setUploadTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile || !uploadTitle) {
      toast.error("Please provide title and file.");
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("title", uploadTitle);

    try {
      await documentService.uploadDocument(formData);
      toast.success("Document uploaded successfully!");
      setIsUploadModalOpen(false);
      setUploadFile(null);
      setUploadTitle("");
      fetchDocuments();
    } catch {
      toast.error("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-8">
      {/* Header Section: Matches Screenshot 2026-02-22 231136 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            My Documents
          </h1>
          <p className="text-slate-500 text-sm mt-0.5 font-medium">
            Manage and organize your learning materials
          </p>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#00c2a0] text-white rounded-xl font-bold shadow-[0_8px_20px_rgba(0,194,160,0.3)] hover:bg-[#00ad8e] transition-all active:scale-95 text-sm"
        >
          <Plus className="w-4 h-4" strokeWidth={3} />
          Upload Document
        </button>
      </div>

      {/* Grid Content */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <Spinner />
        </div>
      ) : documents.length === 0 ? (
        <div className="bg-white rounded-[2rem] p-16 shadow-[0_15px_40px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-5">
            <FileText className="w-8 h-8 text-slate-300" strokeWidth={1.5} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-1.5">No Documents Yet</h3>
          <p className="text-slate-500 max-w-xs mb-8 text-sm leading-relaxed font-medium">
            Get started by uploading your first PDF document to begin your AI-powered learning journey.
          </p>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#00c2a0] text-white rounded-xl font-bold shadow-[0_8px_20px_rgba(0,194,160,0.3)] hover:bg-[#00ad8e] transition-all text-sm"
          >
            <Plus className="w-4 h-4" strokeWidth={3} />
            Upload Document
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {documents.map((doc) => (
            <DocumentCard key={doc._id} document={doc} onDelete={handleDeleteRequest} />
          ))}
        </div>
      )}

      {/* Upload Modal: Exact proportions for Screenshot 2026-02-23 141533 */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md transition-all">
          <div className="relative w-full max-w-xl bg-white rounded-[2.5rem] p-10 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setIsUploadModalOpen(false)} 
              className="absolute top-8 right-8 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={24} strokeWidth={2.5} />
            </button>

            <h2 className="text-2xl font-bold text-slate-900 mb-1 tracking-tight">Upload New Document</h2>
            <p className="text-slate-500 text-sm mb-8 font-medium">Add a PDF document to your library</p>

            <form onSubmit={handleUpload} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                  Document Title
                </label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  required
                  placeholder="React JS Concept Guide"
                  className="w-full h-12 px-5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00c2a0] transition-all text-slate-700 text-sm font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                  PDF File
                </label>
                <div className="relative border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 p-10 text-center group hover:border-[#00c2a0] transition-all cursor-pointer">
                  <input 
                    type="file" 
                    accept=".pdf" 
                    onChange={handleFileChange} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  />
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center mb-4 shadow-sm transition-transform group-hover:scale-105">
                      <Upload className="w-7 h-7 text-[#00c2a0]" strokeWidth={2.5} />
                    </div>
                    <p className="font-bold text-slate-800 text-base">
                      {uploadFile ? (
                        <span className="text-[#00c2a0]">{uploadFile.name}</span>
                      ) : (
                        <>
                          <span className="text-[#00c2a0]">Click to upload</span> or drag and drop
                        </>
                      )}
                    </p>
                    <p className="text-[12px] text-slate-400 mt-1 font-medium">PDF up to 10MB</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsUploadModalOpen(false)} 
                  className="flex-1 h-12 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-all text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={uploading} 
                  className="flex-1 h-12 bg-[#00c2a0] text-white rounded-xl font-bold shadow-[0_10px_20px_rgba(0,194,160,0.3)] hover:bg-[#00ad8e] transition-all active:scale-95 text-sm"
                >
                  {uploading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentListPage;