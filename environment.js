// Configuration Constants
window.COLS = 20000;
window.START_COL = 10000;

// Shared Geometry
window.boxGeo = new THREE.BoxGeometry(1, 1, 1);

/* GRAPHICS ENGINE UPGRADE: Converted from basic flat MeshLambert to physically responsive MeshStandardMaterial blocks */
window.matGrass = new THREE.MeshStandardMaterial({ color: 0x4fa642, roughness: 0.6, metalness: 0.1, flatShading: true });
window.matGrassDark = new THREE.MeshStandardMaterial({ color: 0x438f38, roughness: 0.6, metalness: 0.1, flatShading: true });
window.matFlowerRed = new THREE.MeshStandardMaterial({ color: 0xe23b3b, roughness: 0.7, flatShading: true });
window.matFlowerYellow = new THREE.MeshStandardMaterial({ color: 0xeed23b, roughness: 0.7, flatShading: true });
window.matRoad = new THREE.MeshStandardMaterial({ color: 0x282a30, roughness: 0.85, metalness: 0.2, flatShading: true });
window.matWater = new THREE.MeshStandardMaterial({ color: 0x1d5ec2, roughness: 0.15, metalness: 0.4, flatShading: true, transparent: true, opacity: 0.88 });
window.matWaterDark = new THREE.MeshStandardMaterial({ color: 0x164ba1, roughness: 0.15, metalness: 0.4, flatShading: true, transparent: true, opacity: 0.88 });
window.matLily = new THREE.MeshStandardMaterial({ color: 0x298a4e, roughness: 0.6, flatShading: true });
window.matTreeLeaves = new THREE.MeshStandardMaterial({ color: 0x1b612c, roughness: 0.65, flatShading: true });
window.matTreeLeavesLight = new THREE.MeshStandardMaterial({ color: 0x247c3a, roughness: 0.65, flatShading: true });
window.matTrunk = new THREE.MeshStandardMaterial({ color: 0x452815, roughness: 0.9, flatShading: true });
window.matLog = new THREE.MeshStandardMaterial({ color: 0x61391e, roughness: 0.85, flatShading: true });
window.matRock = new THREE.MeshStandardMaterial({ color: 0x7c8491, roughness: 0.8, metalness: 0.2, flatShading: true });
window.matRockDark = new THREE.MeshStandardMaterial({ color: 0x5d636e, roughness: 0.8, metalness: 0.2, flatShading: true });
window.matWhiteMarking = new THREE.MeshBasicMaterial({ color: 0xccd1db });
window.matRailSteel = new THREE.MeshStandardMaterial({ color: 0x7e8694, roughness: 0.2, metalness: 0.8, flatShading: true });
window.matRailTie = new THREE.MeshStandardMaterial({ color: 0x362013, roughness: 0.9, flatShading: true });
window.matSignalRed = new THREE.MeshBasicMaterial({ color: 0xff0833 });
window.matSignalOff = new THREE.MeshBasicMaterial({ color: 0x1f0508 });
window.matSignalGreen = new THREE.MeshBasicMaterial({ color: 0x113311 });
window.matSignalTail = new THREE.MeshBasicMaterial({ color: 0xff3344 });
window.matIronDark = new THREE.MeshStandardMaterial({ color: 0x444852, roughness: 0.5, metalness: 0.5, flatShading: true });

// Biome Specific Procedural Material Profiles
window.matDesertSand = new THREE.MeshStandardMaterial({ color: 0xdfd3a2, roughness: 0.9, metalness: 0.05, flatShading: true });
window.matCactusBody = new THREE.MeshStandardMaterial({ color: 0x376e31, roughness: 0.7, flatShading: true });
window.matDesertShrub = new THREE.MeshStandardMaterial({ color: 0x8a8463, roughness: 0.8, flatShading: true });
window.matGridFloor = new THREE.MeshStandardMaterial({ color: 0x1a1b20, roughness: 0.4, metalness: 0.3, flatShading: true });
window.matGridMonolith = new THREE.MeshStandardMaterial({ color: 0x0a0b0d, roughness: 0.2, metalness: 0.8, flatShading: true });
window.matGridNeonBlue = new THREE.MeshBasicMaterial({ color: 0x00f3ff });
window.matGridNeonPink = new THREE.MeshBasicMaterial({ color: 0xff0055 });

// Shared optimization material cache parameters
window.matGlassPool = new THREE.MeshStandardMaterial({ color: 0xb3f0ff, roughness: 0.05, transparent: true, opacity: 0.8, flatShading: true });
window.matWheelPool = new THREE.MeshStandardMaterial({ color: 0x111215, roughness: 0.8, flatShading: true });
window.matGlowPool = new THREE.MeshBasicMaterial({ color: 0xfffde0 });
window.matEnginePool = new THREE.MeshStandardMaterial({ color: 0xc42533, roughness: 0.4, metalness: 0.2, flatShading: true });
window.matCoachPool = new THREE.MeshStandardMaterial({ color: 0xd9e1e8, roughness: 0.4, metalness: 0.3, flatShading: true });
window.matWinPool = new THREE.MeshBasicMaterial({ color: 0x222b35 });
window.matWinFrontPool = new THREE.MeshBasicMaterial({ color: 0xccf5ff });
window.matParticleBase = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.95 });

// Neon Projection Volumetric Visual Presets
window.matHeadlightCone = new THREE.MeshBasicMaterial({ color: 0xfffde0, transparent: true, opacity: 0.15 });

// Polish Addition: Dynamic material handles to track procedural swaying structures
window.swayingTrees = [];
window.tumbleweeds = [];
window.matTumbleweed = new THREE.MeshStandardMaterial({ color: 0xbc9d6c, roughness: 0.95, flatShading: true });

// Memory Optimization Pools
window.vehiclePool = [];
window.logPool = [];
window.trainPool = [];

// HIGH RESILIENCE UPGRADE: Visual Object Mesh Pool dictionary to completely prevent Garbage Collection stutter triggers
window.obstacleMeshPool = {
    tree: [],
    rock: [],
    flower: [],
    cactus: [],
    cyberTower: []
};

// MULTI-BIOME VISUAL JUICE REGISTRIES: Track water structures and star coins seamlessly
window.riverWaterMeshes = [];
window.activeStarCoins = {}; 
window.matStarCoin = new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.1, metalness: 0.9, flatShading: true });

window.getBiomeType = function(z) {
    if (z < 50) return 'forest';
    if (z < 100) return 'desert';
    return 'cyber';
};

// DOM Projection Helper displays vibrant floating tags matching biomes
window.spawnFloatingIndicator = function(textStr, colorHexStr) {
    const gameContainer = document.getElementById('gameContainer');
    if (!gameContainer) return;
    
    const tempDiv = document.createElement('div');
    tempDiv.className = 'floating-indicator';
    tempDiv.innerText = textStr;
    tempDiv.style.color = colorHexStr;
    
    // Standard center screen coordinates mapping
    tempDiv.style.left = '50%';
    tempDiv.style.top = '45%';
    
    gameContainer.appendChild(tempDiv);
    setTimeout(() => { tempDiv.remove(); }, 600);
};

// Polish Addition: Global loop updating natural swaying vegetation and rolling tumbleweeds
window.updateEnvironmentAnimations = function(delta, time) {
    // Math loop waving high detail tree leaf segments seamlessly
    window.swayingTrees.forEach(leafMesh => {
        if (leafMesh && leafMesh.parent) {
            leafMesh.rotation.z = Math.sin(time * 2.2 + leafMesh.position.x) * 0.03;
            leafMesh.rotation.x = Math.cos(time * 1.8 + leafMesh.position.y) * 0.02;
        }
    });

    // Animate rolling tumbleweeds down sand channels
    for (let i = window.tumbleweeds.length - 1; i >= 0; i--) {
        const tw = window.tumbleweeds[i];
        if (tw && tw.mesh && tw.mesh.parent) {
            tw.mesh.position.x += tw.speed * delta * 60;
            tw.mesh.rotation.z -= (tw.speed * 1.5) * (delta * 60);
            tw.mesh.position.y = 0.15 + Math.abs(Math.sin(time * 5 + tw.mesh.position.x)) * 0.2;
            
            if (Math.abs(tw.mesh.position.x - (window.playerMesh ? window.playerMesh.position.x : 0)) > 25) {
                window.scene.remove(tw.mesh);
                window.tumbleweeds.splice(i, 1);
            }
        } else {
            window.tumbleweeds.splice(i, 1);
        }
    }

    // VISUAL JUICE UPGRADE: Smooth sinusoidal liquid wave scale and position displacement for active river segments
    if (window.riverWaterMeshes) {
        for (let j = window.riverWaterMeshes.length - 1; j >= 0; j--) {
            const waterMesh = window.riverWaterMeshes[j];
            if (waterMesh && waterMesh.parent) {
                waterMesh.position.y = -0.9 + Math.sin(time * 1.8 + waterMesh.position.z) * 0.025;
            } else {
                window.riverWaterMeshes.splice(j, 1);
            }
        }
    }

    // INTERACTIVE JUICE UPGRADE: Rotate and hover collectible star coins programmatically
    if (window.activeStarCoins) {
        Object.keys(window.activeStarCoins).forEach(key => {
            const coinMesh = window.activeStarCoins[key];
            if (coinMesh && coinMesh.parent) {
                coinMesh.rotation.y += delta * 2.5;
                coinMesh.position.y = 0.35 + Math.sin(time * 3.5 + coinMesh.position.x) * 0.06;
            } else {
                delete window.activeStarCoins[key];
            }
        });
    }
};

window.generateLane = function(z) {
    if (window.lanes[z]) return;

    const rand = Math.random();
    const laneObj = { type: '', mesh: null, obstacles: {} };
    const biome = window.getBiomeType(z);

    // ADAPTIVE DIFFICULTY TUNING: Scales vehicle intervals based on progression parameters
    let speedScalar = 1.0 + Math.min(window.maxRowReached * 0.005, 0.45);
    let spaceScalar = 1.0 + Math.min(window.maxRowReached * 0.007, 0.50);

    if (z <= 2) {
        laneObj.type = 'grass';
        laneObj.mesh = new THREE.Mesh(window.boxGeo, biome === 'desert' ? window.matDesertSand : (biome === 'cyber' ? window.matGridFloor : window.matGrass));
        laneObj.mesh.scale.set(window.COLS * 3, 1, 1);
        laneObj.mesh.position.set(0, -0.5, z);
        laneObj.mesh.receiveShadow = true;
        window.scene.add(laneObj.mesh);
        window.lanes[z] = laneObj;
        return;
    }

    if (rand < 0.42) {
        laneObj.type = 'road';
        laneObj.mesh = new THREE.Mesh(window.boxGeo, biome === 'cyber' ? new THREE.MeshStandardMaterial({color:0x111215, roughness:0.5}) : window.matRoad);
        laneObj.mesh.scale.set(window.COLS * 3, 1, 1);
        laneObj.mesh.position.set(0, -0.5, z);
        laneObj.mesh.receiveShadow = true;
        window.scene.add(laneObj.mesh);

        laneObj.markingGroup = new THREE.Group();
        window.scene.add(laneObj.markingGroup);

        laneObj.vehicles = [];
        laneObj.speed = (1.3 + Math.random() * 1.4) * (Math.random() > 0.5 ? 1 : -1) * speedScalar;
        laneObj.spawnTimer = Math.random() * 50; 
        laneObj.spawnInterval = ((106 + Math.random() * 82) / spaceScalar);
        laneObj.vehicleProfile = Math.random() > 0.45 ? 'truck' : 'sedan';
        
        let lineMat = biome === 'cyber' ? window.matGridNeonPink : window.matWhiteMarking;
        for (let i = -60; i < 60; i += 4) {
            const mark = new THREE.Mesh(window.boxGeo, lineMat);
            // Height micro-offset to eliminate z-fighting pixelation
            mark.scale.set(0.5, 0.02, 0.06);
            mark.position.set(i, 0.011, z);
            laneObj.markingGroup.add(mark);
        }

    } else if (rand < 0.68) {
        laneObj.type = 'river';
        let waterBase = biome === 'cyber' ? new THREE.MeshStandardMaterial({color:0x050b14, roughness:0.1, metalness:0.9}) : window.matWater;
        laneObj.mesh = new THREE.Mesh(window.boxGeo, waterBase);
        laneObj.mesh.scale.set(window.COLS * 3, 1.4, 1);
        laneObj.mesh.position.set(0, -0.9, z);
        laneObj.mesh.receiveShadow = true;
        window.scene.add(laneObj.mesh);

        window.riverWaterMeshes.push(laneObj.mesh);

        laneObj.foamGroup = new THREE.Group();
        window.scene.add(laneObj.foamGroup);

        laneObj.lilies = []; 

        let darkBand = biome === 'cyber' ? window.matGridNeonBlue : window.matWaterDark;
        for(let i = -60; i < 60; i += 8) {
            const band = new THREE.Mesh(window.boxGeo, darkBand);
            // Height micro-offset to eliminate z-fighting pixelation
            band.scale.set(4.0, 0.02, biome === 'cyber' ? 0.05 : 1.002);
            band.position.set(i + (Math.random() * 2), biome === 'cyber' ? 0.011 : -0.13, z);
            laneObj.foamGroup.add(band);
        }

        for(let i = -50; i < 50; i += 6) {
            if(Math.random() > 0.4 && biome !== 'cyber') {
                const lily = new THREE.Mesh(window.boxGeo, window.matLily);
                lily.scale.set(0.4, 0.02, 0.4);
                lily.position.set(i + (Math.random() * 3), -0.12, z + (Math.random() - 0.5) * 0.4);
                laneObj.foamGroup.add(lily);
                
                laneObj.lilies.push({
                    mesh: lily,
                    initialY: -0.12,
                    sinkProgress: 0,
                    isStepped: false
                });
            }
        }

        laneObj.logs = [];
        laneObj.speed = (0.8 + Math.random() * 0.9) * (Math.random() > 0.5 ? 1 : -1) * speedScalar;
        laneObj.spawnTimer = Math.random() * 60; 
        laneObj.spawnInterval = ((80 + Math.random() * 50) / spaceScalar);

        if (biome !== 'cyber') {
            for (let i = -3; i < 4; i++) {
                const foam = new THREE.Mesh(window.boxGeo, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.2 }));
                foam.scale.set(1.6, 0.01, 0.8);
                foam.position.set(i * 8, -0.12, z);
                laneObj.foamGroup.add(foam);
            }
        }

    } else if (rand < 0.82) {
        laneObj.type = 'railway';
        laneObj.mesh = new THREE.Mesh(window.boxGeo, biome === 'cyber' ? window.matGridFloor : window.matRoad);
        laneObj.mesh.scale.set(window.COLS * 3, 0.9, 1);
        laneObj.mesh.position.set(0, -0.45, z);
        laneObj.mesh.receiveShadow = true;
        window.scene.add(laneObj.mesh);

        laneObj.visualGroup = new THREE.Group();
        window.scene.add(laneObj.visualGroup);

        laneObj.trains = [];
        laneObj.activeWarning = false;
        laneObj.warningTimer = 0;
        laneObj.trainSpawnCountdown = ((200 + Math.random() * 175) / speedScalar);
        laneObj.speed = (Math.random() > 0.5 ? 7.5 : -7.5) * speedScalar;

        for (let i = -60; i < 60; i++) {
            const tie = new THREE.Mesh(window.boxGeo, biome === 'cyber' ? window.matGridMonolith : window.matRailTie);
            tie.scale.set(0.18, 0.05, 0.85);
            tie.position.set(i, 0.02, z);
            laneObj.visualGroup.add(tie);
        }
        const rail1 = new THREE.Mesh(window.boxGeo, biome === 'cyber' ? window.matGridNeonBlue : window.matRailSteel); rail1.scale.set(window.COLS * 3, 0.08, 0.04); rail1.position.set(0, 0.08, z - 0.25);
        const rail2 = rail1.clone(); rail2.position.z = z + 0.25;
        laneObj.visualGroup.add(rail1, rail2);

        laneObj.signalPost = new THREE.Mesh(window.boxGeo, new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.5 }));
        laneObj.signalPost.scale.set(0.18, 1.4, 0.18);
        laneObj.signalPost.position.set(5, 0.6, z);
        window.scene.add(laneObj.signalPost);

        laneObj.signalLight = new THREE.Mesh(window.boxGeo, window.matSignalGreen);
        laneObj.signalLight.scale.set(0.28, 0.28, 0.28);
        laneObj.signalLight.position.set(5, 1.1, z + 0.12);
        window.scene.add(laneObj.signalLight);

        laneObj.gateArm = new THREE.Mesh(window.boxGeo, new THREE.MeshStandardMaterial({ color: 0xdd2222, roughness: 0.6 }));
        laneObj.gateArm.scale.set(1.8, 0.08, 0.08);
        laneObj.gateArm.position.set(4.2, 0.6, z + 0.3);
        window.scene.add(laneObj.gateArm);

    } else {
        laneObj.type = 'grass';
        laneObj.mesh = new THREE.Mesh(window.boxGeo, biome === 'desert' ? window.matDesertSand : (biome === 'cyber' ? window.matGridFloor : window.matGrass));
        laneObj.mesh.scale.set(window.COLS * 3, 1, 1);
        laneObj.mesh.position.set(0, -0.5, z);
        laneObj.mesh.receiveShadow = true;
        window.scene.add(laneObj.mesh);

        laneObj.visualGroup = new THREE.Group();
        window.scene.add(laneObj.visualGroup);
    }

    if (laneObj.type === 'grass') {
        window.ensureObstaclesGeneratedForRange(laneObj, z, window.playerGridX - 35, window.playerGridX + 35);
    }

    if (biome === 'desert' && Math.random() < 0.25) {
        const twMesh = new THREE.Mesh(window.boxGeo, window.matTumbleweed);
        twMesh.scale.set(0.25, 0.25, 0.25);
        twMesh.position.set(window.playerMesh ? window.playerMesh.position.x - 18 : -18, 0.15, z);
        window.scene.add(twMesh);
        window.tumbleweeds.push({ mesh: twMesh, speed: 0.06 + Math.random() * 0.08 });
    }

    window.lanes[z] = laneObj;
};

window.ensureObstaclesGeneratedForRange = function(lane, z, minX, maxX) {
    if (!lane || !lane.visualGroup) return;
    if (!lane.obstacles) lane.obstacles = {};
    const biome = window.getBiomeType(z);
    
    for (let c = minX; c <= maxX; c++) {
        if (c < 0 || c >= window.COLS || lane.obstacles[c] !== undefined) continue;

        lane.obstacles[c] = false; 
        if (c === window.START_COL && z <= 4) continue;

        const itemRand = Math.random();
        if (itemRand < 0.18) {
            lane.obstacles[c] = true;
            
            if (biome === 'desert') {
                let cactus;
                if (window.obstacleMeshPool.cactus.length > 0) {
                    cactus = window.obstacleMeshPool.cactus.pop();
                    cactus.visible = true;
                } else {
                    cactus = new THREE.Group();
                    const trunk = new THREE.Mesh(window.boxGeo, window.matCactusBody); trunk.scale.set(0.2, 0.9, 0.2); trunk.position.y = 0.45; trunk.castShadow = true; cactus.add(trunk);
                    if(Math.random() > 0.4) {
                        const armL = new THREE.Mesh(window.boxGeo, window.matCactusBody); armL.scale.set(0.15, 0.3, 0.15); armL.position.set(0.18, 0.5, 0); cactus.add(armL);
                    }
                    if(Math.random() > 0.4) {
                        const armR = new THREE.Mesh(window.boxGeo, window.matCactusBody); armR.scale.set(0.15, 0.3, 0.15); armR.position.set(-0.18, 0.6, 0); cactus.add(armR);
                    }
                }
                cactus.position.set((c - window.START_COL), 0, z);
                cactus.name = "cactus";
                lane.visualGroup.add(cactus);
            } else if (biome === 'cyber') {
                let tower;
                if (window.obstacleMeshPool.cyberTower.length > 0) {
                    tower = window.obstacleMeshPool.cyberTower.pop();
                    tower.visible = true;
                } else {
                    tower = new THREE.Group();
                    const core = new THREE.Mesh(window.boxGeo, window.matGridMonolith); core.scale.set(0.4, 1.5, 0.4); core.position.y = 0.75; core.castShadow = true; tower.add(core);
                    const trim = new THREE.Mesh(window.boxGeo, Math.random() > 0.5 ? window.matGridNeonBlue : window.matGridNeonPink);
                    trim.scale.set(0.44, 0.06, 0.44); trim.position.y = 1.3; tower.add(trim);
                }
                tower.position.set((c - window.START_COL), 0, z);
                tower.name = "cyberTower";
                lane.visualGroup.add(tower);
            } else {
                let tree;
                if (window.obstacleMeshPool.tree.length > 0) {
                    tree = window.obstacleMeshPool.tree.pop();
                    tree.visible = true;
                } else {
                    tree = new THREE.Group();
                    const trunk = new THREE.Mesh(window.boxGeo, window.matTrunk); trunk.scale.set(0.22, 0.7, 0.22); trunk.position.y = 0.35; trunk.castShadow = true; tree.add(trunk);
                    const leafMat = Math.random() > 0.5 ? window.matTreeLeaves : window.matTreeLeavesLight;
                    const leavesB = new THREE.Mesh(window.boxGeo, leafMat); leavesB.scale.set(0.85, 0.6, 0.85); leavesB.position.y = 0.8; leavesB.castShadow = true; tree.add(leavesB);
                    const leavesM = new THREE.Mesh(window.boxGeo, leafMat); leavesM.scale.set(0.65, 0.5, 0.65); leavesM.position.y = 1.3; leavesM.castShadow = true; tree.add(leavesM);
                    const leavesT = new THREE.Mesh(window.boxGeo, leafMat); leavesT.scale.set(0.45, 0.45, 0.45); leavesT.position.y = 1.7; leavesT.castShadow = true; tree.add(leavesT);
                    
                    window.swayingTrees.push(leavesB, leavesM, leavesT);
                }
                tree.position.set((c - window.START_COL), 0, z);
                tree.name = "tree";
                lane.visualGroup.add(tree);
            }
        } else if (itemRand < 0.25) {
            let rock;
            let rockMat = biome === 'cyber' ? window.matGridMonolith : (Math.random() > 0.4 ? window.matRock : window.matRockDark);
            if (window.obstacleMeshPool.rock.length > 0) {
                rock = window.obstacleMeshPool.rock.pop();
                rock.material = rockMat;
                rock.visible = true;
            } else {
                rock = new THREE.Mesh(window.boxGeo, rockMat);
                rock.castShadow = true; rock.receiveShadow = true;
            }
            rock.scale.set(0.4 + Math.random() * 0.25, 0.3 + Math.random() * 0.2, 0.4 + Math.random() * 0.25);
            rock.position.set((c - window.START_COL) + (Math.random() - 0.5) * 0.15, 0.15, z + (Math.random() - 0.5) * 0.15);
            rock.name = "rock";
            lane.visualGroup.add(rock);
        } else if (itemRand < 0.35 && biome !== 'cyber') {
            let flowerGroup;
            const flowerMat = biome === 'desert' ? window.matDesertShrub : (Math.random() > 0.5 ? window.matFlowerRed : window.matFlowerYellow);
            if (window.obstacleMeshPool.flower.length > 0) {
                flowerGroup = window.obstacleMeshPool.flower.pop();
                flowerGroup.children[0].material = flowerMat;
                flowerGroup.children[1].material = biome === 'desert' ? window.matDesertSand : window.matGrassDark;
                flowerGroup.visible = true;
            } else {
                flowerGroup = new THREE.Group();
                const flower = new THREE.Mesh(window.boxGeo, flowerMat);
                flower.scale.set(0.12, 0.15, 0.12);
                flower.position.set(0, 0.06, 0);
                flowerGroup.add(flower);

                const tuft = new THREE.Mesh(window.boxGeo, biome === 'desert' ? window.matDesertSand : window.matGrassDark);
                tuft.scale.set(0.2, 0.08, 0.2);
                tuft.position.set(0, 0.03, 0);
                flowerGroup.add(tuft);
            }
            flowerGroup.position.set((c - window.START_COL) + (Math.random() - 0.5) * 0.3, 0, z + (Math.random() - 0.5) * 0.3);
            flowerGroup.name = "flower";
            lane.visualGroup.add(flowerGroup);
        } else if (itemRand > 0.90 && (lane.type === 'grass' || lane.type === '')) {
            const coinX = c - window.START_COL;
            const coinKey = `${coinX}_${z}`;
            
            const coinMesh = new THREE.Mesh(window.boxGeo, window.matStarCoin);
            coinMesh.scale.set(0.3, 0.3, 0.08);
            coinMesh.position.set(coinX, 0.35, z);
            coinMesh.castShadow = true;
            
            lane.visualGroup.add(coinMesh);
            window.activeStarCoins[coinKey] = coinMesh;
        }
    }
};

window.createHighDetailVehicle = function(profile, direction) {
    const vehicle = new THREE.Group();
    
    if (profile === 'truck') {
        const cargoColor = new THREE.Color().setHSL(Math.random(), 0.12, 0.8); 
        const cabColor = new THREE.Color().setHSL(Math.random(), 0.8, 0.4);
        
        const cab = new THREE.Mesh(window.boxGeo, new THREE.MeshStandardMaterial({ color: cabColor, roughness: 0.4, flatShading: true }));
        cab.scale.set(0.7, 0.9, 0.76); cab.position.set(direction > 0 ? 0.8 : -0.8, 0.48, 0);
        cab.castShadow = true; vehicle.add(cab);

        const grill = new THREE.Mesh(window.boxGeo, window.matIronDark);
        grill.scale.set(0.04, 0.3, 0.6); grill.position.set(direction > 0 ? 1.16 : -1.16, 0.3, 0);
        vehicle.add(grill);

        const windshield = new THREE.Mesh(window.boxGeo, window.matGlassPool);
        windshield.scale.set(0.04, 0.28, 0.66); windshield.position.set(direction > 0 ? 1.15 : -1.15, 0.68, 0);
        vehicle.add(windshield);

        const containerBox = new THREE.Mesh(window.boxGeo, new THREE.MeshStandardMaterial({ color: cargoColor, roughness: 0.5, flatShading: true }));
        containerBox.scale.set(1.6, 1.2, 0.86); containerBox.position.set(direction > 0 ? -0.35 : 0.35, 0.66, 0);
        containerBox.castShadow = true; vehicle.add(containerBox);

        const trim = new THREE.Mesh(window.boxGeo, window.matRailSteel);
        trim.scale.set(1.5, 0.06, 0.88); trim.position.set(direction > 0 ? -0.35 : 0.35, 1.26, 0);
        vehicle.add(trim);

        const guard = new THREE.Mesh(window.boxGeo, window.matRailSteel);
        guard.scale.set(2.1, 0.1, 0.74); guard.position.y = 0.12; vehicle.add(guard);

        const w1 = new THREE.Mesh(window.boxGeo, window.matWheelPool); w1.scale.set(0.34, 0.34, 0.15); w1.position.set(0.75, 0.17, 0.4);
        const w2 = w1.clone(); w2.position.z = -0.4;
        const w3 = w1.clone(); w3.position.set(direction > 0 ? -0.25 : 0.25, 0.17, 0.4);
        const w4 = w3.clone(); w4.position.z = -0.4;
        const w5 = w1.clone(); w5.position.set(direction > 0 ? -0.42 : 0.42, 0.17, 0.4);
        const w6 = w5.clone(); w6.position.z = -0.4;
        const w7 = w1.clone(); w7.position.set(direction > 0 ? -0.95 : 0.95, 0.17, 0.4);
        const w8 = w7.clone(); w8.position.z = -0.4;
        vehicle.add(w1, w2, w3, w4, w5, w6, w7, w8);
    } else {
        const bodyColor = new THREE.Color().setHSL(Math.random(), 0.85, 0.48);
        const matBody = new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.3, metalness: 0.1, flatShading: true });
        
        const baseBody = new THREE.Mesh(window.boxGeo, matBody);
        baseBody.scale.set(1.4, 0.4, 0.8); baseBody.position.y = 0.26; baseBody.castShadow = true; vehicle.add(baseBody);

        const upperCabin = new THREE.Mesh(boxGeo, matBody);
        upperCabin.scale.set(0.8, 0.36, 0.72); upperCabin.position.set(direction > 0 ? -0.12 : 0.12, 0.62, 0);
        upperCabin.castShadow = true; vehicle.add(upperCabin);

        const wind = new THREE.Mesh(window.boxGeo, window.matGlassPool);
        wind.scale.set(0.04, 0.24, 0.62); wind.position.set(direction > 0 ? 0.29 : -0.29, 0.62, 0); vehicle.add(wind);
        
        const rearWind = wind.clone(); rearWind.position.x = direction > 0 ? -0.53 : 0.53; vehicle.add(rearWind);

        const bumperF = new THREE.Mesh(window.boxGeo, window.matIronDark);
        bumperF.scale.set(0.08, 0.14, 0.8); bumperF.position.set(direction > 0 ? 0.71 : -0.71, 0.18, 0); vehicle.add(bumperF);

        const wh1 = new THREE.Mesh(window.boxGeo, window.matWheelPool); wh1.scale.set(0.32, 0.32, 0.13); wh1.position.set(0.42, 0.16, 0.41);
        const wh2 = wh1.clone(); wh2.position.z = -0.41;
        const wh3 = wh1.clone(); wh3.position.x = -0.42;
        const wh4 = wh2.clone(); wh4.position.x = -0.42;
        vehicle.add(wh1, wh2, wh3, wh4);
    }

    const hlL = new THREE.Mesh(window.boxGeo, window.matGlowPool); hlL.scale.set(0.04, 0.09, 0.14);
    hlL.position.set(direction > 0 ? 0.71 : -0.71, 0.34, 0.26);
    if(profile === 'truck') hlL.position.x = direction > 0 ? 1.16 : -1.16;
    const hlR = hlL.clone(); hlR.position.z = -0.24;
    vehicle.add(hlL, hlR);

    if (window.maxRowReached >= 40) {
        const rayCone = new THREE.Mesh(window.boxGeo, window.matHeadlightCone);
        rayCone.scale.set(2.4, 0.02, 0.65);
        rayCone.position.set(direction > 0 ? hlL.position.x + 1.2 : hlL.position.x - 1.2, 0.32, 0);
        vehicle.add(rayCone);
    }

    const brakeL = new THREE.Mesh(window.boxGeo, window.matSignalTail); brakeL.scale.set(0.04, 0.08, 0.14);
    brakeL.position.set(direction > 0 ? -0.71 : 0.71, 0.34, 0.26);
    if(profile === 'truck') brakeL.position.x = direction > 0 ? -1.16 : 1.16;
    const brakeR = brakeL.clone(); brakeR.position.z = -0.26;
    vehicle.add(brakeL, brakeR);

    return vehicle;
};

window.updatePooledVehicleProperties = function(carGroup, profile, direction) {
    for(let i = carGroup.children.length - 1; i >= 0; i--) {
        carGroup.remove(carGroup.children[i]);
    }
    const freshStructure = window.createHighDetailVehicle(profile, direction);
    while(freshStructure.children.length > 0) {
        carGroup.add(freshStructure.children[0]);
    }
};

window.spawnCarEntity = function(lane, z) {
    let carGroup;
    if(window.vehiclePool.length > 0) {
        carGroup = window.vehiclePool.pop();
        window.updatePooledVehicleProperties(carGroup, lane.vehicleProfile, lane.speed);
        carGroup.visible = true;
    } else {
        carGroup = window.createHighDetailVehicle(lane.vehicleProfile, lane.speed);
    }
    carGroup.position.set(lane.speed > 0 ? window.playerMesh.position.x - 16 : window.playerMesh.position.x + 16, 0, z);
    if(!carGroup.parent) window.scene.add(carGroup); 
    lane.vehicles.push(carGroup);
};

window.spawnLogEntity = function(lane, z) {
    let logGroup;
    if(window.logPool.length > 0) {
        logGroup = window.logPool.pop();
        logGroup.visible = true;
    } else {
        logGroup = new THREE.Mesh(window.boxGeo, window.matLog);
        logGroup.scale.set(2.5, 0.28, 0.76); 
        logGroup.receiveShadow = true;
    }
    logGroup.position.set(lane.speed > 0 ? window.playerMesh.position.x - 16 : window.playerMesh.position.x + 16, -0.08, z); 
    if(!logGroup.parent) window.scene.add(logGroup); 
    lane.logs.push(logGroup);
};

window.createTrainStructure = function(lane) {
    const trainAssembly = new THREE.Group();
    const direction = lane.speed > 0 ? 1 : -1;
    const carLength = 4.5;
    const gap = 0.25;
    const totalCars = 3;

    for(let c = 0; c < totalCars; c++) {
        const segment = new THREE.Group();
        const isEngine = (c === 0);
        
        const baseBox = new THREE.Mesh(window.boxGeo, isEngine ? window.matEnginePool : window.matCoachPool);
        baseBox.scale.set(carLength, 1.3, 0.84); baseBox.position.y = 0.65; baseBox.castShadow = true;
        segment.add(baseBox);

        const undercarriage = new THREE.Mesh(window.boxGeo, window.matIronDark);
        undercarriage.scale.set(carLength - 0.4, 0.15, 0.78); undercarriage.position.y = 0.07;
        segment.add(undercarriage);

        if (isEngine) {
            const windshield = new THREE.Mesh(window.boxGeo, window.matWinFrontPool);
            windshield.scale.set(0.08, 0.45, 0.74); 
            windshield.position.set(direction > 0 ? (carLength/2 + 0.01) : -(carLength/2 + 0.01), 0.85, 0); 
            segment.add(windshield);

            const grill = new THREE.Mesh(window.boxGeo, window.matIronDark);
            grill.scale.set(0.1, 0.3, 0.6);
            grill.position.set(direction > 0 ? (carLength/2 - 0.4) : -(carLength/2 - 0.4), 0.25, 0);
            segment.add(grill);
        }

        for(let w = -1.5; w <= 1.5; w += 1.0) {
            if(!isEngine || Math.abs(w) < 1.0) {
                const winL = new THREE.Mesh(window.boxGeo, window.matWinPool);
                winL.scale.set(0.5, 0.26, 0.02);
                winL.position.set(w, 0.82, 0.422);
                const winR = winL.clone(); winR.position.z = -0.422;
                segment.add(winL, winR);
            }
        }

        const offsetDistance = c * (carLength + gap);
        segment.position.x = direction > 0 ? -offsetDistance : offsetDistance;
        trainAssembly.add(segment);
    }
    return trainAssembly;
};

window.spawnTrainEntity = function(lane, z) {
    let trainAssembly;
    if(window.trainPool.length > 0) {
        trainAssembly = window.trainPool.pop();
        for(let i = trainAssembly.children.length - 1; i >= 0; i--) {
            trainAssembly.remove(trainAssembly.children[i]);
        }
        const replacementTrain = window.createTrainStructure(lane);
        while(replacementTrain.children.length > 0) {
            trainAssembly.add(replacementTrain.children[0]);
        }
        trainAssembly.visible = true;
    } else {
        trainAssembly = window.createTrainStructure(lane);
    }
    
    trainAssembly.position.set(lane.speed > 0 ? window.playerMesh.position.x - 24 : window.playerMesh.position.x + 24, 0, z); 
    if(!trainAssembly.parent) window.scene.add(trainAssembly); 
    lane.trains.push(trainAssembly);
};

window.spawnEnvCubeParticles = function(x, y, z, colorCode, count) {
    window.matParticleBase.color.setHex(colorCode);
    for (let i = 0; i < count; i++) {
        const pMesh = new THREE.Mesh(window.boxGeo, window.matParticleBase.clone());
        pMesh.scale.set(0.06 + Math.random()*0.09, 0.06 + Math.random()*0.09, 0.06 + Math.random()*0.09);
        pMesh.position.set(x, y, z); window.scene.add(pMesh);
        window.particles.push({
            mesh: pMesh, vx: (Math.random() - 0.5) * 0.18, vy: 0.09 + Math.random() * 0.16, vz: (Math.random() - 0.5) * 0.18,
            life: 1.0, decay: 0.032 + Math.random()*0.034
        });
    }
};
