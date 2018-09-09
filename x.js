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

var buffer = Buffer.allocUnsafe(1);
var length;

var tim = 200;

// 3528
// 4608

process.on('message', function (data) {
  length = data.message.data.length;
  buffer = Buffer.allocUnsafe(length);
  for (var i = 0; i < length; i++) {
    buffer[i] = data.message.data[i];
  }
});

process.on("exit", function () {
  ao.end();
  ao.quit();
});

process.once('SIGINT', () => {
  ao.end();
  ao.quit();
});


var ok;

function nWrite(data) {
  ok = true;
  do {
    ok = ao.write(data);
  } while (ok);
  if (!ok) {
    ao.once('drain', nWrite);
  }
}

process.on('play', () => {
  nWrite(buffer);
  setTimeout(() => {
    process.emit('play');
  }, 10);
});

process.emit('play');

/*
process.on('message', function (data) {
  length = data.message.data.length;

  if (buffer == null) {
    buffer = Buffer.allocUnsafe(length);
    for (var i = 0; i < length; i++) {
      buffer[i] = data.message.data[i];
    }
  } else {
    backBuffer = Buffer.allocUnsafe(length);
    for (var i = 0; i < length; i++) {
      backBuffer[i] = data.message.data[i];
    }
    buffer.concat(backBuffer);
  }
  nWrite(buffer);
});

process.on('message', function (data) {

  length = data.message.data.length;
  bufferLengh.push(length);
  if (2 < bufferLengh.length) {
    buffer = buffer.slice(bufferLengh[0]);
    bufferLengh.shift();
  }

  backBuffer = Buffer.allocUnsafe(length);
  for (var i = 0; i < length; i++) {
    backBuffer[i] = data.message.data[i];
  }
  buffer = Buffer.concat([buffer, backBuffer]);

});
*/