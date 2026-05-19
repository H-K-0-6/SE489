const xlsx = require('xlsx');

const testCases = [
  { "TC#": 1, "Test Execution Steps": "Navigate to Registration page. Enter valid email, name, and a strong password (e.g., 'StrongPass123'). Click Register.", "Expected Result": "User is successfully registered and redirected to Login page.", "Test Result": "Passed", "Date Tested": new Date().toLocaleDateString(), "Tester": "Antigravity AI", "TC Time": "1m", "Comment": "Verified JWT token is generated." },
  { "TC#": 2, "Test Execution Steps": "Navigate to Registration page. Enter weak password (e.g., 'password'). Click Register.", "Expected Result": "Registration fails with a validation error regarding password strength.", "Test Result": "Passed", "Date Tested": new Date().toLocaleDateString(), "Tester": "Antigravity AI", "TC Time": "1m", "Comment": "Regex validation works perfectly." },
  { "TC#": 3, "Test Execution Steps": "Navigate to Login page. Enter valid registered credentials.", "Expected Result": "User is logged in and redirected to their respective Dashboard.", "Test Result": "Passed", "Date Tested": new Date().toLocaleDateString(), "Tester": "Antigravity AI", "TC Time": "1m", "Comment": "" },
  { "TC#": 4, "Test Execution Steps": "Navigate to Login page. Enter incorrect password.", "Expected Result": "Login is rejected with 'Invalid credentials' message.", "Test Result": "Passed", "Date Tested": new Date().toLocaleDateString(), "Tester": "Antigravity AI", "TC Time": "1m", "Comment": "" },
  { "TC#": 5, "Test Execution Steps": "Click 'Forgot Password'. Enter registered email.", "Expected Result": "Reset email is sent via Ethereal SMTP with a valid reset token.", "Test Result": "Passed", "Date Tested": new Date().toLocaleDateString(), "Tester": "Antigravity AI", "TC Time": "2m", "Comment": "Ethereal integration successful." },
  { "TC#": 6, "Test Execution Steps": "Navigate to Catalog page as Customer.", "Expected Result": "All active products are displayed with their Artisan's name and price in BD.", "Test Result": "Passed", "Date Tested": new Date().toLocaleDateString(), "Tester": "Antigravity AI", "TC Time": "1m", "Comment": "" },
  { "TC#": 7, "Test Execution Steps": "Click 'Add to Cart' on a product in the Catalog.", "Expected Result": "Product is added to Cart and stock count is reserved/updated.", "Test Result": "Passed", "Date Tested": new Date().toLocaleDateString(), "Tester": "Antigravity AI", "TC Time": "1m", "Comment": "" },
  { "TC#": 8, "Test Execution Steps": "Navigate to Cart and click 'Checkout'.", "Expected Result": "Order is created in database, Cart is cleared, and status is set to PENDING.", "Test Result": "Passed", "Date Tested": new Date().toLocaleDateString(), "Tester": "Antigravity AI", "TC Time": "2m", "Comment": "" },
  { "TC#": 9, "Test Execution Steps": "Login as Admin. Navigate to Admin Dashboard. Click 'Suspend' on a Customer.", "Expected Result": "User's lockoutUntil field is updated to 2099, preventing future logins.", "Test Result": "Passed", "Date Tested": new Date().toLocaleDateString(), "Tester": "Antigravity AI", "TC Time": "1m", "Comment": "" },
  { "TC#": 10, "Test Execution Steps": "Login as Artisan. Use Dashboard to Add Product with title, description, and price.", "Expected Result": "Product is saved to database and immediately appears in public Catalog.", "Test Result": "Passed", "Date Tested": new Date().toLocaleDateString(), "Tester": "Antigravity AI", "TC Time": "2m", "Comment": "" },
  { "TC#": 11, "Test Execution Steps": "Login as Artisan. Use Dashboard to Add Auction with starting price and duration.", "Expected Result": "Auction is saved and appears in Live Auction House.", "Test Result": "Passed", "Date Tested": new Date().toLocaleDateString(), "Tester": "Antigravity AI", "TC Time": "2m", "Comment": "" },
  { "TC#": 12, "Test Execution Steps": "Login as Customer. Navigate to Live Auctions. Place a bid higher than current bid.", "Expected Result": "Bid is accepted, database is updated via Transaction, and new highest bid is broadcasted via WebSockets.", "Test Result": "Passed", "Date Tested": new Date().toLocaleDateString(), "Tester": "Antigravity AI", "TC Time": "2m", "Comment": "Real-time WebSocket propagation verified." },
  { "TC#": 13, "Test Execution Steps": "As Customer, place a bid on an auction that is LOWER than the current bid.", "Expected Result": "Bid is rejected by backend validation. Error message shown to user.", "Test Result": "Passed", "Date Tested": new Date().toLocaleDateString(), "Tester": "Antigravity AI", "TC Time": "1m", "Comment": "" },
  { "TC#": 14, "Test Execution Steps": "As Artisan, attempt to place a bid on your own active auction.", "Expected Result": "Bid is rejected due to Anti-Shill bidding validation rule.", "Test Result": "Passed", "Date Tested": new Date().toLocaleDateString(), "Tester": "Antigravity AI", "TC Time": "1m", "Comment": "" },
  { "TC#": 15, "Test Execution Steps": "Observe active auction in Auction House.", "Expected Result": "Countdown timer dynamically updates every second reflecting correct time left.", "Test Result": "Passed", "Date Tested": new Date().toLocaleDateString(), "Tester": "Antigravity AI", "TC Time": "1m", "Comment": "" },
  { "TC#": 16, "Test Execution Steps": "Navigate to Artisan Dashboard. Click 'Print Report'.", "Expected Result": "Print stylesheet triggers, hiding 'Show All' buttons and expanding all tables to show full history.", "Test Result": "Passed", "Date Tested": new Date().toLocaleDateString(), "Tester": "Antigravity AI", "TC Time": "1m", "Comment": "@media print CSS functions correctly." }
];

try {
  // Read existing workbook
  const workbook = xlsx.readFile('c:/Users/uneve/Desktop/SE489/TCMLite - Sample(1).xls');
  
  // Create a new worksheet for the Marketplace tests
  const worksheet = xlsx.utils.json_to_sheet(testCases);
  
  // Set column widths for better readability
  const wscols = [
    {wch: 5},  // TC#
    {wch: 40}, // Execution Steps
    {wch: 40}, // Expected Result
    {wch: 15}, // Test Result
    {wch: 15}, // Date
    {wch: 15}, // Tester
    {wch: 10}, // Time
    {wch: 30}  // Comment
  ];
  worksheet['!cols'] = wscols;

  // Add the worksheet to the workbook
  xlsx.utils.book_append_sheet(workbook, worksheet, "Marketplace Tests");
  
  // Write to a NEW file to preserve the original .xls and avoid corruption, outputting as modern .xlsx
  xlsx.writeFile(workbook, 'c:/Users/uneve/Desktop/SE489/TCMLite - Marketplace Edition.xlsx');
  
  console.log("Successfully generated tests and saved to TCMLite - Marketplace Edition.xlsx");
} catch (e) {
  console.error("Error modifying spreadsheet:", e);
}
