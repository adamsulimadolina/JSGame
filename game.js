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
        }
    }
};

let layerFloor=null;
let score = 0;
let game = new Phaser.Game(config);
function preload() {
    this.load.image('bullet', 'bullet01.png');
    this.load.spritesheet('hero', 'hero.png', { frameWidth: 16, frameHeight: 26 })

    this.load.spritesheet('fly_enemy', 'enemy.png', { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('ground_enemy', 'enemy2.png', { frameWidth: 16, frameHeight: 16 });
    this.load.tilemapTiledJSON('walls', 'walls.json');
    this.load.image('gameTiles', 'walls.png');
    this.load.image('treasure','treasure.png');
}

function create() {
    const map = this.make.tilemap({ key: 'walls' });
    const tileset = map.addTilesetImage("walls.png", 'gameTiles');
    const layerBackground = map.createDynamicLayer(0, tileset);
    const layerBackground2 = map.createDynamicLayer(1, tileset);
    layerFloor = map.createDynamicLayer(2, tileset);
    const layerWalls = map.createDynamicLayer(3, tileset);

    layerWalls.setCollision([2,17,19,20,21,33,35,36,37,50,102,103,104,118,120])
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    let p = layerFloor.getTileAt(48,6).layer.name;
    let z = layerFloor.layer.name
    //if(p===z)console.log("OOO: " + p + " " + z)

    this.hero = this.physics.add.sprite(400,300, 'hero');
    this.hero.health = 100;
    this.hero.setScale(1);
    this.hero.setCollideWorldBounds(true);

    this.scoreText = this.add.text(this.cameras.main.scrollX+135, this.cameras.main.scrollY+100, 'Score: ' + this.score, { fontSize: '20px', fill: '#fff' });
    this.scoreText.setScrollFactor(0);
    this.healthText = this.add.text(this.cameras.main.scrollX+530,this.cameras.main.scrollY+100, 'Health: ' + this.hero.health, {fontSize:'20px',fill: '#fff'})
    this.healthText.setScrollFactor(0)
    this.cameras.main.zoom = 1.5;

    this.cameras.main.startFollow(this.hero, true);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    //hero anims
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
        key:'fly',
        frames: this.anims.generateFrameNumbers('fly_enemy', {start:0,end:7}),
        frameRate: 5,
        repeat:-1
    })

    //ground enemy anims
    this.anims.create({
        key:'enemy_right',
        frames: this.anims.generateFrameNumbers('ground_enemy', {start:0,end:7}),
        frameRate: 5,
        repeat:-1
    })       
    this.anims.create({
        key:'enemy_left',
        frames: this.anims.generateFrameNumbers('ground_enemy', {start:8,end:15}),
        frameRate: 5,
        repeat:-1
    }) 
    this.anims.create({
        key:'enemy_down',
        frames: this.anims.generateFrameNumbers('ground_enemy', {start:16,end:23}),
        frameRate: 5,
        repeat:-1
    }) 
    this.anims.create({
        key:'enemy_up',
        frames: this.anims.generateFrameNumbers('ground_enemy', {start:24,end:31}),
        frameRate: 5,
        repeat:-1
    }) 

    this.timeClock = new Phaser.Time.Clock(this);
    this.timeClock.start();

    this.hero_bullets = this.physics.add.group();
    this.enemy_bullets = this.physics.add.group();

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

    this.physics.world.addCollider(this.hero, layerWalls,function() {
        //console.log('kolizja')
    });

    this.physics.world.addCollider(this.enemy_bullets,layerWalls,function(enemy_bullets) {
        enemy_bullets.destroy();
    })
    this.physics.world.addCollider(this.hero_bullets,layerWalls,function(hero_bullets){
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

    this.physics.world.addCollider(this.hero,this.treasures,function(hero,treasure){
        treasure.destroy();
        score+=50
    })

    this.physics.world.addCollider(this.fly_enemies, this.fly_enemies);

    this.physics.world.addCollider(this.ground_enemies, this.ground_enemies);

    

    cursorKeys = this.input.keyboard.createCursorKeys();
    //console.log(cursorKeys);




}

function update() {


    this.scoreText.setText('Score: ' + score);
    if(this.hero.health<0) this.healthText.setText('Health: 0')
        else this.healthText.setText('Health: ' + this.hero.health)
    if (this.hero.health <= 0) {

        this.hero.setVelocityX(0);
        this.hero.setVelocityY(0);

        for(let i = 0; i < this.fly_enemies.length; i++) 
        {
            this.fly_enemies[i].destroy();
        }
        for(let i = 0; i < this.ground_enemies.length; i++) 
        {
            this.ground_enemies[i].destroy();
        }
        for(let i = 0; i < this.enemy_bullets.length; i++) 
        {
            this.enemy_bullets[i].destroy();
        }
        for(let i=0;i<this.treasures.length;i++) {
            this.treasures[i].destroy();
        }
        
        let gameOverText = this.add.text(400+this.cameras.main.scrollX, 300+this.cameras.main.scrollY, 'GAME OVER', { fontSize: '64px', fill: '#fff' });
        let newGameText = this.add.text(400+this.cameras.main.scrollX, 400+this.cameras.main.scrollY, 'Press space to restart', { fontSize: '30px', fill: '#fff' });
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
        for (let i = 0; i < this.fly_enemies.length; i++) {

            if (this.fly_enemies[i].active === false) this.fly_enemies.splice(i, 1);
            else {
                this.physics.moveTo(this.fly_enemies[i], this.hero.x, this.hero.y, 50);
                this.fly_enemies[i].anims.play('fly',true)
            }

            let tmp = Math.random() * 100;
            if (this.timeClock.now % 1000 > 985 && tmp > 50 && this.fly_enemies[i] != null) {
                this.enemy_bullets.create(this.fly_enemies[i].x, this.fly_enemies[i].y, 'bullet', 0, false, false);
                this.bullet = this.enemy_bullets.getFirstDead();
                this.bullet.setActive(true);
                this.bullet.setVisible(true);
                this.bullet.setScale(1);
                this.physics.moveTo(this.bullet, this.hero.x, this.hero.y, 100);
            }
        }

        for (let i = 0; i < this.ground_enemies.length; i++) {

            if (this.ground_enemies[i].active === false) this.ground_enemies.splice(i, 1);
            else {
                this.physics.moveTo(this.ground_enemies[i], this.hero.x, this.hero.y, 50);
                this.ground_enemies[i].anims.play('enemy_left',true)
            }

            let tmp = Math.random() * 100;
            if (this.timeClock.now % 1000 > 985 && tmp > 50 && this.fly_enemies[i] != null) {
                this.enemy_bullets.create(this.ground_enemies[i].x, this.ground_enemies[i].y, 'bullet', 0, false, false);
                this.bullet = this.enemy_bullets.getFirstDead();
                this.bullet.setActive(true);
                this.bullet.setVisible(true);
                this.bullet.setScale(1);
                this.physics.moveTo(this.bullet, this.hero.x, this.hero.y, 100);
            }
        }

        //console.log(this.treasures.length)
        for(let i =0;i<this.treasures.length;i++)
        {
            if(this.treasures[i].active ===false) this.treasures.splice(i,1)
        }
        if((this.timeClock.now % 1000 >980) && this.treasures.length<5)
        {
            let treasureX=Math.floor(Math.random() * 800)
            let treasureY=Math.floor(Math.random() * 600)
            while(true){
                if(layerFloor.getTileAt(treasureX,treasureY)!=null) {
                    if(layerFloor.getTileAt(treasureX,treasureY).layer.name == 'floor'){
                        console.log("skarb na " + treasureX + " " + treasureY)
                        let temp_treasure = this.physics.add.sprite(treasureX*16,treasureY*16,'treasure')
                        this.treasures.push(temp_treasure)
                        break
                    }
                }
                else {
                    treasureX = Math.floor(Math.random() * 800);
                    treasureY = Math.floor(Math.random() * 600);
                }
            }
        }



        if (this.timeClock.now % 1000 > 980 && this.fly_enemies.length < 10) {

            let x = Math.floor(Math.random() * 800);
            let y = Math.floor(Math.random() * 600);
            while(true){ 
                 if(layerFloor.getTileAt(x,y)!=null) {
                     
                    if(layerFloor.getTileAt(x,y).layer.name == "floor")
                    {
                        let tmp_enem = this.physics.add.sprite(x*16, y*16, 'fly_enemy');
                        tmp_enem.setCollideWorldBounds(true);
                        tmp_enem.setBounce(1);
                        tmp_enem.setScale(1);
                        this.fly_enemies.push(tmp_enem);
                        break;
                    } 

                 }
                 else {
                    x = Math.floor(Math.random() * 800);
                    y = Math.floor(Math.random() * 600);
                 }
                
            }
            
        }

        if (this.timeClock.now % 1000 >997 && this.timeClock.now > 1500 && this.ground_enemies.length < 10) {

            let x = Math.floor(Math.random() * 800);
            let y = Math.floor(Math.random() * 600)
            let tmp_enem = this.physics.add.sprite(x, y, 'ground_enemy');
            console.log("biegam na " + x + " " + y)
            tmp_enem.setCollideWorldBounds(true);
            tmp_enem.setBounce(1);
            tmp_enem.setScale(1);
            this.ground_enemies.push(tmp_enem);
        }

        this.hero.setVelocityX(0)
        this.hero.setVelocityY(0)
        if (cursorKeys.right.isDown && cursorKeys.down.isDown) {
            this.hero.setVelocityY(160);
            this.hero.setVelocityX(160);
            this.hero.anims.play('right', true);
        } else if (cursorKeys.left.isDown && cursorKeys.down.isDown) {
            this.hero.setVelocityY(160);
            this.hero.setVelocityX(-160);
            this.hero.anims.play('left', true);
        } else if (cursorKeys.right.isDown && cursorKeys.up.isDown) {
            this.hero.setVelocityY(-160);
            this.hero.setVelocityX(160);
            this.hero.anims.play('right', true);
        } else if (cursorKeys.left.isDown && cursorKeys.up.isDown) {
            this.hero.setVelocityY(-160);
            this.hero.setVelocityX(-160);
            this.hero.anims.play('left', true);
        } else if (cursorKeys.up.isDown) {
            this.hero.anims.play('right', true);
            this.hero.setVelocityY(-160);
        }
        else if (cursorKeys.down.isDown) {
            this.hero.anims.play('right', true);
            this.hero.setVelocityY(160);
        }
        else if (cursorKeys.left.isDown) {
            this.hero.setVelocityX(-160);
            this.hero.anims.play('left', true);
        }
        else if (cursorKeys.right.isDown) {
            this.hero.setVelocityX(160);
            this.hero.anims.play('right', true);
        } else {
            this.hero.anims.play('stop');

        }
    }

}
