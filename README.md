# EventSphere

**EventSphere** is an AI-powered event discovery and management platform designed to simplify how users explore, organize, and engage with events. It provides a clean, modern interface backed by cloud services and AI to deliver a seamless event experience.

---

## Live Demo (MVP)
 https://eventsphere-eb8b2.web.app

> The MVP demonstrates the core user flow and cloud integration.  
> The application is publicly accessible and requires no local setup to view.

---

## Problem Statement
Finding, managing, and engaging with events is often fragmented across multiple platforms, leading to poor discoverability and user experience. EventSphere addresses this by centralizing event interactions into a single, intelligent platform.

---

## Solution
EventSphere offers a unified interface where users can:
- Discover events easily
- Interact with event-related information
- Leverage AI assistance for event queries and guidance

The platform emphasizes simplicity, scalability, and intelligent assistance.

---

## Key Features
- Event discovery and listing
- Firebase-based hosting and configuration
- AI-powered assistance using Google Gemini
- Responsive, modern frontend UI
- Cloud-ready architecture suitable for scaling

---

## Tech Stack
**Frontend**
- JavaScript
- HTML & CSS
- Vite (build tool)

**Backend / Cloud**
- Firebase Hosting
- Firebase Configuration
- Google Gemini API (AI features)

---

## Google Technologies Used
- Firebase Hosting
- Google Gemini API

---

## Google AI Integration
- **Gemini API** is used to provide AI-powered conversational assistance and intelligent responses related to events.

---

## Repository Structure
```text
├── dist/ # Production build files
├── src/ # Source code
├── firebase.json # Firebase hosting configuration
├── package.json # Project dependencies
├── README.md # Project documentation
└── .gitignore # Ignored files (includes .env)
```

---

## Security & API Key Handling
- No API keys are committed to this repository.
- Sensitive credentials (e.g., Gemini API key) are managed via environment variables.
- The frontend does not expose any secret keys.
- This follows standard cloud security best practices.

---

## Running Locally (Optional)
```bash
npm install
npm run dev
