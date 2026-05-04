import { DashTopBar } from '../../components/layout/DashTopBar';
import { Ic } from '../../components/icons';
import { DASH_CATEGORIES, DASH_TAGS } from '../../data/admin';

export default function TaxonomyPage() {
  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <DashTopBar title="Categories & Tags" />

      <div className="flex-1 bg-stone-50 overflow-y-auto">
        <div className="px-8 pt-7 pb-8">
          {/* Categories */}
          <div className="flex items-end justify-between mb-5">
            <div>
              <h1 className="font-display font-bold text-[26px] tracking-[-0.02em] text-stone-900 m-0">
                Categories
              </h1>
              <p className="text-[13px] text-stone-500 mt-1">Top-level sections of the blog.</p>
            </div>
            <button className="text-[13px] font-semibold text-white bg-puplar-700 hover:bg-puplar-900 rounded-md px-3 py-1.5 inline-flex items-center gap-1.5 transition">
              <Ic.Plus className="w-3.5 h-3.5" /> New category
            </button>
          </div>

          <div className="bg-white border border-stone-200 rounded-lg overflow-hidden">
            {DASH_CATEGORIES.map((c, i) => (
              <div
                key={c.id}
                className={`flex items-center gap-3 px-4 py-3 ${i ? 'border-t border-stone-100' : ''} hover:bg-stone-50/70 transition`}
              >
                <Ic.Drag className="w-3.5 h-3.5 text-stone-400 cursor-grab" />
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: c.color }} />
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-semibold text-stone-900">{c.name}</div>
                  <div className="text-[11.5px] text-stone-500 font-mono">/blog/{c.id}</div>
                </div>
                <span className="text-[12px] text-stone-500">{c.count} posts</span>
                <button className="text-stone-400 hover:text-stone-700 transition">
                  <Ic.More className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Tags */}
          <div className="mt-8 flex items-end justify-between mb-3">
            <h2 className="font-display font-bold text-[18px] tracking-[-0.015em] text-stone-900 m-0">Tags</h2>
            <button className="text-[12px] text-stone-700 border border-stone-200 bg-white rounded-md px-2.5 py-1 hover:bg-stone-50 transition">
              Manage all
            </button>
          </div>

          <div className="bg-white border border-stone-200 rounded-lg p-4 flex flex-wrap gap-1.5">
            {DASH_TAGS.map((t) => {
              const size = 0.7 + (t.length % 5) * 0.06;
              return (
                <span
                  key={t}
                  className="inline-flex items-center text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-full px-2.5 py-1 cursor-pointer transition"
                  style={{ fontSize: `${11 + size * 4}px` }}
                >
                  #{t}
                  <span className="ml-1.5 text-stone-400 font-mono text-[10px]">
                    {Math.floor(2 + (t.charCodeAt(0) % 13))}
                  </span>
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
