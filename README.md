# 💬 Full-Stack WhatsApp Clone (Spring Boot + React + WebRTC)

A modern, real-time messaging and peer-to-peer audio/video calling application modeled after WhatsApp Web.

---

## ✨ Features

- ⚡ **Real-Time 1-on-1 & Group Messaging**: Powered by Spring Boot WebSockets and STOMP message broker.
- 📞 **Audio & Video Calling (WebRTC)**: High-definition 1-to-1 voice and video calling with signaling broker, camera toggles, mic mute, and screen sharing.
- 🖼️ **Media & File Sharing**: High-resolution image preview lightbox, HTML5 video player, audio messages/voice notes, and document downloaders.
- 👥 **Group Management**: Create custom groups, assign admins, add/remove participants, customize group icons and descriptions.
- 🔒 **Secure Authentication**: JWT-based authentication, user presence tracking (online/offline indicators), and profile customization.
- 🎨 **WhatsApp Web UI**: Sleek dark theme, emoji picker, read receipts (single ✓, double ✓✓, blue ticks), and typing status ("John is typing...").
- 🔔 **Interactive Sound Effects**: Native Web Audio API synthesized message dings, outgoing ringing, and incoming melodic ringtones with zero extra audio asset dependencies.

---

## 🛠️ Tech Stack

### Backend
- **Java 21 / 26**
- **Spring Boot 3.3.4**
- **Spring WebSocket & STOMP Broker**
- **Spring Security & JJWT**
- **Spring Data JPA & H2 File Database** (Persistent under `./backend/data/chatdb`)
- **Maven**

### Frontend
- **React 18**
- **Vite**
- **Tailwind CSS v4**
- **Lucide Icons**
- **@stomp/stompjs & SockJS**
- **Native Browser WebRTC (RTCPeerConnection)**
- **Emoji Picker React**
- **Axios & Date-fns**

---

## 🚀 How to Run

### Option 1: Quick Launch (Windows)
Double-click `run-app.bat` or run in PowerShell:
```powershell
.\run-app.ps1
```

### Option 2: Manual Run

#### 1. Start Backend:
```bash
cd backend
mvn spring-boot:run
```
Backend starts on **`http://localhost:8080`**.
H2 Database console: **`http://localhost:8080/h2-console`** (JDBC URL: `jdbc:h2:file:./data/chatdb`).

#### 2. Start Frontend:
```bash
cd frontend
npm run dev
```
Frontend runs on **`http://localhost:5173`**.

---

## 🧪 Testing Multi-User Chatting & Calling

1. Open `http://localhost:5173` in a regular browser window and register **User 1** (e.g. `alice`).
2. Open `http://localhost:5173` in an **Incognito** window and register **User 2** (e.g. `bob`).
3. In Alice's window, click the **New Direct Chat** icon (`+`) and select **Bob**.
4. Send messages, emojis, images, and videos in real time.
5. Click the **Video Call** or **Voice Call** icon in the header:
   - Bob will receive an animated incoming call modal with a melodic ringtone.
   - Click **Accept** to connect the WebRTC audio & video streams!
