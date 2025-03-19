import Phaser from 'phaser';

export async function createText(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    style: Phaser.Types.GameObjects.Text.TextStyle,
    fontName: string
): Promise<Phaser.GameObjects.Text> {
    // Load the font asynchronously
    await document.fonts.load(`1em ${fontName}`);

    // Create and return the text object
    const textObject = scene.add.text(x, y, text, {
        ...style,
        fontFamily: fontName,
    });

    return textObject;
}