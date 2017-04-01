module.exports.remoteAddr = (socket) =>
    socket.handshake.headers['x-forwarded-for'] ||
    socket.request.connection.remoteAddress;

