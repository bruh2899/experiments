const VERSION = '20220113a';

window.onload = function(){
    var CellularAutomataEngine = (function(){
        const WIDTH = 500;
        const HEIGHT = 500;
    
        // simple canvas wrapper
        let canvas = (function(){
            let cnvs = document.createElement('canvas');
            document.body.appendChild(cnvs);
            cnvs.width = WIDTH;
            cnvs.height = HEIGHT;
            cnvs.style.border = 'black 1px solid';
            let ctx = cnvs.getContext('2d');
    
            function box(x, y, s, c){
                ctx.fillStyle = c;
                ctx.fillRect(x, y, s, s);
            }
    
            function clear(){
                ctx.clearRect(0, 0, cnvs.width, cnvs.height);
            }
    
            function other(callback){
                callback(ctx);
            }
    
            return {box, clear, other};
        })();
    
        // color string factory
        function color(r, g, b){
            if(g === undefined)
                g = r;
            if(b === undefined)
                b = r;
            return `rgb(${r},${g},${b})`;
        }
    
        // loops through a "neighborhood" around a cell on the tilemap and calls the callback for each set of coordinates
        function forNeighborhood(type, ci, cj, w, h, r, callback){
            function mod(a, b){
                return (a % b + b) % b;
            }
            function ofcell(i1, j1){
                let i2 = mod(ci + i1, w);
                let j2 = mod(cj + j1, h);
                if(i1 !== 0 || j1 !== 0)
                    callback(i1, j1, i2, j2);
            }
            for(let i1 = -r; i1 <= r; i1++){
                if(type === 1){
                    for(let j1 = -r + Math.abs(i1); j1 <= r - Math.abs(i1); j1++)
                        ofcell(i1, j1);
                }else{
                    for(let j1 = -r; j1 <= r; j1++)
                        ofcell(i1, j1);
                }
            }
        }
    
        // basic tilemap engine optimized for cellular automata
        function TileMap(s){
            let m = [];
            let xt = Math.floor(WIDTH / s);
            let yt = Math.floor(HEIGHT / s);
            for(let i = 0; i < xt; i++){
                let col = [];
                m.push(col);
                for(let j = 0; j < yt; j++){
                    let t = {};
                    col.push(t);
                }
            }
    
            this.width = function(){
                return xt;
            };
    
            this.height = function(){
                return yt;
            };
            
            this.getTile = function(i, j){
                return Object.assign({}, m[i][j]);
            };
            
            // instantly sets a tile's value
            this.setTile = function(i, j, t){
                Object.assign(m[i][j], t);
            };
            
            let changes = [];
            
            // queues a change to a tile's value that only takes affect once TileMap.applyChanges is called
            this.changeTile = function(i, j, t){
                changes.push({i, j, t});
            };
    
            this.discardChanges = function(){
                changes = [];
            };
            
            this.applyChanges = function(){
                for(let c of changes)
                    this.setTile(c.i, c.j, c.t);
                this.discardChanges();
            };
            
            // draw's the tilemap to the canvas
            // may use colorAccessor function applied to each tile to determine color
            // may use extra function for drawing advanced features on a tile with canvas context
            this.draw = function(colorAccessor,extra){
                for(let i = 0; i < m.length; i++){
                    for(let j = 0; j < m[i].length; j++){
                        if(colorAccessor)
                            canvas.box(i * s, j * s, s, colorAccessor(m[i][j]));
                        else
                            canvas.box(i * s, j * s, s, m[i][j].color || '#000');
                        if(extra)
                            canvas.other(ctx=>{
                                extra(ctx, i * s, j * s, s, m[i][j]);
                            });
                    }
                }
            };
    
            // advances cellular automaton one step by calling updater function for each tile
            // any changes using TileMap.changeTile will take effect after the loop completes
            this.automataStep = function(updater){
                for(let i = 0; i < this.width(); i++){
                    for(let j = 0; j < this.height(); j++)
                        updater(this, i, j);
                }
                this.applyChanges();
            };
        }
    
        // defines a cellular automaton in behavior and graphics by grouping three functions
        // should have updater
        // colorAccessor and extra are optional
        function Automata(updater, colorAccessor, extra){
            this.updater = updater;
            this.colorAccessor = colorAccessor;
            this.extra = extra;
        }
    
        let tileSize = 20;
        let tm = new TileMap(tileSize);
    
        let animation;
        let lastupdatetimestamp;
        let automata;
    
        // begins draw loop and automata simulation
        function run(){
            if(automata){
                if(!lastupdatetimestamp)
                    lastupdatetimestamp = performance.now();
                const now = performance.now();
                const period = 30;
                for(let i = 0; i < (now - lastupdatetimestamp) / period; i++)
                    tm.automataStep(automata.updater);
                tm.draw(automata.colorAccessor, automata.extra);
                lastupdatetimestamp = now;
    
                animation = requestAnimationFrame(run);
            }else
                console.warn('No automata specified; use CellularAutomataEngine.setAutomata()');
        }
    
        // stops draw loop and automata simulation
        function stop(){
            cancelAnimationFrame(animation);
            lastupdatetimestamp = undefined;
        }
    
        // sets the engine's currently-simulated automaton to a given Automata object
        function setAutomata(aut){
            tm = new TileMap(tileSize);
            if(aut instanceof Automata)
                automata = aut;
        }
    
        function setTileSize(s){
            tileSize = s;
            tm = new TileMap(tileSize);
        }
    
        // some preset cellular automata shipped with the engine
        let presets = {};
    
        presets.conwaylife = new Automata((tmap, i, j)=>{
            let t = tmap.getTile(i, j);
            if(t.alive === undefined){
                if(Math.random() < 0.25)
                    t.alive = 1;
                else
                    t.alive = 0;
                tmap.setTile(i, j, t);
            }
    
            let aliveNeighbors = 0;
            forNeighborhood(0, i, j, tmap.width(), tmap.height(), 1, (i1, j1, i2, j2)=>{
                let t1 = tmap.getTile(i2, j2);
                if(t1.alive)
                    aliveNeighbors++;
            });
    
            let cng = false;
    
            if(t.alive){
                if(aliveNeighbors < 2 || aliveNeighbors > 3){
                    t.alive = 0;
                    cng = true;
                }
            }else if(aliveNeighbors === 3){
                t.alive = 1;
                cng = true;
            }
    
            if(cng)
                tmap.changeTile(i, j, t);
        }, t=>{
            if(t.alive)
                return color(0);
            else
                return color(255);
        });
    
        presets.mold = new Automata((tmap, i, j)=>{
            let t = tmap.getTile(i, j);
            if(t.lvl === undefined){
                t.lvl = 0;
                tmap.setTile(i, j, t);
            }
            let upgradeChance = 0.000001;
            forNeighborhood(0, i, j, tmap.width(), tmap.height(), 3, (i1, j1, ni, nj)=>{
                let d = Math.max(Math.abs(i1), Math.abs(j1));
                let nlvl = tmap.getTile(ni, nj).lvl;
                if(nlvl === undefined)
                    nlvl = 0;
                let lvld = nlvl - t.lvl;
                if(d === 3 && lvld > 4)
                    upgradeChance += (1 - upgradeChance) * (1 - Math.pow(1 - 0.0001, lvld - 4));
                else if(d === 2 && lvld > 2)
                    upgradeChance += (1 - upgradeChance) * (1 - Math.pow(1 - 0.0001, lvld - 2));
                else if(d === 1 && nlvl > 0 && lvld >= 0)
                    upgradeChance += (1 - upgradeChance) * (1 - Math.pow(1 - 0.0001, lvld + 1));
            });
            if(Math.random() < upgradeChance){
                t.lvl++;
                tmap.changeTile(i, j, t);
            }
        }, t=>{
            let v = (t.lvl && 40) + t.lvl * 5;
            return color(v);
        });
    
        presets.forest = new Automata((tmap, i, j)=>{
            let t = tmap.getTile(i, j);
            if(t.veg === undefined){
                t.veg = 0;
                t.fire = 0;
                t.petr = 0;
                tmap.setTile(i, j, t);
            }
            let f = 0;
            let p = 0;
            let r = 0;
            let u = 0;
            forNeighborhood(0, i, j, tmap.width(), tmap.height(), 1, (i1, j1, ni, nj)=>{
                let t1 = tmap.getTile(ni, nj);
                if(t1.fire)
                    f += t1.fire;
                if(t1.petr === 1)
                    p++;
                if(t1.veg > 0 && t1.veg < 8)
                    r++;
                if(t1.petr === 2)
                    u++;
            });
            let cng = false;
            if(!t.fire && !t.petr && Math.random() < 0.002){
                t.veg++;
                cng = true;
            }
            if(t.fire){
                if(!t.veg)
                    t.fire = Math.floor(t.fire / 2);
                else{
                    let a = Math.min(t.fire, t.veg);
                    t.veg -= a;
                    t.fire += Math.ceil(a / 2);
                }
                cng = true;
            }
            f -= t.fire;
            if(!t.petr && !t.fire && t.veg && f > 10 && Math.random() < 0.01 * f){
                t.fire = Math.floor(f / 10);
                cng = true;
            }
            if(!t.fire && !t.petr && p > 0 && p < 4 && Math.random() < 0.0003){
                t.petr = 1;
                cng = true;
            }
            if(t.petr && Math.random() < 0.001 * r){
                if(Math.random() < 0.1)
                    t.petr = 2;
                else
                    t.petr = 0;
                cng = true;
            }
            if(t.petr === 1 && Math.random() < 0.01 * u){
                t.petr = 2;
                cng = true;
            }
            if(t.petr === 2 && Math.random() < 0.003){
                t.petr = 0;
                cng = true;
            }
            if(!t.petr && !t.fire && t.veg && Math.random() < 0.0000004){
                t.fire = 1;
                cng = true;
            }
            if(!t.petr && !t.fire && t.veg && Math.random() < 0.0000005){
                t.petr = 1;
                cng = true;
            }
            if(cng)
                tmap.changeTile(i, j, t);
        }, t=>{
            if(t.fire)
                return color(40 + Math.min(t.fire * 2, 200), 0, 0);
            else{
                let v = t.veg;
                if(v)
                    v = Math.min(20 + v * 2, 250);
                if(t.petr === 2)
                    return color(0, 0, v);
                else if(t.petr)
                    return color(v);
                else
                    return color(0, v, 0);
            }
        });
    
        presets.eco = (()=>{
            const NULL = color(0);
            let step = 0;
            let strains = {};

            const attrRanges = {
                red: [0, 255],
                green: [0, 255],
                blue: [0, 255],
                attackA: [0, 5],
                attackB: [0, 5],
                attackC: [0, 5],
                attackD: [0, 5],
                defenseA: [0, 5],
                defenseB: [0, 5],
                defenseC: [0, 5],
                defenseD: [0, 5],
                eatChance: [10, 150],
                mustEatThreshold: [50, 400],
                expansionThreshold: [250, 600],
                expansionFoundation: [600, 1600],
                expansionEagerness: [5, 50],
                mutationRate: [50, 150]
            };
    
            function finishUpdate(){
                step = 1 - step;
                for(let i in strains){
                    if(strains[i].count === 0)
                        delete strains[i];
                }
            }
    
            function mutantStrain(strain){
                function mutationAmount(min, max){
                    return Math.sign(Math.random() - 0.5) * (min + Math.floor(Math.random() * (max - min + 1)));
                }
    
                let newStrain = Object.assign({}, strain);
                newStrain.red += mutationAmount(15, 25);
                newStrain.green += mutationAmount(15, 25);
                newStrain.blue += mutationAmount(15, 25);
                newStrain.attackA += mutationAmount(0, 2);
                newStrain.attackB += mutationAmount(0, 2);
                newStrain.attackC += mutationAmount(0, 2);
                newStrain.attackD += mutationAmount(0, 2);
                newStrain.defenseA += mutationAmount(0, 2);
                newStrain.defenseB += mutationAmount(0, 2);
                newStrain.defenseC += mutationAmount(0, 2);
                newStrain.defenseD += mutationAmount(0, 2);
                newStrain.eatChance += mutationAmount(0, 20);
                newStrain.mustEatThreshold += mutationAmount(0, 15);
                newStrain.expansionThreshold += mutationAmount(0, 25);
                newStrain.expansionFoundation += mutationAmount(0, 40);
                newStrain.expansionEagerness += mutationAmount(0, 5);
                newStrain.mutationRate += mutationAmount(0, 20);
    
                for(let k in attrRanges)
                    newStrain[k] = Math.min(Math.max(newStrain[k], attrRanges[k][0]), attrRanges[k][1]);
                
                // newStrain.red = Math.max(Math.min(newStrain.red, 255), 0);
                // newStrain.green = Math.max(Math.min(newStrain.green, 255), 0);
                // newStrain.blue = Math.max(Math.min(newStrain.blue, 255), 0);
                // newStrain.hunger = Math.max(Math.min(newStrain.hunger, 25), 1);
                // newStrain.eatChance = Math.max(Math.min(newStrain.eatChance, 120), 20);
                // newStrain.mustEatThreshold = Math.max(Math.min(newStrain.mustEatThreshold, 200), 50);
                // newStrain.expansionThreshold = Math.max(Math.min(newStrain.expansionThreshold, 600), 250);
                // newStrain.expansionFoundation = Math.max(Math.min(newStrain.expansionFoundation, 1600), 600);
                // newStrain.expansionEagerness = Math.max(Math.min(newStrain.expansionEagerness, 50), 5);
                // newStrain.mutationRate = Math.max(Math.min(newStrain.mutationRate, 150), 50);
    
                newStrain.count = 1;
                return newStrain;
            }
    
            return new Automata((tmap, i, j)=>{
                let t = tmap.getTile(i, j);
                if(t.color === undefined){
                    t.color = NULL;
                    t.energy = 0;
                    if(Math.random() < 0.02){
                        let st = {};
                        for(let k in attrRanges)
                            st[k] = attrRanges[k][0] + Math.floor(Math.random() * (attrRanges[k][1] - attrRanges[k][0] + 1));
                        // st.red = Math.floor(Math.random() * 256);
                        // st.green = Math.floor(Math.random() * 256);
                        // st.blue = Math.floor(Math.random() * 256);
                        // st.hunger = Math.floor(Math.random() * 25 + 1);
                        // st.eatChance = 20 + Math.floor(Math.random() * 101);
                        // st.mustEatThreshold = 50 + Math.floor(Math.random() * 151);
                        // st.expansionThreshold = 250 + Math.floor(Math.random() * 351);
                        // st.expansionFoundation = 600 + Math.floor(Math.random() * 1001);
                        // st.expansionEagerness = 5 + Math.floor(Math.random() * 46);
                        // st.mutationRate = 50 + Math.floor(Math.random() * 101);
                        st.count = 1;
                        let col = color(st.red, st.green, st.blue);
                        if(col !== NULL){
                            if(strains[col])
                                strains[col].count++;
                            else
                                strains[col] = st;
                            t.color = col;
                            t.energy = 30000;
                        }
                    }
    
                    t.tree = 1;
    
                    t.targetX = undefined;
                    t.targetY = undefined;
                    t.offer = undefined;
    
                    tmap.setTile(i, j, t);
                }
                let cng = false;
    
                if(step === 0){
                    let tr = 0;
                    let free = [];
                    let enemy = [];
                    let friend = [];
                    forNeighborhood(0, i, j, tmap.width(), tmap.height(), 1, (i1, j1, i2, j2)=>{
                        let t1 = tmap.getTile(i2, j2);
                        if(t1.tree)
                            tr++;
                        if(t1.color === NULL)
                            free.push({x: i2, y: j2});
                        else if(t1.color !== t.color)
                            enemy.push({x: i2, y: j2});
                        else
                            friend.push({x: i2, y: j2});
                    });
    
                    if(t.color !== NULL){
                        let st = strains[t.color];
                        let hunger = 1 + st.attackA + st.attackB + st.attackC + st.attackD +
                            st.defenseA + st.defenseB + st.defenseC + st.defenseD;
                        t.energy -= hunger;
                        if(t.energy < 0){
                            st.count--;
                            t.color = NULL;
                            t.energy = 0;
                        }else if(t.tree === 1 && (Math.random() < st.eatChance / 100000 || t.energy < st.mustEatThreshold)){
                            t.tree = 0;
                            t.energy += 30000;
                        }else if(t.energy >= st.expansionThreshold + st.expansionFoundation && free.length > 0 && Math.random() < st.expansionEagerness/1000){
                            let target = free[Math.floor(Math.random() * free.length)];
                            if(target){
                                t.targetX = target.x;
                                t.targetY = target.y;
                                t.energy -= st.expansionFoundation;
                            }
                        }else if(t.energy >= 1500 && enemy.length > 0 && Math.random() < 0.01){
                            let target = enemy[Math.floor(Math.random() * enemy.length)];
                            if(target){
                                t.targetX = target.x;
                                t.targetY = target.y;
                            }
                        }else if(Math.random() < st.mutationRate / 1000000){
                            let ns = mutantStrain(st);
                            let col = color(ns.red, ns.green, ns.blue);
                            if(col !== NULL){
                                if(strains[col])
                                    strains[col].count++;
                                else
                                    strains[col] = ns;
                                st.count--;
                                t.color = col;
                            }
                        }else if(Math.random() < 0.3 && friend.length > 0){
                            let target = friend[Math.floor(Math.random() * friend.length)];
                            if(target){
                                t.targetX = target.x;
                                t.targetY = target.y;
                                let eDiff = t.energy - tmap.getTile(target.x, target.y).energy;
                                if(eDiff > 0)
                                    t.offer = Math.floor(eDiff * 0.5);
                                else if(t.energy >= 40)
                                    t.offer = 1 + Math.floor(Math.random() * 20);
                                else
                                    t.offer = 0;
                                t.energy -= t.offer;
                            }
                        }
                        cng = true;
                    }
                    if(!t.tree && Math.random() < 0.0005 * tr){
                        if(Math.random() < 0.01)
                            t.tree = 2;
                        else
                            t.tree = 1;
                        cng = true;
                    }
                    if(t.tree === 2 && t.color === NULL && Math.random() < 0.005){
                        t.tree = 1;
                        cng = true;
                    }
                }else{
                    let actors = [];
                    forNeighborhood(0, i, j, tmap.width(), tmap.height(), 1, (i1, j1, i2, j2)=>{
                        let t1 = tmap.getTile(i2, j2);
                        if(t1.targetX === i && t1.targetY === j)
                            actors.push(t1);
                    });
                    let actor = actors[Math.floor(Math.random() * actors.length)];
                    if(actor){
                        if(t.color === NULL){
                            t.color = actor.color;
                            strains[actor.color].count++;
                            t.energy += strains[actor.color].expansionFoundation - 50;
                        }else if(t.color !== actor.color){
                            let st0 = strains[actor.color];
                            let st1 = strains[t.color];
                            let chanceA = 0.15 * Math.pow(1.45, st0.attackA - st1.defenseA);
                            let chanceB = 0.15 * Math.pow(1.45, st0.attackB - st1.defenseB);
                            let chanceC = 0.15 * Math.pow(1.45, st0.attackC - st1.defenseC);
                            let chanceD = 0.15 * Math.pow(1.45, st0.attackD - st1.defenseD);
                            let netChance = 1 - ((1 - chanceA) * (1 - chanceB) * (1 - chanceC) * (1 - chanceD));
                            if(Math.random() < netChance){
                                st1.count--;
                                t.color = actor.color;
                                st0.count++;
                            }
                        }else if(actor.offer !== undefined)
                            t.energy += actor.offer;
                        cng = true;
                    }
                    if(t.targetX !== undefined || t.targetY !== undefined || t.offer !== undefined){
                        t.targetX = undefined;
                        t.targetY = undefined;
                        t.offer = undefined;
                        cng = true;
                    }
                }
    
                if(cng)
                    tmap.changeTile(i, j, t);
    
                if(i === tmap.width() - 1 && j === tmap.height() - 1)
                    finishUpdate();
            },undefined,(ctx, x, y, s, t)=>{
                if(t.tree){
                    if(t.tree === 2)
                        ctx.fillStyle = 'red';
                    else
                        ctx.fillStyle = 'green';
                    ctx.beginPath();
                    ctx.arc(x + s/2, y + s/2, s/4, 0, 2 * Math.PI);
                    ctx.fill();
                }
            });
        })();
    
        // UI
    
        let uiDiv = document.createElement('div');
        document.body.appendChild(uiDiv);
    
        let startPauseButton = document.createElement('button');
        startPauseButton.innerText = 'Start';
        startPauseButton.onclick = function(){
            if(lastupdatetimestamp){
                stop();
                startPauseButton.innerText = 'Start';
            }else{
                run();
                startPauseButton.innerText = 'Pause';
            }
        };
        uiDiv.appendChild(startPauseButton);
    
        let stepButton = document.createElement('button');
        stepButton.innerText = 'Step';
        stepButton.onclick = function(){
            if(automata && !lastupdatetimestamp){
                tm.automataStep(automata.updater);
                tm.draw(automata.colorAccessor, automata.extra);
            }
        };
        uiDiv.appendChild(stepButton);
    
        let resetButton = document.createElement('button');
        resetButton.innerText = 'Reset';
        resetButton.onclick = function(){
            tm = new TileMap(tileSize);
            canvas.clear();
        };
        uiDiv.appendChild(resetButton);
    
        let presetDropdownData = {
            'Conway\'s Game of Life': presets.conwaylife,
            'Mold': presets.mold,
            'Forest': presets.forest,
            'Ecosystem': presets.eco
        };
    
        let presetDropdown = document.createElement('select');
        presetDropdown.onchange = function(){
            if(presetDropdownData[presetDropdown.value]){
                setAutomata(presetDropdownData[presetDropdown.value]);
                canvas.clear();
            }
        };
    
        for(let key in presetDropdownData){
            let opt = document.createElement('option');
            opt.value = key;
            opt.innerText = key;
            presetDropdown.appendChild(opt);
        }
    
        uiDiv.appendChild(presetDropdown);
    
        // initialize with a preset
        setAutomata(presets.conwaylife);
    
        return {color, Automata, run, stop, setAutomata, setTileSize, forNeighborhood, presets};
    })();

    window.CellularAutomataEngine = CellularAutomataEngine;

    setVersion('Cellular Automata Engine v', VERSION);
};