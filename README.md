# ⚡ InstantPing — Real-Time Messaging & WebRTC Video Calling

<div align="center">
  <img src="frontend/public/favicon.svg" width="100" height="100" alt="InstantPing Logo" />
  <h3>Fast, Secure, Real-Time Messaging & Multi-User Voice/Video Calling</h3>
  <p>Live at: <strong><a href="https://chat.kanchan.online">https://chat.kanchan.online</a></strong></p>
</div>

---

## 🌟 Highlights & Key Features

- ⚡ **Real-Time Messaging**: Built with Spring Boot WebSockets and STOMP message broker with instant message delivery, live typing alerts, and read receipts.
- 📹 **HD WebRTC Video & Voice Calling**: Peer-to-peer 1-on-1 and multi-user group mesh voice and video calling with screen sharing, mic mute, and camera toggles.
- 🎙️ **Interactive Waveform Voice Notes**: Custom-built audio message player with waveform progress visualization, scrubber, and `1x / 1.5x / 2x` speed toggles.
- 🖼️ **Media & Attachment Sharing**: Photos, high-definition videos, documents, and live camera snapshot upload.
- 👥 **Group Chat Management**: Create groups, assign admins, add/remove participants, and ongoing group call banners with seamless 1-click joining.
- 📱 **Fully Responsive UI**: Mobile-optimized bottom navigation dock, full-screen conversation transitions, and desktop navigation rail.
- 🎨 **Cyber-Dark Aesthetic**: Modern deep obsidian and electric indigo glassmorphism theme.
- 🔔 **Synthesized Audio Effects**: Native Web Audio API tone synthesizer for zero-dependency incoming, outgoing, and message chimes.
- 🔒 **Security & Authentication**: Stateless JWT authentication, BCrypt password hashing, and SSL/HTTPS encryption.
- 🚀 **Automated CI/CD**: Fully automated GitHub Actions workflow building and deploying to production via Docker on every push to `main`.

---

## 🛠️ Complete Technical Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS v4, @stomp/stompjs, SockJS, WebRTC API, Web Audio API, Lucide Icons, Axios, Date-fns |
| **Backend** | Java 21, Spring Boot 3.3.4, Spring WebSocket/STOMP, Spring Security 6, JJWT, Spring Data JPA, H2 Database (File Mode), Maven |
| **DevOps** | Docker, Docker Compose, Nginx (Reverse Proxy), Certbot (Let's Encrypt SSL), GitHub Actions (CI/CD) |

For complete in-depth technical documentation, system design diagrams, entity schemas, and signaling workflows, see:
👉 **[ARCHITECTURE.md](./ARCHITECTURE.md)**

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- JDK 21+
- Node.js 20+
- Maven

### Run Locally

1. **Start Backend**:
```bash
cd backend
mvn spring-boot:run
```
*Backend runs on `http://localhost:8080` (H2 Console: `http://localhost:8080/h2-console`).*

2. **Start Frontend**:
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 🐳 Production Deployment (Docker Compose)

```bash
# Clone the repository
git clone https://github.com/kanchan-11/whatsapp-plus.git instantping
cd instantping

# Start the full stack with Docker Compose
docker compose up --build -d
```

---

## 📄 License
This project is open-source under the MIT License.
