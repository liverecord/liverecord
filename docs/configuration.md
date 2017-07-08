# Configuration


## Parameters

Configure parameters in environment variables, for details look into config section of [`package.json`](../package.json).

When you will start your server, you can always override your configuration using environment variables like this

```bash
npm config set liverecord:server.name 'www.example.com'
```

#### List of available parameters


Name | Default Value | Description
---- | ------------- | -----------
mongodb.uri | mongodb://127.0.0.1:27017/liveRecord | Standard MongoDb Driver connection string
server.name | 0.0.0.0:8914 | Server hostname or domain name
server.host | 0.0.0.0 | Default server host
server.port | 8914 | Default server port
security.restored_password_length | 12 | Length of future restored password
jwt.restored_password_length | yourKey | Secret key for [JWT](https://jwt.io/)
email.sender | Sender Name <name@example.com> | 
email.transport | smtps://user%40gmail.com:pass@smtp.gmail.com | [SMTP Transport configuration string](https://nodemailer.com/smtp/) for Nodemailer
sentry.dsn |  | DSN for [Sentry](https://sentry.io/)
webpush.gcm_api_key |  |  GCM API Key from the Google Developer Console or the Cloud Messaging tab under a Firebase Project.
analytics.ga_id | none | Google Analytics property ID
files.dir | files | Folder for files
files.extensions.blacklist |  | Comma-separated list of blacklisted extensions
files.extensions.whitelist | jpg,jpeg,png,gif,pdf,svg,zip,mp4,dmg | Comma-separated list of whitelisted extensions (we recommend to use it)
oauth.facebook.client_id |   | Facebook App Id [More](https://developers.facebook.com/docs/apps/register) 
oauth.facebook.client_secret |   | Facebook App Secret
oauth.twitter.client_id |   | Twitter App Consumer Key [More](https://apps.twitter.com/) 
oauth.twitter.client_secret |   | Twitter App Secret
oauth.windowslive.client_id |   | Windows Live App Id [More](https://apps.dev.microsoft.com/) 
oauth.windowslive.client_secret |   | Windows Live App Secret
oauth.vkontakte.client_id |   | Vkontakte App Id [More](https://vk.com/apps?act=manage) 
oauth.vkontakte.client_secret |   | Vkontakte App Secret
oauth.github.client_id |   | GitHub App Id [More](https://github.com/settings/developers) 
oauth.github.client_secret |   | GitHub App Secret
oauth.google.client_id |   | Google Client ID [More](https://console.developers.google.com/) 
oauth.google.client_secret |   | Google App Secret

Please, take a look at `package.json` if you want to configure all available options.

 

## Start
    
You can run the server through this script overriding parameters from package.json like this:

```bash
#!/usr/bin/env bash

# load NVM
export NVM_DIR="~/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

# install node from .nvmrc
nvm install

# install node packages
npm install

# compile assets
gulp build 

# configure your options
npm config set liverecord:server.name 'www.your.domain'
npm config set liverecord:email.sender 'Your Sender Name <yourEmail@your.domain>'

# start application
npm start
```


## Configuring Nginx

If you are using Nginx, it would be better to use it for serving static content. 
Serving static files using nginx as reverse proxy for Node app is an preferred option. 

Configure to serve static from the `server/public` directory.


```nginx

#
# Our application gets deployed via capistrano
# to the /var/www/liverecord
#

# configure connection to our application
upstream app_liverecord {
  ip_hash;
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
