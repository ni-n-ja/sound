const portAudio = require('naudiodon');
const {
  Writable
} = require('stream');
const util = require("util");

var ao;

var devices = portAudio.getDevices();

ao = new portAudio.AudioOutput({
  channelCount: 2,
  sampleFormat: portAudio.SampleFormat32Bit,
  sampleRate: 44100,
  deviceId: -1
});

ao.on('error', err => console.error);

ao.start();

var buffer = Buffer.allocUnsafe(4068);
var length;

process.on('message', function (data) {
  length = data.message.data.length;
  for (var i = 0; i < length; i++) {
    buffer[i] = data.message.data[i];
  }
  nWrite(buffer);
});

process.on("exit", function () {
  ao.end();
  ao.quit();
});

process.once('SIGINT', () => {
  ao.end();
  ao.quit();
});

function nWrite(data) {
  var ok = true;
  do {
    ok = ao.write(data);
  } while (ok);
  if (!ok) {
    ao.once('drain', nWrite);
  }
}