import { TreePartGrower } from "./teePartGrower.js";

export class TreePartInter extends TreePartGrower {
    public isTerminal(): boolean {
        return false;
    }
}