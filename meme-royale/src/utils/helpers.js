export function clamp(value, min, max){
  return Math.max(min, Math.min(max, value));
}

export function toPercent(value, max){
  return (value / max * 100) + '%';
}

export function randomOf(array){
  return array[Math.floor(Math.random() * array.length)];
}

export function uid(){
  return Math.random().toString(36).slice(2);
}

export function loadFromStorage(key, fallback){
  try{
    const raw = localStorage.getItem(key);
    if(!raw) return fallback;
    return JSON.parse(raw);
  }catch(e){
    return fallback;
  }
}

export function saveToStorage(key, value){
  try{ localStorage.setItem(key, JSON.stringify(value)); }catch(e){ /* ignore */ }
}