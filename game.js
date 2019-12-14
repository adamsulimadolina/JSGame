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

        this.scene.physics.moveTo(this, x, y, 600);
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
            classType: Bullet
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
    }

    preload ()
    {
        this.load.image('bullet', 'bullet01.png');
        this.load.image('ball', 'ball.png');
    }

    create ()
    {
        this.bullets = new Bullets(this);

        this.ball = this.physics.add.sprite(400,300,'ball');
        this.ball.setCollideWorldBounds(true);
        this.input.on('pointerdown', (pointer) => {

            this.bullets.fireBullet(pointer.x, pointer.y, this.ball.x, this.ball.y);

        });
    }

    update() 
    {
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
    scene: Main
};

let game = new Phaser.Game(config);
