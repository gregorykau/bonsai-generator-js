import { TreeGenerator, TreeGeneratorOptions } from "./treeGenerator.js";
import { Branch, BranchOptions } from "./components/branch.js";
import { Leaf } from "./components/leaf.js";
import { Vector2 } from "../utils/linear/vector2.js";
import { BBox } from "../utils/linear/bbox.js";
import { BranchGrower } from "./branchGrower.js";

interface SpaceColonizerOptions {
    treeGenerator: TreeGenerator;
    depth: number;
    startingPoint: Vector2;
    bbox: BBox;
    leafCount: number;
    parentBranch?: Branch;
    branchLength: number;
    leafAttractionDistance: number;
    spawnPoints?: Array<Vector2>;
    branchFactory?: (options: BranchOptions) => Branch;
    positionPredicate?: (bbox: BBox, pos: Vector2) => boolean;
}

export class SpaceColonizer implements BranchGrower {
    public constructor(options: SpaceColonizerOptions) {
        this.options = options;
    }

    public start() {
        this.placeLeaves();
        this.placeBranches();
    }

    get angle(): number {
        return this.options.parentBranch?.angle ?? 0;
    }

    protected biasGrowthVector(growthVector: Vector2): Vector2 {
        return growthVector;
    }

    private placeLeaves() {
        // place n leafs
        for (let i = 0; i < this.options.leafCount; i++) {

            let leafPosition: Vector2 = Vector2.Zero;

            if (this.options.spawnPoints?.[i]) {
                // leaf position explicitly specified
                leafPosition = this.options.spawnPoints[i];
            } else {
                // leaf position random point in bounds with respect to predicate
                for (let j = 0; j < 100; j++) {
                    leafPosition = new Vector2(
                        this.options.treeGenerator.getPRNG('GROW').floatInRange(this.options.bbox.minCorner.x, this.options.bbox.maxCorner.x),
                        this.options.treeGenerator.getPRNG('GROW').floatInRange(this.options.bbox.minCorner.y, this.options.bbox.maxCorner.y),
                    );
                    if (!this.options.positionPredicate || this.options.positionPredicate(this.options.bbox, leafPosition)) {
                        break;
                    }
                }
            }

            const leaf: Leaf = new Leaf({
                treeGenerator: this.options.treeGenerator,
                position: leafPosition,
                attractionDistance: this.options.leafAttractionDistance,
            });
            this.activeLeafs.add(leaf);
        }
    }

    private placeBranches() {
        const branchOptions: BranchOptions = {
            parent: this.options.parentBranch,
            branchLength: this.options.branchLength,
            treeGenerator: this.options.treeGenerator,
            position: this.options.startingPoint,
            depth: this.options.depth,
            firstBranch: true
        };
        const startingBranch = this.options.branchFactory ? this.options.branchFactory(branchOptions) : new Branch(branchOptions);
        this.activeBranches.add(startingBranch);
        this.oldBranches.add(startingBranch);
    }

    private getClosestBranch(leaf: Leaf): Branch | null {
        let closestBranch: Branch | null = null;
        let closesetDistance = Number.POSITIVE_INFINITY;
        this.activeBranches.forEach((branch) => {
            if (!leaf.intersects(branch))
                return;

            // NOTE: If a branch has 2 children already, we ought not extrude from it further.
            // A tri or greater branch junction is both not in keeping with a typical tree structure, and can result in 
            // infinite growth loops where branch growth gets "stuck" between two attracting leafs.
            if (branch.childCount >= 2)
                return;

            const distanceToBranch = branch.distanceTo(leaf);
            if (distanceToBranch < closesetDistance) {
                closesetDistance = distanceToBranch;
                closestBranch = branch;
            }
        });

        return closestBranch;
    }

    public step() {
        this.branchesLastLength = this.branches.length;
        this.reachedLeafsLastLength = this.reachedLeafs.length;

        const currentReachedLeafs: Array<Leaf> = [];

        const branchToAttractionVec: Map<Branch, Vector2> = new Map();

        // apply leaf influences to branches
        this.activeLeafs.forEach((leaf: Leaf) => {
            const closestBranch = this.getClosestBranch(leaf);
            if (!closestBranch)
                return;

            if (closestBranch.distanceTo(leaf) < (this.options.branchLength)) {
                // leaf reached by closest branch

                this.activeLeafs.delete(leaf);
                leaf.parent = closestBranch;
                currentReachedLeafs.push(leaf);
            } else {
                // leaf not yet reached, apply attraction to closest branch

                const attractionVec = leaf.position.subtract(closestBranch.position);
                branchToAttractionVec.set(closestBranch, (branchToAttractionVec.get(closestBranch) ?? Vector2.Zero).addInPlace(attractionVec));
            }
        });

        // remove idle branches (those that did not grow since last step)
        this.oldBranches.forEach((branch) => {
            if (branchToAttractionVec.has(branch))
                return;
            this.activeBranches.delete(branch);
            this.oldBranches.delete(branch);
        });

        // grow branches towards their influences
        branchToAttractionVec.forEach((attractionVec: Vector2, branch: Branch) => {
            const growVec: Vector2 = attractionVec.normalize().scaleInPlace(this.options.branchLength);
            const vFinalGrowthVector: Vector2 = this.biasGrowthVector(growVec);
            const newPosition: Vector2 = branch.position.add(vFinalGrowthVector);

            const newBranch: Branch = branch.createChildBranch({
                treeGenerator: this.options.treeGenerator,
                position: newPosition,
                depth: this.options.depth,
                branchLength: this.options.branchLength
            });

            this.branches.push(newBranch);
            this.activeBranches.add(newBranch);
            this.oldBranches.add(newBranch);
        });

        // only mark leafs as reached if they are terminal leafs (no branch is growing from them)
        currentReachedLeafs.forEach((pendingLeaf => {
            if (pendingLeaf.parent?.childCount != 0)
                return;
            
            this.reachedLeafs.push(pendingLeaf);
            this.leafs.push(pendingLeaf);
            this.options.treeGenerator.markLeafReached(this.options.depth, pendingLeaf);
        }));
        
        // step complete
        this.stepCount++;
    }

    public isFinishedGrowing(): boolean {
        return (this.stepCount != 0 && this.oldBranches.size == 0);
    }

    public getNewBranches(): Array<Branch> {
        return this.branches.slice(this.branchesLastLength);
    }
    public getNewLeafs(): Array<Leaf> {
        return this.reachedLeafs.slice(this.reachedLeafsLastLength);
    }

    public getReachedLeafs(): Leaf[] { return this.reachedLeafs; }
    public getLeafs(): Array<Leaf> { return this.leafs; }
    public getBranches(): Array<Branch> { return this.branches; }
    public getStepCount(): number { return this.stepCount; }

    public get startingPoint(): Vector2 { return this.options.startingPoint; }
    public get startingBranch(): Branch | null {
        return this.options.parentBranch ?? null;
    }

    public get branchLength(): number { return this.options.branchLength; }

    private stepCount: number = 0;

    private branchesLastLength: number = 0;
    private branches: Branch[] = [];

    private reachedLeafsLastLength: number = 0;
    private leafs: Leaf[] = [];
    private reachedLeafs: Leaf[] = [];

    private activeLeafs: Set<Leaf> = new Set();
    private activeBranches: Set<Branch> = new Set();
    private oldBranches: Set<Branch> = new Set();

    protected options: SpaceColonizerOptions;
}