'use strict'

var audioCtx = new AudioContext();
var buffer = null;
var source = audioCtx.createBufferSource();
var length = 4096;
var gainNode = audioCtx.createGain();

var analyser = audioCtx.createAnalyser();
analyser.fftSize = 2048;
var bufferLength = analyser.frequencyBinCount;
var frequency = new Uint8Array(bufferLength);

var filter = audioCtx.createBiquadFilter();
filter.type = 'lowpass';
filter.frequency.value = 1600;

var input;

var rightInput;
var leftInput;

var rightOutput;
var leftOutput;

var buffer = new Uint8Array(length);
var right = new Uint8Array(length);
var left = new Uint8Array(length);


var canvas;
var ctx;

var id = null;

window.onload = () => {


    navigator.mediaDevices.enumerateDevices().then(function (devices) {
        devices.forEach(function (device) {
            if (device.kind == "audioinput" && device.label.includes("NETDUETTO")) {
                console.log(device.kind + ": " + device.label + " id = " + device.deviceId);
                id = device.deviceId;
                navigator.mediaDevices.getUserMedia({
                        audio: {
                            deviceId: id
                        },
                        video: false
                    })
                    .then((stream) => {
                        input = audioCtx.createMediaStreamSource(stream);
                        input.connect(analyser);
                        input.connect(gainNode);
                        gainNode.gain.value = 0.6;
                        gainNode.connect(audioCtx.destination);
                    });
            }
        });
    });

    document.body.onclick = () => {};

    canvas = document.getElementById("canvas");
    canvas.setAttribute('width', 1000 + 'px');
    canvas.setAttribute('height', 500 + 'px');
    canvas.setAttribute('background-color', 'rgba(0,0,0,0)');
    canvas.width = 1000;
    canvas.height = 500;
    ctx = canvas.getContext("2d");


    var anime = () => {
        ctx.clearRect(0, 0, 1000, 500);
        // analyser.getByteFrequencyData(frequency);
        analyser.getByteTimeDomainData(frequency);

        ctx.strokeStyle = "rgba(255,0,0,0.5)";
        for (let i = 0; i < bufferLength; i++) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, frequency[i] - 20);
            ctx.stroke();
        }


        requestAnimationFrame(anime);
    };

    anime();

};