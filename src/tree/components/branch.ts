import { ITreeGeneratorParameters, TreeGenerator, TreeGeneratorOptions } from "../treeGenerator.js";
import { Vector2 } from "../../utils/linear/vector2.js";
import { BBox } from "../../utils/linear/bbox.js";
import { Leaf } from "./leaf.js";

export interface BranchOptions {
    treeGenerator: ITreeGeneratorParameters,
    position: Vector2;
    depth: number;
    branchLength: number;

    parent?: Branch;
    firstBranch?: boolean;
}

export class Branch {
    public constructor(options: BranchOptions) {
        // set default options
        this.options = options;
        this._parent = options.parent ?? null;
        this.depth = options.depth;
        this._position = options.position;

        // set texture offset
        if (this._parent) {
            const xoffset = options.treeGenerator.getPRNG('GROW').floatInRange(0, 1024);
            const length = (this._position.subtract(this._parent.position)).length();
            this._growthTotal.y = this._parent.growthTotal.y + length;
            if (!options.firstBranch) {
                this._growthLocal.x = xoffset;
                this._growthLocal.y = this._parent._growthLocal.y + length;
            } else {
                this._growthLocal.x = 0;
                this._growthLocal.y = 0;
            }
        }
    }

    public createChildBranch(options: BranchOptions): Branch {
        options.parent = this;
        this._childCount++;
        return this.createInstance(options);
    }

    protected createInstance(options: BranchOptions): Branch {
        return new Branch(options);
    }

    public get angle(): number {
        return this.parent ? Math.atan2(this.position.x - this.parent.position.x, this.parent.position.y - this.position.y) : NaN;
    }

    public get direction(): Vector2 {
        return (!this.parent ? Vector2.Zero : this.position.subtract(this.parent.position).normalize());
    }

    public get branchWidth(): number {
        return this.options.treeGenerator.getBranchWidth(this.depth, this);
    }

    public get branchHeight(): number {
        return this.parent?.position.subtract(this.position).length() || 0;
    }

    public get parent(): Branch | null { return this._parent; }

    public get growthTotal(): Vector2 { return this._growthTotal; }

    public get growthLocal(): Vector2 { return this._growthLocal; }

    public get position(): Vector2 { return this._position; }

    public get childCount(): number { return this._childCount; }

    public distanceTo(leaf: Leaf) { return leaf.position.subtract(this.position).length(); }

    public draw(ctx: CanvasRenderingContext2D, drawBorder: boolean = true) {
        if (!this.parent)
            return;

        if(this.options.treeGenerator.isSerializedPlayback())
            return;

        console.assert(!this.drawn);
        this.drawn = true;

        const branchWidth: number = this.branchWidth;
        const branchHeight: number = this.parent.position.subtract(this.position).length();

        if ((branchWidth / branchHeight) > 2)
            this.drawWithCircle(ctx, drawBorder);
        else
            this.drawWithRectangle(ctx, drawBorder);
    }

    private drawWithRectangle(ctx: CanvasRenderingContext2D, drawBorder: boolean) {
        if (!this.parent)
            return console.assert(false);

        const circleRadius: number = this.branchWidth / 2;
        const tempCanvas = this.options.treeGenerator.getTempCanvas(0);

        //  draw branch to temporary canvas
        tempCanvas.save();
        {
            //    prepare temporary canvas
            tempCanvas.fillStyle = 'black';

            //    draw rectangle mask
            {
                tempCanvas.beginPath();
                tempCanvas.rect(0, 0, this.branchWidth, this.branchHeight + 2);
                tempCanvas.fill();
            }

            //    draw semi-circle mask to cap off start (prevent gaps between branches)
            {
                tempCanvas.save();
                tempCanvas.translate(circleRadius, this.branchHeight);
                tempCanvas.beginPath();
                tempCanvas.arc(0, 0, circleRadius, 0, Math.PI);
                const gradient = tempCanvas.createLinearGradient(0, 0, 0, circleRadius);
                gradient.addColorStop(0.3, 'rgba(0,0,0,1)');
                gradient.addColorStop(1, 'rgba(0,0,0,0)');
                tempCanvas.fillStyle = gradient;
                tempCanvas.fill();
                tempCanvas.restore();
            }

            // fill 'masked' area with branch texture
            tempCanvas.filter = 'none';
            tempCanvas.globalCompositeOperation = 'source-in';
            this.drawTexture(this.options.treeGenerator.getTempCanvas(1), tempCanvas);
            tempCanvas.globalCompositeOperation = 'source-out';
        }
        tempCanvas.restore();

        // copy rendered branch to target canvas
        ctx.save();
        {
            ctx.translate(this.parent.position.x, this.parent.position.y);
            ctx.rotate(this.angle);
            ctx.drawImage(tempCanvas.canvas, -this.branchWidth / 2, -(this.branchHeight));
        }
        ctx.restore();

        // draw outline
        if (drawBorder) {
            const outlineWidth: number = this.options.treeGenerator.getOutlineThickness();
            ctx.save();
            {
                ctx.save();
                ctx.globalCompositeOperation = 'destination-over';
                ctx.fillStyle = 'black';
                ctx.translate(this.parent.position.x, this.parent.position.y);
                ctx.rotate(this.angle);

                ctx.beginPath();
                ctx.arc(0, 0, circleRadius + outlineWidth, 0, Math.PI * 2);
                ctx.fill();

                ctx.beginPath();
                ctx.arc(0, 0, circleRadius + outlineWidth, 0, Math.PI * 2);
                ctx.fill();

                ctx.beginPath();
                ctx.rect((-this.branchWidth / 2) - outlineWidth, 0, this.branchWidth + (outlineWidth * 2), -this.branchHeight);
                ctx.fill();

                ctx.restore();

                ctx.save();
                ctx.globalCompositeOperation = 'destination-over';
                ctx.fillStyle = 'black';
                ctx.translate(this.position.x, this.position.y);
                ctx.beginPath();
                ctx.arc(0, 0, circleRadius + outlineWidth, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();

                ctx.save();
                ctx.globalCompositeOperation = 'destination-over';
                ctx.fillStyle = 'black';
                ctx.translate(this.parent.position.x, this.parent.position.y);
                ctx.rotate(this.angle);
                ctx.beginPath();
                ctx.rect((-this.branchWidth / 2) - outlineWidth, 0, this.branchWidth + (outlineWidth * 2), -this.branchHeight);
                ctx.fill();
                ctx.restore();
                ctx.globalCompositeOperation = 'source-over';
            }
            ctx.restore();
        }
    }

    private drawWithCircle(ctx: CanvasRenderingContext2D, drawBorder: boolean) {
        if (!this.parent)
            return console.assert(false);

        const tempCanvas = this.options.treeGenerator.getTempCanvas(0);
        const circleRadius: number = this.branchWidth / 2;

        //  draw branch to temporary canvas
        {
            //    prepare temporary canvas
            tempCanvas.save();
            tempCanvas.fillStyle = 'black';

            //    draw circle
            {
                tempCanvas.save();
                tempCanvas.translate(circleRadius, circleRadius);
                tempCanvas.beginPath();
                tempCanvas.arc(0, 0, circleRadius, 0, Math.PI * 2);
                const gradient = tempCanvas.createRadialGradient(0, 0, 0, 0, 0, circleRadius);
                gradient.addColorStop(0.8, 'rgba(0,0,0,1)');
                gradient.addColorStop(1, 'rgba(0,0,0,0.1)');
                tempCanvas.fillStyle = gradient;
                tempCanvas.fill();
                tempCanvas.restore();
                tempCanvas.globalCompositeOperation = 'source-in';
                this.drawTexture(this.options.treeGenerator.getTempCanvas(1), tempCanvas);
                tempCanvas.globalCompositeOperation = 'source-out';
            }

            tempCanvas.restore();
        }

        // copy rendered branch to target canvas
        ctx.save();
        ctx.translate(this.parent.position.x, this.parent.position.y);
        ctx.rotate(this.angle);
        ctx.translate(-circleRadius, -circleRadius);
        ctx.drawImage(tempCanvas.canvas, 0, 0);
        ctx.restore();

        // draw outline
        if (drawBorder) {
            const outlineWidth: number = this.options.treeGenerator.getOutlineThickness();
            ctx.save();
            ctx.translate(this.parent.position.x, this.parent.position.y);
            ctx.rotate(this.angle);
            ctx.beginPath();
            // don't draw bottom border half if this is the start of a new tree part
            const drawBottomBorder = this._growthLocal.y > 10;
            ctx.arc(0, 0, circleRadius + outlineWidth, drawBottomBorder ? 0 : Math.PI, Math.PI * 2);
            ctx.globalCompositeOperation = 'destination-over';
            ctx.fillStyle = 'black';
            ctx.fill();
            ctx.restore();
            ctx.globalCompositeOperation = 'source-over';
        }
    }

    protected drawTexture(tempCanvas: CanvasRenderingContext2D, ctx: CanvasRenderingContext2D) {
        const pattern = this.options.treeGenerator.getBranchTexturePattern(this.growthTotal);
        tempCanvas.fillStyle = pattern;
        tempCanvas.beginPath();
        tempCanvas.rect(0, 0, <number>tempCanvas.canvas.width, <number>tempCanvas.canvas.height);
        tempCanvas.fill();
        ctx.drawImage(tempCanvas.canvas, 0, 0);
    }

    protected options: BranchOptions;

    private _growthLocal: Vector2 = new Vector2(0, 0);
    private _growthTotal: Vector2 = new Vector2(0, 0);

    private _position: Vector2;
    private _parent: Branch | null;
    protected depth: number;

    private _childCount: number = 0;

    private drawn: boolean = false;
}