interface ButtonStyle extends Phaser.Types.GameObjects.Text.TextStyle {
    hoverFill?: string;
    hoverBackgroundColor?: string;
    clickFill?: string;
    clickBackgroundColor?: string;
}

function createTextButton(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    callback: Function,
    styles: ButtonStyle = {} // 기본 스타일을 옵션으로 받을 수 있도록 설정
): Phaser.GameObjects.Text {

    
    const defaultStyles: ButtonStyle = {
        font: '12px Arial',
        color: '#333',  // 기본 텍스트 색상
        backgroundColor: '',
        hoverFill: '#ff0000',  // hover 시 색상
        hoverBackgroundColor: '',
        clickFill: '#00ff00',  // 클릭 시 색상
        clickBackgroundColor: '',
        padding: { x: 10, y: 5 },
    };

    const buttonStyles = { ...defaultStyles, ...styles };

    const button = scene.add.text(x, y, text, buttonStyles).setInteractive({ useHandCursor: true }).setOrigin(0.5, 0.5);

    button.setVisible(false);


    // 초기 스타일 적용 후 강제로 다시 렌더링
    scene.events.once('render', () => {
        setTimeout(() => {
            button.setStyle(buttonStyles);
            button.setVisible(true);
        }, 0);
        console.log(buttonStyles);
    });


    // button.renderFlags = 0;
    // button.willRender(scene.cameras.default);



    // 마우스 오버(hover) 이벤트
    button.on('pointerover', () => {
        button.setStyle({
            color: buttonStyles.hoverFill,
        });
        if (buttonStyles.hoverBackgroundColor) {
            button.setBackgroundColor(buttonStyles.hoverBackgroundColor);
        }
    });

    // 마우스 아웃(hover에서 벗어났을 때) 이벤트
    button.on('pointerout', () => {
        button.setStyle({
            color: buttonStyles.color,
        });
        if (buttonStyles.backgroundColor) {
            button.setBackgroundColor(buttonStyles.backgroundColor);
        }
    });

    // 클릭 중(버튼 클릭) 이벤트
    button.on('pointerdown', () => {
        button.setStyle({
            color: buttonStyles.clickFill,
        });
        if (buttonStyles.clickBackgroundColor) {
            button.setBackgroundColor(buttonStyles.clickBackgroundColor);
        }
    });

    // 마우스 클릭 후, 떼었을 때
    button.on('pointerup', () => {
        button.setStyle({
            color: buttonStyles.color,
        });
        if (buttonStyles.backgroundColor) {
            button.setBackgroundColor(buttonStyles.backgroundColor);
        }
        callback();
    });

    return button;
}



export { createTextButton };
