import {ITreeGeneratorParameters} from "../treeGenerator.js";
import {Vector2} from "../../utils/linear/vector2.js";
import {Leaf} from "./leaf.js";
import { TreePart, TreePartContext } from "../treeParts/treePart.js";

export interface BranchOptions {
    position: Vector2;
    parent?: Branch;
    context: BranchContext;
}

export interface BranchContext extends TreePartContext {
    treePart: TreePart;
}

export class Branch {
    public constructor(options: BranchOptions) {
        // set default options
        this.options = options;
        this._parent = options.parent ?? null;
        this._position = options.position;

        
        // set texture offset
        if (this.parent) {
            const length = (this._position.subtract(this.parent.endPos)).length();
            this.growthTotal.y = this.parent.growthTotal.y + length;
            if (this.isFirstBranch) {
                this.growthLocal.x = options.context.treeGenerator.getPRNG('GROW').floatInRange(0, 1024);
                this.growthLocal.y = 0;
            } else {
                this.growthLocal.x = this.growthLocal.x;
                this.growthLocal.y = this.parent!.growthLocal.y + length;
            }
        }
    }

    public extrude(direction: Vector2): Branch {
        this._childCount++;
        return new Branch({
            position: this.endPos.add(direction),
            parent: this,
            context: this.options.context
        });
    }

    public get isFirstBranch() {
        return (this.options.context?.treePart != this.options.parent?.context?.treePart);
    }

    public get context(): BranchContext | undefined {
        return this.options.context;
    }

    public get angle(): number {
        if (!this.parent)
            return NaN;
        return Math.atan2(this.endPos.x - this.startPos.x, this.startPos.y - this.endPos.y);
    }

    public get direction(): Vector2 {
        if (!this.parent)
            return Vector2.Zero;
        return this.endPos.subtract(this.startPos).normalize();
    }

    public get branchWidth(): number {
        return this.options.context.treeGenerator.getBranchWidth(this);
    }

    public get branchHeight(): number {
        if (!this.parent)
            return 0;
        return this.endPos.subtract(this.startPos).length();
    }

    public get parent(): Branch | null { return this._parent; }

    public get growthTotal(): Vector2 { return this._growthTotal; }

    public get growthLocal(): Vector2 { return this._growthLocal; }

    public get endPos(): Vector2 { return this._position; }

    public get startPos(): Vector2 {
        if (!this.parent)
            return this.endPos;
        if (this.isFirstBranch)
            return this.parent.endPos.subtract(this.options.context!.treePart.position);
        return this.parent.endPos;
    }

    public get endPosGlobal(): Vector2 {
        return this.options.context!.treePart.positionGlobal.add(this.endPos);
    }

    public get childCount(): number { return this._childCount; }

    public distanceTo(leaf: Leaf) { return leaf.position.subtract(this.endPos).length(); }

    public draw(ctx: CanvasRenderingContext2D, drawBorder: boolean = true) {
        if (!this.parent)
            return;

        if(this.options.context.isPlayback)
            return;

        if ((this.branchWidth / this.branchHeight) > 2)
            this.drawWithCircle(ctx, drawBorder);
        else
            this.drawWithRectangle(ctx, drawBorder);

        console.assert(!this.drawn);
        this.drawn = true;  
    }

    private drawWithRectangle(ctx: CanvasRenderingContext2D, drawBorder: boolean) {
        if (!this.parent)
            return console.assert(false);

        const circleRadius: number = this.branchWidth / 2;
        const tempCanvas = this.options.context.treeGenerator.getTempCanvas(0);

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
            this.drawTexture(this.options.context.treeGenerator.getTempCanvas(1), tempCanvas);
            tempCanvas.globalCompositeOperation = 'source-out';
        }
        tempCanvas.restore();

        // copy rendered branch to target canvas
        ctx.save();
        {
            ctx.translate(this.startPos.x, this.startPos.y);
            ctx.rotate(this.angle);
            ctx.drawImage(tempCanvas.canvas, -this.branchWidth / 2, -(this.branchHeight));
        }
        ctx.restore();

        // draw outline
        if (drawBorder) {
            const outlineWidth: number = this.options.context.treeGenerator.getOutlineThickness();
            ctx.save();
            {
                ctx.save();
                ctx.globalCompositeOperation = 'destination-over';
                ctx.fillStyle = 'black';
                ctx.translate(this.startPos.x, this.startPos.y);
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
                ctx.translate(this.endPos.x, this.endPos.y);
                ctx.beginPath();
                ctx.arc(0, 0, circleRadius + outlineWidth, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();

                ctx.save();
                ctx.globalCompositeOperation = 'destination-over';
                ctx.fillStyle = 'black';
                ctx.translate(this.startPos.x, this.startPos.y);
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

        const tempCanvas = this.options.context.treeGenerator.getTempCanvas(0);
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
                this.drawTexture(this.options.context.treeGenerator.getTempCanvas(1), tempCanvas);
                tempCanvas.globalCompositeOperation = 'source-out';
            }

            tempCanvas.restore();
        }

        // copy rendered branch to target canvas
        ctx.save();
        ctx.translate(this.startPos.x, this.startPos.y);
        ctx.rotate(this.angle);
        ctx.translate(-circleRadius, -circleRadius);
        ctx.drawImage(tempCanvas.canvas, 0, 0);
        ctx.restore();

        // draw outline
        if (drawBorder) {
            const outlineWidth: number = this.options.context.treeGenerator.getOutlineThickness();
            ctx.save();
            ctx.translate(this.startPos.x, this.startPos.y);
            ctx.rotate(this.angle);
            ctx.beginPath();
            // don't draw bottom border half if this is the start of a new tree part
            const drawBottomBorder = !this.isFirstBranch;
            if (drawBottomBorder) {
                ctx.arc(0, 0, circleRadius + outlineWidth, 0, Math.PI * 2);
            } else {
                ctx.arc(0, 0, circleRadius + outlineWidth, Math.PI + 0.3, Math.PI * 2 - 0.3);
            }
            ctx.globalCompositeOperation = 'destination-over';
            ctx.fillStyle = 'black';
            ctx.fill();
            ctx.restore();
            ctx.globalCompositeOperation = 'source-over';
        }
    }

    protected drawTexture(tempCanvas: CanvasRenderingContext2D, ctx: CanvasRenderingContext2D) {
        tempCanvas.fillStyle = this.options.context.treeGenerator.getBranchTexturePattern(this.growthTotal);
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

    private _childCount: number = 0;

    private drawn: boolean = false;
}