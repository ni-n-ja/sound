/* Copyright 2017 Streampunk Media Ltd.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

// Plays a since wave for approx 10 seconds

const portAudio = require('naudiodon');

var length = 0;
var tBuffer = '';

// create a sine wave lookup table
var sampleRate = 44100;
var tableSize = 400;

var buffer = Buffer.allocUnsafe(tableSize * 4 * 2);
for (var i = 0; i < tableSize * 4 * 2; i += 2) {
  buffer[i] = (Math.sin((i / tableSize) * 3.1415 * 2.0) * 12);
  buffer[i + 1] = (Math.sin((i / tableSize) * 3.1415) * 12);
}

setInterval(() => {
  let b = Math.floor(Math.random() * length);
  console.log(length, buffer[b], b, tBuffer);
}, 1000);

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

ao = new portAudio.AudioOutput({
  channelCount: 2,
  sampleFormat: portAudio.SampleFormat8Bit,
  sampleRate: 44100,
  deviceId: outDeviceId
});

function tenSecondsIsh(writer, data, callback) {
  var i = 552;
  write();

  function write() {
    var ok = true;
    do {
      i -= 1;
      if (i === 0) {
        writer.end(data, callback);
      } else {
        ok = writer.write(data);
      }
    } while (i > 0 && ok);
    if (i > 0) {
      writer.once('drain', write);
    }
  }
}

ao.on('error', console.error);

tenSecondsIsh(ao, buffer, console.log.bind(null, "Done!"));
ao.start();

process.once('SIGINT', ao.quit);