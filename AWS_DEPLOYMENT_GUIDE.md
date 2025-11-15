# AWS Deployment Guide for Rakit Hardware API

## 📋 Prerequisites

Before you begin, make sure you have:

1. **AWS Account** - [Sign up here](https://aws.amazon.com/free/)
2. **Node.js 18+** - Already installed ✅
3. **AWS CLI** - Install using: `brew install awscli`
4. **Serverless Framework** - Install using: `npm install -g serverless`

---

## 🚀 Step-by-Step AWS Setup

### **Step 1: Install Required Tools**

```bash
# Install Serverless Framework globally
npm install -g serverless

# Install AWS CLI (if not already installed)
brew install awscli

# Verify installations
serverless --version
aws --version
```

### **Step 2: Configure AWS Credentials**

1. **Create IAM User in AWS Console:**
   - Go to [AWS IAM Console](https://console.aws.amazon.com/iam/)
   - Click "Users" → "Add User"
   - Username: `rakit-hardware-deploy`
   - Access type: ✅ Programmatic access
   - Permissions: Attach `AdministratorAccess` policy (for initial setup)
   - Click "Create User"
   - **SAVE** the Access Key ID and Secret Access Key

2. **Configure AWS CLI:**

```bash
aws configure

# Enter when prompted:
AWS Access Key ID: YOUR_ACCESS_KEY_ID
AWS Secret Access Key: YOUR_SECRET_ACCESS_KEY
Default region name: us-east-1  # or your preferred region
Default output format: json
```

### **Step 3: Install Project Dependencies**

```bash
cd /Users/mac/Documents/AI\ Bootcamp/tuto-aidil/Rakit-Hardware

# Install serverless plugins
npm install --save-dev serverless-offline

# The Lambda functions will use the existing mongoose dependency
```

### **Step 4: Set Environment Variables**

Create a `.env` file for local testing:

```bash
# This is already in your .env file, just verify it's correct
MONGO_URI=mongodb+srv://your-connection-string
```

For AWS Lambda, you'll set this through the AWS Console or Serverless config.

### **Step 5: Test Locally (Optional)**

```bash
# Start serverless offline (simulates API Gateway locally)
serverless offline

# Test endpoints:
curl -X POST http://localhost:3001/api/data \
  -H "Content-Type: application/json" \
  -d '{"value":"Result: 120 / 80, BPM : 72"}'
```

### **Step 6: Deploy to AWS**

```bash
# Deploy to development stage
serverless deploy --stage dev

# Or deploy to production
serverless deploy --stage prod
```

**Expected Output:**
```
✔ Service deployed to stack rakit-hardware-api-dev (112s)

endpoints:
  POST - https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev/api/data
  POST - https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev/api/spo2
  POST - https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev/api/temp

functions:
  bpHandler: rakit-hardware-api-dev-bpHandler (2.1 MB)
  spo2Handler: rakit-hardware-api-dev-spo2Handler (2.1 MB)
  tempHandler: rakit-hardware-api-dev-tempHandler (2.1 MB)
```

**SAVE THE API ENDPOINTS!** You'll need these for your Android app.

---

## 🔐 Set Environment Variables in AWS

### **Method 1: Through Serverless Framework (Recommended)**

Update `serverless.yml`:

```yaml
provider:
  environment:
    MONGO_URI: "mongodb+srv://your-actual-connection-string"
```

Then redeploy:
```bash
serverless deploy
```

### **Method 2: Through AWS Console**

1. Go to [AWS Lambda Console](https://console.aws.amazon.com/lambda/)
2. Click on each function (bpHandler, spo2Handler, tempHandler)
3. Go to "Configuration" → "Environment variables"
4. Add:
   - Key: `MONGO_URI`
   - Value: `mongodb+srv://your-connection-string`
5. Click "Save"

---

## 🧪 Test Your Deployment

```bash
# Get your API endpoint from deployment output
export API_URL="https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev"

# Test BP endpoint
curl -X POST $API_URL/api/data \
  -H "Content-Type: application/json" \
  -d '{"value":"Result: 120 / 80, BPM : 72"}'

# Test SpO2 endpoint
curl -X POST $API_URL/api/spo2 \
  -H "Content-Type: application/json" \
  -d '{"value":"SpO2 : 98%, BPM : 75"}'

# Test Temperature endpoint
curl -X POST $API_URL/api/temp \
  -H "Content-Type: application/json" \
  -d '{"value":"37.5°C"}'
```

Expected response:
```json
{"success":true,"message":"BP data received"}
```

---

## 📱 Update Android App

Replace localhost URLs with your AWS API Gateway endpoint:

```kotlin
// OLD (localhost)
const val BASE_URL = "http://192.168.1.100:3000"

// NEW (AWS API Gateway)
const val BASE_URL = "https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev"
```

---

## 🔍 Monitor Your API

### **View Logs:**
```bash
# View logs for BP handler
serverless logs -f bpHandler --tail

# View logs for SpO2 handler
serverless logs -f spo2Handler --tail

# View logs for Temperature handler
serverless logs -f tempHandler --tail
```

### **AWS Console:**
1. Go to [CloudWatch Logs](https://console.aws.amazon.com/cloudwatch/)
2. Look for log groups: `/aws/lambda/rakit-hardware-api-dev-*`

---

## 💰 Cost Monitoring

### **AWS Free Tier (First 12 months):**
- ✅ 1 Million Lambda requests/month (FREE)
- ✅ 400,000 GB-seconds compute time (FREE)
- ✅ 1GB Lambda storage (FREE)

### **After Free Tier:**
- Lambda: $0.20 per 1M requests
- API Gateway: $3.50 per 1M requests
- **Estimated cost for 10,000 requests/day: ~$5-10/month**

### **Monitor costs:**
1. Go to [AWS Billing Dashboard](https://console.aws.amazon.com/billing/)
2. Set up billing alerts for $5, $10, $20

---

## 🛠️ Useful Commands

```bash
# Deploy
serverless deploy --stage prod

# Deploy single function (faster)
serverless deploy function -f bpHandler

# Remove deployment (delete everything)
serverless remove

# View information
serverless info

# View logs
serverless logs -f bpHandler --tail

# Invoke function directly (testing)
serverless invoke -f bpHandler --data '{"body":"{\"value\":\"Result: 120/80\"}"}'
```

---

## 🐛 Troubleshooting

### **Problem: "Cannot find module 'mongoose'"**

**Solution:**
```bash
# Make sure mongoose is in dependencies (not devDependencies)
npm install mongoose --save
serverless deploy
```

### **Problem: "Connection timeout" from Android**

**Solution:**
1. Check CORS is enabled in `serverless.yml` ✅
2. Verify API Gateway URL is correct
3. Check Android has internet permission in manifest

### **Problem: "Cannot connect to MongoDB"**

**Solution:**
1. Verify `MONGO_URI` environment variable is set
2. Check MongoDB Atlas allows connections from `0.0.0.0/0`
3. Test connection locally first

### **Problem: High costs**

**Solution:**
1. Reduce Lambda memory size in `serverless.yml` (currently 512MB)
2. Optimize cold starts (use Lambda provisioned concurrency)
3. Set up CloudWatch alarms

---

## 🎯 Next Steps

1. ✅ Deploy to AWS using `serverless deploy`
2. 📝 Save your API Gateway URL
3. 📱 Update Android app with new URL
4. 🧪 Test from Android device
5. 📊 Monitor CloudWatch logs
6. 💰 Set up billing alerts

---

## 📞 Support

If you encounter issues:
1. Check CloudWatch Logs for errors
2. Test with `curl` commands first
3. Verify MongoDB connection
4. Check AWS IAM permissions

**Your API will be available at:**
```
https://YOUR-API-ID.execute-api.REGION.amazonaws.com/STAGE/api/data
https://YOUR-API-ID.execute-api.REGION.amazonaws.com/STAGE/api/spo2
https://YOUR-API-ID.execute-api.REGION.amazonaws.com/STAGE/api/temp
```

Good luck! 🚀
