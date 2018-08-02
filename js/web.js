'use strict'

var audioCtx = new AudioContext();
var buffer = null;
var source = audioCtx.createBufferSource();
var length = 4096;
var scriptNode = audioCtx.createScriptProcessor(length / 2, 2, 2);
var gainNode = audioCtx.createGain();

var analyser = audioCtx.createAnalyser();
analyser.fftSize = 2048;
var bufferLength = analyser.frequencyBinCount;
var frequency = new Uint8Array(bufferLength);

var filter = context.createBiquadFilter();
filter.type = 'lowpass';
filter.frequency.value = 440;

var analyser2 = audioCtx.createAnalyser();
analyser2.fftSize = 2048;
var frequency2 = new Uint8Array(bufferLength);

var input;

var rightInput;
var leftInput;

var buffer = new Uint8Array(length);
var right = new Uint8Array(length);
var left = new Uint8Array(length);


var canvas;
var ctx;

window.onload = () => {

    document.body.onclick = () => {};

    navigator.mediaDevices.getUserMedia({
            audio: true,
            video: false
        })
        .then((stream) => {
            input = audioCtx.createMediaStreamSource(stream);
            input.connect(analyser);
            analyser.connect(scriptNode);
            scriptNode.connect(filter);
            filter.connect(analyser2);

            scriptNode.connect(gainNode);
            gainNode.gain.value = 0.1;
            gainNode.connect(audioCtx.destination);
        });

    scriptNode.onaudioprocess = (event) => {
        // rightInput = event.inputBuffer.getChannelData(0);
        // leftInput = event.inputBuffer.getChannelData(1);
        let a = event.outputBuffer.getChannelData(0);
        // let b = event.outputBuffer.getChannelData(1);
        analyser.getByteFrequencyData(frequency);
        for (var i = 0; i < length; i++) {
            // a[i] = rightInput[i];
            // b[i] = leftInput[i];
            a[i] = frequency[i];
        }
    }

    canvas = document.getElementById("canvas");
    canvas.setAttribute('width', 1000 + 'px');
    canvas.setAttribute('height', 500 + 'px');
    canvas.setAttribute('background-color', 'rgba(0,0,0,0)');
    canvas.width = 1000;
    canvas.height = 500;
    ctx = canvas.getContext("2d");

    setInterval(() => {
        console.log(bufferLength);
        // analyser.getByteFrequencyData(frequency);
        // analyser2.getByteFrequencyData(frequency2);
        // ctx.beginPath();
        // ctx.moveTo(50, 50);
        // ctx.lineTo(100, 100);
        // ctx.stroke();
    }, 1000);

};