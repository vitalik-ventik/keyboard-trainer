const MAX_PARTICLES = 50;const MAX_RAINDROPS = 120;const MAX_MATRIX_COLUMNS = 40;const NEON_PALETTE = ["#00f6ff","#ff2ea6","#ffe14d","#00ff88"];
let _W=0,_H=0,_groundY=0,_particles=[],_raindrops=[],_matrixColumns=[],_stars=[],_sparks=[],_rainTimer=0,_matrixInitialized=!1,_starsInitialized=!1,_landscapeSeed=0,_cityBuildings=null,_lastBgTime=null,_step=1;
function rand(min,max){return min+Math.random()*(max-min)}function randInt(min,max){return Math.floor(rand(min,max+1))}function noise1D(x,t){return Math.sin(x*0.7+t)*Math.cos(x*1.1-t*0.6)*0.5+0.5}
/* shadowBlur вимкнено: розмиття тіні — найдорожча операція Canvas 2D (кожен штрих із тінню — окремий прохід розмиття), а радіус 4 px майже не помітний. Сигнатура збережена, щоб не змінювати виклики у фонах */function applyGlow(ctx,color,blur){}function clearGlow(ctx){ctx.shadowBlur=0;ctx.shadowColor="transparent"}
/* Кольори вікон midnight_skyline та таблиця готових рядків fillStyle: колір × рівень яскравості (альфа 0.15..0.50 з кроком 0.02) */
const SKY_WINDOW_COLORS=[[255,204,68],[255,102,34],[255,136,204],[136,221,255],[255,153,102],[170,204,255]];const SKY_ALPHA_LEVELS=19;let _skyStyles=null;const _skyBuckets=[];for(let i=0;i<SKY_WINDOW_COLORS.length*SKY_ALPHA_LEVELS;i++)_skyBuckets.push([]);
function _skyWindowStyles(){if(_skyStyles)return _skyStyles;_skyStyles=[];for(const c of SKY_WINDOW_COLORS){for(let lv=0;lv<SKY_ALPHA_LEVELS;lv++){const a=Math.min(0.5,0.15+lv*0.02);_skyStyles.push("rgba("+c[0]+","+c[1]+","+c[2]+","+a.toFixed(2)+")")}}return _skyStyles}
const BackgroundRenderer = {
    init(W,H,groundY){_W=W;_H=H;_groundY=groundY;/* Дані, що залежать від розміру екрана, будуються заново */this._skyData=null;this._toxicTop=null;this._abyssBubs=null;this._sporeCells=null;this._triStars=null;this._waterMist=null;this._infernoEmbers=null;this._infernoSmoke=null;this._skyBg=null;this._pixelNight=null;this._pixelCave=null;this._pixelSnow=null;this._pixelOcean=null;this._pixelDesert=null;this._pixelIslands=null;this._pixelNether=null;this._neonHighway=null;this._neonRooftops=null;this._neonStart=null;this._sunsetCity=null;this._cosmodrome=null;this._laserRange=null;this._digitalForest=null;this._stormSky=null;this._crystalCave=null;this._retroArcade=null;this._secretBase=null;this._metroTunnel=null;this._robotFactory=null;this._twinSun=null;this._skyCity=null;this._stadium=null;this._nightHarbor=null;this._glitchWorld=null;this._treasury=null;this._dragonLair=null;this._knightCastle=null;this._blackHole=null;this._throneRoom=null;this._pirateBay=null;this._orbitView=null;this._pulsarHex=null;_particles=[];_raindrops=[];_matrixColumns=[];_sparks=[];_starsInitialized=!1;_matrixInitialized=!1;_cityBuildings=null;_landscapeSeed=Math.random()*1000},
    reset(){_particles=[];_raindrops=[];_matrixColumns=[];_sparks=[];_starsInitialized=!1;_matrixInitialized=!1;_cityBuildings=null;_rainTimer=0;_landscapeSeed=Math.random()*1000},
    getDimensions(){return{W:_W,H:_H,groundY:_groundY}},
    createParticles(x,y,count,palette){const colors=palette||NEON_PALETTE;for(let i=0;i<count;i++){if(_particles.length>=MAX_PARTICLES){let min=Infinity,mi=-1;for(let j=0;j<_particles.length;j++){if(_particles[j].life<min){min=_particles[j].life;mi=j}}if(mi>=0)_particles.splice(mi,1)}const a=rand(0,Math.PI*2),s=rand(80,200);_particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-rand(40,100),size:rand(2,4),life:rand(0.4,0.6),maxLife:0,color:colors[randInt(0,colors.length-1)],gravity:rand(300,500)})}for(let j=0;j<_particles.length;j++)if(_particles[j].maxLife===0)_particles[j].maxLife=_particles[j].life},
    updateParticles(dt){for(let i=_particles.length-1;i>=0;i--){const p=_particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=p.gravity*dt;p.life-=dt;if(p.life<=0)_particles.splice(i,1)}for(let i=_sparks.length-1;i>=0;i--){const s=_sparks[i];s.x+=s.vx*dt;s.y+=s.vy*dt;s.life-=dt;if(s.life<=0)_sparks.splice(i,1)}},
    renderParticles(ctx,groundY,anchorX,camX){for(const p of _particles){ctx.globalAlpha=Math.max(0,p.life/p.maxLife);ctx.fillStyle=p.color;ctx.fillRect(p.x-camX+anchorX-p.size/2,groundY-p.y-p.size/2,p.size,p.size)}for(const s of _sparks){ctx.globalAlpha=Math.max(0,s.life/0.3);ctx.fillStyle=s.color;ctx.fillRect(s.x-camX+anchorX-s.size/2,groundY-s.y-s.size/2,s.size,s.size)}ctx.globalAlpha=1},
    hasActiveParticles(){return _particles.length>0||_sparks.length>0},
    render(ctx,bgTheme,W,H,groundY,time,speed,accentColor,levelId){if(W!==_W||H!==_H||groundY!==_groundY){this.init(W,H,groundY)}/* Крок анімації за часом: 1 = одна перемальовка при 20 перемальовках на секунду; не залежить від частоти монітора */if(time!==_lastBgTime){_step=_lastBgTime===null||time<_lastBgTime?1:Math.min(3,(time-_lastBgTime)*20);_lastBgTime=time;}var hueShift=(levelId||0)*37;var saveFill=ctx.fillStyle;var saveStroke=ctx.strokeStyle;var saveAlpha=ctx.globalAlpha;try{switch(bgTheme){
case"cyber_grid":this.renderCyberGrid(ctx,W,H,groundY,time,speed,accentColor);break;case"parallax_city":this.renderParallaxCity(ctx,W,H,groundY,time,speed,hueShift);break;
case"hyperspace_tunnel":this.renderHyperspaceTunnel(ctx,W,H,time,speed,hueShift);break;case"bezier_waves":this.renderBezierWaves(ctx,W,H,groundY,time,hueShift);break;
case"neon_rain":this.renderNeonRain(ctx,W,H,time,hueShift);break;case"matrix_flow":this.renderMatrixFlow(ctx,W,H,time,hueShift);break;
case"equalizer":this.renderEqualizer(ctx,W,H,time,hueShift);break;case"starfield":this.renderStarfield(ctx,W,H,time,speed,hueShift);break;
case"energy_grid":this.renderEnergyGrid(ctx,W,H,time,hueShift);break;case"geo_landscape":this.renderGeoLandscape(ctx,W,H,groundY,time,speed,hueShift);break;
case"demon":this.renderDemonFallback(ctx,W,H,groundY,time,speed,hueShift);break;case"inferno_core":this.renderInfernoCore(ctx,W,H,groundY,time,speed,hueShift);break;
case"cyber_columns":this.renderCyberColumns(ctx,W,H,groundY,time,speed,hueShift);break;case"pulsar_core":this.renderPulsarCore(ctx,W,H,groundY,time,speed,hueShift);break;
case"digital_rain":this.renderDigitalRain(ctx,W,H,groundY,time,speed,hueShift);break;case"scanline_sweep":this.renderScanlineSweep(ctx,W,H,groundY,time,speed,hueShift);break;
case"toxic_waste":this.renderToxicWaste(ctx,W,H,groundY,time,speed,hueShift);break;case"binary_star":this.renderBinaryStar(ctx,W,H,groundY,time,speed,hueShift);break;
case"aurora_wings":this.renderAuroraWings(ctx,W,H,groundY,time,speed,hueShift);break;case"triumph_flare":this.renderTriumphFlare(ctx,W,H,groundY,time,speed,hueShift);break;
case"midnight_skyline":this.renderMidnightSkyline(ctx,W,H,groundY,time,speed,hueShift);break;case"rooftop_grid":this.renderRooftopGrid(ctx,W,H,groundY,time,speed,hueShift);break;
case"deep_abyss":this.renderDeepAbyss(ctx,W,H,groundY,time,speed,hueShift);break;case"equator_beam":this.renderEquatorBeam(ctx,W,H,groundY,time,speed,hueShift);break;
case"spore_field":this.renderSporeField(ctx,W,H,groundY,time,speed,hueShift);break;case"vowel_waves":this.renderVowelWaves(ctx,W,H,groundY,time,speed,hueShift);break;
case"diamond_matrix":this.renderDiamondMatrix(ctx,W,H,groundY,time,speed,hueShift);break;case"waterfall_cascade":this.renderWaterfallCascade(ctx,W,H,groundY,time,speed,hueShift);break;
case"barrier_wall":this.renderBarrierWall(ctx,W,H,groundY,time,speed,hueShift);break;case"glitch_field":this.renderGlitchField(ctx,W,H,groundY,time,speed,hueShift);break;
case"nebula_drift":this.renderNebulaDrift(ctx,W,H,groundY,time,speed,hueShift);break;case"grand_hex":this.renderGrandHex(ctx,W,H,groundY,time,speed,hueShift);break;
case"neon_start":this.renderNeonStart(ctx,W,H,groundY,time,speed,accentColor);break;case"sunset_city":this.renderSunsetCity(ctx,W,H,groundY,time,speed);break;case"cosmodrome":this.renderCosmodrome(ctx,W,H,groundY,time,speed);break;case"laser_range":this.renderLaserRange(ctx,W,H,groundY,time,speed);break;case"digital_forest":this.renderDigitalForest(ctx,W,H,groundY,time,speed);break;case"storm_sky":this.renderStormSky(ctx,W,H,groundY,time,speed);break;case"crystal_cave":this.renderCrystalCave(ctx,W,H,groundY,time,speed);break;case"retro_arcade":this.renderRetroArcade(ctx,W,H,groundY,time,speed);break;case"secret_base":this.renderSecretBase(ctx,W,H,groundY,time,speed);break;case"metro_tunnel":this.renderMetroTunnel(ctx,W,H,groundY,time,speed);break;case"robot_factory":this.renderRobotFactory(ctx,W,H,groundY,time,speed);break;case"twin_sun_planet":this.renderTwinSunPlanet(ctx,W,H,groundY,time,speed);break;case"sky_city":this.renderSkyCity(ctx,W,H,groundY,time,speed);break;case"stadium":this.renderStadium(ctx,W,H,groundY,time,speed);break;case"night_harbor":this.renderNightHarbor(ctx,W,H,groundY,time,speed);break;case"glitch_world":this.renderGlitchWorld(ctx,W,H,groundY,time,speed);break;case"treasury":this.renderTreasury(ctx,W,H,groundY,time,speed);break;case"dragon_lair":this.renderDragonLair(ctx,W,H,groundY,time,speed);break;case"knight_castle":this.renderKnightCastle(ctx,W,H,groundY,time,speed);break;case"black_hole":this.renderBlackHole(ctx,W,H,groundY,time,speed);break;case"throne_room":this.renderThroneRoom(ctx,W,H,groundY,time,speed);break;case"pirate_bay":this.renderPirateBay(ctx,W,H,groundY,time,speed);break;case"orbit_view":this.renderOrbitView(ctx,W,H,groundY,time,speed);break;case"pixel_snow":this.renderPixelSnow(ctx,W,H,groundY,time,speed);break;case"pixel_ocean":this.renderPixelOcean(ctx,W,H,groundY,time,speed);break;case"pixel_desert":this.renderPixelDesert(ctx,W,H,groundY,time,speed);break;case"pixel_islands":this.renderPixelIslands(ctx,W,H,groundY,time,speed);break;case"pixel_nether":this.renderPixelNether(ctx,W,H,groundY,time,speed);break;case"neon_highway":this.renderNeonHighway(ctx,W,H,groundY,time,speed);break;case"neon_rooftops":this.renderNeonRooftops(ctx,W,H,groundY,time,speed);break;case"pixel_night":this.renderPixelNight(ctx,W,H,groundY,time,speed);break;case"pixel_cave":this.renderPixelCave(ctx,W,H,groundY,time,speed);break;default:this.renderCyberGrid(ctx,W,H,groundY,time,speed,"#00f6ff");break;}}finally{ctx.fillStyle=saveFill;ctx.strokeStyle=saveStroke;ctx.globalAlpha=saveAlpha}},
    renderStarfield(ctx, W, H, time, speed, hueShift) {ctx.fillStyle="#020412";ctx.fillRect(0,0,W,H);if(!_starsInitialized){_stars=[];for(var i=0;i<130;i++){var layer=Math.random();var z=layer<0.4?0.3:(layer<0.75?0.6:1.0);_stars.push({x:Math.random()*W,y:Math.random()*H*0.7,z:z,size:z*2.5,twinklePhase:Math.random()*Math.PI*2,twinkleSpeed:0.5+Math.random()*2,brightness:0.3+Math.random()*0.7})}_starsInitialized=true}for(var si=0;si<_stars.length;si++){var s=_stars[si];s.x-=speed*s.z*0.15*_step;if(s.x<-s.size){s.x=W+s.size;s.y=Math.random()*H*0.7}var alpha=s.brightness*(0.4+0.6*(Math.sin(time*s.twinkleSpeed+s.twinklePhase)*0.5+0.5));ctx.globalAlpha=alpha;ctx.fillStyle=s.z>0.7?"#cceeff":(s.z>0.4?"#88bbff":"#6699cc");ctx.fillRect(s.x-s.size/2,s.y-s.size/2,s.size,s.size)}ctx.globalAlpha=1},
    renderEnergyGrid(ctx, W, H, time, hueShift) {ctx.fillStyle="#040618";ctx.fillRect(0,0,W,H);var cx=W/2;var cy=H/2;for(var i=0;i<6;i++){var r=Math.min(W,H)*0.07+i*Math.min(W,H)*0.1+Math.min(W,H)*0.04*Math.sin(time*1.8+i*0.9);var hue=(time*50+i*40)%360;applyGlow(ctx,"hsl("+hue.toFixed(0)+",80%,55%)",10);ctx.strokeStyle="hsl("+hue.toFixed(0)+",80%,55%)";ctx.lineWidth=1.5;ctx.globalAlpha=0.5;ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.stroke();clearGlow(ctx)}for(var i=0;i<10;i++){var angle=(i/10)*Math.PI*2+time*0.3;ctx.strokeStyle="hsl("+((time*40+i*30)%360).toFixed(0)+",70%,40%)";ctx.lineWidth=1;ctx.globalAlpha=0.25;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(angle)*Math.min(W,H)*0.65,cy+Math.sin(angle)*Math.min(W,H)*0.65);ctx.stroke()}ctx.globalAlpha=1},
    renderCyberColumns(ctx,W,H,groundY,time,speed,hueShift){var grad=ctx.createLinearGradient(0,0,W*0.15,0);grad.addColorStop(0,"#0a0a30");grad.addColorStop(0.3,"#050520");grad.addColorStop(0.7,"#050520");grad.addColorStop(1,"#0a0a30");ctx.fillStyle=grad;ctx.fillRect(0,0,W,H);ctx.fillStyle="#020615";ctx.fillRect(0,0,W,H);var colW=W*0.06;var gap=W*0.04;var cols=Math.ceil(W/(colW+gap))+2;var offset=(time*speed*0.35)%(colW+gap);for(var i=0;i<cols;i++){var x=-colW+i*(colW+gap)+offset;var h=H*0.4+Math.sin(i*1.7+time*0.8)*H*0.15;var alpha=0.2+0.3*Math.abs(Math.sin(i*0.6+time*0.5));applyGlow(ctx,"#4466ff",8);var colGrad=ctx.createLinearGradient(x,groundY-h,x,groundY);colGrad.addColorStop(0,"rgba(30,60,200,0)");colGrad.addColorStop(0.3,"rgba(50,100,255,"+alpha.toFixed(2)+")");colGrad.addColorStop(1,"rgba(20,40,150,"+(alpha*0.4).toFixed(2)+")");ctx.fillStyle=colGrad;ctx.fillRect(x,groundY-h,colW,h);clearGlow(ctx)}},
    renderGeoLandscape(ctx,W,H,groundY,time,speed,hueShift){var g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,"#04061a");g.addColorStop(0.5,"#0a0f30");g.addColorStop(1,"#0d0520");ctx.fillStyle=g;ctx.fillRect(0,0,W,H);var off=(time*speed*0.2)%(W*3);var baseY=groundY+H*0.1;var peakCount=28;var segW=W/(peakCount-1);var layers=[{amp:H*0.25,color:"rgba(20,15,50,0.8)",spd:0.3,po:0},{amp:H*0.35,color:"rgba(40,20,80,0.6)",spd:0.55,po:0.25},{amp:H*0.45,color:"rgba(60,30,100,0.4)",spd:0.8,po:0.5}];for(var li=layers.length-1;li>=0;li--){var lay=layers[li];var lo=off*lay.spd;ctx.beginPath();ctx.moveTo(-50,H+50);for(var i=0;i<=peakCount;i++){var px=i*segW-50;var n1=noise1D((px+lo)*0.0015+_landscapeSeed+lay.po,time*0.15);var n2=noise1D((px+lo)*0.003+_landscapeSeed+lay.po+10,time*0.2)*0.5;var py=baseY-lay.amp*(n1+n2)/1.5;if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py)}ctx.lineTo(W+50,H+50);ctx.closePath();ctx.fillStyle=lay.color;ctx.fill();ctx.strokeStyle=li===0?"#ff44ff":(li===1?"#8844cc":"#4422aa");ctx.lineWidth=li===0?2.5:1.5;ctx.globalAlpha=li===0?0.9:0.5;ctx.beginPath();for(var j=0;j<=peakCount;j++){var qx=j*segW-50;var qn1=noise1D((qx+lo)*0.0015+_landscapeSeed+lay.po,time*0.15);var qn2=noise1D((qx+lo)*0.003+_landscapeSeed+lay.po+10,time*0.2)*0.5;var qy=baseY-lay.amp*(qn1+qn2)/1.5;if(j===0)ctx.moveTo(qx,qy);else ctx.lineTo(qx,qy)}ctx.stroke()}ctx.globalAlpha=1;for(var di=0;di<30;di++){var dx=(di*317.3+199)%W;var dy=(di*239.7+137)%(groundY*0.6);var da=0.2+0.4*Math.abs(Math.sin(time*1.8+di*0.5));ctx.fillStyle="rgba(200,160,255,"+da.toFixed(2)+")";ctx.fillRect(dx,dy,2,2)}},
    renderParallaxCity(ctx,W,H,groundY,time,speed,hueShift){var g=ctx.createLinearGradient(0,0,0,groundY);g.addColorStop(0,"#1a0a2e");g.addColorStop(0.3,"#2d1050");g.addColorStop(0.6,"#8b1550");g.addColorStop(0.85,"#d43820");g.addColorStop(1,"#f5a623");ctx.fillStyle=g;ctx.fillRect(0,0,W,groundY);ctx.fillStyle="#0a0618";ctx.fillRect(0,groundY,W,H-groundY);var sunX=W*0.5;var sunY=groundY*0.78;var sunR=Math.min(W,H)*0.13;applyGlow(ctx,"#f5a623",35);ctx.fillStyle="#f5a623";ctx.beginPath();ctx.arc(sunX,sunY,sunR,0,Math.PI*2);ctx.fill();clearGlow(ctx);var pc=30;var sw=W/(pc-1);var moff=(time*speed*0.08)%(W*2);var mc=["#1a0a2e","#2d1050","#4a1560"];for(var ml=0;ml<3;ml++){var mo=moff*(0.3+ml*0.35);ctx.fillStyle=mc[ml];ctx.globalAlpha=0.7+ml*0.1;ctx.beginPath();ctx.moveTo(-50,groundY);for(var mi=0;mi<=pc;mi++){var mx=mi*sw-50;var mh=H*0.08+H*(0.08+ml*0.06)*(noise1D((mx+mo)*0.004+50+ml*30,time*0.1));ctx.lineTo(mx,groundY-mh)}ctx.lineTo(W+50,groundY);ctx.closePath();ctx.fill()}ctx.globalAlpha=1;var gs=16;var gOff=(time*speed*0.12)%gs;ctx.strokeStyle="rgba(255,100,150,0.15)";ctx.lineWidth=1;ctx.beginPath();for(var gx=-gs+gOff;gx<W;gx+=gs){ctx.moveTo(gx,groundY);ctx.lineTo(gx+(gx-W/2)*2.2,H)}for(var gy=groundY;gy<H;gy+=gs){ctx.moveTo(0,gy);ctx.lineTo(W,gy)}ctx.stroke();var ss=3;var so=(time*60+hueShift)%(ss*2);ctx.fillStyle="rgba(0,0,0,0.05)";for(var sl=so;sl<H;sl+=ss*2)ctx.fillRect(0,sl,W,ss);for(var si=0;si<45;si++){var sx=(si*213.7+421+hueShift)%W;var sy=(si*117.3+73)%(groundY*0.65);var tw=0.3+0.7*Math.abs(Math.sin(time*2.5+si*0.7));ctx.fillStyle="rgba(255,255,255,"+tw.toFixed(2)+")";ctx.fillRect(sx,sy,2,2)}},
    renderGrandHex(ctx,W,H,groundY,time,speed,hueShift){ctx.fillStyle="#040610";ctx.fillRect(0,0,W,H);var hr=28;var hw=hr*1.5;var hh=hr*0.87;var cols=Math.ceil(W/hw)+2;var rows=Math.ceil(H/hh)+2;var off=(time*speed*0.12)%(hw*2);for(var row=-1;row<rows;row++){for(var col=-1;col<cols;col++){var cx=col*hw+(row%2===0?0:hw*0.5)-off;var cy=row*hh-(off*0.3)%(hh*2);if(cx<-hw||cx>W+hw||cy<-hh||cy>H+hh)continue;var dist=Math.sqrt(Math.pow(cx-W/2,2)+Math.pow(cy-H/2,2));var wave=Math.sin(dist*0.01-time*2)*0.5+0.5;var hue=(45+wave*15+hueShift)%360;var br=30+wave*20;var al=0.1+wave*0.2;ctx.strokeStyle="hsla("+hue.toFixed(0)+",60%,"+br.toFixed(0)+"%,"+al.toFixed(2)+")";ctx.lineWidth=0.8;ctx.beginPath();for(var s=0;s<6;s++){var a=Math.PI/3*s+Math.PI/6;var px=cx+Math.cos(a)*hr*0.95;var py=cy+Math.sin(a)*hr*0.95;if(s===0)ctx.moveTo(px,py);else ctx.lineTo(px,py)}ctx.closePath();ctx.stroke()}}},
    renderDemonFallback(ctx,W,H,groundY,time,speed,hueShift){var g=ctx.createRadialGradient(W*0.5,H*0.4,0,W*0.5,H*0.4,Math.max(W,H)*0.7);g.addColorStop(0,"#1a0000");g.addColorStop(0.4,"#0d0000");g.addColorStop(1,"#020000");ctx.fillStyle=g;ctx.fillRect(0,0,W,H);var cx=W*0.5;var cy=H*0.4;for(var ci=0;ci<8;ci++){var cxx=ci<4?-W*0.1+ci*W*0.08:W*0.75+(ci-4)*W*0.08;ctx.fillStyle="rgba(120,10,0,"+(0.08+0.05*Math.sin(time*1.3+ci*0.7)).toFixed(2)+")";ctx.beginPath();ctx.ellipse(cxx,groundY-H*0.09,W*0.12+Math.sin(time*0.6+ci)*15,H*0.3+Math.cos(time*0.4+ci)*20,0,0,Math.PI*2);ctx.fill()}for(var ri=0;ri<5;ri++){var baseR=Math.min(W,H)*0.08+ri*Math.min(W,H)*0.1;var pulse=Math.sin(time*2.3+ri*0.8)*0.5+0.5;var r=baseR+pulse*Math.min(W,H)*0.04;applyGlow(ctx,"#ff2200",12);ctx.strokeStyle="rgba(255,34,0,"+(0.15+pulse*0.2).toFixed(2)+")";ctx.lineWidth=2;ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.stroke();clearGlow(ctx)}for(var ri=0;ri<16;ri++){var a=ri*Math.PI*2/16+time*0.4;ctx.strokeStyle="rgba(255,50,0,"+(0.05+0.08*Math.sin(time*3+ri*0.5)).toFixed(2)+")";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(a)*Math.min(W,H)*0.55,cy+Math.sin(a)*Math.min(W,H)*0.55);ctx.stroke()}for(var ei=0;ei<40;ei++){var ex=(ei*197.3+631)%W;var ey=(ei*281.7+191)%(H*0.6);var el=Math.abs(Math.sin(time*2.1+ei*0.4));ctx.fillStyle="rgba(255,"+Math.round(60+el*120)+",0,"+(el*0.7).toFixed(2)+")";ctx.fillRect(ex,ey,1+el*3,1+el*3)}applyGlow(ctx,"#ff0000",40);ctx.strokeStyle="rgba(255,0,0,0.3)";ctx.lineWidth=3;ctx.beginPath();ctx.arc(cx,cy,Math.min(W,H)*0.06+Math.sin(time*2.3)*4,0,Math.PI*2);ctx.stroke();clearGlow(ctx)},
    renderDigitalRain(ctx,W,H,groundY,time,speed,hueShift){var g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,"#0a0010");g.addColorStop(1,"#100018");ctx.fillStyle=g;ctx.fillRect(0,0,W,H);this.renderDemonFallback(ctx,W,H,groundY,time,speed*0.5,hueShift);},
    
    renderToxicWaste(ctx,W,H,groundY,time,speed,hueShift){var g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,"#030f06");g.addColorStop(1,"#051a0c");ctx.fillStyle=g;ctx.fillRect(0,0,W,H);var wb=groundY-H*0.02;var lays=[{amp:H*0.06,freq:0.003,alpha:0.6,color:"#1a4a20"},{amp:H*0.08,freq:0.004,alpha:0.45,color:"#2a6a30"},{amp:H*0.05,freq:0.005,alpha:0.3,color:"#3a8a40"}];for(var l=0;l<lays.length;l++){var lay=lays[l];ctx.fillStyle=lay.color;ctx.globalAlpha=lay.alpha;ctx.beginPath();ctx.moveTo(0,H);for(var x=0;x<=W;x+=12){var n=Math.sin(x*lay.freq+time*1.5+l)*Math.cos(x*lay.freq*0.7-time*1.1+l)*0.5+0.5;var y=wb-lay.amp*n;ctx.lineTo(x,y);}ctx.lineTo(W,H);ctx.closePath();ctx.fill();}ctx.globalAlpha=1;for(var bi=0;bi<35;bi++){var bx=(bi*277.3+444)%W;var by=groundY+H*0.3-((bi*0.5+time*0.7)%1)*H*0.5;var br=2+Math.sin(bi*2.1)*2;if(by<wb)continue;ctx.strokeStyle="rgba(100,255,100,0.25)";ctx.lineWidth=1;ctx.beginPath();ctx.arc(bx,by,br,0,Math.PI*2);ctx.stroke();}var topBubs=this._toxicTop||[];if(topBubs.length===0){for(var i=0;i<15;i++)topBubs.push({x:Math.random()*W,y:Math.random()*H*0.2,life:0,maxLife:1.5+Math.random()*2,r:5+Math.random()*12});this._toxicTop=topBubs;}for(var i=topBubs.length-1;i>=0;i--){var tb=topBubs[i];tb.life+=0.016*_step;var prog=tb.life/tb.maxLife;if(prog>=1){tb.x=Math.random()*W;tb.y=Math.random()*H*0.2;tb.life=0;tb.maxLife=1.5+Math.random()*2;tb.r=5+Math.random()*12;}var al=prog<0.3?prog/0.3:(1-prog)/0.7;ctx.strokeStyle="rgba(100,255,80,"+(al*0.6).toFixed(2)+")";ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(tb.x,tb.y,tb.r*(0.5+prog*0.5),0,Math.PI*2);ctx.stroke();}},
    renderNeonRain(ctx,W,H,time,hueShift){ctx.fillStyle="#030512";ctx.fillRect(0,0,W,H);_rainTimer-=_step;if(_rainTimer<=0&&_raindrops.length<120){var cnt=4+Math.floor(Math.random()*4);for(var i=0;i<cnt;i++){if(_raindrops.length>=120)break;var bg=Math.random()<0.4;if(bg)_raindrops.push({x:Math.random()*W,y:Math.random()*-H*0.4,speed:120+Math.random()*100,len:20+Math.random()*30,big:true,alpha:0.12+Math.random()*0.1,color:"#2288cc"});else _raindrops.push({x:Math.random()*W,y:Math.random()*-H*0.3,speed:250+Math.random()*200,len:10+Math.random()*18,big:false,alpha:0.6+Math.random()*0.3,color:"#00ffff"});}_rainTimer=1+Math.random()*3;}for(var bi=0;bi<2;bi++){for(var i=_raindrops.length-1;i>=0;i--){var r=_raindrops[i];if(bi===0&&r.big)continue;if(bi===1&&!r.big)continue;r.y+=r.speed*0.016*_step;if(bi===1){ctx.strokeStyle=r.color;ctx.lineWidth=1;ctx.globalAlpha=r.alpha;ctx.beginPath();ctx.moveTo(r.x,r.y-r.len);ctx.lineTo(r.x,r.y);ctx.stroke();}else{ctx.strokeStyle=r.color;ctx.lineWidth=2.5;ctx.globalAlpha=r.alpha*0.7;ctx.beginPath();ctx.moveTo(r.x,r.y-r.len);ctx.lineTo(r.x,r.y);ctx.stroke();ctx.beginPath();ctx.arc(r.x,r.y,1.2,0,Math.PI*2);ctx.fillStyle="#fff";ctx.fill();}if(r.y>H){if(!r.big)for(var s=0;s<3;s++)_sparks.push({x:r.x,y:H,vx:(Math.random()-0.5)*40,vy:-40-Math.random()*60,size:1+Math.random()*1.5,life:0.15+Math.random()*0.15,color:r.color});_raindrops.splice(i,1);}}}ctx.globalAlpha=1;},
    renderBezierWaves(ctx,W,H,groundY,time,hueShift){var g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,"#0a0820");g.addColorStop(1,"#0d0a28");ctx.fillStyle=g;ctx.fillRect(0,0,W,H);var wcs=[{freq:0.7,amp:H*0.12,ph:time*0.5,color:"#ff2ea6",alpha:0.15,width:4},{freq:1.0,amp:H*0.18,ph:time*0.7,color:"#00f6ff",alpha:0.2,width:3},{freq:1.6,amp:H*0.09,ph:time*1.0,color:"#ffe14d",alpha:0.2,width:2},{freq:2.3,amp:H*0.15,ph:time*1.2,color:"#00ff88",alpha:0.15,width:3},{freq:3.1,amp:H*0.22,ph:time*1.5,color:"#ff6600",alpha:0.12,width:4},{freq:4.0,amp:H*0.06,ph:time*1.8,color:"#cc44ff",alpha:0.25,width:1.5},{freq:0.9,amp:H*0.28,ph:time*2.0,color:"#ff8844",alpha:0.08,width:5}];for(var wi=0;wi<wcs.length;wi++){var wc=wcs[wi];ctx.globalAlpha=wc.alpha;ctx.strokeStyle=wc.color;ctx.lineWidth=wc.width;ctx.beginPath();var by=groundY-H*0.05-wc.amp;ctx.moveTo(0,by);var segs=60;for(var i=0;i<=segs;i++){var t=i/segs;var x=t*W;var w1=Math.sin(t*wc.freq*Math.PI*2+wc.ph);var w2=Math.sin(t*wc.freq*1.7*Math.PI*2-wc.ph*0.7)*0.5;var y=by+(w1+w2)*wc.amp;if(i===0)ctx.lineTo(x,y);else{var pt=(i-1)/segs;var pw1=Math.sin(pt*wc.freq*Math.PI*2+wc.ph);var pw2=Math.sin(pt*wc.freq*1.7*Math.PI*2-wc.ph*0.7)*0.5;var py=by+(pw1+pw2)*wc.amp;ctx.bezierCurveTo((x+pt*W)/2,py,(x+pt*W)/2,y,x,y);}}ctx.stroke();}ctx.globalAlpha=1;},
    
    renderMidnightSkyline(ctx,W,H,groundY,time,speed,hueShift){/* Статичне небо малюється один раз у буфер: заливка градієнтом на весь екран дорожча за копіювання */var sky=this._skyBg;if(!sky){var sc=document.createElement("canvas");sc.width=Math.ceil(W);sc.height=Math.ceil(H);var sx=sc.getContext("2d");var g=sx.createLinearGradient(0,0,0,H);g.addColorStop(0,"#050515");g.addColorStop(0.4,"#0c0c30");g.addColorStop(1,"#151540");sx.fillStyle=g;sx.fillRect(0,0,W,H);sky=sc;this._skyBg=sky;}ctx.drawImage(sky,0,0,W,H);var bd=this._skyData;if(!bd){bd=[];for(var l=0;l<3;l++){var bl=[];var x=0;var cnt=[8,6,4][l];for(var i=0;i<cnt;i++){var w=40+Math.random()*W*0.15;var h=H*0.15+Math.random()*H*0.35;var g2=20+Math.random()*W*0.1;var ws=[];for(var wr=0;wr<Math.floor(h/14);wr++)for(var wc=0;wc<Math.floor(w/12);wc++)ws.push({ox:wc*12+4,oy:wr*14+6,ph:Math.random()*Math.PI*2,fq:1.5+Math.random()*2.5});bl.push({x:x,w:w,h:h,wins:ws});x+=w+g2;}bd.push({bld:bl,tw:x,color:["#181830","#222250","#2a2a60"][l],spd:[0.12,0.3,0.5][l]});}this._skyData=bd;}/* Вікна групуються за кольором і яскравістю (крок 0.02): fillStyle задається раз на групу з готової таблиці рядків замість збирання рядка кольору для кожного вікна */var tbl=_skyWindowStyles();var buckets=_skyBuckets;for(var l=0;l<3;l++){var ld=bd[l];/* Зсув округлено до цілих пікселів: копіювання смуги з дробовим зсувом у рази дорожче (перерахунок кожного пікселя) */var off=Math.round((time*speed*ld.spd*0.3)%ld.tw);for(var k=0;k<buckets.length;k++)buckets[k].length=0;/* Силуети шару статичні й лише зсуваються: малюються один раз у смугу шириною tw, далі дві копії зі зсувом */if(!ld.strip){var mh=0;for(var bi=0;bi<ld.bld.length;bi++)mh=Math.max(mh,ld.bld[bi].h);var stc=document.createElement("canvas");stc.width=Math.ceil(ld.tw)+2;stc.height=Math.ceil(mh)+2;var stx=stc.getContext("2d");for(var bi=0;bi<ld.bld.length;bi++){var sb=ld.bld[bi];var sy=stc.height-1-sb.h;stx.fillStyle=ld.color;stx.fillRect(sb.x+1,sy,sb.w,sb.h);stx.strokeStyle="rgba(80,80,150,0.5)";stx.lineWidth=1;stx.strokeRect(sb.x+1,sy,sb.w,sb.h);}ld.strip=stc;}for(var d=0;d<2;d++){var sxp=-off+d*ld.tw-1;if(sxp+ld.strip.width<0||sxp>W)continue;ctx.drawImage(ld.strip,sxp,Math.round(groundY)+1-ld.strip.height);}for(var bi=0;bi<ld.bld.length;bi++){var b=ld.bld[bi];for(var d=0;d<2;d++){var dx=b.x-off+d*ld.tw;if(dx+b.w<0||dx>W)continue;var top=Math.round(groundY)-b.h;for(var wi=0;wi<b.wins.length;wi++){var w=b.wins[wi];var br=Math.sin(time*w.fq+w.ph);if(br>0.3){var lvl=Math.round((br-0.3)*25);var bk=buckets[(wi%SKY_WINDOW_COLORS.length)*SKY_ALPHA_LEVELS+lvl];bk.push(dx+w.ox,top+w.oy);}}}}for(var k=0;k<buckets.length;k++){var bk=buckets[k];if(bk.length===0)continue;ctx.fillStyle=tbl[k];for(var q=0;q<bk.length;q+=2)ctx.fillRect(bk[q],bk[q+1],5,5);}}},
    renderRooftopGrid(ctx,W,H,groundY,time,speed,hueShift){ctx.fillStyle="#0a0520";ctx.fillRect(0,0,W,H);var vanishX=W*0.5;var vanishY=H*0.15;var gridSpacing=28;var offset=(time*speed*0.3)%gridSpacing;var hCount=Math.ceil(H/gridSpacing)+4;for(var i=-4;i<hCount;i++){var rawY=i*gridSpacing+(offset%gridSpacing);var t=(rawY-vanishY)/(H-vanishY);if(t<0.02)continue;ctx.strokeStyle="rgba(255,60,140,"+(0.25*(1-t*t)).toFixed(2)+")";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,rawY);ctx.lineTo(W,rawY);ctx.stroke();}ctx.strokeStyle="rgba(80,120,255,0.18)";ctx.lineWidth=1;ctx.beginPath();var vc=Math.ceil(W/gridSpacing)+4;var vo=(time*speed*0.15)%gridSpacing;for(var i=-4;i<vc;i++){var rx=i*gridSpacing+vo;ctx.moveTo(rx,vanishY);ctx.lineTo(rx+(rx-vanishX)*1.2,H);}ctx.stroke();for(var di=0;di<30;di++){var dx=(di*233.3+111)%W;var dy=vanishY+((di*0.3+time*0.15)%1)*(H-vanishY);ctx.fillStyle="rgba(255,100,200,"+(0.3+0.5*Math.abs(Math.sin(time*2+di*0.6))).toFixed(2)+")";ctx.fillRect(dx,dy,2,2);}},
    
    renderEquatorBeam(ctx,W,H,groundY,time,speed,hueShift){ctx.fillStyle="#030615";ctx.fillRect(0,0,W,H);var by=H*0.45;var pl=Math.sin(time*1.5)*0.5+0.5;var bh=4+pl*6;if(pl>0.75){var burstAlpha=(pl-0.75)*4;for(var bi=0;bi<12;bi++){var bx=(bi/11)*W+Math.sin(bi+time)*20;ctx.strokeStyle="rgba(0,200,255,"+(burstAlpha*0.15).toFixed(2)+")";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(bx,by);ctx.lineTo(bx,0);ctx.moveTo(bx,by);ctx.lineTo(bx,H);ctx.stroke();}}applyGlow(ctx,"#00ccff",20);var bg=ctx.createLinearGradient(0,by-bh,0,by+bh);bg.addColorStop(0,"transparent");bg.addColorStop(0.3,"rgba(0,200,255,"+(0.4+pl*0.3).toFixed(2)+")");bg.addColorStop(0.5,"rgba(0,220,255,"+(0.7+pl*0.2).toFixed(2)+")");bg.addColorStop(0.7,"rgba(0,200,255,"+(0.4+pl*0.3).toFixed(2)+")");bg.addColorStop(1,"transparent");ctx.fillStyle=bg;ctx.fillRect(0,by-bh,W,bh*2);clearGlow(ctx);for(var si=0;si<80;si++){var sx=(si*167.3+91)%W;var sy=si<40?(si*37.7+17)%(by-10):by+10+(si*53.1+29)%(H-by-10);var sa=0.2+0.7*Math.abs(Math.sin(time*2.5+si*0.4));ctx.fillStyle="rgba(100,200,255,"+sa.toFixed(2)+")";ctx.fillRect(sx,sy,1.5,2);}},
    renderVowelWaves(ctx,W,H,groundY,time,speed,hueShift){ctx.fillStyle="#040612";ctx.fillRect(0,0,W,H);var wc=["#ff4444","#ff8844","#ffdd44","#44ff44","#44ddff","#4444ff","#cc44ff"];for(var wi=0;wi<7;wi++){var amp=H*0.04+wi*H*0.025+Math.sin(time*0.3+wi)*H*0.015;var freq=1.5+wi*0.7+Math.sin(time*0.2+wi)*0.3;var ph=time*(0.5+wi*0.35);var bY=H*0.25+wi*H*0.08;ctx.strokeStyle=wc[wi];ctx.lineWidth=1.5+wi*0.4;ctx.globalAlpha=0.25+wi*0.08;ctx.beginPath();for(var x=0;x<=W;x+=6){var y=bY+Math.sin(x*0.004*freq+ph)*amp+Math.sin(x*0.007*freq*0.6-ph*0.5)*amp*0.4;if(x===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.stroke();}ctx.globalAlpha=1;},
    
    renderEqualizer(ctx,W,H,time,hueShift){var g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,"#0a0418");g.addColorStop(1,"#150830");ctx.fillStyle=g;ctx.fillRect(0,0,W,H);var bc=22;var gap=2;var bw=(W-gap*(bc+1))/bc;var maxH=H*0.75;for(var i=0;i<bc;i++){var t=time;var prod=Math.sin(t*2.7+i*0.4)*0.5+0.5;var prod2=Math.sin(t*1.3+i*0.7)*0.5+0.5;var prod3=Math.cos(t*4.1+i*1.1)*0.5+0.5;var height=H*0.04+prod*prod2*prod3*maxH;var x=gap+i*(bw+gap);var y=H-height;var bg=ctx.createLinearGradient(x,y,x,H);bg.addColorStop(0,"#ff44ff");bg.addColorStop(0.5,"#cc22aa");bg.addColorStop(1,"#220033");applyGlow(ctx,"#ff44ff",8);ctx.fillStyle=bg;ctx.fillRect(x,y,bw,height);ctx.strokeStyle="#ff88ff";ctx.lineWidth=1;ctx.strokeRect(x,y,bw,height);clearGlow(ctx);}},
    renderGlitchField(ctx,W,H,groundY,time,speed,hueShift){ctx.fillStyle="#020204";ctx.fillRect(0,0,W,H);for(var bi=0;bi<8;bi++){var gy=(bi*H*0.12+time*speed*0.3)%H;var gh=(bi*7+3)%15+3;ctx.fillStyle="rgba(255,"+Math.floor((bi*40)%150)+","+Math.floor((bi*30)%100)+",0.06)";ctx.fillRect(0,gy,W,gh);}for(var bi=0;bi<5;bi++){var gx=(bi*W*0.2+time*speed*0.5)%W;ctx.fillStyle="rgba(100,255,200,0.05)";ctx.fillRect(gx,0,20+bi*15,H);}ctx.fillStyle="rgba(0,0,0,0.08)";for(var sl=(time*80)%6;sl<H;sl+=6)ctx.fillRect(0,sl,W,3);for(var pi=0;pi<80;pi++){var px=(pi*311.7+213)%W;var py=((pi*0.1+time*0.5)%1)*H;var hue=(pi*30+time*40+hueShift)%360;var sz=Math.random()<0.15?2+Math.random()*3:1;ctx.fillStyle="hsla("+hue.toFixed(0)+",80%,60%,"+(0.3+Math.random()*0.4).toFixed(2)+")";ctx.fillRect(px,py,sz,sz+Math.random());}},
    
    renderPulsarCore(ctx,W,H,groundY,time,speed,hueShift){ctx.fillStyle="#080810";ctx.fillRect(0,0,W,H);var ps=[{x:W*0.55,y:H*0.4,c:"#ffaa00",h:30},{x:W*0.3,y:H*0.55,c:"#00ff66",h:120},{x:W*0.7,y:H*0.5,c:"#4488ff",h:200},{x:W*0.45,y:H*0.25,c:"#ff4488",h:350},{x:W*0.65,y:H*0.65,c:"#aaff00",h:80},{x:W*0.2,y:H*0.35,c:"#ff8844",h:170},{x:W*0.8,y:H*0.3,c:"#44ffff",h:260}];for(var ci=0;ci<ps.length;ci++){var p=ps[ci];var pl=Math.sin(time*2.5+ci*0.6)*0.5+0.5;applyGlow(ctx,p.c,25);for(var ri=0;ri<4;ri++){var r=Math.min(W,H)*0.03+ri*Math.min(W,H)*0.04+pl*Math.min(W,H)*0.015;ctx.strokeStyle="hsla("+(p.h+ri*15).toFixed(0)+",80%,50%,"+(0.3-ri*0.06).toFixed(2)+")";ctx.lineWidth=1;ctx.beginPath();ctx.arc(p.x,p.y,r,0,Math.PI*2);ctx.stroke();}clearGlow(ctx);for(var ri=0;ri<6;ri++){var a=ri*Math.PI*2/6+time*0.2;ctx.strokeStyle="hsla("+p.h.toFixed(0)+",60%,35%,0.05)";ctx.lineWidth=0.6;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+Math.cos(a)*Math.min(W,H)*0.25,p.y+Math.sin(a)*Math.min(W,H)*0.25);ctx.stroke();}var cg=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,Math.min(W,H)*0.03+pl*2);cg.addColorStop(0,p.c);cg.addColorStop(1,"transparent");ctx.fillStyle=cg;ctx.fillRect(p.x-15,p.y-15,30,30);}var hex=18;ctx.strokeStyle="rgba(50,40,20,0.08)";ctx.lineWidth=0.3;/* Сітка шестикутників статична: малюється один раз у буфер потрібного розміру, далі лише копіюється */var hg=this._pulsarHex;if(!hg||hg.W!==W||hg.H!==H){var hc=document.createElement("canvas");hc.width=Math.ceil(W);hc.height=Math.ceil(H);var hctx=hc.getContext("2d");hctx.strokeStyle="rgba(50,40,20,0.08)";hctx.lineWidth=0.3;for(var hy=-hex;hy<H+hex;hy+=hex*0.87){for(var hx=-hex;hx<W+hex;hx+=hex*1.5){var ox=hy%(hex*3)<hex*1.5?hex*0.75:0;hctx.beginPath();for(var s=0;s<6;s++){var a2=Math.PI/3*s;if(s===0)hctx.moveTo(hx+ox+Math.cos(a2)*hex*0.5,hy+Math.sin(a2)*hex*0.5);else hctx.lineTo(hx+ox+Math.cos(a2)*hex*0.5,hy+Math.sin(a2)*hex*0.5);}hctx.closePath();hctx.stroke();}}hg={W:W,H:H,canvas:hc};this._pulsarHex=hg;}ctx.drawImage(hg.canvas,0,0,W,H);},
    renderScanlineSweep(ctx,W,H,groundY,time,speed,hueShift){var g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,"#060218");g.addColorStop(0.5,"#0c0430");g.addColorStop(1,"#080420");ctx.fillStyle=g;ctx.fillRect(0,0,W,H);var lines=[{spd:0.3,clr:"#9966ff",ang:0.008,ph:0},{spd:-0.45,clr:"#ff4488",ang:-0.012,ph:2},{spd:0.2,clr:"#44ffcc",ang:0.006,ph:4}];for(var li=0;li<3;li++){var ln=lines[li];var my=((time*speed*ln.spd+H*5)%(H+200))-100;for(var ag=1;ag<=4;ag++){var ay=my+ag*15;if(ay<-30||ay>H+30)continue;var aa=0.12*(1-ag/5);ctx.strokeStyle="rgba("+parseInt(ln.clr.slice(1,3),16)+","+parseInt(ln.clr.slice(3,5),16)+","+parseInt(ln.clr.slice(5,7),16)+","+aa.toFixed(2)+")";ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(0,ay);ctx.lineTo(W,ay+Math.sin(ay*ln.ang+time)*12);ctx.stroke();}applyGlow(ctx,ln.clr,10);ctx.strokeStyle=ln.clr;ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(0,my);ctx.lineTo(W,my+Math.sin(my*ln.ang+time)*12);ctx.stroke();clearGlow(ctx);}},
    renderHyperspaceTunnel(ctx,W,H,time,speed,hueShift){ctx.fillStyle="#020612";ctx.fillRect(0,0,W,H);var cx=W/2;var cy=H/2;var mr=Math.min(W,H)*0.55;var ph=(time*speed*0.002)%1;var hb=(hueShift+time*20)%360;applyGlow(ctx,"hsl("+hb.toFixed(0)+",90%,50%)",12);for(var i=0;i<8;i++){var t=(i/8+ph)%1;var r=mr*Math.pow(t,1.8)*0.92;var al=0.2+(1-t)*0.65;var hue=(hb+i*30)%360;ctx.strokeStyle="hsla("+hue.toFixed(0)+",80%,"+(35+t*30).toFixed(0)+"%,"+al.toFixed(2)+")";ctx.lineWidth=1+t*4;ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.stroke();}clearGlow(ctx);for(var si=0;si<80;si++){var a=(si*2.399+time*0.15)%(Math.PI*2);var d=(si*137.5+500)%Math.floor(mr*0.85);ctx.fillStyle="rgba(255,255,255,"+(0.3+0.5*Math.abs(Math.sin(time*3+si*0.3))).toFixed(2)+")";ctx.fillRect(cx+Math.cos(a)*d,cy+Math.sin(a)*d,1,1);}},
    renderBinaryStar(ctx,W,H,groundY,time,speed,hueShift){ctx.fillStyle="#020810";ctx.fillRect(0,0,W,H);var cx=W*0.5;var cy=H*0.4;var orbitR=Math.min(W,H)*0.15;var a1=time*0.6;var a2=a1+Math.PI;var sizes=[{x:cx+Math.cos(a1)*orbitR,y:cy+Math.sin(a1)*orbitR*0.5,r:Math.min(W,H)*0.05,c:"#ffcc33",g:"#ffaa00"},{x:cx+Math.cos(a2)*orbitR,y:cy+Math.sin(a2)*orbitR*0.5,r:Math.min(W,H)*0.07,c:"#44aaff",g:"#0066cc"}];for(var ri=0;ri<6;ri++){var t=(time*speed*0.06+ri/6)%1;var r=Math.min(W,H)*0.3*t;ctx.strokeStyle="rgba(100,200,255,"+(0.06*(1-t)).toFixed(2)+")";ctx.lineWidth=0.6;ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.stroke();}for(var si=0;si<2;si++){var s=sizes[si];for(var l=0;l<3;l++){var lr=s.r*(0.6+l*0.35);var la=0.5-l*0.15;applyGlow(ctx,s.c,15+si*8);var sg=ctx.createRadialGradient(s.x,s.y,0,s.x,s.y,lr);sg.addColorStop(0,"rgba(255,255,255,"+(la*0.4).toFixed(2)+")");sg.addColorStop(0.4,s.c);sg.addColorStop(1,"transparent");ctx.fillStyle=sg;ctx.beginPath();ctx.arc(s.x,s.y,lr,0,Math.PI*2);ctx.fill();clearGlow(ctx);}}for(var pi=0;pi<60;pi++){var px=(pi*173.3+301)%W;var py=(pi*211.7+89)%H;ctx.fillStyle="rgba(180,200,255,"+(0.3+0.5*Math.abs(Math.sin(time*2+pi*0.4))).toFixed(2)+")";ctx.fillRect(px,py,1.5,1.5);}},
    renderAuroraWings(ctx,W,H,groundY,time,speed,hueShift){ctx.fillStyle="#020615";ctx.fillRect(0,0,W,H);var bands=10;for(var b=0;b<bands;b++){var bw=W*0.06+b*W*0.008;var bx=W*0.05+b*W*0.09;var bas=0.06+0.14*Math.sin(time*0.7+b*1.1);ctx.globalAlpha=bas;var wShape=b%4;ctx.beginPath();for(var y=0;y<=groundY*0.8;y+=3){var xOff=Math.sin(y*0.008+time*1.3+b*0.7)*35+(wShape===1?Math.cos(y*0.012+time)*30:wShape===2?Math.sin(y*0.01+time*0.7)*40:wShape===3?Math.cos(y*0.009+time*1.1)*25:0);var nx=bx+xOff;if(y===0)ctx.moveTo(nx,y);else ctx.lineTo(nx,y);}ctx.lineTo(bx+bw*0.4,groundY*0.8);ctx.lineTo(bx-bw*0.4,groundY*0.8);ctx.closePath();var hue=(b*30+time*20+hueShift)%360;var ba=0.15+0.1*Math.sin(time*1.5+b);var bg=ctx.createLinearGradient(bx,0,bx,groundY*0.8);bg.addColorStop(0,"hsla("+hue.toFixed(0)+",80%,25%,0)");bg.addColorStop(0.4,"hsla("+hue.toFixed(0)+",80%,55%,"+ba.toFixed(2)+")");bg.addColorStop(0.7,"hsla("+((hue+40)%360).toFixed(0)+",70%,50%,"+(ba*0.7).toFixed(2)+")");bg.addColorStop(1,"hsla("+hue.toFixed(0)+",70%,20%,0)");ctx.fillStyle=bg;ctx.fill();}ctx.globalAlpha=1;for(var si=0;si<60;si++){var sx=(si*191.3+321)%W;var sy=(si*173.7+89)%(groundY*0.5);ctx.fillStyle="rgba(200,220,255,"+(0.3+0.6*Math.abs(Math.sin(time*1.8+si*0.5))).toFixed(2)+")";ctx.fillRect(sx,sy,2,1);}},
    
    renderDeepAbyss(ctx,W,H,groundY,time,speed,hueShift){var g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,"#010620");g.addColorStop(1,"#020a30");ctx.fillStyle=g;ctx.fillRect(0,0,W,H);var bubs=this._abyssBubs||[];if(bubs.length===0){for(var i=0;i<40;i++)bubs.push({x:Math.random()*W,y:H-Math.random()*H*1.5,r:2+Math.random()*8,ph:Math.random()*Math.PI*2,spd:0.3+Math.random()*0.5});this._abyssBubs=bubs;}for(var bi=0;bi<bubs.length;bi++){var b=bubs[bi];b.y-=b.spd*_step;if(b.y<-b.r*2){b.y=H+Math.random()*50;b.x=Math.random()*W;b.r=2+Math.random()*8;}var alpha=0.08+0.06*Math.sin(time*0.8+b.ph);ctx.strokeStyle="rgba(80,180,220,"+alpha.toFixed(2)+")";ctx.lineWidth=0.6;ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.stroke();if(b.r>4){ctx.fillStyle="rgba(100,200,240,"+(alpha*0.5).toFixed(2)+")";ctx.beginPath();ctx.arc(b.x,b.y,b.r*0.8,0,Math.PI*2);ctx.fill();}}for(var ji=0;ji<6;ji++){var jx=W*0.15+ji*W*0.12;var jy=groundY*0.4+Math.sin(time*0.4+ji*1.3)*30;var ja=0.12+0.08*Math.sin(time*1.5+ji);ctx.globalAlpha=ja;var jg=ctx.createRadialGradient(jx,jy,0,jx,jy,35);jg.addColorStop(0,"rgba(100,200,255,0.5)");jg.addColorStop(0.5,"rgba(60,120,200,0.15)");jg.addColorStop(1,"transparent");ctx.fillStyle=jg;ctx.beginPath();ctx.ellipse(jx,jy,28,38,0,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;},


    renderMatrixFlow(ctx,W,H,time,hueShift){ctx.fillStyle="#010208";ctx.fillRect(0,0,W,H);if(!_matrixInitialized){_matrixColumns=[];var ch="アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789";for(var i=0;i<60;i++){var big=Math.random()<0.2;var ml=big?10+Math.floor(Math.random()*15):6+Math.floor(Math.random()*18);var cl=[];for(var c=0;c<ml;c++)cl.push(ch[Math.floor(Math.random()*ch.length)]);_matrixColumns.push({x:Math.random()*W,y:Math.random()*-H-200,speed:big?30+Math.random()*40:50+Math.random()*90,chars:cl,ml:ml,big:big});}_matrixInitialized=true;}ctx.font="13px monospace";for(var i=0;i<_matrixColumns.length;i++){var col=_matrixColumns[i];col.y+=col.speed*0.016*_step;if(((i*7+j*13)%100)<3){var ch2="カキクケコサシスセソタチツテト";col.chars[Math.floor(Math.random()*col.chars.length)]=ch2[Math.floor(Math.random()*ch2.length)];}for(var j=0;j<col.chars.length;j++){var cy=col.y-j*(col.big?18:14);if(cy<-20)continue;if(cy>H+20)break;var al=1-j/col.chars.length;if(j===0){ctx.fillStyle="#fff";ctx.globalAlpha=0.95;}else if(j<4){ctx.fillStyle="#00ff41";ctx.globalAlpha=al*0.6;if(col.big)ctx.globalAlpha=al*0.35;}else{ctx.fillStyle="#003311";ctx.globalAlpha=al*0.2;if(col.big)ctx.globalAlpha=al*0.1;}ctx.fillText(col.chars[j],col.x,cy);}}ctx.globalAlpha=1;for(var i=0;i<_matrixColumns.length;i++){var col=_matrixColumns[i];if(col.y-col.chars.length*(col.big?18:14)>H+200){col.y=-50-Math.random()*300;col.x=Math.random()*W;var big2=Math.random()<0.2;col.big=big2;var ml2=big2?10+Math.floor(Math.random()*15):6+Math.floor(Math.random()*18);col.chars=[];var ch3="アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789";for(var c=0;c<ml2;c++)col.chars.push(ch3[Math.floor(Math.random()*ch3.length)]);col.ml=ml2;}}},
    renderSporeField(ctx,W,H,groundY,time,speed,hueShift){var g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,"#0a0a18");g.addColorStop(0.5,"#101828");g.addColorStop(1,"#0a1008");ctx.fillStyle=g;ctx.fillRect(0,0,W,H);var cells=this._sporeCells||[];if(cells.length===0){for(var i=0;i<30;i++){cells.push({x:Math.random()*W,y:Math.random()*H*0.8,r:2+Math.random()*12,phase:Math.random()*Math.PI*2,speed:0.2+Math.random()*0.8,vx:(Math.random()-0.5)*15,vy:(Math.random()-0.5)*10});}this._sporeCells=cells;}for(var ci=0;ci<cells.length;ci++){var c=cells[ci];c.x+=c.vx*0.016*_step;c.y+=c.vy*0.016*_step;if(c.x<-20)c.x=W+20;if(c.x>W+20)c.x=-20;if(c.y<-20)c.y=H+20;if(c.y>H+20)c.y=-20;var pulse=Math.sin(time*c.speed+c.phase)*0.5+0.5;var r2=c.r*(0.7+pulse*0.6);var alpha=c.r>8?0.08:0.2;var hue=(120+ci*12+hueShift)%360;var sg=ctx.createRadialGradient(c.x,c.y,0,c.x,c.y,r2);sg.addColorStop(0,"hsla("+hue.toFixed(0)+",60%,70%,"+alpha.toFixed(2)+")");sg.addColorStop(0.5,"hsla("+hue.toFixed(0)+",50%,40%,"+(alpha*0.3).toFixed(2)+")");sg.addColorStop(1,"transparent");ctx.fillStyle=sg;ctx.beginPath();ctx.arc(c.x,c.y,r2,0,Math.PI*2);ctx.fill();ctx.strokeStyle="hsla("+hue.toFixed(0)+",50%,60%,"+(alpha*0.6).toFixed(2)+")";ctx.lineWidth=0.6;ctx.beginPath();ctx.arc(c.x,c.y,r2,0,Math.PI*2);ctx.stroke();}},
    renderDiamondMatrix(ctx,W,H,groundY,time,speed,hueShift){var g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,"#020415");g.addColorStop(1,"#0a0825");ctx.fillStyle=g;ctx.fillRect(0,0,W,H);var d1=12;var dw1=W/(d1-1);for(var di=0;di<d1;di++){var dx=di*dw1;var dh=H*0.15+Math.abs(Math.sin(di*0.6+time*0.25+Math.sin(time*0.15+di)*0.5))*H*0.35;var rot=Math.sin(time*0.4+di*0.3)*0.12;ctx.save();ctx.translate(dx,groundY);ctx.rotate(rot);var hue=(200+di*15+hueShift)%360;var alpha=0.5+0.3*Math.sin(di*0.5+time*0.3);var dg=ctx.createLinearGradient(0,-dh,0,0);dg.addColorStop(0,"hsla("+hue.toFixed(0)+",60%,70%,0)");dg.addColorStop(0.2,"hsla("+hue.toFixed(0)+",70%,60%,"+alpha.toFixed(2)+")");dg.addColorStop(0.6,"hsla("+hue.toFixed(0)+",60%,40%,"+(alpha*0.7).toFixed(2)+")");dg.addColorStop(1,"hsla("+hue.toFixed(0)+",50%,20%,"+(alpha*0.3).toFixed(2)+")");ctx.fillStyle=dg;var hw=dw1*0.3;ctx.beginPath();ctx.moveTo(0,-dh);ctx.lineTo(hw,-dh*0.5);ctx.lineTo(0,0);ctx.lineTo(-hw,-dh*0.5);ctx.closePath();ctx.fill();ctx.strokeStyle="hsla("+hue.toFixed(0)+",80%,85%,"+(alpha*0.4).toFixed(2)+")";ctx.lineWidth=0.8;ctx.beginPath();ctx.moveTo(0,-dh);ctx.lineTo(hw,-dh*0.5);ctx.lineTo(0,0);ctx.lineTo(-hw,-dh*0.5);ctx.closePath();ctx.stroke();ctx.restore();}var d2=8;var dw2=W/(d2-1);for(var di=0;di<d2;di++){var dx=di*dw2+Math.sin(time*0.7+di)*30;var dh=H*0.3+Math.abs(Math.sin(di*0.4+time*0.35))*H*0.3;var hue=(230+di*20+hueShift+40)%360;var alpha2=0.1+0.08*Math.sin(di*0.7+time*0.4);ctx.save();ctx.translate(dx,groundY);ctx.rotate(Math.sin(time*0.3+di*0.5)*0.2);var dg2=ctx.createLinearGradient(0,-dh,0,0);dg2.addColorStop(0,"hsla("+hue.toFixed(0)+",50%,60%,0)");dg2.addColorStop(0.3,"hsla("+hue.toFixed(0)+",60%,50%,"+alpha2.toFixed(2)+")");dg2.addColorStop(1,"transparent");ctx.fillStyle=dg2;var hw2=dw2*0.5;ctx.beginPath();ctx.moveTo(0,-dh);ctx.lineTo(hw2,-dh*0.4);ctx.lineTo(0,0);ctx.lineTo(-hw2,-dh*0.4);ctx.closePath();ctx.fill();ctx.restore();}},
    renderWaterfallCascade(ctx,W,H,groundY,time,speed,hueShift){var g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,"#020810");g.addColorStop(0.5,"#041830");g.addColorStop(1,"#031020");ctx.fillStyle=g;ctx.fillRect(0,0,W,H);var sc=10;var sw=W/(sc+0.3);for(var si=0;si<sc;si++){var sx=sw*0.2+si*sw;var pulse=0.08+0.05*Math.sin(time+si*1.5);ctx.globalAlpha=pulse;var sg=ctx.createLinearGradient(sx-sw*0.15,0,sx+sw*0.15,H);sg.addColorStop(0,"rgba(100,180,255,0)");sg.addColorStop(0.3,"rgba(120,200,255,0.4)");sg.addColorStop(0.7,"rgba(80,160,240,0.25)");sg.addColorStop(1,"rgba(60,140,220,0)");ctx.fillStyle=sg;ctx.beginPath();var cx1=sx+Math.sin(time*2+si)*12;ctx.moveTo(cx1-sw*0.08,0);ctx.lineTo(cx1+sw*0.08,0);ctx.lineTo(sx+sw*0.15,H);ctx.lineTo(sx-sw*0.15,H);ctx.closePath();ctx.fill();ctx.strokeStyle="rgba(150,220,255,0.25)";ctx.lineWidth=1.2;ctx.beginPath();for(var pi=0;pi<=20;pi++){var py=pi*H/20;var px=cx1+Math.sin(pi*0.4+time*2.5)*6;if(pi===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);}ctx.stroke();}ctx.globalAlpha=1;var mist=this._waterMist||[];if(mist.length===0){for(var i=0;i<50;i++)mist.push({x:Math.random()*W,y:groundY+Math.random()*H*0.3,r:2+Math.random()*6,life:Math.random()*3});this._waterMist=mist;}for(var i=0;i<mist.length;i++){var m=mist[i];m.life-=0.004*_step;if(m.life<=0){m.x=Math.random()*W;m.y=groundY+Math.random()*H*0.3;m.life=2+Math.random()*3;}ctx.fillStyle="rgba(150,210,255,"+(0.1+0.15*Math.sin(time*2+i)*m.life/3).toFixed(2)+")";ctx.fillRect(m.x,m.y,m.r,m.r*0.6);}},
    
    renderNebulaDrift(ctx,W,H,groundY,time,speed,hueShift){var g=ctx.createRadialGradient(W*0.4,H*0.4,0,W*0.5,H*0.5,Math.max(W,H)*0.7);g.addColorStop(0,"#180830");g.addColorStop(0.5,"#0c1030");g.addColorStop(1,"#050818");ctx.fillStyle=g;ctx.fillRect(0,0,W,H);var nc=10;for(var ni=0;ni<nc;ni++){var nx=W*0.15+ni*W*0.08+Math.sin(time*0.12+ni)*50+Math.cos(time*0.25+ni)*30;var ny=H*0.2+ni*H*0.06+Math.cos(time*0.18+ni)*40+Math.sin(time*0.3+ni)*30;var nr=Math.min(W,H)*0.1+Math.sin(time*0.2+ni)*25+Math.cos(time*0.35+ni)*15;var na=0.05+0.07*Math.sin(time*0.35+ni);var hue=(270+ni*22+hueShift)%360;var ng=ctx.createRadialGradient(nx,ny,0,nx,ny,nr);ng.addColorStop(0,"hsla("+hue.toFixed(0)+",60%,50%,"+(na*1.5).toFixed(2)+")");ng.addColorStop(0.5,"hsla("+hue.toFixed(0)+",50%,30%,"+na.toFixed(2)+")");ng.addColorStop(1,"transparent");ctx.fillStyle=ng;ctx.beginPath();ctx.ellipse(nx,ny,nr,nr*0.7,0,0,Math.PI*2);ctx.fill();}for(var si=0;si<120;si++){var sx=(Math.sin(si*2.7+time)*W*0.45+W*0.5+W)%W;var sy=(Math.cos(si*3.1+time*0.7)*H*0.4+H*0.5+H)%H;var ss=0.5+Math.abs(Math.sin(si*0.9))*2.5+Math.random()*1.5;var sa=0.25+0.6*Math.abs(Math.sin(time*1.5+si*0.4+Math.cos(si)*2));ctx.fillStyle="rgba(220,200,255,"+sa.toFixed(2)+")";ctx.fillRect(sx,sy,ss,ss);}},
    renderInfernoCore(ctx,W,H,groundY,time,speed,hueShift){var spikeY=groundY-H*0.08;var cy=spikeY*0.48;var cx=W*0.5;var heartbeat=Math.sin(time*2.8)*0.5+0.5;var g=ctx.createRadialGradient(cx,cy,0,cx,cy,Math.max(W,H)*0.8);g.addColorStop(0,"#220000");g.addColorStop(0.15,"#180000");g.addColorStop(0.4,"#0a0000");g.addColorStop(1,"#020000");ctx.fillStyle=g;ctx.fillRect(0,0,W,H);var coreR=Math.min(W,H)*0.22;applyGlow(ctx,"#ff4400",60);var cg=ctx.createRadialGradient(cx,cy,0,cx,cy,coreR+heartbeat*12);cg.addColorStop(0,"rgba(255,240,200,"+(0.5+heartbeat*0.4).toFixed(2)+")");cg.addColorStop(0.15,"rgba(255,120,0,0.4)");cg.addColorStop(0.4,"rgba(180,20,0,0.15)");cg.addColorStop(1,"transparent");ctx.fillStyle=cg;ctx.beginPath();ctx.arc(cx,cy,coreR+heartbeat*12,0,Math.PI*2);ctx.fill();clearGlow(ctx);var crackCount=35;ctx.strokeStyle="rgba(255,30,0,0.3)";ctx.lineWidth=1;for(var ci=0;ci<crackCount;ci++){var ca=ci*Math.PI*2/crackCount+time*0.2;var clen=Math.min(W,H)*0.18+Math.sin(time*3+ci*0.5)*25*heartbeat;ctx.beginPath();ctx.moveTo(cx,cy);ctx.bezierCurveTo(cx+Math.cos(ca+0.3)*clen*0.2,cy+Math.sin(ca+0.3)*clen*0.15,cx+Math.cos(ca-0.2)*clen*0.3,cy+Math.sin(ca-0.2)*clen*0.2,cx+Math.cos(ca)*clen*0.4,cy+Math.sin(ca)*clen*0.3);ctx.stroke();}if(heartbeat>0.6){var ba=(heartbeat-0.6)/0.4;for(var ei=0;ei<50;ei++){var ea=Math.random()*Math.PI*2;var ed=Math.random()*Math.min(W,H)*0.5;ctx.fillStyle="rgba(255,"+Math.floor(80+Math.random()*120)+",0,"+(ba*0.7).toFixed(2)+")";ctx.fillRect(cx+Math.cos(ea)*ed,cy+Math.sin(ea)*ed,1+Math.random()*3,1+Math.random()*3);}}var embers=this._infernoEmbers||[];if(embers.length===0){for(var i=0;i<80;i++)embers.push({x:Math.random()*W,y:groundY+Math.random()*30,life:Math.random()*3,size:1+Math.random()*3,spd:40+Math.random()*120});this._infernoEmbers=embers;}for(var i=embers.length-1;i>=0;i--){var e=embers[i];e.y-=e.spd*0.016*_step;e.life-=0.008*_step;if(e.life<=0||e.y<-50){e.x=Math.random()*W;e.y=groundY+Math.random()*30;e.life=1.5+Math.random()*3;e.size=1+Math.random()*3;e.spd=40+Math.random()*120;}var elife=Math.min(1,e.life/2);ctx.fillStyle="rgba(255,"+Math.floor(60+elife*120)+","+Math.floor(elife*30)+","+(0.3+elife*0.4).toFixed(2)+")";ctx.fillRect(e.x,e.y,e.size,e.size);}var smokes=this._infernoSmoke||[];if(smokes.length===0){for(var i=0;i<10;i++)smokes.push({x:Math.random()*W,y:Math.random()*H,alpha:0.03+Math.random()*0.05,size:80+Math.random()*150,speedX:(Math.random()-0.5)*15});this._infernoSmoke=smokes;}for(var i=0;i<smokes.length;i++){var sm=smokes[i];sm.x+=sm.speedX*0.016*_step;if(sm.x>W+sm.size)sm.x=-sm.size;if(sm.x<-sm.size)sm.x=W+sm.size;ctx.fillStyle="rgba(30,5,5,"+sm.alpha.toFixed(2)+")";ctx.beginPath();ctx.ellipse(sm.x,groundY-sm.size*0.4,sm.size,sm.size*0.5,0,0,Math.PI*2);ctx.fill();}},


renderTriumphFlare(ctx,W,H,groundY,time,speed,hueShift){var g=ctx.createRadialGradient(W*0.5,H*0.35,0,W*0.5,H*0.35,Math.max(W,H)*0.6);g.addColorStop(0,"#1a0520");g.addColorStop(0.5,"#0c0218");g.addColorStop(1,"#040210");ctx.fillStyle=g;ctx.fillRect(0,0,W,H);var stars=this._triStars||[];if(stars.length===0){for(var i=0;i<8;i++)stars.push({x:W*(0.1+Math.random()*0.8),y:H*(0.1+Math.random()*0.5),h:(i*50+Math.random()*80)%360,sz:0.5+Math.random()*1.5,ph:Math.random()*Math.PI*2});this._triStars=stars;}for(var si=0;si<stars.length;si++){var s=stars[si];var fp=Math.sin(time*1.7+s.ph)*0.5+0.5;var alpha=0.04+fp*0.1;var rc=8+Math.floor(s.sz*6);for(var ri=0;ri<rc;ri++){var a=ri*Math.PI*2/rc+time*speed*0.00055;var len=Math.min(W,H)*(0.05+fp*0.08)*s.sz;var hue=(s.h+ri*20+time*20)%360;ctx.strokeStyle="hsla("+hue.toFixed(0)+",70%,50%,"+alpha.toFixed(2)+")";ctx.lineWidth=0.5+s.sz*0.3;ctx.beginPath();ctx.moveTo(s.x,s.y);ctx.lineTo(s.x+Math.cos(a)*len,s.y+Math.sin(a)*len);ctx.stroke();}var cg=ctx.createRadialGradient(s.x,s.y,0,s.x,s.y,Math.min(W,H)*0.02*s.sz+fp*2);cg.addColorStop(0,"rgba(255,255,255,"+(0.1+fp*0.2).toFixed(2)+")");cg.addColorStop(0.5,"rgba(255,200,255,0.06)");cg.addColorStop(1,"transparent");ctx.fillStyle=cg;ctx.beginPath();ctx.arc(s.x,s.y,Math.min(W,H)*0.02*s.sz+fp*2,0,Math.PI*2);ctx.fill();}},renderBarrierWall(ctx,W,H,groundY,time,speed,hueShift){ctx.fillStyle="#0a0308";ctx.fillRect(0,0,W,H);var ty=H*0.05;var by=H*0.6;var bw=120;var bh=70;var cols=Math.ceil(W/bw)+2;var rows1=Math.ceil((groundY*0.4)/bh)+1;var rows2=Math.ceil((H-by)/bh)+1;var off=(time*speed*0.018)%bw;for(var i=0;i<cols;i++){var bx=i*bw-off;for(var j=0;j<rows1;j++){var py=ty+j*bh;var gl=((i*7+j*13+Math.floor(time*3))%100)<6;ctx.fillStyle="hsla("+(gl?70:10).toFixed(0)+","+(gl?"80%":"50%")+","+(gl?35:18).toFixed(0)+"%,0.4)";ctx.fillRect(bx,py,bw-1,bh-1);if(gl){ctx.strokeStyle="rgba(255,200,255,0.2)";ctx.lineWidth=1;ctx.strokeRect(bx,py,bw-1,bh-1);}}}for(var i=0;i<cols;i++){var bx=i*bw-off;for(var j=0;j<rows2;j++){var py=by+j*bh;var gl=((i*7+j*13+Math.floor(time*2.5))%100)<5;ctx.fillStyle="hsla("+(gl?80:20).toFixed(0)+",70%,"+(gl?30:15).toFixed(0)+"%,0.3)";ctx.fillRect(bx,py,bw-1,bh-1);}}ctx.strokeStyle="rgba(255,50,0,0.4)";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,ty);ctx.lineTo(W,ty);ctx.moveTo(0,by);ctx.lineTo(W,by);ctx.stroke();},renderCyberGrid(ctx, W, H, groundY, time, speed, accentColor) {var grad = ctx.createLinearGradient(0, 0, 0, H);grad.addColorStop(0, "#020615");grad.addColorStop(1, "#0a1035");ctx.fillStyle = grad;ctx.fillRect(0, 0, W, H);var horizonY = H * 0.35;var vanishX = W / 2;var accent = accentColor || "#00f6ff";var spacing = W * 0.08;var cols = Math.ceil(W / spacing) + 8;var totalRange = cols * spacing;var halfRange = totalRange / 2;var continuousOffset = time * speed * 0.25;var r = parseInt(accent.slice(1,3),16);var g = parseInt(accent.slice(3,5),16);var b = parseInt(accent.slice(5,7),16);applyGlow(ctx, accent, 12);ctx.lineWidth = 1;var groups = 5;var visibleW = W * 4;for (var i = -cols; i < cols * 2; i++) {var rawX = vanishX + i * spacing - continuousOffset;rawX = vanishX + (((rawX - vanishX) % totalRange + totalRange) % totalRange - halfRange);if (rawX < vanishX - visibleW || rawX > vanishX + visibleW) continue;var dx = Math.abs(rawX - vanishX) / (W * 0.5);var t = 1 - Math.min(1, dx);var sy = horizonY + (groundY - horizonY) * (1 - t * t);var groupIdx = ((i % groups) + groups) % groups;var phase = groupIdx * (Math.PI * 2 / groups);var alpha = 0.25 + 0.55 * (Math.sin(time * 1.2 + phase) * 0.5 + 0.5);if (alpha < 0.02) continue;ctx.strokeStyle = "rgba(" + r + "," + g + "," + b + "," + alpha.toFixed(2) + ")";ctx.beginPath();ctx.moveTo(vanishX, horizonY);ctx.lineTo(rawX, sy);ctx.stroke()}var horizLines = 18;var horizAlpha = 0.18 + 0.07 * Math.sin(time * 0.8);ctx.strokeStyle = "rgba(" + r + "," + g + "," + b + "," + horizAlpha.toFixed(2) + ")";ctx.beginPath();for (var j = 0; j <= horizLines; j++) {var progress = j / horizLines;var y = horizonY + (groundY - horizonY) * progress * progress;ctx.moveTo(0, y);ctx.lineTo(W, y)}ctx.stroke();clearGlow(ctx);applyGlow(ctx, accent, 20);ctx.strokeStyle = accent;ctx.lineWidth = 3;ctx.beginPath();ctx.moveTo(0, horizonY);ctx.lineTo(W, horizonY);ctx.stroke();clearGlow(ctx)},
};

// ---------- Піксельні фони в стилі «блочного світу» ----------
// Статичні шари (небо, пагорби, стіни печери) малюються один раз у буфери,
// а щокадру лише копіюються зі зсувом на цілі пікселі — це дешево.

// Детермінований генератор випадкових чисел, щоб світ виглядав однаково при кожному запуску
function pixelRng(seed) {
    let a = seed >>> 0;
    return function () {
        a = (a + 0x6D2B79F5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function pixelBlockSize(H) {
    return Math.max(8, Math.round(H / 28));
}

// Смуга шириною stripW повторюється по горизонталі зі зсувом factor × пройденої відстані
function drawScrollingStrip(ctx, strip, W, bottomY, time, speed, factor) {
    const stripW = strip.width;
    const offset = Math.round(time * speed * factor) % stripW;
    const y = Math.round(bottomY) - strip.height;
    for (let x = -offset; x < W; x += stripW) {
        ctx.drawImage(strip, x, y);
    }
}

function buildPixelNight(W, H, groundY, B) {
    const rng = pixelRng(1010);
    const gY = Math.round(groundY);

    // Небо з місяцем
    const sky = document.createElement("canvas");
    sky.width = Math.ceil(W);
    sky.height = Math.ceil(H);
    const sx = sky.getContext("2d");
    const grad = sx.createLinearGradient(0, 0, 0, gY);
    grad.addColorStop(0, "#070b24");
    grad.addColorStop(1, "#1d2a5c");
    sx.fillStyle = grad;
    sx.fillRect(0, 0, sky.width, sky.height);
    const moonX = Math.round(W * 0.74 / B) * B;
    const moonY = Math.round(H * 0.1 / B) * B;
    sx.fillStyle = "rgba(240, 240, 200, 0.05)";
    sx.fillRect(moonX - B * 2, moonY - B * 2, B * 7, B * 7);
    sx.fillStyle = "rgba(240, 240, 200, 0.08)";
    sx.fillRect(moonX - B, moonY - B, B * 5, B * 5);
    sx.fillStyle = "#f4f1d0";
    sx.fillRect(moonX, moonY, B * 3, B * 3);
    sx.fillStyle = "#d8d4ae";
    sx.fillRect(moonX + B * 0.5, moonY + B * 0.5, B * 0.75, B * 0.75);
    sx.fillRect(moonX + B * 1.75, moonY + B * 1.5, B, B * 0.75);
    sx.fillRect(moonX + B * 0.75, moonY + B * 2, B * 0.5, B * 0.5);

    // Зірки (мерехтять щокадру)
    const stars = [];
    const half = B / 2;
    for (let i = 0; i < 45; i++) {
        const starX = Math.round(rng() * W / half) * half;
        const starY = Math.round(rng() * gY * 0.55 / half) * half;
        const phase = rng() * Math.PI * 2;
        const speed = 0.8 + rng() * 2;
        // Без зірок на місяці та його ореолі
        if (starX > moonX - B * 3 && starX < moonX + B * 6 && starY > moonY - B * 3 && starY < moonY + B * 6) {
            continue;
        }
        stars.push({ x: starX, y: starY, phase: phase, speed: speed });
    }

    // Хмари з блоків
    const cloudCols = Math.ceil(W * 1.5 / B);
    const clouds = document.createElement("canvas");
    clouds.width = cloudCols * B;
    clouds.height = B * 3;
    const cx = clouds.getContext("2d");
    cx.fillStyle = "rgba(200, 210, 240, 0.16)";
    for (let c = 2; c < cloudCols - 8; c += 9 + Math.floor(rng() * 6)) {
        const len = 4 + Math.floor(rng() * 4);
        cx.fillRect(c * B, B, len * B, B);
        cx.fillRect((c + 1) * B, 0, (len - 2) * B, B);
        cx.fillRect((c + 1) * B, B * 2, (len - 1) * B, B);
    }

    // Періодичний рельєф: ціле число хвиль на ширину смуги, щоб смуга безшовно повторювалась
    function heights(cols, base, waves) {
        const hs = [];
        for (let c = 0; c < cols; c++) {
            let v = base;
            for (const w of waves) {
                v += w.amp * Math.sin(Math.PI * 2 * c * w.k / cols + w.ph);
            }
            hs.push(Math.max(1, Math.round(v)));
        }
        return hs;
    }

    // Далекі пагорби
    const farCols = Math.ceil(W * 1.5 / B);
    const farH = heights(farCols, 5, [{ amp: 2.5, k: 2, ph: 0.3 }, { amp: 1.2, k: 5, ph: 1.7 }]);
    const farMax = Math.max.apply(null, farH);
    const far = document.createElement("canvas");
    far.width = farCols * B;
    far.height = farMax * B;
    const fx = far.getContext("2d");
    for (let c = 0; c < farCols; c++) {
        const top = far.height - farH[c] * B;
        fx.fillStyle = "#141d3d";
        fx.fillRect(c * B, top, B, far.height - top);
        fx.fillStyle = "#1c2a55";
        fx.fillRect(c * B, top, B, B * 0.5);
    }

    // Ближні пагорби з травою, землею та деревами
    const nearCols = Math.ceil(W * 1.3 / B);
    const nearH = heights(nearCols, 3, [{ amp: 1.5, k: 3, ph: 2 }, { amp: 1, k: 7, ph: 0.5 }]);
    const nearMax = Math.max.apply(null, nearH) + 5;
    const near = document.createElement("canvas");
    near.width = nearCols * B;
    near.height = nearMax * B;
    const nx = near.getContext("2d");
    const p = B / 4;
    for (let c = 0; c < nearCols; c++) {
        const hBlocks = nearH[c];
        const top = near.height - hBlocks * B;
        for (let r = 0; r < hBlocks; r++) {
            const y = top + r * B;
            if (r === 0) {
                nx.fillStyle = "#2f7a22";
                nx.fillRect(c * B, y, B, B);
                nx.fillStyle = "#44a332";
                nx.fillRect(c * B, y, B, p);
                nx.fillStyle = "#2f7a22";
                nx.fillRect(c * B + p, y + p, p, p);
                nx.fillStyle = "#5a3b22";
                nx.fillRect(c * B, y + p * 3, B, p);
                nx.fillRect(c * B + p * 2, y + p * 2, p, p);
            } else {
                nx.fillStyle = (r + c) % 2 === 0 ? "#553820" : "#4a3019";
                nx.fillRect(c * B, y, B, B);
                nx.fillStyle = "#3d2714";
                nx.fillRect(c * B + ((r * 3 + c) % 4) * p, y + ((r + c * 2) % 4) * p, p, p);
            }
        }
        // Дерево на деяких вершинах
        if (c % 11 === 4 && c + 1 < nearCols) {
            nx.fillStyle = "#5b3a1e";
            nx.fillRect(c * B, top - B * 3, B, B * 3);
            nx.fillStyle = "#256319";
            nx.fillRect((c - 1) * B, top - B * 5, B * 3, B * 2);
            nx.fillRect(c * B, top - B * 6, B, B);
            nx.fillStyle = "#347f24";
            nx.fillRect((c - 1) * B + p, top - B * 5 + p, p * 2, p);
            nx.fillRect((c + 1) * B, top - B * 4 - p * 2, p, p);
        }
    }

    return { W: W, H: H, B: B, sky: sky, stars: stars, clouds: clouds, far: far, near: near };
}

function buildPixelCave(W, H, groundY, B) {
    const rng = pixelRng(2323);
    const gY = Math.round(groundY);
    const cols = Math.ceil(W * 1.3 / B);
    const rows = Math.ceil(gY / B) + 1;
    const p = B / 4;

    const wall = document.createElement("canvas");
    wall.width = cols * B;
    wall.height = rows * B;
    const wx = wall.getContext("2d");
    const stoneShades = ["#3a3a44", "#34343d", "#2e2e36"];
    const ores = [];
    const torches = [];
    for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
            const x = c * B;
            const y = r * B;
            wx.fillStyle = stoneShades[Math.floor(rng() * stoneShades.length)];
            wx.fillRect(x, y, B, B);
            wx.fillStyle = "#26262d";
            for (let k = 0; k < 3; k++) {
                wx.fillRect(x + Math.floor(rng() * 4) * p, y + Math.floor(rng() * 4) * p, p, p);
            }
            // Руда: алмаз, золото або червона руда
            const roll = rng();
            let oreColor = null;
            let kind = null;
            if (roll < 0.015) {
                oreColor = "#2fd3cf";
                kind = "diamond";
            } else if (roll < 0.03) {
                oreColor = "#f2c84b";
                kind = "gold";
            } else if (roll < 0.04) {
                oreColor = "#e0302a";
                kind = "red";
            }
            if (oreColor) {
                wx.fillStyle = oreColor;
                wx.fillRect(x + p, y + p, p, p);
                wx.fillRect(x + p * 2, y + p * 2, p, p);
                wx.fillRect(x + p * 2, y, p, p);
                wx.fillRect(x, y + p * 3, p, p);
                if (kind !== "gold") {
                    ores.push({ x: x, y: y, kind: kind, phase: rng() * Math.PI * 2 });
                }
            }
        }
    }
    // Темні сталактити зверху та тінь по краях
    wx.fillStyle = "#15151b";
    for (let c = 0; c < cols; c++) {
        const len = 1 + Math.floor((Math.sin(c * 1.7) + 1) * 1.5);
        wx.fillRect(c * B, 0, B, len * B);
    }
    const shade = wx.createLinearGradient(0, 0, 0, wall.height);
    shade.addColorStop(0, "rgba(0, 0, 0, 0.55)");
    shade.addColorStop(0.5, "rgba(0, 0, 0, 0.15)");
    shade.addColorStop(1, "rgba(0, 0, 0, 0.45)");
    wx.fillStyle = shade;
    wx.fillRect(0, 0, wall.width, wall.height);
    // Факели на стінах
    for (let c = 5; c < cols - 2; c += 12) {
        const tx = c * B + p;
        const ty = Math.round(gY * 0.45 / B) * B;
        wx.fillStyle = "#6b4424";
        wx.fillRect(tx, ty, p * 2, B);
        torches.push({ x: tx, y: ty, phase: rng() * Math.PI * 2 });
    }

    // Лавове світіння біля землі
    const lava = document.createElement("canvas");
    lava.width = 1;
    lava.height = B * 3;
    const lx = lava.getContext("2d");
    const lg = lx.createLinearGradient(0, 0, 0, lava.height);
    lg.addColorStop(0, "rgba(255, 90, 0, 0)");
    lg.addColorStop(1, "rgba(255, 90, 0, 0.35)");
    lx.fillStyle = lg;
    lx.fillRect(0, 0, 1, lava.height);

    return { W: W, H: H, B: B, wall: wall, ores: ores, torches: torches, lava: lava };
}

BackgroundRenderer.renderPixelNight = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._pixelNight;
    if (!st || st.W !== W || st.H !== H) {
        st = buildPixelNight(W, H, groundY, B);
        this._pixelNight = st;
    }
    ctx.drawImage(st.sky, 0, 0);
    const starSize = Math.max(2, Math.round(B / 4));
    ctx.fillStyle = "#ffffff";
    for (const star of st.stars) {
        ctx.globalAlpha = 0.35 + 0.65 * (Math.sin(time * star.speed + star.phase) * 0.5 + 0.5);
        ctx.fillRect(star.x, star.y, starSize, starSize);
    }
    ctx.globalAlpha = 1;
    drawScrollingStrip(ctx, st.clouds, W, Math.round(H * 0.3), time, speed, 0.04);
    drawScrollingStrip(ctx, st.far, W, groundY, time, speed, 0.12);
    drawScrollingStrip(ctx, st.near, W, groundY, time, speed, 0.3);
};

BackgroundRenderer.renderPixelCave = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._pixelCave;
    if (!st || st.W !== W || st.H !== H) {
        st = buildPixelCave(W, H, groundY, B);
        this._pixelCave = st;
    }
    ctx.fillStyle = "#0b0b10";
    ctx.fillRect(0, 0, W, H);
    const wallW = st.wall.width;
    const offset = Math.round(time * speed * 0.2) % wallW;
    const wallY = Math.round(groundY) - st.wall.height;
    for (let x = -offset; x < W; x += wallW) {
        ctx.drawImage(st.wall, x, wallY);
    }
    const p = B / 4;
    // Пульсуюче світіння руди та факелів (позиції зсуваються разом зі стіною)
    for (let copy = -offset; copy < W; copy += wallW) {
        for (const ore of st.ores) {
            const x = copy + ore.x;
            if (x < -B * 2 || x > W + B) {
                continue;
            }
            const pulse = Math.sin(time * (ore.kind === "red" ? 3 : 1.6) + ore.phase) * 0.5 + 0.5;
            ctx.fillStyle = ore.kind === "red" ? "rgba(255, 40, 30, 0.22)" : "rgba(60, 240, 230, 0.18)";
            ctx.globalAlpha = 0.3 + 0.7 * pulse;
            ctx.fillRect(x - p, wallY + ore.y - p, B + p * 2, B + p * 2);
        }
        for (const torch of st.torches) {
            const x = copy + torch.x;
            if (x < -B * 3 || x > W + B * 3) {
                continue;
            }
            const y = wallY + torch.y;
            const flicker = 0.75 + 0.25 * Math.sin(time * 11 + torch.phase) * Math.sin(time * 7.3);
            ctx.globalAlpha = 0.1 * flicker;
            ctx.fillStyle = "#ffaa33";
            ctx.fillRect(x - B * 2, y - B * 2, B * 4 + p * 2, B * 4);
            ctx.globalAlpha = 0.14 * flicker;
            ctx.fillRect(x - B, y - B, B * 2 + p * 2, B * 2);
            ctx.globalAlpha = 1;
            ctx.fillStyle = "#ffcc33";
            ctx.fillRect(x, y - p * 2, p * 2, p * 2);
            ctx.fillStyle = flicker > 0.85 ? "#ffffff" : "#ff7a00";
            ctx.fillRect(x + p * 0.5, y - p * 2.5, p, p);
        }
    }
    ctx.globalAlpha = 0.7 + 0.3 * Math.sin(time * 1.3);
    ctx.drawImage(st.lava, 0, Math.round(groundY) - st.lava.height, W, st.lava.height);
    ctx.globalAlpha = 1;
};

// ---------- Нові світи: сніг, океан, пустеля, острови, вогняний світ, неонові сцени ----------

function makeCanvas(w, h) {
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.ceil(w));
    c.height = Math.max(1, Math.ceil(h));
    return c;
}

// Небо-градієнт у буфері на весь екран
function makeSky(W, H, stops) {
    const sky = makeCanvas(W, H);
    const sx = sky.getContext("2d");
    const g = sx.createLinearGradient(0, 0, 0, H);
    for (const stop of stops) {
        g.addColorStop(stop[0], stop[1]);
    }
    sx.fillStyle = g;
    sx.fillRect(0, 0, sky.width, sky.height);
    return sky;
}

// Періодичні висоти стовпчиків: ціле число хвиль на ширину, щоб смуга безшовно повторювалась
function periodicHeights(cols, base, waves) {
    const hs = [];
    for (let c = 0; c < cols; c++) {
        let v = base;
        for (const w of waves) {
            v += w.amp * Math.sin(Math.PI * 2 * c * w.k / cols + w.ph);
        }
        hs.push(Math.max(1, Math.round(v)));
    }
    return hs;
}

// Блоковий рельєф: верхній блок одного кольору, нижче — «тіло» з піксельною текстурою
function drawBlockTerrain(ctx, heights, B, stripH, colors, rng) {
    const p = B / 4;
    for (let c = 0; c < heights.length; c++) {
        const top = stripH - heights[c] * B;
        for (let r = 0; r < heights[c]; r++) {
            const y = top + r * B;
            ctx.fillStyle = r === 0 ? colors.top : (r + c) % 2 === 0 ? colors.body : colors.body2;
            ctx.fillRect(c * B, y, B, B);
            if (r === 0 && colors.topLight) {
                ctx.fillStyle = colors.topLight;
                ctx.fillRect(c * B, y, B, p);
            }
            if (colors.speck) {
                ctx.fillStyle = colors.speck;
                ctx.fillRect(c * B + Math.floor(rng() * 4) * p, y + Math.floor(rng() * 4) * p, p, p);
            }
        }
    }
}

// Детерміновані «падаючі» частинки без стану: позиція обчислюється з часу
function drawFallingPixels(ctx, W, H, time, count, seed, opts) {
    const rng = pixelRng(seed);
    ctx.fillStyle = opts.color;
    for (let i = 0; i < count; i++) {
        const x0 = rng() * W;
        const y0 = rng() * H;
        const spd = opts.speedMin + rng() * (opts.speedMax - opts.speedMin);
        const sz = opts.sizeMin + Math.floor(rng() * (opts.sizeMax - opts.sizeMin + 1));
        const phase = rng() * Math.PI * 2;
        let y = (y0 + time * spd * opts.dir) % H;
        if (y < 0) {
            y += H;
        }
        const x = ((x0 + Math.sin(time * opts.sway + phase) * opts.swayAmp) % W + W) % W;
        ctx.globalAlpha = opts.alpha;
        ctx.fillRect(Math.round(x), Math.round(y), sz, sz * (opts.stretch || 1));
    }
    ctx.globalAlpha = 1;
}

// ---------- Сніжні гори (рівень 25) ----------

function buildPixelSnow(W, H, groundY, B) {
    const rng = pixelRng(2525);
    const sky = makeSky(W, H, [[0, "#0d1633"], [0.55, "#2c3f73"], [1, "#6d7fb0"]]);
    const skx = sky.getContext("2d");
    // Північне сяйво
    for (let i = 0; i < 26; i++) {
        const x = Math.round((W * 0.1 + i * W * 0.03) / B) * B;
        const len = (3 + Math.round(Math.sin(i * 0.7) * 2 + 2)) * B;
        skx.fillStyle = i % 2 === 0 ? "rgba(80, 255, 170, 0.08)" : "rgba(120, 200, 255, 0.07)";
        skx.fillRect(x, Math.round(H * 0.08 / B) * B + Math.round(Math.sin(i * 0.5) * 2) * B, B, len);
    }

    const farCols = Math.ceil(W * 1.5 / B);
    const farH = periodicHeights(farCols, 8, [{ amp: 4, k: 3, ph: 0.4 }, { amp: 2, k: 7, ph: 2 }]);
    const far = makeCanvas(farCols * B, Math.max.apply(null, farH) * B);
    const fx = far.getContext("2d");
    for (let c = 0; c < farCols; c++) {
        const top = far.height - farH[c] * B;
        fx.fillStyle = "#3b4a73";
        fx.fillRect(c * B, top, B, far.height - top);
        fx.fillStyle = "#e8f0ff";
        fx.fillRect(c * B, top, B, B * (farH[c] > 9 ? 2 : 1));
    }

    const nearCols = Math.ceil(W * 1.3 / B);
    const nearH = periodicHeights(nearCols, 3, [{ amp: 1.5, k: 2, ph: 1 }, { amp: 1, k: 5, ph: 0.2 }]);
    const nearMax = Math.max.apply(null, nearH) + 6;
    const near = makeCanvas(nearCols * B, nearMax * B);
    const nx = near.getContext("2d");
    drawBlockTerrain(nx, nearH, B, near.height, { top: "#f4f8ff", topLight: "#ffffff", body: "#8a94a8", body2: "#7a8498", speck: "#6a7488" }, rng);
    // Ялинки зі снігом
    for (let c = 3; c < nearCols - 2; c += 7 + Math.floor(rng() * 4)) {
        const top = near.height - nearH[c] * B;
        nx.fillStyle = "#5b3a1e";
        nx.fillRect(c * B, top - B, B, B);
        for (let t = 0; t < 3; t++) {
            const w = 3 - t;
            const y = top - B * (2 + t);
            nx.fillStyle = "#1f5a3a";
            nx.fillRect((c - w + 1) * B - (w > 1 ? 0 : 0), y, (w * 2 - 1) * B, B);
            nx.fillStyle = "#f4f8ff";
            nx.fillRect((c - w + 1) * B, y, (w * 2 - 1) * B, B / 4);
        }
    }
    return { W: W, H: H, sky: sky, far: far, near: near };
}

BackgroundRenderer.renderPixelSnow = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._pixelSnow;
    if (!st || st.W !== W || st.H !== H) {
        st = buildPixelSnow(W, H, groundY, B);
        this._pixelSnow = st;
    }
    ctx.drawImage(st.sky, 0, 0);
    drawScrollingStrip(ctx, st.far, W, groundY, time, speed, 0.1);
    drawScrollingStrip(ctx, st.near, W, groundY, time, speed, 0.3);
    drawFallingPixels(ctx, W, groundY, time, 70, 77, {
        color: "#ffffff", dir: 1, speedMin: 25, speedMax: 70, sizeMin: 2, sizeMax: Math.max(3, Math.round(B / 5)),
        sway: 1.2, swayAmp: B * 0.6, alpha: 0.85
    });
};

// ---------- Інопланетний океан (рівень 26) ----------

function buildPixelOcean(W, H, groundY, B) {
    const rng = pixelRng(2626);
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#0b5b86"], [0.45, "#063a63"], [1, "#010818"]]);
    const skx = sky.getContext("2d");
    // Промені світла з поверхні
    for (let i = 0; i < 6; i++) {
        const x = W * (0.08 + i * 0.17);
        skx.fillStyle = "rgba(160, 230, 255, 0.05)";
        skx.beginPath();
        skx.moveTo(x, 0);
        skx.lineTo(x + W * 0.05, 0);
        skx.lineTo(x + W * 0.16, gY);
        skx.lineTo(x + W * 0.08, gY);
        skx.closePath();
        skx.fill();
    }

    // Морське дно з піском, камінням і світними коралами
    const cols = Math.ceil(W * 1.3 / B);
    const hs = periodicHeights(cols, 2, [{ amp: 1, k: 3, ph: 0.5 }, { amp: 0.8, k: 8, ph: 2 }]);
    const maxH = Math.max.apply(null, hs) + 3;
    const floor = makeCanvas(cols * B, maxH * B);
    const fx = floor.getContext("2d");
    drawBlockTerrain(fx, hs, B, floor.height, { top: "#c9b27a", topLight: "#e3d09a", body: "#8f7a4c", body2: "#7d6a40", speck: "#6e5c36" }, rng);
    const corals = [];
    const p = B / 4;
    for (let c = 1; c < cols - 1; c += 3 + Math.floor(rng() * 4)) {
        const top = floor.height - hs[c] * B;
        const kind = Math.floor(rng() * 3);
        const colors = [["#ff4fa3", "#ff9ed0"], ["#39ffd0", "#b0fff0"], ["#b06bff", "#e0c0ff"]][kind];
        const hBlocks = 1 + Math.floor(rng() * 2);
        fx.fillStyle = colors[0];
        fx.fillRect(c * B + p, top - hBlocks * B, p * 2, hBlocks * B);
        fx.fillRect(c * B, top - hBlocks * B, B, p * 2);
        fx.fillStyle = colors[1];
        fx.fillRect(c * B + p, top - hBlocks * B, p, p);
        corals.push({ x: c * B + B / 2, y: top - hBlocks * B, color: colors[0] });
    }

    // Водорості (коливаються щокадру)
    const kelp = [];
    for (let i = 0; i < 14; i++) {
        kelp.push({ x: Math.round(rng() * cols) * B, h: 4 + Math.floor(rng() * 6), phase: rng() * Math.PI * 2 });
    }
    // Зграї риб
    const fish = [];
    for (let i = 0; i < 9; i++) {
        fish.push({
            y: gY * (0.2 + rng() * 0.6),
            speed: 20 + rng() * 40,
            offset: rng() * W * 2,
            color: ["#ffcc33", "#ff7a3d", "#7df9ff", "#ff4fa3"][Math.floor(rng() * 4)],
            size: Math.round(B * (0.5 + rng() * 0.4))
        });
    }
    // Медузи
    const jelly = [];
    for (let i = 0; i < 4; i++) {
        jelly.push({ x: rng() * W, y: gY * (0.15 + rng() * 0.45), phase: rng() * Math.PI * 2 });
    }
    return { W: W, H: H, sky: sky, floor: floor, corals: corals, kelp: kelp, fish: fish, jelly: jelly, cols: cols };
}

// Силует велетенського блокового морського змія, що зрідка пропливає вдалині
function drawLeviathan(ctx, W, gY, B, time) {
    const period = 38;
    const t = (time % period) / period;
    if (t > 0.6) {
        return;
    }
    const headX = W * 1.2 - t / 0.6 * W * 2.2;
    const baseY = gY * 0.38;
    ctx.fillStyle = "rgba(2, 20, 40, 0.55)";
    for (let i = 0; i < 16; i++) {
        const sx = headX + i * B * 1.6;
        const sy = baseY + Math.sin(time * 1.5 - i * 0.5) * B * 1.2;
        const seg = Math.round(B * (2.2 - i * 0.09));
        ctx.fillRect(Math.round(sx), Math.round(sy - seg / 2), seg, seg);
    }
    // Око, що світиться
    ctx.fillStyle = "rgba(255, 80, 60, 0.7)";
    ctx.fillRect(Math.round(headX + B * 0.3), Math.round(baseY + Math.sin(time * 1.5) * B * 1.2 - B * 0.5), Math.round(B * 0.4), Math.round(B * 0.3));
}

BackgroundRenderer.renderPixelOcean = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._pixelOcean;
    if (!st || st.W !== W || st.H !== H) {
        st = buildPixelOcean(W, H, groundY, B);
        this._pixelOcean = st;
    }
    const gY = Math.round(groundY);
    ctx.drawImage(st.sky, 0, 0);
    drawLeviathan(ctx, W, gY, B, time);

    // Медузи пульсують і повільно дрейфують
    for (const j of st.jelly) {
        const pulse = Math.sin(time * 2 + j.phase) * 0.5 + 0.5;
        const x = Math.round(((j.x - time * 8) % (W + B * 4) + W + B * 4) % (W + B * 4) - B * 2);
        const y = Math.round(j.y + Math.sin(time * 0.7 + j.phase) * B);
        ctx.globalAlpha = 0.06 + 0.1 * pulse;
        ctx.fillStyle = "#c08bff";
        ctx.fillRect(x - B, y - B, B * 3, B * 3);
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = "#e6c8ff";
        ctx.fillRect(x, y, B, B * 0.75);
        ctx.fillStyle = "#c08bff";
        const tl = B * (0.8 + pulse * 0.6);
        ctx.fillRect(x, y + B * 0.75, B / 5, tl);
        ctx.fillRect(x + B * 0.4, y + B * 0.75, B / 5, tl * 1.2);
        ctx.fillRect(x + B * 0.8, y + B * 0.75, B / 5, tl);
    }
    ctx.globalAlpha = 1;

    // Риби пливуть (частина — назустріч руху кубика)
    for (const f of st.fish) {
        const span = W + f.size * 8;
        const x = Math.round(span - ((f.offset + time * (f.speed + speed * 0.15)) % span) - f.size * 4);
        const y = Math.round(f.y + Math.sin(time * 2 + f.offset) * B * 0.3);
        ctx.fillStyle = f.color;
        ctx.fillRect(x, y, f.size, Math.round(f.size * 0.6));
        ctx.fillRect(x + f.size, y - Math.round(f.size * 0.15), Math.round(f.size * 0.4), Math.round(f.size * 0.9));
        ctx.fillStyle = "#00121e";
        ctx.fillRect(x + Math.round(f.size * 0.15), y + Math.round(f.size * 0.1), Math.max(2, Math.round(f.size * 0.15)), Math.max(2, Math.round(f.size * 0.15)));
    }

    // Дно зі зсувом і водорості, прив'язані до дна
    const floorW = st.floor.width;
    const offset = Math.round(time * speed * 0.3) % floorW;
    const floorY = gY - st.floor.height;
    for (let x = -offset; x < W; x += floorW) {
        for (const k of st.kelp) {
            const kx = x + k.x;
            if (kx < -B * 2 || kx > W + B * 2) {
                continue;
            }
            for (let seg = 0; seg < k.h; seg++) {
                const sway = Math.round(Math.sin(time * 1.6 + k.phase + seg * 0.5) * seg * B * 0.12);
                ctx.fillStyle = seg % 2 === 0 ? "#1f8a4a" : "#27a65a";
                ctx.fillRect(kx + sway, gY - B * (seg + 2), Math.round(B * 0.5), B);
            }
        }
        ctx.drawImage(st.floor, x, floorY);
        // Світіння коралів
        for (const c of st.corals) {
            const cx = x + c.x;
            if (cx < -B * 2 || cx > W + B * 2) {
                continue;
            }
            ctx.globalAlpha = 0.12 + 0.12 * Math.sin(time * 2.2 + c.x);
            ctx.fillStyle = c.color;
            ctx.fillRect(cx - B, floorY + c.y - B, B * 2, B * 2);
        }
        ctx.globalAlpha = 1;
    }

    // Бульбашки піднімаються
    drawFallingPixels(ctx, W, gY, time, 30, 262, {
        color: "#bff4ff", dir: -1, speedMin: 30, speedMax: 70, sizeMin: 2, sizeMax: Math.max(3, Math.round(B / 5)),
        sway: 2, swayAmp: B * 0.3, alpha: 0.55
    });
};

// ---------- Пустеля (рівень 27) ----------

function buildPixelDesert(W, H, groundY, B) {
    const rng = pixelRng(2727);
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#1d0b3a"], [0.4, "#6a1f5e"], [0.62, "#ff6a3d"], [1, "#ffb35c"]]);
    const skx = sky.getContext("2d");
    // Велике квадратне сонце низько над обрієм
    const sunS = B * 5;
    const sunX = Math.round(W * 0.62 / B) * B;
    const sunY = Math.round((gY - B * 9) / B) * B;
    skx.fillStyle = "rgba(255, 220, 120, 0.15)";
    skx.fillRect(sunX - B, sunY - B, sunS + B * 2, sunS + B * 2);
    skx.fillStyle = "#ffd36b";
    skx.fillRect(sunX, sunY, sunS, sunS);
    skx.fillStyle = "#ffb347";
    for (let i = 1; i < 4; i++) {
        skx.fillRect(sunX, sunY + sunS - i * B * 1.2, sunS, B * 0.3);
    }

    // Далекі піраміди
    const farCols = Math.ceil(W * 1.5 / B);
    const far = makeCanvas(farCols * B, B * 9);
    const fx = far.getContext("2d");
    const pyramids = [[Math.round(farCols * 0.2), 8], [Math.round(farCols * 0.3), 5], [Math.round(farCols * 0.7), 7]];
    for (const pyr of pyramids) {
        for (let level = 0; level < pyr[1]; level++) {
            const w = (pyr[1] - level) * 2 - 1;
            fx.fillStyle = level % 2 === 0 ? "#b0703c" : "#9a6033";
            fx.fillRect((pyr[0] - (pyr[1] - level) + 1) * B, far.height - (level + 1) * B, w * B, B);
        }
    }

    // Дюни з кактусами
    const nearCols = Math.ceil(W * 1.3 / B);
    const nearH = periodicHeights(nearCols, 2.5, [{ amp: 1.3, k: 3, ph: 0.8 }, { amp: 0.7, k: 7, ph: 0.1 }]);
    const near = makeCanvas(nearCols * B, (Math.max.apply(null, nearH) + 4) * B);
    const nx = near.getContext("2d");
    drawBlockTerrain(nx, nearH, B, near.height, { top: "#e8b85c", topLight: "#f5d48a", body: "#d19a45", body2: "#c28c3c", speck: "#b07a30" }, rng);
    for (let c = 4; c < nearCols - 2; c += 8 + Math.floor(rng() * 5)) {
        const top = near.height - nearH[c] * B;
        const h = 2 + Math.floor(rng() * 2);
        nx.fillStyle = "#2f8a3a";
        nx.fillRect(c * B, top - h * B, B, h * B);
        nx.fillRect((c - 1) * B, top - (h - 1) * B, B / 2, B / 2);
        nx.fillRect((c - 1) * B, top - (h - 1) * B - B / 2, B / 2, B);
        nx.fillRect((c + 1) * B + B / 2, top - h * B + B / 2, B / 2, B);
        nx.fillStyle = "#4fb55a";
        nx.fillRect(c * B + B / 4, top - h * B, B / 4, h * B);
    }
    return { W: W, H: H, sky: sky, far: far, near: near };
}

BackgroundRenderer.renderPixelDesert = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._pixelDesert;
    if (!st || st.W !== W || st.H !== H) {
        st = buildPixelDesert(W, H, groundY, B);
        this._pixelDesert = st;
    }
    ctx.drawImage(st.sky, 0, 0);
    drawScrollingStrip(ctx, st.far, W, groundY, time, speed, 0.08);
    drawScrollingStrip(ctx, st.near, W, groundY, time, speed, 0.3);
    // Пісок, що несе вітер
    drawFallingPixels(ctx, W, groundY, time, 20, 272, {
        color: "#ffe0a0", dir: 1, speedMin: 3, speedMax: 8, sizeMin: 2, sizeMax: 3,
        sway: 0.8, swayAmp: W * 0.4, alpha: 0.5
    });
};

// ---------- Парящі острови в космосі (рівень 28) ----------

function buildPixelIslands(W, H, groundY, B) {
    const rng = pixelRng(2828);
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#05010d"], [0.6, "#140726"], [1, "#2a0f45"]]);
    const skx = sky.getContext("2d");
    for (let i = 0; i < 90; i++) {
        skx.fillStyle = rng() < 0.2 ? "#d9b3ff" : "#ffffff";
        skx.globalAlpha = 0.3 + rng() * 0.7;
        const s = rng() < 0.15 ? B / 3 : B / 6;
        skx.fillRect(Math.round(rng() * W), Math.round(rng() * gY), s, s);
    }
    skx.globalAlpha = 1;
    // Велика піксельна планета
    const pr = B * 4;
    const px = Math.round(W * 0.2);
    const py = Math.round(gY * 0.3);
    for (let y = -pr; y < pr; y += B / 2) {
        for (let x = -pr; x < pr; x += B / 2) {
            if (x * x + y * y > pr * pr) {
                continue;
            }
            skx.fillStyle = (y + x * 0.3) % (B * 2) < B ? "#6b3fa8" : "#57318c";
            if (x + y > pr * 0.6) {
                skx.fillStyle = "#3a1f63";
            }
            skx.fillRect(px + x, py + y, B / 2, B / 2);
        }
    }

    // Острови: світлий камінь зверху, темний низ, що звужується, кристали
    function islandsStrip(stripW, count, scale, seed) {
        const r = pixelRng(seed);
        const strip = makeCanvas(stripW, gY);
        const sx = strip.getContext("2d");
        for (let i = 0; i < count; i++) {
            const w = Math.round((3 + r() * 5) * scale);
            const x = Math.round((i + 0.2 + r() * 0.5) * stripW / count / B) * B;
            const y = Math.round((gY * (0.25 + r() * 0.5)) / B) * B;
            const rows = Math.ceil(w / 2);
            for (let row = 0; row < rows; row++) {
                const rowW = Math.max(1, w - row * 2);
                const rowX = x + row * B;
                sx.fillStyle = row === 0 ? "#e3dca8" : row === 1 ? "#c9c08c" : "#4a3f5c";
                sx.fillRect(rowX, y + row * B, rowW * B, B);
            }
            // Фіолетовий кристал на острові
            if (r() < 0.7) {
                const cx = x + Math.floor(w / 2) * B;
                sx.fillStyle = "#b35cff";
                sx.fillRect(cx, y - B * 2, B, B * 2);
                sx.fillStyle = "#e6bfff";
                sx.fillRect(cx, y - B * 2, B / 3, B);
            }
        }
        return strip;
    }
    const far = islandsStrip(Math.ceil(W * 1.5 / B) * B, 5, 0.6, 2801);
    const near = islandsStrip(Math.ceil(W * 1.3 / B) * B, 3, 1, 2802);
    return { W: W, H: H, sky: sky, far: far, near: near };
}

BackgroundRenderer.renderPixelIslands = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._pixelIslands;
    if (!st || st.W !== W || st.H !== H) {
        st = buildPixelIslands(W, H, groundY, B);
        this._pixelIslands = st;
    }
    ctx.drawImage(st.sky, 0, 0);
    // Острови ледь погойдуються вгору-вниз
    const bobFar = Math.round(Math.sin(time * 0.6) * B * 0.3);
    const bobNear = Math.round(Math.sin(time * 0.8 + 1) * B * 0.4);
    drawScrollingStrip(ctx, st.far, W, st.far.height + bobFar, time, speed, 0.08);
    drawScrollingStrip(ctx, st.near, W, st.near.height + bobNear, time, speed, 0.2);
    // Фіолетові іскри піднімаються
    drawFallingPixels(ctx, W, Math.round(groundY), time, 35, 282, {
        color: "#d68bff", dir: -1, speedMin: 15, speedMax: 40, sizeMin: 2, sizeMax: Math.max(3, Math.round(B / 5)),
        sway: 1.5, swayAmp: B * 0.5, alpha: 0.7
    });
};

// ---------- Вогняний світ (рівень 31, бос) ----------

function buildPixelNether(W, H, groundY, B) {
    const rng = pixelRng(3131);
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#0d0000"], [0.5, "#2a0404"], [1, "#4a0a05"]]);

    // Скелі-стеля зверху (сталактити з вогняного каменю)
    const cols = Math.ceil(W * 1.4 / B);
    const ceilH = periodicHeights(cols, 3, [{ amp: 2, k: 4, ph: 0.2 }, { amp: 1, k: 9, ph: 1 }]);
    const ceil = makeCanvas(cols * B, (Math.max.apply(null, ceilH) + 1) * B);
    const cx = ceil.getContext("2d");
    const p = B / 4;
    for (let c = 0; c < cols; c++) {
        for (let r = 0; r < ceilH[c]; r++) {
            cx.fillStyle = (r + c) % 2 === 0 ? "#5a1616" : "#4a1010";
            cx.fillRect(c * B, r * B, B, B);
            cx.fillStyle = "#6e2020";
            cx.fillRect(c * B + Math.floor(rng() * 4) * p, r * B + Math.floor(rng() * 4) * p, p, p);
        }
    }

    // Скелі знизу з лавою
    const nearH = periodicHeights(cols, 2.5, [{ amp: 1.5, k: 3, ph: 1.3 }, { amp: 1, k: 8, ph: 0.4 }]);
    const near = makeCanvas(cols * B, (Math.max.apply(null, nearH) + 1) * B);
    const nx = near.getContext("2d");
    drawBlockTerrain(nx, nearH, B, near.height, { top: "#7a2020", topLight: "#9a3030", body: "#4a1010", body2: "#551414", speck: "#ff6a00" }, rng);

    // Лавопади: стовпчики, що стікають зі стелі
    const falls = [];
    for (let c = 4; c < cols - 2; c += 9 + Math.floor(rng() * 6)) {
        falls.push({ x: c * B, top: ceilH[c] * B });
    }
    return { W: W, H: H, sky: sky, ceil: ceil, near: near, falls: falls };
}

BackgroundRenderer.renderPixelNether = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._pixelNether;
    if (!st || st.W !== W || st.H !== H) {
        st = buildPixelNether(W, H, groundY, B);
        this._pixelNether = st;
    }
    const gY = Math.round(groundY);
    ctx.drawImage(st.sky, 0, 0);

    // Лавові колони-еквалайзери в глибині пульсують у такт (120 ударів на хвилину)
    const beat = Math.pow(Math.max(0, Math.sin(time * Math.PI * 2)), 4);
    const barCount = 18;
    const barW = Math.round(W / barCount);
    for (let i = 0; i < barCount; i++) {
        const level = 0.25 + 0.35 * (Math.sin(time * 1.7 + i * 0.9) * 0.5 + 0.5) + 0.3 * beat * (i % 3 === 0 ? 1 : 0.6);
        const blocks = Math.round(level * gY * 0.55 / B);
        for (let b = 0; b < blocks; b++) {
            ctx.fillStyle = b === blocks - 1 ? "rgba(255, 200, 60, 0.35)" : "rgba(255, 70, 0, " + (0.1 + b * 0.012).toFixed(3) + ")";
            ctx.fillRect(i * barW + 2, gY - (b + 1) * B, barW - 4, B - 2);
        }
    }

    // Стеля та лавопади зсуваються разом
    const ceilW = st.ceil.width;
    const offset = Math.round(time * speed * 0.2) % ceilW;
    for (let x = -offset; x < W; x += ceilW) {
        for (const f of st.falls) {
            const fxp = x + f.x;
            if (fxp < -B || fxp > W + B) {
                continue;
            }
            const flowH = gY - f.top;
            ctx.fillStyle = "#ff6a00";
            ctx.fillRect(fxp, f.top, B, flowH);
            // «Течія»: світлі пікселі, що біжать донизу
            ctx.fillStyle = "#ffcc33";
            const step = B * 1.5;
            const shift = (time * 180) % step;
            for (let y = f.top + shift; y < gY; y += step) {
                ctx.fillRect(fxp + B / 4, Math.round(y), B / 4, B / 2);
            }
        }
        ctx.drawImage(st.ceil, x, 0);
    }
    drawScrollingStrip(ctx, st.near, W, gY, time, speed, 0.35);

    // Лавове світіння біля землі та попіл
    ctx.globalAlpha = 0.25 + 0.15 * beat;
    ctx.fillStyle = "#ff4400";
    ctx.fillRect(0, gY - B * 2, W, B * 2);
    ctx.globalAlpha = 1;
    drawFallingPixels(ctx, W, gY, time, 40, 313, {
        color: "#ffae42", dir: -1, speedMin: 20, speedMax: 60, sizeMin: 2, sizeMax: Math.max(3, Math.round(B / 5)),
        sway: 1.8, swayAmp: B * 0.6, alpha: 0.75
    });
};

// ---------- Неонова траса (рівень 4) ----------

function buildNeonHighway(W, H, groundY) {
    const gY = Math.round(groundY);
    const horizon = Math.round(gY * 0.55);
    const sky = makeSky(W, H, [[0, "#07021a"], [0.35, "#2a0a4a"], [0.55, "#7a1a6a"], [1, "#07021a"]]);
    const sx = sky.getContext("2d");
    // Сонце з прорізами
    const sunR = Math.round(H * 0.16);
    const sunX = Math.round(W / 2);
    sx.save();
    sx.beginPath();
    sx.rect(0, 0, W, horizon);
    sx.clip();
    const sg = sx.createLinearGradient(0, horizon - sunR, 0, horizon);
    sg.addColorStop(0, "#ffe14d");
    sg.addColorStop(1, "#ff2ea6");
    sx.fillStyle = sg;
    sx.beginPath();
    sx.arc(sunX, horizon, sunR, 0, Math.PI * 2);
    sx.fill();
    sx.fillStyle = "#3a0d5a";
    for (let i = 0; i < 5; i++) {
        sx.fillRect(sunX - sunR, horizon - 6 - i * sunR * 0.17, sunR * 2, 2 + i);
    }
    sx.restore();
    // Силует міста на обрії
    const rng = pixelRng(404);
    sx.fillStyle = "#12052a";
    for (let x = 0; x < W; ) {
        const w = 20 + rng() * 60;
        const h = 15 + rng() * H * 0.12;
        sx.fillRect(x, horizon - h, w, h);
        x += w + rng() * 10;
    }
    // Земля під обрієм
    sx.fillStyle = "#08021a";
    sx.fillRect(0, horizon, W, H - horizon);
    return { W: W, H: H, sky: sky, horizon: horizon };
}

BackgroundRenderer.renderNeonHighway = function (ctx, W, H, groundY, time, speed) {
    let st = this._neonHighway;
    if (!st || st.W !== W || st.H !== H) {
        st = buildNeonHighway(W, H, groundY);
        this._neonHighway = st;
    }
    const gY = Math.round(groundY);
    const hz = st.horizon;
    ctx.drawImage(st.sky, 0, 0);
    const cx = W / 2;
    // Дорога в перспективі
    ctx.fillStyle = "#14062e";
    ctx.beginPath();
    ctx.moveTo(cx - W * 0.02, hz);
    ctx.lineTo(cx + W * 0.02, hz);
    ctx.lineTo(cx + W * 0.45, gY);
    ctx.lineTo(cx - W * 0.45, gY);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#ff2ea6";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - W * 0.02, hz);
    ctx.lineTo(cx - W * 0.45, gY);
    ctx.moveTo(cx + W * 0.02, hz);
    ctx.lineTo(cx + W * 0.45, gY);
    ctx.stroke();
    // Розділова розмітка та ліхтарі, що біжать назустріч
    const phase = (time * speed * 0.004) % 1;
    ctx.fillStyle = "#ffe14d";
    for (let i = 0; i < 8; i++) {
        const t = (i + phase) / 8;
        const k = t * t;
        const y = hz + (gY - hz) * k;
        const w = 2 + k * 10;
        const hgt = 2 + k * 18;
        ctx.fillRect(cx - w / 2, y, w, hgt);
        // Ліхтарні стовпи обабіч
        const px = W * 0.02 + k * W * 0.5;
        const postH = 6 + k * H * 0.25;
        ctx.fillStyle = "#3a1a6a";
        ctx.fillRect(cx - px - 2, y - postH, 2 + k * 3, postH);
        ctx.fillRect(cx + px, y - postH, 2 + k * 3, postH);
        ctx.fillStyle = "#00f6ff";
        ctx.fillRect(cx - px - 2 - k * 6, y - postH, 4 + k * 12, 2 + k * 4);
        ctx.fillRect(cx + px - k * 6, y - postH, 4 + k * 12, 2 + k * 4);
        ctx.fillStyle = "#ffe14d";
    }
};

// ---------- Нічне неонове місто (рівень 17): далекі хмарочоси + дахи з вивісками ----------

function buildNeonRooftops(W, H, groundY) {
    const gY = Math.round(groundY);
    const rng = pixelRng(1818);
    const sky = makeSky(W, H, [[0, "#050314"], [0.6, "#1a0b3a"], [1, "#2e0f52"]]);
    const sx = sky.getContext("2d");
    sx.fillStyle = "rgba(244, 233, 255, 0.08)";
    sx.beginPath();
    sx.arc(W * 0.82, H * 0.14, H * 0.08, 0, Math.PI * 2);
    sx.fill();
    sx.fillStyle = "#f4e9ff";
    sx.beginPath();
    sx.arc(W * 0.82, H * 0.14, H * 0.05, 0, Math.PI * 2);
    sx.fill();
    const windowColors = ["rgba(255, 220, 140, 0.45)", "rgba(140, 220, 255, 0.35)", "rgba(255, 150, 220, 0.3)"];

    // Далекі хмарочоси з вікнами
    const farW = Math.ceil(W * 1.5);
    const far = makeCanvas(farW, gY * 0.7);
    const fx = far.getContext("2d");
    for (let x = 0; x < farW; ) {
        const w = 30 + rng() * 80;
        const h = far.height * (0.3 + rng() * 0.7);
        fx.fillStyle = rng() < 0.5 ? "#1b0f3a" : "#221449";
        fx.fillRect(x, far.height - h, w, h);
        fx.fillStyle = "rgba(120, 100, 200, 0.35)";
        fx.fillRect(x, far.height - h, w, 2);
        for (let wy = far.height - h + 8; wy < far.height - 6; wy += 12) {
            for (let wx = x + 5; wx < x + w - 6; wx += 10) {
                if (rng() < 0.3) {
                    fx.fillStyle = windowColors[Math.floor(rng() * windowColors.length)];
                    fx.fillRect(wx, wy, 4, 5);
                }
            }
        }
        x += w + 4 + rng() * 12;
    }

    // Ближні дахи: вивіски малюються одразу в смугу разом зі світінням
    const nearW = Math.ceil(W * 1.3);
    const near = makeCanvas(nearW, gY * 0.5);
    const nx = near.getContext("2d");
    const lights = [];
    const flickering = [];
    const signColors = ["#ff2ea6", "#00f6ff", "#39ff88", "#ffe14d", "#b06bff"];
    function drawSign(x, y, w, h, color) {
        nx.globalAlpha = 0.18;
        nx.fillStyle = color;
        nx.fillRect(x - 6, y - 6, w + 12, h + 12);
        nx.globalAlpha = 1;
        nx.strokeStyle = color;
        nx.lineWidth = 2;
        nx.strokeRect(x, y, w, h);
        // «Літери» вивіски — короткі риски
        nx.fillStyle = color;
        const vertical = h > w;
        const n = Math.max(2, Math.floor((vertical ? h : w) / 14));
        for (let i = 0; i < n; i++) {
            if (vertical) {
                nx.fillRect(x + 3, y + 4 + i * 14, w - 6, 8);
            } else {
                nx.fillRect(x + 4 + i * 14, y + 3, 8, h - 6);
            }
        }
    }
    for (let x = 0; x < nearW - 40; ) {
        const w = 90 + rng() * 140;
        const h = near.height * (0.35 + rng() * 0.45);
        const top = near.height - h;
        nx.fillStyle = "#0d0620";
        nx.fillRect(x, top, w, h);
        nx.fillStyle = "#2a1650";
        nx.fillRect(x, top, w, 4);
        // Кілька тьмяних вікон
        nx.fillStyle = "rgba(255, 220, 140, 0.25)";
        for (let wy = top + 40; wy < near.height - 8; wy += 16) {
            for (let wx = x + 8; wx < x + w - 10; wx += 14) {
                if (rng() < 0.15) {
                    nx.fillRect(wx, wy, 5, 6);
                }
            }
        }
        // Бак для води або антена
        if (rng() < 0.5) {
            nx.fillStyle = "#1a0d33";
            nx.fillRect(x + w * 0.2, top - 26, 22, 26);
            nx.fillRect(x + w * 0.2 + 4, top - 32, 14, 6);
        } else {
            nx.fillStyle = "#2a1650";
            nx.fillRect(x + w * 0.7, top - 50, 3, 50);
            lights.push({ x: x + w * 0.7 + 1, y: top - 52, phase: rng() * 6 });
        }
        // Горизонтальна вивіска на даху та вертикальна на стіні
        const signs = [];
        if (rng() < 0.85) {
            signs.push({ x: x + w * 0.3, y: top + 12, w: Math.round(w * 0.4), h: 14 });
        }
        if (rng() < 0.6 && h > 70) {
            signs.push({ x: x + w - 22, y: top + 34, w: 14, h: Math.round(Math.min(h - 50, 90)) });
        }
        for (const sg of signs) {
            const color = signColors[Math.floor(rng() * signColors.length)];
            drawSign(sg.x, sg.y, sg.w, sg.h, color);
            // Лише приблизно кожна четверта вивіска мерехтить
            if (rng() < 0.25) {
                flickering.push({ x: sg.x - 6, y: sg.y - 6, w: sg.w + 12, h: sg.h + 12, phase: rng() * 10 });
            }
        }
        x += w + 14 + rng() * 30;
    }
    return { W: W, H: H, sky: sky, far: far, near: near, lights: lights, flickering: flickering };
}

BackgroundRenderer.renderNeonRooftops = function (ctx, W, H, groundY, time, speed) {
    let st = this._neonRooftops;
    if (!st || st.W !== W || st.H !== H) {
        st = buildNeonRooftops(W, H, groundY);
        this._neonRooftops = st;
    }
    const gY = Math.round(groundY);
    ctx.drawImage(st.sky, 0, 0);
    drawScrollingStrip(ctx, st.far, W, gY, time, speed, 0.1);
    const nearW = st.near.width;
    const offset = Math.round(time * speed * 0.3) % nearW;
    const top = gY - st.near.height;
    for (let x = -offset; x < W; x += nearW) {
        ctx.drawImage(st.near, x, top);
        // М'яке мерехтіння: вивіска на мить тьмяніє, а не гасне повністю
        ctx.fillStyle = "rgba(13, 6, 32, 0.45)";
        for (const f of st.flickering) {
            const fx = x + f.x;
            if (fx < -f.w || fx > W) {
                continue;
            }
            const dip = Math.sin(time * 7 + f.phase) * Math.sin(time * 2.3 + f.phase * 2);
            if (dip > 0.8) {
                ctx.fillRect(fx, top + f.y, f.w, f.h);
            }
        }
        for (const l of st.lights) {
            const lx = x + l.x;
            if (lx < -10 || lx > W + 10) {
                continue;
            }
            const on = Math.sin(time * 3 + l.phase) > 0;
            ctx.fillStyle = on ? "#ff2222" : "#551111";
            ctx.fillRect(lx - 3, top + l.y - 3, 6, 6);
        }
    }
    // Дощ
    drawFallingPixels(ctx, W, gY, time, 60, 181, {
        color: "#8fb8ff", dir: 1, speedMin: 400, speedMax: 600, sizeMin: 1, sizeMax: 2,
        sway: 0, swayAmp: 0, alpha: 0.35, stretch: 8
    });
};

// ---------- Нічна гавань (рівень 18) ----------

function buildNightHarbor(W, H, groundY) {
    const gY = Math.round(groundY);
    const rng = pixelRng(1819);
    const horizon = Math.round(gY * 0.55);
    const sky = makeSky(W, H, [[0, "#04061a"], [0.5, "#101a4a"], [1, "#06081a"]]);
    const sx = sky.getContext("2d");
    drawStarsInto(sx, W, horizon * 0.7, 60, rng, 16);
    // Далеке місто на березі з вогнями
    const lights = [];
    for (let x = 0; x < W; ) {
        const w = 20 + rng() * 50;
        const h = 15 + rng() * horizon * 0.35;
        sx.fillStyle = "#0b1030";
        sx.fillRect(x, horizon - h, w, h);
        for (let wy = horizon - h + 6; wy < horizon - 4; wy += 9) {
            for (let wx = x + 3; wx < x + w - 4; wx += 7) {
                if (rng() < 0.25) {
                    const c = ["#ffcc66", "#66e0ff", "#ff66c4"][Math.floor(rng() * 3)];
                    sx.fillStyle = c;
                    sx.fillRect(wx, wy, 3, 3);
                    if (rng() < 0.3) {
                        lights.push({ x: wx, color: c, phase: rng() * 6 });
                    }
                }
            }
        }
        x += w + rng() * 6;
    }
    // Вода
    const water = sx.createLinearGradient(0, horizon, 0, gY);
    water.addColorStop(0, "#0a1440");
    water.addColorStop(1, "#040820");
    sx.fillStyle = water;
    sx.fillRect(0, horizon, W, gY - horizon);
    // Портові крани
    const cranes = makeCanvas(Math.ceil(W * 1.4), horizon);
    const cx = cranes.getContext("2d");
    for (let x = 40; x < cranes.width - 120; x += 260 + rng() * 120) {
        const h = horizon * (0.55 + rng() * 0.3);
        cx.fillStyle = "#2a1f3a";
        cx.fillRect(x, horizon - h, 8, h);
        cx.fillRect(x - 40, horizon - h, 140, 6);
        cx.fillRect(x + 90, horizon - h, 3, h * 0.5);
        cx.fillStyle = "#ff3355";
        cx.fillRect(x - 40, horizon - h - 4, 5, 4);
        cx.fillRect(x + 95, horizon - h - 4, 5, 4);
    }
    return { W: W, H: H, sky: sky, cranes: cranes, lights: lights, horizon: horizon };
}

BackgroundRenderer.renderNightHarbor = function (ctx, W, H, groundY, time, speed) {
    let st = this._nightHarbor;
    if (!st || st.W !== W || st.H !== H) {
        st = buildNightHarbor(W, H, groundY);
        this._nightHarbor = st;
    }
    const gY = Math.round(groundY);
    const hz = st.horizon;
    ctx.drawImage(st.sky, 0, 0);
    drawScrollingStrip(ctx, st.cranes, W, hz, time, speed, 0.08);
    // Відображення вогнів у воді: смужки, що тремтять
    for (let i = 0; i < st.lights.length; i++) {
        const l = st.lights[i];
        const len = 6 + ((i * 7) % 5) * 6;
        for (let k = 0; k < 4; k++) {
            const y = hz + 4 + k * (gY - hz) / 5;
            const jitter = Math.round(Math.sin(time * 3 + l.phase + k) * 3);
            ctx.globalAlpha = 0.35 - k * 0.07;
            ctx.fillStyle = l.color;
            ctx.fillRect(l.x + jitter - len / 4, y, len / 2, 2);
        }
    }
    ctx.globalAlpha = 1;
    // Хвилі
    ctx.fillStyle = "rgba(120, 160, 255, 0.12)";
    const wo = (time * 20) % 40;
    for (let y = hz + 10; y < gY; y += 14) {
        for (let x = -wo + ((y / 14) % 2) * 20; x < W; x += 40) {
            ctx.fillRect(Math.round(x), y, 14, 2);
        }
    }
    // Кораблі з вогниками повільно пливуть
    for (let s = 0; s < 2; s++) {
        const span = W + 400;
        const x = Math.round(((s * 700 + time * (18 + s * 10)) % span) - 200);
        const y = hz + 8 + s * 28;
        const len = 160 - s * 40;
        ctx.fillStyle = "#1a1030";
        ctx.fillRect(x, y, len, 14 - s * 3);
        ctx.fillRect(x + len * 0.55, y - 16, len * 0.25, 16);
        ctx.fillStyle = "#ffcc66";
        for (let wx = x + 8; wx < x + len - 10; wx += 16) {
            ctx.fillRect(wx, y + 4, 4, 3);
        }
        ctx.fillStyle = Math.sin(time * 4 + s) > 0 ? "#39ff88" : "#ff3355";
        ctx.fillRect(x + len - 6, y - 4, 4, 4);
    }
};

// ---------- Ліга 1: сцени рівнів ----------

// Піксельний силует гір з неоновим контуром (для далекого плану)
function drawNeonMountains(ctx, W, baseY, B, heights, fill, edge) {
    ctx.fillStyle = fill;
    for (let c = 0; c < heights.length; c++) {
        ctx.fillRect(c * B, baseY - heights[c] * B, B, heights[c] * B);
    }
    ctx.fillStyle = edge;
    for (let c = 0; c < heights.length; c++) {
        ctx.fillRect(c * B, baseY - heights[c] * B, B, Math.max(2, B / 5));
        const prev = c > 0 ? heights[c - 1] : heights[c];
        if (prev !== heights[c]) {
            const top = baseY - Math.max(prev, heights[c]) * B;
            const hgt = Math.abs(prev - heights[c]) * B;
            ctx.fillRect(c * B, top, Math.max(2, B / 5), hgt);
        }
    }
}

// Зоряне небо у буфер
function drawStarsInto(ctx, W, maxY, count, rng, B) {
    for (let i = 0; i < count; i++) {
        ctx.fillStyle = rng() < 0.2 ? "#bfe9ff" : "#ffffff";
        ctx.globalAlpha = 0.3 + rng() * 0.7;
        const s = rng() < 0.1 ? Math.max(2, B / 4) : Math.max(1, B / 8);
        ctx.fillRect(Math.round(rng() * W), Math.round(rng() * maxY), s, s);
    }
    ctx.globalAlpha = 1;
}

// ---------- 1. Неоновий старт ----------

function buildNeonStart(W, H, groundY, B) {
    const rng = pixelRng(101);
    const horizon = Math.round(H * 0.35);
    const sky = makeSky(W, H, [[0, "#02030f"], [0.35, "#0a1035"], [1, "#0a1035"]]);
    const sx = sky.getContext("2d");
    drawStarsInto(sx, W, horizon - B, 80, rng, B);
    const cols = Math.ceil(W / B) + 1;
    const far = periodicHeights(cols, 4, [{ amp: 2, k: 3, ph: 0.4 }, { amp: 1.2, k: 7, ph: 1.1 }]);
    drawNeonMountains(sx, W, horizon, B, far, "#0b0f2e", "rgba(0, 246, 255, 0.55)");
    return { W: W, H: H, sky: sky, horizon: horizon };
}

BackgroundRenderer.renderNeonStart = function (ctx, W, H, groundY, time, speed, accentColor) {
    const B = pixelBlockSize(H);
    let st = this._neonStart;
    if (!st || st.W !== W || st.H !== H) {
        st = buildNeonStart(W, H, groundY, B);
        this._neonStart = st;
    }
    ctx.drawImage(st.sky, 0, 0);
    const hz = st.horizon;
    const accent = accentColor || "#00f6ff";
    // Перспективна сітка: усі лінії однієї групи — один шлях
    const vanishX = W / 2;
    const spacing = W * 0.08;
    const offset = (time * speed * 0.25) % spacing;
    ctx.lineWidth = 1;
    ctx.strokeStyle = accent;
    ctx.globalAlpha = 0.55;
    ctx.beginPath();
    for (let x = -W * 2 - offset; x < W * 3; x += spacing) {
        ctx.moveTo(vanishX, hz);
        ctx.lineTo(x, groundY);
    }
    ctx.stroke();
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    for (let j = 1; j <= 14; j++) {
        const t = j / 14;
        const y = hz + (groundY - hz) * t * t;
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.fillStyle = accent;
    ctx.fillRect(0, hz - 1, W, 3);
    // Падаючі метеори: кожні ~4 с один проноситься небом
    for (let m = 0; m < 2; m++) {
        const period = 4 + m * 2.3;
        const t = ((time + m * 1.7) % period) / 1.1;
        if (t > 1) {
            continue;
        }
        const seed = Math.floor((time + m * 1.7) / period) * 7 + m;
        const startX = W * (0.3 + ((seed * 0.37) % 0.6));
        const x = startX - t * W * 0.35;
        const y = hz * 0.1 + t * hz * 0.55;
        for (let k = 0; k < 6; k++) {
            ctx.globalAlpha = (1 - k / 6) * (1 - t * 0.5);
            ctx.fillStyle = k === 0 ? "#ffffff" : "#7df9ff";
            ctx.fillRect(Math.round(x + k * B * 0.5), Math.round(y - k * B * 0.4), Math.max(2, B / 4), Math.max(2, B / 4));
        }
    }
    ctx.globalAlpha = 1;
};

// ---------- 2. Місто на заході сонця ----------

function buildSunsetCity(W, H, groundY, B) {
    const rng = pixelRng(202);
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#1a0a2e"], [0.35, "#5a1450"], [0.62, "#e0445a"], [1, "#ffb35c"]]);
    const sx = sky.getContext("2d");
    const sunR = Math.round(H * 0.13);
    const sunX = Math.round(W * 0.5);
    const sunY = Math.round(gY * 0.72);
    sx.fillStyle = "#ffd36b";
    for (let y = -sunR; y < sunR; y += B / 2) {
        const half = Math.sqrt(sunR * sunR - y * y);
        sx.fillRect(Math.round(sunX - half), sunY + y, Math.round(half * 2), B / 2);
    }
    function cityStrip(stripW, maxH, colorBody, windowColors, winChance, seed) {
        const r = pixelRng(seed);
        const strip = makeCanvas(stripW, maxH);
        const cx = strip.getContext("2d");
        for (let x = 0; x < stripW; ) {
            const w = Math.round((3 + r() * 5)) * B / 2;
            const h = Math.round((0.35 + r() * 0.65) * maxH / (B / 2)) * B / 2;
            cx.fillStyle = colorBody;
            cx.fillRect(x, maxH - h, w, h);
            for (let wy = maxH - h + B / 2; wy < maxH - B / 2; wy += B / 2) {
                for (let wx = x + B / 4; wx < x + w - B / 4; wx += B / 2) {
                    if (r() < winChance) {
                        cx.fillStyle = windowColors[Math.floor(r() * windowColors.length)];
                        cx.fillRect(wx, wy, B / 4, B / 4);
                    }
                }
            }
            x += w + Math.round(r() * 2) * B / 4;
        }
        return strip;
    }
    const far = cityStrip(Math.ceil(W * 1.5 / B) * B, Math.round(gY * 0.45), "#3a1250", ["rgba(255, 180, 120, 0.5)"], 0.15, 2021);
    const near = cityStrip(Math.ceil(W * 1.3 / B) * B, Math.round(gY * 0.32), "#140620", ["#ffd36b", "#ff9ed0", "#7df9ff"], 0.3, 2022);
    const cars = [];
    for (let i = 0; i < 5; i++) {
        cars.push({ lane: i % 2, offset: rng() * W * 2, speed: 90 + rng() * 80, color: ["#ff2ea6", "#00f6ff", "#ffe14d"][i % 3] });
    }
    return { W: W, H: H, sky: sky, far: far, near: near, cars: cars };
}

BackgroundRenderer.renderSunsetCity = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._sunsetCity;
    if (!st || st.W !== W || st.H !== H) {
        st = buildSunsetCity(W, H, groundY, B);
        this._sunsetCity = st;
    }
    const gY = Math.round(groundY);
    ctx.drawImage(st.sky, 0, 0);
    drawScrollingStrip(ctx, st.far, W, gY, time, speed, 0.08);
    // Літаючі машини-кубики зі світловим шлейфом
    for (const car of st.cars) {
        const span = W + B * 10;
        const x = Math.round(((car.offset + time * car.speed) % span) - B * 5);
        const y = Math.round(gY * (0.3 + car.lane * 0.12));
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = car.color;
        ctx.fillRect(x - B * 2, y + B * 0.2, B * 2, B * 0.25);
        ctx.globalAlpha = 1;
        ctx.fillRect(x, y, B, B * 0.6);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(x + B * 0.7, y + B * 0.1, B * 0.25, B * 0.2);
    }
    drawScrollingStrip(ctx, st.near, W, gY, time, speed, 0.3);
};

// ---------- 3. Космодром ----------

function buildCosmodrome(W, H, groundY, B) {
    const rng = pixelRng(303);
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#020412"], [0.7, "#0b1640"], [1, "#1b2a5c"]]);
    const sx = sky.getContext("2d");
    drawStarsInto(sx, W, gY * 0.8, 110, rng, B);
    const cols = Math.ceil(W / B) + 1;
    const hills = periodicHeights(cols, 2, [{ amp: 1, k: 2, ph: 0.2 }, { amp: 0.6, k: 5, ph: 1 }]);
    sx.fillStyle = "#0a1026";
    for (let c = 0; c < cols; c++) {
        sx.fillRect(c * B, gY - hills[c] * B, B, hills[c] * B);
    }
    // Стартова вежа
    const towerX = Math.round(W * 0.72 / B) * B;
    sx.fillStyle = "#2a3350";
    sx.fillRect(towerX, gY - B * 12, B, B * 12);
    for (let i = 0; i < 12; i++) {
        sx.fillStyle = i % 2 === 0 ? "#3a4570" : "#2a3350";
        sx.fillRect(towerX - B / 2, gY - B * (i + 1), B * 2, B / 4);
    }
    sx.fillStyle = "#ff3333";
    sx.fillRect(towerX + B / 4, gY - B * 12.5, B / 2, B / 2);
    // Майданчик
    sx.fillStyle = "#39415e";
    sx.fillRect(towerX - B * 2, gY - B, B * 6, B);
    return { W: W, H: H, sky: sky, padX: towerX + B * 1.5, gY: gY };
}

BackgroundRenderer.renderCosmodrome = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._cosmodrome;
    if (!st || st.W !== W || st.H !== H) {
        st = buildCosmodrome(W, H, groundY, B);
        this._cosmodrome = st;
    }
    ctx.drawImage(st.sky, 0, 0);
    // Ракета: стоїть кілька секунд, потім злітає з вогняним слідом
    const period = 14;
    const t = time % period;
    const launchAt = 5;
    const lift = t < launchAt ? 0 : Math.pow(t - launchAt, 2) * B * 3;
    const rx = st.padX;
    const ry = st.gY - B - B * 6 - lift;
    if (ry > -B * 8) {
        if (t >= launchAt - 1) {
            // Вогонь і дим
            const flameH = B * (2 + Math.sin(time * 30) * 0.5 + (t >= launchAt ? 2 : 0));
            ctx.fillStyle = "#ffcc33";
            ctx.fillRect(rx + B * 0.25, ry + B * 6, B * 1.5, flameH);
            ctx.fillStyle = "#ff6a00";
            ctx.fillRect(rx + B * 0.5, ry + B * 6 + flameH * 0.3, B, flameH);
            ctx.fillStyle = "rgba(200, 200, 220, 0.25)";
            for (let k = 0; k < 6; k++) {
                const sz = B * (1 + k * 0.5);
                ctx.fillRect(rx + B - sz / 2 + Math.sin(k * 2 + time) * B, st.gY - B - sz, sz, sz);
            }
        }
        ctx.fillStyle = "#e8ecf2";
        ctx.fillRect(rx, ry + B, B * 2, B * 5);
        ctx.fillStyle = "#ff3355";
        ctx.fillRect(rx + B / 2, ry, B, B);
        ctx.fillRect(rx - B / 2, ry + B * 4.5, B / 2, B * 1.5);
        ctx.fillRect(rx + B * 2, ry + B * 4.5, B / 2, B * 1.5);
        ctx.fillStyle = "#39c6ff";
        ctx.fillRect(rx + B * 0.6, ry + B * 2, B * 0.8, B * 0.8);
    }
};

// ---------- 5. Лазерний полігон ----------

function buildLaserRange(W, H, groundY, B) {
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#05060d"], [1, "#101528"]]);
    const sx = sky.getContext("2d");
    // Панелі стін
    for (let x = 0; x < W; x += B * 3) {
        sx.fillStyle = (x / (B * 3)) % 2 === 0 ? "#0c1022" : "#0e1328";
        sx.fillRect(x, 0, B * 3, gY);
        sx.fillStyle = "#1a2140";
        sx.fillRect(x, 0, 2, gY);
    }
    // Мішені на стійках у смузі
    const stripW = Math.ceil(W * 1.3 / B) * B;
    const strip = makeCanvas(stripW, B * 6);
    const tx = strip.getContext("2d");
    for (let x = B * 3; x < stripW - B * 3; x += B * 9) {
        tx.fillStyle = "#39415e";
        tx.fillRect(x + B * 1.25, B * 3, B / 2, B * 3);
        const rings = ["#ff3333", "#ffffff", "#ff3333", "#ffffff", "#ffcc00"];
        for (let r = 0; r < rings.length; r++) {
            const s = B * 3 - r * B * 0.6;
            tx.fillStyle = rings[r];
            tx.fillRect(x + (B * 3 - s) / 2, (B * 3 - s) / 2, s, s);
        }
    }
    return { W: W, H: H, sky: sky, targets: strip };
}

BackgroundRenderer.renderLaserRange = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._laserRange;
    if (!st || st.W !== W || st.H !== H) {
        st = buildLaserRange(W, H, groundY, B);
        this._laserRange = st;
    }
    const gY = Math.round(groundY);
    ctx.drawImage(st.sky, 0, 0);
    drawScrollingStrip(ctx, st.targets, W, gY, time, speed, 0.3);
    // Сканувальні лазери зі стелі
    const emitters = 5;
    for (let i = 0; i < emitters; i++) {
        const ex = W * (i + 0.5) / emitters;
        const angle = Math.sin(time * (0.7 + i * 0.13) + i * 1.3) * 0.6;
        const endX = ex + Math.tan(angle) * gY;
        const color = i % 2 === 0 ? "255, 40, 60" : "40, 255, 140";
        ctx.strokeStyle = "rgba(" + color + ", 0.15)";
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(ex, 0);
        ctx.lineTo(endX, gY);
        ctx.stroke();
        ctx.strokeStyle = "rgba(" + color + ", 0.85)";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = "#39415e";
        ctx.fillRect(ex - B / 2, 0, B, B / 2);
        ctx.fillStyle = "rgba(" + color + ", 0.6)";
        ctx.fillRect(endX - B / 2, gY - B / 4, B, B / 4);
    }
};

// ---------- 6. Цифровий ліс ----------

function buildDigitalForest(W, H, groundY, B) {
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#010805"], [1, "#04160c"]]);
    function forestStrip(stripW, trunkColor, leafColor, leafLight, height, seed, gap) {
        const r = pixelRng(seed);
        const strip = makeCanvas(stripW, height);
        const fx = strip.getContext("2d");
        const trees = [];
        for (let x = B; x < stripW - B * 3; x += B * (gap + Math.floor(r() * 3))) {
            const th = Math.round((0.35 + r() * 0.3) * height / B);
            fx.fillStyle = trunkColor;
            fx.fillRect(x + B, height - th * B, B, th * B);
            // Крона з блоків
            const crown = 2 + Math.floor(r() * 2);
            for (let row = 0; row < crown + 1; row++) {
                const w = crown * 2 + 1 - row * 2;
                fx.fillStyle = row % 2 === 0 ? leafColor : leafLight;
                fx.fillRect(x + B * 1.5 - (w * B) / 2, height - th * B - (row + 1) * B, w * B, B);
            }
            trees.push({ x: x + B, top: height - th * B, h: th * B });
        }
        return { canvas: strip, trees: trees };
    }
    const far = forestStrip(Math.ceil(W * 1.5 / B) * B, "#06200f", "#0a3318", "#0c3d1c", Math.round(gY * 0.6), 601, 4);
    const near = forestStrip(Math.ceil(W * 1.3 / B) * B, "#0f3a1c", "#146b2e", "#1b8a3a", Math.round(gY * 0.75), 602, 6);
    return { W: W, H: H, sky: sky, far: far, near: near };
}

BackgroundRenderer.renderDigitalForest = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._digitalForest;
    if (!st || st.W !== W || st.H !== H) {
        st = buildDigitalForest(W, H, groundY, B);
        this._digitalForest = st;
    }
    const gY = Math.round(groundY);
    ctx.drawImage(st.sky, 0, 0);
    drawScrollingStrip(ctx, st.far.canvas, W, gY, time, speed, 0.1);
    const nearW = st.near.canvas.width;
    const offset = Math.round(time * speed * 0.3) % nearW;
    const top = gY - st.near.canvas.height;
    for (let x = -offset; x < W; x += nearW) {
        ctx.drawImage(st.near.canvas, x, top);
        // По стовбурах біжить зелений «код»
        for (let i = 0; i < st.near.trees.length; i++) {
            const tr = st.near.trees[i];
            const tx = x + tr.x;
            if (tx < -B || tx > W + B) {
                continue;
            }
            const cell = B / 3;
            const head = (time * (60 + i * 7) + i * 50) % (tr.h + cell * 6);
            for (let k = 0; k < 5; k++) {
                const y = head - k * cell;
                if (y < 0 || y > tr.h) {
                    continue;
                }
                ctx.fillStyle = k === 0 ? "#d8ffe0" : "rgba(0, 255, 90, " + (0.8 - k * 0.15).toFixed(2) + ")";
                ctx.fillRect(tx + cell, top + tr.top + y, cell, cell);
            }
        }
    }
    // Світлячки
    drawFallingPixels(ctx, W, gY, time, 25, 606, {
        color: "#c8ff5a", dir: -1, speedMin: 4, speedMax: 12, sizeMin: 2, sizeMax: 3,
        sway: 1.2, swayAmp: B * 1.5, alpha: 0.8
    });
};

// ---------- 7. Грозове небо ----------

function buildStormSky(W, H, groundY, B) {
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#06070f"], [0.7, "#161a2e"], [1, "#22283f"]]);
    const cols = Math.ceil(W / B) + 1;
    const sx = sky.getContext("2d");
    const hills = periodicHeights(cols, 3, [{ amp: 1.5, k: 2, ph: 0.5 }, { amp: 0.8, k: 6, ph: 2 }]);
    sx.fillStyle = "#121628";
    for (let c = 0; c < cols; c++) {
        sx.fillRect(c * B, gY - hills[c] * B, B, hills[c] * B);
    }
    // Хатинка з вогником у вікні та дерева на пагорбах
    const hc = Math.round(cols * 0.62);
    const hTop = gY - hills[hc] * B;
    sx.fillStyle = "#1c2238";
    sx.fillRect(hc * B, hTop - B * 2, B * 3, B * 2);
    sx.fillRect(hc * B + B / 2, hTop - B * 3, B * 2, B);
    sx.fillStyle = "#ffcc55";
    sx.fillRect(hc * B + B, hTop - B * 1.5, B * 0.6, B * 0.6);
    for (const tc of [Math.round(cols * 0.18), Math.round(cols * 0.35), Math.round(cols * 0.85)]) {
        const tTop = gY - hills[tc] * B;
        sx.fillStyle = "#161b30";
        sx.fillRect(tc * B + B / 3, tTop - B * 2, B / 3, B * 2);
        sx.fillRect(tc * B - B / 2, tTop - B * 3.5, B * 2, B * 1.8);
    }
    function cloudStrip(stripW, color, colorLight, seed, rows) {
        const r = pixelRng(seed);
        const strip = makeCanvas(stripW, rows * B);
        const cx = strip.getContext("2d");
        for (let x = 0; x < stripW; x += B) {
            const hgt = rows - Math.floor(r() * 2) - (Math.sin(x / stripW * Math.PI * 6) > 0 ? 0 : 1);
            cx.fillStyle = color;
            cx.fillRect(x, 0, B, hgt * B);
            cx.fillStyle = colorLight;
            cx.fillRect(x, (hgt - 1) * B, B, B / 3);
        }
        return strip;
    }
    const far = cloudStrip(Math.ceil(W * 1.5 / B) * B, "#1c2138", "#262c48", 701, 4);
    const near = cloudStrip(Math.ceil(W * 1.3 / B) * B, "#2a3050", "#3a4266", 702, 3);
    return { W: W, H: H, sky: sky, far: far, near: near };
}

BackgroundRenderer.renderStormSky = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._stormSky;
    if (!st || st.W !== W || st.H !== H) {
        st = buildStormSky(W, H, groundY, B);
        this._stormSky = st;
    }
    const gY = Math.round(groundY);
    ctx.drawImage(st.sky, 0, 0);
    // Блискавка кожні ~3.5 с у різному місці
    const period = 3.5;
    const phase = time % period;
    const strike = Math.floor(time / period);
    if (phase < 0.35) {
        const flash = 1 - phase / 0.35;
        ctx.fillStyle = "rgba(200, 210, 255, " + (0.25 * flash).toFixed(3) + ")";
        ctx.fillRect(0, 0, W, gY);
        const r = pixelRng(strike * 13 + 7);
        // Зигзаг блискавки: вертикальні відрізки, з'єднані горизонтальними, з ореолом
        let x = Math.round(W * (0.15 + r() * 0.7));
        let y = B * 3;
        const bw = Math.max(4, Math.round(B / 2.5));
        const segments = [];
        while (y < gY - B * 2) {
            const segH = B * (1 + Math.floor(r() * 2));
            const nx = x + (r() < 0.5 ? -1 : 1) * Math.round(B * 0.8);
            segments.push([x, y, segH, nx]);
            x = nx;
            y += segH;
        }
        for (let pass = 0; pass < 2; pass++) {
            const grow = pass === 0 ? bw : 0;
            ctx.fillStyle = pass === 0
                ? "rgba(140, 170, 255, " + (0.35 * flash).toFixed(3) + ")"
                : "rgba(255, 255, 255, " + flash.toFixed(3) + ")";
            for (const sg of segments) {
                ctx.fillRect(sg[0] - grow, sg[1] - grow, bw + grow * 2, sg[2] + grow * 2);
                ctx.fillRect(Math.min(sg[0], sg[3]) - grow, sg[1] + sg[2] - bw / 2 - grow, Math.abs(sg[3] - sg[0]) + bw + grow * 2, bw + grow * 2);
            }
        }
    }
    drawScrollingStrip(ctx, st.far, W, B * 5, time, speed, 0.04);
    drawScrollingStrip(ctx, st.near, W, B * 3, time, speed, 0.08);
    // Спалах підсвічує хмари
    if (phase < 0.35) {
        ctx.fillStyle = "rgba(200, 215, 255, " + (0.3 * (1 - phase / 0.35)).toFixed(3) + ")";
        ctx.fillRect(0, 0, W, B * 5);
    }
    drawFallingPixels(ctx, W, gY, time, 70, 707, {
        color: "#9fb4ff", dir: 1, speedMin: 450, speedMax: 650, sizeMin: 1, sizeMax: 2,
        sway: 0, swayAmp: 0, alpha: 0.4, stretch: 7
    });
};

// ---------- 8. Кришталева печера ----------

function buildCrystalCave(W, H, groundY, B) {
    const rng = pixelRng(808);
    const gY = Math.round(groundY);
    const cols = Math.ceil(W * 1.3 / B);
    const rows = Math.ceil(gY / B) + 1;
    const p = B / 4;
    const wall = makeCanvas(cols * B, rows * B);
    const wx = wall.getContext("2d");
    const shades = ["#1d1430", "#221838", "#1a1129"];
    for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
            wx.fillStyle = shades[Math.floor(rng() * shades.length)];
            wx.fillRect(c * B, r * B, B, B);
            wx.fillStyle = "#140d22";
            wx.fillRect(c * B + Math.floor(rng() * 4) * p, r * B + Math.floor(rng() * 4) * p, p, p);
        }
    }
    // Сталактити
    wx.fillStyle = "#0e0918";
    for (let c = 0; c < cols; c++) {
        const len = 1 + Math.floor((Math.sin(c * 1.3) + 1) * 1.6);
        wx.fillRect(c * B, 0, B, len * B);
    }
    // Кластери кристалів
    const crystals = [];
    const palette = [["#b35cff", "#e6bfff"], ["#ff4fd8", "#ffc0f0"], ["#5cc8ff", "#c8f0ff"]];
    for (let c = 2; c < cols - 2; c += 4 + Math.floor(rng() * 4)) {
        const onFloor = rng() < 0.6;
        const colr = palette[Math.floor(rng() * palette.length)];
        const baseY = onFloor ? rows * B - B : B * (2 + Math.floor(rng() * 2));
        const count = 2 + Math.floor(rng() * 2);
        for (let k = 0; k < count; k++) {
            const h = (1 + Math.floor(rng() * 3)) * B;
            const x = c * B + k * B * 0.7;
            wx.fillStyle = colr[0];
            if (onFloor) {
                wx.fillRect(x, baseY - h + B, B * 0.6, h);
                wx.fillStyle = colr[1];
                wx.fillRect(x, baseY - h + B, B * 0.2, h);
            } else {
                wx.fillRect(x, baseY, B * 0.6, h);
                wx.fillStyle = colr[1];
                wx.fillRect(x, baseY, B * 0.2, h);
            }
        }
        crystals.push({ x: c * B + B, y: onFloor ? baseY - B : baseY + B, color: colr[0], phase: rng() * 6 });
    }
    return { W: W, H: H, wall: wall, crystals: crystals };
}

BackgroundRenderer.renderCrystalCave = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._crystalCave;
    if (!st || st.W !== W || st.H !== H) {
        st = buildCrystalCave(W, H, groundY, B);
        this._crystalCave = st;
    }
    ctx.fillStyle = "#07040d";
    ctx.fillRect(0, 0, W, H);
    const wallW = st.wall.width;
    const offset = Math.round(time * speed * 0.2) % wallW;
    const wallY = Math.round(groundY) - st.wall.height;
    for (let x = -offset; x < W; x += wallW) {
        ctx.drawImage(st.wall, x, wallY);
        for (const c of st.crystals) {
            const cx = x + c.x;
            if (cx < -B * 3 || cx > W + B * 3) {
                continue;
            }
            const pulse = Math.sin(time * 1.8 + c.phase) * 0.5 + 0.5;
            ctx.globalAlpha = 0.08 + 0.14 * pulse;
            ctx.fillStyle = c.color;
            ctx.fillRect(cx - B * 2, wallY + c.y - B * 2, B * 4, B * 4);
            ctx.globalAlpha = 0.1 + 0.1 * pulse;
            ctx.fillRect(cx - B, wallY + c.y - B, B * 2, B * 2);
        }
    }
    ctx.globalAlpha = 1;
    drawFallingPixels(ctx, W, Math.round(groundY), time, 25, 808, {
        color: "#e6bfff", dir: -1, speedMin: 8, speedMax: 20, sizeMin: 2, sizeMax: 3,
        sway: 1, swayAmp: B, alpha: 0.6
    });
};

// ---------- 9. Ретро-аркада ----------

function buildRetroArcade(W, H, groundY, B) {
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#0a0418"], [1, "#1a0a30"]]);
    const sx = sky.getContext("2d");
    // Неонові смуги на стелі
    sx.fillStyle = "rgba(255, 46, 166, 0.5)";
    sx.fillRect(0, B, W, B / 4);
    sx.fillStyle = "rgba(0, 246, 255, 0.4)";
    sx.fillRect(0, B * 1.6, W, B / 4);
    // Автомати в смузі
    const stripW = Math.ceil(W * 1.3 / B) * B;
    const cabH = B * 8;
    const strip = makeCanvas(stripW, cabH);
    const cx = strip.getContext("2d");
    const screens = [];
    const bodyColors = ["#3a1a6a", "#1a3a6a", "#6a1a3a"];
    let i = 0;
    for (let x = B; x < stripW - B * 5; x += B * 6) {
        const body = bodyColors[i % bodyColors.length];
        cx.fillStyle = body;
        cx.fillRect(x, 0, B * 4, cabH);
        cx.fillStyle = "#0a0a14";
        cx.fillRect(x + B * 0.5, B * 1.5, B * 3, B * 2.5);
        cx.fillStyle = "#ffe14d";
        cx.fillRect(x + B * 0.5, B * 0.4, B * 3, B * 0.7);
        // Пульт з кнопками
        cx.fillStyle = "#222";
        cx.fillRect(x + B * 0.3, B * 4.5, B * 3.4, B);
        cx.fillStyle = "#ff3355";
        cx.fillRect(x + B * 2.2, B * 4.7, B * 0.5, B * 0.5);
        cx.fillStyle = "#39ff88";
        cx.fillRect(x + B * 2.9, B * 4.7, B * 0.5, B * 0.5);
        cx.fillStyle = "#cccccc";
        cx.fillRect(x + B * 0.9, B * 4.4, B * 0.25, B * 0.6);
        screens.push({ x: x + B * 0.5, y: B * 1.5, w: B * 3, h: B * 2.5, kind: i % 3 });
        i++;
    }
    return { W: W, H: H, sky: sky, strip: strip, screens: screens };
}

BackgroundRenderer.renderRetroArcade = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._retroArcade;
    if (!st || st.W !== W || st.H !== H) {
        st = buildRetroArcade(W, H, groundY, B);
        this._retroArcade = st;
    }
    const gY = Math.round(groundY);
    ctx.drawImage(st.sky, 0, 0);
    const stripW = st.strip.width;
    const offset = Math.round(time * speed * 0.3) % stripW;
    const top = gY - st.strip.height;
    for (let x = -offset; x < W; x += stripW) {
        ctx.drawImage(st.strip, x, top);
        // Анімовані екрани автоматів
        for (const s of st.screens) {
            const sx = x + s.x;
            if (sx < -s.w || sx > W) {
                continue;
            }
            const sy = top + s.y;
            const px = B / 4;
            if (s.kind === 0) {
                // «Тенісна» гра: м'ячик між двома ракетками
                const bx = sx + px + ((Math.sin(time * 3) + 1) / 2) * (s.w - px * 3);
                const by = sy + px + ((Math.sin(time * 4.3) + 1) / 2) * (s.h - px * 3);
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(sx + px * 0.5, by - px, px * 0.5, px * 3);
                ctx.fillRect(sx + s.w - px, by - px, px * 0.5, px * 3);
                ctx.fillRect(bx, by, px, px);
            } else if (s.kind === 1) {
                // Кольорові смуги, що пробігають
                const shift = Math.floor(time * 6) % 4;
                const colors = ["#ff2ea6", "#00f6ff", "#ffe14d", "#39ff88"];
                for (let r = 0; r < 4; r++) {
                    ctx.fillStyle = colors[(r + shift) % 4];
                    ctx.fillRect(sx, sy + r * s.h / 4, s.w, s.h / 4);
                }
            } else {
                // Піксельний кубик, що стрибає через шип
                const jump = Math.abs(Math.sin(time * 3)) * s.h * 0.4;
                ctx.fillStyle = "#0a0a14";
                ctx.fillRect(sx, sy, s.w, s.h);
                ctx.fillStyle = "#00f6ff";
                ctx.fillRect(sx + s.w * 0.3, sy + s.h * 0.7 - jump, px * 2, px * 2);
                ctx.fillStyle = "#ff2ea6";
                ctx.fillRect(sx + s.w * 0.65, sy + s.h * 0.78, px * 1.5, px * 1.5);
                ctx.fillStyle = "#39ff88";
                ctx.fillRect(sx, sy + s.h * 0.78 + px * 1.5, s.w, px * 0.5);
            }
        }
    }
    // Мерехтливі лампи на стелі
    ctx.globalAlpha = 0.5 + 0.5 * (Math.sin(time * 5) > 0 ? 1 : 0.4);
    ctx.fillStyle = "#ff2ea6";
    ctx.fillRect(0, B, W, B / 4);
    ctx.globalAlpha = 1;
};

// ---------- 11. Секретна база ----------

function buildSecretBase(W, H, groundY, B) {
    const rng = pixelRng(1111);
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#02050c"], [1, "#0a1a1a"]]);
    const sx = sky.getContext("2d");
    drawStarsInto(sx, W, gY * 0.6, 60, rng, B);
    const stripW = Math.ceil(W * 1.3 / B) * B;
    const strip = makeCanvas(stripW, B * 10);
    const bx = strip.getContext("2d");
    const dishes = [];
    const towers = [];
    // Паркан
    bx.fillStyle = "#1a2a2a";
    bx.fillRect(0, B * 8, stripW, B / 6);
    for (let x = 0; x < stripW; x += B) {
        bx.fillRect(x, B * 7.5, B / 8, B * 2.5);
    }
    for (let x = B * 2; x < stripW - B * 6; x += B * 14) {
        // Бункер і радарна тарілка на ньому
        bx.fillStyle = "#16302a";
        bx.fillRect(x, B * 7, B * 5, B * 3);
        bx.fillStyle = "#0e201c";
        bx.fillRect(x + B * 2, B * 8, B, B * 2);
        bx.fillStyle = "#39415e";
        bx.fillRect(x + B * 2.3, B * 5.5, B * 0.4, B * 1.5);
        dishes.push({ x: x + B * 2.5, y: B * 5.5 });
        // Вишка з прожектором
        const tx = x + B * 9;
        bx.fillStyle = "#1a2a2a";
        bx.fillRect(tx, B * 3, B / 4, B * 7);
        bx.fillRect(tx + B * 1.75, B * 3, B / 4, B * 7);
        bx.fillRect(tx - B / 2, B * 2.5, B * 3, B * 0.7);
        towers.push({ x: tx + B, y: B * 2.5 });
    }
    return { W: W, H: H, sky: sky, strip: strip, dishes: dishes, towers: towers };
}

BackgroundRenderer.renderSecretBase = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._secretBase;
    if (!st || st.W !== W || st.H !== H) {
        st = buildSecretBase(W, H, groundY, B);
        this._secretBase = st;
    }
    const gY = Math.round(groundY);
    ctx.drawImage(st.sky, 0, 0);
    const stripW = st.strip.width;
    const offset = Math.round(time * speed * 0.3) % stripW;
    const top = gY - st.strip.height;
    for (let x = -offset; x < W; x += stripW) {
        // Промені прожекторів (під смугою, щоб вишки були попереду)
        for (let i = 0; i < st.towers.length; i++) {
            const tw = st.towers[i];
            const tx = x + tw.x;
            if (tx < -W || tx > W * 2) {
                continue;
            }
            const ang = -Math.PI / 2 + Math.sin(time * 0.6 + i * 2) * 0.8;
            const len = gY * 1.2;
            ctx.fillStyle = "rgba(255, 255, 200, 0.07)";
            ctx.beginPath();
            ctx.moveTo(tx, top + tw.y);
            ctx.lineTo(tx + Math.cos(ang - 0.1) * len, top + tw.y + Math.sin(ang - 0.1) * len);
            ctx.lineTo(tx + Math.cos(ang + 0.1) * len, top + tw.y + Math.sin(ang + 0.1) * len);
            ctx.closePath();
            ctx.fill();
        }
        ctx.drawImage(st.strip, x, top);
        // Радарні тарілки обертаються (ширина еліпса змінюється)
        for (let i = 0; i < st.dishes.length; i++) {
            const d = st.dishes[i];
            const dx = x + d.x;
            if (dx < -B * 3 || dx > W + B * 3) {
                continue;
            }
            const turn = Math.cos(time * 1.5 + i);
            const w = Math.max(B * 0.3, Math.abs(turn) * B * 2.4);
            ctx.fillStyle = turn > 0 ? "#8fa3b8" : "#5a6a7a";
            ctx.fillRect(Math.round(dx - w / 2), top + d.y - B * 1.6, Math.round(w), B * 1.6);
            ctx.fillStyle = "#ff3333";
            if (Math.sin(time * 4 + i) > 0) {
                ctx.fillRect(Math.round(dx - B / 8), top + d.y - B * 2, B / 4, B / 4);
            }
        }
    }
};

// ---------- 12. Швидкісне метро ----------

function buildMetroTunnel(W, H, groundY, B) {
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#0a0a10"], [1, "#16161f"]]);
    const sx = sky.getContext("2d");
    // Плитка стін
    for (let y = B * 2; y < gY; y += B) {
        for (let x = ((y / B) % 2) * B / 2; x < W; x += B) {
            sx.fillStyle = (x / B + y / B) % 3 === 0 ? "#1c1c28" : "#191923";
            sx.fillRect(x, y, B - 1, B - 1);
        }
    }
    sx.fillStyle = "#26263a";
    sx.fillRect(0, 0, W, B * 2);
    // Кольорова смуга лінії метро
    sx.fillStyle = "#39ff88";
    sx.fillRect(0, gY * 0.55, W, B / 2);
    return { W: W, H: H, sky: sky };
}

BackgroundRenderer.renderMetroTunnel = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._metroTunnel;
    if (!st || st.W !== W || st.H !== H) {
        st = buildMetroTunnel(W, H, groundY, B);
        this._metroTunnel = st;
    }
    const gY = Math.round(groundY);
    ctx.drawImage(st.sky, 0, 0);
    // Лампи на стелі пробігають повз
    const lampGap = B * 6;
    const lampOff = Math.round(time * speed * 0.6) % lampGap;
    for (let x = -lampOff; x < W + lampGap; x += lampGap) {
        ctx.fillStyle = "rgba(255, 240, 200, 0.12)";
        ctx.fillRect(x - B, B * 2, B * 4, B * 3);
        ctx.fillStyle = "#fff4d0";
        ctx.fillRect(x, B * 1.5, B * 2, B / 2);
    }
    // Потяг проноситься кожні 6 с
    const period = 6;
    const t = (time % period) / 1.6;
    if (t < 1) {
        const trainLen = W * 1.4;
        const tx = W - t * (W + trainLen);
        const ty = Math.round(gY * 0.3);
        const th = Math.round(gY * 0.35);
        ctx.fillStyle = "#c8ccd8";
        ctx.fillRect(tx, ty, trainLen, th);
        ctx.fillStyle = "#39ff88";
        ctx.fillRect(tx, ty + th * 0.7, trainLen, B / 3);
        ctx.fillStyle = "#1a2a3a";
        for (let wx = tx + B; wx < tx + trainLen - B * 2; wx += B * 3) {
            ctx.fillRect(wx, ty + B * 0.6, B * 2, th * 0.4);
        }
        ctx.fillStyle = "#fff4a0";
        ctx.fillRect(tx - B * 0.3, ty + th * 0.5, B * 0.3, B * 0.6);
    }
    // Рейки
    ctx.fillStyle = "#3a3a4a";
    ctx.fillRect(0, gY - B / 3, W, B / 6);
    const sleeperGap = B * 1.5;
    const so = Math.round(time * speed) % sleeperGap;
    ctx.fillStyle = "#2a2018";
    for (let x = -so; x < W; x += sleeperGap) {
        ctx.fillRect(x, gY - B / 6, B * 0.6, B / 6);
    }
};

// ---------- 13. Завод роботів ----------

function buildRobotFactory(W, H, groundY, B) {
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#0d1014"], [1, "#1c2229"]]);
    const sx = sky.getContext("2d");
    // Труби на стелі
    sx.fillStyle = "#39414e";
    sx.fillRect(0, B, W, B / 2);
    sx.fillRect(0, B * 2, W, B / 3);
    for (let x = B * 3; x < W; x += B * 8) {
        sx.fillRect(x, B, B / 2, B * 3);
    }
    // Попереджувальні смуги
    for (let x = 0; x < W; x += B) {
        sx.fillStyle = (x / B) % 2 === 0 ? "#ffcc00" : "#1a1a1a";
        sx.fillRect(x, gY - B * 4.6, B, B / 3);
    }
    return { W: W, H: H, sky: sky };
}

BackgroundRenderer.renderRobotFactory = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._robotFactory;
    if (!st || st.W !== W || st.H !== H) {
        st = buildRobotFactory(W, H, groundY, B);
        this._robotFactory = st;
    }
    const gY = Math.round(groundY);
    ctx.drawImage(st.sky, 0, 0);
    const beltY = gY - B * 3;
    // Конвеєр з ящиками
    ctx.fillStyle = "#2a2f38";
    ctx.fillRect(0, beltY, W, B);
    const boxGap = B * 5;
    const bo = Math.round(time * speed * 0.35) % boxGap;
    for (let x = -bo; x < W + boxGap; x += boxGap) {
        ctx.fillStyle = "#b07a3a";
        ctx.fillRect(x, beltY - B * 1.5, B * 1.5, B * 1.5);
        ctx.fillStyle = "#8a5a2a";
        ctx.fillRect(x, beltY - B * 0.8, B * 1.5, B / 6);
    }
    ctx.fillStyle = "#1a1d24";
    for (let x = -(Math.round(time * speed * 0.35) % B); x < W; x += B) {
        ctx.fillRect(x, beltY + B * 0.4, B / 2, B / 5);
    }
    // Роботизовані руки: плече гойдається, рука «зварює» ящики
    const arms = 3;
    for (let i = 0; i < arms; i++) {
        const baseX = W * (i + 0.5) / arms;
        const a1 = Math.PI / 2 + Math.sin(time * 1.3 + i * 2) * 0.5;
        const a2 = a1 + 0.9 + Math.sin(time * 2 + i) * 0.4;
        const l1 = B * 3.5;
        const l2 = B * 3;
        const jx = baseX + Math.cos(a1) * l1;
        const jy = B * 2 + Math.sin(a1) * l1;
        const ex = jx + Math.cos(a2) * l2;
        const ey = jy + Math.sin(a2) * l2;
        ctx.strokeStyle = "#ff8c00";
        ctx.lineWidth = B * 0.5;
        ctx.beginPath();
        ctx.moveTo(baseX, B * 2);
        ctx.lineTo(jx, jy);
        ctx.lineTo(ex, ey);
        ctx.stroke();
        ctx.fillStyle = "#39414e";
        ctx.fillRect(baseX - B / 2, B * 1.6, B, B * 0.8);
        ctx.fillRect(jx - B * 0.35, jy - B * 0.35, B * 0.7, B * 0.7);
        // Іскри зварювання
        if (Math.sin(time * 6 + i * 3) > 0.3) {
            ctx.fillStyle = "#fff4a0";
            ctx.fillRect(ex - B * 0.3, ey - B * 0.3, B * 0.6, B * 0.6);
            const r = pixelRng(Math.floor(time * 20) + i * 100);
            ctx.fillStyle = "#ffcc33";
            for (let k = 0; k < 6; k++) {
                ctx.fillRect(ex + (r() - 0.5) * B * 3, ey + (r() - 0.2) * B * 2, 3, 3);
            }
        }
    }
};

// ---------- 14. Планета двох сонць ----------

function buildTwinSunPlanet(W, H, groundY, B) {
    const rng = pixelRng(1414);
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#0a2a3a"], [0.5, "#1f6a6a"], [1, "#e08a4a"]]);
    const sx = sky.getContext("2d");
    function pixelDisc(cx, cy, r, color) {
        sx.fillStyle = color;
        for (let y = -r; y < r; y += B / 2) {
            const half = Math.sqrt(Math.max(0, r * r - y * y));
            sx.fillRect(Math.round(cx - half), cy + y, Math.round(half * 2), B / 2);
        }
    }
    pixelDisc(W * 0.28, Math.round(gY * 0.3), B * 3, "#ffdd66");
    pixelDisc(W * 0.7, Math.round(gY * 0.18), B * 2, "#ff7a5a");
    const cols = Math.ceil(W * 1.3 / B);
    const hs = periodicHeights(cols, 2, [{ amp: 1, k: 3, ph: 0.3 }, { amp: 0.6, k: 7, ph: 1 }]);
    const near = makeCanvas(cols * B, (Math.max.apply(null, hs) + 7) * B);
    const nx = near.getContext("2d");
    drawBlockTerrain(nx, hs, B, near.height, { top: "#6a3a8a", topLight: "#8a5aaa", body: "#3a1f4a", body2: "#331a42", speck: "#4a2a5a" }, rng);
    const bulbs = [];
    // Грибні дерева та рослини з кульками, що світяться
    for (let c = 2; c < cols - 3; c += 5 + Math.floor(rng() * 4)) {
        const top = near.height - hs[c] * B;
        if (rng() < 0.5) {
            const th = 3 + Math.floor(rng() * 3);
            nx.fillStyle = "#d8c8a8";
            nx.fillRect(c * B, top - th * B, B, th * B);
            nx.fillStyle = "#ff5a8a";
            nx.fillRect((c - 1) * B, top - th * B - B, B * 3, B);
            nx.fillRect(c * B - B * 1.5, top - th * B, B * 4, B / 2);
            nx.fillStyle = "#ffd0e0";
            nx.fillRect(c * B - B / 2, top - th * B - B * 0.7, B / 3, B / 3);
        } else {
            nx.fillStyle = "#2a8a6a";
            nx.fillRect(c * B + B / 3, top - B * 3, B / 3, B * 3);
            bulbs.push({ x: c * B + B / 2, y: top - B * 3.3, phase: rng() * 6 });
        }
    }
    return { W: W, H: H, sky: sky, near: near, bulbs: bulbs };
}

BackgroundRenderer.renderTwinSunPlanet = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._twinSun;
    if (!st || st.W !== W || st.H !== H) {
        st = buildTwinSunPlanet(W, H, groundY, B);
        this._twinSun = st;
    }
    const gY = Math.round(groundY);
    ctx.drawImage(st.sky, 0, 0);
    const nearW = st.near.width;
    const offset = Math.round(time * speed * 0.3) % nearW;
    const top = gY - st.near.height;
    for (let x = -offset; x < W; x += nearW) {
        ctx.drawImage(st.near, x, top);
        for (const b of st.bulbs) {
            const bx = x + b.x;
            if (bx < -B * 2 || bx > W + B * 2) {
                continue;
            }
            const pulse = Math.sin(time * 2.5 + b.phase) * 0.5 + 0.5;
            ctx.fillStyle = "rgba(90, 255, 200, " + (0.15 + 0.2 * pulse).toFixed(3) + ")";
            ctx.fillRect(bx - B, top + b.y - B, B * 2, B * 2);
            ctx.fillStyle = "#9affd8";
            ctx.fillRect(bx - B * 0.4, top + b.y - B * 0.4, B * 0.8, B * 0.8);
        }
    }
    drawFallingPixels(ctx, W, gY, time, 30, 1414, {
        color: "#ffd0f0", dir: -1, speedMin: 6, speedMax: 18, sizeMin: 2, sizeMax: 3,
        sway: 0.9, swayAmp: B * 1.2, alpha: 0.6
    });
};

// ---------- 15. Місто над хмарами ----------

function buildSkyCity(W, H, groundY, B) {
    const rng = pixelRng(1515);
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#1b3a7a"], [0.6, "#6a8fd8"], [1, "#ffc6a0"]]);
    function cloudStrip(stripW, color, light, height, seed) {
        const r = pixelRng(seed);
        const strip = makeCanvas(stripW, height);
        const cx = strip.getContext("2d");
        for (let x = 0; x < stripW; x += B) {
            const h = Math.round((0.4 + 0.3 * Math.sin(x / stripW * Math.PI * 8) + r() * 0.2) * height / B) * B;
            cx.fillStyle = color;
            cx.fillRect(x, height - h, B, h);
            cx.fillStyle = light;
            cx.fillRect(x, height - h, B, B / 3);
        }
        return strip;
    }
    const clouds = cloudStrip(Math.ceil(W * 1.5 / B) * B, "#e8eeff", "#ffffff", Math.round(gY * 0.3), 1501);
    // Летючі платформи з вежами
    const stripW = Math.ceil(W * 1.3 / B) * B;
    const plat = makeCanvas(stripW, gY);
    const px = plat.getContext("2d");
    for (let x = B * 2; x < stripW - B * 8; x += B * (10 + Math.floor(rng() * 5))) {
        const y = Math.round(gY * (0.25 + rng() * 0.35) / B) * B;
        const w = 5 + Math.floor(rng() * 3);
        px.fillStyle = "#f4f0e0";
        px.fillRect(x, y, w * B, B);
        px.fillStyle = "#c8c0a8";
        px.fillRect(x + B, y + B, (w - 2) * B, B);
        px.fillStyle = "#ffffff";
        px.fillRect(x + B * 1.5, y - B * 4, B * 1.5, B * 4);
        px.fillRect(x + B * 3.5, y - B * 2.5, B * 1.5, B * 2.5);
        px.fillStyle = "#3a8adf";
        px.fillRect(x + B * 1.5, y - B * 5, B * 1.5, B);
        px.fillRect(x + B * 3.5, y - B * 3.5, B * 1.5, B);
        px.fillStyle = "#ffe14d";
        px.fillRect(x + B * 2, y - B * 3, B / 2, B / 2);
    }
    return { W: W, H: H, sky: sky, clouds: clouds, plat: plat };
}

BackgroundRenderer.renderSkyCity = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._skyCity;
    if (!st || st.W !== W || st.H !== H) {
        st = buildSkyCity(W, H, groundY, B);
        this._skyCity = st;
    }
    const gY = Math.round(groundY);
    ctx.drawImage(st.sky, 0, 0);
    const bob = Math.round(Math.sin(time * 0.8) * B * 0.3);
    drawScrollingStrip(ctx, st.plat, W, gY + bob, time, speed, 0.15);
    // Птахи: пари пікселів, що махають крилами
    for (let i = 0; i < 5; i++) {
        const span = W + B * 6;
        const x = Math.round(((i * 331 + time * (40 + i * 9)) % span) - B * 3);
        const y = Math.round(gY * (0.15 + i * 0.07) + Math.sin(time * 1.5 + i) * B * 0.5);
        const flap = Math.sin(time * 10 + i) > 0;
        ctx.fillStyle = "#1a2a4a";
        ctx.fillRect(x, y, B / 3, B / 3);
        ctx.fillRect(x - B / 3, y + (flap ? -B / 3 : B / 6), B / 3, B / 4);
        ctx.fillRect(x + B / 3, y + (flap ? -B / 3 : B / 6), B / 3, B / 4);
    }
    drawScrollingStrip(ctx, st.clouds, W, gY, time, speed, 0.3);
};

// ---------- 16. Стадіон-фінал ----------

function buildStadium(W, H, groundY, B) {
    const rng = pixelRng(1616);
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#04030c"], [1, "#120a24"]]);
    const sx = sky.getContext("2d");
    // Трибуни з глядачами
    const standTop = Math.round(gY * 0.35);
    const crowdColors = ["#ff2ea6", "#00f6ff", "#ffe14d", "#39ff88", "#ffffff", "#ff7a3d"];
    for (let row = 0; row < 8; row++) {
        const y = standTop + row * B * 0.9;
        sx.fillStyle = row % 2 === 0 ? "#1a1430" : "#161028";
        sx.fillRect(0, y, W, B * 0.9);
        for (let x = (row % 2) * B / 3; x < W; x += B * 0.66) {
            if (rng() < 0.85) {
                sx.fillStyle = crowdColors[Math.floor(rng() * crowdColors.length)];
                sx.globalAlpha = 0.55;
                sx.fillRect(x, y + B * 0.2, B * 0.35, B * 0.35);
                sx.globalAlpha = 1;
            }
        }
    }
    // Табло
    sx.fillStyle = "#0a0a14";
    sx.fillRect(W * 0.4, B, W * 0.2, B * 3);
    sx.fillStyle = "#39ff88";
    sx.fillRect(W * 0.42, B * 1.5, W * 0.16, B / 3);
    sx.fillRect(W * 0.42, B * 2.5, W * 0.1, B / 3);
    return { W: W, H: H, sky: sky, standTop: standTop };
}

BackgroundRenderer.renderStadium = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._stadium;
    if (!st || st.W !== W || st.H !== H) {
        st = buildStadium(W, H, groundY, B);
        this._stadium = st;
    }
    const gY = Math.round(groundY);
    ctx.drawImage(st.sky, 0, 0);
    // Спалахи камер у натовпі
    const r = pixelRng(Math.floor(time * 8));
    ctx.fillStyle = "#ffffff";
    for (let i = 0; i < 6; i++) {
        ctx.fillRect(Math.round(r() * W), Math.round(st.standTop + r() * B * 7), B / 3, B / 3);
    }
    // Прожектори
    for (let i = 0; i < 4; i++) {
        const baseX = W * (0.1 + i * 0.27);
        const ang = Math.PI / 2 + Math.sin(time * 0.9 + i * 1.7) * 0.5;
        ctx.fillStyle = i % 2 === 0 ? "rgba(0, 246, 255, 0.08)" : "rgba(255, 46, 166, 0.08)";
        ctx.beginPath();
        ctx.moveTo(baseX, 0);
        ctx.lineTo(baseX + Math.cos(ang - 0.12) * gY * 1.3, Math.sin(ang - 0.12) * gY * 1.3);
        ctx.lineTo(baseX + Math.cos(ang + 0.12) * gY * 1.3, Math.sin(ang + 0.12) * gY * 1.3);
        ctx.closePath();
        ctx.fill();
    }
    // Феєрверки: вибух із піксельних іскор кожні ~1.7 с
    for (let f = 0; f < 3; f++) {
        const period = 1.7 + f * 0.4;
        const local = (time + f * 0.9) % period;
        const burst = Math.floor((time + f * 0.9) / period);
        const fr = pixelRng(burst * 31 + f);
        const cx = W * (0.15 + fr() * 0.7);
        const cy = st.standTop * (0.3 + fr() * 0.5);
        const colors = ["#ffe14d", "#ff2ea6", "#00f6ff", "#39ff88"];
        const color = colors[Math.floor(fr() * colors.length)];
        if (local < 1.2) {
            const rad = local * B * 6;
            ctx.globalAlpha = Math.max(0, 1 - local / 1.2);
            ctx.fillStyle = color;
            for (let k = 0; k < 14; k++) {
                const a = k / 14 * Math.PI * 2;
                ctx.fillRect(Math.round(cx + Math.cos(a) * rad), Math.round(cy + Math.sin(a) * rad + local * local * B), B / 3, B / 3);
            }
            ctx.globalAlpha = 1;
        }
    }
    // Поле біля землі
    ctx.fillStyle = "#1f6a2a";
    ctx.fillRect(0, gY - B / 2, W, B / 2);
};

// ---------- Ліги 2 та 4: сцени рівнів ----------

// ---------- 19. Глітч-світ ----------

function buildGlitchWorld(W, H, groundY, B) {
    const rng = pixelRng(1919);
    const gY = Math.round(groundY);
    const scene = makeSky(W, H, [[0, "#05020f"], [1, "#12062a"]]);
    const sx = scene.getContext("2d");
    // Піксельне місто-«рівень гри», яке потім «ламається»
    const cols = Math.ceil(W / B) + 1;
    const hs = periodicHeights(cols, 5, [{ amp: 3, k: 3, ph: 0.2 }, { amp: 1.5, k: 9, ph: 1.3 }]);
    const palette = ["#ff2ea6", "#00f6ff", "#39ff88", "#b06bff"];
    for (let c = 0; c < cols; c++) {
        for (let r = 0; r < hs[c]; r++) {
            const y = gY - (r + 1) * B;
            sx.fillStyle = r === hs[c] - 1 ? palette[c % palette.length] : ((r + c) % 2 === 0 ? "#1a0f33" : "#160c2c");
            sx.fillRect(c * B, y, B, B);
            if (r !== hs[c] - 1 && rng() < 0.12) {
                sx.fillStyle = palette[Math.floor(rng() * palette.length)];
                sx.globalAlpha = 0.5;
                sx.fillRect(c * B + B / 4, y + B / 4, B / 2, B / 2);
                sx.globalAlpha = 1;
            }
        }
    }
    // Сітка «пікселів екрана»
    sx.fillStyle = "rgba(255, 255, 255, 0.03)";
    for (let y = 0; y < gY; y += 4) {
        sx.fillRect(0, y, W, 1);
    }
    return { W: W, H: H, scene: scene };
}

BackgroundRenderer.renderGlitchWorld = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._glitchWorld;
    if (!st || st.W !== W || st.H !== H) {
        st = buildGlitchWorld(W, H, groundY, B);
        this._glitchWorld = st;
    }
    const gY = Math.round(groundY);
    const sceneW = st.scene.width;
    const offset = Math.round(time * speed * 0.15) % sceneW;
    ctx.drawImage(st.scene, -offset, 0);
    ctx.drawImage(st.scene, sceneW - offset, 0);
    // Глітч: кілька горизонтальних смуг зсуваються, частина з кольоровим розщепленням
    const tick = Math.floor(time * 12);
    const r = pixelRng(tick * 7 + 3);
    const intensity = Math.sin(time * 0.9) > 0.3 ? 5 : 2;
    for (let i = 0; i < intensity; i++) {
        const y = Math.round(r() * gY / 4) * 4;
        const h = 4 + Math.round(r() * 5) * 4;
        const shift = Math.round((r() - 0.5) * B * 3);
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, y, W, h);
        ctx.clip();
        ctx.drawImage(st.scene, -offset + shift - sceneW, 0);
        ctx.drawImage(st.scene, -offset + shift, 0);
        ctx.drawImage(st.scene, -offset + shift + sceneW, 0);
        ctx.restore();
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = r() < 0.5 ? "#ff0044" : "#00e5ff";
        ctx.fillRect(0, y, W, 2);
        ctx.globalAlpha = 1;
    }
    // «Биті» блоки, що з'являються й зникають
    for (let i = 0; i < 6; i++) {
        const bx = Math.round(r() * W / B) * B;
        const by = Math.round(r() * gY / B) * B;
        ctx.fillStyle = ["#ffffff", "#ff2ea6", "#00f6ff", "#000000"][Math.floor(r() * 4)];
        ctx.fillRect(bx, by, B, B / (1 + Math.floor(r() * 3)));
    }
};

// ---------- 20. Скарбниця ----------

function buildTreasury(W, H, groundY, B) {
    const rng = pixelRng(2020);
    const gY = Math.round(groundY);
    const wall = makeSky(W, H, [[0, "#140e08"], [1, "#2a1c0e"]]);
    const wx = wall.getContext("2d");
    // Кам'яна кладка
    for (let y = 0; y < gY; y += B) {
        for (let x = ((y / B) % 2) * B; x < W; x += B * 2) {
            wx.fillStyle = (x + y) % 3 === 0 ? "#2e2214" : "#281d10";
            wx.fillRect(x, y, B * 2 - 2, B - 2);
        }
    }
    // Двері сховища
    const dx = Math.round(W * 0.7);
    const dy = Math.round(gY * 0.42);
    const dr = Math.round(gY * 0.26);
    wx.fillStyle = "#5a5f6a";
    wx.beginPath();
    wx.arc(dx, dy, dr, 0, Math.PI * 2);
    wx.fill();
    wx.fillStyle = "#7a808c";
    wx.beginPath();
    wx.arc(dx, dy, dr * 0.82, 0, Math.PI * 2);
    wx.fill();
    wx.fillStyle = "#4a4f5a";
    for (let i = 0; i < 12; i++) {
        const a = i / 12 * Math.PI * 2;
        wx.fillRect(dx + Math.cos(a) * dr * 0.9 - 4, dy + Math.sin(a) * dr * 0.9 - 4, 8, 8);
    }
    // Купи монет і злитків
    const stripW = Math.ceil(W * 1.3 / B) * B;
    const piles = makeCanvas(stripW, B * 6);
    const px = piles.getContext("2d");
    const glints = [];
    for (let x = B; x < stripW - B * 6; x += B * (7 + Math.floor(rng() * 4))) {
        const levels = 3 + Math.floor(rng() * 3);
        for (let l = 0; l < levels; l++) {
            const w = (levels - l) * 2;
            for (let k = 0; k < w; k++) {
                px.fillStyle = (k + l) % 2 === 0 ? "#ffcc33" : "#e0a820";
                px.fillRect(x + (l + k) * B / 2, piles.height - (l + 1) * B / 2, B / 2, B / 2);
                px.fillStyle = "#fff2a0";
                px.fillRect(x + (l + k) * B / 2, piles.height - (l + 1) * B / 2, B / 6, B / 8);
            }
            glints.push({ x: x + (l + 1) * B, y: piles.height - (l + 1) * B / 2, phase: rng() * 6 });
        }
        // Злитки поруч
        px.fillStyle = "#d99a00";
        px.fillRect(x + levels * B + B, piles.height - B / 2, B * 1.2, B / 2);
        px.fillRect(x + levels * B + B * 1.3, piles.height - B, B * 1.2, B / 2);
        px.fillStyle = "#fff2a0";
        px.fillRect(x + levels * B + B, piles.height - B / 2, B * 1.2, B / 8);
    }
    return { W: W, H: H, wall: wall, piles: piles, glints: glints };
}

BackgroundRenderer.renderTreasury = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._treasury;
    if (!st || st.W !== W || st.H !== H) {
        st = buildTreasury(W, H, groundY, B);
        this._treasury = st;
    }
    const gY = Math.round(groundY);
    ctx.drawImage(st.wall, 0, 0);
    const pw = st.piles.width;
    const offset = Math.round(time * speed * 0.3) % pw;
    const top = gY - st.piles.height;
    for (let x = -offset; x < W; x += pw) {
        ctx.drawImage(st.piles, x, top);
        // Іскорки на монетах
        for (const g of st.glints) {
            const gx = x + g.x;
            if (gx < -B || gx > W + B) {
                continue;
            }
            const s = Math.sin(time * 3 + g.phase);
            if (s > 0.7) {
                const a = (s - 0.7) / 0.3;
                const sz = Math.max(2, B / 5);
                ctx.globalAlpha = a;
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(gx - sz / 2, top + g.y - sz * 1.5, sz, sz * 3);
                ctx.fillRect(gx - sz * 1.5, top + g.y - sz / 2, sz * 3, sz);
            }
        }
        ctx.globalAlpha = 1;
    }
    // Тепле світло
    ctx.fillStyle = "rgba(255, 180, 60, 0.06)";
    ctx.fillRect(0, 0, W, gY);
};

// ---------- 22. Лігво дракона ----------

function buildDragonLair(W, H, groundY, B) {
    const rng = pixelRng(2222);
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#0a0404"], [0.7, "#2a0a06"], [1, "#4a1808"]]);
    const sx = sky.getContext("2d");
    // Гора з печерою
    const cols = Math.ceil(W / B) + 1;
    const hs = periodicHeights(cols, 10, [{ amp: 5, k: 1, ph: 1.6 }, { amp: 1.5, k: 6, ph: 0.4 }]);
    for (let c = 0; c < cols; c++) {
        for (let r = 0; r < hs[c]; r++) {
            sx.fillStyle = (r + c) % 2 === 0 ? "#2a1a14" : "#241610";
            sx.fillRect(c * B, gY - (r + 1) * B, B, B);
        }
    }
    const caveX = Math.round(W * 0.5 / B) * B;
    sx.fillStyle = "#0a0402";
    sx.fillRect(caveX - B * 3, gY - B * 5, B * 6, B * 5);
    sx.fillRect(caveX - B * 2, gY - B * 6, B * 4, B);
    // Гніздо з яйцями та скарбами
    const stripW = Math.ceil(W * 1.3 / B) * B;
    const nest = makeCanvas(stripW, B * 3);
    const nx = nest.getContext("2d");
    const eggs = [];
    for (let x = B * 2; x < stripW - B * 6; x += B * (9 + Math.floor(rng() * 5))) {
        nx.fillStyle = "#5a3a1e";
        nx.fillRect(x, B * 2, B * 5, B);
        nx.fillStyle = "#6e4a26";
        nx.fillRect(x - B / 2, B * 2.5, B * 6, B / 2);
        const colors = [["#39c66a", "#9dffb0"], ["#b06bff", "#e0c0ff"], ["#ff7a3d", "#ffc08a"]];
        for (let e = 0; e < 3; e++) {
            const col = colors[Math.floor(rng() * colors.length)];
            const ex = x + B * 0.5 + e * B * 1.5;
            nx.fillStyle = col[0];
            nx.fillRect(ex, B * 0.8, B, B * 1.4);
            nx.fillRect(ex + B / 6, B * 0.6, B * 0.66, B / 5);
            nx.fillStyle = col[1];
            nx.fillRect(ex + B / 5, B, B / 4, B / 4);
            nx.fillRect(ex + B / 2, B * 1.6, B / 5, B / 5);
            eggs.push({ x: ex + B / 2, y: B * 1.5, color: col[0], phase: rng() * 6 });
        }
        nx.fillStyle = "#ffcc33";
        nx.fillRect(x + B * 4.8, B * 2.2, B / 2, B / 3);
        nx.fillRect(x - B, B * 2.4, B / 2, B / 3);
    }
    return { W: W, H: H, sky: sky, nest: nest, eggs: eggs, caveX: caveX };
}

BackgroundRenderer.renderDragonLair = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._dragonLair;
    if (!st || st.W !== W || st.H !== H) {
        st = buildDragonLair(W, H, groundY, B);
        this._dragonLair = st;
    }
    const gY = Math.round(groundY);
    ctx.drawImage(st.sky, 0, 0);
    // Дихання дракона в печері: очі світяться, іноді спалах вогню
    const breath = Math.sin(time * 0.8) * 0.5 + 0.5;
    ctx.fillStyle = "rgba(255, 90, 0, " + (0.15 + 0.25 * breath).toFixed(3) + ")";
    ctx.fillRect(st.caveX - B * 3, gY - B * 5, B * 6, B * 5);
    const blink = (time % 5) < 0.2;
    if (!blink) {
        ctx.fillStyle = "#ffcc00";
        ctx.fillRect(st.caveX - B * 1.4, gY - B * 3.2, B * 0.8, B * 0.4);
        ctx.fillRect(st.caveX + B * 0.6, gY - B * 3.2, B * 0.8, B * 0.4);
    }
    const fire = (time % 7) / 1.2;
    if (fire < 1) {
        ctx.fillStyle = "rgba(255, 160, 40, " + (0.35 * (1 - fire)).toFixed(3) + ")";
        ctx.fillRect(0, 0, W, gY);
        ctx.fillStyle = "rgba(255, 220, 80, " + (0.8 * (1 - fire)).toFixed(3) + ")";
        for (let k = 0; k < 8; k++) {
            ctx.fillRect(st.caveX - B + (k % 3) * B * 0.6, gY - B * 2.5 - k * B * 0.6 * fire * 4, B * 0.6, B * 0.6);
        }
    }
    const nw = st.nest.width;
    const offset = Math.round(time * speed * 0.3) % nw;
    const top = gY - st.nest.height;
    for (let x = -offset; x < W; x += nw) {
        ctx.drawImage(st.nest, x, top);
        // Яйця ледь світяться
        for (const e of st.eggs) {
            const ex = x + e.x;
            if (ex < -B * 2 || ex > W + B * 2) {
                continue;
            }
            ctx.globalAlpha = 0.08 + 0.1 * (Math.sin(time * 2 + e.phase) * 0.5 + 0.5);
            ctx.fillStyle = e.color;
            ctx.fillRect(ex - B, top + e.y - B, B * 2, B * 2);
        }
        ctx.globalAlpha = 1;
    }
    drawFallingPixels(ctx, W, gY, time, 30, 2222, {
        color: "#ffae42", dir: -1, speedMin: 20, speedMax: 50, sizeMin: 2, sizeMax: 3,
        sway: 1.5, swayAmp: B * 0.6, alpha: 0.7
    });
};

// ---------- 24. Лицарський замок ----------

function buildKnightCastle(W, H, groundY, B) {
    const rng = pixelRng(2424);
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#070a1c"], [0.7, "#1a2248"], [1, "#2a3060"]]);
    const sx = sky.getContext("2d");
    drawStarsInto(sx, W, gY * 0.5, 60, rng, B);
    sx.fillStyle = "#f4f1d0";
    sx.fillRect(Math.round(W * 0.15), Math.round(H * 0.08), B * 3, B * 3);
    // Стіна замку з зубцями та вежами в смузі
    const stripW = Math.ceil(W * 1.3 / B) * B;
    const wallH = B * 9;
    const wall = makeCanvas(stripW, wallH + B * 5);
    const wx = wall.getContext("2d");
    const baseTop = wall.height - wallH;
    const flags = [];
    const torches = [];
    for (let x = 0; x < stripW; x += B) {
        for (let y = baseTop; y < wall.height; y += B / 2) {
            wx.fillStyle = ((x / B) + (y / (B / 2))) % 2 === 0 ? "#4a4f63" : "#40455a";
            wx.fillRect(x, y, B, B / 2 - 1);
        }
        if ((x / B) % 2 === 0) {
            wx.fillStyle = "#4a4f63";
            wx.fillRect(x, baseTop - B, B, B);
        }
    }
    for (let x = B * 3; x < stripW - B * 6; x += B * (14 + Math.floor(rng() * 4))) {
        // Вежа
        wx.fillStyle = "#555a70";
        wx.fillRect(x, baseTop - B * 4, B * 4, B * 4);
        for (let k = 0; k < 4; k += 2) {
            wx.fillRect(x + k * B, baseTop - B * 5, B, B);
        }
        wx.fillStyle = "#1a1e2e";
        wx.fillRect(x + B * 1.5, baseTop - B * 2.5, B, B * 1.5);
        wx.fillStyle = "#3a3f52";
        wx.fillRect(x + B * 3.8, baseTop - B * 5, B / 6, B * 1.5);
        flags.push({ x: x + B * 3.9, y: baseTop - B * 5, color: rng() < 0.5 ? "#e8173c" : "#2a6aff" });
        // Факели на стіні
        torches.push({ x: x - B * 3, y: baseTop + B * 2 });
        wx.fillStyle = "#5b3a1e";
        wx.fillRect(x - B * 3, baseTop + B * 2, B / 4, B * 0.8);
    }
    // Брама
    wx.fillStyle = "#1a1210";
    wx.fillRect(Math.round(stripW * 0.5), wall.height - B * 4, B * 3, B * 4);
    wx.fillStyle = "#3a2a1a";
    for (let k = 0; k < 3; k++) {
        wx.fillRect(Math.round(stripW * 0.5) + k * B + B / 3, wall.height - B * 4, B / 6, B * 4);
    }
    return { W: W, H: H, sky: sky, wall: wall, flags: flags, torches: torches };
}

BackgroundRenderer.renderKnightCastle = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._knightCastle;
    if (!st || st.W !== W || st.H !== H) {
        st = buildKnightCastle(W, H, groundY, B);
        this._knightCastle = st;
    }
    const gY = Math.round(groundY);
    ctx.drawImage(st.sky, 0, 0);
    const ww = st.wall.width;
    const offset = Math.round(time * speed * 0.25) % ww;
    const top = gY - st.wall.height;
    for (let x = -offset; x < W; x += ww) {
        ctx.drawImage(st.wall, x, top);
        // Прапори майорять
        for (let i = 0; i < st.flags.length; i++) {
            const f = st.flags[i];
            const fx = x + f.x;
            if (fx < -B * 3 || fx > W + B) {
                continue;
            }
            ctx.fillStyle = f.color;
            for (let k = 0; k < 4; k++) {
                const wave = Math.round(Math.sin(time * 5 + i + k * 0.8) * B * 0.12);
                ctx.fillRect(fx + k * B * 0.4, top + f.y + wave, B * 0.4, B * 0.8);
            }
            ctx.fillStyle = "#ffe14d";
            ctx.fillRect(fx + B * 0.5, top + f.y + B * 0.25 + Math.round(Math.sin(time * 5 + i + 1) * B * 0.12), B * 0.3, B * 0.3);
        }
        // Факели мерехтять
        for (let i = 0; i < st.torches.length; i++) {
            const t = st.torches[i];
            const tx = x + t.x;
            if (tx < -B * 2 || tx > W + B * 2) {
                continue;
            }
            const fl = 0.75 + 0.25 * Math.sin(time * 11 + i * 3) * Math.sin(time * 7.1 + i);
            ctx.globalAlpha = 0.12 * fl;
            ctx.fillStyle = "#ffaa33";
            ctx.fillRect(tx - B * 1.5, top + t.y - B * 1.5, B * 3.25, B * 3);
            ctx.globalAlpha = 1;
            ctx.fillStyle = "#ffcc33";
            ctx.fillRect(tx - B / 8, top + t.y - B / 2, B / 2, B / 2);
            ctx.fillStyle = fl > 0.9 ? "#ffffff" : "#ff7a00";
            ctx.fillRect(tx, top + t.y - B * 0.35, B / 4, B / 4);
        }
    }
};

// ---------- 29. Чорна діра ----------

function buildBlackHole(W, H, groundY, B) {
    const rng = pixelRng(2929);
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#020108"], [1, "#0a0418"]]);
    const sx = sky.getContext("2d");
    drawStarsInto(sx, W, gY, 140, rng, B);
    const particles = [];
    for (let i = 0; i < 260; i++) {
        particles.push({ r: 0.05 + rng() * 1.05, a: rng() * Math.PI * 2, speed: 0.4 + rng() * 0.6, hot: rng() });
    }
    return { W: W, H: H, sky: sky, particles: particles, cx: W * 0.62, cy: gY * 0.42, R: Math.min(W, gY) * 0.16 };
}

BackgroundRenderer.renderBlackHole = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._blackHole;
    if (!st || st.W !== W || st.H !== H) {
        st = buildBlackHole(W, H, groundY, B);
        this._blackHole = st;
    }
    ctx.drawImage(st.sky, 0, 0);
    const R = st.R;
    const ps = Math.max(2, Math.round(B / 4));
    // Суцільні світні смуги диска (половина позаду діри, половина попереду)
    function drawBands(front) {
        const bands = [[1.25, "rgba(255, 240, 200, 0.55)", 6], [1.6, "rgba(255, 160, 70, 0.4)", 10], [2.1, "rgba(255, 80, 120, 0.25)", 14], [2.6, "rgba(160, 60, 200, 0.15)", 16]];
        for (const b of bands) {
            ctx.strokeStyle = b[1];
            ctx.lineWidth = b[2];
            ctx.beginPath();
            ctx.ellipse(st.cx, st.cy, R * b[0], R * b[0] * 0.28, 0, front ? 0 : Math.PI, front ? Math.PI : Math.PI * 2);
            ctx.stroke();
        }
    }
    // Акреційний диск: частинки обертаються, ближчі — швидше й гарячіші
    function drawDisk(front) {
        for (const p of st.particles) {
            const ang = p.a + time * p.speed / p.r;
            const sinA = Math.sin(ang);
            if ((sinA > 0) !== front) {
                continue;
            }
            const rr = R * (1.1 + p.r * 1.6);
            const x = st.cx + Math.cos(ang) * rr;
            const y = st.cy + sinA * rr * 0.28;
            const heat = 1 - p.r / 1.1;
            ctx.fillStyle = heat > 0.5 ? "#fff0c0" : p.hot > 0.5 ? "#ff9a3d" : "#ff4f7a";
            ctx.globalAlpha = 0.5 + heat * 0.5;
            ctx.fillRect(Math.round(x), Math.round(y), ps, ps);
        }
        ctx.globalAlpha = 1;
    }
    drawBands(false);
    drawDisk(false);
    // Світне кільце та сама діра
    ctx.fillStyle = "rgba(255, 180, 90, 0.25)";
    ctx.beginPath();
    ctx.arc(st.cx, st.cy, R * 1.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(st.cx, st.cy, R, 0, Math.PI * 2);
    ctx.fill();
    drawBands(true);
    drawDisk(true);
    // Зорі, що затягуються спіраллю
    for (let i = 0; i < 6; i++) {
        const t = ((time * 0.12 + i / 6) % 1);
        const ang = i * 1.1 + t * Math.PI * 3;
        const rr = R * (4 - t * 3);
        ctx.globalAlpha = 1 - t;
        ctx.fillStyle = "#bfe9ff";
        ctx.fillRect(Math.round(st.cx + Math.cos(ang) * rr), Math.round(st.cy + Math.sin(ang) * rr * 0.5), ps, ps);
    }
    ctx.globalAlpha = 1;
};

// ---------- 30. Тронна зала ----------

function buildThroneRoom(W, H, groundY, B) {
    const gY = Math.round(groundY);
    const room = makeSky(W, H, [[0, "#1a0a14"], [1, "#2e1224"]]);
    const rx = room.getContext("2d");
    const cx = W / 2;
    const backY = Math.round(gY * 0.35);
    // Задня стіна з троном
    rx.fillStyle = "#3a1a2e";
    rx.fillRect(cx - W * 0.2, 0, W * 0.4, backY + B * 2);
    rx.fillStyle = "#c98a00";
    rx.fillRect(cx - B * 2, backY - B * 4, B * 4, B * 5);
    rx.fillStyle = "#8a1a2a";
    rx.fillRect(cx - B * 1.4, backY - B * 3.4, B * 2.8, B * 3);
    rx.fillStyle = "#ffd700";
    rx.fillRect(cx - B * 2, backY - B * 4.8, B / 2, B);
    rx.fillRect(cx + B * 1.5, backY - B * 4.8, B / 2, B);
    rx.fillRect(cx - B / 4, backY - B * 5, B / 2, B);
    // Червона доріжка в перспективі
    rx.fillStyle = "#a01830";
    rx.beginPath();
    rx.moveTo(cx - B * 1.5, backY + B);
    rx.lineTo(cx + B * 1.5, backY + B);
    rx.lineTo(cx + W * 0.18, gY);
    rx.lineTo(cx - W * 0.18, gY);
    rx.closePath();
    rx.fill();
    rx.fillStyle = "#ffcc33";
    rx.fillRect(cx - W * 0.18, gY - 3, W * 0.36, 3);
    // Колони обабіч
    for (let i = 0; i < 4; i++) {
        const t = (i + 1) / 5;
        const k = t * t;
        const px = W * 0.2 + k * W * 0.3;
        const w = B * (0.6 + k * 1.6);
        const h = backY + (gY - backY) * k;
        for (const side of [-1, 1]) {
            const x = cx + side * px - w / 2;
            rx.fillStyle = "#6a5a70";
            rx.fillRect(x, 0, w, h);
            rx.fillStyle = "#8a7a90";
            rx.fillRect(x, 0, w * 0.25, h);
            // Прапор із гербом
            rx.fillStyle = "#1a3a8a";
            rx.fillRect(x + w * 0.1, h * 0.25, w * 0.8, h * 0.25);
            rx.fillStyle = "#ffd700";
            rx.fillRect(x + w * 0.4, h * 0.3, w * 0.2, h * 0.12);
        }
    }
    return { W: W, H: H, room: room };
}

BackgroundRenderer.renderThroneRoom = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._throneRoom;
    if (!st || st.W !== W || st.H !== H) {
        st = buildThroneRoom(W, H, groundY, B);
        this._throneRoom = st;
    }
    ctx.drawImage(st.room, 0, 0);
    // Люстри зі свічками, що мерехтять і ледь гойдаються
    for (let i = 0; i < 3; i++) {
        const cx = W * (0.25 + i * 0.25) + Math.sin(time * 0.8 + i) * B * 0.3;
        const cy = B * 3 + i % 2 * B;
        ctx.fillStyle = "#c98a00";
        ctx.fillRect(cx - B * 2, cy, B * 4, B / 3);
        ctx.fillRect(cx - B / 12, 0, B / 6, cy);
        for (let k = 0; k < 5; k++) {
            const fx = cx - B * 1.8 + k * B * 0.9;
            const fl = 0.7 + 0.3 * Math.sin(time * 9 + i * 5 + k * 2);
            ctx.globalAlpha = 0.15 * fl;
            ctx.fillStyle = "#ffcc55";
            ctx.fillRect(fx - B * 0.6, cy - B * 1.2, B * 1.2, B * 1.2);
            ctx.globalAlpha = 1;
            ctx.fillStyle = "#fff4d0";
            ctx.fillRect(fx - B / 10, cy - B / 2, B / 5, B / 2);
            ctx.fillStyle = fl > 0.9 ? "#ffffff" : "#ffaa33";
            ctx.fillRect(fx - B / 10, cy - B * 0.75, B / 5, B / 4);
        }
    }
};

// ---------- 19. Піратська бухта ----------

function buildPirateBay(W, H, groundY, B) {
    const rng = pixelRng(1920);
    const gY = Math.round(groundY);
    const horizon = Math.round(gY * 0.58);
    const sky = makeSky(W, H, [[0, "#2a1450"], [0.35, "#8a2a6a"], [0.58, "#ff8a4a"], [1, "#0a3a5a"]]);
    const sx = sky.getContext("2d");
    // Сонце, що сідає в море
    const sunR = Math.round(H * 0.09);
    const sunX = Math.round(W * 0.3);
    sx.save();
    sx.beginPath();
    sx.rect(0, 0, W, horizon);
    sx.clip();
    sx.fillStyle = "#ffd36b";
    for (let y = -sunR; y < sunR; y += B / 2) {
        const half = Math.sqrt(Math.max(0, sunR * sunR - y * y));
        sx.fillRect(Math.round(sunX - half), horizon - sunR * 0.3 + y, Math.round(half * 2), B / 2);
    }
    sx.restore();
    // Море
    const sea = sx.createLinearGradient(0, horizon, 0, gY);
    sea.addColorStop(0, "#1f6a9a");
    sea.addColorStop(1, "#0a2f4f");
    sx.fillStyle = sea;
    sx.fillRect(0, horizon, W, gY - horizon);
    // Сонячна доріжка на воді
    sx.fillStyle = "rgba(255, 210, 120, 0.35)";
    for (let y = horizon + 4; y < gY; y += 8) {
        const w = sunR * (0.6 + (y - horizon) / (gY - horizon) * 1.4) * (0.6 + rng() * 0.4);
        sx.fillRect(Math.round(sunX - w / 2), y, Math.round(w), 3);
    }
    // Далекий острів
    sx.fillStyle = "#1a3a2a";
    const islX = Math.round(W * 0.78);
    sx.fillRect(islX - B * 4, horizon - B, B * 8, B);
    sx.fillRect(islX - B * 2, horizon - B * 2, B * 4, B);

    // Пляж з пальмами та скринями в ближній смузі
    const stripW = Math.ceil(W * 1.3 / B) * B;
    const beach = makeCanvas(stripW, B * 7);
    const bx = beach.getContext("2d");
    const top = beach.height - B;
    for (let x = 0; x < stripW; x += B) {
        bx.fillStyle = (x / B) % 2 === 0 ? "#e8c07a" : "#dab06a";
        bx.fillRect(x, top, B, B);
        bx.fillStyle = "#f5d89a";
        bx.fillRect(x, top, B, B / 5);
    }
    for (let x = B * 3; x < stripW - B * 5; x += B * (10 + Math.floor(rng() * 5))) {
        // Пальма з вигнутим стовбуром
        for (let k = 0; k < 5; k++) {
            bx.fillStyle = k % 2 === 0 ? "#8a5a2a" : "#7a4a1e";
            bx.fillRect(x + Math.round(k * k * 0.12) * B / 2, top - (k + 1) * B, B * 0.7, B);
        }
        const cx = x + B;
        const cy = top - B * 5.5;
        bx.fillStyle = "#2f9a3a";
        bx.fillRect(cx - B * 2.5, cy, B * 2.5, B / 2);
        bx.fillRect(cx, cy, B * 2.5, B / 2);
        bx.fillRect(cx - B * 3, cy + B / 2, B, B / 2);
        bx.fillRect(cx + B * 2, cy + B / 2, B, B / 2);
        bx.fillRect(cx - B / 2, cy - B, B * 1.5, B);
        bx.fillStyle = "#6a3a1a";
        bx.fillRect(cx, cy + B / 2, B / 2, B / 2);
        // Скриня біля деяких пальм
        if (rng() < 0.5) {
            bx.fillStyle = "#8a4b1c";
            bx.fillRect(x + B * 3, top - B, B * 1.4, B);
            bx.fillStyle = "#ffcc33";
            bx.fillRect(x + B * 3.55, top - B * 0.7, B * 0.3, B * 0.3);
        }
    }
    return { W: W, H: H, sky: sky, beach: beach, horizon: horizon };
}

// Піратський корабель із вітрилами та прапором (малюється щокадру — гойдається на хвилях)
function drawPirateShip(ctx, x, y, B, time) {
    const bob = Math.round(Math.sin(time * 1.4) * B * 0.25);
    const yy = y + bob;
    // Корпус
    ctx.fillStyle = "#4a2a14";
    ctx.fillRect(x, yy, B * 9, B * 1.5);
    ctx.fillRect(x + B * 0.5, yy + B * 1.5, B * 8, B * 0.6);
    ctx.fillRect(x + B * 7.5, yy - B, B * 2, B);
    ctx.fillStyle = "#ffcc33";
    ctx.fillRect(x, yy + B * 0.4, B * 9, B / 6);
    ctx.fillStyle = "#1a0e06";
    for (let k = 0; k < 3; k++) {
        ctx.fillRect(x + B * (1.5 + k * 2), yy + B * 0.8, B / 3, B / 3);
    }
    // Щогли та вітрила
    ctx.fillStyle = "#3a2010";
    ctx.fillRect(x + B * 3, yy - B * 6, B / 4, B * 6);
    ctx.fillRect(x + B * 6, yy - B * 5, B / 4, B * 5);
    const puff = Math.round(Math.sin(time * 1.1) * B * 0.15);
    ctx.fillStyle = "#f0e6d0";
    ctx.fillRect(x + B * 1.8, yy - B * 5.5, B * 2.6 + puff, B * 2.2);
    ctx.fillRect(x + B * 1.8, yy - B * 3, B * 2.6 + puff, B * 1.8);
    ctx.fillRect(x + B * 4.9, yy - B * 4.5, B * 2.4 + puff, B * 2);
    // Прапор із черепом
    const wave = Math.round(Math.sin(time * 6) * B * 0.1);
    ctx.fillStyle = "#111111";
    ctx.fillRect(x + B * 3.25, yy - B * 6 + wave, B * 1.4, B * 0.9);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x + B * 3.7, yy - B * 5.85 + wave, B * 0.5, B * 0.4);
    ctx.fillRect(x + B * 3.6, yy - B * 5.35 + wave, B * 0.7, B * 0.12);
}

BackgroundRenderer.renderPirateBay = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._pirateBay;
    if (!st || st.W !== W || st.H !== H) {
        st = buildPirateBay(W, H, groundY, B);
        this._pirateBay = st;
    }
    const gY = Math.round(groundY);
    const hz = st.horizon;
    ctx.drawImage(st.sky, 0, 0);
    // Хвилі на морі
    ctx.fillStyle = "rgba(200, 235, 255, 0.25)";
    const wo = (time * 25) % (B * 3);
    for (let y = hz + 6, row = 0; y < gY - B; y += B * 0.8, row++) {
        for (let x = -wo + (row % 2) * B * 1.5; x < W; x += B * 3) {
            ctx.fillRect(Math.round(x), Math.round(y), B, 2);
        }
    }
    // Корабель повільно пливе по горизонту
    const span = W + B * 20;
    const shipX = Math.round(W - ((time * 22) % span));
    drawPirateShip(ctx, shipX, hz - B * 0.8, B, time);
    // Чайки
    for (let i = 0; i < 4; i++) {
        const x = Math.round(((i * 413 + time * (35 + i * 8)) % (W + B * 6)) - B * 3);
        const y = Math.round(hz * (0.2 + i * 0.1) + Math.sin(time * 1.3 + i) * B * 0.6);
        const flap = Math.sin(time * 9 + i) > 0;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(x, y, B / 3, B / 5);
        ctx.fillRect(x - B / 3, y + (flap ? -B / 5 : B / 8), B / 3, B / 6);
        ctx.fillRect(x + B / 3, y + (flap ? -B / 5 : B / 8), B / 3, B / 6);
    }
    drawScrollingStrip(ctx, st.beach, W, gY, time, speed, 0.3);
};

// ---------- 21. Орбіта: вид на планету з космічної станції ----------

function buildOrbitView(W, H, groundY, B) {
    const rng = pixelRng(2121);
    const gY = Math.round(groundY);
    const sky = makeSky(W, H, [[0, "#010104"], [1, "#050818"]]);
    const sx = sky.getContext("2d");
    drawStarsInto(sx, W, gY, 150, rng, B);
    // Місяць
    sx.fillStyle = "#c8ccd8";
    const mx = Math.round(W * 0.85);
    const my = Math.round(gY * 0.15);
    const mr = B * 1.5;
    for (let y = -mr; y < mr; y += B / 3) {
        const half = Math.sqrt(Math.max(0, mr * mr - y * y));
        sx.fillRect(Math.round(mx - half), my + y, Math.round(half * 2), B / 3);
    }
    sx.fillStyle = "#a0a4b0";
    sx.fillRect(mx - B / 2, my - B / 3, B / 2, B / 2);
    sx.fillRect(mx + B / 3, my + B / 3, B / 3, B / 3);
    // Поверхня планети: континенти та хмари в смузі, що прокручується (планета обертається)
    const texW = Math.ceil(W * 1.6 / B) * B;
    const texH = Math.round(gY * 0.6);
    const tex = makeCanvas(texW, texH);
    const tx = tex.getContext("2d");
    tx.fillStyle = "#1a4a9a";
    tx.fillRect(0, 0, texW, texH);
    const cellW = B;
    const cols = texW / cellW;
    for (let c = 0; c < cols; c++) {
        for (let r = 0; r < texH / cellW; r++) {
            const n = Math.sin(c * 0.35) + Math.sin(c * 0.13 + r * 0.4) + Math.sin(r * 0.5 + c * 0.07) * 0.8;
            if (n > 0.9) {
                tx.fillStyle = n > 1.8 ? "#e8e0c0" : n > 1.3 ? "#3f8a3a" : "#5aa84a";
                tx.fillRect(c * cellW, r * cellW, cellW, cellW);
            }
        }
    }
    // Хмари
    tx.fillStyle = "rgba(255, 255, 255, 0.55)";
    for (let i = 0; i < 25; i++) {
        const cx = Math.round(rng() * cols) * cellW;
        const cy = Math.round(rng() * texH / cellW) * cellW;
        const len = 2 + Math.floor(rng() * 5);
        tx.fillRect(cx, cy, len * cellW, cellW / 2);
        tx.fillRect(cx + cellW, cy - cellW / 2, (len - 2) * cellW, cellW / 2);
    }
    return { W: W, H: H, sky: sky, tex: tex, planetR: W * 1.1, planetCx: W * 0.5, planetCy: gY + W * 1.1 - texH * 0.55 };
}

BackgroundRenderer.renderOrbitView = function (ctx, W, H, groundY, time, speed) {
    const B = pixelBlockSize(H);
    let st = this._orbitView;
    if (!st || st.W !== W || st.H !== H) {
        st = buildOrbitView(W, H, groundY, B);
        this._orbitView = st;
    }
    const gY = Math.round(groundY);
    ctx.drawImage(st.sky, 0, 0);
    // Атмосфера — світне кільце над краєм планети
    ctx.strokeStyle = "rgba(90, 170, 255, 0.35)";
    ctx.lineWidth = B;
    ctx.beginPath();
    ctx.arc(st.planetCx, st.planetCy, st.planetR + B * 0.6, Math.PI * 1.2, Math.PI * 1.8);
    ctx.stroke();
    // Планета: поверхня обрізана колом і прокручується
    ctx.save();
    ctx.beginPath();
    ctx.arc(st.planetCx, st.planetCy, st.planetR, 0, Math.PI * 2);
    ctx.clip();
    const texW = st.tex.width;
    const offset = Math.round(time * speed * 0.05) % texW;
    const texTop = gY - st.tex.height;
    for (let x = -offset; x < W; x += texW) {
        ctx.drawImage(st.tex, x, texTop);
    }
    // Нічна тінь з одного боку
    const shade = ctx.createLinearGradient(0, 0, W, 0);
    shade.addColorStop(0, "rgba(0, 0, 20, 0)");
    shade.addColorStop(0.7, "rgba(0, 0, 20, 0.1)");
    shade.addColorStop(1, "rgba(0, 0, 20, 0.6)");
    ctx.fillStyle = shade;
    ctx.fillRect(0, texTop, W, st.tex.height);
    ctx.restore();

    // Космічна станція: модулі, сонячні панелі, вогники
    const stX = Math.round(W * 0.22);
    const stY = Math.round(gY * 0.22 + Math.sin(time * 0.5) * B * 0.3);
    ctx.fillStyle = "#2a4a8a";
    for (const side of [-1, 1]) {
        for (let k = 0; k < 3; k++) {
            ctx.fillRect(stX + side * (B * 2 + k * B * 1.1) - (side < 0 ? B : 0), stY - B * 1.2, B, B * 2.4);
        }
    }
    ctx.fillStyle = "#6a7a9a";
    ctx.fillRect(stX - B * 2, stY - B / 6, B * 4, B / 3);
    ctx.fillStyle = "#e8ecf2";
    ctx.fillRect(stX - B, stY - B / 2, B * 2, B);
    ctx.fillRect(stX - B / 3, stY - B * 1.3, B * 0.66, B * 0.8);
    ctx.fillStyle = "#39c6ff";
    ctx.fillRect(stX - B * 0.6, stY - B / 4, B / 3, B / 3);
    ctx.fillRect(stX + B * 0.3, stY - B / 4, B / 3, B / 3);
    ctx.fillStyle = Math.sin(time * 4) > 0 ? "#ff3355" : "#551122";
    ctx.fillRect(stX - B / 8, stY - B * 1.5, B / 4, B / 4);
    ctx.fillStyle = Math.sin(time * 4 + 2) > 0 ? "#39ff88" : "#114422";
    ctx.fillRect(stX + B * 5.4, stY - B / 8, B / 4, B / 4);
    // Супутники пролітають
    for (let i = 0; i < 2; i++) {
        const period = 9 + i * 4;
        const t = ((time + i * 5) % period) / period;
        const x = Math.round(-B * 3 + t * (W + B * 6));
        const y = Math.round(gY * (0.35 + i * 0.12) - Math.sin(t * Math.PI) * B * 2);
        ctx.fillStyle = "#c8ccd8";
        ctx.fillRect(x, y, B * 0.6, B * 0.6);
        ctx.fillStyle = "#2a4a8a";
        ctx.fillRect(x - B, y + B * 0.1, B * 0.9, B * 0.4);
        ctx.fillRect(x + B * 0.7, y + B * 0.1, B * 0.9, B * 0.4);
        ctx.fillStyle = Math.sin(time * 6 + i) > 0 ? "#ffffff" : "#888888";
        ctx.fillRect(x + B * 0.2, y - B * 0.3, B / 5, B / 5);
    }
};

export { BackgroundRenderer };

