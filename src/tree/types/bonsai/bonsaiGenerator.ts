import {TreeGenerator, TreeGeneratorOptions} from "../../treeGenerator.js";
import {Vector2} from "../../../utils/linear/vector2.js";
import {SpaceColonizer} from "../../spaceColonizer.js";
import {Branch, BranchOptions} from "../../components/branch.js";
import {Leaf, LeafOptions} from "../../components/leaf.js";
import {CanvasHelper} from "../../../utils/canvasHelper.js";
import {MetaballSurface} from "../../../utils/metaballs.js";
import {setAnimationInterval} from "../../../utils/animationHelper.js";
import {TreePartLeaf} from "../../treeParts/treePartLeaf.js";
import {TreePartInter} from "../../treeParts/treePartInter.js";
import {StaticTreePart} from "../../treeParts/staticTreePart.js";
import {TreePartGrower} from "../../treeParts/teePartGrower.js";
import { BranchContext } from "../../components/branch.js";

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

    protected onFinishedGrowing(): void {
        super.onFinishedGrowing();
        this.setupAnimations();
    }

    private dropLeafs() {
        const leafTreeParts = this.treeParts.filter(treePart => treePart.isTerminal());
        const randomTreePart = leafTreeParts[Math.floor(leafTreeParts.length * Math.random())];
        (<TreePartLeaf>randomTreePart).dropRandomLeafs(1 + Math.floor(Math.random() * (3 + 1)));
    }

    private setupAnimations() {
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
            context: this.treePartContext,
            pos: potPosition,
            image: BonsaiGenerator.potBackImage,
            zIndex: -1,
            depth: -1
        }));
        this.treeParts.push(StaticTreePart.fromImage({
            context: this.treePartContext,
            pos: potPosition,
            image: BonsaiGenerator.potFrontImage,
            zIndex: 1,
            depth: -1
        }));
    }

    private generateTrunkLayer() {
        const newTreePart = new TreePartInter({
            context: this.treePartContext,
            position: Vector2.Zero,
            size: new Vector2(TreeGenerator.REFERENCE_HEIGHT, TreeGenerator.REFERENCE_HEIGHT),
            origin: BonsaiGenerator.GROW_ORIGIN,
            overdrawWidth: 200,
            fadeIn: false
        });

        const context: BranchContext = {
            ...this.treePartContext,
            treePart: newTreePart
        };

        newTreePart.branchGrower = new BonsaiSapceColonizer({
            treeGenerator: this,
            depth: 0,
            origin: BonsaiGenerator.GROW_ORIGIN,
            size: new Vector2(TreeGenerator.REFERENCE_HEIGHT, TreeGenerator.REFERENCE_HEIGHT),
            leafCount: 7,
            spawnPoints: new Array(10).fill(null).map(x =>
                new Vector2(this.getPRNG('GROW').floatInRange(0, TreeGenerator.REFERENCE_HEIGHT - 100), this.getPRNG('GROW').floatInRange(TreeGenerator.REFERENCE_HEIGHT * 0.4, TreeGenerator.REFERENCE_HEIGHT * 0.6))
            ),
            branchLength: 10,
            createFirstBranch: (pos: Vector2) => {
                return new Branch({
                    position: pos,
                    context: context
                })
            },
            createLeaf: (pos: Vector2) => {
                return new Leaf({
                    treeGenerator: this,
                    position: pos,
                    attractionDistance: TreeGenerator.REFERENCE_HEIGHT * 0.75,
                    context: context
                })
            }
        });
        newTreePart.init();
        newTreePart.start();

        this.treeParts.push(newTreePart);
    }

    private generateSplitLayer(depth: number, leaf: Leaf) {
        if (!leaf.parent)
            return console.assert(false);

        const treePart = leaf.parent.context?.treePart;

        const LAYER_SIZE: number = 300;
        const EXTRUDE_RANGE = [100, 150];
        const EXTRUDE_ANGLLE_MIN_DIFF = Math.PI * 0.1;
        const EXTRUDE_ANGLE_MAX_DIFF = Math.PI * 0.25;

        const prng = this.getPRNG('GROW');

        const branch: Branch = leaf.parent;

        const extrudeDir: Vector2 = branch.endPosGlobal.subtract(BonsaiGenerator.GROW_ORIGIN).normalize().randomizeAngle(EXTRUDE_ANGLLE_MIN_DIFF, EXTRUDE_ANGLE_MAX_DIFF, prng.random());
        const extrudeLength: number = prng.floatInRange(EXTRUDE_RANGE[0], EXTRUDE_RANGE[1]);
        const extrudePosition = branch.endPos.add(extrudeDir.scale(extrudeLength));

        const position: Vector2 = branch.endPos.add(new Vector2(-LAYER_SIZE * 0.5, -LAYER_SIZE));
        const origin: Vector2 = branch.endPos.subtract(position);
        const size: Vector2 = new Vector2(LAYER_SIZE, LAYER_SIZE);

        const newTreePart = new TreePartInter({
            context: this.treePartContext,
            depth: depth,
            position: position,
            size: size,
            parent: treePart,
            origin: origin,
            fadeIn: true
        });

        const context: BranchContext = {
            ...this.treePartContext,
            treePart: newTreePart
        };

        newTreePart.branchGrower = new BonsaiSapceColonizer({
            treeGenerator: this,
            depth: depth,
            parentBranch: branch,
            origin: origin,
            size: size,
            leafCount: 1,
            branchLength: 8,
            spawnPoints: [extrudePosition.subtract(position)],
            createFirstBranch: (pos: Vector2) => {
                return new Branch({
                    position: pos,
                    parent: branch,
                    context: context
                })
            },
            createLeaf: (pos: Vector2) => {
                return new Leaf({
                    treeGenerator: this,
                    position: pos,
                    attractionDistance: LAYER_SIZE,
                    context: context
                })
            }
        });
        newTreePart.init();
        newTreePart.start();
        this.treeParts.push(newTreePart);
    }

    private generateLeafLayer(depth: number, leaf: Leaf) {
        if (!leaf.parent)
            return console.assert(false);

        const treePart = leaf.parent.context?.treePart;

        const prng = this.getPRNG('GROW');

        const branch: Branch = leaf.parent;

        const LEAF_SCALE: number = prng.floatInRange(1, 1.2);
        const size: Vector2 = new Vector2(500 * LEAF_SCALE, 200 * LEAF_SCALE);
        const position: Vector2 = branch.endPos.subtractFromFloats(size.x * 0.5, size.y - 10);
        const origin: Vector2 = branch.endPos.subtract(position);

        const leafCount: number = 200 * Math.pow(LEAF_SCALE, 2);
        const leafAttractionDistance: number = prng.intInRange(50, 100) * LEAF_SCALE;

        const surfaceScalar: number = size.x / 500;

        const metaballSurface: MetaballSurface = new MetaballSurface({
            threshold: 1,
            points: [
                { x: size.x * 0.2, y: size.y, r: [30, 60], d: [0, 30] },
                { x: size.x * 0.4, y: size.y, r: [30, 60], d: [0, 30] },
                { x: size.x * 0.6, y: size.y, r: [30, 60], d: [0, 30] },
                { x: size.x * 0.8, y: size.y, r: [30, 60], d: [0, 30] },
                { x: size.x * 0.5, y: size.y, r: [20, 30], d: [0, 30] },
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

        const newTreePart = new TreePartLeaf({
            context: this.treePartContext,
            origin: origin,
            parent: treePart,
            depth: depth,
            position: position,
            size: size,
            fadeIn: true
        });

        const context: BranchContext = {
            ...this.treePartContext,
            treePart: newTreePart
        };

        newTreePart.branchGrower = new BonsaiSapceColonizer({
            treeGenerator: this,
            depth: depth,
            origin: origin,
            positionPredicate: (pos) => metaballSurface.spaceOccupied(pos.x, pos.y),
            parentBranch: branch,
            size: size,
            leafCount: leafCount,
            spawnPoints: [],
            branchLength: 5,
            createFirstBranch: (pos: Vector2) => {
                return new Branch({
                    position: pos,
                    parent: branch,
                    context: context
                })
            },
            createLeaf: (pos: Vector2) => {
                return new Leaf({
                    treeGenerator: this,
                    position: pos,
                    attractionDistance: leafAttractionDistance * LEAF_SCALE,
                    context: context
                })
            }
        });
        newTreePart.start();
        newTreePart.init();
        this.treeParts.push(newTreePart);
    }

    public getBranchWidth(branch: Branch): number {
        const treePart = <TreePartGrower>branch.context?.treePart!;

        switch(treePart.depth) {
            case 0:
                return Math.max(30, 140 + branch.growthLocal.y * -0.17);
            case 1:
                return Math.max(15, treePart.startingBranchWidth + branch.growthLocal.y * -0.15);
            case 2:
                return Math.max(7, treePart.startingBranchWidth + branch.growthLocal.y * -0.15);
            case 3:
                return Math.max(3, treePart.startingBranchWidth + branch.growthLocal.y * -1.5);
            default:
                return 0;
        }
    }

    private static GROW_ORIGIN: Vector2 = new Vector2(TreeGenerator.REFERENCE_HEIGHT * 0.5, TreeGenerator.REFERENCE_HEIGHT - 100);

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
