import { TreeGenerator } from "../treeGenerator.js";
import { Leaf } from  "../components/leaf.js";
import { startAnimation, setAnimationTimeout, AnimationState, Animation } from "../../utils/animationHelper.js";
import { CanvasLayer, TreePartOptions } from "./treePart.js";
import { TreePartGrower } from "./teePartGrower.js";


export class TreePartLeaf extends TreePartGrower {
    public constructor(options: TreePartOptions) {
        super(options);

        this.leafLayer = this.createCanvasLayer();

        this.containerDiv.style.cursor = 'grab';

        this.updatePointerProperty();

        this.setupClick();
    }

    public isTerminal(): boolean {
        return true;
    }

    public setupClick() {
        this.containerDiv.addEventListener('click', (e) => {
            e.preventDefault();
            if (!this.isFinishedGrowing() || !this.isTerminal())
                return;

            this.dropRandomLeafs( 1 + Math.floor(Math.random() * (3 + 1)));
        });
    }

    public shake(cw: boolean) {
        if (this.dragging || this.springAnimation || this.leafClusterDropping)
            return;

        super.shake(cw);
    }

    public dropRandomLeafs(leafCount: number) {
        const prng = this.options.context.treeGenerator.getPRNG('DRAW');
        const leafs = this.branchGrower.getLeafs();
        if (!leafs.length)
            return;

        for (let i = 0; i < leafCount; i++) {
            const leaf = leafs[prng.intInRange(0, leafs.length - 1)];
            this.dropLeaf(leaf);
        }
    }

    private dropLeaf(leaf: Leaf, dropDelay?: number) {
        console.assert(this.isFinishedGrowing());
        const animationGroup = this.options.context.treeGenerator.getAnimationGroup();
        const leafElement = leaf.createElement();
        leafElement.style.zIndex = this.containerDiv.style.zIndex;
        const startY = parseFloat(leafElement.style.top);
        const speed = this.options.context.treeGenerator.getPRNG('DRAW').floatInRange(200, 300);

        const FADE_TIME_SECONDS: number = 1;
        const FADE_END_Y: number = (TreeGenerator.REFERENCE_HEIGHT);
        const FADE_START_Y = FADE_END_Y - (speed / FADE_TIME_SECONDS);

        animationGroup.addAnimation(
            setAnimationTimeout({
                callback: () => {
                    animationGroup.addAnimation(
                        startAnimation({
                            animate: (t: number) => {
                                const newY: number = (startY + (t / 1000) * speed);
                                if (newY > FADE_END_Y) {
                                    leafElement.remove();
                                    return AnimationState.DONE;
                                }
                                leafElement.style.opacity = Math.max(0, (FADE_END_Y - newY) / (FADE_END_Y - FADE_START_Y)) + '';
                                leafElement.style.top = newY + 'px';
                            }
                        })
                    );
                },
                time: dropDelay ?? 0
            })
        );

        animationGroup.addAnimation(
            startAnimation({
                animate: (t: number) => {
                    const opacity = Math.min(1.0, (t / 200));
                    leafElement.style.opacity = opacity + '';
                    if (opacity >= 1.0)
                        return AnimationState.DONE;
                }
            })
        );

        this.options.context.treeGenerator.appendElement(leafElement);
    }

    protected drawLayers() {
        super.drawLayers();

        this.drawWithTransform(this.leafLayer.canvas, (ctx) => this.drawLeafs(ctx, this.leafLayer));
    }

    private drawLeafs(ctx: CanvasRenderingContext2D, layer: CanvasLayer) {
        if (!this.isTerminal())
            return;
        
        const newLeafs = this.branchGrower.getNewLeafs();
        const rotatedLeafCount: number = this.options.context.treeGenerator.getPRNG('GROW').intInRange(1, 2);

        newLeafs.forEach((leaf: Leaf) => {
            leaf.draw(ctx);

            for (let i = 0; i < rotatedLeafCount; i++) {
                const rotatedLeaf = leaf.clone()
                rotatedLeaf.draw(ctx);
            }
        });
    }

    protected onFinishedGrowing() {
        super.onFinishedGrowing();
        this.updatePointerProperty();
    }

    private updatePointerProperty() {
        if (!this.leafClusterDropping && this.isFinishedGrowing()) {
            this.containerDiv.style.pointerEvents = 'auto';
        } else {
            this.containerDiv.style.pointerEvents = 'none';
        }
    }

    private leafLayer: CanvasLayer;

    private springAnimation: Animation | null = null;

    private dragging: boolean = false;

    private leafClusterDropping: boolean = false;
}