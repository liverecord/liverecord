module.exports.remoteAddr = function(socket) {
  return socket.handshake.headers['x-forwarded-for'] ||
      socket.request.connection.remoteAddress;
};
