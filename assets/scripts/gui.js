export default class GUI extends Phaser.GameObjects.Container {
    constructor(scene, x, y, player) {
        super(scene, x, y);

        this.scene.add.existing(this);
        this.setScrollFactor(0);
        this.depth = 10;

        //Keybinds
        this.keybindQ = this.scene.add.image(450, 30, 'keybindQ').setScrollFactor(0);
        this.add(this.keybindQ);
        this.keybindE = this.scene.add.image(550, 30, 'keybindE').setScrollFactor(0);
        this.add(this.keybindE);
        this.keybindSpace = this.scene.add.image(700, 30, 'keybindSpace').setScrollFactor(0);
        this.add(this.keybindSpace);

        //Inventario
        this.inventoryRef = player.inventory;
        this.backgroundInventory = this.scene.add.image(300, 560, 'invBack').setScale(0.8, 0.6).setScrollFactor(0);
        this.add(this.backgroundInventory);

        this.isVisible = false;
        this.backgroundInventory.setVisible(this.isVisible);
    }

    toggleInventory() {
        this.isVisible = !this.isVisible;
        this.backgroundInventory.setVisible(this.isVisible);
        this.updateInventory();
    }

    addItem(item) {
        //se coloca en la interfaz
        item.setPosition(65 + ((this.inventoryRef.objects.length - 1) * 90), 560).setScrollFactor(0);
        //se hace interactuable
        item.setInteractive();
        console.log(this.inventoryRef.objects.length, "elems array");
        this.updateInventory();
    }

    updateInventory() {
        for (const item of this.inventoryRef.objects) {
            console.log(item);
            item.setVisible(this.isVisible);
        }
    }

    relocateInventory() {
        for (const item of this.inventoryRef.objects)
            item.setPosition(65 + ((this.inventoryRef.objects.length - 1) * 90), 560);
    }
}