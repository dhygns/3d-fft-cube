

var p5sl = {
    audio : document.getElementById("audio")
};

p5sl.setup = (function() {

    this.audioCtx = new AudioContext();
    this.source = this.audioCtx.createMediaElementSource(this.audio);

    this.analyser = this.audioCtx.createAnalyser();  
    
    this.analyser.fftSize = 512;

    this.source.connect(this.analyser);
    this.analyser.connect(this.audioCtx.destination);


    this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
    this.fft = this.frequencyData;

}).bind(p5sl);

p5sl.update = (function() {
    if(this.isLoaded == false) return;
    this.analyser.getByteFrequencyData(this.frequencyData);
    this.fft = this.frequencyData;
}).bind(p5sl); 


export default p5sl;