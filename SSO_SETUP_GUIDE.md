# 🔐 SSO Integration Setup Guide - No Broker Kathmandu

This guide will help you set up Single Sign-On (SSO) integration with Google, Facebook, and Microsoft for your No-Broker Kathmandu application.

## 🎯 **What's Implemented**

✅ **Backend SSO Integration**
- Google OAuth 2.0
- Facebook OAuth 2.0  
- Microsoft OAuth 2.0
- JWT token generation
- User account linking/unlinking
- SSO account management

✅ **Frontend SSO Integration**
- SSO login buttons
- OAuth callback handling
- User session management
- Provider-specific configurations

✅ **Database Schema**
- SSO accounts table
- User profile updates
- Account linking system

---

## 🚀 **Setup Instructions**

### **1. Google OAuth Setup**

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Create a new project or select existing one

2. **Enable Google+ API**
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it

3. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Application type: "Web application"
   - Authorized redirect URIs: `http://localhost:5000/api/auth/google/callback`

4. **Update Environment Variables**
   ```bash
   # In backend/.env
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
   ```

5. **Update Frontend Environment**
   ```bash
   # In frontend/.env
   REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
   ```

### **2. Facebook OAuth Setup**

1. **Go to Facebook Developers**
   - Visit: https://developers.facebook.com/
   - Create a new app

2. **Configure Facebook Login**
   - Add "Facebook Login" product
   - Go to "Facebook Login" > "Settings"
   - Valid OAuth Redirect URIs: `http://localhost:5000/api/auth/facebook/callback`

3. **Get App Credentials**
   - Go to "Settings" > "Basic"
   - Copy App ID and App Secret

4. **Update Environment Variables**
   ```bash
   # In backend/.env
   FACEBOOK_APP_ID=your-facebook-app-id
   FACEBOOK_APP_SECRET=your-facebook-app-secret
   FACEBOOK_CALLBACK_URL=http://localhost:5000/api/auth/facebook/callback
   ```

5. **Update Frontend Environment**
   ```bash
   # In frontend/.env
   REACT_APP_FACEBOOK_APP_ID=your-facebook-app-id
   ```

### **3. Microsoft OAuth Setup**

1. **Go to Azure Portal**
   - Visit: https://portal.azure.com/
   - Go to "Azure Active Directory" > "App registrations"

2. **Create New Registration**
   - Click "New registration"
   - Name: "No-Broker Kathmandu"
   - Supported account types: "Accounts in any organizational directory and personal Microsoft accounts"
   - Redirect URI: `http://localhost:3000/auth/callback`

3. **Configure API Permissions**
   - Go to "API permissions"
   - Add "Microsoft Graph" > "User.Read" permission

4. **Get Client Credentials**
   - Go to "Certificates & secrets"
   - Create new client secret
   - Copy Application (client) ID and secret

5. **Update Environment Variables**
   ```bash
   # In backend/.env
   MICROSOFT_CLIENT_ID=your-microsoft-client-id
   MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
   MICROSOFT_CALLBACK_URL=http://localhost:5000/api/auth/microsoft/callback
   ```

6. **Update Frontend Environment**
   ```bash
   # In frontend/.env
   REACT_APP_MICROSOFT_CLIENT_ID=your-microsoft-client-id
   REACT_APP_MICROSOFT_REDIRECT_URI=http://localhost:3000/auth/callback
   ```

---

## 🔧 **Environment Configuration**

### **Backend Environment (.env)**
```bash
# SSO Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
FACEBOOK_CALLBACK_URL=http://localhost:5000/api/auth/facebook/callback

MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
MICROSOFT_CALLBACK_URL=http://localhost:5000/api/auth/microsoft/callback

FRONTEND_URL=http://localhost:3000
SESSION_SECRET=your-session-secret-key
```

### **Frontend Environment (.env)**
```bash
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
REACT_APP_FACEBOOK_APP_ID=your-facebook-app-id
REACT_APP_MICROSOFT_CLIENT_ID=your-microsoft-client-id
REACT_APP_MICROSOFT_REDIRECT_URI=http://localhost:3000/auth/callback
```

---

## 🗄️ **Database Setup**

The SSO tables have been created automatically. If you need to recreate them:

```bash
# Run the SSO database migration
sudo -u postgres psql -d no_broker_kathmandu -f database/add_sso_tables.sql
```

### **SSO Tables Created:**
- `sso_accounts` - Stores linked SSO accounts
- Updated `users` table to support SSO users
- Triggers for automatic SSO provider tracking

---

## 🧪 **Testing SSO Integration**

### **1. Start the Application**
```bash
# Backend
cd backend && npm start

# Frontend  
cd frontend && npm start
```

### **2. Test SSO Login**
1. Go to `http://localhost:3000/login`
2. Click on any SSO provider button
3. Complete OAuth flow
4. Verify user is logged in and redirected to dashboard

### **3. Test Account Linking**
1. Login with regular credentials
2. Go to profile page
3. Link additional SSO accounts
4. Test switching between authentication methods

---

## 🔒 **Security Considerations**

### **Production Setup**
1. **Use HTTPS** - All OAuth callbacks must use HTTPS in production
2. **Update Redirect URIs** - Change localhost URLs to your production domain
3. **Secure Secrets** - Store OAuth secrets securely (environment variables, secret managers)
4. **Session Security** - Set `cookie.secure: true` in production

### **Environment Variables for Production**
```bash
# Update these for production
GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback
FACEBOOK_CALLBACK_URL=https://yourdomain.com/api/auth/facebook/callback
MICROSOFT_CALLBACK_URL=https://yourdomain.com/api/auth/microsoft/callback
FRONTEND_URL=https://yourdomain.com
```

---

## 🎯 **SSO Features Available**

### **User Features**
- ✅ Login with Google, Facebook, or Microsoft
- ✅ Link multiple SSO accounts to one user
- ✅ Unlink SSO accounts (with password fallback)
- ✅ Automatic profile picture sync
- ✅ Email verification for SSO users

### **Admin Features**
- ✅ View linked SSO accounts
- ✅ Manage user authentication methods
- ✅ SSO account analytics

### **Developer Features**
- ✅ Easy to add new SSO providers
- ✅ Comprehensive error handling
- ✅ Token management
- ✅ Session handling

---

## 🚨 **Troubleshooting**

### **Common Issues**

1. **"Invalid redirect URI"**
   - Check OAuth provider settings
   - Ensure redirect URI matches exactly

2. **"Client ID not found"**
   - Verify environment variables are set
   - Check client ID is correct

3. **"Access denied"**
   - Check OAuth app permissions
   - Verify app is not in development mode (Facebook)

4. **"Token verification failed"**
   - Check JWT secret is set
   - Verify token format

### **Debug Mode**
Enable debug logging by setting:
```bash
DEBUG=passport:*
```

---

## 📚 **API Endpoints**

### **SSO Authentication**
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/facebook` - Initiate Facebook OAuth  
- `GET /api/auth/microsoft` - Initiate Microsoft OAuth

### **Account Management**
- `GET /api/auth/linked-accounts` - Get linked SSO accounts
- `POST /api/auth/link-account` - Link new SSO account
- `DELETE /api/auth/unlink-account/:provider` - Unlink SSO account

### **User Info**
- `GET /api/auth/user-info` - Get current user info

---

## 🎉 **Success!**

Your No-Broker Kathmandu application now supports:
- **Google OAuth 2.0** ✅
- **Facebook OAuth 2.0** ✅  
- **Microsoft OAuth 2.0** ✅
- **Account linking/unlinking** ✅
- **Secure token management** ✅
- **Production-ready configuration** ✅

Users can now sign in with their preferred social accounts, making the registration and login process much smoother!

---

## 🔄 **Next Steps**

1. **Configure OAuth Apps** - Set up Google, Facebook, and Microsoft OAuth applications
2. **Update Environment Variables** - Add your OAuth credentials
3. **Test Integration** - Verify all SSO providers work correctly
4. **Deploy to Production** - Update URLs and enable HTTPS
5. **Monitor Usage** - Track SSO adoption and user behavior

**Happy coding! 🚀**

