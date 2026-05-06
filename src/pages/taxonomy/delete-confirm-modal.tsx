import { Ic } from '../../components/icons';
import { Button } from '../../components/material';
import { useMutation } from '@/hooks/use-api';
import { endpoints } from '@/api/endpoints';
import type { ICategory } from '@/api/types';

export interface DeleteConfirmModalProps {
  category: ICategory;
  onClose: () => void;
}

export function DeleteConfirmModal({ category, onClose }: DeleteConfirmModalProps) {
  const { trigger: deleteCat, isLoading: deleting } = useMutation(
    endpoints.categoryDetails,
    { method: 'DELETE', invalidate: [endpoints.categories] }
  );

  async function handleConfirm() {
    await deleteCat(undefined, { slug: category.slug });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
      <div className="bg-white rounded-xl shadow-2xl w-[360px] p-6 flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center shrink-0 mt-0.5">
            <Ic.X className="w-4 h-4 text-red-500" />
          </div>
          <div>
            <div className="text-[14px] font-semibold text-stone-900">Delete "{category.name}"?</div>
            <div className="text-[13px] text-stone-500 mt-1 leading-relaxed">
              This will remove the category. Posts currently assigned to it will become uncategorised.
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="danger" onClick={() => void handleConfirm()} loading={deleting}>Delete</Button>
        </div>
      </div>
    </div>
  );
}
