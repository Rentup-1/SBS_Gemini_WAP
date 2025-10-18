import React from "react";
import type {
  Message,
  FlexibleColumnKey,
  ColumnKey,
  SortColumn,
  SortDirection,
  ColumnFilters,
} from "../../interfaces";
import { COLUMN_METADATA } from "../../utils/constants";
import { SortableHeader } from "./SortableHeader";
import { FilterInput } from "./FilterInput";
import { Trash2, Loader, Image, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
interface MessageTableProps {
  messages: Message[];
  selectedIds: number[];
  columnOrder: FlexibleColumnKey[];
  columnFilters: ColumnFilters;
  sortConfig: { column: SortColumn; direction: SortDirection };
  dragOverItem: FlexibleColumnKey | null;
  isAllSelected: boolean;
  isIndeterminate: boolean;
  loading: boolean;
  error: string | null;
  onSort: (column: SortColumn) => void;
  onFilterChange: (column: FlexibleColumnKey, value: string) => void;
  onSelectAll: () => void;
  onSelectOne: (id: number) => void;
  onRowClick: (id: number) => void;
  onDeleteMessage: (id: number) => void;
  onDragStart: (
    e: React.DragEvent<HTMLTableHeaderCellElement>,
    key: ColumnKey
  ) => void;
  onDragEnter: (key: ColumnKey) => void;
  onDrop: () => void;
}

export const MessageTable: React.FC<MessageTableProps> = ({
  messages,
  selectedIds,
  columnOrder,
  columnFilters,
  sortConfig,
  dragOverItem,
  isAllSelected,
  isIndeterminate,
  loading,
  error,
  onSort,
  onFilterChange,
  onSelectAll,
  onRowClick,
  onDeleteMessage,
  onDragStart,
  onDragEnter,
  onDrop,
}) => {
  const fullRenderOrder: ColumnKey[] = [...columnOrder, "actions"];
  const navigate = useNavigate()
  if (loading && messages.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-xl p-8 flex justify-center items-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (error && messages.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-xl p-8">
        <div className="text-center text-red-600">
          <p className="text-lg font-semibold mb-2">Error loading messages</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-xl overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        {/* Sorting Header Row */}
        <thead className="bg-gray-100 text-xs font-bold uppercase tracking-wider text-gray-500">
          <tr>
            {fullRenderOrder.map((key) => {
              const metadata = COLUMN_METADATA[key];

              if ((key as string) === "checkbox") {
                return (
                  <th
                    key={key}
                    scope="col"
                    className="px-4 py-3 text-center w-10"
                  >
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = isIndeterminate;
                      }}
                      onChange={onSelectAll}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                      disabled={loading}
                    />
                  </th>
                );
              }

              if (key === "actions") {
                return (
                  <th
                    key={key}
                    scope="col"
                    className="px-4 py-3 text-right w-1/12"
                  >
                    {metadata.label}
                  </th>
                );
              }

              return (
                <SortableHeader
                  key={key}
                  columnKey={key as FlexibleColumnKey}
                  currentSort={sortConfig.column}
                  direction={sortConfig.direction}
                  onSort={onSort}
                  isDraggingOver={dragOverItem === key}
                  handleDragStart={onDragStart}
                  handleDragEnter={onDragEnter}
                  handleDrop={onDrop}
                />
              );
            })}
          </tr>
        </thead>

        {/* Filter Header Row */}
        <thead className="bg-white border-b border-gray-200">
          <tr>
            {fullRenderOrder.map((key) => {
              const metadata = COLUMN_METADATA[key];

              if (!metadata.isFilterable) {
                return (
                  <th
                    key={key}
                    className={`px-4 py-2 ${
                      key === "actions" ? "w-1/12" : "w-10"
                    }`}
                  ></th>
                );
              }

              return (
                <th key={key} className="px-0 py-2 border-l border-gray-200">
                  <FilterInput
                    columnKey={key as FlexibleColumnKey}
                    placeholder={`Filter ${metadata.label}`}
                    value={columnFilters[key as FlexibleColumnKey]}
                    onChange={onFilterChange}
                  />
                </th>
              );
            })}
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-gray-100">
          {messages.length > 0 ? (
            messages.map((msg) => {
              const isSelected = selectedIds.includes(msg.id);
              return (
                <tr
                  key={msg.id}
                  className={`border-b border-gray-100 transition-all
                    ${
                      msg.isRead ? "text-gray-500" : "text-gray-800 font-medium"
                    } 
                    ${
                      isSelected
                        ? "bg-blue-50 border-blue-300"
                        : "hover:bg-blue-50/70"
                    }
                    ${loading ? "opacity-60" : ""}`}
                  onClick={() => onRowClick(msg.id)}
                >
                  {fullRenderOrder.map((key) => {
                    const cellClasses = "p-4 text-sm whitespace-nowrap";

                    switch (key) {
                      case "id":
                        return (
                          <td
                            key={key}
                            className={`${cellClasses} font-mono text-blue-600`}
                          >
                            {msg.id}
                          </td>
                        );
                      case "contactName":
                        return (
                          <td key={key} className={cellClasses}>
                            <div className="text-sm">
                              {msg.contactName}
                              <div className="text-xs text-blue-500 font-normal">
                                {msg.contactPhone}
                              </div>
                            </div>
                          </td>
                        );
                      case "message":
                        return (
                          <td
                            key={key}
                            className={`${cellClasses} max-w-xs overflow-hidden text-ellipsis`}
                          >
                            <div className="text-sm max-w-lg overflow-hidden text-ellipsis">
                              {msg.message}
                              {msg.mediaUrls && msg.mediaUrls.length > 0 && (
                                <div className="mt-1 flex items-center text-xs text-blue-600">
                                  <Image className="w-3 h-3 mr-1" />
                                  {msg.mediaUrls.length} media file
                                  {msg.mediaUrls.length > 1 ? "s" : ""}
                                </div>
                              )}
                            </div>
                          </td>
                        );
                      case "sentAt":
                        return (
                          <td key={key} className={cellClasses}>
                            {msg.sentAt}
                          </td>
                        );
                      // case "status":
                      //   return (
                      //     <td
                      //       key={key}
                      //       className={`${cellClasses} text-center`}
                      //     >
                      //       <span
                      //         className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      //           msg.status === "Listed"
                      //             ? "bg-indigo-100 text-indigo-800"
                      //             : "bg-yellow-100 text-yellow-800"
                      //         }`}
                      //       >
                      //         {msg.status}
                      //       </span>
                      //     </td>
                      //   );
                      // case "source":
                      //   return (
                      //     <td key={key} className={cellClasses}>
                      //       {msg.source}
                      //     </td>
                      //   );
                      case "type":
                        return (
                          <td key={key} className={cellClasses}>
                            {msg.type}
                          </td>
                        );
                      // case "userType":
                        return (
                          <td key={key} className={cellClasses}>
                            {msg.userType}
                          </td>
                        );
                      case "userId":
                        return (
                          <td key={key} className={`${cellClasses} font-mono`}>
                            {msg.userId}
                          </td>
                        );
                      // case "replied":
                        return (
                          <td
                            key={key}
                            className={`${cellClasses} text-center`}
                          >
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                msg.replied === "Yes"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {msg.replied}
                            </span>
                          </td>
                        );
                      case "actions":
                        return (
                          <td key={key} className={`${cellClasses}`}>
                            <div className="flex space-x-3 justify-end items-center text-gray-400">
                              <button
                                title="Gemini"
                                className="hover:text-blue-600 cursor-pointer transition p-1 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => {
                                  navigate('/extraction', {
                                    state: {
                                      id: msg.id,
                                      type: msg.type
                                    }
                                  })
                                }}
                                disabled={loading}
                              >
                                <Sparkles className="w-4 h-4" />
                              </button>
                              <button
                                title="Delete"
                                className="hover:text-red-600 transition p-1 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteMessage(msg.id);
                                }}
                                disabled={loading}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        );
                      default:
                        return <td key={key} className={cellClasses}></td>;
                    }
                  })}
                </tr>
              );
            })
          ) : (
            <tr>
              <td
                colSpan={fullRenderOrder.length}
                className="text-center py-10 text-gray-500 text-lg"
              >
                {loading
                  ? "Loading messages..."
                  : "No messages found matching the current filters."}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
