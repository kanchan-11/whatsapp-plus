# 🏗️ InstantPing - System Architecture & Technical Design

## 1. High-Level Architectural Overview

InstantPing is architected as a distributed real-time communication platform combining **Stateless RESTful APIs**, **Full-Duplex STOMP over WebSocket Channels**, and **Peer-to-Peer WebRTC Mesh Media Pipelines**.

```mermaid
graph TD
    subgraph ClientLayer ["Client Layer (Desktop & Mobile Web)"]
        UI["React 19 SPA + Vite + Tailwind"]
        STOMPClient["@stomp/stompjs Client"]
        WebRTCClient["WebRTC PeerConnection Manager"]
    end

    subgraph Gateway ["Edge & Reverse Proxy Layer"]
        NginxHost["Nginx Host Reverse Proxy (SSL / HTTPS)"]
        NginxContainer["Nginx Static Assets Container"]
    end

    subgraph BackendLayer ["Backend Application Server (Spring Boot 3.3.4)"]
        Security["Spring Security + JWT Filter"]
        REST["Spring MVC REST Controllers"]
        WSBroker["Spring WebSocket Message Broker (STOMP)"]
        Services["Domain Business Services"]
        Repos["Spring Data JPA Repositories"]
    end

    subgraph PersistenceLayer ["Persistence & File Storage"]
        DB[(H2 Database / PostgreSQL)]
        DiskStorage["File & Audio Storage (/uploads)"]
    end

    subgraph PeerLayer ["Peer-to-Peer Mesh Network"]
        GoogleSTUN["Google STUN Servers (stun:stun.l.google.com:19302)"]
        PeerA["Peer Browser A"]
        PeerB["Peer Browser B"]
    end

    UI --> NginxHost
    NginxHost --> NginxContainer
    NginxHost --> BackendLayer

    STOMPClient <-->|WebSocket: /ws| WSBroker
    REST <--> Security <--> Services <--> Repos <--> DB
    Services <--> DiskStorage

    WebRTCClient <-->|Signaling via STOMP| WSBroker
    WebRTCClient <--> GoogleSTUN
    PeerA <===>|Direct SRTP Audio/Video Stream| PeerB
```

---

## 2. Layered Component Architecture

### 2.1 Client Layer (Frontend)
- **Framework**: React 19 SPA bundled with Vite 6.
- **Styling**: Tailwind CSS with custom dark slate palette and glassmorphism.
- **State Management**: React Context (`AuthContext`, `CallContext`, `ChatContext`) with reactive custom hooks.
- **Real-Time Client**: `@stomp/stompjs` + `sockjs-client` providing automatic exponential backoff reconnection.
- **Media Engine**: Native WebRTC `RTCPeerConnection`, `MediaRecorder` API for voice notes, and `getUserMedia` for video/audio streams.

### 2.2 Real-time Messaging & Signaling Layer (STOMP over WebSocket)
The application establishes a persistent bidirectional WebSocket connection at endpoint `/ws`.

#### STOMP Topics & Destinations:
| Destination Channel | Type | Purpose |
| :--- | :--- | :--- |
| `/topic/messages` | Broadcast | Public chat messages and broadcast alerts |
| `/topic/public` | Broadcast | Global presence and user online/offline status |
| `/queue/messages` | User Queue | Direct 1-on-1 private messaging |
| `/queue/typing` | User Queue | Real-time typing indicators |
| `/queue/call-signal` | User Queue | WebRTC ICE candidates and SDP Offer/Answer signaling |
| `/queue/group-call-signal` | User Queue | Multi-party mesh video call coordination |
| `/queue/call-action` | User Queue | Remote call controls (end call, mute, reject) |

---

## 3. WebRTC Peer-to-Peer Calling Protocol

InstantPing implements a decentralized **Full-Mesh WebRTC** topology for both 1-on-1 calls and multi-party video conferencing.

```mermaid
sequenceDiagram
    autonumber
    actor Caller as Caller (Peer A)
    participant Server as Spring STOMP Signaling
    actor Callee as Callee (Peer B)

    Caller->>Server: SEND /app/call.offer { target: "Peer B", sdp: offerSDP }
    Server->>Callee: FORWARD /queue/call-signal { type: "OFFER", caller: "Peer A" }
    Note over Callee: Callee phone rings (Audio alert)
    Callee->>Server: SEND /app/call.answer { target: "Peer A", sdp: answerSDP }
    Server->>Caller: FORWARD /queue/call-signal { type: "ANSWER", callee: "Peer B" }
    
    par ICE Candidate Exchange
        Caller->>Server: SEND /app/call.ice-candidate { candidate }
        Server->>Callee: FORWARD /queue/call-signal { candidate }
    and
        Callee->>Server: SEND /app/call.ice-candidate { candidate }
        Server->>Caller: FORWARD /queue/call-signal { candidate }
    end

    Note over Caller, Callee: Direct P2P SRTP Media Connection Established
    Caller==>>Callee: Real-time Audio / Video / Screen Share Data
```

---

## 4. Data Model & Database Schemas

```mermaid
erDiagram
    USERS ||--o{ CHAT_MESSAGES : "sends"
    USERS ||--o{ CALL_RECORDS : "initiates"
    CONVERSATIONS ||--o{ CHAT_MESSAGES : "contains"
    CONVERSATIONS ||--o{ CONVERSATION_MEMBERS : "has"
    USERS ||--o{ CONVERSATION_MEMBERS : "joins"

    USERS {
        bigint id PK
        varchar username UK
        varchar email UK
        varchar password
        varchar display_name
        text avatar_url
        varchar status_bio
        boolean is_online
        timestamp last_seen
        timestamp created_at
    }

    CHAT_MESSAGES {
        bigint id PK
        bigint sender_id FK
        bigint recipient_id FK
        bigint conversation_id FK
        text content
        varchar message_type
        varchar file_url
        varchar file_name
        bigint file_size
        varchar duration
        boolean is_read
        timestamp timestamp
    }

    CONVERSATIONS {
        bigint id PK
        varchar name
        boolean is_group
        bigint created_by_id FK
        timestamp created_at
    }

    CALL_RECORDS {
        bigint id PK
        bigint caller_id FK
        bigint receiver_id FK
        varchar call_type
        varchar status
        integer duration_seconds
        timestamp start_time
        timestamp end_time
    }
```

---

## 5. Production Infrastructure & Deployment Topology

```mermaid
graph LR
    subgraph Internet ["Public Internet"]
        UserBrowser["User Browser"]
    end

    subgraph HostServer ["Host Server (142.93.214.120)"]
        Certbot["Certbot SSL (Let's Encrypt)"]
        NginxHost["Host Nginx Reverse Proxy (:443)"]
        
        subgraph DockerCompose ["Docker Compose Stack"]
            FrontendCont["instantping-frontend (:3000:80)"]
            BackendCont["instantping-backend (:8080)"]
            AppDataVol[("app-data Volume")]
            AppUploadsVol[("app-uploads Volume")]
        end
    end

    UserBrowser -->|HTTPS :443| NginxHost
    NginxHost -->|Proxy / | FrontendCont
    NginxHost -->|Proxy /api, /ws, /uploads | BackendCont
    BackendCont --> AppDataVol
    BackendCont --> AppUploadsVol
```

---

## 6. Security Architecture

1. **Authentication**: Stateless HMAC-SHA256 JWT tokens passed via `Authorization: Bearer <token>` headers.
2. **Password Hashing**: BCrypt with work factor 10.
3. **CORS & Origin Validation**: Strict origin validation supporting localhost and `https://chat.kanchan.online`.
4. **OAuth 2.0 Identity**:
   - Google Identity Services (GIS) / Token Client protocol.
   - GitHub OAuth code exchange with token authorization.
5. **Transport Security**: TLS 1.3 encryption across all HTTPS and WSS connections.
