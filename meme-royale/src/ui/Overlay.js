import { ALL_CARDS, describeCard } from '../game/Cards.js';

export function mountOverlay(root, content){
  root.innerHTML = '';
  const ov = document.createElement('div'); ov.className = 'overlay';
  const panel = document.createElement('div'); panel.className = 'panel';
  panel.appendChild(content);
  ov.appendChild(panel);
  root.appendChild(ov);
  return () => { root.innerHTML = ''; };
}

export function buildDeckBuilder({ root, initialSelectedIds = [], onConfirm }){
  const content = document.createElement('div');
  const title = document.createElement('h2'); title.textContent = 'Build Your Deck';
  const sub = document.createElement('div'); sub.className = 'sub'; sub.textContent = 'Pick 6 cards';
  content.appendChild(title); content.appendChild(sub);

  const grid = document.createElement('div'); grid.className = 'deck-grid';

  const selected = new Set(initialSelectedIds);

  function renderCard(card){
    const el = document.createElement('div'); el.className = 'card'; el.id = `deck-${card.id}`;
    if(selected.has(card.id)) el.classList.add('deck-selected');

    const meta = document.createElement('div'); meta.className = 'meta';
    const thumb = document.createElement('div'); thumb.className = 'thumb'; thumb.textContent = card.thumb;
    const textWrap = document.createElement('div');
    const name = document.createElement('div'); name.className = 'name'; name.textContent = card.name;
    const desc = document.createElement('div'); desc.className = 'small'; desc.textContent = card.desc;
    textWrap.appendChild(name); textWrap.appendChild(desc);
    meta.appendChild(thumb); meta.appendChild(textWrap);

    const cool = document.createElement('div'); cool.className = 'cool';
    const left = document.createElement('div'); left.className = 'small'; left.textContent = describeCard(card);
    const right = document.createElement('div'); right.className = 'small'; right.textContent = `CD ${card.cooldown ?? 3}`;
    cool.appendChild(left); cool.appendChild(right);

    el.appendChild(meta); el.appendChild(cool);

    el.addEventListener('click', ()=>{
      if(selected.has(card.id)) selected.delete(card.id); else if(selected.size < 6) selected.add(card.id);
      el.classList.toggle('deck-selected');
      updateCount();
    });

    return el;
  }

  ALL_CARDS.forEach(c => grid.appendChild(renderCard(c)));

  const count = document.createElement('div'); count.className = 'sub';
  function updateCount(){ count.textContent = `Selected: ${selected.size}/6`; }
  updateCount();

  const actions = document.createElement('div'); actions.className = 'actions';
  const play = document.createElement('button'); play.className = 'btn'; play.textContent = 'Start Battle';
  play.addEventListener('click', ()=>{ if(selected.size >= 4){ onConfirm(Array.from(selected)); } });

  actions.appendChild(play);

  content.appendChild(grid);
  content.appendChild(count);
  content.appendChild(actions);

  const unmount = mountOverlay(root, content);
  return { unmount };
}

export function buildSettings({ root, settings, onUpdate, onClose }){
  const content = document.createElement('div');
  const title = document.createElement('h2'); title.textContent = 'Settings';
  content.appendChild(title);

  const row1 = document.createElement('div'); row1.className = 'settings-row';
  const lbl1 = document.createElement('label'); lbl1.textContent = 'Difficulty';
  const range = document.createElement('input'); range.type = 'range'; range.min = '0'; range.max = '2'; range.value = settings.difficulty;
  const ticks = document.createElement('div'); ticks.className = 'small'; ticks.textContent = ['Easy','Normal','Hard'][settings.difficulty];
  range.addEventListener('input', ()=>{ ticks.textContent = ['Easy','Normal','Hard'][Number(range.value)]; });
  range.addEventListener('change', ()=>{ onUpdate({ difficulty: Number(range.value) }); });
  row1.appendChild(lbl1); row1.appendChild(range); row1.appendChild(ticks);

  const row2 = document.createElement('div'); row2.className = 'settings-row toggle';
  const lbl2 = document.createElement('label'); lbl2.textContent = 'Sound';
  const cb2 = document.createElement('input'); cb2.type = 'checkbox'; cb2.checked = settings.sound; cb2.addEventListener('change', ()=> onUpdate({ sound: cb2.checked }));
  row2.appendChild(lbl2); row2.appendChild(cb2);

  const row3 = document.createElement('div'); row3.className = 'settings-row toggle';
  const lbl3 = document.createElement('label'); lbl3.textContent = 'Auto-play (CPU vs CPU)';
  const cb3 = document.createElement('input'); cb3.type = 'checkbox'; cb3.checked = settings.autoplay; cb3.addEventListener('change', ()=> onUpdate({ autoplay: cb3.checked }));
  row3.appendChild(lbl3); row3.appendChild(cb3);

  const actions = document.createElement('div'); actions.className = 'actions';
  const close = document.createElement('button'); close.className = 'btn'; close.textContent = 'Close';
  close.addEventListener('click', onClose);
  actions.appendChild(close);

  content.appendChild(row1);
  content.appendChild(row2);
  content.appendChild(row3);
  content.appendChild(actions);

  const unmount = mountOverlay(root, content);
  return { unmount };
}

export function buildOutcome({ root, result, quote, onAgain }){
  const content = document.createElement('div');
  const h = document.createElement('h2'); h.textContent = result === 'win' ? 'YOU WIN! Meme Victory' : 'YOU LOSE...';
  const p = document.createElement('p'); p.className = 'sub'; p.textContent = quote;
  const actions = document.createElement('div'); actions.className = 'actions';
  const btn = document.createElement('button'); btn.className = 'btn'; btn.textContent = 'Play Again'; btn.addEventListener('click', onAgain);
  actions.appendChild(btn);
  content.appendChild(h); content.appendChild(p); content.appendChild(actions);
  const unmount = mountOverlay(root, content);
  return { unmount };
}