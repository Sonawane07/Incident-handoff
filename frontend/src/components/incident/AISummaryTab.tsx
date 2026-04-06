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
import { Spinner } from '../ui/Spinner';
import { Badge } from '../ui/Badge';
import { formatDistanceToNow } from 'date-fns';

interface AISummaryTabProps {
  incidentId: string;
}

export const AISummaryTab: React.FC<AISummaryTabProps> = ({ incidentId }) => {
  const { data: summaries, isLoading } = useAISummaries(incidentId);
  const generateMutation = useGenerateAISummary(incidentId);
  const approveMutation = useApproveAISummary(incidentId);
  const updateMutation = useUpdateAISummary(incidentId);
  const discardMutation = useDiscardAISummary(incidentId);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedNarrative, setEditedNarrative] = useState('');
  const [editedSteps, setEditedSteps] = useState<string[]>([]);

  const latestSummary = summaries?.[0];

  const handleEdit = (summary: typeof latestSummary) => {
    if (!summary) return;
    setEditingId(summary.id);
    setEditedNarrative(summary.timeline_narrative);
    setEditedSteps([...summary.next_steps]);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    try {
      await updateMutation.mutateAsync({
        id: editingId,
        timeline_narrative: editedNarrative,
        next_steps: editedSteps,
      });
      setEditingId(null);
    } catch (error) {
      console.error('Failed to update summary:', error);
    }
  };

  const handleAddStep = () => {
    setEditedSteps([...editedSteps, '']);
  };

  const handleUpdateStep = (index: number, value: string) => {
    const newSteps = [...editedSteps];
    newSteps[index] = value;
    setEditedSteps(newSteps);
  };

  const handleRemoveStep = (index: number) => {
    setEditedSteps(editedSteps.filter((_, i) => i !== index));
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
            The AI will analyze all available evidence and provide actionable next steps.
          </p>
          <Button
            onClick={() => generateMutation.mutate()}
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
                AI Summary (Version {latestSummary.version})
              </h3>
              <Badge
                variant="default"
                className={
                  latestSummary.status === 'approved'
                    ? 'bg-primary text-on-primary'
                    : latestSummary.status === 'edited'
                    ? 'bg-secondary text-on-secondary'
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

          {/* Timeline Narrative */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant mb-3">
              Timeline Narrative
            </h4>
            {editingId === latestSummary.id ? (
              <Textarea
                value={editedNarrative}
                onChange={(e) => setEditedNarrative(e.target.value)}
                rows={8}
              />
            ) : (
              <div className="bg-surface-container-low p-4 rounded whitespace-pre-wrap text-on-surface">
                {latestSummary.timeline_narrative}
              </div>
            )}
          </div>

          {/* Next Steps */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant mb-3">
              Recommended Next Steps
            </h4>
            {editingId === latestSummary.id ? (
              <div className="space-y-2">
                {editedSteps.map((step, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={step}
                      onChange={(e) => handleUpdateStep(index, e.target.value)}
                      className="flex-1 px-4 py-2 bg-surface-container-low border-b-2 border-outline-variant focus:border-primary focus:outline-none transition-colors rounded"
                      placeholder={`Step ${index + 1}`}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveStep(index)}
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </Button>
                  </div>
                ))}
                <Button variant="secondary" size="sm" onClick={handleAddStep}>
                  <span className="material-symbols-outlined text-sm">add</span>
                  Add Step
                </Button>
              </div>
            ) : (
              <ul className="space-y-2">
                {latestSummary.next_steps.map((step, index) => (
                  <li key={index} className="flex items-start gap-3 bg-surface-container-low p-3 rounded">
                    <span className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-on-surface">{step}</span>
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
            ) : latestSummary.status === 'draft' || latestSummary.status === 'edited' ? (
              <>
                <Button
                  onClick={() => approveMutation.mutate(latestSummary.id)}
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
                  onClick={() => discardMutation.mutate(latestSummary.id)}
                  disabled={discardMutation.isPending}
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                  Discard
                </Button>
              </>
            ) : (
              <Button variant="secondary" onClick={() => generateMutation.mutate()}>
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
                  <span className="text-sm font-medium text-on-surface">
                    Version {summary.version}
                  </span>
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
