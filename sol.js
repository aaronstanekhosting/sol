"use strict";function apply_tilt(t,s,i){var e=i*t.tcos,h=-i*t.tsin,r=Math.sqrt(s**2+e**2+(h-t.r)**2)/2;return[t.width/2+s/r*t.ruler,t.height/2-e/r*t.ruler,h,r]}function compare_keys(t,s){return t.key==s.key?0:t.key<s.key?-1:1}function draw_circle(t,s,i,e,h){t.ctx.beginPath(),t.ctx.fillStyle=h,t.ctx.arc(s,i,t.ruler*e,0,2*Math.PI),t.ctx.fill()}class Driver1{constructor(){this.progress=0}update(t){this.progress+=1/1500,this.progress>=1&&(this.progress=1,t.driver=new Driver2,t.left_rate*=-2),t.tilt_phase=1.2*Math.PI*this.progress+1,t.left=Math.PI*this.progress}}class Driver2{constructor(){this.progress=0}update(t){this.progress+=1/750,this.progress>=1&&(this.progress=1,t.driver=new Driver3,t.left_rate*=-.5),t.left=Math.PI*(1-this.progress)}}class Driver3{constructor(){this.progress=0}update(t){this.progress+=1/750,this.progress>=1&&(this.progress=1,t.driver=new Driver4),t.left=Math.PI/2*this.progress,t.r=2+this.progress}}class Driver4{constructor(){this.progress=0}update(t){this.progress+=1/1500,this.progress>=1&&(this.progress=1,t.driver=new Driver5),t.left=Math.PI*(this.progress+.5),t.r=3-2*this.progress}}class Driver5{constructor(){this.progress=0}update(t){this.progress+=1/750,this.progress>=1&&(this.progress=1,t.driver=new Driver6,t.left_rate=0),t.left=Math.PI/2*(this.progress-1),t.r=1+this.progress}}class Driver6{constructor(){this.progress=0}update(t){this.progress+=1/750,this.progress>=1&&(this.progress=1,t.driver=new Driver1,t.left_rate=Math.PI/1500),t.tilt_phase=(2*Math.PI-1)*this.progress+(1.2*Math.PI+1)*(1-this.progress)}}class Sol{constructor(){this.ready=!1,this.width=0,this.height=0,this.ruler=0,this.canvas=document.getElementById("c"),this.ctx=this.canvas.getContext("2d"),this.r=2,this.elems=[],this.up=0,this.left=0,this.left_rate=Math.PI/1500,this.tilt_phase=1,this.tilt_linear=0,this.tcos=0,this.tsin=0,this.driver=new Driver1}draw(){this.ctx.beginPath(),this.ctx.fillStyle="black",this.ctx.rect(0,0,this.width,this.height),this.ctx.fill();for(var t=0;t<this.elems.length;++t)this.elems[t].draw(this)}resize(t){this.width=window.innerWidth-1,this.height=window.innerHeight-1,this.ruler=Math.min(this.width,this.height),this.canvas.width=this.width,this.canvas.height=this.height,this.ready&&this.draw()}run(){this.driver.update(this),this.tilt_linear=(1+Math.cos(this.tilt_phase))/2,this.up=Math.PI/2-2.356194490192345*this.tilt_linear,this.tcos=Math.cos(2.356194490192345*this.tilt_linear),this.tsin=Math.sin(2.356194490192345*this.tilt_linear);for(var t=0;t<this.elems.length;++t)this.elems[t].update(this);this.elems.sort(compare_keys),this.draw()}}class Star{constructor(){this.key=0}update(t){}draw(t){var s=apply_tilt(t,0,0);draw_circle(t,t.width/2,t.height/2,.05/s[3],"yellow")}}class Planet{constructor(t,s,i,e){this.key=0,this.radius=t,this.color=s,this.orbit_r=i,this.orbit_s=e,this.theta=2*Math.random()*Math.PI,this.x=0,this.y=0,this.radius_effective=0}update(t){this.theta=(this.theta+this.orbit_s+t.left_rate)%(2*Math.PI);var s=apply_tilt(t,Math.cos(this.theta)*this.orbit_r,Math.sin(this.theta)*this.orbit_r);this.x=s[0],this.y=s[1],this.key=.001+(Math.abs(s[2])>.01&&s[2]<=0?-this.orbit_r:this.orbit_r),this.radius_effective=this.radius/s[3]}draw(t){draw_circle(t,this.x,this.y,this.radius_effective,this.color)}}class Moon{constructor(){this.key=0,this.theta1=2*Math.random()*Math.PI,this.theta2=2*Math.random()*Math.PI,this.x=0,this.y=0,this.radius_effective=0}update(t){}draw(t){draw_circle(t,this.x,this.y,this.radius_effective,"gray")}}class Earth{constructor(){this.key=0,this.moon=new Moon,this.x=0,this.y=0,this.radius_effective=0}update(t){this.moon.theta1=(this.moon.theta1+.00150526+t.left_rate)%(2*Math.PI),this.moon.theta2=(this.moon.theta2+.0201232)%(2*Math.PI);var s=.3333*Math.cos(this.moon.theta1),i=.3333*Math.sin(this.moon.theta1),e=Math.cos(this.moon.theta2),h=Math.sin(this.moon.theta2),r=s+.003*e,a=i+.003*h,o=apply_tilt(t,r,a);this.x=o[0],this.y=o[1],this.key=.001+(Math.abs(o[2])>.01&&o[2]<=0?-.3333:.3333),this.radius_effective=.01/o[3],r=s-.04*e,a=i-.04*h;var l=o[2];o=apply_tilt(t,r,a);this.moon.x=o[0],this.moon.y=o[1],this.moon.key=.001+(Math.abs(o[2])>.01&&o[2]<=0?-.3333:.3333)+(o[2]<=l?-5e-4:5e-4),this.moon.radius_effective=.005/o[3]}draw(t){draw_circle(t,this.x,this.y,this.radius_effective,"blue")}}class Ring{constructor(t,s){this.key=-t*s,this.radius=t,this.factor=s}update(t){}draw(t){t.ctx.beginPath(),t.ctx.lineWidth=t.ruler/200,t.ctx.strokeStyle="rgba(256,0,256,0.4)";for(var s=0;s<=15;++s){var i=Math.PI/15*s,e=apply_tilt(t,Math.cos(i)*this.radius,Math.sin(i)*this.radius*this.factor);t.ctx.lineTo(e[0],e[1])}t.ctx.stroke()}}class Back{constructor(){for(this.key=-8,this.vecs=[];this.vecs.length<500;){for(var t=[],s=0;s<3;++s)t.push(2*Math.random()-1);var i=Math.sqrt(t[0]**2+t[1]**2+t[2]**2);if(i>.1&&i<1){for(s=0;s<3;++s)t[s]/=i;this.vecs.push(t)}}this.ruler=-8,this.img=null,this.left=-8,this.c1=0,this.s1=0,this.up=-8,this.c2=0,this.s2=0}update(t){if(this.ruler!=t.ruler){this.ruler=t.ruler,this.img=document.createElement("canvas");var s=parseInt(t.ruler/400);0==s&&(s=1),this.img.width=2*s,this.img.height=2*s;var i=this.img.getContext("2d");i.beginPath(),i.fillStyle="white",i.arc(s,s,s,0,2*Math.PI),i.fill()}this.left!=t.left&&(this.left=t.left,this.c1=Math.cos(t.left),this.s1=Math.sin(t.left)),this.up!=t.up&&(this.up=t.up,this.c2=Math.cos(t.up),this.s2=Math.sin(t.up))}draw(t){for(var s=0;s<this.vecs.length;++s){var i=this.vecs[s],e=this.s1*i[0]+this.c1*i[1],h=[this.c1*i[0]-this.s1*i[1],this.c2*e-this.s2*i[2],this.s2*e+this.c2*i[2]];if(!(h[1]<0)){h[1]+=1;var r=2/h[1]*(t.ruler/20/.02499479361892016);h[0]*=r,h[2]*=r,Math.abs(h[0]-this.img.width)>t.width/2||Math.abs(h[3]-this.img.height)>t.height/2||t.ctx.drawImage(this.img,t.width/2+h[0]-this.img.width/2,t.height/2-h[2]-this.img.height/2)}}}}function main(){if("loading"==document.readyState)setTimeout(main,10);else{var t=new Sol;t.elems.push(new Star),t.elems.push(new Planet(.005,"gray",.1333,.00625)),t.elems.push(new Ring(.1333,1)),t.elems.push(new Ring(.1333,-1)),t.elems.push(new Planet(.01,"#f7f7d4",.2222,.00244685)),t.elems.push(new Ring(.2222,1)),t.elems.push(new Ring(.2222,-1)),t.elems.push(new Planet(1/150,"red",.4444,800301e-9)),t.elems.push(new Ring(.4444,1)),t.elems.push(new Ring(.4444,-1));var s=new Earth;t.elems.push(s),t.elems.push(s.moon),t.elems.push(new Ring(.3333,1)),t.elems.push(new Ring(.3333,-1)),t.elems.push(new Back),setInterval(t.run.bind(t),40),window.addEventListener("resize",t.resize.bind(t)),t.resize(),t.ready=!0}}main();