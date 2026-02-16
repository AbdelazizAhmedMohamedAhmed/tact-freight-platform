import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { MessageSquare, Upload, Paperclip, Send } from 'lucide-react';
import { format } from 'date-fns';

export default function CommentThread({ entityType, entityId, userRole }) {
  const [message, setMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['comments', entityType, entityId],
    queryFn: () => base44.entities.Comment.filter({ entity_type: entityType, entity_id: entityId }, '-created_date', 100),
  });

  const createCommentMutation = useMutation({
    mutationFn: (data) => base44.entities.Comment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['comments', entityType, entityId]);
      setMessage('');
      setAttachments([]);
      setIsInternal(false);
    },
  });

  const handleFileUpload = async (e) => {
    setUploading(true);
    const uploaded = [];
    for (const file of e.target.files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      uploaded.push(file_url);
    }
    setAttachments(prev => [...prev, ...uploaded]);
    setUploading(false);
  };

  const handleSubmit = () => {
    if (!message.trim() && attachments.length === 0) return;

    createCommentMutation.mutate({
      entity_type: entityType,
      entity_id: entityId,
      author_email: user.email,
      author_name: user.full_name || user.email,
      author_role: user.role,
      message: message.trim(),
      is_internal: isInternal,
      attachments,
    });
  };

  const isInternal = userRole !== 'user';
  const filteredComments = comments.filter(c => 
    !c.is_internal || isInternal
  );

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-[#D50000]" />
        <h3 className="font-bold text-[#1A1A1A]">Comments</h3>
      </div>

      <div className="space-y-4 mb-6">
        {filteredComments.map(comment => (
          <div key={comment.id} className={`p-4 rounded-lg ${comment.is_internal ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'}`}>
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-semibold text-sm text-[#1A1A1A]">{comment.author_name}</p>
                <p className="text-xs text-gray-500">
                  {format(new Date(comment.created_date), 'MMM d, yyyy h:mm a')}
                  {comment.is_internal && <span className="ml-2 text-yellow-700 font-medium">Internal</span>}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.message}</p>
            {comment.attachments?.length > 0 && (
              <div className="mt-3 space-y-1">
                {comment.attachments.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-blue-600 hover:underline">
                    <Paperclip className="w-3 h-3" /> Attachment {i + 1}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
        {filteredComments.length === 0 && (
          <p className="text-center text-gray-400 py-8 text-sm">No comments yet</p>
        )}
      </div>

      <div className="space-y-3">
        <Textarea
          placeholder="Add a comment..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="min-h-[80px]"
        />
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <input type="file" multiple onChange={handleFileUpload} className="hidden" id="comment-files" />
            <label htmlFor="comment-files">
              <Button variant="outline" size="sm" disabled={uploading} asChild>
                <span><Upload className="w-4 h-4 mr-2" /> {uploading ? 'Uploading...' : 'Attach'}</span>
              </Button>
            </label>
            {attachments.length > 0 && (
              <span className="text-xs text-gray-500">{attachments.length} file(s)</span>
            )}
            {isInternal && (
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={isInternal} onChange={(e) => setIsInternal(e.target.checked)} />
                Internal only
              </label>
            )}
          </div>
          <Button onClick={handleSubmit} disabled={!message.trim() && attachments.length === 0} className="bg-[#D50000] hover:bg-[#B00000]">
            <Send className="w-4 h-4 mr-2" /> Send
          </Button>
        </div>
      </div>
    </div>
  );
}