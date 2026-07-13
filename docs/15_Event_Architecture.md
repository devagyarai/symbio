# Event & Real-Time Architecture

## Overview
To provide a seamless, zero-refresh collaborative experience, Symbio utilizes an event-driven real-time architecture powered by **Socket.IO**.

## Connection & Authentication
- Clients connect to the WebSocket server using their JWT.
- Upon connection, the server validates the token and extracts the user's ID and associated `orgId`.
- **Security:** If the token is invalid or missing, the connection is immediately refused.

## Room Topology
Socket.IO "rooms" are used to broadcast events only to relevant, authorized users.
- `org:[orgId]`: General organization-wide events (e.g., new member joined).
- `project:[projectId]`: Project-specific events (e.g., task moved, new task created).
- `user:[userId]`: Direct notifications intended for a specific user (e.g., mentioned in a comment).

## Standard Event Dictionary

### Emitted by Server (Client Listens)
- `task.created`: Broadcast to `project:[projectId]`
- `task.updated`: Broadcast to `project:[projectId]`
- `task.deleted`: Broadcast to `project:[projectId]`
- `comment.added`: Broadcast to `project:[projectId]`
- `notification.new`: Broadcast to `user:[userId]`

### Emitted by Client (Server Listens)
*(Note: Most data mutations happen via REST API. Client emissions are primarily for transient state).*
- `typing.start`: Broadcasts typing indicators to a specific task thread.
- `typing.stop`: Clears typing indicators.

## Scaling
To ensure the real-time server can scale horizontally across multiple instances, we employ the `@socket.io/redis-adapter`. This allows an event emitted on Node A to be broadcast to users connected to Node B via Redis Pub/Sub.
