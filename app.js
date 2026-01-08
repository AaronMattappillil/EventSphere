import { handleSignup, handleLogin, handleLogout, initAuthListener } from './auth.js';
import { getEvents, createEvent, getPublisherEvents } from './events.js';
import { chatWithGemini, enhanceDescription } from './ai.js';

// State
let currentUser = null;
let currentRole = null;

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
    }
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
    await handleLogout();
});

// Events Logic
async function loadEvents(category = 'all') {
    eventsGrid.innerHTML = '<div class="loading-state">Loading events...</div>';
    const events = await getEvents(category);
    renderEvents(events);
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
        const imgUrl = `https://source.unsplash.com/random/400x300/?${event.category},event`;

        card.innerHTML = `
            <div class="event-image">
                <img src="${imgUrl}" alt="${event.title}" onerror="this.src='https://placehold.co/400x300?text=Event'">
                <span class="event-badge">${event.category}</span>
            </div>
            <div class="event-content">
                <div class="event-date">📅 ${new Date(event.date).toLocaleDateString()} ${new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                <h3 class="event-title">${event.title}</h3>
                <p class="event-organizer">📍 ${event.venue}</p>
                <button class="btn btn-secondary full-width" style="margin-top: 1rem;">View Details</button>
            </div>
        `;
        eventsGrid.appendChild(card);
    });
}

document.getElementById('categoryFilter').addEventListener('change', (e) => {
    loadEvents(e.target.value);
});

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
        item.innerHTML = `<strong>${event.title}</strong> - ${event.date}`;
        container.appendChild(item);
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

    const response = await chatWithGemini(text);
    appendMessage('bot', response);
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
