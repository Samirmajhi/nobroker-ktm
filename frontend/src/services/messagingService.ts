import { io, Socket } from 'socket.io-client';
import { toast } from 'react-hot-toast';

export interface Message {
  message_id: string;
  conversation_id: string;
  sender_id: string;
  message_text: string;
  message_type: string;
  is_read: boolean;
  created_at: string;
  sender_name: string;
  sender_avatar?: string;
  sender_role?: string;
}

export interface Conversation {
  conversation_id: string;
  listing_id: string;
  listing_title: string;
  listing_price: number;
  owner_id: string;
  other_participant_name: string;
  other_participant_id: string;
  other_participant_avatar?: string;
  other_participant_role?: string;
  last_message?: string;
  last_message_time?: string;
  last_message_sender_id?: string;
  unread_count: number;
}

export interface Notification {
  notification_id: string;
  user_id: string;
  title: string;
  message: string;
  read_status: boolean;
  notification_type: string;
  related_id?: string;
  created_at: string;
}

class MessagingService {
  private socket: Socket | null = null;
  private isConnected = false;
  private messageHandlers: ((message: Message) => void)[] = [];
  private notificationHandlers: ((notification: Notification) => void)[] = [];
  private typingHandlers: ((data: { conversationId: string; isTyping: boolean }) => void)[] = [];
  private readReceiptHandlers: ((data: { conversationId: string }) => void)[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor() {
    this.initializeSocket();
  }

  private initializeSocket() {
    try {
      this.socket = io('http://localhost:5000', {
        transports: ['websocket', 'polling'],
        autoConnect: false,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        timeout: 20000,
      });

      this.setupSocketEventHandlers();
    } catch (error) {
      console.error('Failed to initialize socket:', error);
    }
  }

  private setupSocketEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('🔌 Connected to messaging server');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.authenticate();
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 Disconnected from messaging server');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔌 Connection error:', error);
      this.isConnected = false;
      this.handleReconnection();
    });

    this.socket.on('authenticated', (data) => {
      console.log('✅ Socket authenticated:', data);
    });

    this.socket.on('auth_error', (error) => {
      console.error('❌ Socket authentication error:', error);
      toast.error('Authentication failed. Please log in again.');
    });

    this.socket.on('new_message', (message: Message) => {
      console.log('📨 New message received:', message);
      this.messageHandlers.forEach(handler => handler(message));
      
      // Show toast notification
      toast.success(`New message from ${message.sender_name}`, {
        duration: 4000,
        position: 'top-right',
      });
    });

    this.socket.on('owner_notification', (data) => {
      console.log('🔔 Owner notification:', data);
      if (data.type === 'new_message') {
        toast.success('New message received!', {
          duration: 4000,
          position: 'top-right',
        });
      }
    });

    this.socket.on('user_typing', (data) => {
      console.log('⌨️ User typing:', data);
      this.typingHandlers.forEach(handler => handler(data));
    });

    this.socket.on('message_read', (data) => {
      console.log('✅ Message read receipt:', data);
      this.readReceiptHandlers.forEach(handler => handler(data));
    });

    this.socket.on('message_sent', (data) => {
      console.log('✅ Message sent successfully:', data);
    });

    this.socket.on('message_error', (error) => {
      console.error('❌ Message error:', error);
      toast.error(error.message || 'Failed to send message');
    });
  }

  private handleReconnection() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        if (this.socket) {
          this.socket.connect();
        }
      }, 2000 * this.reconnectAttempts);
    } else {
      console.error('❌ Max reconnection attempts reached');
      toast.error('Connection lost. Please refresh the page.');
    }
  }

  private authenticate() {
    const token = localStorage.getItem('token');
    if (token && this.socket) {
      this.socket.emit('authenticate', { token });
    }
  }

  public connect() {
    if (this.socket && !this.isConnected) {
      this.socket.connect();
    }
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.isConnected = false;
    }
  }

  public sendMessage(conversationId: string, messageText: string, receiverId: string, listingId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('send_message', {
        conversationId,
        messageText,
        receiverId,
        listingId
      });
    } else {
      console.error('Socket not connected');
      toast.error('Connection lost. Please refresh the page.');
    }
  }

  public startTyping(conversationId: string, receiverId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing_start', { conversationId, receiverId });
    }
  }

  public stopTyping(conversationId: string, receiverId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing_stop', { conversationId, receiverId });
    }
  }

  public markMessageRead(conversationId: string, senderId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('mark_read', { conversationId, senderId });
    }
  }

  public onNewMessage(handler: (message: Message) => void) {
    this.messageHandlers.push(handler);
    return () => {
      const index = this.messageHandlers.indexOf(handler);
      if (index > -1) {
        this.messageHandlers.splice(index, 1);
      }
    };
  }

  public onNotification(handler: (notification: Notification) => void) {
    this.notificationHandlers.push(handler);
    return () => {
      const index = this.notificationHandlers.indexOf(handler);
      if (index > -1) {
        this.notificationHandlers.splice(index, 1);
      }
    };
  }

  public onTyping(handler: (data: { conversationId: string; isTyping: boolean }) => void) {
    this.typingHandlers.push(handler);
    return () => {
      const index = this.typingHandlers.indexOf(handler);
      if (index > -1) {
        this.typingHandlers.splice(index, 1);
      }
    };
  }

  public onReadReceipt(handler: (data: { conversationId: string }) => void) {
    this.readReceiptHandlers.push(handler);
    return () => {
      const index = this.readReceiptHandlers.indexOf(handler);
      if (index > -1) {
        this.readReceiptHandlers.splice(index, 1);
      }
    };
  }

  public getConnectionStatus() {
    return this.isConnected;
  }

  public getSocketId() {
    return this.socket?.id;
  }
}

// Create singleton instance
const messagingService = new MessagingService();

export default messagingService;
