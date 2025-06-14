// --- file: src/store/slices/ticketDetailsSlice.ts ---
import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
} from "@reduxjs/toolkit";

import ticketService from "../../../services/ticket";
import websocketService, { WSEvent } from "../../../services/webSocket";

import type { RootState, AppDispatch } from "../../store";
import type {
  Ticket,
  Comment,
  TicketHistory,
  User,
} from "../../../types/interfaces";

/* ------------------------------------------------------------------ */
/* Extra runtime shapes coming from the WebSocket                     */
/* ------------------------------------------------------------------ */

interface ActiveUserWS {
  user_id: string;
  last_activity: string;
}
interface UserActivityWS {
  user_id: string;
  timestamp: string;
}
interface CommentWS {
  comment: Comment;
}
interface CommentDeletedWS {
  comment_id: string;
}
interface ReactionUpdateWS {
  comment_id: string;
  reactions: Record<string, string[]>;
  reaction_counts: Record<string, number>;
}

/* ------------------------------------------------------------------ */
/* Types & initial state                                              */
/* ------------------------------------------------------------------ */

interface UserPresence {
  online: boolean;
  lastActive?: string;
}
interface PresencePatch {
  userId: string;
  online: boolean;
  lastActive?: string;
}
export interface TicketDetailsState {
  loading: boolean;
  error: string | null;
  ticket: Ticket | null;
  comments: Comment[];
  history: TicketHistory[];
  watchers: (User & { online?: boolean; last_active?: string })[];
  relatedTickets: Ticket[];
  presence: Record<string, UserPresence>;
}

const initialState: TicketDetailsState = {
  loading: false,
  error: null,
  ticket: null,
  comments: [],
  history: [],
  watchers: [],
  relatedTickets: [],
  presence: {},
};

/* ------------------------------------------------------------------ */
/* REST bootstrap                                                      */
/* ------------------------------------------------------------------ */

export const fetchTicketDetails = createAsyncThunk<
  TicketDetailsState,
  string,
  { rejectValue: string; dispatch: AppDispatch }
>("ticketDetails/fetchTicketDetails", async (ticketId, { dispatch, rejectWithValue }) => {
  try {
    const data = await ticketService.getTicketDetails(ticketId);
    dispatch(openTicketRoom({ ticketId }));
    return { ...initialState, ...data };
  } catch (e) {
    return rejectWithValue((e as Error).message);
  }
});

/* ------------------------------------------------------------------ */
/* WebSocket bootstrap                                                 */
/* ------------------------------------------------------------------ */

export const openTicketRoom = createAsyncThunk<
  void,
  { ticketId: string },
  { dispatch: AppDispatch }
>("ticketDetails/openTicketRoom", async ({ ticketId }, { dispatch }) => {
  const room = `ticket:${ticketId}`;
  if (websocketService.isConnected(room)) return;

  websocketService.connect("ticket", ticketId);

  websocketService.on(room, WSEvent.ActiveUsers, (raw) => {
    const msg = raw as unknown as { users: ActiveUserWS[] };
    dispatch(receiveActiveUsers(msg.users));
  });

  websocketService.on(room, WSEvent.UserJoined, (raw) => {
    const msg = raw as unknown as UserActivityWS;
    dispatch(updatePresence({ userId: msg.user_id, online: true, lastActive: msg.timestamp }));
  });

  websocketService.on(room, WSEvent.UserLeft, (raw) => {
    const msg = raw as unknown as UserActivityWS;
    dispatch(updatePresence({ userId: msg.user_id, online: false, lastActive: msg.timestamp }));
  });

  websocketService.on(room, WSEvent.NewComment, (raw) => {
    const msg = raw as unknown as CommentWS;
    dispatch(receiveComment(msg.comment));
  });

  websocketService.on(room, WSEvent.CommentUpdated, (raw) => {
    const msg = raw as unknown as CommentWS;
    dispatch(receiveComment(msg.comment));
  });

  websocketService.on(room, WSEvent.CommentDeleted, (raw) => {
    const msg = raw as unknown as CommentDeletedWS;
    dispatch(removeComment(msg.comment_id));
  });

  websocketService.on(room, WSEvent.ReactionUpdate, (raw) => {
    const msg = raw as unknown as ReactionUpdateWS;
    dispatch(updateReaction(msg));
  });

  websocketService.getActiveUsers("ticket", ticketId);
});

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const patchPresence = (state: TicketDetailsState, p: PresencePatch) => {
  state.presence[p.userId] = { online: p.online, lastActive: p.lastActive };
  const watcher = state.watchers.find((u) => u._id === p.userId);
  if (watcher) Object.assign(watcher, { online: p.online, last_active: p.lastActive });
};

/* ------------------------------------------------------------------ */
/* Slice                                                               */
/* ------------------------------------------------------------------ */

const slice = createSlice({
  name: "ticketDetails",
  initialState,
  reducers: {
    clearTicketDetails: () => initialState,

    receiveActiveUsers: (
      state,
      action: PayloadAction<ActiveUserWS[]>
    ) => {
      action.payload.forEach((u) =>
        patchPresence(state, {
          userId: u.user_id,
          online: true,
          lastActive: u.last_activity,
        })
      );
    },
    updatePresence: (state, action: PayloadAction<PresencePatch>) => {
      patchPresence(state, action.payload);
    },
    receiveComment: (state, action: PayloadAction<Comment>) => {
      const idx = state.comments.findIndex((c) => c.id === action.payload.id);
      if (idx === -1) state.comments.push(action.payload);
      else state.comments[idx] = action.payload;
    },
    removeComment: (state, action: PayloadAction<string>) => {
      state.comments = state.comments.filter((c) => c.id !== action.payload);
    },
    updateReaction: (state, action: PayloadAction<ReactionUpdateWS>) => {
      const c = state.comments.find((cm) => cm.id === action.payload.comment_id);
      if (c) {
        // `Comment` type already has optional reactions field
        (c as Comment & {
          reactions?: Record<string, string[]>;
          reaction_counts?: Record<string, number>;
        }).reactions = action.payload.reactions;
        (c as Comment & {
          reactions?: Record<string, string[]>;
          reaction_counts?: Record<string, number>;
        }).reaction_counts = action.payload.reaction_counts;
      }
    },
  },
  extraReducers: (builder) =>
    builder
      .addCase(fetchTicketDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTicketDetails.fulfilled, (state, action) => {
        Object.assign(state, action.payload);
        state.loading = false;
      })
      .addCase(fetchTicketDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load ticket";
      }),
});

export const {
  clearTicketDetails,
  receiveActiveUsers,
  updatePresence,
  receiveComment,
  removeComment,
  updateReaction,
} = slice.actions;

export default slice.reducer;

/* ------------------------------------------------------------------ */
/* Selectors                                                           */
/* ------------------------------------------------------------------ */

export const selectTicketDetails = (s: RootState) =>
  (s as RootState & { ticketDetails: TicketDetailsState }).ticketDetails;

export const selectPresence = (s: RootState) =>
  (s as RootState & { ticketDetails: TicketDetailsState }).ticketDetails.presence;
