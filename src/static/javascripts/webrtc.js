'use strict';

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
window.AudioContext = window.AudioContext || window.webkitAudioContext;

$(function() {

    var constraints = {audio: true, video: true};
    var video = document.querySelector('video');

    function successCallback(stream) {
        window.stream = stream; // stream available to console
        if (window.URL) {
            video.src = window.URL.createObjectURL(stream);
        } else {
            video.src = stream;
        }

        video.play();

        var audioContext = new AudioContext();

        // Create an AudioNode from the stream
        var mediaStreamSource = audioContext.createMediaStreamSource(stream);

        // Connect it to destination to hear yourself
        // or any other node for processing!
        mediaStreamSource.connect(audioContext.destination);
    }

    function errorCallback(error) {
        console.log('navigator.getUserMedia error: ', error);
    }

    navigator.getUserMedia(constraints, successCallback, errorCallback);
});
