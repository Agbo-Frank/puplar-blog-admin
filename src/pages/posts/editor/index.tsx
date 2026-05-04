import { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import { Ic } from '../../../components/icons';
import { StatusPill } from '../../../components/material';
import { DASH_POSTS, STATUS_META } from '../../../data/admin';
import type { PostStatus, HistoryEntry } from '../../../types/admin';
import { EditorCanvas } from './editor';
import { DashEditorRail } from './rail';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 5)  return 'just now';
  if (s < 60) return `${s}s ago`;
  return `${Math.floor(s / 60)}m ago`;
}

// ─── Demo content ─────────────────────────────────────────────────────────────

function getInitialContent(id: string | undefined) {
  if (!id) return undefined;

  const map: Record<string, object> = {
    p1: {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'Pricing FX is one of those problems that looks simple at a whiteboard and gets rapidly less simple in production. For most of 2025, our pricing path looked like a fan-out: a request would hit our edge, get sharded across providers, wait for a quorum, then collapse the responses into a single price. It worked. It also took 380 milliseconds at the median.' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'The actor model, briefly' }] },
        { type: 'paragraph', content: [{ type: 'text', text: "An actor is a tiny single-threaded process that owns some state and processes messages from an inbox in order. You can have millions of them. They don't share memory; they pass messages." }] },
        { type: 'blockquote', content: [{ type: 'paragraph', content: [{ type: 'text', text: '"If you find yourself adding a lock, you\'ve already lost. The actor that owns the data should be the one doing the work."' }] }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Why pricing was slow' }] },
        { type: 'codeBlock', content: [{ type: 'text', text: '// Old: fan-out, wait for quorum, collapse\nconst responses = await Promise.all(\n  providers.map(p => p.quote(req))\n);\nconst price = quorum(responses, { min: 3 });\n\n// New: corridor actor owns recent quotes\nconst price = await corridor.send({\n  type: "quote", req, deadline: 80\n});' }] },
        { type: 'paragraph', content: [{ type: 'text', text: "Most of the latency wasn't in the pricing itself — it was in the network fan-out, and in waiting for the slowest provider in our quorum. Once each corridor actor had warm, recent quotes for its top providers, we could answer most requests from that local cache in a single hop." }] },
      ],
    },
    p2: {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'Last week we shipped programmable holds to all accounts on our Growth and Enterprise tiers. This post explains what they are, how they work, and what you can build with them.' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'What is a hold?' }] },
        { type: 'paragraph', content: [{ type: 'text', text: "A hold is a policy gate on a balance. When you place a hold, the funds are reserved — they count against the account's available balance, but they haven't moved. You can release them, reroute them, or let a policy condition trigger the release automatically." }] },
        { type: 'bulletList', content: [
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Pause a payout pending compliance review' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Route funds to a different destination if criteria are met' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Release automatically on a schedule or webhook trigger' }] }] },
        ]},
      ],
    },
    p3: {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: "Sendwave Africa runs a lean ops team. Three people, $2.3B in annual payout volume, across 11 corridors. When they came to Puplar, they had a different problem than most of our customers: they didn't need more features. They needed fewer moving parts." }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'The setup' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'The foundation is a set of virtual accounts — one per corridor, denominated in the local send currency. Each account has a policy attached that handles FX, compliance screening, and payout routing automatically.' }] },
        { type: 'blockquote', content: [{ type: 'paragraph', content: [{ type: 'text', text: '"We went from a 14-step manual reconciliation process to a single API call. The ops team now spends their time on edge cases, not routine volume."' }] }] },
      ],
    },
    p4: {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'Q1 2026 saw record volume across the Puplar network. We processed $4.1B in cross-border payments, up 38% year-over-year, across 47 currency corridors. Here is what the data shows.' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Volume by corridor' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'The USD→NGN corridor alone accounted for 22% of total volume, making it our single largest corridor for the third consecutive quarter. EUR→GHS and GBP→KES rounded out the top three.' }] },
      ],
    },
    p5: {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: "Idempotency sounds simple: give an operation a key, and if you see the same key twice, don't do the work twice. In practice, it's one of the hardest properties to get right at scale." }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'The contract' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'Every write operation in the Puplar API accepts an Idempotency-Key header. If we receive the same key for the same operation within 24 hours, we return the original response — without re-executing the operation.' }] },
        { type: 'codeBlock', content: [{ type: 'text', text: 'POST /v1/payouts\nIdempotency-Key: pay_01HXYZ\nContent-Type: application/json\n\n{ "amount": 10000, "currency": "NGN", "destination": "acc_abc" }' }] },
      ],
    },
    p6: {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'In this guide we will build a multi-currency wallet from scratch using the Puplar API. By the end you will have a working sandbox integration with accounts, balances, FX conversion, and webhook delivery.' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Prerequisites' }] },
        { type: 'bulletList', content: [
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'A Puplar sandbox account (sign up at dashboard.puplar.com)' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Node.js 18+ or Python 3.10+' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Basic familiarity with REST APIs' }] }] },
        ]},
      ],
    },
    p7: {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'Today we are announcing our $48M Series B, led by Index Ventures with participation from Accel, Firstmark, and our existing investors. This brings our total raised to $63M.' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: "What we're building" }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'Puplar is infrastructure for cross-border money movement. We provide the accounts, FX, compliance, and payout rails that businesses need to move money across borders — without building and maintaining that infrastructure themselves.' }] },
      ],
    },
    p8: {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'Finance teams have been asking for better reconciliation tooling since we launched. Today we are shipping a new reconciliation experience: faster, more flexible, and with a new Parquet export format that works directly with your data warehouse.' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: "What's new" }] },
        { type: 'bulletList', content: [
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Streaming Parquet export — process multi-million row reports without loading into memory' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Cross-entity joins — reconcile across multiple virtual accounts in a single report' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: '10× faster UI — reports that took 45 seconds now load in under 3' }] }] },
        ]},
      ],
    },
    p9: {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: "Async-first webhook delivery is table stakes. Every serious payments API does it. But we kept running into cases where async wasn't enough — where the caller needed to know, synchronously, that the webhook had been received and processed before they could proceed." }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'The use case' }] },
        { type: 'paragraph', content: [{ type: 'text', text: "The most common pattern: a payment is created, a webhook fires to the merchant's system, and the merchant's system needs to update its own database before returning a response to the end user. With async delivery, there's a race condition." }] },
      ],
    },
  };

  const post = DASH_POSTS.find((p) => p.id === id);
  if (!post) return undefined;
  return map[id] ?? {
    type: 'doc',
    content: [{ type: 'paragraph', content: [{ type: 'text', text: `${post.title} — start writing here.` }] }],
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const post  = id ? DASH_POSTS.find((p) => p.id === id) : null;
  const isNew = !id;

  // Tick incremented on every TipTap update — drives word count + auto-save
  const [tick, setTick] = useState(0);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Write something, or type / to insert a block…' }),
      Image.configure({ inline: false, allowBase64: true }),
    ],
    content: getInitialContent(id) as object | undefined,
    editorProps: { attributes: { class: 'outline-none' } },
    onUpdate: () => setTick((t) => t + 1),
  });

  const [title,    setTitle]    = useState(post?.title ?? '');
  const [excerpt,  setExcerpt]  = useState('');
  const [status,   setStatus]   = useState<PostStatus>(post?.status ?? 'draft');
  const [category, setCategory] = useState(post?.cat ?? 'Engineering');
  const [tags,     setTags]     = useState<string[]>(post?.tags ?? []);
  const [slug,     setSlug]     = useState(id ?? '');
  const [meta,     setMeta]     = useState(post?.title ?? '');
  const [savedAt,     setSavedAt]     = useState<number | null>(isNew ? null : Date.now());
  const [version,     setVersion]     = useState(1);
  const [scheduledAt, setScheduledAt] = useState(post?.scheduled ?? '');
  const [, setTimeTick]         = useState(0);  // drives timeAgo re-renders
  const [history,  setHistory]  = useState<HistoryEntry[]>(() =>
    post
      ? [{ who: post.editedBy, action: 'Last edited', t: post.editedAt }, { who: post.editedBy, action: 'Created draft', t: '—' }]
      : [{ who: 'You', action: 'Created draft', t: 'just now' }]
  );

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-save: 2s debounce after any content change
  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      setSavedAt(Date.now());
      setVersion((v) => v + 1);
    }, 2000);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [tick, title, excerpt, status]);

  // Re-render "Saved Xs ago" every 10s
  useEffect(() => {
    const id = setInterval(() => setTimeTick((t) => t + 1), 10_000);
    return () => clearInterval(id);
  }, []);

  // Auto-slugify title for new posts
  useEffect(() => {
    if (isNew) setSlug(slugify(title));
  }, [title, isNew]);

  // Word count across title + excerpt + editor body
  const wordCount = useMemo(() => {
    const text = [title, excerpt, editor?.getText() ?? ''].join(' ').trim();
    return text ? text.split(/\s+/).length : 0;
  }, [tick, title, excerpt]);

  function handleStatusChange(s: PostStatus) {
    setStatus(s);
    setHistory((prev) => [
      { who: 'You', action: `Set to ${STATUS_META[s].label}`, t: 'just now' },
      ...prev.slice(0, 4),
    ]);
  }

  const displayTitle = title || (isNew ? 'New post' : 'Untitled');
  const saveLabel = savedAt ? `Saved ${timeAgo(savedAt)} · v${version}` : 'Unsaved';

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
          <button className="text-[12px] text-stone-700 border border-stone-200 rounded-md px-2.5 py-1 hover:bg-stone-50 transition">
            Preview
          </button>
          <button
            onClick={() => handleStatusChange('review')}
            className="text-[12px] text-stone-700 border border-stone-200 rounded-md px-2.5 py-1 hover:bg-stone-50 transition"
          >
            Request review
          </button>
          <button
            onClick={() => handleStatusChange('published')}
            className="text-[12px] font-semibold text-white bg-puplar-700 rounded-md px-3 py-1 inline-flex items-center gap-1 hover:bg-puplar-900 transition"
          >
            <Ic.Bolt className="w-3 h-3" /> Publish
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        <EditorCanvas
          editor={editor}
          title={title}
          excerpt={excerpt}
          category={category}
          status={status}
          onTitleChange={setTitle}
          onExcerptChange={setExcerpt}
        />
        <DashEditorRail
          status={status}
          category={category}
          tags={tags}
          slug={slug}
          meta={meta}
          scheduledAt={scheduledAt}
          history={history}
          onStatusChange={handleStatusChange}
          onCategoryChange={setCategory}
          onTagsChange={setTags}
          onSlugChange={setSlug}
          onMetaChange={setMeta}
          onScheduledAtChange={setScheduledAt}
        />
      </div>

    </div>
  );
}
