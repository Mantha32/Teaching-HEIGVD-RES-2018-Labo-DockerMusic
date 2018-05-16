/*
 This program simulates a muscian who plays an instrument, which publishes the sound of this instrument
 on a multicast group. Other programs can join the group and receive the sound. The
 measures are transported in json payloads with the following format:

   {"uuid": "baef6775-eb3a-4ac9-85d3-70e4aa0d9d94","sound":"ti-ta-ti"}

 Usage: to start a musician, type the following command in a terminal
        (of course, you can run several musician in parallel and observe that all
        measures are transmitted via the multicast group):

   node musician.js instrument-type

*/

var protocol = require('./music-protocol'); // loads music-protocol.js
var Orchestra = require('./instrument-sound'); // loads instrument-sound.js
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
function Musician(soundName) {


    //Create a data according the json payload {"uuid": "baef6775-eb3a-4ac9-85d3-70e4aa0d9d94","sound":"ti-ta-ti"}
    var data = {};
    data.uuid = uuidv4();
    data.sound = soundName;
    var payload = JSON.stringify(data);

    /*
     * Finally, let's encapsulate the payload in a UDP datagram, which we publish on
     * the multicast address. All subscribers to this address will receive the message.
     */
    message = new Buffer(payload);

    /*
     * send a sound every 1000 ms
     */
    setInterval(() => {
        sock.send(message, 0, message.length, protocol.PROTOCOL_PORT, protocol.PROTOCOL_MULTICAST_ADDRESS, function(err, bytes) {
            console.log("Sending payload: " + payload + " via port " + sock.address().port);
        });
    }, 1000);

}


if (process.argv.length > 2) {
    /*
     * Let's get the instrument type from the command line attributes
     * Some error handling wouln't hurt here...
     */
    var SName = orchestra.getSound(process.argv[2]);

    //check up the argument accroding the vailable instrument

    if (SName != null) {
        /*
         * Let's create a new musician
         */
        var M = new Musician(SName);
    } else {
        console.log("This instrument does not exist!");

        console.log("This is the available instrument: " + JSON.stringify(orchestra.listInstrument()));
        console.log("Retry again > _ <");
    }



} else {

    console.log("Give at least the instrument name as argument");
    console.log("node musician.js <instrument-type>");
}