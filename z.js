const portAudio = require('naudiodon');
const {
  Writable
} = require('stream');
const util = require("util");

var child_process = require("child_process");
var child = child_process.fork("./x");

var ai;
var devices = portAudio.getDevices();
var deviceId;

devices.forEach((device) => {
  if (device.name.includes('NETDUETTO') && device.maxInputChannels == 2) {
    deviceId = device.id;
  }
});

ai = new portAudio.AudioInput({
  channelCount: 2,
  sampleFormat: portAudio.SampleFormat32Bit,
  sampleRate: 44100,
  deviceId: deviceId
});

ai.on('error', err => console.error);

process.once('SIGINT', () => {
  ai.quit();
});

// ai.on('data', data => {
//   child.send({
//     message: data
//   });
// });

function Filter() {
  if (!(this instanceof Filter)) {
    return new filter();
  }

  let Active = true;
  Writable.call(this, {
    // highWaterMark: 16384,
    highWaterMark: 16384,
    decodeStrings: false,
    objectMode: false,
    write: (chunk, encoding, cb) => {
      child.send({
        message: chunk
      });
      cb();
    }
  });

}
util.inherits(Filter, Writable);

var filter = new Filter();

ai.pipe(filter);
ai.start();