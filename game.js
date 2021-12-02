import Phaser, { Game } from 'phaser'

let welcometext = 'Welcome! \n The goal of this game is to land as many flips \n as you can while avoiding death. \n While in mid-air, spin by holding SPACE. \n Land with your feet down, otherwise you will die! \n\n Click to start!'

class WelcomeScene extends Phaser.Scene {

    constructor() {
        super('WelcomeScene');
    }

    preload() {
        this.load.image('sky', 'assets/sky.png');
    }
    create() {
        this.add.image(400, 300, 'sky');
        this.add.text(100,200, welcometext, {align: 'center', fontSize: 20});

        // Start game on click
        this.input.on('pointerup', function (pointer) {
            this.scene.start('GameScene');
        }, this);
    }
}

var score;
var flips;
var platforms;
var player;
var cursors;
var touchTriggered;
var flipped;
var success;
class GameScene extends Phaser.Scene {

    constructor()
    {
        super('GameScene');
    }

    preload ()
    {
        this.load.audio('success', 'assets/flip_success.wav')
        this.load.image('bomb', 'assets/bomb.png');
        this.load.image('sky', 'assets/sky.png');
        this.load.image('star', 'assets/star.png');
        this.load.image('ground', 'assets/platform.png');
        this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48});
    }

    create ()
    {
        success = this.sound.add('success', { loop: false });
        if (youDied != null) {
            youDied.stop();
        }
        touchTriggered = true;  // needed to prevent flip counter from
                                // going up when just standing still
        flips = 0;              
        cursors = this.input.keyboard.createCursorKeys();
        platforms = this.physics.add.staticGroup();
        
        this.add.image(400, 300, 'sky');
        platforms.create(0, 600, 'ground').setScale(2).refreshBody();
        platforms.create(300, 600, 'ground').setScale(2).refreshBody();
        platforms.create(450, 600, 'ground').setScale(2).refreshBody();

        player = this.physics.add.sprite(100, 400, 'dude');
        player.setCollideWorldBounds(true);
        player.body.allowRotation = true;
        this.physics.add.collider(player, platforms);

        score = this.add.text(25, 25, 'Flips: ' + flips);
        
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3}),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'turn',
            frames: [{ key: 'dude', frame: 4}],
            frameRate: 20
        });
        
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8}),
            frameRate: 10,
            repeat: -1
        });
    }

    update ()
    {
        if (cursors.left.isDown) 
        {
            player.setVelocityX(-200);
            player.anims.play('left', true);
        } else if (cursors.right.isDown) 
        {
            player.setVelocityX(200);
            player.anims.play('right', true);
        } else 
        {
            player.setVelocityX(0);
            player.anims.play('turn');
        }

        // Hold Space in mid-air to spin
        if (!player.body.touching.down && cursors.space.isDown)
        {
            player.body.angularVelocity = -300;
            flipped = true;
        } else if (player.body.angularVelocity != 0)
        {
            player.body.angularVelocity = 0;
        }

        if(player.body.touching.down)
        {
            // If the player lands on his head
            if (player.angle > 90 || player.angle < -90)
            {
                this.scene.start('GameOverScene');

            } else if (!touchTriggered && flipped)
            {
                flips += 1;
                score.setText('Flips: '+flips);
                touchTriggered = true;
                this.addBomb();
                success.play();
            }

            player.body.angularVelocity = 0;
            player.angle = 0;
        }

        if (cursors.up.isDown && player.body.touching.down)
        {
            player.setVelocityY(-400);
            touchTriggered = false;
            flipped = false;
        }
    }

    addBomb() {
        var posY = 50;
        var posX = Phaser.Math.Between(100, 700);
        var bomb = this.physics.add.sprite(posX, posY, 'bomb').setScale(1.5).refreshBody();

        if (Math.random() > 0.5) {
            //bomb.setVelocityX(10);
            bomb.body.velocity.x = 100;
        } else {
            //bomb.setVelocityX(-10);
            bomb.body.velocity.x = -100;
        }
        this.physics.add.collider(platforms, bomb);
        bomb.setBounce(1).setCollideWorldBounds(true);
        this.physics.add.overlap(player, bomb, () => {
            this.scene.start("GameOverScene")
        });
    }
}

var youDied;
let gameOverText = 'YOU DIED\n Click to start over...'

class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOverScene')
    }
    preload()
    {    
        this.load.audio("youDied", ["assets/snake_death.mp3"])
        this.load.image('skyGray', 'assets/Sky_gray.png');
    }
    create()
    {
        youDied = this.sound.add('youDied', { loop: false });
        youDied.play();
        this.add.image(400, 300, 'skyGray');
        this.add.text(125, 250, gameOverText, {fontSize: 40, color: '#FF0000', fontWeight: 'bold', align : 'center'})

        this.input.on('pointerup', function (pointer) {
            this.scene.start('GameScene');
        }, this);
    }
}

var config = {
    type: Phaser.WEBGL,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 500},
            debug: false
        }
    },
    scene: [WelcomeScene, GameScene, GameOverScene]
};

var game = new Phaser.Game(config);