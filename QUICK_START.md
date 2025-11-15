# 🚀 Quick Start Guide - AWS API Gateway Deployment

## ⚡ Fast Track Setup (15 minutes)

### **1️⃣ Install Tools**

```bash
# Install Serverless Framework
npm install -g serverless

# Install AWS CLI (macOS)
brew install awscli

# Verify
serverless --version
aws --version
```

### **2️⃣ Configure AWS**

```bash
aws configure
```

Enter your AWS credentials:
- **Access Key ID**: (from AWS IAM Console)
- **Secret Access Key**: (from AWS IAM Console)
- **Region**: us-east-1
- **Output**: json

### **3️⃣ Install Dependencies**

```bash
cd /Users/mac/Documents/AI\ Bootcamp/tuto-aidil/Rakit-Hardware
npm install
```

### **4️⃣ Deploy to AWS**

```bash
# Deploy to development
npm run deploy:dev

# Or production
npm run deploy:prod
```

### **5️⃣ Save Your API URL**

After deployment, you'll see:
```
endpoints:
  POST - https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev/api/data
  POST - https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev/api/spo2
  POST - https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev/api/temp
```

**COPY THIS URL!** You'll need it for Android.

### **6️⃣ Test Your API**

```bash
./test-api.sh https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev
```

---

## 📱 Update Android App

### **Step 1: Add Dependencies**

Add to your `app/build.gradle`:

```gradle
dependencies {
    implementation 'com.squareup.retrofit2:retrofit:2.9.0'
    implementation 'com.squareup.retrofit2:converter-gson:2.9.0'
    implementation 'com.squareup.okhttp3:logging-interceptor:4.11.0'
    implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3'
}
```

### **Step 2: Add Internet Permission**

Add to `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
```

### **Step 3: Update API URL**

Change from:
```kotlin
private const val BASE_URL = "http://192.168.1.100:3000/"
```

To:
```kotlin
private const val BASE_URL = "https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev/"
```

### **Step 4: Send Data**

```kotlin
// Blood Pressure
val bpData = VitalData(value = "Result: 120 / 80, BPM : 72")
apiService.sendBloodPressure(bpData)

// SpO2
val spo2Data = VitalData(value = "SpO2 : 98%, BPM : 75")
apiService.sendSpO2(spo2Data)

// Temperature
val tempData = VitalData(value = "37.5°C")
apiService.sendTemperature(tempData)
```

---

## 🔍 Monitoring & Debugging

### **View Logs**

```bash
# Real-time logs
npm run logs

# Or for specific function
serverless logs -f spo2Handler --tail
serverless logs -f tempHandler --tail
```

### **Check AWS Console**

1. Go to [AWS Lambda Console](https://console.aws.amazon.com/lambda/)
2. Click on your functions
3. Go to "Monitor" → "View logs in CloudWatch"

---

## 💰 Cost Estimate

**AWS Free Tier (First 12 months):**
- ✅ 1M Lambda requests/month - FREE
- ✅ 400K GB-seconds compute - FREE

**After Free Tier:**
- ~$5-10/month for 10,000 requests/day

---

## 🛠️ Useful Commands

```bash
# Deploy
npm run deploy:dev

# Remove deployment
serverless remove

# View deployment info
serverless info

# Test locally
npm run offline
```

---

## ❓ Troubleshooting

### **Problem: "Deployment failed"**
```bash
# Check AWS credentials
aws sts get-caller-identity

# Re-configure if needed
aws configure
```

### **Problem: "Cannot connect from Android"**
- ✅ Check API URL is correct
- ✅ Verify internet permission in manifest
- ✅ Test with curl first
- ✅ Check AWS CloudWatch logs

### **Problem: "MongoDB connection error"**
- ✅ Verify MONGO_URI in serverless.yml
- ✅ Check MongoDB Atlas allows 0.0.0.0/0
- ✅ Test connection locally first

---

## 📞 Need Help?

1. Check `AWS_DEPLOYMENT_GUIDE.md` for detailed instructions
2. Check `ANDROID_INTEGRATION.kt` for complete Android code
3. View CloudWatch logs for errors
4. Test endpoints with `test-api.sh`

---

## 🎯 Complete File Structure

Your project should look like this:

```
Rakit-Hardware/
├── lambda/
│   ├── bp-handler.js      ✅ Blood pressure handler
│   ├── spo2-handler.js    ✅ SpO2 handler
│   └── temp-handler.js    ✅ Temperature handler
├── serverless.yml         ✅ AWS configuration
├── package.json           ✅ Updated with scripts
├── test-api.sh           ✅ Test script
├── AWS_DEPLOYMENT_GUIDE.md
├── ANDROID_INTEGRATION.kt
└── server.js             (keep for local testing)
```

---

## ✅ Checklist

- [ ] AWS CLI installed and configured
- [ ] Serverless Framework installed
- [ ] Dependencies installed (`npm install`)
- [ ] Deployed to AWS (`npm run deploy:dev`)
- [ ] API URL saved
- [ ] Tested with `test-api.sh`
- [ ] Android dependencies added
- [ ] Android API URL updated
- [ ] Internet permission added to manifest
- [ ] Tested from Android device

---

**You're all set! 🎉**

Your API is now running on AWS and accessible from anywhere in the world!
