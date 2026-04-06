import React, { useRef } from 'react';
import { useAttachments, useUploadAttachment } from '../../hooks/useAttachments';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { formatDistanceToNow } from 'date-fns';

interface AttachmentsTabProps {
  incidentId: string;
}

export const AttachmentsTab: React.FC<AttachmentsTabProps> = ({ incidentId }) => {
  const { data: attachments, isLoading } = useAttachments(incidentId);
  const uploadMutation = useUploadAttachment(incidentId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    try {
      await uploadMutation.mutateAsync(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Failed to upload file:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return 'image';
    if (fileType.includes('pdf')) return 'picture_as_pdf';
    if (fileType.includes('text')) return 'description';
    if (fileType.includes('zip') || fileType.includes('compressed')) return 'folder_zip';
    return 'attach_file';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div className="bg-surface-container-lowest p-6 rounded-lg border-2 border-dashed border-outline-variant">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-on-surface-variant/30">
            cloud_upload
          </span>
          <p className="text-on-surface font-medium mt-4">
            Upload files (max 10MB)
          </p>
          <p className="text-sm text-on-surface-variant mt-1">
            Screenshots, logs, exports, or any relevant files
          </p>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="inline-block mt-4">
            <Button as="span" disabled={uploadMutation.isPending}>
              {uploadMutation.isPending ? 'Uploading...' : 'Choose File'}
            </Button>
          </label>
        </div>
      </div>

      {/* Attachments List */}
      <div className="space-y-3">
        {attachments?.map((attachment) => (
          <div
            key={attachment.id}
            className="bg-surface-container-lowest p-4 rounded-lg flex items-center gap-4 hover:bg-surface-container transition-colors"
          >
            <div className="w-12 h-12 bg-surface-container rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-on-surface-variant">
                {getFileIcon(attachment.file_type)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-on-surface truncate">
                {attachment.filename}
              </p>
              <div className="flex items-center gap-4 text-sm text-on-surface-variant mt-1">
                <span>{formatFileSize(attachment.file_size)}</span>
                <span>•</span>
                <span>
                  Uploaded by {attachment.uploaded_by?.email || 'Unknown'}
                </span>
                <span>•</span>
                <span>
                  {formatDistanceToNow(new Date(attachment.uploaded_at), { addSuffix: true })}
                </span>
              </div>
            </div>
            <a
              href={attachment.storage_path}
              download={attachment.filename}
              className="p-2 hover:bg-surface-container rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined text-primary">
                download
              </span>
            </a>
          </div>
        ))}

        {attachments?.length === 0 && (
          <div className="text-center py-12 bg-surface-container-low rounded-lg">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant/30">
              attach_file
            </span>
            <p className="text-on-surface-variant mt-4">No attachments yet</p>
            <p className="text-sm text-on-surface-variant/70 mt-2">
              Upload files to provide evidence and context
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
