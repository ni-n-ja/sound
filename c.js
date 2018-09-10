const portAudio = require('naudiodon');
const {
  Writable
} = require('stream');
const util = require("util");

var ai;
var ao;


var devices = portAudio.getDevices();
var deviceId;

devices.forEach((device) => {
  // if (device.name == "マイク (High Definition Audio デバイス)")
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

ao = new portAudio.AudioOutput({
  channelCount: 2,
  sampleFormat: portAudio.SampleFormat32Bit,
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


var length = 0;
var pos;
var tBuffer = '';
//3528

setInterval(() => {
  let b = Math.floor(Math.random() * 3528);
  console.log(length, buffer[b], b, tBuffer);
}, 1000);

var buffer = Buffer.allocUnsafe(3528);

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
      length = chunk.length;
      buffer = Buffer.allocUnsafe(length);

      // for (var i = 0; i < length; i++) {
      //   buffer[i] = chunk[i];
      // }

      for (var i = 0; i < length; i += 8) {
        pos = i;
        // let hex = ('0000000' + Math.floor(chunk.readUInt32BE(i) * 0.001).toString(16)).slice(-8);
        // let hex = ('0000000' + Math.floor(chunk.readUInt32BE(i) * 0.5).toString(16)).slice(-8);
        let hex = ('0000000' + Math.floor(chunk.readUInt32BE(i) * 2).toString(16)).slice(-8);
        // tBuffer = (parseInt(hex.toString().slice(0, 2), 16));
        buffer[i] = (parseInt(hex.toString().substr(0, 2), 16));
        buffer[i + 1] = (parseInt(hex.toString().substr(2, 2), 16));
        buffer[i + 2] = (parseInt(hex.toString().substr(4, 2), 16));
        buffer[i + 3] = (parseInt(hex.toString().substr(6, 2), 16));
        // buffer[i + 1] = chunk[i + 1];
        // buffer[i + 2] = chunk[i + 2];
        // buffer[i + 3] = chunk[i + 3];

        tBuffer = Math.floor(chunk.readUInt32BE(i) * 0.5).toString(16) + " " +
          chunk.readUInt32BE(i) * 0.5 + " " +
          chunk.readUInt32BE(i) + " ";

        // tBuffer = parseInt(('0000000' + Math.floor(chunk.readUInt32BE(i)).toString(16)).slice(-8), 16) + " " + parseInt(('0000000' + Math.floor(chunk.readUInt32BE(i) * 0.001).toString(16)).slice(-8), 16);

        // tBuffer = hex.toString() + " " +
        //   hex.toString().slice(0, 2) + " " +
        //   hex.toString().slice(2, 4) + " " +
        //   hex.toString().slice(4, 6) + " " +
        //   hex.toString().slice(6, 8);
        // buffer[i] = chunk[i];
        // buffer[i + 1] = chunk[i + 1];
        // buffer[i + 2] = chunk[i + 2];
        // buffer[i + 3] = chunk[i + 3];

        //tBuffer = ('0000000' + Math.floor(chunk.readUInt32BE(i + 4) * 0.5).toString(16)).slice(-8);
        buffer[i + 4] = chunk[i];
        buffer[i + 5] = chunk[i + 1];
        buffer[i + 6] = chunk[i + 2];
        buffer[i + 7] = chunk[i + 3];
      }

      ao.write(buffer);
      cb();
    }
  });

}
util.inherits(Filter, Writable);

var filter = new Filter();

function nWrite(data) {
  var ok = true;
  do {
    ok = ao.write(data);
  } while (ok);
  if (!ok) {
    ao.once('drain', nWrite);
  }
}

ai.pipe(filter);

ai.start();
ao.start();