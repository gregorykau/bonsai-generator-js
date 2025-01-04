import { Branch } from "../components/branch.js";
import { BranchGrower } from "../branchGrower.js"
import { TreePart, TreePartOptions, CanvasLayer } from "./treePart.js";
import { Leaf } from "../components/leaf.js";
import { Vector2 } from "../../utils/linear/vector2.js";


export class TreePartGrower extends TreePart {
    public constructor(options: TreePartOptions) {
        super(options);
        this.boundsMinPos = new Vector2(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
        this.boundsMaxPos = new Vector2(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY);

        this.branchLayer = this.createCanvasLayer();
    }

    public set branchGrower(value: BranchGrower) {
        this._branchGrower = value;
    }

    public get branchGrower() {
        return this._branchGrower!;
    }

    public get startingBranchWidth(): number {
        return this._startingBranchWidth;
    }


    public get branches(): Branch[] {
        return this.branchGrower?.getBranches() ?? [];
    }

    public get leafs(): Leaf[] {
        return this.branchGrower?.getLeafs() ?? [];
    }

    public start() {
        const startingBranch = this.branchGrower?.startingBranch;
        this._startingBranchWidth = startingBranch?.branchWidth ?? 0;

        console.assert(this.branchGrower);
        this.branchGrower?.start();
    }

    public step() {
        this.branchGrower?.step();
        this.branchGrower?.getNewBranches()?.forEach((branch) => {
            const pos = branch.endPos;

            this.boundsMinPos.x = Math.min(pos.x, this.boundsMinPos.x);
            this.boundsMinPos.y = Math.min(pos.y, this.boundsMinPos.y);

            this.boundsMaxPos.x = Math.max(pos.x, this.boundsMaxPos.x);
            this.boundsMaxPos.y = Math.max(pos.y, this.boundsMaxPos.y);
        });

        if (this.branchGrower?.isFinishedGrowing())
            this.onFinishedGrowing();
    }

    protected onFinishedGrowing() {

    }

    public isFinishedGrowing(): boolean {
        return this.branchGrower?.isFinishedGrowing() ?? false;
    }

    protected afterDrawLayers(): void {
        super.afterDrawLayers();
    }

    public clip() {
        this.offsetBounds({minPos: this.boundsMinPos, maxPos: this.boundsMaxPos});
    }

    private drawBranches(ctx: CanvasRenderingContext2D) {
        this.branchGrower?.getNewBranches()?.forEach((branch) => 
            branch.draw(ctx)
        );
    }

    protected drawLayers() {
        this.drawWithTransform(this.branchLayer.canvas, (ctx) => this.drawBranches(ctx));
    }

    protected _branchGrower?: BranchGrower;

    private _startingBranchWidth: number = 0;

    private branchLayer: CanvasLayer;

    private boundsMinPos: Vector2;
    private boundsMaxPos: Vector2;
}