window.onload = function () {

  // Logged in user details  
  var logged_in_user;

  // Starting Times
  var initiateTime = Date.now();

  // OnFocus properties
  window.tabHasFocus = false;
  window.tabChanges = 0;

  // Stream Metrics
  var streamTjs = "";
  var streamMem = [];
  var tjs;
  var iEyeIntervalMs = 250;
	var streamLengthSeconds = 5;
  var itemsInStream = streamLengthSeconds * ( 1000 / iEyeIntervalMs );

  // Camera & Tracker Variables
  window.camera = null;
  var tracker = null;
  var video_set_up = false;

  // Google Meet Details
  var meet_id_fin = null;
  if (location.pathname.search('/') != -1) {
    meet_id_fin = location.pathname.substr(1);
  }

  // Getting User Details
  chrome.runtime.sendMessage({greeting: "hello"}, function(response) {
      logged_in_user = response.info;
  });

  // Create a video element, and start the stream
  function create_video_element() {
    if (document.getElementById('faceTracker') !== null) {
      document.getElementsByTagName("body")[0].removeChild(document.querySelector("#faceTracker"));
    }

    var x = document.createElement('video');
    x.id = "faceTracker";    
    x.autoplay = "autoplay";
    document.getElementsByTagName("body")[0].appendChild(x);    
  }

  // Getting the localStorage camera ID selected
  function get_active_camera() {
    window.camera = JSON.parse(window.localStorage.getItem('mlsds2')).cameras.selectedDevice;
  }

  function set_up_stream() {
    get_active_camera();
    if (!window.camera) {
      return;
    }
    create_video_element();
    navigator.mediaDevices.getUserMedia({
      video: {
        deviceId: window.camera.id
      } 
    })
      .then(mediaStream => {
        video_set_up = true;
        document.querySelector("#faceTracker").srcObject = mediaStream;
        tracker = new tracking.ObjectTracker(['face']);
        tracker.setInitialScale(3.2); 
        tracker.setStepSize(1);
        tracker.setEdgesDensity(0.1);
        tracking.track('#faceTracker', tracker, {camera: true});
      })
      .catch(error => {
        console.log(error);
        video_set_up = false;
      });
  }  

  function collectMetrics() {
    if (tracker === null) {
      return;
    }
    tracker.on('track', function(event) {
      tjs = (event.data.length == 0) ? 0 : 1;
      if (document.visibilityState === 'hidden') {
        tjs = 0;
      }
      if ( streamTjs.length > itemsInStream) 
        streamTjs = streamTjs.substr(0, itemsInStream);
    });
		if (Date.now() > initiateTime + 5000) {
      streamTjs = tjs + streamTjs;
    }
  }

  function calculateScore() {
    var i, score=0;
    
		for (i=0; i<streamTjs.length; i++) {
			score = Math.round( (score + parseInt(streamTjs[i])*(itemsInStream-1-i)/(itemsInStream-1)) *100)/100;
    }
    score = Math.max(score, 0);
    console.log(Date.now(), score);	
		return score;
  }
  
  function sendData() {   
    if (meet_id_fin === null || logged_in_user.email === null) {
      return;
    } 
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
      }
    };
    xhttp.open("GET", BACKEND_URLS.facetracker + '?email=' + logged_in_user.email + '&score=' + calculateScore() + '&number_of_changes=' + window.tabChanges + '&visible=' + window.tabHasFocus + '&meet_id=' + meet_id_fin, true);
    xhttp.send();
  }

  set_up_stream();
  setInterval(collectMetrics, iEyeIntervalMs); 
  setInterval(sendData, 10000);

  document.addEventListener("visibilitychange", function (e) {
    window.tabChanges += 1;
    window.tabHasFocus = document.visibilityState;
  });
}

