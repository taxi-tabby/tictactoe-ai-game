


export function calcPercent(part: number, total: number): number {
    if (total === 0) {
        throw new Error("Total cannot be zero");
    }
    return (part / total) * 100;
}

export function calcValueFromPercent(total: number, percent: number): number {
    return (total * percent) / 100;
}

export function calcGridPercent(pixels: number, totalShells: number, percentage: number): number {
    const gridSize = pixels * totalShells;
    return Math.round(calcPercent(percentage, 100) * gridSize / 100);
}