var fs = require('fs');
var ws = fs.createWriteStream('rawAudio.raw');
console.log(Object.keys(ws));