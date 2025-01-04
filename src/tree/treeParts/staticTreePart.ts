import {Vector2} from "../../utils/linear/vector2";
import {TreeGenerator} from "../treeGenerator";
import {CanvasLayer, TreePart, TreePartContext, TreePartOptions} from "./treePart";

export interface StaticTreePartOptions extends TreePartOptions {
    image: HTMLImageElement,
}
export interface StaticTreePartFactoryOptions {
    context: TreePartContext,
    zIndex: number, 
    pos: Vector2, 
    image: HTMLImageElement,
    depth: number
}

export class StaticTreePart extends TreePart {
    public static fromImage(options: StaticTreePartFactoryOptions): StaticTreePart {
        return new StaticTreePart({
            context: options.context,
            image: options.image,
            position: options.pos,
            size: new Vector2(options.image.width, options.image.height),
            origin: options.pos,
            depth: options.depth,
            zIndex: options.zIndex,
            growWithTree: false
        });
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
        ctx.drawImage(this.staticOptions.image, 0, 0, this.options.size.x, this.options.size.y);
    }

    private staticOptions: StaticTreePartOptions;

    private drawn: boolean = false;
    
    private imgLayer: CanvasLayer;
}