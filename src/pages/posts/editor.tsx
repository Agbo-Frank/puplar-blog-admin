import { useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Ic } from '../../components/icons';
import { StatusPill, Avatar } from '../../components/material';
import { DASH_POSTS } from '../../data/admin';


type BlockType = 'p' | 'h2' | 'quote' | 'code' | 'image';

interface BlockRowProps {
  type: BlockType;
  children?: ReactNode;
  placeholder?: boolean;
  onClick?: () => void;
}

function BlockRow({ type, children, placeholder, onClick }: BlockRowProps) {
  const cls: Record<BlockType, string> = {
    p: 'text-[16px] text-stone-800 leading-[1.65]',
    h2: 'font-display font-bold text-[28px] tracking-[-0.025em] text-stone-900 mt-6 leading-tight',
    quote: 'border-l-2 border-puplar-700 pl-4 italic font-display text-[20px] text-stone-700 leading-[1.5]',
    code: 'bg-stone-900 text-stone-100 font-mono text-[12.5px] rounded-md p-4 leading-[1.6] whitespace-pre',
    image: '',
  };

  return (
    <div className="group relative flex items-start gap-1 -ml-10 pl-10" onClick={onClick}>
      <div className="absolute left-0 top-1 opacity-0 group-hover:opacity-100 flex gap-0.5 transition">
        <button className="text-stone-400 hover:bg-stone-100 rounded p-0.5">
          <Ic.Plus className="w-3.5 h-3.5" />
        </button>
        <button className="text-stone-400 hover:bg-stone-100 rounded p-0.5 cursor-grab">
          <Ic.Drag className="w-3.5 h-3.5" />
        </button>
      </div>
      {type === 'image' ? (
        <div
          className="w-full h-[260px] rounded-lg mb-2.5 flex items-end p-3"
          style={{ background: 'hsl(192 60% 88%)' }}
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-stone-600/60">
            IMG · hero · drop image
          </span>
        </div>
      ) : (
        <div
          className={`flex-1 outline-none ${cls[type]} ${placeholder ? 'text-stone-400 cursor-text' : ''}`}
          contentEditable={true}
          suppressContentEditableWarning={true}
        >
          {children}
        </div>
      )}
    </div>
  );
}

interface SlashMenuProps {
  onClose: () => void;
}

function SlashMenu({ onClose }: SlashMenuProps) {
  const items = [
    { i: Ic.H1, t: 'Heading 1', d: 'Big section title' },
    { i: Ic.H2, t: 'Heading 2', d: 'Medium heading' },
    { i: Ic.List, t: 'Bulleted list', d: 'Simple unordered list' },
    { i: Ic.Quote, t: 'Quote', d: 'Pull quote / blockquote' },
    { i: Ic.Code, t: 'Code block', d: 'Syntax-highlighted code' },
    { i: Ic.Image, t: 'Image', d: 'Upload or pick from library' },
    { i: Ic.Doc, t: 'Embed', d: 'Tweets, gists, videos' },
  ];

  return (
    <div className="absolute z-30 bg-white border border-stone-200 rounded-lg shadow-lg w-[280px] py-1.5" style={{ left: 50, marginTop: -10 }}>
      <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.1em] text-stone-500">
        Basic blocks
      </div>
      {items.map((it) => {
        const I = it.i;
        return (
          <button
            key={it.t}
            onClick={onClose}
            className="w-full flex items-start gap-2.5 px-3 py-2 hover:bg-stone-50 text-left"
          >
            <div className="w-7 h-7 rounded border border-stone-200 grid place-items-center text-stone-700 shrink-0">
              <I className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-[13px] font-semibold text-stone-900">{it.t}</div>
              <div className="text-[11px] text-stone-500">{it.d}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

interface SectionProps { title: string; children: ReactNode; }
function Section({ title, children }: SectionProps) {
  return (
    <div>
      <div className="text-[10px] font-mono uppercase tracking-[0.1em] text-stone-500 mb-2.5">{title}</div>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

interface FieldProps { label: string; children: ReactNode; col?: boolean; }
function Field({ label, children, col }: FieldProps) {
  return (
    <div className={col ? 'flex flex-col gap-1' : 'flex items-center justify-between gap-2'}>
      <span className="text-[12px] text-stone-500">{label}</span>
      {children}
    </div>
  );
}

function DashEditorRail({ postId }: { postId?: string }) {
  const post = DASH_POSTS.find((p) => p.id === postId);
  const tags = post?.tags.slice(0, 3) ?? ['fx', 'performance', 'actor-model'];

  return (
    <aside className="w-[300px] border-l border-stone-200 bg-stone-50/60 overflow-y-auto shrink-0">
      <div className="p-5 flex flex-col gap-6">
        <Section title="Publish">
          <Field label="Status">
            <StatusPill status={post?.status ?? 'draft'} size="sm" />
          </Field>
          <Field label="Visibility">
            <span className="text-[12.5px] text-stone-700">Public</span>
          </Field>
          <Field label="Schedule">
            <span className="text-[12.5px] text-violet-700 inline-flex items-center gap-1">
              <Ic.Calendar className="w-3 h-3" /> Set date…
            </span>
          </Field>
        </Section>

        <Section title="Organize">
          <Field label="Category">
            <select className="text-[12.5px] border border-stone-200 rounded px-2 py-1 bg-white">
              <option>{post?.cat ?? 'Engineering'}</option>
              <option>Product</option>
              <option>Customer</option>
              <option>Tutorial</option>
            </select>
          </Field>
          <Field label="Tags" col>
            <div className="flex flex-wrap gap-1 mt-1">
              {tags.map((t) => (
                <span key={t} className="inline-flex items-center gap-1 text-[11px] bg-white border border-stone-200 rounded-full px-2 py-0.5 text-stone-700">
                  #{t}
                  <button className="text-stone-400 hover:text-stone-700">
                    <Ic.X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
              <button className="text-[11px] text-stone-500 border border-dashed border-stone-300 rounded-full px-2 py-0.5 hover:bg-white transition">
                + Add
              </button>
            </div>
          </Field>
        </Section>

        <Section title="SEO">
          <Field label="Slug" col>
            <input
              defaultValue={post ? post.id : 'untitled'}
              className="text-[12px] font-mono border border-stone-200 rounded px-2 py-1 bg-white w-full"
            />
          </Field>
          <Field label="Meta description" col>
            <textarea
              className="text-[12px] border border-stone-200 rounded px-2 py-1 bg-white w-full h-16 resize-none"
              defaultValue={post ? post.title : ''}
            />
            <div className="text-[10px] text-stone-400 mt-1 font-mono">
              {(post?.title?.length ?? 0)} / 160
            </div>
          </Field>
        </Section>

        <Section title="History">
          {[
            { who: 'Tomás R.', w: 'Edited body', t: '2s ago' },
            { who: 'Priya B.', w: 'Added review note', t: '8h ago' },
            { who: 'Tomás R.', w: 'Created draft', t: '2d ago' },
          ].map((h, i) => (
            <div key={i} className="flex items-center gap-2 text-[12px]">
              <Avatar name={h.who} size={18} />
              <span className="text-stone-700 font-medium">{h.who}</span>
              <span className="text-stone-500">{h.w}</span>
              <span className="text-stone-400 ml-auto shrink-0">{h.t}</span>
            </div>
          ))}
        </Section>
      </div>
    </aside>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const [showSlash, setShowSlash] = useState(false);

  const post = id ? DASH_POSTS.find((p) => p.id === id) : null;
  const isNew = !id;

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-white">
      {/* Subnav */}
      <div className="h-12 border-b border-stone-200 px-6 flex items-center justify-between text-[13px] shrink-0">
        <div className="flex items-center gap-3 text-stone-500">
          <Link to="/posts" className="hover:text-stone-900 transition">Posts</Link>
          <Ic.Chevron className="w-3.5 h-3.5" />
          <span className="text-stone-900 font-semibold">
            {post ? post.title.slice(0, 48) + (post.title.length > 48 ? '…' : '') : 'New post'}
          </span>
          {!isNew && (
            <span className="text-[11px] text-stone-400 ml-2">Saved 2s ago · v1</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <StatusPill status={post?.status ?? 'draft'} size="sm" />
          <button className="text-[12px] text-stone-700 border border-stone-200 rounded-md px-2.5 py-1 hover:bg-stone-50 transition">
            Preview
          </button>
          <button className="text-[12px] text-stone-700 border border-stone-200 rounded-md px-2.5 py-1 hover:bg-stone-50 transition">
            Request review
          </button>
          <button className="text-[12px] font-semibold text-white bg-puplar-700 rounded-md px-3 py-1 inline-flex items-center gap-1 hover:bg-puplar-900 transition">
            <Ic.Bolt className="w-3 h-3" /> Publish
          </button>
        </div>
      </div>

      {/* Editor + Rail */}
      <div className="flex-1 flex min-h-0">
        {/* Editor content */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-[720px] mx-auto px-8 py-12">
              <div className="text-[12px] font-mono uppercase tracking-[0.1em] text-stone-500 mb-3">
                {post?.cat ?? 'Engineering'} · {post ? (post.status === 'published' ? 'Published' : post.status === 'draft' ? 'Draft' : post.status) : 'Draft'}
              </div>

              <h1
                className="font-display font-bold text-[44px] leading-[1.05] tracking-[-0.03em] text-stone-900 m-0 outline-none"
                contentEditable={true}
                suppressContentEditableWarning={true}
              >
                {post?.title ?? 'Untitled post'}
              </h1>

              <p
                className="text-[18px] text-stone-500 mt-4 leading-[1.45] outline-none"
                contentEditable={true}
                suppressContentEditableWarning={true}
              >
                {isNew
                  ? 'Write a brief excerpt for this post…'
                  : 'Rebuilding our pricing path on a single in-process actor model, and what we learned in the process.'}
              </p>

              <div className="mt-12 flex flex-col gap-3">
                <BlockRow type="p">
                  Pricing FX is one of those problems that looks simple at a whiteboard and gets rapidly less simple in production. For most of 2025, our pricing path looked like a fan-out.
                </BlockRow>
                <BlockRow type="h2">The actor model, briefly</BlockRow>
                <BlockRow type="p">
                  An actor is a tiny single-threaded process that owns some state and processes messages from an inbox in order. You can have millions of them. They don't share memory; they pass messages.
                </BlockRow>
                <BlockRow type="quote">
                  "If you find yourself adding a lock, you've already lost. The actor that owns the data should be the one doing the work."
                </BlockRow>
                <BlockRow type="image" />
                <BlockRow type="code">
                  {`const price = await corridor.send({
  type: "quote", req, deadline: 80
});`}
                </BlockRow>
                <div className="relative">
                  <BlockRow type="p" placeholder onClick={() => setShowSlash(true)}>
                    Type / for blocks…
                  </BlockRow>
                  {showSlash && <SlashMenu onClose={() => setShowSlash(false)} />}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right rail */}
        <DashEditorRail postId={id} />
      </div>
    </div>
  );
}
