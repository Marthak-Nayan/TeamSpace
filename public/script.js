const socket = io('http://localhost:5000'); // Assumes same domain

const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
myVideo.muted = true;

let myVideoStream;
let peers = {};

const roomId = localStorage.getItem('selectedOrg'); // make sure it's already set

if (!roomId) {
  alert("Room ID not found!");
  throw new Error("Missing room ID.");
}

navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true,
}).then((stream) => {
  myVideoStream = stream;
  addVideoStream(myVideo, stream);

  const peer = new Peer(undefined, {
    host: '/',
    port: location.port || 3000,
    path: '/peerjs',
  });

  peer.on('open', (id) => {
    if (!roomId) {
        console.error("Room ID not found in localStorage");
        return;
    }

    socket.emit('join-room', roomId, id);
  });


  peer.on('call', (call) => {
    call.answer(stream);
    const video = document.createElement('video');
    call.on('stream', (userVideoStream) => {
      addVideoStream(video, userVideoStream);
    });
  });

  socket.on('user-connected', (userId) => {
    connectToNewUser(userId, stream, peer);
  });

  socket.on('user-disconnected', (userId) => {
    if (peers[userId]) peers[userId].close();
  });

  function connectToNewUser(userId, stream, peer) {
    const call = peer.call(userId, stream);
    const video = document.createElement('video');
    call.on('stream', (userVideoStream) => {
      addVideoStream(video, userVideoStream);
    });
    call.on('close', () => {
      video.remove();
    });

    peers[userId] = call;
  }
});

// Video Toggle
document.getElementById('toggle-video').onclick = () => {
  const enabled = myVideoStream.getVideoTracks()[0].enabled;
  myVideoStream.getVideoTracks()[0].enabled = !enabled;
};

// Audio Toggle
document.getElementById('toggle-audio').onclick = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  myVideoStream.getAudioTracks()[0].enabled = !enabled;
};

// End Call
document.getElementById('end-call').onclick = () => {
  socket.disconnect();
  location.href = '/'; // go back to home page or lobby
};

// Add video to grid
function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  });
  videoGrid.appendChild(video);
}

// Get roomId from URL or localStorage
function getRoomId() {
  const params = new URLSearchParams(window.location.search);
  const roomIdFromURL = params.get("roomId");
  if (roomIdFromURL) return roomIdFromURL;

  const roomIdFromStorage = localStorage.getItem("roomId");
  if (roomIdFromStorage) return roomIdFromStorage;

  return null;
}
