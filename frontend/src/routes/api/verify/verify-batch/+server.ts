import { json, type RequestHandler } from '@sveltejs/kit';
import { groth16 } from 'snarkjs';
import path from 'path';
import fs from 'fs';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { proofs, publicSignals } = await request.json();
    if (!Array.isArray(proofs) || !Array.isArray(publicSignals)) {
      return json({ error: 'Invalid batch payload' }, { status: 400 });
    }

    const vkeyPath = path.resolve('../backend/circuits/verification_key.json');
    const vkey = JSON.parse(fs.readFileSync(vkeyPath, 'utf-8'));

    const results: boolean[] = [];
    for (let i = 0; i < proofs.length; i++) {
      const ok = await groth16.verify(vkey, publicSignals[i], proofs[i]);
      results.push(ok);
    }

    return json({ count: proofs.length, results });
  } catch (err: any) {
    console.error('verify-batch error:', err);
    return json({ error: err.message || 'Batch verification failed' }, { status: 500 });
  }
};
