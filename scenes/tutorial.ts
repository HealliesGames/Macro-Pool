import { CelestialBody } from "../classes/celestial_body";
import { Moon } from "../classes/moon";
import { GAME_HEIGHT, GAME_WIDTH } from "../game";

export class Tutorial extends Phaser.Scene {

    spaceOverlay : Phaser.GameObjects.TileSprite;

    howTo : Phaser.GameObjects.Sprite;

    moon : Moon
    blackHole : Phaser.GameObjects.Sprite;
    planets : CelestialBody[] = [];

    txTutorial : Phaser.GameObjects.BitmapText;
    tutorialStr : String[] = [];
    tutIndex : number;
  
    constructor() {
        // Scene identifier.
        super({ key: "Tutorial" });
      }
    
      create(){

      // Active Bounds.
      this.matter.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT, 64, true, true, true, true);

      // Add the overlay with "ADD" blend mode.
      this.spaceOverlay = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, "space_overlay").setOrigin(0, 0);
      this.spaceOverlay.setBlendMode(Phaser.BlendModes.ADD);
      this.spaceOverlay.setDepth(1);
      this.spaceOverlay.setAlpha(.3);

      // Instantiate moon.
      this.moon = new Moon(this, GAME_WIDTH / 2, GAME_HEIGHT / 2, 0);
      this.moon.canShoot = true;
      this.blackHole = this.add.sprite(-64, -64, "black_hole");
      
      // Tutorial strings
      this.tutorialStr[0] = "USE MOUSE TO AIM\n(RIGHT CLICK FOR CONTINUE)";
      this.tutorialStr[1] = "HOLD LEFT BUTTON TO CHARGE\nAND RELEASE TO SHOOT";
      this.tutorialStr[2] = "RELEASE LEFT BUTTON ON MOON TO\nCANCEL CHARGE";
      this.tutorialStr[3] = "USE THE MOON TO PROPEL PLANETS\nINTO BLACK HOLE";
      this.tutorialStr[4] = "CLASSIC MODE:\nTHE FX WILL CHANGE EVERY\nTURN DEPENDING ON WHICH PLANET IS\n NEAREST THE MOON";
      this.tutorialStr[5] = "PLACE CURSOR ON MOON TO SHOW\nNEAREST PLANET";
      this.tutorialStr[6] = "TIME ATTACK MODE:\nTHE FX WILL CHANGE EVERY\n5 SECONDS RANDOMLY";
      this.tutorialStr[7] = "TO QUIT A GAME,\nHOLD RIGHT BUTTON FOR 3 SECONDS";
      this.tutorialStr[8] = "ESTABLISH THE HIGHEST RECORD YOU CAN";

      this.tutIndex = 0;
      //@ts-ignore
      this.txTutorial = this.add.bitmapText(GAME_WIDTH / 2, 8, "game", this.tutorialStr[0], 20, 1).setOrigin(.5, 0);
      this.txTutorial.setDepth(10);

      this.input.on('pointerdown', function (pointer) {
        if (pointer.rightButtonDown()) {
          this.tutIndex ++;
          this.txTutorial.setText(this.tutorialStr[this.tutIndex]);

          if(this.tutIndex == 3){
            for(let i = 0; i < 2; i++) {
              let p = new CelestialBody(this,  GAME_WIDTH / 2 - 16 + (i*32), GAME_HEIGHT / 2, 0, i);
              this.planets.push(p);
            } 
          }

          if(this.tutIndex == 9) {
            // Clear
            this.moon.render.destroy();
            this.moon.destroy();
 
            for(let i = 0; i < this.planets.length; i++) {
              this.planets[i].render.destroy();
              this.planets[i].destroy();
            } 
            this.planets = [];

            // Start new scene
            this.scene.start("Menu");
          }

          this.sound.play("bounce");
        }
      }, this);

      }

      update(){
        this.moon.update();

        for(let i = 0; i < this.planets.length; i++) {
          // Update planets behaviour.
          this.planets[i].update();
        }

        this.spaceOverlay.tilePositionX += .5;
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