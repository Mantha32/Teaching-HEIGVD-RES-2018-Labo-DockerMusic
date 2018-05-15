/*
 This program simulates a muscian who plays an instrument, which publishes the sound of this instrument
 on a multicast group. Other programs can join the group and receive the sound. The
 measures are transported in json payloads with the following format:

   {"uuid": "baef6775-eb3a-4ac9-85d3-70e4aa0d9d94","sound":"ti-ta-ti","activeSince":1394656712850}

 Usage: to start a musician, type the following command in a terminal
        (of course, you can run several musician in parallel and observe that all
        measures are transmitted via the multicast group):

   node musician.js instrument-type

*/

var protocol = require('../lib/./music-protocol'); // loads music-protocol.js
var Orchestra = require('../lib/./instrument-sound'); // loads instrument-sound.js
var orchestra = new Orchestra();
const uuidv4 = require('uuid/v4'); //fast generation of RFC4122 UUIDS, random version 4
/*
 * We use a standard Node.js module to work with UDP
 */
var dgram = require('dgram');

/*
 * Create a datagram socket. We will use it to send our UDP datagrams 
 */
var sock = dgram.createSocket('udp4');


/*
 * Let's define a javascript class for musician. The constructor accepts
 * an instrument
 */
function Musician(instrumentName) {


    //Create a data according the data  
    var data = {};
    data.uuid = uuidv4();
    data.sound = orchestra.getSound(instrumentName);
    data.activeSince = new Date().toISOString();

    var payload = JSON.stringify(data);

    /*
     * Finally, let's encapsulate the payload in a UDP datagram, which we publish on
     * the multicast address. All subscribers to this address will receive the message.
     */
    message = new Buffer(payload);

    /*
     * send a sound every 500 ms
     */
    setInterval(() => {
        sock.send(message, 0, message.length, protocol.PROTOCOL_PORT, protocol.PROTOCOL_MULTICAST_ADDRESS, function(err, bytes) {
            console.log("Sending payload: " + payload + " via port " + sock.address().port);
        });
    }, 500);

}


if (process.argv.length > 2) {
    /*
     * Let's get the instrument type from the command line attributes
     * Some error handling wouln't hurt here...
     */
    var name = process.argv[2];
    /*
     * Let's create a new musician - the regular publication of measures will
     * be initiated within the constructor
     */
    var M = new Musician(name);

} else {

    console.log("Give at least the instrument name as argument");
    console.log("node musician.js <instrument-type>");
}