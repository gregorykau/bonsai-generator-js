import { ITreeGeneratorParameters, TreeGenerator, TreeGeneratorContext } from "../treeGenerator.js";
import { startAnimation, AnimationState, Animation } from "../../utils/animationHelper.js";
import { Vector2 } from "../../utils/linear/vector2.js";


export interface CanvasLayer {
    uid: number;
    canvas: HTMLCanvasElement;
}

export interface TreePartOptions {
    position: Vector2,
    size: Vector2,
    parent?: TreePart;
    overdrawWidth?: number;
    depth?: number;
    origin: Vector2;
    zIndex?: number;
    growWithTree?: boolean;
    fadeIn?: boolean;
    context: TreePartContext
}

export interface TreePartContext extends TreeGeneratorContext {
    treeGenerator: ITreeGeneratorParameters;
}

export abstract class TreePart {
    protected constructor(options: TreePartOptions) {
        this.options = options;

        this.originalPosition = this.options.position.clone();

        this.containerDiv = document.createElement('div');
        this.containerDiv.style.touchAction = 'none';
        this.containerDiv.style.pointerEvents = 'none';
        if (options.context.debugging) {
            this.containerDiv.style.border = '1px solid black';
        }

        this.canvasDiv = document.createElement('div');
        this.canvasDiv.style.pointerEvents = 'none';
        this.canvasDiv.style.position = 'absolute';
        this.canvasDiv.style.left = '0px';
        this.canvasDiv.style.top = '0px';
        this.canvasDiv.style.width = '100%';
        this.canvasDiv.style.height = '100%';

        this.setContainerDivAttributes();

        this.containerDiv.appendChild(this.canvasDiv);

        if (options.parent) {
            options.parent.container.append(this.containerDiv);
        } else {
            options.context.treeGenerator.appendElement(this.containerDiv, options.growWithTree);
        }
    }

    public get depth(): number { return this.options.depth ?? 0; }
    
    public get position(): Vector2 { return this.options.position; }
    public get size(): Vector2 { return this.options.size; }

    private get container(): HTMLElement { return this.canvasDiv; }

    public get positionGlobal(): Vector2 { 
        return (this.options.parent ? this.options.parent!.positionGlobal : Vector2.Zero).add(this.originalPosition);
    }

    public init() {
        if (this.options.fadeIn && this.options.context.isPlayback)
            this.fadeIn();
    }

    public isTerminal(): boolean {
        return false;
    }

    public fadeIn() {
        const animationGroup = this.options.context.treeGenerator.getAnimationGroup();

        // fade in leafs and branches
        this.canvasLayers.forEach(canvasLayer => {
            const FADE_END_TIME: number = 500;
            const canvas = canvasLayer.canvas;
            canvas.style.opacity = '0.00';

            animationGroup.addAnimation(
                startAnimation({
                    animate: (t: number) => {
                        const val = Math.min(1, Math.max(0, t / FADE_END_TIME));
                        canvas.style.opacity = val+'';
                        if (val >= 1)
                            return AnimationState.DONE;
                    }
                })
            );
        })
    }

    protected createCanvasLayer(): CanvasLayer {
        const layerData = {
            uid: this.options.context.serializedIdxKey++,
            dirty: false,
            canvas: this.createCanvas()
        };

        if (this.options.context.isPlayback) {
            const ctx = layerData.canvas.getContext("2d")!;
            const image = new Image();
            const serializedValue = <string>this.options.context.serializedValues[layerData.uid];
            image.onload = () => {
                ctx.drawImage(image, 0, 0, ctx.canvas.width, ctx.canvas.height);
            };
            if (serializedValue)
                image.src = <string>serializedValue;
        }

        this.canvasLayers.push(layerData);
        this.canvasDiv.appendChild(layerData.canvas);

        return layerData;
    }
    
    private createCanvas(): HTMLCanvasElement {
        const renderScalar = this.options.context.treeGenerator.getRenderScaling();
        const canvas = document.createElement('canvas');
        canvas.setAttribute('width', (this.options.size.x + TreePart.CANVAS_BUFFER_MARGIN) * renderScalar + '');
        canvas.setAttribute('height', (this.options.size.y +  TreePart.CANVAS_BUFFER_MARGIN) * renderScalar + '');
        canvas.style.pointerEvents = 'none';
        canvas.style.width = this.options.size.x + TreePart.CANVAS_BUFFER_MARGIN + 'px';
        canvas.style.height = this.options.size.y + TreePart.CANVAS_BUFFER_MARGIN + 'px';
        canvas.style.position = 'absolute';
        canvas.style.left = (TreePart.CANVAS_BUFFER_MARGIN * -0.5) + 'px';
        canvas.style.top = (TreePart.CANVAS_BUFFER_MARGIN * -0.5) + 'px';
        return canvas;
    }

    private pixelsToRelative(x: number, y: number): Vector2 {
        return new Vector2(
            x / this.options.size.x,
            y / this.options.size.y
        );
    }

    private setContainerDivAttributes() {
        this.containerDiv.style.position = 'absolute';
        this.containerDiv.style.left = this.options.position.x + 'px';
        this.containerDiv.style.top = this.options.position.y + 'px';
        this.containerDiv.style.width = this.options.size.x + 'px';
        this.containerDiv.style.height = this.options.size.y + 'px';
        this.containerDiv.style.zIndex = (this.options.zIndex ?? 0) + '';
        this.containerDiv.style.boxSizing = 'border-box';
        if (this.options.origin && !this.containerDiv.style.transformOrigin) {
            const transformOrigin = this.pixelsToRelative(this.options.origin.x, this.options.origin.y);
            this.canvasDiv.style.transformOrigin = `
                ${transformOrigin.x * 100 + '%'}
                ${transformOrigin.y * 100 + '%'}
            `;
            this.canvasDiv.style.transform = `rotate(${this.baseAngle}rad)`;
        }
    }

    protected drawWithTransform(canvas: HTMLCanvasElement, func: (ctx: CanvasRenderingContext2D) => void) {
        const ctx = <CanvasRenderingContext2D>canvas.getContext('2d');
        const scalar = this.options.context.treeGenerator.getRenderScaling();
        ctx.save();
        {
            ctx.scale(scalar, scalar);
            // ctx.translate(-this.options.position.x, -this.options.position.y);
            ctx.translate(TreePart.CANVAS_BUFFER_MARGIN * 0.5, TreePart.CANVAS_BUFFER_MARGIN * 0.5);
            func(ctx);
        }
        ctx.restore();
    }

    protected abstract drawLayers(): void;

    protected afterDrawLayers() {

    }

    public shake(cw: boolean) {
        if (this.shakingAnimation)
            return;

        const animationGroup = this.options.context.treeGenerator.getAnimationGroup();

        const SHAKE_TIME: number = this.options.context.treeGenerator.getPRNG('DRAW').floatInRange(5000, 10000);
        const MAX_ANGLE: number = this.options.context.treeGenerator.getPRNG('DRAW').floatInRange(0.5, 1);

        this.shakingAnimation = animationGroup.addAnimation(
            startAnimation({
                animate: (t: number) => {
                    const targetAngle = MAX_ANGLE * (cw ? 1 : -1);
                    this.canvasDiv.style.transform = `rotate(${this.baseAngle + targetAngle * Math.pow(Math.sin(Math.PI * 2 * (t / SHAKE_TIME)), 3)}deg)`;
                    if (t >= SHAKE_TIME)
                        return AnimationState.DONE;
                },
                onDone: () => {
                    this.shakingAnimation = null;
                }
            })
        );
    }

    public draw() {
        this.drawLayers();
        this.afterDrawLayers();
    }

    public serialize() {
        this.canvasLayers.forEach((layer) => {
            this.options.context.serializedValues[layer.uid] = layer.canvas.toDataURL();
        });
    }

    protected offsetBounds(newBounds: {minPos: Vector2, maxPos: Vector2}) {
        const xDiff = newBounds.minPos.x
        const yDiff = newBounds.minPos.y
        const width = Math.abs(newBounds.maxPos.x - newBounds.minPos.x);
        const height = Math.abs(newBounds.maxPos.y - newBounds.minPos.y);
        
        this.position.x += newBounds.minPos.x;
        this.position.y += newBounds.minPos.y;
        this.size.x = width;
        this.size.y = height;
        
        this.canvasDiv.style.left = -xDiff + 'px';
        this.canvasDiv.style.top = -yDiff + 'px';
        
        this.setContainerDivAttributes();
    }

    private static CANVAS_BUFFER_MARGIN: number = 300;

    protected shakingAnimation: Animation | null = null;

    protected readonly options: TreePartOptions;

    protected containerDiv: HTMLDivElement;
    protected canvasDiv: HTMLDivElement;

    private originalPosition: Vector2;

    private baseAngle: number = 0;

    private canvasLayers: Array<CanvasLayer> = [];
}