/*
 * Define the mapping between instrument and sound
 *
 */


function InstrumentType(name, sound) {

    this.instrument = name;
    this.sound = sound;
}
var piano = new InstrumentType("piano", "ti-ta-ti");
var trumpet = new InstrumentType("trumpet", "pouet");
var flute = new InstrumentType("flute", "trulu");
var violin = new InstrumentType("violin", "gzi-gzi");
var drum = new InstrumentType("drum", "boum-boum");

var orchestraInstr = new Array(piano, trumpet, flute, violin, drum);

var orchestra = function() {

    this.getSound = function(Iname) {

        for (index in orchestraInstr) {
            if (Iname === orchestraInstr[index].instrument)
                return orchestraInstr[index].sound;
        }

        return null;
    };

    this.getInstrument = function(Iname) {

        for (index in orchestraInstr) {
            if (Iname === orchestraInstr[index].instrument)
                return orchestraInstr[index];
        }

        return null;
    }



}

module.exports = orchestra;