(function() {
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

  tracker.on('track', function(event) {
    if (event.data.length == 0) {
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          console.log(this.responseText);
        }
      };
      xhttp.open("GET", BACKEND_URLS.facetracker, true);
      xhttp.send();
    }
  });
})();
