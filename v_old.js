const portAudio = require('naudiodon');
const stream = require('stream');

var sampleRate = 44100;
var tableSize = 200;
var buffer = Buffer.allocUnsafe(tableSize * 4 * 2);

var ai;

var devices = portAudio.getDevices();
console.log(JSON.stringify(devices));

devices.forEach((device) => {
  if (device.name == "ライン (Yamaha NETDUETTO Driver (WDM))") {
    ai = new portAudio.AudioInput({
      channelCount: 2,
      sampleFormat: portAudio.SampleFormat16Bit,
      sampleRate: 44100,
      deviceId: device.deviceId
    });
  }
});

var ao = new portAudio.AudioOutput({
  channelCount: 2,
  sampleFormat: portAudio.SampleFormat16Bit,
  sampleRate: sampleRate,
  deviceId: -1
});


ao.on('error', console.error);

// write();

// function write() {
//   for (var i = 0; i < tableSize * 4 * 2; i += 2) {
//     buffer[i] = (Math.sin((i / tableSize) * 3.1415 * 2.0) * 12);
//     buffer[i + 1] = (Math.sin((i / tableSize) * 3.1415) * 12);
//   }
//   var ok = true;
//   do {
//     ok = ao.write(buffer);
//   } while (ok);
//   if (!ok) {
//     ao.once('drain', write);
//   }
// }

process.on('play', () => {
  write();
  setTimeout(() => {
    process.emit('play');
  }, 30);
});

function write() {
  for (var i = 0; i < tableSize * 4 * 2; i += 2) {
    buffer[i] = (Math.sin((i / tableSize) * 3.1415 * 2.0) * 12);
    buffer[i + 1] = (Math.sin((i / tableSize) * 3.1415) * 12);
  }
  var ok = true;
  ok = ao.write(buffer);
  if (!ok) {
    ao.once('drain', write);
  }
}
process.emit('play');

ao.start();

process.once('SIGINT', ao.quit);