type ColorFormat = {
    hex: string;
    rgb: { r: number; g: number; b: number };
    rgba: { r: number; g: number; b: number; a: number };
    vec3: [number, number, number];
    vec4: [number, number, number, number];
};

function parseColor(color: string): ColorFormat {
    let hex = color;
    if (color.startsWith('#')) {
        hex = color.slice(1);
    } else if (color.startsWith('0x')) {
        hex = color.slice(2);
    }

    let r, g, b, a = 255;
    if (hex.length === 6) {
        r = parseInt(hex.slice(0, 2), 16);
        g = parseInt(hex.slice(2, 4), 16);
        b = parseInt(hex.slice(4, 6), 16);
    } else if (hex.length === 8) {
        r = parseInt(hex.slice(0, 2), 16);
        g = parseInt(hex.slice(2, 4), 16);
        b = parseInt(hex.slice(4, 6), 16);
        a = parseInt(hex.slice(6, 8), 16);
    } else {
        throw new Error('Invalid color format');
    }

    return {
        hex: `#${hex}`,
        rgb: { r, g, b },
        rgba: { r, g, b, a },
        vec3: [r / 255, g / 255, b / 255],
        vec4: [r / 255, g / 255, b / 255, a / 255],
    };
}

export { parseColor };
export type { ColorFormat };