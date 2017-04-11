1. Choose a name for your app.  
1. Create your free account and app in the [Developer Portal](https://app.quantimo.do/api/v2/apps) to get a 
`client id` and `client secret`.  You can use `http://localhost:8100` as the redirect if you don't know what to enter there. 
1. Replace `yourlowercaseappnamehere` and `YourAppDisplayNameHere` with your app name within `www/configs/default.js`. 
(This configuration file is where you can define the app menu, the primary outcome variable for the app, the intro tour, 
and many other features.  It is ignored in the git repository to avoid conflicts with other apps.  If you'd like to commit 
your work in the configuration to the repository, 
create an additional backup config file named like `www/configs/yourlowercaseappnamehere.js`.  
Copy changes made to the active configuration `www/configs/default.js` 
to your config file `www/configs/yourlowercaseappnamehere.js` and commit `www/configs/yourlowercaseappnamehere.js` to Github for a backup.)
1. Make a copy of `www/private_configs/yourlowercaseappnamehere.config.js` named `www/private_configs/default.config.js`. Replace 
    `your_quantimodo_client_id_here` and `your_quantimodo_client_secret_here` with the credentials you got in the 
    [Developer Portal](https://app.quantimo.do/api/v2/apps).  `www/private_configs/default.config.js` is ignored and should not be committed 
    to the repository for security reasons.
1. Copy `config-template.xml` to a new file named `config.xml` in the root of this repository.  Replace `yourlowercaseappnamehere` and `YourAppDisplayNameHere`.

1. `ionic serve` doesn't provide us an `https` redirect URI in development which will prevent the standard OAuth 
authentication process from working.  As a workaround, in development, add your QuantiModo username and password to
`www/private_configs/default.config.js`.  This will bypass the normal OAuth process.  Make sure to remove the username 
and password lines from `www/private_configs/default.config.js` when building for production.
1. Great job!  :D  Now you can start configuring your app by changing settings in 
`www/configs/yourlowercaseappnamehere.js` and modifying the code as needed!
    