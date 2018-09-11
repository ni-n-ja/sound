const portAudio = require('naudiodon');

var sampleRate = 44100;
var tableSize = 200;
var buffer = Buffer.allocUnsafe(tableSize * 4 * 2);

var ao = new portAudio.AudioOutput({
  channelCount: 2,
  sampleFormat: portAudio.SampleFormat8Bit,
  sampleRate: sampleRate,
  deviceId: -1
});

function loop(writer, data) {
  write();

  function write() {
    for (var i = 0; i < tableSize * 4 * 2; i += 2) {
      buffer[i] = (Math.sin((i / tableSize) * 3.1415 * 2.0) * 12);
      buffer[i + 1] = (Math.sin((i / tableSize) * 3.1415) * 12);
    }
    var ok = true;
    do {
      // if (i === 0) {
      //   writer.end(data, console.log("Done!"));
      // } else {
      //   ok = writer.write(data);
      // }
      ok = writer.write(data);
      console.log("w", data);
    } while (ok);
    if (!ok) {
      writer.once('drain', write);
      console.log("d", data);
    }
  }
}

ao.on('error', console.error);

loop(ao, buffer);
ao.start();

process.once('SIGINT', ao.quit);