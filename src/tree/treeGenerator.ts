import { Leaf } from "./components/leaf.js";
import { Branch } from "./components/branch.js";
import { TreePart, TreePartContext } from "./treeParts/treePart.js";
import { Vector2 } from "../utils/linear/vector2.js";
import { CanvasHelper } from "../utils/canvasHelper.js";
import { PRNG } from "../utils/random/prng.js";
import { MersenneTwisterAdapter } from "../utils/random/mersenneTwisterAdapter.js";
import { AnimationGroup, AnimationState, setAnimationTimeout, startAnimation } from "../utils/animationHelper.js";
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
    
    getRenderScaling(): number;
    getOutlineThickness(): number;
    getTempCanvas(idx: number): CanvasRenderingContext2D;
    getLeafStencilTexture(): HTMLImageElement;
    getLeafOutlineTexture(): HTMLImageElement;
    getLeafTexturePattern(xOffset: number, yOffset: number): CanvasPattern;
    getBranchTexturePattern(growth: Vector2, textureName?: string): CanvasPattern;
    getBranchWidth(branch: Branch): number;
}

export interface TreeGeneratorContext {
    debugging: boolean;
    isPlayback: boolean;
    serializedValues: Record<string, any>;
    serializedIdxKey: number;
}

export abstract class TreeGenerator implements ITreeGeneratorParameters {
    protected constructor(options: TreeGeneratorOptions) {
        this.options = options;
        this.parentContainer = this.options.parentContainer;

        this.myContext = {
            isPlayback: options.serializedJSON != null,
            serializedValues: options.serializedJSON ?? {},
            serializedIdxKey: 0,
            debugging: this.options.debugging ?? false,
        };

        this.treePartContext = {
            ...this.myContext,
            treeGenerator: this
        }

        // hierarchy of transform divs
        this.containerBase = this.createTransformContainerDiv();
        this.containerTransformScaleTreeParts = this.createTransformContainerDiv();
        this.containerTransformAlignment = this.createTransformContainerDiv();

        this.containerBase.append(this.containerTransformScaleTreeParts);
        this.containerTransformAlignment.append(this.containerBase);

        this.parentContainer.append(this.containerTransformAlignment);

        // setup PRNG's
        if (options.serializedJSON)
            this.myContext.serializedValues = options.serializedJSON;

        this.prngs.DRAW.init(this.options.seed);
        this.prngs.GROW.init(this.options.seed);

        // perform initial resize to parent container
        this.resizeToContainer();

        // setup resize event for future window resizes
        this.resizeEventListener = this.resizeToContainer.bind(this);
        window.addEventListener('resize', this.resizeEventListener);
    }

    public shake() {
        const cw = this.getPRNG('DRAW').random() > 0.5;
        this.treeParts
            .filter(treePart => treePart.depth >= 0)
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
            this.growStep();
            await new Promise((resolve) => setTimeout(resolve, 1));
        }
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
        const outerContainerHeight = this.parentContainer.getBoundingClientRect().height;
        const internalSize = TreeGenerator.REFERENCE_HEIGHT;
        const scaleY = outerContainerHeight / internalSize;

        this.containerBase.style.width = `${internalSize}px`;
        this.containerBase.style.height = `${internalSize}px`;
        this.containerBase.style.transform = `scale(${scaleY})`;

        this.containerTransformAlignment.style.width = `${internalSize * scaleY}px`;
        this.containerTransformAlignment.style.height = `${internalSize * scaleY}px`;

        this.containerTransformAlignment.style.top = '0px';
        this.containerTransformAlignment.style.left = '50%';
        this.containerTransformAlignment.style.transform = 'translate(-50%, 0)';
    }

    protected onFinishedGrowing() { 
        this.animationGroup.addAnimation(
            setAnimationInterval({
                callback: () => this.shake(),
                time: 2000
            })
        );

        this.treeParts
            .forEach(treePart => {
                if (!(treePart instanceof TreePartGrower))
                    return;
                treePart.clip();
            });

        console.log(`Growing completed.`);
    }

    public getRenderScaling(): number { return this.options.renderScaling ?? 1; }

    public abstract getOutlineThickness(): number;

    public abstract getBranchTexturePattern(growth: Vector2, textureName?: string): CanvasPattern;

    public abstract getLeafStencilTexture(): HTMLImageElement;

    public abstract getLeafOutlineTexture(): HTMLImageElement;

    public abstract getLeafTexturePattern(): CanvasPattern;

    public abstract markLeafReached(depth: number, leaf: Leaf): void;

    public abstract getBranchWidth(branch: Branch): number;

    public growStep() {
        console.assert(!this.isFinishedGrowing);

        // check if all parts and therefore the tree are finished growing
        this.isFinishedGrowing = this.treeParts.every((treePart) => !(treePart instanceof TreePartGrower) || treePart.isFinishedGrowing());
        if (this.isFinishedGrowing) {
            this.onFinishedGrowing();
        }

        // grow individual tree-parts
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

    public getSerializedJSON(): string {
        this.treeParts.forEach(treePart => {
            treePart.serialize();
        });
        return JSON.stringify(this.myContext.serializedValues);
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

    private prngs = {
        'GROW': new MersenneTwisterAdapter(),
        'DRAW': new MersenneTwisterAdapter()
    };

    private myContext: TreeGeneratorContext;
    protected treePartContext: TreePartContext;
    
    private destroyed: boolean = false;

    private animationGroup: AnimationGroup = new AnimationGroup();
    
    protected isFinishedGrowing: boolean = false;
    private parentContainer: HTMLDivElement;

    private containerBase: HTMLDivElement;
    private containerTransformAlignment: HTMLDivElement;
    private containerTransformScaleTreeParts: HTMLDivElement;

    private tempCanvas: CanvasRenderingContext2D[] = new Array(3).fill(null).map(x => CanvasHelper.createTempCanvas(200, 200));
    private options: TreeGeneratorOptions;
}
