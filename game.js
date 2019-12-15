class Hero extends Phaser.Physics.Arcade.Sprite
{
    constructor (scene, x, y)
    {
        super(scene, x, y, 'ball');
        this.sprite = scene.physics.add.sprite(x,y,'ball');
        this.sprite.setScale(2);
        this.sprite.health = 100;
        this.sprite.setCollideWorldBounds(true);
    }
}

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
        const map = this.make.tilemap({key: 'cybernoid'});
        const tileset = map.addTilesetImage("cybernoid.png", 'gameTiles');
        const layer = map.createDynamicLayer("Ground", tileset, 0, 0);
        layer.setCollisionByExclusion([ -1 ]);
        
        console.log(layer);


        this.timeClock = new Phaser.Time.Clock(this);
        this.timeClock.start();

        this.bullets = new Bullets(this);
        this.ball = new Hero(this, 400, 300);
       
        this.input.on('pointerdown', (pointer) => {

            this.bullets.fireBullet(pointer.x, pointer.y, this.ball.sprite.x, this.ball.sprite.y);

        });
        
        this.physics.world.addCollider(this.ball, layer);

        this.physics.world.addCollider(this.enemies, this.bullets, function(enemy, bullet) {
            enemy.destroy();
            bullet.destroy();
        });

        this.physics.world.addCollider(this.ball.sprite, this.enemies, function(sprite, enemy) {
            console.log(sprite);
            sprite.health-=55;
            enemy.destroy();
            
        });
    }

    update() 
    {
        if(this.ball.sprite.health <= 0) this.scene.restart();

        for(let i=0; i<this.enemies.length; i++) {
            if(this.enemies[i].active === false) console.log(this.enemies.splice(i,1));
        }

        if(this.timeClock.now % 1000 > 985 && this.enemies.length < 3)
        {
            
            let x = Math.floor(Math.random() * 800);
            let y = Math.floor(Math.random() * 600);
            let tmp_enem = this.physics.add.sprite(x, y, 'enemy');
            let tmp_num = Math.floor(Math.random() * 5);
            if(tmp_num === 0) tmp_enem.setVelocityX(100);
            else if(tmp_num === 1) tmp_enem.setVelocityX(-200);
            else if(tmp_num === 2) tmp_enem.setVelocityY(-200);
            else if(tmp_num === 3) tmp_enem.setVelocityY(200);
            else if(tmp_num === 4) {
                tmp_enem.setVelocityX(200);
                tmp_enem.setVelocityY(-200);
            }
            tmp_enem.setCollideWorldBounds(true);
            tmp_enem.setBounce(1);
            this.enemies.push(tmp_enem);
        }
        var cursorKeys = this.input.keyboard.createCursorKeys();
        if(cursorKeys.up.isDown) {
            this.ball.sprite.setVelocityY(-160);
        } else if (cursorKeys.down.isDown) {
            this.ball.sprite.setVelocityY(160);
        } else {
            this.ball.sprite.setVelocityY(0);
        }
        if (cursorKeys.left.isDown) {
            this.ball.sprite.setVelocityX(-160);
        } else if (cursorKeys.right.isDown) {
            this.ball.sprite.setVelocityX(160);
        } else {
            this.ball.sprite.setVelocityX(0);
        }
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

function destroyEnemy(enemyList, enemy) {
    for(let i = 0; i< enemyList.length; i++) {
        if(enemy === enemyList[i]) enemyList.slice(i,1);
        break;
    }
    return enemyList;
}