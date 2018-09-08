const portAudio = require('naudiodon');
const {
  Readable,
  Writable
} = require('stream');
const util = require("util");

var sampleRate = 44100;
var tableSize = 200;
var buffer = Buffer.allocUnsafe(tableSize * 4 * 2);

var ai;
var ao;


function Filter() {
  if (!(this instanceof Filter)) {
    return new filter();
  }

  let Active = true;
  Writable.call(this, {
    highWaterMark: 16384,
    decodeStrings: false,
    objectMode: false,
    write: (chunk, encoding, cb) => {
      console.log(chunk);
    }
  });

}
util.inherits(Filter, Writable);

var filter = new Filter();

var devices = portAudio.getDevices();
// console.log(JSON.stringify(devices));

devices.forEach((device) => {
  // if (device.name == "マイク (High Definition Audio デバイス)")
  if (device.name.includes('NETDUETTO') && device.maxInputChannels == 2) {

    ai = new portAudio.AudioInput({
      channelCount: 2,
      sampleFormat: portAudio.SampleFormat16Bit,
      sampleRate: 44100,
      deviceId: device.id
    });

    ao = new portAudio.AudioOutput({
      channelCount: 2,
      sampleFormat: portAudio.SampleFormat16Bit,
      sampleRate: 44100,
      deviceId: -1
    });

    ao.on('error', err => console.error);
    ai.on('error', err => console.error);

    process.once('SIGINT', () => {
      ai.quit();
      ao.end();
      ao.quit();
    });

    ai.on('data', data => {
      console.log(data);
      write(data);
    });

    // ai.pipe(filter);

    function write(data) {
      // for (var i = 0; i < tableSize * 4 * 2; i += 2) {
      //   buffer[i] = (Math.sin((i / tableSize) * 3.1415 * 2.0) * 12);
      //   buffer[i + 1] = (Math.sin((i / tableSize) * 3.1415) * 12);
      // }
      var ok = true;
      do {
        ok = ao.write(data);
        // console.log("w", data);
      } while (ok);
      if (!ok) {
        ao.once('drain', write);
        // console.log("d", data);
      }
    }


    ai.start();
    ao.start();

  }
});