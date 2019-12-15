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
            enemies: [],
        }
    }
};


let score = 0;
let game = new Phaser.Game(config);

function preload() {
    this.load.image('bullet', 'bullet01.png');
    this.load.spritesheet('hero','hero.png',{frameWidth: 16, frameHeight:26})

    this.load.image('enemy', 'ball.png');


    this.load.tilemapTiledJSON('cybernoid', 'cybernoid.json');
    this.load.image('gameTiles', 'cybernoid.png');
}

function create() {
    const map = this.make.tilemap({ key: 'cybernoid' });
    console.log(map);
    const tileset = map.addTilesetImage("cybernoid.png", 'gameTiles');
    const layer = map.createDynamicLayer(0, tileset, 0, 0);
    this.physics.world.setBounds(0,0,map.widthInPixels, map.heightInPixels);

    

    this.hero = this.physics.add.sprite(400, 300, 'hero');
    this.hero.health = 100;
    this.hero.setCollideWorldBounds(true);

    this.scoreText = this.add.text(this.cameras.main.scrollX, this.cameras.main.scrollY, 'score: 0', { fontSize: '32px', fill: '#000' });
    this.scoreText.setScrollFactor(0);
    //this.cameras.main.zoom = 1.5;

    this.cameras.main.startFollow(this.hero, true);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('hero', {start: 8, end: 15}),
        frameRate: 10,
        repeat: -1
    })

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('hero', {start: 0, end: 7}),
        frameRate: 10,
        repeat: -1
    })

    this.anims.create({
        key: 'up',
        frames: this.anims.generateFrameNumbers('hero', {start: 0, end: 7}),
        frameRate: 10,
        repeat: -1
    })

    this.anims.create({
        key: 'stop',
        frames: [{key:'hero',frame:3}],
        frameRate: 10
    })

    this.timeClock = new Phaser.Time.Clock(this);
    this.timeClock.start();
    
    this.hero_bullets = this.physics.add.group();
    this.enemy_bullets = this.physics.add.group();

    this.input.on('pointerdown', (pointer) => {
        pointer.camera = this.cameras.main;
        this.hero_bullets.create(this.hero.x, this.hero.y, 'bullet', 0, false, false);
        this.bullet = this.hero_bullets.getFirstDead();
        this.bullet.setActive(true);
        this.bullet.setVisible(true);
        this.bullet.setScale(2);
        this.physics.moveTo(this.bullet, pointer.x + this.cameras.main.scrollX, pointer.y + this.cameras.main.scrollY, 1000);
    });


    this.physics.world.addCollider(this.enemies, this.hero_bullets, function (enemy, bullet) {
        score+=10;
        enemy.destroy();
        bullet.destroy();
    });

    this.physics.world.addCollider(this.hero, this.enemies, function (sprite, enemy) {
        sprite.health -= 55;
        enemy.destroy();

    });

    this.physics.world.addCollider(this.hero, this.enemy_bullets, function (sprite, enemy_bullets) {
        sprite.health -= 15;
        enemy_bullets.destroy();

    });

    this.physics.world.addCollider(this.enemies, this.enemies);


    cursorKeys = this.input.keyboard.createCursorKeys();

}

function update() {

    this.scoreText.setText('Score: ' + score);
    if (this.hero.health <= 0) this.scene.restart();

    for (let i = 0; i < this.enemies.length; i++) {

        if (this.enemies[i].active === false) this.enemies.splice(i, 1);
        else this.physics.moveTo(this.enemies[i], this.hero.x, this.hero.y, 200);

        let tmp = Math.random() * 100;
        if (this.timeClock.now % 1000 > 985 && tmp>50) {
            this.enemy_bullets.create(this.enemies[i].x, this.enemies[i].y, 'bullet', 0, false, false);
            this.bullet = this.enemy_bullets.getFirstDead();
            this.bullet.setActive(true);
            this.bullet.setVisible(true);
            this.bullet.setScale(1);
            this.physics.moveTo(this.bullet, this.hero.x, this.hero.y, 100);
        }
    }



    if (this.timeClock.now % 1000 > 985 && this.enemies.length < 15) {

        let x = Math.floor(Math.random() * 800);
        let y = 0;
        let tmp_enem = this.physics.add.sprite(x, y, 'enemy');
        
        tmp_enem.setCollideWorldBounds(true);
        tmp_enem.setBounce(1);
        this.enemies.push(tmp_enem);
    }


    this.hero.setVelocityX(0)
    this.hero.setVelocityY(0)
    if (cursorKeys.right.isDown && cursorKeys.down.isDown) {
        this.hero.setVelocityY(160);
        this.hero.setVelocityX(160);
        this.hero.anims.play('right',true);
    } else if (cursorKeys.left.isDown && cursorKeys.down.isDown) {
        this.hero.setVelocityY(160);
        this.hero.setVelocityX(-160);
        this.hero.anims.play('left',true);
    } else if (cursorKeys.right.isDown && cursorKeys.up.isDown) {
        this.hero.setVelocityY(-160);
        this.hero.setVelocityX(160);
        this.hero.anims.play('right',true);
    } else if (cursorKeys.left.isDown && cursorKeys.up.isDown) {
        this.hero.setVelocityY(-160);
        this.hero.setVelocityX(-160);
        this.hero.anims.play('left',true);
    } else if (cursorKeys.up.isDown) {
        this.hero.anims.play('right',true);
        this.hero.setVelocityY(-160);
    } 
    else if (cursorKeys.down.isDown) {
        this.hero.anims.play('right',true );
        this.hero.setVelocityY(160);
    } 
    else if (cursorKeys.left.isDown) {
        this.hero.setVelocityX(-160);
        this.hero.anims.play('left',true );
    } 
    else if (cursorKeys.right.isDown) {
        this.hero.setVelocityX(160);
        this.hero.anims.play('right',true);
    } else {
        this.hero.anims.play('stop' );
    
    }

    
}

function addScore(val) {
    this.score+=val;
}