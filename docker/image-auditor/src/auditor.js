/*
 This program simulates a auditor, which joins a multicast
 group in order to receive measures published by mucisian.
 The sound played by auditor are transported in json payloads with the following format:

     {"uuid" : "aa7d8cb3-a15f-4f06-a0eb-b8feb6244a60","instrument" : "piano","activeSince" : "2016-04-27T05:20:50.731Z"}

 Usage: to start the auditor, use the following command in a terminal

   node auditor.js
   node auditor.js address_IP port

*/



/*----------------------------- DATA STRUCTURE -----------------------------------*/
/*
 * We have defined the multicast address and port in a file, that can be imported both by
 * auditor.js and mucisian.js. The address and the port are part of our simple 
 * application-level protocol
 */
var protocolUdp = require('./music-protocol'); // loads music-protocol.js
var InstrumentFeature = require('./instrument-sound'); // loads instrument-sound.js
var instrumentFeature = new InstrumentFeature();
var HashMap = require('hashmap');

/*
 * Create the data structure we use in the payload sending by tcp server accrording the following format
 * {"uuid" : "aa7d8cb3-a15f-4f06-a0eb-b8feb6244a60","instrument" : "piano","activeSince" : "2016-04-27T05:20:50.731Z"}
 */
function MusicianToken(uuid, instrument, since) {
    this.uuid = uuid;
    this.instrument = instrument;
    this.activeSince = since;
}

function Orchestra(map) {
    this.musicianList = map; //store the message sending by server UDP

    //Update the date if the orchestra contains this object with msgObj.uuid,  otherwise create new one
    this.set = function(msgObj) {

        if (this.musicianList.has(msgObj.uuid)) {
            this.musicianList.get(msgObj.uuid).activeSince = new Date().toISOString();
        } else {
            var tmpMusi = new MusicianToken(msgObj.uuid, instrumentFeature.getInstrument(msgObj.sound), new Date().toISOString());
            this.musicianList.set(msgObj.uuid, tmpMusi);
        }
    };

    //perform this process when a client TCP retrieve the orchestra state
    this.update = function() {
        this.musicianList.forEach(function(value, key) {
            var timestamp = Date.now() - Date.parse(value.activeSince);

            //Delete the inactive musician 
            if (timestamp > 5000) {
                this.musicianList.delete(key);
            }
        }, this);
    };

    this.getPayloadArrayTCP = function() {
        var payload = new Array();

        //Clean up the orchestra before set up this process
        this.update();

        return this.musicianList.values();
    };

};

/*----------------------------- UDP SIDE -----------------------------------*/

/*
 * We use a standard Node.js module to work with UDP
 */
var dgram = require('dgram');

/*
 * Create the orchestra datra who held the inbound message from the server UDP 
 */
var orchestra = new Orchestra(new HashMap());
/* 
 * Let's create a datagram socket. We will use it to listen for datagrams published in the
 * multicast group by musician and containing sound
 */
var socketUDP = dgram.createSocket('udp4');
socketUDP.bind(protocolUdp.PROTOCOL_PORT, function() {
    console.log("Joining multicast group");
    socketUDP.addMembership(protocolUdp.PROTOCOL_MULTICAST_ADDRESS);
});

/* 
 * This call back is invoked when a new datagram has arrived.
 * update the muscian list if it is necessary
 */
socketUDP.on('message', function(msg, source) {

    console.log("Data has arrived: " + msg + ". Source port: " + source.port);

    var messageObj = JSON.parse(msg);
    orchestra.set(messageObj);
});


/*----------------------------- TCP SERVER SIDE -----------------------------------*/
/*
 * Create the TCP server
 */


var net = require('net');
var protocolTcp = require('./tcp-protocol'); // load tcp-protocol.js 

/*
 * Fetch the protocol address and port
 * we can override this value in command line 
 */
var HOST = protocolTcp.PROTOCOL_ADDRESS;
var PORT = protocolTcp.PROTOCOL_PORT;

/* Create a server instance
 * The function passed to net.createServer() becomes the event handler for the 'connection' event
 * The socket object the callback function receives UNIQUE for each connection
 */
var serverTCP = net.createServer(function(socket) {

    // We have a connection - a socket object is assigned to the connection automatically
    console.log('CONNECTED: ' + socket.remoteAddress + ':' + socket.remotePort);


    var payload = JSON.stringify(orchestra.getPayloadArrayTCP());
    console.log('Sending the data, end up the connexion to the client TCP: ' + payload);

    payload += '\r\n';
    // Write the message to the socket, the client will receive it as data from the server
    socket.write(payload);

    //After sending the data, end up the connexion
    console.log('CLOSED : ' + socket.remoteAddress + ' ' + socket.remotePort);
    socket.destroy();
});

/*
 * We assume that the user line up the argument properly
 * override the address and port
 * node auditor.js address_ip port
 */
if (process.argv.length > 2) {
    HOST = process.argv[2];
    PORT = process.argv[3];
}

//The server listen to it
serverTCP.listen(PORT, HOST);

//Log fot server TCP side
console.log('Server TCP listening on ' + HOST + ':' + PORT);