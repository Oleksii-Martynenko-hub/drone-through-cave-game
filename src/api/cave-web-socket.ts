import { WALL_HEIGHT } from 'src/constants';

export class CaveWebSocket {
  protected isConnected = false;
  protected socket: WebSocket = {} as WebSocket;
  protected isEnoughWalls = false;
  protected amountOfWallsForWindowHeight = 0;
  protected prevWallsDataLength = 0;
  protected caveWallsData: [number, number][];

  constructor() {
    this.resetWindowHeight();

    this.caveWallsData = [];
  }

  connect() {
    try {
      const wsURL = import.meta.env.VITE_WEBSOCKET_URL;
      this.socket = new WebSocket(`${wsURL}/cave`);
      this.isConnected = true;
    } catch (error) {
      console.log('CaveWebSocket connect error:', error);
    }
  }

  open(playerId: string, token: string, callback?: () => void) {
    if (!this.IsConnected) return;

    this.socket.addEventListener('open', (event) => {
      this.socket.send(`player:${playerId}-${token}`);
      callback?.();
    });
  }

  getCaveWallsData(
    onWallLoaded: (wallPositions: [number, number][]) => void,
    onAdditionalWallLoaded: (
      additionalWallPositions: [number, number][],
    ) => void,
    onFinished?: (allWallPositions: [number, number][]) => void,
  ) {
    if (!this.IsConnected) return;

    this.socket.addEventListener('message', (event) => {
      if (event.data === 'finished') {
        onAdditionalWallLoaded(this.caveWallsData);
        this.prevWallsDataLength = this.caveWallsData.length;

        if (onFinished) onFinished(this.caveWallsData);

        return;
      }

      const wallPosition = this.checkFormatSaveWall(event.data as string);

      this.caveWallsData.push(wallPosition as [number, number]);

      if (this.checkIsEnoughWalls()) {
        this.isEnoughWalls = true;
        onWallLoaded(this.caveWallsData);
        this.prevWallsDataLength = this.caveWallsData.length;
      }

      if (this.checkIsEnoughAdditionalWalls()) {
        onAdditionalWallLoaded(this.caveWallsData);
        this.prevWallsDataLength = this.caveWallsData.length;
      }
    });
  }

  clearData() {
    this.isConnected = false;
    this.isEnoughWalls = false;
    this.prevWallsDataLength = 0;
    this.caveWallsData = [];
  }

  private checkIsEnoughAdditionalWalls() {
    return (
      this.isEnoughWalls &&
      this.caveWallsData.length - this.prevWallsDataLength >= 50
    );
  }

  private checkIsEnoughWalls() {
    return (
      !this.isEnoughWalls &&
      this.caveWallsData.length >= this.amountOfWallsForWindowHeight
    );
  }

  private checkFormatSaveWall(data: string) {
    const wallPosition = data.split(',').map((p) => parseInt(p));

    if (wallPosition.length === 2 && wallPosition.every((n) => !isNaN(n))) {
      return wallPosition;
    }
  }

  resetWindowHeight() {
    const heightOffset = WALL_HEIGHT * 2;

    this.amountOfWallsForWindowHeight =
      Math.floor((window.innerHeight + heightOffset) / WALL_HEIGHT) + 1;
  }

  get IsConnected() {
    return this.isConnected;
  }

  get Socket() {
    return this.socket;
  }
}
