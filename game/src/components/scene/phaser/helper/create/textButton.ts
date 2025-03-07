interface ButtonStyle {
    font?: string;
    fill?: string;
    backgroundColor?: string;
    padding?: Phaser.Types.GameObjects.Text.TextPadding
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
    // 기본 스타일 설정 (선택적으로 사용자 스타일을 덮어쓸 수 있도록)

    const defaultStyles: ButtonStyle = {
        font: '32px Arial',
        fill: '#333',
        backgroundColor: '',
        hoverFill: '#ff0000',
        hoverBackgroundColor: '',
        clickFill: '#00ff00',
        clickBackgroundColor: '',
        padding: { x: 10, y: 5 },
    };

    // 스타일 병합: 기본 스타일을 우선 적용하고, 사용자 스타일을 덮어쓰는 방식
    const buttonStyles = { ...defaultStyles, ...styles };

    // 텍스트 버튼 생성
    const button = scene.add.text(x, y, text, {
        font: buttonStyles.font,
        color: buttonStyles.fill,
        backgroundColor: buttonStyles.backgroundColor,
        padding: buttonStyles.padding,
    }).setInteractive({useHandCursor: true}).setOrigin(0.5, 0.5);

    // 마우스 오버(hover) 이벤트
    button.on('pointerover', () => {
        button.setStyle({
            fill: buttonStyles.hoverFill,
            backgroundColor: buttonStyles.hoverBackgroundColor
        });
    });

    // 마우스 아웃(hover에서 벗어났을 때) 이벤트
    button.on('pointerout', () => {
        button.setStyle({
            fill: buttonStyles.fill,
            backgroundColor: buttonStyles.backgroundColor
        });
    });

    // 클릭 중(버튼 클릭) 이벤트
    button.on('pointerdown', () => {
        button.setStyle({
            fill: buttonStyles.clickFill,
            backgroundColor: buttonStyles.clickBackgroundColor
        });
    });

    // 마우스 클릭 후, 떼었을 때
    button.on('pointerup', () => {
        button.setStyle({
            fill: buttonStyles.fill,
            backgroundColor: buttonStyles.backgroundColor
        });
        callback();  // 버튼 클릭 시 실행할 콜백 함수
    });

    return button;
}

export {createTextButton};