# OnSite Crash Champions - Comprehensive QA Test Plan

**Test URL:** https://onsite.jesseprojects.com
**Test Date:** 2026-01-16
**Version:** v2 with Security Fixes

---

## ✅ SECURITY FIXES VERIFICATION

### 1. Environment Validation
**Test:** Backend startup logs should show environment validation
**Expected:** `✓ Environment variables validated` in Docker logs
**Pass/Fail:** _____

### 2. CORS Restriction
**Test:** Try accessing API from unauthorized origin (use browser dev tools)
```javascript
// Run this in browser console from a different domain (e.g., google.com):
fetch('https://onsite.jesseprojects.com/api/debug').then(r => console.log(r))
```
**Expected:** CORS error: "Not allowed by CORS"
**Pass/Fail:** _____

### 3. Rate Limiting
**Test:** Submit same checklist 6+ times rapidly (within 15 minutes)
**URL:** `/checklist/CC-01005-ALAMEDA`
**Expected:** After 5th submission, receive "Too many submissions" error (429 status)
**Pass/Fail:** _____

### 4. Debug Endpoint Disabled
**Test:** Try accessing `/api/debug` while logged in
**Expected:** 404 Not Found response
**Pass/Fail:** _____

---

## 🎯 FUNCTIONAL TESTING

### A. Authentication & Authorization

#### Test 1: Login with Valid Credentials
- **URL:** `/login`
- **Credentials:**
  - Email: `jackie@onsite.com`
  - Password: `password123`
- **Expected:** Redirect to `/dashboard`, see welcome message with user name
- **Pass/Fail:** _____

#### Test 2: Login with Invalid Credentials
- **URL:** `/login`
- **Credentials:**
  - Email: `jackie@onsite.com`
  - Password: `wrongpassword`
- **Expected:** "Invalid credentials" error message
- **Pass/Fail:** _____

#### Test 3: Protected Route Access
- **Test:** Access `/dashboard` without logging in (use incognito/private window)
- **Expected:** Redirect to `/login` or show access denied
- **Pass/Fail:** _____

#### Test 4: Token Expiration
- **Test:** Login, wait 24+ hours, try to access dashboard
- **Expected:** Redirect to login (token expired)
- **Pass/Fail:** _____ (SKIP for quick QA)

---

### B. Dashboard Functionality

#### Test 5: Dashboard Loads Successfully
- **URL:** `/dashboard` (after login)
- **Expected:**
  - Welcome message with account manager name
  - 4 stat cards: Total Locations, Current, Stale, Overdue
  - Two tabs: "Locations" and "Submissions"
- **Pass/Fail:** _____

#### Test 6: Stats Calculation
- **Check:** Verify stat numbers make sense
  - Total Locations: Should be 6 (for demo data)
  - Current + Stale + Overdue should equal or be less than Total Locations
- **Pass/Fail:** _____

#### Test 7: Locations Tab
- **Test:** Click "Locations" tab
- **Expected:**
  - Table showing all locations
  - Columns: Location, Subcontractor, Status, Last Service, Days Since, Interval, Actions
  - Status badges color-coded (green=current, yellow=stale, red=overdue)
  - Copy URL button for each location
- **Pass/Fail:** _____

#### Test 8: Submissions Tab
- **Test:** Click "Submissions" tab
- **Expected:**
  - Table showing all submissions sorted by date (newest first)
  - Columns: Location, Subcontractor, Submitted Date, IVR Number, Photos
  - Click row to view submission details
- **Pass/Fail:** _____

#### Test 9: Account Manager Filter
- **Test:** Select different account manager from filter dropdown
- **Expected:**
  - Stats update to show only that manager's locations
  - Location/submission tables filter to that manager
- **Pass/Fail:** _____

#### Test 10: Status Filter
- **Test:** Select "Current", "Stale", or "Overdue" from status filter
- **Expected:** Only locations with that status show in table
- **Pass/Fail:** _____

#### Test 11: Search Filter
- **Test:** Type location name or ID in search box (e.g., "Alameda")
- **Expected:** Table filters to show only matching locations
- **Pass/Fail:** _____

#### Test 12: Copy Checklist URL
- **Test:** Click "Copy URL" button for a location
- **Expected:**
  - Alert: "Checklist URL copied to clipboard!"
  - Paste clipboard - should be `https://onsite.jesseprojects.com/checklist/CC-XXXXX-XXXXX`
- **Pass/Fail:** _____

#### Test 13: View Submission Details
- **Test:** Click a location with "Last Service" data OR click a row in Submissions tab
- **Expected:**
  - Modal opens showing:
    - Location name and address
    - Submission info (IVR, submitted by, date, subcontractor)
    - **Collapsible checklist sections** with status icons (✓ green / ✗ red / ? yellow)
    - Click section to expand/collapse tasks
    - Photos grid (if photos exist)
    - Notes (if notes exist)
- **Pass/Fail:** _____

#### Test 14: Collapsible Sections Logic
- **Test:** In submission details modal, verify section status icons:
  - **✓ (green):** All tasks "complete" AND no notes
  - **✗ (red):** Any task "incomplete" or "n/a"
  - **? (yellow):** Section has notes or mixed responses
- **Test on:** San Jose submission (should have data)
- **Pass/Fail:** _____

---

### C. Vendors Page

#### Test 15: Vendors Page Loads
- **URL:** `/vendors` (after login)
- **Expected:**
  - List of vendor cards
  - Each card shows: Vendor name, ID, email, phone
  - Two tabs per vendor: "Locations" and "Submissions"
- **Pass/Fail:** _____

#### Test 16: Vendor Locations Tab
- **Test:** Click "Locations" tab for a vendor (e.g., ACME Cleaning)
- **Expected:**
  - Table showing locations assigned to that vendor
  - Columns: Location ID, Name, City/State, Actions
  - "Copy URL" button for each location
- **Pass/Fail:** _____

#### Test 17: Vendor Submissions Tab
- **Test:** Click "Submissions" tab for a vendor
- **Expected:**
  - Table showing all submissions by that vendor (sorted newest first)
  - Columns: Location, Submitted Date, IVR Number, Photos
  - If vendor has no submissions: "No submissions yet" message
- **Pass/Fail:** _____

---

### D. IVRs Page

#### Test 18: IVRs Page Loads
- **URL:** `/ivrs` (after login)
- **Expected:**
  - Table showing all IVRs
  - Columns: Location, IVR Ticket Number, Period, Start Date, Expiration Date, Status, Actions
  - 18 total IVRs (6 expired Dec 2025, 6 current Jan 2026, 6 future Feb 2026)
- **Pass/Fail:** _____

#### Test 19: IVR Status Badges
- **Test:** Check status badge colors
- **Expected:**
  - **Green (Active):** Jan 2026 IVRs (start_date ≤ today ≤ expiration_date)
  - **Red (Expired):** Dec 2025 IVRs (today > expiration_date)
  - **Blue (Future):** Feb 2026 IVRs (today < start_date)
- **Pass/Fail:** _____

---

### E. Public Checklist Form (No Auth Required)

#### Test 20: Access Checklist via Evergreen Link
- **URL:** `/checklist/CC-01005-ALAMEDA` (open in incognito/private window - NO login)
- **Expected:**
  - Form loads without login
  - Read-only fields pre-filled:
    - Location name: "Crash Champions - Alameda"
    - IVR ticket number: starts with "SC-IVR-"
    - Internal WO: "WO-CC-001005"
  - Editable header fields: Cleaner First/Last Name, Company Name, Date, Start Time
  - Checklist sections expandable/collapsible
  - Photo upload area
  - Notes textareas per section
  - Two confirmation checkboxes (required)
  - Submit button
- **Pass/Fail:** _____

#### Test 21: Checklist Form Validation
- **Test:** Try submitting without filling required fields
- **Expected:** Browser validation prevents submission ("Please fill out this field")
- **Test:** Fill all fields except photos, click Submit
- **Expected:** Error: "Please upload at least 3 photos"
- **Pass/Fail:** _____

#### Test 22: Checklist Submission Success
- **Test:** Fill all required fields (use test data):
  - Cleaner Name: "John Doe"
  - Company: "Test Cleaners"
  - Date: Today's date
  - Start Time: Current time
  - Select radio button for each task (complete/incomplete/n/a)
  - Upload 3+ photos (use any image files)
  - Add notes to at least one section
  - Check both confirmation boxes
- **Click:** Submit
- **Expected:**
  - Success message: "Checklist submitted successfully!"
  - Form clears OR redirects to confirmation page
- **Pass/Fail:** _____

#### Test 23: View Submitted Checklist in Dashboard
- **Test:** After Test 22, log in to dashboard
- **Navigate:** Dashboard > Submissions tab OR click Alameda location
- **Expected:**
  - New submission appears in list
  - Submitted date = today
  - Click to view details - see all data from Test 22
  - Photos display correctly
  - Sections show correct status icons
- **Pass/Fail:** _____

#### Test 24: Rate Limiting on Submissions
- **Test:** Submit same checklist 6 times in a row (refresh page between submissions if needed)
- **Expected:** After 5th submission within 15 minutes, receive "Too many submissions" error
- **Pass/Fail:** _____

---

### F. Mobile Responsiveness

#### Test 25: Mobile Checklist Form
- **Test:** Open `/checklist/CC-01005-ALAMEDA` on mobile device or use browser dev tools (F12) to emulate mobile
- **Expected:**
  - Form is readable and usable on small screen (no horizontal scroll)
  - Photo upload works via camera OR file picker
  - All buttons are tap-friendly (not too small)
- **Pass/Fail:** _____

#### Test 26: Mobile Dashboard
- **Test:** Open `/dashboard` on mobile
- **Expected:**
  - Stats cards stack vertically
  - Table has horizontal scroll OR columns adapt for mobile
  - Filters stack vertically
  - Modal views work on small screen
- **Pass/Fail:** _____

---

### G. Photos & File Uploads

#### Test 27: Photo Upload via Drag & Drop
- **Test:** On checklist form, drag image files into upload area
- **Expected:**
  - Thumbnail previews appear
  - Photo count updates
  - Can remove photos before submitting
- **Pass/Fail:** _____

#### Test 28: Photo Upload via File Picker
- **Test:** Click "Choose Files" or upload button
- **Expected:**
  - File dialog opens
  - Can select multiple images
  - Thumbnails appear after selection
- **Pass/Fail:** _____

#### Test 29: Invalid File Type Upload
- **Test:** Try uploading a .txt or .exe file
- **Expected:** Error: "Only images and PDFs are allowed"
- **Pass/Fail:** _____

#### Test 30: File Size Limit
- **Test:** Try uploading a file >10MB (create or find large image)
- **Expected:** Error or file rejected (10MB limit)
- **Pass/Fail:** _____ (SKIP if no large file available)

#### Test 31: Photo Display in Submission Details
- **Test:** View a submission with photos in dashboard
- **Expected:**
  - Photos appear in grid
  - Images load correctly (not broken links)
  - Click photo to view full size (if implemented)
- **Pass/Fail:** _____

---

### H. Edge Cases & Error Handling

#### Test 32: Invalid Location ID
- **URL:** `/checklist/INVALID-ID-12345`
- **Expected:** Error page or message: "Location not found"
- **Pass/Fail:** _____

#### Test 33: Expired IVR Warning
- **Test:** Access checklist for location with expired IVR (e.g., `/checklist/CC-01001-FREMONT` if seeded with Dec 2025 IVR)
- **Expected:**
  - Form still loads
  - Warning message: "This IVR has expired" (if implemented)
  - OR submits with expired IVR (acceptable for POC)
- **Pass/Fail:** _____

#### Test 34: Network Error Handling
- **Test:** Disconnect internet mid-submission (turn off WiFi)
- **Expected:** Error message: "Network error" or "Failed to submit"
- **Pass/Fail:** _____ (SKIP for quick QA)

#### Test 35: Long Text in Notes
- **Test:** Enter 500+ characters in a notes field
- **Expected:**
  - Field accepts long text
  - Submission succeeds
  - Notes display fully in dashboard (not truncated)
- **Pass/Fail:** _____

---

## 📊 UI/UX Quality Checks

#### Test 36: Dark Mode Support
- **Test:** Check if dark mode toggle exists (in header or settings)
- **Expected:**
  - If toggle exists: Click it, entire app switches to dark theme
  - If no toggle: App uses system preference or defaults to light/dark
- **Pass/Fail:** _____ (May not be implemented yet)

#### Test 37: Loading States
- **Test:** Watch for loading indicators when:
  - Logging in
  - Loading dashboard
  - Submitting checklist
- **Expected:** Spinner or "Loading..." message appears (not blank screen)
- **Pass/Fail:** _____

#### Test 38: Error Messages Clarity
- **Review:** All error messages encountered during testing
- **Expected:** Errors are:
  - User-friendly (not technical jargon)
  - Specific (tell user what went wrong)
  - Actionable (suggest how to fix)
- **Pass/Fail:** _____

#### Test 39: Consistent Styling
- **Test:** Navigate through all pages
- **Expected:**
  - Buttons, cards, tables look consistent
  - Colors match design theme
  - No broken layouts or overlapping elements
- **Pass/Fail:** _____

#### Test 40: Browser Compatibility
- **Test:** Open app in different browsers:
  - Chrome
  - Firefox
  - Safari (if available)
  - Edge
- **Expected:** Works consistently across browsers
- **Pass/Fail:** _____ (Chrome: ___, Firefox: ___, Safari: ___, Edge: ___)

---

## 🐛 KNOWN ISSUES TO WATCH FOR

Check for these specific issues identified in code review:

1. **Demo Password Bypass:** Login with password "demo" works for any account (EXPECTED for POC - will fix post-demo)
2. **Submissions Without Auth:** Public endpoint can be accessed without login (EXPECTED - subcontractors use evergreen links)
3. **Debug Endpoint:** Should return 404 in production (Test #4 above)

---

## 📝 NOTES & OBSERVATIONS

Use this space to record any bugs, suggestions, or unexpected behavior:

**Bugs Found:**
- [ ] Bug 1: _________________________________________
- [ ] Bug 2: _________________________________________
- [ ] Bug 3: _________________________________________

**UI/UX Suggestions:**
- [ ] Suggestion 1: _________________________________________
- [ ] Suggestion 2: _________________________________________

**Performance Issues:**
- [ ] Issue 1: _________________________________________
- [ ] Issue 2: _________________________________________

---

## ✅ SUMMARY

**Total Tests:** 40
**Passed:** _____
**Failed:** _____
**Skipped:** _____

**Overall Assessment:**
- [ ] Ready for demo (minor issues acceptable)
- [ ] Needs fixes before demo (critical issues found)
- [ ] Excellent - no major issues

**Critical Blockers (if any):**
1. _________________________________________
2. _________________________________________

**Tester Signature:** _________________________________________
**Date Completed:** _________________________________________

---

## 🔄 NEXT STEPS

After completing this QA:
1. Report all "Failed" tests to development team
2. Prioritize critical bugs (anything that blocks core functionality)
3. Re-test after fixes are deployed
4. Sign off for demo when all critical issues resolved
