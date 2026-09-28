# ============================================================
# tools/chest_sounds.py — генератор звуків сундукової зброї (лише для розробника, гра його не використовує).
# Основа — семпли з sounds/source_sounds/ (удари, розряд, свисти ніндзя, сніжка, камінь) і наявні
# sounds/*.wav: змінює висоту, ріже, фільтрує, додає луну й синтезовані шари (осцилятори, шум —
# як у Web Audio) і записує нові sounds/*.wav (моно, 44,1 кГц, 16 біт).
# Запуск із кореня проекту: pip install numpy scipy miniaudio && python3 tools/chest_sounds.py
# ============================================================
import numpy as np, wave, sys
from scipy.signal import butter, sosfilt, resample, resample_poly
SR=44100
import os
D=os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'sounds') + os.sep
def load(n):
    w=wave.open(D+n+'.wav'); ch=w.getnchannels(); a=np.frombuffer(w.readframes(w.getnframes()),dtype=np.int16).astype(np.float32)/32768
    if ch==2: a=a.reshape(-1,2).mean(1)
    return a
# Семпл із sounds/source_sounds/ будь-якої частоти дискретизації — у моно 44,1 кГц
# (MP3 декодує miniaudio: pip install miniaudio)
def source(n):
    path=D+'source_sounds'+os.sep+n
    if os.path.exists(path+'.mp3'):
        import miniaudio
        d=miniaudio.decode_file(path+'.mp3', output_format=miniaudio.SampleFormat.SIGNED16, nchannels=1, sample_rate=SR)
        return (np.frombuffer(d.samples,dtype=np.int16).astype(np.float32)/32768).copy()
    w=wave.open(path+'.wav'); ch=w.getnchannels(); sr=w.getframerate()
    a=np.frombuffer(w.readframes(w.getnframes()),dtype=np.int16).astype(np.float32)/32768
    a=a.reshape(-1,ch).mean(1)
    if sr!=SR:
        g=np.gcd(SR,sr); a=resample_poly(a,SR//g,sr//g)
    return a.astype(np.float32)
# Обрізати тишу перед першим звуком (поріг — частка піку), лишивши pre секунд
def onset(a,thr=0.05,pre=0.004):
    i=int(np.argmax(np.abs(a)>thr*np.max(np.abs(a)))); return a[max(0,i-int(pre*SR)):].copy()
def cut(a,t0,t1=None): return a[int(t0*SR):(int(t1*SR) if t1 else None)].copy()
def speed(a,k):  # k>1 — вище й коротше
    return resample(a,max(1,int(len(a)/k))).astype(np.float32)
def filt(a,kind,f):
    sos=butter(4,f,btype=kind,fs=SR,output='sos'); return sosfilt(sos,a).astype(np.float32)
def fade(a,fi=0.005,fo=0.05):
    a=a.copy(); n=len(a); i=min(n,int(fi*SR)); o=min(n,int(fo*SR))
    if i: a[:i]*=np.linspace(0,1,i)
    if o: a[-o:]*=np.linspace(1,0,o)
    return a
def echo(a,delay=0.06,fb=0.45,n=5,wet=0.6):
    d=int(delay*SR); out=np.zeros(len(a)+d*n,np.float32); out[:len(a)]+=a
    for k in range(1,n+1): out[d*k:d*k+len(a)]+=a*(fb**k)*wet
    return out
def mix(*parts):  # (сигнал, зсув с, гучність)
    L=max(int(o*SR)+len(s) for s,o,g in parts); out=np.zeros(L,np.float32)
    for s,o,g in parts: i=int(o*SR); out[i:i+len(s)]+=s*g
    return out
def env_decay(a,tau):
    return a*np.exp(-np.arange(len(a))/SR/tau).astype(np.float32)
def save(n,a,peak=0.9):
    a=fade(a); m=np.max(np.abs(a)) or 1; a=a/m*peak
    w=wave.open(D+n+'.wav','wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((a*32767).astype(np.int16).tobytes()); w.close(); print(n, round(len(a)/SR,2))


# ---------- Синтез (як у Web Audio: осцилятори, шум, огинальні) ----------
rng=np.random.default_rng(7)
def T(d): return np.arange(int(d*SR))/SR
def noise(d, gen=None): return (gen or rng).uniform(-1,1,int(d*SR)).astype(np.float32)
# Окремий генератор для шарів, доданих пізніше: так звуки, яких правка не стосується, не змінюються
rng2=np.random.default_rng(11)
def sweep(f0,f1,d,shape='sine'):
    t=T(d); f=f0*(f1/f0)**(t/d); ph=2*np.pi*np.cumsum(f)/SR
    w=np.sin(ph) if shape=='sine' else np.sign(np.sin(ph))
    return w.astype(np.float32)
def tone(f,d,tau,shape='sine'): return env_decay(sweep(f,f,d,shape),tau)
def vib(f,d,depth,rate):
    t=T(d); ph=2*np.pi*np.cumsum(f*(1+depth*np.sin(2*np.pi*rate*t)))/SR; return np.sin(ph).astype(np.float32)
def attack(a,t): a=a.copy(); n=min(len(a),int(t*SR)); a[:n]*=np.linspace(0,1,n); return a
def crackle(d,dens):
    a=np.zeros(int(d*SR),np.float32); idx=rng.integers(0,len(a),int(dens*d)); a[idx]=rng.uniform(-1,1,len(idx)); return filt(a,'highpass',2000)
def swept_band(a,f0,f1,chunk=0.02):
    out=np.zeros_like(a); n=int(chunk*SR); steps=max(1,len(a)//n)
    for i in range(steps):
        f=f0*(f1/f0)**(i/steps); seg=filt(a,'bandpass',[f*0.7,f*1.4]); out[i*n:(i+1)*n]=seg[i*n:(i+1)*n]
    return out
def metal(freqs,d,tau): return sum(tone(f,d,tau*(1-i*0.2)) for i,f in enumerate(freqs))/len(freqs)
# М'яке насичення: звук щільніший, без різкого кліпу
def sat(a,drive): return (np.tanh(a*drive)/np.tanh(drive)).astype(np.float32)
# Черга однакових пострілів (count штук через gap секунд), кожен трохи інший за висотою й гучністю
def series(one,count,gap,pitch=0.04,fall=0.15):
    return mix(*[(speed(one,1+pitch*(i%2*2-1)*(i>0)),gap*i,1-fall*i) for i in range(count)])

bow=load('bow'); sword=load('sword'); soccer=load('soccer'); pick=load('pickaxe'); bat=load('bat')
explode=load('explode'); gun=load('gun'); mg=load('machine_gun'); thunder=load('thunder'); laser=load('laser_gun')
flame=load('flamethrower'); grav=load('gravi_sound'); saber=load('lightsaber'); coins=load('chest_coins')
click=load('click'); boom=load('missile_boom'); firesw=load('fire_sword'); axe=load('axe')

# ---------- Семпли ----------
IMPACT=onset(source('impact-hit-_you-can-use-instead-of-bonk-sound_'))   # глибокий глухий удар
HORROR=onset(source('horror-impact-hit'))                                   # важкий удар із металевим дзвоном
ELECTRIC=source('electric-impact')                                          # тріск розряду
NINJA=source('ninja-action-sound')                                          # свисти й удари ніндзя
SNOWBALL=source('snowball-throw')                                           # кидок сніжки й шльоп
STONE=onset(source('stone-sound'))                                          # стук камінця
BRAAM=source('cinematic-braam-impact')                                      # наростання (0,49–0,935 с) і кінематографічний удар
BRAAM_HIT=0.935
CINE_BOOM=onset(source('impact-cinematic-boom'))                            # глибокий кінематографічний «бум»
TRIDENT=onset(source('trident'))                                            # кидок тризуба
SLIME=onset(source('slime-impact'))                                         # мокрий шльоп
# Свисти ніндзя: короткі яскраві «ш-ших» (початок трохи до піку)
def swish(t,d=0.14): return fade(cut(NINJA,t-0.03,t-0.03+d),0.004,0.05)
SWISHES=[swish(5.068),swish(5.348),swish(6.999),swish(6.356)]

# Глухий щільний удар — на основі семпла удару: нижче на depth, верх зрізано на bright,
# під ним низький «бум» (синусоїда, що падає за висотою)
def thud(depth=1.0, bright=700, length=0.6):
    body=filt(cut(speed(IMPACT,1/depth),0,length),'lowpass',bright)
    sub=env_decay(sweep(150/depth,60/depth,0.35),0.11)
    return sat(mix((body,0,1.2),(sub,0,0.6)),1.6)

# Тризуб: кидок — семпл тризуба; влучання — мокрий шльоп, бризки й глухий удар
# (кидок — справжній звук тризуба, коротший; для удару зблизька звучить той самий)
save('trident_throw', mix((fade(cut(TRIDENT,0,0.6),0.002,0.25),0,1),(speed(SWISHES[0],0.8),0,0.35)))
splash=mix((fade(cut(SLIME,0,0.6),0.002,0.2),0,1),(filt(fade(cut(TRIDENT,0.25,0.8),0.05,0.2),'highpass',1500),0.02,0.35),(thud(1.0,1100,0.45),0,0.7),
           (env_decay(sweep(700,180,0.18),0.08),0.04,0.3))
save('trident_splash', echo(splash,0.035,0.3,3,0.4))
noise(0.4); noise(0.5)  # тримає послідовність випадкових чисел для наступних звуків (шар, який тут був раніше)
# Арбалет: клацання механізму, тугіша тятива, свист болта й низький «тунк»
save('crossbow', mix((filt(cut(click,0,0.06),'highpass',1500),0,0.8),(speed(bow,0.9),0.03,1),(speed(SWISHES[1],1.2),0.05,0.5),(tone(140,0.2,0.05),0.03,0.5)))
# Сніжки: справжній кидок сніжки — черга з трьох (як три сніжки в грі); влучання — шльоп сніжки на глухому ударі
snow_whoosh=fade(cut(SNOWBALL,0.2,0.5),0.01,0.12)   # свист і клацання кидка
snow_splat=cut(SNOWBALL,0.28,0.75)
save('snow_throw', series(snow_whoosh,3,0.09))
save('snow_hit', mix((snow_splat,0,1),(thud(1.1,900,0.4),0,0.7),(filt(crackle(0.2,700),'bandpass',[2000,6000]),0,0.4)))
# Рогатка: гумка «тьонь»; влучання — лише стук камінця
save('slingshot', mix((speed(bow,1.6),0,1),(env_decay(sweep(260,190,0.25)+0.4*sweep(520,380,0.25),0.07),0,0.6)))
save('slingshot_hit', STONE)
# Булава: важкий удар із металевим дзвоном (семпл нижче), глухий удар і низький гул, насичення
mace=mix((filt(fade(cut(speed(HORROR,0.85),0,1.4),0.002,0.5),'lowpass',5000),0,1),(thud(1.3,600,0.9),0,1),
         (env_decay(sweep(110,42,0.9),0.32),0,0.7),(filt(speed(pick,0.5),'lowpass',3000),0,0.4))
save('mace_hit', echo(sat(mace,2.2),0.035,0.3,3,0.35))
# Коса: повільний свист ніндзя з примарним відлунням; душа — виття
scy=mix((speed(SWISHES[3],0.6),0,1),(speed(SWISHES[0],0.5),0.04,0.6),(filt(speed(cut(saber,0,0.6),0.6),'lowpass',1500),0,0.3))
save('scythe_swing', cut(echo(scy,0.09,0.5,5,0.5),0,0.9))
wail=attack(vib(420,0.9,0.03,6)*np.linspace(1,0.4,int(0.9*SR)),0.15)*np.exp(-T(0.9)/0.5)
save('scythe_soul', echo(mix((filt(speed(grav,0.8)[::-1],'lowpass',2500),0,0.6),(wail.astype(np.float32),0.1,0.5),(0.5*sweep(600,300,0.9)*np.exp(-T(0.9)/0.3).astype(np.float32),0.1,0.3)),0.12,0.5,4,0.6))
# Банхамер: глухий важкий «БУМ» (семпли ударів) і м'яке «бу-бу» заборони
def soft_buzz(d):
    t=T(d); b=(np.sin(2*np.pi*150*t)+0.35*np.sin(2*np.pi*300*t)+0.15*np.sin(2*np.pi*450*t)).astype(np.float32)
    return fade(filt(b,'lowpass',700),0.02,0.04)
ban=mix((thud(1.2,900,0.7),0,1.2),(filt(fade(cut(HORROR,0,0.6),0.002,0.3),'lowpass',2500),0,0.6),(filt(speed(bat,0.65),'lowpass',1800),0,0.5))
save('banhammer', mix((sat(ban,1.8),0,1),(soft_buzz(0.15),0.36,0.3),(soft_buzz(0.15),0.55,0.3)))
# Пейнтбол: черга з трьох пневматичних «пух»; влучання — мокрий шльоп (семпл слизу) на глухому ударі
paint_one=mix((filt(speed(cut(gun,0,0.14),1.4),'lowpass',2200),0,1),(env_decay(filt(noise(0.08),'bandpass',[600,2500]),0.02),0,0.6),(env_decay(sweep(160,70,0.08),0.03),0,0.5))
save('paint_shot', series(paint_one,3,0.08))
save('paint_splat', mix((fade(cut(SLIME,0,0.5),0.002,0.2),0,1),(thud(1.0,1000,0.4),0,0.5)))
noise(0.3)  # тримає послідовність випадкових чисел для наступних звуків (шар, який тут був раніше)
# Посох блискавок: тріск розряду, під ним глибокий кінематографічний «бум» грому й нижчий відгомін розряду
save('chain_lightning', mix((fade(cut(ELECTRIC,0,1.1),0.002,0.3),0,1),(filt(fade(cut(CINE_BOOM,0,1.2),0.002,0.5),'lowpass',900),0,0.8),(filt(fade(cut(speed(ELECTRIC,0.6),0.05,0.8),0.01,0.3),'lowpass',2500),0.03,0.35)))
crackle(0.6,1200)  # тримає послідовність випадкових чисел для наступних звуків (шар, який тут був раніше)
# Падіння: наростання braam (0,49–0,935 с — майже рівно політ у грі, 0,42 с), свист ракети й гул полум'я,
# що гучнішають до удару. Вибух: удар braam, вибух ракетниці й глибокий «бум»
swell=cut(BRAAM,BRAAM_HIT-0.45,BRAAM_HIT)
roar=filt(cut(flame,0,0.45),'lowpass',1800)*np.linspace(0.3,1,int(0.45*SR)).astype(np.float32)
save('meteor_fall', sat(mix((swell,0,1.2),(filt(cut(boom,0.15,0.6),'lowpass',4000),0,0.9),(roar,0,0.6)),1.5))
noise(0.45)  # тримає послідовність випадкових чисел для наступних звуків (шар, який тут був раніше)
save('meteor_boom', fade(cut(mix((cut(BRAAM,BRAAM_HIT-0.005,BRAAM_HIT+2.0),0,1),(cut(boom,1.18,3.2),0,0.9),(CINE_BOOM,0,0.8),(speed(explode,0.8),0,0.4)),0,2.3),0.002,0.8))
# Жезл вітру: довгий свист ніндзя як порив, вихор, що злітає вгору
gust=swept_band(noise(0.8),300,2500)*np.exp(-T(0.8)/0.35).astype(np.float32)
wind_body=fade(cut(NINJA,7.23,7.7),0.03,0.15)
save('wind_blast', mix((wind_body,0,1),(speed(wind_body,0.8),0.12,0.5),(attack(gust,0.05),0,0.7),(speed(grav,1.2),0,0.25)))
# Крижана сфера — зі справжніх звуків замість синтезу
# Запуск: свист ніндзя нижче, холодний тріск (розряд без низу, вище — як лід, що тріщить) і дзвін монет угорі
ice_crackle=filt(fade(cut(speed(ELECTRIC,1.5),0,0.6),0.005,0.3),'highpass',3000)
save('frost_orb', echo(mix((speed(SWISHES[1],0.7),0,1),(ice_crackle,0.02,0.6),(filt(speed(coins,1.3),'highpass',2500),0.05,0.35)),0.07,0.35,3,0.4))
# Розкол: камінці вище як скалки льоду, сніжний шльоп без низу й дзвін монет
save('ice_shatter', mix((speed(STONE,1.7),0,1),(speed(STONE,2.3),0.04,0.6),(speed(STONE,2.0),0.09,0.4),(filt(snow_splat,'highpass',1500),0,0.5),(filt(speed(coins,1.6),'highpass',3000),0.02,0.35)))
# Сюрикени: черга з трьох свистів ніндзя (як три сюрикени в грі); влучання — удар клинка й металевий дзень
save('shuriken_throw', mix((SWISHES[0],0,1),(speed(SWISHES[1],1.05),0.08,0.9),(speed(SWISHES[2],0.95),0.16,0.85)))
save('shuriken_hit', mix((fade(cut(NINJA,2.615,2.9),0.003,0.1),0,1),(metal([2400,3900,5300],0.3,0.06),0,0.35),(thud(0.8,1500,0.25),0,0.3)))
