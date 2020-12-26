import { GAME_HEIGHT, GAME_WIDTH, CB_SIZE, CB_MASS, cbody, pointDistance, pointAngle, cbody_centauri} from "../game";
import { PlayCentauri } from "../scenes/play_centauri";
import { PlaySun } from "../scenes/play_sun";

// Tone down velocity for rotation.
export const VELOCITY_K = 1.5;

// Minimum x-velocity threshold for self sustaining rotation.
export const MIN_ROT_X_VEL = .2;

// Repulsion / attraction attenuator constant.
export const RA_ATT = 3;

export class CelestialBody extends Phaser.Physics.Matter.Image
{ 
    pType : number;                                    // Planet type ID.
    rotationOrientation : number;                      // Last rotation orientation detected.

    isMini : boolean;                                  // Planet size.
    isRepulsion : boolean;                             // Repulsion force.
    isAttraction : boolean;                            // Attraction force.
    isSlide : boolean;                                 // Reduce friction.
    isGravity : boolean;                               // Response to gravity.

    inHoleAnim : boolean;                              // Celestial body in hole animation.
    inHole : boolean;                                  // Celestial body in hole flag.

    exiting : boolean;                                 // Check if is exiting from hole.

    sphereMask : Phaser.GameObjects.Image;             // Circle mask sprite.
    sphereFrame : Phaser.GameObjects.Image;            // Edges mask sprite.
    sphereTile :  Phaser.GameObjects.TileSprite        // Texture tile sprite.
    render : Phaser.GameObjects.RenderTexture;         // Final sprite.
    presentationTween : Phaser.Tweens.Tween;           // Start-up tween.

    txInfo : Phaser.GameObjects.BitmapText;            // Information show.  
    iTarget : Phaser.GameObjects.Sprite;               // Target sprite.

    scene : PlaySun | PlayCentauri;                    // Instance scene.
    modality : number;

    constructor(paramScene, paramX, paramY, modality, paramType) {

        // Check the celestial body type and assign info and texture.
        var texture, text;
        
        switch(modality) {
            case 0:
            switch(paramType) {
                case cbody.MERCURY: texture = "mercury"; 
                text =      "NAME: MERCURY\nFX: SHRINK";    break;
                case cbody.VENUS:     texture = "venus";   
                text =          "NAME: VENUS\nFX: WARP";    break;
                case cbody.EARTH:     texture = "earth";   
                text =    "NAME: EARTH\nFX: EARTHQUAKE";    break;
                case cbody.MARS:       texture = "mars";    
                text =     "NAME: MARS\nFX: ATTRACTION";    break;
                case cbody.JUPITER: texture = "jupiter"; 
                text =     "NAME: JUPITER\nFX: GRAVITY";    break;
                case cbody.SATURN:   texture = "saturn";  
                text =    "NAME: SATURN\nFX: REPULSION";    break;
                case cbody.URANUS:   texture = "uranus";  
                text = "NAME: URANUS\nFX: SUPERMASSIVE";    break;
                case cbody.NEPTUNE: texture = "neptune"; 
                text =       "NAME: NEPTUNE\nFX: SLIDE";    break;
                case cbody.MOON:       texture = "moon";  
                text =                           "MOON";    break;
            } break;

            case 1:
            switch(paramType) {
                case cbody_centauri.RIGIL_KENTAURUS: texture = "rigil_kentaurus"; 
                text =      "NAME: RIGIL KENTAURUS\nTYPE: STAR";    break;
                case cbody_centauri.TOLIMANI:     texture = "tolimani";   
                text =      "NAME: TOLIMANI\nTYPE: STAR";    break;
                case cbody_centauri.PROXIMA_CENTAURI_B:     texture = "proxima_centauri_b";   
                text =      "NAME: PROXIMA CENTAURI B\nTYPE: PLANET";    break;
                case cbody_centauri.PROXIMA_CENTAURI:       texture = "proxima_centauri";    
                text =     "NAME: PROXIMA CENTAURI\nTYPE: STAR";    break;
                case cbody_centauri.PROXIMA_CENTAURI_C: texture = "proxima_centauri_c"; 
                text =     "NAME: PROXIMA CENTAURI C\nTYPE: PLANET";    break;
                case cbody.MOON:       texture = "moon";  
                text =                           "MOON";    break;
            } break;
    }

        // Call "Phaser.Physics.Matter.Image" super constructor.
        super(paramScene.matter.world, paramX, paramY, texture, 0, {restitution: .8});

        this.modality = modality;

        // Set up bitmap text.
        this.txInfo = new Phaser.GameObjects.BitmapText(paramScene, this.x, this.y, "game", text, 11, 1);
        this.txInfo.setOrigin(.5,.5);
        this.txInfo.setDepth(12);
        this.txInfo.setScale(0);
        this.txInfo.setAlpha(0);
        this.scene.add.existing(this.txInfo);

        // Set up target sprite.
        this.iTarget = new Phaser.GameObjects.Sprite(paramScene, this.x, this.y, "target");
        this.iTarget.setBlendMode(Phaser.BlendModes.ADD);
        this.iTarget.setDepth(11);
        this.iTarget.setScale(2);
        this.iTarget.setAlpha(0);
        this.scene.add.existing(this.iTarget);

        // Assign instance scene.
        this.scene = paramScene;

        this.presentationTween = null;

        // Create the planet tile sprite.
        this.sphereTile = new Phaser.GameObjects.TileSprite(this.scene, this.x, this.y, CB_SIZE, CB_SIZE, texture);

        // Create the sphere mask and set its blend mode to ERASE.
        this.sphereMask = new Phaser.GameObjects.Image(this.scene, this.x, this.y, "planet_mask");
        this.sphereMask.setBlendMode(Phaser.BlendModes.ERASE);

        // Create the edge mask and set its blend mode to MULTIPLY.
        this.sphereFrame = new Phaser.GameObjects.Image(this.scene, this.x, this.y, "planet_edge");
        this.sphereFrame.setBlendMode(Phaser.BlendModes.ADD);

        // Create, center and add the final render texture to the scene.
        this.render = new Phaser.GameObjects.RenderTexture(this.scene, this.x, this.y, CB_SIZE, CB_SIZE);
        this.render.setOrigin(.5, .5);
        this.render.setDepth(4);
        this.scene.add.existing(this.render);

        // Set sprite clickable.
        this.render.setInteractive();

        // Show celestial body information when mouse hover sprite.
        this.render.on("pointerover",function(){
            this.scene.tweens.add({
                targets: this.txInfo,
                scale: 1,
                alpha: 1,
                duration: 250
            });

            this.scene.tweens.add({
                targets: this.iTarget,
                scale: 1,
                alpha: 1,
                duration: 100
            });

            this.scene.sound.play("hover");
        }, this);

        // Hide celestial body information when mouse out sprite.
        this.render.on("pointerout",function(){
            this.scene.tweens.add({
                targets: this.txInfo,
                scale: 0,
                alpha: 0,
                duration: 250
            });

            this.scene.tweens.add({
                targets: this.iTarget,
                scale: 2,
                alpha: 0,
                duration: 100
            });

        }, this);

        // Set effect flags.
        this.isMini = false;
        this.isRepulsion = false;
        this.isAttraction = false;
        this.isSlide = false;
        this.isGravity = false;

        // Default rotation orientation.
        this.rotationOrientation = 1;

        // Set which planet.
        this.pType = paramType;

        // Celestial body is not in hole.
        this.inHole = this.inHoleAnim = false;

        // Set exiting from black hole.
        this.exiting = false;
        
        // Physics setup.
        this.setPhysics();
    }

    update() {

        // Check if repulsion / attraction flag are enabled.
        if(this.isRepulsion) this.repulse(this.scene.planets);
        if(this.isAttraction) this.attract(this.scene.planets);

        // Rotate-Y illusion by shifting scrolling texture per velocity-Y.
        this.sphereTile.tilePositionY -= this.body.velocity.y / VELOCITY_K;
        
        if(this.body.velocity.x / VELOCITY_K > MIN_ROT_X_VEL || this.body.velocity.x / VELOCITY_K < -MIN_ROT_X_VEL) {

            // Rotate-X illusion by shifting scrolling texture per velocity-X.
            this.sphereTile.tilePositionX -= this.body.velocity.x / VELOCITY_K;
            
            // Detect the orientation 
            this.rotationOrientation = Math.sign(this.body.velocity.x);
        }
        else
            // Planet-like self sustaining rotation.
            this.sphereTile.tilePositionX -= MIN_ROT_X_VEL * this.rotationOrientation;
            
        // Warp planet if outside scene boundaries.
        if(this.body.position.x > GAME_WIDTH + CB_SIZE / 2)
            this.setPosition(-CB_SIZE / 2, this.body.position.y);

        if(this.body.position.x < -CB_SIZE / 2)
            this.setPosition(GAME_WIDTH + CB_SIZE / 2, this.body.position.y);

        if(this.body.position.y > GAME_HEIGHT + CB_SIZE / 2)
            this.setPosition(this.body.position.x, -CB_SIZE / 2);

        if(this.body.position.y < -CB_SIZE / 2)
            this.setPosition( this.body.position.x, GAME_HEIGHT + CB_SIZE / 2);
        
        // When celestial body is near black hole.
        if(pointDistance(this.body.position.x, this.body.position.y, this.scene.blackHole.x, this.scene.blackHole.y) 
        < CB_SIZE * this.scene.blackHole.scale * 1.2) {

            if(!this.inHoleAnim && !this.exiting) {

                // Is animating.
                this.inHoleAnim = true;

                // Destroy info sprite and text.
                this.txInfo.destroy();
                this.iTarget.destroy();

                // Disable body collision.
                this.setPhysics();

                // Stop presentation tween.
                if(this.presentationTween != null)
                    this.presentationTween.stop();
                
                if(this.modality == 1) {
                    this.scene.nShoot ++;
                }
                
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
                    onComplete: function(){
                        this.render.setVisible(false);
                    },
                    onCompleteScope: this
                }); 

                this.scene.sound.play("in_hole");
                
                // Set is in hole for destroying.
                this.scene.time.delayedCall(1100, function(){ this.inHole = true; }, [], this);
            }
        } else this.exiting = false;
        

        // Apply matter physics state to the render textures.
        this.render.setPosition(this.body.position.x, this.body.position.y);
        this.sphereTile.setAngle(this.angle);

        // Draw the celestial body.
        this.render.draw([this.sphereTile, this.sphereMask, this.sphereFrame], CB_SIZE / 2, CB_SIZE / 2);

        // Set bitmap text position.
        this.txInfo.setPosition(this.body.position.x, this.body.position.y - 28);

        this.iTarget.setPosition(this.body.position.x, this.body.position.y);
        this.iTarget.angle += 90;
    }

    setPhysics(){
        // Save angle state.
        var currentAngle = this.angle;

        // Save velocity.
        var currentVelX = this.body.velocity.x;
        var currentVelY = this.body.velocity.y;

        // Set circular collision body.
        if(!this.inHoleAnim) {
            this.setBody({
                x: this.x,
                y: this.y,

                type : "circle",
                radius : this.isMini ? CB_SIZE / 4 : CB_SIZE / 2,
            });
        } else {
            this.setBody({
                x: this.x,
                y: this.y,
                type : "circle",
                radius : 0,
            });           
        }

        // Maximize bounce / elastic property.
        this.setBounce(1);

        // Default friction resistance.
        this.setFriction(0, .01, 0);
        if(this.isSlide) this.setFriction(0, .002, 0);

        // Apply gravity force.
        this.setIgnoreGravity(this.inHoleAnim ? true : !this.isGravity);
        if(this.isGravity) this.setBounce(.8);

        // Set mass.
        this.setMass(this.isMini? CB_MASS / 10 : CB_MASS);

        // Set collision callback.
        this.setOnCollide(this.collisionCallback.bind(this));

        // Set angle state.
        this.angle = currentAngle;

        // Set velocity.
        this.setVelocity(currentVelX, currentVelY);
    }

    setRenderScale(){
        // Stop the presentation tween.
        if(this.presentationTween != null)
        this.presentationTween.stop();

        // Adjust planet rendering scale with body.
        this.scene.tweens.add({
            targets: this.render,
            scale: this.isMini ? .5 : 1.,
            ease: "Elastic",
            duration: 2000,
        })
    }

    collisionCallback() {
        // Play bounce sound.
        if(!this.exiting) {
            let volume = Math.abs(this.body.velocity.x) + Math.abs(this.body.velocity.y);
            if(volume > .9) this.scene.sound.play("bump", {volume: volume / 30});
        }
    }


    // Repulse method.
    repulse(pList) {
        for(let i = 0; i < pList.length; i++) {
            let p = pList[i];
            if(p.pType != this.pType) {
                if( pointDistance(this.body.position.x, this.body.position.y,
                    p.body.position.x, p.body.position.y) <  CB_SIZE * 3) {
        
                        let angle = pointAngle(this.body.position.x, this.body.position.y,
                                          p.body.position.x, p.body.position.y) - Math.PI;
                        
                        let spdX = this.body.velocity.x;
                        let spdY = this.body.velocity.y;
                        
                        this.setVelocity(spdX + Math.cos(angle) / RA_ATT, spdY + Math.sin(angle) / RA_ATT);
                }
            }
        }
    } 
    
    // Attract method.
    attract(pList) {
        let dist = GAME_WIDTH * GAME_HEIGHT;
        let nP = null;

        for(let i = 0; i < pList.length; i++) {
            let p = pList[i];
            if(p.pType != this.pType) {
                var tDist = pointDistance(this.body.position.x, this.body.position.y, p.body.position.x, p.body.position.y); 
                if(tDist < dist) {
                    nP = p;
                    dist = tDist;
                }
            }
        }

       
        if(nP != null)
            if( dist <= CB_SIZE * 3 && dist > CB_SIZE * 1.5) {
                let angle = pointAngle(this.body.position.x, this.body.position.y,
                    nP.body.position.x, nP.body.position.y);
                
                let spdX = this.body.velocity.x + (Math.cos(angle) / (RA_ATT * 3));
                let spdY = this.body.velocity.y + (Math.sin(angle) / (RA_ATT * 3));

                this.setVelocity(spdX, spdY);
            } 
    } 
    
}