import mongoose from 'mongoose';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached!.conn && mongoose.connection.readyState === 1) {
    return cached!.conn;
  }

  const mongodbUri = process.env.MONGODB_URI;
  if (!mongodbUri) {
    throw new Error('MONGODB_URI environment variable is not defined.');
  }

  if (!cached!.promise || mongoose.connection.readyState === 0) {
    const opts = {
      dbName: process.env.DATABASE_NAME || 'test',
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    };

    console.log(`DATABASE_URI: ${mongodbUri}`);
    console.log(`DATABASE_NAME: ${process.env.DATABASE_NAME}`);

    cached!.promise = mongoose.connect(mongodbUri, opts).then((mongooseInstance) => {
      return mongooseInstance;
    }).catch((err) => {
      cached!.promise = null;
      throw err;
    });
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (e) {
    cached!.promise = null;
    throw e;
  }

  return cached!.conn;
}
