const portAudio = require('naudiodon');
const {
  Writable
} = require('stream');
const util = require("util");

var ai;
var ao;


var devices = portAudio.getDevices();
var deviceId;
var outDeviceId;

devices.forEach((device) => {
  if (device.name == "マイク (High Definition Audio デバイス)" && device.maxInputChannels == 2) {
    // if (device.name.includes('NETDUETTO') && device.maxInputChannels == 2) {
    deviceId = device.id;
  }
  if (device.name.includes('NETDUETTO') && device.maxOutputChannels == 2) {
    outDeviceId = device.id;
  }
});

ai = new portAudio.AudioInput({
  channelCount: 2,
  sampleFormat: portAudio.SampleFormat8Bit,
  sampleRate: 44100,
  deviceId: deviceId
});

ao = new portAudio.AudioOutput({
  channelCount: 2,
  sampleFormat: portAudio.SampleFormat8Bit,
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


var length = 0;
var pos;
var pos2;
var tBuffer = '';
//3528
//882

setInterval(() => {
  let b = Math.floor(Math.random() * 882);
  console.log(length, buffer[b], b, tBuffer);
}, 1000);

var buffer = Buffer.allocUnsafe(882);

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

      for (var i = 0; i < length; i += 2) {
        pos = i * 0.5;
        if (pos % 2 !== 0) {
          pos += 1;
        }
        pos2 = i * 0.7;
        if (pos2 % 2 !== 0) {
          pos2 += 1;
        }
        if (chunk.readInt8(pos) + chunk.readInt8(pos2) < 256) {
          buffer[i] = chunk.readInt8(pos) + chunk.readInt8(pos2);
          buffer[i + 1] = chunk.readInt8(pos) + chunk.readInt8(pos2);
        } else {
          buffer[i] = 256;
          buffer[i + 1] = 256;
        }

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