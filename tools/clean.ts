import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/trilho';

async function cleanDatabase() {
  console.log('🧹 Connecting to MongoDB database...');
  await mongoose.connect(MONGODB_URI);

  try {
    const collections = await mongoose.connection.db.collections();
    for (const collection of collections) {
      await collection.deleteMany({});
      console.log(`  ✔ Cleared collection: ${collection.collectionName}`);
    }
    console.log('\n✨ Database cleaned successfully! All collections cleared.');
  } catch (error) {
    console.error('❌ Error cleaning database:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
  }
}

cleanDatabase();
