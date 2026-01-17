/**
 * 天堂風格 3D RPG 遊戲原型
 * 使用 Babylon.js 引擎
 */

// ============================================
// 遊戲配置
// ============================================
const CONFIG = {
    // 渲染設定
    render: {
        shadowQuality: 2048,
        enableSSAO: true,
        enableBloom: true,
        enableFXAA: true,
        fogDensity: 0.01
    },
    // 玩家設定
    player: {
        moveSpeed: 0.15,
        rotationSpeed: 0.003,
        jumpForce: 8,
        baseHP: 100,
        baseMP: 50,
        baseAttack: 15,
        baseDefense: 5
    },
    // 怪物設定
    monsters: {
        spawnCount: 8,
        respawnTime: 10000,
        aggroRange: 15,
        attackRange: 2.5,
        attackCooldown: 2000
    },
    // 技能設定
    skills: {
        attack: { damage: 1.0, mpCost: 0, cooldown: 500, range: 3 },
        fireball: { damage: 2.5, mpCost: 15, cooldown: 3000, range: 20 },
        heal: { healing: 30, mpCost: 20, cooldown: 5000, range: 0 },
        lightning: { damage: 1.8, mpCost: 25, cooldown: 4000, range: 15 },
        shield: { duration: 5000, mpCost: 30, cooldown: 15000, range: 0 }
    }
};

// ============================================
// 遊戲狀態
// ============================================
class GameState {
    constructor() {
        this.player = {
            level: 1,
            hp: CONFIG.player.baseHP,
            maxHp: CONFIG.player.baseHP,
            mp: CONFIG.player.baseMP,
            maxMp: CONFIG.player.baseMP,
            exp: 0,
            expToLevel: 100,
            attack: CONFIG.player.baseAttack,
            defense: CONFIG.player.baseDefense,
            shieldActive: false,
            position: new BABYLON.Vector3(0, 1, 0)
        };
        this.target = null;
        this.monsters = [];
        this.skillCooldowns = {};
        this.isAttacking = false;
    }
}

// ============================================
// 主遊戲類別
// ============================================
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.engine = null;
        this.scene = null;
        this.camera = null;
        this.playerMesh = null;
        this.state = new GameState();
        this.keys = {};
        this.monsters = [];
        this.particles = {};
        this.loadingProgress = 0;

        this.init();
    }

    // 初始化遊戲
    async init() {
        this.updateLoadingProgress(10, '初始化引擎...');

        // 建立 Babylon.js 引擎
        this.engine = new BABYLON.Engine(this.canvas, true, {
            preserveDrawingBuffer: true,
            stencil: true,
            antialias: true
        });

        this.updateLoadingProgress(20, '建立場景...');
        await this.createScene();

        this.updateLoadingProgress(40, '載入材質...');
        await this.createMaterials();

        this.updateLoadingProgress(60, '建立角色...');
        this.createPlayer();

        this.updateLoadingProgress(70, '生成怪物...');
        this.spawnMonsters();

        this.updateLoadingProgress(80, '設定光影...');
        this.setupLighting();

        this.updateLoadingProgress(90, '初始化後處理...');
        this.setupPostProcessing();

        this.updateLoadingProgress(95, '綁定事件...');
        this.setupControls();
        this.setupUI();

        this.updateLoadingProgress(100, '完成！');

        // 隱藏載入畫面
        setTimeout(() => {
            document.getElementById('loadingScreen').classList.add('hidden');
        }, 500);

        // 開始遊戲迴圈
        this.engine.runRenderLoop(() => {
            this.update();
            this.scene.render();
        });

        // 視窗大小調整
        window.addEventListener('resize', () => {
            this.engine.resize();
        });
    }

    updateLoadingProgress(percent, text) {
        this.loadingProgress = percent;
        document.getElementById('loadingBar').style.width = percent + '%';
        document.getElementById('loadingText').textContent = text;
    }

    // 建立場景
    async createScene() {
        this.scene = new BABYLON.Scene(this.engine);
        this.scene.clearColor = new BABYLON.Color4(0.1, 0.1, 0.15, 1);

        // 啟用碰撞偵測
        this.scene.collisionsEnabled = true;

        // 霧效
        this.scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
        this.scene.fogDensity = CONFIG.render.fogDensity;
        this.scene.fogColor = new BABYLON.Color3(0.2, 0.25, 0.35);

        // 建立相機
        this.camera = new BABYLON.ArcRotateCamera(
            'camera',
            Math.PI / 2,
            Math.PI / 3,
            15,
            BABYLON.Vector3.Zero(),
            this.scene
        );
        this.camera.attachControl(this.canvas, true);
        this.camera.lowerRadiusLimit = 5;
        this.camera.upperRadiusLimit = 30;
        this.camera.lowerBetaLimit = 0.3;
        this.camera.upperBetaLimit = Math.PI / 2.2;
        this.camera.panningSensibility = 0;

        // 建立地形
        await this.createTerrain();

        // 建立環境物件
        this.createEnvironment();
    }

    // 建立地形
    async createTerrain() {
        // 主要地面
        const ground = BABYLON.MeshBuilder.CreateGround('ground', {
            width: 200,
            height: 200,
            subdivisions: 100
        }, this.scene);

        // 地形高度圖效果 (程序化生成)
        const positions = ground.getVerticesData(BABYLON.VertexBuffer.PositionKind);
        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const z = positions[i + 2];
            // 多層次噪聲
            const height =
                Math.sin(x * 0.05) * Math.cos(z * 0.05) * 2 +
                Math.sin(x * 0.1 + 1) * Math.cos(z * 0.1 + 1) * 1 +
                Math.sin(x * 0.02) * Math.cos(z * 0.02) * 4;
            positions[i + 1] = height;
        }
        ground.updateVerticesData(BABYLON.VertexBuffer.PositionKind, positions);
        ground.convertToFlatShadedMesh();

        // 地面材質
        const groundMaterial = new BABYLON.PBRMaterial('groundMat', this.scene);
        groundMaterial.albedoColor = new BABYLON.Color3(0.15, 0.25, 0.1);
        groundMaterial.metallic = 0;
        groundMaterial.roughness = 0.9;
        groundMaterial.environmentIntensity = 0.3;
        ground.material = groundMaterial;
        ground.checkCollisions = true;
        ground.receiveShadows = true;

        // 水面
        const water = BABYLON.MeshBuilder.CreateGround('water', {
            width: 200,
            height: 200
        }, this.scene);
        water.position.y = -1;

        const waterMaterial = new BABYLON.PBRMaterial('waterMat', this.scene);
        waterMaterial.albedoColor = new BABYLON.Color3(0.1, 0.3, 0.5);
        waterMaterial.metallic = 0.3;
        waterMaterial.roughness = 0.1;
        waterMaterial.alpha = 0.7;
        water.material = waterMaterial;
    }

    // 建立環境物件
    createEnvironment() {
        // 樹木
        for (let i = 0; i < 50; i++) {
            this.createTree(
                (Math.random() - 0.5) * 180,
                (Math.random() - 0.5) * 180
            );
        }

        // 岩石
        for (let i = 0; i < 30; i++) {
            this.createRock(
                (Math.random() - 0.5) * 180,
                (Math.random() - 0.5) * 180
            );
        }

        // 裝飾性建築
        this.createTower(30, 30);
        this.createTower(-30, -30);
        this.createCastle(0, -60);
    }

    // 建立樹木
    createTree(x, z) {
        const trunk = BABYLON.MeshBuilder.CreateCylinder('trunk', {
            height: 4 + Math.random() * 2,
            diameterTop: 0.3,
            diameterBottom: 0.5
        }, this.scene);

        const leaves = BABYLON.MeshBuilder.CreateSphere('leaves', {
            diameter: 3 + Math.random() * 2,
            segments: 8
        }, this.scene);

        trunk.position = new BABYLON.Vector3(x, 2, z);
        leaves.position = new BABYLON.Vector3(x, 5 + Math.random(), z);

        // 材質
        const trunkMat = new BABYLON.PBRMaterial('trunkMat', this.scene);
        trunkMat.albedoColor = new BABYLON.Color3(0.35, 0.2, 0.1);
        trunkMat.roughness = 0.9;
        trunk.material = trunkMat;

        const leavesMat = new BABYLON.PBRMaterial('leavesMat', this.scene);
        leavesMat.albedoColor = new BABYLON.Color3(0.1, 0.4 + Math.random() * 0.2, 0.1);
        leavesMat.roughness = 0.8;
        leaves.material = leavesMat;

        trunk.checkCollisions = true;
        leaves.receiveShadows = true;
        trunk.receiveShadows = true;
    }

    // 建立岩石
    createRock(x, z) {
        const rock = BABYLON.MeshBuilder.CreatePolyhedron('rock', {
            type: Math.floor(Math.random() * 4),
            size: 0.5 + Math.random() * 1.5
        }, this.scene);

        rock.position = new BABYLON.Vector3(x, 0.5, z);
        rock.rotation = new BABYLON.Vector3(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );

        const rockMat = new BABYLON.PBRMaterial('rockMat', this.scene);
        rockMat.albedoColor = new BABYLON.Color3(0.4, 0.4, 0.45);
        rockMat.roughness = 0.95;
        rock.material = rockMat;
        rock.checkCollisions = true;
        rock.receiveShadows = true;
    }

    // 建立塔樓
    createTower(x, z) {
        const base = BABYLON.MeshBuilder.CreateCylinder('towerBase', {
            height: 15,
            diameter: 5,
            tessellation: 8
        }, this.scene);
        base.position = new BABYLON.Vector3(x, 7.5, z);

        const roof = BABYLON.MeshBuilder.CreateCylinder('towerRoof', {
            height: 4,
            diameterTop: 0,
            diameterBottom: 6,
            tessellation: 8
        }, this.scene);
        roof.position = new BABYLON.Vector3(x, 17, z);

        const baseMat = new BABYLON.PBRMaterial('towerBaseMat', this.scene);
        baseMat.albedoColor = new BABYLON.Color3(0.5, 0.45, 0.4);
        baseMat.roughness = 0.85;
        base.material = baseMat;

        const roofMat = new BABYLON.PBRMaterial('towerRoofMat', this.scene);
        roofMat.albedoColor = new BABYLON.Color3(0.3, 0.15, 0.1);
        roofMat.roughness = 0.7;
        roof.material = roofMat;

        base.checkCollisions = true;
        base.receiveShadows = true;
        roof.receiveShadows = true;
    }

    // 建立城堡
    createCastle(x, z) {
        // 主建築
        const main = BABYLON.MeshBuilder.CreateBox('castleMain', {
            width: 20,
            height: 12,
            depth: 15
        }, this.scene);
        main.position = new BABYLON.Vector3(x, 6, z);

        // 城牆
        const wall = BABYLON.MeshBuilder.CreateBox('castleWall', {
            width: 40,
            height: 6,
            depth: 2
        }, this.scene);
        wall.position = new BABYLON.Vector3(x, 3, z + 15);

        const castleMat = new BABYLON.PBRMaterial('castleMat', this.scene);
        castleMat.albedoColor = new BABYLON.Color3(0.55, 0.5, 0.45);
        castleMat.roughness = 0.8;
        main.material = castleMat;
        wall.material = castleMat;

        main.checkCollisions = true;
        wall.checkCollisions = true;
        main.receiveShadows = true;
        wall.receiveShadows = true;

        // 四個角塔
        const towerPositions = [
            [x - 18, z + 15], [x + 18, z + 15],
            [x - 10, z - 7], [x + 10, z - 7]
        ];
        towerPositions.forEach(([tx, tz], i) => {
            this.createTower(tx, tz);
        });
    }

    // 建立材質
    async createMaterials() {
        // 玩家材質
        this.playerMaterial = new BABYLON.PBRMaterial('playerMat', this.scene);
        this.playerMaterial.albedoColor = new BABYLON.Color3(0.2, 0.5, 0.9);
        this.playerMaterial.metallic = 0.3;
        this.playerMaterial.roughness = 0.5;
        this.playerMaterial.emissiveColor = new BABYLON.Color3(0.05, 0.1, 0.2);

        // 怪物材質
        this.monsterMaterial = new BABYLON.PBRMaterial('monsterMat', this.scene);
        this.monsterMaterial.albedoColor = new BABYLON.Color3(0.6, 0.2, 0.2);
        this.monsterMaterial.metallic = 0.1;
        this.monsterMaterial.roughness = 0.7;
        this.monsterMaterial.emissiveColor = new BABYLON.Color3(0.1, 0.02, 0.02);
    }

    // 建立玩家
    createPlayer() {
        // 玩家身體
        const body = BABYLON.MeshBuilder.CreateCapsule('playerBody', {
            height: 1.8,
            radius: 0.4
        }, this.scene);

        // 玩家頭部
        const head = BABYLON.MeshBuilder.CreateSphere('playerHead', {
            diameter: 0.5
        }, this.scene);
        head.position.y = 1.1;
        head.parent = body;

        // 武器 (劍)
        const sword = BABYLON.MeshBuilder.CreateBox('sword', {
            width: 0.1,
            height: 1.2,
            depth: 0.05
        }, this.scene);
        sword.position = new BABYLON.Vector3(0.5, 0.3, 0);
        sword.rotation.z = Math.PI / 6;
        sword.parent = body;

        const swordMat = new BABYLON.PBRMaterial('swordMat', this.scene);
        swordMat.albedoColor = new BABYLON.Color3(0.7, 0.7, 0.8);
        swordMat.metallic = 0.9;
        swordMat.roughness = 0.2;
        sword.material = swordMat;

        body.material = this.playerMaterial;
        head.material = this.playerMaterial;

        body.position = new BABYLON.Vector3(0, 1, 0);
        body.checkCollisions = true;

        this.playerMesh = body;
        this.playerMesh.ellipsoid = new BABYLON.Vector3(0.5, 1, 0.5);

        // 玩家光環
        const glow = BABYLON.MeshBuilder.CreateTorus('playerGlow', {
            diameter: 1.5,
            thickness: 0.1,
            tessellation: 32
        }, this.scene);
        glow.position.y = 0.1;
        glow.parent = body;

        const glowMat = new BABYLON.PBRMaterial('glowMat', this.scene);
        glowMat.albedoColor = new BABYLON.Color3(0.2, 0.5, 1);
        glowMat.emissiveColor = new BABYLON.Color3(0.1, 0.3, 0.8);
        glowMat.alpha = 0.5;
        glow.material = glowMat;
    }

    // 生成怪物
    spawnMonsters() {
        const monsterTypes = [
            { name: '哥布林', hp: 50, attack: 8, exp: 20, color: new BABYLON.Color3(0.4, 0.6, 0.2) },
            { name: '骷髏兵', hp: 70, attack: 12, exp: 35, color: new BABYLON.Color3(0.9, 0.9, 0.85) },
            { name: '惡魔', hp: 100, attack: 18, exp: 50, color: new BABYLON.Color3(0.7, 0.2, 0.3) },
            { name: '石像鬼', hp: 150, attack: 25, exp: 80, color: new BABYLON.Color3(0.4, 0.4, 0.5) }
        ];

        for (let i = 0; i < CONFIG.monsters.spawnCount; i++) {
            const type = monsterTypes[Math.floor(Math.random() * monsterTypes.length)];
            const x = (Math.random() - 0.5) * 80;
            const z = (Math.random() - 0.5) * 80;

            this.createMonster(type, x, z);
        }
    }

    // 建立單個怪物
    createMonster(type, x, z) {
        // 怪物身體
        const body = BABYLON.MeshBuilder.CreateCapsule('monster', {
            height: 1.5,
            radius: 0.5
        }, this.scene);

        // 怪物頭部 (帶角)
        const head = BABYLON.MeshBuilder.CreateSphere('monsterHead', {
            diameter: 0.6
        }, this.scene);
        head.position.y = 0.9;
        head.parent = body;

        // 角
        const horn1 = BABYLON.MeshBuilder.CreateCylinder('horn1', {
            height: 0.4,
            diameterTop: 0,
            diameterBottom: 0.15
        }, this.scene);
        horn1.position = new BABYLON.Vector3(-0.2, 1.2, 0);
        horn1.rotation.z = -0.3;
        horn1.parent = body;

        const horn2 = horn1.clone('horn2');
        horn2.position.x = 0.2;
        horn2.rotation.z = 0.3;
        horn2.parent = body;

        // 材質
        const mat = new BABYLON.PBRMaterial('monsterMat_' + this.monsters.length, this.scene);
        mat.albedoColor = type.color;
        mat.metallic = 0.1;
        mat.roughness = 0.7;
        mat.emissiveColor = type.color.scale(0.1);

        body.material = mat;
        head.material = mat;
        horn1.material = mat;
        horn2.material = mat;

        body.position = new BABYLON.Vector3(x, 1, z);
        body.checkCollisions = true;

        // 怪物血條
        const healthBar = this.createHealthBar(body);

        // 怪物數據
        const monster = {
            mesh: body,
            healthBar: healthBar,
            type: type.name,
            hp: type.hp,
            maxHp: type.hp,
            attack: type.attack,
            exp: type.exp,
            spawnPosition: new BABYLON.Vector3(x, 1, z),
            state: 'idle',
            lastAttackTime: 0,
            aggroTarget: null
        };

        this.monsters.push(monster);
        return monster;
    }

    // 建立血條
    createHealthBar(parent) {
        const plane = BABYLON.MeshBuilder.CreatePlane('healthBar', {
            width: 1.2,
            height: 0.15
        }, this.scene);
        plane.position.y = 2.2;
        plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
        plane.parent = parent;

        const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(plane);

        const container = new BABYLON.GUI.Rectangle();
        container.width = '100%';
        container.height = '100%';
        container.cornerRadius = 5;
        container.color = 'white';
        container.thickness = 2;
        container.background = 'rgba(0,0,0,0.5)';
        advancedTexture.addControl(container);

        const healthFill = new BABYLON.GUI.Rectangle();
        healthFill.width = '100%';
        healthFill.height = '100%';
        healthFill.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        healthFill.background = 'red';
        healthFill.cornerRadius = 3;
        container.addControl(healthFill);

        return { plane, fill: healthFill };
    }

    // 設定光照
    setupLighting() {
        // 環境光
        const ambient = new BABYLON.HemisphericLight(
            'ambient',
            new BABYLON.Vector3(0, 1, 0),
            this.scene
        );
        ambient.intensity = 0.4;
        ambient.diffuse = new BABYLON.Color3(0.6, 0.7, 0.9);
        ambient.groundColor = new BABYLON.Color3(0.2, 0.15, 0.1);

        // 主光源 (太陽)
        const sun = new BABYLON.DirectionalLight(
            'sun',
            new BABYLON.Vector3(-1, -2, -1),
            this.scene
        );
        sun.intensity = 1.2;
        sun.diffuse = new BABYLON.Color3(1, 0.95, 0.8);

        // 陰影
        const shadowGenerator = new BABYLON.ShadowGenerator(CONFIG.render.shadowQuality, sun);
        shadowGenerator.useBlurExponentialShadowMap = true;
        shadowGenerator.blurKernel = 32;
        shadowGenerator.setDarkness(0.3);

        // 加入玩家到陰影
        if (this.playerMesh) {
            shadowGenerator.addShadowCaster(this.playerMesh);
        }

        // 加入怪物到陰影
        this.monsters.forEach(m => {
            shadowGenerator.addShadowCaster(m.mesh);
        });

        this.shadowGenerator = shadowGenerator;

        // 點光源 (火把效果)
        const torch1 = new BABYLON.PointLight('torch1', new BABYLON.Vector3(30, 8, 30), this.scene);
        torch1.intensity = 0.8;
        torch1.diffuse = new BABYLON.Color3(1, 0.7, 0.3);
        torch1.range = 30;

        const torch2 = new BABYLON.PointLight('torch2', new BABYLON.Vector3(-30, 8, -30), this.scene);
        torch2.intensity = 0.8;
        torch2.diffuse = new BABYLON.Color3(1, 0.7, 0.3);
        torch2.range = 30;

        // 環境貼圖 (用於 PBR 反射)
        this.scene.environmentTexture = BABYLON.CubeTexture.CreateFromPrefilteredData(
            'https://playground.babylonjs.com/textures/environment.env',
            this.scene
        );
    }

    // 設定後處理效果
    setupPostProcessing() {
        const pipeline = new BABYLON.DefaultRenderingPipeline(
            'defaultPipeline',
            true,
            this.scene,
            [this.camera]
        );

        // 泛光效果
        if (CONFIG.render.enableBloom) {
            pipeline.bloomEnabled = true;
            pipeline.bloomThreshold = 0.7;
            pipeline.bloomWeight = 0.5;
            pipeline.bloomKernel = 64;
            pipeline.bloomScale = 0.5;
        }

        // FXAA 抗鋸齒
        if (CONFIG.render.enableFXAA) {
            pipeline.fxaaEnabled = true;
        }

        // 色調映射
        pipeline.imageProcessingEnabled = true;
        pipeline.imageProcessing.toneMappingEnabled = true;
        pipeline.imageProcessing.toneMappingType = BABYLON.ImageProcessingConfiguration.TONEMAPPING_ACES;
        pipeline.imageProcessing.contrast = 1.2;
        pipeline.imageProcessing.exposure = 1.1;

        // 景深 (可選)
        // pipeline.depthOfFieldEnabled = true;
        // pipeline.depthOfFieldBlurLevel = BABYLON.DepthOfFieldEffectBlurLevel.Medium;

        // 色差
        pipeline.chromaticAberrationEnabled = true;
        pipeline.chromaticAberration.aberrationAmount = 15;

        // 暈影
        pipeline.vignetteEnabled = true;
        pipeline.vignetteWeight = 1.5;
        pipeline.vignetteColor = new BABYLON.Color4(0, 0, 0, 0);
        pipeline.vignetteBlendMode = BABYLON.ImageProcessingConfiguration.VIGNETTEMODE_MULTIPLY;
    }

    // 設定控制
    setupControls() {
        // 鍵盤事件
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;

            // 技能快捷鍵
            if (e.key >= '1' && e.key <= '5') {
                const skills = ['attack', 'fireball', 'heal', 'lightning', 'shield'];
                this.useSkill(skills[parseInt(e.key) - 1]);
            }

            // 跳躍
            if (e.key === ' ') {
                this.jump();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });

        // 滑鼠點擊 (選取目標/攻擊)
        this.canvas.addEventListener('click', (e) => {
            this.handleClick(e);
        });

        // 技能欄點擊
        document.querySelectorAll('.skill-slot').forEach(slot => {
            slot.addEventListener('click', () => {
                const skill = slot.dataset.skill;
                this.useSkill(skill);
            });
        });

        // 鎖定滑鼠指標
        this.canvas.addEventListener('click', () => {
            // this.canvas.requestPointerLock();
        });
    }

    // 處理點擊
    handleClick(event) {
        const pickResult = this.scene.pick(
            this.scene.pointerX,
            this.scene.pointerY
        );

        if (pickResult.hit) {
            // 檢查是否點到怪物
            const monster = this.monsters.find(m =>
                m.mesh === pickResult.pickedMesh ||
                m.mesh.getChildMeshes().includes(pickResult.pickedMesh)
            );

            if (monster && monster.hp > 0) {
                this.selectTarget(monster);
            } else {
                this.clearTarget();
            }
        }
    }

    // 選取目標
    selectTarget(monster) {
        this.state.target = monster;

        // 更新目標 UI
        const targetInfo = document.getElementById('targetInfo');
        targetInfo.classList.add('visible');
        document.getElementById('targetName').textContent = monster.type;
        this.updateTargetHealthBar();

        // 高亮目標
        monster.mesh.renderOutline = true;
        monster.mesh.outlineColor = new BABYLON.Color3(1, 0, 0);
        monster.mesh.outlineWidth = 0.05;

        this.addCombatMessage(`選取目標: ${monster.type}`, 'skill');
    }

    // 清除目標
    clearTarget() {
        if (this.state.target) {
            this.state.target.mesh.renderOutline = false;
        }
        this.state.target = null;
        document.getElementById('targetInfo').classList.remove('visible');
    }

    // 使用技能
    useSkill(skillName) {
        const skill = CONFIG.skills[skillName];
        if (!skill) return;

        // 檢查冷卻
        if (this.state.skillCooldowns[skillName] > Date.now()) {
            this.addCombatMessage('技能冷卻中...', 'damage');
            return;
        }

        // 檢查 MP
        if (this.state.player.mp < skill.mpCost) {
            this.addCombatMessage('魔力不足！', 'damage');
            return;
        }

        // 消耗 MP
        this.state.player.mp -= skill.mpCost;
        this.updatePlayerUI();

        // 設定冷卻
        this.state.skillCooldowns[skillName] = Date.now() + skill.cooldown;
        this.updateSkillCooldown(skillName, skill.cooldown);

        // 執行技能效果
        switch (skillName) {
            case 'attack':
                this.performAttack(skill);
                break;
            case 'fireball':
                this.castFireball(skill);
                break;
            case 'heal':
                this.castHeal(skill);
                break;
            case 'lightning':
                this.castLightning(skill);
                break;
            case 'shield':
                this.castShield(skill);
                break;
        }

        // 高亮技能欄
        const slot = document.querySelector(`.skill-slot[data-skill="${skillName}"]`);
        slot.classList.add('active');
        setTimeout(() => slot.classList.remove('active'), 200);
    }

    // 普通攻擊
    performAttack(skill) {
        if (!this.state.target || this.state.target.hp <= 0) {
            this.addCombatMessage('請選擇目標！', 'damage');
            return;
        }

        const distance = BABYLON.Vector3.Distance(
            this.playerMesh.position,
            this.state.target.mesh.position
        );

        if (distance > skill.range) {
            this.addCombatMessage('目標太遠！', 'damage');
            return;
        }

        // 攻擊動畫
        this.playAttackAnimation();

        // 計算傷害
        const damage = Math.floor(this.state.player.attack * skill.damage * (0.9 + Math.random() * 0.2));
        const isCritical = Math.random() < 0.15;
        const finalDamage = isCritical ? damage * 2 : damage;

        this.dealDamage(this.state.target, finalDamage, isCritical);
        this.createHitEffect(this.state.target.mesh.position);
    }

    // 火球術
    castFireball(skill) {
        if (!this.state.target || this.state.target.hp <= 0) {
            this.addCombatMessage('請選擇目標！', 'damage');
            return;
        }

        this.addCombatMessage('施放火球術！', 'skill');

        // 建立火球
        const fireball = BABYLON.MeshBuilder.CreateSphere('fireball', {
            diameter: 0.8
        }, this.scene);
        fireball.position = this.playerMesh.position.clone();
        fireball.position.y += 1;

        const fireballMat = new BABYLON.PBRMaterial('fireballMat', this.scene);
        fireballMat.emissiveColor = new BABYLON.Color3(1, 0.5, 0);
        fireballMat.albedoColor = new BABYLON.Color3(1, 0.3, 0);
        fireball.material = fireballMat;

        // 火球粒子
        this.createFireParticles(fireball);

        // 火球飛行動畫
        const target = this.state.target;
        const targetPos = target.mesh.position.clone();
        targetPos.y += 1;

        const animation = new BABYLON.Animation(
            'fireballFly',
            'position',
            60,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        animation.setKeys([
            { frame: 0, value: fireball.position.clone() },
            { frame: 30, value: targetPos }
        ]);

        fireball.animations = [animation];

        this.scene.beginAnimation(fireball, 0, 30, false, 1, () => {
            // 擊中效果
            const damage = Math.floor(this.state.player.attack * skill.damage);
            this.dealDamage(target, damage, false);
            this.createExplosionEffect(targetPos);
            fireball.dispose();
        });
    }

    // 治療術
    castHeal(skill) {
        this.addCombatMessage('施放治療術！', 'skill');

        const healAmount = skill.healing;
        this.state.player.hp = Math.min(
            this.state.player.hp + healAmount,
            this.state.player.maxHp
        );

        this.showDamageNumber(this.playerMesh.position, healAmount, 'heal');
        this.createHealEffect(this.playerMesh);
        this.updatePlayerUI();

        this.addCombatMessage(`恢復 ${healAmount} 點生命值`, 'skill');
    }

    // 閃電鏈
    castLightning(skill) {
        if (!this.state.target || this.state.target.hp <= 0) {
            this.addCombatMessage('請選擇目標！', 'damage');
            return;
        }

        this.addCombatMessage('施放閃電鏈！', 'skill');

        // 閃電效果
        this.createLightningEffect(
            this.playerMesh.position,
            this.state.target.mesh.position
        );

        // 主要傷害
        const damage = Math.floor(this.state.player.attack * skill.damage);
        this.dealDamage(this.state.target, damage, false);

        // 連鎖效果 (打擊附近怪物)
        const chainRange = 10;
        let chainCount = 0;
        this.monsters.forEach(m => {
            if (m !== this.state.target && m.hp > 0 && chainCount < 2) {
                const dist = BABYLON.Vector3.Distance(
                    this.state.target.mesh.position,
                    m.mesh.position
                );
                if (dist < chainRange) {
                    setTimeout(() => {
                        this.createLightningEffect(
                            this.state.target.mesh.position,
                            m.mesh.position
                        );
                        this.dealDamage(m, Math.floor(damage * 0.5), false);
                    }, 100 * (chainCount + 1));
                    chainCount++;
                }
            }
        });
    }

    // 護盾
    castShield(skill) {
        this.addCombatMessage('施放護盾！', 'skill');

        this.state.player.shieldActive = true;
        this.createShieldEffect(this.playerMesh);

        setTimeout(() => {
            this.state.player.shieldActive = false;
            this.addCombatMessage('護盾消失', 'skill');
        }, skill.duration);
    }

    // 造成傷害
    dealDamage(target, damage, isCritical) {
        target.hp -= damage;

        this.showDamageNumber(
            target.mesh.position,
            damage,
            isCritical ? 'critical' : 'normal'
        );

        // 更新血條
        const hpPercent = Math.max(0, target.hp / target.maxHp);
        target.healthBar.fill.width = (hpPercent * 100) + '%';

        if (this.state.target === target) {
            this.updateTargetHealthBar();
        }

        // 受擊效果
        this.flashMesh(target.mesh, new BABYLON.Color3(1, 0, 0));

        this.addCombatMessage(
            `對 ${target.type} 造成 ${damage} 點傷害${isCritical ? ' (暴擊!)' : ''}`,
            'damage'
        );

        // 檢查死亡
        if (target.hp <= 0) {
            this.killMonster(target);
        }
    }

    // 擊殺怪物
    killMonster(monster) {
        this.addCombatMessage(`擊敗了 ${monster.type}！`, 'exp');

        // 獲得經驗值
        this.gainExp(monster.exp);

        // 死亡效果
        this.createDeathEffect(monster.mesh.position);

        // 清除目標
        if (this.state.target === monster) {
            this.clearTarget();
        }

        // 隱藏怪物
        monster.mesh.setEnabled(false);
        monster.healthBar.plane.setEnabled(false);

        // 重生
        setTimeout(() => {
            monster.hp = monster.maxHp;
            monster.healthBar.fill.width = '100%';
            monster.mesh.position = monster.spawnPosition.clone();
            monster.mesh.setEnabled(true);
            monster.healthBar.plane.setEnabled(true);
            monster.state = 'idle';
        }, CONFIG.monsters.respawnTime);
    }

    // 獲得經驗值
    gainExp(amount) {
        this.state.player.exp += amount;
        this.addCombatMessage(`獲得 ${amount} 經驗值`, 'exp');

        // 升級檢查
        while (this.state.player.exp >= this.state.player.expToLevel) {
            this.state.player.exp -= this.state.player.expToLevel;
            this.levelUp();
        }

        this.updatePlayerUI();
    }

    // 升級
    levelUp() {
        this.state.player.level++;
        this.state.player.maxHp += 20;
        this.state.player.maxMp += 10;
        this.state.player.hp = this.state.player.maxHp;
        this.state.player.mp = this.state.player.maxMp;
        this.state.player.attack += 3;
        this.state.player.defense += 2;
        this.state.player.expToLevel = Math.floor(this.state.player.expToLevel * 1.5);

        this.addCombatMessage(`恭喜升級！現在是 Lv.${this.state.player.level}`, 'exp');
        this.createLevelUpEffect(this.playerMesh);
    }

    // 顯示傷害數字
    showDamageNumber(position, damage, type) {
        const screenPos = BABYLON.Vector3.Project(
            position.add(new BABYLON.Vector3(0, 2, 0)),
            BABYLON.Matrix.Identity(),
            this.scene.getTransformMatrix(),
            this.camera.viewport.toGlobal(
                this.engine.getRenderWidth(),
                this.engine.getRenderHeight()
            )
        );

        const div = document.createElement('div');
        div.className = 'damage-number';
        if (type === 'critical') div.classList.add('critical');
        if (type === 'heal') div.classList.add('heal');
        div.textContent = (type === 'heal' ? '+' : '-') + damage;
        div.style.left = screenPos.x + 'px';
        div.style.top = screenPos.y + 'px';

        document.getElementById('gameUI').appendChild(div);

        setTimeout(() => div.remove(), 1000);
    }

    // 更新技能冷卻顯示
    updateSkillCooldown(skillName, cooldown) {
        const slot = document.querySelector(`.skill-slot[data-skill="${skillName}"]`);
        if (!slot) return;

        slot.classList.add('on-cooldown');

        let cdDiv = slot.querySelector('.skill-cooldown');
        if (!cdDiv) {
            cdDiv = document.createElement('div');
            cdDiv.className = 'skill-cooldown';
            slot.appendChild(cdDiv);
        }

        const startTime = Date.now();
        const updateCooldown = () => {
            const remaining = Math.max(0, cooldown - (Date.now() - startTime));
            if (remaining > 0) {
                cdDiv.textContent = Math.ceil(remaining / 1000);
                requestAnimationFrame(updateCooldown);
            } else {
                slot.classList.remove('on-cooldown');
                cdDiv.remove();
            }
        };
        updateCooldown();
    }

    // 攻擊動畫
    playAttackAnimation() {
        // 簡單的攻擊動畫 (晃動)
        const animation = new BABYLON.Animation(
            'attackAnim',
            'rotation.y',
            60,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        const startRotation = this.playerMesh.rotation.y;
        animation.setKeys([
            { frame: 0, value: startRotation },
            { frame: 5, value: startRotation + 0.3 },
            { frame: 15, value: startRotation - 0.2 },
            { frame: 20, value: startRotation }
        ]);

        this.playerMesh.animations = [animation];
        this.scene.beginAnimation(this.playerMesh, 0, 20, false);
    }

    // 閃爍效果
    flashMesh(mesh, color) {
        const originalColor = mesh.material.emissiveColor.clone();
        mesh.material.emissiveColor = color;

        setTimeout(() => {
            mesh.material.emissiveColor = originalColor;
        }, 100);
    }

    // 建立火焰粒子
    createFireParticles(emitter) {
        const particleSystem = new BABYLON.ParticleSystem('fire', 100, this.scene);
        particleSystem.particleTexture = new BABYLON.Texture(
            'https://playground.babylonjs.com/textures/flare.png',
            this.scene
        );

        particleSystem.emitter = emitter;
        particleSystem.minEmitBox = new BABYLON.Vector3(-0.2, -0.2, -0.2);
        particleSystem.maxEmitBox = new BABYLON.Vector3(0.2, 0.2, 0.2);

        particleSystem.color1 = new BABYLON.Color4(1, 0.5, 0, 1);
        particleSystem.color2 = new BABYLON.Color4(1, 0.2, 0, 1);
        particleSystem.colorDead = new BABYLON.Color4(0.2, 0, 0, 0);

        particleSystem.minSize = 0.3;
        particleSystem.maxSize = 0.6;

        particleSystem.minLifeTime = 0.1;
        particleSystem.maxLifeTime = 0.3;

        particleSystem.emitRate = 100;
        particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;

        particleSystem.gravity = new BABYLON.Vector3(0, 0, 0);
        particleSystem.direction1 = new BABYLON.Vector3(-1, 1, -1);
        particleSystem.direction2 = new BABYLON.Vector3(1, 1, 1);

        particleSystem.start();
        return particleSystem;
    }

    // 建立爆炸效果
    createExplosionEffect(position) {
        const particleSystem = new BABYLON.ParticleSystem('explosion', 200, this.scene);
        particleSystem.particleTexture = new BABYLON.Texture(
            'https://playground.babylonjs.com/textures/flare.png',
            this.scene
        );

        particleSystem.emitter = position;
        particleSystem.minEmitBox = new BABYLON.Vector3(-0.5, -0.5, -0.5);
        particleSystem.maxEmitBox = new BABYLON.Vector3(0.5, 0.5, 0.5);

        particleSystem.color1 = new BABYLON.Color4(1, 0.6, 0, 1);
        particleSystem.color2 = new BABYLON.Color4(1, 0.2, 0, 1);
        particleSystem.colorDead = new BABYLON.Color4(0.3, 0, 0, 0);

        particleSystem.minSize = 0.5;
        particleSystem.maxSize = 2;

        particleSystem.minLifeTime = 0.3;
        particleSystem.maxLifeTime = 0.8;

        particleSystem.emitRate = 500;
        particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;

        particleSystem.gravity = new BABYLON.Vector3(0, -5, 0);
        particleSystem.direction1 = new BABYLON.Vector3(-3, 3, -3);
        particleSystem.direction2 = new BABYLON.Vector3(3, 5, 3);

        particleSystem.minEmitPower = 5;
        particleSystem.maxEmitPower = 10;

        particleSystem.targetStopDuration = 0.3;
        particleSystem.disposeOnStop = true;

        particleSystem.start();
    }

    // 建立擊中效果
    createHitEffect(position) {
        const particleSystem = new BABYLON.ParticleSystem('hit', 50, this.scene);
        particleSystem.particleTexture = new BABYLON.Texture(
            'https://playground.babylonjs.com/textures/flare.png',
            this.scene
        );

        particleSystem.emitter = position.add(new BABYLON.Vector3(0, 1, 0));

        particleSystem.color1 = new BABYLON.Color4(1, 1, 0.5, 1);
        particleSystem.color2 = new BABYLON.Color4(1, 0.5, 0, 1);
        particleSystem.colorDead = new BABYLON.Color4(0.5, 0.2, 0, 0);

        particleSystem.minSize = 0.1;
        particleSystem.maxSize = 0.4;

        particleSystem.minLifeTime = 0.1;
        particleSystem.maxLifeTime = 0.3;

        particleSystem.emitRate = 200;
        particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;

        particleSystem.direction1 = new BABYLON.Vector3(-2, 2, -2);
        particleSystem.direction2 = new BABYLON.Vector3(2, 4, 2);

        particleSystem.minEmitPower = 2;
        particleSystem.maxEmitPower = 5;

        particleSystem.targetStopDuration = 0.1;
        particleSystem.disposeOnStop = true;

        particleSystem.start();
    }

    // 建立治療效果
    createHealEffect(mesh) {
        const particleSystem = new BABYLON.ParticleSystem('heal', 100, this.scene);
        particleSystem.particleTexture = new BABYLON.Texture(
            'https://playground.babylonjs.com/textures/flare.png',
            this.scene
        );

        particleSystem.emitter = mesh;
        particleSystem.minEmitBox = new BABYLON.Vector3(-0.5, 0, -0.5);
        particleSystem.maxEmitBox = new BABYLON.Vector3(0.5, 0, 0.5);

        particleSystem.color1 = new BABYLON.Color4(0.3, 1, 0.5, 1);
        particleSystem.color2 = new BABYLON.Color4(0.1, 0.8, 0.3, 1);
        particleSystem.colorDead = new BABYLON.Color4(0, 0.5, 0, 0);

        particleSystem.minSize = 0.2;
        particleSystem.maxSize = 0.5;

        particleSystem.minLifeTime = 0.5;
        particleSystem.maxLifeTime = 1;

        particleSystem.emitRate = 50;
        particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;

        particleSystem.direction1 = new BABYLON.Vector3(0, 1, 0);
        particleSystem.direction2 = new BABYLON.Vector3(0.1, 2, 0.1);

        particleSystem.minEmitPower = 1;
        particleSystem.maxEmitPower = 3;

        particleSystem.targetStopDuration = 1;
        particleSystem.disposeOnStop = true;

        particleSystem.start();
    }

    // 建立閃電效果
    createLightningEffect(from, to) {
        const points = [];
        const segments = 10;

        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const point = BABYLON.Vector3.Lerp(from, to, t);
            if (i > 0 && i < segments) {
                point.x += (Math.random() - 0.5) * 2;
                point.y += (Math.random() - 0.5) * 2 + 1;
                point.z += (Math.random() - 0.5) * 2;
            }
            points.push(point);
        }

        const lightning = BABYLON.MeshBuilder.CreateTube('lightning', {
            path: points,
            radius: 0.1,
            tessellation: 6,
            updatable: false
        }, this.scene);

        const lightningMat = new BABYLON.StandardMaterial('lightningMat', this.scene);
        lightningMat.emissiveColor = new BABYLON.Color3(0.5, 0.7, 1);
        lightningMat.disableLighting = true;
        lightning.material = lightningMat;

        // 閃爍效果
        let flashes = 3;
        const flash = () => {
            lightning.setEnabled(!lightning.isEnabled());
            flashes--;
            if (flashes > 0) {
                setTimeout(flash, 50);
            } else {
                lightning.dispose();
            }
        };

        setTimeout(flash, 50);
    }

    // 建立護盾效果
    createShieldEffect(mesh) {
        const shield = BABYLON.MeshBuilder.CreateSphere('shield', {
            diameter: 2.5,
            segments: 16
        }, this.scene);
        shield.parent = mesh;
        shield.position.y = 0.5;

        const shieldMat = new BABYLON.PBRMaterial('shieldMat', this.scene);
        shieldMat.albedoColor = new BABYLON.Color3(0.3, 0.5, 1);
        shieldMat.emissiveColor = new BABYLON.Color3(0.2, 0.4, 0.8);
        shieldMat.alpha = 0.3;
        shieldMat.backFaceCulling = false;
        shield.material = shieldMat;

        // 旋轉動畫
        const animation = new BABYLON.Animation(
            'shieldRotate',
            'rotation.y',
            30,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );
        animation.setKeys([
            { frame: 0, value: 0 },
            { frame: 300, value: Math.PI * 2 }
        ]);
        shield.animations = [animation];
        this.scene.beginAnimation(shield, 0, 300, true);

        // 持續時間後移除
        setTimeout(() => {
            shield.dispose();
        }, CONFIG.skills.shield.duration);
    }

    // 建立死亡效果
    createDeathEffect(position) {
        const particleSystem = new BABYLON.ParticleSystem('death', 100, this.scene);
        particleSystem.particleTexture = new BABYLON.Texture(
            'https://playground.babylonjs.com/textures/flare.png',
            this.scene
        );

        particleSystem.emitter = position;

        particleSystem.color1 = new BABYLON.Color4(0.5, 0, 0.5, 1);
        particleSystem.color2 = new BABYLON.Color4(0.3, 0, 0.3, 1);
        particleSystem.colorDead = new BABYLON.Color4(0, 0, 0, 0);

        particleSystem.minSize = 0.3;
        particleSystem.maxSize = 1;

        particleSystem.minLifeTime = 0.5;
        particleSystem.maxLifeTime = 1.5;

        particleSystem.emitRate = 100;
        particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;

        particleSystem.direction1 = new BABYLON.Vector3(-2, 3, -2);
        particleSystem.direction2 = new BABYLON.Vector3(2, 5, 2);

        particleSystem.targetStopDuration = 0.5;
        particleSystem.disposeOnStop = true;

        particleSystem.start();
    }

    // 建立升級效果
    createLevelUpEffect(mesh) {
        // 光柱
        const pillar = BABYLON.MeshBuilder.CreateCylinder('levelUpPillar', {
            height: 20,
            diameter: 3
        }, this.scene);
        pillar.position = mesh.position.clone();
        pillar.position.y += 10;

        const pillarMat = new BABYLON.StandardMaterial('pillarMat', this.scene);
        pillarMat.emissiveColor = new BABYLON.Color3(1, 0.8, 0.2);
        pillarMat.alpha = 0.3;
        pillarMat.disableLighting = true;
        pillar.material = pillarMat;

        // 粒子
        const particles = new BABYLON.ParticleSystem('levelUp', 200, this.scene);
        particles.particleTexture = new BABYLON.Texture(
            'https://playground.babylonjs.com/textures/flare.png',
            this.scene
        );

        particles.emitter = mesh;
        particles.minEmitBox = new BABYLON.Vector3(-1, 0, -1);
        particles.maxEmitBox = new BABYLON.Vector3(1, 0, 1);

        particles.color1 = new BABYLON.Color4(1, 0.9, 0.3, 1);
        particles.color2 = new BABYLON.Color4(1, 0.7, 0, 1);
        particles.colorDead = new BABYLON.Color4(1, 0.5, 0, 0);

        particles.minSize = 0.3;
        particles.maxSize = 0.8;

        particles.minLifeTime = 1;
        particles.maxLifeTime = 2;

        particles.emitRate = 100;
        particles.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;

        particles.direction1 = new BABYLON.Vector3(-0.5, 5, -0.5);
        particles.direction2 = new BABYLON.Vector3(0.5, 8, 0.5);

        particles.minEmitPower = 2;
        particles.maxEmitPower = 5;

        particles.start();

        // 清除效果
        setTimeout(() => {
            pillar.dispose();
            particles.stop();
            setTimeout(() => particles.dispose(), 2000);
        }, 2000);
    }

    // 設定 UI
    setupUI() {
        this.updatePlayerUI();
        this.initMinimap();
    }

    // 更新玩家 UI
    updatePlayerUI() {
        const p = this.state.player;

        document.getElementById('playerLevel').textContent = p.level;
        document.getElementById('currentHP').textContent = Math.floor(p.hp);
        document.getElementById('maxHP').textContent = p.maxHp;
        document.getElementById('currentMP').textContent = Math.floor(p.mp);
        document.getElementById('maxMP').textContent = p.maxMp;
        document.getElementById('currentEXP').textContent = p.exp;
        document.getElementById('maxEXP').textContent = p.expToLevel;

        document.getElementById('hpBar').style.width = (p.hp / p.maxHp * 100) + '%';
        document.getElementById('mpBar').style.width = (p.mp / p.maxMp * 100) + '%';
        document.getElementById('expBar').style.width = (p.exp / p.expToLevel * 100) + '%';
    }

    // 更新目標血條
    updateTargetHealthBar() {
        if (!this.state.target) return;
        const hpPercent = Math.max(0, this.state.target.hp / this.state.target.maxHp * 100);
        document.getElementById('targetHpBar').style.width = hpPercent + '%';
    }

    // 初始化迷你地圖
    initMinimap() {
        this.minimapCanvas = document.getElementById('minimapCanvas');
        this.minimapCtx = this.minimapCanvas.getContext('2d');
        this.minimapCanvas.width = 180;
        this.minimapCanvas.height = 180;
    }

    // 更新迷你地圖
    updateMinimap() {
        const ctx = this.minimapCtx;
        const size = 180;
        const scale = size / 200;

        // 清除
        ctx.fillStyle = 'rgba(10, 20, 30, 0.9)';
        ctx.fillRect(0, 0, size, size);

        // 繪製玩家 (中心)
        ctx.fillStyle = '#4488ff';
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, 5, 0, Math.PI * 2);
        ctx.fill();

        // 繪製怪物
        ctx.fillStyle = '#ff4444';
        this.monsters.forEach(m => {
            if (m.hp > 0) {
                const relX = m.mesh.position.x - this.playerMesh.position.x;
                const relZ = m.mesh.position.z - this.playerMesh.position.z;
                const mapX = size / 2 + relX * scale;
                const mapZ = size / 2 + relZ * scale;

                if (mapX >= 0 && mapX <= size && mapZ >= 0 && mapZ <= size) {
                    ctx.beginPath();
                    ctx.arc(mapX, mapZ, 3, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        });

        // 繪製方向指示
        ctx.strokeStyle = '#4488ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(size / 2, size / 2);
        const angle = this.playerMesh.rotation.y;
        ctx.lineTo(
            size / 2 + Math.sin(angle) * 10,
            size / 2 - Math.cos(angle) * 10
        );
        ctx.stroke();
    }

    // 添加戰鬥訊息
    addCombatMessage(text, type = '') {
        const log = document.getElementById('combatLog');
        const msg = document.createElement('div');
        msg.className = 'combat-message ' + type;
        msg.textContent = text;
        log.appendChild(msg);
        log.scrollTop = log.scrollHeight;

        // 限制訊息數量
        while (log.children.length > 20) {
            log.removeChild(log.firstChild);
        }
    }

    // 跳躍
    jump() {
        // 簡單的跳躍效果
        if (this.playerMesh.position.y <= 1.5) {
            const animation = new BABYLON.Animation(
                'jump',
                'position.y',
                60,
                BABYLON.Animation.ANIMATIONTYPE_FLOAT,
                BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
            );

            const startY = this.playerMesh.position.y;
            animation.setKeys([
                { frame: 0, value: startY },
                { frame: 15, value: startY + 2 },
                { frame: 30, value: startY }
            ]);

            this.playerMesh.animations = [animation];
            this.scene.beginAnimation(this.playerMesh, 0, 30, false);
        }
    }

    // 遊戲更新迴圈
    update() {
        this.updatePlayerMovement();
        this.updateMonsterAI();
        this.updateCamera();
        this.updateMinimap();
        this.regenerate();
    }

    // 更新玩家移動
    updatePlayerMovement() {
        const speed = CONFIG.player.moveSpeed;
        let moveX = 0;
        let moveZ = 0;

        if (this.keys['w']) moveZ = speed;
        if (this.keys['s']) moveZ = -speed;
        if (this.keys['a']) moveX = -speed;
        if (this.keys['d']) moveX = speed;

        if (moveX !== 0 || moveZ !== 0) {
            // 根據相機角度計算移動方向
            const cameraAngle = this.camera.alpha - Math.PI / 2;
            const sin = Math.sin(cameraAngle);
            const cos = Math.cos(cameraAngle);

            const worldX = moveX * cos - moveZ * sin;
            const worldZ = moveX * sin + moveZ * cos;

            this.playerMesh.position.x += worldX;
            this.playerMesh.position.z += worldZ;

            // 面向移動方向
            this.playerMesh.rotation.y = Math.atan2(worldX, worldZ);
        }

        // 更新狀態
        this.state.player.position = this.playerMesh.position.clone();
    }

    // 更新怪物 AI
    updateMonsterAI() {
        const now = Date.now();

        this.monsters.forEach(monster => {
            if (monster.hp <= 0) return;

            const distance = BABYLON.Vector3.Distance(
                this.playerMesh.position,
                monster.mesh.position
            );

            // 仇恨範圍檢測
            if (distance < CONFIG.monsters.aggroRange) {
                monster.state = 'aggro';
                monster.aggroTarget = this.playerMesh;
            } else if (distance > CONFIG.monsters.aggroRange * 1.5) {
                monster.state = 'idle';
                monster.aggroTarget = null;
            }

            // 根據狀態行動
            if (monster.state === 'aggro' && monster.aggroTarget) {
                // 面向玩家
                const direction = this.playerMesh.position.subtract(monster.mesh.position);
                monster.mesh.rotation.y = Math.atan2(direction.x, direction.z);

                // 追蹤玩家
                if (distance > CONFIG.monsters.attackRange) {
                    const moveSpeed = 0.05;
                    direction.normalize();
                    monster.mesh.position.addInPlace(direction.scale(moveSpeed));
                } else {
                    // 攻擊
                    if (now - monster.lastAttackTime > CONFIG.monsters.attackCooldown) {
                        this.monsterAttack(monster);
                        monster.lastAttackTime = now;
                    }
                }
            } else if (monster.state === 'idle') {
                // 閒置巡邏
                if (Math.random() < 0.01) {
                    monster.mesh.rotation.y += (Math.random() - 0.5) * 0.5;
                }
            }
        });
    }

    // 怪物攻擊
    monsterAttack(monster) {
        if (this.state.player.shieldActive) {
            this.addCombatMessage('護盾抵擋了攻擊！', 'skill');
            return;
        }

        const damage = Math.max(1, monster.attack - this.state.player.defense);
        this.state.player.hp -= damage;

        this.showDamageNumber(this.playerMesh.position, damage, 'normal');
        this.flashMesh(this.playerMesh, new BABYLON.Color3(1, 0, 0));
        this.addCombatMessage(`${monster.type} 對你造成 ${damage} 點傷害`, 'damage');

        this.updatePlayerUI();

        // 死亡檢查
        if (this.state.player.hp <= 0) {
            this.playerDeath();
        }
    }

    // 玩家死亡
    playerDeath() {
        this.addCombatMessage('你死了！3秒後復活...', 'damage');

        // 復活
        setTimeout(() => {
            this.state.player.hp = this.state.player.maxHp;
            this.state.player.mp = this.state.player.maxMp;
            this.playerMesh.position = new BABYLON.Vector3(0, 1, 0);
            this.updatePlayerUI();
            this.addCombatMessage('你已復活', 'skill');
        }, 3000);
    }

    // 更新相機
    updateCamera() {
        this.camera.target = this.playerMesh.position.clone();
    }

    // 自然回復
    regenerate() {
        const now = Date.now();
        if (!this.lastRegenTime) this.lastRegenTime = now;

        if (now - this.lastRegenTime > 1000) {
            // 每秒回復
            if (this.state.player.hp < this.state.player.maxHp) {
                this.state.player.hp = Math.min(
                    this.state.player.hp + 1,
                    this.state.player.maxHp
                );
            }
            if (this.state.player.mp < this.state.player.maxMp) {
                this.state.player.mp = Math.min(
                    this.state.player.mp + 2,
                    this.state.player.maxMp
                );
            }
            this.updatePlayerUI();
            this.lastRegenTime = now;
        }
    }
}

// 啟動遊戲
window.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});
