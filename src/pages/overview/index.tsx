import { useState } from 'react';
import { DashTopBar } from '../../components/layout/top-bar';
import { DASH_POSTS } from '../../data/admin';

const PERIODS = ['7d', '30d', '90d', 'All'];

function Sparkline() {
  const pts = [12, 18, 14, 22, 28, 24, 32, 30, 38, 34, 42, 40, 48, 46, 52, 50, 58, 54, 62, 68, 60, 70, 74, 72, 80, 78, 84, 88, 92, 96];
  const ppts = pts.map((v) => v * 0.78 - 4);
  const W = 640, H = 180;
  const toPath = (arr: number[]) =>
    arr.map((v, i) => `${i === 0 ? 'M' : 'L'} ${(i / (arr.length - 1)) * W} ${H - (v / 100) * (H - 10)}`).join(' ');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[180px]">
      <defs>
        <linearGradient id="grad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#005a6e" stopOpacity=".18" />
          <stop offset="100%" stopColor="#005a6e" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1="0" x2={W} y1={(H / 4) * i} y2={(H / 4) * i} stroke="#f5f5f4" />
      ))}
      <path d={`${toPath(pts)} L ${W} ${H} L 0 ${H} Z`} fill="url(#grad)" />
      <path d={toPath(ppts)} stroke="#d6d3d1" strokeWidth="1.5" fill="none" strokeDasharray="3 3" />
      <path d={toPath(pts)} stroke="#005a6e" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function OverviewPage() {
  const [period, setPeriod] = useState('30d');
  const top = DASH_POSTS.filter((p) => p.status === 'published').slice(0, 5);
  const maxViews = Math.max(
    ...top.map((p) => parseFloat(p.views) * (p.views.includes('k') ? 1000 : 1) || 1)
  );

  const stats = [
    { k: 'Total views', v: '284k', d: '+18% MoM', color: 'text-emerald-700' },
    { k: 'Avg read time', v: '4:12', d: '+0:21', color: 'text-emerald-700' },
    { k: 'Subscribers', v: '9,142', d: '+312 / mo', color: 'text-stone-900' },
    { k: 'Bounce', v: '31%', d: '-2.3pp', color: 'text-emerald-700' },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <DashTopBar title="Overview" />
      <div className="flex-1 bg-stone-50 overflow-y-auto">
        <div className="px-8 pt-7 pb-8">
          {/* Header */}
          <div className="flex items-end justify-between mb-5">
            <div>
              <h1 className="font-display font-bold text-[26px] tracking-[-0.02em] text-stone-900 m-0">Overview</h1>
              <p className="text-[13px] text-stone-500 mt-1">Last {period} · all sources</p>
            </div>
            <div className="bg-white border border-stone-200 rounded-md flex p-0.5 text-[12px]">
              {PERIODS.map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-2.5 py-1 rounded transition ${period === p ? 'bg-stone-100 text-stone-900 font-semibold' : 'text-stone-500 hover:text-stone-700'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {stats.map((s) => (
              <div key={s.k} className="bg-white border border-stone-200 rounded-lg px-4 py-3.5">
                <div className="text-[11px] font-mono uppercase tracking-[0.1em] text-stone-500">{s.k}</div>
                <div className={`font-display text-[30px] font-bold tracking-[-0.025em] mt-0.5 leading-none ${s.color}`}>{s.v}</div>
                <div className="text-[12px] text-stone-500 mt-2">{s.d}</div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-3 gap-4">
            {/* Sparkline */}
            <div className="col-span-2 bg-white border border-stone-200 rounded-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-[0.1em] text-stone-500">Views</div>
                  <div className="font-display text-[22px] font-bold tracking-[-0.02em] text-stone-900 leading-none mt-1">
                    12,840{' '}
                    <span className="text-[12px] text-emerald-700 font-body font-medium ml-1">+8.4%</span>
                  </div>
                </div>
                <div className="flex gap-3 text-[11px]">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-puplar-700" /> This period
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-stone-500">
                    <span className="w-2 h-2 rounded-full bg-stone-300" /> Previous
                  </span>
                </div>
              </div>
              <Sparkline />
            </div>

            {/* Top posts */}
            <div className="bg-white border border-stone-200 rounded-lg p-5">
              <div className="text-[11px] font-mono uppercase tracking-[0.1em] text-stone-500 mb-3">Top posts</div>
              <div className="flex flex-col gap-3">
                {top.map((p) => {
                  const v = parseFloat(p.views) * (p.views.includes('k') ? 1000 : 1) || 0;
                  return (
                    <div key={p.id}>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[12.5px] font-medium text-stone-800 truncate">{p.title}</span>
                        <span className="text-[11px] font-mono text-stone-500 shrink-0">{p.views}</span>
                      </div>
                      <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-puplar-700 rounded-full"
                          style={{ width: `${(v / maxViews) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
