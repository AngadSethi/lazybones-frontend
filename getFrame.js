(function() {

  var logged_in_user;

  chrome.runtime.sendMessage({greeting: "hello"}, function(response) {
      logged_in_user = response.info;
  });

    var imageCapture;
    var x = document.createElement('video');
    x.id = "faceTracker";
    x.autoplay = "autoplay";

    document.getElementsByTagName("body")[0].appendChild(x);

    navigator.mediaDevices.getUserMedia({video: true})
    .then(mediaStream => {
      x.srcObject = mediaStream;
      const track = mediaStream.getVideoTracks()[0];
      imageCapture = new ImageCapture(track);
  })
  .catch(error => console.log(error));

  var tracker = new tracking.ObjectTracker(['face']);
  tracking.track('#faceTracker', tracker, { camera: true });
  
  var xhttp = new XMLHttpRequest();
  var current_meet_id = window.location.href.split('/');

  tracker.on('track', function(event) {
    event.data.forEach(function(rect) {
      console.log(rect);
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          console.log("Cool");
        }
      };
      xhttp.open("GET", BACKEND_URLS.facetracker + '?user=' + logged_in_user.email + '&meet_id=' + current_meet_id[current_meet_id.length - 1], true);
      xhttp.send();
    });
  });
})();
