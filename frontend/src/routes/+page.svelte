<script lang="ts">
  import { parseCsv, toCircuitInput } from "$lib/generateInput";

  let rows: any[] = [];
  let eligible: Array<{ id: string; name: string }> = [];
  let error = "";
  let loadedCount = 0;

  function filterEligible(rows: any[]) {
    return rows.filter(r => {
      const input = toCircuitInput(r);
      return (
        input.isEmployee === 1 &&
        input.isVerified === 1 &&
        input.performanceScore >= 4 &&
        input.yearsOfService >= 2
      );
    });
  }

  async function handleFileChange(event: Event) {
    try {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;
      const text = await file.text();
      rows = parseCsv(text);
      loadedCount = rows.length;
      eligible = [];
      error = "";
    } catch (e: any) {
      error = e.message;
    }
  }

  function handleVerify() {
    try {
      eligible = filterEligible(rows).map(r => ({
        id: r["id"] || r["ID"],
        name: r["name"] || r["Name"]
      }));
    } catch (e: any) {
      error = e.message;
    }
  }
</script>

<h1 class="title">Appraisal Candidate Selection</h1>

<div class="controls">
  <input type="file" accept=".csv" on:change={handleFileChange} class="file" />
  <button on:click={handleVerify} disabled={!rows.length} class="btn">Verify Candidates</button>
</div>

{#if error}
  <p class="error">{error}</p>
{/if}

<p class="meta">Rows loaded: {loadedCount}</p>

{#if eligible.length}
  <h3 class="section">Eligible candidates ({eligible.length}):</h3>
  <ul class="list">
    {#each eligible as e}
      <li class="item">{e.id} — {e.name}</li>
    {/each}
  </ul>
{:else if loadedCount}
  <p class="empty">No eligible candidates found.</p>
{/if}

<style>
  :global(html, body) {
    background: #000;
  }

  :global(body) {
    margin: 0;
    font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
    color: #00ff00; /* letters green */
  }

  .title {
    color: #ffd400; /* appraisal yellow */
    font-weight: 700;
    margin: 24px 20px 12px 20px;
  }

  .controls {
    display: flex;
    gap: 12px;
    align-items: center;
    padding: 0 20px 12px 20px;
  }

  .file {
    color: #00ff00;
    border: 1px solid #00ff00;
    background: #000;
    padding: 8px;
    border-radius: 6px;
  }

  .btn {
    background: #00a000;   /* button green background */
    color: #000000;        /* button text black */
    border: 1px solid #00ff00;
    padding: 10px 14px;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .meta {
    color: #00ff00;
    margin: 0 20px 8px 20px;
  }

  .section {
    color: #00ffff; /* output cyan */
    margin: 16px 20px 8px 20px;
    font-weight: 700;
  }

  .list {
    list-style: none;
    margin: 0 20px 24px 20px;
    padding: 0;
    border: 1px solid #00ffff;
    border-radius: 8px;
  }

  .item {
    color: #00ffff; /* output cyan */
    padding: 10px 12px;
    border-bottom: 1px solid rgba(0, 255, 255, 0.2);
  }

  .item:last-child {
    border-bottom: none;
  }

  .error {
    color: #ff4d4d;
    margin: 8px 20px;
    font-weight: 600;
  }

  .empty {
    color: #00ffff;
    margin: 12px 20px;
  }

  .file:focus,
  .btn:focus {
    outline: 2px solid #00ffff;
    outline-offset: 2px;
  }
</style>
