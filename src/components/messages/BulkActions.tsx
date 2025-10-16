import React from 'react';
import { Trash2 } from 'lucide-react';

interface BulkActionsProps {
  selectedCount: number;
  onBulkDelete: () => void;
}

export const BulkActions: React.FC<BulkActionsProps> = ({ 
  selectedCount, 
  onBulkDelete 
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="mb-4 flex flex-wrap justify-between items-center p-3 bg-blue-100 border border-blue-300 rounded-xl">
      <span className="text-blue-800 font-medium my-1">
        {selectedCount} message{selectedCount > 1 ? 's' : ''} selected.
      </span>
      <button
        onClick={onBulkDelete}
        className="flex items-center px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition active:scale-[0.98] my-1"
      >
        <Trash2 className="w-4 h-4 mr-2" />
        Delete Selected
      </button>
    </div>
  );
};