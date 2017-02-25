Development
===========

To start development you will need the following tools:
 - nvm
 - mongodb
 - Google Closure Linter
 - gulp
 
## Project organization 
 
This repository contains 2 pieces:
 - Frontend, stored in `client` directory. It is getting processed using `gulp` and deployed to `server/public/dist`.
   See gulpfile.js for additional details.
 - Backend is kept under `server` directory.
 
 
## Starting up the project

You have to install nvm and mongodb first.

After pulling a repo, run the following set of commands. It should install all components and build, and run the project.
In console you will see address like `Listening on http://0.0.0.0:8914`. Now you can open this URL in browser and create 
first user.

```bash
nvm install
nvm use
npm install


gulp build

export NODE_ENV=development

npm start
```
 
## Development process

I recommend to use modern IDE (WebStorm/PHPStrorm) with enabled Google Closure Linter.

Next you will need to start gulp watchers like this.

```bash
nvm use
gulp
```

It will create newer version and store it to `server/public/version.txt`.
