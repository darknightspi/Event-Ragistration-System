# MongoDB Connection Setup Guide

## Option 1: MongoDB Atlas (Recommended - Cloud, Free)

**MongoDB Atlas** is a free cloud-hosted MongoDB service. No installation required!

### Steps to Set Up MongoDB Atlas:

1. **Sign up for free account**
   - Go to: https://www.mongodb.com/cloud/atlas/register
   - Create a free account (M0 Free Tier)

2. **Create a Cluster**
   - After signup, create a new cluster (choose FREE tier)
   - Select your preferred region
   - Click "Create Cluster" (takes a few minutes)

3. **Create Database User**
   - Go to "Database Access" → "Add New Database User"
   - Choose "Password" authentication
   - Create username and password (save these!)
   - Set privileges to "Read and write to any database"
   - Click "Add User"

4. **Whitelist IP Address**
   - Go to "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" (or add your specific IP)
   - Click "Confirm"

5. **Get Connection String**
   - Go to "Database" → Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)
   - Replace `<password>` with your database user password
   - Add database name at the end: `...mongodb.net/event-registration`

6. **Update .env file**
   ```
   MONGODB_URI=mongodb+srv://yourusername:yourpassword@cluster0.xxxxx.mongodb.net/event-registration?retryWrites=true&w=majority
   PORT=3000
   ```

7. **Restart the server**
   ```bash
   npm start
   ```

---

## Option 2: Local MongoDB Installation

### Install MongoDB on Windows:

1. **Download MongoDB**
   - Go to: https://www.mongodb.com/try/download/community
   - Select Windows version
   - Download and run installer

2. **Install MongoDB**
   - Choose "Complete" installation
   - Install as Windows Service (recommended)
   - Install MongoDB Compass (optional GUI tool)

3. **Start MongoDB Service**
   ```powershell
   net start MongoDB
   ```

4. **Update .env file** (already set correctly)
   ```
   MONGODB_URI=mongodb://localhost:27017/event-registration
   PORT=3000
   ```

5. **Restart the server**
   ```bash
   npm start
   ```

---

## Verify Connection

After setting up, test the connection:

```bash
# Seed the database (creates sample data)
npm run seed

# If successful, you'll see:
# ✅ Connected to MongoDB
# ✅ Created 2 events
# ✅ Created 2 participants
# ✅ Created 1 registration
```

---

## Current Status

Your `.env` file is set to use local MongoDB. If you want to use MongoDB Atlas:
1. Follow Option 1 above
2. Update the `MONGODB_URI` in `.env` file with your Atlas connection string
3. Restart the server



