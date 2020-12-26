import { GAME_HEIGHT, GAME_WIDTH } from "../game";

export class FinalScoreCentauri extends Phaser.Scene {

   txScore : Phaser.GameObjects.BitmapText;

   nMoonBlack : number;
   nShoot : number;
   elapsedTime : number;
   score : number;

   canGoMenu : boolean; 

    constructor() {
        // Scene identifier.
        super({ key: "FinalScoreCentauri" });

    }

    init(data) {
      this.nShoot = data.nShoot;
    }

    create() {
      this.canGoMenu = false;
      this.score = this.nShoot;

      var hs = localStorage.getItem("centauri_hiscore");

      // Set the highest score
      if(hs == null || Number(hs) < this.score)
        localStorage.setItem("centauri_hiscore", String(this.score));
  

      this.txScore = this.add.bitmapText(GAME_WIDTH / 2, GAME_HEIGHT / 2, "game", 
      "PLANET / STARS IN\nBLACK HOLE:\n" + String(this.nShoot),
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