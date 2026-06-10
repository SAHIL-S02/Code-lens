'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  ArrowLeft,
  FileCode,
  History,
  MessageSquare,
  Search,
  Shield,
  Upload,
} from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { FileTree } from '@/components/FileTree';
import { CodeViewer } from '@/components/CodeViewer';
import { UploadPanel } from '@/components/UploadPanel';
import { ReviewPanel } from '@/components/ReviewPanel';
import { ChatPanel } from '@/components/ChatPanel';
import { SeverityBadge } from '@/components/SeverityBadge';
import { api } from '@/lib/api';
import type { FileTreeNode, Project, Review } from '@/lib/types';

type Tab = 'explorer' | 'upload' | 'review' | 'history' | 'chat';

export default function ProjectPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [tree, setTree] = useState<FileTreeNode[]>([]);
  const [selectedPath, setSelectedPath] = useState<string>();
  const [fileContent, setFileContent] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [tab, setTab] = useState<Tab>('explorer');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [search, setSearch] = useState('');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  const loadProject = useCallback(async () => {
    const { data } = await api.projects.get(projectId);
    setProject(data);
  }, [projectId]);

  const loadTree = useCallback(async () => {
    const { data } = await api.files.getTree(projectId);
    setTree(data);
  }, [projectId]);

  const loadReviews = useCallback(async () => {
    const { data } = await api.reviews.list(projectId, search || undefined);
    setReviews(data);
  }, [projectId, search]);

  useEffect(() => {
    loadProject();
    loadTree();
  }, [loadProject, loadTree]);

  useEffect(() => {
    if (tab === 'history') loadReviews();
  }, [tab, loadReviews]);

  const selectFile = async (path: string) => {
    setSelectedPath(path);
    const { data } = await api.files.getContent(projectId, path);
    setFileContent(data.content || '');
  };

  const toggleFileSelection = (path: string) => {
    setSelectedFiles((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path],
    );
  };

  const onUploaded = () => {
    loadTree();
    loadProject();
    setTab('explorer');
  };

  const tabs: { id: Tab; label: string; icon: typeof FileCode }[] = [
    { id: 'explorer', label: 'Explorer', icon: FileCode },
    { id: 'upload', label: 'Upload', icon: Upload },
    { id: 'review', label: 'Review', icon: Shield },
    { id: 'history', label: 'History', icon: History },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
  ];

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="flex h-screen flex-col">
          <header className="border-b border-slate-800 px-6 py-4">
            <Link
              href="/dashboard"
              className="mb-2 inline-flex items-center gap-1 text-sm text-slate-400 hover:text-slate-200"
            >
              <ArrowLeft className="h-3 w-3" />
              Back to projects
            </Link>
            <h1 className="text-xl font-bold">{project?.name || 'Loading...'}</h1>
            {project?.description && (
              <p className="text-sm text-slate-400">{project.description}</p>
            )}
          </header>

          <div className="flex border-b border-slate-800 px-6">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm transition-colors ${
                  tab === id
                    ? 'border-indigo-500 text-indigo-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-hidden">
            {tab === 'explorer' && (
              <div className="flex h-full">
                <div className="w-72 overflow-auto border-r border-slate-800 bg-slate-900">
                  <div className="border-b border-slate-800 px-4 py-2">
                    <p className="text-xs text-slate-500">
                      Click to preview, checkbox to select for review
                    </p>
                  </div>
                  <FileTree
                    nodes={tree}
                    selectedPath={selectedPath}
                    onSelect={selectFile}
                  />
                  {selectedPath && (
                    <div className="border-t border-slate-800 p-3">
                      <label className="flex items-center gap-2 text-xs text-slate-400">
                        <input
                          type="checkbox"
                          checked={selectedFiles.includes(selectedPath)}
                          onChange={() => toggleFileSelection(selectedPath)}
                          className="rounded"
                        />
                        Include in review
                      </label>
                    </div>
                  )}
                </div>
                <div className="flex-1 overflow-auto bg-slate-950">
                  {selectedPath && fileContent ? (
                    <CodeViewer path={selectedPath} content={fileContent} />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-500">
                      Select a file to preview
                    </div>
                  )}
                </div>
              </div>
            )}

            {tab === 'upload' && (
              <div className="max-w-2xl p-6">
                <UploadPanel projectId={projectId} onUploaded={onUploaded} />
              </div>
            )}

            {tab === 'review' && (
              <div className="max-w-3xl overflow-auto p-6">
                <ReviewPanel
                  projectId={projectId}
                  selectedFiles={selectedFiles}
                />
              </div>
            )}

            {tab === 'history' && (
              <div className="flex h-full">
                <div className="w-96 overflow-auto border-r border-slate-800 p-4">
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && loadReviews()}
                      placeholder="Search reviews..."
                      className="w-full rounded-lg border border-slate-700 bg-slate-800 py-2 pl-9 pr-4 text-sm outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-2">
                    {reviews.map((review) => (
                      <button
                        key={review.id}
                        onClick={() => setSelectedReview(review)}
                        className={`w-full rounded-lg border p-3 text-left transition-colors ${
                          selectedReview?.id === review.id
                            ? 'border-indigo-500 bg-indigo-500/10'
                            : 'border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <p className="text-sm font-medium">{review.title}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {format(new Date(review.createdAt), 'MMM d, yyyy HH:mm')}
                        </p>
                        <p className="mt-1 line-clamp-2 text-xs text-slate-400">
                          {review.summary}
                        </p>
                      </button>
                    ))}
                    {reviews.length === 0 && (
                      <p className="text-center text-sm text-slate-500">
                        No reviews yet
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex-1 overflow-auto p-6">
                  {selectedReview ? (
                    <div className="space-y-4">
                      <h2 className="text-lg font-semibold">
                        {selectedReview.title}
                      </h2>
                      <p className="text-sm text-slate-400">
                        {selectedReview.summary}
                      </p>
                      {selectedReview.issues.map((issue, i) => (
                        <div
                          key={i}
                          className="rounded-lg border border-slate-800 p-4"
                        >
                          <div className="mb-2 flex items-center gap-2">
                            <SeverityBadge severity={issue.severity} />
                            <span className="font-medium">{issue.title}</span>
                          </div>
                          <p className="text-sm text-slate-400">
                            {issue.description}
                          </p>
                        </div>
                      ))}
                      {selectedReview.recommendations.length > 0 && (
                        <div>
                          <h3 className="mb-2 font-medium">Recommendations</h3>
                          <ul className="list-inside list-disc text-sm text-slate-400">
                            {selectedReview.recommendations.map((r, i) => (
                              <li key={i}>{r}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-slate-500">Select a review to view details</p>
                  )}
                </div>
              </div>
            )}

            {tab === 'chat' && (
              <div className="h-full max-w-3xl">
                <ChatPanel projectId={projectId} />
              </div>
            )}
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
