require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('./models/Event');
const Participant = require('./models/Participant');
const Registration = require('./models/Registration');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/event-registration';

/**
 * Seed script to populate database with sample data
 * Creates 2 events, 2 participants, and 1 registration
 */
async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Event.deleteMany({});
    await Participant.deleteMany({});
    await Registration.deleteMany({});
    console.log('🧹 Cleared existing data');

    // Create Events
    const event1 = new Event({
      name: 'Tech Conference 2025',
      date: new Date('2025-12-15T10:00:00'),
      venue: 'Convention Center, Hall A',
      organizer: 'Tech Community Organization',
      description: 'Annual technology conference featuring latest innovations, keynotes, and networking opportunities.',
      max_participants: 500,
      registered_count: 0
    });

    const event2 = new Event({
      name: 'Web Development Workshop',
      date: new Date('2025-11-20T14:00:00'),
      venue: 'University Campus, Room 301',
      organizer: 'Computer Science Department',
      description: 'Hands-on workshop covering modern web development practices, React, and Node.js.',
      max_participants: 50,
      registered_count: 0
    });

    const savedEvent1 = await event1.save();
    const savedEvent2 = await event2.save();
    console.log('✅ Created 2 events');

    // Create Participants
    const participant1 = new Participant({
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '1234567890',
      department: 'Computer Science',
      year: 'Third',
      registered_events: []
    });

    const participant2 = new Participant({
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '9876543210',
      department: 'Information Technology',
      year: 'Second',
      registered_events: []
    });

    const savedParticipant1 = await participant1.save();
    const savedParticipant2 = await participant2.save();
    console.log('✅ Created 2 participants');

    // Create Registration (participant1 registers for event1)
    const registration = new Registration({
      event_id: savedEvent1._id,
      participant_id: savedParticipant1._id,
      registration_date: new Date()
    });

    await registration.save();

    // Update event registered_count
    savedEvent1.registered_count = 1;
    await savedEvent1.save();

    // Update participant registered_events
    savedParticipant1.registered_events.push(savedEvent1._id);
    await savedParticipant1.save();

    console.log('✅ Created 1 registration');

    // Display summary
    console.log('\n📊 Seed Data Summary:');
    console.log('===================');
    console.log(`Events: ${await Event.countDocuments()}`);
    console.log(`Participants: ${await Participant.countDocuments()}`);
    console.log(`Registrations: ${await Registration.countDocuments()}`);
    console.log('\n✅ Database seeded successfully!');

    // Close connection
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run seed function
seedDatabase();

