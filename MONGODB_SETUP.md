# MongoDB Local Setup - Quick Reference

## After Installation Completes

### 1. Start MongoDB Service

```bash
brew services start mongodb-community
```

### 2. Update .env.local

Replace the MongoDB Atlas connection string with:

```
MONGODB_URI=mongodb://localhost:27017/fixswift_crm
JWT_SECRET=fixswift-crm-super-secret-key-change-in-production-2024
```

### 3. Test Connection

```bash
node test-mongo-connection.js
```

### 4. Restart Dev Server

```bash
# Stop current server (Ctrl+C if running)
npm run dev
```

### 5. Test Authentication

1. Navigate to `http://localhost:3000/register`
2. Create a new account
3. Should redirect to dashboard after successful registration

## MongoDB Management Commands

**Start MongoDB:**

```bash
brew services start mongodb-community
```

**Stop MongoDB:**

```bash
brew services stop mongodb-community
```

**Check Status:**

```bash
brew services list | grep mongodb
```

**Connect with MongoDB Shell:**

```bash
mongosh
```

## Verify Installation

```bash
# Check if MongoDB is installed
brew list mongodb-community

# Check if MongoDB is running
brew services list | grep mongodb
```
