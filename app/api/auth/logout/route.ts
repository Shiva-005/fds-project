import { NextRequest } from 'next/server';
import { AuthController } from '@/controllers/auth.controller';

export async function POST(req: NextRequest) {
    return AuthController.logout(req);
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    },
  });
}
