import { DashTopBar } from '../../components/layout/DashTopBar';
import { Ic } from '../../components/icons';

export default function SchedulePage() {
  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <DashTopBar title="Schedule" />
      <div className="flex-1 bg-stone-50 grid place-items-center">
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-stone-100 grid place-items-center mx-auto mb-4 text-stone-400">
            <Ic.Calendar className="w-6 h-6" />
          </div>
          <div className="text-[14px] font-semibold text-stone-700 mb-1">Schedule coming soon</div>
          <div className="text-[13px] text-stone-500">Plan and queue upcoming posts in one view.</div>
        </div>
      </div>
    </div>
  );
}
