import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
import { Board } from '@/models/Board';
import { Column } from '@/models/Column';
import { Card } from '@/models/Card';

export async function POST() {
  try {
    // Block seed in production to prevent accidental data destruction
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Seed disabled in production.' }, { status: 403 });
    }

    await connectToDatabase();

    // Clear existing collections for a clean seed reset
    await User.deleteMany({});
    await Board.deleteMany({});
    await Column.deleteMany({});
    await Card.deleteMany({});

    const defaultPasswordHash = await bcrypt.hash('password123', 10);

    // Create seed users
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

    // Board 1: Trilho Mobile App
    const board1 = await Board.create({
      title: '📱 Trilho Mobile App',
      description: 'Mobile application development using React Native and Next.js API',
      ownerId: adminUser._id,
      members: membersList,
    });

    // Default Columns for Board 1
    const colTodo1 = await Column.create({ boardId: board1._id, title: 'To Do', order: 0 });
    const colInProg1 = await Column.create({ boardId: board1._id, title: 'In Progress', order: 1 });
    const colInReview1 = await Column.create({ boardId: board1._id, title: 'In Review', order: 2 });
    const colDone1 = await Column.create({ boardId: board1._id, title: 'Done', order: 3 });

    // Cards for Board 1
    await Card.create([
      {
        boardId: board1._id,
        columnId: colTodo1._id,
        title: 'Implement Push Notifications',
        description: 'Configure Firebase Cloud Messaging (FCM) service and handle iOS/Android permissions.',
        priority: 'high',
        dueDate: new Date(Date.now() + 86400000 * 3), // +3 days
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
        columnId: colTodo1._id,
        title: 'Offline Mode & Cache Sync',
        description: 'Store local data in SQLite/AsyncStorage when offline without network connection.',
        priority: 'medium',
        dueDate: new Date(Date.now() + 86400000 * 7),
        assigneeId: userCarlos._id,
        order: 1,
        checklist: [
          { id: '1', text: 'Define local storage schema', completed: false },
          { id: '2', text: 'Create background sync queue', completed: false },
        ],
      },
      {
        boardId: board1._id,
        columnId: colInProg1._id,
        title: 'Develop Biometric Authentication Screen',
        description: 'Touch ID and Face ID support integrated with Secure Store.',
        priority: 'high',
        dueDate: new Date(Date.now() - 86400000 * 1), // Overdue!
        assigneeId: userMaria._id,
        order: 0,
        checklist: [
          { id: '1', text: 'Integrate react-native-biometrics', completed: true },
          { id: '2', text: 'Create numeric PIN fallback', completed: true },
          { id: '3', text: 'Validate session tokens', completed: false },
        ],
      },
      {
        boardId: board1._id,
        columnId: colInReview1._id,
        title: 'Optimize List Performance (FlashList)',
        description: 'Replace FlatList with FlashList to render 1000+ cards smoothly without lag.',
        priority: 'low',
        dueDate: new Date(Date.now() + 86400000 * 2),
        assigneeId: adminUser._id,
        order: 0,
        checklist: [
          { id: '1', text: 'Benchmark previous FPS rate', completed: true },
          { id: '2', text: 'Implement FlashList component', completed: true },
        ],
      },
      {
        boardId: board1._id,
        columnId: colDone1._id,
        title: 'Configure Fastlane CI/CD for App Stores',
        description: 'Automated build and release pipelines via GitHub Actions.',
        priority: 'medium',
        dueDate: new Date(Date.now() - 86400000 * 5),
        assigneeId: userMaria._id,
        order: 0,
        checklist: [
          { id: '1', text: 'Generate Apple certificates & profiles', completed: true },
          { id: '2', text: 'Configure secrets in GitHub Actions', completed: true },
          { id: '3', text: 'Verify automated release build', completed: true },
        ],
      },
    ]);

    // Board 2: Web Portal & API
    const board2 = await Board.create({
      title: '🌐 Web Portal & API',
      description: 'MongoDB NoSQL backend with Mongoose and Next.js App Router',
      ownerId: adminUser._id,
      members: membersList,
    });

    const colTodo2 = await Column.create({ boardId: board2._id, title: 'To Do', order: 0 });
    const colInProg2 = await Column.create({ boardId: board2._id, title: 'In Progress', order: 1 });
    const colInReview2 = await Column.create({ boardId: board2._id, title: 'In Review', order: 2 });
    const colDone2 = await Column.create({ boardId: board2._id, title: 'Done', order: 3 });

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
        checklist: [
          { id: '1', text: 'Add compound index to CardSchema', completed: true },
          { id: '2', text: 'Run query stress testing', completed: false },
        ],
      },
      {
        boardId: board2._id,
        columnId: colTodo2._id,
        title: 'Stripe Webhooks Integration for Subscriptions',
        description: 'Handle customer.subscription.created and updated webhook events.',
        priority: 'medium',
        dueDate: new Date(Date.now() + 86400000 * 10),
        assigneeId: userCarlos._id,
        order: 0,
        checklist: [],
      },
    ]);

    // Board 3: Redesign & Branding
    const board3 = await Board.create({
      title: '🎨 Redesign & Branding',
      description: 'Design System, Shadcn components and Dark Mode UX experience',
      ownerId: adminUser._id,
      members: membersList,
    });

    await Column.create({ boardId: board3._id, title: 'To Do', order: 0 });
    await Column.create({ boardId: board3._id, title: 'In Progress', order: 1 });
    await Column.create({ boardId: board3._id, title: 'In Review', order: 2 });
    await Column.create({ boardId: board3._id, title: 'Done', order: 3 });

    return NextResponse.json({
      message: 'Database seeded successfully!',
      adminEmail: 'admin@trilho.com',
      boardsCount: 3,
    });
  } catch (error: any) {
    console.error('Database seed error:', error);
    return NextResponse.json({ error: error.message || 'Error seeding database' }, { status: 500 });
  }
}
