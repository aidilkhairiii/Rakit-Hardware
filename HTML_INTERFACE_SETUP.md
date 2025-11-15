# 🌐 HTML Interface Setup Guide

## Understanding Your Architecture

You have **TWO interfaces** that can send data:

1. **HTML Interface** (Tutorial with videos) - `public/index.html`
2. **Android App** (Mobile devices with sensors)

Both save to the **same MongoDB database**.

---

## 🎯 Recommended Setup (Best of Both Worlds)

### **Android Devices** → AWS Lambda (Production)
```
Android Device
    ↓ POST https://ttga54u0zj.execute-api.us-east-1.amazonaws.com/dev/api/data
AWS Lambda
    ↓
MongoDB Atlas
```

### **HTML Interface** → Local Server (Development)
```
Browser (HTML Interface)
    ↓ POST http://localhost:2000/api/data
server.js (Your Mac)
    ↓
MongoDB Atlas
```

---

## 🚀 How to Use Both

### **Step 1: Start Local Server for HTML Interface**

```bash
# In Terminal 1
cd /Users/mac/Documents/AI\ Bootcamp/tuto-aidil/Rakit-Hardware
node server.js
```

You should see:
```
✅ Server running on http://localhost:2000
✅ MongoDB connected
```

### **Step 2: Open HTML Interface**

Open in browser:
```
http://localhost:2000
```

Or just open the file directly:
```
open public/index.html
```

### **Step 3: Android Uses AWS**

Your Android app uses:
```kotlin
private const val BASE_URL = "https://ttga54u0zj.execute-api.us-east-1.amazonaws.com/dev/"
```

---

## 📊 Data Flow Diagram

```
┌─────────────────────┐
│  HTML Interface     │
│  (localhost:2000)   │
└──────────┬──────────┘
           │ 
           ↓
    ┌──────────────┐
    │  server.js   │
    │  (Your Mac)  │
    └──────┬───────┘
           │
           ↓
    ┌──────────────┐
    │  MongoDB     │
    │   Atlas      │
    └──────┬───────┘
           ↑
    ┌──────┴───────┐
    │ AWS Lambda   │
    └──────┬───────┘
           │
           ↑
┌──────────┴──────────┐
│   Android Devices   │
│  (Production)       │
└─────────────────────┘
```

**Both interfaces save to the SAME MongoDB!**

---

## 🔧 Configuration Settings

### **Current HTML Configuration (index.html)**

```javascript
// Line ~220 in public/index.html
const USE_AWS = false; // ← HTML uses local server

// When USE_AWS = false:
// - Buttons send data to localhost (server.js)
// - Real-time polling works (/api/latest)
// - Videos show data updates

// When USE_AWS = true:
// - Buttons send data to AWS Lambda
// - No real-time polling (Lambda doesn't have /api/latest)
// - Good for testing AWS connectivity
```

### **Android Configuration**

```kotlin
// In your Android app
private const val BASE_URL = "https://ttga54u0zj.execute-api.us-east-1.amazonaws.com/dev/"

// Android ALWAYS uses AWS in production
```

---

## 🎬 Complete Workflow

### **Scenario 1: Testing with HTML Interface**

1. **Start server:**
   ```bash
   node server.js
   ```

2. **Open browser:**
   ```
   http://localhost:2000
   ```

3. **Click "Send Test Data" buttons:**
   - Data goes to server.js
   - server.js saves to MongoDB
   - Real-time updates work
   - Videos transition automatically

### **Scenario 2: Testing with Android**

1. **Android app runs anywhere** (different WiFi, 4G, etc.)

2. **Android sends data:**
   ```
   POST https://ttga54u0zj.execute-api.us-east-1.amazonaws.com/dev/api/data
   ```

3. **AWS Lambda processes:**
   - Parses data
   - Saves to MongoDB
   - Returns success

4. **Data is in MongoDB** (same database as HTML interface!)

### **Scenario 3: Both Running Simultaneously**

```bash
# Terminal 1: Local server for HTML
node server.js

# Browser: HTML interface
http://localhost:2000

# Android: Uses AWS Lambda
# Both save to same MongoDB!
```

**✅ This works perfectly!** Both interfaces save to the same database.

---

## 🔄 Switching Between Local and AWS for HTML

### **Use Local (Default - Recommended):**

```javascript
// public/index.html
const USE_AWS = false;
```

**Pros:**
- ✅ Real-time updates work
- ✅ Polling works (/api/latest)
- ✅ Videos transition automatically
- ✅ Full tutorial experience

**Cons:**
- ❌ Requires server.js running
- ❌ Only works on your Mac

### **Use AWS (For Testing):**

```javascript
// public/index.html
const USE_AWS = true;
```

**Pros:**
- ✅ No server.js needed
- ✅ Tests AWS connectivity
- ✅ Can deploy HTML to any server

**Cons:**
- ❌ No real-time updates
- ❌ No polling
- ❌ Videos don't auto-transition
- ❌ Only buttons work

---

## 💡 Best Practice Recommendation

### **Development Phase (Now):**

1. **HTML Interface:** Use `server.js` locally
   ```bash
   node server.js
   # Open http://localhost:2000
   ```

2. **Android App:** Use AWS Lambda
   ```kotlin
   BASE_URL = "https://ttga54u0zj.execute-api.us-east-1.amazonaws.com/dev/"
   ```

### **Production Phase (Later):**

**Option A: Keep Local Server for HTML**
- Deploy HTML interface to a web server (Vercel, Netlify)
- Point it to a cloud-hosted Express server (not your Mac)
- Android continues using AWS Lambda

**Option B: Fully Serverless (Advanced)**
- Create `/api/latest` endpoint in AWS Lambda
- Use WebSockets or Server-Sent Events for real-time updates
- Both HTML and Android use AWS

---

## 🚀 Quick Start Commands

### **Run HTML Interface Locally:**

```bash
# Start server
node server.js

# Open browser to:
http://localhost:2000

# Or open file directly:
open public/index.html
```

### **Test AWS from HTML (Optional):**

```javascript
// Change in public/index.html:
const USE_AWS = true;

// Then just open public/index.html
// No server.js needed!
```

### **View Both Logs:**

```bash
# Terminal 1: Local server logs
node server.js

# Terminal 2: AWS Lambda logs
serverless logs -f bpHandler --tail
```

---

## 📊 Summary Table

| Feature | HTML (Local) | HTML (AWS) | Android (AWS) |
|---------|-------------|------------|---------------|
| **Requires server.js** | ✅ Yes | ❌ No | ❌ No |
| **Real-time updates** | ✅ Yes | ❌ No | N/A |
| **Video transitions** | ✅ Auto | ❌ Manual | N/A |
| **Works offline** | ✅ Same WiFi | ❌ Internet | ❌ Internet |
| **Production ready** | ⚠️ Need hosting | ✅ Yes | ✅ Yes |
| **Polling works** | ✅ Yes | ❌ No | N/A |
| **Cost** | Free | ~$0/month | ~$0-5/month |

---

## 🎯 Your Current Setup (Recommended)

```javascript
// ✅ HTML Interface: Local mode
const USE_AWS = false; // in index.html
```

```kotlin
// ✅ Android: AWS mode
const val BASE_URL = "https://ttga54u0zj.execute-api.us-east-1.amazonaws.com/dev/"
```

```bash
# ✅ Run this for HTML interface:
node server.js

# ✅ Open browser:
http://localhost:2000
```

**This gives you:**
- ✅ Full HTML tutorial experience (videos, real-time updates)
- ✅ Android works from anywhere
- ✅ Both save to same MongoDB
- ✅ Easy debugging

---

## 🆘 Troubleshooting

### **Problem: HTML interface doesn't update**

**Solution:**
```javascript
// Make sure USE_AWS = false in index.html
const USE_AWS = false;

// And server.js is running:
node server.js
```

### **Problem: "Cannot connect" in browser**

**Solution:**
```bash
# Check if server is running:
curl http://localhost:2000/api/latest

# If not, start it:
node server.js
```

### **Problem: Android can't connect**

**Solution:**
```kotlin
// Make sure Android uses AWS URL:
private const val BASE_URL = "https://ttga54u0zj.execute-api.us-east-1.amazonaws.com/dev/"

// NOT localhost!
```

---

**You're all set! Your HTML interface works with local server, and Android works with AWS!** 🎉
