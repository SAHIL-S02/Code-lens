'use client';

import { useEffect, useState } from 'react';
import { Plus, Star, Trash2 } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { api } from '@/lib/api';
import type { AiProvider } from '@/lib/types';

const PRESETS = [
  {
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    modelName: 'gpt-4o-mini',
  },
  {
    name: 'LM Studio',
    baseUrl: 'http://localhost:1234/v1',
    modelName: 'local-model',
  },
  {
    name: 'Ollama',
    baseUrl: 'http://localhost:11434/v1',
    modelName: 'llama3',
  },
  {
    name: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    modelName: 'openai/gpt-4o-mini',
  },
];

export default function SettingsPage() {
  const [providers, setProviders] = useState<AiProvider[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    baseUrl: '',
    apiKey: '',
    modelName: '',
    isDefault: true,
  });

  const load = async () => {
    const { data } = await api.providers.list();
    setProviders(data);
  };

  useEffect(() => {
    load();
  }, []);

  const applyPreset = (preset: (typeof PRESETS)[0]) => {
    setForm((f) => ({
      ...f,
      name: preset.name,
      baseUrl: preset.baseUrl,
      modelName: preset.modelName,
    }));
    setShowForm(true);
  };

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.providers.create(form);
    setForm({
      name: '',
      baseUrl: '',
      apiKey: '',
      modelName: '',
      isDefault: false,
    });
    setShowForm(false);
    load();
  };

  const setDefault = async (id: string) => {
    await api.providers.update(id, { isDefault: true });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this provider?')) return;
    await api.providers.delete(id);
    load();
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="max-w-3xl p-8">
          <h1 className="mb-2 text-2xl font-bold">AI Provider Settings</h1>
          <p className="mb-8 text-sm text-slate-400">
            Configure OpenAI-compatible endpoints. API keys are stored per-user
            and never committed to source control.
          </p>

          <div className="mb-6">
            <h2 className="mb-3 text-sm font-medium text-slate-300">
              Quick Presets
            </h2>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => applyPreset(preset)}
                  className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:border-indigo-500 hover:text-indigo-300"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="mb-6 flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            <Plus className="h-4 w-4" />
            Add Provider
          </button>

          {showForm && (
            <form
              onSubmit={create}
              className="mb-8 space-y-4 rounded-xl border border-slate-800 bg-slate-900 p-6"
            >
              <input
                placeholder="Provider name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm outline-none focus:border-indigo-500"
              />
              <input
                placeholder="Base URL (e.g. https://api.openai.com/v1)"
                value={form.baseUrl}
                onChange={(e) => setForm({ ...form, baseUrl: e.target.value })}
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm outline-none focus:border-indigo-500"
              />
              <input
                placeholder="API Key (optional for local models)"
                value={form.apiKey}
                onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
                type="password"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm outline-none focus:border-indigo-500"
              />
              <input
                placeholder="Model name"
                value={form.modelName}
                onChange={(e) =>
                  setForm({ ...form, modelName: e.target.value })
                }
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm outline-none focus:border-indigo-500"
              />
              <label className="flex items-center gap-2 text-sm text-slate-400">
                <input
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={(e) =>
                    setForm({ ...form, isDefault: e.target.checked })
                  }
                />
                Set as default provider
              </label>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-500"
                >
                  Save
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

          <div className="space-y-3">
            {providers.map((provider) => (
              <div
                key={provider.id}
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 p-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{provider.name}</p>
                    {provider.isDefault && (
                      <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-xs text-indigo-300">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="font-mono text-xs text-slate-500">
                    {provider.baseUrl} / {provider.modelName}
                  </p>
                </div>
                <div className="flex gap-2">
                  {!provider.isDefault && (
                    <button
                      onClick={() => setDefault(provider.id)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-amber-400"
                      title="Set as default"
                    >
                      <Star className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => remove(provider.id)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            {providers.length === 0 && (
              <p className="text-center text-sm text-slate-500">
                No providers configured. Add one to run reviews.
              </p>
            )}
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
