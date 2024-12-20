import { ITreeGeneratorParameters } from "../treeGenerator.js";
import { BBox } from "../../utils/linear/bbox.js";
import { AnimationState, startAnimation } from "../../utils/animationHelper.js";
import { Vector2 } from "../../utils/linear/vector2.js";


export interface CanvasLayer {
    uid: number;
    canvas: HTMLCanvasElement;
}

export interface TreePartOptions {
    treeGenerator: ITreeGeneratorParameters,
    bbox: BBox,

    overdrawWidth?: number;
    depth?: number;
    origin: Vector2;
    zIndex?: number;
    growWithTree?: boolean;
    fadeIn?: boolean;
}

export abstract class TreePart {
    public constructor(options: TreePartOptions) {
        this.options = options;

        this.containerDiv = document.createElement('div');
        this.containerDiv.style.pointerEvents = 'none';
        options.treeGenerator.appendElement(this.containerDiv, options.growWithTree);
        this.setContainerDivAttributes();
    }
    
    public init() {
        const playingBack = this.options.treeGenerator.isSerializedPlayback();
        if (this.options.fadeIn && playingBack)
            this.fadeIn();
    }

    public isTerminal(): boolean {
        return false;
    }

    public fadeIn() {
        const animationGroup = this.options.treeGenerator.getAnimationGroup();

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
            uid: this.options.treeGenerator.getSerializedKey(),
            dirty: false,
            canvas: this.createCanvas()
        };

        if (this.options.treeGenerator.isSerializedPlayback()) {
            const ctx = layerData.canvas.getContext("2d")!;
            const image = new Image();
            const serializedValue = <string>this.options.treeGenerator.getSerializedValue(layerData.uid);
            image.onload = () => {
                ctx.drawImage(image, 0, 0, ctx.canvas.width, ctx.canvas.height);
            };
            if (serializedValue)
                image.src = <string>serializedValue;
        }

        this.canvasLayers.push(layerData);
        this.containerDiv.appendChild(layerData.canvas);

        return layerData;
    }
    
    private createCanvas(): HTMLCanvasElement {
        const renderScalar = this.options.treeGenerator.getRenderScaling();
        const canvas = document.createElement('canvas');
        canvas.setAttribute('width', (this.options.bbox.width + TreePart.CANVAS_BUFFER_MARGIN) * renderScalar + '');
        canvas.setAttribute('height', (this.options.bbox.height +  TreePart.CANVAS_BUFFER_MARGIN) * renderScalar + '');
        canvas.style.pointerEvents = 'none';
        canvas.style.width = this.options.bbox.width + TreePart.CANVAS_BUFFER_MARGIN + 'px';
        canvas.style.height = this.options.bbox.height + TreePart.CANVAS_BUFFER_MARGIN + 'px';
        canvas.style.position = 'absolute';
        canvas.style.left = (TreePart.CANVAS_BUFFER_MARGIN * -0.5) + 'px';
        canvas.style.top = (TreePart.CANVAS_BUFFER_MARGIN * -0.5) + 'px';
        return canvas;
    }

    protected pixelsToRelative(x: number, y: number): Vector2 {
        return new Vector2(
            (x - this.options.bbox.minCorner.x) / this.options.bbox.width,
            (y - this.options.bbox.minCorner.y) / this.options.bbox.height
        );
    }

    public setContainerDivAttributes() {
        this.containerDiv.style.position = 'absolute';
        this.containerDiv.style.left = this.options.bbox.minCorner.x + 'px';
        this.containerDiv.style.top = this.options.bbox.minCorner.y + 'px';
        this.containerDiv.style.width = this.options.bbox.width + 'px';
        this.containerDiv.style.height = this.options.bbox.height + 'px';
        if (this.options.origin) {
            const transformOrigin = this.pixelsToRelative(this.options.origin.x, this.options.origin.y);
            this.containerDiv.style.transformOrigin = `
                ${transformOrigin.x * 100 + '%'}
                ${transformOrigin.y * 100 + '%'}
            `;
        }
        this.containerDiv.style.transform = `rotate(${this.baseAngle}rad)`;
        this.containerDiv.style.zIndex = ((this.options.zIndex ?? 0) + ((this.options.depth ?? 0) / 100)) + '';
        this.containerDiv.style.boxSizing = 'border-box';
    }

    public clipContainerDiv(targetBounds: BBox) {
        const bboxA = this.options.bbox;
        
        const bboxDiffX = targetBounds.minCorner.x - bboxA.minCorner.x;
        const bboxDiffY = targetBounds.minCorner.y - bboxA.minCorner.y;

        this.canvasLayers.forEach((layer) => {
            layer.canvas.style.left = parseFloat(layer.canvas.style.left) - bboxDiffX + 'px';
            layer.canvas.style.top = parseFloat(layer.canvas.style.top) - bboxDiffY + 'px';
        });

        this.options.bbox = targetBounds;
        this.setContainerDivAttributes();
    }

    protected drawWithTransform(canvas: HTMLCanvasElement, func: (ctx: CanvasRenderingContext2D) => void) {
        const ctx = <CanvasRenderingContext2D>canvas.getContext('2d');
        const scalar = this.options.treeGenerator.getRenderScaling();
        ctx.save();
        {
            ctx.scale(scalar, scalar);
            ctx.translate(-this.options.bbox.minCorner.x, -this.options.bbox.minCorner.y);
            ctx.translate(TreePart.CANVAS_BUFFER_MARGIN * 0.5, TreePart.CANVAS_BUFFER_MARGIN * 0.5);
            func(ctx);
        }
        ctx.restore();
    }

    protected abstract drawLayers(): void;

    protected afterDrawLayers() {

    }

    public draw() {
        this.drawLayers();
        this.afterDrawLayers();
    }

    public serialize() {
        this.canvasLayers.forEach((layer) => {
            this.options.treeGenerator.setSerializedValue(layer.uid, layer.canvas.toDataURL());
        });
    }

    private static CANVAS_BUFFER_MARGIN: number = 300;

    protected readonly options: TreePartOptions;

    protected containerDiv: HTMLDivElement;

    protected baseAngle: number = 0;

    private canvasLayers: Array<CanvasLayer> = [];
}