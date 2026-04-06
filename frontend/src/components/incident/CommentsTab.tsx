import React, { useState } from 'react';
import { useComments, useCreateComment } from '../../hooks/useComments';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { Spinner } from '../ui/Spinner';
import { formatDistanceToNow } from 'date-fns';

interface CommentsTabProps {
  incidentId: string;
}

export const CommentsTab: React.FC<CommentsTabProps> = ({ incidentId }) => {
  const { data: comments, isLoading } = useComments(incidentId);
  const createMutation = useCreateComment(incidentId);
  const [newComment, setNewComment] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await createMutation.mutateAsync({ content: newComment });
      setNewComment('');
    } catch (error) {
      console.error('Failed to create comment:', error);
    }
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
      {/* Add Comment Form */}
      <div className="bg-surface-container-lowest p-6 rounded-lg">
        <h3 className="text-lg font-bold font-headline text-on-surface mb-4">
          Add Comment
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts, observations, or questions..."
            rows={4}
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={createMutation.isPending || !newComment.trim()}>
              {createMutation.isPending ? 'Posting...' : 'Post Comment'}
            </Button>
          </div>
        </form>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {comments?.map((comment) => (
          <div key={comment.id} className="bg-surface-container-lowest p-6 rounded-lg">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold">
                {comment.author?.email?.[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-bold text-on-surface">
                    {comment.author?.email || 'Unknown'}
                  </span>
                  <span className="text-sm text-on-surface-variant">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-on-surface whitespace-pre-wrap">{comment.content}</p>
              </div>
            </div>
          </div>
        ))}

        {comments?.length === 0 && (
          <div className="text-center py-12 bg-surface-container-low rounded-lg">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant/30">
              comment
            </span>
            <p className="text-on-surface-variant mt-4">No comments yet</p>
            <p className="text-sm text-on-surface-variant/70 mt-2">
              Start a discussion about this incident
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
