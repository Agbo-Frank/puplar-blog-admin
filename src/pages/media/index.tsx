import { DashTopBar } from '../../components/layout/DashTopBar';
import { Ic } from '../../components/icons';
import { Thumb } from '../../components/material';
import { DASH_MEDIA } from '../../data/admin';

export default function MediaPage() {
  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <DashTopBar title="Media" />

      <div className="flex-1 bg-stone-50 overflow-y-auto">
        <div className="px-8 pt-7 pb-5 flex items-end justify-between">
          <div>
            <h1 className="font-display font-bold text-[26px] tracking-[-0.02em] text-stone-900 m-0">Media</h1>
            <p className="text-[13px] text-stone-500 mt-1">Hero images, diagrams, and assets used across posts.</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="text-[13px] text-stone-700 border border-stone-200 bg-white rounded-md px-3 py-1.5 inline-flex items-center gap-1.5 hover:bg-stone-50 transition">
              <Ic.Folder className="w-3.5 h-3.5" /> New folder
            </button>
            <button className="text-[13px] font-semibold text-white bg-puplar-700 hover:bg-puplar-900 rounded-md px-3.5 py-1.5 inline-flex items-center gap-1.5 transition">
              <Ic.Upload className="w-3.5 h-3.5" /> Upload
            </button>
          </div>
        </div>

        <div className="px-8 pb-8">
          <div className="grid grid-cols-4 gap-4">
            {/* Drop zone */}
            <div className="border-2 border-dashed border-stone-300 rounded-lg bg-white grid place-items-center min-h-[180px] text-center px-4 hover:border-puplar-700 transition cursor-pointer">
              <div>
                <div className="w-10 h-10 mx-auto rounded-full bg-puplar-700/10 grid place-items-center text-puplar-700 mb-2">
                  <Ic.Upload className="w-4 h-4" />
                </div>
                <div className="text-[13px] font-semibold text-stone-900">Drop to upload</div>
                <div className="text-[11px] text-stone-500 mt-0.5">PNG, JPG, SVG, MP4</div>
              </div>
            </div>

            {/* Media cards */}
            {DASH_MEDIA.map((m) => (
              <div
                key={m.id}
                className="bg-white border border-stone-200 rounded-lg overflow-hidden group hover:border-stone-300 hover:shadow-sm transition cursor-pointer"
              >
                <div className="relative">
                  <Thumb hue={m.hue} w="100%" h={140} />
                  <div className="absolute top-2 right-2 text-[10px] font-mono uppercase bg-white/85 backdrop-blur px-1.5 py-0.5 rounded">
                    {m.type}
                  </div>
                  {m.used > 0 && (
                    <div className="absolute bottom-2 left-2 text-[10px] font-mono bg-stone-900/80 text-white px-1.5 py-0.5 rounded">
                      used in {m.used}
                    </div>
                  )}
                </div>
                <div className="p-2.5">
                  <div className="text-[12.5px] font-medium text-stone-900 truncate">{m.name}</div>
                  <div className="text-[11px] text-stone-500 font-mono">
                    {m.w}×{m.h} · {m.size}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
