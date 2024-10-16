class NoiseMap extends Phaser.Scene {
    
    constructor(){
        super("noiseMapScene")
        this.mapHeight = 25;
        this.mapWidth = 25;
    }

    preload(){
        this.load.image("terrainTiles", "./assets/mapPack_tilesheet.png")
        this.load.image("player", "./assets/mapTile_154.png")
    }
    
    create(){
        // Set random seed
        if (!this.seed){
            this.seed = Math.random()
            noise.seed(this.seed)
        }

        let rndlvl = this.create2DArray(this.mapHeight, this.mapWidth)
        let grassTiles = []

        // Default size of sample window
        if (!this.registry.has('size_x')) {
            this.registry.set('size_x', 4);
        }
        if (!this.registry.has('size_y')) {
            this.registry.set('size_y', 4);
        }

        this.size_x = this.registry.get('size_x')
        this.size_y = this.registry.get('size_y')

        this.generateTerrain(rndlvl, this.mapHeight, this.mapWidth, this.size_x, this.size_y, 0, 0)

        for (let row = 0; row < this.mapHeight; row++) {
            for (let col = 0; col < this.mapWidth; col++) {
                if (rndlvl[row][col] === 23) { 
                    grassTiles.push({ row, col }); 
                }
            }
        }

        // Select a random grass tile position
        let randomIndex = Math.floor(Math.random() * grassTiles.length)
        let spawnPosition = grassTiles[randomIndex]

        this.player = this.add.sprite(spawnPosition.col * 64 * 0.4, spawnPosition.row * 64 * 0.4, "player")
        this.player.setScale(0.6) 
        this.player.setDepth(10)
        console.log('Player spawned at:', spawnPosition.col, spawnPosition.row)
        

        // this.add.circle(this.player.x, this.player.y, 10, 0xff0000).setDepth(11);  // Debug circle above player for visibility

        // make tilemap with array
        const map = this.make.tilemap({
            data:rndlvl,
            tileWidth:64,
            tileHeight:64
        })

        // add tilesheet
        const tilesheet = map.addTilesetImage("terrainTiles")

        // create a layer in the tilemap
        this.layer = map.createLayer(0, tilesheet, 0, 0)
        this.layer.setScale(0.4)
        this.layer.setDepth(1)

        // let tileX = this.layer.worldToTileX(this.player.x);
        // let tileY = this.layer.worldToTileY(this.player.y);

        // let tile = this.layer.getTileAt(tileX, tileY);

        // console.log(tile.index)
        

        // reload key
        this.reload = this.input.keyboard.addKey('R');

        // Sample window size key < and >
        this.shrink = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.COMMA)
        this.grow = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.PERIOD)

        //movement keys
        this.keys = this.input.keyboard.addKeys({
            'up': Phaser.Input.Keyboard.KeyCodes.W,
            'left': Phaser.Input.Keyboard.KeyCodes.A,
            'down': Phaser.Input.Keyboard.KeyCodes.S,
            'right': Phaser.Input.Keyboard.KeyCodes.D
        });

        // Print current array (debugging)
        this.print = this.input.keyboard.addKey('P');

        //update instruction text
        document.getElementById('description').innerHTML = `
            <h2>NoiseMap.js</h2><br>
            R: Restart Scene (to randomize tiles)<br>
            <: Shrink sample size<br>
            >: Grow sample size<br>
            Current sample size: ${this.size_x} x ${this.size_y}<br>`;
    }

    update(){
        if (Phaser.Input.Keyboard.JustDown(this.reload)){
            this.seed = Math.random();
            noise.seed(this.seed);
            this.scene.restart();
        }

        if (Phaser.Input.Keyboard.JustDown(this.shrink)){
            this.registry.set('size_x', Math.max(1, this.registry.get('size_x') - 1));
            this.registry.set('size_y', Math.max(1, this.registry.get('size_y') - 1));
            this.scene.restart();
        }
        
        if (Phaser.Input.Keyboard.JustDown(this.grow)){
            this.registry.set('size_x', this.registry.get('size_x') + 1);
            this.registry.set('size_y', this.registry.get('size_y') + 1);
            this.scene.restart();
        }

        if(Phaser.Input.Keyboard.JustDown(this.print)){
            console.log(rndlvl);
        }

        if (Phaser.Input.Keyboard.JustDown(this.keys.left)) {
            this.movePlayer(-1, 0);
        }
        if (Phaser.Input.Keyboard.JustDown(this.keys.right)) {
            this.movePlayer(1, 0);
        }
        if (Phaser.Input.Keyboard.JustDown(this.keys.up)) {
            this.movePlayer(0, -1);
        }
        if (Phaser.Input.Keyboard.JustDown(this.keys.down)) {
            this.movePlayer(0, 1);
        }

        document.getElementById('description').innerHTML = `
        <h2>NoiseMap.js</h2><br>
        R: Restart Scene (to randomize seed)<br>
        <: Shrink sample size<br>r
        >: Grow sample size<br>
        Current sample size: ${this.registry.get('size_x')} x ${this.registry.get('size_y')}<br>`;
    }

    create2DArray(height, width){
        let array = new Array(height)
        for (let i = 0; i < height; i++){
            array[i] = new Array(width).fill(null)
        }
        return array
    }

    movePlayer(dx, dy) {
        // Calculate the new player position in pixels
        let newPlayerX = this.player.x + dx * 64 * 0.4;  
        let newPlayerY = this.player.y + dy * 64 * 0.4;  
    
        let tileX = this.layer.worldToTileX(newPlayerX);
        let tileY = this.layer.worldToTileY(newPlayerY);
    
        let tile = this.layer.getTileAt(tileX, tileY);
    
        if (tile && (tile.index === 23 || tile.index === 91)) { // Grass tile
            this.player.x = newPlayerX;
            this.player.y = newPlayerY;
            console.log(`Moved to tile: Row = ${tileY}, Col = ${tileX}, Type = ${tile.index}`);
        } else {
            console.log('Blocked! Cannot move onto this tile.');
        }
    }
    

    noise_sample(row, column, size_x, size_y, win_x, win_y){
        let sample_x = (row / this.mapHeight) * size_x + win_x;
        let sample_y = (column / this.mapWidth) * size_y + win_y;
        let n = (noise.perlin2(sample_x, sample_y) + 1) / 2;  // Normalize
        return n;
    }

    terrainMap(n){
        if (n > 0 && n < 0.5){
            return 202 // water tile
        } else if (n >= 0.5 && n < 0.7){
            return 23 // grass/land tile
        }
        else {
            return 91 // mountain tile 
        }
    }          


    generateTerrain(rndlvl, mapHeight, mapWidth, size_x, size_y, win_x, win_y){
        for (let row = 0; row < mapHeight; row++){
            for (let column = 0; column < mapWidth; column++){
                let n = this.noise_sample(row, column, size_x, size_y, win_x, win_y)

                // console.log(`Row: ${row}, Col: ${column}, Noise: ${n}`); // Debugging

                rndlvl[row][column] = this.terrainMap(n)
            }
        }
    }
}

// Iterate over columns
//	iterate over rows
//		n = noise(row, column, size_x, size_y, win_x, win_y)
//		rndlvl[row][column] = terrain_map(n)
//
// in terrain map(n):
// 	0 > n < 0.5 – return water tile
//	0.5 > n < 0.8 – return grass tile
//
// in noise_sample:
// inputs: size_x, size_y – width/height of sample window (3-10 - typical version)
//	win_x, win_y - upper left corner of sample window (0-255, 0-255)
//	row, col
//	scale row, col to values inside the window – sample_x , sample_y
//	return perlin_noise(sample_x, sample_y)