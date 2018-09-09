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
var tBuffer = null;
//3528

setInterval(() => {
  let b = Math.floor(Math.random() * 3528);
  console.log(length, buffer[b], b);
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
      // for (var i = 0; i < length; i++) {
      //   buffer[i] = chunk.buffer[i];
      //   // buffer[i] = (Math.sin((i / length) * 3.1415 * 2.0) * 127);
      //   // pos = Math.floor(i * 0.7);
      //   // chunk[i] = (chunk[pos]) + (chunk[Math.floor(i * 0.5)]);
      //   // chunk[i + 1] = (chunk[pos]) + (chunk[Math.floor(i * 0.5)]);
      // }

      // buffer.copy(chunk.buffer);
      tBuffer = new Uint8Array(chunk.buffer);

      for (var i = 0; i < length; i += 2) {
        // buffer[i] = Math.random() * 127;
        pos = Math.floor(i * 0.7);
        // buffer[i] = (buffer[pos]) + (buffer[Math.floor(i * 0.5)]);
        // buffer[i + 1] = (buffer[pos + 1]) + (buffer[Math.floor(i * 0.5) + 1]);
      }
      buffer = Buffer.from(tBuffer.buffer);
      // console.log(buffer, chunk);
      // ao.write(chunk);
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