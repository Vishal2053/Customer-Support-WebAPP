# Widget One-Time Generation - Implementation Guide

## Overview
Users can now generate a chatbot widget **once per account**. Once generated and saved to the database, they will only see the script and cannot regenerate it.

## What Changed

### 1. Backend API Changes

#### Modified: `POST /api/v1/widget/generate`
- **Before:** Created a new widget every time (allowed duplicates)
- **After:** Checks if user already has a widget
  - If exists: Returns existing widget
  - If not exists: Creates new widget
- **Response includes:** `is_existing` flag to indicate if widget was newly created

#### New Endpoint: `GET /api/v1/widget/user/{user_id}`
- Fetches the user's existing widget (if any)
- Returns `{ widget: {...} }` or `{ widget: null }`
- Includes full widget details and embed code

### 2. Frontend Changes

#### Dashboard Widget Page
- **On Load:** Automatically fetches user's existing widget
- **If Widget Exists:**
  - Shows "Your Widget" with a green success badge
  - Displays embed code and widget URL
  - Shows info message: "Your widget has been created and saved"
  - **No regenerate button**
- **If No Widget:**
  - Shows "Generate Widget" button
  - Once clicked, widget is saved permanently

### 3. Database Changes

#### One-Widget-Per-User Constraint
Run this SQL in Supabase SQL Editor:
```sql
ALTER TABLE public.chatbot_widgets
ADD CONSTRAINT unique_user_widget UNIQUE (user_id);
```

## User Flow

1. User logs in and navigates to **🔧 Widget** tab
2. System automatically loads their existing widget
3. **If widget exists:**
   - User sees the script and widget URL
   - User can copy the embed code to their website
   - User cannot regenerate (button is hidden)
4. **If widget doesn't exist:**
   - User clicks "Generate Widget"
   - Widget is created and saved to database
   - Widget appears on the page with all details

## Implementation Details

### Backend Files Modified
- `backend/app/api/routes/widget.py`
  - Updated `generate_widget()` - Added duplicate check
  - Added `get_user_widget()` - New endpoint for fetching user's widget

### Frontend Files Modified
- `frontend/src/pages/Dashboard.jsx` - Updated widget tab logic
- `frontend/src/services/index.js` - Added `getUserWidget()` method

### Database Files
- `backend/supabase_widget_unique_constraint.sql` - SQL migration to enforce one-per-user

## Testing

### Test Case 1: Generate Widget (First Time)
1. Login as user
2. Go to Widget tab
3. Click "Generate Widget"
4. ✅ Widget should be created and displayed
5. ✅ Embed code and URL should be shown

### Test Case 2: View Existing Widget
1. Logout and login again (or reload page)
2. Go to Widget tab
3. ✅ Widget should load automatically
4. ✅ "Generate Widget" button should NOT be visible
5. ✅ Existing widget info should be displayed

### Test Case 3: One Widget Per User
1. Try to generate another widget via API directly
2. ✅ Should return existing widget instead of creating a new one

## Files to Commit to GitHub
- ✅ `backend/app/api/routes/widget.py` (modified)
- ✅ `frontend/src/pages/Dashboard.jsx` (modified)
- ✅ `frontend/src/services/index.js` (modified)
- ✅ `backend/supabase_widget_unique_constraint.sql` (new)

## Next Steps for Production
1. Run the SQL migration in Supabase to add the unique constraint
2. Test widget generation and retrieval
3. Verify the embed code works on a test website
4. Deploy to production
