import { BBox } from "../../utils/linear/bbox";
import { Vector2 } from "../../utils/linear/vector2";
import { TreeGenerator } from "../treeGenerator";
import { CanvasLayer, TreePart, TreePartOptions } from "./treePart";

export interface StaticTreePartOptions extends TreePartOptions {
    image: HTMLImageElement,
}
export interface StaticTreePartFactoryOptions {
    treeGenerator: TreeGenerator, 
    zIndex: number, 
    pos: Vector2, 
    image: HTMLImageElement,
}

export class StaticTreePart extends TreePart {
    public static fromImage(options: StaticTreePartFactoryOptions): StaticTreePart {
        const staticTreePart = new StaticTreePart({
            treeGenerator: options.treeGenerator,
            image: options.image,
            bbox: new BBox(options.pos.clone(), options.pos.clone().addInPlaceFromFloats(options.image.width, options.image.height)),
            origin: options.pos,
            zIndex: options.zIndex,
            growWithTree: false
        });
        return staticTreePart;
    }
    private constructor(options: StaticTreePartOptions) {
        super(options);
        this.staticOptions = options;

        this.imgLayer = this.createCanvasLayer();
    }
    protected drawLayers() {
        if (this.drawn)
            return;
        this.drawWithTransform(this.imgLayer.canvas, (ctx) => this.drawImgLayer(ctx));
        this.drawn = true;
    }

    private drawImgLayer(ctx: CanvasRenderingContext2D) {
        ctx.drawImage(this.staticOptions.image, this.options.bbox.minCorner.x, this.options.bbox.minCorner.y, this.options.bbox.width, this.options.bbox.height);
    }

    private staticOptions: StaticTreePartOptions;

    private drawn: boolean = false;
    
    private imgLayer: CanvasLayer;
}