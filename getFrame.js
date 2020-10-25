window.onload = function () {
  var logged_in_user;
  
  chrome.runtime.sendMessage({greeting: "hello"}, function(response) {
      logged_in_user = response.info;
  });

  function main_function() {
    var imageCapture;
    if (document.getElementById('faceTracker') !== null) {
      document.getElementsByTagName("body")[0].removeChild(document.getElementsByTagName("video")[0]);
    }

    var x = document.createElement('video');
    x.id = "faceTracker";    
    x.autoplay = "autoplay";
    document.getElementsByTagName("body")[0].appendChild(x);
    
    navigator.mediaDevices.getUserMedia({video: true})
      .then(mediaStream => {
        const track = mediaStream.getVideoTracks()[0];
        document.getElementsByTagName('video')[0].srcObject = mediaStream;
    }).catch(error => console.log(error));
  }  
  
  function sendData() {  
    var tracker = new tracking.ObjectTracker(['face']);
    tracking.track('#faceTracker', tracker, {camera: true});
    
    var xhttp = new XMLHttpRequest();
    var current_meet_id = window.location.href.split('/');
  
    tracker.on('track', function(event) {
      event.data.forEach(function(rect) {
        xhttp.onreadystatechange = function() {
          if (this.readyState == 4 && this.status == 200) {
            console.log(this.responseText);
          }
        };
        xhttp.open("GET", BACKEND_URLS.facetracker + '?user=' + logged_in_user.email + '&meet_id=' + current_meet_id[current_meet_id.length - 1], true);
        xhttp.send();
      });
    });
  }
  main_function();
  setInterval(sendData, 10000);
}

