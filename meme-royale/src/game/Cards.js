import { clamp, randomOf } from '../utils/helpers.js';

// Each card can implement an apply function that receives a payload of the battle state
// and returns a list of UI events for the renderer.

export const Status = {
  Shield: 'shield',
  Burn: 'burn',
  Regen: 'regen',
  Stun: 'stun'
};

export const ALL_CARDS = [
  { id:'rick', name:'Rickroll Attack', type:'damage', dmg:15, cooldown:2, thumb:'🎵', desc:'Classic bait and blast.' },
  { id:'cat', name:'Distract with Cat', type:'damage', dmg:10, cooldown:1, thumb:'😺', desc:'Cuteness overload distracts CPU.' },
  { id:'vine', name:'Vine Boom Slam', type:'damage', dmg:22, cooldown:3, thumb:'💥', desc:'Earth-shaking boom.' },
  { id:'shrek', name:'Shrek Smash', type:'damage', dmg:18, cooldown:2, thumb:'🟩', desc:'Layers of damage.' },
  { id:'jordan', name:'Crying Jordan', type:'heal', heal:16, cooldown:3, thumb:'😭', desc:'Emotional recovery.' },
  { id:'mb', name:'Explosion Michael Bay', type:'damage', dmg:26, cooldown:4, thumb:'🔥', desc:'Bayhem ensues.' },
  { id:'shield', name:'Doge Shield', type:'status', effect:Status.Shield, duration:2, cooldown:4, thumb:'🛡️', desc:'Block next big hit.' },
  { id:'burn', name:'Spicy Meme', type:'status', effect:Status.Burn, duration:3, cooldown:4, thumb:'🌶️', desc:'Apply burn DoT.' },
  { id:'regen', name:'Wholesome Vibes', type:'status', effect:Status.Regen, duration:3, cooldown:4, thumb:'✨', desc:'Regenerate HP over time.' },
  { id:'stun', name:'Mind Blown', type:'status', effect:Status.Stun, duration:1, cooldown:5, thumb:'🤯', desc:'Stun for a turn.' },
];

export function describeCard(card){
  if(card.type === 'damage') return `Damage: ${card.dmg}`;
  if(card.type === 'heal') return `Heal: ${card.heal}`;
  if(card.type === 'status'){
    switch(card.effect){
      case Status.Shield: return 'Gain Shield';
      case Status.Burn: return 'Inflict Burn';
      case Status.Regen: return 'Gain Regen';
      case Status.Stun: return 'Inflict Stun';
    }
  }
  return '';
}

export function applyCardEffects({ actor, target, card, rng = Math.random }){
  const events = [];

  const pushFloat = (x, y, text, cls) => events.push({ type:'float', x, y, text, cls });
  const pushMeme = (text, helper) => events.push({ type:'meme', text, helper });
  const sfx = (name) => events.push({ type:'sfx', name });
  const shake = (intensity=1) => events.push({ type:'shake', intensity });

  if(card.type === 'damage'){
    pushMeme(card.thumb, card.name);
    const critChance = 0.12;
    const isCrit = rng() < critChance;
    const comboMultiplier = 1 + Math.min(actor.comboCount * 0.05, 0.25);
    let dmg = card.dmg * comboMultiplier * (isCrit ? 1.5 : 1);

    // Shield reduces damage
    if(target.status.shield){
      const reduction = target.status.shield > 0 ? 0.5 : 0;
      dmg = Math.round(dmg * (1 - reduction));
      if(reduction > 0) pushFloat(200, 80, 'Shield -50%', 'small');
    }

    dmg = Math.round(dmg);
    target.hp = clamp(target.hp - dmg, 0, target.max);

    sfx(dmg >= 20 ? 'bigHit' : 'hit');
    if(dmg >= 20) shake(1);

    actor.comboCount += 1;

    pushFloat(200, 80, `-${dmg} HP`);
  }

  if(card.type === 'heal'){
    pushMeme(card.thumb, card.name);
    const amount = card.heal;
    actor.hp = clamp(actor.hp + amount, 0, actor.max);
    sfx('heal');
    pushFloat(80, 80, `+${amount} HP`);
    actor.comboCount = 0;
  }

  if(card.type === 'status'){
    pushMeme(card.thumb, card.name);
    switch(card.effect){
      case Status.Shield:
        actor.status.shield = Math.max(actor.status.shield, card.duration);
        pushFloat(110, 60, 'Shield', 'badge positive');
        break;
      case Status.Burn:
        target.status.burn = Math.max(target.status.burn, card.duration);
        pushFloat(200, 60, 'Burn', 'badge negative');
        break;
      case Status.Regen:
        actor.status.regen = Math.max(actor.status.regen, card.duration);
        pushFloat(110, 60, 'Regen', 'badge positive');
        break;
      case Status.Stun:
        target.status.stun = Math.max(target.status.stun, card.duration);
        pushFloat(200, 60, 'Stun', 'badge negative');
        break;
    }
    sfx('heal');
    actor.comboCount = 0;
  }

  return events;
}