import { Vector2 } from "./vector2";

export class BBox {
    public constructor(minCorner: Vector2, maxCorner: Vector2) {
        this.minCorner = minCorner.clone();
        this.maxCorner = maxCorner.clone();
    }

    public static fromPositionAndSize(minCorner: Vector2, size: Vector2) {
        const newMinCorner = minCorner;
        const newMaxCorner = minCorner.add(size);
        return new BBox(newMinCorner, newMaxCorner);

    }

    public intersects(bbox: BBox): boolean { return BBox.intersects(this, bbox); }

    public get width(): number { return this.maxCorner.x - this.minCorner.x; }
    public get height(): number { return this.maxCorner.y - this.minCorner.y; }
    public get center(): Vector2 { return this.minCorner.add(this.size.scale(0.5)); }
    public get size(): Vector2 { return new Vector2(this.width, this.height); }

    public maximizeAgainstPoint(pos: Vector2) {
        this.minCorner.x = Math.min(this.minCorner.x, pos.x);
        this.minCorner.y = Math.min(this.minCorner.y, pos.y);
        
        this.maxCorner.x = Math.max(this.maxCorner.x, pos.x);
        this.maxCorner.y = Math.max(this.maxCorner.y, pos.y);
    }

    public clone() {
        return new BBox(this.minCorner.clone(), this.maxCorner.clone());
    }

    public setZero() {
        this.minCorner = Vector2.Zero;
        this.maxCorner = Vector2.Zero;
    }

    public static intersects(bboxA: BBox, bboxB: BBox): boolean {
        return !(
            (bboxA.minCorner.x > bboxB.maxCorner.x) || (bboxA.maxCorner.x < bboxB.minCorner.x) ||
            (bboxA.minCorner.y > bboxB.maxCorner.y) || (bboxA.maxCorner.y < bboxB.minCorner.y)
        );
    }

    public minCorner: Vector2;
    public maxCorner: Vector2;
}
