const portAudio = require('naudiodon');
const {
  Writable
} = require('stream');
const util = require("util");

var ai;
var ao;

var devices = portAudio.getDevices();
var inputDeviceId;
var outDeviceId;

devices.forEach((device) => {
  if (device.name == "マイク (High Definition Audio デバイス)" && device.maxInputChannels == 2) {
    inputDeviceId = device.id;
  }
  if (device.name.includes('NETDUETTO') && device.maxOutputChannels == 2 && device.hostAPIName == "MME") {
    outDeviceId = device.id;
  }
});

console.log(inputDeviceId, outDeviceId);

ai = new portAudio.AudioInput({
  channelCount: 2,
  sampleFormat: portAudio.SampleFormat32Bit,
  sampleRate: 44100,
  deviceId: -1
});

ao = new portAudio.AudioOutput({
  channelCount: 2,
  sampleFormat: portAudio.SampleFormat32Bit,
  sampleRate: 44100,
  deviceId: outDeviceId
});

ao.on('error', err => console.error);
ai.on('error', err => console.error);

process.once('SIGINT', () => {
  ai.quit();
  ao.end();
  ao.quit();
});

var length = 1;
var pos;
var pos2;
var tBuffer = '';
var buffer = Buffer.allocUnsafe(1);

setInterval(() => {
  let b = Math.floor(Math.random() * length);
  console.log(length, buffer[b], b, tBuffer);
  console.log(buffer);
}, 1000);

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
      for (var i = 0; i < length; i += 8) {

        pos = Math.floor(i * 0.8) % length;
        while (pos % 8 !== 0) {
          pos += 1;
        }
        pos2 = Math.floor(i * 1.5) % length;
        while (pos2 % 8 !== 0) {
          pos2 += 1;
        }

        let hex = ('000000' + Math.floor(chunk.readInt32BE(pos) * 2).toString(16)).slice(-8);
        let hex2 = ('000000' + Math.floor(chunk.readInt32BE(pos2) * 2).toString(16)).slice(-8);
        buffer[i] = (parseInt(hex.toString().substr(0, 2), 16)) + (parseInt(hex2.toString().substr(0, 2), 16));
        buffer[i + 1] = (parseInt(hex.toString().substr(2, 2), 16)) + (parseInt(hex2.toString().substr(2, 2), 16));
        buffer[i + 2] = (parseInt(hex.toString().substr(4, 2), 16)) + (parseInt(hex2.toString().substr(4, 2), 16));
        buffer[i + 3] = (parseInt(hex.toString().substr(6, 2), 16)) + (parseInt(hex2.toString().substr(6, 2), 16));

        buffer[i + 4] = 0;
        buffer[i + 5] = 0;
        buffer[i + 6] = 0;
        buffer[i + 7] = 0;
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