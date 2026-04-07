import React, { useState } from 'react';
import {
  useAISummaries,
  useGenerateAISummary,
  useApproveAISummary,
  useUpdateAISummary,
  useDiscardAISummary,
} from '../../hooks/useAISummary';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { Input } from '../ui/Input';
import { Spinner } from '../ui/Spinner';
import { Badge } from '../ui/Badge';
import { formatDistanceToNow } from 'date-fns';
import type { AISummary } from '../../types';

interface AISummaryTabProps {
  incidentId: string;
}

export const AISummaryTab: React.FC<AISummaryTabProps> = ({ incidentId }) => {
  const { data: summaries, isLoading } = useAISummaries(incidentId);
  const generateMutation = useGenerateAISummary();
  const approveMutation = useApproveAISummary();
  const updateMutation = useUpdateAISummary();
  const discardMutation = useDiscardAISummary();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedSummary, setEditedSummary] = useState('');
  const [editedRootCause, setEditedRootCause] = useState('');
  const [editedImpact, setEditedImpact] = useState('');
  const [editedActions, setEditedActions] = useState<string[]>([]);
  const [editedRecommendations, setEditedRecommendations] = useState<string[]>([]);

  const latestSummary = summaries?.[0];

  const handleEdit = (summary: AISummary) => {
    setEditingId(summary.id);
    setEditedSummary(summary.executive_summary);
    setEditedRootCause(summary.root_cause || '');
    setEditedImpact(summary.impact);
    setEditedActions([...summary.actions_taken]);
    setEditedRecommendations([...summary.recommendations]);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    try {
      await updateMutation.mutateAsync({
        incidentId,
        summaryId: editingId,
        data: {
          executive_summary: editedSummary,
          root_cause: editedRootCause || null,
          impact: editedImpact,
          actions_taken: editedActions,
          recommendations: editedRecommendations,
        },
      });
      setEditingId(null);
    } catch (error) {
      console.error('Failed to update summary:', error);
    }
  };

  const handleAddAction = () => {
    setEditedActions([...editedActions, '']);
  };

  const handleUpdateAction = (index: number, value: string) => {
    const newActions = [...editedActions];
    newActions[index] = value;
    setEditedActions(newActions);
  };

  const handleRemoveAction = (index: number) => {
    setEditedActions(editedActions.filter((_, i) => i !== index));
  };

  const handleAddRecommendation = () => {
    setEditedRecommendations([...editedRecommendations, '']);
  };

  const handleUpdateRecommendation = (index: number, value: string) => {
    const newRecs = [...editedRecommendations];
    newRecs[index] = value;
    setEditedRecommendations(newRecs);
  };

  const handleRemoveRecommendation = (index: number) => {
    setEditedRecommendations(editedRecommendations.filter((_, i) => i !== index));
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
      {/* Generate Button */}
      {(!latestSummary || latestSummary.status === 'discarded') && (
        <div className="bg-surface-container-lowest p-8 rounded-lg text-center">
          <span className="material-symbols-outlined text-6xl text-primary">
            auto_awesome
          </span>
          <h3 className="text-xl font-bold font-headline text-on-surface mt-4">
            AI-Powered Incident Summary
          </h3>
          <p className="text-on-surface-variant mt-2 max-w-2xl mx-auto">
            Generate a comprehensive summary based on timeline events, attachments, and comments.
            The AI will analyze all available evidence and provide actionable recommendations.
          </p>
          <Button
            onClick={() => generateMutation.mutate(incidentId)}
            disabled={generateMutation.isPending}
            className="mt-6"
          >
            {generateMutation.isPending ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Generating Summary...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">auto_awesome</span>
                Generate Summary
              </>
            )}
          </Button>
        </div>
      )}

      {/* Latest Summary */}
      {latestSummary && latestSummary.status !== 'discarded' && (
        <div className="bg-surface-container-lowest p-6 rounded-lg space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold font-headline text-on-surface">
                AI Summary
              </h3>
              <Badge
                variant="default"
                className={
                  latestSummary.status === 'approved'
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container text-on-surface-variant'
                }
              >
                {latestSummary.status}
              </Badge>
            </div>
            <span className="text-sm text-on-surface-variant">
              Generated {formatDistanceToNow(new Date(latestSummary.generated_at), { addSuffix: true })}
            </span>
          </div>

          {/* Executive Summary */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant mb-3">
              Executive Summary
            </h4>
            {editingId === latestSummary.id ? (
              <Textarea
                value={editedSummary}
                onChange={(e) => setEditedSummary(e.target.value)}
                rows={4}
              />
            ) : (
              <div className="bg-surface-container-low p-4 rounded text-on-surface">
                {latestSummary.executive_summary}
              </div>
            )}
          </div>

          {/* Root Cause */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant mb-3">
              Root Cause
            </h4>
            {editingId === latestSummary.id ? (
              <Textarea
                value={editedRootCause}
                onChange={(e) => setEditedRootCause(e.target.value)}
                rows={3}
                placeholder="Root cause (if identified)"
              />
            ) : (
              <div className="bg-surface-container-low p-4 rounded text-on-surface">
                {latestSummary.root_cause || 'Not yet identified'}
              </div>
            )}
          </div>

          {/* Impact */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant mb-3">
              Impact Assessment
            </h4>
            {editingId === latestSummary.id ? (
              <Textarea
                value={editedImpact}
                onChange={(e) => setEditedImpact(e.target.value)}
                rows={3}
              />
            ) : (
              <div className="bg-surface-container-low p-4 rounded text-on-surface">
                {latestSummary.impact}
              </div>
            )}
          </div>

          {/* Actions Taken */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant mb-3">
              Actions Taken
            </h4>
            {editingId === latestSummary.id ? (
              <div className="space-y-2">
                {editedActions.map((action, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      type="text"
                      value={action}
                      onChange={(e) => handleUpdateAction(index, e.target.value)}
                      placeholder={`Action ${index + 1}`}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveAction(index)}
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </Button>
                  </div>
                ))}
                <Button variant="secondary" size="sm" onClick={handleAddAction}>
                  <span className="material-symbols-outlined text-sm">add</span>
                  Add Action
                </Button>
              </div>
            ) : (
              <ul className="space-y-2">
                {latestSummary.actions_taken.map((action, index) => (
                  <li key={index} className="flex items-start gap-3 bg-surface-container-low p-3 rounded">
                    <span className="material-symbols-outlined text-primary">check_circle</span>
                    <span className="text-on-surface">{action}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Recommendations */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant mb-3">
              Recommendations
            </h4>
            {editingId === latestSummary.id ? (
              <div className="space-y-2">
                {editedRecommendations.map((rec, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      type="text"
                      value={rec}
                      onChange={(e) => handleUpdateRecommendation(index, e.target.value)}
                      placeholder={`Recommendation ${index + 1}`}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveRecommendation(index)}
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </Button>
                  </div>
                ))}
                <Button variant="secondary" size="sm" onClick={handleAddRecommendation}>
                  <span className="material-symbols-outlined text-sm">add</span>
                  Add Recommendation
                </Button>
              </div>
            ) : (
              <ul className="space-y-2">
                {latestSummary.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-3 bg-surface-container-low p-3 rounded">
                    <span className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-on-surface">{rec}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-outline-variant">
            {editingId === latestSummary.id ? (
              <>
                <Button onClick={handleSaveEdit} disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button variant="ghost" onClick={() => setEditingId(null)}>
                  Cancel
                </Button>
              </>
            ) : latestSummary.status === 'pending' ? (
              <>
                <Button
                  onClick={() => approveMutation.mutate({ incidentId, summaryId: latestSummary.id })}
                  disabled={approveMutation.isPending}
                >
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  Approve Summary
                </Button>
                <Button variant="secondary" onClick={() => handleEdit(latestSummary)}>
                  <span className="material-symbols-outlined text-sm">edit</span>
                  Edit
                </Button>
                <Button
                  variant="tertiary"
                  onClick={() => discardMutation.mutate({ incidentId, summaryId: latestSummary.id })}
                  disabled={discardMutation.isPending}
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                  Discard
                </Button>
              </>
            ) : (
              <Button variant="secondary" onClick={() => generateMutation.mutate(incidentId)}>
                <span className="material-symbols-outlined text-sm">refresh</span>
                Generate New Version
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Summary History */}
      {summaries && summaries.length > 1 && (
        <div className="bg-surface-container-low p-6 rounded-lg">
          <h4 className="text-lg font-bold font-headline text-on-surface mb-4">
            Version History
          </h4>
          <div className="space-y-2">
            {summaries.slice(1).map((summary) => (
              <div
                key={summary.id}
                className="flex items-center justify-between p-3 bg-surface-container-lowest rounded hover:bg-surface-container transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Badge variant="default">{summary.status}</Badge>
                </div>
                <span className="text-sm text-on-surface-variant">
                  {new Date(summary.generated_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
