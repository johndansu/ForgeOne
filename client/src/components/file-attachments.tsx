"use client";

import { useState, useRef } from 'react';
import { Upload, FileText, Image, File, Video, Music, Download, Trash2 } from 'lucide-react';
import { TextureButton } from '@/components/ui/texture-button';
import { cn } from '@/lib/utils';

interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: Date;
}

interface FileAttachmentsProps {
  attachments: Attachment[];
  onAdd: (files: File[]) => void;
  onRemove: (id: string) => void;
  maxFiles?: number;
  maxSize?: number;
  allowedTypes?: string[];
  className?: string;
}

export function FileAttachments({
  attachments,
  onAdd,
  onRemove,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB
  allowedTypes = ['image/*', 'application/pdf', 'text/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  className
}: FileAttachmentsProps) {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (type.startsWith('video/')) return <Video className="h-4 w-4" />;
    if (type.startsWith('audio/')) return <Music className="h-4 w-4" />;
    if (type.includes('pdf')) return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(file => {
      if (!allowedTypes.some(type => file.type.match(type))) {
        alert(`File type ${file.type} is not allowed`);
        return false;
      }
      if (file.size > maxSize) {
        alert(`File ${file.name} is too large (max ${formatFileSize(maxSize)})`);
        return false;
      }
      return true;
    });

    if (attachments.length + validFiles.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    onAdd(validFiles);
  };

  const downloadFile = (attachment: Attachment) => {
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
          dragActive ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={allowedTypes.join(',')}
          onChange={handleFileInput}
          className="hidden"
        />
        
        <div className="flex flex-col items-center space-y-2">
          <Upload className="h-8 w-8 text-gray-400" />
          <div>
            <p className="text-sm text-gray-600">
              Drag and drop files here, or{' '}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                browse
              </button>
            </p>
            <p className="text-xs text-gray-500">
              Max {maxFiles} files, up to {formatFileSize(maxSize)} each
            </p>
          </div>
        </div>
      </div>

      {/* File List */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">
            Attachments ({attachments.length})
          </h4>
          <div className="space-y-2">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between p-3 bg-white border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-gray-400">
                    {getFileIcon(attachment.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {attachment.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(attachment.size)} • {attachment.uploadedAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => downloadFile(attachment)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onRemove(attachment.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                    title="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex space-x-2">
        <TextureButton
          onClick={() => fileInputRef.current?.click()}
          variant="minimal"
          className="flex-1"
        >
          <Upload className="h-4 w-4" />
          Add Files
        </TextureButton>
      </div>
    </div>
  );
}
