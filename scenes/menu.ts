import { GAME_HEIGHT, GAME_WIDTH } from "../game";

export class Menu extends Phaser.Scene {
    title : Phaser.GameObjects.Sprite;
    spaceOverlay : Phaser.GameObjects.TileSprite;

    createdSpace : boolean;
    createdMenu : boolean;

    sun : Phaser.GameObjects.RenderTexture;
    centauri : Phaser.GameObjects.RenderTexture;

    sunTile : Phaser.GameObjects.TileSprite;
    centauriTile : Phaser.GameObjects.TileSprite;

    sunFrame : Phaser.GameObjects.Image;
    sunMask : Phaser.GameObjects.Image;
    txInfoSun : Phaser.GameObjects.BitmapText;            // Information show.  
    txInfoCentauri : Phaser.GameObjects.BitmapText;
    txInfoHow : Phaser.GameObjects.BitmapText;            // Information show. 
    rotSun : boolean;
    rotCent : boolean;

    howTo : Phaser.GameObjects.Sprite;

    sunHiScore : String;
    centauriHiScore : String;
    

    constructor() {
        // Scene identifier.
        super({ key: "Menu" });
      }

    create(){

      // Load CLASSIC hi-score saved.
      var hs = localStorage.getItem("sun_hiscore");
      this.sunHiScore = hs == null ? "0" : hs;

      // Load TIME ATTACK hi-score saved.
      hs = localStorage.getItem("centauri_hiscore");
      this.centauriHiScore = hs == null ? "0" : hs;

      // Add the overlay with "ADD" blend mode.
      this.spaceOverlay = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, "space_overlay").setOrigin(0, 0);
      this.spaceOverlay.setBlendMode(Phaser.BlendModes.ADD);
      this.spaceOverlay.setTint(0x0000FF);
      this.spaceOverlay.setDepth(1);
      this.spaceOverlay.setAlpha(0);

      this.title = this.add.sprite(GAME_WIDTH / 2, 96, "title").setAlpha(0);

      this.sun = this.add.renderTexture(GAME_WIDTH / 2 - 32, GAME_HEIGHT - 96, 48, 48).setAlpha(0);
      this.sun.setDepth(3); 
      this.sun.setOrigin(.5); 

      this.centauri = this.add.renderTexture(GAME_WIDTH / 2 + 32, GAME_HEIGHT - 96, 48, 48).setAlpha(0);
      this.centauri.setDepth(3); 
      this.centauri.setOrigin(.5); 

      // Create alpha centauri tile sprite.
      this.centauriTile = new Phaser.GameObjects.TileSprite(this, this.centauri.x, this.centauri.y, 48, 48, "alpha_centauri");

      // Create sun tile sprite.
      this.sunTile = new Phaser.GameObjects.TileSprite(this, this.sun.x, this.sun.y, 48, 48, "sun");

      // Create the sphere mask and set its blend mode to ERASE.
      this.sunMask = new Phaser.GameObjects.Image(this, this.sun.x, this.sun.y, "sun_mask");
      this.sunMask.setBlendMode(Phaser.BlendModes.ERASE);

      // Create the edge mask and set its blend mode to MULTIPLY.
      this.sunFrame = new Phaser.GameObjects.Image(this, this.sun.x, this.sun.y, "sun_edge");
      this.sunFrame.setBlendMode(Phaser.BlendModes.ADD);

      this.howTo = this.add.sprite(GAME_WIDTH / 2, this.sun.y + 48, "howto").setAlpha(0);

      this.createdSpace = false;
      this.createdMenu = false;
      this.rotSun = this.rotCent = false;

      this.tweens.add({
        targets: this.spaceOverlay,
        alpha: .5,
        duration: 1000, 
        delay: 2000,
        onStart: function(){this.sound.play("snap");},
        onStartScope: this,
      })

      this.tweens.add({
        targets: [this.title, this.sun, this.howTo, this.centauri],
        alpha: 1,
        duration: 2000,
        delay: 5000,
        onStart: function(){this.sound.play("snap"); this.createdSpace = true;
        this.sun.setInteractive(); this.howTo.setInteractive(); this.centauri.setInteractive();},
        onStartScope: this
      })


      this.txInfoSun = new Phaser.GameObjects.BitmapText(this, this.sun.x, this.sun.y - 48, "game", "", 11, 1);
      this.txInfoSun.setText("NAME: SOLAR SYSTEM\nMODE: CLASSIC\nHI-SCORE: " + this.sunHiScore);
      
      this.txInfoSun.setOrigin(.5,.5);
      this.txInfoSun.setDepth(12);
      this.txInfoSun.setScale(0);
      this.txInfoSun.setAlpha(0);
      this.add.existing(this.txInfoSun);

      this.txInfoCentauri = new Phaser.GameObjects.BitmapText(this, this.centauri.x, this.centauri.y - 48, "game", "", 11, 1);
      this.txInfoCentauri.setText("NAME: ALPHA CENTAURI\nMODE: TIME ATTACK\nHI-SCORE: " + this.centauriHiScore);
      
      this.txInfoCentauri.setOrigin(.5,.5);
      this.txInfoCentauri.setDepth(12);
      this.txInfoCentauri.setScale(0);
      this.txInfoCentauri.setAlpha(0);
      this.add.existing(this.txInfoCentauri);
      

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
        this.rotSun = true;

        this.tweens.add({
          targets: this.txInfoSun,
          scale: 1,
          alpha: 1,
          duration: 200
        });
      }, this);


      this.sun.on("pointerout", function(pointer){
        this.rotSun = false;
        this.tweens.add({
          targets: this.txInfoSun,
          scale: 0,
          alpha: 0,
          duration: 200
        });
      }, this);

      this.sun.on("pointerdown", function(pointer){
        this.scene.start("PlaySun");
      }, this);


      // Alpha centauri mouse interactions
      this.centauri.on("pointerover", function(pointer){
        this.sound.play("hover");
        this.rotCent = true;

        this.tweens.add({
          targets: this.txInfoCentauri,
          scale: 1,
          alpha: 1,
          duration: 200
        });
      }, this);


      this.centauri.on("pointerout", function(pointer){
        this.rotCent = false;
        this.tweens.add({
          targets: this.txInfoCentauri,
          scale: 0,
          alpha: 0,
          duration: 200
        });
      }, this);

      this.centauri.on("pointerdown", function(pointer){
        this.scene.start("PlayCentauri");
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

      // If sun hovered, rotate.
      if(this.rotSun)
        this.sunTile.tilePositionX += 1;

      // If centauri hovered, rotate.
      if(this.rotCent)
        this.centauriTile.tilePositionX += 1;

      // Draw sun sphere
      this.sun.draw([this.sunTile, this.sunMask, this.sunFrame], 24, 24);

      // Draw alpha centauri sphere
      this.centauri.draw([this.centauriTile, this.sunMask, this.sunFrame], 24, 24);
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