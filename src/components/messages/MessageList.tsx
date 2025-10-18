import React from 'react';
import { useMessageList } from '../../hooks/useMessageList';
import { MessageHeader } from './MessageHeader';
import { MessageTable } from './MessageTable';

export const MessageList: React.FC = () => {
  const {
    messages,
    loading,
    error,
    selectedIds,
    columnOrder,
    columnFilters,
    sortConfig,
    dragOverItem,
    isAllSelected,
    isIndeterminate,
    handleFilterChange,
    handleSort,
    handleSelectAll,
    handleSelectOne,
    handleRowClick,
    handleDragStart,
    handleDragEnter,
    handleDrop,
  } = useMessageList();

  return (
    <div className="p-4 sm:p-8 bg-gray-50 min-h-screen font-sans">
      <MessageHeader />

      <MessageTable
        messages={messages}
        loading={loading}
        error={error}
        onDeleteMessage={()=>{}}
        selectedIds={selectedIds}
        columnOrder={columnOrder}
        columnFilters={columnFilters}
        sortConfig={sortConfig}
        dragOverItem={dragOverItem}
        isAllSelected={isAllSelected}
        isIndeterminate={isIndeterminate}
        onSort={handleSort}
        onFilterChange={handleFilterChange}
        onSelectAll={handleSelectAll}
        onSelectOne={handleSelectOne}
        onRowClick={handleRowClick}
        onDragStart={handleDragStart}
        onDragEnter={handleDragEnter}
        onDrop={handleDrop}
      />
    </div>
  );
};