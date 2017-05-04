var mosca = require('mosca');
var moscaSettings = {
    port: 1883,
};
var server = new mosca.Server(moscaSettings);
server.on('ready', setup);
function setup() {
    console.log('ready');
}
server.on('clientConnected', function(client) {
    console.log('client connected', client.id);
});
server.on('clientDisconnected', function (client) {
    console.log('clientDisconnected: ', client.id);
});
server.on('subscribed', function (client) {
    console.log('subscribed: ');
});
server.on('unsubscribed', function (client) {
    console.log('unsubscribed: ');
});
server.on('published', function (packet, client) {
    console.log('Published', packet.payload);
});
