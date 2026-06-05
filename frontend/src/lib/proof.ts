import * as snarkjs from "snarkjs";

export type FullProofResult = {
  proof: unknown;
  publicSignals: string[];
};

export async function fullProve(input: unknown): Promise<FullProofResult> {
  const wasmUrl = "/circuit.wasm";
  const zkeyUrl = "/circuit.zkey";
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, wasmUrl, zkeyUrl);
  return { proof, publicSignals };
}

export async function verify(proof: unknown, publicSignals: string[]): Promise<boolean> {
  const vkeyResp = await fetch("/verification_key.json");
  if (!vkeyResp.ok) throw new Error("verification key not found");
  const vkey = await vkeyResp.json();
  return snarkjs.groth16.verify(vkey, publicSignals, proof);
}
