import { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import { Ic } from '../../../components/icons';
import { Button, StatusPill } from '../../../components/material';
import { useApi, useCategories, useMutation } from '@/hooks/use-api';
import { endpoints } from '@/api/endpoints';
import type {
  IPost,
  PostStatus,
  IEditHistoryEntry,
  CreatePostPayload,
  UpdatePostPayload,
  TransitionStatusPayload,
} from '@/api/types';
import { EditorCanvas } from './editor';
import { DashEditorRail } from './rail';

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 5) return 'just now';
  if (s < 60) return `${s}s ago`;
  return `${Math.floor(s / 60)}m ago`;
}


export default function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id;

  const { data: postRes, isLoading: postLoading } = useApi<IPost>(
    id ? endpoints.postDetails : null,
    { pathParams: id ? { id } : undefined }
  );
  const loadedPost = postRes?.data ?? null;

  const [tick, setTick] = useState(0);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Write something, or type / to insert a block…' }),
      Image.configure({ inline: false, allowBase64: true }),
    ],
    content: undefined,
    editorProps: { attributes: { class: 'outline-none' } },
    onUpdate: () => setTick((t) => t + 1),
  });

  // ── Form state ────────────────────────────────────────────────────────────

  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [status, setStatus] = useState<PostStatus>('draft');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [slug, setSlug] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [postId, setPostId] = useState(id ?? '');

  const { categories } = useCategories();

  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [version, setVersion] = useState(1);
  const [, setTimeTick] = useState(0);

  // dataReady: false for existing posts until seeded, true immediately for new
  const [dataReady, setDataReady] = useState(isNew);

  // Prevents auto-save from firing right after seeding from the API response
  const suppressAutoSave = useRef(false);
  const seeded = useRef(false);

  useEffect(() => {
    if (!loadedPost || !editor || seeded.current) return;
    seeded.current = true;
    suppressAutoSave.current = true;

    editor.commands.setContent(loadedPost.content as object);
    setTitle(loadedPost.title);
    setExcerpt(loadedPost.excerpt);
    setStatus(loadedPost.status);
    setCategory(loadedPost.category);
    setTags(loadedPost.tags);
    setSlug(loadedPost.slug);
    if (loadedPost.scheduled_at) setScheduledAt(loadedPost.scheduled_at.slice(0, 16));
    setSavedAt(Date.now());
    setDataReady(true); // ← triggers EditorCanvas to remount with correct initial values
  }, [loadedPost, editor]);

  // ── Auto-slugify title for new posts ──────────────────────────────────────

  useEffect(() => {
    if (isNew) setSlug(slugify(title));
  }, [title, isNew]);

  // ── Re-render "Saved Xs ago" every 10s ────────────────────────────────────

  useEffect(() => {
    const timer = setInterval(() => setTimeTick((t) => t + 1), 10_000);
    return () => clearInterval(timer);
  }, []);

  // ── Word count ────────────────────────────────────────────────────────────

  const wordCount = useMemo(() => {
    const text = [title, excerpt, editor?.getText() ?? ''].join(' ').trim();
    return text ? text.split(/\s+/).length : 0;
  }, [tick, title, excerpt]);

  // ── Mutations ─────────────────────────────────────────────────────────────

  const { trigger: createPost, isLoading: creating } = useMutation<IPost, CreatePostPayload>(
    endpoints.posts,
    {
      onSuccess: (res) => {
        if (res?.data) {
          const newId = res.data._id;
          setPostId(newId);
          setStatus(res.data.status);
          setSavedAt(Date.now());
          setVersion(1);
          navigate(`/posts/${newId}`, { replace: true });
        }
      },
    }
  );

  const { trigger: updatePost, isLoading: updating } = useMutation<IPost, UpdatePostPayload>(
    endpoints.postDetails,
    {
      method: 'PUT',
      onSuccess: () => {
        setSavedAt(Date.now());
        setVersion((v) => v + 1);
      },
    }
  );

  const { trigger: transitionStatus, isLoading: transitioning } = useMutation<IPost, TransitionStatusPayload>(
    endpoints.postStatus,
    {
      method: 'PATCH',
      onSuccess: (res) => {
        if (res?.data) setStatus(res.data.status);
      },
    }
  );

  const saving = creating || updating;

  // ── Save ──────────────────────────────────────────────────────────────────

  function buildPayload() {
    return {
      title,
      content: editor?.getJSON() as Record<string, unknown>,
      excerpt: excerpt || undefined,
      category,
      tags,
      slug: slug || undefined,
    };
  }

  async function savePost() {
    if (!title.trim() || !category) return;
    const payload = buildPayload();

    if (!postId) {
      await createPost(payload as CreatePostPayload);
    } else {
      await updatePost(payload as UpdatePostPayload, { id: postId });
    }
  }

  // Auto-save — only fires when post already exists and user has actually changed something
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!postId || !title.trim()) return;

    // Skip the fire triggered by seeding state from the API response
    if (suppressAutoSave.current) {
      suppressAutoSave.current = false;
      return;
    }

    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => { void savePost(); }, 2000);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, title, excerpt, category, tags, slug]);

  async function handleStatusChange(s: PostStatus) {
    const currentId = postId;
    if (!currentId) {
      await savePost();
      return;
    }
    const payload: TransitionStatusPayload = {
      status: s,
      ...(s === 'scheduled' && scheduledAt ? { scheduled_at: new Date(scheduledAt).toISOString() } : {}),
    };
    await transitionStatus(payload, { id: currentId });
  }


  const displayTitle = title || (isNew ? 'New post' : 'Untitled');
  const saveLabel = saving
    ? 'Saving…'
    : savedAt
      ? `Saved ${timeAgo(savedAt)} · v${version}`
      : isNew
        ? 'Unsaved'
        : '';

  const history: IEditHistoryEntry[] = loadedPost?.edit_history ?? [];

  if (!isNew && postLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white text-[13px] text-stone-400">
        Loading post…
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-white">

      {/* ── Subnav ── */}
      <div className="h-12 border-b border-stone-200 px-6 flex items-center justify-between text-[13px] shrink-0">
        <div className="flex items-center gap-3 text-stone-500 min-w-0">
          <Link to="/posts" className="hover:text-stone-900 transition shrink-0">Posts</Link>
          <Ic.Chevron className="w-3.5 h-3.5 shrink-0" />
          <span className="text-stone-900 font-semibold truncate max-w-[300px]">
            {displayTitle.length > 50 ? displayTitle.slice(0, 50) + '…' : displayTitle}
          </span>
          <span className="text-[11px] text-stone-400 font-mono shrink-0">{saveLabel}</span>
          <span className="text-[11px] text-stone-400 font-mono shrink-0">{wordCount} words</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StatusPill status={status} size="sm" />
          {isNew && (
            <button
              onClick={() => void savePost()}
              disabled={saving || !title.trim() || !category}
              className="text-[12px] text-stone-700 border border-stone-200 rounded-md px-2.5 py-1 hover:bg-stone-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {creating ? 'Saving…' : 'Save draft'}
            </button>
          )}
          <Button
            disabled={transitioning || (!postId && (!title.trim() || !category))}
            onClick={() => void handleStatusChange('published')}
            loading={transitioning}
            className='text-[12px] px-2.5 py-1 rounded-md text-stone-700 border-stone-200 hover:bg-stone-50 transition disabled:opacity-40 disabled:cursor-not-allowed'
            variant='secondary'
          >
            Request review
          </Button>
          <Button
            disabled={transitioning || (!postId && (!title.trim() || !category))}
            onClick={() => void handleStatusChange('published')}
            loading={transitioning}
            className='text-[12px] px-3 py-1 rounded-md'
          >
            <Ic.Bolt className="w-3 h-3" /> Request review
          </Button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/*
          key="seeded" forces EditorCanvas to remount once dataReady flips true,
          so the contentEditable "seed once" refs fire with the correct initial values.
        */}
        <EditorCanvas
          key={dataReady ? 'seeded' : 'pending'}
          editor={editor}
          title={title}
          excerpt={excerpt}
          category={categories?.find((c) => c._id === category)?.name ?? ''}
          status={status}
          onTitleChange={setTitle}
          onExcerptChange={setExcerpt}
        />
        <DashEditorRail
          status={status}
          category={category}
          tags={tags}
          slug={slug}
          scheduledAt={scheduledAt}
          history={history}
          onStatusChange={(s) => void handleStatusChange(s)}
          onCategoryChange={setCategory}
          onTagsChange={setTags}
          onSlugChange={setSlug}
          onScheduledAtChange={setScheduledAt}
        />
      </div>

    </div>
  );
}
