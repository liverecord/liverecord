# LiveRecord

[![GitHub release](https://img.shields.io/github/release/zoonman/liverecord.svg)](https://github.com/zoonman/liverecord)
[![Build Status](https://travis-ci.org/zoonman/liverecord.svg?branch=master)](https://travis-ci.org/zoonman/ruliq)
[![Github All Releases](https://img.shields.io/github/downloads/zoonman/liverecord/total.svg)](https://github.com/zoonman/liverecord)
[![David](https://img.shields.io/david/zoonman/liverecord.svg)](https://github.com/zoonman/liverecord)

Realtime forum designed for intense communication.

## Getting Started

There are 2 options of setup: 
 - simple and quick start using Docker
 - advanced

### Quick start using Docker

1. Install [GIT](https://git-scm.com/), [Docker](https://docs.docker.com/engine/installation/) and [Docker Compose](https://docs.docker.com/compose/install/).
2. Clone project by running `git clone https://github.com/zoonman/liverecord.git` in your terminal. 
3. Open terminal in project root directory and run `docker-compose up`. Now you can get some coffee. 
   Depending from your network speed and computer performance it will take 5-10 minutes.

Congratulations! Now you can open [localhost:8914](http://localhost:8914/).
First signed up user will become administrator automatically. 

### Advanced installation

This option will take more steps but will provide more flexibility. 
This is recommended option for production deployment. 

#### Prerequisites

- [GIT](https://git-scm.com/)
- [NVM](https://github.com/creationix/nvm)
- NodeJs 7.x (will be installed by nvm)
- [MongoDB](https://www.mongodb.com/) 3.x

Install MongoDB and Node version manager. 
Clone project repository. Now it is time to configure the project.

#### Configuration

See [Configuration](configuration.md) page for all options.
You can skip this section, if you running whole project on your local machine.

#### Building

Install dependencies and build the project.

```
nvm install
npm install
gulp build
```

Now application is ready to start:

```
npm start
```

Please, navigate to [localhost:8914](http://localhost:8914/) to sign up.

### Development

If you like to improve this project or 
just hang around welcome to [Development](development.md) section.
