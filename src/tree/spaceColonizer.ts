import { TreeGenerator, TreeGeneratorOptions } from "./treeGenerator.js";
import { Branch, BranchOptions } from "./components/branch.js";
import { Leaf, LeafOptions } from "./components/leaf.js";
import { Vector2 } from "../utils/linear/vector2.js";
import { BranchGrower } from "./branchGrower.js";

export interface SpaceColonizerOptions {
    treeGenerator: TreeGenerator;
    depth: number;
    origin: Vector2;
    size: Vector2;
    leafCount: number;
    parentBranch?: Branch;
    branchLength: number;
    spawnPoints?: Array<Vector2>;
    positionPredicate?: (pos: Vector2) => boolean;

    createFirstBranch: (pos: Vector2) => Branch;
    createLeaf: (pos: Vector2) => Leaf;
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
                        this.options.treeGenerator.getPRNG('GROW').floatInRange(0, this.options.size.x),
                        this.options.treeGenerator.getPRNG('GROW').floatInRange(0, this.options.size.y),
                    );
                    if (!this.options.positionPredicate || this.options.positionPredicate(leafPosition))
                        break;

                }
            }


            const leaf: Leaf = this.options.createLeaf(leafPosition);
            this.activeLeafs.add(leaf);
        }
    }

    private placeBranches() {
        const startingPos = this.options.origin.add(this.options.parentBranch?.direction.scale(this.options.branchLength) ?? Vector2.Zero);
        const startingBranch = this.options.createFirstBranch(startingPos);
        this.branches.push(startingBranch);
        this.activeBranches.add(startingBranch);
        this.oldBranches.add(startingBranch);
    }

    private getClosestBranch(leaf: Leaf): Branch | null {
        let closestBranch: Branch | null = null;
        let closestDistance = Number.POSITIVE_INFINITY;
        this.activeBranches.forEach((branch) => {
            if (!leaf.intersects(branch))
                return;

            // NOTE: If a branch has 2 children already, we ought not extrude from it further.
            // A tri or greater branch junction is both not in keeping with a typical tree structure, and can result in 
            // infinite growth loops where branch growth gets "stuck" between two attracting leafs.
            if (branch.childCount >= 2)
                return;

            const distanceToBranch = branch.distanceTo(leaf);
            if (distanceToBranch < closestDistance) {
                closestDistance = distanceToBranch;
                closestBranch = branch;
            }
        });

        return closestBranch;
    }

    public step() {
        this.branchesLastLength = (this.stepCount == 0 ? 0 : this.branches.length);
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

                const attractionVec = leaf.position.subtract(closestBranch.endPos);
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
            const newBranch: Branch = branch.extrude(vFinalGrowthVector);

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

    public getLeafs(): Array<Leaf> { return this.leafs; }
    public getBranches(): Array<Branch> { return this.branches; }
    public getStepCount(): number { return this.stepCount; }

    public get startingPoint(): Vector2 { return this.options.origin; }
    public get startingBranch(): Branch | null {
        return this.options.parentBranch ?? null;
    }

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