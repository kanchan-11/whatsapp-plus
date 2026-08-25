# 📚 InstantPing Documentation Hub

Welcome to the comprehensive technical documentation for **InstantPing** — an enterprise-grade, real-time messaging, voice, and video platform engineered to deliver a complete product experience while mastering **advanced backend engineering, distributed systems, and modern full-stack architecture**.

---

## 🗂️ Documentation Structure

```
docs/
├── README.md                                       # Documentation Index & Master Blueprint
├── 01_ARCHITECTURE.md                              # Deep-Dive System Architecture, WebRTC & STOMP Protocols
├── 02_FEATURES_OVERVIEW.md                         # Implemented Features, Workflows & Technical Mechanics
├── 03_DEVELOPMENT_AND_TESTING_WORKFLOW.md          # Local Setup, Git Branching Strategy & CI/CD Pipeline
└── 04_PROGRESSIVE_ROADMAP_AND_UPCOMING_FEATURES.md      # Balanced Full-Stack & Backend Engineering Roadmap
```

---

## 📖 Document Summaries

### 1. [System Architecture (`01_ARCHITECTURE.md`)](./01_ARCHITECTURE.md)
- Stateless REST API Layer + Bidirectional WebSocket STOMP Messaging Engine.
- WebRTC Peer-to-Peer Mesh audio/video signaling lifecycle.
- Relational Database Schemas & Entity-Relationship (ER) model.
- Production multi-stage Docker & Nginx Reverse Proxy with Let's Encrypt SSL.

### 2. [Features Catalog (`02_FEATURES_OVERVIEW.md`)](./02_FEATURES_OVERVIEW.md)
- Real-time 1-on-1 and group chat with typing indicators.
- Voice recordings & rich media upload pipelines (up to 100MB).
- WebRTC mesh video conferencing with native screen sharing.
- Call history logging and 1-click callback mechanisms.
- Google GIS and GitHub OAuth 2.0 direct authentication.

### 3. [Development & CI/CD Workflow (`03_DEVELOPMENT_AND_TESTING_WORKFLOW.md`)](./03_DEVELOPMENT_AND_TESTING_WORKFLOW.md)
- Step-by-step developer guidelines (running Spring Boot + Vite locally).
- Feature branching strategy (`main` ➔ `feature/<name>` ➔ local test ➔ PR ➔ CI/CD build ➔ auto-deploy).
- Multi-browser local verification checks & zero-downtime rollback procedures.

### 4. [Balanced Full-Stack & Backend Roadmap (`04_PROGRESSIVE_ROADMAP_AND_UPCOMING_FEATURES.md`)](./04_PROGRESSIVE_ROADMAP_AND_UPCOMING_FEATURES.md)
A progressive 8-phase curriculum delivering real user-facing product features paired with foundational backend engineering:
- **Phase 1**: Message Reactions & Replies + Redis Caching & Distributed STOMP Broker Relay
- **Phase 2**: Read Receipts (Double Blue Ticks) + PostgreSQL 16 & Flyway Versioned Migrations
- **Phase 3**: Ephemeral & Disappearing Messages + Domain Events (`@TransactionalEventListener`) & Purge Worker
- **Phase 4**: High-Volume Channel Scaling + Apache Kafka / RabbitMQ Streaming & Dead Letter Queue (DLQ)
- **Phase 5**: PWA & Native OS Web Push Notifications + Bucket4j Distributed Rate Limiting & Resilience4j
- **Phase 6**: Global Keyword Search + PostgreSQL Full-Text Search Engine (`tsvector`, GIN Index, `pg_trgm`)
- **Phase 7**: End-to-End Encryption (E2EE) + Zero-Knowledge Key Store & RS256 RSA JWT Security
- **Phase 8**: 20+ Person Group Video (SFU) + Prometheus, Grafana & Micrometer Tracing (MDC)

---

## 🚀 Quick Reference

- **Production Domain**: `https://chat.kanchan.online`
- **Host Server**: `142.93.214.120` (Ubuntu 24.04 LTS Droplet)
- **Primary Branch**: `main` (Protected; triggers automated GitHub Actions deployment)
- **Backend Stack**: Java 21 + Spring Boot 3.3.4 + Spring Security + Spring WebSocket + Spring Data JPA
- **Frontend Stack**: React 19 + Vite + Tailwind CSS + STOMP / WebRTC
