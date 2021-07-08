// This code is total trash but eh

const VERSION = "--DEV--";

const HIVE_SIZE = 30;
const BEE_MASS = 3;
const MAX_ARMOR = 50;
const MAX_DEBRIS_SIZE = 150;
const LIGHTNING_DURATION = 30;

function setup() {
    setVersion("Exploding Bubbles v",VERSION);

    createCanvas(document.body.clientWidth, document.body.clientHeight - 1);
    circles = [];
    flares = [];
    hives = [];
    bees = [];
    modern_debris = [];
    lightning_bolts = [];
    dragons = [];
    raining = false;
    fooVec = createVector();
}

function draw() {
    background(220);
    for(let c of circles){
        c.update();
        let p = c.pos;
        let cl = c.color;
        if(c.ill){
            strokeWeight(3);
            stroke(0,150,0);
        }else stroke(cl);
        fill(red(cl),green(cl),blue(cl),50);
        ellipse(p.x,p.y,2*c.r());
        strokeWeight(1);
    }
    for(let f of flares){
        f.update();
        let p = f.pos;
        let v = f.vel;
        let cl = f.color;
        noStroke();
        fill(red(cl),green(cl),blue(cl),50);
        fooVec.set(v).setMag(2);
        fooVec.rotate(-PI/2);
        fooVec.add(p);
        let p1x = fooVec.x;
        let p1y = fooVec.y;
        fooVec.set(v).setMag(2);
        fooVec.rotate(PI/2);
        fooVec.add(p);
        let p2x = fooVec.x;
        let p2y = fooVec.y;
        fooVec.set(v).setMag(10);
        fooVec.rotate(PI);
        fooVec.add(p);
        let p3x = fooVec.x;
        let p3y = fooVec.y;
        triangle(p1x,p1y,p2x,p2y,p3x,p3y);
        fill(cl);
        if(f.killer) fill(255,0,0);
        ellipse(p.x,p.y,4);
    }
    for(let h of hives){
        h.update();
        let p = h.pos;
        let cl = h.color;
        if(h.ill){
            strokeWeight(3);
            stroke(0,150,0);
        }else if(h.armor){
            strokeWeight(map(h.armor,5,MAX_ARMOR,1,6,true));
            stroke(127);
        }else stroke(cl);
        fill(red(cl),green(cl),blue(cl),map(h.m,5,325,30,240,true));
        rect(p.x,p.y,HIVE_SIZE,HIVE_SIZE);
        strokeWeight(1);
    }
    for(let b of bees){
        b.update();
        push();
        let p = b.pos;
        let cl = b.color;
        translate(p.x,p.y);
        rotate(b.angle);
        if(b.ill){
            strokeWeight(3);
            stroke(0,150,0);
        }else stroke(cl);
        fill(red(cl),green(cl),blue(cl),50);
        triangle(-15,-4,-15,4,0,0);
        pop();
    }
    for(let d of modern_debris){
        d.update();
        push();
        let p = d.pos;
        let r = d.r();
        translate(p.x,p.y);
        rotate(d.rot);
        noStroke();
        fill(127);
        beginShape();
        vertex(r,0);
        vertex(r*cos(PI/3),r*sin(PI/3));
        vertex(r*cos(2*PI/3),r*sin(2*PI/3));
        vertex(-r,0);
        vertex(r*cos(4*PI/3),r*sin(4*PI/3));
        vertex(r*cos(5*PI/3),r*sin(5*PI/3));
        endShape(CLOSE);
        pop();
    }
    for(let l of lightning_bolts){
        l.update();
        push();
        fill(255, 255, 100, 180);
        stroke(255, 255, 100, 100);
        strokeWeight(8);
        beginShape();
        vertex(l.path[0].x, l.path[0].y);
        for(let i = 1; i < l.path.length; i++)
            vertex(l.path[i].x - 5 - i*2, l.path[i].y);
        vertex(l.path[l.path.length - 1].x - 5 - (l.path.length-1)*2, -10);
        vertex(l.path[l.path.length - 1].x + 5 + (l.path.length-1)*2, -10);
        for(let i = l.path.length - 1; i >= 1; i--)
            vertex(l.path[i].x + 5 + i*2, l.path[i].y);
        endShape(CLOSE);
        pop();
    }
    for(let d of dragons){
        d.update();
        // render dragon
    }
    for(let i=circles.length-1;i>=0;i--){
        if(circles[i].dead) circles.splice(i,1);
    }
    for(let i=flares.length-1;i>=0;i--){
        if(flares[i].dead) flares.splice(i,1);
    }
    for(let i=hives.length-1;i>=0;i--){
        if(hives[i].dead) hives.splice(i,1);
    }
    for(let i=bees.length-1;i>=0;i--){
        if(bees[i].dead) bees.splice(i,1);
    }
    for(let i=modern_debris.length-1;i>=0;i--){
        if(modern_debris[i].dead) modern_debris.splice(i,1);
    }
    for(let i=lightning_bolts.length-1;i>=0;i--){
        if(lightning_bolts[i].dead) lightning_bolts.splice(i,1);
    }
    for(let i=dragons.length-1;i>=0;i--){
        if(dragons[i].dead)
            dragons.splice(i,1);
    }
    if(circles.length<40 && random()<0.005) circles.push(new Circle());
    if(raining){
        if(random()<0.2) flares.push(new Flare(random(width),0,random(1,5),color(random(255),random(255),random(255)),PI/2,false,true));
        if(random()<0.00045) raining = false;
    }else if(random()<0.0002) raining = true;
    //if(random()<0.0002) flares.push(new Flare(random(width),random(height),5,color(random(255),random(255),random(255)),undefined,true));
}

class Circle{
    constructor(x,y){
        this.m = random(8,40);
        let r = this.r();
        if(x===undefined) x = random(r,width-r);
        if(y===undefined) y = random(r,height-r);
        this.pos = createVector(x,y);
        this.vel = p5.Vector.random2D().mult(random(1,4));
        this.color = color(random(255),random(255),random(255));
        this.ill = false;
        this.killer = false;
        this.dead = false;
    }

    r(){
        return sqrt(this.m*100/PI);
    }
    
    update(){
        let p = this.pos;
        let v = this.vel;
        p.add(v);
        let m = this.m;
        let r = this.r();
        let b = 0.3;
        if(p.x-r<0) v.x += b;
        if(p.x+r>width) v.x -= b;
        if(p.y-r<0) v.y += b;
        if(p.y+r>height) v.y -= b;
        for(let i=0;i<circles.length;i++){
            let that = circles[i];
            if(that===this) continue;
            let d = p.dist(that.pos)-r-that.r();
            let f = pow(0.5,max(d,0))*0.6;
            fooVec.set(that.vel);
            fooVec.sub(v);
            fooVec.mult(f/m);
            v.add(fooVec);
            // v.x = lerp(v.x,that.vel.x,f);
            // v.y = lerp(v.y,that.vel.y,f);
            fooVec.set(p);
            fooVec.sub(that.pos);
            fooVec.setMag(pow(0.97,max(d,0))*0.15);
            fooVec.mult(1/m);
            v.sub(fooVec);
            if(d<0){
                fooVec.setMag(0.3/m);
                v.add(fooVec);
                if(that.m>=m && random()<0.0001){
                    that.m += m;
                    if(this.ill) that.ill = true;
                    this.dead = true;
                    return;
                }
            }
        }
        let s = r/sqrt(width*height);
        if(random()<pow(s,3.5) || this.killer){
            if(!this.killer && m>=10 && random()<0.2){
                hives.push(new Hive(p.x,p.y,m/2,this.color,this.ill));
                this.m /= 2;
                return;
            }
            let n = 0;
            if(this.killer && random()<0.01){
                let m1 = min(random(3,10),m);
                modern_debris.push(new ModernDebris(p.x,p.y,m1));
                n += m1;
            }
            while(n<m){
                let l = m-n;
                let m1 = random(1,5);
                m1 = min(l,m1);
                flares.push(new Flare(p.x,p.y,m1,this.color,undefined,this.ill||this.killer));
                n += m1;
            }
            this.dead = true;
            return;
        }
        for(let i=0;i<flares.length;i++){
            let f = flares[i];
            if(!f.dead){
                let d = p.dist(f.pos)-r;
                let g = pow(0.6,max(d,0));
                fooVec.set(f.vel);
                fooVec.setMag(max(f.vel.mag() - cos(v.angleBetween(f.vel))*v.mag(), 0)*g/m);
                v.add(fooVec);
                // v.x = lerp(v.x,f.vel.x,g);
                // v.y = lerp(v.y,f.vel.y,g);
                if(d<0 && (random()<0.03 || f.killer)){
                    this.m += f.m;
                    if(f.killer) this.killer = true;
                    f.dead = true;
                }
            }
        }
    }
}

class Flare{
    constructor(x,y,m,c,a,k,r){
        this.pos = createVector(x,y);
        if(a!==undefined){
            this.vel = createVector(3);
            this.vel.rotate(a);
        }else this.vel = p5.Vector.random2D().mult(3);
        this.m = m;
        this.color = c;
        this.killer = k;
        this.rain = r;
        this.dead = false;
    }
    
    update(){
        let p = this.pos;
        let v = this.vel;
        p.add(v);
        if(p.x<0 || p.x>=width || p.y<0 || p.y>=height){
            if(random()<0.5) this.dead = true;
            else{
                if(p.x<0){
                    p.x = 0;
                    v.x *= -1;
                }else if(p.x>=width){
                    p.x = width-1;
                    v.x *= -1;
                }else if(p.y<0){
                    p.y = 0;
                    v.y *= -1;
                }else if(p.y>=height){
                    p.y = height-1;
                    v.y *= -1;
                }
            }
        }
    }
}

class Hive{
    constructor(x,y,m,c,i,ar){
        this.pos = createVector(x,y);
        this.vel = createVector(random(0.5,5)).rotate(random(-PI,0));
        this.m = m;
        this.color = c;
        this.ill = i;
        this.killer = false;
        this.armor = ar || 0;
        this.dead = false;
    }

    update(){
        if(this.pos.y+HIVE_SIZE<height){
            this.vel.y += 0.2;
        }else{
            this.vel.y = 0;
            if(abs(this.vel.x)<0.001) this.vel.x = 0;
            else this.vel.x *= 0.95;
            if(this.pos.y+HIVE_SIZE>height) this.pos.y = lerp(this.pos.y,height-HIVE_SIZE,0.2);
        }
        if(this.pos.x<0 && this.vel.x<0 || this.pos.x+HIVE_SIZE>=width && this.vel.x>0){
            this.vel.x *= -0.9;
        }
        this.pos.add(this.vel);
        if(this.killer){
            let n = 0;
            while(n<this.m){
                let l = this.m-n;
                let m1 = random(1,5);
                m1 = min(l,m1);
                flares.push(new Flare(this.pos.x+HIVE_SIZE/2,this.pos.y+HIVE_SIZE/2,m1,this.color,undefined,true));
                n += m1;
            }
            this.dead = true;
            return;
        }
        for(let i=0;i<flares.length;i++){
            let f = flares[i];
            if(!f.dead){
                if(f.pos.x>this.pos.x && f.pos.x<this.pos.x+HIVE_SIZE && f.pos.y>this.pos.y && f.pos.y<this.pos.y+HIVE_SIZE){
                    if(f.killer && this.armor){
                        this.armor -= random(0.05,1);
                        if(this.armor < 0)
                            this.armor = 0;
                        if(abs(f.pos.x - this.pos.x) > abs(f.pos.y - this.pos.y))
                            f.vel.y *= -1;
                        else
                            f.vel.x *= -1;
                        f.pos.add(f.vel);
                        f.killer = false;
                    }else{
                        this.m += f.m;
                        if(f.rain && random()<0.3 && !this.armor) this.ill = true;
                        if(f.killer) this.killer = true;
                        f.dead = true;
                    }
                }
            }
        }
        if(this.m>=10 && random()<(this.m<50 ? 0.005 : this.m<150 ? 0.0017 : 0.0005)){
            this.m -= BEE_MASS;
            bees.push(new Bee(this.pos.x+HIVE_SIZE/2,this.pos.y+HIVE_SIZE/2,this.color,this,this.ill));
        }
        if(this.m>350 && random()<0.01){
            if(this.ill){
                this.killer = true;
                return;
            }
            let armor = 0;
            if(this.armor >= 10){
                armor = this.armor/2;
                this.armor /= 2;
            }
            hives.push(new Hive(this.pos.x,this.pos.y-1,this.m/2,this.color,false,armor));
            this.m /= 2;
        }
        if(raining && this.armor && random() < 0.0002){
            lightning_bolts.push(new Lightning(this.pos.x, this.pos.y));
            // here be dragons
        }
        if(random()<0.15) this.m -= random(0.2,1);
        if(this.m<5){
            this.dead = true;
            if(this.armor)
                modern_debris.push(new ModernDebris(this.pos.x,this.pos.y,this.armor));
        }
    }
}

class Bee{
    constructor(x,y,c,h,i){
        this.pos = createVector(x,y);
        this.color = c;
        this.hive = h;
        this.target = undefined;
        this.ill = i;
        this.angle = 3*PI/2;
        this.dead = false;
    }

    update(){
        if(!this.target){
            let candidate;
            let score = 0;
            for(let i=0;i<circles.length;i++){
                let c = circles[i];
                let r = c.r();
                let d = c.pos.dist(this.hive.pos)-r;
                let s = c.m*pow(0.85,d/100);
                if(s>score){
                    candidate = c;
                    score = s;
                }
            }
            if(this.hive.armor < MAX_ARMOR){
                for(let i=0;i<modern_debris.length;i++){
                    let d = modern_debris[i];
                    if(d.bee)
                        continue;
                    let dist = d.pos.dist(this.hive.pos)-d.r();
                    let s = 50*d.m*pow(0.85,dist/100);
                    if(s>score){
                        candidate = d;
                        score = s;
                    }
                }
            }
            if(candidate){
                this.target = candidate;
            }else{
                flares.push(new Flare(this.pos.x,this.pos.y,BEE_MASS,this.color,this.angle));
                this.dead = true;
                return;
            }
        }
        if(this.hive.dead){
            flares.push(new Flare(this.pos.x,this.pos.y,BEE_MASS,this.color,this.angle));
            this.dead = true;
            return;
        }
        if(this.target.dead){
            this.target = undefined;
            if(random()<0.2){
                fooVec.set(this.hive.pos);
                fooVec.add(HIVE_SIZE/2,HIVE_SIZE/2);
                fooVec.sub(this.pos);
                flares.push(new Flare(this.pos.x,this.pos.y,BEE_MASS,this.color,fooVec.heading()));
                this.dead = true;
            }
            return;
        }
        if(this.target instanceof ModernDebris && this.target.bee && this.target.bee !== this){
            this.target = undefined;
            return;
        }
        let carrying = false;
        if(this.target instanceof ModernDebris && this.target.bee === this)
            carrying = true;
        if(carrying){
            fooVec.set(this.hive.pos);
            fooVec.add(HIVE_SIZE/2,HIVE_SIZE/2);
            fooVec.sub(this.pos);
        }else{
            fooVec.set(this.target.pos);
            fooVec.sub(this.pos);
        }
        let a = fooVec.heading();
        this.angle = lerp(this.angle+(a-this.angle>PI ? TAU : a-this.angle<-PI ? -TAU : 0),a,0.1);
        if(this.target instanceof Circle){
            fooVec.set(this.target.pos);
            let d = fooVec.dist(this.pos)-this.target.r();
            if(abs(d)<15){
                if(this.ill) this.target.ill = true;
                if(random()<0.2){
                    let amount = random(1,4);
                    this.target.m -= amount;
                    fooVec.set(this.hive.pos);
                    fooVec.add(HIVE_SIZE/2,HIVE_SIZE/2);
                    fooVec.sub(this.pos);
                    let ang = fooVec.heading();
                    flares.push(new Flare(this.pos.x,this.pos.y,amount,this.target.color,ang));
                    if(this.target.m<1) this.target.dead = true;
                }
            }
            fooVec.set(this.target.pos);
            fooVec.add(this.target.vel);
            let t = (fooVec.dist(this.pos)-this.target.r())/8;
            if(d>=15) t = min(3,t);
            this.pos.add(cos(this.angle)*t,sin(this.angle)*t);
        }else if(this.target instanceof ModernDebris){
            if(carrying){
                this.pos.add(cos(this.angle)*3,sin(this.angle)*3);
                if(this.pos.x > this.hive.pos.x && this.pos.x < this.hive.pos.x+HIVE_SIZE && this.pos.y > this.hive.pos.y && this.pos.y < this.hive.pos.y+HIVE_SIZE){
                    this.hive.armor += this.target.m;
                    this.hive.ill = false;
                    this.target.dead = true;
                    this.target = undefined;
                    if(this.hive.armor > MAX_ARMOR){
                        modern_debris.push(new ModernDebris(this.hive.pos.x,this.hive.pos.y,this.hive.armor - MAX_ARMOR));
                        this.hive.armor = MAX_ARMOR;
                    }
                }
            }else{
                fooVec.set(this.target.pos);
                let d = fooVec.dist(this.pos)-this.target.r();
                if(d<10){
                    this.target.bee = this;
                    this.ill = false;
                }
                fooVec.set(this.target.pos);
                fooVec.add(this.target.vel);
                let t = (fooVec.dist(this.pos)-this.target.r())/8;
                if(d>=10) t = min(3,t);
                this.pos.add(cos(this.angle)*t,sin(this.angle)*t);
            }
        }
        if(this.ill && random()<0.005) this.dead = true;
    }
}

class ModernDebris{
    constructor(x,y,m){
        this.pos = createVector(x,y);
        this.vel = p5.Vector.random2D().mult(random(0.5,2));
        this.m = m;
        this.rot = random(0,2*PI);
        this.omega = random(-PI/64,PI/64);
        this.bee = undefined;
        this.collision_cooldown = floor(20+3*sqrt(m));
        this.dead = false;
    }

    r(){
        return 5*sqrt(this.m);
    }

    update(){
        if(this.m > MAX_DEBRIS_SIZE){
            modern_debris.push(new ModernDebris(this.pos.x, this.pos.y, this.m - MAX_DEBRIS_SIZE));
            this.m = MAX_DEBRIS_SIZE;
        }
        if(random() < 0.001){
            if(this.m < 0.5){
                this.dead = true;
                return;
            }
            this.vel = p5.Vector.random2D().mult(random(0.5,2));
            this.omega = random(-PI/64,PI/64);
            if(this.m > 5 && random() < 0.1){
                let m1 = random(0.1,0.5)*this.m;
                modern_debris.push(new ModernDebris(this.pos.x,this.pos.y,m1));
                this.m -= m1;
            }
        }
        let p = this.pos;
        let v = this.vel;
        let r = this.r();
        p.add(v);
        this.rot += this.omega;
        this.rot = (this.rot % (2*PI) + 2*PI) % (2*PI);
        let r1 = (r*sqrt(3)/2)/cos(abs(PI/6 - (this.rot % (PI/3))));
        let r2 = (r*sqrt(3)/2)/cos(abs(PI/6 - ((this.rot + PI/2) % (PI/3))));
        if(p.x-r1<0){
            p.x = r1;
            v.x *= -1;
        }else if(p.x+r1>=width){
            p.x = width-1-r1;
            v.x *= -1;
        }else if(p.y-r2<0){
            p.y = r2;
            v.y *= -1;
        }else if(p.y+r2>=height){
            p.y = height-1-r2;
            v.y *= -1;
        }
        if(this.collision_cooldown)
            this.collision_cooldown--;
        else{
            for(let i=0;i<flares.length;i++){
                let f = flares[i];
                if(!f.dead){
                    fooVec.set(f.pos);
                    fooVec.sub(p);
                    let r3 = (r*sqrt(3)/2)/cos(abs(PI/6 - ((((fooVec.heading()-this.rot)%(2*PI)+2*PI)%(2*PI)) % (PI/3))));
                    if(fooVec.mag() < r3 && abs(fooVec.angleBetween(f.vel)) > PI/2){
                        let alpha = floor((((fooVec.heading()-this.rot)%(2*PI)+2*PI)%(2*PI))/(PI/3))*PI/3 + PI/6 + this.rot; // angle normal to side of hexagon
                        let reflect_val = -2*cos(f.vel.heading()-alpha)*f.vel.mag();
                        fooVec.set(reflect_val);
                        fooVec.rotate(alpha);
                        f.vel.add(fooVec);
                        if(f.killer){
                            f.killer = false;
                            this.m -= random(0.05,1);
                            if(this.m <= 0){
                                this.dead = true;
                                return;
                            }
                        }
                    }
                }
            }
            for(let i=0;i<modern_debris.length;i++){
                let d = modern_debris[i];
                if(!d.dead && d !== this && d.m+this.m <= MAX_DEBRIS_SIZE){
                    let dist = d.pos.dist(p);
                    if(dist < (r + d.r())/2 && d.m > this.m){
                        d.m += this.m;
                        this.dead = true;
                        return;
                    }
                }
            }
        }
        if(this.bee){
            if(this.bee.dead){
                this.bee = undefined;
                return;
            }
            this.pos.set(this.bee.pos);
            this.rot = this.bee.angle;
            this.pos.add(-(13+r)*cos(this.rot),-(13+r)*sin(this.rot));
        }
        if(raining && random() < 0.0002){
            lightning_bolts.push(new Lightning(this.pos.x, this.pos.y));
            if(this.m > 5){
                let m1 = random(0.1,0.35)*this.m;
                let m2 = random(0.1,0.35)*this.m;
                modern_debris.push(new ModernDebris(this.pos.x,this.pos.y,m1));
                modern_debris.push(new ModernDebris(this.pos.x,this.pos.y,m2));
                this.m -= m1 + m2;
            }
            if(this.bee){
                this.bee.dead = true;
                this.bee = undefined;
            }
        }
    }
}

class Lightning{
    constructor(x,y){
        this.age = 0;
        this.path = [];
        this.dead = false;

        this.path.push(createVector(x, y));
        y = lerp(y, 0, random(0.2,0.7));
        for(let i = 0; i < floor(random(2,4)); i++){
            x += random(-80, 80);
            y += random(-40, -100);
            if(y <= 0)
                break;
            this.path.push(createVector(x, y));
        }
        x += random(-80, 80);
        this.path.push(createVector(x, 0));
    }

    update(){
        this.age++;
        if(this.age > LIGHTNING_DURATION)
            this.dead = true;
    }
}

class Dragon{
    constructor(x, y, c){
        this.pos = createVector(x, y);
        this.rot = 3 * PI / 2;
        this.color = c;
        this.segments = [];
        this.dead = false;
    }

    update(){
        
    }
}

function mouseClicked(){
    circles.push(new Circle(mouseX,mouseY));
}

function keyPressed(){
    if(key===' '){
        raining = !raining;
    }/* else if(key==='Q'){
        modern_debris.push(new ModernDebris(mouseX,mouseY,random(10,20)));
    } */
}