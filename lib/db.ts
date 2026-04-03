import mongoose from 'mongoose';
import { logger } from '@/utils/logger';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
    throw new Error('Please define MONGODB_URI in .env file');
}

interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

declare global {
    // eslint-disable-next-line no-var
    var mongooseCache: MongooseCache;
}

const cached: MongooseCache = global.mongooseCache ?? { conn: null, promise: null };
global.mongooseCache = cached;

export async function connectDB(): Promise<typeof mongoose> {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        };

        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mg) => {
            logger.info('MongoDB connected successfully');
            return mg;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (err) {
        cached.promise = null;
        logger.error('MongoDB connection error', { error: err });
        throw err;
    }

    return cached.conn;
}
