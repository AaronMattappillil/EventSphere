import { db } from './firebase-config.js';
import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export const createEvent = async (eventData, publisherId) => {
    try {
        const docRef = await addDoc(collection(db, "events"), {
            ...eventData,
            publisherId: publisherId,
            createdAt: new Date().toISOString()
        });
        return docRef.id;
    } catch (e) {
        console.error("Error adding document: ", e);
        throw e;
    }
};

export const getEvents = async (category = 'all') => {
    const events = [];
    let q;

    try {
        const eventsRef = collection(db, "events");

        if (category === 'all') {
            q = query(eventsRef, orderBy("date", "asc"));
        } else {
            q = query(eventsRef, where("category", "==", category), orderBy("date", "asc"));
        }

        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            events.push({ id: doc.id, ...doc.data() });
        });
        return events;
    } catch (e) {
        console.error("Error getting events: ", e);
        // Return dummy data if DB fails (or is not configured)
        return getMockEvents(category);
    }
};

export const getPublisherEvents = async (publisherId) => {
    const events = [];
    try {
        const q = query(collection(db, "events"), where("publisherId", "==", publisherId));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            events.push({ id: doc.id, ...doc.data() });
        });
        return events;
    } catch (e) {
        console.error("Error getting publisher events: ", e);
        return [];
    }
};

// Mock data for initial testing and when DB connection fails
const getMockEvents = (category) => {
    const mockData = [
        {
            id: '1',
            title: 'TechNova Hackathon',
            category: 'tech',
            date: '2023-11-15T09:00',
            venue: 'Main Auditorium',
            description: 'A 24-hour hackathon to solve real-world problems.',
            organizer: 'Tech Club'
        },
        {
            id: '2',
            title: 'Cultural Fest: Tarang',
            category: 'cultural',
            date: '2023-11-20T18:00',
            venue: 'Open Air Theatre',
            description: 'Annual cultural festival featuring dance, music and drama.',
            organizer: 'Cultural Committee'
        },
        {
            id: '3',
            title: 'Inter-College Football',
            category: 'sports',
            date: '2023-11-25T14:00',
            venue: 'Sports Complex',
            description: 'Championship match between top college teams.',
            organizer: 'Sports Association'
        }
    ];

    if (category === 'all') return mockData;
    return mockData.filter(e => e.category === category);
};
