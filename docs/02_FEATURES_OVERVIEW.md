# 🌟 InstantPing - Features & Capabilities Catalog

This document details all implemented capabilities in **InstantPing**, including user workflows, UI components, and underlying technical mechanics.

---

## 1. 💬 Real-Time Messaging

### 1.1 One-on-One Private Chat
- **Instant Messaging**: Messages are delivered in real-time (< 20ms latency) using STOMP user queues (`/user/queue/messages`).
- **History Persistence**: Messages are saved to the persistent database and automatically loaded in chronological order upon opening a conversation.
- **Typing Indicators**: Ephemeral typing notifications (`... is typing`) transmitted over `/user/queue/typing`.
- **Search**: Real-time filtering of active conversations and users by name or username.

### 1.2 Group Conversations
- **Multi-User Rooms**: Users can create group channels, customize group names, and add multiple participants.
- **Group Broadcasts**: Messages in group chats are fanned out to all active members simultaneously.
- **Member Management**: View active participants and member profile details.

---

## 2. 📎 Rich Media & Voice Messages

### 2.1 File & Photo Attachments
- **Image Previews**: In-line high-resolution rendering with lightbox modal support.
- **Document & File Sharing**: Supports PDFs, archives, documents, and code snippets up to 100MB per file.
- **Upload Progress**: Real-time upload percentage indicators with auto-cleanup.

### 2.2 Voice Notes (Audio Messages)
- **Direct Recording**: Integrated `MediaRecorder` API with live waveform animation while speaking.
- **In-Line Player**: Custom audio player with duration preview, play/pause controls, and seekable progress bar.

---

## 3. 📹 WebRTC Voice & Video Calling

### 3.1 1-on-1 Voice & Video Calls
- **High-Definition Media**: Direct peer-to-peer SRTP audio and video streams via WebRTC `RTCPeerConnection`.
- **Signaling via WebSocket**: SDP offers/answers and ICE candidates exchanged over STOMP queues without third-party signaling dependencies.
- **Audio Ringtone & Alerts**: Native browser synthesized ringtones on incoming calls and calling feedback tones.
- **Media Controls**: Real-time microphone mute/unmute, camera toggle, and speaker output selection.

### 3.2 Multi-Party Group Video Conferencing
- **Mesh Topology**: Dynamically establishes P2P peer connections with all active members in the room.
- **Grid Layout**: Responsive video grid automatically arranging 2 to 6+ participant video feeds.
- **Screen Sharing**: Native `getDisplayMedia` support for sharing presentations, coding screens, or application windows.

---

## 4. 📞 Call History & Logging

- **Comprehensive Records**: Logs every call with timestamp, duration in seconds, call type (Voice/Video), and status (`COMPLETED`, `MISSED`, `REJECTED`, `BUSY`).
- **Calls Sidebar**: Dedicated calls panel showing chronological incoming, outgoing, and missed call icons.
- **One-Click Callback**: Redial or video call any contact directly from the call history log.

---

## 5. 🔐 Authentication & Identity Management

### 5.1 Standard Credentials
- **Registration & Login**: Secure password authentication with BCrypt hashing and JWT session tokens.
- **Demo Quick Logins**: (Disabled in production for security).

### 5.2 Social OAuth 2.0
- **Google Sign-In**: Native Google Identity Services (GIS) Token Client popup. Retrieves verified Google name, email, and profile photo directly.
- **GitHub Sign-In**: Native GitHub OAuth code exchange via `/api/auth/oauth/github` with primary email extraction.

### 5.3 Profile Customization
- **Avatar Selection**: Choose from preset DiceBear vector avatars.
- **Custom Image Upload**: Upload personal profile photos.
- **Live Camera Snapshot**: Built-in webcam snapshot tool to capture and crop profile pictures on the fly.
- **Status / Bio**: Customizable bio ("Hey there! I am using InstantPing").

---

## 6. 📱 Responsive Mobile Layout

- **Mobile Viewport Optimization**: Fluid responsive design built for smartphones, tablets, and desktop displays.
- **Adaptive Split-View**:
  - **Desktop**: Three-column layout (Navigation Rail ➔ Conversations Sidebar ➔ Chat Area).
  - **Mobile**: Dynamic single-column view with a smooth slide transition, mobile header `←` back navigation button, and bottom docking tab bar.
- **Mobile Calling Overlay**: Full-screen immersive call overlay optimized for touch gestures.
