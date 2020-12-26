import { GAME_HEIGHT, GAME_WIDTH } from "../game";

export class FinalScoreSun extends Phaser.Scene {

   txScore : Phaser.GameObjects.BitmapText;

   nMoonBlack : number;
   nShoot : number;
   elapsedTime : number;
   score : number;

   canGoMenu : boolean; 

    constructor() {
        // Scene identifier.
        super({ key: "FinalScoreSun" });

    }

    init(data) {
      this.nMoonBlack = data.nMoonBlack;
      this.nShoot = data.nShoot;
      this.elapsedTime = data.elapsedTime;
    }

    create() {
      this.canGoMenu = false;
      this.score = 8000 - (this.elapsedTime * 5) - (this.nShoot * 100) - (this.nMoonBlack * 100);

      var hs = localStorage.getItem("sun_hiscore");

      // Set the highest score
      if(hs == null || Number(hs) < this.score)
        localStorage.setItem("sun_hiscore", String(this.score));
  

      this.txScore = this.add.bitmapText(GAME_WIDTH / 2, GAME_HEIGHT / 2, "game", 
      "ELAPSED TIME: " + String(this.elapsedTime) + 
      "\nSHOOTS: " + String(this.nShoot) + 
      "\nMOON IN BLACK HOLE: " + String(this.nMoonBlack) +
      "\n\nSCORE CALCULATION:\n8000 - (" + String(this.elapsedTime) + " x 5) - (" + String(this.nShoot) + " x 100) - (" 
      + String(this.nMoonBlack) + " x 100)\n\nFINAL SCORE: " + String(this.score),
      16, 1).setOrigin(.5);

      this.txScore.setAlpha(0);

      this.tweens.add({
        targets: this.txScore,
        ease: "Bounce.easeInOut",
        alpha: 1,
        duration: 200,
        repeat: 3,
        onStart: function(){
          this.sound.play("fx");  
        },
        onStartScope: this
      });
    

      this.time.delayedCall(1000, function(){this.canGoMenu = true;}, [], this);

      this.input.on('pointerdown', function (pointer) {
        if(this.canGoMenu) {

          this.tweens.add({
            targets: this.txScore,
            ease: "Bounce.easeInOut",
            alpha: 0,
            duration: 200,
            repeat: 3,
            onComplete: function(){
              this.scene.start("Menu");
              
              this.game.renderer.removePipeline("distortion");
            },
            onCompleteScope: this
          });

        }
      }, this);
    }

      
}