import { Leaf } from "./components/leaf.js";
import { Branch } from "./components/branch.js";
import { TreePart } from "./treeParts/treePart.js";
import { Vector2 } from "../utils/linear/vector2.js";
import { CanvasHelper } from "../utils/canvasHelper.js";
import { PRNG } from "../utils/random/prng.js";
import { MersenneTwisterAdapter } from "../utils/random/mersenneTwisterAdapter.js";
import { AnimationGroup, AnimationState, setAnimationTimeout, startAnimation } from "../utils/animationHelper.js";
import { TreePartInter } from "./treeParts/treePartInter.js";
import { TreePartGrower } from "./treeParts/teePartGrower.js";
import { TreePartLeaf } from "./treeParts/treePartLeaf.js";
import { setAnimationInterval } from "../utils/animationHelper.js";

export interface TreeGeneratorOptions {
    debugging?: boolean;
    renderScaling?: number;
    seed: number;
    parentContainer: HTMLDivElement;
    serializedJSON?: Record<string, any>;
}

export interface ITreeGeneratorParameters {
    appendElement(div: HTMLElement, growWithTree?: boolean): void;
    markLeafReached(depth: number, leaf: Leaf): void;

    getPRNG(type: 'GROW' | 'DRAW'): PRNG;

    getAnimationGroup(): AnimationGroup;

    getSerializedKey(): number;
    setSerializedValue(key: number, value: any): void;
    getSerializedValue(key: number): string | number;
    isSerializedPlayback(): boolean;
    
    getRenderScaling(): number;
    getOutlineThickness(): number;
    getTempCanvas(idx: number): CanvasRenderingContext2D;
    getLeafStencilTexture(): HTMLImageElement;
    getLeafOutlineTexture(): HTMLImageElement;
    getLeafTexturePattern(xOffset: number, yOffset: number): CanvasPattern;
    getBranchTexturePattern(growth: Vector2, textureName?: string): CanvasPattern;
    getBranchWidth(depth: number, branch: Branch): number;
}

export abstract class TreeGenerator implements ITreeGeneratorParameters {
    public constructor(options: TreeGeneratorOptions) {
        this.options = options;
        this.parentContainer = this.options.parentContainer;

        // hierarchy of transform divs
        this.containerBase = this.createTransformContainerDiv();
        this.containerTransformScaleTreeParts = this.createTransformContainerDiv();
        this.containerTransformAlignment = this.createTransformContainerDiv();

        this.containerBase.append(this.containerTransformScaleTreeParts);
        this.containerTransformAlignment.append(this.containerBase);

        this.parentContainer.append(this.containerTransformAlignment);

        // setup PRNG's
        if (options.serializedJSON)
            this.serializedValues = options.serializedJSON;

        this.prngs.DRAW.init(this.options.seed);
        this.prngs.GROW.init(this.options.seed);

        // perform initial resize to parent container
        this.resizeToContainer();

        // setup resize event for future window resizes
        this.resizeEventListener = this.resizeToContainer.bind(this);
        window.addEventListener('resize', this.resizeEventListener);

        // start grow animation
        // this.growAnimation();
    }

    public shake() {
        const cw = this.getPRNG('DRAW').random() > 0.5;
        this.treeParts
            .filter(treePart => treePart instanceof TreePartLeaf)
            .forEach(treePart => {
                const shakeDelay = this.getPRNG('DRAW').floatInRange(0, 1200);
                this.animationGroup.addAnimation(
                    setAnimationTimeout({
                        callback: () => (<TreePartLeaf>treePart).shake(cw),
                        time: shakeDelay
                    })
                )
            });
    }

    public async grow() {
        while (!this.destroyed && !this.isFinishedGrowing) {
            await this.growStep();
            await new Promise((resolve) => setTimeout(resolve, 0));
        }
    }

    protected getTreePart(branch: Branch): TreePartGrower {
        let retTreePart: TreePartGrower | undefined;
        if (this.branchToTreePart.has(branch)) {
            retTreePart = this.branchToTreePart.get(branch)!;
        } else if (branch.parent && this.branchToTreePart.has(branch.parent)) {
            retTreePart = this.branchToTreePart.get(branch.parent)!;
        } else {
            retTreePart = <TreePartGrower | undefined>this.treeParts.find(treePart => (treePart instanceof TreePartGrower) && (<TreePartGrower>treePart).branches.includes(branch));
            console.assert(retTreePart);
            retTreePart = retTreePart!;
        }
        this.branchToTreePart.set(branch, retTreePart);
        return retTreePart;
    }

    private createTransformContainerDiv(): HTMLDivElement {
        const el = document.createElement('div');
        el.style.width = '100%';
        el.style.height = '100%';
        el.style.left = '0px';
        el.style.top = '0px';
        el.style.position = 'absolute';
        el.style.transformOrigin = 'top left';
        return el;
    }

    public fadeAnimation() {
        this.treeParts.forEach((treePart) => {
            treePart.fadeIn();
        });
    }

    public growAnimation() {
        this.containerTransformScaleTreeParts.style.transformOrigin = '50% 90%'; //90%, assuming vertical offset for a pot or other obscuring object
        this.animationGroup.addAnimation(
            startAnimation({
                animate: (t: number) => {
                    const endTime = 5000;
                    const val = Math.max(0, Math.min(1, (t) / (endTime)));
                    this.containerTransformScaleTreeParts.style.scale = val + '';
                    if (val >= 1)
                        return AnimationState.DONE;
                }
            })
        )
    }

    public destroy() {
        this.destroyed = true;

        this.containerBase.remove();
        this.animationGroup.cancel();
        window.removeEventListener('resize', this.resizeEventListener);
    }

    public appendElement(div: HTMLElement, groupedWithTreeParts: boolean = true) {
        if (groupedWithTreeParts)
            this.containerTransformScaleTreeParts.append(div);
        else
            this.containerBase.append(div);
    }

    private resizeToContainer() {
        const outerContainerWidth = this.parentContainer.getBoundingClientRect().width;
        const outerContainerHeight = this.parentContainer.getBoundingClientRect().height;
        const internalSize = TreeGenerator.REFERENCE_HEIGHT;
        const tx = outerContainerWidth / internalSize;
        const ty = outerContainerHeight / internalSize;
        const scaleToBorder = (tx < ty) ? tx : ty;

        this.containerBase.style.width = `${internalSize}px`;
        this.containerBase.style.height = `${internalSize}px`;
        this.containerBase.style.transform = `scale(${scaleToBorder})`;

        this.containerTransformAlignment.style.width = `${internalSize * scaleToBorder}px`;
        this.containerTransformAlignment.style.height = `${internalSize * scaleToBorder}px`;

        if (tx < ty) {
            // scale to X
            this.containerTransformAlignment.style.top = '';
            this.containerTransformAlignment.style.bottom = '0px';
            this.containerTransformAlignment.style.left = '0px';
            this.containerTransformAlignment.style.transform = 'translate(0, 0)';
        } else {
            // scale to Y
            this.containerTransformAlignment.style.top = '0px';
            this.containerTransformAlignment.style.left = '50%';
            this.containerTransformAlignment.style.transform = 'translate(-50%, 0)';
        }

    }

    public onFinishedGrowing() { 
        this.animationGroup.addAnimation(
            setAnimationInterval({
                callback: () => this.shake(),
                time: 2000
            })
        );

        console.log(`Growing completed.`);
    }

    public getRenderScaling(): number { return this.options.renderScaling ?? 1; }

    public abstract getOutlineThickness(): number;

    public abstract getBranchTexturePattern(growth: Vector2, textureName?: string): CanvasPattern;

    public abstract getLeafStencilTexture(): HTMLImageElement;

    public abstract getLeafOutlineTexture(): HTMLImageElement;

    public abstract getLeafTexturePattern(): CanvasPattern;

    public abstract markLeafReached(depth: number, leaf: Leaf): void;

    public abstract getBranchWidth(depth: number, branch: Branch): number;

    public growStep() {
        console.assert(!this.isFinishedGrowing);

        // check if all parts and therefore the tree are finished growing
        this.isFinishedGrowing = this.treeParts.every((treePart) => !(treePart instanceof TreePartGrower) || treePart.isFinishedGrowing());
        if (this.isFinishedGrowing) {
            this.onFinishedGrowing();
        }

        // grow individual treeparts
        this.treeParts.forEach(treePart => {
            if (!(treePart instanceof TreePartGrower)) {
                treePart.draw();
                return;
            }
            
            if (treePart.isFinishedGrowing())
                return;

            treePart.step();
            treePart.draw();
        });
    }

    public getTempCanvas(idx: number): CanvasRenderingContext2D {
        const ctx = this.tempCanvas[idx];
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        return ctx;
    }

    public getSerializedKey(): number  { 
        return this.serializedIdxKey++;
    }
    public setSerializedValue(key: number, value: any)  { 
        this.serializedValues[key] = value;
    }
    public getSerializedValue(key: number): string | number {
        const value = this.serializedValues[key];
        console.assert(value !== undefined, `Serialized value attempting to be read back that doesn't exist. Are we in-sync?`);
        return value;
    }

    public getSerializedJSON(): string {
        this.treeParts.forEach(treePart => {
            treePart.serialize();
        });
        return JSON.stringify(this.serializedValues);
    }

    public isSerializedPlayback(): boolean {
        return (this.options.serializedJSON !== undefined);
    }

    public getPRNG(type: 'GROW' | 'DRAW') {
        return this.prngs[type];
    }

    public getAnimationGroup(): AnimationGroup {
        return this.animationGroup;
    }

    public static readonly REFERENCE_HEIGHT: number = 1024;

    private resizeEventListener: () => void;

    protected treeParts: Array<TreePart> = [];

    private branchToTreePart: Map<Branch, TreePartGrower> = new Map();

    private prngs = {
        'GROW': new MersenneTwisterAdapter(),
        'DRAW': new MersenneTwisterAdapter()
    };
    
    private destroyed: boolean = false;

    private animationGroup: AnimationGroup = new AnimationGroup();
    
    private serializedIdxKey: number = 0;
    private serializedValues: Record<string, any> = {};

    protected isFinishedGrowing: boolean = false;
    private parentContainer: HTMLDivElement;

    private containerBase: HTMLDivElement;
    private containerTransformAlignment: HTMLDivElement;
    private containerTransformScaleTreeParts: HTMLDivElement;

    private tempCanvas: CanvasRenderingContext2D[] = new Array(3).fill(null).map(x => CanvasHelper.createTempCanvas(200, 200));
    private options: TreeGeneratorOptions;
}
