// Naitik Poddar
// Created: 10/9/2024
// Phaser: 3.70.0
//
// Perlin Noise Generator
// 
// Art assets from Kenny Assets 
// https://kenney.nl/assets/

// debug with extreme prejudice
"use strict"

// game config
let config = {
    parent: 'phaser-game',
    type: Phaser.CANVAS,
    render: {
        pixelArt: true  // prevent pixel art from getting blurred when scaled
    },
    width: 700,
    height: 700,
    scene: [NoiseMap]
}

// Global variable to hold sprites
var my = {sprite: {}};

const game = new Phaser.Game(config);
