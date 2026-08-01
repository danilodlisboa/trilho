import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import path from 'path';

import { User } from '../src/models/User';
import { Board } from '../src/models/Board';
import { Column } from '../src/models/Column';
import { Card } from '../src/models/Card';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/trilho';

async function seedDatabase() {
  console.log('🌱 Connecting to MongoDB database...');
  await mongoose.connect(MONGODB_URI);

  try {
    console.log('  🧹 Clearing existing collections...');
    await User.deleteMany({});
    await Board.deleteMany({});
    await Column.deleteMany({});
    await Card.deleteMany({});

    console.log('  👤 Creating default seed users...');
    const defaultPasswordHash = await bcrypt.hash('password123', 10);

    const adminUser = await User.create({
      name: 'Danilo Silva (Admin)',
      email: 'admin@trilho.com',
      passwordHash: defaultPasswordHash,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Danilo',
    });

    const userMaria = await User.create({
      name: 'Maria Oliveira',
      email: 'maria@trilho.com',
      passwordHash: defaultPasswordHash,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    });

    const userCarlos = await User.create({
      name: 'Carlos Souza',
      email: 'carlos@trilho.com',
      passwordHash: defaultPasswordHash,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
    });

    const membersList = [adminUser._id, userMaria._id, userCarlos._id];

    console.log('  📱 Creating Board 1: Trilho Mobile App...');
    const board1 = await Board.create({
      title: '📱 Trilho Mobile App',
      description: 'Mobile application development using React Native and Next.js API',
      ownerId: adminUser._id,
      members: membersList,
    });

    const colTodo1 = await Column.create({ boardId: board1._id, title: 'To Do', order: 0 });
    const colInProg1 = await Column.create({ boardId: board1._id, title: 'In Progress', order: 1 });
    const colInReview1 = await Column.create({ boardId: board1._id, title: 'In Review', order: 2 });
    const colDone1 = await Column.create({ boardId: board1._id, title: 'Done', order: 3 });

    await Card.create([
      {
        boardId: board1._id,
        columnId: colTodo1._id,
        title: 'Implement Push Notifications',
        description: 'Configure Firebase Cloud Messaging (FCM) service and handle permissions.',
        priority: 'high',
        dueDate: new Date(Date.now() + 86400000 * 3),
        assigneeId: adminUser._id,
        order: 0,
        checklist: [
          { id: '1', text: 'Register app in Firebase Console', completed: true },
          { id: '2', text: 'Install FCM SDK', completed: false },
          { id: '3', text: 'Test sending test notification', completed: false },
        ],
      },
      {
        boardId: board1._id,
        columnId: colInProg1._id,
        title: 'Develop Biometric Authentication Screen',
        description: 'Touch ID and Face ID support integrated with Secure Store.',
        priority: 'high',
        dueDate: new Date(Date.now() - 86400000 * 1),
        assigneeId: userMaria._id,
        order: 0,
        checklist: [
          { id: '1', text: 'Integrate react-native-biometrics', completed: true },
          { id: '2', text: 'Create numeric PIN fallback', completed: true },
        ],
      },
      {
        boardId: board1._id,
        columnId: colDone1._id,
        title: 'Configure CI/CD Pipelines',
        description: 'Automated build and release pipelines via GitHub Actions.',
        priority: 'medium',
        dueDate: new Date(Date.now() - 86400000 * 5),
        assigneeId: userMaria._id,
        order: 0,
        checklist: [
          { id: '1', text: 'Generate certificates', completed: true },
          { id: '2', text: 'Verify automated release build', completed: true },
        ],
      },
    ]);

    console.log('  🌐 Creating Board 2: Web Portal & API...');
    const board2 = await Board.create({
      title: '🌐 Web Portal & API',
      description: 'MongoDB NoSQL backend with Mongoose and Next.js App Router',
      ownerId: adminUser._id,
      members: membersList,
    });

    const colTodo2 = await Column.create({ boardId: board2._id, title: 'To Do', order: 0 });
    const colInProg2 = await Column.create({ boardId: board2._id, title: 'In Progress', order: 1 });
    await Column.create({ boardId: board2._id, title: 'In Review', order: 2 });
    await Column.create({ boardId: board2._id, title: 'Done', order: 3 });

    await Card.create([
      {
        boardId: board2._id,
        columnId: colInProg2._id,
        title: 'Mongoose Schemas Refactoring',
        description: 'Add query performance compound indexes for boardId and columnId on cards.',
        priority: 'high',
        dueDate: new Date(Date.now() + 86400000 * 1),
        assigneeId: adminUser._id,
        order: 0,
        checklist: [{ id: '1', text: 'Add compound index to CardSchema', completed: true }],
      },
      {
        boardId: board2._id,
        columnId: colTodo2._id,
        title: 'Stripe Webhooks Integration',
        description: 'Handle customer.subscription.created and updated webhook events.',
        priority: 'medium',
        dueDate: new Date(Date.now() + 86400000 * 10),
        assigneeId: userCarlos._id,
        order: 0,
        checklist: [],
      },
    ]);

    console.log('\n✨ Database seeded successfully!');
    console.log('🔑 Credentials to log in:');
    console.log('   - Email:    admin@trilho.com');
    console.log('   - Password: password123');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
  }
}

seedDatabase();
