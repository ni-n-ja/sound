const portAudio = require('naudiodon');

var child_process = require("child_process");
var child = child_process.fork("./x");

var ai;
var devices = portAudio.getDevices();

devices.forEach((device) => {
  if (device.name.includes('NETDUETTO') && device.maxInputChannels == 2) {

    ai = new portAudio.AudioInput({
      channelCount: 2,
      sampleFormat: portAudio.SampleFormat32Bit,
      sampleRate: 44100,
      deviceId: device.id
    });

    ai.on('error', err => console.error);

    process.once('SIGINT', () => {
      ai.quit();
    });

    ai.on('data', data => {
      child.send({
        message: data
      });
    });

    ai.start();

  }
});