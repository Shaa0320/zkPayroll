<script lang="ts">
  let file: File | null = null;
  let batchResult: any = null;
  let verifyResult: any = null;
  let error: string | null = null;

  function handleFile(e: Event) {
    const target = e.target as HTMLInputElement;
    file = target.files?.[0] ?? null;
  }

  async function generateAndVerify() {
    error = null;
    batchResult = null;
    verifyResult = null;

    if (!file) {
      error = "No file selected";
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const proofRes = await fetch('/api/proof-batch', {
        method: 'POST',
        body: formData
      });
      batchResult = await proofRes.json();

      if (!batchResult.rows) {
        error = "Backend did not return rows";
        return;
      }

      const verifyRes = await fetch('/api/verify-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proofs: batchResult.proofs,
          publicSignals: batchResult.publicSignals
        })
      });
      verifyResult = await verifyRes.json();

      if (!verifyResult.results) {
        error = "Backend did not return results";
      }
    } catch (err: any) {
      error = err.message || "Unexpected error";
    }
  }

  function summaryText() {
    if (!verifyResult?.results) return '';
    const total = verifyResult.count;
    const valid = verifyResult.results.filter((r: boolean) => r).length;
    const invalid = total - valid;
    return `${valid} employees verified ✅, ${invalid} failed ❌`;
  }
</script>

<main class="p-4">
  <input type="file" accept=".csv" on:change={handleFile} class="mb-4" />
  <button on:click={generateAndVerify} class="bg-blue-600 text-white px-4 py-2 rounded">
    Generate & Verify All Proofs
  </button>

  {#if error}
    <p class="text-red-600 mt-4">{error}</p>
  {/if}

  {#if batchResult?.rows && verifyResult?.results}
    <h2 class="mt-6 font-bold">Employee Dashboard</h2>
    <p class="mb-2 font-semibold">{summaryText()}</p>

    <table class="table-auto border-collapse border border-gray-400 mt-2 w-full text-sm">
      <thead>
        <tr class="bg-gray-200">
          <th class="border px-2 py-1">#</th>
          <th class="border px-2 py-1">Name</th>
          <th class="border px-2 py-1">Department</th>
          <th class="border px-2 py-1">Location</th>
          <th class="border px-2 py-1">Status</th>
          <th class="border px-2 py-1">Performance</th>
          <th class="border px-2 py-1">Age</th>
          <th class="border px-2 py-1">Salary</th>
          <th class="border px-2 py-1">Proof Valid</th>
        </tr>
      </thead>
      <tbody>
        {#each batchResult.rows as row, i}
          <tr class={verifyResult.results[i] ? "bg-green-100" : "bg-red-100"}>
            <td class="border px-2 py-1">{i + 1}</td>
            <td class="border px-2 py-1">{row.Name}</td>
            <td class="border px-2 py-1">{row.Department}</td>
            <td class="border px-2 py-1">{row.Location}</td>
            <td class="border px-2 py-1">{row.Status}</td>
            <td class="border px-2 py-1">{row['Performance Score']}</td>
            <td class="border px-2 py-1">{row.Age}</td>
            <td class="border px-2 py-1">{row.Salary}</td>
            <td class="border px-2 py-1">{verifyResult.results[i] ? "✅" : "❌"}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</main>
