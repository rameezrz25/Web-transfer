

var mediaStream; 
var audioStream; 
var recordedChunks = [];
var numrecordedChunks = 0;
var recorder;
var includeMic = false;
var includeSysAudio = false;


document.querySelector('#recCamera').addEventListener('click', recordCamera);
document.querySelector('#recStop').addEventListener('click', stopRecording);
document.querySelector('#playButton').addEventListener('click', play);
document.querySelector('#downloadButton').addEventListener('click', downloads);


function recordCamera(stream) {

  recordedChunks = [];
  numrecordedChunks = 0;
  
  navigator.getUserMedia({
      audio:true,
      video: { width:900,
                            height:1000 } 
  }, gotMediaStream, getUserMediaError);
};

function recorderOnDataAvailable(event) {
 if (event.data && event.data.size > 0) {
    recordedChunks.push(event.data);
    numrecordedChunks += event.data.byteLength;
  }

}

function stopStreamsAndPlaybackData() {
  console.log('Stopping record and starting playback');
  recorder.stop();
  localStream.getVideoTracks()[0].stop();
 
  var superBuffer = new Blob(recordedChunks);
  document.getElementById("video").src = window.URL.createObjectURL(superBuffer);
}


function stopRecording() {
  console.log('Stopping record and starting download');
  document.querySelector('#recCamera').disabled=false;
  document.querySelector('#recStop').style.visibility="hidden";
  document.querySelector('#playButton').style.visibility="visible";
  document.querySelector('#downloadButton').style.visibility="visible";
  recorder.stop();
  localStream.getVideoTracks()[0].stop();
  localStream.getAudioTracks()[0].enabled=false;

}

function play() {
  var video = document.querySelector("video");
  var blob = new Blob(recordedChunks, {type: "video/mp4"});
  video.src = window.URL.createObjectURL(blob);

}

function downloads() {
  console.log('Downloading file');
  var blob = new Blob(recordedChunks, {type: "video/mp4"});
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  document.body.appendChild(a);
  a.style = "display: none";
  a.href = url;
  a.download = "test.mp4";
  a.click();
  setTimeout(function() {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 100);

}


function recorderOnStop() {
  console.log('recorderOnStop fired');
}

function gotMediaStream(stream) {

  console.log("Received local stream");
  var video = document.querySelector("video");
  video.srcObject = stream;
  localStream = stream;
  stream.getTracks().forEach(function(track) {
    track.addEventListener('ended', function() {
      console.log(stream.id, 'track ended', track.kind, track.id);
      includeMic=false;
      stopRecording();
    });
  });


  
  startTime = window.performance.now();
  var videoTracks = localStream.getVideoTracks();

  console.log('Checking audio')
  
  if(includeMic){
    console.log('Adding audio track')
    var audioTracks = audioStream.getAudioTracks();
    localStream.addTrack(audioTracks[0]);
  }
  
  if (videoTracks.length > 0) {
    
  }


  try {
    console.log("Trying");
    recorder = new MediaRecorder(stream);
  } catch (e) {
    console.assert(false, 'Exception while creating MediaRecorder: ' + e);
    return;
  }
  console.assert(recorder.state == "inactive");
  recorder.ondataavailable = recorderOnDataAvailable;
  recorder.onstop = recorderOnStop;
  recorder.start();
  console.log("Recorder is started");
  console.assert(recorder.state == "recording");
  //greyOutButtons();
  document.querySelector('#recCamera').disabled=true;
  document.querySelector('#recStop').style.visibility="visible";
};

function gotAudio(stream) {
  console.log("Received audio stream");
  audioStream = stream;
  stream.getTracks().forEach(function(track) {
    track.addEventListener('ended', function() {
      console.log(stream.id, 'track ended', track.kind, track.id);
    });
  });

};

function getUserMediaError() {
  console.log("getUserMedia() failed");
};


function onAccessApproved(id) {
  window.resizeTo(500, 320);
  if (!id) {
    console.log("Access rejected.");
    return;
  }
  console.log('Window ID: ', id);

  navigator.getUserMedia({
      audio:{ mandatory: { chromeMediaSource: "desktop",
                            chromeMediaSourceId: id } },
      video: { mandatory: { chromeMediaSource: "desktop",
                            chromeMediaSourceId: id,
                            maxWidth:window.screen.width,
                            maxHeight:window.screen.height } }
  }, gotMediaStream, getUserMediaError);

}