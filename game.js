let scene, camera, renderer, sunLight, hemiLight;
const container = document.getElementById('gameContainer');
const canvas = document.getElementById('threeCanvas');

const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');
const scoreDisplay = document.getElementById('scoreDisplay');
const highScoreLabel = document.getElementById('highScoreLabel');
const comboBadge = document.getElementById('comboBadge');
const finalStats = document.getElementById('finalStats');
const newRecordBadge = document.getElementById('newRecordBadge');
const skinContainer = document.getElementById('skinContainer');

let gameState = 'START';
let maxRowReached = 0;
let lanes = {};
let particles = [];
let clock = new THREE.Clock();

let inputBuffer = null; 
let globalHighScore = parseInt(localStorage.getItem('iso_hop_perfect_highscore')) || 0;
let cumulativeSteps = parseInt(localStorage.getItem('iso_hop_cumulative_steps')) || 0;
let selectedSkin = localStorage.getItem('iso_hop_selected_skin') || 'chicken';

// DETERMINISTIC ENGINE FIXED ACCUMULATOR PARAMETERS
let physicsAccumulator = 0;
const FIXED_PHYSICS_STEP = 1 / 60; // 60 updates per single clock second

// Player configurations
let playerMesh, chickenCoreGroup;
let playerParts = {}; 
let shatteredParts = []; 
let isShattered = false;
let playerGridX = window.START_COL;
let playerGridZ = 0;
let startPlayerX = 0, startPlayerZ = 0;
let targetPlayerX = 0, targetPlayerZ = 0;
let isJumping = false;
let jumpProgress = 0;
let squishX = 1, squishY = 1, squishZ = 1;
let currentMoveDX = 0, currentMoveDZ = 0;

// Dynamic Modulated Camera Shaking Parameters
let cameraShakeIntensity = 0;

// Combo & Streak Tracking Configurations
let lastForwardHopTime = 0;
let forwardComboCount = 0;
let currentComboMultiplier = 1;

// Polish Addition: Trailing mesh pool variables to process high speed motion blur shadows
let ghostTrailObjects = [];

// Skin Variant Definitions & Local Storage Locks - Restored Unicode Emojis
const SKINS = [
    { id: 'chicken', name: 'Chicken', icon: '🐔', cost: 0 },
    { id: 'cyber', name: 'Cyber', icon: '🤖', cost: 250 },
    { id: 'frog', name: 'Frog', icon: '🐸', cost: 750 },
    { id: 'golden', name: 'Gold', icon: '🏆', cost: 1500 }
];

// GC Optimization Cache Objects
const cacheSkyColor = new THREE.Color();
const cacheFogColor = new THREE.Color();
const cacheGroundColor = new THREE.Color();
const lerpColor1 = new THREE.Color();
const lerpColor2 = new THREE.Color();

function populateSkinSelector() {
    if (!skinContainer) return;
    skinContainer.innerHTML = '';
    SKINS.forEach(skin => {
        const isLocked = cumulativeSteps < skin.cost;
        const card = document.createElement('div');
        card.className = `skin-card ${selectedSkin === skin.id ? 'selected' : ''} ${isLocked ? 'locked' : ''}`;
        
        card.innerHTML = `
            <div class="skin-icon">${skin.icon}</div>
            <div class="skin-name">${skin.name}</div>
        `;

        if (isLocked) {
            const lockHint = document.createElement('div');
            lockHint.className = 'skin-lock-hint';
            lockHint.innerText = `🔒 ${skin.cost} steps`;
            card.appendChild(lockHint);
        } else {
            card.addEventListener('click', () => {
                document.querySelectorAll('.skin-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                selectedSkin = skin.id;
                localStorage.setItem('iso_hop_selected_skin', selectedSkin);
                rebuildPlayerSkin();
            });
        }
        skinContainer.appendChild(card);
    });
}

function initEngine() {
    if (highScoreLabel) highScoreLabel.innerText = `BEST: ${String(globalHighScore).padStart(2, '0')}`;
    populateSkinSelector();

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xbce3fc);
    scene.fog = new THREE.FogExp2(0xbce3fc, 0.012);

    // Bind properties onto window footprint so other modules access cleanly once instantiated
    window.scene = scene;
    window.lanes = lanes;
    window.particles = particles;
    window.maxRowReached = maxRowReached;
    window.playerMesh = playerMesh;
    window.playerGridX = playerGridX;
    window.playerGridZ = playerGridZ;
    window.currentComboMultiplier = currentComboMultiplier;

    const aspect = container ? container.clientWidth / container.clientHeight : window.innerWidth / window.innerHeight;
    const d = 6.0;
    camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 0.1, 1000);
    camera.position.set(9, 10, 9);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, powerPreference: "high-performance" });
    if (container) renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    hemiLight = new THREE.HemisphereLight(0xe0f2ff, 0x96877b, 0.75);
    scene.add(hemiLight);

    sunLight = new THREE.DirectionalLight(0xfffaee, 0.8);
    sunLight.position.set(14, 22, 10);
    sunLight.castShadow = true;
    sunLight.shadow.camera.left = -20;
    sunLight.shadow.camera.right = 20;
    sunLight.shadow.camera.top = 20;
    sunLight.shadow.camera.bottom = -20;
    sunLight.shadow.mapSize.width = 1024; 
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    buildPlayer();
    setupInputSystems();

    preWarmShaderCache();

    window.addEventListener('resize', onResize);
    clock.getDelta();
    animate();
}

function preWarmShaderCache() {
    const hiddenWarmupGroup = new THREE.Group();
    hiddenWarmupGroup.position.set(0, -500, 0); 

    const testTruck = window.createHighDetailVehicle('truck', 1);
    const testSedan = window.createHighDetailVehicle('sedan', -1);
    const dummyLane = { speed: 7.5 };
    const testTrain = window.createTrainStructure(dummyLane);
    
    const testLog = new THREE.Mesh(window.boxGeo, window.matLog);
    const testTreeLeaf1 = new THREE.Mesh(window.boxGeo, window.matTreeLeaves);
    const testTreeLeaf2 = new THREE.Mesh(window.boxGeo, window.matTreeLeavesLight);
    const testWater1 = new THREE.Mesh(window.boxGeo, window.matWater);
    const testWater2 = new THREE.Mesh(window.boxGeo, window.matWaterDark);

    hiddenWarmupGroup.add(testTruck, testSedan, testTrain, testLog, testTreeLeaf1, testTreeLeaf2, testWater1, testWater2);
    scene.add(hiddenWarmupGroup);

    renderer.render(scene, camera);
    scene.remove(hiddenWarmupGroup);
}

function buildPlayer() {
    playerMesh = new THREE.Group();
    window.playerMesh = playerMesh;
    chickenCoreGroup = new THREE.Group();

    playerParts.body = new THREE.Mesh(window.boxGeo, null);
    playerParts.body.scale.set(0.6, 0.68, 0.6); playerParts.body.position.y = 0.34; 
    playerParts.body.castShadow = true; playerParts.body.receiveShadow = true;
    chickenCoreGroup.add(playerParts.body);

    playerParts.beak = new THREE.Mesh(window.boxGeo, null);
    playerParts.beak.scale.set(0.18, 0.12, 0.15); playerParts.beak.position.set(0, 0.46, 0.36);
    chickenCoreGroup.add(playerParts.beak);

    playerParts.comb = new THREE.Mesh(window.boxGeo, null);
    playerParts.comb.scale.set(0.14, 0.18, 0.28); playerParts.comb.position.set(0, 0.74, 0.04);
    chickenCoreGroup.add(playerParts.comb);

    playerParts.eyeL = new THREE.Mesh(window.boxGeo, new THREE.MeshBasicMaterial({ color: 0x111111 })); 
    playerParts.eyeL.scale.set(0.06, 0.08, 0.08); playerParts.eyeL.position.set(0.31, 0.5, 0.16);
    playerParts.eyeR = playerParts.eyeL.clone(); playerParts.eyeR.position.x = -0.31;
    chickenCoreGroup.add(playerParts.eyeL, playerParts.eyeR);

    playerParts.wingL = new THREE.Mesh(window.boxGeo, null); 
    playerParts.wingL.scale.set(0.08, 0.3, 0.36); playerParts.wingL.position.set(0.34, 0.32, -0.04);
    playerParts.wingR = new THREE.Mesh(window.boxGeo, null);
    playerParts.wingR.scale.set(0.08, 0.3, 0.36); playerParts.wingR.position.set(-0.34, 0.32, -0.04);
    chickenCoreGroup.add(playerParts.wingL, playerParts.wingR);

    rebuildPlayerSkin();

    playerMesh.add(chickenCoreGroup);
    scene.add(playerMesh);
}

function rebuildPlayerSkin() {
    if (!playerParts.body) return;

    let bodyMat, beakMat, combMat, eyeMat;

    if (selectedSkin === 'cyber') {
        bodyMat = new THREE.MeshStandardMaterial({ color: 0x1a1a24, roughness: 0.2, metalness: 0.5, emissive: 0x00f3ff, emissiveIntensity: 0.4, flatShading: true });
        beakMat = new THREE.MeshBasicMaterial({ color: 0xff0055 });
        combMat = new THREE.MeshStandardMaterial({ color: 0x00f3ff, emissive: 0x00f3ff, emissiveIntensity: 0.8 });
        eyeMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff });
    } else if (selectedSkin === 'frog') {
        bodyMat = new THREE.MeshStandardMaterial({ color: 0x5cb83b, roughness: 0.5, flatShading: true });
        beakMat = new THREE.MeshStandardMaterial({ color: 0xffe600, roughness: 0.5, flatShading: true });
        combMat = new THREE.MeshStandardMaterial({ color: 0x3d8225, roughness: 0.5, flatShading: true });
        eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    } else if (selectedSkin === 'golden') {
        bodyMat = new THREE.MeshStandardMaterial({ color: 0xffcc00, roughness: 0.1, metalness: 0.9, flatShading: true });
        beakMat = new THREE.MeshStandardMaterial({ color: 0xff8800, roughness: 0.1, metalness: 0.8, flatShading: true });
        combMat = new THREE.MeshStandardMaterial({ color: 0xdd2222, roughness: 0.2, metalness: 0.4, flatShading: true });
        eyeMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    } else {
        bodyMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6, flatShading: true });
        beakMat = new THREE.MeshStandardMaterial({ color: 0xffa500, roughness: 0.6, flatShading: true });
        combMat = new THREE.MeshStandardMaterial({ color: 0xdd2222, roughness: 0.6, flatShading: true });
        eyeMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    }

    playerParts.body.material = bodyMat;
    playerParts.wingL.material = bodyMat;
    playerParts.wingR.material = bodyMat;
    playerParts.beak.material = beakMat;
    playerParts.comb.material = combMat;
    playerParts.eyeL.material = eyeMat;
    playerParts.eyeR.material = eyeMat;
}

function setupInputSystems() {
    if (!container) return;
    container.addEventListener('touchstart', (e) => {
        if (gameState !== 'PLAYING' || isShattered) return;
        e.preventDefault();

        const rect = container.getBoundingClientRect();
        const touchX = e.touches[0].clientX - rect.left;
        const touchY = e.touches[0].clientY - rect.top;
        const width = container.clientWidth;
        const height = container.clientHeight;

        if (touchY < height * 0.33) {
            queueMove(0, 1);   
        } else if (touchY > height * 0.67) {
            queueMove(0, -1);  
        } else {
            if (touchX < width * 0.5) {
                queueMove(1, 0);   
            } else {
                queueMove(-1, 0);  
            }
        }
    }, { passive: false });

    window.addEventListener('keydown', (e) => {
        if (gameState !== 'PLAYING' || isShattered) return;
        if (e.key === 'ArrowUp' || e.key === ' ' || e.key.toLowerCase() === 'w') queueMove(0, 1);
        if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') queueMove(1, 0);
        if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') queueMove(-1, 0);
        if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') queueMove(0, -1);
    });
}

function queueMove(dx, dz) {
    if (gameState !== 'PLAYING' || isShattered) return;
    
    /* EXPERIMENTAL KINEMATICS: Trigger anticipatory squish-flatten frame right on keystroke down */
    squishX = 1.35; squishY = 0.45; squishZ = 1.35;
    if (chickenCoreGroup) chickenCoreGroup.scale.set(squishX, squishY, squishZ);

    inputBuffer = { dx, dz };
    if (!isJumping) processInputQueue();
}

function processInputQueue() {
    if (!inputBuffer) return;
    
    const { dx, dz } = inputBuffer;
    inputBuffer = null; 

    const nextX = playerGridX + dx;
    const nextZ = playerGridZ + dz;

    if (nextX < 0 || nextX >= window.COLS || nextZ < 0) return;

    updateActiveViewportLanes(nextZ);
    
    const targetLane = lanes[nextZ];
    if (targetLane && targetLane.obstacles) {
        if (targetLane.obstacles[nextX] === true) return;
    }

    window.playerGridX = playerGridX = nextX; 
    window.playerGridZ = playerGridZ = nextZ;

    currentMoveDX = dx;
    currentMoveDZ = dz;

    startPlayerX = playerMesh.position.x;
    startPlayerZ = playerMesh.position.z;
    targetPlayerX = (playerGridX - window.START_COL); 
    targetPlayerZ = playerGridZ;
    
    if (chickenCoreGroup) {
        if (dx !== 0) {
            chickenCoreGroup.rotation.y = dx > 0 ? Math.PI / 2 : -Math.PI / 2;
        } else if (dz !== 0) {
            chickenCoreGroup.rotation.y = dz > 0 ? 0 : Math.PI;
        }
    }

    if (dz > 0) {
        const now = performance.now();
        const diff = (now - lastForwardHopTime) / 1000;
        lastForwardHopTime = now;

        if (diff < 0.38) {
            forwardComboCount++;
            window.currentComboMultiplier = currentComboMultiplier = Math.min(Math.floor(forwardComboCount / 2) + 1, 5);
        } else {
            forwardComboCount = 1;
            window.currentComboMultiplier = currentComboMultiplier = 1;
        }

        if (comboBadge) {
            if (currentComboMultiplier > 1) {
                comboBadge.innerText = `COMBO X${currentComboMultiplier}`;
                comboBadge.classList.add('active');
            } else {
                comboBadge.classList.remove('active');
            }
        }
    } else if (dz < 0 || dx !== 0) {
        forwardComboCount = 0;
        window.currentComboMultiplier = currentComboMultiplier = 1;
        if (comboBadge) comboBadge.classList.remove('active');
    }

    cumulativeSteps++;
    localStorage.setItem('iso_hop_cumulative_steps', cumulativeSteps);

    isJumping = true; 
    jumpProgress = 0;
    
    let intensityFactor = 1.0 + (currentComboMultiplier - 1) * 0.05;
    squishX = 0.82 / intensityFactor; squishY = 1.22 * intensityFactor; squishZ = 0.82 / intensityFactor;
    
    window.playSynthSound('jump');

    /* POLISH ADDITION: Generate ghost blur footprint shadows if running on maximum streak rates */
    if (currentComboMultiplier >= 3) {
        spawnGhostTrailEcho();
    }
}

// Polish Addition: Generate short-lived transparent mesh clones matching the active skin
function spawnGhostTrailEcho() {
    if (!playerParts.body || !playerMesh) return;
    const trailGroup = new THREE.Group();
    trailGroup.position.copy(playerMesh.position);
    trailGroup.rotation.copy(playerMesh.rotation);
    
    const ghostMat = new THREE.MeshBasicMaterial({
        color: selectedSkin === 'cyber' ? 0x00f3ff : (selectedSkin === 'golden' ? 0xffcc00 : 0xffffff),
        transparent: true,
        opacity: 0.45
    });

    const ghostBody = new THREE.Mesh(window.boxGeo, ghostMat);
    ghostBody.scale.copy(playerParts.body.scale);
    ghostBody.position.copy(playerParts.body.position);
    trailGroup.add(ghostBody);

    scene.add(trailGroup);
    ghostTrailObjects.push({ mesh: trailGroup, life: 1.0 });
}

function updateActiveViewportLanes(centerZ) {
    const minZ = Math.max(0, centerZ - 8);
    const maxZ = centerZ + 18;

    for (let z = minZ; z <= maxZ; z++) {
        if (!lanes[z]) {
            window.generateLane(z);
        } else if (lanes[z].type === 'grass') {
            // Broad procedural lookahead sweep prevents invisible walls during lateral traversal
            window.ensureObstaclesGeneratedForRange(lanes[z], z, playerGridX - 150, playerGridX + 150);
        }
    }

    Object.keys(lanes).forEach(laneKey => {
        const z = parseInt(laneKey);
        if (z < minZ || z > maxZ) {
            const lane = lanes[z];
            
            // REUSE SYSTEM CHECKOUT: Push children objects from lane visualGroups back into pool safely rather than removing them
            if (lane.visualGroup && lane.visualGroup.children) {
                for (let i = lane.visualGroup.children.length - 1; i >= 0; i--) {
                    const obj = lane.visualGroup.children[i];
                    if (obj.name && window.obstacleMeshPool[obj.name]) {
                        obj.visible = false;
                        window.obstacleMeshPool[obj.name].push(obj);
                        lane.visualGroup.remove(obj);
                    }
                }
            }

            if (lane.mesh) scene.remove(lane.mesh);
            if (lane.vehicles) {
                lane.vehicles.forEach(v => { v.visible = false; window.vehiclePool.push(v); });
            }
            if (lane.logs) {
                lane.logs.forEach(l => { l.visible = false; window.logPool.push(l); });
            }
            if (lane.trains) {
                lane.trains.forEach(t => { t.visible = false; window.trainPool.push(t); });
            }
            if (lane.visualGroup) scene.remove(lane.visualGroup);
            if (lane.markingGroup) scene.remove(lane.markingGroup);
            if (lane.foamGroup) scene.remove(lane.foamGroup);
            if (lane.signalPost) scene.remove(lane.signalPost);
            if (lane.signalLight) scene.remove(lane.signalLight);
            if (lane.gateArm) scene.remove(lane.gateArm);
            delete lanes[z];
        }
    });
}

// Systemic Improvement: Central Physics Tick decoupled completely from variable layout frame lag
function updateFixedPhysicsStep(fixedDelta) {
    const timeTotal = clock.getElapsedTime();
    const speedModifier = fixedDelta * 60;

    if (isJumping && playerMesh) {
        jumpProgress += 0.15 * speedModifier; 
        if (jumpProgress >= 1.0) {
            isJumping = false;
            playerMesh.position.set(targetPlayerX, 0, targetPlayerZ);
            squishX = 1.35; squishY = 0.65; squishZ = 1.35;
            
            if (navigator.vibrate) navigator.vibrate(15);
            
            const laneType = lanes[playerGridZ]?.type || 'grass';
            if(laneType !== 'river') {
                let particleColor = currentComboMultiplier > 1 ? 0xffcc00 : (selectedSkin === 'frog' ? 0x76e043 : (selectedSkin === 'cyber' ? 0x00f3ff : (laneType === 'grass' ? 0x54ab46 : 0x50545e)));
                window.spawnEnvCubeParticles(playerMesh.position.x, 0.05, playerMesh.position.z, particleColor, 5 + currentComboMultiplier);
            }
            
            if (chickenCoreGroup) {
                chickenCoreGroup.rotation.x = 0;
                chickenCoreGroup.rotation.z = 0;
            }
            
            processInputQueue();
        } else {
            playerMesh.position.x = startPlayerX + (targetPlayerX - startPlayerX) * jumpProgress;
            playerMesh.position.z = startPlayerZ + (targetPlayerZ - startPlayerZ) * jumpProgress;
            playerMesh.position.y = Math.sin(jumpProgress * Math.PI) * 0.54;
            
            if (chickenCoreGroup) {
                if (currentMoveDZ > 0) {
                    chickenCoreGroup.rotation.x = -Math.sin(jumpProgress * Math.PI) * 0.16;
                } else if (currentMoveDZ < 0) {
                    chickenCoreGroup.rotation.x = Math.sin(jumpProgress * Math.PI) * 0.16;
                }
                
                if (currentMoveDX > 0) {
                    chickenCoreGroup.rotation.z = Math.sin(jumpProgress * Math.PI) * 0.16;
                } else if (currentMoveDX < 0) {
                    chickenCoreGroup.rotation.z = -Math.sin(jumpProgress * Math.PI) * 0.16;
                }
            }
        }
    } else {
        squishX += (1 - squishX) * 0.22 * speedModifier; 
        squishY += (1 - squishY) * 0.22 * speedModifier; 
        squishZ += (1 - squishZ) * 0.22 * speedModifier;
        processInputQueue();
    }
    if (chickenCoreGroup) chickenCoreGroup.scale.set(squishX, squishY, squishZ);

    if (forwardComboCount > 0 && (performance.now() - lastForwardHopTime) / 1000 > 0.45) {
        forwardComboCount = 0;
        window.currentComboMultiplier = currentComboMultiplier = 1;
        if (comboBadge) comboBadge.classList.remove('active');
    }

    if (playerGridZ > maxRowReached) {
        window.maxRowReached = maxRowReached = playerGridZ;
        if (scoreDisplay) {
            scoreDisplay.innerText = String(maxRowReached).padStart(2, '0');
            let uiScale = 1.2 + (currentComboMultiplier - 1) * 0.08;
            scoreDisplay.style.transform = `scale(${uiScale})`;
            setTimeout(() => { if (scoreDisplay) scoreDisplay.style.transform = 'scale(1)'; }, 100);

            if (maxRowReached > globalHighScore && globalHighScore > 0) {
                scoreDisplay.style.color = '#00ff66';
            } else if (currentComboMultiplier > 1) {
                scoreDisplay.style.color = '#ffcc00';
            } else {
                scoreDisplay.style.color = '#ffffff';
            }
        }
        
        let currentBiome = window.getBiomeType(maxRowReached);
        let indicatorColorStr = currentBiome === 'cyber' ? '#00f3ff' : (currentBiome === 'desert' ? '#ffaa00' : '#4fa642');
        window.spawnFloatingIndicator(`+1`, indicatorColorStr);
        
        window.playSynthSound('score');
        
        if(maxRowReached < 40) {
            cacheSkyColor.setHex(0xbce3fc);
            cacheFogColor.setHex(0xbce3fc);
            cacheGroundColor.setHex(0x96877b);
        } else if(maxRowReached < 90) {
            let factor = (maxRowReached - 40) / 50;
            lerpColor1.setHex(0xbce3fc); lerpColor2.setHex(0xfca15d);
            cacheSkyColor.copy(lerpColor1).lerp(lerpColor2, factor);
            cacheFogColor.copy(cacheSkyColor);
            lerpColor1.setHex(0x96877b); lerpColor2.setHex(0x705244);
            cacheGroundColor.copy(lerpColor1).lerp(lerpColor2, factor);
        } else if(maxRowReached < 140) {
            let factor = (maxRowReached - 90) / 50;
            lerpColor1.setHex(0xfca15d); lerpColor2.setHex(0x231a3a);
            cacheSkyColor.copy(lerpColor1).lerp(lerpColor2, factor);
            cacheFogColor.copy(cacheSkyColor);
            lerpColor1.setHex(0x705244); lerpColor2.setHex(0x2a1d40);
            cacheGroundColor.copy(lerpColor1).lerp(lerpColor2, factor);
        } else {
            cacheSkyColor.setHex(0x0b0813);
            cacheFogColor.setHex(0x0b0813);
            cacheGroundColor.setHex(0x120a1c);
        }
        scene.background = cacheSkyColor;
        if(scene.fog) scene.fog.color = cacheFogColor;
        if (hemiLight) hemiLight.groundColor = cacheGroundColor;
    }

    const minZ = Math.max(0, playerGridZ - 6);
    const maxZ = playerGridZ + 14;
    const currentCenterX = playerMesh ? Math.round(playerMesh.position.x) : 0;

    for (let z = minZ; z <= maxZ; z++) {
        const lane = lanes[z];
        if (!lane) continue;

        if (lane.type === 'road' && lane.vehicles) {
            lane.spawnTimer += speedModifier;
            if (lane.spawnTimer > lane.spawnInterval) { lane.spawnTimer = 0; window.spawnCarEntity(lane, z); }
            for (let i = lane.vehicles.length - 1; i >= 0; i--) {
                const car = lane.vehicles[i]; car.position.x += lane.speed * 0.038 * speedModifier;
                
                if (maxRowReached >= 40) {
                    car.children.forEach(child => {
                        if (child.material === window.matGlowPool) child.material.color.setHex(0xffffff);
                    });
                }

                if (playerMesh && playerGridZ === z && Math.abs(car.position.x - playerMesh.position.x) < 0.95) { 
                    window.playSynthSound('crash_sedan');
                    cameraShakeIntensity = 0.35; 
                    triggerDeath(0xff1133); 
                    return; 
                }
                if (playerMesh && Math.abs(car.position.x - playerMesh.position.x) > 20) {
                    car.visible = false;
                    window.vehiclePool.push(car);
                    lane.vehicles.splice(i, 1);
                }
            }
        } else if (lane.type === 'river' && lane.logs) {
            lane.spawnTimer += speedModifier;
            if (lane.spawnTimer > lane.spawnInterval) { lane.spawnTimer = 0; window.spawnLogEntity(lane, z); }
            let ridingLog = false;
            for (let i = lane.logs.length - 1; i >= 0; i--) {
                const log = lane.logs[i]; log.position.x += lane.speed * 0.024 * speedModifier;
                if (playerMesh && playerGridZ === z && !isJumping && Math.abs(log.position.x - playerMesh.position.x) < 1.35) {
                    ridingLog = true; playerMesh.position.x += lane.speed * 0.024 * speedModifier;
                    window.playerGridX = playerGridX = Math.round(playerMesh.position.x + window.START_COL); targetPlayerX = playerMesh.position.x;
                    if (playerGridX < 0 || playerGridX >= window.COLS) { 
                        window.playSynthSound('splash');
                        cameraShakeIntensity = 0.15;
                        triggerDeath(0x3399ff); 
                        return; 
                    }
                }
                if (playerMesh && Math.abs(log.position.x - playerMesh.position.x) > 20) {
                    log.visible = false;
                    window.logPool.push(log);
                    lane.logs.splice(i, 1);
                }
            }
            
            // Dynamic progressive sinking checks for stepping on standalone lilypads
            if (playerMesh && lane.lilies && playerGridZ === z && !isJumping) {
                lane.lilies.forEach(lily => {
                    if (Math.abs((lily.mesh.position.x) - playerMesh.position.x) < 0.5) {
                        ridingLog = true; 
                        lily.isStepped = true;
                        lily.sinkProgress += fixedDelta * 0.85;
                        lily.mesh.position.y = lily.initialY - (Math.min(lily.sinkProgress, 1.0) * 0.25);
                        if (lily.sinkProgress >= 1.0) {
                            ridingLog = false; 
                        }
                    } else {
                        lily.isStepped = false;
                        if (lily.sinkProgress > 0) {
                            lily.sinkProgress -= fixedDelta * 0.35;
                            lily.mesh.position.y = lily.initialY - (Math.max(lily.sinkProgress, 0) * 0.25);
                        }
                    }
                });
            }
            
            if (playerMesh && lane.foamGroup) {
                lane.foamGroup.children.forEach(element => {
                    element.position.x += lane.speed * 0.024 * speedModifier;
                    if (element.position.x > playerMesh.position.x + 30) element.position.x -= 60;
                    if (element.position.x < playerMesh.position.x - 30) element.position.x += 60;
                });
            }
            
            if (playerMesh && playerGridZ === z && !isJumping && !ridingLog) { 
                window.playSynthSound('splash');
                cameraShakeIntensity = 0.18;
                
                /* POLISH ADDITION: Drop background synth track pitch thresholds down when submerged */
                if (window.updateAmbientFilters) {
                    window.updateAmbientFilters('underwater');
                }

                triggerDeath(0x3399ff); 
                return; 
            }
        } else if (lane.type === 'railway' && lane.trains) {
            if (lane.signalPost && lane.signalLight) {
                lane.signalPost.position.x = currentCenterX + 5;
                lane.signalLight.position.x = currentCenterX + 5;
            }
            if (lane.gateArm) {
                lane.gateArm.position.x = currentCenterX + 4.2;
            }

            if (!lane.activeWarning) {
                lane.trainSpawnCountdown -= speedModifier;
                if (lane.trainSpawnCountdown <= 0) {
                    lane.activeWarning = true; lane.warningTimer = 70; if(lane.signalLight) lane.signalLight.material = window.matSignalRed;
                }
            } else {
                if (lane.warningTimer > 0) {
                    lane.warningTimer -= speedModifier;
                    
                    if (Math.floor(lane.warningTimer) % 15 === 0) {
                        window.playSynthSound('warning');
                    }

                    if(lane.gateArm && lane.gateArm.rotation.z > -Math.PI/2) {
                        lane.gateArm.rotation.z -= 0.03 * speedModifier;
                    }

                    if (Math.floor(lane.warningTimer) % 10 === 0 && lane.signalLight) {
                        lane.signalLight.material = lane.signalLight.material === window.matSignalRed ? window.matSignalOff : window.matSignalRed;
                    }
                    if (lane.warningTimer <= 0) window.spawnTrainEntity(lane, z);
                }
            }
            for (let i = lane.trains.length - 1; i >= 0; i--) {
                const train = lane.trains[i]; train.position.x += lane.speed * 0.068 * speedModifier;
                
                if (playerMesh && playerGridZ === z && Math.abs(train.position.x - playerMesh.position.x) < 5.5) { 
                    window.playSynthSound('crash_train');
                    
                    /* POLISH ADDITION: Multiply impact smash physical vibration vectors on heavy train crash profiles */
                    cameraShakeIntensity = 0.75; 
                    
                    triggerDeath(0xff0044); 
                    return; 
                }
                if (playerMesh && Math.abs(train.position.x - playerMesh.position.x) > 36) {
                    train.visible = false;
                    window.trainPool.push(train);
                    lane.trains.splice(i, 1);
                    let difficultyScalar = 1.0 + Math.min(maxRowReached * 0.004, 0.40);
                    lane.activeWarning = false; lane.trainSpawnCountdown = (180 + Math.random() * 160) / difficultyScalar;
                    if(lane.signalLight) lane.signalLight.material = window.matSignalGreen;
                    if(lane.gateArm) lane.gateArm.rotation.z = 0;
                }
            }
        }
    }

    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.mesh.position.x += p.vx * speedModifier; p.mesh.position.y += p.vy * speedModifier; p.mesh.position.z += p.vz * speedModifier;
        p.vy -= 0.012 * speedModifier; p.life -= p.decay * speedModifier; p.mesh.scale.multiplyScalar(Math.pow(0.92, speedModifier));
        if (p.mesh.material) p.mesh.material.opacity = p.life;
        if (p.life <= 0) { scene.remove(p.mesh); particles.splice(i, 1); }
    }
}

function updateGameLogic(delta) {
    const timeTotal = clock.getElapsedTime();

    // Physics Frame-Lag Isolation Accumulator loop 
    physicsAccumulator += Math.min(delta, 0.1);
    while (physicsAccumulator >= FIXED_PHYSICS_STEP) {
        if (gameState === 'PLAYING' || isShattered) {
            updateFixedPhysicsStep(FIXED_PHYSICS_STEP);
        }
        physicsAccumulator -= FIXED_PHYSICS_STEP;
    }

    // Polish Addition: Safe lifecycle management tracking swaying elements
    if (window.updateEnvironmentAnimations) {
        window.updateEnvironmentAnimations(delta, timeTotal);
    }

    // Polish Addition: Decay loop handling active combo trail shadows
    for (let i = ghostTrailObjects.length - 1; i >= 0; i--) {
        const tr = ghostTrailObjects[i];
        tr.life -= delta * 5.0; // Rapid clean alpha blend fade
        if (tr.life <= 0) {
            scene.remove(tr.mesh);
            ghostTrailObjects.splice(i, 1);
        } else {
            tr.mesh.children.forEach(child => {
                if (child.material) child.material.opacity = tr.life * 0.4;
            });
        }
    }

    // Camera Structural Shake Decay Interpolations
    if (cameraShakeIntensity > 0 && container) {
        cameraShakeIntensity -= delta * 2.5;
        let sx = (Math.random() - 0.5) * cameraShakeIntensity;
        let sy = (Math.random() - 0.5) * cameraShakeIntensity;
        container.style.transform = `translate(${sx * 15}px, ${sy * 15}px)`;
        if (cameraShakeIntensity <= 0) container.style.transform = '';
    }

    if (gameState !== 'PLAYING') return;
    const speedModifier = delta * 60;

    /* GRAPHICS PROGRESSION UPGRADE: Fluid Time-of-Day sun axis angle tracking based on player step milestones */
    if (sunLight && camera) {
        let sunRotationAngle = timeTotal * 0.05 + (maxRowReached * 0.01);
        sunLight.position.x = Math.round(camera.position.x) + Math.cos(sunRotationAngle) * 12 + 5; 
        sunLight.position.z = Math.round(camera.position.z) + Math.sin(sunRotationAngle) * 12;
        sunLight.position.y = 18 + Math.abs(Math.sin(sunRotationAngle)) * 8;
    }

    if (camera && playerMesh) {
        camera.position.x += ((playerMesh.position.x + 8.5) - camera.position.x) * 0.08 * speedModifier;
        camera.position.z += ((playerMesh.position.z + 8.5) - camera.position.z) * 0.08 * speedModifier;
    }

    // Polish Addition: Reset background audio filter parameters to standard profile
    if (window.updateAmbientFilters) {
        window.updateAmbientFilters('normal');
    }
}

function animate() {
    requestAnimationFrame(animate);
    const delta = Math.min(clock.getDelta(), 0.1);
    updateGameLogic(delta);
    if (renderer && scene && camera) renderer.render(scene, camera);
}

function purgeSceneObjects() {
    Object.keys(lanes).forEach(z => {
        const lane = lanes[z]; 
        
        // Return active pooled environmental elements cleanly during world reconstruction
        if (lane.visualGroup && lane.visualGroup.children) {
            for (let i = lane.visualGroup.children.length - 1; i >= 0; i--) {
                const obj = lane.visualGroup.children[i];
                if (obj.name && window.obstacleMeshPool[obj.name]) {
                    obj.visible = false;
                    window.obstacleMeshPool[obj.name].push(obj);
                }
            }
        }

        if (lane.mesh) scene.remove(lane.mesh);
        if (lane.vehicles) {
            lane.vehicles.forEach(v => { v.visible = false; window.vehiclePool.push(v); });
        }
        if (lane.logs) {
            lane.logs.forEach(l => { l.visible = false; window.logPool.push(l); });
        }
        if (lane.trains) {
            lane.trains.forEach(t => { t.visible = false; window.trainPool.push(t); });
        }
        if (lane.visualGroup) scene.remove(lane.visualGroup);
        if (lane.markingGroup) scene.remove(lane.markingGroup);
        if (lane.foamGroup) scene.remove(lane.foamGroup);
        if (lane.signalPost) scene.remove(lane.signalPost);
        if (lane.signalLight) scene.remove(lane.signalLight);
        if (lane.gateArm) scene.remove(lane.gateArm);
    });
    window.lanes = lanes = {}; window.particles = particles = [];
    inputBuffer = null;
}

function startRunCycle() {
    window.initAudio();
    purgeSceneObjects();
    
    if (isShattered) {
        shatteredParts.forEach(p => { scene.remove(p.mesh); });
        shatteredParts = [];
        isShattered = false;
        if (chickenCoreGroup && playerParts.body) {
            chickenCoreGroup.add(playerParts.body, playerParts.beak, playerParts.comb, playerParts.eyeL, playerParts.eyeR, playerParts.wingL, playerParts.wingR);
        }
        if (playerParts.body) { playerParts.body.position.set(0, 0.34, 0); playerParts.body.rotation.set(0,0,0); }
        if (playerParts.beak) { playerParts.beak.position.set(0, 0.46, 0.36); playerParts.beak.rotation.set(0,0,0); }
        if (playerParts.comb) { playerParts.comb.position.set(0, 0.74, 0.04); playerParts.comb.rotation.set(0,0,0); }
        if (playerParts.eyeL) playerParts.eyeL.position.set(0.31, 0.5, 0.16);
        if (playerParts.eyeR) playerParts.eyeR.position.set(-0.31, 0.5, 0.16);
        if (playerParts.wingL) { playerParts.wingL.position.set(0.34, 0.32, -0.04); playerParts.wingL.rotation.set(0,0,0); }
        if (playerParts.wingR) { playerParts.wingR.position.set(-0.34, 0.32, -0.04); playerParts.wingR.rotation.set(0,0,0); }
    }

    window.maxRowReached = maxRowReached = 0; isJumping = false;
    window.playerGridX = playerGridX = window.START_COL; window.playerGridZ = playerGridZ = 0;
    if (playerMesh) playerMesh.position.set(0, 0, 0); 
    if (camera) camera.position.set(9, 10, 9);
    if (chickenCoreGroup) chickenCoreGroup.rotation.set(0, 0, 0);
    squishX = 1; squishY = 1; squishZ = 1;
    cameraShakeIntensity = 0;
    physicsAccumulator = 0;

    forwardComboCount = 0; window.currentComboMultiplier = currentComboMultiplier = 1;
    if (comboBadge) comboBadge.classList.remove('active');

    if (scoreDisplay) {
        scoreDisplay.innerText = "00";
        scoreDisplay.style.color = '#ffffff';
    }
    if (newRecordBadge) newRecordBadge.style.display = 'none';
    if (startScreen) startScreen.classList.add('hidden'); 
    if (gameOverScreen) gameOverScreen.classList.add('hidden');
    
    scene.background = new THREE.Color(0xbce3fc);
    if(scene.fog) scene.fog.color = new THREE.Color(0xbce3fc);
    if (hemiLight) hemiLight.groundColor = new THREE.Color(0x96877b);

    updateActiveViewportLanes(0);

    gameState = 'PLAYING';
    clock.getDelta();
}

function triggerDeath(deathColor) {
    gameState = 'GAMEOVER';
    
    if (playerMesh) {
        window.spawnEnvCubeParticles(playerMesh.position.x, 0.3, playerMesh.position.z, deathColor, 20);
        window.spawnEnvCubeParticles(playerMesh.position.x, 0.4, playerMesh.position.z, 0xffffff, 12);
    }

    isShattered = true;
    const keysToShatter = ['body', 'beak', 'comb', 'wingL', 'wingR'];
    
    keysToShatter.forEach(key => {
        const mesh = playerParts[key];
        if(mesh && chickenCoreGroup) {
            const worldPos = new THREE.Vector3();
            mesh.getWorldPosition(worldPos);
            chickenCoreGroup.remove(mesh);
            mesh.position.copy(worldPos);
            scene.add(mesh);
            
            shatteredParts.push({
                mesh: mesh,
                vx: (Math.random() - 0.5) * 0.25 + (currentMoveDX * 0.05),
                vy: Math.random() * 0.2 + 0.15,
                vz: (Math.random() - 0.5) * 0.25 + (currentMoveDZ * 0.05),
                rx: (Math.random() - 0.5) * 0.3,
                ry: (Math.random() - 0.5) * 0.3
            });
        }
    });

    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

    let isNewBest = false;
    if (maxRowReached > globalHighScore) {
        globalHighScore = maxRowReached;
        localStorage.setItem('iso_hop_perfect_highscore', globalHighScore);
        if (highScoreLabel) highScoreLabel.innerText = `BEST: ${String(globalHighScore).padStart(2, '0')}`;
        isNewBest = true;
    }

    if (newRecordBadge) {
        newRecordBadge.style.display = isNewBest && globalHighScore > 0 ? 'block' : 'none';
    }

    if (finalStats) {
        finalStats.innerText = `Lanes Crossed: ${maxRowReached} | All-Time Best: ${globalHighScore}`;
    }
    
    populateSkinSelector();
    if (gameOverScreen) gameOverScreen.classList.remove('hidden');
}

onResize = () => {
    if (!container || !camera || !renderer) return;
    const aspect = container.clientWidth / container.clientHeight; const d = 6.0;
    camera.left = -d * aspect; camera.right = d * aspect; camera.top = d; camera.bottom = -d;
    camera.updateProjectionMatrix(); renderer.setSize(container.clientWidth, container.clientHeight);
};

if (startButton) startButton.addEventListener('click', startRunCycle);
if (restartButton) restartButton.addEventListener('click', startRunCycle);

initEngine();
