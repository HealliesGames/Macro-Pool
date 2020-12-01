import { GAME_HEIGHT, GAME_WIDTH } from "../game";

export class Introduction extends Phaser.Scene {

    focus : boolean;                         // Game is clicked & focused.
    name : Phaser.GameObjects.BitmapText;    // HealliesGames text.

    logo : Phaser.GameObjects.Image;         // HealliesGames logo.
    gameoffLogo : Phaser.GameObjects.Image;  // GitHub GameOff logo.
    cue : Phaser.GameObjects.Image;          // Pool cue image.

    constructor() {
        // Scene identifier.
        super({ key: "Introduction" });
    }

    create(){
        // Add pool table background.
        this.add.image(0, 0, "pool_table").setOrigin(0);

        // Add pool cue sprite.
        this.cue = this.add.image(-GAME_WIDTH / 2, GAME_HEIGHT / 2, "cue");

        // Add GameOff logo.
        this.gameoffLogo = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, "gameoff_logo").setScale(0);
        
        // Add HealliesGames text.
        this.name = this.add.bitmapText(GAME_WIDTH / 2, GAME_HEIGHT / 2, "game", "HEALLIES\nGAMES", 38, 1).setOrigin(.5);
        this.name.setScale(0);

        // Add HealliesGames logo.
        this.logo = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, "logo").setScale(0);

        // Game isn't focused.
        this.focus = false;
        
        // Logo entrance.
        this.tweens.add({
            targets: this.logo,
            ease: "Elastic",
            duration: 2000,
            scale: 1
        });

        // Cue entrance.
        this.tweens.add({
            targets: this.cue,
            ease: "Cubic",
            duration: 1000,
            delay:400,
            x: -64
        });


        this.input.on("pointerdown",function(pointer){

            // Set focus on click.
            if(!this.focus) {
                this.focus = true;

                // Cue charging and shooting.
                this.tweens.add({ targets: this.cue, x: -96,
                ease: "Cubic", duration: 300});

                this.tweens.add({ targets: this.cue, x: 0,
                ease: "Cubic", duration: 200, delay: 300, yoyo: true});

                this.tweens.add({ targets: this.cue, x: -64,
                ease: "Cubic", duration: 300, delay: 600});
                
                // Logo throwed away
                this.tweens.add({ targets: this.logo, x: GAME_WIDTH + 128, angle: 360,
                duration: 600, delay: 500, onStart: function(){this.sound.play("cue_hit");},
                onStartScope: this});

                this.tweens.add({ targets: this.name, scale: 1,
                duration: 500, delay: 600});

                // Cue charging and shooting.
                this.tweens.add({ targets: this.cue, x: -96,
                ease: "Cubic", duration: 300, delay: 1500});
    
                this.tweens.add({ targets: this.cue, x: 0,
                ease: "Cubic", duration: 200, delay: 1800});

                this.tweens.add({ targets: this.cue, x: -64,
                ease: "Cubic", duration: 300, delay: 2100});
                    
                // Name throwed away.
                this.tweens.add({ targets: this.name, x: GAME_WIDTH + 128, angle: 360,
                duration: 600, delay: 1900, onStart: function(){this.sound.play("cue_hit");},
                onStartScope: this});

                this.tweens.add({ targets: this.gameoffLogo, scale: .5,
                duration: 500, delay: 2000});

                // Cue charging and shooting.
                this.tweens.add({ targets: this.cue, x: -96,
                ease: "Cubic", duration: 300, delay: 3000});
    
                this.tweens.add({ targets: this.cue, x: 0,
                ease: "Cubic", duration: 200, delay: 3300, yoyo: true});

                this.tweens.add({ targets: this.cue, x: -64,
                ease: "Cubic", duration: 300, delay: 3600});

                // GameOff throwed away.
                this.tweens.add({ targets: this.gameoffLogo, x: GAME_WIDTH + 128, angle: 360,
                duration: 600, delay: 3400, onStart: function(){this.sound.play("cue_hit");},
                onStartScope: this});
                
                // Cue exiting from scene.
                this.tweens.add({ targets: this.cue, x: -GAME_WIDTH / 2,
                ease: "Cubic", duration: 2000, delay: 4300});
                
                // Go to main menu.
                this.time.delayedCall(6300, function(){

                    // Play atmosphere music on loop.
                    this.sound.play("atmosphere", {
                        mute: false,
                        volume: .2,
                        loop: true,
                        delay: 0
                    });

                    // Change to menu scene.
                    this.scene.start("Menu");
                }, [], this);
            }
        }, this);
    }
}