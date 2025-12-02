require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

async function testConnection() {
  try {
    console.log('🔍 Testing MongoDB connection...');
    console.log('📍 URI:', MONGODB_URI ? MONGODB_URI.replace(/:[^:]*@/, ':****@') : 'NOT SET');
    
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in .env.local');
    }
    
    console.log('\n⏳ Attempting to connect...');
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log('✅ MongoDB connected successfully!');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
    console.log('🌐 Host:', mongoose.connection.host);
    
    await mongoose.connection.close();
    console.log('\n✅ Connection test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ MongoDB connection failed!');
    console.error('Error:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Suggestions:');
      console.log('   1. Try using standard connection string instead of SRV format');
      console.log('   2. Check MongoDB Atlas Network Access settings');
      console.log('   3. Verify your IP is whitelisted');
      console.log('   4. Try using local MongoDB for development');
      console.log('\n📖 See mongodb_troubleshooting.md for detailed solutions');
    }
    
    process.exit(1);
  }
}

testConnection();
