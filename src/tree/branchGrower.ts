import { Leaf } from "./components/leaf.js";
import { Branch } from "./components/branch.js";
import { Vector2 } from "../utils/linear/vector2.js";

export interface BranchGrower {
    start(): void;
    step(): void;
    isFinishedGrowing(): boolean;
    getStepCount(): number;

    get startingBranch(): Branch | null;
    get startingPoint(): Vector2;
    get angle(): number;

    getLeafs(): Array<Leaf>;
    getBranches(): Array<Branch>;
    
    getNewLeafs(): Array<Leaf>;
    getNewBranches(): Array<Branch>;
}