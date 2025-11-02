# Event Registration System

A complete Event Registration System built with **Node.js**, **Express.js**, and **MongoDB** (Mongoose). This system allows you to manage events, participants, and their registrations with full CRUD operations.

## Features

- ✅ **Event Management**: Create, read, update, and delete events
- ✅ **Participant Management**: Create, read, update, and delete participants
- ✅ **Registration System**: Register and unregister participants for events
- ✅ **Data Validation**: Comprehensive validation using Mongoose schemas
- ✅ **RESTful API**: Clean JSON API endpoints
- ✅ **Sample Data**: Included seeding script for quick testing

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM (Object Data Modeling)
- **dotenv** - Environment variables management

## Project Structure

```
Event Registration System/
├── models/
│   ├── Event.js           # Event model schema
│   ├── Participant.js     # Participant model schema
│   └── Registration.js    # Registration model schema
├── routes/
│   ├── events.js          # Event routes (CRUD)
│   ├── participants.js    # Participant routes (CRUD)
│   └── registrations.js   # Registration routes
├── server.js              # Main server file
├── seed.js                # Database seeding script
├── package.json           # Dependencies
├── .env.example           # Environment variables template
└── README.md              # Documentation
```

## Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd "Event Registration System"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env`
   - Update `MONGODB_URI` with your MongoDB connection string
     - Local MongoDB: `mongodb://localhost:27017/event-registration`
     - MongoDB Atlas: `mongodb+srv://username:password@cluster.mongodb.net/event-registration`

4. **Make sure MongoDB is running**
   - For local MongoDB, ensure the MongoDB service is running
   - For MongoDB Atlas, ensure your connection string is correct and IP whitelist is configured

5. **Seed the database (optional)**
   ```bash
   npm run seed
   ```
   This will create 2 sample events, 2 participants, and 1 registration.

6. **Start the server**
   ```bash
   npm start
   ```
   Server will run on `http://localhost:3000` (or the port specified in `.env`)

## API Endpoints

### Events

- **GET** `/events` - Get all events
- **GET** `/events/:id` - Get event by ID
- **POST** `/events` - Create new event
- **PUT** `/events/:id` - Update event
- **DELETE** `/events/:id` - Delete event

**Example - Create Event:**
```json
POST /events
{
  "name": "Tech Conference 2024",
  "date": "2024-12-15T10:00:00",
  "venue": "Convention Center",
  "organizer": "Tech Community",
  "description": "Annual technology conference",
  "max_participants": 500
}
```

### Participants

- **GET** `/participants` - Get all participants
- **GET** `/participants/:id` - Get participant by ID
- **POST** `/participants` - Create new participant
- **PUT** `/participants/:id` - Update participant
- **DELETE** `/participants/:id` - Delete participant

**Example - Create Participant:**
```json
POST /participants
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "1234567890",
  "department": "Computer Science",
  "year": "Third"
}
```

### Registrations

- **POST** `/registrations/register` - Register participant for event
- **DELETE** `/registrations/unregister` - Unregister participant from event
- **GET** `/registrations` - Get all registrations
  - Query params: `?event_id=xxx` or `?participant_id=xxx` for filtering

**Example - Register:**
```json
POST /registrations/register
{
  "event_id": "event_id_here",
  "participant_id": "participant_id_here"
}
```

**Example - Unregister:**
```json
DELETE /registrations/unregister
{
  "event_id": "event_id_here",
  "participant_id": "participant_id_here"
}
```

## Database Schema

### Events Collection
```javascript
{
  name: String (required, min 3 chars),
  date: Date (required, must be future date),
  venue: String (required),
  organizer: String (required),
  description: String,
  max_participants: Number (required, min 1),
  registered_count: Number (default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

### Participants Collection
```javascript
{
  name: String (required, min 2 chars),
  email: String (required, unique, valid email format),
  phone: String (required, 10 digits),
  department: String (required),
  year: String (required, enum: ['First', 'Second', 'Third', 'Fourth', 'Graduate', 'Other']),
  registered_events: [ObjectId] (references Event),
  createdAt: Date,
  updatedAt: Date
}
```

### Registrations Collection
```javascript
{
  event_id: ObjectId (required, references Event),
  participant_id: ObjectId (required, references Participant),
  registration_date: Date (default: now),
  createdAt: Date,
  updatedAt: Date
}
```

## Sample Data

The seed script (`npm run seed`) creates:
- **2 Events**: Tech Conference 2024, Web Development Workshop
- **2 Participants**: John Doe, Jane Smith
- **1 Registration**: John Doe registered for Tech Conference 2024

## Testing with cURL or Postman

### Test Events Endpoint
```bash
# Get all events
curl http://localhost:3000/events

# Create an event
curl -X POST http://localhost:3000/events \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Hackathon 2024",
    "date": "2024-12-20T09:00:00",
    "venue": "Tech Hub",
    "organizer": "Developer Community",
    "description": "24-hour coding competition",
    "max_participants": 100
  }'
```

### Test Participants Endpoint
```bash
# Get all participants
curl http://localhost:3000/participants

# Create a participant
curl -X POST http://localhost:3000/participants \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "phone": "5551234567",
    "department": "Computer Engineering",
    "year": "Fourth"
  }'
```

### Test Registrations Endpoint
```bash
# Register a participant
curl -X POST http://localhost:3000/registrations/register \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": "EVENT_ID_HERE",
    "participant_id": "PARTICIPANT_ID_HERE"
  }'

# Get all registrations
curl http://localhost:3000/registrations

# Get registrations for a specific event
curl http://localhost:3000/registrations?event_id=EVENT_ID_HERE
```

## Error Handling

All endpoints return JSON responses with a `success` field:
- `success: true` - Operation successful
- `success: false` - Operation failed

Error responses include:
- **400**: Bad Request (validation errors)
- **404**: Not Found (resource not found)
- **500**: Internal Server Error

## Validation Rules

- **Event Name**: Minimum 3 characters
- **Event Date**: Must be in the future
- **Max Participants**: Must be at least 1
- **Participant Name**: Minimum 2 characters
- **Email**: Must be unique and valid format
- **Phone**: Must be exactly 10 digits
- **Year**: Must be one of: First, Second, Third, Fourth, Graduate, Other
- **Registration**: One participant can only register once per event
- **Event Capacity**: Cannot register if event is full

## License

ISC

