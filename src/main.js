import { handleSignup, handleLogin, handleLogout, initAuthListener } from './auth.js';
import { getEvents, createEvent, getPublisherEvents, deleteEvent } from './events.js';
import { chatWithGemini, enhanceDescription } from './ai.js';
import './style.css'; // Vite allows importing CSS in JS

// State
let currentUser = null;
let currentRole = null;
let currentEventsList = [];

// DOM Elements
const navLinks = document.getElementById('navLinks');
const authLinks = document.getElementById('authLinks');
const userLinks = document.getElementById('userLinks');
const homePage = document.getElementById('homePage');
const dashboardPage = document.getElementById('dashboardPage');
const eventsGrid = document.getElementById('eventsGrid');
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const authModal = document.getElementById('authModal');
const closeModal = document.querySelectorAll('.close-modal');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const loginFormContainer = document.getElementById('loginFormContainer');
const signupFormContainer = document.getElementById('signupFormContainer');

// Init
document.addEventListener('DOMContentLoaded', () => {
    loadEvents();

    // Auth Listener
    initAuthListener((user, role) => {
        currentUser = user;
        currentRole = role;
        updateUI();
    });
});

// UI Updates
function updateUI() {
    if (currentUser) {
        authLinks.classList.add('hidden');
        userLinks.classList.remove('hidden');

        if (currentRole === 'publisher') {
            document.getElementById('dashboardLink').classList.remove('hidden');
        } else {
            document.getElementById('dashboardLink').classList.add('hidden');
        }
    } else {
        authLinks.classList.remove('hidden');
        userLinks.classList.add('hidden');
        navigateTo('home');
    }
}

// Navigation
function navigateTo(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

    if (pageId === 'home') {
        homePage.classList.add('active');
        document.querySelector('[data-page="home"]').classList.add('active');
    } else if (pageId === 'dashboard') {
        dashboardPage.classList.add('active');
        document.querySelector('[data-page="dashboard"]').classList.add('active');
        loadPublisherEvents();
    }
}

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = e.target.getAttribute('data-page');
        if (page) navigateTo(page);
    });
});

// Auth Modal Logic
loginBtn.addEventListener('click', () => {
    authModal.classList.add('active');
    showLoginForm();
});

signupBtn.addEventListener('click', () => {
    authModal.classList.add('active');
    showSignupForm();
});

closeModal.forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
    });
});

window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});

function showLoginForm() {
    loginFormContainer.classList.remove('hidden');
    signupFormContainer.classList.add('hidden');
}

function showSignupForm() {
    loginFormContainer.classList.add('hidden');
    signupFormContainer.classList.remove('hidden');
}

document.getElementById('switchToSignup').addEventListener('click', showSignupForm);
document.getElementById('switchToLogin').addEventListener('click', showLoginForm);

// Auth Actions
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = e.target[0].value;
    const password = e.target[1].value;
    try {
        await handleLogin(email, password);
        authModal.classList.remove('active');
    } catch (err) {
        alert(err.message);
        console.error("Login Error:", err);
    }
});

signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = e.target[0].value;
    const password = e.target[1].value;
    const role = document.getElementById('signupRole').value;
    try {
        await handleSignup(email, password, role);
        authModal.classList.remove('active');
    } catch (err) {
        alert(err.message);
        console.error("Signup Error:", err);
    }
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
    await handleLogout();
});

// Events Logic
async function loadEvents() {
    eventsGrid.innerHTML = '<div class="loading-state">Loading events...</div>';
    const events = await getEvents('all');
    currentEventsList = events; // Store for AI context & filtering
    applyFilters();
}

function applyFilters() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;

    const keywords = query.split(' ').filter(k => k.trim() !== '');

    const filtered = currentEventsList.filter(event => {
        const title = event.title.toLowerCase();
        const desc = event.description ? event.description.toLowerCase() : '';
        const venue = event.venue ? event.venue.toLowerCase() : '';

        // Match ALL keywords against Title, Description, OR Venue
        const matchesSearch = keywords.every(keyword =>
            title.includes(keyword) ||
            desc.includes(keyword) ||
            venue.includes(keyword)
        );

        const matchesCategory = category === 'all' || event.category === category;
        return matchesSearch && matchesCategory;
    });

    renderEvents(filtered);
    attachRegisterListeners();
}

function renderEvents(events) {
    eventsGrid.innerHTML = '';
    if (events.length === 0) {
        eventsGrid.innerHTML = '<p>No events found.</p>';
        return;
    }

    events.forEach(event => {
        const card = document.createElement('div');
        card.className = 'event-card';
        // Random placeholder image for demo
        const imgUrl = event.imageUrl || `https://source.unsplash.com/random/400x300/?${event.category},event`;

        card.innerHTML = `
            <div class="event-image">
                <img src="${imgUrl}" alt="${event.title}" onerror="this.src='https://placehold.co/400x300?text=Event'">
                <span class="event-badge">${event.category}</span>
            </div>
            <div class="event-content">
                <div class="event-date">📅 ${new Date(event.date).toLocaleDateString()} ${new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                <h3 class="event-title">${event.title}</h3>
                <p class="event-organizer">📍 ${event.venue}</p>
                <p class="event-desc hidden" id="desc-${event.id}" style="font-size: 0.9rem; color: #cbd5e1; margin-top: 0.5rem; padding: 0.5rem; background: rgba(255,255,255,0.05); border-radius: 4px;">${event.description}</p>
                <div class="card-actions" style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                     <button class="btn btn-primary full-width register-btn" data-id="${event.id}">Register</button>
                     <button class="btn btn-secondary info-btn" style="width: auto; padding: 0 0.8rem;" onclick="document.getElementById('desc-${event.id}').classList.toggle('hidden')">ℹ️</button>
                </div>
            </div>
        `;
        eventsGrid.appendChild(card);
    });
}

function attachRegisterListeners() {
    document.querySelectorAll('.register-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            if (!currentUser) {
                alert("Please login to register for events.");
                authModal.classList.add('active');
                return;
            }
            const eventId = e.target.getAttribute('data-id');
            // Mock registration
            e.target.textContent = "Registered ✅";
            e.target.disabled = true;
            e.target.classList.remove('btn-primary');
            e.target.classList.add('btn-secondary');
            alert(`Successfully registered for event ID: ${eventId}`);
        });
    });
}

document.getElementById('categoryFilter').addEventListener('change', applyFilters);
document.getElementById('searchInput').addEventListener('input', applyFilters);

// Dashboard & Create Event
const createEventModal = document.getElementById('createEventModal');
document.getElementById('createEventBtn').addEventListener('click', () => {
    createEventModal.classList.add('active');
});

document.getElementById('aiEnhanceBtn').addEventListener('click', async () => {
    const descTextarea = document.querySelector('textarea[name="description"]');
    const currentText = descTextarea.value;
    if (!currentText) {
        alert("Please write a draft description first.");
        return;
    }

    document.getElementById('aiEnhanceBtn').textContent = "Enhancing...";
    const enhanced = await enhanceDescription(currentText);
    descTextarea.value = enhanced;
    document.getElementById('aiEnhanceBtn').textContent = "✨ AI Enhance Description";
});

document.getElementById('createEventForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    const formData = new FormData(e.target);
    const eventData = {
        title: formData.get('title'),
        category: formData.get('category'),
        date: formData.get('datetime'),
        venue: formData.get('venue'),
        imageUrl: formData.get('imageUrl'),
        description: formData.get('description')
    };

    try {
        await createEvent(eventData, currentUser.uid);
        createEventModal.classList.remove('active');
        e.target.reset();
        loadPublisherEvents();
        loadEvents(); // Refresh main list too
        alert("Event published successfully!");
    } catch (err) {
        alert("Error publishing event: " + err.message);
    }
});

async function loadPublisherEvents() {
    if (!currentUser) return;
    const container = document.getElementById('publisherEventsList');
    container.innerHTML = 'Loading...';

    const events = await getPublisherEvents(currentUser.uid);
    container.innerHTML = '';

    if (events.length === 0) {
        container.innerHTML = '<p>You haven\'t published any events yet.</p>';
        return;
    }

    events.forEach(event => {
        const item = document.createElement('div');
        item.style.padding = '1rem';
        item.style.border = '1px solid var(--border)';
        item.style.marginBottom = '0.5rem';
        item.style.borderRadius = '8px';
        item.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span><strong>${event.title}</strong> - ${event.date}</span>
                <button class="btn btn-secondary delete-btn" style="color: #ef4444; border-color: #ef4444;" data-id="${event.id}">Delete</button>
            </div>
        `;
        container.appendChild(item);
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            if (!confirm("Are you sure you want to delete this event?")) return;
            const eventId = e.target.getAttribute('data-id');
            try {
                await deleteEvent(eventId);
                loadPublisherEvents(); // Refresh list
                loadEvents(); // Refresh public list
                alert("Event deleted.");
            } catch (err) {
                alert("Error deleting event: " + err.message);
            }
        });
    });
}


// Chatbot
const chatbotHeader = document.getElementById('chatbotHeader');
const chatbotWidget = document.getElementById('chatbotWidget');
const chatInput = document.getElementById('chatInput');
const sendChatBtn = document.getElementById('sendChatBtn');
const chatMessages = document.getElementById('chatMessages');

chatbotHeader.addEventListener('click', () => {
    chatbotWidget.classList.toggle('minimized');
    const icon = chatbotHeader.querySelector('.toggle-icon');
    icon.textContent = chatbotWidget.classList.contains('minimized') ? '+' : '−';
});

async function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    appendMessage('user', text);
    chatInput.value = '';

    try {
        // Format events context
        const context = currentEventsList.map(e => `- ${e.title} (${e.date}) at ${e.venue}: ${e.description}`).join('\n');

        const response = await chatWithGemini(text, context);
        appendMessage('bot', response);
    } catch (e) {
        console.error("Chat Error:", e);
        appendMessage('bot', "Error: " + e.message);
    }
}

function appendMessage(sender, text) {
    const msg = document.createElement('div');
    msg.className = `message ${sender}`;
    msg.textContent = text;
    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

sendChatBtn.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});
