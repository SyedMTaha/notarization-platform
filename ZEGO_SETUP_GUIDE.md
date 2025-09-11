# ZegoCloud Setup Guide

## Getting New ZegoCloud Credentials

Since your trial has expired, you'll need to either:

1. **Create a new ZegoCloud account** (if you want another trial)
2. **Upgrade your existing account** to a paid plan
3. **Use a different account** if available

### Steps to Get New Credentials:

#### Option 1: Create New Account
1. Go to [ZegoCloud Console](https://console.zego.im/)
2. Sign up with a new email address
3. Create a new project
4. Get your App ID and Server Secret from the project dashboard

#### Option 2: Upgrade Existing Account
1. Log into your existing ZegoCloud account
2. Go to your project dashboard
3. Upgrade to a paid plan
4. Your existing credentials should work again

#### Option 3: Use Different Email/Account
1. Create account with different email
2. Follow Option 1 steps

### How to Update Credentials:

1. **Edit the `.env.local` file** in your project root:
   ```
   NEXT_PUBLIC_ZEGO_APP_ID=YOUR_NEW_APP_ID
   NEXT_PUBLIC_ZEGO_SERVER_SECRET=YOUR_NEW_SERVER_SECRET
   ```

2. **Replace the placeholder values:**
   - `YOUR_NEW_APP_ID` - Your actual numeric App ID (e.g., 1234567890)
   - `YOUR_NEW_SERVER_SECRET` - Your actual server secret (32-character string)

3. **Example of completed `.env.local`:**
   ```
   NEXT_PUBLIC_ZEGO_APP_ID=1234567890
   NEXT_PUBLIC_ZEGO_SERVER_SECRET=abcdef1234567890abcdef1234567890
   ```

### Important Notes:

- **Never commit** your `.env.local` file to version control
- **Keep your credentials secure** - don't share them publicly
- **Restart your development server** after updating credentials
- **Test the video call** functionality after updating

### Troubleshooting:

If you get authentication errors:
1. Double-check your App ID and Server Secret are correct
2. Make sure there are no extra spaces in your `.env.local` file
3. Restart your Next.js development server
4. Check the browser console for detailed error messages

### Testing Your Configuration:

1. Start your development server: `npm run dev`
2. Navigate to a video call page in your app
3. Check the browser console for any ZegoCloud errors
4. Try joining a video call to verify it works

### Support:

- [ZegoCloud Documentation](https://docs.zegocloud.com/)
- [ZegoCloud Console](https://console.zego.im/)
- Check the browser console for detailed error messages
