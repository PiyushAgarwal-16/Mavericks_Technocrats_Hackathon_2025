# Certificate Upload Fix - Railway Configuration

## Problem Identified

The Flutter app was showing "offline" error even with internet connection because:

1. ✅ Internet connection: Working
2. ✅ Backend reachable: Working  
3. ✅ API authentication: Working
4. ❌ **Certificate signing: FAILED** - Private RSA key missing on Railway

The backend returned: `500 {"error":"Failed to sign certificate payload"}`

## Root Cause

The RSA keys (`private.pem` and `public.pem`) are gitignored for security, so they don't exist on Railway's deployed backend. The backend was trying to load the private key from the filesystem but couldn't find it.

## Solution Implemented

### Code Changes (Already Committed & Pushed)

Modified `backend/src/utils/signing.ts` to support loading RSA keys from environment variables:

- Now checks `CERT_PRIVATE_KEY` and `CERT_PUBLIC_KEY` environment variables first
- Falls back to filesystem for local development
- Handles escaped newlines (`\n`) in environment variable values

### Required Railway Configuration

**You must add these environment variables to Railway:**

1. Go to your Railway project: https://railway.app/project/[your-project-id]
2. Click on your backend service
3. Go to "Variables" tab
4. Add the following two variables:

#### CERT_PRIVATE_KEY
```
-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDB2M+loX3BGv9b
opiXok8i8A/LS2OWe3aUgZY/O5zCxiumcntp3bA2rtISvpd/ZUgQVq2C4mX0iiXx
5VIwZyXsoTQOdTvdagfz1HqM58JBRJ9igbPc5CmazBw/u2MzvkBXqHBhuTM17tza
sVKKm5KNaPcrFvq+5iIPrwlFafPEvWV2OVupbmEP9R2b5QDpQouDvEkd/LfSOfrz
WzOTCb24ZZpjP1gXqDqe18lXDuyUJYL5bMaVi7VZ5DOI1U+FJN4eqtN8pYLjYArS
gAd8t3/7X86+t4FOmGDpXfAuXfT+86x0pX7Rd9IZKOV6zHcYDrjR7CqZqa6r3sk7
3jGerEZtAgMBAAECggEAGFWCQ5WRNsOP2M4Bf8+FRaqDIQ8WslZPXXcjCE8Qb7b2
1c87RN/qdgLeJjI8zGZHdJ2c7HhFOjx5ZPNXrPHV5e2anlIDMNlVpDtBIx0Y2p6l
r3T+wjT2MBN9XFbGrkEszJQ9f1cDYbrZiK6H4RSEgjHyDTu2QG6dSgC8FjWlv0Wb
YA0LtLjwCguO3EYJBWKzVxSUUE2DQJKXYPLLC25QeF1MMalaPHb6/D4dhi/dYR5w
l0MwrFcjFF0MqFqqaAfg20KFQzVhxBN5mamMZETKPaK6FLAfPFSOWKH7H+hZtRUX
rkVjga9EWyXoqKvr7bfYPFuipGrJAe/0Skx00HFjNQKBgQDfR4kjJrHkN5lw+yP9
9KPSldyQNfW1u6R7e1PWzab537o1mazV9kqOQ5sej1bIp6pFZHCZf9khe76kiItz
qeVfexWwNSjVQcIfmwCU4ybu6Wbno3FsJ7E4RBo/eyS0Bbilmf1Gpk2kGuvHNYZO
j78clPpJmomQIitYSw+tsiBu2wKBgQDeQRi4KPmEAKrO1LEKEXlj9JELzkyJma9b
kviFD4bNOPvoQhpOa2L6831V6h9mc9ihwczpS5kkVCN5HP/espG1nlfaIajleOCM
7YcpurrWwlhBFYq6rjzNj2ECkpEr5NLylerZEpbeyYyg2c8OADZITx8HnHiaXH0y
cyH/tfXuVwKBgQCazcA5DNT9g8bw3E6h/oGuuZSIr8DB1W0+58zC+yavy/wQuZFp
by9V322nDH6A9C5Lmk2vP0LNwjv1W25ELSEIyA/Lca/z23m56//FOpB9yHk+VMWI
1SQ7/IuuQ7S409anilJeL2NZSgj6vxN1WJiKOogli+2gbvBacQBXz05JTQKBgA1C
iP0DxM8xUv+ABQf6vulNwBGaP0q+Vo36GMWnhX1c9vqGZxdipMcgG8wyaaktJDGS
ZG1Oy1Y1huBE8KcStErHpaon8/Gs4ojF6xh8QYVqluVbKam1l38UHM+QewTJZCSA
+T/2MfYcxD0cgZPuQ07RGaLUnQVomzeVUuP0sTWFAoGBALnrArvZsO0zgeot8QFj
vgKCIb+JIqkn1rUZ3SN6oQSXmJZH2X0nueFuQewAqU6mZ9iYngKMAWGASeHkt/9D
HylW0cX8uxqn3Pru0hAaFyVJD7B4pBhxt5gLy4sYOMaJQ0jPNLEJ0TtNI3B98eXu
sfU85NqmQ71C2qdTf7/XKBNk
-----END PRIVATE KEY-----
```

#### CERT_PUBLIC_KEY
```
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwdjPpaF9wRr/W6KYl6JP
IvAPy0tjlnt2lIGWPzucwsYrpnJ7ad2wNq7SEr6Xf2VIEFatguJl9Iol8eVSMGcl
7KE0DnU73WoH89R6jOfCQUSfYoGz3OQpmswcP7tjM75AV6hwYbkzNe7c2rFSipuS
jWj3Kxb6vuYiD68JRWnzxL1ldjlbqW5hD/Udm+UA6UKLg7xJHfy30jn681szkwm9
uGWaYz9YF6g6ntfJVw7slCWC+WzGlYu1WeQziNVPhSTeHqrTfKWC42AK0oAHfLd/
+1/OvreBTphg6V3wLl30/vOsdKV+0XfSGSjlesx3GA640ewqmamuq97JO94xnqxG
bQIDAQAB
-----END PUBLIC KEY-----
```

5. Click "Deploy" or wait for automatic redeploy (Railway should redeploy after you add variables)

## Testing

After adding the environment variables and Railway redeploys:

1. Run the Flutter app again
2. Try generating a certificate in demo mode
3. You should see in the console:
   - `✅ Upload successful!` instead of `❌ Upload failed: 500`
   - Certificate ID should be returned from server
   - Verification URL should be provided

## Additional Features Added

The diagnostic logging now shows:
- `🌐 CERTIFICATE UPLOAD STARTING` - Upload initiated
- `🔍 Running network diagnostics...` - Tests internet and backend connectivity
- `📤 Sending POST request...` - HTTP request sent
- `📬 Response received: [status]` - Server response status
- `📄 Response body: [json]` - Detailed error messages

## Security Note

⚠️ **These are DEVELOPMENT keys.** For production:

1. Generate new 4096-bit RSA keys:
```bash
openssl genrsa -out private.pem 4096
openssl rsa -in private.pem -pubout -out public.pem
```

2. Replace the environment variables in Railway with the new keys
3. Never commit private keys to git
4. Consider using Railway's secret management or a proper secrets vault

## Files Modified

- `backend/src/utils/signing.ts` - Added environment variable support
- `app/lib/services/certificate_generator.dart` - Added comprehensive logging
- `app/lib/services/network_test.dart` - New diagnostic utility
- `app/lib/screens/certificate_preview_screen.dart` - Better error display
- `app/lib/services/offline_certificate_queue.dart` - Queue improvements

All changes have been committed and pushed to GitHub.
