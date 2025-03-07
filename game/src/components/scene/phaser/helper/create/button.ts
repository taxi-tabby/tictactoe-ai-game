// 버튼을 생성하는 함수
function createButton(scene: Phaser.Scene, x: number, y: number, texture: string, hoverTexture: string, callback: Function): Phaser.GameObjects.Sprite {
    // 기본 버튼 생성 (이미지)
    const button = scene.add.sprite(x, y, texture).setInteractive({useHandCursor: true}).setOrigin(0.5, 0.5);

    // 클릭 중 상태
    button.setOrigin(0.5, 0.5);

    // 마우스 오버(hover) 이벤트
    button.on('pointerover', () => {
        button.setTexture(hoverTexture);  // hover 상태에서 이미지 변경
    });

    // 마우스 아웃(hover에서 벗어났을 때) 이벤트
    button.on('pointerout', () => {
        button.setTexture(texture);  // 원래 상태로 돌아감
    });

    // 클릭 중(버튼 클릭) 이벤트
    button.on('pointerdown', () => {
        button.setTexture(hoverTexture); // 클릭 중에 hover 이미지로 변경
    });

    // 마우스 클릭 후, 떼었을 때
    button.on('pointerup', () => {
        button.setTexture(hoverTexture);  // 클릭 후에 hover 상태로
        callback();  // 버튼 클릭 시 실행할 콜백 함수
    });

    // 마우스 클릭 후, 다시 원래 상태로
    button.on('pointerout', () => {
        button.setTexture(texture);  // 마우스 아웃 시 원래 상태로 돌아옴
    });

    return button;
}

export {createButton};