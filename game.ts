// Import Phaser framework.
import "phaser";                        

// Import scenes.
import { Preload } from "./scenes/preload";
import { Introduction } from "./scenes/introduction";
import { Tutorial } from "./scenes/tutorial";
import { PlaySun } from "./scenes/play_sun";
import { PlayCentauri } from "./scenes/play_centauri";
import { Menu } from "./scenes/menu";
import { FinalScoreSun } from "./scenes/final_score_sun";
import { FinalScoreCentauri } from "./scenes/final_score_centauri";

// Original game canvas width.
export const GAME_WIDTH = 400;

// Original game canvas height.    
export const GAME_HEIGHT = 300;   

var config : Phaser.Types.Core.GameConfig = {
  type: Phaser.WEBGL,                             // Renderer type (CANVAS or WEBGL).
  backgroundColor: "#000000",                     // Default background colour.

  scale: {
    mode: Phaser.Scale.FIT,                       // Scale to screen size by mantaining aspect ratio.
    autoCenter: Phaser.Scale.CENTER_BOTH,         // Scale the game surface based to its center.
    width: GAME_WIDTH,                            // Set game scale width.
    height: GAME_HEIGHT,                          // Set game scale height.
  },

  fps: {
    target: 60,
    forceSetTimeOut: true
  },

  physics: {
    default: "matter",                            // Matter.js physics.
    matter:{
      velocityIterations : .001,                  // Infinitesimal resting collision detection.
      gravity: {                                  // No gravity.
        x: 0, 
        y: .3
      },
      debug : false                               // Don't show collision bodies.
    }
  },

  render: { pixelArt: true, antialias: false},    // Disable antialising.
  scene: [Preload, Introduction, Menu, Tutorial, PlaySun, PlayCentauri, 
  FinalScoreSun, FinalScoreCentauri]                                  // Load the scenes in the list.
}

const game = new Phaser.Game(config);             // Create game object.


/***************************** Utilities *********************************/

// Celestial bodies IDs.
export enum cbody {
  MERCURY, VENUS,
  EARTH, MARS,
  JUPITER, SATURN,
  URANUS, NEPTUNE,
  MOON
}

export enum cbody_centauri {
  RIGIL_KENTAURUS, 
  TOLIMANI,
  PROXIMA_CENTAURI_B,
  PROXIMA_CENTAURI,
  PROXIMA_CENTAURI_C
}

// Celestial bodies pixel size.
export const CB_SIZE = 24;

// Celestial bodies default mass.
export const CB_MASS = 50;

// Random function.
export function randomNumber(paramMin, paramMax) {
  return Math.random() * (paramMax - paramMin) + paramMin;
}

// Distance between two points.
export function pointDistance(paramX, paramY, paramXX, paramYY) {
  return Math.sqrt( Math.pow(paramX - paramXX, 2) + Math.pow(paramY - paramYY, 2) )
}

// Angle in radians between two points.
export function pointAngle(paramX, paramY, paramXX, paramYY) {
  return Math.atan2(paramYY - paramY, paramXX - paramX);
}

// GLSL for distortion shader.
// Shader source: https://www.shadertoy.com/view/Xscyzn
export var shaderDistortion = 
 `precision mediump float;
  #define PI 3.14159

  uniform sampler2D uMainSampler;
  
  uniform vec2 resolution;
  uniform vec2 position;
  uniform float effectRadius;
  
  varying vec2 outTexCoord;
  varying vec4 outTint;
  
  void main() {
    float effectAngle = 3. * PI;
    vec2 center = position.xy / resolution.xy;
    
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    uv.y = 1.0 - uv.y;
    uv -= center;
    
    float len = length(uv * vec2(resolution.x / resolution.y, 1.));
    float angle = atan(uv.y, uv.x) + effectAngle * smoothstep(effectRadius, 0., len);
    float radius = length(uv);
    
    gl_FragColor = texture2D(uMainSampler, vec2(radius * cos(angle), radius * sin(angle)) + center);
  }`;
/*************************************************************************/