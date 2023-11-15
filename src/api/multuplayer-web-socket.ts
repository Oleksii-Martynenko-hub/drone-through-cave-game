import { Point } from 'src/types/common';

type IncomeEvents = 'joined' | 'left' | 'ready' | 'started' | 'updated';

type IncomeEventData<T extends IncomeEvents = 'joined'> = {
  type: IncomeEvents;
  params: Params[T];
};

type Params = {
  joined: Record<'playerId', string>;
  left: Record<'playerId', string>;
  ready: Record<'playerId', string>;
  started: Record<'startTime', number>;
  updated: Record<'positions', { [key: string]: Point }>;
};

type IncomeEventParams<T extends IncomeEvents = 'joined'> = Params[T];

export class MultiplayerWebSocket {
  protected isConnected = false;
  protected socket: WebSocket = {} as WebSocket;
  protected roomId: string | null = null;

  constructor(protected readonly playerId: string) {}

  connect() {
    try {
      const wsURL = import.meta.env.VITE_MULTIPLAYER_WEBSOCKET_LOCAL_URL;
      this.socket = new WebSocket(`${wsURL}`);
      this.isConnected = true;
    } catch (error) {
      console.log('MultiplayerWebSocket connect error:', error);
    }
  }

  onEventHandler() {
    if (this.isConnected) {
      this.socket.onmessage = (event) => {
        const data = JSON.parse(event.data) as IncomeEventData;
        console.log(data);
        const { type, params } = data;

        const events: { [K in IncomeEvents]: CallableFunction } = {
          joined: this.handleJoinedEvent,
          left: this.handleLeftEvent,
          ready: this.handleReadyEvent,
          started: this.handleStartedEvent,
          updated: this.handleUpdatedEvent,
        };

        (events[type] ?? this.handleDefaultEvent(type))(params);
      };
    }
  }

  createRoom(playerId: string, token: string, callback?: () => void) {
    if (!this.IsConnected) return;

    this.socket.addEventListener('open', (event) => {
      this.socket.send(`player:${playerId}-${token}`);
      callback?.();
    });
  }

  joinRoom() {}

  leaveRoom() {}

  setIsReady() {}

  clearData() {
    this.isConnected = false;
    this.roomId = null;
  }

  handleJoinedEvent(params: IncomeEventParams<'joined'>) {}
  handleLeftEvent(params: IncomeEventParams<'left'>) {}
  handleReadyEvent(params: IncomeEventParams<'ready'>) {}
  handleStartedEvent(params: IncomeEventParams<'started'>) {}
  handleUpdatedEvent(params: IncomeEventParams<'updated'>) {}

  handleDefaultEvent(type: string) {
    return () => {
      throw Error(`Error: Unknown type - ${type}!`);
    };
  }

  get IsConnected() {
    return this.isConnected;
  }

  get Socket() {
    return this.socket;
  }
}
