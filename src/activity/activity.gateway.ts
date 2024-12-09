import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    MessageBody,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  import { Logger } from '@nestjs/common';
  
  @WebSocketGateway({
    namespace: '/ws', 
    transports: ['websocket', 'polling'],  
  })
  export class ActivityGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
  {
    @WebSocketServer()
    server: Server;
  
    private logger: Logger = new Logger('ActivityGateway');
  
    afterInit(server: Server) {
  this.logger.log('WebSocket initialized');
  this.logger.log('Emitting activity event');
  server.emit('activity', 'Test message: WebSocket connection is working!');
}

  
    handleConnection(client: Socket) {
      this.logger.log(`Client connected: ${client.id}`);
    }
  
    handleDisconnect(client: Socket) {
      this.logger.log(`Client disconnected: ${client.id}`);
    }
  
    @SubscribeMessage('activity')
    handleActivity(@MessageBody() data: string): string {
      // Handle incoming activity message
      return `Received activity: ${data}`;
    }
  
    // This method can be used to emit activity to all clients
    sendActivity(message: string) {
      this.server.emit('activity', message); // Broadcast the message to all connected clients
    }
  }
  