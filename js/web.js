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

var filter = audioCtx.createBiquadFilter();
filter.type = 'lowpass';
filter.frequency.value = 1000;

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
            // analyser.connect(gainNode);
            scriptNode.connect(filter);
            filter.connect(gainNode);
            gainNode.gain.value = 0.6;
            gainNode.connect(audioCtx.destination);
        });

    scriptNode.onaudioprocess = (event) => {
        let output = event.outputBuffer;
        let input = event.inputBuffer;
        rightOutput = output.getChannelData(0);
        leftOutput = output.getChannelData(1);
        rightInput = input.getChannelData(0);
        leftInput = input.getChannelData(1);
        for (var i = 0; i < 2048; i++) {
            let pos = Math.floor(i * 0.6);
            rightOutput[i] = rightInput[pos] - Math.pow((rightInput[pos] * (Math.random() - 0.5) % 0.5), 3) + (rightInput[Math.floor(pos * 0.9)]);
            leftOutput[i] = leftInput[pos] - Math.pow((leftInput[pos] * (Math.random() - 0.5) % 0.5), 3) + (leftInput[Math.floor(pos * 0.9)]);
            // rightOutput[i] = rightInput[pos] - Math.pow((rightInput[pos] * (Math.random() - 0.5) % 0.5), 3) + (rightInput[Math.floor(pos * 1 * (Math.random() * 0.1))] * (Math.random() * 1)) % 1;
            // leftOutput[i] = leftInput[pos] - Math.pow((leftInput[pos] * (Math.random() - 0.5) % 0.5), 3) + (leftInput[Math.floor(pos * 1 * (Math.random() * 0.1))] * (Math.random() * 1)) % 1;
        }
    }

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