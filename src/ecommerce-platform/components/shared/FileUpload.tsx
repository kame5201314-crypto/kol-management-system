import React, { useCallback, useState } from 'react';
import { Upload, X, FileText, Image, File, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface UploadedFileInfo {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'success' | 'error';
  progress?: number;
  error?: string;
  preview?: string;
}

interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  maxFiles?: number;
  onFilesSelected: (files: File[]) => void;
  onFileRemove?: (fileId: string) => void;
  uploadedFiles?: UploadedFileInfo[];
  disabled?: boolean;
  className?: string;
  showPreview?: boolean;
  description?: string;
}

export default function FileUpload({
  accept,
  multiple = false,
  maxSize = 10 * 1024 * 1024, // 10MB default
  maxFiles = 10,
  onFilesSelected,
  onFileRemove,
  uploadedFiles = [],
  disabled = false,
  className = '',
  showPreview = true,
  description
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFiles = (files: File[]): File[] => {
    const validFiles: File[] = [];
    const errors: string[] = [];

    for (const file of files) {
      if (file.size > maxSize) {
        errors.push(`${file.name} 超過大小限制 (${formatFileSize(maxSize)})`);
        continue;
      }

      if (accept) {
        const acceptedTypes = accept.split(',').map(t => t.trim());
        const isAccepted = acceptedTypes.some(type => {
          if (type.startsWith('.')) {
            return file.name.toLowerCase().endsWith(type.toLowerCase());
          }
          if (type.endsWith('/*')) {
            return file.type.startsWith(type.replace('/*', '/'));
          }
          return file.type === type;
        });

        if (!isAccepted) {
          errors.push(`${file.name} 不是允許的檔案類型`);
          continue;
        }
      }

      validFiles.push(file);
    }

    if (errors.length > 0) {
      setError(errors.join('\n'));
    } else {
      setError(null);
    }

    return validFiles;
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    const limitedFiles = multiple ? files.slice(0, maxFiles) : [files[0]];
    const validFiles = validateFiles(limitedFiles);

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  }, [disabled, multiple, maxFiles, onFilesSelected]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    const limitedFiles = multiple ? files.slice(0, maxFiles) : [files[0]];
    const validFiles = validateFiles(limitedFiles);

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }

    // Reset input
    e.target.value = '';
  }, [multiple, maxFiles, onFilesSelected]);

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image className="w-8 h-8 text-blue-500" />;
    }
    if (fileType === 'application/pdf') {
      return <FileText className="w-8 h-8 text-red-500" />;
    }
    return <File className="w-8 h-8 text-gray-500" />;
  };

  const getStatusIcon = (status: UploadedFileInfo['status']) => {
    switch (status) {
      case 'uploading':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
  };

  return (
    <div className={className}>
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center transition-all
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />

        <div className="flex flex-col items-center gap-3">
          <div className={`p-3 rounded-full ${isDragging ? 'bg-blue-100' : 'bg-gray-100'}`}>
            <Upload className={`w-8 h-8 ${isDragging ? 'text-blue-600' : 'text-gray-400'}`} />
          </div>

          <div>
            <p className="text-gray-700 font-medium">
              {isDragging ? '放開以上傳檔案' : '拖放檔案到此處，或點擊選擇'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {description || `支援 ${accept || '所有檔案類型'}，最大 ${formatFileSize(maxSize)}`}
            </p>
            {multiple && (
              <p className="text-sm text-gray-400 mt-1">
                最多可上傳 {maxFiles} 個檔案
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600 whitespace-pre-line">{error}</p>
        </div>
      )}

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && showPreview && (
        <div className="mt-4 space-y-2">
          {uploadedFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              {/* Preview/Icon */}
              {file.preview ? (
                <img
                  src={file.preview}
                  alt={file.name}
                  className="w-12 h-12 object-cover rounded"
                />
              ) : (
                getFileIcon(file.type)
              )}

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(file.size)}
                </p>

                {/* Progress Bar */}
                {file.status === 'uploading' && file.progress !== undefined && (
                  <div className="mt-1 w-full bg-gray-200 rounded-full h-1">
                    <div
                      className="bg-blue-500 h-1 rounded-full transition-all"
                      style={{ width: `${file.progress}%` }}
                    />
                  </div>
                )}

                {/* Error Message */}
                {file.status === 'error' && file.error && (
                  <p className="text-xs text-red-500 mt-1">{file.error}</p>
                )}
              </div>

              {/* Status/Actions */}
              <div className="flex items-center gap-2">
                {getStatusIcon(file.status)}

                {onFileRemove && file.status !== 'uploading' && (
                  <button
                    onClick={() => onFileRemove(file.id)}
                    className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Helper function
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Simple file dropzone for single file
interface SimpleDropzoneProps {
  onFileSelected: (file: File) => void;
  accept?: string;
  disabled?: boolean;
  placeholder?: string;
}

export function SimpleDropzone({
  onFileSelected,
  accept,
  disabled = false,
  placeholder = '點擊或拖放檔案'
}: SimpleDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    const file = e.dataTransfer.files[0];
    if (file) {
      onFileSelected(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelected(file);
    }
    e.target.value = '';
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
      onDrop={handleDrop}
      className={`
        relative border-2 border-dashed rounded-lg p-4 text-center transition-all
        ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
        ${disabled ? 'opacity-50' : 'cursor-pointer hover:border-gray-400'}
      `}
    >
      <input
        type="file"
        accept={accept}
        onChange={handleChange}
        disabled={disabled}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <Upload className="w-6 h-6 mx-auto text-gray-400 mb-2" />
      <p className="text-sm text-gray-500">{placeholder}</p>
    </div>
  );
}
