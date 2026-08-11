import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';

import { User } from '../src/models/User';
import { Board } from '../src/models/Board';
import { Column } from '../src/models/Column';
import { Card } from '../src/models/Card';
import { CustomFieldDefinition } from '../src/models/CustomFieldDefinition';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/trilho';

async function cleanDatabase() {
  console.log('🧹 Connecting to MongoDB database...');
  await mongoose.connect(MONGODB_URI, {
    dbName: process.env.DATABASE_NAME || 'test',
  });

  try {
    console.log('  🧹 Clearing collections via Mongoose models...');
    await User.deleteMany({});
    console.log('  ✔ Cleared collection: users');
    await Board.deleteMany({});
    console.log('  ✔ Cleared collection: boards');
    await Column.deleteMany({});
    console.log('  ✔ Cleared collection: columns');
    await Card.deleteMany({});
    console.log('  ✔ Cleared collection: cards');
    await CustomFieldDefinition.deleteMany({});
    console.log('  ✔ Cleared collection: customfielddefinitions');

    const rawCollections = ['boardinvitations', 'sessions', 'accounts', 'verification_tokens'];
    for (const name of rawCollections) {
      try {
        await mongoose.connection.collection(name).deleteMany({});
        console.log(`  ✔ Cleared collection: ${name}`);
      } catch {
        // Ignore if collection does not exist
      }
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
