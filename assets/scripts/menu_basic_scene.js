export default class menuBasicScene extends Phaser.Scene{
    constructor(sceneKey){
        super({key: sceneKey});
    }

    createButton(x, y, scale, imageKey, cb){
        const button = this.add.image(x, y, imageKey).setInteractive();
        //callbacks de los botones:
        //pointerover
        button.on('pointerover', event => {button.setScale(scale+0.1)});
        //pointerout
        button.on('pointerout', event => {button.setScale(scale)});
        //pointerdown
        button.on('pointerdown', event => {
            this.sound.play('sfxClick');
            cb(this, button);
        });

        return button;
    }

    playButton(x,y, scale){
        return this.createButton(x,y, scale, 'mainMenuPlay', function(ref){
            ref.sound.stopAll();
            ref.scene.start('level1');
        });
    }

    optionsButton(x, y, scale){
        return this.createButton(x,y, scale, 'mainMenuSettings', function(ref){
            ref.scene.stop();
            ref.scene.run('optionsScene', {prevScene: ref });
        });
    }

    volumeButton(x,y, scale, index){
        return this.createButton(x,y, scale, 'volume', function(ref, button){
            if(index >= 3) index = 0;
            else index++;
            button.setFrame(index);
            ref.sound.setVolume(index * 0.33);
        });
    }

    levelsButton(x,y, scale){
        return this.createButton(x,y, scale, 'mainMenuLevels', function(ref){
            ref.scene.stop();
            ref.scene.run('levelSelectorScene', {prevScene: ref });
        });
    }

    returnButton(x,y, scale, info){
        return this.createButton(x,y, scale, 'back', function(ref){
            ref.scene.stop();
            ref.scene.run(info.prevScene.scene.key);
        });
    }

    returnToMenuButton(x,y, scale){
        return this.createButton(x,y, scale, 'pauseMenuToMainMenu', function(ref){
            ref.sound.stopAll();
            ref.scene.start('mainMenuScene');
        });
    }
    
    goToSceneButton(x,y, scale, textureKey, nextScene){
        return this.createButton(x,y, scale, textureKey, function(ref){
            ref.sound.stopAll();
            ref.scene.start(nextScene);
        });
    }
}