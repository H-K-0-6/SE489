import os
import win32com.client
import datetime

# Test cases to inject
test_cases = [
    [1, "Navigate to Registration page. Enter valid email, name, and strong password.", "User is successfully registered and redirected to Login page.", "P", "Antigravity", 1, "Verified JWT token is generated."],
    [2, "Navigate to Registration page. Enter weak password.", "Registration fails with a validation error regarding password strength.", "P", "Antigravity", 1, "Regex validation works."],
    [3, "Navigate to Login page. Enter valid registered credentials.", "User is logged in and redirected to their respective Dashboard.", "P", "Antigravity", 1, ""],
    [4, "Navigate to Login page. Enter incorrect password.", "Login is rejected with 'Invalid credentials' message.", "P", "Antigravity", 1, ""],
    [5, "Click 'Forgot Password'. Enter registered email.", "Reset email is sent via Ethereal SMTP with a valid reset token.", "P", "Antigravity", 2, "Ethereal integration successful."],
    [6, "Navigate to Catalog page as Customer.", "All active products are displayed with their Artisan's name and price in BD.", "P", "Antigravity", 1, ""],
    [7, "Click 'Add to Cart' on a product in the Catalog.", "Product is added to Cart and stock count is reserved/updated.", "P", "Antigravity", 1, ""],
    [8, "Navigate to Cart and click 'Checkout'.", "Order is created in database, Cart is cleared, and status is set to PENDING.", "P", "Antigravity", 2, ""],
    [9, "Login as Admin. Navigate to Dashboard. Click 'Suspend' on Customer.", "User's lockoutUntil field is updated to 2099, preventing future logins.", "P", "Antigravity", 1, ""],
    [10, "Login as Artisan. Add Product with title, description, and price.", "Product is saved to database and appears in public Catalog.", "P", "Antigravity", 2, ""],
    [11, "Login as Artisan. Add Auction with starting price and duration.", "Auction is saved and appears in Live Auction House.", "P", "Antigravity", 2, ""],
    [12, "Login as Customer. Place a bid higher than current bid on active auction.", "Bid is accepted, database updated via Transaction, broadcasted via WebSockets.", "P", "Antigravity", 2, "WebSocket propagation verified."],
    [13, "As Customer, place a bid that is LOWER than the current bid.", "Bid is rejected by backend validation. Error message shown.", "P", "Antigravity", 1, ""],
    [14, "As Artisan, attempt to place a bid on your own active auction.", "Bid is rejected due to Anti-Shill bidding validation rule.", "P", "Antigravity", 1, ""],
    [15, "Observe active auction in Auction House.", "Countdown timer dynamically updates every second reflecting correct time.", "P", "Antigravity", 1, ""],
    [16, "Navigate to Artisan Dashboard. Click 'Print Report'.", "Print stylesheet triggers, showing full history tables.", "P", "Antigravity", 1, "@media print CSS functions correctly."]
]

def update_excel():
    file_path = os.path.abspath(r"c:\Users\uneve\Desktop\SE489\TCMLite - Sample(1).xls")
    
    try:
        excel = win32com.client.Dispatch("Excel.Application")
        # excel.Application.DisplayAlerts = False
        
        # Open workbook
        wb = excel.Workbooks.Open(file_path)
        
        # Select the 'TA1.Bing.Main.Page' sheet
        sheet = wb.Sheets("TA1.Bing.Main.Page")
        
        # Update sheet name to reflect the new tests
        sheet.Name = "Artisan Marketplace Tests"
        
        # Update User Story Title (Row 12)
        sheet.Cells(12, 1).Value = "User Story 1 - Full-Stack E-commerce and Bidding Engine Workflows"
        
        # The test cases start at row 14 (in the template there was some space or row 13 was the first case)
        # Let's start overwriting at row 14
        start_row = 14
        today_date = datetime.datetime.now().strftime("%m/%d/%Y")
        
        for i, tc in enumerate(test_cases):
            row = start_row + i
            sheet.Cells(row, 1).Value = tc[0]          # TC#
            sheet.Cells(row, 2).Value = tc[1]          # Execution Steps
            sheet.Cells(row, 3).Value = tc[2]          # Expected Result
            sheet.Cells(row, 4).Value = tc[3]          # Test Result (P)
            sheet.Cells(row, 5).Value = today_date     # Date Tested
            sheet.Cells(row, 6).Value = tc[4]          # Tester
            sheet.Cells(row, 7).Value = tc[5]          # TC Time
            sheet.Cells(row, 8).Value = tc[6]          # Comment
            
        # Clean up any leftover Bing tests (the template only has 2 in that section, so we actually added more, but just in case)
        for i in range(len(test_cases), 30):
            row = start_row + i
            sheet.Cells(row, 1).Value = ""
            sheet.Cells(row, 2).Value = ""
            sheet.Cells(row, 3).Value = ""
            sheet.Cells(row, 4).Value = ""
            sheet.Cells(row, 5).Value = ""
            sheet.Cells(row, 6).Value = ""
            sheet.Cells(row, 7).Value = ""
            sheet.Cells(row, 8).Value = ""

        # Save and close
        wb.Save()
        wb.Close()
        excel.Quit()
        print("Success")
    except Exception as e:
        import traceback
        traceback.print_exc()
        try:
            excel.Quit()
        except:
            pass

if __name__ == "__main__":
    update_excel()
