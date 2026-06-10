'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileArchive, GitBranch, Upload } from 'lucide-react';
import { api } from '@/lib/api';

interface UploadPanelProps {
  projectId: string;
  onUploaded: () => void;
}

export function UploadPanel({ projectId, onUploaded }: UploadPanelProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [tab, setTab] = useState<'files' | 'zip' | 'github'>('files');

  const handleFiles = useCallback(
    async (files: File[]) => {
      setLoading(true);
      setError('');
      try {
        const paths = files.map(
          (f) => (f as File & { path?: string }).path || f.webkitRelativePath || f.name,
        );
        await api.files.uploadFiles(projectId, files, paths);
        onUploaded();
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Upload failed');
      } finally {
        setLoading(false);
      }
    },
    [projectId, onUploaded],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFiles,
    noClick: tab !== 'files',
  });

  const handleZip = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      await api.files.uploadZip(projectId, file);
      onUploaded();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGithub = async () => {
    if (!repoUrl) return;
    setLoading(true);
    setError('');
    try {
      await api.files.importGithub(projectId, repoUrl);
      onUploaded();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'files' as const, label: 'Drag & Drop', icon: Upload },
    { id: 'zip' as const, label: 'ZIP Upload', icon: FileArchive },
    { id: 'github' as const, label: 'GitHub URL', icon: GitBranch },
  ];

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
      <div className="mb-4 flex gap-2">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
              tab === id
                ? 'bg-indigo-500/20 text-indigo-300'
                : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === 'files' && (
        <div
          {...getRootProps()}
          className={`cursor-pointer rounded-lg border-2 border-dashed p-12 text-center transition-colors ${
            isDragActive
              ? 'border-indigo-400 bg-indigo-500/10'
              : 'border-slate-700 hover:border-slate-600'
          }`}
        >
          <input
            {...getInputProps()}
            {...({ webkitdirectory: '', directory: '' } as React.InputHTMLAttributes<HTMLInputElement>)}
          />
          <Upload className="mx-auto mb-3 h-8 w-8 text-slate-500" />
          <p className="text-sm text-slate-300">
            Drag & drop files or folders here
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Text-based source files only
          </p>
        </div>
      )}

      {tab === 'zip' && (
        <div className="rounded-lg border border-dashed border-slate-700 p-12 text-center">
          <FileArchive className="mx-auto mb-3 h-8 w-8 text-slate-500" />
          <label className="cursor-pointer rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500">
            Select ZIP file
            <input
              type="file"
              accept=".zip"
              className="hidden"
              onChange={handleZip}
            />
          </label>
        </div>
      )}

      {tab === 'github' && (
        <div className="space-y-4">
          <input
            type="url"
            placeholder="https://github.com/owner/repo"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm outline-none focus:border-indigo-500"
          />
          <button
            onClick={handleGithub}
            disabled={!repoUrl || loading}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            Import Repository
          </button>
          <p className="text-xs text-slate-500">
            Public repositories only. Skips node_modules, .git, and build dirs.
          </p>
        </div>
      )}

      {loading && (
        <p className="mt-4 text-center text-sm text-indigo-400">Uploading...</p>
      )}
      {error && (
        <p className="mt-4 text-center text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}
