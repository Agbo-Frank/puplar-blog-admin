// Posts list — Kanban view by status.

function DashPostsKanban() {
  const cols = [
    { id: "draft",     label: "Draft" },
    { id: "review",    label: "In review" },
    { id: "scheduled", label: "Scheduled" },
    { id: "published", label: "Published" },
  ];

  return (
    <div className="flex-1 flex flex-col bg-stone-50 min-h-0">
      <div className="px-8 pt-7 pb-5 flex items-end justify-between">
        <div>
          <h1 className="font-display font-bold text-[26px] tracking-[-0.02em] text-stone-900 m-0">Posts</h1>
          <p className="text-[13px] text-stone-500 mt-1">Drag to move between stages.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-white border border-stone-200 rounded-md flex p-0.5 text-[12px]">
            <button className="px-2.5 py-1 text-stone-500 rounded">Table</button>
            <button className="px-2.5 py-1 bg-stone-100 text-stone-900 rounded font-semibold">Kanban</button>
          </div>
          <button className="text-[13px] font-semibold text-white bg-puplar-700 rounded-md px-3.5 py-1.5 inline-flex items-center gap-1.5">
            <Ic.Plus className="w-3.5 h-3.5" /> New post
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden px-8 pb-8">
        <div className="grid grid-cols-4 gap-4 min-w-[1100px] h-full">
          {cols.map((c) => {
            const items = DASH_POSTS.filter((p) => p.status === c.id);
            return (
              <div key={c.id} className="bg-stone-100/70 border border-stone-200 rounded-lg flex flex-col min-h-0">
                <div className="px-3 py-2.5 flex items-center justify-between border-b border-stone-200">
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${STATUS_META[c.id].dot}`} />
                    <span className="text-[12px] font-semibold uppercase tracking-[0.06em] text-stone-700">{c.label}</span>
                    <span className="text-[11px] font-mono text-stone-500">{items.length}</span>
                  </div>
                  <button className="text-stone-400 hover:text-stone-700"><Ic.Plus className="w-3.5 h-3.5" /></button>
                </div>
                <div className="flex-1 p-2 flex flex-col gap-2 overflow-y-auto">
                  {items.map((p) => (
                    <div key={p.id} className="bg-white rounded-md border border-stone-200 p-3 cursor-grab hover:border-stone-300">
                      <div className="w-full h-16 rounded mb-2.5" style={{ background: `hsl(${(p.id.charCodeAt(1) * 50) % 360} 60% 88%)` }} />
                      <div className="text-[11px] font-mono uppercase tracking-[0.06em] text-stone-500 mb-1">{p.cat}</div>
                      <div className="text-[13px] font-semibold text-stone-900 leading-snug text-pretty">{p.title}</div>
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {p.tags.slice(0, 2).map((t) => (
                          <span key={t} className="text-[10px] text-stone-500 bg-stone-100 rounded px-1.5 py-0.5">#{t}</span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-stone-100">
                        <div className="flex items-center gap-1.5">
                          <Avatar name={p.editedBy} size={18} />
                          <span className="text-[11px] text-stone-500">{p.editedAt}</span>
                        </div>
                        <span className="text-[11px] text-stone-500 font-mono">{p.words.toLocaleString()}w</span>
                      </div>
                      {p.scheduled && (
                        <div className="mt-2 text-[11px] text-violet-700 inline-flex items-center gap-1">
                          <Ic.Calendar className="w-3 h-3" /> {p.scheduled}
                        </div>
                      )}
                    </div>
                  ))}
                  {items.length === 0 && (
                    <div className="text-[12px] text-stone-400 text-center py-8 border border-dashed border-stone-200 rounded">No posts</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

window.DashPostsKanban = DashPostsKanban;
