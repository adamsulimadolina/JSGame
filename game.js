class Bullet extends Phaser.Physics.Arcade.Sprite
{
    constructor (scene, x, y)
    {
        super(scene, x, y, 'bullet');
    }

    fire (x, y, hero_x, hero_y)
    {
        this.body.reset(hero_x, hero_y);

        this.setActive(true);
        this.setVisible(true);
        this.setScale(2);

        this.scene.physics.moveTo(this, x, y, 1000);
    }

    preUpdate (time, delta)
    {
        super.preUpdate(time, delta);

        if (this.y <= -32)
        {
            this.setActive(false);
            this.setVisible(false);
        }
    }
}

class Bullets extends Phaser.Physics.Arcade.Group
{
    constructor (scene)
    {
        super(scene.physics.world, scene);

        this.createMultiple({
            frameQuantity: 9999,
            key: 'bullet',
            active: false,
            visible: false,
            classType: Bullet,
        });
    }

    fireBullet (x, y, hero_x, hero_y)
    {
        let bullet = this.getFirstDead(false);

        if (bullet)
        {
            bullet.fire(x, y, hero_x, hero_y);
        }
    }
}

class Main extends Phaser.Scene
{
    constructor ()
    {
        super();

        this.bullets;
        this.ball;
        this.enemy;
        this.map;
        this.backgroundLayer;
        this.enemies = [];

    }

    preload ()
    {
        this.load.image('bullet', 'bullet01.png');
        this.load.image('ball', 'ball.png');
        this.load.image('enemy', 'ball.png');

        
        this.load.tilemapTiledJSON('cybernoid', 'cybernoid.json');
        this.load.image('gameTiles', 'cybernoid.png');
        
    }

    create ()
    {
        this.timeClock = new Phaser.Time.Clock(this);
        this.timeClock.start();

        this.bullets = new Bullets(this);

        this.ball = this.physics.add.sprite(400,300,'ball');
        this.ball.setCollideWorldBounds(true);
        this.ball.setScale(2);


        const map = this.make.tilemap({key: 'cybernoid'});
        const tileset = map.addTilesetImage('XD', 'gameTiles');
        const background = map.createStaticLayer('bg', tileset, 0, 0);
       
        this.input.on('pointerdown', (pointer) => {

            this.bullets.fireBullet(pointer.x, pointer.y, this.ball.x, this.ball.y);

        });
        this.physics.world.addCollider(this.enemies, this.bullets, this.killEnemy);
    }

    update() 
    {
        if(this.timeClock.now % 1000 > 998)
        {
            
            let x = Math.floor(Math.random() * 800);
            let y = Math.floor(Math.random() * 600);
            let tmp_enem = this.physics.add.sprite(x, y, 'enemy');
            this.enemies.push(tmp_enem);
        }
        var cursorKeys = this.input.keyboard.createCursorKeys();
        if(cursorKeys.up.isDown) {
            this.ball.setVelocityY(-160);
        } else if (cursorKeys.down.isDown) {
            this.ball.setVelocityY(160);
        } else {
            this.ball.setVelocityY(0);
        }
        if (cursorKeys.left.isDown) {
            this.ball.setVelocityX(-160);
        } else if (cursorKeys.right.isDown) {
            this.ball.setVelocityX(160);
        } else {
            this.ball.setVelocityX(0);
        }
    }
    killEnemy(enemy, bullet) {
        enemy.setActive(false);
        enemy.setVisible(false);
        bullet.setActive(false);
        bullet.setVisible(false);
    }
    
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'phaser-example',
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { y: 0 }
        }
    },
    scene: Main,
    render: { pixelArt: true, antialias: false, autoResize: false }
};

let game = new Phaser.Game(config);
