// src/hooks/useOptimisticUpdate.ts
import { useState, useCallback, useRef } from 'react';

interface OptimisticUpdate<T> {
  id: string;
  type: 'add' | 'update' | 'delete';
  data?: T;
  previousData?: T;
}

export function useOptimisticUpdate<T extends { id: string }>() {
  const [optimisticUpdates, setOptimisticUpdates] = useState<Map<string, OptimisticUpdate<T>>>(new Map());
  const rollbackTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const addOptimisticUpdate = useCallback((update: OptimisticUpdate<T>) => {
    setOptimisticUpdates(prev => {
      const newMap = new Map(prev);
      newMap.set(update.id, update);
      return newMap;
    });

    // Set a timeout to auto-rollback if not confirmed
    const timeout = setTimeout(() => {
      rollbackOptimisticUpdate(update.id);
    }, 5000); // 5 seconds timeout

    rollbackTimeouts.current.set(update.id, timeout);
  }, []);

  const confirmOptimisticUpdate = useCallback((id: string) => {
    setOptimisticUpdates(prev => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });

    // Clear the rollback timeout
    const timeout = rollbackTimeouts.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      rollbackTimeouts.current.delete(id);
    }
  }, []);

  const rollbackOptimisticUpdate = useCallback((id: string) => {
    setOptimisticUpdates(prev => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });

    // Clear the rollback timeout
    const timeout = rollbackTimeouts.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      rollbackTimeouts.current.delete(id);
    }
  }, []);

  const applyOptimisticUpdates = useCallback((items: T[]): T[] => {
    if (optimisticUpdates.size === 0) return items;

    let result = [...items];

    optimisticUpdates.forEach(update => {
      switch (update.type) {
        case 'add':
          if (update.data && !result.find(item => item.id === update.id)) {
            result.push(update.data);
          }
          break;

        case 'update':
          result = result.map(item => 
            item.id === update.id && update.data ? update.data : item
          );
          break;

        case 'delete':
          result = result.filter(item => item.id !== update.id);
          break;
      }
    });

    return result;
  }, [optimisticUpdates]);

  // Cleanup timeouts on unmount
  const cleanup = useCallback(() => {
    rollbackTimeouts.current.forEach(timeout => clearTimeout(timeout));
    rollbackTimeouts.current.clear();
  }, []);

  return {
    optimisticUpdates,
    addOptimisticUpdate,
    confirmOptimisticUpdate,
    rollbackOptimisticUpdate,
    applyOptimisticUpdates,
    cleanup,
  };
}