export default class pauseScene extends Phaser.Scene {
    init(data) {
        this.info = data;
    }

    constructor() {
        super({ key: 'pauseScene' });
    }

    create() {
        this.scene.bringToTop();
        let background = this.add.image(0, 0, 'pauseMenu').setOrigin(0);
        background.setPosition(this.cameras.main.centerX - background.width/2, this.cameras.main.centerY - background.height/2);

        const resume = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY -40, 'pauseMenuResume').setInteractive()
        const exit = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY + 30, 'pauseMenuToMainMenu').setInteractive()
        const options = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY + 100, 'pauseMenuSettings').setInteractive()        
        //callbacks de los botones:
        //pointerover
        resume.on('pointerover', event => { resume.setScale(1.2); });
        exit.on('pointerover', event => { exit.setScale(1.2); });
        //pointerout
        resume.on('pointerout', event => { resume.setScale(1); });
        exit.on('pointerout', event => { exit.setScale(1); });
        //pointerdown
        resume.on('pointerdown', event => {
            this.scene.stop();
            this.scene.run(this.info.prevScene.scene.key);
        });
        exit.on('pointerdown', event => {
            this.sound.stopAll();
            this.scene.start('mainMenuScene');
        });

        options.on('pointerover', event => {options.setScale(1.2);});
        //pointerout
        options.on('pointerout', event => {options.setScale(1);});
        //pointerdown
        options.on('pointerdown', event => {
            this.scene.sleep();
            this.scene.run('optionsScene', {prevScene: this });
        });


    }
}