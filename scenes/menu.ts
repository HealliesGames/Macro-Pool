import { GAME_HEIGHT, GAME_WIDTH } from "../game";

export class Menu extends Phaser.Scene {
    title : Phaser.GameObjects.Sprite;
    spaceOverlay : Phaser.GameObjects.TileSprite;

    createdSpace : boolean;
    createdMenu : boolean;

    sun : Phaser.GameObjects.Sprite;
    txInfoSun : Phaser.GameObjects.BitmapText;            // Information show.  
    txInfoHow : Phaser.GameObjects.BitmapText;            // Information show. 
    hoverTween : Phaser.Tweens.Tween;

    howTo : Phaser.GameObjects.Sprite;

    classicHiScore : String;

    constructor() {
        // Scene identifier.
        super({ key: "Menu" });
      }

    create(){

      // Load the hi-score saved.
      var hs = localStorage.getItem("classic_hiscore");
      this.classicHiScore = hs == null ? "0" : hs;

      // Add the overlay with "ADD" blend mode.
      this.spaceOverlay = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, "space_overlay").setOrigin(0, 0);
      this.spaceOverlay.setBlendMode(Phaser.BlendModes.ADD);
      this.spaceOverlay.setTint(0x0000FF);
      this.spaceOverlay.setDepth(1);
      this.spaceOverlay.setAlpha(0);

      this.title = this.add.sprite(GAME_WIDTH / 2, 96, "title").setAlpha(0);
      this.sun = this.add.sprite(GAME_WIDTH / 2, GAME_HEIGHT - 96, "sun").setAlpha(0);
      this.sun.setDepth(3); 
      this.howTo = this.add.sprite( this.sun.x, this.sun.y + 48, "howto").setAlpha(0);

      this.createdSpace = false;
      this.createdMenu = false;

      this.tweens.add({
        targets: this.spaceOverlay,
        alpha: .5,
        duration: 1000,
        delay: 2000,
        onStart: function(){this.sound.play("snap");},
        onStartScope: this,
        onComplete: function(){},
        onCompleteScope: this
      })

      this.tweens.add({
        targets: [this.title, this.sun, this.howTo],
        alpha: 1,
        duration: 2000,
        delay: 5000,
        onStart: function(){this.sound.play("snap"); this.createdSpace = true;},
        onStartScope: this,
        onComplete: function(){ this.sun.setInteractive();   this.howTo.setInteractive();
        this.hoverTween.stop(); this.sun.setScale(.7);},
        onCompleteScope: this
      })

      this.hoverTween = this.tweens.add({
        targets: this.sun,
        scale: 1,
        yoyo: true,
        duration: 700,
        repeat: -1,
        ease: "Linear"
      });
      this.sun.setScale(.7);

      this.txInfoSun = new Phaser.GameObjects.BitmapText(this, this.sun.x, this.sun.y - 48, "game", "", 11, 1);
      this.txInfoSun.setText("NAME: SOLAR SYSTEM\nMODE: PLAY\nHI-SCORE: " + this.classicHiScore);
      
      this.txInfoSun.setOrigin(.5,.5);
      this.txInfoSun.setDepth(12);
      this.txInfoSun.setScale(0);
      this.txInfoSun.setAlpha(0);
      this.add.existing(this.txInfoSun);

      

      this.txInfoHow = new Phaser.GameObjects.BitmapText(this, this.howTo.x, this.howTo.y + 24, "game", "HOW TO PLAY", 11, 1);
      this.txInfoHow.setOrigin(.5,.5);
      this.txInfoHow.setDepth(12);
      this.txInfoHow.setScale(0);
      this.txInfoHow.setAlpha(0);
      this.add.existing(this.txInfoHow);

      // How to mouse interactions.
      this.howTo.on("pointerover", function(pointer){
        this.sound.play("hover");
        this.howTo.setTexture("howto_hover");

        this.tweens.add({
          targets: this.txInfoHow,
          scale: 1,
          alpha: 1,
          duration: 200
        });

      }, this);

      this.howTo.on("pointerout", function(pointer){
        this.howTo.setTexture("howto");
        this.tweens.add({

          targets: this.txInfoHow,
          scale: 0,
          alpha: 0,
          duration: 200
        });
      }, this);

      this.howTo.on("pointerdown", function(pointer){
        this.scene.start("Tutorial");
      }, this);

      // Sun mouse interactions.
      this.sun.on("pointerover", function(pointer){
        this.sound.play("hover");
        this.hoverTween.play(false);

        this.tweens.add({
          targets: this.txInfoSun,
          scale: 1,
          alpha: 1,
          duration: 200
        });
      }, this);


      this.sun.on("pointerout", function(pointer){
        this.hoverTween.stop();
        this.sun.setScale(.7);
        
        this.tweens.add({
          targets: this.txInfoSun,
          scale: 0,
          alpha: 0,
          duration: 200
        });
      }, this);

      this.sun.on("pointerdown", function(pointer){
        this.scene.start("Play");
      }, this);
    }

    update() {
        // Shift the space overlay.
        this.spaceOverlay.tilePositionX += .5;

      if(this.createdSpace) {
        // Create 5 stars per frame.
        for(let i = 0; i < 5; i++)
          this.createStar();
      }
    }

    createStar() {
      // Create star sprite.
      var star = this.add.sprite(Math.random() * GAME_WIDTH, Math.random() * GAME_HEIGHT, "star");
      star.setDepth(2);
  
      // Star random size.
      star.setScale(Math.random());
  
      // Star random alpha.
      star.setAlpha(Math.random());
      
      // Star random colour.
      let color = Phaser.Display.Color.GetColor(255 - Math.random() * 255, 255 - Math.random() * 255, 255);
      star.setTint(color);
  
      // Star blend mode.
      star.setBlendMode(Phaser.BlendModes.ADD);
      
      // Star animation.
      this.tweens.add({
        targets: star,
        scale: 0,
        alpha: 0,
        x: star.x - star.scale * 20,
        duration: 1000 * star.alpha,
  
        onComplete: function(){
          this.destroy();
        },
      
        onCompleteScope: star
      })
    }
}