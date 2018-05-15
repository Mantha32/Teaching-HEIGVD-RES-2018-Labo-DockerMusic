/*
 This program simulates a auditor, which joins a multicast
 group in order to receive measures published by mucisian.
 The sound played by musician are transported in json payloads with the following format:

     {"uuid" : "aa7d8cb3-a15f-4f06-a0eb-b8feb6244a60","instrument" : "piano","activeSince" : "2016-04-27T05:20:50.731Z"}

 Usage: to start the station, use the following command in a terminal

   node auditor.js

*/

/*
 * We have defined the multicast address and port in a file, that can be imported both by
 * auditor.js and mucisian.js. The address and the port are part of our simple 
 * application-level protocol
 */
var protocolUdp = require('../lib/./music-protocol'); // loads music-protocol.js
var InstrumentSound = require('../lib/./instrument-sound'); // loads instrument-sound.js
var instrumentSound = new InstrumentSound();


/*
 * We use a standard Node.js module to work with UDP
 */
var dgram = require('dgram');

/*
 * This data store the active musician using hashmap
 * The entire inbound message is the hashmap key
 */
var HashMap = require('hashmap');
var orchestra = new HashMap();

/* 
 * Let's create a datagram socket. We will use it to listen for datagrams published in the
 * multicast group by musician and containing sound
 */
var sock = dgram.createSocket('udp4');
sock.bind(protocolUdp.PROTOCOL_PORT, function() {
    console.log("Joining multicast group");
    sock.addMembership(protocolUdp.PROTOCOL_MULTICAST_ADDRESS);
});

/* 
 * This call back is invoked when a new datagram has arrived.
 * update the muscian list if it is necessary
 */
sock.on('message', function(msg, source) {
    console.log("Data has arrived: " + msg + ". Source port: " + source.port);
    orchestra.set(msg, new Date());
});

var getOrchestra = function(msg) {
    var orchestraArray = orchestra.keys();
    for (count = 0; count < orchestraArray.length; count++) {
        orchestraArray
    }
}

/*
 * Create the TCP server
 */
var net = require('net');
var protocolTcp = require('../lib/./tcp-protocol');
var HOST = protocolTcp.PROTOCOL_ADDRESS;
var PORT = protocolTcp.PROTOCOL_PORT;

// Create a server instance
// The function passed to net.createServer() becomes the event handler for the 'connection' event
// The socket object the callback function receives UNIQUE for each connection
var server = net.createServer(function(socket) {

    // We have a connection - a socket object is assigned to the connection automatically
    console.log('CONNECTED: ' + socket.remoteAddress + ':' + socket.remotePort);


    //Fetch information about the orchestra
    var date = new Date().toISOString();
    var msg = {
        type: "date",
        value: date
    };

    var listMsg = new Array(msg);
    listMsg.push(msg);
    var payload = '';

    payload = JSON.stringify(listMsg) + '\r\n';
    console.log('Sending the data, end up the connexion to the client TCP' + payload);

    // Write the message to the socket, the client will receive it as data from the server
    socket.write(payload);

    //After sending the data, end up the connexion
    console.log('CLOSED : ' + socket.remoteAddress + ' ' + socket.remotePort);
    socket.destroy();
});



//The server listen to it
server.listen(PORT, HOST);

//Log fot server TCP side
console.log('Server TCP listening on ' + HOST + ':' + PORT);