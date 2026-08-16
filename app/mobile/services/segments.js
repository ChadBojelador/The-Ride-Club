import api from './api';
export async function getSegments({ limit=30,offset=0,q='' }={}) {
  const p=new URLSearchParams({limit,offset});if(q)p.set('q',q);
  return api.get('/segments?'+p.toString());
}
export async function getSegmentLeaderboard(id){return api.get('/segments/'+id);}
export function formatDuration(secs){
  if(!secs&&secs!==0)return '—';
  const s=Math.round(secs),h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sec=s%60;
  if(h>0)return h+':'+String(m).padStart(2,'0')+':'+String(sec).padStart(2,'0');
  return m+':'+String(sec).padStart(2,'0');
}