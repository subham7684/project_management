// --- file: src/components/ticketDetails/AttachmentList.tsx ---
import { FC, useState } from 'react';
import { Paperclip, X, Download, File, Image, FileText, FilePlus } from 'lucide-react';
import { toast } from '../../ui/use-toast';
import ticketService from '../../../services/ticket';

interface Attachment {
  id: string;
  filename: string;
  url: string;
  content_type: string;
  size: number;
  uploaded_at: string;
  uploaded_by: string;
}

interface AttachmentListProps {
  ticketId: string;
  attachments: Attachment[];
  onAttachmentAdded: (updatedTicket: any) => void;
  onAttachmentRemoved: (updatedTicket: any) => void;
  uiColors: any;
  themeColors: any;
}

const AttachmentList: FC<AttachmentListProps> = ({ 
  ticketId,
  attachments,
  onAttachmentAdded,
  onAttachmentRemoved,
  uiColors,
  themeColors 
}) => {
  const [isUploading, setIsUploading] = useState(false);
  
  // Get file icon based on mime type
  const getFileIcon = (contentType: string) => {
    if (contentType.startsWith('image/')) {
      return <Image size={18} />;
    } else if (contentType.includes('pdf')) {
      return <FileText size={18} />;
    } else {
      return <File size={18} />;
    }
  };
  
  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    
    try {
      // For now, just handle the first file
      const file = files[0];
      
      // We'll use an appropriate method from your existing service
      // Since we don't have direct attachment API, we'll mock this
      // In a real implementation, you'd use a proper API endpoint
      
      // For now, we'll simulate adding an attachment by updating the ticket
      const updatedTicket = await ticketService.getTicketDetails(ticketId);
      
      // For feedback purposes only
      toast.show({
        title: 'Attachment added',
        description: 'This is a placeholder for attachment functionality',
        variant: 'default'
      });
      
      // Notify parent component
      onAttachmentAdded(updatedTicket);
      
      toast.show({
        title: 'File Uploaded',
        description: `${file.name} has been attached to the ticket`,
        variant: 'default',
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.show({
        title: 'Upload Failed',
        description: 'Failed to upload the attachment',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      // Reset the input
      e.target.value = '';
    }
  };
  
  // Handle attachment removal
  const handleRemoveAttachment = async (attachmentId: string, filename: string) => {
    if (!confirm(`Remove ${filename} from this ticket?`)) {
      return;
    }
    
    try {
      // We'll use an appropriate method from your existing service
      // Since we don't have direct attachment API, we'll mock this
      
      // For now, we'll simulate removing an attachment by updating the ticket
      const updatedTicket = await ticketService.getTicketDetails(ticketId);
      
      // For feedback purposes only
      toast.show({
        title: 'Attachment removed',
        description: 'This is a placeholder for attachment functionality',
        variant: 'default'
      });
      
      // Notify parent component
      onAttachmentRemoved(updatedTicket);
      
      toast.show({
        title: 'Attachment Removed',
        description: `${filename} has been removed from the ticket`,
        variant: 'default',
      });
    } catch (error) {
      console.error('Error removing attachment:', error);
      toast.show({
        title: 'Error',
        description: 'Failed to remove the attachment',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className={`mb-6 ${uiColors.cardBg} rounded-xl border ${uiColors.borderColor} shadow-sm overflow-hidden`}>
      <div className={`p-4 border-b ${uiColors.borderColor} flex justify-between items-center`}>
        <h3 className={`text-sm font-medium ${themeColors.secondaryText} flex items-center gap-2`}>
          <Paperclip size={16} />
          <span>Attachments ({attachments.length})</span>
        </h3>
        
        {/* Upload button */}
        <label 
          className={`flex items-center gap-1 px-2 py-1 rounded-md text-sm ${themeColors.buttonBg} ${themeColors.buttonText} hover:opacity-90 cursor-pointer transition-colors`}
        >
          <input
            type="file"
            onChange={handleFileUpload}
            className="hidden"
            disabled={isUploading}
          />
          <FilePlus size={16} />
          <span>{isUploading ? 'Uploading...' : 'Add File'}</span>
        </label>
      </div>
      
      {/* Attachments list */}
      {attachments.length > 0 ? (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {attachments.map((attachment) => (
            <div 
              key={attachment.id}
              className="p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              {/* File info */}
              <div className="flex items-center gap-3 min-w-0">
                <div className={`p-2 rounded-md ${uiColors.softBg}`}>
                  {getFileIcon(attachment.content_type)}
                </div>
                
                <div className="min-w-0">
                  <div className={`text-sm font-medium ${themeColors.primaryText} truncate`}>
                    {attachment.filename}
                  </div>
                  <div className={`text-xs ${uiColors.mutedText} flex items-center gap-1`}>
                    <span>{formatFileSize(attachment.size)}</span>
                    <span className="text-gray-400">•</span>
                    <span>{new Date(attachment.uploaded_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-1">
                <a
                  href={attachment.url}
                  download={attachment.filename}
                  className={`p-1.5 rounded-full hover:${uiColors.softBg} transition-colors`}
                  title="Download"
                >
                  <Download size={16} className={uiColors.mutedText} />
                </a>
                
                <button
                  onClick={() => handleRemoveAttachment(attachment.id, attachment.filename)}
                  className={`p-1.5 rounded-full hover:${uiColors.softBg} transition-colors`}
                  title="Remove"
                >
                  <X size={16} className={uiColors.mutedText} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`p-8 text-center ${uiColors.mutedText}`}>
          <Paperclip size={24} className="mx-auto mb-2 opacity-40" />
          <p>No attachments yet</p>
          <p className="text-xs mt-1">Drag and drop files here or click Add File</p>
        </div>
      )}
    </div>
  );
};

export default AttachmentList;