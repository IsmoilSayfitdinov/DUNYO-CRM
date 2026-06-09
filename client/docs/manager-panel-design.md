Act as a world-class Senior Product Designer and Senior UX/UI Designer for business SaaS platforms.

Design a complete, premium, production-ready Manager Panel UI for a CRM/HRM system called "DUNYO CRM".

IMPORTANT:
This is not an analytics-heavy executive dashboard like the Leader panel.
This must be an operational control panel for managers who work daily with employees, attendance, QR scanning, face verification, manual attendance input, task assignment, and leave review.

==================================================
1. PRODUCT CONTEXT
==================================================

Product name:
DUNYO CRM

System type:
Small business CRM / HRM / Employee Attendance / Payroll / Task / Leave system

Company size:
Around 10 employees

Roles:
- Leader
- Manager
- Employee

Manager responsibilities:
- Handle daily attendance operations
- Scan employee QR codes
- Verify employees visually or through face verification
- Add manual attendance when needed
- Review attendance issues
- Monitor today's employee status
- Assign or review tasks
- Review employee leave requests before Leader if needed
- Manage operational employee flow during the day

==================================================
2. DESIGN GOAL
==================================================

Create a premium manager interface that:
- Feels fast, practical, and operational
- Helps managers work quickly during busy real-life attendance flow
- Prioritizes scanning, employee identification, and status confirmation
- Makes daily management extremely easy
- Looks polished and premium, but not too overloaded
- Feels like a real internal business operations tool

==================================================
3. VISUAL STYLE DIRECTION
==================================================

Use a modern SaaS operations dashboard style:
- Clean
- Professional
- Fast
- Practical
- Minimal but polished
- Soft shadows
- Rounded cards
- Good spacing
- Clear buttons
- Clear state colors
- Strong readability
- Premium table and card design
- Elegant scan success/error feedback
- Smooth interactions

Preferred style:
- Light theme
- Soft neutral background
- Dark readable text
- Refined accent colors
- Strong success/warning/error states
- No playful consumer-style design
- Must feel internal-tool premium

==================================================
4. GLOBAL LAYOUT
==================================================

Desktop-first responsive layout.

Include:
- Left sidebar navigation
- Top header
- Main operational workspace
- Sticky action areas where useful

Topbar should include:
- Search
- Notifications
- Manager profile
- Current date
- Quick status summary

Sidebar navigation:
- Dashboard
- Attendance Scanner
- Today’s Employees
- Attendance Records
- Manual Attendance
- Pending Verification
- Tasks
- Leave Requests
- Employee Directory
- Notifications
- Settings

==================================================
5. UX PRIORITIES
==================================================

The Manager should be able to:
- Scan a QR code in seconds
- Immediately see employee identity
- Confirm attendance quickly
- Detect duplicate or suspicious scans
- Manually add attendance if scanning fails
- View today's employee attendance state
- See who is missing, late, or already checked in
- Handle daily operations with low friction

The UI should feel fast and practical, not slow or overcomplicated.

==================================================
6. PAGES TO DESIGN
==================================================

PAGE 1: MANAGER DASHBOARD
Include:
- Today summary cards:
  - Present today
  - Absent today
  - Late today
  - Pending verification
  - Manual entries today
  - Employees currently working
- Quick actions:
  - Open scanner
  - Add manual attendance
  - Review pending verification
  - View today list
- Recent attendance activity
- Employees needing manager attention
- Leave requests pending review
- Small task summary

PAGE 2: ATTENDANCE SCANNER PAGE
This is one of the most important pages.

Include:
- Large QR scan area
- Camera preview section
- Scan instructions
- Scan success state
- Scan error state
- Duplicate scan warning
- Employee identity preview after scan:
  - Photo
  - Full name
  - Role
  - Shift
  - Today’s status
- Buttons for:
  - Confirm check-in
  - Confirm check-out
  - Open manual entry
  - Mark as verification needed
- Visual feedback:
  - Green success state
  - Red error state
  - Warning badge if already checked in
- Recent scans side panel or bottom list

This page must feel like a real operational scanning terminal.

PAGE 3: TODAY’S EMPLOYEES PAGE
Include:
- List/grid/table of all employees for today
- Status chips:
  - Present
  - Absent
  - Late
  - Checked out
  - Pending verification
- Search and filters
- Quick employee cards
- Quick actions:
  - Check attendance history
  - Add manual attendance
  - Open employee mini profile
- Summary section for today

PAGE 4: ATTENDANCE RECORDS PAGE
Include:
- Table of today and recent attendance records
- Filters by date, employee, method, status
- Columns:
  - Employee
  - Check-in time
  - Check-out time
  - Method
  - Manager
  - Status
  - Notes
- Quick detail drawer for selected attendance row

PAGE 5: MANUAL ATTENDANCE PAGE
Include:
- Form for manual attendance entry
- Employee selector
- Attendance type selector
- Check-in/check-out input
- Reason input
- Manager note field
- Confirmation panel
- History of manual entries

This page must feel controlled and secure.

PAGE 6: PENDING VERIFICATION PAGE
Include:
- Suspicious or incomplete attendance items
- Low-confidence face verification items
- QR mismatches
- Duplicate attempt cases
- Approve / reject / mark reviewed actions
- Employee preview
- Manager note input
- Verification history

PAGE 7: TASKS PAGE
Include:
- Assigned tasks overview
- Employee task status
- Task cards or task table
- Task states:
  - New
  - In Progress
  - Done
  - Overdue
- Quick create task button
- Deadline indicators
- Priority badges
- Employee filter

PAGE 8: LEAVE REQUESTS PAGE
Include:
- Employee leave requests
- Pending / approved / rejected tabs
- Request table
- Employee name
- Leave type
- Date range
- Reason preview
- Status badge
- Review action buttons
- Detail panel

PAGE 9: EMPLOYEE DIRECTORY PAGE
Include:
- Employee cards or table
- Photo
- Name
- Role
- Shift
- Phone
- Current attendance state
- Quick actions to open profile, history, task list

PAGE 10: EMPLOYEE MINI PROFILE OR DETAIL PAGE
Include:
- Employee avatar and basic info
- Shift
- Contact info
- Today status
- This month attendance summary
- Recent attendance history
- Leave summary
- Task summary
- QR method usage / attendance method info

==================================================
7. REQUIRED COMPONENTS
==================================================

Use:
- Operational summary cards
- Scan card
- Employee identity cards
- Status badges
- Attendance tables
- Filter bars
- Search bar
- Activity feed
- Drawer/detail panels
- Action buttons
- Form sections
- Task cards
- Notification banners
- Loading states
- Empty states
- Error states

==================================================
8. STATUS SYSTEM
==================================================

Use elegant clear badges for:
- Present
- Absent
- Late
- Checked In
- Checked Out
- Pending Verification
- QR
- Face
- Manual
- Success
- Failed
- Duplicate
- Approved
- Rejected
- In Progress
- Overdue

==================================================
9. EMPTY / LOADING / ERROR STATES
==================================================

Design polished states for:
- No scans yet
- No employees today
- No pending verification
- No tasks
- No leave requests
- Camera unavailable
- Scan failed
- Network issue
- Retry states

==================================================
10. RESPONSIVENESS
==================================================

Design for desktop first, but keep tablet usable.

Important:
- Scanner page should still work well on tablet
- Employee tables should become cards if needed
- Sidebar can collapse on smaller screens

==================================================
11. DATA REALISM
==================================================

Use realistic data examples:
- Realistic employee names
- Realistic timestamps
- Realistic shifts
- Realistic attendance statuses
- Realistic manager activity

==================================================
12. DESIGN QUALITY BAR
==================================================

The result must:
- Feel premium
- Feel operational
- Feel fast
- Feel real
- Avoid generic admin dashboard style
- Avoid clutter
- Avoid decorative overload
- Be clearly optimized for manager workflows

==================================================
13. OUTPUT INSTRUCTIONS
==================================================

Generate a complete UI concept for all manager pages listed above.

For each page show:
- Layout
- Action hierarchy
- Cards
- Tables
- Scan areas
- Filters
- Detail views
- Feedback states

Final result should be a premium, production-ready Manager Panel UI for DUNYO CRM.