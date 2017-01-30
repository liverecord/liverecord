/**
 * Created by zoonman on 1/12/17.
 */
const md5File = require('md5-file');
const imageFormats = ['jpeg', 'jpg', 'png', 'webp', 'gif', 'svg', 'tiff'];
const xtend = require('xtend');
const sharp = require('sharp');
const path = require('path');
const pick = require('object.pick');
const fs = require('fs');

function uploadHandler(socket,
    uploader,
    filesUploadDirectory,
    filesPublicDirectory,
    errorHandler) {
  uploader.listen(socket);
  uploader.on('start', function(event) {
        var extension = path.extname(event.file.name)
            .toLowerCase()
            .replace('.', '');

        if (process.env.npm_package_config_files_extensions_blacklist
            && process.env.npm_package_config_files_extensions_blacklist.indexOf(
                extension
            ) > -1) {
          uploader.abort(event.file.id, socket);
        }
        if (process.env.npm_package_config_files_extensions_whitelist
            && process.env.npm_package_config_files_extensions_whitelist.indexOf(
                extension
            ) === -1) {
          uploader.abort(event.file.id, socket);
        }
      }
  );
  uploader.on('saved', function(event) {
        console.log('saved', event.file.meta);
        if (event.file.success) {
          //return;
          md5File(event.file.pathName, function(err, hash) {
                if (err) {
                  errorHandler(err);
                } else {
                  var extension = path.extname(event.file.name)
                      .replace('.', '')
                      .toLowerCase();
                  if (extension) {
                    function buildPath(hash) {
                      return hash.substr(0, 3);
                    }

                    //
                    var targetDirectory = filesUploadDirectory;
                    if (!fs.existsSync(targetDirectory)) {
                      fs.mkdirSync(targetDirectory);
                    }
                    targetDirectory += event.file.meta.avatar ? 'a/' : 'f/';
                    if (!fs.existsSync(targetDirectory)) {
                      fs.mkdirSync(targetDirectory);
                    }
                    targetDirectory += buildPath(hash);
                    //
                    if (!fs.existsSync(targetDirectory)) {
                      fs.mkdirSync(targetDirectory);
                    }

                    var filePath = targetDirectory + '/' + event.file.base + '.' + extension;
                    var fileWebPath = '/' + filesPublicDirectory + (event.file.meta.avatar ? 'a/' : 'f/') + buildPath(
                            hash
                        ) + '/' + event.file.base + '.' + extension;
                    if (event.file.meta.avatar) {

                      console.log('event.file', event.file);
                      console.log('filePath', filePath);
                      // resize
                      sharp(event.file.pathName)
                          .resize(100, 100)
                          .crop(sharp.strategy.entropy)
                          .toFile(filePath, function(err, info) {
                                if (err) {
                                  fs.unlink(event.file.pathName);
                                  return errorHandler(err)
                                } else {
                                  socket.emit(
                                      'user.avatar',
                                      {absolutePath: fileWebPath}
                                  );
                                  fs.unlink(event.file.pathName);// don't care
                                                                 // when it is
                                                                 // done
                                }
                              }
                          );
                    } else {
                      fs.rename(event.file.pathName, filePath, function(err) {
                            if (err) {
                              return errorHandler(err);
                            }
                            var friendlyName = event.file.base;
                            friendlyName = friendlyName.replace(/_/g, ' ')
                                .replace(/\\"/g, ' ')
                                .replace(/\s/g, ' ');
                            if (imageFormats.indexOf(extension) > -1) {
                              try {
                                sharp(filePath)
                                    .metadata()
                                    .then(function(metaData) {
                                      //exif
                                      console.log(metaData);

                                      //icc
                                      socket.emit(
                                          'file.uploaded',
                                          xtend({
                                                extension: extension,
                                                hasAlpha: false,
                                                name: event.file.name,
                                                friendlyName: friendlyName,
                                                size: event.file.size,
                                                absolutePath: fileWebPath
                                              },
                                              pick(
                                                  metaData,
                                                  [
                                                    'width',
                                                    'height',
                                                    'orientation',
                                                    'hasAlpha',
                                                    'format',
                                                    'space',
                                                    'channels',
                                                    'density'
                                                  ]
                                              )
                                          )
                                      );
                                    }, function(reason) {
                                      errorHandler(reason);
                                    }
                                );
                              }
                              catch (e) {
                                // the image is broken
                                errorHandler(e);
                              }

                            } else {
                              // save file info
                              socket.emit(
                                  'file.uploaded',
                                  {
                                    extension: extension,
                                    hasAlpha: false,
                                    name: event.file.name,
                                    friendlyName: friendlyName,
                                    size: event.file.size,
                                    absolutePath: fileWebPath
                                  }
                              );
                            }
                          }
                      );
                    }
                  }
                }
              }
          );
        }
      }
  );
}

module.exports = uploadHandler;
