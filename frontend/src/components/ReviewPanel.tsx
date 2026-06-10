'use client';

import { useState } from 'react';
import { Loader2, Play } from 'lucide-react';
import { api } from '@/lib/api';
import type { Review, ReviewTemplate } from '@/lib/types';
import { SeverityBadge } from './SeverityBadge';

const TEMPLATES: { id: ReviewTemplate; label: string; description: string }[] =
  [
    {
      id: 'security',
      label: 'Security Review',
      description: 'Credentials, auth, injection risks',
    },
    {
      id: 'performance',
      label: 'Performance Review',
      description: 'Slow ops, queries, rendering',
    },
    {
      id: 'code_quality',
      label: 'Code Quality',
      description: 'Naming, structure, readability',
    },
    {
      id: 'documentation',
      label: 'Documentation',
      description: 'README, setup guide, API docs',
    },
    {
      id: 'architecture',
      label: 'Architecture Analysis',
      description: 'System overview and components',
    },
  ];

interface ReviewPanelProps {
  projectId: string;
  selectedFiles: string[];
}

export function ReviewPanel({ projectId, selectedFiles }: ReviewPanelProps) {
  const [template, setTemplate] = useState<ReviewTemplate>('security');
  const [loading, setLoading] = useState(false);
  const [review, setReview] = useState<Review | null>(null);
  const [error, setError] = useState('');

  const runReview = async () => {
    setLoading(true);
    setError('');
    try {
      const scope =
        selectedFiles.length === 0
          ? 'project'
          : selectedFiles.length === 1
            ? 'single'
            : 'multiple';
      const { data } = await api.reviews.create(projectId, {
        template,
        targetFiles: selectedFiles.length ? selectedFiles : undefined,
        scope,
      });
      setReview(data);
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Review failed';
      setError(typeof msg === 'string' ? msg : 'Review failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-2">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => setTemplate(t.id)}
            className={`rounded-lg border p-3 text-left transition-colors ${
              template === t.id
                ? 'border-indigo-500 bg-indigo-500/10'
                : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            <p className="text-sm font-medium">{t.label}</p>
            <p className="text-xs text-slate-500">{t.description}</p>
          </button>
        ))}
      </div>

      <p className="text-xs text-slate-500">
        Scope:{' '}
        {selectedFiles.length === 0
          ? 'Entire project'
          : selectedFiles.length === 1
            ? `Single file: ${selectedFiles[0]}`
            : `${selectedFiles.length} selected files`}
      </p>

      <button
        onClick={runReview}
        disabled={loading}
        className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Play className="h-4 w-4" />
        )}
        Run Review
      </button>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {review && (
        <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-900 p-4">
          <h3 className="font-semibold">{review.title}</h3>
          <div>
            <h4 className="mb-1 text-sm font-medium text-slate-300">Summary</h4>
            <p className="text-sm text-slate-400">{review.summary}</p>
          </div>

          {review.issues.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-medium text-slate-300">Issues</h4>
              <div className="space-y-2">
                {review.issues.map((issue, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-slate-800 bg-slate-950 p-3"
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <SeverityBadge severity={issue.severity} />
                      <span className="text-sm font-medium">{issue.title}</span>
                    </div>
                    <p className="text-xs text-slate-400">{issue.description}</p>
                    {issue.file && (
                      <p className="mt-1 font-mono text-xs text-slate-500">
                        {issue.file}
                        {issue.line ? `:${issue.line}` : ''}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {review.recommendations.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-medium text-slate-300">
                Recommendations
              </h4>
              <ul className="list-inside list-disc space-y-1 text-sm text-slate-400">
                {review.recommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
