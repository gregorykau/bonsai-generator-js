import { ITreeGeneratorParameters } from "../treeGenerator.js";
import { Vector2 } from "../../utils/linear/vector2.js";
import { Branch } from "./branch.js";
import { CanvasHelper } from "../../utils/canvasHelper.js";
import { BranchContext } from "./branch.js";
import { TreePart, TreePartContext } from "../treeParts/treePart.js";

export interface LeafOptions {
    treeGenerator: ITreeGeneratorParameters,
    position: Vector2,
    attractionDistance: number;
    rotated?: boolean;
    context: BranchContext;
}

export interface LeafContext extends TreePartContext {
    treePart: TreePart;
}

export class Leaf {
    public constructor(options: LeafOptions) {
        this.options = options;
        this._position = options.position;
        this.attractionDistance = options.attractionDistance;

        const prng = this.options.treeGenerator.getPRNG('DRAW');

        this.rotation = this.options.rotated ? prng.floatInRange(-1.5, 1.5) : 0;
        this.leafOffsets = [
            prng.intInRange(0, 400),
            prng.intInRange(0, 400)
        ]
    }

    public get position(): Vector2 { return this._position; }
    public get parent(): Branch | null { return this._parent; }
    public set parent(value: Branch | null) { this._parent = value; }

    public clone(): Leaf {
        const leaf = new Leaf({
            treeGenerator: this.options.treeGenerator,
            position: this.options.position.clone(),
            attractionDistance: this.options.attractionDistance,
            rotated: true,
            context: this.options.context
        });
        leaf.parent = this.parent;
        return leaf;
    }

    public createElement(): HTMLCanvasElement {
        const parent = <Branch>this.parent;

        const renderScale = this.options.treeGenerator.getRenderScaling();
        const canvasSize = 50;
        const leafElement: HTMLCanvasElement = <HTMLCanvasElement>document.createElement('canvas');

        leafElement.style.position = 'absolute';
        leafElement.style.pointerEvents = 'none';
        leafElement.width = canvasSize * renderScale;
        leafElement.height = canvasSize * renderScale;
        leafElement.style.width = canvasSize + 'px';
        leafElement.style.height = canvasSize + 'px';
        leafElement.style.left = (parent.endPosGlobal.x - canvasSize * 0.5) + 'px';
        leafElement.style.top = (parent.endPosGlobal.y - canvasSize * 0.5) + 'px';

        const ctx = <CanvasRenderingContext2D>leafElement.getContext('2d');
        ctx.scale(renderScale, renderScale);
        ctx.translate(canvasSize * 0.5, canvasSize * 0.5);
        this.drawLeaf(ctx);

        return leafElement;
    }

    public intersects(entity: Branch): boolean {
        const distance = entity.endPos.subtract(this.position).length();
        return (distance <= this.attractionDistance);
    }

    public draw(ctx: CanvasRenderingContext2D) {
        if (!this.parent)
            return;

        if(this.options.context?.isPlayback)
            return;

        ctx.save();
        ctx.translate(this.parent.endPos.x, this.parent.endPos.y);
        this.drawLeaf(ctx);
        ctx.restore();
    }

    public drawLeaf(ctx: CanvasRenderingContext2D) {
        if (!this.parent)
            return;

        const tempCanvas = this.options.treeGenerator.getTempCanvas(0);
        const leafStencil = this.options.treeGenerator.getLeafStencilTexture();
        const leafTexture = this.options.treeGenerator.getLeafTexturePattern(this.leafOffsets[0], this.leafOffsets[1]);

        tempCanvas.save();
        {
            tempCanvas.drawImage(leafStencil, 0, 0);
            tempCanvas.beginPath();
            tempCanvas.rect(0, 0, 15, 15);
            tempCanvas.globalCompositeOperation = 'source-in';
            tempCanvas.fillStyle = leafTexture;
            tempCanvas.fill();
        }
        tempCanvas.globalCompositeOperation = 'source-over';
        tempCanvas.restore();

        ctx.save();
        ctx.rotate(this.parent?.angle + this.rotation);
        ctx.translate(-15 / 2, -15);
        CanvasHelper.drawImageBorder(leafStencil, ctx, 1);
        ctx.drawImage(tempCanvas.canvas, 0, 0);
        ctx.drawImage(this.options.treeGenerator.getLeafOutlineTexture(), 0, 0);
        ctx.restore();
    };

    private options: LeafOptions;
    private _position: Vector2;
    private _parent: Branch | null = null;

    private leafOffsets: [number, number];
    private rotation: number;

    private attractionDistance: number;
}
