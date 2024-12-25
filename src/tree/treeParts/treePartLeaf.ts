import { TreeGenerator } from "../treeGenerator.js";
import { Leaf } from  "../components/leaf.js";
import { startAnimation, setAnimationTimeout, AnimationState, Animation } from "../../utils/animationHelper.js";
import { AnimationFunctions } from "../../utils/animation/functions.js";
import { Vector2 } from "../../utils/linear/vector2.js";
import { CanvasLayer } from "./treePart.js";
import { TreePartGrower, TreePartGrowerOptions } from "./teePartGrower.js";


export class TreePartLeaf extends TreePartGrower {
    public constructor(options: TreePartGrowerOptions) {
        super(options);

        this.leafClusterLayers = new Array(TreePartLeaf.LEAF_LAYER_COUNT)
            .fill(null)
            .map(x => this.createCanvasLayer());
        this.leafLayersToDrop = this.leafClusterLayers.slice();

        this.leafClusterLayers.forEach((layer) => this.layerToLeafs.set(layer, []));

        this.containerDiv.style.cursor = 'grab';

        this.updatePointerProperty();

        this.setupDrag();
        this.setupClick();
    }

    public isTerminal(): boolean {
        return true;
    }

    private get droppedAllLeafs(): boolean {
        return (this.leafLayersToDrop.length == 0);
    }

    private setupDrag() {
        const animationGroup = this.options.treeGenerator.getAnimationGroup();
        const FORCE_RELEASE_ANGLE_THRESHOLD = Math.PI * 0.75;
        const DRAG_DAMPNER_SCALAR = 0.7;

        let transformOriginClient: Vector2;

        let currentDragPos: Vector2;
        let dragStartPos: Vector2;

        let currentAngle: number;
        let lastAngle: number = 0;

        let baseClientRect: DOMRect;

        const getBoundingClientRectWithoutTransform = () => {
            /**
             * The purpose of this function is to get the bounding-box of the tree-part without
             * the rotation transform. This is required, as if we were to query the bounding-box
             * with the rotation applied, the calculated mouse angles would be incorrect (they assume AABB).
             */

            const tmpTransformCSV = this.containerDiv.style.transform;
            this.containerDiv.style.transform = '';
            const clientRect = this.containerDiv.getBoundingClientRect();
            this.containerDiv.style.transform = tmpTransformCSV;
            return clientRect;
        };

        const pointerMove = (e: MouseEvent) => {
            e.preventDefault();

            currentDragPos = new Vector2(e.clientX, e.clientY).subtract(transformOriginClient!);
            const s = (dragStartPos.x > 1) ? 1 : -1;

            const currentDragAngle = Math.atan2(currentDragPos.y * s, currentDragPos.x * s);                // angle from the current mouse position to transform origin
            const startDragAngle = Math.atan2(dragStartPos!.y * s, dragStartPos!.x * s);                    // angle from starting mouse position to transform origin
            const rawAngle = (currentDragAngle - startDragAngle + lastAngle);                               // calculated angle for the tree-part rotation to track mouse dragging

            // calculate dampened angle with S-shaped falloff as the user drags to the extremes of +/- side
            const dampenedAngle = (1 - Math.min(1, AnimationFunctions.sigmoid_0_1(Math.abs(rawAngle * DRAG_DAMPNER_SCALAR))));

            // if the user drags the tree-part past the rotation threshold, force release
            if (Math.abs(rawAngle) > FORCE_RELEASE_ANGLE_THRESHOLD) {
                pointerUp(e);
                return;
            }

            currentAngle = (rawAngle * dampenedAngle);

            this.containerDiv.style.transform = `rotate(${currentAngle + this.baseAngle}rad)`;   // set CSS transform
        }

        const pointerDown = (e: MouseEvent) => {;
            e.preventDefault();

            if (this.isLeafClusterDropping)
                return;

            this.shakingAnimation?.cancel();
            this.shakingAnimation = null;

            this.springAnimation?.cancel();
            this.springAnimation = null;

            baseClientRect = getBoundingClientRectWithoutTransform();

            // calculate starting drag position
            const startPosRelative = this.pixelsToRelative(
                this.growerOptions.branchGrower.startingPoint.x,
                this.growerOptions.branchGrower.startingPoint.y
            );
            transformOriginClient = new Vector2(
                baseClientRect!.x + startPosRelative.x * baseClientRect!.width,
                baseClientRect!.y + startPosRelative.y * baseClientRect!.height
            );
            dragStartPos = new Vector2(e.clientX, e.clientY).subtract(transformOriginClient!);

            this.containerDiv.removeEventListener('pointerdown', pointerDown);
            document.addEventListener('pointermove', pointerMove);
            document.addEventListener('pointerup', pointerUp);

            this.dragging = true;
        }

        const pointerUp = (e: MouseEvent) => {
            e.preventDefault();

            lastAngle = currentAngle;

            this.dragging = false;
            startSpringAnimation();

            this.containerDiv.addEventListener('pointerdown', pointerDown);
            document.removeEventListener('pointermove', pointerMove);
            document.removeEventListener('pointerup', pointerUp);
        }

        
        const startSpringAnimation = () => {
            let firstT: number | null = null;
            let velocity: number = -currentAngle * 5;
            let lastT: number = 0;

            
            this.springAnimation = animationGroup.addAnimation(
                startAnimation({
                    animate: (t: number) => {
                        firstT ??= t;
                        lastT ??= t;
                        const totalT = (t - firstT) / 1000;
                        const deltaT = totalT - lastT;
                        lastT = totalT;
            
                        const acceleration = -(100) * currentAngle;
                        const dampner = Math.min(1, AnimationFunctions.sigmoid_0_1(totalT * 0.2));
                        velocity += acceleration * deltaT;
                        velocity *= (1 - dampner);
                        currentAngle += (velocity * deltaT);
                        lastAngle = currentAngle;
                        this.containerDiv.style.transform = `rotate(${currentAngle + this.baseAngle}rad)`;
                        
                        if (Math.abs(velocity) < 0.1 && Math.abs(acceleration) < 0.1) {
                            this.dropLeafCluster();
                            return AnimationState.DONE;
                        }
                    },
                    onDone: () => {
                        this.springAnimation = null;
                    }
                })
            );
        }

        this.containerDiv.addEventListener('pointerdown', pointerDown);
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
        if (this.shakingAnimation)
            return;

        if (this.dragging || this.springAnimation || this.leafClusterDropping)
            return;
        
        const animationGroup = this.options.treeGenerator.getAnimationGroup();

        const SHAKE_TIME: number = this.options.treeGenerator.getPRNG('DRAW').floatInRange(4000, 7000);
        const MAX_ANGLE: number = this.options.treeGenerator.getPRNG('DRAW').floatInRange(1, 3);

        this.shakingAnimation = animationGroup.addAnimation(
            startAnimation({
                animate: (t: number) => {
                    const targetAngle = MAX_ANGLE * (cw ? 1 : -1);
                    this.containerDiv.style.transform = `rotate(${this.baseAngle + targetAngle * Math.pow(Math.sin(Math.PI * 2 * (t / SHAKE_TIME)), 3)}deg)`;
                    if (t >= SHAKE_TIME)
                        return AnimationState.DONE;
                },
                onDone: () => {
                    this.shakingAnimation = null;
                }
                })
            );
    }

    public dropRandomLeafs(leafCount: number) {
        if (this.droppedAllLeafs)
            return;

        const prng = this.options.treeGenerator.getPRNG('DRAW');

        for (let i = 0; i < leafCount; i++) {
            const layerIdx = prng.intInRange(0, this.leafLayersToDrop.length - 1);
            const layer = this.leafLayersToDrop[layerIdx];

            const layerLeafs = this.layerToLeafs.get(layer)!;
            if (!layerLeafs.length)
                continue;

            const leafIdx = prng.intInRange(0, layerLeafs.length - 1);
            const leaf = layerLeafs[leafIdx];
            this.dropLeaf(leaf);
        }
    }

    public dropLeafCluster() {
        if (this.isLeafClusterDropping)
            return;

        if (!this.leafLayersToDrop.length)
            return;

        const leafLayer = this.leafLayersToDrop.pop()!;
        const leafsInLayer = this.layerToLeafs.get(leafLayer)!;
        
        leafsInLayer.forEach((leaf) => {
            const dropDelay = this.options.treeGenerator.getPRNG('DRAW').intInRange(0, 3000);
            this.dropLeaf(leaf, dropDelay);
        });

        const animationGroup = this.options.treeGenerator.getAnimationGroup();

        animationGroup.addAnimation(
            startAnimation({
                animate: (t: number) => {
                    const opacity = 1.0 - Math.min(1.0, t / 500);
                    leafLayer.canvas.style.opacity = opacity + '';
                    if (opacity < 0)
                        return AnimationState.DONE;
                }
            })
        );

        animationGroup.addAnimation(
            setAnimationTimeout({
                callback: () => {
                    this.isLeafClusterDropping = false
                },
                time: 8000
            })
        );

        this.isLeafClusterDropping = true;
    }

    private dropLeaf(leaf: Leaf, dropDelay?: number) {
        console.assert(this.isFinishedGrowing());
        const animationGroup = this.options.treeGenerator.getAnimationGroup();
        const leafElement = leaf.createElement();
        leafElement.style.zIndex = this.containerDiv.style.zIndex;
        const startY = parseFloat(leafElement.style.top);
        const speed = this.options.treeGenerator.getPRNG('DRAW').floatInRange(200, 300);

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

        this.containerDiv.after(leafElement);
    }

    protected drawLayers() {
        super.drawLayers();

        const randomLeafClusterLayer = this.leafClusterLayers[this.options.treeGenerator.getPRNG('GROW').intInRange(0, TreePartLeaf.LEAF_LAYER_COUNT - 1)];
        this.drawWithTransform(randomLeafClusterLayer.canvas, (ctx) => this.drawLeafs(ctx, randomLeafClusterLayer));
    }

    private drawLeafs(ctx: CanvasRenderingContext2D, layer: CanvasLayer) {
        if (!this.isTerminal())
            return;
        
        const newLeafs = this.growerOptions.branchGrower.getNewLeafs();
        const rotatedLeafCount: number = this.options.treeGenerator.getPRNG('GROW').intInRange(1, 2);

        newLeafs.forEach((leaf) => {
            this.layerToLeafs.get(layer)?.push(leaf);
            leaf.draw(ctx);

            for (let i = 0; i < rotatedLeafCount; i++) {
                const rotatedLeaf = leaf.clone()
                this.layerToLeafs.get(layer)?.push(rotatedLeaf);
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

    private static LEAF_LAYER_COUNT: number = 5;

    private get isLeafClusterDropping(): boolean {
        return this.leafClusterDropping;
    }

    private set isLeafClusterDropping(val) {
        this.leafClusterDropping = val;
        this.updatePointerProperty();
    }

    private shakingAnimation: Animation | null = null;
    private springAnimation: Animation | null = null;

    private dragging: boolean = false;

    private leafClusterDropping: boolean = false;

    private layerToLeafs: Map<CanvasLayer, Array<Leaf>> = new Map();

    private leafLayersToDrop: Array<CanvasLayer>;

    private leafClusterLayers: Array<CanvasLayer>;
}