import Blindfold from './blindfold.js';
import Player from './player.js';
import Item from './item.js';
//import Npc from './npc.js';
import Trigger from './trigger.js';
import GUI from './gui.js'

export default class GameScene extends Phaser.Scene {
    constructor() { super({ key: 'gameScene' }) };

    preload() {
        // Carga el plugin para las tiles animadas
        this.load.scenePlugin('AnimatedTiles', './assets/plugins/AnimatedTiles.js', 'animatedTiles', 'animatedTiles');
    }

    create() {
        this.matter.world.disableGravity();

        // Creamos un mapa a partir de los datos en cache
        this.map = this.make.tilemap({
            key: 'map',
            tileWidth: 32,
            tileHeight: 32
        });

        // Asignamos el tileset
        const tileset = this.map.addTilesetImage('dungeon', 'tiles');

        // Capas del mapa para asignar distintas funcionalidades
        this.ground0 = this.map.createStaticLayer('ground 0', tileset);
        // Esta capa es dinámica porque incluye tiles con animaciones
        this.ground1 = this.map.createDynamicLayer('ground 1', tileset);
        this.walls = this.map.createStaticLayer('walls', tileset);

        this.triggersToSect = [];
        // Spawnea al player en un punto definido en Tiled.
        // En Tiled tiene que haber una capa de objetos llamada 'capaObjetos'
        for (const objeto of this.map.getObjectLayer('objectLayer').objects) {
            // 'objeto.name' u 'objeto.type' nos llegan de las propiedades del
            // objeto en Tiled
            if (objeto.name === 'spawnPoint') {
                this.spawnpoint = objeto;
                this.player = new Player(this.matter.world, objeto.x, objeto.y);
            }
            else if (objeto.name === 'newSect') {
                let trigger = new Trigger(this.matter.world, objeto.x, objeto.y, objeto.width, objeto.height);
                trigger.info = [objeto.properties[0].value, objeto.properties[1].value,
                objeto.properties[2].value, objeto.properties[3].value];
                this.triggersToSect.push(trigger);
            }
        }
        /*
        
        
        
                // // Añado un npc de prueba en un array
                this.npcs = [
                    //paso el sprite del player porque de momento no tenemos otro
                    this.testNpc = new Npc('player', this.matter.world, this.spawnpoint.x + 20,
                        this.spawnpoint.y + 200, this.scene.get('testEvent')),
                    this.anotherTestNpc = new Npc('player', this.matter.world, this.spawnpoint.x + 80,
                        this.spawnpoint.y + 400, this.scene.get('anotherTestEvent'))
                ];
                
                
                */

        //console.log(this.triggersToSect);

        // Colocamos la vision en la posicion del jugador
        const [x, y] = [this.player.x, this.player.y];
        this.vision = this.add.image(x, y, 'vision').setVisible(false).setScale(0.4);

        // Creamos un layer estático
        this.walls2 = this.map.createStaticLayer('walls2', tileset);

        // Creacion de items a partir del atlas
        let item = undefined; //undefined para la comprobacion del evento de interaccion
        this.items = this.textures.get('items');
        this.itemFrames = this.items.getFrameNames();

        // Creacion de objetos segun el Tilemap
        for (const itemPos of this.map.getObjectLayer('collectable').objects) {
            if (itemPos.name === 'potion') {
                this.potion = new Item(this.matter.world, itemPos.x, itemPos.y, this.itemFrames[0]);
            }
            else if (itemPos.name === 'houseKey') {
                this.housekey = new Item(this.matter.world, itemPos.x, itemPos.y, this.itemFrames[1]);
            }
            else if (itemPos.name === 'coin') {
                this.coin = new Item(this.matter.world, itemPos.x, itemPos.y, this.itemFrames[2]);
            }
        }

        // Empieza la animación de las tiles en este mapa
        this.animatedTiles.init(this.map);

        this.blindfold = new Blindfold(this, 940, 970, this.vision);
    
        let height = this.spawnpoint.properties[0].value, heightBg = this.spawnpoint.properties[1].value,
            width = this.spawnpoint.properties[2].value, widthBg = this.spawnpoint.properties[3].value;
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setBounds(widthBg, heightBg, width, height);

        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('player', { start: 1, end: 1 }),
            frameRate: 1,
            repeat: -1
        });
        this.anims.create({
            key: 'up_move',
            frames: this.anims.generateFrameNumbers('player', { start: 4, end: 7 }),
            frameRate: 4,
            repeat: -1
        });
        this.anims.create({
            key: 'down_move',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
            frameRate: 4,
            repeat: -1
        });
        this.anims.create({
            key: 'left_move',
            frames: this.anims.generateFrameNumbers('player', { start: 12, end: 15 }),
            frameRate: 4,
            repeat: -1
        });
        this.anims.create({
            key: 'right_move',
            frames: this.anims.generateFrameNumbers('player', { start: 8, end: 11 }),
            frameRate: 4,
            repeat: -1
        });

        this.player.cursorsPlayer.blindfold.on('down', event => {
            this.blindfold.setBlindfold();
        });

        this.player.cursorsPlayer.interact.on('down', event => {
            if(item !== undefined){
                this.player.inventory.addObject(item);
                item.destroy();
                item = undefined;
                console.log(item);
            }
        });
        this.player.cursorsPlayer.testing.on('down', event => console.log(this.player.inventory.objects)) //testeo respawn

        this.player.cursorsPlayer.die.on('down', event => {
            this.player.die();
        });

        this.player.cursorsPlayer.setRespawn.on('down', event => {
            this.player.setSpawn(this.player.x, this.player.y);
        });

        this.player.cursorsPlayer.pause.on('down', event => {
            this.changeScene('pauseScene');
        });

        // Colision de las paredes 
        this.walls.setCollisionByProperty({ obstacle: true });
        this.matter.world.convertTilemapLayer(this.walls);

        this.matter.world.on('collisionstart',
            (evento, cuerpo1, cuerpo2) => {
                if (cuerpo1.gameObject === this.player) {
                    if (cuerpo2.gameObject === this.potion)
                        item = this.potion;
                    else if (cuerpo2.gameObject === this.housekey)
                        item = this.housekey;
                    else if (cuerpo2.gameObject === this.coin)
                        item = this.coin;
                }
            });

        this.matter.world.on('collisionend',
            (evento, cuerpo1, cuerpo2) => {
                if (cuerpo1.gameObject === this.player) {
                    //desasignamos el item en el que estuviese (aunque no estuviese en ninguno)
                    if (cuerpo2.gameObject === this.coin || cuerpo2.gameObject === this.housekey
                        || cuerpo2.gameObject === this.potion) item = {};

                    //buscamos si sale de un trigger de seccion
                    let i = 0;
                    while (i < this.triggersToSect.length && cuerpo2.gameObject !== this.triggersToSect[i])
                        i++;
                    if (i !== this.triggersToSect.length) this.newSection(this.triggersToSect[i]);
                }
            });

        this.matter.world.on('collisionactive', (evento, cuerpo1, cuerpo2) => {
            /*
            
            if (cuerpo1.gameObject === this.player &&
                cuerpo2.gameObject.type === this.npcs[0].type){
                //mensaje informativo
                console.log("overlapping a npc");
                //si se esta pulsando la tecla de interactuar, se llama al evento del npc
                if(this.player.cursorsPlayer.interact.isDown){
                    this.changeScene(cuerpo2.gameObject.myScene);
                }
            }

            */
        })
    }


    update(time, delta) {
        const [playerX, playerY] = [this.player.x, this.player.y];
        const [visionX, visionY] = [this.vision.x, this.vision.y];

        if (visionX !== playerX || visionY !== playerY) {
            this.blindfold.setVision(this.vision, playerX, playerY);
        }

        // const [playerX, playerY] = [this.player.x, this.player.y];
        // let [newVisionX, newVisionY] = [this.vision.x, this.vision.y];
        // if (playerX < this.cameras.main.width / 2 /*|| playerX > this.widthEnd - this.cameras.main.width / 2*/) {
        //     newVisionX = playerX;
        // }
        // else newVisionX = 400;
        // if (playerY < this.cameras.main.height / 2 /*|| playerY > this.heightEnd - this.cameras.main.height / 2*/) {
        //     newVisionY = playerY;
        // }
        // else newVisionX = 300;
        // if ([newVisionX, newVisionY] !== [this.vision.x, this.vision.y]) {
        //     this.vision.setPosition(playerX, playerY);
        //     this.blindfold.setVision(this.vision);
        // }        
    }

    //transicion a nueva seccion
    newSection(trigger) {
        const bounds = this.cameras.main.getBounds();
        if (this.hasChangedSection([this.player.x, this.player.y], bounds)) {
            this.cameras.main.removeBounds();
            let [height, y, width, x] = trigger.info;
            this.cameras.main.setBounds(x, y, width, height);
            trigger.info = [bounds.height, bounds.y, bounds.width, bounds.x]
        }
    }

    hasChangedSection([x, y], bounds) {
        return !(x > bounds.x && x < (bounds.x + bounds.width) && y > bounds.y && y < (bounds.y + bounds.height))
    }

    //respawn basico (falta la implementacion de varias funcionalidades)
    respawn() {
        this.player.setPosition(this.spawnpoint.x, this.spawnpoint.y);
    }

    //metodo para que el personaje no se quede pillado al moverse o al hacer otra accion
    resetInputs() {
        for(const property in this.player.cursorsPlayer){
            this.player.cursorsPlayer[property].reset();
        }
    }

    //metodo para cambiar de escena pasando informacion y sin detener la escena actual
    changeScene(newScene) {
        //guardo la info entre escenas y cambio de escena
        this.infoNextScene = { player: this.player, prevScene: this };

        this.scene.sleep();
        this.scene.run(newScene, this.infoNextScene);
        //evito que se queden pillado el input al cambiar de escena
        this.resetInputs();
    }
}