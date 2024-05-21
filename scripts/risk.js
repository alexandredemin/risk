const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let selectedArmy = null;
const territories = {};

function preload() {
    console.log('start preload');
    // Загрузите ресурсы, например, карту мира
    this.load.image('worldMap', 'maps/ancient.png');
    // Загрузите изображения армий
    this.load.image('armyBlue', 'img/army_blue.png');
    this.load.image('armyRed', 'img/army_red.png');
}

function create() {
    console.log('start create');
    // Добавьте карту мира на сцену
    const map = this.add.image(400, 300, 'worldMap');
    this.textures.addBase64('mapBase64', map.texture.source[0].image.src);

    const mapTexture = this.textures.get('mapBase64').getSourceImage();
    const canvas = this.textures.createCanvas('mapCanvas', mapTexture.width, mapTexture.height);
    const context = canvas.getContext();
    context.drawImage(mapTexture, 0, 0);

    /*
    // Пример создания территорий
    territories['territory1'] = { x: 200, y: 300, owner: 'blue', armies: 5, neighbors: ['territory2'], color: 0x0000ff };
    territories['territory2'] = { x: 600, y: 300, owner: 'red', armies: 3, neighbors: ['territory1'], color: 0xff0000 };

    // Закрасьте территории на карте
    updateTerritoryColors(context);

    // Создание армии на каждой территории
    for (const [key, territory] of Object.entries(territories)) {
        territory.sprite = this.physics.add.image(territory.x, territory.y, `army${capitalizeFirstLetter(territory.owner)}`).setInteractive();
        territory.sprite.setData('territory', key);
    }

    // Обработка нажатия на армию
    this.input.on('gameobjectdown', (pointer, gameObject) => {
        const territoryKey = gameObject.getData('territory');
        if (territories[territoryKey]) {
            selectedArmy = gameObject;
            console.log(`${territories[territoryKey].owner} army selected on ${territoryKey}`);
        }
    });

    // Обработка клика по сцене для перемещения армии
    this.input.on('pointerdown', (pointer) => {
        if (selectedArmy) {
            const territoryKey = selectedArmy.getData('territory');
            const targetTerritoryKey = findTerritoryAt(pointer.x, pointer.y, context);
            if (targetTerritoryKey && territories[territoryKey].neighbors.includes(targetTerritoryKey)) {
                // Перемещение армий между территориями
                console.log(`Moving army from ${territoryKey} to ${targetTerritoryKey}`);
                territories[targetTerritoryKey].armies += territories[territoryKey].armies;
                territories[territoryKey].armies = 0;
                territories[targetTerritoryKey].owner = territories[territoryKey].owner;
                updateTerritoryColors(context);
                updateArmySprites();
                selectedArmy = null;
            } else {
                console.log('Invalid move');
            }
        }
    });
    */
}

function update() {
    // Обновляйте игру в каждом кадре
}

function findTerritoryAt(x, y, context) {
    // Получите данные пикселей в точке клика
    const pixel = context.getImageData(x, y, 1, 1).data;
    const hexColor = rgbToHex(pixel[0], pixel[1], pixel[2]);

    // Определите территорию по цвету пикселя
    for (const [key, territory] of Object.entries(territories)) {
        if (territory.color === hexColor) {
            return key;
        }
    }
    return null;
}

function updateTerritoryColors(context) {
    for (const [key, territory] of Object.entries(territories)) {
        fillTerritory(context, territory.x, territory.y, getColorByOwner(territory.owner));
    }
}

function fillTerritory(context, x, y, color) {
    const floodFill = (context, x, y, fillColor) => {
        const imageData = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
        const data = imageData.data;
        const stack = [[x, y]];
        const baseColor = getColorAtPixel(data, x, y, context.canvas.width);

        if (baseColor === fillColor) return;

        while (stack.length) {
            const [x, y] = stack.pop();
            const currentColor = getColorAtPixel(data, x, y, context.canvas.width);
            if (currentColor !== baseColor) continue;

            let west = x;
            let east = x;
            while (west > 0 && getColorAtPixel(data, west - 1, y, context.canvas.width) === baseColor) west--;
            while (east < context.canvas.width - 1 && getColorAtPixel(data, east + 1, y, context.canvas.width) === baseColor) east++;

            for (let i = west; i <= east; i++) {
                setColorAtPixel(data, i, y, context.canvas.width, fillColor);
                if (y > 0 && getColorAtPixel(data, i, y - 1, context.canvas.width) === baseColor) stack.push([i, y - 1]);
                if (y < context.canvas.height - 1 && getColorAtPixel(data, i, y + 1, context.canvas.width) === baseColor) stack.push([i, y + 1]);
            }
        }
        context.putImageData(imageData, 0, 0);
    };

    floodFill(context, x, y, color);
}

function getColorAtPixel(data, x, y, width) {
    const index = (y * width + x) * 4;
    return (data[index] << 16) | (data[index + 1] << 8) | data[index + 2];
}

function setColorAtPixel(data, x, y, width, color) {
    const index = (y * width + x) * 4;
    data[index] = (color >> 16) & 0xff;
    data[index + 1] = (color >> 8) & 0xff;
    data[index + 2] = color & 0xff;
}

function rgbToHex(r, g, b) {
    return (r << 16) | (g << 8) | b;
}

function getColorByOwner(owner) {
    switch (owner) {
        case 'blue': return 0x0000ff;
        case 'red': return 0xff0000;
        default: return 0xffffff;
    }
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function updateArmySprites() {
    for (const [key, territory] of Object.entries(territories)) {
        if (territory.armies > 0) {
            territory.sprite.setTexture(`army${capitalizeFirstLetter(territory.owner)}`);
            territory.sprite.setVisible(true);
        } else {
            territory.sprite.setVisible(false);
        }
    }
}