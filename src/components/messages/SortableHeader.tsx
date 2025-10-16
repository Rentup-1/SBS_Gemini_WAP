import React from 'react';
import type { FlexibleColumnKey, SortColumn, SortDirection, ColumnKey } from '../../interfaces';
import { COLUMN_METADATA } from '../../utils/constants';
import { ListFilter, ArrowUp, ArrowDown, GripVertical } from 'lucide-react';

interface SortableHeaderProps {
  columnKey: FlexibleColumnKey;
  currentSort: SortColumn;
  direction: SortDirection;
  onSort: (column: SortColumn) => void;
  isDraggingOver: boolean;
  handleDragStart: (e: React.DragEvent<HTMLTableHeaderCellElement>, key: ColumnKey) => void;
  handleDragEnter: (key: ColumnKey) => void;
  handleDrop: () => void;
}

export const SortableHeader: React.FC<SortableHeaderProps> = ({ 
  columnKey, 
  currentSort, 
  direction, 
  onSort, 
  isDraggingOver, 
  handleDragStart, 
  handleDragEnter, 
  handleDrop 
}) => {
  const metadata = COLUMN_METADATA[columnKey];
  const isSorted = currentSort === columnKey;
  const isAsc = isSorted && direction === 'asc';
  
  return (
    <th 
      scope="col" 
      className={`px-2 py-3 text-left cursor-pointer transition-colors border-l border-gray-200 ${isDraggingOver ? 'bg-blue-200' : 'hover:bg-gray-200'}`} 
      onClick={() => onSort(columnKey)}
      draggable
      onDragStart={(e) => handleDragStart(e, columnKey)}
      onDragEnter={() => handleDragEnter(columnKey)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <div className="flex items-center space-x-1 group whitespace-nowrap">
        <GripVertical 
          className="w-4 h-4 text-gray-400 cursor-grab active:cursor-grabbing hover:text-gray-700 transition" 
          onClick={(e) => e.stopPropagation()} 
        />
        {metadata.icon && <metadata.icon className="w-4 h-4" />}
        <span className='font-semibold'>{metadata.label}</span>
        {isSorted ? (
          isAsc ? <ArrowUp className="w-4 h-4 text-blue-500" /> : <ArrowDown className="w-4 h-4 text-blue-500" />
        ) : (
          <ListFilter className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </div>
    </th>
  );
};