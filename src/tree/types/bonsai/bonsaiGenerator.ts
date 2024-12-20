import { TreeGenerator, TreeGeneratorOptions } from "../../treeGenerator.js";
import { Vector2 } from "../../../utils/linear/vector2.js";
import { BBox } from "../../../utils/linear/bbox.js";
import { SpaceColonizer } from "../../spaceColonizer.js";
import { Branch, BranchOptions } from "../../components/branch.js";
import { Leaf } from "../../components/leaf.js";
import { CanvasHelper } from "../../../utils/canvasHelper.js";
import { MetaballSurface } from "../../../utils/metaballs.js";
import { setAnimationInterval } from "../../../utils/animationHelper.js";
import { TreePartLeaf } from "../../treeParts/treePartLeaf.js";
import { TreePartInter } from "../../treeParts/treePartInter.js";
import { StaticTreePart } from "../../treeParts/staticTreePart.js";

export class BonsaiSapceColonizer extends SpaceColonizer {
    protected biasGrowthVector(growthVector: Vector2): Vector2 {
        switch (this.options.depth) {
            case 0:
            case 1:
            case 2:
                growthVector = growthVector.randomizeAngle(0, 0.7, this.options.treeGenerator.getPRNG('GROW').floatInRange(0, 1));
                break;
            case 3:
                growthVector = growthVector.randomizeAngle(0, 0.4, this.options.treeGenerator.getPRNG('GROW').floatInRange(0, 1));
                break;
        }
        return growthVector;
    }
}

export class BonsaiGenerator extends TreeGenerator {
    public static async loadResources(): Promise<void> {
        await Promise.all([
            (async () => BonsaiGenerator.potFrontImage = await CanvasHelper.loadImage('resources/bonsai/images/pot_front.png'))(),
            (async () => BonsaiGenerator.potBackImage = await CanvasHelper.loadImage('resources/bonsai/images/pot_back.png'))(),
            (async () => BonsaiGenerator.mainBranchImage = await CanvasHelper.loadImage('resources/bonsai/images/bark_texture.jpg'))(),
            (async () => BonsaiGenerator.leafTextureImage = await CanvasHelper.loadImage('resources/bonsai/images/leaf_texture.jpg'))(),
            (async () => BonsaiGenerator.leafStencilImage = await CanvasHelper.loadImage('resources/bonsai/images/leaf_stencil.png'))(),
            (async () => BonsaiGenerator.leafOutlineImage = await CanvasHelper.loadImage('resources/bonsai/images/leaf_outline.png'))()
        ])
    }

    public constructor(options: TreeGeneratorOptions) {
        super(options);

        // setup patterns
        const dummyCanvas = CanvasHelper.createTempCanvas(1, 1);
        this.mainBranchPattern = <CanvasPattern>dummyCanvas.createPattern(BonsaiGenerator.mainBranchImage, 'repeat');
        this.leafTexturePattern = <CanvasPattern>dummyCanvas.createPattern(BonsaiGenerator.leafTextureImage, 'repeat');
        this.leafOutlineImage = <HTMLImageElement>BonsaiGenerator.leafOutlineImage.cloneNode();
        this.leafStencilImage = <HTMLImageElement>BonsaiGenerator.leafStencilImage.cloneNode();

        this.generatePotLayer();
        
        this.generateTrunkLayer();
    }

    public destroy(): void {
        super.destroy();
    }

    public onFinishedGrowing(): void {
        super.onFinishedGrowing();
        this.setupAnimations();
    }

    private dropLeafs() {
        const leafTreeParts = this.treeParts.filter(treePart => treePart.isTerminal());
        const randomTreePart = leafTreeParts[Math.floor(leafTreeParts.length * Math.random())];
        (<TreePartLeaf>randomTreePart).dropRandomLeafs(1 + Math.floor(Math.random() * (3 + 1)));
    }

    public setupAnimations() {
        console.assert(this.isFinishedGrowing);
        this.getAnimationGroup().addAnimation(
            setAnimationInterval({
                callback: () => {
                    this.dropLeafs();
                },
                time: 5 * 1000
            })
        );
    }

    public getOutlineThickness(): number { return 1; }

    public getBranchTexturePattern(growth: Vector2, textureName?: string): CanvasPattern {
        switch (textureName) {
            default:
                this.mainBranchPattern.setTransform(new DOMMatrix().translateSelf(growth.x, growth.y).scaleSelf(0.2, 0.2));
                return this.mainBranchPattern;
        }
    }

    public getLeafStencilTexture(): HTMLImageElement {
        return this.leafStencilImage;
    }

    public getLeafOutlineTexture(): HTMLImageElement {
        return this.leafOutlineImage;
    }

    public getLeafTexturePattern(randX?: number, randY?: number): CanvasPattern {
        this.leafTexturePattern.setTransform(new DOMMatrix().translateSelf(randX ?? this.getPRNG('DRAW').floatInRange(0, 400), randY ?? this.getPRNG('DRAW').floatInRange(0, 400)).scaleSelf(0.3, 0.3));
        return this.leafTexturePattern;
    }

    public markLeafReached(depth: number, leaf: Leaf) {
        switch (depth) {
            case 0:
            case 1:
                this.generateSplitLayer(depth + 1, leaf);
                if (this.getPRNG('GROW').random() > 0.5)
                    this.generateSplitLayer(depth + 1, leaf);
                break;
            case 2:
                this.generateLeafLayer(depth + 1, leaf);
                break;
            default:
                break;
        }
    }

    private generatePotLayer() {
        const potPosition = new Vector2(
            TreeGenerator.REFERENCE_HEIGHT / 2 - BonsaiGenerator.potBackImage.width / 2, 
            TreeGenerator.REFERENCE_HEIGHT - BonsaiGenerator.potBackImage.height);
        this.treeParts.push(StaticTreePart.fromImage({
            treeGenerator: this,
            pos: potPosition,
            image: BonsaiGenerator.potBackImage,
            zIndex: -1
        }));
        this.treeParts.push(StaticTreePart.fromImage({
            treeGenerator: this,
            pos: potPosition,
            image: BonsaiGenerator.potFrontImage,
            zIndex: 1
        }));
    }

    private generateTrunkLayer() {
        const bbox = new BBox(new Vector2(0, 0), new Vector2(TreeGenerator.REFERENCE_HEIGHT, TreeGenerator.REFERENCE_HEIGHT));

        const branchGrower = new BonsaiSapceColonizer({
            treeGenerator: this,
            depth: 0,
            startingPoint: BonsaiGenerator.GROW_ORIGIN,
            bbox: bbox,
            leafCount: 7,
            leafAttractionDistance: TreeGenerator.REFERENCE_HEIGHT * 0.75,
            spawnPoints: new Array(10).fill(null).map(x =>
                new Vector2(this.getPRNG('GROW').floatInRange(0, TreeGenerator.REFERENCE_HEIGHT - 100), this.getPRNG('GROW').floatInRange(TreeGenerator.REFERENCE_HEIGHT * 0.4, TreeGenerator.REFERENCE_HEIGHT * 0.6))
            ),
            branchLength: 7
        });

        const newTreePart = new TreePartInter({
            treeGenerator: this,
            bbox: bbox,
            origin: BonsaiGenerator.GROW_ORIGIN,
            branchGrower: branchGrower,
            overdrawWidth: 200,
            fadeIn: false
        });

        newTreePart.init();
        newTreePart.start();
        this.treeParts.push(newTreePart);
    }

    private generateSplitLayer(depth: number, leaf: Leaf) {
        if (!leaf.parent)
            return console.assert(false);

        const EXTRUDE_RANGE = [100, 200];
        const EXTRUDE_ANGLLE_MINDIFF = Math.PI * 0.1;
        const EXTRUDE_ANGLE_MAXDIFF = Math.PI * 0.25;

        const prng = this.getPRNG('GROW');

        const branch: Branch = leaf.parent;
        const position: Vector2 = branch.position;

        const extrudeDir: Vector2 = position.subtract(BonsaiGenerator.GROW_ORIGIN).normalize().randomizeAngle(EXTRUDE_ANGLLE_MINDIFF, EXTRUDE_ANGLE_MAXDIFF, prng.random());
        const extrudeLength: number = prng.floatInRange(EXTRUDE_RANGE[0], EXTRUDE_RANGE[1]);
        const extrudePosition = position.add(extrudeDir.scale(extrudeLength));

        const partSize: number = 300;
        const partBounds = new Vector2(partSize, partSize);
        const bbox = BBox.fromPositionAndSize(new Vector2(position.x - partBounds.x * 0.5, position.y - partBounds.y), partBounds);

        const branchGrower = new BonsaiSapceColonizer({
            treeGenerator: this,
            depth: depth,
            parentBranch: branch,
            startingPoint: position,
            bbox: bbox,
            leafCount: 1,
            leafAttractionDistance: partSize,
            branchLength: 5,
            spawnPoints: [extrudePosition]
        });

        const newTreePart = new TreePartInter({
            treeGenerator: this,
            depth: depth,
            bbox: bbox,
            origin: position,
            branchGrower: branchGrower,
            fadeIn: true
        });

        newTreePart.init();
        newTreePart.start();
        this.treeParts.push(newTreePart);
    }

    private generateLeafLayer(depth: number, leaf: Leaf) {
        if (!leaf.parent)
            return console.assert(false);

        const prng = this.getPRNG('GROW');

        const branch: Branch = leaf.parent;
        const position: Vector2 = branch.position;

        const bboxScalar: number = prng.floatInRange(1, 1.2);
        const bbox = new BBox(position.subtract(new Vector2(250 * bboxScalar, 150 * bboxScalar)), position.add(new Vector2(250 * bboxScalar, 30)));

        const leafCount: number = 200 * Math.pow(bboxScalar, 2);
        const leafAttractionDistance: number = prng.intInRange(50, 100) * bboxScalar;
        const surfaceScalar: number = bbox.width / 500;
        const metaballSurface: MetaballSurface = new MetaballSurface({
            threshold: 1,
            points: [
                { x: bbox.minCorner.x + bbox.width * 0.2, y: position.y, r: [30, 60], d: [0, 30] },
                { x: bbox.minCorner.x + bbox.width * 0.4, y: position.y, r: [30, 60], d: [0, 30] },
                { x: bbox.minCorner.x + bbox.width * 0.6, y: position.y, r: [30, 60], d: [0, 30] },
                { x: bbox.minCorner.x + bbox.width * 0.8, y: position.y, r: [30, 60], d: [0, 30] },
                { x: bbox.minCorner.x + bbox.width * 0.5, y: position.y, r: [20, 30], d: [0, 30] },
            ].map(basePos => {
                const offsetPos = new Vector2(basePos.x, basePos.y);
                const maxDist = prng.floatInRange(basePos.d[0], basePos.d[1]) * surfaceScalar;
                offsetPos.randomizeOffsetInPlace(maxDist, prng.floatInRange(0, 1));
                return {
                    x: offsetPos.x,
                    y: offsetPos.y,
                    r: prng.floatInRange(basePos.r[0], basePos.r[1]) * surfaceScalar
                };
            })
        });

        const branchGrower = new BonsaiSapceColonizer({
            treeGenerator: this,
            depth: depth,
            startingPoint: position,
            positionPredicate: (bbox, pos) => metaballSurface.spaceOccupied(pos.x, pos.y),
            parentBranch: branch,
            bbox: bbox,
            leafCount: leafCount,
            leafAttractionDistance: leafAttractionDistance * bboxScalar,
            spawnPoints: [],
            branchLength: 5
        });

        const newTreePart = new TreePartLeaf({
            treeGenerator: this,
            origin: position,
            depth: depth,
            bbox: bbox,
            branchGrower: branchGrower,
            fadeIn: true
        });
        newTreePart.start();
        newTreePart.init();
        this.treeParts.push(newTreePart);
    }

    public getBranchWidth(depth: number, branch: Branch): number {
        const treePart = this.getTreePart(branch);
        const depthParams = BonsaiGenerator.treeWidthParams[depth];

        const depthStartY = depth == 0 ? depthParams.minStartWidth : Math.max(depthParams.minStartWidth, treePart.startingBranchWidth);
        const width = depthParams.widthF(depthStartY, branch.growthLocal.y);

        return Math.max(depthParams.targetWidth, width);
    }

    private static GROW_ORIGIN: Vector2 = new Vector2(TreeGenerator.REFERENCE_HEIGHT * 0.5, TreeGenerator.REFERENCE_HEIGHT - 100);

    private static treeWidthParams = [
        {
            minStartWidth: 140,
            targetWidth: 30,
            widthF: (startGrowth: number, growthLocal: number) => startGrowth + growthLocal * -0.17
        },
        {
            minStartWidth: 0,
            targetWidth: 15,
            widthF: (startGrowth: number, growthLocal: number) => startGrowth + growthLocal * -0.15
        },
        {
            minStartWidth: 0,
            targetWidth: 7,
            widthF: (startGrowth: number, growthLocal: number) => startGrowth + growthLocal * -0.15
        },
        {
            minStartWidth: 0,
            targetWidth: 3,
            widthF: (startGrowth: number, growthLocal: number) => startGrowth + growthLocal * -1.5,
        }
    ];

    private mainBranchPattern: CanvasPattern;
    private leafStencilImage: HTMLImageElement;
    private leafOutlineImage: HTMLImageElement;
    private leafTexturePattern: CanvasPattern;

    private static potFrontImage: HTMLImageElement;
    private static potBackImage: HTMLImageElement;
    private static mainBranchImage: HTMLImageElement;
    private static leafOutlineImage: HTMLImageElement;
    private static leafTextureImage: HTMLImageElement;
    private static leafStencilImage: HTMLImageElement;
}
