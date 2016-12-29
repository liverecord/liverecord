# LiveRecord

Realtime forum designed for intense communication.

## Setup

##### Prerequisites
- [NVM](https://github.com/creationix/nvm)
- NodeJs 6.9
- [MongoDB](https://www.mongodb.com/) 3.2

Install MongoDB and Node version manager.

##### Configuration

Configure parameters in environment variables, for details look into config section of `package.json`

```json

{
  "config": { 
    "mongodb": {
      "uri": "mongodb://127.0.0.1:27017/liveRecord"
    },
    "server": {
      "host": "0.0.0.0",
      "port": 8914
    },
    "security": {
      "restored_password_length": 12
    },
    "jwt": {
      "secret": "yourSuperStrongSecretKeyToProtectYourUsersPrivacy"
    },
    "email": {
      "sender": "Sender Name <name@example.com>",
      "transport": "smtps://user%40gmail.com:pass@smtp.gmail.com"
    },
    "files": {
      "dir": "files",
      "extensions": {
        "blacklist": "exe",
        "whitelist": ""
      }
    }
  }
}

```
    
You can run the server through you script overriding parameters from package.json like this:

```bash
#!/usr/bin/env bash

npm config set liverecord:email.sender 'Your Sender Name <yourEmail@your.domain>'

npm start
```

If you are using Nginx, it would be better to use it for serving static content.

Configure to serve static from the `server/public` directory.

##### Building

Install dependencies and build the project.

```
nvm use
npm install
gulp build
```

Now application is ready to start

```
npm start
```
