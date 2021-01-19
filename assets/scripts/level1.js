import NewGameScene from './game_scene.js'
import Blindfold from './blindfold.js';
import Player from './player.js';
import Item, {
    PotionItem, SickTreeItem, BlessingItem, SacredFireItem, AvoidDeathItem, BoozeItem, FoodItem
} from './item.js';
import Trigger from './trigger.js';
import GUI from './gui.js';
import Silhouette from './silhouette.js'
import EventHandler from './event_handler.js';
import ObjectiveMarker from './objective_marker.js';

export default class Level1 extends NewGameScene {
    constructor() {
        super('level1');
    };

    preload() {
        super.preload();
    }

    create() {
        super.create();

        // Creamos un mapa a partir de los datos en cache
        this.map = this.make.tilemap({
            key: 'map01',
            tileWidth: 64,
            tileHeight: 64
        });

        //sonidos
        this.sound.play('mainTheme', {
            mute: false, volume: 0.5, rate: 1, detune: 0, seek: 0, loop: true, delay: 0
        });

        // Asignamos el tileset
        const tileset = this.map.addTilesetImage('slates', 'tiles');

        // Creamos layers por debajo del jugador (probablemente deberiamos establecer una profundidad para que todo quede más limpio)
        this.map_zones = this.map.createStaticLayer('map_zones', tileset);
        this.map_limits = this.map.createStaticLayer('map_limits', tileset);
        this.ground_01 = this.map.createStaticLayer('ground_01', tileset);
        this.ground_02 = this.map.createStaticLayer('ground_02', tileset);
        this.ground_03 = this.map.createStaticLayer('ground_03', tileset);
        this.building_01 = this.map.createStaticLayer('building_01', tileset);
        this.building_02 = this.map.createStaticLayer('building_02', tileset);

        this.triggersToSect = [];
        // Spawnea al player en un punto definido en Tiled.
        // En Tiled tiene que haber una capa de objetos llamada 'capaObjetos'
        for (const objeto of this.map.getObjectLayer('objectLayer').objects) {
            // 'objeto.name' u 'objeto.type' nos llegan de las propiedades del
            // objeto en Tiled
            if (objeto.name === 'spawnPoint') {
                this.spawnpoint = objeto;
                let savedFaith;
                if (this.info !== undefined && this.info.obtainedFaith !== undefined) savedFaith = this.info.obtainedFaith;
                else savedFaith = 0;
                this.player = new Player(this.matter.world, objeto.x, objeto.y, objeto, savedFaith, 1);
            }
            else if (objeto.name === 'newSect') {
                let trigger = new Trigger(this.matter.world, objeto.x, objeto.y, objeto.width, objeto.height);
                trigger.info = [objeto.properties[0].value, objeto.properties[1].value,
                objeto.properties[2].value, objeto.properties[3].value];
                trigger.newBounds = trigger.info;
                this.triggersToSect.push(trigger);
            }
        }

        this.gui = new GUI(this, 0, 0, this.player);

        for (const objeto of this.triggersToSect) {
            objeto.info2 = [this.spawnpoint.properties[0].value, this.spawnpoint.properties[1].value,
            this.spawnpoint.properties[2].value, this.spawnpoint.properties[3].value];
        }

        //PRUEBAS DE ESTIMULOS
        this.smellParticle = this.add.particles('smellCloud');
        this.soundParticle = this.add.particles('soundCircle');

        //no es necesario pasar estos atributos como parametros, pero ayuda a la claridad
        this.generateStimulus(this.smellParticle, this.soundParticle);

        // Añado un npc de prueba en un array
        this.npcs = [
            this.generateNPC(
                'doctor', false, 60,
                [this.scene.get('doctorEvent_0'), this.scene.get('doctorEvent_1')]
            ),
            this.generateNPC(
                'painter', false, 60,
                [this.scene.get('painterEvent_0'), this.scene.get('painterEvent_1')]
            ),
            this.generateNPC(
                'lumberjack', false, 60,
                [this.scene.get('lumberjackEvent_0'), this.scene.get('lumberjackEvent_1')]
            ),
            this.generateNPC(
                'glasses', false, 60,
                [this.scene.get('glasses_Event_0'), this.scene.get('glasses_Event_1'), this.scene.get('glasses_Event_2')]
            ),
            this.generateNPC(
                'foreigner', false, 60,
                [this.scene.get('foreigner_Event_0'), this.scene.get('foreigner_Event_1')]
            ),
            this.generateNPC(
                'seller', true, 60,
                [this.scene.get('seller_Event_0'), this.scene.get('seller_Event_1')]
            ),
            this.generateNPC(
                'hungryKid', false, 60,
                [this.scene.get('hungryKid_Event_0')]
            ),
            this.generateNPC(
                'elder', true, 60,
                [this.scene.get('elder_Event_0'), this.scene.get('elder_Event_1')]
            ),
            this.generateNPC(
                'brother', false, 60,
                [this.scene.get('brother_Event_Idle'),this.scene.get('brother_Event_0')]
            )
        ];

        this.silhouette = new Silhouette(this.matter.world, 750, 550,
            [this.scene.get('testSilueta_0'), this.scene.get('testSilueta_1'), this.scene.get('testSilueta_2'), this.scene.get('maxFaithEvent_0')]);

        this.objectiveMarker = new ObjectiveMarker(this.matter.world, this.player);
        this.loadObjectives();

        // Colocamos la vision en la posicion del jugador
        const [x, y] = [this.player.x, this.player.y];
        this.vision = this.add.image(x, y, 'vision').setVisible(false).setScale(0.4);

        // Creamos más layers por encima del jugador (probablemente deberiamos establecer una profundidad para que todo quede más limpio)
        this.building_03 = this.map.createStaticLayer('building_03', tileset);
        this.roof_01 = this.map.createStaticLayer('roof_01', tileset);
        this.animated = this.map.createDynamicLayer('animated', tileset);
        this.forest_01 = this.map.createStaticLayer('forest_01', tileset);
        this.forest_02 = this.map.createStaticLayer('forest_02', tileset);

        // Creacion de items a partir del atlas
        this.item = undefined; //undefined para la comprobacion del evento de interaccion
        this.items = this.textures.get('items');
        this.itemFrames = this.items.getFrameNames();
        console.log(this.itemFrames);
        // Creacion de objetos segun el Tilemap
        for (const itemPos of this.map.getObjectLayer('collectable').objects) {
            switch (itemPos.name) {
                case 'potion':
                    this.potion = new PotionItem(this.matter.world, itemPos.x, itemPos.y, this.itemFrames[16], this.player);
                    break;
                //meto el caleidoscopio aqui para probar el item, aunque no vaya a tener este sprite
                case 'blessing':
                    this.blessing = new BlessingItem(this.matter.world, itemPos.x, itemPos.y, this.itemFrames[2], this.player);
                    break;
                case 'sacredFire':
                    this.sacredFire = new SacredFireItem(this.matter.world, itemPos.x, itemPos.y, this.itemFrames[17], this.player);
                    break;
                case 'booze':
                    this.booze = new BoozeItem(this.matter.world, itemPos.x, itemPos.y, this.itemFrames[4], this.player);
                    break;
                case 'food':
                    this.flower = new FoodItem(this.matter.world, itemPos.x, itemPos.y, this.itemFrames[7], this.player);
                    break;
                case 'totem':
                    this.totem = new AvoidDeathItem(this.matter.world, itemPos.x, itemPos.y, this.itemFrames[11], this.player);
                    break;
            }
        }        

        this.blindfold = new Blindfold(this, 940, 970, this.vision);

        const height = this.spawnpoint.properties[0].value, heightBg = this.spawnpoint.properties[1].value,
            width = this.spawnpoint.properties[2].value, widthBg = this.spawnpoint.properties[3].value;
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setBounds(widthBg, heightBg, width, height);


        this.player.cursorsPlayer.blindfold.on('down', event => {
            this.onBlindChange();
        });
        this.player.cursorsPlayer.interact.on('down', event => {
            if (this.auxEventHandler !== null) {
                //si se esta pulsando la tecla de interactuar, se llama al evento del npc
                let npcEvent = this.auxEventHandler.nextEvent();
                if (npcEvent !== null) 
                    this.changeScene(npcEvent);
            }
            else if (this.item !== undefined) {
                this.item.itemPointer.setVisible(false);
                this.insertItem(this.item);
            }
        });
        this.player.cursorsPlayer.interactGhost.on('down', event => {
            if (this.blindfold.blind) {
                //if de si tienes suficiente fe
                console.log(this.objectives[this.currentObjective].faithReq);
                if (this.player.faith >= this.objectives[this.currentObjective].faithReq) {
                    let silEvent = this.silhouette.nextEvent();
                    if (silEvent != null)
                        this.changeScene(silEvent);
                }
            }
        });
        this.player.cursorsPlayer.invToggle.on('down', event => {
            this.gui.toggleInventory();
        });

        this.player.cursorsPlayer.pause.on('down', event => {
            //guardo la info entre escenas y cambio de escena
            this.infoNextScene = { player: this.player, prevScene: this };

            this.scene.pause();
            this.scene.run('pauseScene', this.infoNextScene);
            //evito que se queden pillado el input al cambiar de escena
            this.player.resetInputs();
        });

        // Añadimos colision a las layers del tilemap que lo necesitan
        this.building_01.setCollisionByProperty({ obstacle: true });
        this.matter.world.convertTilemapLayer(this.building_01);

        this.map_limits.setCollisionByProperty({ obstacle: true });
        this.matter.world.convertTilemapLayer(this.map_limits);

        this.building_03.setCollisionByProperty({ obstacle: true });
        this.matter.world.convertTilemapLayer(this.building_03);

        this.forest_02.setCollisionByProperty({ obstacle: true });
        this.matter.world.convertTilemapLayer(this.forest_02);

        //referencia al eventHandler con el que se está colisionando
        this.auxEventHandler = null;
        this.matter.world.on('collisionstart',
            (evento, cuerpo1, cuerpo2) => {
                if (cuerpo1.gameObject === this.player) {
                    if (cuerpo2.gameObject instanceof Item) {
                        this.item = cuerpo2.gameObject;
                    }
                    else if (cuerpo2.gameObject instanceof EventHandler && cuerpo2.isSensor) {
                        this.auxEventHandler = cuerpo2.gameObject;
                        console.log("start work")
                    }
                }
            });

        this.matter.world.on('collisionend',
            (evento, cuerpo1, cuerpo2) => {
                if (cuerpo1.gameObject === this.player) {
                    //desasignamos el item en el que estuviese (aunque no estuviese en ninguno)
                    this.item = undefined;

                    // //buscamos si sale de un trigger de seccion
                    if (cuerpo2.gameObject instanceof Trigger) this.newSection(cuerpo2.gameObject);
                    else if (cuerpo2.gameObject instanceof EventHandler && cuerpo2.isSensor) {
                        this.auxEventHandler = null;
                        console.log("end work")
                    }
                }
            });

        this.scene.scene.cameras.main.on('camerafadeoutcomplete', event => {
            if (this.player.death === this.player.deathState.CheckDeath) {
                this.changeScene('deathEvent_0');
                this.cameras.main.fadeIn(2000);
                this.player.enableInputs(true);
            }
            console.log("outComplete")
        });

        this.scene.scene.cameras.main.on('camerafadeincomplete', event => {
            console.log("inComplete")
        });

        this.events.on('wake', event => {
            //la musica vuelve a sonar
            this.sound.play('mainTheme', {
                mute: false, volume: 0.5, rate: 1, detune: 0, seek: 0, loop: true, delay: 0
            });

            if (this.player !== undefined && this.player.death === this.player.deathState.Dead) {
                this.player.die(this.blindfold, this.silhouette);
            }
            else {
                if (this.player.death === this.player.deathState.CheckDeath) {
                    this.player.addSanity(this.player.maxSanity / 2);
                    this.deathBlindfold(this.blindfold, this.silhouette);
                    this.player.setAlive();
                }
                else {
                    if (!this.blindfold.blind) this.onBlindChange();
                }
            }
        });

        // Inicia la animacíon de las tiles
        this.animatedTiles.init(this.map);
    }

    update(time, delta) {
        super.update();
    }
}