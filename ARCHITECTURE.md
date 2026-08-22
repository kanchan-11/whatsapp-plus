# ⚡ InstantPing — System Architecture & Technical Documentation

> **Complete end-to-end technical reference and architecture manual for InstantPing (formerly WhatsApp Plus): A production-grade real-time messaging, media sharing, and WebRTC group audio/video calling platform.**

---

## 📑 Table of Contents

1. [System Overview & Architecture Diagram](#1-system-overview--architecture-diagram)
2. [Technology Stack & Decision Rationale](#2-technology-stack--decision-rationale)
3. [Frontend Architecture & Component Hierarchy](#3-frontend-architecture--component-hierarchy)
4. [Backend Architecture & Layered Services](#4-backend-architecture--layered-services)
5. [Real-Time Communication & WebRTC Mesh Engine](#5-real-time-communication--webrtc-mesh-engine)
6. [Database Schema & Data Models](#6-database-schema--data-models)
7. [Security & Authentication Architecture](#7-security--authentication-architecture)
8. [Production Deployment & CI/CD Pipeline](#8-production-deployment--cicd-pipeline)

---

## 1. System Overview & Architecture Diagram

InstantPing is built as a **decoupled, real-time client-server architecture** designed for high throughput, sub-millisecond signaling latency, and peer-to-peer audio/video streaming.

```
                              ┌───────────────────────────────────────────────┐
                              │                 Web Client                     │
                              │        (React 18 + Vite + Tailwind)           │
                              └───────────────┬───────────────────────────────┘
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    │ HTTPS / REST            │ WSS / STOMP             │ WebRTC P2P
                    │ (JSON CRUD & Files)     │ (Signaling & Messages)  │ (Audio/Video Mesh)
                    ▼                         ▼                         ▼
        ┌───────────────────────┐ ┌───────────────────────┐ ┌───────────────────────┐
        │     Nginx Ingress     │ │     Nginx Ingress     │ │    Browser Peers      │
        │  (Reverse Proxy / SSL)│ │ (WebSocket Upgrades)  │ │ (Mesh Audio / Video)  │
        └───────────┬───────────┘ └───────────┬───────────┘ └───────────────────────┘
                    │                         │
                    ▼                         ▼
        ┌─────────────────────────────────────────────────┐
        │              Spring Boot Backend                │
        │  (REST Controllers, Spring Security, Services)   │
        │  (In-Memory Active Call Tracker & STOMP Broker) │
        └───────────────┬─────────────────────────┬───────┘
                        │                         │
                        ▼                         ▼
            ┌───────────────────────┐ ┌───────────────────────┐
            │   Persistent Disk     │ │   H2 / Relational     │
            │   (Media & Uploads)   │ │       Database        │
            └───────────────────────┘ └───────────────────────┘
```

---

## 2. Technology Stack & Decision Rationale

### 🌐 Frontend

| Technology | Purpose | Why It Was Chosen |
| :--- | :--- | :--- |
| **React 18** | UI Framework | Component-based model, reactive state updates, concurrent rendering, and rich ecosystem for complex real-time applications. |
| **Vite** | Build Tool & Bundler | Instant hot module replacement (HMR), lightning-fast ES build pipeline, and optimal Rollup production minification. |
| **Tailwind CSS v4** | Utility Styling | Rapid UI prototyping, zero runtime overhead, custom design tokens for glassmorphism, responsive breakpoints, and animations. |
| **@stomp/stompjs & SockJS** | WebSocket Client | Robust STOMP protocol abstraction over WebSockets with automatic reconnection, heartbeat keep-alives, and SockJS HTTP fallback. |
| **WebRTC API (Browser Native)** | Audio & Video Streaming | Industry-standard zero-plugin peer-to-peer encrypted media streaming with hardware acceleration and low-latency data channels. |
| **Web Audio API** | Audio Synthesis | Generates real-time ringtones, dial tones, and message dings programmatically without requiring external audio files or bandwidth. |
| **Lucide React** | Iconography | Clean, consistent, lightweight SVG icon system with tree-shaking support. |
| **Axios** | HTTP Client | Promise-based REST client with automated JWT request interceptors and centralized error response handling. |
| **Date-fns** | Timestamp Formatting | Modular date manipulation for human-friendly timestamps ("Today, 1:04 PM", "Yesterday", "MMM d"). |

---

### ☕ Backend

| Technology | Purpose | Why It Was Chosen |
| :--- | :--- | :--- |
| **Java 21 / 26 (LTS)** | Programming Language | High performance, strict type safety, modern language features (Pattern Matching, Virtual Threads), and enterprise reliability. |
| **Spring Boot 3.3.x** | Application Framework | Robust ecosystem, rapid dependency injection, production-grade metrics, and integrated security. |
| **Spring WebSocket / STOMP** | Pub/Sub Message Broker | Simplifies message routing with structured destinations (`/topic`, `/app`), user queues (`/user/queue`), and connection lifecycles. |
| **Spring Security 6 & JJWT** | Authentication & RBAC | Stateless JWT validation, BCrypt password hashing, filter chains, and granular method-level authorization. |
| **Spring Data JPA & Hibernate** | ORM Data Access | Type-safe repository abstraction, automatic schema generation (`ddl-auto: update`), and relational mapping. |
| **H2 Database (File Mode)** | Relational Storage | Zero-dependency, lightweight, embedded relational database persisted to disk (`./data/chatdb.mv.db`), perfectly suited for portable deployments. |
| **Maven** | Dependency Management | Standardized build lifecycle, multi-stage Docker caching, and automated testing. |

---

### 🚢 DevOps & Infrastructure

| Technology | Purpose | Why It Was Chosen |
| :--- | :--- | :--- |
| **Docker & Docker Compose** | Containerization | Isolated multi-stage container builds ensuring identical behavior across local dev and production servers. |
| **Nginx** | Reverse Proxy & Web Server | Handles SSL termination, gzip compression, static SPA routing (`try_files`), and WebSocket upgrade headers. |
| **Certbot (Let's Encrypt)** | SSL / HTTPS Automation | Automatically issues and renews free trusted SSL certificates required for browser camera/microphone permissions. |
| **GitHub Actions** | CI/CD Automation | Continuous integration (automated Maven & Vite builds) and automated SSH continuous deployment to production. |

---

## 3. Frontend Architecture & Component Hierarchy

The frontend follows a **Context-Driven State Architecture** where global concerns (Authentication, WebSockets, Calls) are managed by dedicated React Context providers.

```
App.jsx (AuthProvider ➔ SocketProvider ➔ CallProvider)
 ├── NavigationRail (Desktop Left Rail / Mobile Bottom Dock)
 ├── Sidebar (Chats List, Filters, New Chat / New Group Modals)
 ├── CallsSidebar (Call History Logs, Missed Call Filters, Quick Call)
 ├── ChatArea
 │    ├── ChatHeader (Back Button, Online Presence, Call Actions, Active Call Pulse)
 │    ├── MessageList
 │    │    └── MessageBubble
 │    │         ├── CustomAudioPlayer (Interactive Waveform, Scrubber, Speed Toggle)
 │    │         ├── Media Attachment (Image Lightbox, Video Player, File Download)
 │    │         └── Read Receipts (Sent ✓, Delivered ✓✓, Read ✓✓)
 │    └── MessageInput (Textarea, Emoji Picker, Attachment Dropdown, Voice Note Recorder)
 ├── IncomingCallModal (Melodic Ringtone, Caller Avatar, Accept/Reject)
 ├── CallOverlay (Multi-User Video Grid, PIP Selfie Preview, Controls, Roster Drawer)
 └── ProfileModal & GroupInfoModal
```

### Context Roles:
1. **`AuthContext.jsx`**: Manages user session state, JWT tokens in localStorage, automatic expiration logout, and profile updates.
2. **`SocketContext.jsx`**: Initializes STOMP connection over `wss://`, tracks online user presence via `/topic/presence`, and provides helper functions (`subscribe`, `publish`, `sendTyping`).
3. **`CallContext.jsx`**: Manages the complete WebRTC lifecycle, local/remote media streams, peer connections, group call session joining, camera/mic toggling, screen sharing, and call logging.

---

## 4. Backend Architecture & Layered Services

The backend implements a classic **Layered Architecture**:

```
Controller Layer (REST & WebSocket Endpoints)
       │
       ▼
Service Layer (Business Logic, Signaling, Active Call Tracker)
       │
       ▼
Repository Layer (Spring Data JPA)
       │
       ▼
Database (H2 File / Relational Database)
```

### Key Backend Modules:
- **`AuthController.java`**: Handles registration, login, JWT issuance, and demo user logins.
- **`ChatController.java` & `MessageController.java`**: CRUD operations for direct conversations, group rooms, message pagination, and unread counters.
- **`FileController.java` & `FileStorageService.java`**: Multipart file upload handling with safe file naming, MIME type detection, and static file streaming.
- **`CallSignalingController.java`**: Real-time STOMP messaging hub for WebRTC signaling (`OFFER`, `ANSWER`, `ICE_CANDIDATE`, `CALL_REQUEST`, `GROUP_CALL_START`, `GROUP_CALL_JOIN`, `GROUP_CALL_LEAVE`).
- **`ActiveGroupCallService.java`**: Thread-safe in-memory manager (`ConcurrentHashMap`) tracking all active group call sessions, callers, and connected participant IDs.
- **`CallLogController.java` & `CallLogService.java`**: Records call history, call types (`AUDIO`/`VIDEO`), durations, and exposes `/api/calls/active`.

---

## 5. Real-Time Communication & WebRTC Mesh Engine

### A. WebSocket / STOMP Channels Matrix

| Channel Pattern | Direction | Purpose |
| :--- | :--- | :--- |
| `/topic/presence` | Pub / Sub | Broadcasts user online/offline status changes globally. |
| `/topic/chat.{chatId}` | Pub / Sub | Delivers new messages instantly to all chat members. |
| `/topic/chat.{chatId}.typing` | Pub / Sub | Broadcasts real-time typing indicators. |
| `/topic/chat.{chatId}.status` | Pub / Sub | Syncs read receipts when messages are opened. |
| `/topic/user.{userId}.chats` | Pub / Sub | Delivers chat list updates when a new direct/group chat is created. |
| `/topic/call.{userId}` | Pub / Sub | Direct 1-on-1 WebRTC signaling & ringing notifications. |
| `/topic/chat.{chatId}.call` | Pub / Sub | Group call room signaling for participant mesh joining and leaving. |
| `/topic/group-calls` | Pub / Sub | Broadcasts active call state updates (shows ongoing call banner in chat). |

---

### B. WebRTC Calling Engine (Full Mesh Architecture)

InstantPing utilizes a **Full-Mesh WebRTC Topology** for group calling (ideal for small-to-medium teams/groups without requiring an expensive SFU/MCU server):

```
                       [Peer A (Caller)]
                          ▲         ▲
                         /           \
               Offer /  /             \  Offer /
              Answer   /               \ Answer
                      ▼                 ▼
             [Peer B (Member)] ◄───────► [Peer C (Member)]
                                Offer /
                                Answer
```

1. **Initiation**: When a user clicks *Video Call* in a group, their browser broadcasts `GROUP_CALL_START`.
2. **Fan-Out Alert**: The backend registers the active session in `ActiveGroupCallService` and fans out ringing alerts to each member's personal channel `/topic/call.{memberId}`.
3. **Banner Broadcast**: The backend broadcasts the active call state across `/topic/group-calls` so non-joined members see the top *"Ongoing Call"* banner.
4. **Mesh Join**: When Member B joins, Member B sends `GROUP_CALL_JOIN`.
5. **P2P Negotiation**: Existing participants (Peer A) create a new `RTCPeerConnection` with Peer B, create an `OFFER`, and exchange ICE candidates over WebSocket until direct media streams are established.
6. **Roster Tracking**: Every connected participant's live stream, microphone mute status, and camera state are rendered dynamically on the multi-tile call grid and roster drawer.

---

## 6. Database Schema & Data Models

```
   ┌──────────────┐          ┌───────────────────┐          ┌──────────────┐
   │    users     │ 1      * │   group_members   │ *      1 │    chats     │
   ├──────────────┤──────────├───────────────────┤──────────├──────────────┤
   │ id (PK)      │          │ id (PK)           │          │ id (PK)      │
   │ username     │          │ chat_id (FK)      │          │ name         │
   │ email        │          │ user_id (FK)      │          │ type         │
   │ password     │          │ role (ADMIN/MEMBER│          │ image        │
   │ avatar_url   │          │ joined_at         │          │ description  │
   │ display_name │          └───────────────────┘          └──────┬───────┘
   │ is_online    │                                                │ 1
   └──────┬───────┘                                                │
          │ 1                                                      │
          │                                                        │ *
          │ *        ┌───────────────────┐          ┌──────────────┴───────┐
          ├──────────┤     call_logs     │          │       messages       │
          │          ├───────────────────┤          ├──────────────────────┤
          │          │ id (PK)           │          │ id (PK)              │
          │          │ caller_id (FK)    │          │ chat_id (FK)         │
          │          │ receiver_id (FK)  │          │ sender_id (FK)       │
          │          │ call_type         │          │ content              │
          │          │ status            │          │ type (TEXT/IMG/AUDIO)│
          │          │ duration_seconds  │          │ status (SENT/READ)   │
          │          │ started_at        │          └──────────────┬───────┘
          │          └───────────────────┘                         │ 1
          │                                                        │
          │                                                        │ *
          │          ┌───────────────────┐                         │
          └──────────┤    attachments    │─────────────────────────┘
                     ├───────────────────┤
                     │ id (PK)           │
                     │ message_id (FK)   │
                     │ file_name         │
                     │ file_url          │
                     │ file_type         │
                     │ file_size         │
                     └───────────────────┘
```

---

## 7. Security & Authentication Architecture

1. **Stateless JWT Security**:
   - Authentication requests yield a cryptographically signed HMAC-SHA256 JWT containing `userId` and `username`.
   - All subsequent HTTP requests include `Authorization: Bearer <token>`, validated by `JwtAuthFilter.java`.
2. **Password Protection**: Passwords are never stored in plaintext; they are hashed using the **BCrypt Strong Hashing Algorithm** with auto-generated salts.
3. **WebRTC Secure Context Compliance**:
   - Modern browsers strictly require HTTPS (`https://`) to access `navigator.mediaDevices.getUserMedia`.
   - InstantPing runs behind Nginx with automatic SSL/TLS termination via Let's Encrypt / Certbot.
4. **CORS & Origin Isolation**: Configured in `WebConfig.java` and `WebSocketConfig.java` to prevent cross-site request forgery and unauthorized socket hijacking.

---

## 8. Production Deployment & CI/CD Pipeline

```
 [Developer / Git Push]
         │
         ▼
 [GitHub Repository: main]
         │
         ▼
 [GitHub Actions Runner]
    ├── Job 1: Build & Verify (Maven + JDK 21 & npm run build + Node 20)
    └── Job 2: SSH Deploy to Server (142.93.214.120)
            ├── git fetch & git reset --hard origin/main
            ├── docker compose up --build -d
            └── docker image prune -f
                    │
                    ▼
 [Production Docker Containers (InstantPing)]
    ├── instantping-backend (Port 8080 - Spring Boot)
    └── instantping-frontend (Port 3000 -> 80 - Nginx SPA & Reverse Proxy)
                    │
                    ▼
 [Host Nginx + Certbot SSL]
    └── https://chat.kanchan.online (Port 443 HTTPS & WSS)
```

### Production File Reference:
- **`backend/Dockerfile`**: Multi-stage container producing a minimal Alpine JRE 21 image.
- **`frontend/Dockerfile` & `frontend/nginx.conf`**: Multi-stage container compiling Vite assets into static files served by Alpine Nginx with reverse proxy rules for `/api`, `/uploads`, and `/ws`.
- **`docker-compose.yml`**: Defines the network bridge, persistent storage volumes (`app-data`, `app-uploads`), and container restart policies.
- **`.github/workflows/deploy.yml`**: Fully automated continuous integration and continuous deployment pipeline.

---

*Authored by the Google DeepMind & Antigravity Engineering Team.*
