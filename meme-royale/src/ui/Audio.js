export class AudioManager{
  constructor(enabled=true){
    this.enabled = enabled;
    this.ctx = null;
    try{
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if(Ctx) this.ctx = new Ctx();
    }catch(e){ this.ctx = null; }
    this.bgOsc = null;
  }

  setEnabled(on){
    this.enabled = on;
  }

  ensure(){
    if(!this.ctx) return;
    if(this.ctx.state === 'suspended'){
      try{ this.ctx.resume(); }catch(e){}
    }
  }

  playTone(freq=440, dur=0.12, type='sine', gain=0.6){
    if(!this.enabled || !this.ctx) return;
    try{
      const g = this.ctx.createGain(); g.gain.value = gain;
      const o = this.ctx.createOscillator(); o.type = type; o.frequency.value = freq;
      o.connect(g); g.connect(this.ctx.destination);
      o.start(); o.stop(this.ctx.currentTime + dur);
    }catch(e){ /* ignore */ }
  }

  sfx(name){
    switch(name){
      case 'hit': this.playTone(260,0.1,'square',0.8); break;
      case 'bigHit': this.playTone(120,0.22,'sawtooth',0.9); break;
      case 'heal': this.playTone(880,0.18,'sine',0.7); break;
    }
  }

  startBG(){
    if(!this.enabled || !this.ctx || this.bgOsc) return;
    try{
      this.bgOsc = this.ctx.createOscillator(); const g = this.ctx.createGain(); g.gain.value = 0.02; this.bgOsc.type='sine'; this.bgOsc.frequency.value=120; this.bgOsc.connect(g); g.connect(this.ctx.destination); this.bgOsc.start();
    }catch(e){ this.bgOsc = null; }
  }

  stopBG(){
    try{ if(this.bgOsc){ this.bgOsc.stop(); this.bgOsc = null; } }catch(e){}
  }
}