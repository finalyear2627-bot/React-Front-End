# Program Management System

## Overview
Complete CRUD (Create, Read, Update, Delete) system for Program management with API integration.

## API Payload Structure

Program model with minimal fields:

```json
{
  "id": 1,
  "code": "BSSE",
  "name": "BS Software Engineering"
}
```

## Created Files

### API Service
- **`src/api/program.service.js`** - Program API service with all CRUD methods

### Components
1. **`src/components/ProgramListLayer.jsx`** - List all programs with table view
2. **`src/components/ProgramAddLayer.jsx`** - Form to add new program
3. **`src/components/ProgramEditLayer.jsx`** - Form to edit existing program
4. **`src/components/ProgramViewLayer.jsx`** - View program details

### Pages
1. **`src/pages/ProgramListPage.jsx`** - List page with MasterLayout
2. **`src/pages/ProgramAddPage.jsx`** - Add page with MasterLayout
3. **`src/pages/ProgramEditPage.jsx`** - Edit page with MasterLayout
4. **`src/pages/ProgramViewPage.jsx`** - View page with MasterLayout

### Updated Files
- **`src/App.js`** - Added routes for program pages
- **`src/masterLayout/MasterLayout.jsx`** - Updated sidebar with Program menu

## Routes

```javascript
/programs            - List all programs
/program-add         - Add new program
/program-edit/:id    - Edit program by ID
/program-view/:id    - View program details
```

## API Endpoints Used

```javascript
GET    /api/academics/programs/           - Get all programs
GET    /api/academics/programs/{id}/      - Get single program
POST   /api/academics/programs/           - Create program
PUT    /api/academics/programs/{id}/      - Update program
PATCH  /api/academics/programs/{id}/      - Partial update
DELETE /api/academics/programs/{id}/      - Delete program
```

## Form Fields

### Add/Edit Program Form
- **Program Code** (required) - e.g., BSSE
- **Program Name** (required) - e.g., BS Software Engineering

## Features

### List View
- Display all programs in a table (ID, Code, Name)
- View, Edit, Delete buttons for each program
- Add Program button
- No data message with Create button
- Error handling & loading state

### Add Program
- Form fields:
  - Program Code (required)
  - Program Name (required)
- Cancel button to go back
- Success redirect to list

### Edit Program
- Pre-filled form with existing data
- Same fields as Add form
- Cancel button
- Update on save

### View Program
- Read-only display of Code and Name
- Edit button to modify
- Back button to list

## Sidebar Navigation

Updated with:
- **Dashboard** - Main dashboard
- **Management** section:
  - **Programs** dropdown
    - List Programs
    - Add Program
- **Account** section:
  - **Auth** dropdown
    - Forgot Password
- **Profile Dropdown** with Logout

## Error Handling
- API errors displayed as alerts
- Loading states for data fetch
- Confirmation before delete
- Form validation

## Usage Example

### Navigate to Programs List
```javascript
navigate('/programs');
```

### Navigate to Add Program
```javascript
navigate('/program-add');
```

### Navigate to Edit Program
```javascript
navigate(`/program-edit/${programId}`);
```

### Navigate to View Program
```javascript
navigate(`/program-view/${programId}`);
```

## Next Steps

1. Test with your backend API
2. Verify payload structure matches
3. Add more fields if needed
4. Add search/filter functionality if needed
5. Add pagination for large datasets if needed
