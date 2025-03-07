export class ImageLoader {
    private images: Map<string, HTMLImageElement>;
    private base64Images: Map<string, string>;
    private fetchedData: Map<string, Blob>; // 데이터를 Blob 형태로 저장

    constructor() {
        this.images = new Map();
        this.base64Images = new Map();
        this.fetchedData = new Map();
    }

    loadImage(key: string, src: string, fetchUrl?: string): Promise<void> {
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

                // fetchUrl이 존재하면 데이터를 가져와 Blob으로 저장
                if (fetchUrl) {
                    fetch(fetchUrl)
                        .then(response => response.blob()) // Blob 형태로 저장
                        .then(blob => {
                            console.log(`Fetched data from ${fetchUrl}:`, 'Blob size:', blob.size);
                            this.fetchedData.set(key, blob);
                            resolve();
                        })
                        .catch(error => {
                            console.warn(`Failed to fetch data from ${fetchUrl}:`, error);
                            resolve(); // 이미지 로딩은 성공했으므로 오류 무시
                        });
                } else {
                    resolve();
                }
            };
            img.onerror = () => {
                reject(new Error(`Failed to load image: ${src}`));
            };
        });
    }

    getImage(key: string): HTMLImageElement | undefined {
        return this.images.get(key);
    }

    getOriginPath(key: string): string | undefined {
        const img = this.images.get(key);
        return img ? img.src : undefined;
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

    /**
     * Blob 데이터를 Object URL로 변환하여 반환
     */
    getFetchedDataURL(key: string): string | undefined {
        const blob = this.fetchedData.get(key);
        if (!blob) return undefined;
        return URL.createObjectURL(blob);
    }
}
