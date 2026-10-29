/* Night Friends UI/audio update. Load after the original game script. */
(()=>{
if(document.getElementById('night-update-style'))return;
const style=document.createElement('style');style.id='night-update-style';
style.textContent=`
#detector{width:178px;padding:12px 10px 14px;bottom:calc(env(safe-area-inset-bottom,0px) + 10px);transform:translateX(-50%) rotate(-2deg);border-width:3px;border-radius:21px}
#detector:before{height:32px;top:-32px;width:30px;left:calc(50% - 15px)}
#detector .screen{padding:7px}#value{font-size:34px}.dial{height:31px}.needle{height:28px}.label{font-size:8px;letter-spacing:1px}#signal{font-size:10px}
.hand{height:76px;width:36px;bottom:-12px}.hand.left{left:-22px}.hand.right{right:-22px}
footer{inset:0;pointer-events:none}footer button{pointer-events:auto;position:absolute}
#album{bottom:calc(env(safe-area-inset-bottom,0px) + 18px);left:12px;width:70px;font-size:12px;padding:12px 6px}
#capture{width:74px;height:74px;border-radius:50%;left:50%;transform:translateX(-50%);bottom:calc(env(safe-area-inset-bottom,0px) + 225px);padding:0;font-size:16px;border:4px solid #e5a8ad;background:radial-gradient(circle at 40% 30%,#963d46,#351b25);box-shadow:0 0 0 5px #171e1bc9,0 0 20px #6c263655}
#capture:active{transform:translateX(-50%) scale(.94)}
#message{font-size:21px;top:29%}#world.night-impact #camera,#world.night-impact #demo{animation:night-jolt .22s linear 2}
@keyframes night-jolt{0%,100%{transform:translate(0)}25%{transform:translate(3px,1px)}75%{transform:translate(-3px,-1px)}}
@media(max-height:650px){#detector{width:155px}#value{font-size:28px}#capture{bottom:calc(env(safe-area-inset-bottom,0px) + 195px);width:64px;height:64px}#album{width:60px}}
@media(prefers-reduced-motion:reduce){#world.night-impact #camera,#world.night-impact #demo{animation:none}}
`;document.head.append(style);
$('capture').textContent='포착';$('capture').setAttribute('aria-label','귀신 포착');
const originalMessage=message;
message=function(text,ms){if(typeof text==='string'&&text.includes('포착 성공!'))text=text.split('\n').filter((line,i)=>i<2||line.startsWith('★')).join('\n');originalMessage(text,ms)};
const volume=document.createElement('label');volume.textContent='공포 효과음 크기 ';
const slider=document.createElement('input');slider.type='range';slider.min='0';slider.max='100';slider.value=String(saved.settings.horrorVolume??55);slider.style.cssText='float:none;width:100%;margin-top:12px';slider.setAttribute('aria-label','공포 효과음 크기');slider.oninput=()=>{saved.settings.horrorVolume=Number(slider.value);persist()};volume.append(slider);$('options').insertBefore(volume,$('storageNotice'));
let activeVoices=0;
tone=function(freq=110,length=.22){
if(!saved.settings.sound||!audio||activeVoices>3)return;
const amount=(saved.settings.horrorVolume??55)/100;if(amount===0)return;
try{if(audio.state==='suspended')audio.resume();activeVoices++;const now=audio.currentTime,duration=freq>300?.33:Math.max(.65,length);const master=audio.createGain();const compressor=audio.createDynamicsCompressor();master.gain.value=amount*.4;master.connect(compressor);compressor.connect(audio.destination);
for(let i=0;i<3;i++){const o=audio.createOscillator(),g=audio.createGain();o.type=i===0?'sine':'triangle';o.frequency.setValueAtTime(freq>300?freq*(1+i*.25):[53,79,113][i],now);o.frequency.exponentialRampToValueAtTime(freq>300?240+i*40:31+i*12,now+duration);g.gain.setValueAtTime(.001,now);g.gain.linearRampToValueAtTime(i===0?.5:.17,now+.035);g.gain.exponentialRampToValueAtTime(.001,now+duration);o.connect(g);g.connect(master);o.start(now);o.stop(now+duration+.02)}
if(freq<300){const b=audio.createBuffer(1,Math.ceil(audio.sampleRate*duration),audio.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;const src=audio.createBufferSource(),filter=audio.createBiquadFilter(),gain=audio.createGain();src.buffer=b;filter.type='lowpass';filter.frequency.value=650;gain.gain.setValueAtTime(.16,now);gain.gain.exponentialRampToValueAtTime(.001,now+duration);src.connect(filter);filter.connect(gain);gain.connect(master);src.start(now)}
setTimeout(()=>{activeVoices--;master.disconnect();compressor.disconnect()},(duration+.2)*1000)
}catch(e){activeVoices=Math.max(0,activeVoices-1)}
};
buzz=function(){if(saved.settings.vibration&&navigator.vibrate)navigator.vibrate([120,65,180]);if(!saved.settings.reduce){$('world').classList.remove('night-impact');void $('world').offsetWidth;$('world').classList.add('night-impact');setTimeout(()=>$('world').classList.remove('night-impact'),500)}};
const note=document.createElement('p');note.style.fontSize='12px';note.textContent='진동 기능은 지원 기기에서만 작동하며 강도는 제어하지 않습니다. iPhone Safari는 게임용 진동 API를 지원하지 않습니다. 대신 짧은 화면 흔들림을 사용합니다. 소리는 낮은 크기부터 조절하세요.';$('options').insertBefore(note,$('storageNotice'));
})();
