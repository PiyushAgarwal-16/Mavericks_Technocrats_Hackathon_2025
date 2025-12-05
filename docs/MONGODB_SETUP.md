# How to Setup Free MongoDB Atlas

ZeroTrace uses MongoDB. MongoDB Atlas offers a **completely free forever** tier (Shared Cluster) that is perfect for this project.

## Step 1: Create Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register).
2. Sign up (Google or Email). It is free.

## Step 2: create a Cluster
1. After login, you will be asked to "Deploy a database".
2. Select **M0 (FREE)** option in the Shared tier.
3. Choose a Provider (AWS is fine) and a Region close to you (e.g., Mumbai or N. Virginia).
4. Click **Create Deployment**.

## Step 3: Security Setup (Crucial)
1. **Database Access**:
   - Create a database user.
   - **Username**: `admin` (or your choice).
   - **Password**: Create a strong password and **COPY IT**. You will need it.
   - Click "Create Database User".
2. **Network Access**:
   - Click "Add IP Address".
   - Select **"Allow Access from Anywhere"** (`0.0.0.0/0`).
   - *Why?* This ensures your deployed Vercel app and your local desktop app can both connect without static IP issues.
   - Click "Confirm".

## Step 4: Get Connection String
1. Go back to **Database** (left menu).
2. Click **Connect** on your cluster.
3. Select **Drivers**.
4. Choose **Node.js**.
5. Copy the connection string. It looks like:
   `mongodb+srv://admin:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority`

## Step 5: Configure ZeroTrace
1. Open `e:\Mavericks_Technocrats_Hackathon_2025\backend\.env`.
2. Replace the `MONGO_URI` line:
   ```env
   MONGO_URI=mongodb+srv://admin:YOUR_PASSWORD_HERE@cluster0.abcde.mongodb.net/zerotrace?retryWrites=true&w=majority
   ```
   *(Replace `YOUR_PASSWORD_HERE` with the password you created in Step 3).*
3. **Save the file.**

## Step 6: Deploy Backend (Optional but Recommended)
To make your project truly "online" for the Vercel website:
1. You can deploy this backend code to a free service like **Render.com** or **Railway.app**.
2. They allow you to upload this code and set the environment variables (like `MONGO_URI`).
