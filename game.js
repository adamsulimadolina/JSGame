var config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update,
        extend: {
            player: null,
            reticle: null,
            moveKeys: null,
            hero_bullets: null,
            enemy_bullets: null,
            time: 0,
            fly_enemies: [],
            ground_enemies: [],
            treasures: [],
            boosters: [],
        }
    }
};

let hero_velocity_boost_x= 0;
let hero_velocity_boost_y= 0;
let bonus_timer= 0;
let bonus_active= false;
let layerBackground2 = null
let layerFloor = null;
let score = 0;
let game = new Phaser.Game(config);
function preload() {
    this.load.image('bullet', 'bullet01.png');
    this.load.spritesheet('hero', 'hero.png', { frameWidth: 16, frameHeight: 26 })

    this.load.spritesheet('fly_enemy', 'enemy.png', { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('ground_enemy', 'enemy2.png', { frameWidth: 16, frameHeight: 16 });
    this.load.tilemapTiledJSON('walls', 'walls.json');
    this.load.image('gameTiles', 'walls.png');
    this.load.image('treasure', 'treasure.png');
    this.load.image('booster_speed', 'ball.png');
}

function create() {
    /**
     * Tworzenie mapy
     */
    const map = this.make.tilemap({ key: 'walls' });
    const tileset = map.addTilesetImage("walls.png", 'gameTiles');
    const layerBackground = map.createDynamicLayer(0, tileset);
    layerBackground2 = map.createDynamicLayer(1, tileset);
    layerFloor = map.createDynamicLayer(2, tileset);
    const layerWalls = map.createDynamicLayer(3, tileset);

    layerBackground2.setCollision([115])
    layerWalls.setCollision([2, 17, 19, 20, 21, 33, 35, 36, 37, 50, 102, 103, 104, 118, 120])
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);



    /**
    Tworzenie bohatera
     */
    this.hero = this.physics.add.sprite(400, 300, 'hero');
    this.hero.health = 100;
    this.hero.setScale(1);
    this.hero.setCollideWorldBounds(true);

    /** 
    Dodawanie tekstów do widoku
     */

    this.scoreText = this.add.text(this.cameras.main.scrollX + 135, this.cameras.main.scrollY + 100, 'Score: ' + this.score, { fontSize: '20px', fill: '#fff' });
    this.scoreText.setScrollFactor(0);
    this.healthText = this.add.text(this.cameras.main.scrollX + 530, this.cameras.main.scrollY + 100, 'Health: ' + this.hero.health, { fontSize: '20px', fill: '#fff' })
    this.healthText.setScrollFactor(0)
    this.cameras.main.zoom = 1.5;

    this.cameras.main.startFollow(this.hero, true);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    /**
    Animacje
     */
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('hero', { start: 8, end: 15 }),
        frameRate: 10,
        repeat: -1
    })
    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('hero', { start: 0, end: 7 }),
        frameRate: 10,
        repeat: -1
    })
    this.anims.create({
        key: 'up',
        frames: this.anims.generateFrameNumbers('hero', { start: 0, end: 7 }),
        frameRate: 10,
        repeat: -1
    })
    this.anims.create({
        key: 'stop',
        frames: [{ key: 'hero', frame: 3 }],
        frameRate: 10
    })

    //flying enemy anims
    this.anims.create({
        key: 'fly',
        frames: this.anims.generateFrameNumbers('fly_enemy', { start: 0, end: 7 }),
        frameRate: 5,
        repeat: -1
    })

    //ground enemy anims
    this.anims.create({
        key: 'enemy_right',
        frames: this.anims.generateFrameNumbers('ground_enemy', { start: 0, end: 7 }),
        frameRate: 5,
        repeat: -1
    })
    this.anims.create({
        key: 'enemy_left',
        frames: this.anims.generateFrameNumbers('ground_enemy', { start: 8, end: 15 }),
        frameRate: 5,
        repeat: -1
    })
    this.anims.create({
        key: 'enemy_down',
        frames: this.anims.generateFrameNumbers('ground_enemy', { start: 16, end: 23 }),
        frameRate: 5,
        repeat: -1
    })
    this.anims.create({
        key: 'enemy_up',
        frames: this.anims.generateFrameNumbers('ground_enemy', { start: 24, end: 31 }),
        frameRate: 5,
        repeat: -1
    })

    this.timeClock = new Phaser.Time.Clock(this);
    this.timeClock.start();

    this.hero_bullets = this.physics.add.group();
    this.enemy_bullets = this.physics.add.group();

    /** Funkcja na przycisk myszy
    Tworzenie pocisku i skierowanie go w koordynaty kliknięcia
     */
    this.input.on('pointerdown', (pointer) => {
        pointer.camera = this.cameras.main;
        pointer.updateWorldPoint(this.cameras.main)
        this.hero_bullets.create(this.hero.x, this.hero.y, 'bullet', 0, false, false);
        this.bullet = this.hero_bullets.getFirstDead();
        this.bullet.setActive(true);
        this.bullet.setVisible(true);
        this.bullet.setScale(1);
        this.physics.moveTo(this.bullet, pointer.worldX, pointer.worldY, 1000);
    });

    /** 
    Kolizje
     */
    this.physics.world.addCollider(this.hero, layerWalls, function () {
        //console.log('kolizja')
    });

    this.physics.world.addCollider(this.ground_enemies, layerWalls, function () {
        //console.log('kolizja')
    });

    this.physics.world.addCollider(this.boosters, this.hero, function(booster, hero){
        booster.destroy();
        hero_velocity_boost_x+=320;
        hero_velocity_boost_y+=320;
        bonus_timer = 0;
        bonus_active = true;
    });

    this.physics.world.addCollider(this.enemy_bullets, layerWalls, function (enemy_bullets) {
        enemy_bullets.destroy();
    })
    this.physics.world.addCollider(this.hero_bullets, layerWalls, function (hero_bullets) {
        hero_bullets.destroy();
    })


    this.physics.world.addCollider(this.fly_enemies, this.hero_bullets, function (enemy, bullet) {
        score += 10;
        enemy.destroy();
        bullet.destroy();
    });

    this.physics.world.addCollider(this.ground_enemies, this.hero_bullets, function (enemy, bullet) {
        score += 10;
        enemy.destroy();
        bullet.destroy();
    });

    this.physics.world.addCollider(this.hero, this.fly_enemies, function (sprite, enemy) {
        sprite.health -= 20;
        enemy.destroy();

    });

    this.physics.world.addCollider(this.hero, this.ground_enemies, function (sprite, enemy) {
        sprite.health -= 20;
        enemy.destroy();

    });

    this.physics.world.addCollider(this.hero, this.enemy_bullets, function (sprite, enemy_bullets) {
        sprite.health -= 15;
        enemy_bullets.destroy();

    });

    this.physics.world.addCollider(this.hero, this.treasures, function (hero, treasure) {
        treasure.destroy();
        score += 50
    })

    this.physics.world.addCollider(this.fly_enemies, this.fly_enemies);

    this.physics.world.addCollider(this.ground_enemies, this.ground_enemies);



    cursorKeys = this.input.keyboard.createCursorKeys();
    //console.log(cursorKeys);




}


let fly_timer = 0;
let ground_timer = 0;
let treasure_timer = 0;
let booster_timer = 0;


function update() {

    
    this.scoreText.setText('Score: ' + score);
    if (this.hero.health <= 0) this.healthText.setText('Health: 0')
    else this.healthText.setText('Health: ' + this.hero.health)


    if (this.hero.health <= 0) {

        this.hero.setVelocityX(0);
        this.hero.setVelocityY(0);
        for (let i = 0; i < this.fly_enemies.length; i++) {
            this.fly_enemies[i].destroy();
        }
        for (let i = 0; i < this.ground_enemies.length; i++) {
            this.ground_enemies[i].destroy();
        }
        for (let i = 0; i < this.enemy_bullets.length; i++) {
            this.enemy_bullets[i].destroy();

        }
        for (let i = 0; i < this.treasures.length; i++) {
            this.treasures[i].destroy();
        }

        let gameOverText = this.add.text(400 + this.cameras.main.scrollX, 300 + this.cameras.main.scrollY, 'GAME OVER', { fontSize: '64px', fill: '#fff' });
        let newGameText = this.add.text(400 + this.cameras.main.scrollX, 400 + this.cameras.main.scrollY, 'Press space to restart', { fontSize: '30px', fill: '#fff' });
        gameOverText.setDepth(1);
        newGameText.setDepth(1);
        gameOverText.setOrigin(0.5);
        newGameText.setOrigin(0.5)

        if (cursorKeys.space.isDown) {
            score = 0
            this.scene.restart();
        }
    }
    else {

        if(bonus_active == true)
        {
            console.log(bonus_timer)
            if(bonus_timer == 100)
            {
                console.log("XD")
                bonus_active = false;
                bonus_timer = 0;
                hero_velocity_boost_x = 0;
                hero_velocity_boost_y = 0;
            }
            else bonus_timer++;
        }
        for (let i = 0; i < this.fly_enemies.length; i++) {

            if (this.fly_enemies[i].active === false) this.fly_enemies.splice(i, 1);
            else {
                this.physics.moveTo(this.fly_enemies[i], this.hero.x, this.hero.y, 50);
                this.fly_enemies[i].anims.play('fly', true)
            }

            if (this.fly_enemies[i] != null) {
                this.fly_enemies[i].timer = (this.fly_enemies[i].timer + 1) % 130;

                if (this.fly_enemies[i].timer == 0) {
                    this.enemy_bullets.create(this.fly_enemies[i].x, this.fly_enemies[i].y, 'bullet', 0, false, false);
                    this.bullet = this.enemy_bullets.getFirstDead();
                    this.bullet.setActive(true);
                    this.bullet.setVisible(true);
                    this.bullet.setScale(1);
                    this.physics.moveTo(this.bullet, this.hero.x, this.hero.y, 100);
                }
            }
        }

        for (let i = 0; i < this.ground_enemies.length; i++) {


            if (this.ground_enemies[i].active === false) this.ground_enemies.splice(i, 1);
            else {
                this.physics.moveTo(this.ground_enemies[i], this.hero.x, this.hero.y, 50);
                this.ground_enemies[i].anims.play('enemy_left', true)
            }

            if (this.ground_enemies[i] != null) {
                this.ground_enemies[i].timer = (this.ground_enemies[i].timer + 1) % 70;
                if (this.ground_enemies[i].timer == 0) {
                    this.enemy_bullets.create(this.ground_enemies[i].x, this.ground_enemies[i].y, 'bullet', 0, false, false);
                    this.bullet = this.enemy_bullets.getFirstDead();
                    this.bullet.setActive(true);
                    this.bullet.setVisible(true);
                    this.bullet.setScale(1);
                    this.physics.moveTo(this.bullet, this.hero.x, this.hero.y, 100);
                }
            }
        }

        for (let i = 0; i < this.treasures.length; i++) {
            if (this.treasures[i].active === false) this.treasures.splice(i, 1)
        }
        if (treasure_timer == 370 && this.treasures.length < 5) {
            let treasureX = Math.floor(Math.random() * 800)
            let treasureY = Math.floor(Math.random() * 600)
            while (true) {
                if (layerBackground2.getTileAt(treasureX, treasureY) != null) {
                    if (layerBackground2.getTileAt(treasureX, treasureY).layer.name == "bg2") {
                        console.log("skarb na " + treasureX + " " + treasureY)
                        let temp_treasure = this.physics.add.sprite(treasureX * 16, treasureY * 16, 'treasure')
                        this.treasures.push(temp_treasure)
                        break
                    }
                }
                else {
                    treasureX = Math.floor(Math.random() * 800);
                    treasureY = Math.floor(Math.random() * 600);
                }
            }
            treasure_timer = (treasure_timer + 1) % 600;
        }
        else treasure_timer = (treasure_timer + 1) % 600;

        for (let i = 0; i < this.boosters.length; i++) {
            if (this.boosters[i].active === false) this.boosters.splice(i, 1)
        }
        if (booster_timer == 370 && this.boosters.length < 5) {
            let boosterX = Math.floor(Math.random() * 800)
            let boosterY = Math.floor(Math.random() * 600)
            while (true) {
                if (layerBackground2.getTileAt(boosterX, boosterY) != null) {
                    if (layerBackground2.getTileAt(boosterX, boosterY).layer.name == "bg2") {
                        console.log("skarb na " + boosterX + " " + boosterY)
                        let temp_booster = this.physics.add.sprite(boosterX * 16, boosterY * 16, 'booster_speed')
                        this.boosters.push(temp_booster)
                        break
                    }
                }
                else {
                    boosterX = Math.floor(Math.random() * 800);
                    boosterY = Math.floor(Math.random() * 600);
                }
            }
            booster_timer = (booster_timer + 1) % 600;
        }
        else booster_timer = (booster_timer + 1) % 600;

        if (fly_timer == 1 && this.fly_enemies.length < 15) {
            let x = Math.floor(Math.random() * 800);
            let y = Math.floor(Math.random() * 600);
            while (true) {
                
                    if (layerFloor.getTileAt(x, y) != null) {

                        if (layerFloor.getTileAt(x, y).layer.name == "floor") {
                            let tmp_enem = this.physics.add.sprite(x * 16, y * 16, 'fly_enemy');
                            tmp_enem.setCollideWorldBounds(true);
                            tmp_enem.setBounce(1);
                            tmp_enem.setScale(1);
                            tmp_enem.timer = 1;
                            this.fly_enemies.push(tmp_enem);
                            break;
                        }

                    }
                    else {
                        x = Math.floor(Math.random() * 800);
                        y = Math.floor(Math.random() * 600);
                    }
                }

            
            fly_timer = (fly_timer + 1) % 450;

        }
        else fly_timer = (fly_timer + 1) % 450;


        if (ground_timer == 1 && this.ground_enemies.length < 20) {
            let x = Math.floor(Math.random() * 800);
            let y = Math.floor(Math.random() * 600);
            while (true) {
                if (layerFloor.getTileAt(x, y) != null) {

                    if (layerFloor.getTileAt(x, y).layer.name == "floor") {
                        let tmp_enem = this.physics.add.sprite(x * 16, y * 16, 'ground_enemy');
                        tmp_enem.setCollideWorldBounds(true);
                        tmp_enem.setBounce(1);
                        tmp_enem.setScale(1);
                        tmp_enem.timer = 1;
                        this.ground_enemies.push(tmp_enem);
                        break;
                    }

                }
                else {
                    x = Math.floor(Math.random() * 800);
                    y = Math.floor(Math.random() * 600);
                }

            }
            ground_timer = (ground_timer + 1) % 250;

        }
        else ground_timer = (ground_timer + 1) % 250;


        this.hero.setVelocityX(0)
        this.hero.setVelocityY(0)
        if (cursorKeys.right.isDown && cursorKeys.down.isDown) {
            this.hero.setVelocityY(160+hero_velocity_boost_y);
            this.hero.setVelocityX(160+hero_velocity_boost_x);
            console.log(hero_velocity_boost_y)
            this.hero.anims.play('right', true);
        } else if (cursorKeys.left.isDown && cursorKeys.down.isDown) {
            this.hero.setVelocityY(160+hero_velocity_boost_y);
            this.hero.setVelocityX(-160-hero_velocity_boost_x);
            this.hero.anims.play('left', true);
        } else if (cursorKeys.right.isDown && cursorKeys.up.isDown) {
            this.hero.setVelocityY(-160-hero_velocity_boost_y);
            this.hero.setVelocityX(160+hero_velocity_boost_x);
            this.hero.anims.play('right', true);
        } else if (cursorKeys.left.isDown && cursorKeys.up.isDown) {
            this.hero.setVelocityY(-160-hero_velocity_boost_y);
            this.hero.setVelocityX(-160-hero_velocity_boost_x);
            this.hero.anims.play('left', true);
        } else if (cursorKeys.up.isDown) {
            this.hero.anims.play('right', true);
            this.hero.setVelocityY(-160-hero_velocity_boost_y);
        }
        else if (cursorKeys.down.isDown) {
            this.hero.anims.play('right', true);
            this.hero.setVelocityY(160+hero_velocity_boost_y);
        }
        else if (cursorKeys.left.isDown) {
            this.hero.setVelocityX(-160-hero_velocity_boost_x);
            this.hero.anims.play('left', true);
        }
        else if (cursorKeys.right.isDown) {
            this.hero.setVelocityX(160+hero_velocity_boost_x);
            this.hero.anims.play('right', true);
        } else {
            this.hero.anims.play('stop');

        }
    }

}
