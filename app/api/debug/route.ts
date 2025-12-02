import { NextResponse } from 'next/server';

export async function GET() {
    const mongoUri = process.env.MONGODB_URI;

    return NextResponse.json({
        hasMongoUri: !!mongoUri,
        uriLength: mongoUri?.length || 0,
        uriStart: mongoUri?.substring(0, 30) || 'undefined',
        allEnvKeys: Object.keys(process.env).filter(k => k.includes('MONGO')),
        nodeEnv: process.env.NODE_ENV,
    });
}
