import { useState, useEffect, useCallback } from 'react';
import { useAppDispatch } from "@/lib/hooks/redux";
import { setPagination } from '../store/slices/projectSlice';

interface UseProjectFiltersReturn {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  debouncedSearchTerm: string;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  sortField: string | undefined;
  setSortField: (value: string | undefined) => void;
  sortOrder: number;
  setSortOrder: (value: number) => void;
  resetFilters: () => void;
  handleSort: (field: string) => void;
}

export const useProjectFilters = (): UseProjectFiltersReturn => {
  const dispatch = useAppDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<number>(1);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      // Reset pagination when search term changes
      dispatch(setPagination({ skip: 0, limit: 10 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, dispatch]);

  // Reset pagination when status filter changes
  useEffect(() => {
    dispatch(setPagination({ skip: 0, limit: 10 }));
  }, [statusFilter, dispatch]);

  // Handle sorting - toggle order if same field, otherwise set new field
  const handleSort = useCallback((field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 1 ? -1 : 1);
    } else {
      setSortField(field);
      setSortOrder(1);
    }
    // Reset pagination when sort changes
    dispatch(setPagination({ skip: 0, limit: 10 }));
  }, [sortField, sortOrder, dispatch]);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setStatusFilter('all');
    setSortField(undefined);
    setSortOrder(1);
    dispatch(setPagination({ skip: 0, limit: 10 }));
  }, [dispatch]);

  return {
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,
    statusFilter,
    setStatusFilter,
    sortField,
    setSortField,
    sortOrder,
    setSortOrder,
    resetFilters,
    handleSort
  };
};

// utils/formatUtils.