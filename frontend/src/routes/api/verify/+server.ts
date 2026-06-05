import { json, type RequestHandler } from '@sveltejs/kit';
import { groth16 } from 'snarkjs';
import path from 'path';
import fs from 'fs';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { proof, publicSignals } = await request.json();

    const vkeyPath = path.resolve('../backend/circuits/verification_key.json');
    const vkey = JSON.parse(fs.readFileSync(vkeyPath, 'utf-8'));

    const ok = await groth16.verify(vkey, publicSignals, proof);
    return json({ valid: ok });
  } catch (err: any) {
    console.error('verify error:', err);
    return json({ error: err.message || 'Verification failed' }, { status: 500 });
  }
};
