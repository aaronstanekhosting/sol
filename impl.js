'use strict';
function apply_tilt(sol,x,y) {
    var ay = y * sol.tcos;
    var az = -y * sol.tsin;
    var d = Math.sqrt(x**2+ay**2+(az-2)**2) / 2;
    var bx = sol.width / 2 + ((x / d)*sol.ruler);
    var by = sol.height / 2 - ((ay / d)*sol.ruler);
    return [bx,by,az,d];
}
function compare_keys(a,b) {
    if (a.key == b.key) {
        return 0;
    }
    else if (a.key < b.key) {
        return -1;
    }
    else {
        return 1;
    }
}
function draw_circle(sol,x,y,r,color) {
    sol.ctx.beginPath();
    sol.ctx.fillStyle = color;
    sol.ctx.arc(x,y,sol.ruler*r,0,2*Math.PI);
    sol.ctx.fill();
}
class Sol {
    constructor() {
        this.ready = false;
        this.width = 0;
        this.height = 0;
        this.ruler = 0;
        this.canvas = document.getElementById("c")
        this.ctx = this.canvas.getContext("2d");
        this.elems = [];
        this.up = 0;
        this.left = 0;
        this.left_rate = 0.0026179938779914945;
        this.tilt_phase = 1;
        this.tilt_linear = 0;
        this.tcos = 0;
        this.tsin = 0;
    }
    draw() {
        this.ctx.beginPath();
        this.ctx.fillStyle = "black";
        this.ctx.rect(0,0,this.width,this.height);
        this.ctx.fill();
        for (var i = 0; i < this.elems.length; ++i) {
            this.elems[i].draw(this);
        }
    }
    resize(dummy) {
        this.width = window.innerWidth - 1;
        this.height = window.innerHeight - 1;
        this.ruler = Math.min(this.width,this.height);
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        if (this.ready) {
            this.draw();
        }
    }
    run() {
        this.tilt_phase = (this.tilt_phase + 0.0026179938779914945) % (2*Math.PI);
        this.left = this.tilt_phase;
        this.tilt_linear = (1 + Math.cos(this.tilt_phase)) / 2;
        this.up = Math.PI/2-(this.tilt_linear*2.356194490192345);
        this.tcos = Math.cos(this.tilt_linear*2.356194490192345);
        this.tsin = Math.sin(this.tilt_linear*2.356194490192345);
        for (var i = 0; i < this.elems.length; ++i) {
            this.elems[i].update(this);
        }
        this.elems.sort(compare_keys);
        this.draw();
    }
}
class Star {
    constructor() {
        this.key = 0;
    }
    update(sol) {}
    draw(sol) {
        draw_circle(sol,sol.width/2,sol.height/2,1/20,"yellow");
    }
}
class Planet {
    constructor(radius,color,orbit_r,orbit_s) {
        this.key = 0;
        this.radius = radius;
        this.color = color;
        this.orbit_r = orbit_r;
        this.orbit_s = orbit_s;
        this.theta = Math.random() * 2 * Math.PI;
        this.x = 0;
        this.y = 0;
        this.radius_effective = 0;
    }
    update(sol) {
        this.theta = (this.theta + this.orbit_s + sol.left_rate) % (2*Math.PI);
        var xm = Math.cos(this.theta) * this.orbit_r;
        var ym = Math.sin(this.theta) * this.orbit_r;
        var t = apply_tilt(sol,xm,ym);
        this.x = t[0];
        this.y = t[1];
        this.key = 0.001 + ((Math.abs(t[2]) > 1/100) ? ((t[2] <= 0) ? (-this.orbit_r) : (this.orbit_r)) : (this.orbit_r));
        this.radius_effective = this.radius / t[3];
    }
    draw(sol) {
        draw_circle(sol,this.x,this.y,this.radius_effective,this.color);
    }
};
class Moon {
    constructor() {
        this.key = 0;
        this.theta1 = Math.random() * 2 * Math.PI;
        this.theta2 = Math.random() * 2 * Math.PI
        this.x = 0;
        this.y = 0;
        this.radius_effective = 0;
    }
    update(sol) {}
    draw(sol) {
        draw_circle(sol,this.x,this.y,this.radius_effective,"gray");
    }
}
class Earth {
    constructor() {
        this.key = 0;
        this.moon = new Moon();
        this.x = 0;
        this.y = 0;
        this.radius_effective = 0;
    }
    update(sol) {
        this.moon.theta1 = (this.moon.theta1 + 0.00150526 + sol.left_rate) % (2*Math.PI);
        this.moon.theta2 = (this.moon.theta2 + 0.0201232) % (2*Math.PI);
        var x_base = Math.cos(this.moon.theta1) * 0.3333;
        var y_base = Math.sin(this.moon.theta1) * 0.3333;
        var x_shift = Math.cos(this.moon.theta2);
        var y_shift = Math.sin(this.moon.theta2);
        var xm = x_base + x_shift * 0.003;
        var ym = y_base + y_shift * 0.003;
        var t = apply_tilt(sol,xm,ym);
        this.x = t[0];
        this.y = t[1];
        this.key = 0.001 + ((Math.abs(t[2]) > 1/100) ? ((t[2] <= 0) ? (-0.3333) : (0.3333)) : (0.3333));
        this.radius_effective = (1/100) / t[3];
        xm = x_base - x_shift * 0.04;
        ym = y_base - y_shift * 0.04;
        var earth_z = t[2];
        var t = apply_tilt(sol,xm,ym);
        this.moon.x = t[0];
        this.moon.y = t[1];
        this.moon.key = 0.001 + ((Math.abs(t[2]) > 1/100) ? ((t[2] <= 0) ? (-0.3333) : (0.3333)) : (0.3333)) + ((t[2] <= earth_z) ? (-0.0005) : (0.0005));
        this.moon.radius_effective = (1/200) / t[3];
    }
    draw(sol) {
        draw_circle(sol,this.x,this.y,this.radius_effective,"blue");
    }
}
class Ring {
    constructor(radius,factor) {
        this.key = -(radius * factor);
        this.radius = radius;
        this.factor = factor;
    }
    update(sol) {}
    draw(sol) {
        sol.ctx.beginPath();
        sol.ctx.lineWidth = sol.ruler/200;
        sol.ctx.strokeStyle = "rgba(256,0,256,0.4)";
        for (var i = 0; i <= 15; ++i) {
            var theta = (Math.PI / 15) * i;
            var t = apply_tilt(sol,Math.cos(theta)*this.radius,Math.sin(theta)*this.radius*this.factor);
            sol.ctx.lineTo(t[0],t[1]);
        }
        sol.ctx.stroke();
    }
}
class Back {
    constructor() {
        this.key = -8;
        this.vecs = [];
        while (this.vecs.length < 500) {
            var v = [];
            for (var j = 0; j < 3; ++j) {
                v.push(Math.random() * 2 - 1);
            }
            var d = Math.sqrt(v[0]**2+v[1]**2+v[2]**2);
            if (d > 0.1 && d < 1) {
                for (var j = 0; j < 3; ++j) {
                    v[j] /= d;
                }
                this.vecs.push(v);
            }
        }
        this.ruler = -8;
        this.img = null;
        this.left = -8;
        this.c1 = 0;
        this.s1 = 0;
        this.up = -8;
        this.c2 = 0;
        this.s2 = 0;
    }
    update(sol) {
        if (this.ruler != sol.ruler) {
            this.ruler = sol.ruler;
            this.img = document.createElement("canvas");
            var radius = parseInt( sol.ruler / 400 );
            if (radius == 0) {
                radius = 1;
            }
            this.img.width = 2 * radius;
            this.img.height = 2 * radius;
            var ctx = this.img.getContext("2d");
            ctx.beginPath();
            ctx.fillStyle = "white";
            ctx.arc(radius,radius,radius,0,2*Math.PI);
            ctx.fill();
        }
        if (this.left != sol.left) {
            this.left = sol.left;
            this.c1 = Math.cos(sol.left);
            this.s1 = Math.sin(sol.left);
        }
        if (this.up != sol.up) {
            this.up = sol.up;
            this.c2 = Math.cos(sol.up);
            this.s2 = Math.sin(sol.up);
        }
    }
    draw(sol) {
        for (var i = 0; i < this.vecs.length; ++i) {
            var vc = this.vecs[i];
            var q = this.s1*vc[0]+this.c1*vc[1];
            var vr = [
                this.c1*vc[0]-this.s1*vc[1],
                this.c2*q-this.s2*vc[2],
                this.s2*q+this.c2*vc[2]
            ];
            if (vr[1] < 0) {
                continue;
            }
            vr[1] += 1;
            var factor = (2 / vr[1]) * ((sol.ruler/20)/0.02499479361892016);
            vr[0] *= factor;
            vr[2] *= factor;
            if (Math.abs(vr[0]-this.img.width) > sol.width/2 || Math.abs(vr[3]-this.img.height) > sol.height/2) {
                continue;
            }
            sol.ctx.drawImage(this.img,sol.width/2+vr[0]-this.img.width/2,sol.height/2-vr[2]-this.img.height/2);
        }
    }
}
function main() {
    if (document.readyState == "loading") {
        setTimeout(main,10);
    }
    else {
        var sol = new Sol();
        sol.elems.push(new Star());
        sol.elems.push(new Planet(1/200,"gray",0.1333,0.00625));
        sol.elems.push(new Ring(0.1333,1));
        sol.elems.push(new Ring(0.1333,-1));
        sol.elems.push(new Planet(1/100,"#f7f7d4",0.2222,0.00244685));
        sol.elems.push(new Ring(0.2222,1));
        sol.elems.push(new Ring(0.2222,-1));
        sol.elems.push(new Planet(1/150,"red",0.4444,0.000800301));
        sol.elems.push(new Ring(0.4444,1));
        sol.elems.push(new Ring(0.4444,-1));
        var earth = new Earth();
        sol.elems.push(earth);
        sol.elems.push(earth.moon);
        sol.elems.push(new Ring(0.3333,1));
        sol.elems.push(new Ring(0.3333,-1));
        sol.elems.push(new Back());
        setInterval(sol.run.bind(sol),50);
        window.addEventListener("resize",sol.resize.bind(sol));
        sol.resize();
        sol.ready = true;
    }
}
main();