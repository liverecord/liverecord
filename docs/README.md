# LiveRecord

[![GitHub release](https://img.shields.io/github/release/zoonman/liverecord.svg)](https://github.com/zoonman/liverecord)
[![Build Status](https://travis-ci.org/zoonman/liverecord.svg?branch=master)](https://travis-ci.org/zoonman/ruliq)
[![Github All Releases](https://img.shields.io/github/downloads/zoonman/liverecord/total.svg)](https://github.com/zoonman/liverecord)
[![David](https://img.shields.io/david/zoonman/liverecord.svg)](https://github.com/zoonman/liverecord)

Realtime forum designed for intense communication.

## Getting Started

There is 2 options of setup: 
 - simple and quick start using Docker
 - advanced

### Docker Compose

1. Install [Docker](https://docs.docker.com/engine/installation/) and [Docker Compose](https://docs.docker.com/compose/install/).
3. Clone project, open terminal in project root directory and run `docker-compose up`. Now you can get some coffee. Depending from your network speed and computer performance it will take 5-10 minutes.
3. Open [localhost:8914](http://localhost:8914/).

All set. First signed up user will become administrator automatically. 

### Advanced install

This step will take more 

#### Prerequisites
- [NVM](https://github.com/creationix/nvm)
- NodeJs 6.9 (will be installed by nvm)
- [MongoDB](https://www.mongodb.com/) 3.2

Install MongoDB and Node version manager. 

#### Configuration

See [Configuration](configuration.md) page for all options.

#### Building

Install dependencies and build the project.

```
nvm install
npm install
gulp build
```

Now application is ready to start

```
npm start
```

### Development

[Development](development.md)
