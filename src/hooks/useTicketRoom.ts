// --- file: src/hooks/useTicketRoom.ts ---
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { openTicketRoom, clearTicketDetails } from '../store/slices/ticket/ticketDetails';
import { AppDispatch } from '../store/store';
import websocketService from '../services/webSocket';

/**
 * Hook to manage WebSocket ticket room connection
 * Joins the room on mount and leaves on unmount
 */
const useTicketRoom = (ticketId: string): void => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(openTicketRoom({ ticketId }));

    // Cleanup on unmount
    return () => {
      const room = `ticket:${ticketId}`;
      websocketService.disconnect(room);
      dispatch(clearTicketDetails());
    };
  }, [dispatch, ticketId]);
};

export default useTicketRoom;