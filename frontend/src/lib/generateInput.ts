// frontend/src/lib/generateInput.ts

// Parse CSV text into array of row objects
export function parseCsv(text: string): any[] {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines[0].split(/[\t,]/).map(h => h.trim().toLowerCase());
  return lines.slice(1).map(line => {
    const values = line.split(/[\t,]/).map(v => v.trim());
    const row: any = {};
    headers.forEach((h, i) => {
      row[h] = values[i];
    });
    return row;
  });
}

// Safe date parser for YYYY-MM-DD
function safeParseDate(s: string): Date | null {
  if (!s) return null;
  const iso = new Date(s);
  if (!isNaN(iso.getTime())) return iso;
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) {
    return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  }
  return null;
}

// Compute years of service from "joining date"
export function computeYearsOfService(joiningDate: string): number {
  const start = safeParseDate(joiningDate);
  if (!start) return 0;
  const now = new Date();
  const diff = now.getTime() - start.getTime();
  const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
  return years >= 0 ? years : 0;
}

// Map a CSV row into circuit input format
export function toCircuitInput(row: any) {
  const salary = Number(row["salary"]) || 0;
  const tax = Math.floor(salary * 0.1);
  const net = salary - tax;
  const years = computeYearsOfService(row["joining date"]);

  return {
    age: Number(row["age"]) || 0,
    salary,
    citizenship: 1,
    isEmployee: (row["status"] || "").toLowerCase() === "active" ? 1 : 0,
    isVerified: Number(row["performance score"]) >= 1 ? 1 : 0,
    gross: salary,
    tax,
    net,
    performanceScore: Number(row["performance score"]) || 0,
    yearsOfService: years
  };
}
