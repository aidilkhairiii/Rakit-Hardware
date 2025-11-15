# 🔐 Fix AWS Permissions Issue

## ❌ Current Error:
```
User: arn:aws:iam::312513454262:user/rakitt is not authorized to perform: 
cloudformation:DescribeStacks
```

Your IAM user `rakitt` doesn't have sufficient permissions to deploy.

---

## ✅ Solution: Add Required Permissions

### **Option 1: Add Policies via AWS Console (Recommended)**

1. **Go to IAM Console:**
   - Visit: https://console.aws.amazon.com/iam/

2. **Find Your User:**
   - Click "Users" in the left sidebar
   - Click on your user: `rakitt`

3. **Add Permissions:**
   - Click "Add permissions" → "Attach policies directly"
   
4. **Attach These Policies:**
   - ✅ **AWSLambda_FullAccess** - For Lambda functions
   - ✅ **IAMFullAccess** - For creating Lambda execution roles
   - ✅ **AmazonAPIGatewayAdministrator** - For API Gateway
   - ✅ **CloudWatchLogsFullAccess** - For logging
   - ✅ **AWSCloudFormationFullAccess** - For stack management
   - ✅ **AmazonS3FullAccess** - For deployment artifacts

5. **Click "Add permissions"**

6. **Wait 1 minute** for permissions to propagate

7. **Try deploying again:**
   ```bash
   npm run deploy:dev
   ```

---

### **Option 2: Attach AdministratorAccess (Fastest, Less Secure)**

⚠️ **Warning:** This gives full access to your AWS account. Only use for development.

1. **Go to IAM Console:**
   - Visit: https://console.aws.amazon.com/iam/

2. **Find Your User:**
   - Click "Users" → `rakitt`

3. **Add Permissions:**
   - Click "Add permissions" → "Attach policies directly"
   - Search for: `AdministratorAccess`
   - ✅ Check the box
   - Click "Add permissions"

4. **Try deploying again:**
   ```bash
   npm run deploy:dev
   ```

---

### **Option 3: Create Custom Policy (Most Secure)**

1. **Go to IAM Console** → "Policies" → "Create policy"

2. **Switch to JSON tab** and paste this:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "cloudformation:*",
                "lambda:*",
                "apigateway:*",
                "iam:CreateRole",
                "iam:DeleteRole",
                "iam:PutRolePolicy",
                "iam:DeleteRolePolicy",
                "iam:GetRole",
                "iam:PassRole",
                "iam:AttachRolePolicy",
                "iam:DetachRolePolicy",
                "logs:*",
                "s3:CreateBucket",
                "s3:DeleteBucket",
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": "*"
        }
    ]
}
```

3. **Name it:** `ServerlessDeployPolicy`

4. **Attach to user:**
   - Go to "Users" → `rakitt`
   - "Add permissions" → "Attach policies directly"
   - Search for: `ServerlessDeployPolicy`
   - Click "Add permissions"

---

## 🧪 Verify Permissions

After adding permissions, test them:

```bash
# Check if you can list CloudFormation stacks
aws cloudformation describe-stacks

# If this works, you have the right permissions!
```

---

## 🚀 Deploy Again

Once permissions are added:

```bash
# Clean deployment
npm run deploy:dev

# You should see:
# ✔ Service deployed to stack rakit-hardware-api-dev (112s)
```

---

## 📊 What Serverless Needs

Serverless Framework needs these AWS services:

| Service | Why |
|---------|-----|
| **CloudFormation** | Creates/manages AWS resources |
| **Lambda** | Runs your functions |
| **API Gateway** | Creates API endpoints |
| **IAM** | Creates execution roles |
| **S3** | Stores deployment packages |
| **CloudWatch** | Stores logs |

---

## 🆘 Still Not Working?

### Check Current Permissions:
```bash
aws iam get-user
aws iam list-attached-user-policies --user-name rakitt
```

### Check AWS Credentials:
```bash
aws sts get-caller-identity

# Should show:
# "UserId": "...",
# "Account": "312513454262",
# "Arn": "arn:aws:iam::312513454262:user/rakitt"
```

### Re-configure AWS CLI:
```bash
aws configure

# Re-enter your credentials
```

---

## 🎯 Quick Fix Checklist

- [ ] Go to AWS IAM Console
- [ ] Find user `rakitt`
- [ ] Attach `AdministratorAccess` policy (or specific policies)
- [ ] Wait 1 minute
- [ ] Run `npm run deploy:dev`
- [ ] Check for success message

---

**Once permissions are fixed, deployment should work! 🎉**

Next issue will likely be MongoDB connection (if any), but we'll handle that when it comes up.
