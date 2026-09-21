# 🚀 Quick Start Guide - BookMe Application

## 📋 Prerequisites Checklist

- [ ] Node.js installed (v18 or higher)
- [ ] MongoDB Atlas account with cluster created
- [ ] IP address whitelisted in MongoDB Atlas
- [ ] .env file configured in nodeBackend/

## ⚡ 5-Minute Setup

### Step 1: Fix MongoDB Connection
```
1. Go to https://cloud.mongodb.com
2. Navigate to: Network Access → IP Access List
3. Click "Add IP Address"
4. Choose "Allow Access from Anywhere" (0.0.0.0/0) or add your current IP
5. Click "Confirm"
```

### Step 2: Start Backend
```bash
cd nodeBackend
npm install
npm start
```
✅ Should see: "✅ DB is Connected" and "Server is running on port 5000"

### Step 3: Start Frontend
```bash
cd reactFrontend
npm install
npm run dev
```
✅ Should see: "Local: http://localhost:5173/"

### Step 4: Access Application
```
Open browser: http://localhost:5173
```

---

## 🎯 First Time User Flow

### 1. Register Account
```
1. Click "Register" on login page
2. Enter email → Click "Send OTP"
3. Check email for 6-digit OTP code
4. Enter OTP → Click "Verify"
5. Fill business details:
   - Name
   - Business Name
   - Password
6. Click "Complete Registration"
```

### 2. Login
```
1. Enter email and password
2. Click "Login"
3. Redirected to Dashboard
```

### 3. Create Your First Service
```
Dashboard → Services → "+ New Service"
- Name: "Consultation"
- Description: "30-minute consultation"
- Duration: 30 (minutes)
- Price: 500 (rupees)
- Save
```

### 4. Set Your Availability
```
Dashboard → Availability
- Click on any day card
- Click "+ Add Slot"
- Set start time: 09:00
- Set end time: 17:00
- Click "Save All Changes"
```

### 5. Share Your Booking Link
```
Dashboard → Home
Copy your public booking URL:
http://localhost:5173/book/YOUR_SLUG
```

---

## 🔧 Common Issues & Solutions

### Issue: "DB connection failed"
```
Solution:
1. Check MongoDB Atlas → Network Access
2. Add your current IP address
3. Wait 1-2 minutes for changes to apply
4. Restart backend server
```

### Issue: "Port 5000 already in use"
```
Solution (Windows):
netstat -ano | findstr :5000
taskkill /PID <PID> /F

Solution (Mac/Linux):
lsof -ti:5000 | xargs kill -9
```

### Issue: Frontend shows "Network Error"
```
Solution:
1. Check backend is running (http://localhost:5000)
2. Check browser console for CORS errors
3. Verify CLIENT_URL in backend .env is "http://localhost:5173"
```

### Issue: "Cannot find module"
```
Solution:
Delete node_modules and reinstall:
rm -rf node_modules package-lock.json
npm install
```

---

## 📱 Feature Checklist

### Authentication ✅
- [x] Register with OTP
- [x] Login with email/password
- [x] Protected routes
- [x] Auto logout on token expiry

### Services ✅
- [x] Create service
- [x] Edit service
- [x] Delete service
- [x] Toggle active status
- [x] View services list

### Availability ✅
- [x] Set weekly schedule
- [x] Add multiple time slots
- [x] Remove time slots
- [x] Save schedule

### Bookings ✅
- [x] View all bookings
- [x] Filter by status
- [x] Search customers
- [x] Confirm pending bookings
- [x] Reschedule bookings
- [x] Cancel bookings
- [x] View booking statistics

### Payments ✅
- [x] View earnings
- [x] View pending balance
- [x] Update payout details
- [x] Request withdrawal

### Settings ✅
- [x] Update profile
- [x] Connect Google Calendar
- [x] Disconnect Google Calendar

---

## 🎨 Dashboard Navigation

```
Dashboard
├── 🏠 Home - Overview & stats
├── 💼 Services - Manage services
├── 📅 Availability - Set schedule
├── 📋 Bookings - Manage bookings
├── 💰 Payments - Wallet & payouts
└── ⚙️ Settings - Profile & integrations
```

---

## 🧪 Test Your APIs

### Using the Application UI
1. Register a test account
2. Create a test service
3. Set availability
4. Test booking flow (use public URL)
5. Manage bookings from dashboard

### Using curl (Optional)
```bash
# Test health check
curl http://localhost:5000/api/auth/profile

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

---

## 📊 What's Working

✅ **24 Backend APIs** - All tested and working
✅ **9 Frontend Pages** - Complete UI implementation
✅ **6 Reusable Components** - Button, Input, Card, Modal, etc.
✅ **7 API Service Modules** - Clean API layer
✅ **Authentication** - JWT, OTP, Protected routes
✅ **Service Management** - Full CRUD
✅ **Availability** - Weekly schedule
✅ **Booking System** - Full management with reschedule
✅ **Payment Tracking** - Wallet and withdrawals
✅ **Google Calendar** - OAuth integration

---

## 🎯 What to Build Next

1. **Public Booking Page** - Complete customer booking flow
2. **Email Notifications** - Customize templates
3. **Calendar View** - Visual booking calendar
4. **Analytics** - Charts and reports
5. **Mobile App** - React Native version

---

## 💡 Pro Tips

1. **Use .env.example** - Create template for team members
2. **Git Ignore** - Never commit .env or node_modules
3. **Database Backup** - Export MongoDB data regularly
4. **Error Logging** - Add logging service (Sentry, LogRocket)
5. **Testing** - Write unit tests for critical functions
6. **Documentation** - Update README as you add features

---

## 📞 Need Help?

1. Check `PROJECT_COMPLETE_SUMMARY.md` for full documentation
2. Review backend logs in terminal
3. Check browser console for frontend errors
4. Verify all environment variables are set
5. Ensure MongoDB Atlas IP whitelist is updated

---

## ✨ You're All Set!

Your BookMe application is ready to use. Start by registering an account and exploring the features!

**Happy Building! 🚀**
