/* ------------------------------------------------------------------ */
/* WebSocketService – room-aware, ESLint-clean                         */
/* ------------------------------------------------------------------ */

export interface WSMessage {
  /** Discriminator dispatched by the server (e.g. "new_comment") */
  type: string;
  /** Payload properties are dynamic; use `unknown` then narrow in handlers */
  [key: string]: unknown;
}

export enum WSEvent {
  ActiveUsers    = "active_users",
  UserJoined     = "user_joined",
  UserLeft       = "user_left",
  NewComment     = "new_comment",
  CommentUpdated = "comment_updated",
  CommentDeleted = "comment_deleted",
  ReactionUpdate = "reaction_update",
  Typing         = "typing",
  Pong           = "pong",
}

type MessageHandler = (message: WSMessage) => void;

interface WebSocketConnection {
  socket: WebSocket;
  entityType: string;
  entityId: string;
  handlers: Record<string, MessageHandler[]>;
  isConnected: boolean;
}

class WebSocketService {
  private connections: Record<string, WebSocketConnection> = {};
  private authToken = localStorage.getItem("token") ?? "";

  /* ----------------------- auth token ------------------------------ */
  public setAuthToken(token: string): void {
    this.authToken = token;
  }

  /* ----------------------- room helpers ---------------------------- */
  private roomId(entity: string, id: string): string {
    return `${entity}:${id}`;
  }

  /** Accepts "ticket:123" or ("ticket","123") */
  private parseRoom(
    roomOrEntity: string,
    maybeId?: string
  ): { entity: string; id: string; room: string } {
    if (maybeId !== undefined) {
      return { entity: roomOrEntity, id: maybeId, room: this.roomId(roomOrEntity, maybeId) };
    }
    const [entity, id] = roomOrEntity.split(":");
    return { entity, id, room: roomOrEntity };
  }

  /* ------------------------- connect ------------------------------- */
  public connect(entity: string, id: string): void {
    const room = this.roomId(entity, id);
    if (this.connections[room]?.isConnected) return;

    const protocol = location.protocol === "https:" ? "wss" : "ws";
    const url = `${protocol}://${location.host}/api/ws/${entity}/${id}?token=${this.authToken}`;
    const socket = new WebSocket(url);

    const conn: WebSocketConnection = {
      socket,
      entityType: entity,
      entityId: id,
      handlers: {},
      isConnected: false,
    };
    this.connections[room] = conn;

    socket.onopen = () => {
      conn.isConnected = true;
      this.send(entity, id, { type: "get_active_users" });

      const pingTimer = setInterval(() => {
        if (conn.isConnected) this.send(entity, id, { type: "ping" });
        else clearInterval(pingTimer);
      }, 30_000);
    };

    socket.onmessage = (evt) => {
      try {
        const msg: WSMessage = JSON.parse(evt.data);
        this.dispatch(room, msg);
      } catch (err) {
        console.error("WebSocket parse error:", err);
      }
    };

    socket.onclose = () => {
      conn.isConnected = false;
      delete this.connections[room];
    };

    socket.onerror = (err) => {
      conn.isConnected = false;
      console.error(`WebSocket error (${room}):`, err);
    };
  }

  /* ------------------------- disconnect ---------------------------- */
  public disconnect(entity: string, id: string): void;
  public disconnect(room: string): void;
  public disconnect(roomOrEntity: string, maybeId?: string): void {
    const { room } = this.parseRoom(roomOrEntity, maybeId);
    const conn = this.connections[room];
    if (conn) {
      conn.socket.close();
      conn.isConnected = false;
      delete this.connections[room];
    }
  }

  /* ---------------------------- send ------------------------------- */
  public send(entity: string, id: string, msg: WSMessage): void;
  public send(roomId: string, msg: WSMessage): void;
  public send(
    roomOrEntity: string,
    idOrMsg: string | WSMessage,
    maybeMsg?: WSMessage
  ): void {
    const { entity, id, room } =
      typeof idOrMsg === "string" && maybeMsg !== undefined
        ? this.parseRoom(roomOrEntity, idOrMsg)
        : this.parseRoom(roomOrEntity);

    const payload: WSMessage =
      typeof idOrMsg === "string" ? (maybeMsg as WSMessage) : idOrMsg;

    const conn = this.connections[room];
    if (conn?.isConnected) conn.socket.send(JSON.stringify(payload));
    else console.warn(`WebSocket not connected: ${room}`);
  }

  /* ----------------------------- on -------------------------------- */
  public on(
    entity: string,
    id: string,
    type: string,
    handler: MessageHandler
  ): void;
  public on(room: string, type: string, handler: MessageHandler): void;
  public on(
    roomOrEntity: string,
    idOrType: string,
    typeOrHandler: string | MessageHandler,
    maybeHandler?: MessageHandler
  ): void {
    const isRoomStyle = typeof maybeHandler === "function";
    const { entity, id, room } = isRoomStyle
      ? this.parseRoom(roomOrEntity)
      : this.parseRoom(roomOrEntity, idOrType);

    const evtType = isRoomStyle ? idOrType : (typeOrHandler as string);
    const cb = isRoomStyle ? (typeOrHandler as MessageHandler) : (maybeHandler as MessageHandler);

    if (!this.connections[room]) this.connect(entity, id);
    const conn = this.connections[room]!;
    (conn.handlers[evtType] ??= []).push(cb);
  }

  /* ----------------------------- off ------------------------------- */
  public off(
    entity: string,
    id: string,
    type: string,
    handler: MessageHandler
  ): void;
  public off(room: string, type: string, handler: MessageHandler): void;
  public off(
    roomOrEntity: string,
    idOrType: string,
    typeOrHandler: string | MessageHandler,
    maybeHandler?: MessageHandler
  ): void {
    const isRoomStyle = typeof maybeHandler === "function";
    const { room } = isRoomStyle
      ? this.parseRoom(roomOrEntity)
      : this.parseRoom(roomOrEntity, idOrType);

    const evtType = isRoomStyle ? idOrType : (typeOrHandler as string);
    const cb = isRoomStyle ? (typeOrHandler as MessageHandler) : (maybeHandler as MessageHandler);

    const h = this.connections[room]?.handlers[evtType];
    if (h) this.connections[room]!.handlers[evtType] = h.filter((fn) => fn !== cb);
  }

  /* ------------------------- dispatch ------------------------------ */
  private dispatch(room: string, msg: WSMessage): void {
    const list = this.connections[room]?.handlers[msg.type] ?? [];
    list.forEach((h) => {
      try {
        h(msg);
      } catch (err) {
        console.error(`Handler error for ${msg.type}:`, err);
      }
    });

    if (msg.type === "error") {
      console.error("WebSocket server error:", msg);
    }
  }

  /* ------------------------- helpers ------------------------------- */
  public isConnected(entity: string, id: string): boolean;
  public isConnected(room: string): boolean;
  public isConnected(roomOrEntity: string, maybeId?: string): boolean {
    const { room } = this.parseRoom(roomOrEntity, maybeId);
    return this.connections[room]?.isConnected ?? false;
  }

  /* Domain convenience wrappers (kept from original) ---------------- */
  public getActiveUsers(entity: string, id: string): void {
    this.send(entity, id, { type: "get_active_users" });
  }
  public sendComment(entity: string, id: string, content: string, parentId?: string): void {
    this.send(entity, id, { type: "comment", content, parent_id: parentId });
  }
  public editComment(entity: string, id: string, commentId: string, content: string): void {
    this.send(entity, id, { type: "edit_comment", comment_id: commentId, content });
  }
  public deleteComment(entity: string, id: string, commentId: string): void {
    this.send(entity, id, { type: "delete_comment", comment_id: commentId });
  }
  public toggleReaction(
    entity: string,
    id: string,
    commentId: string,
    reactionType: string
  ): void {
    this.send(entity, id, {
      type: "reaction",
      comment_id: commentId,
      reaction_type: reactionType,
    });
  }
  public setTypingIndicator(entity: string, id: string, isTyping: boolean): void {
    this.send(entity, id, { type: "typing", is_typing: isTyping });
  }
}

export const websocketService = new WebSocketService();
export default websocketService;
