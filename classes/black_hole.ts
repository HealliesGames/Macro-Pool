import { GAME_HEIGHT, GAME_WIDTH, randomNumber, CB_SIZE, pointDistance, cbody} from "../game";
import { PlayCentauri } from "../scenes/play_centauri";
import { PlaySun } from "../scenes/play_sun";

export class BlackHole extends Phaser.GameObjects.Sprite
{ 
    scene : PlaySun | PlayCentauri;                 // Instance scene.
    refScale : number;               // Reference scale.
    modality : number;

    constructor(paramScene, paramX, paramY, modality) {
        super(paramScene, paramX, paramY, "black_hole");

        // Assign instance scene.
        this.scene = paramScene;

        // Set normal scale.
        this.refScale = 1;

        // Set if is playing on Sun or Alpha Centauri
        this.modality = modality;

        // Start disappeared.
        this.setScale(0);

        // Assign new coordinates.
        this.spawn();

        // Add black hole to scene.
        this.setDepth(3);
        this.scene.add.existing(this);
    }

    update() {
        // Rotate black hole.
        this.angle += 2;

        // Set pipeline swirl position.
        this.scene.distortionPipeline.setFloat2("position", this.x, this.y);

        // Set pipeline swirl size.
        this.scene.distortionPipeline.setFloat1("effectRadius", this.scale / 10);
    }

    spawn() {
        // Black hole despawn animation.
        this.scene.tweens.add({
            targets: this,
            scale: 0,
            duration: 1000,
            onComplete: this.spawnPosition.bind(this)
        })

        // Black hole respawn animation.
        this.scene.tweens.add({
            targets: this,
            scale: this.refScale,
            duration: 1000,
            delay: 1000
        })
    }

    spawnPosition(){
        // Find a free place for spawning coordinates.
        do {
            var isFree = true;
            this.x = randomNumber(CB_SIZE, GAME_WIDTH - CB_SIZE);
            this.y = randomNumber(CB_SIZE, GAME_HEIGHT - CB_SIZE);

            // If last planet is jupiter (gravity effect), spawn on bottom.
            if(this.scene.planets.length == 1 && this.modality == 0)
                if(this.scene.planets[0].pType == cbody.JUPITER)
                    this.y = GAME_HEIGHT - CB_SIZE;


            for(var planet of this.scene.planets) {
                if(pointDistance(this.x, this.y, planet.x, planet.y) <= CB_SIZE * 2 * this.refScale) {
                    isFree = false;
                }
            }
            
            if(this.scene.moon != null)
                if(pointDistance(this.x, this.y, this.scene.moon.x, this.scene.moon.y) <= CB_SIZE * 2 * this.refScale) {
                    isFree = false;
            }
        } while(!isFree);

        // Change FX text position on top / bottom depending on black hole spawn.
        var fxPos = this.y < GAME_HEIGHT / 2 ? GAME_HEIGHT - 16 : 16;

        this.scene.tweens.add({
            targets: this.scene.txFx,
            y: fxPos,
            ease: "Cubic",
            duration: 400
        })

        if(this.modality == 1) {
            this.scene.tweens.add({
                targets: this.scene.txTimer,
                y: fxPos,
                ease: "Cubic",
                duration: 400
            })
        }
        
        this.scene.sound.play("whoosh");
    }

    spawnEnding(){

        // Black hole despawn animation.
        this.scene.tweens.add({
            targets: this,
            scale: 0,
            duration: 1000,
            onComplete: function(){
                this.x = GAME_WIDTH / 2;
                this.y = GAME_HEIGHT / 2;
                this.scene.sound.play("whoosh");
            },
            onCompleteScope: this
        })

        // Black hole covering screen.
        this.scene.tweens.add({
            targets: this,
            scale: 40,
            duration: 3000,
            delay: 1000,
            onComplete: function(){
                switch(this.modality) {
                    case 0:
                    this.scene.scene.start("FinalScoreSun", {
                        elapsedTime: this.scene.elapsedTime,
                        nShoot: this.scene.nShoot,
                        nMoonBlack: this.scene.nMoonBlack
                    }); break;

                    case 1:
                    this.scene.scene.start("FinalScoreCentauri", {
                        nShoot: this.scene.nShoot
                    }); break;
                }
            },

            onCompleteScope: this
        })
    }
}