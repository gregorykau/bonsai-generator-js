export namespace CanvasHelper {
    const cachedCanvases: Map<number, CanvasRenderingContext2D> = new Map();
    export function getTempCanvas(size: number) {
        let canvas = cachedCanvases.get(size);
        if (!canvas) {
            canvas = createTempCanvas(size, size);
            cachedCanvases.set(size, canvas);
        }
        canvas.clearRect(0, 0, size, size);
        return canvas;
    }

    export function createTempCanvas(width: number, height: number): CanvasRenderingContext2D {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = <CanvasRenderingContext2D>canvas.getContext("2d");
        context.imageSmoothingEnabled = false;
        return context;
    }

    export async function loadImage(url: string, imgElement?: HTMLImageElement): Promise<HTMLImageElement> {
        let img = imgElement || new Image();
        let instantLoadFromCache: boolean = false;
        img.onload = () => instantLoadFromCache = true;
        img.src = url;
        if (instantLoadFromCache)
            return img;
        await new Promise(resolve => img.onload = resolve);
        return img;
    }

    const cachedImageBorders: Map<HTMLImageElement, CanvasRenderingContext2D> = new Map(); //createTempCanvas()
    const offsets: Array<[number, number]> = [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]];
    export function drawImageBorder(img: HTMLImageElement, ctx: CanvasRenderingContext2D, thickness: number) {
        let borderCtx = cachedImageBorders.get(img);
        if (!borderCtx) {
            borderCtx = createTempCanvas(<number>img.width, <number>img.height);

            // draw the image in 8 compass offsets with scaling
            for (const [xOffset, yOffset] of offsets) {
                borderCtx.drawImage(img, xOffset * thickness, yOffset * thickness);
            }

            // fill splatted area with black to create the border region
            borderCtx.globalCompositeOperation = 'source-in';
            borderCtx.fillStyle = 'black';
            borderCtx.fillRect(0, 0, <number>img.width, <number>img.height);

            cachedImageBorders.set(img, borderCtx);
        }
        ctx.drawImage(borderCtx.canvas, 0, 0);
        ctx.drawImage(img, 0, 0);
    }
}