export interface MetaballOptions {
    threshold?: number;
    points: Array<MetaPoint>;
}

export interface MetaPoint {
    x: number;
    y: number;
    r: number;
};

export class MetaballSurface {
    public constructor(options: MetaballOptions) {
        this.threshold = options.threshold ?? 1;
        this.points = options.points;
    }

    public spaceOccupied(x: number, y: number): boolean {
        const val: number = this.points.reduce((sum, point) => sum + this.getAdditiveMetaballValue(point, x, y), 0);
        return val > this.threshold;
    }

    public generateCanvasOutline(ctx: CanvasRenderingContext2D) {
        const imageData = ctx.createImageData(ctx.canvas.width, ctx.canvas.height);
        const data = imageData.data;

        let x = 0, y = 0;
        for (let i = 0; i < data.length; i += 4) {
            data[i + 0] = this.spaceOccupied(x, y) ? 255 : 0;
            data[i + 3] = 255;
            if (++x == ctx.canvas.width) {
                x = 0;
                y++;
            }
        }

        ctx.putImageData(imageData, 0, 0);
    }

    private getAdditiveMetaballValue(point: MetaPoint, x: number, y: number): number {
        return (point.r * point.r) / (((x - point.x) * (x - point.x)) + ((y - point.y) * (y - point.y)));
    }

    private threshold: number;
    private points: Array<MetaPoint>;
}