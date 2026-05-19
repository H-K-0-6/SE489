const xlsx = require('xlsx');

try {
  const workbook = xlsx.readFile('c:/Users/uneve/Desktop/SE489/TCMLite - Sample(1).xls');
  console.log("Sheet names:", workbook.SheetNames);
  
  // Let's check the second sheet which might have the actual test cases
  if (workbook.SheetNames.length > 3) {
    const sheet = workbook.Sheets[workbook.SheetNames[3]];
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    
    for(let i=0; i<15; i++) {
        console.log(`Row ${i}:`, data[i]);
    }
    console.log("Total rows in sheet 4:", data.length);
  }
} catch (e) {
  console.error("Error reading file:", e);
}
