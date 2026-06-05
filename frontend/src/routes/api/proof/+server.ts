import { json, type RequestHandler } from '@sveltejs/kit';
import { groth16 } from 'snarkjs';
import path from 'path';
import fs from 'fs';
import csv from 'csv-parser';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const data = await request.formData();
    const file = data.get('file') as File;
    if (!file) return json({ error: 'No file uploaded' }, { status: 400 });

    const tmpPath = `/tmp/${file.name}`;
    fs.writeFileSync(tmpPath, Buffer.from(await file.arrayBuffer()));

    const rows: any[] = [];
    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(tmpPath)
        .pipe(csv())
        .on('data', (row) => rows.push(row))
        .on('end', resolve)
        .on('error', reject);
    });

    const row = rows[0];
    const inputs = {
      age: Number(row.Age),
      salary: Number(row.Salary),
      citizenship: row.Location === 'New York' ? 1 : 0,
      isEmployee: row.Status === 'Active' ? 1 : 0,
      isVerified: Number(row['Performance Score']) >= 3 ? 1 : 0
    };

    const wasmPath = path.resolve('../backend/circuits/zkPayroll.wasm');
    const zkeyPath = path.resolve('../backend/circuits/circuit_final.zkey');

    const { proof, publicSignals } = await groth16.fullProve(inputs, wasmPath, zkeyPath);
    return json({ proof, publicSignals });
  } catch (err: any) {
    console.error('proof error:', err);
    return json({ error: err.message || 'Proof generation failed' }, { status: 500 });
  }
};
