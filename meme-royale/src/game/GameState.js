import { clamp, loadFromStorage, saveToStorage, randomOf } from '../utils/helpers.js';
import { ALL_CARDS, applyCardEffects, Status } from './Cards.js';

export class GameState{
  constructor(){
    this.player = this.createFighter('player');
    this.cpu = this.createFighter('cpu');
    this.turn = 1;
    this.currentActor = 'player';
    this.cardCooldown = 3; // default, can be overridden per-card
    this.cooldowns = {}; // id -> nextAvailableTurn
    this.deck = []; // selected cards
    this.settings = loadFromStorage('mr_settings', {
      difficulty: 1, // 0 easy, 1 normal, 2 hard
      sound: true,
      autoplay: false
    });
    this.stats = loadFromStorage('mr_stats', {
      games: 0,
      wins: 0,
      streak: 0,
      bestTurnWin: null
    });
    this.achievements = loadFromStorage('mr_achievements', {});
  }

  createFighter(kind){
    const baseMax = 100;
    const dif = loadFromStorage('mr_settings', { difficulty: 1 }).difficulty;
    const cpuBonus = dif === 2 ? 20 : dif === 0 ? -10 : 0;
    const max = kind === 'cpu' ? baseMax + cpuBonus : baseMax;
    return {
      kind,
      hp: max,
      max,
      comboCount: 0,
      status: { burn:0, regen:0, shield:0, stun:0 }
    };
  }

  setDeck(cardIds){
    this.deck = ALL_CARDS.filter(c => cardIds.includes(c.id));
    this.resetCooldowns();
  }

  resetCooldowns(){
    this.cooldowns = {};
    for(const c of this.deck){
      this.cooldowns[c.id] = 0;
    }
  }

  canUse(cardId){
    const nextAt = this.cooldowns[cardId] || 0;
    return this.turn >= nextAt && this.currentActor === 'player' && this.player.status.stun <= 0;
  }

  isGameOver(){
    return this.player.hp <= 0 || this.cpu.hp <= 0;
  }

  tickStatuses(){
    const applyTick = (unit) => {
      // Regen
      if(unit.status.regen > 0){
        const regenAmt = 5;
        unit.hp = clamp(unit.hp + regenAmt, 0, unit.max);
        unit._tickEvents = unit._tickEvents || [];
        unit._tickEvents.push({ type:'float', x: unit.kind==='player'?80:220, y: 60, text:`+${regenAmt}`, cls:'badge positive' });
        unit.status.regen -= 1;
      }
      // Burn
      if(unit.status.burn > 0){
        const burnAmt = 6;
        unit.hp = clamp(unit.hp - burnAmt, 0, unit.max);
        unit._tickEvents = unit._tickEvents || [];
        unit._tickEvents.push({ type:'float', x: unit.kind==='player'?80:220, y: 90, text:`-${burnAmt}`, cls:'badge negative' });
        unit.status.burn -= 1;
      }
      // Shield decays at end of round
      if(unit.status.shield > 0){
        unit.status.shield -= 1;
      }
      // Stun decays at end of your turn
      if(unit.status.stun > 0){
        unit.status.stun -= 1;
      }
      // reset if negative
      for(const k of Object.keys(unit.status)){
        if(unit.status[k] < 0) unit.status[k] = 0;
      }
    };

    applyTick(this.player);
    applyTick(this.cpu);
  }

  useCard(cardId, rng = Math.random){
    const actor = this.currentActor === 'player' ? this.player : this.cpu;
    const target = this.currentActor === 'player' ? this.cpu : this.player;
    const card = this.deck.find(c => c.id === cardId) || ALL_CARDS.find(c => c.id === cardId);
    if(!card) return { events: [] };

    // cooldown
    const nextAvailableTurn = (this.cooldowns[cardId] || 0);
    if(this.turn < nextAvailableTurn) return { events: [] };

    this.cooldowns[cardId] = this.turn + (card.cooldown ?? this.cardCooldown);

    const events = applyCardEffects({ actor, target, card, rng });

    // victory check will be done by caller
    return { events };
  }

  endActorStep(){
    const actor = this.currentActor === 'player' ? this.player : this.cpu;
    const target = this.currentActor === 'player' ? this.cpu : this.player;

    // If target died, no further actions
    if(this.isGameOver()) return [];

    // If actor was CPU, end of round -> apply status ticks
    const wasCpu = this.currentActor === 'cpu';

    let tickEvents = [];
    if(wasCpu){
      this.tickStatuses();
      if(this.player._tickEvents){ tickEvents = tickEvents.concat(this.player._tickEvents); this.player._tickEvents = null; }
      if(this.cpu._tickEvents){ tickEvents = tickEvents.concat(this.cpu._tickEvents); this.cpu._tickEvents = null; }
    }

    // Switch actor or advance turn
    if(this.currentActor === 'player'){
      this.currentActor = 'cpu';
    } else {
      this.turn += 1;
      this.currentActor = 'player';
      // decay combo each round slightly
      this.player.comboCount = Math.max(0, this.player.comboCount - 1);
      this.cpu.comboCount = Math.max(0, this.cpu.comboCount - 1);
    }

    return tickEvents;
  }

  checkVictory(){
    if(this.player.hp <= 0) return 'lose';
    if(this.cpu.hp <= 0) return 'win';
    return null;
  }

  reset(full = false){
    if(full){
      this.player = this.createFighter('player');
      this.cpu = this.createFighter('cpu');
    } else {
      this.player.hp = this.player.max;
      this.player.status = { burn:0, regen:0, shield:0, stun:0 };
      this.cpu.hp = this.cpu.max;
      this.cpu.status = { burn:0, regen:0, shield:0, stun:0 };
    }
    this.turn = 1;
    this.currentActor = 'player';
    this.resetCooldowns();
  }

  persist(){
    saveToStorage('mr_settings', this.settings);
    saveToStorage('mr_stats', this.stats);
    saveToStorage('mr_achievements', this.achievements);
  }
}