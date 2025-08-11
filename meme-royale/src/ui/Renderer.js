import { describeCard } from '../game/Cards.js';
import { toPercent } from '../utils/helpers.js';

export class Renderer{
  constructor(audio){
    this.refs = {
      cardsGrid: null,
      playerHPFill: null,
      cpuHPFill: null,
      battlefield: null,
      memeStage: null,
      turnCounter: null,
      overlayRoot: null,
      restartBtn: null,
      settingsBtn: null,
      autoPlay: null
    };
    this.audio = audio;
  }

  init(){
    this.refs.cardsGrid = document.getElementById('cardsGrid');
    this.refs.playerHPFill = document.getElementById('playerHPFill');
    this.refs.cpuHPFill = document.getElementById('cpuHPFill');
    this.refs.battlefield = document.getElementById('battlefield');
    this.refs.memeStage = document.getElementById('memeStage');
    this.refs.turnCounter = document.getElementById('turnCounter');
    this.refs.overlayRoot = document.getElementById('overlayRoot');
    this.refs.restartBtn = document.getElementById('restartBtn');
    this.refs.settingsBtn = document.getElementById('settingsBtn');
    this.refs.autoPlay = document.getElementById('autoPlay');
  }

  onRestart(cb){ this.refs.restartBtn?.addEventListener('click', cb); }
  onSettings(cb){ this.refs.settingsBtn?.addEventListener('click', cb); }
  onFirstPointer(cb){ document.body.addEventListener('pointerdown', cb, { once: true }); }

  setAutoplayChecked(on){ if(this.refs.autoPlay) this.refs.autoPlay.checked = on; }

  renderHP(player, cpu){
    if(this.refs.playerHPFill) this.refs.playerHPFill.style.width = toPercent(player.hp, player.max);
    if(this.refs.cpuHPFill) this.refs.cpuHPFill.style.width = toPercent(cpu.hp, cpu.max);
  }

  setTurn(turn){ if(this.refs.turnCounter) this.refs.turnCounter.textContent = String(turn); }

  floatingText(x,y,text, cls=''){ if(!this.refs.battlefield) return; const el = document.createElement('div'); el.className = 'float-text ' + cls; el.style.left = (x|0) + 'px'; el.style.top = (y|0) + 'px'; el.textContent = text; this.refs.battlefield.appendChild(el); setTimeout(()=>el.remove(),900); }

  showMeme(stageText, helper){ if(this.refs.memeStage){ this.refs.memeStage.textContent = stageText; this.refs.memeStage.title = helper || ''; } }

  shake(intensity=1){
    const bf = this.refs.battlefield; if(!bf) return;
    bf.animate([{transform:'translateY(0)'},{transform:`translateY(-${6*intensity}px)`},{transform:'translateY(0)'}],{duration:280});
  }

  buildCards(cards, { isDisabled, onClick }){
    const grid = this.refs.cardsGrid; if(!grid) return;
    grid.innerHTML = '';
    for(const card of cards){
      const el = document.createElement('div'); el.className = 'card'; el.id = 'card-' + card.id; el.setAttribute('role','button'); el.tabIndex = 0;

      const meta = document.createElement('div'); meta.className = 'meta';
      const thumb = document.createElement('div'); thumb.className = 'thumb'; thumb.textContent = card.thumb;
      const textWrap = document.createElement('div');
      const name = document.createElement('div'); name.className = 'name'; name.textContent = card.name;
      const desc = document.createElement('div'); desc.className = 'small'; desc.textContent = card.desc;
      textWrap.appendChild(name); textWrap.appendChild(desc);
      meta.appendChild(thumb); meta.appendChild(textWrap);

      const cool = document.createElement('div'); cool.className = 'cool';
      const left = document.createElement('div'); left.className = 'small'; left.textContent = describeCard(card);
      const cd = document.createElement('div'); cd.className = 'small'; cd.id = 'cd-' + card.id; cd.textContent = '';
      cool.appendChild(left); cool.appendChild(cd);

      el.appendChild(meta); el.appendChild(cool);

      function updateDisabled(){
        const disabled = isDisabled(card);
        el.classList.toggle('disabled', disabled);
      }
      updateDisabled();

      el.addEventListener('click', ()=>{ if(!isDisabled(card)) onClick(card); });
      el.addEventListener('keydown', (ev)=>{ if(ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); el.click(); } });

      grid.appendChild(el);
    }
  }

  setCardCooldown(cardId, remaining){
    const cdEl = document.getElementById('cd-'+cardId);
    const el = document.getElementById('card-'+cardId);
    if(!cdEl || !el) return;
    if(remaining > 0){ el.classList.add('disabled'); cdEl.textContent = 'CD ' + remaining; }
    else { el.classList.remove('disabled'); cdEl.textContent = ''; }
  }
}