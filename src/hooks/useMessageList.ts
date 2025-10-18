import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import type {
    Message,
    FlexibleColumnKey,
    ColumnKey,
    SortColumn,
    SortDirection,
    ColumnFilters,
    PaginationMeta
} from '../interfaces';
import { INITIAL_FLEXIBLE_ORDER } from '../utils/constants';
import { fetchMessages } from '../services/messageApi';

interface UseMessageListReturn {
    messages: Message[];
    selectedIds: number[];
    columnOrder: FlexibleColumnKey[];
    columnFilters: ColumnFilters;
    sortConfig: { column: SortColumn; direction: SortDirection };
    dragOverItem: FlexibleColumnKey | null;
    isAllSelected: boolean;
    isIndeterminate: boolean;
    selectedCount: number;
    loading: boolean;
    error: string | null;
    pagination: PaginationMeta | null;
    handleFilterChange: (column: FlexibleColumnKey, value: string) => void;
    handleSort: (column: SortColumn) => void;
    handleSelectAll: () => void;
    handleSelectOne: (id: number) => void;
    handleRowClick: (id: number) => void;
    handleCreateMessage: () => void;
    handleDragStart: (e: React.DragEvent<HTMLTableHeaderCellElement>, key: ColumnKey) => void;
    handleDragEnter: (key: ColumnKey) => void;
    handleDrop: () => void;
    refetchMessages: () => Promise<void>;
}

export const useMessageList = (): UseMessageListReturn => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [columnOrder, setColumnOrder] = useState<FlexibleColumnKey[]>(INITIAL_FLEXIBLE_ORDER);
    const [columnFilters, setColumnFilters] = useState<ColumnFilters>({
        id: '', contactName: '', message: '', sentAt: '',
         type: '',  userId: ''
    });
    const [sortConfig, setSortConfig] = useState<{ column: SortColumn; direction: SortDirection }>({
        column: 'sentAt',
        direction: 'desc',
    });
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<PaginationMeta | null>(null);

    const dragItem = useRef<FlexibleColumnKey | null>(null);
    const dragOverItem = useRef<FlexibleColumnKey | null>(null);

    // Fetch messages on component mount and when filters change
    const fetchMessagesData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetchMessages(1, columnFilters);
            setMessages(response.messages);
            setPagination(response.meta);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch messages';
            setError(errorMessage);
            console.error('Error fetching messages:', err);

            // You might want to show a toast notification here
            // toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [columnFilters]);

    // Initial data fetch
    useEffect(() => {
        fetchMessagesData();
    }, [fetchMessagesData]);

    // Sorting and Filtering Logic (client-side for now, could be server-side)
    const sortedAndFilteredMessages = useMemo(() => {
        if (loading) return [];

        let filtered = messages;
        const filters = columnFilters;

        // 1. Filtering
        filtered = messages.filter((msg) => {
            const filterValue = (val: string | number, filter: string) =>
                !filter || String(val).toLowerCase().includes(filter.toLowerCase());

            if (!filterValue(msg.id, filters.id)) return false;
            if (filters.contactName) {
                const contactSearch = filters.contactName.toLowerCase();
                if (!msg.contactName.toLowerCase().includes(contactSearch) && !msg.contactPhone.includes(contactSearch)) {
                    return false;
                }
            }
            if (!filterValue(msg.message, filters.message)) return false;
            if (!filterValue(msg.sentAt, filters.sentAt)) return false;
            // if (!filterValue(msg.source, filters.source)) return false;
            if (!filterValue(msg.type, filters.type)) return false;
            // if (!filterValue(msg.userType, filters.userType)) return false;
            if (!filterValue(msg.userId, filters.userId)) return false;
            // if (!filterValue(msg.replied, filters.replied)) return false;
            // if (!filterValue(msg.status, filters.status)) return false;

            return true;
        });

        // 2. Sorting
        return [...filtered].sort((a, b) => {
            const aValue = a[sortConfig.column];
            const bValue = b[sortConfig.column];

            let comparison = 0;
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                comparison = aValue.localeCompare(bValue);
            } else if (typeof aValue === 'number' && typeof bValue === 'number') {
                comparison = aValue - bValue;
            }

            return sortConfig.direction === 'asc' ? comparison : -comparison;
        });
    }, [messages, columnFilters, sortConfig, loading]);

    // Selection Metrics
    const allFilteredIds = sortedAndFilteredMessages.map(msg => msg.id);
    const selectedFilteredCount = allFilteredIds.filter(id => selectedIds.includes(id)).length;
    const isAllSelected = selectedFilteredCount > 0 && selectedFilteredCount === allFilteredIds.length;
    const isIndeterminate = selectedFilteredCount > 0 && selectedFilteredCount < allFilteredIds.length;

    // Drag and Drop Handlers
    const handleDragStart = useCallback((e: React.DragEvent<HTMLTableHeaderCellElement>, key: ColumnKey) => {
        if ((key as string) === 'checkbox' || key === 'actions') {
            e.preventDefault();
            return;
        }
        dragItem.current = key as FlexibleColumnKey;
        e.dataTransfer.effectAllowed = "move";
        e.currentTarget.classList.add('opacity-40', 'border-dashed', 'border-blue-500');
    }, []);

    const handleDragEnter = useCallback((key: ColumnKey) => {
        if ((key as string) === 'checkbox' || key === 'actions' || dragItem.current === key) return;
        dragOverItem.current = key as FlexibleColumnKey;
    }, []);

    const handleDrop = useCallback(() => {
        if (!dragItem.current || !dragOverItem.current) return;

        const draggedKey = dragItem.current;
        const targetKey = dragOverItem.current;

        if ((targetKey as string) === 'checkbox' || (targetKey as string) === 'actions' || draggedKey === targetKey) {
            dragItem.current = null;
            dragOverItem.current = null;
            return;
        }

        const newOrder = [...columnOrder];
        const dragIndex = newOrder.indexOf(draggedKey);
        const targetIndex = newOrder.indexOf(targetKey);

        if (dragIndex !== -1 && targetIndex !== -1) {
            newOrder.splice(dragIndex, 1);
            newOrder.splice(targetIndex, 0, draggedKey);
            setColumnOrder(newOrder);
        }

        dragItem.current = null;
        dragOverItem.current = null;
    }, [columnOrder]);

    // API Handlers
    const handleFilterChange = useCallback((column: FlexibleColumnKey, value: string) => {
        setColumnFilters(prev => ({
            ...prev,
            [column]: value,
        }));
        // This will trigger a refetch via the useEffect dependency
    }, []);

    const handleSort = useCallback((column: SortColumn) => {
        setSortConfig(prev => ({
            column,
            direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc',
        }));
    }, []);

    const handleSelectOne = useCallback((id: number) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    }, []);

    const handleSelectAll = useCallback(() => {
        const currentlyAllSelected = allFilteredIds.every(id => selectedIds.includes(id));

        if (currentlyAllSelected) {
            setSelectedIds([]);
        } else {
            const newSelectedIds = Array.from(new Set([...selectedIds, ...allFilteredIds]));
            setSelectedIds(newSelectedIds);
        }
    }, [selectedIds, allFilteredIds]);


    const handleRowClick = useCallback((id: number) => {
        console.log(`Navigating to message detail for ID: ${id}.`);
        // Here you would typically use your routing (React Router, etc.)
    }, []);

    const handleCreateMessage = useCallback(() => {
        console.log('Creating new message');
        // Navigate to message creation form
    }, []);

    const refetchMessages = useCallback(async () => {
        await fetchMessagesData();
    }, [fetchMessagesData]);

    return {
        messages: sortedAndFilteredMessages,
        selectedIds,
        columnOrder,
        columnFilters,
        sortConfig,
        dragOverItem: dragOverItem.current,
        isAllSelected,
        isIndeterminate,
        selectedCount: selectedIds.length,
        loading,
        error,
        pagination,
        handleFilterChange,
        handleSort,
        handleSelectAll,
        handleSelectOne,
        handleRowClick,
        handleCreateMessage,
        handleDragStart,
        handleDragEnter,
        handleDrop,
        refetchMessages,
    };
};