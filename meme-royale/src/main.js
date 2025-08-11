import { GameState } from './game/GameState.js';
import { ALL_CARDS } from './game/Cards.js';
import { chooseCpuCard } from './game/AI.js';
import { Renderer } from './ui/Renderer.js';
import { AudioManager } from './ui/Audio.js';
import { buildDeckBuilder, buildOutcome, buildSettings } from './ui/Overlay.js';

const state = new GameState();
const audio = new AudioManager(state.settings.sound);
const ui = new Renderer(audio);

function randomQuote(){
  const DB = [
    'Top tier cringe. 10/10 would meme again.',
    'They were not prepared for the meme-geddon.',
    'When you hit with the perfect GIF — chef\'s kiss.',
    'This is fine. This is meme.',
    'You unlocked Legendary LULZ.'
  ];
  return DB[Math.floor(Math.random()*DB.length)];
}

function mountGame(){
  ui.init();
  ui.onRestart(()=>restart(true));
  ui.onSettings(()=>openSettings());
  ui.onFirstPointer(()=>{ audio.ensure(); if(state.settings.sound) audio.startBG(); });
  ui.setAutoplayChecked(state.settings.autoplay);

  // First-time: show deck builder if deck empty
  if(state.deck.length === 0){
    openDeckBuilder();
  } else {
    startBattle();
  }
}

function openDeckBuilder(){
  const { unmount } = buildDeckBuilder({
    root: document.getElementById('overlayRoot'),
    initialSelectedIds: state.deck.map(c=>c.id),
    onConfirm: (ids)=>{
      if(ids.length < 4) return; // need at least 4
      state.setDeck(ids);
      state.persist();
      unmount();
      startBattle();
    }
  });
}

function openSettings(){
  const { unmount } = buildSettings({
    root: document.getElementById('overlayRoot'),
    settings: state.settings,
    onUpdate: (next)=>{
      state.settings = { ...state.settings, ...next };
      state.persist();
      if('sound' in next){ audio.setEnabled(state.settings.sound); if(state.settings.sound) audio.startBG(); else audio.stopBG(); }
      if('autoplay' in next){ ui.setAutoplayChecked(state.settings.autoplay); if(state.settings.autoplay && state.currentActor==='player'){ setTimeout(cpuTurn, 650); } }
    },
    onClose: ()=>{ unmount(); }
  });
}

function startBattle(){
  ui.buildCards(state.deck, { isDisabled: (card)=>{
    const nextAt = state.cooldowns[card.id] || 0;
    const blocked = state.turn < nextAt || state.currentActor !== 'player' || state.player.status.stun>0;
    return blocked;
  }, onClick: (card)=> playerUse(card.id) });

  renderAll();
}

function renderAll(){
  ui.renderHP(state.player, state.cpu);
  ui.setTurn(state.turn);
  // update cooldown texts
  for(const c of state.deck){
    const remaining = Math.max(0, (state.cooldowns[c.id]||0) - state.turn);
    ui.setCardCooldown(c.id, remaining);
  }
}

function dispatchEvents(events){
  for(const ev of events){
    if(ev.type === 'float') ui.floatingText(ev.x, ev.y, ev.text, ev.cls);
    if(ev.type === 'meme') ui.showMeme(ev.text, ev.helper);
    if(ev.type === 'sfx') audio.sfx(ev.name);
    if(ev.type === 'shake') ui.shake(ev.intensity);
  }
}

function playerUse(cardId){
  if(state.isGameOver()) return;
  if(state.currentActor !== 'player') return;
  const { events } = state.useCard(cardId);
  dispatchEvents(events);
  renderAll();

  // Victory?
  const v = state.checkVictory();
  if(v){ return showOutcome(v); }

  // End step and then CPU turn
  const tickEvents = state.endActorStep();
  dispatchEvents(tickEvents);
  renderAll();

  if(state.currentActor === 'cpu') setTimeout(cpuTurn, 680);
}

function cpuTurn(){
  if(state.isGameOver()) return;
  if(state.currentActor !== 'cpu') return;
  if(state.player.status.stun > 0){
    // Player stunned was applied before; CPU still moves
  }
  const pick = chooseCpuCard(state);
  if(!pick){
    // skip
  } else {
    const { events } = state.useCard(pick.id);
    dispatchEvents(events);
    renderAll();
    const v = state.checkVictory();
    if(v){ return showOutcome(v); }
  }

  const tickEvents = state.endActorStep();
  dispatchEvents(tickEvents);
  renderAll();

  if(state.settings.autoplay && state.currentActor === 'player'){
    // CPU vs CPU mode: let CPU act as player too
    setTimeout(()=>{
      const fakePick = chooseCpuCard(state);
      if(fakePick){ playerUse(fakePick.id); }
      else { // advance turn if nothing
        const t2 = state.endActorStep(); dispatchEvents(t2); renderAll(); if(state.currentActor==='cpu') setTimeout(cpuTurn, 680);
      }
    }, 700);
  }
}

function showOutcome(result){
  audio.stopBG();
  const quote = result === 'win' ? randomQuote() : 'Good try — memeing takes practice.';
  const { unmount } = buildOutcome({
    root: document.getElementById('overlayRoot'),
    result,
    quote,
    onAgain: ()=>{ unmount(); restart(false); }
  });
}

function restart(full){
  state.reset(full);
  ui.showMeme('🔥','Ready to Meme!');
  audio.ensure(); if(state.settings.sound) audio.startBG();
  renderAll();
  if(state.settings.autoplay && state.currentActor==='player') setTimeout(cpuTurn, 700);
}

window.addEventListener('DOMContentLoaded', mountGame);

// expose for console debug
window._MemeRoyale = { state };