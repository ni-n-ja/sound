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
filter.frequency.value = 20;

var analyser2 = audioCtx.createAnalyser();
analyser2.fftSize = 2048;
var frequency2 = new Uint8Array(bufferLength);

var scriptNode2 = audioCtx.createScriptProcessor(length / 2, 2, 2);

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
            analyser2.connect(scriptNode2);
            scriptNode2.connect(gainNode);
            gainNode.gain.value = 0.1;
            gainNode.connect(audioCtx.destination);
        });

    scriptNode.onaudioprocess = (event) => {
        let a = event.outputBuffer.getChannelData(0);
        let b = event.outputBuffer.getChannelData(1);
        let outBufferLength = b.length;
        analyser.getByteFrequencyData(frequency);
        for (var i = 0; i < outBufferLength; i++) {
            a[i] = frequency[i % bufferLength];
            b[i] = frequency[i % bufferLength];
        }
    }

    scriptNode2.onaudioprocess = (event) => {
        let a = event.outputBuffer.getChannelData(0);
        let b = event.outputBuffer.getChannelData(1);
        let outBufferLength = b.length;
        analyser2.getByteFrequencyData(frequency2);
        for (var i = 0; i < outBufferLength; i++) {
            a[i] = Math.log10(frequency2[i % bufferLength]);
            b[i] = Math.log10(frequency2[i % bufferLength]);
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
        analyser.getByteFrequencyData(frequency);
        analyser2.getByteFrequencyData(frequency2);

        ctx.strokeStyle = "rgba(255,0,0,0.5)";
        for (let i = 0; i < bufferLength; i++) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, frequency[i]);
            ctx.stroke();
        }

        ctx.strokeStyle = "rgba(0,0,255,1)";
        for (let i = 1; i <= bufferLength; i++) {
            ctx.beginPath();
            ctx.moveTo(i, frequency2[i - 1]);
            ctx.lineTo(i, frequency2[i]);
            ctx.stroke();
        }
        requestAnimationFrame(anime);
    };

    anime();

};