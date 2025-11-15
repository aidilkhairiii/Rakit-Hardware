# 🎯 Step-by-Step Visual Guide

## Part 1: AWS Setup (5 minutes)

### Step 1.1: Create AWS Account
```
1. Go to: https://aws.amazon.com/free/
2. Click "Create a Free Account"
3. Enter email, password
4. Add payment method (won't be charged in free tier)
5. Verify phone number
```

### Step 1.2: Create IAM User
```
1. Go to: https://console.aws.amazon.com/iam/
2. Click "Users" → "Add User"
3. Username: rakit-hardware-deploy
4. Access type: ✅ Programmatic access
5. Permissions: ✅ AdministratorAccess
6. Click "Create User"
7. ⚠️ SAVE these credentials:
   - Access Key ID: AKIAIOSFODNN7EXAMPLE
   - Secret Access Key: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

---

## Part 2: Local Setup (5 minutes)

### Step 2.1: Install Tools
```bash
# Terminal commands:

# 1. Install Serverless Framework
npm install -g serverless

# 2. Install AWS CLI
brew install awscli

# 3. Verify installations
serverless --version    # Should show v3.x.x
aws --version          # Should show aws-cli/2.x.x
```

### Step 2.2: Configure AWS CLI
```bash
# Run this command:
aws configure

# You'll be prompted to enter:
AWS Access Key ID [None]: PASTE_YOUR_ACCESS_KEY_ID
AWS Secret Access Key [None]: PASTE_YOUR_SECRET_ACCESS_KEY
Default region name [None]: us-east-1
Default output format [None]: json

# Test it works:
aws sts get-caller-identity
# Should show your account details
```

### Step 2.3: Install Dependencies
```bash
# Navigate to your project:
cd /Users/mac/Documents/AI\ Bootcamp/tuto-aidil/Rakit-Hardware

# Install dependencies:
npm install

# You should see:
# ✓ serverless@3.38.0
# ✓ serverless-offline@13.3.0
# ✓ mongoose@8.19.3
# ... and others
```

---

## Part 3: Deployment (5 minutes)

### Step 3.1: Deploy to AWS
```bash
# Deploy to development:
npm run deploy:dev

# Or manually:
serverless deploy --stage dev

# Wait 2-3 minutes for deployment...
# You'll see progress like:
# ⠋ Deploying rakit-hardware-api to stage dev (us-east-1)
# ✓ Service deployed to stack rakit-hardware-api-dev (112s)
```

### Step 3.2: Save Your API URL
```
After deployment, you'll see output like:

✔ Service deployed to stack rakit-hardware-api-dev (112s)

endpoints:
  POST - https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev/api/data
  POST - https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev/api/spo2
  POST - https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev/api/temp

functions:
  bpHandler: rakit-hardware-api-dev-bpHandler (2.1 MB)
  spo2Handler: rakit-hardware-api-dev-spo2Handler (2.1 MB)
  tempHandler: rakit-hardware-api-dev-tempHandler (2.1 MB)

⚠️ COPY THIS URL: 
https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev
```

### Step 3.3: Test Your Deployment
```bash
# Test with the script:
./test-api.sh https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev

# You should see:
# ✅ BP endpoint working!
# ✅ SpO2 endpoint working!
# ✅ Temperature endpoint working!
```

---

## Part 4: Android Integration

### Step 4.1: Update build.gradle
```gradle
// File: app/build.gradle

dependencies {
    // Add these new dependencies:
    implementation 'com.squareup.retrofit2:retrofit:2.9.0'
    implementation 'com.squareup.retrofit2:converter-gson:2.9.0'
    implementation 'com.squareup.okhttp3:logging-interceptor:4.11.0'
    implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3'
    
    // Your existing dependencies...
}
```

### Step 4.2: Update AndroidManifest.xml
```xml
<!-- File: app/src/main/AndroidManifest.xml -->

<manifest ...>
    
    <!-- Add this permission -->
    <uses-permission android:name="android.permission.INTERNET" />
    
    <application ...>
        <!-- Your activities -->
    </application>
</manifest>
```

### Step 4.3: Create ApiConfig.kt
```kotlin
// File: app/src/main/java/com/yourapp/api/ApiConfig.kt

package com.yourapp.api

import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object ApiConfig {
    
    // ⚠️ REPLACE THIS WITH YOUR AWS API URL!
    private const val BASE_URL = "https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev/"
    
    private val retrofit = Retrofit.Builder()
        .baseUrl(BASE_URL)
        .addConverterFactory(GsonConverterFactory.create())
        .build()
    
    val apiService: ApiService = retrofit.create(ApiService::class.java)
}
```

### Step 4.4: Create ApiService.kt
```kotlin
// File: app/src/main/java/com/yourapp/api/ApiService.kt

package com.yourapp.api

import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST

data class VitalData(val value: String)
data class ApiResponse(val success: Boolean, val message: String?)

interface ApiService {
    
    @POST("api/data")
    suspend fun sendBloodPressure(@Body data: VitalData): Response<ApiResponse>
    
    @POST("api/spo2")
    suspend fun sendSpO2(@Body data: VitalData): Response<ApiResponse>
    
    @POST("api/temp")
    suspend fun sendTemperature(@Body data: VitalData): Response<ApiResponse>
}
```

### Step 4.5: Use in Your Activity
```kotlin
// File: app/src/main/java/com/yourapp/MainActivity.kt

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class MainActivity : AppCompatActivity() {
    
    private val apiService = ApiConfig.apiService
    
    fun sendBloodPressure(systolic: Int, diastolic: Int, bpm: Int) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val data = VitalData("Result: $systolic / $diastolic, BPM : $bpm")
                val response = apiService.sendBloodPressure(data)
                
                withContext(Dispatchers.Main) {
                    if (response.isSuccessful) {
                        Toast.makeText(this@MainActivity, "✅ BP sent!", Toast.LENGTH_SHORT).show()
                    } else {
                        Toast.makeText(this@MainActivity, "❌ Failed!", Toast.LENGTH_SHORT).show()
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    Toast.makeText(this@MainActivity, "❌ Error: ${e.message}", Toast.LENGTH_LONG).show()
                }
            }
        }
    }
    
    // Example usage:
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        btnSend.setOnClickListener {
            sendBloodPressure(120, 80, 72)
        }
    }
}
```

---

## Part 5: Testing

### Test 1: From Terminal (Mac)
```bash
# Blood Pressure
curl -X POST https://YOUR-API-URL/dev/api/data \
  -H "Content-Type: application/json" \
  -d '{"value":"Result: 120 / 80, BPM : 72"}'

# Expected: {"success":true,"message":"BP data received"}

# SpO2
curl -X POST https://YOUR-API-URL/dev/api/spo2 \
  -H "Content-Type: application/json" \
  -d '{"value":"SpO2 : 98%, BPM : 75"}'

# Expected: {"success":true,"message":"SpO2 data received"}

# Temperature
curl -X POST https://YOUR-API-URL/dev/api/temp \
  -H "Content-Type: application/json" \
  -d '{"value":"37.5°C"}'

# Expected: {"success":true,"message":"Temperature data received"}
```

### Test 2: From Android Device
```
1. Build and run your Android app
2. Click "Send BP" button
3. Check Logcat for:
   ✅ BP sent successfully: Result: 120 / 80, BPM : 72
4. Check MongoDB to verify data was saved
```

### Test 3: Check AWS Logs
```bash
# View logs in real-time:
serverless logs -f bpHandler --tail

# You should see:
# 2024-11-15 10:30:45.123  INFO  🩺 Received BP: Result: 120 / 80, BPM : 72
# 2024-11-15 10:30:45.456  INFO  ✅ Updated BP & SpO₂ for session abc123
```

---

## Part 6: Monitoring

### Check AWS Console
```
1. Go to: https://console.aws.amazon.com/lambda/
2. You should see 3 functions:
   - rakit-hardware-api-dev-bpHandler
   - rakit-hardware-api-dev-spo2Handler
   - rakit-hardware-api-dev-tempHandler

3. Click on any function
4. Go to "Monitor" tab
5. You'll see:
   - Number of invocations
   - Error rate
   - Duration
   - Logs
```

### Set Up Billing Alerts
```
1. Go to: https://console.aws.amazon.com/billing/
2. Click "Billing preferences"
3. Enable "Receive Billing Alerts"
4. Go to CloudWatch
5. Create alarm for $5, $10, $20 thresholds
```

---

## 🎉 Success Checklist

- [ ] AWS account created
- [ ] IAM user created with credentials saved
- [ ] AWS CLI configured
- [ ] Serverless Framework installed
- [ ] Dependencies installed (`npm install`)
- [ ] Deployed to AWS (`npm run deploy:dev`)
- [ ] API URL saved
- [ ] Tested with curl commands
- [ ] Android dependencies added
- [ ] Android API URL updated
- [ ] Tested from Android device
- [ ] Verified data in MongoDB
- [ ] Billing alerts set up

---

## 🚨 Troubleshooting

### Problem: "Access Denied" during deployment
```
Solution:
1. Check IAM user has AdministratorAccess policy
2. Run: aws sts get-caller-identity
3. Verify correct credentials are configured
```

### Problem: "Cannot connect" from Android
```
Solution:
1. Check BASE_URL is correct (include /dev/ at end)
2. Verify INTERNET permission in manifest
3. Test with curl first to confirm API works
4. Check device has internet connection
```

### Problem: "MongoDB connection timeout"
```
Solution:
1. Go to MongoDB Atlas
2. Network Access → Add IP Address
3. Allow 0.0.0.0/0 (allow from anywhere)
4. Verify MONGO_URI in Lambda environment variables
```

### Problem: High AWS costs
```
Solution:
1. Check CloudWatch Metrics for unexpected traffic
2. Review API Gateway logs
3. Set up rate limiting
4. Reduce Lambda memory if too high
```

---

## 📞 Need Help?

1. **Check logs**: `serverless logs -f bpHandler --tail`
2. **Test API**: `./test-api.sh YOUR_API_URL`
3. **View metrics**: AWS Console → Lambda → Monitor
4. **Check costs**: AWS Console → Billing Dashboard

---

**You're all set! Your medical device API is now running on AWS! 🎉**

Next: Test with your Android devices and monitor CloudWatch logs.
