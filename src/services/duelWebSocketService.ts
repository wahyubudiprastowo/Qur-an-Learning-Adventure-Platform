/**
 * Duel WebSocket Service - Real-Time Multiplayer Client for Duel Kuis Santri
 * Handles WebSocket connection, room synchronization, quick matching, and local fallback.
 */

export interface DuelPlayer {
  id: string;
  name: string;
  avatar: string;
  isHost: boolean;
  isReady: boolean;
  hp: number;
  score: number;
  comboStreak: number;
  schoolName?: string;
}

export interface DuelRoomState {
  roomCode: string;
  status: 'waiting' | 'countdown' | 'in_game' | 'round_result' | 'game_over';
  category: string;
  host: DuelPlayer;
  guest?: DuelPlayer;
  currentRound: number;
  totalRounds: number;
  timeLeft: number;
  winnerId?: string;
  isDraw?: boolean;
}

export type DuelSocketEventHandler = (event: string, data: any) => void;

export class DuelWebSocketService {
  private socket: WebSocket | null = null;
  private listeners: Set<DuelSocketEventHandler> = new Set();
  private reconnectTimeout: any = null;
  private isConnecting: boolean = false;
  private url: string = '';

  constructor() {
    if (typeof window !== 'undefined') {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      this.url = `${protocol}//${window.location.host}/ws/duel`;
    }
  }

  public connect(): void {
    if (typeof window === 'undefined') return;
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.isConnecting = true;
    try {
      this.socket = new WebSocket(this.url);

      this.socket.onopen = () => {
        this.isConnecting = false;
        this.notify('CONNECTED', { status: 'connected' });
      };

      this.socket.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed && parsed.type) {
            this.notify(parsed.type, parsed.payload);
          }
        } catch (e) {
          console.warn('[Duel WS Message Parse Error]', e);
        }
      };

      this.socket.onerror = (err) => {
        console.warn('[Duel WS Error]', err);
        this.notify('ERROR', { error: 'Gagal terhubung ke server duel' });
      };

      this.socket.onclose = () => {
        this.isConnecting = false;
        this.socket = null;
        this.notify('DISCONNECTED', { status: 'disconnected' });
      };
    } catch (e) {
      this.isConnecting = false;
      this.notify('ERROR', { error: 'Koneksi WebSocket tidak tersedia' });
    }
  }

  public disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  public isConnected(): boolean {
    return !!this.socket && this.socket.readyState === WebSocket.OPEN;
  }

  public send(type: string, payload: any = {}): boolean {
    if (!this.isConnected()) {
      return false;
    }
    try {
      this.socket!.send(JSON.stringify({ type, payload }));
      return true;
    } catch (e) {
      console.warn('[Duel WS Send Error]', e);
      return false;
    }
  }

  public createRoom(player: { id: string; name: string; avatar: string; schoolName?: string }, category: string = 'mix'): boolean {
    return this.send('CREATE_ROOM', { ...player, category });
  }

  public joinRoom(roomCode: string, player: { id: string; name: string; avatar: string; schoolName?: string }): boolean {
    return this.send('JOIN_ROOM', { roomCode: roomCode.trim().toUpperCase(), ...player });
  }

  public quickMatch(player: { id: string; name: string; avatar: string; schoolName?: string }): boolean {
    return this.send('QUICK_MATCH', player);
  }

  public toggleReady(roomCode: string, isReady: boolean): boolean {
    return this.send('TOGGLE_READY', { roomCode, isReady });
  }

  public submitAnswer(roomCode: string, roundIndex: number, optionIndex: number, timeSpent: number): boolean {
    return this.send('SUBMIT_ANSWER', { roomCode, roundIndex, optionIndex, timeSpent });
  }

  public sendEmote(roomCode: string, emote: string): boolean {
    return this.send('SEND_EMOTE', { roomCode, emote });
  }

  public leaveRoom(roomCode: string): boolean {
    return this.send('LEAVE_ROOM', { roomCode });
  }

  public subscribe(handler: DuelSocketEventHandler): () => void {
    this.listeners.add(handler);
    return () => {
      this.listeners.delete(handler);
    };
  }

  private notify(event: string, data: any): void {
    this.listeners.forEach((fn) => {
      try {
        fn(event, data);
      } catch (err) {
        console.error('[Duel Listener Error]', err);
      }
    });
  }
}

// Global Singleton Instance
export const globalDuelSocket = new DuelWebSocketService();
