export class Preload extends Phaser.Scene {

  constructor() {
    // Scene identifier.
    super({ key: "Preload" }); 
  }

  preload() {

    // Load images and textures.
    // Space texture.
    this.load.image("space_texture","assets/images/space_texture.png");
    this.load.image("space_overlay","assets/images/space_overlay.png");

    // Star image.
    this.load.image("star","assets/images/star.png");

    // Moon texture.
    this.load.image("moon","assets/images/moon_texture.png");
    
    // Planets textures.
    this.load.image("mercury","assets/images/mercury_texture.png");
    this.load.image("venus","assets/images/venus_texture.png");
    this.load.image("earth","assets/images/earth_texture.png");
    this.load.image("mars","assets/images/mars_texture.png");
    this.load.image("jupiter","assets/images/jupiter_texture.png");
    this.load.image("saturn","assets/images/saturn_texture.png");
    this.load.image("neptune","assets/images/neptune_texture.png");
    this.load.image("uranus","assets/images/uranus_texture.png");

    // Centauri planets & stars
    this.load.image("rigil_kentaurus","assets/images/rigil_kentaurus.png");
    this.load.image("tolimani","assets/images/tolimani.png");
    this.load.image("proxima_centauri","assets/images/proxima_centauri.png");
    this.load.image("proxima_centauri_b","assets/images/proxima_centauri_b.png");
    this.load.image("proxima_centauri_c","assets/images/proxima_centauri_c.png");

    // Blend textures.
    this.load.image("planet_mask", "assets/images/planet_mask.png");
    this.load.image("planet_edge", "assets/images/planet_edge.png");
    this.load.image("sun_mask", "assets/images/sun_mask.png");
    this.load.image("sun_edge", "assets/images/sun_edge.png");

    // Black hole image.
    this.load.image("black_hole", "assets/images/black_hole.png");

    // Other images.
    this.load.image("arrow", "assets/images/arrow.png");
    this.load.image("target", "assets/images/target.png");
    this.load.image("logo", "assets/images/logo.png");
    this.load.image("gameoff_logo", "assets/images/gameoff_logo.png");
    this.load.image("cue", "assets/images/cue.png");
    this.load.image("pool_table", "assets/images/pool_table.png");
    this.load.image("title", "assets/images/title.png");
    this.load.image("sun", "assets/images/sun.png");
    this.load.image("alpha_centauri", "assets/images/alpha_centauri.png");
    this.load.image("howto", "assets/images/how_to.png");
    this.load.image("howto_hover", "assets/images/how_to_hover.png");
    

    // Load sounds.
    this.load.audio("atmosphere", "assets/audio/atmosphere.mp3");
    this.load.audio("bounce", "assets/audio/bounce.mp3");
    this.load.audio("bump", "assets/audio/bump.mp3");
    this.load.audio("snap", "assets/audio/snap.mp3");
    this.load.audio("whoosh", "assets/audio/whoosh.mp3");
    this.load.audio("hover", "assets/audio/cursor_hover.mp3");
    this.load.audio("fx", "assets/audio/fx.mp3");
    this.load.audio("in_hole", "assets/audio/in_hole.mp3");
    this.load.audio("cue_hit", "assets/audio/cue_hit.wav");
    this.load.audio("earthquake", "assets/audio/earthquake.mp3");
    this.load.audio("charge", "assets/audio/charge.mp3")


    // Load game font (Android Insomnia Regular: https://www.1001fonts.com/android-insomnia-font.html).
    this.load.bitmapFont("game", "assets/android_insomnia_regular.png", "assets/android_insomnia_regular.xml");

  }

  create() {
    // Prevent right click context menu.
    this.game.canvas.oncontextmenu = function (e) { e.preventDefault(); }

    // Change to game scene.
    this.scene.start("Introduction");
  }
  
}