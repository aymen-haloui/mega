import io, { Socket } from 'socket.io-client';

// WebSocket configuration
const WS_URL = process.env.REACT_APP_WS_URL || 'http://localhost:3001';

// WebSocket service class
class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  // Connect to WebSocket server
  connect(token?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = io(WS_URL, {
          auth: {
            token: token || localStorage.getItem('authToken')
          },
          transports: ['websocket', 'polling']
        });

        this.socket.on('connect', () => {
          console.log('Connected to WebSocket server');
          this.reconnectAttempts = 0;
          resolve();
        });

        this.socket.on('connect_error', (error) => {
          console.error('WebSocket connection error:', error);
          reject(error);
        });

        this.socket.on('disconnect', (reason) => {
          console.log('Disconnected from WebSocket server:', reason);
          this.handleReconnect();
        });

        this.setupEventListeners();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Disconnect from WebSocket server
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Join branch room
  joinBranch(branchId: string): void {
    if (this.socket) {
      this.socket.emit('join-branch', branchId);
    }
  }

  // Leave branch room
  leaveBranch(branchId: string): void {
    if (this.socket) {
      this.socket.emit('leave-branch', branchId);
    }
  }

  // Setup event listeners
  private setupEventListeners(): void {
    if (!this.socket) return;

    // New order event
    this.socket.on('new-order', (order) => {
      this.emit('new-order', order);
    });

    // Order status update event
    this.socket.on('order-status-update', (update) => {
      this.emit('order-status-update', update);
    });

    // Ingredient availability update event
    this.socket.on('ingredient-availability-update', (update) => {
      this.emit('ingredient-availability-update', update);
    });

    // System notification event
    this.socket.on('system-notification', (notification) => {
      this.emit('system-notification', notification);
    });

    // Error event
    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
      this.emit('error', error);
    });
  }

  // Handle reconnection
  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.emit('reconnect-failed');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    setTimeout(() => {
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      this.connect();
    }, delay);
  }

  // Emit custom event
  private emit(event: string, data: any): void {
    const customEvent = new CustomEvent(event, { detail: data });
    window.dispatchEvent(customEvent);
  }

  // Check if connected
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Get connection status
  getConnectionStatus(): 'connected' | 'disconnected' | 'connecting' {
    if (!this.socket) return 'disconnected';
    if (this.socket.connected) return 'connected';
    return 'connecting';
  }
}

// Create singleton instance
const webSocketService = new WebSocketService();

// Export service and helper functions
export default webSocketService;

// WebSocket event listeners
export const useWebSocket = () => {
  const addEventListener = (event: string, callback: (data: any) => void) => {
    const handler = (e: CustomEvent) => callback(e.detail);
    window.addEventListener(event, handler as EventListener);
    
    return () => {
      window.removeEventListener(event, handler as EventListener);
    };
  };

  return {
    connect: (token?: string) => webSocketService.connect(token),
    disconnect: () => webSocketService.disconnect(),
    joinBranch: (branchId: string) => webSocketService.joinBranch(branchId),
    leaveBranch: (branchId: string) => webSocketService.leaveBranch(branchId),
    isConnected: () => webSocketService.isConnected(),
    getConnectionStatus: () => webSocketService.getConnectionStatus(),
    addEventListener,
  };
};

// WebSocket event types
export const WS_EVENTS = {
  NEW_ORDER: 'new-order',
  ORDER_STATUS_UPDATE: 'order-status-update',
  INGREDIENT_AVAILABILITY_UPDATE: 'ingredient-availability-update',
  SYSTEM_NOTIFICATION: 'system-notification',
  ERROR: 'error',
  RECONNECT_FAILED: 'reconnect-failed',
} as const;

// WebSocket hook for React components
export const useWebSocketEvents = () => {
  const ws = useWebSocket();

  return {
    // Order events
    onNewOrder: (callback: (order: any) => void) => 
      ws.addEventListener(WS_EVENTS.NEW_ORDER, callback),
    
    onOrderStatusUpdate: (callback: (update: any) => void) => 
      ws.addEventListener(WS_EVENTS.ORDER_STATUS_UPDATE, callback),
    
    // Ingredient events
    onIngredientAvailabilityUpdate: (callback: (update: any) => void) => 
      ws.addEventListener(WS_EVENTS.INGREDIENT_AVAILABILITY_UPDATE, callback),
    
    // System events
    onSystemNotification: (callback: (notification: any) => void) => 
      ws.addEventListener(WS_EVENTS.SYSTEM_NOTIFICATION, callback),
    
    onError: (callback: (error: any) => void) => 
      ws.addEventListener(WS_EVENTS.ERROR, callback),
    
    onReconnectFailed: (callback: () => void) => 
      ws.addEventListener(WS_EVENTS.RECONNECT_FAILED, callback),
    
    // Connection methods
    connect: ws.connect,
    disconnect: ws.disconnect,
    joinBranch: ws.joinBranch,
    leaveBranch: ws.leaveBranch,
    isConnected: ws.isConnected,
    getConnectionStatus: ws.getConnectionStatus,
  };
};
