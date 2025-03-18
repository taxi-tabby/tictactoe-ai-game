function createButton(
    scene: Phaser.Scene, 
    x: number, 
    y: number, 
    texture: string | { key: string, frame: string | number }, 
    hoverTexture: string | { key: string, frame: string | number }, 
    callback: Function
): Phaser.GameObjects.Sprite {
    
    // 기본 버튼 생성 (이미지)
    const button = scene.add.sprite(x, y, typeof texture === 'string' ? texture : texture.key)
        .setInteractive({ useHandCursor: true })
        .setOrigin(0.5, 0.5);
    
    // 기본 상태를 텍스처로 설정 (최초 상태)
    let currentTexture: string | { key: string, frame: string | number } = texture;
    if (typeof texture !== 'string') {
        currentTexture = texture;
    }
    
    // 최초 상태를 기본 텍스처로 설정
    if (typeof currentTexture === 'string') {
        button.setTexture(currentTexture);
    } else {
        button.setTexture(currentTexture.key, currentTexture.frame);
    }

    // 마우스 오버(hover) 이벤트
    button.on('pointerover', () => {
        if (typeof hoverTexture === 'string') {
            button.setTexture(hoverTexture);  // hover 상태에서 이미지 변경
        } else {
            button.setTexture(hoverTexture.key, hoverTexture.frame);  // hover 상태에서 스프라이트 프레임 변경
        }
    });

    // 마우스 아웃(hover에서 벗어났을 때) 이벤트
    button.on('pointerout', () => {
        if (typeof currentTexture === 'string') {
            button.setTexture(currentTexture);  // 원래 상태로 돌아감
        } else {
            button.setTexture(currentTexture.key, currentTexture.frame);  // 원래 상태로 돌아감
        }
    });

    // 클릭 중(버튼 클릭) 이벤트
    button.on('pointerdown', () => {
        if (typeof hoverTexture === 'string') {
            button.setTexture(hoverTexture); // 클릭 중에 hover 이미지로 변경
        } else {
            button.setTexture(hoverTexture.key, hoverTexture.frame); // 클릭 중에 hover 스프라이트 프레임으로 변경
        }
    });

    // 마우스 클릭 후, 떼었을 때
    button.on('pointerup', () => {
        if (typeof currentTexture === 'string') {
            button.setTexture(currentTexture);  // 클릭 후 원래 상태로 돌아감
        } else {
            button.setTexture(currentTexture.key, currentTexture.frame);  // 클릭 후 원래 스프라이트 프레임으로 돌아감
        }
        callback();  // 버튼 클릭 시 실행할 콜백 함수
    });

    return button;
}


function createAnimatedButton(
    scene: Phaser.Scene, 
    x: number, 
    y: number, 
    animationKey: string,  // 기본 애니메이션
    hoverAnimationKey: string,  // hover 상태 애니메이션
    callback: Function
): Phaser.GameObjects.Sprite {
    
    // 기본 버튼 생성 (애니메이션)
    const button = scene.add.sprite(x, y, animationKey)
        .setInteractive({ useHandCursor: true })
        .setOrigin(0.5, 0.5);
    
    // 기본 애니메이션 설정 (애니메이션 플레이)
    button.anims.play(animationKey);
    
    // 마우스 오버(hover) 이벤트
    button.on('pointerover', () => {
        button.anims.stop();
        button.anims.play(hoverAnimationKey);  // hover 상태에서 애니메이션 변경
    });

    // 마우스 아웃(hover에서 벗어났을 때) 이벤트
    button.on('pointerout', () => {
        button.anims.stop();
        button.anims.play(animationKey);  // 원래 애니메이션으로 돌아감
    });

    // 클릭 중(버튼 클릭) 이벤트
    button.on('pointerdown', () => {
        button.anims.stop();
        button.anims.play(hoverAnimationKey);  // 클릭 중에 hover 애니메이션 실행
    });

    // 마우스 클릭 후, 떼었을 때
    button.on('pointerup', () => {
        button.anims.stop();
        button.anims.play(animationKey);  // 클릭 후 원래 애니메이션으로 돌아감
        callback();  // 버튼 클릭 시 실행할 콜백 함수
    });

    return button;
}


export { createButton, createAnimatedButton };
