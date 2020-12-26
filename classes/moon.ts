import { cbody, CB_SIZE, GAME_HEIGHT, GAME_WIDTH, pointAngle, pointDistance } from "../game";
import { CelestialBody, VELOCITY_K, MIN_ROT_X_VEL, RA_ATT} from "./celestial_body";

export class Moon extends CelestialBody {
    mouseAngle : number;                                           // Angle between moon and mouse.
    canShoot : boolean;                                            // Can shoot flag.
    shootForce : number;                                           // Shoot force value.
    arrow : Phaser.GameObjects.Sprite;                             // Pointing arrow sprite.
    iLine : Phaser.GameObjects.Graphics;                           // Nearest planet line.
    trajectory :Phaser.GameObjects.Graphics;                       // Trajectory aiming line.
    iNearPlanet : Phaser.GameObjects.BitmapText;                   // "Nearest" text.
    iTarget : Phaser.GameObjects.Sprite;                           // Target sprite.
    charging : boolean;

    constructor(paramScene, paramX, paramY, modality) {

        // Call CelestialBody constructor.
        super(paramScene, paramX, paramY, modality, cbody.MOON);

        // Create aiming arrow.
        this.arrow = new Phaser.GameObjects.Sprite(this.scene, this.x, this.y, "arrow");
        this.arrow.setDepth(1);
        this.scene.add.existing(this.arrow);

        // Initialize can shoot.
        this.canShoot = false;

        // Initialize shoot force.
        this.shootForce = 0;

        // Create trajectory line and add to scene.
        this.trajectory = new Phaser.GameObjects.Graphics(this.scene).setDepth(1);
        this.scene.add.existing(this.trajectory);
        
        // Create nearest planet line and add to scene.
        this.iLine = new Phaser.GameObjects.Graphics(this.scene).setDepth(1);
        this.scene.add.existing(this.iLine);

        // Create "nearest" text and add to scene.
        var pText = this.modality == 0 ? "NEAREST" : "";
        this.iNearPlanet = new Phaser.GameObjects.BitmapText(this.scene, 0, 0, "game", pText, 11, 1).setOrigin(.5, .5);
        this.iNearPlanet.setDepth(1);
        this.scene.add.existing(this.iNearPlanet);

        // Mouse released event.
        this.scene.input.on("pointerup", function (pointer) {

            // Calculate mouse distance from moon for shoot annulling.
            var dist = pointDistance(this.x, this.y, pointer.x, pointer.y) > CB_SIZE / 2;

                // If can shoot and shoot isn't annulled, shoot.
                if(this.canShoot && this.shootForce >= 1 && dist) {
                    this.setVelocity(Math.cos(this.mouseAngle) * this.shootForce, Math.sin(this.mouseAngle) * this.shootForce);
                    this.scene.moonCooldown = false;
                    this.scene.bChangedPos = false;
                    
                    // Hide FX text.
                    if(this.modality == 0) {
                    this.scene.tweens.add({
                        targets: this.scene.txFx,
                        ease: "Cubic",
                        alpha: 0,
                        duration: 300
                      })
                    }
                    
                    // If FX earthquake is active, perform it.
                    if(this.scene.isEarthquake) {
                        this.scene.gmFxEarthquake();
                        this.scene.sound.play("earthquake");
                    }

                    // Increase shoot number
                    if(this.modality == 0)
                        this.scene.nShoot += 1;
                }

                // Reset shoot charge.
                this.shootForce = 0;

                // Reset charging sound.
                this.charging = false;
                this.scene.sound.stopByKey("charge");
    
        }, this);     

    }
    

    update() {
        
        // Check mouse position and get point angle.    
        this.mouseAngle = pointAngle(this.x, this.y, this.scene.input.activePointer.x, this.scene.input.activePointer.y);
        var mouseDist = pointDistance(this.x, this.y, this.scene.input.activePointer.x, this.scene.input.activePointer.y);
        
        // Update arrow position, tint and angle.
        this.arrow.setRotation(this.mouseAngle);
        this.arrow.setPosition(this.x + Math.cos(this.mouseAngle) * (CB_SIZE - this.shootForce), this.y + Math.sin(this.mouseAngle) * (CB_SIZE - this.shootForce));
        let color = Phaser.Display.Color.GetColor(255, 255 - (17 * this.shootForce / 1.2), 255 - (17 * this.shootForce) / 1.2);
        this.arrow.setTint(color);
        this.arrow.setAlpha( Phaser.Math.Clamp(mouseDist / CB_SIZE / 4, 0, 1));
        this.arrow.setVisible(this.canShoot);

        // Check if repulsion / attraction flag are enabled.
        if(this.isRepulsion) this.repulse(this.scene.planets);
        if(this.isAttraction) this.attract(this.scene.planets);

        // Rotate-Y illusion by shifting scrolling texture per velocity-Y.
        this.sphereTile.tilePositionY -= this.body.velocity.y / VELOCITY_K;

        // Rotate-X illusion by shifting scrolling texture per velocity-X.
        this.sphereTile.tilePositionX -= this.body.velocity.x / VELOCITY_K;
            
        // Warp planet if outside scene boundaries.
        if(this.body.position.x > GAME_WIDTH + CB_SIZE / 2)
            this.setPosition(-CB_SIZE / 2, this.body.position.y);

        if(this.body.position.x < -CB_SIZE / 2)
            this.setPosition(GAME_WIDTH + CB_SIZE / 2, this.body.position.y);

        if(this.body.position.y > GAME_HEIGHT + CB_SIZE / 2)
            this.setPosition(this.body.position.x, -CB_SIZE / 2);

        if(this.body.position.y < -CB_SIZE / 2)
            this.setPosition( this.body.position.x, GAME_HEIGHT + CB_SIZE / 2);

        // Set bitmap text position.
        this.txInfo.setPosition(this.body.position.x, this.body.position.y - 24);
        
        // Target sprite positioning and vibrating.
        this.iTarget.setPosition(this.body.position.x, this.body.position.y);
        this.iTarget.angle += 90;

        // When moon body is near black hole.
            if(pointDistance(this.body.position.x, this.body.position.y, this.scene.blackHole.x, this.scene.blackHole.y) 
            < CB_SIZE * this.scene.blackHole.scale * 1.2) {

                if(!this.inHoleAnim && !this.exiting) {

                    // Is animating.
                    this.inHoleAnim = true;

                    // Destroy moon UI.
                    this.iNearPlanet.destroy();
                    this.iLine.destroy();
                    this.iTarget.destroy();
                    this.trajectory.destroy();
                    this.txInfo.destroy();
                    this.arrow.destroy();

                    // Disable input.
                    this.scene.input.off("pointerup");

                    // Stop charging sound.
                    this.scene.sound.stopByKey("charge");

                    // Disable body collision.
                    this.setPhysics();

                    // Set position to black hole.
                    this.scene.tweens.add({
                        targets: this,
                        x: this.scene.blackHole.x,
                        y: this.scene.blackHole.y,
                        ease: "Cubic",
                        duration: 1000
                    });

                    // Disappear.
                    this.scene.tweens.add({
                        targets: this.render,
                        scale: 0,
                        ease: "Cubic",
                        duration: 1000,
                        onStart: function(){
                            if(this.canShoot) 
                                this.scene.bChangedPos = false;
                        },
                        onStartScope: this,

                        onComplete: function(){
                            this.scene.nMoonBlack ++;
                            this.scene.moon = null;
                            this.render.destroy();
                            this.destroy();
                        },
                        onCompleteScope: this
                    }); 

                    this.scene.sound.play("in_hole");
                    
                    // Set is in hole for destroying.
                    this.scene.time.delayedCall(1100, function(){ this.inHole = true; }, [], this);
                }
            } else {
                this.exiting = false;
            }

        // Charge by holding left mouse.
        if(this.scene.input.activePointer.leftButtonDown()){
            if(this.canShoot && this.shootForce < 15) {
                this.shootForce += .15;
                if(!this.charging) {
                    this.charging = true;
                    this.scene.sound.play("charge");
                }
            }
        }

        // Clear trajectory line.
        this.trajectory.clear();

        // Set trajectory line.
        if(this.canShoot) {
            this.trajectory.lineStyle(1, color, Phaser.Math.Clamp(mouseDist / CB_SIZE / 4, 0, 1));
            this.trajectory.lineBetween(this.arrow.x + Math.cos(this.mouseAngle) * 10, 
                                        this.arrow.y + Math.sin(this.mouseAngle) * 10, 
                                        this.arrow.x + Math.cos(this.mouseAngle) * 500, 
                                        this.arrow.y + Math.sin(this.mouseAngle) * 500);
        }

        // Find the nearest planet.
        var pNear = null;
        var pDist = Infinity;

        for(var planet of this.scene.planets) {
            var dist = pointDistance(this.x, this.y, planet.x, planet.y);
            if(dist < pDist){
                pDist = dist;
                pNear = planet;
            }

        }  

        if(pNear != null) {
            if(this.modality == 0) {
            // Set line and text info for nearest planet.
            this.iLine.clear();
            this.iLine.lineStyle(1, 0x00FF00, this.iTarget.alpha);
            this.iLine.lineBetween(this.x, this.y, pNear.x, pNear.y);

            var ang = pointAngle(this.x, this.y, pNear.x, pNear.y);
        
        
            this.iNearPlanet.setRotation(ang);
            this.iNearPlanet.setPosition( 
                                        (this.x + pNear.x) / 2 + (Math.cos(ang - Phaser.Math.DegToRad(90)) * 10 ),
                                        (this.y + pNear.y) / 2 + (Math.sin(ang - Phaser.Math.DegToRad(90)) * 10 ),
                                        );
            this.iNearPlanet.setAlpha(this.iTarget.alpha);

            // Set scene "moonNearestPlanet"
            this.scene.moonNearestPlanet = pNear;
            }
        } else {
            // If no planets, hide line and text.
            this.iNearPlanet.setAlpha(0);
            this.iLine.clear();
        }

        // Apply matter physics position to the render textures.
        this.render.setPosition(this.body.position.x, this.body.position.y);

        // Draw the celestial body.
        this.render.draw([this.sphereTile, this.sphereMask, this.sphereFrame], CB_SIZE / 2, CB_SIZE / 2);
        
        //this.setPosition(this.scene.input.activePointer.x, this.scene.input.activePointer.y);
    }
}