# Develop on Cloud 9

- Go to [https://ide.c9.io](https://ide.c9.io)
- Create a NodeJS workspace connected to your fork of this repository
- Run `git checkout -b develop` in the terminal
- Run `git pull origin develop` in the terminal
- Run `npm install` in the terminal
- Add your private config file to www/default.private_config.json
- Add your test user's username and password to www/default.private_config.json because OAuth doesn't really work with Cloud 9
- Run `ionic server -p $PORT` in the console
- Click Run and Preview to see your application
