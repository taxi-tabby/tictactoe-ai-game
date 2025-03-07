import os
import json
from PIL import Image

def detect_sprites(image_path, spacing=1):
    """이미지에서 스프라이트를 감지하여 JSON으로 변환"""
    img = Image.open(image_path).convert("RGBA")
    img_width, img_height = img.size
    pixels = img.load()
    
    visited = set()
    sprites = []

    def find_bounds(x, y):
        """주어진 좌표에서 연결된 픽셀의 경계를 찾음"""
        stack = [(x, y)]
        min_x, min_y, max_x, max_y = x, y, x, y
        
        while stack:
            cx, cy = stack.pop()
            if (cx, cy) in visited:
                continue
            
            visited.add((cx, cy))
            min_x, min_y = min(min_x, cx), min(min_y, cy)
            max_x, max_y = max(max_x, cx), max(max_y, cy)
            
            for nx, ny in [(cx-1, cy), (cx+1, cy), (cx, cy-1), (cx, cy+1)]:
                if 0 <= nx < img_width and 0 <= ny < img_height and (nx, ny) not in visited:
                    if pixels[nx, ny][3] > 0:  # 투명도가 0보다 크면 유효한 픽셀
                        stack.append((nx, ny))
        
        return min_x, min_y, max_x, max_y
    
    for y in range(img_height):
        for x in range(img_width):
            if (x, y) not in visited and pixels[x, y][3] > 0:  # 새로운 픽셀 발견
                min_x, min_y, max_x, max_y = find_bounds(x, y)
                width = max_x - min_x + 1
                height = max_y - min_y + 1
                
                if width > 1 and height > 1:  # 비어있는 영역 제외
                    # 여유 공간 추가
                    min_x -= spacing
                    min_y -= spacing
                    width += 2 * spacing
                    height += 2 * spacing
                    
                    # 경계가 이미지 크기를 벗어나지 않도록 조정
                    min_x = max(min_x, 0)
                    min_y = max(min_y, 0)
                    max_x = min(min_x + width - 1, img_width - 1)
                    max_y = min(min_y + height - 1, img_height - 1)
                    
                    # 여유 공간이 너무 많이 적용되지 않도록 max_x, max_y 값 조정
                    if max_x < min_x + width - 1:
                        width = max_x - min_x + 1
                    if max_y < min_y + height - 1:
                        height = max_y - min_y + 1
                    
                    sprites.append({
                        "filename": f"sprite_{len(sprites)}",
                        "frame": {"x": min_x, "y": min_y, "w": width, "h": height},
                        "rotated": False,
                        "trimmed": False,
                        "spriteSourceSize": {"x": 0, "y": 0, "w": width, "h": height},
                        "sourceSize": {"w": width, "h": height}
                    })
    
    sprite_json = {
        "frames": sprites,
        "meta": {
            "image": os.path.basename(image_path),
            "format": "RGBA8888",
            "size": {"w": img_width, "h": img_height},
            "scale": "1"
        }
    }
    
    return sprite_json

def process_directory(root_dir, spacing=1):
    """폴더 내 모든 `__sppx__` PNG 파일을 찾아 JSON으로 저장"""
    for foldername, _, filenames in os.walk(root_dir):
        for filename in filenames:
            if "__sppx__" in filename and filename.endswith(".png"):
                image_path = os.path.join(foldername, filename)
                
                # `__sppx__` 제거한 파일명 생성
                json_filename = filename.replace("__sppx__", "").replace(".png", ".json")
                json_path = os.path.join(foldername, json_filename)

                try:
                    # 스프라이트 분석 및 JSON 저장
                    sprite_data = detect_sprites(image_path, spacing)
                    with open(json_path, "w", encoding="utf-8") as json_file:
                        json.dump(sprite_data, json_file, indent=2)
                    
                    print(f"✅ {image_path} -> {json_path}")
                except Exception as e:
                    print(f"❌ {image_path} 처리 중 오류 발생: {e}")

if __name__ == "__main__":
    base_directory = "./public"  # 현재 디렉토리부터 검색
    process_directory(base_directory, spacing=0.1)  # 기본 여유 공간 1px
