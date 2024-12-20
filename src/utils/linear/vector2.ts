export class Vector2 {
    public constructor(x: number = 0, y: number = 0) { this._x = x; this._y = y; }
    public copyFrom(otherVector: Vector2): Vector2 { this._x = otherVector.x; this._y = otherVector.y; return this; }
    public clone(): Vector2 { return new Vector2(this._x, this._y); }
    public add(otherVector: Vector2): Vector2 { return this.clone().addInPlace(otherVector); }
    public subtract(otherVector: Vector2): Vector2 { return this.clone().subtractInPlace(otherVector); }
    public scale(scalar: number): Vector2 { return this.clone().scaleInPlace(scalar); }
    public elementMultiply(x: number, y: number): Vector2 { return new Vector2(this._x * x, this._y * y); }
    public dot(otherVec: Vector2): number { return (this._x * otherVec.x + this._y * otherVec.y); }
    public addInPlaceFromFloats(x: number, y: number): Vector2 { this._x += x; this._y += y; return this; }
    public subtractInPlaceFromFloats(x: number, y: number): Vector2 { this._x -= x; this._y -= y; return this; }
    public addFromFloats(x: number, y: number): Vector2 { return new Vector2(this._x + x, this._y + y); }
    public addInPlace(otherVector: Vector2): Vector2 { this._x += otherVector._x; this._y += otherVector._y; return this; }
    public subtractInPlace(otherVector: Vector2): Vector2 { this._x -= otherVector._x; this._y -= otherVector._y; return this; }
    public scaleInPlace(scalar: number): Vector2 { this._x *= scalar; this._y *= scalar; return this; }
    public normalize(): Vector2 { const length = this.length(); this._x /= length; this._y /= length; return this; }
    public equals(otherVec: Vector2): boolean { return (this._x == otherVec.x && this._y == otherVec.y) };
    public normal(): Vector2 { return new Vector2(-this._y, this._x); }
    public floor(): Vector2 { return new Vector2(Math.floor(this._x), Math.floor(this._y)); }
    public length(): number { return Math.sqrt(this._x * this._x + this._y * this._y); }
    public randomizeOffsetInPlace(maxDist: number, random?: number): Vector2 {
        random = random ?? Math.random();
        const angle = random * Math.PI * 2;
        this._x += Math.cos(angle) * maxDist;
        this._y += Math.sin(angle) * maxDist;
        return this;
    }
    public get angle(): number { return Math.atan2(this._y, this._x); }
    public randomizeAngle(minAngleDiff: number, maxAngleDiff: number, random: number): Vector2 {
        random = random ?? Math.random();
        const length: number = this.length();
        const dir = random > 0.5;
        const currentAngle: number = Math.atan2(this._y, this._x);
        const newAngle: number = currentAngle + (random > 0.5 ? 1 : -1) * (minAngleDiff + (maxAngleDiff - minAngleDiff) * random);
        return new Vector2(Math.cos(newAngle), Math.sin(newAngle)).scale(length);
    }
    public static fromAngle(angle: number): Vector2 {
        return new Vector2(Math.cos(angle), Math.sin(angle));
    }
    public static get One(): Vector2 { return new Vector2(1.0, 1.0); }
    public static get Zero(): Vector2 { return new Vector2(0.0, 0.0); }
    public get x(): number { return this._x; } public set x(x: number) { this._x = x; }
    public get y(): number { return this._y; } public set y(y: number) { this._y = y; }
    private _x: number; private _y: number;
}
