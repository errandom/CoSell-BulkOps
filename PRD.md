# Planning Guide

A state-of-the-art validation tool that analyzes Microsoft Co-Sell Bulk Operations Excel files, identifies compliance issues, and helps partners prepare error-free submissions for Partner Center.

**Experience Qualities**:
1. **Confident** - Users should feel assured that their files will be accepted by Partner Center, with clear, actionable feedback on every issue.
2. **Intelligent** - The tool detects patterns across records and offers automated fixes for systemic issues, saving time and reducing manual work.
3. **Professional** - A polished, enterprise-grade interface that reflects the technical sophistication of Microsoft Partner operations.

**Complexity Level**: Complex Application (advanced functionality, likely with multiple views)
This tool requires Excel parsing, complex validation logic across 50+ columns, pattern detection, dynamic filtering, inline editing, and export functionality with multiple states and views.

## Essential Features

### File Upload & Processing
- **Functionality**: Accepts Excel files (.xlsx) matching the Microsoft Partner Center bulk operations template, parses all columns, and validates each record against official requirements.
- **Purpose**: Enables partners to validate files before submission to Partner Center, preventing rejections and saving time.
- **Trigger**: User clicks upload area or drags file into the drop zone.
- **Progression**: Empty state with upload prompt → File selected → Processing animation with progress indicator → Dashboard view with results.
- **Success criteria**: File is parsed successfully, all rows are validated against 50+ field rules, and results display within 3 seconds for files up to 1,000 rows.

### Dashboard Overview Tiles
- **Functionality**: Four summary tiles showing Total Records, Errors, Warnings, and Passed counts with visual distinction and click-to-filter behavior.
- **Purpose**: Provides immediate insight into file health and enables quick filtering to problematic records.
- **Trigger**: Automatically displayed after file processing; clicking a tile filters the record list below.
- **Progression**: View all tiles → Click specific tile → Tile highlights → Record list updates to show only matching records → Click another tile or "All" to change filter.
- **Success criteria**: Tiles update counts accurately, visual feedback on active filter, record list filters instantly without lag.

### Pattern Detection & Bulk Fixes
- **Functionality**: Analyzes validation results to detect systemic issues (e.g., 15+ records with date formatting errors) and offers one-click bulk correction with preview.
- **Purpose**: Saves time by fixing repeated errors across multiple records simultaneously rather than manual editing.
- **Trigger**: Appears automatically between dashboard tiles and record list when patterns are detected.
- **Progression**: Pattern alert displays → User clicks "Fix All" button → Confirmation dialog shows specific changes → User confirms → Processing → Success message with change summary → Dashboard refreshes with updated counts.
- **Success criteria**: Patterns detected when 3+ records share identical error types, bulk fix changes only intended fields, user can review changes before applying.

### Record List with Inline Details
- **Functionality**: Scrollable list of records showing status icon, row number, Referral Title (Deal Name), Customer, Deal Value, Close Date, and expandable error/warning details.
- **Purpose**: Provides detailed view of each record's validation status with all relevant business context.
- **Trigger**: Displays automatically after processing; filters dynamically based on dashboard tile selection.
- **Progression**: List loads → User scrolls or filters → Clicks record to expand → Sees all errors (listed first) and warnings with edit options.
- **Success criteria**: List renders 1,000 rows smoothly, sorting/filtering is instant, errors always display before warnings.

### Inline Field Editing
- **Functionality**: Each error/warning has an "Edit" button that opens an inline editor with appropriate input type (dropdown for enums, date picker for dates, text input for free text).
- **Purpose**: Enables users to fix issues directly in the tool without switching to Excel.
- **Trigger**: User clicks "Edit" button next to a specific error or warning.
- **Progression**: Click Edit → Inline editor appears with current value → User modifies value → Validation runs in real-time → User saves or cancels → Record re-validates → Dashboard counts update.
- **Success criteria**: Edits persist, validation rules apply immediately, suggested values appear for enum fields, changes reflect in export.

### Export Validated Records
- **Functionality**: Generates downloadable Excel file containing only error-free records (Passed + Warnings), excluding any records with errors.
- **Purpose**: Provides a clean, submission-ready file for Partner Center upload.
- **Trigger**: User clicks "Export Validated Records" button.
- **Progression**: Click export → Modal appears showing count of included records vs excluded records → User confirms → File downloads → Success toast notification.
- **Success criteria**: Exported file matches original template structure, contains only error-free records, preserves all data formatting.

## Edge Case Handling

- **Empty file upload** - Display helpful message explaining file must contain at least one data row beyond headers.
- **Invalid file format** - Show clear error if file is not .xlsx or doesn't match expected template structure.
- **Exceeds 1,000 row limit** - Flag as critical error with guidance to split file, prevent processing beyond limit.
- **All records have errors** - Show encouragement message, highlight pattern fixes, disable export until at least one record passes.
- **Date format ambiguity** - Detect Excel date serial numbers vs text, warn when format doesn't match MM/DD/YYYY requirement.
- **Missing mandatory columns** - Flag file as invalid immediately with list of missing required template columns.
- **Conditional field violations** - Properly validate fields that are mandatory only in specific contexts (e.g., customer contact when "Microsoft help required" = Yes).

## Design Direction

The design should evoke feelings of precision, confidence, and enterprise professionalism. Users should feel they are working with a sophisticated validation engine that understands complex Partner Center requirements. The interface should feel data-dense but not overwhelming, with clear visual hierarchy guiding attention to critical issues first. The overall aesthetic should blend modern SaaS polish with Microsoft's professional ecosystem.

## Color Selection

A professional palette anchored in Microsoft's blue heritage but with distinctive warmth and energy to feel modern and approachable.

- **Primary Color**: Deep Azure Blue `oklch(0.45 0.15 250)` - Communicates trust, professionalism, and Microsoft ecosystem alignment
- **Secondary Colors**: 
  - Slate Gray `oklch(0.35 0.02 250)` for supporting UI elements and muted backgrounds
  - Soft Cloud `oklch(0.96 0.005 250)` for card backgrounds and subtle elevation
- **Accent Color**: Vibrant Amber `oklch(0.70 0.15 60)` for CTAs, success states, and focus elements
- **Foreground/Background Pairings**:
  - Primary (Deep Azure #2E5C9A): White text (#FFFFFF) - Ratio 7.2:1 ✓
  - Accent (Vibrant Amber #D4A747): Black text (#000000) - Ratio 10.1:1 ✓
  - Background (White #FFFFFF): Dark Slate text (#2D3748) - Ratio 12.4:1 ✓
  - Error (Crimson Red): White text - Ratio 5.8:1 ✓
  - Warning (Amber Orange): Black text - Ratio 8.2:1 ✓
  - Success (Forest Green): White text - Ratio 6.1:1 ✓

## Font Selection

Typefaces should convey technical precision while remaining highly legible for data-heavy interfaces with lots of numerical and tabular content.

- **Typographic Hierarchy**:
  - H1 (Page Title): IBM Plex Sans SemiBold/32px/tight letter spacing (-0.02em)
  - H2 (Section Headers): IBM Plex Sans Medium/24px/normal letter spacing
  - H3 (Card Titles): IBM Plex Sans Medium/18px/normal letter spacing
  - Body (Records, Details): IBM Plex Sans Regular/14px/relaxed line height (1.6)
  - Data Labels (Row numbers, Counts): IBM Plex Mono Regular/13px/monospace for alignment
  - Micro Text (Hints, Metadata): IBM Plex Sans Regular/12px/muted color

## Animations

Animations should reinforce state changes and guide user attention without creating unnecessary delays. Use subtle motion to indicate processing, validation success/failure, and list filtering transitions.

- File upload: Smooth fade-in of processing indicator with pulsing animation
- Dashboard tiles: Quick scale-up (1.02) on hover, subtle shadow elevation
- Filter transitions: 200ms fade when switching between filtered record views
- Inline edit: Expand/collapse with smooth height animation (300ms ease-out)
- Bulk fix confirmation: Modal slides up from bottom with backdrop fade
- Success/error states: Gentle shake for errors, subtle bounce for success
- Export: Progress indicator if file is large (500+ records)

## Component Selection

- **Components**:
  - `Card` for dashboard tiles, pattern alerts, and record containers
  - `Button` with variants (primary for CTAs, outline for secondary actions, ghost for inline edits)
  - `Dialog` for bulk fix confirmations and export previews
  - `Badge` for status indicators (error/warning/passed with color coding)
  - `Table` for record list with custom row rendering for expandable details
  - `Input`, `Select`, `Popover` for inline field editing
  - `Progress` for file upload and processing states
  - `Separator` to divide dashboard from patterns from record list
  - `ScrollArea` for record list with virtual scrolling for performance
  - `Tooltip` for explaining validation rules and field requirements
  - `Alert` for pattern detection boxes with action buttons
  
- **Customizations**:
  - Custom file upload zone with drag-and-drop states (idle, drag-over, uploading, success, error)
  - Custom expandable record row component with error/warning detail sections
  - Custom dashboard tile with click-to-filter and active state indication
  - Custom inline editor that switches input type based on field metadata

- **States**:
  - Buttons: Hover shows subtle background shift and shadow, active shows slight scale-down, disabled shows 40% opacity
  - Dashboard tiles: Default shows count and label, hover shows subtle lift, active/filtered shows accent border and darker background
  - Record rows: Default shows compact view, hover shows background tint, expanded shows full error list with dividers
  - Status badges: Error (red background), Warning (amber background), Passed (green background) with white text and icons

- **Icon Selection**:
  - `UploadSimple` for file upload area
  - `FileXls` for Excel file representation
  - `CheckCircle` for passed records
  - `WarningCircle` for warnings
  - `XCircle` for errors
  - `TrendUp` for pattern detection alerts
  - `PencilSimple` for edit actions
  - `DownloadSimple` for export button
  - `Funnel` for active filter indication
  - `MagnifyingGlass` for search/inspect actions

- **Spacing**:
  - Page container: `p-8` (32px padding)
  - Dashboard tiles grid: `gap-4` (16px between tiles)
  - Tile internal padding: `p-6` (24px)
  - Record list items: `gap-3` (12px between records), `p-4` internal padding
  - Pattern alert box: `my-6` (24px vertical margin), `p-5` internal
  - Button spacing: `gap-2` for icon+text combinations

- **Mobile**:
  - Dashboard tiles: Stack vertically on mobile (< 768px), 2-column grid on tablet (768-1024px), 4-column on desktop
  - Record list: Hide Deal Value and Close Date columns on mobile, show only status, row number, and title with tap-to-expand
  - Pattern alert: Stack action buttons vertically on mobile
  - Export modal: Full-screen on mobile for easier reading of excluded records count
  - Inline editing: Use native mobile inputs (date picker, select dropdown) for better UX
  - File upload: Larger touch target (min 48px height) on mobile, simplified drag-drop (tap to browse only)
