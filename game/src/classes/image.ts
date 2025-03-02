export class ImageLoader {
    private images: Map<string, HTMLImageElement>;
    private base64Images: Map<string, string>;

    constructor() {
        this.images = new Map();
        this.base64Images = new Map();
    }

    loadImage(key: string, src: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = src;
            img.onload = () => {
                this.images.set(key, img);

                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0);
                    const base64 = canvas.toDataURL();
                    this.base64Images.set(key, base64);
                }

                console.info(`Image loaded from ${src}`);
                resolve();
            };
            img.onerror = () => {
                reject(new Error(`Failed to load image: ${src}`));
            };
        });
    }

    getImage(key: string): HTMLImageElement | undefined {
        return this.images.get(key);
    }

    getImageAsBinary(key: string): Promise<Uint8Array | undefined> {
        return new Promise((resolve, reject) => {
            const img = this.images.get(key);
            if (!img) {
                return resolve(undefined);
            }

            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                return reject(new Error('Failed to get canvas context'));
            }

            ctx.drawImage(img, 0, 0);
            canvas.toBlob((blob) => {
                if (!blob) {
                    return reject(new Error('Failed to convert image to blob'));
                }

                const reader = new FileReader();
                reader.onloadend = () => {
                    const arrayBuffer = reader.result as ArrayBuffer;
                    resolve(new Uint8Array(arrayBuffer));
                };
                reader.onerror = () => {
                    reject(new Error('Failed to read blob as array buffer'));
                };
                reader.readAsArrayBuffer(blob);
            });
        });
    }

    getImageAsBase64(key: string): string | undefined {
        return this.base64Images.get(key);
    }
}
