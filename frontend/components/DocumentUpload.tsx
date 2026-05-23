'use client';

import { useState, useCallback } from 'react';
import { authFetch } from '@/lib/auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

interface ChecklistItem {
  type: string;
  label: string;
  required: boolean;
  description: string;
  files?: UploadedFile[];
  is_uploaded: boolean;
  is_complete: boolean;
}

interface UploadedFile {
  id: string;
  file_name: string;
  file_url: string;
  file_size: number;
  status: string;
  uploaded_at: string;
}

interface DocumentUploadProps {
  applicationId: string;
  programType: string;
  onComplete?: () => void;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function DocumentUpload({ applicationId, programType, onComplete }: DocumentUploadProps) {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState<string | null>(null);

  const fetchChecklist = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await authFetch(`${API_BASE}/api/applications/${applicationId}/documents/checklist`);
      if (res.ok) {
        const data = await res.json();
        setChecklist(data.checklist || []);
      } else {
        setError('Không tải được danh sách tài liệu');
      }
    } catch {
      setError('Lỗi kết nối');
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  if (loading && checklist.length === 0) {
    fetchChecklist();
  }

  const handleFileUpload = async (documentType: string, file: File) => {
    setUploading(documentType);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_type', documentType);

      const res = await authFetch(`${API_BASE}/api/applications/${applicationId}/documents`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Upload thất bại');
      }

      await fetchChecklist();
      onComplete?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload thất bại');
    } finally {
      setUploading(null);
    }
  };

  const handleDelete = async (fileId: string) => {
    try {
      const res = await authFetch(`${API_BASE}/api/applications/${applicationId}/documents/${fileId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await fetchChecklist();
      }
    } catch {
      setError('Xóa thất bại');
    }
  };

  const handleDrop = (documentType: string, e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(null);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(documentType, file);
  };

  const requiredCount = checklist.filter(c => c.required).length;
  const uploadedRequired = checklist.filter(c => c.required && c.is_uploaded).length;
  const progress = requiredCount > 0 ? Math.round((uploadedRequired / requiredCount) * 100) : 0;

  return (
    <div className="space-y-5">
      {/* Progress bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-heading font-semibold text-gray-900">Tài liệu đính kèm</h3>
          <span className="text-sm text-gray-500">
            {uploadedRequired}/{requiredCount} tài liệu bắt buộc
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2 mb-1">
          <div
            className="bg-natif-primary h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-gray-500">
          {progress === 100
            ? 'Đã hoàn thiện tài liệu bắt buộc'
            : `Còn ${requiredCount - uploadedRequired} tài liệu bắt buộc chưa upload`}
        </p>
        <button onClick={fetchChecklist} className="text-xs text-natif-primary hover:underline mt-2">
          Làm mới danh sách
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>
      )}

      {/* Checklist items */}
      <div className="space-y-3">
        {checklist.map((item) => (
          <div key={item.type} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex w-5 h-5 rounded-full items-center justify-center text-xs font-bold
                    ${item.is_uploaded ? 'bg-green-100 text-green-600' : item.required ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-400'}`}>
                    {item.is_uploaded ? (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : item.required ? '!' : '—'}
                  </span>
                  <span className={`font-semibold text-sm ${item.required ? 'text-gray-900' : 'text-gray-700'}`}>
                    {item.label}
                    {item.required && <span className="text-red-500 ml-1">*</span>}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1 ml-7">{item.description}</p>
              </div>
            </div>

            {/* Uploaded files */}
            {item.files && item.files.length > 0 && (
              <div className="ml-7 space-y-2 mb-3">
                {item.files.map((file) => (
                  <div key={file.id} className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <svg className="w-4 h-4 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-sm text-gray-700 truncate">{file.file_name}</span>
                      <span className="text-xs text-gray-400 shrink-0">{formatFileSize(file.file_size)}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                        ${file.status === 'verified' ? 'bg-green-100 text-green-700' :
                          file.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                        {file.status === 'verified' ? 'Đã duyệt' : file.status === 'rejected' ? 'Từ chối' : 'Chờ duyệt'}
                      </span>
                      {file.status !== 'verified' && (
                        <button
                          onClick={() => handleDelete(file.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          title="Xóa file"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Upload area */}
            <div
              className={`ml-7 border-2 border-dashed rounded-xl p-4 text-center transition-colors cursor-pointer
                ${dragOver === item.type ? 'border-natif-primary bg-blue-50' : 'border-gray-200 hover:border-natif-primary/50 hover:bg-gray-50'}
                ${uploading === item.type ? 'opacity-60 pointer-events-none' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(item.type); }}
              onDragLeave={() => setDragOver(null)}
              onDrop={(e) => handleDrop(item.type, e)}
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.zip';
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) handleFileUpload(item.type, file);
                };
                input.click();
              }}
            >
              {uploading === item.type ? (
                <div className="flex items-center justify-center gap-2 text-natif-primary">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span className="text-sm font-medium">Đang tải lên...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="text-sm text-gray-500">
                    Kéo thả file hoặc <span className="text-natif-primary font-medium">bấm để chọn</span>
                  </span>
                  <span className="text-xs text-gray-400">PDF, DOC, DOCX, XLS, XLSX, PNG, JPG, ZIP (tối đa 20MB)</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
