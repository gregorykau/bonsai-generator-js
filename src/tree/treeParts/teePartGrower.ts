import { Branch } from "../components/branch.js";
import { BBox } from "../../utils/linear/bbox.js";
import { BranchGrower } from "../branchGrower.js"
import { TreePart, TreePartOptions, CanvasLayer } from "./treePart.js";
import { Leaf } from "../components/leaf.js";

export interface TreePartGrowerOptions extends TreePartOptions {
    branchGrower: BranchGrower
}

export class TreePartGrower extends TreePart {
    public constructor(options: TreePartGrowerOptions) {
        super(options);
        this.growerOptions = options;

        this.clippedBounds = new BBox(options.origin, options.origin);
        
        this.branchLayer = this.createCanvasLayer();
    }

    public get startingBranchWidth(): number {
        return this._startingBranchWidth;
    }


    public get branches(): Branch[] {
        return this.growerOptions.branchGrower.getBranches();
    }

    public get leafs(): Leaf[] {
        return this.growerOptions.branchGrower.getLeafs();
    }

    public start() {
        const startingBranch = this.growerOptions.branchGrower.startingBranch;
        this._startingBranchWidth = startingBranch?.branchWidth ?? 0;

        this.growerOptions.branchGrower.start();
    }

    public step() {
        this.growerOptions.branchGrower.step();
        const newBranches = this.growerOptions.branchGrower.getNewBranches();

        if (this.growerOptions.branchGrower.isFinishedGrowing()) {
            this.onFinishedGrowing();
        }
    }

    public isFinishedGrowing(): boolean {
        return this.growerOptions.branchGrower.isFinishedGrowing();
    }

    protected afterDrawLayers(): void {
        super.afterDrawLayers();

        if (this.finishedGrowing) {
            this.clipContainerDiv(this.clippedBounds);
        }
    }

    protected onFinishedGrowing() {
        console.assert(!this.finishedGrowing);

        this.finishedGrowing = true;
    }

    private drawBranches(ctx: CanvasRenderingContext2D) {
        const newBranches = this.growerOptions.branchGrower.getNewBranches();

        newBranches.forEach((branch) => 
            branch.draw(ctx)
        );

        newBranches.forEach((branch) => {
            this.clippedBounds.maximizeAgainstPoint(branch.position);
        });
    }

    protected drawLayers() {
        this.drawWithTransform(this.branchLayer.canvas, (ctx) => this.drawBranches(ctx));
    }

    protected growerOptions: TreePartGrowerOptions;

    private _startingBranchWidth: number = 0;

    private finishedGrowing: boolean = false;

    private clippedBounds: BBox;

    private branchLayer: CanvasLayer;
}