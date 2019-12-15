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
            bullets: null,
            time: 0,
            enemies: [],
        }
    }
};

let game = new Phaser.Game(config);

function preload() {
    this.load.image('bullet', 'bullet01.png');
    this.load.image('ball', 'ball.png');
    this.load.image('enemy', 'ball.png');


    this.load.tilemapTiledJSON('cybernoid', 'cybernoid.json');
    this.load.image('gameTiles', 'cybernoid.png');
}

function create() {
    const map = this.make.tilemap({ key: 'cybernoid' });
    const tileset = map.addTilesetImage("cybernoid.png", 'gameTiles');
    const layer = map.createDynamicLayer("Ground", tileset, 0, 0);
    layer.setCollisionByExclusion([-1]);

    this.hero = this.physics.add.sprite(400, 300, 'ball');
    this.hero.setScale(2);
    this.hero.health = 100;
    this.hero.setCollideWorldBounds(true);
    

    // this.bullets = this.add.group();
    // this.bullets.createMultiple({
    //     frameQuantity: 9999,
    //     key: 'bullet',
    //     active: false,
    //     visible: false,
    // });


    this.timeClock = new Phaser.Time.Clock(this);
    this.timeClock.start();
    
    this.bullets = this.physics.add.group();

    this.input.on('pointerdown', (pointer) => {

        this.bullets.create(this.hero.x, this.hero.y, 'bullet', 0, false, false);
        this.bullet = this.bullets.getFirstDead();
        console.log(this.bullet);
        this.bullet.setActive(true);
        this.bullet.setVisible(true);
        this.bullet.setScale(2);
        this.physics.moveTo(this.bullet, pointer.x, pointer.y, 1000);
    });


    this.physics.world.addCollider(this.enemies, this.bullets, function (enemy, bullet) {
        console.log("XD")
        enemy.destroy();
        bullet.destroy();
    });

    this.physics.world.addCollider(this.hero, this.enemies, function (sprite, enemy) {
        sprite.health -= 55;
        enemy.destroy();

    });
}

function update() {

    if (this.hero.health <= 0) this.scene.restart();

    for (let i = 0; i < this.enemies.length; i++) {
        if (this.enemies[i].active === false) console.log(this.enemies.splice(i, 1));
    }

    if (this.timeClock.now % 1000 > 985 && this.enemies.length < 3) {

        let x = Math.floor(Math.random() * 800);
        let y = Math.floor(Math.random() * 600);
        let tmp_enem = this.physics.add.sprite(x, y, 'enemy');
        let tmp_num = Math.floor(Math.random() * 5);
        if (tmp_num === 0) tmp_enem.setVelocityX(100);
        else if (tmp_num === 1) tmp_enem.setVelocityX(-200);
        else if (tmp_num === 2) tmp_enem.setVelocityY(-200);
        else if (tmp_num === 3) tmp_enem.setVelocityY(200);
        else if (tmp_num === 4) {
            tmp_enem.setVelocityX(200);
            tmp_enem.setVelocityY(-200);
        }
        tmp_enem.setCollideWorldBounds(true);
        tmp_enem.setBounce(1);
        this.enemies.push(tmp_enem);
    }
    var cursorKeys = this.input.keyboard.createCursorKeys();
    if (cursorKeys.up.isDown) {
        this.hero.setVelocityY(-160);
    } else if (cursorKeys.down.isDown) {
        this.hero.setVelocityY(160);
    } else {
        this.hero.setVelocityY(0);
    }
    if (cursorKeys.left.isDown) {
        this.hero.setVelocityX(-160);
    } else if (cursorKeys.right.isDown) {
        this.hero.setVelocityX(160);
    } else {
        this.hero.setVelocityX(0);
    }
}


function destroyEnemy(enemyList, enemy) {
    for (let i = 0; i < enemyList.length; i++) {
        if (enemy === enemyList[i]) enemyList.slice(i, 1);
        break;
    }
    return enemyList;
}

function fireBullet(x, y, hero_x, hero_y, bullets) {
    let bullet = bullets.getFirstDead(false);
    if (bullet) {
        //bullet.body.reset(hero_x, hero_y);
        fire(x, y, hero_x, hero_y, bullet);
    }
}

function fire(x, y, hero_x, hero_y, bullet) {
    //bullet.body.reset(hero_x, hero_y);

    bullet.setActive(true);
    bullet.setVisible(true);
    bullet.setScale(2);
    world.physics.moveTo(bullet, x, y, 1000);
}