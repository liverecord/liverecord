# Node.JS LTS
FROM ubuntu:latest
LABEL maintainer "zoonman@gmail.com"

RUN apt-get update
RUN DEBIAN_FRONTEND=noninteractive apt-get install -qy build-essential libssl-dev git man curl bash python

RUN rm /bin/sh && ln -s /bin/bash /bin/sh

USER root

ENV HOME /root
ENV NODE_VERSION 7.6.0


# nvm environment variables
ENV NVM_DIR /usr/local/nvm

# setup the nvm environment
RUN git clone https://github.com/creationix/nvm.git $NVM_DIR/.nvm

# install node and npm
RUN source $NVM_DIR/.nvm/nvm.sh \
    && nvm install $NODE_VERSION \
    && nvm alias default $NODE_VERSION \
    && nvm use default

# add node and npm to path so the commands are available
ENV NODE_PATH $NVM_DIR/v$NODE_VERSION/lib/node_modules
ENV PATH $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

# confirm installation
RUN node -v
RUN npm -v

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY .nvmrc /usr/src/app/
COPY package.json /usr/src/app/
COPY gulpfile.js /usr/src/app/
RUN npm install -g gulp
RUN npm install

# Bundle app source
COPY client /usr/src/app/client
COPY server /usr/src/app/server

EXPOSE 8914

CMD [ "gulp", "build" ]
CMD [ "npm", "start" ]
