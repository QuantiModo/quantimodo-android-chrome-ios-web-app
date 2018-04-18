1. Choose a name for your app.  
1. Create your free account and app in the [Developer Portal](https://app.quantimo.do/builder) to get a 
`client id` and `client secret`.  You can use `http://localhost:8100` as the redirect if you don't know what to enter there. 
1. Replace `your_quantimodo_client_id_here` and `YourAppDisplayNameHere` with your app name within `www/default.config.json`. 
(This configuration file is where you can define the app menu, the primary outcome variable for the app, the intro tour, 
and many other features.  It is ignored in the git repository to avoid conflicts with other apps.  If you'd like to commit 
your work in the configuration to the repository, 
create an additional backup config file named like `www/default.config.json`.  
Copy changes made to the active configuration `www/default.config.json` 
to your config file `www/default.config.json` and commit `www/configs/your_quantimodo_client_id_here.js` to Github for a backup.)
1. Make a copy of `www/your_quantimodo_client_id_here.private_config.json` named `www/default.config.js`. Replace 
    `your_quantimodo_client_id_here` and `your_quantimodo_client_secret_here` with the credentials you got in the 
    [Developer Portal](https://app.quantimo.do/api/v2/apps).  `www/default.private_config.json` is ignored and should not be committed 
    to the repository for security reasons.
1. Copy `config-template.xml` to a new file named `config.xml` in the root of this repository.  Replace `your_quantimodo_client_id_here` and `YourAppDisplayNameHere`.

1. `ionic serve` doesn't provide us an `https` redirect URI in development which will prevent the standard OAuth 
authentication process from working.  As a workaround, in development, add your QuantiModo username and password to
`www/default.private_config.json`.  This will bypass the normal OAuth process.  Make sure to remove the username 
and password lines from `www/default.private_config.json` when building for production.
1. Great job!  :D  Now you can start configuring your app by changing settings in 
`www/your_quantimodo_client_id_here.js` and modifying the code as needed!
