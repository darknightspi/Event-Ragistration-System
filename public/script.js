// API Base URL
const API_URL = window.location.origin; // Dynamically uses the current server's URL

// DOM Elements
const loginContainer = document.getElementById('loginContainer');
const mainContainer = document.getElementById('mainContainer');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const showRegisterLink = document.getElementById('showRegister');
const showLoginLink = document.getElementById('showLogin');
const logoutBtn = document.getElementById('logoutBtn');
const userInfo = document.getElementById('userInfo');

const homeBtn = document.getElementById('homeBtn');
const addEventBtn = document.getElementById('addEventBtn');
const participantsBtn = document.getElementById('participantsBtn');
const homeSection = document.getElementById('homeSection');
const addEventSection = document.getElementById('addEventSection');
const participantsSection = document.getElementById('participantsSection');
const eventsList = document.getElementById('eventsList');
const participantsList = document.getElementById('participantsList');
const eventForm = document.getElementById('eventForm');
const messageDiv = document.getElementById('message');
const registrationModal = document.getElementById('registrationModal');
const participantNameDisplay = document.getElementById('participantNameDisplay');
const eventSelect = document.getElementById('eventSelect');
let currentParticipantId = null;
let currentUser = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuthentication();
    setupEventListeners();
});

// Check if user is authenticated
async function checkAuthentication() {
    try {
        const response = await fetch(`${API_URL}/auth/me`, {
            credentials: 'include'
        });
        const result = await response.json();
        
        if (result.success) {
            currentUser = result.data;
            showMainApp();
        } else {
            showLogin();
        }
    } catch (error) {
        showLogin();
    }
}

// Show login page
function showLogin() {
    loginContainer.style.display = 'flex';
    mainContainer.style.display = 'none';
    currentUser = null;
    // Show login form by default
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
    // Ensure both role options are available in registration form
    const registerRoleSelect = document.getElementById('registerRole');
    if (registerRoleSelect) {
        registerRoleSelect.innerHTML = `
            <option value="user">👤 User (Student)</option>
            <option value="admin">👨‍🏫 Admin (Teacher)</option>
        `;
    }
}

// Show main application
function showMainApp() {
    loginContainer.style.display = 'none';
    mainContainer.style.display = 'block';
    // Update user info first to set button visibility
    updateUserInfo();
    // Then load events
    loadEvents();
    
    // Double check button visibility after a short delay
    setTimeout(() => {
        if (currentUser && currentUser.role === 'admin' && addEventBtn) {
            addEventBtn.style.display = 'inline-block';
        }
    }, 200);
}

// Update user info display
function updateUserInfo() {
    if (currentUser) {
        const roleBadge = currentUser.role === 'admin' ? '👨‍🏫 Admin' : '👤 Student';
        if (userInfo) {
            userInfo.textContent = `${roleBadge}: ${currentUser.name}`;
        }
        
        // Show/hide admin buttons - Only show "Add Event" button for admins
        if (currentUser.role === 'admin') {
            if (addEventBtn) {
                addEventBtn.style.display = 'inline-block';
                console.log('Admin logged in - Showing Add Event button');
            }
        } else {
            // Hide "Add Event" button for students/users
            if (addEventBtn) {
                addEventBtn.style.display = 'none';
                console.log('Student logged in - Hiding Add Event button');
            }
        }
    } else {
        // Hide button if no user is logged in
        if (addEventBtn) {
            addEventBtn.style.display = 'none';
        }
    }
    
    // Show both options in registration form
    const registerRoleSelect = document.getElementById('registerRole');
    if (registerRoleSelect) {
        registerRoleSelect.innerHTML = `
            <option value="user">👤 User (Student)</option>
            <option value="admin">👨‍🏫 Admin (Teacher)</option>
        `;
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Auth listeners
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
            // Hide "Login" heading when showing registration form
            const loginHeading = document.getElementById('loginHeading');
            if (loginHeading) {
                loginHeading.style.display = 'none';
            }
            // Ensure both role options are shown when registration form is displayed
            const registerRoleSelect = document.getElementById('registerRole');
            if (registerRoleSelect) {
                registerRoleSelect.innerHTML = `
                    <option value="user">👤 User (Student)</option>
                    <option value="admin">👨‍🏫 Admin (Teacher)</option>
                `;
            }
        });
    }
    if (showLoginLink) {
        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            registerForm.style.display = 'none';
            loginForm.style.display = 'block';
            // Show "Login" heading when showing login form
            const loginHeading = document.getElementById('loginHeading');
            if (loginHeading) {
                loginHeading.style.display = 'block';
            }
        });
    }
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // App listeners
    if (homeBtn) {
        homeBtn.addEventListener('click', showHome);
    }
    if (addEventBtn) {
        addEventBtn.addEventListener('click', showAddEvent);
    }
    if (participantsBtn) {
        participantsBtn.addEventListener('click', showParticipants);
    }
    
    if (eventForm) {
        eventForm.addEventListener('submit', handleEventSubmit);
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === registrationModal) {
            closeRegistrationModal();
        }
    });
}

// Handle Login
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include', // Important for session cookies
            body: JSON.stringify({ email, password })
        });
        
        const result = await response.json();
        
        if (result.success) {
            currentUser = result.data;
            showMessage('Login successful!', 'success');
            loginForm.reset();
            showMainApp(); // This will call updateUserInfo() which sets button visibility
        } else {
            showMessage(`Error: ${result.message}`, 'error');
        }
    } catch (error) {
        console.error('Error logging in:', error);
        showMessage('Error connecting to server', 'error');
    }
}

// Handle Register
async function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const role = document.getElementById('registerRole').value;
    
    // Use email as username
    const username = email;
    
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ name, username, email, password, role })
        });
        
        const result = await response.json();
        
        if (result.success) {
            const registeredRole = result.data.role;
            if (registeredRole === 'admin') {
                showMessage('Admin account created successfully! Please login.', 'success');
            } else {
                showMessage('Registration successful! Please login.', 'success');
            }
            registerForm.style.display = 'none';
            loginForm.style.display = 'block';
            registerForm.reset();
        } else {
            showMessage(`Error: ${result.message}`, 'error');
        }
    } catch (error) {
        console.error('Error registering:', error);
        showMessage('Error connecting to server', 'error');
    }
}

// Handle Logout
async function handleLogout() {
    try {
        const response = await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        });
        
        const result = await response.json();
        
        if (result.success) {
            showMessage('Logout successful!', 'success');
            currentUser = null;
            showLogin();
        } else {
            showMessage(`Error: ${result.message}`, 'error');
        }
    } catch (error) {
        console.error('Error logging out:', error);
        showMessage('Error connecting to server', 'error');
        // Still show login even if logout fails
        currentUser = null;
        showLogin();
    }
}

// Navigation Functions
function showHome() {
    homeSection.classList.add('active');
    addEventSection.classList.remove('active');
    participantsSection.classList.remove('active');
    loadEvents();
}

function showAddEvent() {
    homeSection.classList.remove('active');
    addEventSection.classList.add('active');
    participantsSection.classList.remove('active');
    if (eventForm) {
        eventForm.reset();
    }
}

function showParticipants() {
    homeSection.classList.remove('active');
    addEventSection.classList.remove('active');
    participantsSection.classList.add('active');
    loadParticipants();
}

// Load Events from API
async function loadEvents() {
    try {
        const response = await fetch(`${API_URL}/events`, {
            credentials: 'include'
        });
        const result = await response.json();
        
        if (result.success) {
            displayEvents(result.data);
        } else {
            showMessage('Failed to load events', 'error');
        }
    } catch (error) {
        console.error('Error loading events:', error);
        showMessage('Error connecting to server', 'error');
        eventsList.innerHTML = '<div class="empty-state"><h3>Unable to load events</h3><p>Please check if the server is running</p></div>';
    }
}

// Display Events
function displayEvents(events) {
    if (events.length === 0) {
        eventsList.innerHTML = '<div class="empty-state"><h3>No events found</h3><p>Click "Add Event" to create your first event</p></div>';
        return;
    }
    
    eventsList.innerHTML = events.map(event => {
        const date = new Date(event.date);
        const formattedDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Extract city from venue (assuming format like "City, Venue" or just "City")
        const venueParts = event.venue.split(',');
        const city = venueParts[0].trim();
        const venue = venueParts.length > 1 ? venueParts.slice(1).join(',').trim() : '';
        
        return `
            <div class="event-card">
                <h3>${event.name}</h3>
                <div class="event-info">
                    <strong>📅 Date:</strong>
                    <span>${formattedDate}</span>
                </div>
                <div class="event-info">
                    <strong>🏙️ City:</strong>
                    <span>${city}</span>
                </div>
                ${venue ? `<div class="event-info"><strong>📍 Venue:</strong><span>${venue}</span></div>` : ''}
                <div class="event-info">
                    <strong>👤 Organizer:</strong>
                    <span>${event.organizer}</span>
                </div>
                ${event.description ? `<div class="event-info"><strong>📝 Description:</strong><span>${event.description}</span></div>` : ''}
                <div class="event-info">
                    <strong>👥 Participants:</strong>
                    <span>${event.registered_count} / ${event.max_participants}</span>
                </div>
                <div class="event-card-actions">
                    <button class="btn btn-danger btn-small" onclick="deleteEvent('${event._id}')">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

// Handle Event Form Submit
async function handleEventSubmit(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('eventName').value,
        date: new Date(document.getElementById('eventDate').value).toISOString(),
        venue: document.getElementById('eventVenue').value,
        organizer: document.getElementById('eventOrganizer').value,
        description: document.getElementById('eventDescription').value,
        max_participants: parseInt(document.getElementById('maxParticipants').value)
    };
    
    try {
        const response = await fetch(`${API_URL}/events`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showMessage('Event created successfully!', 'success');
            eventForm.reset();
            setTimeout(() => {
                showHome();
            }, 1500);
        } else {
            const errorMsg = result.errors ? result.errors.join(', ') : result.message;
            showMessage(`Error: ${errorMsg}`, 'error');
        }
    } catch (error) {
        console.error('Error creating event:', error);
        showMessage('Error connecting to server', 'error');
    }
}

// Delete Event
async function deleteEvent(eventId) {
    if (!confirm('Are you sure you want to delete this event?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/events/${eventId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        
        const result = await response.json();
        
        if (result.success) {
            showMessage('Event deleted successfully!', 'success');
            loadEvents();
        } else {
            showMessage(`Error: ${result.message}`, 'error');
        }
    } catch (error) {
        console.error('Error deleting event:', error);
        showMessage('Error connecting to server', 'error');
    }
}

// Show Message
function showMessage(text, type = 'info') {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type} show`;
    
    setTimeout(() => {
        messageDiv.classList.remove('show');
    }, 3000);
}

// Load Participants from API
async function loadParticipants() {
    try {
        const response = await fetch(`${API_URL}/participants`, {
            credentials: 'include'
        });
        const result = await response.json();
        
        if (result.success) {
            displayParticipants(result.data);
        } else {
            showMessage('Failed to load participants', 'error');
        }
    } catch (error) {
        console.error('Error loading participants:', error);
        showMessage('Error connecting to server', 'error');
        participantsList.innerHTML = '<div class="empty-state"><h3>Unable to load participants</h3><p>Please check if the server is running</p></div>';
    }
}

// Display Participants
function displayParticipants(participants) {
    if (participants.length === 0) {
        participantsList.innerHTML = '<div class="empty-state"><h3>No participants found</h3><p>Use the API or MongoDB to add participants</p></div>';
        return;
    }
    
    participantsList.innerHTML = participants.map(participant => {
        const registeredCount = participant.registered_events ? participant.registered_events.length : 0;
        const eventsList = participant.registered_events && participant.registered_events.length > 0
            ? participant.registered_events.map(e => e.name || e).join(', ')
            : 'None';
        
        return `
            <div class="event-card">
                <h3>${participant.name}</h3>
                <div class="event-info">
                    <strong>📧 Email:</strong>
                    <span>${participant.email}</span>
                </div>
                <div class="event-info">
                    <strong>📱 Phone:</strong>
                    <span>${participant.phone}</span>
                </div>
                <div class="event-info">
                    <strong>🏫 Department:</strong>
                    <span>${participant.department}</span>
                </div>
                <div class="event-info">
                    <strong>📚 Year:</strong>
                    <span>${participant.year}</span>
                </div>
                <div class="event-info">
                    <strong>🎫 Registered Events:</strong>
                    <span>${registeredCount} event(s)</span>
                </div>
                ${registeredCount > 0 ? `<div class="event-info"><strong>📋 Events:</strong><span>${eventsList}</span></div>` : ''}
                <div class="event-card-actions">
                    <button class="btn btn-success btn-small" onclick="openRegistrationModal('${participant._id}', '${participant.name.replace(/'/g, "\\'")}')">Register</button>
                    <button class="btn btn-danger btn-small" onclick="deleteParticipant('${participant._id}')">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

// Handle Participant Form Submit
async function handleParticipantSubmit(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('participantName').value.trim(),
        email: document.getElementById('participantEmail').value.trim().toLowerCase(),
        phone: document.getElementById('participantPhone').value.trim(),
        department: document.getElementById('participantDepartment').value.trim(),
        year: document.getElementById('participantYear').value
    };
    
    try {
        const response = await fetch(`${API_URL}/participants`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showMessage('Participant created successfully!', 'success');
            participantForm.reset();
            setTimeout(() => {
                showParticipants();
            }, 1500);
        } else {
            const errorMsg = result.errors ? result.errors.join(', ') : result.message;
            showMessage(`Error: ${errorMsg}`, 'error');
        }
    } catch (error) {
        console.error('Error creating participant:', error);
        showMessage('Error connecting to server', 'error');
    }
}

// Delete Participant
async function deleteParticipant(participantId) {
    if (!confirm('Are you sure you want to delete this participant?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/participants/${participantId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        
        const result = await response.json();
        
        if (result.success) {
            showMessage('Participant deleted successfully!', 'success');
            loadParticipants();
        } else {
            showMessage(`Error: ${result.message}`, 'error');
        }
    } catch (error) {
        console.error('Error deleting participant:', error);
        showMessage('Error connecting to server', 'error');
    }
}

// Open Registration Modal
async function openRegistrationModal(participantId, participantName) {
    currentParticipantId = participantId;
    participantNameDisplay.textContent = `Registering: ${participantName}`;
    registrationModal.style.display = 'block';
    
    // Load events for dropdown
    await loadEventsForRegistration();
}

// Load Events for Registration Dropdown
async function loadEventsForRegistration() {
    try {
        eventSelect.innerHTML = '<option value="">Loading events...</option>';
        const response = await fetch(`${API_URL}/events`, {
            credentials: 'include'
        });
        const result = await response.json();
        
        if (result.success && result.data.length > 0) {
            eventSelect.innerHTML = '<option value="">Select an event</option>';
            result.data.forEach(event => {
                const date = new Date(event.date);
                const formattedDate = date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
                const isFull = event.registered_count >= event.max_participants;
                const disabled = isFull ? 'disabled' : '';
                const fullText = isFull ? ' (FULL)' : '';
                eventSelect.innerHTML += `<option value="${event._id}" ${disabled}>${event.name} - ${formattedDate}${fullText}</option>`;
            });
        } else {
            eventSelect.innerHTML = '<option value="">No events available</option>';
        }
    } catch (error) {
        console.error('Error loading events:', error);
        eventSelect.innerHTML = '<option value="">Error loading events</option>';
        showMessage('Error loading events', 'error');
    }
}

// Register Participant for Event
async function registerParticipant() {
    const eventId = eventSelect.value;
    
    if (!eventId) {
        showMessage('Please select an event', 'error');
        return;
    }
    
    if (!currentParticipantId) {
        showMessage('Participant ID is missing', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/registrations/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                event_id: eventId,
                participant_id: currentParticipantId
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showMessage('Registration successful!', 'success');
            closeRegistrationModal();
            // Reload participants to show updated registration
            loadParticipants();
            // Also reload events to update participant count
            if (homeSection.classList.contains('active')) {
                loadEvents();
            }
        } else {
            showMessage(`Error: ${result.message}`, 'error');
        }
    } catch (error) {
        console.error('Error registering participant:', error);
        showMessage('Error connecting to server', 'error');
    }
}

// Close Registration Modal
function closeRegistrationModal() {
    registrationModal.style.display = 'none';
    currentParticipantId = null;
    eventSelect.value = '';
    participantNameDisplay.textContent = '';
}

// Make functions available globally
window.deleteEvent = deleteEvent;
window.deleteParticipant = deleteParticipant;
window.openRegistrationModal = openRegistrationModal;
window.registerParticipant = registerParticipant;
window.closeRegistrationModal = closeRegistrationModal;


