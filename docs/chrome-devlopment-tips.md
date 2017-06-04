## Chrome Development Tips
1. Install [Chrome Apps & Extensions Developer Tool](https://Chrome.google.com/webstore/detail/Chrome-apps-extensions-de/ohmmkhmmmpcnpikjeljgnaoabkaalbgc?utm_source=Chrome-ntp-icon)
1. You can load the whole repo as an unpacked extension
1. [Add the www folder to your workspace](https://developer.Chrome.com/devtools/docs/workspaces)
1. To be able to edit and save files within the Chrome dev console, map the browser's index.html file to the workspace www/index.html
1. To avoid debugging libraries, go to Chrome Dev Console -> Settings -> Blackboxing and add `\.min\.js$`, `/backbone\.js$`, `jquery.js` and `/angular\.js$`