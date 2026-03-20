# Authorization & Candidate Portal - Complete Setup Guide

## 🎯 Feature Overview

This implementation adds a complete authorization and candidate portal workflow to the recruitment system:

1. **HR Authorizes Candidate** → Candidate receives email with credentials
2. **Candidate Logs In** → Access candidate portal with assessment rounds  
3. **Candidate Completes Rounds** → HR can then schedule interview

## 📋 Architecture

### Status Flow
```
Candidate Applies
     ↓
status: pending, authorizationStatus: pending
     ↓
HR clicks "Authorize for Test"
     ↓
Email sent + authorizationStatus: authorized
     ↓
Candidate logs in with email + generated password
     ↓
authorizationStatus: portal_accessed
     ↓
Candidate completes assessment rounds
     ↓
HR clicks "Schedule"
     ↓
status: selected → interview_completed
```

### Key Database Fields
- **`status`**: pending | selected | interview_completed | rejected (workflow stage)
- **`authorizationStatus`**: pending | authorized | portal_accessed (access control)
- **`password_hash`**: SHA256 hashed candidate password

## 🔧 Backend Setup

### 1. Environment Configuration (.env)

Add these variables to `backend/.env`:

```env
# SMTP Email Configuration (required for authorization emails)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_SENDER_EMAIL=your-email@gmail.com
SMTP_SENDER_PASSWORD=your-app-password  # NOT your Gmail password!
CANDIDATE_PORTAL_URL=http://localhost:5173  # Change for production

# Other settings (already configured)
DATABASE_URL=sqlite+aiosqlite:///./recruitment.db
FRONTEND_BASE_URL=http://localhost:5173
```

**⚠️ Important**: For Gmail, you MUST use an [App Password](https://support.google.com/accounts/answer/185833), not your regular password.

### 2. Database Migration

The migrations run automatically when the backend starts, but you can manually verify:

```sql
-- Check new columns exist
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS authorization_status VARCHAR(50) NOT NULL DEFAULT 'pending';
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
```

### 3. Start Backend

```bash
cd backend
python -m uvicorn app.main:create_app --factory --host 127.0.0.1 --port 8000 --reload --reload-dir . --reload-dir ..\ai
```

Watch for:
```
INFO:     Started server process
INFO:     Uvicorn running on http://127.0.0.1:8000
```

## 🎨 Frontend Setup

### 1. No Additional Dependencies

All components use existing libraries (React, Framer Motion, Lucide icons, Tailwind CSS).

### 2. Start Frontend

```bash
cd app
npm install  # if needed
npm run dev
```

Access at `http://localhost:5173`

## 📝 Testing the Complete Flow

### Step 1: Submit a Candidate Application

1. Go to Job Application Form
2. Select a job posting
3. Fill in all fields with test data
4. Submit application
5. Backend AI will score and evaluate
6. Candidate appears in HR Dashboard with status "Pending"

### Step 2: Review & Authorize

1. **HR Login**: Use credentials shown on login screen
   - Email: `hr@company.com`
   - Password: `hr123`

2. **Open HR Dashboard** → Click "View Candidates" or "Dashboard"

3. **Find the new candidate** in the Pending list

4. **Click on candidate card** to open detail modal

5. **Look for "Authorize for Test" button**
   - Shows when: `authorizationStatus === "pending"`
   - Hidden when: Already authorized

6. **Click "Authorize for Test"** button

7. **Confirm in Settings Modal**:
   - Review candidate details
   - Click "Send Authorization"
   - Watch for success toast: `"Authorization email sent to [email]..."`

8. **Modal shows generated credentials**:
   ```
   Email: candidate@example.com
   Password: [randomly generated, displayed once]
   ```
   - Copy and save the password or note it (sent via email anyway)

### Step 3: Candidate Receives Email

Check test candidate's email for:
- **Subject**: "Congratulations! You've Been Shortlisted - Portal Access Granted"
- **Content**:
  - Greeting with candidate name
  - Job title
  - Credentials box with email + generated password
  - Next steps
  - Portal access link

### Step 4: Candidate Login

1. **Go back to login screen** (click Logout from HR Dashboard)

2. **Switch to "Candidate Login" tab**
   - Shows email/password fields
   - Note about credentials being sent via email

3. **Enter credentials**:
   - Email: candidate@example.com (same as their application email)
   - Password: [the generated one]

4. **Click "Login to Portal"**

5. **Candidate Dashboard loads** with:
   - Assessment rounds available
   - Interview questions
   - Preflight checks (camera, microphone)
   - Report card (after completion)

### Step 5: Complete Assessment Rounds

1. **Complete Preflight Checks**:
   - Camera test (click to enable camera)
   - Microphone test (click to enable audio)
   - Environment check (light level, noise)

2. **Start Interview**:
   - Read warning about fullscreen requirement
   - Enter fullscreen (ESC to exit ends session)
   - Answer questions in each round
   - Confetti appears on completion

3. **View Report Card**:
   - Shows scores per round
   - Percentage breakdown
   - Total correct answers

### Step 6: HR Schedules Interview

1. **Log back in as HR** (`hr@company.com` / `hr123`)

2. **Find the candidate** in dashboard

3. **Notice "Schedule" button now shows** (not "Authorize for Test")

4. **Click "Schedule"**:
   - Enter Zoom meeting ID
   - Set interview time details
   - Candidate status changes to "Selected"

5. **View in "Scheduled" tab**:
   - Shows candidates with scheduled interviews
   - Zoom link available
   - Interview details

## 🔑 API Endpoints

### Authorization
```
POST /api/v1/candidates/authorize
Content-Type: application/json

Request:
{
  "candidateId": "cand-123"
}

Response:
{
  "success": true,
  "message": "Authorization email sent to candidate@email.com",
  "candidateId": "cand-123",
  "email": "candidate@email.com",
  "password": "Ab3$Xy9@Pq2"
}
```

### Candidate Login
```
POST /api/v1/auth/candidate/login?username={email}&password={password}

Response:
{
  "success": true,
  "candidateId": "cand-123",
  "candidateName": "John Doe",
  "email": "john@example.com",
  "jobRole": "Software Engineer"
}
```

### Candidate Verification
```
POST /api/v1/auth/candidate/verify?candidate_id=cand-123

Response:
{
  "authorized": true,
  "candidateId": "cand-123",
  "candidateName": "John Doe",
  "email": "john@example.com"
}
```

## 🐛 Troubleshooting

### Email Not Sending

**Issue**: "Failed to send authorization email"

**Solutions**:
1. Check SMTP credentials in `.env`
2. For Gmail: Use App Password (not regular password)
3. Verify sender email is correct
4. Check backend logs for detailed error:
   ```
   Error: SMTP authentication failed
   ```

**Test Email**:
```bash
# Use backend health check endpoint
GET /api/v1/candidates/health
```

### Candidate Can't Login

**Issue**: "Invalid credentials"

**Check**:
1. Email matches exactly (case-insensitive, but spaces matter)
2. Password sent via email was used (not the set password)
3. Candidate was authorized (authorizationStatus changed)
4. Check backend logs for auth errors

### Authorization Status Not Updating

**Issue**: Button shows "Authorize for Test" even after clicking

**Check**:
1. Browser refresh after clicking (forces data refetch)
2. Check backend database:
   ```sql
   SELECT id, candidate_name, authorization_status FROM candidates WHERE id='cand-123';
   ```
3. Check for SMTP errors in backend logs

### Wrong Password Generated

**Issue**: Password shown in modal doesn't match email

**Solution**:
1. Password is generated fresh each time you authorize
2. If you click authorize again, a NEW password is generated and sent
3. Email always has the latest password
4. Check email timestamps

## 📊 Database Queries for Testing

```sql
-- View candidate authorization status
SELECT id, candidate_name, email, authorization_status, status 
FROM candidates 
ORDER BY id DESC 
LIMIT 10;

-- Find unauthorized candidates
SELECT * FROM candidates 
WHERE authorization_status = 'pending' 
AND status = 'pending';

-- Find candidates ready for scheduling
SELECT * FROM candidates 
WHERE authorization_status = 'authorized' 
AND status = 'pending';

-- Reset a candidate's authorization (for testing)
UPDATE candidates 
SET authorization_status = 'pending', password_hash = NULL 
WHERE id = 'cand-XXX';
```

## 🚀 Production Deployment

### Frontend (Vercel)
1. Set `VITE_API_BASE_URL=https://your-backend-api.com/api/v1`
2. Set `CANDIDATE_PORTAL_URL=https://your-frontend.vercel.app`
3. Deploy to Vercel

### Backend (Render/Railway/etc)

1. **Environment Variables**:
   ```
   SMTP_SERVER=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SENDER_EMAIL=your-business-email@gmail.com
   SMTP_SENDER_PASSWORD=your-app-password
   CANDIDATE_PORTAL_URL=https://your-frontend.vercel.app
   DATABASE_URL=postgresql://user:pass@host/db
   CORS_ORIGIN_REGEX=https://your-frontend\.vercel\.app
   ```

2. **Build Command**: `pip install -r requirements.txt`

3. **Start Command**: 
   ```
   python -m uvicorn app.main:create_app --factory --host 0.0.0.0 --port 8000
   ```

## ✅ Verification Checklist

- [ ] Backend starts without errors
- [ ] Frontend loads login screen with HR/Candidate tabs
- [ ] HR can login with demo credentials
- [ ] HR Dashboard shows pending candidates
- [ ] "Authorize for Test" button appears for eligible candidates
- [ ] Authorization modal opens and shows candidate details
- [ ] Email is sent (check email account or backend logs)
- [ ] Email contains correct credentials
- [ ] Candidate can login with sent credentials
- [ ] Candidate portal shows assessment rounds
- [ ] Candidate can complete assessment
- [ ] Report card displays after completion
- [ ] HR can schedule interview
- [ ] Candidate status updates to "Selected"

## 📞 Support

For issues or questions:
1. Check backend logs: `docker logs container-name` or console output
2. Check SMTP configuration in `.env`
3. Verify candidate exists in database
4. Check browser console for frontend errors (F12)
5. Review email provider's SMTP requirements

---

**Last Updated**: March 20, 2026
**Version**: 1.0.0 - Initial Release
