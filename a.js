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
    // if (device.name.includes('NETDUETTO') && device.maxInputChannels == 2) {
    inputDeviceId = device.id;
  }
  if (device.name.includes('NETDUETTO') && device.maxOutputChannels == 2 && device.hostAPIName == "MME") {
    outDeviceId = device.id;
  }
});

console.log(inputDeviceId, outDeviceId);

ai = new portAudio.AudioInput({
  channelCount: 2,
  sampleFormat: portAudio.SampleFormat16Bit,
  sampleRate: 44100,
  deviceId: -1
});

ao = new portAudio.AudioOutput({
  channelCount: 2,
  sampleFormat: portAudio.SampleFormat16Bit,
  sampleRate: 44100,
  deviceId: outDeviceId
  // deviceId: -1
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
var buffer = Buffer.allocUnsafe(882);
//3528
//882
//1152

setInterval(() => {
  let b = Math.floor(Math.random() * 882);
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

      for (var i = 0; i < length; i++) {
        buffer[i] = chunk[i];
      }

      // for (var i = 0; i < length; i += 2) {
      //   pos = i * 0.6;
      //   if (pos % 2 !== 0) {
      //     pos += 1;
      //   }
      //   pos2 = i * 0.75;
      //   if (pos2 % 2 !== 0) {
      //     pos2 += 1;
      //   }

      //   if (pos <= 2) {
      //     buffer[i] = (chunk.readInt8(pos) + chunk.readInt8(pos + 2) + chunk.readInt8(pos + 4)) / 3;
      //     buffer[i + 1] = (chunk.readInt8(pos) + chunk.readInt8(pos + 2) + chunk.readInt8(pos + 4)) / 3;
      //   } else if (pos >= (length - 4)) {
      //     buffer[i] = (chunk.readInt8(pos - 4) + chunk.readInt8(pos - 2) + chunk.readInt8(pos)) / 3;
      //     buffer[i + 1] = (chunk.readInt8(pos - 4) + chunk.readInt8(pos - 2) + chunk.readInt8(pos)) / 3;
      //   } else {
      //     buffer[i] = (chunk.readInt8(pos - 2) + chunk.readInt8(pos) + chunk.readInt8(pos + 2) + chunk.readInt8(pos + 4)) / 4;
      //     buffer[i + 1] = (chunk.readInt8(pos - 2) + chunk.readInt8(pos) + chunk.readInt8(pos + 2) + chunk.readInt8(pos + 4)) / 4;
      //   }

      //   if (pos2 <= 2) {
      //     buffer[i] += (chunk.readInt8(pos2) + chunk.readInt8(pos2 + 2) + chunk.readInt8(pos2 + 4)) / 3 * 0.5;
      //     buffer[i + 1] += (chunk.readInt8(pos2) + chunk.readInt8(pos2 + 2) + chunk.readInt8(pos2 + 4)) / 3 * 0.5;
      //   } else if (pos2 >= (length - 4)) {
      //     buffer[i] += (chunk.readInt8(pos2 - 4) + chunk.readInt8(pos2 - 2) + chunk.readInt8(pos2)) / 3 * 0.5;
      //     buffer[i + 1] += (chunk.readInt8(pos2 - 4) + chunk.readInt8(pos2 - 2) + chunk.readInt8(pos2)) / 3 * 0.5;
      //   } else {
      //     buffer[i] += (chunk.readInt8(pos2 - 2) + chunk.readInt8(pos2) + chunk.readInt8(pos2 + 2) + chunk.readInt8(pos2 + 4)) / 4 * 0.5;
      //     buffer[i + 1] += (chunk.readInt8(pos2 - 2) + chunk.readInt8(pos2) + chunk.readInt8(pos2 + 2) + chunk.readInt8(pos2 + 4)) / 4 * 0.5;
      //   }

      //   if (256 < buffer[i]) {
      //     buffer[i] = 256;
      //   }
      //   if (256 < buffer[i + 1]) {
      //     buffer[i + 1] = 256;
      //   }

      // }

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