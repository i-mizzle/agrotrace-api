import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import log from '../logger';
import { decode } from '../utils/jwt.utils';

interface WebSocketMessage {
    business: string;
    user?: string;
    event: string;
    data: any;
}

interface AuthenticatedSocket extends Socket {
    userId?: string;
    businessId?: string;
}

interface JWTPayload {
    _id: string;
    business?: string;
    session?: string;
    [key: string]: any;
}

class WebSocketService {
    private io: SocketIOServer | null = null;

    /**
     * Initialize WebSocket server
     */
    initialize(httpServer: HTTPServer): void {
        this.io = new SocketIOServer(httpServer, {
            cors: {
                origin: '*', // Configure based on your CORS requirements
                methods: ['GET', 'POST'],
                credentials: true
            },
            path: '/ws'
        });

        this.io.on('connection', (socket: AuthenticatedSocket) => {
            log.info(`WebSocket client connected: ${socket.id}`);

            // Authenticate socket connection
            this.authenticateSocket(socket);

            // Handle manual room join requests from client
            socket.on('join_room', (data: any, callback?: Function) => {
                log.debug(`Join room request from socket ${socket.id}:`, data);
                
                if (!socket.userId) {
                    log.warn(`Socket ${socket.id} attempted to join room without authentication`);
                    if (typeof callback === 'function') callback({ success: false, message: 'Not authenticated' });
                    return;
                }

                // Extract businessId from data or use existing socket.businessId
                let businessId = data?.businessId || socket.businessId;
                
                if (!businessId) {
                    log.error(`Socket ${socket.id} join_room failed: no businessId provided and none in socket context`);
                    if (typeof callback === 'function') callback({ success: false, message: 'businessId is required' });
                    return;
                }

                const room = `business:${businessId}`;
                socket.join(room);
                socket.businessId = businessId;

                // Send acknowledgment via callback if provided
                if (typeof callback === 'function') {
                    callback({ success: true, room, businessId, message: `Successfully joined room ${room}` });
                }

                // Also emit room_joined event for redundancy
                socket.emit('room_joined', { room, businessId, message: 'Successfully joined business room' });
                log.info(`Socket ${socket.id} manually joined room: ${room}`);
            });

            // Ping handler for testing connectivity
            socket.on('ping', (data: any, callback?: Function) => {
                if (typeof callback === 'function') {
                    callback({ pong: true, timestamp: new Date().toISOString() });
                }
                socket.emit('pong', { timestamp: new Date().toISOString() });
                log.debug(`Ping received from socket ${socket.id}`);
            });

            socket.on('disconnect', () => {
                log.info(`WebSocket client disconnected: ${socket.id}`);
            });

            socket.on('error', (error) => {
                log.error('WebSocket error:', error);
            });
        });

        log.info('WebSocket server initialized');
    }

    /**
     * Authenticate socket connection using JWT token
     */
    private authenticateSocket(socket: AuthenticatedSocket): void {
        const token = socket.handshake.auth?.token || socket.handshake.query?.token;

        if (!token) {
            log.warn(`WebSocket connection ${socket.id} missing authentication token`);
            socket.disconnect();
            return;
        }

        const { decoded, expired } = decode(token as string);

        if (!decoded || expired) {
            log.warn(`WebSocket connection ${socket.id} has invalid or expired token`);
            socket.disconnect();
            return;
        }

        // Type assertion for JWT payload
        const payload = decoded as JWTPayload;

        // Debug log JWT payload
        log.debug(`Decoded JWT payload for socket ${socket.id}:`, payload);

        // Attach user info to socket
        socket.userId = payload._id;
        
        // Extract business ID from token if available
        if (payload.business) {
            socket.businessId = payload.business;
        }

        // Join user-specific room
        socket.join(`user:${socket.userId}`);

        // Join business-specific room if business context exists
        if (socket.businessId) {
            socket.join(`business:${socket.businessId}`);
            log.info(`Socket ${socket.id} auto-joined business room: ${socket.businessId}`);
        } else {
            log.info(`Socket ${socket.id} authenticated but no business context - waiting for manual join_room event`);
        }

        log.info(`Socket ${socket.id} authenticated for user: ${socket.userId}`);
    }

    /**
     * Send message to a specific business
     */
    sendToBusiness(businessId: string, event: string, data: any): void {
        if (!this.io) {
            log.error('WebSocket server not initialized');
            return;
        }

        const room = `business:${businessId}`;
        this.io.to(room).emit(event, data);
        log.info(`Sent ${event} to business ${businessId}`);
    }

    /**
     * Send message to a specific user
     */
    sendToUser(userId: string, event: string, data: any): void {
        if (!this.io) {
            log.error('WebSocket server not initialized');
            return;
        }

        const room = `user:${userId}`;
        this.io.to(room).emit(event, data);
        log.info(`Sent ${event} to user ${userId}`);
    }

    /**
     * Send message to a specific user within a business context
     */
    sendToBusinessUser(businessId: string, userId: string, event: string, data: any): void {
        if (!this.io) {
            log.error('WebSocket server not initialized');
            return;
        }

        // Send to user room only (user must be in business context)
        const room = `user:${userId}`;
        this.io.to(room).emit(event, {
            ...data,
            businessId // Include business context in data
        });
        log.info(`Sent ${event} to user ${userId} in business ${businessId}`);
    }

    /**
     * Broadcast message to all connected clients
     */
    broadcast(event: string, data: any): void {
        if (!this.io) {
            log.error('WebSocket server not initialized');
            return;
        }

        this.io.emit(event, data);
        log.info(`Broadcast ${event} to all clients`);
    }

    /**
     * Send targeted message based on WebSocketMessage interface
     */
    send(message: WebSocketMessage): void {
        const { business, user, event, data } = message;

        if (user) {
            this.sendToBusinessUser(business, user, event, data);
        } else {
            this.sendToBusiness(business, event, data);
        }
    }

    /**
     * Get Socket.IO server instance
     */
    getIO(): SocketIOServer | null {
        return this.io;
    }

    /**
     * Check if WebSocket server is initialized
     */
    isInitialized(): boolean {
        return this.io !== null;
    }
}

// Export singleton instance
export const websocketService = new WebSocketService();
export default websocketService;
