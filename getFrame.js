window.onload = function () {
  
  var logged_in_user;
  var initiateTime = Date.now();
  var streamTjs = "";
  var streamMem = [];
  var tjs;
	var iEyeIntervalMs = 250;
	var initiateTime;
	var streamLengthSeconds = 5;
  var itemsInStream = streamLengthSeconds * ( 1000/iEyeIntervalMs );
  var tracker;
  var tjsThresholdDefocus = 2.6;  
  var attention = false;
  var meet_id = window.location.href.split('/');
  var meet_id_fin = meet_id[meet_id.length - 1];
  if (meet_id_fin.search('-') == -1) {
    meet_id_fin = null;
  }
  chrome.runtime.sendMessage({greeting: "hello"}, function(response) {
      logged_in_user = response.info;
  });

  function main_function() {
    if (document.getElementById('faceTracker') !== null) {
      document.getElementsByTagName("body")[0].removeChild(document.querySelector("#faceTracker"));
    }

    var x = document.createElement('video');
    x.id = "faceTracker";    
    x.autoplay = "autoplay";
    document.getElementsByTagName("body")[0].appendChild(x);
    
    navigator.mediaDevices.getUserMedia({video: true})
      .then(mediaStream => {
        document.querySelector("#faceTracker").srcObject = mediaStream;
    }).catch(error => console.log(error));

    
    tracker = new tracking.ObjectTracker(['face']);
    tracker.setInitialScale(3.2); 
		tracker.setStepSize(1);
		tracker.setEdgesDensity(0.1);
    tracking.track('#faceTracker', tracker, {camera: true});
  }  

  function collectMetrics() {

    tracker.on('track', function(event) {
      tjs = (event.data.length == 0) ? 0 : 1;
      if ( streamTjs.length > itemsInStream) streamTjs = streamTjs.substr(0, itemsInStream);
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
			
    attention = (score > tjsThresholdDefocus);
    console.log(attention);
		
		return score;
  }
  
  function sendData() {    
    var xhttp = new XMLHttpRequest();
    var current_meet_id = window.location.href.split('/');
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        console.log(this.responseText);
      }
    };
    xhttp.open("GET", BACKEND_URLS.facetracker + '?user=' + logged_in_user.email + '&attentive=' + attention + '&meet-id=' + meet_id_fin, true);
    xhttp.send();
  }

  main_function();
  setInterval(collectMetrics, 250);
  setInterval(calculateScore, 1000);
  setInterval(sendData, 10000);
}

