# Firestore Security Rules Setup Guide

## Instructions to Deploy Security Rules

### Step 1: Install Firebase CLI (if not already installed)

```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase

```bash
firebase login
```

### Step 3: Initialize Firebase in your project (if not done)

```bash
firebase init firestore
```

### Step 4: Deploy the Security Rules

The `firestore.rules` file in your project root contains the security rules.

To deploy them to your Firebase project, run:

```bash
firebase deploy --only firestore:rules
```

---

## Alternative: Manual Setup via Firebase Console

If you prefer to set rules manually:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **tourtripmangement**
3. Navigate to **Firestore Database** → **Rules** tab
4. Replace the content with the rules from `firestore.rules`
5. Click **Publish**

---

## Security Rules Explanation

The current rules allow:

### User Registration & Profile

- **Create**: Users can create their own user document
- **Read**: Users can read their own data; admins can read all user data
- **Update/Delete**: Users can modify their own data; admins can modify any user data

### Tours

- **Read**: All authenticated users can view tour details
- **Create/Update/Delete**: Only admins can manage tours

### Tour Participants

- **Read**: All authenticated users can view participant lists
- **Create**: Users can register themselves as participants
- **Update/Delete**: Users can only modify their own registrations; admins can modify any

### Payments

- **Read**: Users can see their own payments; admins can see all payments
- **Create**: Users can create their own payment records; admins can create any
- **Update/Delete**: Users can modify their own payments; admins can modify any

### Documents

- **Read**: Users can view their own documents; admins can view all
- **Create**: Users can upload their own documents
- **Update/Delete**: Users can manage their own documents; admins can manage all

---

## Testing the Setup

After deploying the rules:

1. Create a new student account - should work ✓
2. Login and access student dashboard - should work ✓
3. Logout and create an admin account - should work ✓
4. Try accessing student data as admin - should work ✓
5. Try accessing admin data as student - should be denied ✓

---

## Troubleshooting

If you still get "Missing or insufficient permissions" errors:

1. **Clear browser cache** - Old auth tokens might be cached
2. **Wait a few seconds** - Firebase rules can take time to propagate
3. **Check browser console** - Look for the specific collection/document that failed
4. **Verify Firebase project ID** - Ensure it matches in `firebaseConfig.js`
5. **Check Firestore logs** - Visit Firebase Console → Firestore → Logs for detailed errors

---

## Security Best Practices

- Never share your Firebase config in production
- Use Firestore rules to validate data (not just client-side)
- Implement custom claims for role-based access if needed
- Regularly audit your Firestore security rules
