# Add Google Login for Android
- Go to the [QuantiModo Google Project Credentials Page](https://console.developers.google.com/apis/credentials?project=quantimo-do) 
- Click `Create credentials`
- Select `OAuth Client ID`
- Select Android
- The `Name` should be your `{{lowercase app name}} release {{platform name}}` (i.e. `medimodo release android`) 
- Paste the Android Production SHA-1 signing-certificate fingerprint `C9:66:37:DA:BF:F2:FE:6B:21:56:92:B0:A4:D1:F8:71:AF:FB:8A:C7`
- The package name should be com.quantimodo.{{your lowercase app name}} (i.e. `com.quantimodo.medimodo`)

# Add Google Login for iOS
- Go to the [QuantiModo Google Project Credentials Page](https://console.developers.google.com/apis/credentials?project=quantimo-do) 
- Click `Create credentials`
- Select `OAuth Client ID`
- Select iOS
- The `Name` should be your `{{lowercase app name}} release {{platform name}}` (i.e. `medimodo release ios`) 
- The bundle ID name should be com.quantimodo.{{your lowercase app name}} (i.e. `com.quantimodo.medimodo`)
