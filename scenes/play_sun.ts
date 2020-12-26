import { GAME_WIDTH, GAME_HEIGHT, shaderDistortion, cbody, randomNumber, CB_SIZE} from "../game";
import { CelestialBody } from "../classes/celestial_body";
import { BlackHole } from "../classes/black_hole";
import { Moon } from "../classes/moon";

export class PlaySun extends Phaser.Scene {

  space : Phaser.GameObjects.Sprite;            // Space background.
  spaceOverlay : Phaser.GameObjects.TileSprite; // Space moving overlay.

  planets : CelestialBody[] = [];               // Planets list.
  moon : Moon;                                  // Moon object.
  blackHole : BlackHole;                        // Black hole object.
  bChangedPos : boolean                         // Detect if black hole changed position per turn.

  start : boolean                               // Is game started.
  moonCooldown : boolean                        // Cooldown time before shoot again.
  moonNearestPlanet : CelestialBody;
  moonCanShoot : boolean;

  isEarthquake : boolean;
  distortionPipeline : Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline;

  txFx : Phaser.GameObjects.BitmapText;
  txTimer : Phaser.GameObjects.BitmapText;     
  
  elapsedTime : number;
  nShoot : number;
  nMoonBlack : number;

  quit : number;
  txQuit : Phaser.GameObjects.BitmapText;

  constructor() {
    // Scene identifier.
    super({ key: "PlaySun" });
  }

  create() {

    // Set up point subtractors
    this.elapsedTime = this.nShoot = this.nMoonBlack = 0;

     //@ts-ignore Create distortion pipeline.
      this.distortionPipeline = this.game.renderer.addPipeline("distortion",
      new Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline ({game: this.game,
      renderer: this.game.renderer, fragShader: shaderDistortion}));

      // Set pipeline resolution.
      this.distortionPipeline.setFloat2("resolution", GAME_WIDTH, GAME_HEIGHT);

      // Add pipeline to camera rendering.
      this.cameras.main.setRenderToTexture(this.distortionPipeline);
    

    // Add the space.
    this.space = this.add.sprite(0, 0, "space_texture").setOrigin(0, 0);
    this.space.setDepth(0);
    this.space.setAlpha(0);

    // Add the overlay with "ADD" blend mode.
    this.spaceOverlay = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, "space_overlay").setOrigin(0, 0);
    this.spaceOverlay.setBlendMode(Phaser.BlendModes.MULTIPLY);
    this.spaceOverlay.setDepth(1);

    // Create 100 stars at scene creation.
    for(var i = 0; i < 100; i++) {
      this.createStar();
    } 

    // Instantiate planets.
    for(let i = 0; i < 8; i++) {
      let p = new CelestialBody(this,  80 + (i*32), GAME_HEIGHT / 2, 0, i);
      this.planets.push(p);
    } 

    // Instantiate moon.
    this.moon = new Moon(this, this.planets[2].x, this.planets[2].y - CB_SIZE - 1, 0);
    this.moonCooldown = true;
    this.moonCanShoot = false;

    // Instantiate black hole.
    this.blackHole = new BlackHole(this, 0, 0, 0);
    this.bChangedPos = true;

    // Set world bounds.
    this.gmFxWarp(false);

    // Disable earthquake FX.
    this.isEarthquake = false;

    // Create bitmap text for show turn FX.
    this.txFx = new Phaser.GameObjects.BitmapText(this, 8, 16, "game", "FX: ", 18, 0).setOrigin(0, .5);
    this.txFx.setDepth(30);
    this.txFx.setAlpha(0);
    this.add.existing(this.txFx);
    
    // Showing quitting.
    this.txQuit = new Phaser.GameObjects.BitmapText(this, GAME_WIDTH / 2, GAME_HEIGHT / 2, "game", "QUITTING", 18, 0).setOrigin(.5);
    this.txQuit.setDepth(30);
    this.txQuit.setAlpha(0);
    this.add.existing(this.txQuit);

    // Small game presentation.
    this.presentation();
  }

  update() {
    if(this.input.activePointer.rightButtonDown()) {
      this.txQuit.setAlpha(this.quit / 180);
      this.quit ++;
      if(this.quit >= 180) {this.destroy_everything(); this.scene.start("Menu");}
    } else {  
      this.quit = 0;
      this.txQuit.setAlpha(0);
    }

    // Create 5 stars per frame.
    for(let i = 0; i < 5; i++)
      this.createStar();

    // Shift the space overlay.
    this.spaceOverlay.tilePositionX += .5;

    // If the game is started, moon can be shoot.
    var cShoot = false;
    if(this.start)
      if(this.moonCooldown)
        cShoot = true;
      else
        this.time.delayedCall(1000, function(){this.moonCooldown = true;}, [], this);

    for(let i = 0; i < this.planets.length; i++) {
      // Update planets behaviour.
      this.planets[i].update();

      // Less sensivity on resting bodies
      var rThres = this.planets[i].isSlide ||
                   this.planets[i].isGravity || 
                   this.planets[i].isRepulsion || 
                   this.planets[i].isAttraction ? .4 : 0;

      // Check if planets are moving.
      if(Math.abs(this.planets[i].body.velocity.x) > .1 + rThres || Math.abs(this.planets[i].body.velocity.y) > .1 + rThres)
        cShoot = false;

      // Delete in hole planets.
      if(this.planets[i].inHole) {
        this.planets[i].render.destroy();
        this.planets[i].destroy();
        this.planets.splice(i, 1);
      }
    } 

    // Update moon behaviour.
    if(this.moon != null) 
      this.moon.update();

      // Check if moon is moving.
      if(this.moon != null) 
        if(Math.abs(this.moon.body.velocity.x) > .1 || Math.abs(this.moon.body.velocity.y) > .1) 
          cShoot = false;  
      

      // Set moon can be shot again.
      if(this.moonCooldown) {
      
      // If black hole is swallowing planet, can't shoot.
      var isSwallowing = false;
      for(let i = 0; i < this.planets.length; i++) 

        // Detect if black hole is swallowing planet.
        if(this.planets[i].inHoleAnim) isSwallowing = true;

        // Activate nearest planet FX.
        if(cShoot && !this.moonCanShoot && !isSwallowing) {
          this.gmFxMini(false);
          this.gmFxWarp(false);
          this.isEarthquake = false;
          this.gmFxAttraction(false); 
          this.gmFxGravity(false);
          this.gmFxRepulsion(false); 
          this.gmFxBigHole(false); 
          this.gmFxSlide(false); 
        
          switch(this.moonNearestPlanet.pType) {
            case cbody.MERCURY: this.gmFxMini(true); 
            this.txFx.setText("FX: SHRINK (MINI PLANETS)"); break;
            case cbody.VENUS:   this.gmFxWarp(true); 
            this.txFx.setText("FX: WARP (NO BOUNDARIES)"); break;
            case cbody.EARTH:   this.isEarthquake = true; 
            this.txFx.setText("FX: EARTHQUAKE (SHAKE AT SHOOT)"); break;
            case cbody.MARS:    this.gmFxAttraction(true); 
            this.txFx.setText("FX: ATTRACTION (CALLING FORCE)"); break;
            case cbody.JUPITER: this.gmFxGravity(true); 
            this.txFx.setText("FX: GRAVITY (FALLING PLANETS)"); break;
            case cbody.SATURN:  this.gmFxRepulsion(true); 
            this.txFx.setText("FX: REPULSION (REJECTING FORCE)"); break;
            case cbody.URANUS:  this.gmFxBigHole(true); 
            this.txFx.setText("FX: SUPERMASSIVE (BLACK HOLE)"); break;
            case cbody.NEPTUNE: this.gmFxSlide(true); 
            this.txFx.setText("FX: SLIDE (MORE TRAVELLING)"); break;
          }

          // Appear FX text.
          this.tweens.add({
            targets: this.txFx,
            ease: "Bounce.easeInOut",
            alpha: 1,
            duration: 200,
            repeat: 3
          })

          if(this.planets.length > 0)
            this.sound.play("fx");

          // Moon can shoot.
          this.moonCanShoot = true;
        }
      }
      else 
        this.moonCanShoot = false;

      if(!this.bChangedPos && this.moonCooldown && this.moonCanShoot) {
          this.bChangedPos = true;

          if(this.planets.length > 0) {
            this.blackHole.spawn();

            this.time.delayedCall(2000, function(){
              if(this.moon == null)  {
              this.moon = new Moon(this, this.blackHole.x, this.blackHole.y, 0);
              this.moon.exiting = true;

              var upDown = this.blackHole.y < GAME_HEIGHT / 2 ? 1 : -1;
              var leftRight = this.blackHole.x < GAME_WIDTH / 2 ? 1 : -1;

              this.moon.setVelocity(randomNumber(2,4) * leftRight, randomNumber(2,4) * upDown);
              }
            }, [], this);
          

          }
          else {

            // Make black hole fill the screen.
            this.blackHole.spawnEnding();

            // Disable input and make moon disappear.
            
              this.start = false;
              this.moonCanShoot = false;
              this.input.off("pointerup");

              if(this.moon != null) {
                this.tweens.add({
                  targets: [this.moon.render, this.moon.txInfo, this.moon.iTarget],
                  alpha: 0,
                  duration: 1000,
                  ease: "Sine",
                  onComplete: function() {
                    if(this.moon != null) {
                      this.moon.render.destroy(); 
                      this.moon.txInfo.destroy();
                      this.moon.iTarget.destroy();
                      this.moon.destroy();
                      this.moon = null;
                    }
                  },
                  onCompleteScope: this
                })
              }
            

            // Disable FX text show.
            this.txFx.setVisible(false);
          }
      }

    if(this.moon != null)
      this.moon.canShoot = this.moonCanShoot;
    
    // Update black hole behaviour.
    this.blackHole.update();
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
    let color = Phaser.Display.Color.GetColor(255, 255 - Math.random() * 255, 255 - Math.random() * 255);
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


  presentation() {
  this.tweens.add({
      targets: this.space,
      alpha: 1,
      ease: "Linear",
      duration: 1500,
  })

    // Play finger snap sound effect.
    this.time.delayedCall(1500, function(){this.sound.play("snap")}, [], this);

    // Set moon size like solar system.
    this.moon.render.setScale(.1);

    // Adjust size.
     this.moon.presentationTween = this.tweens.add({
      targets: this.moon.render,
      scale: 1,
      ease: "Elastic",
      delay: 5000,
      duration: 5000,
      onStart: function() {
          this.sound.play("bounce");
      },
      onStartScope: this
  })

    for(let i = 0; i < this.planets.length; i++) {
      let p = this.planets[i];

      // Set planet sizes like solar system.
      switch(p.pType) {
          case cbody.MERCURY: p.render.setScale(.1); break;
          case cbody.VENUS:   p.render.setScale(.2); break;
          case cbody.EARTH:   p.render.setScale(.2); break;
          case cbody.MARS:    p.render.setScale(.1); break;
          case cbody.JUPITER: p.render.setScale(.8); break;
          case cbody.SATURN:  p.render.setScale(.7); break;
          case cbody.URANUS:  p.render.setScale(.6); break;
          case cbody.NEPTUNE: p.render.setScale(.5); break;
      }
      
      // Adjust sizes.
      p.presentationTween = this.tweens.add({
          targets: p.render,
          scale: 1,
          ease: "Elastic",
          delay: 2000 + (250 * p.pType),
          duration: 5000,
          onStart: function() {
              this.sound.play("bounce");
          },
          onStartScope: this
      })
    }

    // Start game shooting.
    this.time.delayedCall(6000, function(){this.start = true;

    // Set up clock
    this.time.addEvent({
      delay: 1000,               
      callback: this.clockTick,
      callbackScope: this,
      loop: true
    });

    }, [], this);
  }

  // Enable / disable colliding bounds.
  gmFxWarp( active ) {
    this.matter.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT, 64, !active, !active, !active, !active);
  }

  // Toggle planet size.
  gmFxMini( active ) {
      for(let i = 0; i < this.planets.length; i++) {
        let p = this.planets[i];
        p.isMini = active;
        p.setRenderScale();
        p.setPhysics();
      } 

      this.sound.play("bounce");
  }

  // Toggle big black hole.
  gmFxBigHole( active ) {
    this.blackHole.refScale = active ? 2 : 1;

    this.tweens.add({
      targets: this.blackHole,
      scale: this.blackHole.refScale,
      ease: "Cubic",
      duration: 2000,
    })
  }

  // Toggle low friction.
  gmFxSlide( active ){
    for(let i = 0; i < this.planets.length; i++) {
      let p = this.planets[i];
      p.isSlide = active;
      p.setPhysics();
    } 
  }

  // Shake celestial bodies.
  gmFxEarthquake() {
    for(let i = 0; i < this.planets.length; i++) {
      this.planets[i].setVelocity(randomNumber(-2, 2), randomNumber(-2, 2));
    } 

    this.cameras.main.shake(300, .02);
  }

  // Toggle repulsion force.
  gmFxRepulsion( active ){
    for(let i = 0; i < this.planets.length; i++) {
      let p = this.planets[i];
      p.isRepulsion = active;
    }    
  }

  // Toggle attraction force.
  gmFxAttraction( active ){
    for(let i = 0; i < this.planets.length; i++) {
      let p = this.planets[i];
      p.isAttraction = active;
      p.setPhysics();
    }    
  }

  // Toggle gravity.
  gmFxGravity( active ){
    for(let i = 0; i < this.planets.length; i++) {
      this.planets[i].isGravity = active;
      this.planets[i].setPhysics();
    }
  }

  clockTick(){
    this.elapsedTime ++;
  }


  destroy_everything() {
    this.input.off("pointerup");
        
    if(this.moon != null) {
      if(!this.moon.inHoleAnim) {
      this.tweens.killTweensOf(this.moon);
      this.moon.render.destroy(); 
      this.moon.txInfo.destroy();
      this.moon.iTarget.destroy();
      this.moon.destroy();
      this.moon = null;
      }
    }

    for(let i = 0; i < this.planets.length; i++) {
      this.tweens.killTweensOf(this.planets[i]);
      this.planets[i].txInfo.destroy();
      this.planets[i].iTarget.destroy();
      this.planets[i].render.destroy(); 
      this.planets[i].destroy();
      this.planets[i] = null;
    }
    this.planets = [];

    //@ts-ignore
    this.game.renderer.removePipeline("distortion");
  }
}