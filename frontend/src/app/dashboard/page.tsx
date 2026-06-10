'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { FolderPlus, Plus, Trash2 } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { api } from '@/lib/api';
import type { Project } from '@/lib/types';

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const loadProjects = async () => {
    try {
      const { data } = await api.projects.list();
      setProjects(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.projects.create({ name, description });
    setName('');
    setDescription('');
    setShowForm(false);
    loadProjects();
  };

  const deleteProject = async (id: string) => {
    if (!confirm('Delete this project and all its files/reviews?')) return;
    await api.projects.delete(id);
    loadProjects();
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Projects</h1>
              <p className="text-sm text-slate-400">
                Manage your code review projects
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
            >
              <Plus className="h-4 w-4" />
              New Project
            </button>
          </div>

          {showForm && (
            <form
              onSubmit={createProject}
              className="mb-8 rounded-xl border border-slate-800 bg-slate-900 p-6"
            >
              <h2 className="mb-4 font-semibold">Create Project</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  placeholder="Project name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm outline-none focus:border-indigo-500"
                />
                <input
                  placeholder="Description (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm outline-none focus:border-indigo-500"
                />
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-500"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg px-4 py-2 text-sm text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
            </div>
          ) : projects.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-800 py-16 text-center">
              <FolderPlus className="mx-auto mb-3 h-10 w-10 text-slate-600" />
              <p className="text-slate-400">No projects yet</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 text-sm text-indigo-400 hover:underline"
              >
                Create your first project
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="group rounded-xl border border-slate-800 bg-slate-900 p-5 transition-colors hover:border-slate-700"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <Link href={`/projects/${project.id}`} className="flex-1">
                      <h3 className="font-semibold group-hover:text-indigo-300">
                        {project.name}
                      </h3>
                    </Link>
                    <button
                      onClick={() => deleteProject(project.id)}
                      className="text-slate-600 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  {project.description && (
                    <p className="mb-3 line-clamp-2 text-sm text-slate-400">
                      {project.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>
                      {format(new Date(project.createdAt), 'MMM d, yyyy')}
                    </span>
                    <span>{project.files?.length || 0} files</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
