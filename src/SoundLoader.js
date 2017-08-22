

var p5sl = {
};

p5sl.setup = (function() {

    this.isLoaded = false;

    this.audioCtx = new(window.AudioContext || window.webkitAudioContext)();
    this.analyser = this.audioCtx.createAnalyser();
    
    navigator.getUserMedia(
        {
            audio : true
        }, 
        (stream) => {
            this.source = this.audioCtx.createMediaStreamSource(stream);
            this.source.connect(this.analyser);
            this.isLoaded = true;
        },
        (err) => {
            console.log(err);
        }
    );

    this.oscillator = this.audioCtx.createOscillator();
    this.gainNode = this.audioCtx.createGain();

    this.oscillator.connect(this.gainNode);
    this.gainNode.connect(this.audioCtx.destination);
    // ...
    
    this.analyser.fftSize = 512;
    this.bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(this.bufferLength);
    this.fft = this.dataArray;


}).bind(p5sl);

p5sl.update = (function() {
    if(this.isLoaded == false) return;
    this.analyser.getByteFrequencyData(this.dataArray);
    this.fft = this.dataArray;
}).bind(p5sl); 

$(document).ready(function () {
    $("#controlers input").attr('disabled', true);
    $("#slider_seek").click(function (evt, arg) {
        var left = evt.offsetX;
        DZ.player.seek((evt.offsetX / $(this).width()) * 100);
    });
});

function event_listener_append() {
    var pre = document.getElementById('event_listener');
    var line = [];
    for (var i = 0; i < arguments.length; i++) {
        line.push(arguments[i]);
    }
    pre.innerHTML += line.join(' ') + "\n";
}

function onPlayerLoaded() {
    // console.log("hi");
    // console.log(document.getElementsByTagName("audio"))

    // $("#controlers input").attr('disabled', false);
    // event_listener_append('player_loaded');

    // DZ.Event.subscribe('current_track', function (arg) {
    //     event_listener_append('current_track', arg.index, arg.track.title, arg.track.album.title);
    // });

    // DZ.Event.subscribe('player_position', function (arg) {
    //     event_listener_append('position', arg[0], arg[1]);
    //     $("#slider_seek").find('.bar').css('width', (100 * arg[0] / arg[1]) + '%');
    // });

    DZ.player.playRadio(1684885986, 'user');
    DZ.player.setVolume(100);
    // console.log(document.getElementsByTagName("audio"));
    // console.log(document.getElementsByTagName("video"));
    // console.log(document.getElementsByTagName("source"));

}
DZ.init({
    appId: '8',
    channelUrl: 'https://developers.deezer.com/examples/channel.php',
    player: {
        container: 'player',
        // playlist: true,
        width: 62 * 4,
        height: 62,
        onload: onPlayerLoaded,
    },
});


export default p5sl;