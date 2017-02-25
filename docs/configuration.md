# Configuration

Configure parameters in environment variables, for details look into config section of `package.json`

```json

{
  "config": { 
    "mongodb": {
      "uri": "mongodb://127.0.0.1:27017/liveRecord"
    },
    "server": {
      "name": "forum.example.com",
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

npm config set liverecord:server.name 'www.your.domain'
npm config set liverecord:email.sender 'Your Sender Name <yourEmail@your.domain>'

npm start
```

If you are using Nginx, it would be better to use it for serving static content.

Configure to serve static from the `server/public` directory.

```
#
# Our application gets deployed via capistrano
# to the /var/www/liverecord
#

# configure connection to our application
upstream app_liverecord {
  server 127.0.0.1:8914;
}

# let's configure web-server
server {

  # setup your domain name here
  server_name live.record.example.com;

  # access logs are not mandatory 
  access_log /var/log/nginx/lr.a.log;
  error_log /var/log/nginx/lr.e.log;
  
  root /var/www/liverecord/current/server/public;
  index index.html;
  
  
  location /dist {
    alias /var/www/liverecord/current/server/public/dist;
  }
  
  location /files {
    alias /var/www/liverecord/current/server/public/files;
  }
  
  location /index\.html {
    alias /var/www/liverecord/current/server/public/index.html;
  }
  
  location / {
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header Host $http_host;
    proxy_set_header X-NginX-Proxy true;
    proxy_pass http://app_liverecord/;
    proxy_redirect off;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }
}

```
