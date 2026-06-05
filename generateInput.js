const fs = require('fs');
const csv = require('csv-parser');

fs.createReadStream('Employe_Performance_dataset.csv')
  .pipe(csv())
  .on('data', (row) => {
    const salary = Number(row.Salary);
    const performance = Number(row['Performance Score']) || 0;

    if (!isNaN(salary)) {
      const input = {
        grossSalary: salary + performance * 100, // simple bonus logic
        isVerified: 0
      };

      fs.writeFileSync('input.json', JSON.stringify(input, null, 2));
      console.log('✅ input.json created for:', row.ID);
      process.exit(0); // stop after first valid row
    }
  });
