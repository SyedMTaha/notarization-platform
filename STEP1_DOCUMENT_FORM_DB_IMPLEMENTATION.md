# Step 1 Document Form Data - Database Implementation

## Overview

This implementation adds database persistence for document-specific form data (like the Affidavit of Identity form fields) that gets saved during Step 1 of the form process and later retrieved during PDF generation for the video call page.

## Implementation Components

### 1. Database Schema (`documentForms` collection)

Each document form data entry is stored in Firebase with this structure:

```json
{
  "id": "{userId|sessionId}_{documentType}",
  "userId": "user123" | null,
  "sessionId": "sess_abc123",
  "documentType": "affidavit-of-identity",
  "formData": {
    "affiantName": "John Doe",
    "dateOfBirth": "1990-01-01",
    "currentAddress": "123 Main St, City, State",
    "phoneNumber": "555-123-4567",
    "driversLicense": true,
    "passport": false,
    "identityCard": false,
    "otherIdType": false,
    "otherIdDescription": "",
    "affirmDate": "2025-01-10",
    "affiantSignature": "John Doe",
    "signatureDate": "2025-01-10"
  },
  "status": "draft" | "submitted" | "completed",
  "createdAt": "2025-01-10T08:00:00Z",
  "updatedAt": "2025-01-10T08:30:00Z"
}
```

### 2. API Endpoints

#### `/api/document-forms/save`

- **POST**: Save document form data
  ```json
  {
    "userId": "user123", // optional
    "sessionId": "sess_abc123", // generated if anonymous
    "documentType": "affidavit-of-identity",
    "formData": { /* form field data */ }
  }
  ```

- **GET**: Retrieve document form data
  ```
  GET /api/document-forms/save?documentType=affidavit-of-identity&userId=user123
  GET /api/document-forms/save?documentType=affidavit-of-identity&sessionId=sess_abc123
  ```

### 3. Client-Side Components Updated

#### `AffidavitOfIdentityForm.jsx`
- **Auto-loading**: Loads saved data from database on component mount
- **Auto-saving**: Saves changes to database with 2-second debounce
- **Visual feedback**: Shows saving/saved/error status to user
- **Fallback**: Falls back to localStorage if database fails

#### `Form2step2.jsx`
- **Document selection loading**: Loads saved form data when document type is selected
- **Data persistence**: Saves to both localStorage and database for reliability

#### Updated PDF Generation Flow

### 4. PDF Generation Integration

#### `generatePDFFromFormData` (utils/pdfGenerator.js)
- Now passes `userId` and `sessionId` to the API
- Fetches user context automatically

#### `/api/generate-pdf` 
- **Enhanced**: Now fetches document-specific form data from database
- **Merge logic**: Combines passed form data with database data (database takes precedence)
- **Logging**: Enhanced logging for debugging PDF generation issues

### 5. Utility Functions

#### `utils/sessionUtils.js`
- Generates and manages session IDs for anonymous users
- Handles user ID management
- Provides user context for database operations

#### `utils/documentFormStorage.js`
- Database interaction functions
- Auto-save with debouncing
- Fallback to localStorage
- Error handling and recovery

## Complete Flow

### 1. Step 1 Form Filling
```
User selects "Affidavit of Identity"
  ↓
AffidavitOfIdentityForm loads existing data from DB
  ↓
User fills form fields
  ↓
Data auto-saves to database every 2 seconds
  ↓
Data also saved to localStorage for immediate access
```

### 2. PDF Generation in Video Call
```
Video call page loads
  ↓
Calls generatePDFFromFormData()
  ↓
pdfGenerator.js gets user context (userId/sessionId)
  ↓
Calls /api/generate-pdf with documentType + user context
  ↓
API fetches document form data from database using:
  documentFormId = "{userId|sessionId}_{documentType}"
  ↓
Merges database data with any passed form data
  ↓
Generates PDF using complete data set
  ↓
PDF displays in video call with all user's form data
```

## Testing the Implementation

### 1. Test Form Data Saving

1. Navigate to `/en/form-step1`
2. Select "Affidavit of Identity"
3. Fill out some form fields
4. Watch for "Auto-saving your data..." indicator
5. Refresh the page - data should persist

### 2. Test PDF Generation

1. Complete the affidavit form with all required fields
2. Complete steps 2-4 of the form process
3. Navigate to video call page
4. Check that PDF preview shows your form data

### 3. Test Database Storage

Check Firebase Console → Firestore → `documentForms` collection:
- Should see entries like `{sessionId}_affidavit-of-identity`
- `formData` should contain your form fields

### 4. Test Anonymous vs Authenticated Users

**Anonymous User:**
- Uses `sessionId` like `sess_12345_affidavit-of-identity`

**Authenticated User:**
- Uses `userId` like `user123_affidavit-of-identity`

## Debugging

### Console Logs to Watch For

1. **Form Loading:**
   ```
   Loading affidavit form data from database...
   Loaded affidavit data: [field names]
   ```

2. **Form Saving:**
   ```
   Saving document form data: {documentType: "affidavit-of-identity", userId: "anonymous"}
   Document form data saved successfully: sess_abc123_affidavit-of-identity
   ```

3. **PDF Generation:**
   ```
   Generating PDF with context: {documentType, userId, sessionId, hasFormData}
   Fetching document form data: {documentFormId, documentType, userId}
   Found document form data in database: [field names]
   ```

### Troubleshooting

1. **Data not saving**: Check Firebase connection and console for errors
2. **Data not loading**: Check browser localStorage and Firebase console
3. **PDF missing data**: Check API logs for database fetch errors
4. **Session ID issues**: Clear localStorage and try again

## Benefits

1. **Data Persistence**: Form data survives browser refresh/close
2. **Cross-device Access**: Authenticated users can access data from any device
3. **Complete PDFs**: PDFs contain all user-entered data, not just basic info
4. **Real-time Sync**: Auto-save ensures no data loss
5. **Fallback Reliability**: localStorage backup ensures functionality even if DB fails
6. **Scalable**: Easy to extend to other document types

## Next Steps

1. **Extend to Other Forms**: Apply same pattern to Power of Attorney, Will, etc.
2. **Add Validation**: Server-side validation of form data
3. **Add Encryption**: Encrypt sensitive form data at rest
4. **Add Audit Trail**: Track form data changes over time
5. **Add Export**: Allow users to export their form data
