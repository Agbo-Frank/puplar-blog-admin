import { useState, useEffect } from 'react';
import { DashTopBar } from '../../components/layout/top-bar';
import { Button } from '../../components/material';
import { useApi, useMutation } from '@/hooks/use-api';
import { useStore } from '@/hooks/use-store';
import { endpoints } from '@/api/endpoints';
import type { IAuthor, UpdateAuthorPayload } from '@/api/types';

export default function SettingsPage() {
  const { data: authorRes, isLoading } = useApi<IAuthor>(endpoints.authorMe);
  const author = authorRes?.data ?? null;

  const { setAuthorName } = useStore();
  const [name, setName] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (author?.name) {
      setName(author.name);
      setAuthorName(author.name);
    }
  }, [author, setAuthorName]);

  const { trigger: updateAuthor, isLoading: saving } = useMutation<IAuthor, UpdateAuthorPayload>(
    endpoints.authorMe,
    {
      method: 'PATCH',
      onSuccess: (res) => {
        if (res?.data?.name) setAuthorName(res.data.name);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      },
    }
  );

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await updateAuthor({ name: name.trim() });
  }

  return (
    <div className="flex-1 flex flex-col bg-stone-50 min-h-0 overflow-hidden">
      <DashTopBar breadcrumbs={['Settings']} />

      <div className="px-8 pt-7 pb-5 max-w-[600px]">
        <h1 className="font-display font-bold text-[26px] tracking-[-0.02em] text-stone-900 leading-tight mb-1">
          Settings
        </h1>
        <p className="text-[13px] text-stone-500 mb-8">Manage your author profile.</p>

        <div className="bg-white border border-stone-200 rounded-lg p-6">
          <div className="text-[10px] font-mono uppercase tracking-[0.1em] text-stone-500 mb-4">
            Author profile
          </div>

          {isLoading ? (
            <div className="text-[13px] text-stone-400">Loading…</div>
          ) : (
            <form onSubmit={(e) => void handleSave(e)} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[12px] text-stone-600 font-medium">Display name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  maxLength={100}
                  className="text-[13px] border border-stone-200 rounded-md px-3 py-2 bg-white focus:outline-none focus:border-puplar-700 transition w-full"
                />
                <p className="text-[11px] text-stone-400">
                  This name appears in post edit history and bylines.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  type="submit"
                  disabled={saving || !name.trim()}
                  loading={saving}
                  className="text-[13px] px-4 py-1.5 rounded-md"
                >
                  {saving ? 'Saving…' : 'Save changes'}
                </Button>
                {saved && (
                  <span className="text-[12px] text-emerald-600">Saved!</span>
                )}
              </div>
            </form>
          )}
        </div>

        {/* Access level info */}
        {author && (
          <div className="bg-white border border-stone-200 rounded-lg p-6 mt-4">
            <div className="text-[10px] font-mono uppercase tracking-[0.1em] text-stone-500 mb-4">
              Access
            </div>
            <div className="flex flex-col gap-2 text-[13px]">
              <div className="flex items-center justify-between">
                <span className="text-stone-500">Access level</span>
                <span className="font-medium text-stone-800 capitalize">{author.access_level}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-500">Posts authored</span>
                <span className="font-mono text-stone-800">{author.post_count}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
