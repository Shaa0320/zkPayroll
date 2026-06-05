const fs = require("fs");

const data = [];

for (let i = 1; i <= 3000; i++) {
  data.push({
    id: i,
    age: Math.floor(Math.random() * 40) + 18,        // 18–58
    salary: Math.floor(Math.random() * 70000) + 20000, // 20k–90k
    citizenship: Math.random() > 0.1 ? 1 : 0,       // 90% valid
    isEmployee: 1,
    isVerified: Math.random() > 0.2 ? 1 : 0         // 80% verified
  });
}

fs.writeFileSync("dataset.json", JSON.stringify(data, null, 2));

console.log("✅ 3000 employee dataset generated");
