import { ALL_CARDS } from './Cards.js';

export function chooseCpuCard(state){
  // Build list of usable cards. CPU can use any from player's deck for parity; fallback to ALL
  const pool = (state.deck.length ? state.deck : ALL_CARDS).filter(c => (state.cooldowns[c.id]||0) <= state.turn);
  if(pool.length === 0) return null;

  const dif = state.settings.difficulty; // 0 easy, 1 normal, 2 hard

  // If low hp, prioritize heals or regen/shield
  const cpu = state.cpu;
  const player = state.player;
  const needHeal = cpu.hp < (dif === 2 ? 55 : 35);

  if(needHeal){
    const heals = pool.filter(c => c.type === 'heal' || (c.type==='status' && (c.effect==='regen' || c.effect==='shield')));
    if(heals.length){
      // pick the most impactful by heuristic
      heals.sort((a,b)=> (b.heal||0)+(b.duration||0)*5 - ((a.heal||0)+(a.duration||0)*5));
      return heals[0];
    }
  }

  // If player is close to defeat, prefer big damage
  const killShots = pool.filter(c => c.type==='damage' && c.dmg >= player.hp);
  if(killShots.length) return killShots[0];

  // Prefer status if player lacks it
  const statuses = pool.filter(c => c.type==='status');
  if(dif >= 1 && statuses.length){
    const good = statuses.find(c => c.effect==='stun') || statuses.find(c=>c.effect==='burn') || statuses.find(c=>c.effect==='shield');
    if(good) return good;
  }

  // Otherwise damage-weighted choice
  const damages = pool.filter(c => c.type==='damage');
  if(damages.length){
    damages.sort((a,b)=> (b.dmg||0)-(a.dmg||0));
    // difficulty affects greediness
    const pickIndex = dif === 2 ? 0 : dif === 1 ? Math.min(1, damages.length-1) : Math.min(2, damages.length-1);
    return damages[pickIndex];
  }

  // Fallback random
  return pool[Math.floor(Math.random()*pool.length)];
}