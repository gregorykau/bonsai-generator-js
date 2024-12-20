/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/tree/components/branch.ts":
/*!***************************************!*\
  !*** ./src/tree/components/branch.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Branch: () => (/* binding */ Branch)
/* harmony export */ });
/* harmony import */ var _utils_linear_vector2_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/linear/vector2.js */ "./src/utils/linear/vector2.ts");

class Branch {
    constructor(options) {
        var _a;
        this._growthLocal = new _utils_linear_vector2_js__WEBPACK_IMPORTED_MODULE_0__.Vector2(0, 0);
        this._growthTotal = new _utils_linear_vector2_js__WEBPACK_IMPORTED_MODULE_0__.Vector2(0, 0);
        this._childCount = 0;
        this.drawn = false;
        // set default options
        this.options = options;
        this._parent = (_a = options.parent) !== null && _a !== void 0 ? _a : null;
        this.depth = options.depth;
        this._position = options.position;
        // set texture offset
        if (this._parent) {
            const xoffset = options.treeGenerator.getPRNG('GROW').floatInRange(0, 1024);
            const length = (this._position.subtract(this._parent.position)).length();
            this._growthTotal.y = this._parent.growthTotal.y + length;
            if (!options.firstBranch) {
                this._growthLocal.x = xoffset;
                this._growthLocal.y = this._parent._growthLocal.y + length;
            }
            else {
                this._growthLocal.x = 0;
                this._growthLocal.y = 0;
            }
        }
    }
    createChildBranch(options) {
        options.parent = this;
        this._childCount++;
        return this.createInstance(options);
    }
    createInstance(options) {
        return new Branch(options);
    }
    get angle() {
        return this.parent ? Math.atan2(this.position.x - this.parent.position.x, this.parent.position.y - this.position.y) : NaN;
    }
    get direction() {
        return (!this.parent ? _utils_linear_vector2_js__WEBPACK_IMPORTED_MODULE_0__.Vector2.Zero : this.position.subtract(this.parent.position).normalize());
    }
    get branchWidth() {
        return this.options.treeGenerator.getBranchWidth(this.depth, this);
    }
    get branchHeight() {
        var _a;
        return ((_a = this.parent) === null || _a === void 0 ? void 0 : _a.position.subtract(this.position).length()) || 0;
    }
    get parent() { return this._parent; }
    get growthTotal() { return this._growthTotal; }
    get growthLocal() { return this._growthLocal; }
    get position() { return this._position; }
    get childCount() { return this._childCount; }
    distanceTo(leaf) { return leaf.position.subtract(this.position).length(); }
    draw(ctx, drawBorder = true) {
        if (!this.parent)
            return;
        if (this.options.treeGenerator.isSerializedPlayback())
            return;
        console.assert(!this.drawn);
        this.drawn = true;
        const branchWidth = this.branchWidth;
        const branchHeight = this.parent.position.subtract(this.position).length();
        if ((branchWidth / branchHeight) > 2)
            this.drawWithCircle(ctx, drawBorder);
        else
            this.drawWithRectangle(ctx, drawBorder);
    }
    drawWithRectangle(ctx, drawBorder) {
        if (!this.parent)
            return console.assert(false);
        const circleRadius = this.branchWidth / 2;
        const tempCanvas = this.options.treeGenerator.getTempCanvas(0);
        //  draw branch to temporary canvas
        tempCanvas.save();
        {
            //    prepare temporary canvas
            tempCanvas.fillStyle = 'black';
            //    draw rectangle mask
            {
                tempCanvas.beginPath();
                tempCanvas.rect(0, 0, this.branchWidth, this.branchHeight + 2);
                tempCanvas.fill();
            }
            //    draw semi-circle mask to cap off start (prevent gaps between branches)
            {
                tempCanvas.save();
                tempCanvas.translate(circleRadius, this.branchHeight);
                tempCanvas.beginPath();
                tempCanvas.arc(0, 0, circleRadius, 0, Math.PI);
                const gradient = tempCanvas.createLinearGradient(0, 0, 0, circleRadius);
                gradient.addColorStop(0.3, 'rgba(0,0,0,1)');
                gradient.addColorStop(1, 'rgba(0,0,0,0)');
                tempCanvas.fillStyle = gradient;
                tempCanvas.fill();
                tempCanvas.restore();
            }
            // fill 'masked' area with branch texture
            tempCanvas.filter = 'none';
            tempCanvas.globalCompositeOperation = 'source-in';
            this.drawTexture(this.options.treeGenerator.getTempCanvas(1), tempCanvas);
            tempCanvas.globalCompositeOperation = 'source-out';
        }
        tempCanvas.restore();
        // copy rendered branch to target canvas
        ctx.save();
        {
            ctx.translate(this.parent.position.x, this.parent.position.y);
            ctx.rotate(this.angle);
            ctx.drawImage(tempCanvas.canvas, -this.branchWidth / 2, -(this.branchHeight));
        }
        ctx.restore();
        // draw outline
        if (drawBorder) {
            const outlineWidth = this.options.treeGenerator.getOutlineThickness();
            ctx.save();
            {
                ctx.save();
                ctx.globalCompositeOperation = 'destination-over';
                ctx.fillStyle = 'black';
                ctx.translate(this.parent.position.x, this.parent.position.y);
                ctx.rotate(this.angle);
                ctx.beginPath();
                ctx.arc(0, 0, circleRadius + outlineWidth, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(0, 0, circleRadius + outlineWidth, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.rect((-this.branchWidth / 2) - outlineWidth, 0, this.branchWidth + (outlineWidth * 2), -this.branchHeight);
                ctx.fill();
                ctx.restore();
                ctx.save();
                ctx.globalCompositeOperation = 'destination-over';
                ctx.fillStyle = 'black';
                ctx.translate(this.position.x, this.position.y);
                ctx.beginPath();
                ctx.arc(0, 0, circleRadius + outlineWidth, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
                ctx.save();
                ctx.globalCompositeOperation = 'destination-over';
                ctx.fillStyle = 'black';
                ctx.translate(this.parent.position.x, this.parent.position.y);
                ctx.rotate(this.angle);
                ctx.beginPath();
                ctx.rect((-this.branchWidth / 2) - outlineWidth, 0, this.branchWidth + (outlineWidth * 2), -this.branchHeight);
                ctx.fill();
                ctx.restore();
                ctx.globalCompositeOperation = 'source-over';
            }
            ctx.restore();
        }
    }
    drawWithCircle(ctx, drawBorder) {
        if (!this.parent)
            return console.assert(false);
        const tempCanvas = this.options.treeGenerator.getTempCanvas(0);
        const circleRadius = this.branchWidth / 2;
        //  draw branch to temporary canvas
        {
            //    prepare temporary canvas
            tempCanvas.save();
            tempCanvas.fillStyle = 'black';
            //    draw circle
            {
                tempCanvas.save();
                tempCanvas.translate(circleRadius, circleRadius);
                tempCanvas.beginPath();
                tempCanvas.arc(0, 0, circleRadius, 0, Math.PI * 2);
                const gradient = tempCanvas.createRadialGradient(0, 0, 0, 0, 0, circleRadius);
                gradient.addColorStop(0.8, 'rgba(0,0,0,1)');
                gradient.addColorStop(1, 'rgba(0,0,0,0.1)');
                tempCanvas.fillStyle = gradient;
                tempCanvas.fill();
                tempCanvas.restore();
                tempCanvas.globalCompositeOperation = 'source-in';
                this.drawTexture(this.options.treeGenerator.getTempCanvas(1), tempCanvas);
                tempCanvas.globalCompositeOperation = 'source-out';
            }
            tempCanvas.restore();
        }
        // copy rendered branch to target canvas
        ctx.save();
        ctx.translate(this.parent.position.x, this.parent.position.y);
        ctx.rotate(this.angle);
        ctx.translate(-circleRadius, -circleRadius);
        ctx.drawImage(tempCanvas.canvas, 0, 0);
        ctx.restore();
        // draw outline
        if (drawBorder) {
            const outlineWidth = this.options.treeGenerator.getOutlineThickness();
            ctx.save();
            ctx.translate(this.parent.position.x, this.parent.position.y);
            ctx.rotate(this.angle);
            ctx.beginPath();
            // don't draw bottom border half if this is the start of a new tree part
            const drawBottomBorder = this._growthLocal.y > 10;
            ctx.arc(0, 0, circleRadius + outlineWidth, drawBottomBorder ? 0 : Math.PI, Math.PI * 2);
            ctx.globalCompositeOperation = 'destination-over';
            ctx.fillStyle = 'black';
            ctx.fill();
            ctx.restore();
            ctx.globalCompositeOperation = 'source-over';
        }
    }
    drawTexture(tempCanvas, ctx) {
        const pattern = this.options.treeGenerator.getBranchTexturePattern(this.growthTotal);
        tempCanvas.fillStyle = pattern;
        tempCanvas.beginPath();
        tempCanvas.rect(0, 0, tempCanvas.canvas.width, tempCanvas.canvas.height);
        tempCanvas.fill();
        ctx.drawImage(tempCanvas.canvas, 0, 0);
    }
}


/***/ }),

/***/ "./src/tree/components/leaf.ts":
/*!*************************************!*\
  !*** ./src/tree/components/leaf.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Leaf: () => (/* binding */ Leaf)
/* harmony export */ });
/* harmony import */ var _branch_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./branch.js */ "./src/tree/components/branch.ts");
/* harmony import */ var _utils_canvasHelper_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../utils/canvasHelper.js */ "./src/utils/canvasHelper.ts");


class Leaf {
    constructor(options) {
        this._parent = null;
        this.options = options;
        this._position = options.position;
        this.attractionDistance = options.attractionDistance;
        const prng = this.options.treeGenerator.getPRNG('DRAW');
        this.rotation = this.options.rotated ? prng.floatInRange(-1.5, 1.5) : 0;
        this.leafOffsets = [
            prng.intInRange(0, 400),
            prng.intInRange(0, 400)
        ];
    }
    get position() { return this._position; }
    get parent() { return this._parent; }
    set parent(value) { this._parent = value; }
    clone() {
        const leaf = new Leaf({
            treeGenerator: this.options.treeGenerator,
            position: this.options.position.clone(),
            attractionDistance: this.options.attractionDistance,
            rotated: true
        });
        leaf.parent = this.parent;
        return leaf;
    }
    createElement() {
        const parent = this.parent;
        const renderScale = this.options.treeGenerator.getRenderScaling();
        const canvasSize = 50;
        const leafElement = document.createElement('canvas');
        leafElement.style.position = 'absolute';
        leafElement.style.pointerEvents = 'none';
        leafElement.width = canvasSize * renderScale;
        leafElement.height = canvasSize * renderScale;
        leafElement.style.width = canvasSize + 'px';
        leafElement.style.height = canvasSize + 'px';
        leafElement.style.left = (parent.position.x - canvasSize * 0.5) + 'px';
        leafElement.style.top = (parent.position.y - canvasSize * 0.5) + 'px';
        const ctx = leafElement.getContext('2d');
        ctx.scale(renderScale, renderScale);
        ctx.translate(canvasSize * 0.5, canvasSize * 0.5);
        this.drawLeaf(ctx);
        return leafElement;
    }
    intersects(entity) {
        if (!(entity instanceof _branch_js__WEBPACK_IMPORTED_MODULE_0__.Branch))
            return false;
        const distance = entity.position.subtract(this.position).length();
        // leafs intersect with branches within their radius of attraction
        return (entity instanceof _branch_js__WEBPACK_IMPORTED_MODULE_0__.Branch) && (distance <= this.attractionDistance);
    }
    draw(ctx) {
        if (!this.parent)
            return;
        if (this.options.treeGenerator.isSerializedPlayback())
            return;
        ctx.save();
        ctx.translate(this.parent.position.x, this.parent.position.y);
        this.drawLeaf(ctx);
        ctx.restore();
    }
    drawLeaf(ctx) {
        var _a;
        if (!this.parent)
            return;
        const tempCanvas = this.options.treeGenerator.getTempCanvas(0);
        const leafStencil = this.options.treeGenerator.getLeafStencilTexture();
        const leafTexture = this.options.treeGenerator.getLeafTexturePattern(this.leafOffsets[0], this.leafOffsets[1]);
        tempCanvas.save();
        {
            tempCanvas.drawImage(leafStencil, 0, 0);
            tempCanvas.beginPath();
            tempCanvas.rect(0, 0, 15, 15);
            tempCanvas.globalCompositeOperation = 'source-in';
            tempCanvas.fillStyle = leafTexture;
            tempCanvas.fill();
        }
        tempCanvas.globalCompositeOperation = 'source-over';
        tempCanvas.restore();
        ctx.save();
        ctx.rotate(((_a = this.parent) === null || _a === void 0 ? void 0 : _a.angle) + this.rotation);
        ctx.translate(-15 / 2, -15);
        _utils_canvasHelper_js__WEBPACK_IMPORTED_MODULE_1__.CanvasHelper.drawImageBorder(leafStencil, ctx, 1);
        ctx.drawImage(tempCanvas.canvas, 0, 0);
        ctx.drawImage(this.options.treeGenerator.getLeafOutlineTexture(), 0, 0);
        ctx.restore();
    }
    ;
}


/***/ }),

/***/ "./src/tree/spaceColonizer.ts":
/*!************************************!*\
  !*** ./src/tree/spaceColonizer.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SpaceColonizer: () => (/* binding */ SpaceColonizer)
/* harmony export */ });
/* harmony import */ var _components_branch_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./components/branch.js */ "./src/tree/components/branch.ts");
/* harmony import */ var _components_leaf_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./components/leaf.js */ "./src/tree/components/leaf.ts");
/* harmony import */ var _utils_linear_vector2_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/linear/vector2.js */ "./src/utils/linear/vector2.ts");



class SpaceColonizer {
    constructor(options) {
        this.stepCount = 0;
        this.branchesLastLength = 0;
        this.branches = [];
        this.reachedLeafsLastLength = 0;
        this.leafs = [];
        this.reachedLeafs = [];
        this.activeLeafs = new Set();
        this.activeBranches = new Set();
        this.oldBranches = new Set();
        this.options = options;
    }
    start() {
        this.placeLeaves();
        this.placeBranches();
    }
    get angle() {
        var _a, _b;
        return (_b = (_a = this.options.parentBranch) === null || _a === void 0 ? void 0 : _a.angle) !== null && _b !== void 0 ? _b : 0;
    }
    biasGrowthVector(growthVector) {
        return growthVector;
    }
    placeLeaves() {
        var _a;
        // place n leafs
        for (let i = 0; i < this.options.leafCount; i++) {
            let leafPosition = _utils_linear_vector2_js__WEBPACK_IMPORTED_MODULE_2__.Vector2.Zero;
            if ((_a = this.options.spawnPoints) === null || _a === void 0 ? void 0 : _a[i]) {
                // leaf position explicitly specified
                leafPosition = this.options.spawnPoints[i];
            }
            else {
                // leaf position random point in bounds with respect to predicate
                for (let j = 0; j < 100; j++) {
                    leafPosition = new _utils_linear_vector2_js__WEBPACK_IMPORTED_MODULE_2__.Vector2(this.options.treeGenerator.getPRNG('GROW').floatInRange(this.options.bbox.minCorner.x, this.options.bbox.maxCorner.x), this.options.treeGenerator.getPRNG('GROW').floatInRange(this.options.bbox.minCorner.y, this.options.bbox.maxCorner.y));
                    if (!this.options.positionPredicate || this.options.positionPredicate(this.options.bbox, leafPosition)) {
                        break;
                    }
                }
            }
            const leaf = new _components_leaf_js__WEBPACK_IMPORTED_MODULE_1__.Leaf({
                treeGenerator: this.options.treeGenerator,
                position: leafPosition,
                attractionDistance: this.options.leafAttractionDistance,
            });
            this.activeLeafs.add(leaf);
        }
    }
    placeBranches() {
        const branchOptions = {
            parent: this.options.parentBranch,
            branchLength: this.options.branchLength,
            treeGenerator: this.options.treeGenerator,
            position: this.options.startingPoint,
            depth: this.options.depth,
            firstBranch: true
        };
        const startingBranch = this.options.branchFactory ? this.options.branchFactory(branchOptions) : new _components_branch_js__WEBPACK_IMPORTED_MODULE_0__.Branch(branchOptions);
        this.activeBranches.add(startingBranch);
        this.oldBranches.add(startingBranch);
    }
    getClosestBranch(leaf) {
        let closestBranch = null;
        let closesetDistance = Number.POSITIVE_INFINITY;
        this.activeBranches.forEach((branch) => {
            if (!leaf.intersects(branch))
                return;
            // NOTE: If a branch has 2 children already, we ought not extrude from it further.
            // A tri or greater branch junction is both not in keeping with a typical tree structure, and can result in 
            // infinite growth loops where branch growth gets "stuck" between two attracting leafs.
            if (branch.childCount >= 2)
                return;
            const distanceToBranch = branch.distanceTo(leaf);
            if (distanceToBranch < closesetDistance) {
                closesetDistance = distanceToBranch;
                closestBranch = branch;
            }
        });
        return closestBranch;
    }
    step() {
        this.branchesLastLength = this.branches.length;
        this.reachedLeafsLastLength = this.reachedLeafs.length;
        const currentReachedLeafs = [];
        const branchToAttractionVec = new Map();
        // apply leaf influences to branches
        this.activeLeafs.forEach((leaf) => {
            var _a;
            const closestBranch = this.getClosestBranch(leaf);
            if (!closestBranch)
                return;
            if (closestBranch.distanceTo(leaf) < (this.options.branchLength)) {
                // leaf reached by closest branch
                this.activeLeafs.delete(leaf);
                leaf.parent = closestBranch;
                currentReachedLeafs.push(leaf);
            }
            else {
                // leaf not yet reached, apply attraction to closest branch
                const attractionVec = leaf.position.subtract(closestBranch.position);
                branchToAttractionVec.set(closestBranch, ((_a = branchToAttractionVec.get(closestBranch)) !== null && _a !== void 0 ? _a : _utils_linear_vector2_js__WEBPACK_IMPORTED_MODULE_2__.Vector2.Zero).addInPlace(attractionVec));
            }
        });
        // remove idle branches (those that did not grow since last step)
        this.oldBranches.forEach((branch) => {
            if (branchToAttractionVec.has(branch))
                return;
            this.activeBranches.delete(branch);
            this.oldBranches.delete(branch);
        });
        // grow branches towards their influences
        branchToAttractionVec.forEach((attractionVec, branch) => {
            const growVec = attractionVec.normalize().scaleInPlace(this.options.branchLength);
            const vFinalGrowthVector = this.biasGrowthVector(growVec);
            const newPosition = branch.position.add(vFinalGrowthVector);
            const newBranch = branch.createChildBranch({
                treeGenerator: this.options.treeGenerator,
                position: newPosition,
                depth: this.options.depth,
                branchLength: this.options.branchLength
            });
            this.branches.push(newBranch);
            this.activeBranches.add(newBranch);
            this.oldBranches.add(newBranch);
        });
        // only mark leafs as reached if they are terminal leafs (no branch is growing from them)
        currentReachedLeafs.forEach((pendingLeaf => {
            var _a;
            if (((_a = pendingLeaf.parent) === null || _a === void 0 ? void 0 : _a.childCount) != 0)
                return;
            this.reachedLeafs.push(pendingLeaf);
            this.leafs.push(pendingLeaf);
            this.options.treeGenerator.markLeafReached(this.options.depth, pendingLeaf);
        }));
        // step complete
        this.stepCount++;
    }
    isFinishedGrowing() {
        return (this.stepCount != 0 && this.oldBranches.size == 0);
    }
    getNewBranches() {
        return this.branches.slice(this.branchesLastLength);
    }
    getNewLeafs() {
        return this.reachedLeafs.slice(this.reachedLeafsLastLength);
    }
    getReachedLeafs() { return this.reachedLeafs; }
    getLeafs() { return this.leafs; }
    getBranches() { return this.branches; }
    getStepCount() { return this.stepCount; }
    get startingPoint() { return this.options.startingPoint; }
    get startingBranch() {
        var _a;
        return (_a = this.options.parentBranch) !== null && _a !== void 0 ? _a : null;
    }
    get branchLength() { return this.options.branchLength; }
}


/***/ }),

/***/ "./src/tree/treeGenerator.ts":
/*!***********************************!*\
  !*** ./src/tree/treeGenerator.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TreeGenerator: () => (/* binding */ TreeGenerator)
/* harmony export */ });
/* harmony import */ var _utils_canvasHelper_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/canvasHelper.js */ "./src/utils/canvasHelper.ts");
/* harmony import */ var _utils_random_mersenneTwisterAdapter_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/random/mersenneTwisterAdapter.js */ "./src/utils/random/mersenneTwisterAdapter.ts");
/* harmony import */ var _utils_animationHelper_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/animationHelper.js */ "./src/utils/animationHelper.ts");
/* harmony import */ var _treeParts_teePartGrower_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./treeParts/teePartGrower.js */ "./src/tree/treeParts/teePartGrower.ts");
/* harmony import */ var _treeParts_treePartLeaf_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./treeParts/treePartLeaf.js */ "./src/tree/treeParts/treePartLeaf.ts");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};






class TreeGenerator {
    constructor(options) {
        this.treeParts = [];
        this.branchToTreePart = new Map();
        this.prngs = {
            'GROW': new _utils_random_mersenneTwisterAdapter_js__WEBPACK_IMPORTED_MODULE_1__.MersenneTwisterAdapter(),
            'DRAW': new _utils_random_mersenneTwisterAdapter_js__WEBPACK_IMPORTED_MODULE_1__.MersenneTwisterAdapter()
        };
        this.destroyed = false;
        this.animationGroup = new _utils_animationHelper_js__WEBPACK_IMPORTED_MODULE_2__.AnimationGroup();
        this.serializedIdxKey = 0;
        this.serializedValues = {};
        this.isFinishedGrowing = false;
        this.tempCanvas = new Array(3).fill(null).map(x => _utils_canvasHelper_js__WEBPACK_IMPORTED_MODULE_0__.CanvasHelper.createTempCanvas(200, 200));
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
    shake() {
        const cw = this.getPRNG('DRAW').random() > 0.5;
        this.treeParts
            .filter(treePart => treePart instanceof _treeParts_treePartLeaf_js__WEBPACK_IMPORTED_MODULE_4__.TreePartLeaf)
            .forEach(treePart => {
            const shakeDelay = this.getPRNG('DRAW').floatInRange(0, 1200);
            this.animationGroup.addAnimation((0,_utils_animationHelper_js__WEBPACK_IMPORTED_MODULE_2__.setAnimationTimeout)({
                callback: () => treePart.shake(cw),
                time: shakeDelay
            }));
        });
    }
    grow() {
        return __awaiter(this, void 0, void 0, function* () {
            while (!this.destroyed && !this.isFinishedGrowing) {
                yield this.growStep();
                yield new Promise((resolve) => setTimeout(resolve, 0));
            }
        });
    }
    getTreePart(branch) {
        let retTreePart;
        if (this.branchToTreePart.has(branch)) {
            retTreePart = this.branchToTreePart.get(branch);
        }
        else if (branch.parent && this.branchToTreePart.has(branch.parent)) {
            retTreePart = this.branchToTreePart.get(branch.parent);
        }
        else {
            retTreePart = this.treeParts.find(treePart => (treePart instanceof _treeParts_teePartGrower_js__WEBPACK_IMPORTED_MODULE_3__.TreePartGrower) && treePart.branches.includes(branch));
            console.assert(retTreePart);
            retTreePart = retTreePart;
        }
        this.branchToTreePart.set(branch, retTreePart);
        return retTreePart;
    }
    createTransformContainerDiv() {
        const el = document.createElement('div');
        el.style.width = '100%';
        el.style.height = '100%';
        el.style.left = '0px';
        el.style.top = '0px';
        el.style.position = 'absolute';
        el.style.transformOrigin = 'top left';
        return el;
    }
    fadeAnimation() {
        this.treeParts.forEach((treePart) => {
            treePart.fadeIn();
        });
    }
    growAnimation() {
        this.containerTransformScaleTreeParts.style.transformOrigin = '50% 90%'; //90%, assuming vertical offset for a pot or other obscuring object
        this.animationGroup.addAnimation((0,_utils_animationHelper_js__WEBPACK_IMPORTED_MODULE_2__.startAnimation)({
            animate: (t) => {
                const endTime = 5000;
                const val = Math.max(0, Math.min(1, (t) / (endTime)));
                this.containerTransformScaleTreeParts.style.scale = val + '';
                if (val >= 1)
                    return _utils_animationHelper_js__WEBPACK_IMPORTED_MODULE_2__.AnimationState.DONE;
            }
        }));
    }
    destroy() {
        this.destroyed = true;
        this.containerBase.remove();
        this.animationGroup.cancel();
        window.removeEventListener('resize', this.resizeEventListener);
    }
    appendElement(div, groupedWithTreeParts = true) {
        if (groupedWithTreeParts)
            this.containerTransformScaleTreeParts.append(div);
        else
            this.containerBase.append(div);
    }
    resizeToContainer() {
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
        }
        else {
            // scale to Y
            this.containerTransformAlignment.style.top = '0px';
            this.containerTransformAlignment.style.left = '50%';
            this.containerTransformAlignment.style.transform = 'translate(-50%, 0)';
        }
    }
    onFinishedGrowing() {
        this.animationGroup.addAnimation((0,_utils_animationHelper_js__WEBPACK_IMPORTED_MODULE_2__.setAnimationInterval)({
            callback: () => this.shake(),
            time: 2000
        }));
        console.log(`Growing completed.`);
    }
    getRenderScaling() { var _a; return (_a = this.options.renderScaling) !== null && _a !== void 0 ? _a : 1; }
    growStep() {
        console.assert(!this.isFinishedGrowing);
        // check if all parts and therefore the tree are finished growing
        this.isFinishedGrowing = this.treeParts.every((treePart) => !(treePart instanceof _treeParts_teePartGrower_js__WEBPACK_IMPORTED_MODULE_3__.TreePartGrower) || treePart.isFinishedGrowing());
        if (this.isFinishedGrowing) {
            this.onFinishedGrowing();
        }
        // grow individual treeparts
        this.treeParts.forEach(treePart => {
            if (!(treePart instanceof _treeParts_teePartGrower_js__WEBPACK_IMPORTED_MODULE_3__.TreePartGrower)) {
                treePart.draw();
                return;
            }
            if (treePart.isFinishedGrowing())
                return;
            treePart.step();
            treePart.draw();
        });
    }
    getTempCanvas(idx) {
        const ctx = this.tempCanvas[idx];
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        return ctx;
    }
    getSerializedKey() {
        return this.serializedIdxKey++;
    }
    setSerializedValue(key, value) {
        this.serializedValues[key] = value;
    }
    getSerializedValue(key) {
        const value = this.serializedValues[key];
        console.assert(value !== undefined, `Serialized value attempting to be read back that doesn't exist. Are we in-sync?`);
        return value;
    }
    getSerializedJSON() {
        this.treeParts.forEach(treePart => {
            treePart.serialize();
        });
        return JSON.stringify(this.serializedValues);
    }
    isSerializedPlayback() {
        return (this.options.serializedJSON !== undefined);
    }
    getPRNG(type) {
        return this.prngs[type];
    }
    getAnimationGroup() {
        return this.animationGroup;
    }
}
TreeGenerator.REFERENCE_HEIGHT = 1024;


/***/ }),

/***/ "./src/tree/treeParts/staticTreePart.ts":
/*!**********************************************!*\
  !*** ./src/tree/treeParts/staticTreePart.ts ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   StaticTreePart: () => (/* binding */ StaticTreePart)
/* harmony export */ });
/* harmony import */ var _utils_linear_bbox__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/linear/bbox */ "./src/utils/linear/bbox.ts");
/* harmony import */ var _treePart__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./treePart */ "./src/tree/treeParts/treePart.ts");


class StaticTreePart extends _treePart__WEBPACK_IMPORTED_MODULE_1__.TreePart {
    static fromImage(options) {
        const staticTreePart = new StaticTreePart({
            treeGenerator: options.treeGenerator,
            image: options.image,
            bbox: new _utils_linear_bbox__WEBPACK_IMPORTED_MODULE_0__.BBox(options.pos.clone(), options.pos.clone().addInPlaceFromFloats(options.image.width, options.image.height)),
            origin: options.pos,
            zIndex: options.zIndex,
            growWithTree: false
        });
        return staticTreePart;
    }
    constructor(options) {
        super(options);
        this.drawn = false;
        this.staticOptions = options;
        this.imgLayer = this.createCanvasLayer();
    }
    drawLayers() {
        if (this.drawn)
            return;
        this.drawWithTransform(this.imgLayer.canvas, (ctx) => this.drawImgLayer(ctx));
        this.drawn = true;
    }
    drawImgLayer(ctx) {
        ctx.drawImage(this.staticOptions.image, this.options.bbox.minCorner.x, this.options.bbox.minCorner.y, this.options.bbox.width, this.options.bbox.height);
    }
}


/***/ }),

/***/ "./src/tree/treeParts/teePartGrower.ts":
/*!*********************************************!*\
  !*** ./src/tree/treeParts/teePartGrower.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TreePartGrower: () => (/* binding */ TreePartGrower)
/* harmony export */ });
/* harmony import */ var _utils_linear_bbox_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/linear/bbox.js */ "./src/utils/linear/bbox.ts");
/* harmony import */ var _treePart_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./treePart.js */ "./src/tree/treeParts/treePart.ts");


class TreePartGrower extends _treePart_js__WEBPACK_IMPORTED_MODULE_1__.TreePart {
    constructor(options) {
        super(options);
        this._startingBranchWidth = 0;
        this.finishedGrowing = false;
        this.growerOptions = options;
        this.clippedBounds = new _utils_linear_bbox_js__WEBPACK_IMPORTED_MODULE_0__.BBox(options.origin, options.origin);
        this.branchLayer = this.createCanvasLayer();
    }
    get startingBranchWidth() {
        return this._startingBranchWidth;
    }
    get branches() {
        return this.growerOptions.branchGrower.getBranches();
    }
    get leafs() {
        return this.growerOptions.branchGrower.getLeafs();
    }
    start() {
        var _a;
        const startingBranch = this.growerOptions.branchGrower.startingBranch;
        this._startingBranchWidth = (_a = startingBranch === null || startingBranch === void 0 ? void 0 : startingBranch.branchWidth) !== null && _a !== void 0 ? _a : 0;
        this.growerOptions.branchGrower.start();
    }
    step() {
        this.growerOptions.branchGrower.step();
        const newBranches = this.growerOptions.branchGrower.getNewBranches();
        if (this.growerOptions.branchGrower.isFinishedGrowing()) {
            this.onFinishedGrowing();
        }
    }
    isFinishedGrowing() {
        return this.growerOptions.branchGrower.isFinishedGrowing();
    }
    afterDrawLayers() {
        super.afterDrawLayers();
        if (this.finishedGrowing) {
            this.clipContainerDiv(this.clippedBounds);
        }
    }
    onFinishedGrowing() {
        console.assert(!this.finishedGrowing);
        this.finishedGrowing = true;
    }
    drawBranches(ctx) {
        const newBranches = this.growerOptions.branchGrower.getNewBranches();
        newBranches.forEach((branch) => branch.draw(ctx));
        newBranches.forEach((branch) => {
            this.clippedBounds.maximizeAgainstPoint(branch.position);
        });
    }
    drawLayers() {
        this.drawWithTransform(this.branchLayer.canvas, (ctx) => this.drawBranches(ctx));
    }
}


/***/ }),

/***/ "./src/tree/treeParts/treePart.ts":
/*!****************************************!*\
  !*** ./src/tree/treeParts/treePart.ts ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TreePart: () => (/* binding */ TreePart)
/* harmony export */ });
/* harmony import */ var _utils_animationHelper_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/animationHelper.js */ "./src/utils/animationHelper.ts");
/* harmony import */ var _utils_linear_vector2_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../utils/linear/vector2.js */ "./src/utils/linear/vector2.ts");


class TreePart {
    constructor(options) {
        this.baseAngle = 0;
        this.canvasLayers = [];
        this.options = options;
        this.containerDiv = document.createElement('div');
        this.containerDiv.style.pointerEvents = 'none';
        options.treeGenerator.appendElement(this.containerDiv, options.growWithTree);
        this.setContainerDivAttributes();
    }
    init() {
        const playingBack = this.options.treeGenerator.isSerializedPlayback();
        if (this.options.fadeIn && playingBack)
            this.fadeIn();
    }
    isTerminal() {
        return false;
    }
    fadeIn() {
        const animationGroup = this.options.treeGenerator.getAnimationGroup();
        // fade in leafs and branches
        this.canvasLayers.forEach(canvasLayer => {
            const FADE_END_TIME = 500;
            const canvas = canvasLayer.canvas;
            canvas.style.opacity = '0.00';
            animationGroup.addAnimation((0,_utils_animationHelper_js__WEBPACK_IMPORTED_MODULE_0__.startAnimation)({
                animate: (t) => {
                    const val = Math.min(1, Math.max(0, t / FADE_END_TIME));
                    canvas.style.opacity = val + '';
                    if (val >= 1)
                        return _utils_animationHelper_js__WEBPACK_IMPORTED_MODULE_0__.AnimationState.DONE;
                }
            }));
        });
    }
    createCanvasLayer() {
        const layerData = {
            uid: this.options.treeGenerator.getSerializedKey(),
            dirty: false,
            canvas: this.createCanvas()
        };
        if (this.options.treeGenerator.isSerializedPlayback()) {
            const ctx = layerData.canvas.getContext("2d");
            const image = new Image();
            const serializedValue = this.options.treeGenerator.getSerializedValue(layerData.uid);
            image.onload = () => {
                ctx.drawImage(image, 0, 0, ctx.canvas.width, ctx.canvas.height);
            };
            if (serializedValue)
                image.src = serializedValue;
        }
        this.canvasLayers.push(layerData);
        this.containerDiv.appendChild(layerData.canvas);
        return layerData;
    }
    createCanvas() {
        const renderScalar = this.options.treeGenerator.getRenderScaling();
        const canvas = document.createElement('canvas');
        canvas.setAttribute('width', (this.options.bbox.width + TreePart.CANVAS_BUFFER_MARGIN) * renderScalar + '');
        canvas.setAttribute('height', (this.options.bbox.height + TreePart.CANVAS_BUFFER_MARGIN) * renderScalar + '');
        canvas.style.pointerEvents = 'none';
        canvas.style.width = this.options.bbox.width + TreePart.CANVAS_BUFFER_MARGIN + 'px';
        canvas.style.height = this.options.bbox.height + TreePart.CANVAS_BUFFER_MARGIN + 'px';
        canvas.style.position = 'absolute';
        canvas.style.left = (TreePart.CANVAS_BUFFER_MARGIN * -0.5) + 'px';
        canvas.style.top = (TreePart.CANVAS_BUFFER_MARGIN * -0.5) + 'px';
        return canvas;
    }
    pixelsToRelative(x, y) {
        return new _utils_linear_vector2_js__WEBPACK_IMPORTED_MODULE_1__.Vector2((x - this.options.bbox.minCorner.x) / this.options.bbox.width, (y - this.options.bbox.minCorner.y) / this.options.bbox.height);
    }
    setContainerDivAttributes() {
        var _a, _b;
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
        this.containerDiv.style.zIndex = (((_a = this.options.zIndex) !== null && _a !== void 0 ? _a : 0) + (((_b = this.options.depth) !== null && _b !== void 0 ? _b : 0) / 100)) + '';
        this.containerDiv.style.boxSizing = 'border-box';
    }
    clipContainerDiv(targetBounds) {
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
    drawWithTransform(canvas, func) {
        const ctx = canvas.getContext('2d');
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
    afterDrawLayers() {
    }
    draw() {
        this.drawLayers();
        this.afterDrawLayers();
    }
    serialize() {
        this.canvasLayers.forEach((layer) => {
            this.options.treeGenerator.setSerializedValue(layer.uid, layer.canvas.toDataURL());
        });
    }
}
TreePart.CANVAS_BUFFER_MARGIN = 300;


/***/ }),

/***/ "./src/tree/treeParts/treePartInter.ts":
/*!*********************************************!*\
  !*** ./src/tree/treeParts/treePartInter.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TreePartInter: () => (/* binding */ TreePartInter)
/* harmony export */ });
/* harmony import */ var _teePartGrower_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./teePartGrower.js */ "./src/tree/treeParts/teePartGrower.ts");

class TreePartInter extends _teePartGrower_js__WEBPACK_IMPORTED_MODULE_0__.TreePartGrower {
    isTerminal() {
        return false;
    }
}


/***/ }),

/***/ "./src/tree/treeParts/treePartLeaf.ts":
/*!********************************************!*\
  !*** ./src/tree/treeParts/treePartLeaf.ts ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TreePartLeaf: () => (/* binding */ TreePartLeaf)
/* harmony export */ });
/* harmony import */ var _treeGenerator_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../treeGenerator.js */ "./src/tree/treeGenerator.ts");
/* harmony import */ var _utils_animationHelper_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../utils/animationHelper.js */ "./src/utils/animationHelper.ts");
/* harmony import */ var _utils_animation_functions_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../utils/animation/functions.js */ "./src/utils/animation/functions.ts");
/* harmony import */ var _utils_linear_vector2_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../utils/linear/vector2.js */ "./src/utils/linear/vector2.ts");
/* harmony import */ var _teePartGrower_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./teePartGrower.js */ "./src/tree/treeParts/teePartGrower.ts");





class TreePartLeaf extends _teePartGrower_js__WEBPACK_IMPORTED_MODULE_4__.TreePartGrower {
    constructor(options) {
        super(options);
        this.shakingAnimation = null;
        this.springAnimation = null;
        this.dragging = false;
        this.leafClusterDropping = false;
        this.layerToLeafs = new Map();
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
    isTerminal() {
        return true;
    }
    get droppedAllLeafs() {
        return (this.leafLayersToDrop.length == 0);
    }
    setupDrag() {
        const animationGroup = this.options.treeGenerator.getAnimationGroup();
        const FORCE_RELEASE_ANGLE_THRESHOLD = Math.PI * 0.75;
        const DRAG_DAMPNER_SCALAR = 0.7;
        let transformOriginClient;
        let currentDragPos;
        let dragStartPos;
        let currentAngle;
        let lastAngle = 0;
        let baseClientRect;
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
        const mouseMove = (e) => {
            currentDragPos = new _utils_linear_vector2_js__WEBPACK_IMPORTED_MODULE_3__.Vector2(e.clientX, e.clientY).subtract(transformOriginClient);
            const s = (dragStartPos.x > 1) ? 1 : -1;
            const currentDragAngle = Math.atan2(currentDragPos.y * s, currentDragPos.x * s); // angle from the current mouse position to transform origin
            const startDragAngle = Math.atan2(dragStartPos.y * s, dragStartPos.x * s); // angle from starting mouse position to transform origin
            const rawAngle = (currentDragAngle - startDragAngle + lastAngle); // calculated angle for the tree-part rotation to track mouse dragging
            // calculate dampened angle with S-shaped falloff as the user drags to the extremes of +/- side
            const dampenedAngle = (1 - Math.min(1, _utils_animation_functions_js__WEBPACK_IMPORTED_MODULE_2__.AnimationFunctions.sigmoid_0_1(Math.abs(rawAngle * DRAG_DAMPNER_SCALAR))));
            // if the user drags the tree-part past the rotation threshold, force release
            if (Math.abs(rawAngle) > FORCE_RELEASE_ANGLE_THRESHOLD) {
                mouseUp(e);
                return;
            }
            currentAngle = (rawAngle * dampenedAngle);
            this.containerDiv.style.transform = `rotate(${currentAngle + this.baseAngle}rad)`; // set CSS transform
        };
        const mouseDown = (e) => {
            var _a, _b;
            ;
            if (this.isLeafClusterDropping)
                return;
            (_a = this.shakingAnimation) === null || _a === void 0 ? void 0 : _a.cancel();
            this.shakingAnimation = null;
            (_b = this.springAnimation) === null || _b === void 0 ? void 0 : _b.cancel();
            this.springAnimation = null;
            baseClientRect = getBoundingClientRectWithoutTransform();
            // calculate starting drag position
            const startPosRelative = this.pixelsToRelative(this.growerOptions.branchGrower.startingPoint.x, this.growerOptions.branchGrower.startingPoint.y);
            transformOriginClient = new _utils_linear_vector2_js__WEBPACK_IMPORTED_MODULE_3__.Vector2(baseClientRect.x + startPosRelative.x * baseClientRect.width, baseClientRect.y + startPosRelative.y * baseClientRect.height);
            dragStartPos = new _utils_linear_vector2_js__WEBPACK_IMPORTED_MODULE_3__.Vector2(e.clientX, e.clientY).subtract(transformOriginClient);
            this.containerDiv.removeEventListener('mousedown', mouseDown);
            document.addEventListener('mousemove', mouseMove);
            document.addEventListener('mouseup', mouseUp);
            this.dragging = true;
        };
        const mouseUp = (e) => {
            lastAngle = currentAngle;
            this.dragging = false;
            startSpringAnimation();
            this.containerDiv.addEventListener('mousedown', mouseDown);
            document.removeEventListener('mousemove', mouseMove);
            document.removeEventListener('mouseup', mouseUp);
        };
        const startSpringAnimation = () => {
            let firstT = null;
            let velocity = -currentAngle * 5;
            let lastT = 0;
            this.springAnimation = animationGroup.addAnimation((0,_utils_animationHelper_js__WEBPACK_IMPORTED_MODULE_1__.startAnimation)({
                animate: (t) => {
                    firstT !== null && firstT !== void 0 ? firstT : (firstT = t);
                    lastT !== null && lastT !== void 0 ? lastT : (lastT = t);
                    const totalT = (t - firstT) / 1000;
                    const deltaT = totalT - lastT;
                    lastT = totalT;
                    const acceleration = -(100) * currentAngle;
                    const dampner = Math.min(1, _utils_animation_functions_js__WEBPACK_IMPORTED_MODULE_2__.AnimationFunctions.sigmoid_0_1(totalT * 0.2));
                    velocity += acceleration * deltaT;
                    velocity *= (1 - dampner);
                    currentAngle += (velocity * deltaT);
                    lastAngle = currentAngle;
                    this.containerDiv.style.transform = `rotate(${currentAngle + this.baseAngle}rad)`;
                    if (Math.abs(velocity) < 0.1 && Math.abs(acceleration) < 0.1) {
                        this.dropLeafCluster();
                        return _utils_animationHelper_js__WEBPACK_IMPORTED_MODULE_1__.AnimationState.DONE;
                    }
                },
                onDone: () => {
                    this.springAnimation = null;
                }
            }));
        };
        this.containerDiv.addEventListener('mousedown', mouseDown);
    }
    setupClick() {
        this.containerDiv.addEventListener('click', (e) => {
            if (!this.isFinishedGrowing() || !this.isTerminal())
                return;
            this.dropRandomLeafs(1 + Math.floor(Math.random() * (3 + 1)));
        });
    }
    shake(cw) {
        if (this.shakingAnimation)
            return;
        if (this.dragging || this.springAnimation || this.leafClusterDropping)
            return;
        const animationGroup = this.options.treeGenerator.getAnimationGroup();
        const SHAKE_TIME = this.options.treeGenerator.getPRNG('DRAW').floatInRange(4000, 7000);
        const MAX_ANGLE = this.options.treeGenerator.getPRNG('DRAW').floatInRange(1, 3);
        this.shakingAnimation = animationGroup.addAnimation((0,_utils_animationHelper_js__WEBPACK_IMPORTED_MODULE_1__.startAnimation)({
            animate: (t) => {
                const targetAngle = MAX_ANGLE * (cw ? 1 : -1);
                this.containerDiv.style.transform = `rotate(${this.baseAngle + targetAngle * Math.pow(Math.sin(Math.PI * 2 * (t / SHAKE_TIME)), 3)}deg)`;
                if (t >= SHAKE_TIME)
                    return _utils_animationHelper_js__WEBPACK_IMPORTED_MODULE_1__.AnimationState.DONE;
            },
            onDone: () => {
                this.shakingAnimation = null;
            }
        }));
    }
    dropRandomLeafs(leafCount) {
        if (this.droppedAllLeafs)
            return;
        const prng = this.options.treeGenerator.getPRNG('DRAW');
        for (let i = 0; i < leafCount; i++) {
            const layerIdx = prng.intInRange(0, this.leafLayersToDrop.length - 1);
            const layer = this.leafLayersToDrop[layerIdx];
            const layerLeafs = this.layerToLeafs.get(layer);
            if (!layerLeafs.length)
                continue;
            const leafIdx = prng.intInRange(0, layerLeafs.length - 1);
            const leaf = layerLeafs[leafIdx];
            this.dropLeaf(leaf);
        }
    }
    dropLeafCluster() {
        if (this.isLeafClusterDropping)
            return;
        if (!this.leafLayersToDrop.length)
            return;
        const leafLayer = this.leafLayersToDrop.pop();
        const leafsInLayer = this.layerToLeafs.get(leafLayer);
        leafsInLayer.forEach((leaf) => {
            const dropDelay = this.options.treeGenerator.getPRNG('DRAW').intInRange(0, 3000);
            this.dropLeaf(leaf, dropDelay);
        });
        const animationGroup = this.options.treeGenerator.getAnimationGroup();
        animationGroup.addAnimation((0,_utils_animationHelper_js__WEBPACK_IMPORTED_MODULE_1__.startAnimation)({
            animate: (t) => {
                const opacity = 1.0 - Math.min(1.0, t / 500);
                leafLayer.canvas.style.opacity = opacity + '';
                if (opacity < 0)
                    return _utils_animationHelper_js__WEBPACK_IMPORTED_MODULE_1__.AnimationState.DONE;
            }
        }));
        animationGroup.addAnimation((0,_utils_animationHelper_js__WEBPACK_IMPORTED_MODULE_1__.setAnimationTimeout)({
            callback: () => {
                this.isLeafClusterDropping = false;
            },
            time: 8000
        }));
        this.isLeafClusterDropping = true;
    }
    dropLeaf(leaf, dropDelay) {
        console.assert(this.isFinishedGrowing());
        const animationGroup = this.options.treeGenerator.getAnimationGroup();
        const leafElement = leaf.createElement();
        leafElement.style.zIndex = this.containerDiv.style.zIndex;
        const startY = parseFloat(leafElement.style.top);
        const speed = this.options.treeGenerator.getPRNG('DRAW').floatInRange(200, 300);
        const FADE_TIME_SECONDS = 1;
        const FADE_END_Y = (_treeGenerator_js__WEBPACK_IMPORTED_MODULE_0__.TreeGenerator.REFERENCE_HEIGHT);
        const FADE_START_Y = FADE_END_Y - (speed / FADE_TIME_SECONDS);
        animationGroup.addAnimation((0,_utils_animationHelper_js__WEBPACK_IMPORTED_MODULE_1__.setAnimationTimeout)({
            callback: () => {
                animationGroup.addAnimation((0,_utils_animationHelper_js__WEBPACK_IMPORTED_MODULE_1__.startAnimation)({
                    animate: (t) => {
                        const newY = (startY + (t / 1000) * speed);
                        if (newY > FADE_END_Y) {
                            leafElement.remove();
                            return _utils_animationHelper_js__WEBPACK_IMPORTED_MODULE_1__.AnimationState.DONE;
                        }
                        leafElement.style.opacity = Math.max(0, (FADE_END_Y - newY) / (FADE_END_Y - FADE_START_Y)) + '';
                        leafElement.style.top = newY + 'px';
                    }
                }));
            },
            time: dropDelay !== null && dropDelay !== void 0 ? dropDelay : 0
        }));
        animationGroup.addAnimation((0,_utils_animationHelper_js__WEBPACK_IMPORTED_MODULE_1__.startAnimation)({
            animate: (t) => {
                const opacity = Math.min(1.0, (t / 200));
                leafElement.style.opacity = opacity + '';
                if (opacity >= 1.0)
                    return _utils_animationHelper_js__WEBPACK_IMPORTED_MODULE_1__.AnimationState.DONE;
            }
        }));
        this.containerDiv.after(leafElement);
    }
    drawLayers() {
        super.drawLayers();
        const randomLeafClusterLayer = this.leafClusterLayers[this.options.treeGenerator.getPRNG('GROW').intInRange(0, TreePartLeaf.LEAF_LAYER_COUNT - 1)];
        this.drawWithTransform(randomLeafClusterLayer.canvas, (ctx) => this.drawLeafs(ctx, randomLeafClusterLayer));
    }
    drawLeafs(ctx, layer) {
        if (!this.isTerminal())
            return;
        const newLeafs = this.growerOptions.branchGrower.getNewLeafs();
        const rotatedLeafCount = this.options.treeGenerator.getPRNG('GROW').intInRange(1, 2);
        newLeafs.forEach((leaf) => {
            var _a, _b;
            (_a = this.layerToLeafs.get(layer)) === null || _a === void 0 ? void 0 : _a.push(leaf);
            leaf.draw(ctx);
            for (let i = 0; i < rotatedLeafCount; i++) {
                const rotatedLeaf = leaf.clone();
                (_b = this.layerToLeafs.get(layer)) === null || _b === void 0 ? void 0 : _b.push(rotatedLeaf);
                rotatedLeaf.draw(ctx);
            }
        });
    }
    onFinishedGrowing() {
        super.onFinishedGrowing();
        this.updatePointerProperty();
    }
    updatePointerProperty() {
        if (!this.leafClusterDropping && this.isFinishedGrowing()) {
            this.containerDiv.style.pointerEvents = 'auto';
        }
        else {
            this.containerDiv.style.pointerEvents = 'none';
        }
    }
    get isLeafClusterDropping() {
        return this.leafClusterDropping;
    }
    set isLeafClusterDropping(val) {
        this.leafClusterDropping = val;
        this.updatePointerProperty();
    }
}
TreePartLeaf.LEAF_LAYER_COUNT = 5;


/***/ }),

/***/ "./src/tree/types/bonsai/bonsaiGenerator.ts":
/*!**************************************************!*\
  !*** ./src/tree/types/bonsai/bonsaiGenerator.ts ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BonsaiGenerator: () => (/* binding */ BonsaiGenerator),
/* harmony export */   BonsaiSapceColonizer: () => (/* binding */ BonsaiSapceColonizer)
/* harmony export */ });
/* harmony import */ var _treeGenerator_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../treeGenerator.js */ "./src/tree/treeGenerator.ts");
/* harmony import */ var _utils_linear_vector2_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../utils/linear/vector2.js */ "./src/utils/linear/vector2.ts");
/* harmony import */ var _utils_linear_bbox_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../utils/linear/bbox.js */ "./src/utils/linear/bbox.ts");
/* harmony import */ var _spaceColonizer_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../spaceColonizer.js */ "./src/tree/spaceColonizer.ts");
/* harmony import */ var _utils_canvasHelper_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../utils/canvasHelper.js */ "./src/utils/canvasHelper.ts");
/* harmony import */ var _utils_metaballs_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../utils/metaballs.js */ "./src/utils/metaballs.ts");
/* harmony import */ var _utils_animationHelper_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../../utils/animationHelper.js */ "./src/utils/animationHelper.ts");
/* harmony import */ var _treeParts_treePartLeaf_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../treeParts/treePartLeaf.js */ "./src/tree/treeParts/treePartLeaf.ts");
/* harmony import */ var _treeParts_treePartInter_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../treeParts/treePartInter.js */ "./src/tree/treeParts/treePartInter.ts");
/* harmony import */ var _treeParts_staticTreePart_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../treeParts/staticTreePart.js */ "./src/tree/treeParts/staticTreePart.ts");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};










class BonsaiSapceColonizer extends _spaceColonizer_js__WEBPACK_IMPORTED_MODULE_3__.SpaceColonizer {
    biasGrowthVector(growthVector) {
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
class BonsaiGenerator extends _treeGenerator_js__WEBPACK_IMPORTED_MODULE_0__.TreeGenerator {
    static loadResources() {
        return __awaiter(this, void 0, void 0, function* () {
            yield Promise.all([
                (() => __awaiter(this, void 0, void 0, function* () { return BonsaiGenerator.potFrontImage = yield _utils_canvasHelper_js__WEBPACK_IMPORTED_MODULE_4__.CanvasHelper.loadImage('resources/bonsai/images/pot_front.png'); }))(),
                (() => __awaiter(this, void 0, void 0, function* () { return BonsaiGenerator.potBackImage = yield _utils_canvasHelper_js__WEBPACK_IMPORTED_MODULE_4__.CanvasHelper.loadImage('resources/bonsai/images/pot_back.png'); }))(),
                (() => __awaiter(this, void 0, void 0, function* () { return BonsaiGenerator.mainBranchImage = yield _utils_canvasHelper_js__WEBPACK_IMPORTED_MODULE_4__.CanvasHelper.loadImage('resources/bonsai/images/bark_texture.jpg'); }))(),
                (() => __awaiter(this, void 0, void 0, function* () { return BonsaiGenerator.leafTextureImage = yield _utils_canvasHelper_js__WEBPACK_IMPORTED_MODULE_4__.CanvasHelper.loadImage('resources/bonsai/images/leaf_texture.jpg'); }))(),
                (() => __awaiter(this, void 0, void 0, function* () { return BonsaiGenerator.leafStencilImage = yield _utils_canvasHelper_js__WEBPACK_IMPORTED_MODULE_4__.CanvasHelper.loadImage('resources/bonsai/images/leaf_stencil.png'); }))(),
                (() => __awaiter(this, void 0, void 0, function* () { return BonsaiGenerator.leafOutlineImage = yield _utils_canvasHelper_js__WEBPACK_IMPORTED_MODULE_4__.CanvasHelper.loadImage('resources/bonsai/images/leaf_outline.png'); }))()
            ]);
        });
    }
    constructor(options) {
        super(options);
        // setup patterns
        const dummyCanvas = _utils_canvasHelper_js__WEBPACK_IMPORTED_MODULE_4__.CanvasHelper.createTempCanvas(1, 1);
        this.mainBranchPattern = dummyCanvas.createPattern(BonsaiGenerator.mainBranchImage, 'repeat');
        this.leafTexturePattern = dummyCanvas.createPattern(BonsaiGenerator.leafTextureImage, 'repeat');
        this.leafOutlineImage = BonsaiGenerator.leafOutlineImage.cloneNode();
        this.leafStencilImage = BonsaiGenerator.leafStencilImage.cloneNode();
        this.generatePotLayer();
        this.generateTrunkLayer();
    }
    destroy() {
        super.destroy();
    }
    onFinishedGrowing() {
        super.onFinishedGrowing();
        this.setupAnimations();
    }
    dropLeafs() {
        const leafTreeParts = this.treeParts.filter(treePart => treePart.isTerminal());
        const randomTreePart = leafTreeParts[Math.floor(leafTreeParts.length * Math.random())];
        randomTreePart.dropRandomLeafs(1 + Math.floor(Math.random() * (3 + 1)));
    }
    setupAnimations() {
        console.assert(this.isFinishedGrowing);
        this.getAnimationGroup().addAnimation((0,_utils_animationHelper_js__WEBPACK_IMPORTED_MODULE_6__.setAnimationInterval)({
            callback: () => {
                this.dropLeafs();
            },
            time: 5 * 1000
        }));
    }
    getOutlineThickness() { return 1; }
    getBranchTexturePattern(growth, textureName) {
        switch (textureName) {
            default:
                this.mainBranchPattern.setTransform(new DOMMatrix().translateSelf(growth.x, growth.y).scaleSelf(0.2, 0.2));
                return this.mainBranchPattern;
        }
    }
    getLeafStencilTexture() {
        return this.leafStencilImage;
    }
    getLeafOutlineTexture() {
        return this.leafOutlineImage;
    }
    getLeafTexturePattern(randX, randY) {
        this.leafTexturePattern.setTransform(new DOMMatrix().translateSelf(randX !== null && randX !== void 0 ? randX : this.getPRNG('DRAW').floatInRange(0, 400), randY !== null && randY !== void 0 ? randY : this.getPRNG('DRAW').floatInRange(0, 400)).scaleSelf(0.3, 0.3));
        return this.leafTexturePattern;
    }
    markLeafReached(depth, leaf) {
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
    generatePotLayer() {
        const potPosition = new _utils_linear_vector2_js__WEBPACK_IMPORTED_MODULE_1__.Vector2(_treeGenerator_js__WEBPACK_IMPORTED_MODULE_0__.TreeGenerator.REFERENCE_HEIGHT / 2 - BonsaiGenerator.potBackImage.width / 2, _treeGenerator_js__WEBPACK_IMPORTED_MODULE_0__.TreeGenerator.REFERENCE_HEIGHT - BonsaiGenerator.potBackImage.height);
        this.treeParts.push(_treeParts_staticTreePart_js__WEBPACK_IMPORTED_MODULE_9__.StaticTreePart.fromImage({
            treeGenerator: this,
            pos: potPosition,
            image: BonsaiGenerator.potBackImage,
            zIndex: -1
        }));
        this.treeParts.push(_treeParts_staticTreePart_js__WEBPACK_IMPORTED_MODULE_9__.StaticTreePart.fromImage({
            treeGenerator: this,
            pos: potPosition,
            image: BonsaiGenerator.potFrontImage,
            zIndex: 1
        }));
    }
    generateTrunkLayer() {
        const bbox = new _utils_linear_bbox_js__WEBPACK_IMPORTED_MODULE_2__.BBox(new _utils_linear_vector2_js__WEBPACK_IMPORTED_MODULE_1__.Vector2(0, 0), new _utils_linear_vector2_js__WEBPACK_IMPORTED_MODULE_1__.Vector2(_treeGenerator_js__WEBPACK_IMPORTED_MODULE_0__.TreeGenerator.REFERENCE_HEIGHT, _treeGenerator_js__WEBPACK_IMPORTED_MODULE_0__.TreeGenerator.REFERENCE_HEIGHT));
        const branchGrower = new BonsaiSapceColonizer({
            treeGenerator: this,
            depth: 0,
            startingPoint: BonsaiGenerator.GROW_ORIGIN,
            bbox: bbox,
            leafCount: 7,
            leafAttractionDistance: _treeGenerator_js__WEBPACK_IMPORTED_MODULE_0__.TreeGenerator.REFERENCE_HEIGHT * 0.75,
            spawnPoints: new Array(10).fill(null).map(x => new _utils_linear_vector2_js__WEBPACK_IMPORTED_MODULE_1__.Vector2(this.getPRNG('GROW').floatInRange(0, _treeGenerator_js__WEBPACK_IMPORTED_MODULE_0__.TreeGenerator.REFERENCE_HEIGHT - 100), this.getPRNG('GROW').floatInRange(_treeGenerator_js__WEBPACK_IMPORTED_MODULE_0__.TreeGenerator.REFERENCE_HEIGHT * 0.4, _treeGenerator_js__WEBPACK_IMPORTED_MODULE_0__.TreeGenerator.REFERENCE_HEIGHT * 0.6))),
            branchLength: 7
        });
        const newTreePart = new _treeParts_treePartInter_js__WEBPACK_IMPORTED_MODULE_8__.TreePartInter({
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
    generateSplitLayer(depth, leaf) {
        if (!leaf.parent)
            return console.assert(false);
        const EXTRUDE_RANGE = [100, 200];
        const EXTRUDE_ANGLLE_MINDIFF = Math.PI * 0.1;
        const EXTRUDE_ANGLE_MAXDIFF = Math.PI * 0.25;
        const prng = this.getPRNG('GROW');
        const branch = leaf.parent;
        const position = branch.position;
        const extrudeDir = position.subtract(BonsaiGenerator.GROW_ORIGIN).normalize().randomizeAngle(EXTRUDE_ANGLLE_MINDIFF, EXTRUDE_ANGLE_MAXDIFF, prng.random());
        const extrudeLength = prng.floatInRange(EXTRUDE_RANGE[0], EXTRUDE_RANGE[1]);
        const extrudePosition = position.add(extrudeDir.scale(extrudeLength));
        const partSize = 300;
        const partBounds = new _utils_linear_vector2_js__WEBPACK_IMPORTED_MODULE_1__.Vector2(partSize, partSize);
        const bbox = _utils_linear_bbox_js__WEBPACK_IMPORTED_MODULE_2__.BBox.fromPositionAndSize(new _utils_linear_vector2_js__WEBPACK_IMPORTED_MODULE_1__.Vector2(position.x - partBounds.x * 0.5, position.y - partBounds.y), partBounds);
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
        const newTreePart = new _treeParts_treePartInter_js__WEBPACK_IMPORTED_MODULE_8__.TreePartInter({
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
    generateLeafLayer(depth, leaf) {
        if (!leaf.parent)
            return console.assert(false);
        const prng = this.getPRNG('GROW');
        const branch = leaf.parent;
        const position = branch.position;
        const bboxScalar = prng.floatInRange(1, 1.2);
        const bbox = new _utils_linear_bbox_js__WEBPACK_IMPORTED_MODULE_2__.BBox(position.subtract(new _utils_linear_vector2_js__WEBPACK_IMPORTED_MODULE_1__.Vector2(250 * bboxScalar, 150 * bboxScalar)), position.add(new _utils_linear_vector2_js__WEBPACK_IMPORTED_MODULE_1__.Vector2(250 * bboxScalar, 30)));
        const leafCount = 200 * Math.pow(bboxScalar, 2);
        const leafAttractionDistance = prng.intInRange(50, 100) * bboxScalar;
        const surfaceScalar = bbox.width / 500;
        const metaballSurface = new _utils_metaballs_js__WEBPACK_IMPORTED_MODULE_5__.MetaballSurface({
            threshold: 1,
            points: [
                { x: bbox.minCorner.x + bbox.width * 0.2, y: position.y, r: [30, 60], d: [0, 30] },
                { x: bbox.minCorner.x + bbox.width * 0.4, y: position.y, r: [30, 60], d: [0, 30] },
                { x: bbox.minCorner.x + bbox.width * 0.6, y: position.y, r: [30, 60], d: [0, 30] },
                { x: bbox.minCorner.x + bbox.width * 0.8, y: position.y, r: [30, 60], d: [0, 30] },
                { x: bbox.minCorner.x + bbox.width * 0.5, y: position.y, r: [20, 30], d: [0, 30] },
            ].map(basePos => {
                const offsetPos = new _utils_linear_vector2_js__WEBPACK_IMPORTED_MODULE_1__.Vector2(basePos.x, basePos.y);
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
        const newTreePart = new _treeParts_treePartLeaf_js__WEBPACK_IMPORTED_MODULE_7__.TreePartLeaf({
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
    getBranchWidth(depth, branch) {
        const treePart = this.getTreePart(branch);
        const depthParams = BonsaiGenerator.treeWidthParams[depth];
        const depthStartY = depth == 0 ? depthParams.minStartWidth : Math.max(depthParams.minStartWidth, treePart.startingBranchWidth);
        const width = depthParams.widthF(depthStartY, branch.growthLocal.y);
        return Math.max(depthParams.targetWidth, width);
    }
}
BonsaiGenerator.GROW_ORIGIN = new _utils_linear_vector2_js__WEBPACK_IMPORTED_MODULE_1__.Vector2(_treeGenerator_js__WEBPACK_IMPORTED_MODULE_0__.TreeGenerator.REFERENCE_HEIGHT * 0.5, _treeGenerator_js__WEBPACK_IMPORTED_MODULE_0__.TreeGenerator.REFERENCE_HEIGHT - 100);
BonsaiGenerator.treeWidthParams = [
    {
        minStartWidth: 140,
        targetWidth: 30,
        widthF: (startGrowth, growthLocal) => startGrowth + growthLocal * -0.17
    },
    {
        minStartWidth: 0,
        targetWidth: 15,
        widthF: (startGrowth, growthLocal) => startGrowth + growthLocal * -0.15
    },
    {
        minStartWidth: 0,
        targetWidth: 7,
        widthF: (startGrowth, growthLocal) => startGrowth + growthLocal * -0.15
    },
    {
        minStartWidth: 0,
        targetWidth: 3,
        widthF: (startGrowth, growthLocal) => startGrowth + growthLocal * -1.5,
    }
];


/***/ }),

/***/ "./src/utils/animation/functions.ts":
/*!******************************************!*\
  !*** ./src/utils/animation/functions.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AnimationFunctions: () => (/* binding */ AnimationFunctions)
/* harmony export */ });
var AnimationFunctions;
(function (AnimationFunctions) {
    AnimationFunctions.sigmoid_0_1 = (t) => 2 * (-0.5 + 1 / (1 + Math.exp(-t)));
})(AnimationFunctions || (AnimationFunctions = {}));


/***/ }),

/***/ "./src/utils/animationHelper.ts":
/*!**************************************!*\
  !*** ./src/utils/animationHelper.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Animation: () => (/* binding */ Animation),
/* harmony export */   AnimationGroup: () => (/* binding */ AnimationGroup),
/* harmony export */   AnimationState: () => (/* binding */ AnimationState),
/* harmony export */   setAnimationInterval: () => (/* binding */ setAnimationInterval),
/* harmony export */   setAnimationTimeout: () => (/* binding */ setAnimationTimeout),
/* harmony export */   startAnimation: () => (/* binding */ startAnimation)
/* harmony export */ });
var AnimationManager;
(function (AnimationManager) {
    let totalHiddenTime = 0;
    let hiddenStartTime = 0;
    let animationExplicitPaused = false;
    let animationPlay = true;
    setupPauseListeners();
    function refreshPlayingStatus() {
        const animationPlayNow = (document.visibilityState == 'visible' &&
            !animationExplicitPaused);
        if (animationPlay == animationPlayNow) {
            // unchanged
            return;
        }
        else if (animationPlayNow) {
            // start
            totalHiddenTime += (performance.now() - hiddenStartTime);
        }
        else {
            // stop
            hiddenStartTime = performance.now();
        }
        animationPlay = animationPlayNow;
        AnimationManager.onEvent.dispatchEvent(new CustomEvent(animationPlay ? 'start' : 'stop', {
            detail: { playing: false }
        }));
    }
    function setupPauseListeners() {
        document.addEventListener('DOMContentLoaded', () => refreshPlayingStatus());
        document.addEventListener('visibilitychange', refreshPlayingStatus);
        document.addEventListener('keydown', (e) => {
            if (e.key != 'p' || e.repeat)
                return;
            animationExplicitPaused = true;
            refreshPlayingStatus();
        });
        document.addEventListener('keyup', (e) => {
            if ((e.key != 'p'))
                return;
            animationExplicitPaused = false;
            refreshPlayingStatus();
        });
    }
    function getTotalPlayTime() {
        return performance.now() - getTotalPausedTime();
    }
    AnimationManager.getTotalPlayTime = getTotalPlayTime;
    function getTotalPausedTime() {
        if (animationPlay) {
            return totalHiddenTime;
        }
        else {
            return totalHiddenTime + (performance.now() - hiddenStartTime);
        }
    }
    AnimationManager.getTotalPausedTime = getTotalPausedTime;
    function isPlaying() {
        return animationPlay;
    }
    AnimationManager.isPlaying = isPlaying;
    AnimationManager.onEvent = new EventTarget();
})(AnimationManager || (AnimationManager = {}));
class VisibleTimer {
    constructor(options) {
        this.timeout = null;
        this.deltaStartT = 0;
        this.deltaT = 0;
        this.options = options;
        this.deltaStartT = performance.now();
        AnimationManager.onEvent.addEventListener('start', this.animationStartListener = () => this.start());
        AnimationManager.onEvent.addEventListener('stop', this.animationStopListener = () => this.stop());
        if (AnimationManager.isPlaying())
            this.start();
    }
    stop() {
        this.deltaT += (performance.now() - this.deltaStartT);
        clearTimeout(this.timeout);
    }
    start() {
        this.deltaStartT = performance.now();
        const timeRemaining = (this.options.time - this.deltaT);
        this.timeout = setTimeout(() => this.fire(), timeRemaining);
    }
    fire() {
        this.options.onFire();
        if (this.options.repeat) {
            this.deltaT = 0;
            this.start();
        }
        else {
            this.dispose();
        }
    }
    ;
    dispose() {
        clearTimeout(this.timeout);
        AnimationManager.onEvent.removeEventListener('start', this.animationStartListener);
        AnimationManager.onEvent.removeEventListener('stop', this.animationStopListener);
    }
}
class AnimationGroup {
    constructor() {
        this.tracks = [];
    }
    addAnimation(track) {
        this.tracks.push(track);
        return track;
    }
    cancel() {
        this.tracks.forEach((track) => track.cancel());
    }
}
class Animation {
    constructor() {
        this.cancelled = false;
    }
    cancel() {
        this.cancelled = true;
    }
    get isCancelled() { return this.cancelled; }
}
var AnimationState;
(function (AnimationState) {
    AnimationState[AnimationState["ANIMATING"] = 0] = "ANIMATING";
    AnimationState[AnimationState["DONE"] = 1] = "DONE";
})(AnimationState || (AnimationState = {}));
;
function startAnimation(options) {
    var _a;
    const animationTrack = new Animation();
    const startTime = AnimationManager.getTotalPlayTime();
    (_a = options.onBefore) === null || _a === void 0 ? void 0 : _a.call(options);
    const func = () => {
        if (animationTrack.isCancelled)
            return;
        requestAnimationFrame(() => {
            var _a;
            const relativeTime = AnimationManager.getTotalPlayTime() - startTime;
            const continueAnimation = options.animate(relativeTime);
            switch (continueAnimation) {
                case AnimationState.DONE:
                    (_a = options.onDone) === null || _a === void 0 ? void 0 : _a.call(options);
                    break;
                case AnimationState.ANIMATING:
                default:
                    func();
                    break;
            }
        });
    };
    func();
    return animationTrack;
}
function setAnimationInterval(options) {
    const animationTrack = new Animation();
    const timer = new VisibleTimer({
        onFire: () => {
            if (animationTrack.isCancelled) {
                timer.dispose();
                return;
            }
            options.callback();
        },
        time: options.time,
        repeat: true
    });
    return animationTrack;
}
function setAnimationTimeout(options) {
    const animationTrack = new Animation();
    const timer = new VisibleTimer({
        onFire: () => {
            if (animationTrack.isCancelled) {
                timer.dispose();
                return;
            }
            options.callback();
        },
        time: options.time,
        repeat: false
    });
    return animationTrack;
}


/***/ }),

/***/ "./src/utils/canvasHelper.ts":
/*!***********************************!*\
  !*** ./src/utils/canvasHelper.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CanvasHelper: () => (/* binding */ CanvasHelper)
/* harmony export */ });
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var CanvasHelper;
(function (CanvasHelper) {
    const cachedCanvases = new Map();
    function getTempCanvas(size) {
        let canvas = cachedCanvases.get(size);
        if (!canvas) {
            canvas = createTempCanvas(size, size);
            cachedCanvases.set(size, canvas);
        }
        canvas.clearRect(0, 0, size, size);
        return canvas;
    }
    CanvasHelper.getTempCanvas = getTempCanvas;
    function createTempCanvas(width, height) {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        context.imageSmoothingEnabled = false;
        return context;
    }
    CanvasHelper.createTempCanvas = createTempCanvas;
    function loadImage(url, imgElement) {
        return __awaiter(this, void 0, void 0, function* () {
            let img = imgElement || new Image();
            let instantLoadFromCache = false;
            img.onload = () => instantLoadFromCache = true;
            img.src = url;
            if (instantLoadFromCache)
                return img;
            yield new Promise(resolve => img.onload = resolve);
            return img;
        });
    }
    CanvasHelper.loadImage = loadImage;
    const cachedImageBorders = new Map(); //createTempCanvas()
    const offsets = [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]];
    function drawImageBorder(img, ctx, thickness) {
        let borderCtx = cachedImageBorders.get(img);
        if (!borderCtx) {
            borderCtx = createTempCanvas(img.width, img.height);
            // draw the image in 8 compass offsets with scaling
            for (const [xOffset, yOffset] of offsets) {
                borderCtx.drawImage(img, xOffset * thickness, yOffset * thickness);
            }
            // fill splatted area with black to create the border region
            borderCtx.globalCompositeOperation = 'source-in';
            borderCtx.fillStyle = 'black';
            borderCtx.fillRect(0, 0, img.width, img.height);
            cachedImageBorders.set(img, borderCtx);
        }
        ctx.drawImage(borderCtx.canvas, 0, 0);
        ctx.drawImage(img, 0, 0);
    }
    CanvasHelper.drawImageBorder = drawImageBorder;
    // const cachedImageWithBorder: Map<CanvasImageSource, CanvasRenderingContext2D> = new Map();
    // export function drawImageWithBorder(img: CanvasImageSource, imgSize: number, ctx: CanvasRenderingContext2D | null, thickness: number): CanvasRenderingContext2D {
    //   if (cachedImageWithBorder.has(img))
    //     return <CanvasRenderingContext2D>cachedImageWithBorder.get(img);
    //   const tmpCtx = createTempCanvas(imgSize, imgSize);
    //   {
    //     drawImageBorder(img, imgSize, tmpCtx, thickness);
    //     ctx.drawImage(img, 0, 0);
    //   }
    //   cachedImageWithBorder.set(img, ctx);
    //   return ctx;
    // }
})(CanvasHelper || (CanvasHelper = {}));


/***/ }),

/***/ "./src/utils/linear/bbox.ts":
/*!**********************************!*\
  !*** ./src/utils/linear/bbox.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BBox: () => (/* binding */ BBox)
/* harmony export */ });
/* harmony import */ var _vector2__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./vector2 */ "./src/utils/linear/vector2.ts");

class BBox {
    constructor(minCorner, maxCorner) {
        this.minCorner = minCorner.clone();
        this.maxCorner = maxCorner.clone();
    }
    static fromPositionAndSize(minCorner, size) {
        const newMinCorner = minCorner;
        const newMaxCorner = minCorner.add(size);
        return new BBox(newMinCorner, newMaxCorner);
    }
    intersects(bbox) { return BBox.intersects(this, bbox); }
    get width() { return this.maxCorner.x - this.minCorner.x; }
    get height() { return this.maxCorner.y - this.minCorner.y; }
    get center() { return this.minCorner.add(this.size.scale(0.5)); }
    get size() { return new _vector2__WEBPACK_IMPORTED_MODULE_0__.Vector2(this.width, this.height); }
    maximizeAgainstPoint(pos) {
        this.minCorner.x = Math.min(this.minCorner.x, pos.x);
        this.minCorner.y = Math.min(this.minCorner.y, pos.y);
        this.maxCorner.x = Math.max(this.maxCorner.x, pos.x);
        this.maxCorner.y = Math.max(this.maxCorner.y, pos.y);
    }
    clone() {
        return new BBox(this.minCorner.clone(), this.maxCorner.clone());
    }
    setZero() {
        this.minCorner = _vector2__WEBPACK_IMPORTED_MODULE_0__.Vector2.Zero;
        this.maxCorner = _vector2__WEBPACK_IMPORTED_MODULE_0__.Vector2.Zero;
    }
    static intersects(bboxA, bboxB) {
        return !((bboxA.minCorner.x > bboxB.maxCorner.x) || (bboxA.maxCorner.x < bboxB.minCorner.x) ||
            (bboxA.minCorner.y > bboxB.maxCorner.y) || (bboxA.maxCorner.y < bboxB.minCorner.y));
    }
}


/***/ }),

/***/ "./src/utils/linear/vector2.ts":
/*!*************************************!*\
  !*** ./src/utils/linear/vector2.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Vector2: () => (/* binding */ Vector2)
/* harmony export */ });
class Vector2 {
    constructor(x = 0, y = 0) { this._x = x; this._y = y; }
    copyFrom(otherVector) { this._x = otherVector.x; this._y = otherVector.y; return this; }
    clone() { return new Vector2(this._x, this._y); }
    add(otherVector) { return this.clone().addInPlace(otherVector); }
    subtract(otherVector) { return this.clone().subtractInPlace(otherVector); }
    scale(scalar) { return this.clone().scaleInPlace(scalar); }
    elementMultiply(x, y) { return new Vector2(this._x * x, this._y * y); }
    dot(otherVec) { return (this._x * otherVec.x + this._y * otherVec.y); }
    addInPlaceFromFloats(x, y) { this._x += x; this._y += y; return this; }
    subtractInPlaceFromFloats(x, y) { this._x -= x; this._y -= y; return this; }
    addFromFloats(x, y) { return new Vector2(this._x + x, this._y + y); }
    addInPlace(otherVector) { this._x += otherVector._x; this._y += otherVector._y; return this; }
    subtractInPlace(otherVector) { this._x -= otherVector._x; this._y -= otherVector._y; return this; }
    scaleInPlace(scalar) { this._x *= scalar; this._y *= scalar; return this; }
    normalize() { const length = this.length(); this._x /= length; this._y /= length; return this; }
    equals(otherVec) { return (this._x == otherVec.x && this._y == otherVec.y); }
    ;
    normal() { return new Vector2(-this._y, this._x); }
    floor() { return new Vector2(Math.floor(this._x), Math.floor(this._y)); }
    length() { return Math.sqrt(this._x * this._x + this._y * this._y); }
    randomizeOffsetInPlace(maxDist, random) {
        random = random !== null && random !== void 0 ? random : Math.random();
        const angle = random * Math.PI * 2;
        this._x += Math.cos(angle) * maxDist;
        this._y += Math.sin(angle) * maxDist;
        return this;
    }
    get angle() { return Math.atan2(this._y, this._x); }
    randomizeAngle(minAngleDiff, maxAngleDiff, random) {
        random = random !== null && random !== void 0 ? random : Math.random();
        const length = this.length();
        const dir = random > 0.5;
        const currentAngle = Math.atan2(this._y, this._x);
        const newAngle = currentAngle + (random > 0.5 ? 1 : -1) * (minAngleDiff + (maxAngleDiff - minAngleDiff) * random);
        return new Vector2(Math.cos(newAngle), Math.sin(newAngle)).scale(length);
    }
    static fromAngle(angle) {
        return new Vector2(Math.cos(angle), Math.sin(angle));
    }
    static get One() { return new Vector2(1.0, 1.0); }
    static get Zero() { return new Vector2(0.0, 0.0); }
    get x() { return this._x; }
    set x(x) { this._x = x; }
    get y() { return this._y; }
    set y(y) { this._y = y; }
}


/***/ }),

/***/ "./src/utils/metaballs.ts":
/*!********************************!*\
  !*** ./src/utils/metaballs.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MetaballSurface: () => (/* binding */ MetaballSurface)
/* harmony export */ });
;
class MetaballSurface {
    constructor(options) {
        var _a;
        this.threshold = (_a = options.threshold) !== null && _a !== void 0 ? _a : 1;
        this.points = options.points;
    }
    spaceOccupied(x, y) {
        const val = this.points.reduce((sum, point) => sum + this.getAdditiveMetaballValue(point, x, y), 0);
        return val > this.threshold;
    }
    generateCanvasOutline(ctx) {
        const imageData = ctx.createImageData(ctx.canvas.width, ctx.canvas.height);
        const data = imageData.data;
        let x = 0, y = 0;
        for (let i = 0; i < data.length; i += 4) {
            data[i + 0] = this.spaceOccupied(x, y) ? 255 : 0;
            data[i + 3] = 255;
            if (++x == ctx.canvas.width) {
                x = 0;
                y++;
            }
        }
        ctx.putImageData(imageData, 0, 0);
    }
    getAdditiveMetaballValue(point, x, y) {
        return (point.r * point.r) / (((x - point.x) * (x - point.x)) + ((y - point.y) * (y - point.y)));
    }
}


/***/ }),

/***/ "./src/utils/random/mersenneTwister.ts":
/*!*********************************************!*\
  !*** ./src/utils/random/mersenneTwister.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MersenneTwister: () => (/* binding */ MersenneTwister)
/* harmony export */ });
/*
 * TypeScript port by Thilo Planz
 *
 * https://gist.github.com/thiloplanz/6abf04f957197e9e3912
 */
/*
  I've wrapped Makoto Matsumoto and Takuji Nishimura's code in a namespace
  so it's better encapsulated. Now you can have multiple random number generators
  and they won't stomp all over eachother's state.
  
  If you want to use this as a substitute for Math.random(), use the random()
  method like so:
  
  var m = new MersenneTwister();
  var randomNumber = m.random();
  
  You can also call the other genrand_{foo}() methods on the instance.
  If you want to use a specific seed in order to get a repeatable random
  sequence, pass an integer into the constructor:
  var m = new MersenneTwister(123);
  and that will always produce the same random sequence.
  Sean McCullough (banksean@gmail.com)
*/
/*
   A C-program for MT19937, with initialization improved 2002/1/26.
   Coded by Takuji Nishimura and Makoto Matsumoto.
 
   Before using, initialize the state by using init_genrand(seed)
   or init_by_array(init_key, key_length).
 
   Copyright (C) 1997 - 2002, Makoto Matsumoto and Takuji Nishimura,
   All rights reserved.
 
   Redistribution and use in source and binary forms, with or without
   modification, are permitted provided that the following conditions
   are met:
 
     1. Redistributions of source code must retain the above copyright
        notice, this list of conditions and the following disclaimer.
 
     2. Redistributions in binary form must reproduce the above copyright
        notice, this list of conditions and the following disclaimer in the
        documentation and/or other materials provided with the distribution.
 
     3. The names of its contributors may not be used to endorse or promote
        products derived from this software without specific prior written
        permission.
 
   THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
   "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
   LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
   A PARTICULAR PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL THE COPYRIGHT OWNER OR
   CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
   EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
   PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
   PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
   LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
   NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
   SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 
 
   Any feedback is very welcome.
   http://www.math.sci.hiroshima-u.ac.jp/~m-mat/MT/emt.html
   email: m-mat @ math.sci.hiroshima-u.ac.jp (remove space)
*/
class MersenneTwister {
    constructor(seed) {
        /* Period parameters */
        this.N = 624;
        this.M = 397;
        this.MATRIX_A = 0x9908b0df; /* constant vector a */
        this.UPPER_MASK = 0x80000000; /* most significant w-r bits */
        this.LOWER_MASK = 0x7fffffff; /* least significant r bits */
        this.mt = new Array(this.N); /* the array for the state vector */
        this.mti = this.N + 1; /* mti==N+1 means mt[N] is not initialized */
        if (seed == undefined) {
            seed = new Date().getTime();
        }
        this.init_genrand(seed);
    }
    /* initializes mt[N] with a seed */
    init_genrand(s) {
        this.mt[0] = s >>> 0;
        for (this.mti = 1; this.mti < this.N; this.mti++) {
            s = this.mt[this.mti - 1] ^ (this.mt[this.mti - 1] >>> 30);
            this.mt[this.mti] = (((((s & 0xffff0000) >>> 16) * 1812433253) << 16) + (s & 0x0000ffff) * 1812433253)
                + this.mti;
            /* See Knuth TAOCP Vol2. 3rd Ed. P.106 for multiplier. */
            /* In the previous versions, MSBs of the seed affect   */
            /* only MSBs of the array mt[].                        */
            /* 2002/01/09 modified by Makoto Matsumoto             */
            this.mt[this.mti] >>>= 0;
            /* for >32 bit machines */
        }
    }
    /* initialize by an array with array-length */
    /* init_key is the array for initializing keys */
    /* key_length is its length */
    /* slight change for C++, 2004/2/26 */
    init_by_array(init_key, key_length) {
        var i, j, k;
        this.init_genrand(19650218);
        i = 1;
        j = 0;
        k = (this.N > key_length ? this.N : key_length);
        for (; k; k--) {
            var s = this.mt[i - 1] ^ (this.mt[i - 1] >>> 30);
            this.mt[i] = (this.mt[i] ^ (((((s & 0xffff0000) >>> 16) * 1664525) << 16) + ((s & 0x0000ffff) * 1664525)))
                + init_key[j] + j; /* non linear */
            this.mt[i] >>>= 0; /* for WORDSIZE > 32 machines */
            i++;
            j++;
            if (i >= this.N) {
                this.mt[0] = this.mt[this.N - 1];
                i = 1;
            }
            if (j >= key_length)
                j = 0;
        }
        for (k = this.N - 1; k; k--) {
            var s = this.mt[i - 1] ^ (this.mt[i - 1] >>> 30);
            this.mt[i] = (this.mt[i] ^ (((((s & 0xffff0000) >>> 16) * 1566083941) << 16) + (s & 0x0000ffff) * 1566083941))
                - i; /* non linear */
            this.mt[i] >>>= 0; /* for WORDSIZE > 32 machines */
            i++;
            if (i >= this.N) {
                this.mt[0] = this.mt[this.N - 1];
                i = 1;
            }
        }
        this.mt[0] = 0x80000000; /* MSB is 1; assuring non-zero initial array */
    }
    /* generates a random number on [0,0xffffffff]-interval */
    genrand_int32() {
        var y;
        var mag01 = new Array(0x0, this.MATRIX_A);
        /* mag01[x] = x * MATRIX_A  for x=0,1 */
        if (this.mti >= this.N) { /* generate N words at one time */
            var kk;
            if (this.mti == this.N + 1) /* if init_genrand() has not been called, */
                this.init_genrand(5489); /* a default initial seed is used */
            for (kk = 0; kk < this.N - this.M; kk++) {
                y = (this.mt[kk] & this.UPPER_MASK) | (this.mt[kk + 1] & this.LOWER_MASK);
                this.mt[kk] = this.mt[kk + this.M] ^ (y >>> 1) ^ mag01[y & 0x1];
            }
            for (; kk < this.N - 1; kk++) {
                y = (this.mt[kk] & this.UPPER_MASK) | (this.mt[kk + 1] & this.LOWER_MASK);
                this.mt[kk] = this.mt[kk + (this.M - this.N)] ^ (y >>> 1) ^ mag01[y & 0x1];
            }
            y = (this.mt[this.N - 1] & this.UPPER_MASK) | (this.mt[0] & this.LOWER_MASK);
            this.mt[this.N - 1] = this.mt[this.M - 1] ^ (y >>> 1) ^ mag01[y & 0x1];
            this.mti = 0;
        }
        y = this.mt[this.mti++];
        /* Tempering */
        y ^= (y >>> 11);
        y ^= (y << 7) & 0x9d2c5680;
        y ^= (y << 15) & 0xefc60000;
        y ^= (y >>> 18);
        return y >>> 0;
    }
    /* generates a random number on [0,0x7fffffff]-interval */
    genrand_int31() {
        return (this.genrand_int32() >>> 1);
    }
    /* generates a random number on [0,1]-real-interval */
    genrand_real1() {
        return this.genrand_int32() * (1.0 / 4294967295.0);
        /* divided by 2^32-1 */
    }
    /* generates a random number on [0,1)-real-interval */
    random() {
        return this.genrand_int32() * (1.0 / 4294967296.0);
        /* divided by 2^32 */
    }
    /* generates a random number on (0,1)-real-interval */
    genrand_real3() {
        return (this.genrand_int32() + 0.5) * (1.0 / 4294967296.0);
        /* divided by 2^32 */
    }
    /* generates a random number on [0,1) with 53-bit resolution*/
    genrand_res53() {
        var a = this.genrand_int32() >>> 5, b = this.genrand_int32() >>> 6;
        return (a * 67108864.0 + b) * (1.0 / 9007199254740992.0);
    }
}


/***/ }),

/***/ "./src/utils/random/mersenneTwisterAdapter.ts":
/*!****************************************************!*\
  !*** ./src/utils/random/mersenneTwisterAdapter.ts ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MersenneTwisterAdapter: () => (/* binding */ MersenneTwisterAdapter)
/* harmony export */ });
/* harmony import */ var _mersenneTwister__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./mersenneTwister */ "./src/utils/random/mersenneTwister.ts");

class MersenneTwisterAdapter {
    init(seed) {
        this.mersenneTwister = new _mersenneTwister__WEBPACK_IMPORTED_MODULE_0__.MersenneTwister(seed);
    }
    random() {
        console.assert(this.mersenneTwister);
        const twister = this.mersenneTwister;
        return twister.random();
    }
    floatInRange(min, max) {
        console.assert(this.mersenneTwister);
        const twister = this.mersenneTwister;
        return min + twister.random() * (max - min);
    }
    intInRange(min, max) {
        console.assert(this.mersenneTwister);
        const twister = this.mersenneTwister;
        return Math.floor(min + twister.random() * (max - min + 1));
    }
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _tree_types_bonsai_bonsaiGenerator_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./tree/types/bonsai/bonsaiGenerator.js */ "./src/tree/types/bonsai/bonsaiGenerator.ts");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};

function download(filename, text) {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}
function cyrb53(str, seed = 0) {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}
;
const toTitleCase = (str) => str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
(() => __awaiter(void 0, void 0, void 0, function* () {
    const STARTING_SEED = 9644;
    const STARTING_TEXT = "ZENITUDE";
    yield _tree_types_bonsai_bonsaiGenerator_js__WEBPACK_IMPORTED_MODULE_0__.BonsaiGenerator.loadResources();
    let bonsaiGenerator;
    let seed = null;
    const btnSerialize = document.querySelector('#btnSerialize');
    const btnRegenerate = document.querySelector('#btnRegenerate');
    const inpSeedText = document.querySelector('#inpSeedText');
    const txtTreeTitle = document.querySelector('#txtTreeTitle');
    const treeContainer = document.querySelector('#treeGeneratorContainer');
    let first = true;
    function generateBonsai() {
        return __awaiter(this, void 0, void 0, function* () {
            // calculate numeric seed
            if (first) {
                inpSeedText.value = STARTING_TEXT;
            }
            if (inpSeedText.value) {
                // from entered string
                seed = cyrb53(inpSeedText.value.toUpperCase());
                if (first)
                    seed = STARTING_SEED;
                txtTreeTitle.style.visibility = 'visible';
                txtTreeTitle.innerHTML = `"${toTitleCase(inpSeedText.value)}"`;
            }
            else {
                // random
                txtTreeTitle.style.visibility = 'hidden';
                seed = Math.floor(Math.random() * 10000);
            }
            // determine if serialized json present
            const serializedJSON = first ?
                yield ((yield fetch(`./resources/bonsai/serialized/tree_serialized_${seed}.json`)).json()) :
                null;
            // set the rendering scale
            const resolutionScalar = (Math.min(window.screen.height, window.screen.width) / _tree_types_bonsai_bonsaiGenerator_js__WEBPACK_IMPORTED_MODULE_0__.BonsaiGenerator.REFERENCE_HEIGHT) * window.devicePixelRatio;
            // destroy existing bonsai if present
            if (bonsaiGenerator)
                bonsaiGenerator.destroy();
            // create new bonsai
            console.log(`Starting generation with seed: ${seed}`);
            bonsaiGenerator = new _tree_types_bonsai_bonsaiGenerator_js__WEBPACK_IMPORTED_MODULE_0__.BonsaiGenerator({
                parentContainer: treeContainer,
                debugging: false,
                renderScaling: resolutionScalar,
                seed: seed,
                serializedJSON: serializedJSON !== null && serializedJSON !== void 0 ? serializedJSON : undefined
            });
            first = false;
            // start growth
            bonsaiGenerator.grow();
        });
    }
    btnSerialize.addEventListener('click', () => {
        const serializedJSON = bonsaiGenerator.getSerializedJSON();
        download(`tree_serialized_${seed}.json`, serializedJSON);
    });
    btnRegenerate.addEventListener('click', () => {
        bonsaiGenerator === null || bonsaiGenerator === void 0 ? void 0 : bonsaiGenerator.destroy();
        generateBonsai();
    });
    generateBonsai();
}))();

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LENBQUMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQzFFLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUM7WUFDcEUsQ0FBQztZQUNELE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7Z0JBQzNCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUMxRSxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO1lBQy9FLENBQUM7WUFDRCxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDN0UsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMs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LENBQUMsR0FBRyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7UUFDdkMsRUFBRSxHQUFHLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdkIsRUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUNwQyxFQUFFLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQ3RDLENBQUM7SUFDRCxFQUFFLEdBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDOUMsRUFBRSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQzlDLEVBQUUsR0FBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQztJQUM5QyxFQUFFLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDOUMsT0FBTyxVQUFVLEdBQUcsQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7QUFDcEQsQ0FBQztBQUFBLENBQUM7QUFFRixNQUFNLFdBQVcsR0FBRyxDQUFDLEdBQVcsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMs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LFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFO1FBQ3hDLE1BQU0sY0FBYyxHQUFHLGVBQWUsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQzNELFFBQVEsQ0FBQyxtQkFBbUIsSUFBSSxPQUFPLEVBQUUsY0FBYyxDQUFDLENBQUM7SUFDN0QsQ0FBQyxDQUFDLENBQUM7SUFFSCxhQUFhLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRTtRQUN6QyxlQUFlLGFBQWYsZUFBZSx1QkFBZixlQUFlLENBQUUsT0FBTyxFQUFFLENBQUM7UUFDM0IsY0FBYyxFQUFFLENBQUM7SUFDckIsQ0FBQyxDQUFDLENBQUM7SUFFSCxjQUFjLEVBQUUsQ0FBQztBQUNyQixDQUFDLEVBQUMsRUFBRSxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vdHJlZWdlbmVyYXRvci8uL3NyYy90cmVlL2NvbXBvbmVudHMvYnJhbmNoLnRzIiwid2VicGFjazovL3RyZWVnZW5lcmF0b3IvLi9zcmMvdHJlZS9jb21wb25lbnRzL2xlYWYudHMiLCJ3ZWJwYWNrOi8vdHJlZWdlbmVyYXRvci8uL3NyYy90cmVlL3NwYWNlQ29sb25pemVyLnRzIiwid2VicGFjazovL3RyZWVnZW5lcmF0b3IvLi9zcmMvdHJlZS90cmVlR2VuZXJhdG9yLnRzIiwid2VicGFjazovL3RyZWVnZW5lcmF0b3IvLi9zcmMvdHJlZS90cmVlUGFydHMvc3RhdGljVHJlZVBhcnQudHMiLCJ3ZWJwYWNrOi8vdHJlZWdlbmVyYXRvci8uL3NyYy90cmVlL3RyZWVQYXJ0cy90ZWVQYXJ0R3Jvd2VyLnRzIiwid2VicGFjazovL3RyZWVnZW5lcmF0b3IvLi9zcmMvdHJlZS90cmVlUGFydHMvdHJlZVBhcnQudHMiLCJ3ZWJwYWNrOi8vdHJlZWdlbmVyYXRvci8uL3NyYy90cmVlL3RyZWVQYXJ0cy90cmVlUGFydEludGVyLnRzIiwid2VicGFjazovL3RyZWVnZW5lcmF0b3IvLi9zcmMvdHJlZS90cmVlUGFydHMvdHJlZVBhcnRMZWFmLnRzIiwid2VicGFjazovL3RyZWVnZW5lcmF0b3IvLi9zcmMvdHJlZS90eXBlcy9ib25zYWkvYm9uc2FpR2VuZXJhdG9yLnRzIiwid2VicGFjazovL3RyZWVnZW5lcmF0b3IvLi9zcmMvdXRpbHMvYW5pbWF0aW9uL2Z1bmN0aW9ucy50cyIsIndlYnBhY2s6Ly90cmVlZ2VuZXJhdG9yLy4vc3JjL3V0aWxzL2FuaW1hdGlvbkhlbHBlci50cyIsIndlYnBhY2s6Ly90cmVlZ2VuZXJhdG9yLy4vc3JjL3V0aWxzL2NhbnZhc0hlbHBlci50cyIsIndlYnBhY2s6Ly90cmVlZ2VuZXJhdG9yLy4vc3JjL3V0aWxzL2xpbmVhci9iYm94LnRzIiwid2VicGFjazovL3RyZWVnZW5lcmF0b3IvLi9zcmMvdXRpbHMvbGluZWFyL3ZlY3RvcjIudHMiLCJ3ZWJwYWNrOi8vdHJlZWdlbmVyYXRvci8uL3NyYy91dGlscy9tZXRhYmFsbHMudHMiLCJ3ZWJwYWNrOi8vdHJlZWdlbmVyYXRvci8uL3NyYy91dGlscy9yYW5kb20vbWVyc2VubmVUd2lzdGVyLnRzIiwid2VicGFjazovL3RyZWVnZW5lcmF0b3IvLi9zcmMvdXRpbHMvcmFuZG9tL21lcnNlbm5lVHdpc3RlckFkYXB0ZXIudHMiLCJ3ZWJwYWNrOi8vdHJlZWdlbmVyYXRvci93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly90cmVlZ2VuZXJhdG9yL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly90cmVlZ2VuZXJhdG9yL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vdHJlZWdlbmVyYXRvci93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL3RyZWVnZW5lcmF0b3IvLi9zcmMvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSVRyZWVHZW5lcmF0b3JQYXJhbWV0ZXJzLCBUcmVlR2VuZXJhdG9yLCBUcmVlR2VuZXJhdG9yT3B0aW9ucyB9IGZyb20gXCIuLi90cmVlR2VuZXJhdG9yLmpzXCI7XG5pbXBvcnQgeyBWZWN0b3IyIH0gZnJvbSBcIi4uLy4uL3V0aWxzL2xpbmVhci92ZWN0b3IyLmpzXCI7XG5pbXBvcnQgeyBCQm94IH0gZnJvbSBcIi4uLy4uL3V0aWxzL2xpbmVhci9iYm94LmpzXCI7XG5pbXBvcnQgeyBMZWFmIH0gZnJvbSBcIi4vbGVhZi5qc1wiO1xuXG5leHBvcnQgaW50ZXJmYWNlIEJyYW5jaE9wdGlvbnMge1xuICAgIHRyZWVHZW5lcmF0b3I6IElUcmVlR2VuZXJhdG9yUGFyYW1ldGVycyxcbiAgICBwb3NpdGlvbjogVmVjdG9yMjtcbiAgICBkZXB0aDogbnVtYmVyO1xuICAgIGJyYW5jaExlbmd0aDogbnVtYmVyO1xuXG4gICAgcGFyZW50PzogQnJhbmNoO1xuICAgIGZpcnN0QnJhbmNoPzogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGNsYXNzIEJyYW5jaCB7XG4gICAgcHVibGljIGNvbnN0cnVjdG9yKG9wdGlvbnM6IEJyYW5jaE9wdGlvbnMpIHtcbiAgICAgICAgLy8gc2V0IGRlZmF1bHQgb3B0aW9uc1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgICAgICB0aGlzLl9wYXJlbnQgPSBvcHRpb25zLnBhcmVudCA/PyBudWxsO1xuICAgICAgICB0aGlzLmRlcHRoID0gb3B0aW9ucy5kZXB0aDtcbiAgICAgICAgdGhpcy5fcG9zaXRpb24gPSBvcHRpb25zLnBvc2l0aW9uO1xuXG4gICAgICAgIC8vIHNldCB0ZXh0dXJlIG9mZnNldFxuICAgICAgICBpZiAodGhpcy5fcGFyZW50KSB7XG4gICAgICAgICAgICBjb25zdCB4b2Zmc2V0ID0gb3B0aW9ucy50cmVlR2VuZXJhdG9yLmdldFBSTkcoJ0dST1cnKS5mbG9hdEluUmFuZ2UoMCwgMTAyNCk7XG4gICAgICAgICAgICBjb25zdCBsZW5ndGggPSAodGhpcy5fcG9zaXRpb24uc3VidHJhY3QodGhpcy5fcGFyZW50LnBvc2l0aW9uKSkubGVuZ3RoKCk7XG4gICAgICAgICAgICB0aGlzLl9ncm93dGhUb3RhbC55ID0gdGhpcy5fcGFyZW50Lmdyb3d0aFRvdGFsLnkgKyBsZW5ndGg7XG4gICAgICAgICAgICBpZiAoIW9wdGlvbnMuZmlyc3RCcmFuY2gpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9ncm93dGhMb2NhbC54ID0geG9mZnNldDtcbiAgICAgICAgICAgICAgICB0aGlzLl9ncm93dGhMb2NhbC55ID0gdGhpcy5fcGFyZW50Ll9ncm93dGhMb2NhbC55ICsgbGVuZ3RoO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9ncm93dGhMb2NhbC54ID0gMDtcbiAgICAgICAgICAgICAgICB0aGlzLl9ncm93dGhMb2NhbC55ID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBjcmVhdGVDaGlsZEJyYW5jaChvcHRpb25zOiBCcmFuY2hPcHRpb25zKTogQnJhbmNoIHtcbiAgICAgICAgb3B0aW9ucy5wYXJlbnQgPSB0aGlzO1xuICAgICAgICB0aGlzLl9jaGlsZENvdW50Kys7XG4gICAgICAgIHJldHVybiB0aGlzLmNyZWF0ZUluc3RhbmNlKG9wdGlvbnMpO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBjcmVhdGVJbnN0YW5jZShvcHRpb25zOiBCcmFuY2hPcHRpb25zKTogQnJhbmNoIHtcbiAgICAgICAgcmV0dXJuIG5ldyBCcmFuY2gob3B0aW9ucyk7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBhbmdsZSgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJlbnQgPyBNYXRoLmF0YW4yKHRoaXMucG9zaXRpb24ueCAtIHRoaXMucGFyZW50LnBvc2l0aW9uLngsIHRoaXMucGFyZW50LnBvc2l0aW9uLnkgLSB0aGlzLnBvc2l0aW9uLnkpIDogTmFOO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgZGlyZWN0aW9uKCk6IFZlY3RvcjIge1xuICAgICAgICByZXR1cm4gKCF0aGlzLnBhcmVudCA/IFZlY3RvcjIuWmVybyA6IHRoaXMucG9zaXRpb24uc3VidHJhY3QodGhpcy5wYXJlbnQucG9zaXRpb24pLm5vcm1hbGl6ZSgpKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IGJyYW5jaFdpZHRoKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnMudHJlZUdlbmVyYXRvci5nZXRCcmFuY2hXaWR0aCh0aGlzLmRlcHRoLCB0aGlzKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IGJyYW5jaEhlaWdodCgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJlbnQ/LnBvc2l0aW9uLnN1YnRyYWN0KHRoaXMucG9zaXRpb24pLmxlbmd0aCgpIHx8IDA7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBwYXJlbnQoKTogQnJhbmNoIHwgbnVsbCB7IHJldHVybiB0aGlzLl9wYXJlbnQ7IH1cblxuICAgIHB1YmxpYyBnZXQgZ3Jvd3RoVG90YWwoKTogVmVjdG9yMiB7IHJldHVybiB0aGlzLl9ncm93dGhUb3RhbDsgfVxuXG4gICAgcHVibGljIGdldCBncm93dGhMb2NhbCgpOiBWZWN0b3IyIHsgcmV0dXJuIHRoaXMuX2dyb3d0aExvY2FsOyB9XG5cbiAgICBwdWJsaWMgZ2V0IHBvc2l0aW9uKCk6IFZlY3RvcjIgeyByZXR1cm4gdGhpcy5fcG9zaXRpb247IH1cblxuICAgIHB1YmxpYyBnZXQgY2hpbGRDb3VudCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5fY2hpbGRDb3VudDsgfVxuXG4gICAgcHVibGljIGRpc3RhbmNlVG8obGVhZjogTGVhZikgeyByZXR1cm4gbGVhZi5wb3NpdGlvbi5zdWJ0cmFjdCh0aGlzLnBvc2l0aW9uKS5sZW5ndGgoKTsgfVxuXG4gICAgcHVibGljIGRyYXcoY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIGRyYXdCb3JkZXI6IGJvb2xlYW4gPSB0cnVlKSB7XG4gICAgICAgIGlmICghdGhpcy5wYXJlbnQpXG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgaWYodGhpcy5vcHRpb25zLnRyZWVHZW5lcmF0b3IuaXNTZXJpYWxpemVkUGxheWJhY2soKSlcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICBjb25zb2xlLmFzc2VydCghdGhpcy5kcmF3bik7XG4gICAgICAgIHRoaXMuZHJhd24gPSB0cnVlO1xuXG4gICAgICAgIGNvbnN0IGJyYW5jaFdpZHRoOiBudW1iZXIgPSB0aGlzLmJyYW5jaFdpZHRoO1xuICAgICAgICBjb25zdCBicmFuY2hIZWlnaHQ6IG51bWJlciA9IHRoaXMucGFyZW50LnBvc2l0aW9uLnN1YnRyYWN0KHRoaXMucG9zaXRpb24pLmxlbmd0aCgpO1xuXG4gICAgICAgIGlmICgoYnJhbmNoV2lkdGggLyBicmFuY2hIZWlnaHQpID4gMilcbiAgICAgICAgICAgIHRoaXMuZHJhd1dpdGhDaXJjbGUoY3R4LCBkcmF3Qm9yZGVyKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGhpcy5kcmF3V2l0aFJlY3RhbmdsZShjdHgsIGRyYXdCb3JkZXIpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZHJhd1dpdGhSZWN0YW5nbGUoY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIGRyYXdCb3JkZXI6IGJvb2xlYW4pIHtcbiAgICAgICAgaWYgKCF0aGlzLnBhcmVudClcbiAgICAgICAgICAgIHJldHVybiBjb25zb2xlLmFzc2VydChmYWxzZSk7XG5cbiAgICAgICAgY29uc3QgY2lyY2xlUmFkaXVzOiBudW1iZXIgPSB0aGlzLmJyYW5jaFdpZHRoIC8gMjtcbiAgICAgICAgY29uc3QgdGVtcENhbnZhcyA9IHRoaXMub3B0aW9ucy50cmVlR2VuZXJhdG9yLmdldFRlbXBDYW52YXMoMCk7XG5cbiAgICAgICAgLy8gIGRyYXcgYnJhbmNoIHRvIHRlbXBvcmFyeSBjYW52YXNcbiAgICAgICAgdGVtcENhbnZhcy5zYXZlKCk7XG4gICAgICAgIHtcbiAgICAgICAgICAgIC8vICAgIHByZXBhcmUgdGVtcG9yYXJ5IGNhbnZhc1xuICAgICAgICAgICAgdGVtcENhbnZhcy5maWxsU3R5bGUgPSAnYmxhY2snO1xuXG4gICAgICAgICAgICAvLyAgICBkcmF3IHJlY3RhbmdsZSBtYXNrXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGVtcENhbnZhcy5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgICAgICB0ZW1wQ2FudmFzLnJlY3QoMCwgMCwgdGhpcy5icmFuY2hXaWR0aCwgdGhpcy5icmFuY2hIZWlnaHQgKyAyKTtcbiAgICAgICAgICAgICAgICB0ZW1wQ2FudmFzLmZpbGwoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gICAgZHJhdyBzZW1pLWNpcmNsZSBtYXNrIHRvIGNhcCBvZmYgc3RhcnQgKHByZXZlbnQgZ2FwcyBiZXR3ZWVuIGJyYW5jaGVzKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRlbXBDYW52YXMuc2F2ZSgpO1xuICAgICAgICAgICAgICAgIHRlbXBDYW52YXMudHJhbnNsYXRlKGNpcmNsZVJhZGl1cywgdGhpcy5icmFuY2hIZWlnaHQpO1xuICAgICAgICAgICAgICAgIHRlbXBDYW52YXMuYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICAgICAgdGVtcENhbnZhcy5hcmMoMCwgMCwgY2lyY2xlUmFkaXVzLCAwLCBNYXRoLlBJKTtcbiAgICAgICAgICAgICAgICBjb25zdCBncmFkaWVudCA9IHRlbXBDYW52YXMuY3JlYXRlTGluZWFyR3JhZGllbnQoMCwgMCwgMCwgY2lyY2xlUmFkaXVzKTtcbiAgICAgICAgICAgICAgICBncmFkaWVudC5hZGRDb2xvclN0b3AoMC4zLCAncmdiYSgwLDAsMCwxKScpO1xuICAgICAgICAgICAgICAgIGdyYWRpZW50LmFkZENvbG9yU3RvcCgxLCAncmdiYSgwLDAsMCwwKScpO1xuICAgICAgICAgICAgICAgIHRlbXBDYW52YXMuZmlsbFN0eWxlID0gZ3JhZGllbnQ7XG4gICAgICAgICAgICAgICAgdGVtcENhbnZhcy5maWxsKCk7XG4gICAgICAgICAgICAgICAgdGVtcENhbnZhcy5yZXN0b3JlKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGZpbGwgJ21hc2tlZCcgYXJlYSB3aXRoIGJyYW5jaCB0ZXh0dXJlXG4gICAgICAgICAgICB0ZW1wQ2FudmFzLmZpbHRlciA9ICdub25lJztcbiAgICAgICAgICAgIHRlbXBDYW52YXMuZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ3NvdXJjZS1pbic7XG4gICAgICAgICAgICB0aGlzLmRyYXdUZXh0dXJlKHRoaXMub3B0aW9ucy50cmVlR2VuZXJhdG9yLmdldFRlbXBDYW52YXMoMSksIHRlbXBDYW52YXMpO1xuICAgICAgICAgICAgdGVtcENhbnZhcy5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnc291cmNlLW91dCc7XG4gICAgICAgIH1cbiAgICAgICAgdGVtcENhbnZhcy5yZXN0b3JlKCk7XG5cbiAgICAgICAgLy8gY29weSByZW5kZXJlZCBicmFuY2ggdG8gdGFyZ2V0IGNhbnZhc1xuICAgICAgICBjdHguc2F2ZSgpO1xuICAgICAgICB7XG4gICAgICAgICAgICBjdHgudHJhbnNsYXRlKHRoaXMucGFyZW50LnBvc2l0aW9uLngsIHRoaXMucGFyZW50LnBvc2l0aW9uLnkpO1xuICAgICAgICAgICAgY3R4LnJvdGF0ZSh0aGlzLmFuZ2xlKTtcbiAgICAgICAgICAgIGN0eC5kcmF3SW1hZ2UodGVtcENhbnZhcy5jYW52YXMsIC10aGlzLmJyYW5jaFdpZHRoIC8gMiwgLSh0aGlzLmJyYW5jaEhlaWdodCkpO1xuICAgICAgICB9XG4gICAgICAgIGN0eC5yZXN0b3JlKCk7XG5cbiAgICAgICAgLy8gZHJhdyBvdXRsaW5lXG4gICAgICAgIGlmIChkcmF3Qm9yZGVyKSB7XG4gICAgICAgICAgICBjb25zdCBvdXRsaW5lV2lkdGg6IG51bWJlciA9IHRoaXMub3B0aW9ucy50cmVlR2VuZXJhdG9yLmdldE91dGxpbmVUaGlja25lc3MoKTtcbiAgICAgICAgICAgIGN0eC5zYXZlKCk7XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY3R4LnNhdmUoKTtcbiAgICAgICAgICAgICAgICBjdHguZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ2Rlc3RpbmF0aW9uLW92ZXInO1xuICAgICAgICAgICAgICAgIGN0eC5maWxsU3R5bGUgPSAnYmxhY2snO1xuICAgICAgICAgICAgICAgIGN0eC50cmFuc2xhdGUodGhpcy5wYXJlbnQucG9zaXRpb24ueCwgdGhpcy5wYXJlbnQucG9zaXRpb24ueSk7XG4gICAgICAgICAgICAgICAgY3R4LnJvdGF0ZSh0aGlzLmFuZ2xlKTtcblxuICAgICAgICAgICAgICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgICAgICBjdHguYXJjKDAsIDAsIGNpcmNsZVJhZGl1cyArIG91dGxpbmVXaWR0aCwgMCwgTWF0aC5QSSAqIDIpO1xuICAgICAgICAgICAgICAgIGN0eC5maWxsKCk7XG5cbiAgICAgICAgICAgICAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICAgICAgY3R4LmFyYygwLCAwLCBjaXJjbGVSYWRpdXMgKyBvdXRsaW5lV2lkdGgsIDAsIE1hdGguUEkgKiAyKTtcbiAgICAgICAgICAgICAgICBjdHguZmlsbCgpO1xuXG4gICAgICAgICAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgICAgIGN0eC5yZWN0KCgtdGhpcy5icmFuY2hXaWR0aCAvIDIpIC0gb3V0bGluZVdpZHRoLCAwLCB0aGlzLmJyYW5jaFdpZHRoICsgKG91dGxpbmVXaWR0aCAqIDIpLCAtdGhpcy5icmFuY2hIZWlnaHQpO1xuICAgICAgICAgICAgICAgIGN0eC5maWxsKCk7XG5cbiAgICAgICAgICAgICAgICBjdHgucmVzdG9yZSgpO1xuXG4gICAgICAgICAgICAgICAgY3R4LnNhdmUoKTtcbiAgICAgICAgICAgICAgICBjdHguZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ2Rlc3RpbmF0aW9uLW92ZXInO1xuICAgICAgICAgICAgICAgIGN0eC5maWxsU3R5bGUgPSAnYmxhY2snO1xuICAgICAgICAgICAgICAgIGN0eC50cmFuc2xhdGUodGhpcy5wb3NpdGlvbi54LCB0aGlzLnBvc2l0aW9uLnkpO1xuICAgICAgICAgICAgICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgICAgICBjdHguYXJjKDAsIDAsIGNpcmNsZVJhZGl1cyArIG91dGxpbmVXaWR0aCwgMCwgTWF0aC5QSSAqIDIpO1xuICAgICAgICAgICAgICAgIGN0eC5maWxsKCk7XG4gICAgICAgICAgICAgICAgY3R4LnJlc3RvcmUoKTtcblxuICAgICAgICAgICAgICAgIGN0eC5zYXZlKCk7XG4gICAgICAgICAgICAgICAgY3R4Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdkZXN0aW5hdGlvbi1vdmVyJztcbiAgICAgICAgICAgICAgICBjdHguZmlsbFN0eWxlID0gJ2JsYWNrJztcbiAgICAgICAgICAgICAgICBjdHgudHJhbnNsYXRlKHRoaXMucGFyZW50LnBvc2l0aW9uLngsIHRoaXMucGFyZW50LnBvc2l0aW9uLnkpO1xuICAgICAgICAgICAgICAgIGN0eC5yb3RhdGUodGhpcy5hbmdsZSk7XG4gICAgICAgICAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgICAgIGN0eC5yZWN0KCgtdGhpcy5icmFuY2hXaWR0aCAvIDIpIC0gb3V0bGluZVdpZHRoLCAwLCB0aGlzLmJyYW5jaFdpZHRoICsgKG91dGxpbmVXaWR0aCAqIDIpLCAtdGhpcy5icmFuY2hIZWlnaHQpO1xuICAgICAgICAgICAgICAgIGN0eC5maWxsKCk7XG4gICAgICAgICAgICAgICAgY3R4LnJlc3RvcmUoKTtcbiAgICAgICAgICAgICAgICBjdHguZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ3NvdXJjZS1vdmVyJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGN0eC5yZXN0b3JlKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGRyYXdXaXRoQ2lyY2xlKGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCBkcmF3Qm9yZGVyOiBib29sZWFuKSB7XG4gICAgICAgIGlmICghdGhpcy5wYXJlbnQpXG4gICAgICAgICAgICByZXR1cm4gY29uc29sZS5hc3NlcnQoZmFsc2UpO1xuXG4gICAgICAgIGNvbnN0IHRlbXBDYW52YXMgPSB0aGlzLm9wdGlvbnMudHJlZUdlbmVyYXRvci5nZXRUZW1wQ2FudmFzKDApO1xuICAgICAgICBjb25zdCBjaXJjbGVSYWRpdXM6IG51bWJlciA9IHRoaXMuYnJhbmNoV2lkdGggLyAyO1xuXG4gICAgICAgIC8vICBkcmF3IGJyYW5jaCB0byB0ZW1wb3JhcnkgY2FudmFzXG4gICAgICAgIHtcbiAgICAgICAgICAgIC8vICAgIHByZXBhcmUgdGVtcG9yYXJ5IGNhbnZhc1xuICAgICAgICAgICAgdGVtcENhbnZhcy5zYXZlKCk7XG4gICAgICAgICAgICB0ZW1wQ2FudmFzLmZpbGxTdHlsZSA9ICdibGFjayc7XG5cbiAgICAgICAgICAgIC8vICAgIGRyYXcgY2lyY2xlXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGVtcENhbnZhcy5zYXZlKCk7XG4gICAgICAgICAgICAgICAgdGVtcENhbnZhcy50cmFuc2xhdGUoY2lyY2xlUmFkaXVzLCBjaXJjbGVSYWRpdXMpO1xuICAgICAgICAgICAgICAgIHRlbXBDYW52YXMuYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICAgICAgdGVtcENhbnZhcy5hcmMoMCwgMCwgY2lyY2xlUmFkaXVzLCAwLCBNYXRoLlBJICogMik7XG4gICAgICAgICAgICAgICAgY29uc3QgZ3JhZGllbnQgPSB0ZW1wQ2FudmFzLmNyZWF0ZVJhZGlhbEdyYWRpZW50KDAsIDAsIDAsIDAsIDAsIGNpcmNsZVJhZGl1cyk7XG4gICAgICAgICAgICAgICAgZ3JhZGllbnQuYWRkQ29sb3JTdG9wKDAuOCwgJ3JnYmEoMCwwLDAsMSknKTtcbiAgICAgICAgICAgICAgICBncmFkaWVudC5hZGRDb2xvclN0b3AoMSwgJ3JnYmEoMCwwLDAsMC4xKScpO1xuICAgICAgICAgICAgICAgIHRlbXBDYW52YXMuZmlsbFN0eWxlID0gZ3JhZGllbnQ7XG4gICAgICAgICAgICAgICAgdGVtcENhbnZhcy5maWxsKCk7XG4gICAgICAgICAgICAgICAgdGVtcENhbnZhcy5yZXN0b3JlKCk7XG4gICAgICAgICAgICAgICAgdGVtcENhbnZhcy5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnc291cmNlLWluJztcbiAgICAgICAgICAgICAgICB0aGlzLmRyYXdUZXh0dXJlKHRoaXMub3B0aW9ucy50cmVlR2VuZXJhdG9yLmdldFRlbXBDYW52YXMoMSksIHRlbXBDYW52YXMpO1xuICAgICAgICAgICAgICAgIHRlbXBDYW52YXMuZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ3NvdXJjZS1vdXQnO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0ZW1wQ2FudmFzLnJlc3RvcmUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGNvcHkgcmVuZGVyZWQgYnJhbmNoIHRvIHRhcmdldCBjYW52YXNcbiAgICAgICAgY3R4LnNhdmUoKTtcbiAgICAgICAgY3R4LnRyYW5zbGF0ZSh0aGlzLnBhcmVudC5wb3NpdGlvbi54LCB0aGlzLnBhcmVudC5wb3NpdGlvbi55KTtcbiAgICAgICAgY3R4LnJvdGF0ZSh0aGlzLmFuZ2xlKTtcbiAgICAgICAgY3R4LnRyYW5zbGF0ZSgtY2lyY2xlUmFkaXVzLCAtY2lyY2xlUmFkaXVzKTtcbiAgICAgICAgY3R4LmRyYXdJbWFnZSh0ZW1wQ2FudmFzLmNhbnZhcywgMCwgMCk7XG4gICAgICAgIGN0eC5yZXN0b3JlKCk7XG5cbiAgICAgICAgLy8gZHJhdyBvdXRsaW5lXG4gICAgICAgIGlmIChkcmF3Qm9yZGVyKSB7XG4gICAgICAgICAgICBjb25zdCBvdXRsaW5lV2lkdGg6IG51bWJlciA9IHRoaXMub3B0aW9ucy50cmVlR2VuZXJhdG9yLmdldE91dGxpbmVUaGlja25lc3MoKTtcbiAgICAgICAgICAgIGN0eC5zYXZlKCk7XG4gICAgICAgICAgICBjdHgudHJhbnNsYXRlKHRoaXMucGFyZW50LnBvc2l0aW9uLngsIHRoaXMucGFyZW50LnBvc2l0aW9uLnkpO1xuICAgICAgICAgICAgY3R4LnJvdGF0ZSh0aGlzLmFuZ2xlKTtcbiAgICAgICAgICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgIC8vIGRvbid0IGRyYXcgYm90dG9tIGJvcmRlciBoYWxmIGlmIHRoaXMgaXMgdGhlIHN0YXJ0IG9mIGEgbmV3IHRyZWUgcGFydFxuICAgICAgICAgICAgY29uc3QgZHJhd0JvdHRvbUJvcmRlciA9IHRoaXMuX2dyb3d0aExvY2FsLnkgPiAxMDtcbiAgICAgICAgICAgIGN0eC5hcmMoMCwgMCwgY2lyY2xlUmFkaXVzICsgb3V0bGluZVdpZHRoLCBkcmF3Qm90dG9tQm9yZGVyID8gMCA6IE1hdGguUEksIE1hdGguUEkgKiAyKTtcbiAgICAgICAgICAgIGN0eC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnZGVzdGluYXRpb24tb3Zlcic7XG4gICAgICAgICAgICBjdHguZmlsbFN0eWxlID0gJ2JsYWNrJztcbiAgICAgICAgICAgIGN0eC5maWxsKCk7XG4gICAgICAgICAgICBjdHgucmVzdG9yZSgpO1xuICAgICAgICAgICAgY3R4Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdzb3VyY2Utb3Zlcic7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgZHJhd1RleHR1cmUodGVtcENhbnZhczogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCkge1xuICAgICAgICBjb25zdCBwYXR0ZXJuID0gdGhpcy5vcHRpb25zLnRyZWVHZW5lcmF0b3IuZ2V0QnJhbmNoVGV4dHVyZVBhdHRlcm4odGhpcy5ncm93dGhUb3RhbCk7XG4gICAgICAgIHRlbXBDYW52YXMuZmlsbFN0eWxlID0gcGF0dGVybjtcbiAgICAgICAgdGVtcENhbnZhcy5iZWdpblBhdGgoKTtcbiAgICAgICAgdGVtcENhbnZhcy5yZWN0KDAsIDAsIDxudW1iZXI+dGVtcENhbnZhcy5jYW52YXMud2lkdGgsIDxudW1iZXI+dGVtcENhbnZhcy5jYW52YXMuaGVpZ2h0KTtcbiAgICAgICAgdGVtcENhbnZhcy5maWxsKCk7XG4gICAgICAgIGN0eC5kcmF3SW1hZ2UodGVtcENhbnZhcy5jYW52YXMsIDAsIDApO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBvcHRpb25zOiBCcmFuY2hPcHRpb25zO1xuXG4gICAgcHJpdmF0ZSBfZ3Jvd3RoTG9jYWw6IFZlY3RvcjIgPSBuZXcgVmVjdG9yMigwLCAwKTtcbiAgICBwcml2YXRlIF9ncm93dGhUb3RhbDogVmVjdG9yMiA9IG5ldyBWZWN0b3IyKDAsIDApO1xuXG4gICAgcHJpdmF0ZSBfcG9zaXRpb246IFZlY3RvcjI7XG4gICAgcHJpdmF0ZSBfcGFyZW50OiBCcmFuY2ggfCBudWxsO1xuICAgIHByb3RlY3RlZCBkZXB0aDogbnVtYmVyO1xuXG4gICAgcHJpdmF0ZSBfY2hpbGRDb3VudDogbnVtYmVyID0gMDtcblxuICAgIHByaXZhdGUgZHJhd246IGJvb2xlYW4gPSBmYWxzZTtcbn0iLCJpbXBvcnQgeyBJVHJlZUdlbmVyYXRvclBhcmFtZXRlcnMgfSBmcm9tIFwiLi4vdHJlZUdlbmVyYXRvci5qc1wiO1xuaW1wb3J0IHsgVmVjdG9yMiB9IGZyb20gXCIuLi8uLi91dGlscy9saW5lYXIvdmVjdG9yMi5qc1wiO1xuaW1wb3J0IHsgQnJhbmNoIH0gZnJvbSBcIi4vYnJhbmNoLmpzXCI7XG5pbXBvcnQgeyBDYW52YXNIZWxwZXIgfSBmcm9tIFwiLi4vLi4vdXRpbHMvY2FudmFzSGVscGVyLmpzXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgTGVhZk9wdGlvbnMge1xuICAgIHRyZWVHZW5lcmF0b3I6IElUcmVlR2VuZXJhdG9yUGFyYW1ldGVycyxcbiAgICBwb3NpdGlvbjogVmVjdG9yMixcbiAgICBhdHRyYWN0aW9uRGlzdGFuY2U6IG51bWJlcjtcbiAgICByb3RhdGVkPzogYm9vbGVhbjtcbn1cbmV4cG9ydCBjbGFzcyBMZWFmIHtcbiAgICBwdWJsaWMgY29uc3RydWN0b3Iob3B0aW9uczogTGVhZk9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICAgICAgdGhpcy5fcG9zaXRpb24gPSBvcHRpb25zLnBvc2l0aW9uO1xuICAgICAgICB0aGlzLmF0dHJhY3Rpb25EaXN0YW5jZSA9IG9wdGlvbnMuYXR0cmFjdGlvbkRpc3RhbmNlO1xuXG4gICAgICAgIGNvbnN0IHBybmcgPSB0aGlzLm9wdGlvbnMudHJlZUdlbmVyYXRvci5nZXRQUk5HKCdEUkFXJyk7XG5cbiAgICAgICAgdGhpcy5yb3RhdGlvbiA9IHRoaXMub3B0aW9ucy5yb3RhdGVkID8gcHJuZy5mbG9hdEluUmFuZ2UoLTEuNSwgMS41KSA6IDA7XG4gICAgICAgIHRoaXMubGVhZk9mZnNldHMgPSBbXG4gICAgICAgICAgICBwcm5nLmludEluUmFuZ2UoMCwgNDAwKSxcbiAgICAgICAgICAgIHBybmcuaW50SW5SYW5nZSgwLCA0MDApXG4gICAgICAgIF1cbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IHBvc2l0aW9uKCk6IFZlY3RvcjIgeyByZXR1cm4gdGhpcy5fcG9zaXRpb247IH1cbiAgICBwdWJsaWMgZ2V0IHBhcmVudCgpOiBCcmFuY2ggfCBudWxsIHsgcmV0dXJuIHRoaXMuX3BhcmVudDsgfVxuICAgIHB1YmxpYyBzZXQgcGFyZW50KHZhbHVlOiBCcmFuY2ggfCBudWxsKSB7IHRoaXMuX3BhcmVudCA9IHZhbHVlOyB9XG5cbiAgICBwdWJsaWMgY2xvbmUoKTogTGVhZiB7XG4gICAgICAgIGNvbnN0IGxlYWYgPSBuZXcgTGVhZih7XG4gICAgICAgICAgICB0cmVlR2VuZXJhdG9yOiB0aGlzLm9wdGlvbnMudHJlZUdlbmVyYXRvcixcbiAgICAgICAgICAgIHBvc2l0aW9uOiB0aGlzLm9wdGlvbnMucG9zaXRpb24uY2xvbmUoKSxcbiAgICAgICAgICAgIGF0dHJhY3Rpb25EaXN0YW5jZTogdGhpcy5vcHRpb25zLmF0dHJhY3Rpb25EaXN0YW5jZSxcbiAgICAgICAgICAgIHJvdGF0ZWQ6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIGxlYWYucGFyZW50ID0gdGhpcy5wYXJlbnQ7XG4gICAgICAgIHJldHVybiBsZWFmO1xuICAgIH1cblxuICAgIHB1YmxpYyBjcmVhdGVFbGVtZW50KCk6IEhUTUxDYW52YXNFbGVtZW50IHtcbiAgICAgICAgY29uc3QgcGFyZW50ID0gPEJyYW5jaD50aGlzLnBhcmVudDtcblxuICAgICAgICBjb25zdCByZW5kZXJTY2FsZSA9IHRoaXMub3B0aW9ucy50cmVlR2VuZXJhdG9yLmdldFJlbmRlclNjYWxpbmcoKTtcbiAgICAgICAgY29uc3QgY2FudmFzU2l6ZSA9IDUwO1xuICAgICAgICBjb25zdCBsZWFmRWxlbWVudDogSFRNTENhbnZhc0VsZW1lbnQgPSA8SFRNTENhbnZhc0VsZW1lbnQ+ZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG5cbiAgICAgICAgbGVhZkVsZW1lbnQuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgICAgICBsZWFmRWxlbWVudC5zdHlsZS5wb2ludGVyRXZlbnRzID0gJ25vbmUnO1xuICAgICAgICBsZWFmRWxlbWVudC53aWR0aCA9IGNhbnZhc1NpemUgKiByZW5kZXJTY2FsZTtcbiAgICAgICAgbGVhZkVsZW1lbnQuaGVpZ2h0ID0gY2FudmFzU2l6ZSAqIHJlbmRlclNjYWxlO1xuICAgICAgICBsZWFmRWxlbWVudC5zdHlsZS53aWR0aCA9IGNhbnZhc1NpemUgKyAncHgnO1xuICAgICAgICBsZWFmRWxlbWVudC5zdHlsZS5oZWlnaHQgPSBjYW52YXNTaXplICsgJ3B4JztcbiAgICAgICAgbGVhZkVsZW1lbnQuc3R5bGUubGVmdCA9IChwYXJlbnQucG9zaXRpb24ueCAtIGNhbnZhc1NpemUgKiAwLjUpICsgJ3B4JztcbiAgICAgICAgbGVhZkVsZW1lbnQuc3R5bGUudG9wID0gKHBhcmVudC5wb3NpdGlvbi55IC0gY2FudmFzU2l6ZSAqIDAuNSkgKyAncHgnO1xuXG4gICAgICAgIGNvbnN0IGN0eCA9IDxDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQ+bGVhZkVsZW1lbnQuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgICAgY3R4LnNjYWxlKHJlbmRlclNjYWxlLCByZW5kZXJTY2FsZSk7XG4gICAgICAgIGN0eC50cmFuc2xhdGUoY2FudmFzU2l6ZSAqIDAuNSwgY2FudmFzU2l6ZSAqIDAuNSk7XG4gICAgICAgIHRoaXMuZHJhd0xlYWYoY3R4KTtcblxuICAgICAgICByZXR1cm4gbGVhZkVsZW1lbnQ7XG4gICAgfVxuXG4gICAgcHVibGljIGludGVyc2VjdHMoZW50aXR5OiBCcmFuY2gpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKCEoZW50aXR5IGluc3RhbmNlb2YgQnJhbmNoKSlcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgY29uc3QgZGlzdGFuY2UgPSBlbnRpdHkucG9zaXRpb24uc3VidHJhY3QodGhpcy5wb3NpdGlvbikubGVuZ3RoKCk7XG4gICAgICAgIC8vIGxlYWZzIGludGVyc2VjdCB3aXRoIGJyYW5jaGVzIHdpdGhpbiB0aGVpciByYWRpdXMgb2YgYXR0cmFjdGlvblxuICAgICAgICByZXR1cm4gKGVudGl0eSBpbnN0YW5jZW9mIEJyYW5jaCkgJiYgKGRpc3RhbmNlIDw9IHRoaXMuYXR0cmFjdGlvbkRpc3RhbmNlKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZHJhdyhjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCkge1xuICAgICAgICBpZiAoIXRoaXMucGFyZW50KVxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIGlmKHRoaXMub3B0aW9ucy50cmVlR2VuZXJhdG9yLmlzU2VyaWFsaXplZFBsYXliYWNrKCkpXG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgY3R4LnNhdmUoKTtcbiAgICAgICAgY3R4LnRyYW5zbGF0ZSh0aGlzLnBhcmVudC5wb3NpdGlvbi54LCB0aGlzLnBhcmVudC5wb3NpdGlvbi55KTtcbiAgICAgICAgdGhpcy5kcmF3TGVhZihjdHgpO1xuICAgICAgICBjdHgucmVzdG9yZSgpO1xuICAgIH1cblxuICAgIHB1YmxpYyBkcmF3TGVhZihjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCkge1xuICAgICAgICBpZiAoIXRoaXMucGFyZW50KVxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IHRlbXBDYW52YXMgPSB0aGlzLm9wdGlvbnMudHJlZUdlbmVyYXRvci5nZXRUZW1wQ2FudmFzKDApO1xuICAgICAgICBjb25zdCBsZWFmU3RlbmNpbCA9IHRoaXMub3B0aW9ucy50cmVlR2VuZXJhdG9yLmdldExlYWZTdGVuY2lsVGV4dHVyZSgpO1xuICAgICAgICBjb25zdCBsZWFmVGV4dHVyZSA9IHRoaXMub3B0aW9ucy50cmVlR2VuZXJhdG9yLmdldExlYWZUZXh0dXJlUGF0dGVybih0aGlzLmxlYWZPZmZzZXRzWzBdLCB0aGlzLmxlYWZPZmZzZXRzWzFdKTtcblxuICAgICAgICB0ZW1wQ2FudmFzLnNhdmUoKTtcbiAgICAgICAge1xuICAgICAgICAgICAgdGVtcENhbnZhcy5kcmF3SW1hZ2UobGVhZlN0ZW5jaWwsIDAsIDApO1xuICAgICAgICAgICAgdGVtcENhbnZhcy5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgIHRlbXBDYW52YXMucmVjdCgwLCAwLCAxNSwgMTUpO1xuICAgICAgICAgICAgdGVtcENhbnZhcy5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnc291cmNlLWluJztcbiAgICAgICAgICAgIHRlbXBDYW52YXMuZmlsbFN0eWxlID0gbGVhZlRleHR1cmU7XG4gICAgICAgICAgICB0ZW1wQ2FudmFzLmZpbGwoKTtcbiAgICAgICAgfVxuICAgICAgICB0ZW1wQ2FudmFzLmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdzb3VyY2Utb3Zlcic7XG4gICAgICAgIHRlbXBDYW52YXMucmVzdG9yZSgpO1xuXG4gICAgICAgIGN0eC5zYXZlKCk7XG4gICAgICAgIGN0eC5yb3RhdGUodGhpcy5wYXJlbnQ/LmFuZ2xlICsgdGhpcy5yb3RhdGlvbik7XG4gICAgICAgIGN0eC50cmFuc2xhdGUoLTE1IC8gMiwgLTE1KTtcbiAgICAgICAgQ2FudmFzSGVscGVyLmRyYXdJbWFnZUJvcmRlcihsZWFmU3RlbmNpbCwgY3R4LCAxKTtcbiAgICAgICAgY3R4LmRyYXdJbWFnZSh0ZW1wQ2FudmFzLmNhbnZhcywgMCwgMCk7XG4gICAgICAgIGN0eC5kcmF3SW1hZ2UodGhpcy5vcHRpb25zLnRyZWVHZW5lcmF0b3IuZ2V0TGVhZk91dGxpbmVUZXh0dXJlKCksIDAsIDApO1xuICAgICAgICBjdHgucmVzdG9yZSgpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9wdGlvbnM6IExlYWZPcHRpb25zO1xuICAgIHByaXZhdGUgX3Bvc2l0aW9uOiBWZWN0b3IyO1xuICAgIHByaXZhdGUgX3BhcmVudDogQnJhbmNoIHwgbnVsbCA9IG51bGw7XG5cbiAgICBwcml2YXRlIGxlYWZPZmZzZXRzOiBbbnVtYmVyLCBudW1iZXJdO1xuICAgIHByaXZhdGUgcm90YXRpb246IG51bWJlcjtcblxuICAgIHByaXZhdGUgYXR0cmFjdGlvbkRpc3RhbmNlOiBudW1iZXI7XG59XG4iLCJpbXBvcnQgeyBUcmVlR2VuZXJhdG9yLCBUcmVlR2VuZXJhdG9yT3B0aW9ucyB9IGZyb20gXCIuL3RyZWVHZW5lcmF0b3IuanNcIjtcbmltcG9ydCB7IEJyYW5jaCwgQnJhbmNoT3B0aW9ucyB9IGZyb20gXCIuL2NvbXBvbmVudHMvYnJhbmNoLmpzXCI7XG5pbXBvcnQgeyBMZWFmIH0gZnJvbSBcIi4vY29tcG9uZW50cy9sZWFmLmpzXCI7XG5pbXBvcnQgeyBWZWN0b3IyIH0gZnJvbSBcIi4uL3V0aWxzL2xpbmVhci92ZWN0b3IyLmpzXCI7XG5pbXBvcnQgeyBCQm94IH0gZnJvbSBcIi4uL3V0aWxzL2xpbmVhci9iYm94LmpzXCI7XG5pbXBvcnQgeyBCcmFuY2hHcm93ZXIgfSBmcm9tIFwiLi9icmFuY2hHcm93ZXIuanNcIjtcblxuaW50ZXJmYWNlIFNwYWNlQ29sb25pemVyT3B0aW9ucyB7XG4gICAgdHJlZUdlbmVyYXRvcjogVHJlZUdlbmVyYXRvcjtcbiAgICBkZXB0aDogbnVtYmVyO1xuICAgIHN0YXJ0aW5nUG9pbnQ6IFZlY3RvcjI7XG4gICAgYmJveDogQkJveDtcbiAgICBsZWFmQ291bnQ6IG51bWJlcjtcbiAgICBwYXJlbnRCcmFuY2g/OiBCcmFuY2g7XG4gICAgYnJhbmNoTGVuZ3RoOiBudW1iZXI7XG4gICAgbGVhZkF0dHJhY3Rpb25EaXN0YW5jZTogbnVtYmVyO1xuICAgIHNwYXduUG9pbnRzPzogQXJyYXk8VmVjdG9yMj47XG4gICAgYnJhbmNoRmFjdG9yeT86IChvcHRpb25zOiBCcmFuY2hPcHRpb25zKSA9PiBCcmFuY2g7XG4gICAgcG9zaXRpb25QcmVkaWNhdGU/OiAoYmJveDogQkJveCwgcG9zOiBWZWN0b3IyKSA9PiBib29sZWFuO1xufVxuXG5leHBvcnQgY2xhc3MgU3BhY2VDb2xvbml6ZXIgaW1wbGVtZW50cyBCcmFuY2hHcm93ZXIge1xuICAgIHB1YmxpYyBjb25zdHJ1Y3RvcihvcHRpb25zOiBTcGFjZUNvbG9uaXplck9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhcnQoKSB7XG4gICAgICAgIHRoaXMucGxhY2VMZWF2ZXMoKTtcbiAgICAgICAgdGhpcy5wbGFjZUJyYW5jaGVzKCk7XG4gICAgfVxuXG4gICAgZ2V0IGFuZ2xlKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnMucGFyZW50QnJhbmNoPy5hbmdsZSA/PyAwO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBiaWFzR3Jvd3RoVmVjdG9yKGdyb3d0aFZlY3RvcjogVmVjdG9yMik6IFZlY3RvcjIge1xuICAgICAgICByZXR1cm4gZ3Jvd3RoVmVjdG9yO1xuICAgIH1cblxuICAgIHByaXZhdGUgcGxhY2VMZWF2ZXMoKSB7XG4gICAgICAgIC8vIHBsYWNlIG4gbGVhZnNcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLm9wdGlvbnMubGVhZkNvdW50OyBpKyspIHtcblxuICAgICAgICAgICAgbGV0IGxlYWZQb3NpdGlvbjogVmVjdG9yMiA9IFZlY3RvcjIuWmVybztcblxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5zcGF3blBvaW50cz8uW2ldKSB7XG4gICAgICAgICAgICAgICAgLy8gbGVhZiBwb3NpdGlvbiBleHBsaWNpdGx5IHNwZWNpZmllZFxuICAgICAgICAgICAgICAgIGxlYWZQb3NpdGlvbiA9IHRoaXMub3B0aW9ucy5zcGF3blBvaW50c1tpXTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gbGVhZiBwb3NpdGlvbiByYW5kb20gcG9pbnQgaW4gYm91bmRzIHdpdGggcmVzcGVjdCB0byBwcmVkaWNhdGVcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IDEwMDsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgIGxlYWZQb3NpdGlvbiA9IG5ldyBWZWN0b3IyKFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zLnRyZWVHZW5lcmF0b3IuZ2V0UFJORygnR1JPVycpLmZsb2F0SW5SYW5nZSh0aGlzLm9wdGlvbnMuYmJveC5taW5Db3JuZXIueCwgdGhpcy5vcHRpb25zLmJib3gubWF4Q29ybmVyLngpLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zLnRyZWVHZW5lcmF0b3IuZ2V0UFJORygnR1JPVycpLmZsb2F0SW5SYW5nZSh0aGlzLm9wdGlvbnMuYmJveC5taW5Db3JuZXIueSwgdGhpcy5vcHRpb25zLmJib3gubWF4Q29ybmVyLnkpLFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy5wb3NpdGlvblByZWRpY2F0ZSB8fCB0aGlzLm9wdGlvbnMucG9zaXRpb25QcmVkaWNhdGUodGhpcy5vcHRpb25zLmJib3gsIGxlYWZQb3NpdGlvbikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBsZWFmOiBMZWFmID0gbmV3IExlYWYoe1xuICAgICAgICAgICAgICAgIHRyZWVHZW5lcmF0b3I6IHRoaXMub3B0aW9ucy50cmVlR2VuZXJhdG9yLFxuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBsZWFmUG9zaXRpb24sXG4gICAgICAgICAgICAgICAgYXR0cmFjdGlvbkRpc3RhbmNlOiB0aGlzLm9wdGlvbnMubGVhZkF0dHJhY3Rpb25EaXN0YW5jZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5hY3RpdmVMZWFmcy5hZGQobGVhZik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHBsYWNlQnJhbmNoZXMoKSB7XG4gICAgICAgIGNvbnN0IGJyYW5jaE9wdGlvbnM6IEJyYW5jaE9wdGlvbnMgPSB7XG4gICAgICAgICAgICBwYXJlbnQ6IHRoaXMub3B0aW9ucy5wYXJlbnRCcmFuY2gsXG4gICAgICAgICAgICBicmFuY2hMZW5ndGg6IHRoaXMub3B0aW9ucy5icmFuY2hMZW5ndGgsXG4gICAgICAgICAgICB0cmVlR2VuZXJhdG9yOiB0aGlzLm9wdGlvbnMudHJlZUdlbmVyYXRvcixcbiAgICAgICAgICAgIHBvc2l0aW9uOiB0aGlzLm9wdGlvbnMuc3RhcnRpbmdQb2ludCxcbiAgICAgICAgICAgIGRlcHRoOiB0aGlzLm9wdGlvbnMuZGVwdGgsXG4gICAgICAgICAgICBmaXJzdEJyYW5jaDogdHJ1ZVxuICAgICAgICB9O1xuICAgICAgICBjb25zdCBzdGFydGluZ0JyYW5jaCA9IHRoaXMub3B0aW9ucy5icmFuY2hGYWN0b3J5ID8gdGhpcy5vcHRpb25zLmJyYW5jaEZhY3RvcnkoYnJhbmNoT3B0aW9ucykgOiBuZXcgQnJhbmNoKGJyYW5jaE9wdGlvbnMpO1xuICAgICAgICB0aGlzLmFjdGl2ZUJyYW5jaGVzLmFkZChzdGFydGluZ0JyYW5jaCk7XG4gICAgICAgIHRoaXMub2xkQnJhbmNoZXMuYWRkKHN0YXJ0aW5nQnJhbmNoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldENsb3Nlc3RCcmFuY2gobGVhZjogTGVhZik6IEJyYW5jaCB8IG51bGwge1xuICAgICAgICBsZXQgY2xvc2VzdEJyYW5jaDogQnJhbmNoIHwgbnVsbCA9IG51bGw7XG4gICAgICAgIGxldCBjbG9zZXNldERpc3RhbmNlID0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZO1xuICAgICAgICB0aGlzLmFjdGl2ZUJyYW5jaGVzLmZvckVhY2goKGJyYW5jaCkgPT4ge1xuICAgICAgICAgICAgaWYgKCFsZWFmLmludGVyc2VjdHMoYnJhbmNoKSlcbiAgICAgICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgICAgIC8vIE5PVEU6IElmIGEgYnJhbmNoIGhhcyAyIGNoaWxkcmVuIGFscmVhZHksIHdlIG91Z2h0IG5vdCBleHRydWRlIGZyb20gaXQgZnVydGhlci5cbiAgICAgICAgICAgIC8vIEEgdHJpIG9yIGdyZWF0ZXIgYnJhbmNoIGp1bmN0aW9uIGlzIGJvdGggbm90IGluIGtlZXBpbmcgd2l0aCBhIHR5cGljYWwgdHJlZSBzdHJ1Y3R1cmUsIGFuZCBjYW4gcmVzdWx0IGluIFxuICAgICAgICAgICAgLy8gaW5maW5pdGUgZ3Jvd3RoIGxvb3BzIHdoZXJlIGJyYW5jaCBncm93dGggZ2V0cyBcInN0dWNrXCIgYmV0d2VlbiB0d28gYXR0cmFjdGluZyBsZWFmcy5cbiAgICAgICAgICAgIGlmIChicmFuY2guY2hpbGRDb3VudCA+PSAyKVxuICAgICAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICAgICAgY29uc3QgZGlzdGFuY2VUb0JyYW5jaCA9IGJyYW5jaC5kaXN0YW5jZVRvKGxlYWYpO1xuICAgICAgICAgICAgaWYgKGRpc3RhbmNlVG9CcmFuY2ggPCBjbG9zZXNldERpc3RhbmNlKSB7XG4gICAgICAgICAgICAgICAgY2xvc2VzZXREaXN0YW5jZSA9IGRpc3RhbmNlVG9CcmFuY2g7XG4gICAgICAgICAgICAgICAgY2xvc2VzdEJyYW5jaCA9IGJyYW5jaDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGNsb3Nlc3RCcmFuY2g7XG4gICAgfVxuXG4gICAgcHVibGljIHN0ZXAoKSB7XG4gICAgICAgIHRoaXMuYnJhbmNoZXNMYXN0TGVuZ3RoID0gdGhpcy5icmFuY2hlcy5sZW5ndGg7XG4gICAgICAgIHRoaXMucmVhY2hlZExlYWZzTGFzdExlbmd0aCA9IHRoaXMucmVhY2hlZExlYWZzLmxlbmd0aDtcblxuICAgICAgICBjb25zdCBjdXJyZW50UmVhY2hlZExlYWZzOiBBcnJheTxMZWFmPiA9IFtdO1xuXG4gICAgICAgIGNvbnN0IGJyYW5jaFRvQXR0cmFjdGlvblZlYzogTWFwPEJyYW5jaCwgVmVjdG9yMj4gPSBuZXcgTWFwKCk7XG5cbiAgICAgICAgLy8gYXBwbHkgbGVhZiBpbmZsdWVuY2VzIHRvIGJyYW5jaGVzXG4gICAgICAgIHRoaXMuYWN0aXZlTGVhZnMuZm9yRWFjaCgobGVhZjogTGVhZikgPT4ge1xuICAgICAgICAgICAgY29uc3QgY2xvc2VzdEJyYW5jaCA9IHRoaXMuZ2V0Q2xvc2VzdEJyYW5jaChsZWFmKTtcbiAgICAgICAgICAgIGlmICghY2xvc2VzdEJyYW5jaClcbiAgICAgICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgICAgIGlmIChjbG9zZXN0QnJhbmNoLmRpc3RhbmNlVG8obGVhZikgPCAodGhpcy5vcHRpb25zLmJyYW5jaExlbmd0aCkpIHtcbiAgICAgICAgICAgICAgICAvLyBsZWFmIHJlYWNoZWQgYnkgY2xvc2VzdCBicmFuY2hcblxuICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZlTGVhZnMuZGVsZXRlKGxlYWYpO1xuICAgICAgICAgICAgICAgIGxlYWYucGFyZW50ID0gY2xvc2VzdEJyYW5jaDtcbiAgICAgICAgICAgICAgICBjdXJyZW50UmVhY2hlZExlYWZzLnB1c2gobGVhZik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIGxlYWYgbm90IHlldCByZWFjaGVkLCBhcHBseSBhdHRyYWN0aW9uIHRvIGNsb3Nlc3QgYnJhbmNoXG5cbiAgICAgICAgICAgICAgICBjb25zdCBhdHRyYWN0aW9uVmVjID0gbGVhZi5wb3NpdGlvbi5zdWJ0cmFjdChjbG9zZXN0QnJhbmNoLnBvc2l0aW9uKTtcbiAgICAgICAgICAgICAgICBicmFuY2hUb0F0dHJhY3Rpb25WZWMuc2V0KGNsb3Nlc3RCcmFuY2gsIChicmFuY2hUb0F0dHJhY3Rpb25WZWMuZ2V0KGNsb3Nlc3RCcmFuY2gpID8/IFZlY3RvcjIuWmVybykuYWRkSW5QbGFjZShhdHRyYWN0aW9uVmVjKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIHJlbW92ZSBpZGxlIGJyYW5jaGVzICh0aG9zZSB0aGF0IGRpZCBub3QgZ3JvdyBzaW5jZSBsYXN0IHN0ZXApXG4gICAgICAgIHRoaXMub2xkQnJhbmNoZXMuZm9yRWFjaCgoYnJhbmNoKSA9PiB7XG4gICAgICAgICAgICBpZiAoYnJhbmNoVG9BdHRyYWN0aW9uVmVjLmhhcyhicmFuY2gpKVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlQnJhbmNoZXMuZGVsZXRlKGJyYW5jaCk7XG4gICAgICAgICAgICB0aGlzLm9sZEJyYW5jaGVzLmRlbGV0ZShicmFuY2gpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBncm93IGJyYW5jaGVzIHRvd2FyZHMgdGhlaXIgaW5mbHVlbmNlc1xuICAgICAgICBicmFuY2hUb0F0dHJhY3Rpb25WZWMuZm9yRWFjaCgoYXR0cmFjdGlvblZlYzogVmVjdG9yMiwgYnJhbmNoOiBCcmFuY2gpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGdyb3dWZWM6IFZlY3RvcjIgPSBhdHRyYWN0aW9uVmVjLm5vcm1hbGl6ZSgpLnNjYWxlSW5QbGFjZSh0aGlzLm9wdGlvbnMuYnJhbmNoTGVuZ3RoKTtcbiAgICAgICAgICAgIGNvbnN0IHZGaW5hbEdyb3d0aFZlY3RvcjogVmVjdG9yMiA9IHRoaXMuYmlhc0dyb3d0aFZlY3Rvcihncm93VmVjKTtcbiAgICAgICAgICAgIGNvbnN0IG5ld1Bvc2l0aW9uOiBWZWN0b3IyID0gYnJhbmNoLnBvc2l0aW9uLmFkZCh2RmluYWxHcm93dGhWZWN0b3IpO1xuXG4gICAgICAgICAgICBjb25zdCBuZXdCcmFuY2g6IEJyYW5jaCA9IGJyYW5jaC5jcmVhdGVDaGlsZEJyYW5jaCh7XG4gICAgICAgICAgICAgICAgdHJlZUdlbmVyYXRvcjogdGhpcy5vcHRpb25zLnRyZWVHZW5lcmF0b3IsXG4gICAgICAgICAgICAgICAgcG9zaXRpb246IG5ld1Bvc2l0aW9uLFxuICAgICAgICAgICAgICAgIGRlcHRoOiB0aGlzLm9wdGlvbnMuZGVwdGgsXG4gICAgICAgICAgICAgICAgYnJhbmNoTGVuZ3RoOiB0aGlzLm9wdGlvbnMuYnJhbmNoTGVuZ3RoXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5icmFuY2hlcy5wdXNoKG5ld0JyYW5jaCk7XG4gICAgICAgICAgICB0aGlzLmFjdGl2ZUJyYW5jaGVzLmFkZChuZXdCcmFuY2gpO1xuICAgICAgICAgICAgdGhpcy5vbGRCcmFuY2hlcy5hZGQobmV3QnJhbmNoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gb25seSBtYXJrIGxlYWZzIGFzIHJlYWNoZWQgaWYgdGhleSBhcmUgdGVybWluYWwgbGVhZnMgKG5vIGJyYW5jaCBpcyBncm93aW5nIGZyb20gdGhlbSlcbiAgICAgICAgY3VycmVudFJlYWNoZWRMZWFmcy5mb3JFYWNoKChwZW5kaW5nTGVhZiA9PiB7XG4gICAgICAgICAgICBpZiAocGVuZGluZ0xlYWYucGFyZW50Py5jaGlsZENvdW50ICE9IDApXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLnJlYWNoZWRMZWFmcy5wdXNoKHBlbmRpbmdMZWFmKTtcbiAgICAgICAgICAgIHRoaXMubGVhZnMucHVzaChwZW5kaW5nTGVhZik7XG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMudHJlZUdlbmVyYXRvci5tYXJrTGVhZlJlYWNoZWQodGhpcy5vcHRpb25zLmRlcHRoLCBwZW5kaW5nTGVhZik7XG4gICAgICAgIH0pKTtcbiAgICAgICAgXG4gICAgICAgIC8vIHN0ZXAgY29tcGxldGVcbiAgICAgICAgdGhpcy5zdGVwQ291bnQrKztcbiAgICB9XG5cbiAgICBwdWJsaWMgaXNGaW5pc2hlZEdyb3dpbmcoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiAodGhpcy5zdGVwQ291bnQgIT0gMCAmJiB0aGlzLm9sZEJyYW5jaGVzLnNpemUgPT0gMCk7XG4gICAgfVxuXG4gICAgcHVibGljIGdldE5ld0JyYW5jaGVzKCk6IEFycmF5PEJyYW5jaD4ge1xuICAgICAgICByZXR1cm4gdGhpcy5icmFuY2hlcy5zbGljZSh0aGlzLmJyYW5jaGVzTGFzdExlbmd0aCk7XG4gICAgfVxuICAgIHB1YmxpYyBnZXROZXdMZWFmcygpOiBBcnJheTxMZWFmPiB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlYWNoZWRMZWFmcy5zbGljZSh0aGlzLnJlYWNoZWRMZWFmc0xhc3RMZW5ndGgpO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRSZWFjaGVkTGVhZnMoKTogTGVhZltdIHsgcmV0dXJuIHRoaXMucmVhY2hlZExlYWZzOyB9XG4gICAgcHVibGljIGdldExlYWZzKCk6IEFycmF5PExlYWY+IHsgcmV0dXJuIHRoaXMubGVhZnM7IH1cbiAgICBwdWJsaWMgZ2V0QnJhbmNoZXMoKTogQXJyYXk8QnJhbmNoPiB7IHJldHVybiB0aGlzLmJyYW5jaGVzOyB9XG4gICAgcHVibGljIGdldFN0ZXBDb3VudCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5zdGVwQ291bnQ7IH1cblxuICAgIHB1YmxpYyBnZXQgc3RhcnRpbmdQb2ludCgpOiBWZWN0b3IyIHsgcmV0dXJuIHRoaXMub3B0aW9ucy5zdGFydGluZ1BvaW50OyB9XG4gICAgcHVibGljIGdldCBzdGFydGluZ0JyYW5jaCgpOiBCcmFuY2ggfCBudWxsIHtcbiAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucy5wYXJlbnRCcmFuY2ggPz8gbnVsbDtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IGJyYW5jaExlbmd0aCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5vcHRpb25zLmJyYW5jaExlbmd0aDsgfVxuXG4gICAgcHJpdmF0ZSBzdGVwQ291bnQ6IG51bWJlciA9IDA7XG5cbiAgICBwcml2YXRlIGJyYW5jaGVzTGFzdExlbmd0aDogbnVtYmVyID0gMDtcbiAgICBwcml2YXRlIGJyYW5jaGVzOiBCcmFuY2hbXSA9IFtdO1xuXG4gICAgcHJpdmF0ZSByZWFjaGVkTGVhZnNMYXN0TGVuZ3RoOiBudW1iZXIgPSAwO1xuICAgIHByaXZhdGUgbGVhZnM6IExlYWZbXSA9IFtdO1xuICAgIHByaXZhdGUgcmVhY2hlZExlYWZzOiBMZWFmW10gPSBbXTtcblxuICAgIHByaXZhdGUgYWN0aXZlTGVhZnM6IFNldDxMZWFmPiA9IG5ldyBTZXQoKTtcbiAgICBwcml2YXRlIGFjdGl2ZUJyYW5jaGVzOiBTZXQ8QnJhbmNoPiA9IG5ldyBTZXQoKTtcbiAgICBwcml2YXRlIG9sZEJyYW5jaGVzOiBTZXQ8QnJhbmNoPiA9IG5ldyBTZXQoKTtcblxuICAgIHByb3RlY3RlZCBvcHRpb25zOiBTcGFjZUNvbG9uaXplck9wdGlvbnM7XG59IiwiaW1wb3J0IHsgTGVhZiB9IGZyb20gXCIuL2NvbXBvbmVudHMvbGVhZi5qc1wiO1xuaW1wb3J0IHsgQnJhbmNoIH0gZnJvbSBcIi4vY29tcG9uZW50cy9icmFuY2guanNcIjtcbmltcG9ydCB7IFRyZWVQYXJ0IH0gZnJvbSBcIi4vdHJlZVBhcnRzL3RyZWVQYXJ0LmpzXCI7XG5pbXBvcnQgeyBWZWN0b3IyIH0gZnJvbSBcIi4uL3V0aWxzL2xpbmVhci92ZWN0b3IyLmpzXCI7XG5pbXBvcnQgeyBDYW52YXNIZWxwZXIgfSBmcm9tIFwiLi4vdXRpbHMvY2FudmFzSGVscGVyLmpzXCI7XG5pbXBvcnQgeyBQUk5HIH0gZnJvbSBcIi4uL3V0aWxzL3JhbmRvbS9wcm5nLmpzXCI7XG5pbXBvcnQgeyBNZXJzZW5uZVR3aXN0ZXJBZGFwdGVyIH0gZnJvbSBcIi4uL3V0aWxzL3JhbmRvbS9tZXJzZW5uZVR3aXN0ZXJBZGFwdGVyLmpzXCI7XG5pbXBvcnQgeyBBbmltYXRpb25Hcm91cCwgQW5pbWF0aW9uU3RhdGUsIHNldEFuaW1hdGlvblRpbWVvdXQsIHN0YXJ0QW5pbWF0aW9uIH0gZnJvbSBcIi4uL3V0aWxzL2FuaW1hdGlvbkhlbHBlci5qc1wiO1xuaW1wb3J0IHsgVHJlZVBhcnRJbnRlciB9IGZyb20gXCIuL3RyZWVQYXJ0cy90cmVlUGFydEludGVyLmpzXCI7XG5pbXBvcnQgeyBUcmVlUGFydEdyb3dlciB9IGZyb20gXCIuL3RyZWVQYXJ0cy90ZWVQYXJ0R3Jvd2VyLmpzXCI7XG5pbXBvcnQgeyBUcmVlUGFydExlYWYgfSBmcm9tIFwiLi90cmVlUGFydHMvdHJlZVBhcnRMZWFmLmpzXCI7XG5pbXBvcnQgeyBzZXRBbmltYXRpb25JbnRlcnZhbCB9IGZyb20gXCIuLi91dGlscy9hbmltYXRpb25IZWxwZXIuanNcIjtcblxuZXhwb3J0IGludGVyZmFjZSBUcmVlR2VuZXJhdG9yT3B0aW9ucyB7XG4gICAgZGVidWdnaW5nPzogYm9vbGVhbjtcbiAgICByZW5kZXJTY2FsaW5nPzogbnVtYmVyO1xuICAgIHNlZWQ6IG51bWJlcjtcbiAgICBwYXJlbnRDb250YWluZXI6IEhUTUxEaXZFbGVtZW50O1xuICAgIHNlcmlhbGl6ZWRKU09OPzogUmVjb3JkPHN0cmluZywgYW55Pjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJVHJlZUdlbmVyYXRvclBhcmFtZXRlcnMge1xuICAgIGFwcGVuZEVsZW1lbnQoZGl2OiBIVE1MRWxlbWVudCwgZ3Jvd1dpdGhUcmVlPzogYm9vbGVhbik6IHZvaWQ7XG4gICAgbWFya0xlYWZSZWFjaGVkKGRlcHRoOiBudW1iZXIsIGxlYWY6IExlYWYpOiB2b2lkO1xuXG4gICAgZ2V0UFJORyh0eXBlOiAnR1JPVycgfCAnRFJBVycpOiBQUk5HO1xuXG4gICAgZ2V0QW5pbWF0aW9uR3JvdXAoKTogQW5pbWF0aW9uR3JvdXA7XG5cbiAgICBnZXRTZXJpYWxpemVkS2V5KCk6IG51bWJlcjtcbiAgICBzZXRTZXJpYWxpemVkVmFsdWUoa2V5OiBudW1iZXIsIHZhbHVlOiBhbnkpOiB2b2lkO1xuICAgIGdldFNlcmlhbGl6ZWRWYWx1ZShrZXk6IG51bWJlcik6IHN0cmluZyB8IG51bWJlcjtcbiAgICBpc1NlcmlhbGl6ZWRQbGF5YmFjaygpOiBib29sZWFuO1xuICAgIFxuICAgIGdldFJlbmRlclNjYWxpbmcoKTogbnVtYmVyO1xuICAgIGdldE91dGxpbmVUaGlja25lc3MoKTogbnVtYmVyO1xuICAgIGdldFRlbXBDYW52YXMoaWR4OiBudW1iZXIpOiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQ7XG4gICAgZ2V0TGVhZlN0ZW5jaWxUZXh0dXJlKCk6IEhUTUxJbWFnZUVsZW1lbnQ7XG4gICAgZ2V0TGVhZk91dGxpbmVUZXh0dXJlKCk6IEhUTUxJbWFnZUVsZW1lbnQ7XG4gICAgZ2V0TGVhZlRleHR1cmVQYXR0ZXJuKHhPZmZzZXQ6IG51bWJlciwgeU9mZnNldDogbnVtYmVyKTogQ2FudmFzUGF0dGVybjtcbiAgICBnZXRCcmFuY2hUZXh0dXJlUGF0dGVybihncm93dGg6IFZlY3RvcjIsIHRleHR1cmVOYW1lPzogc3RyaW5nKTogQ2FudmFzUGF0dGVybjtcbiAgICBnZXRCcmFuY2hXaWR0aChkZXB0aDogbnVtYmVyLCBicmFuY2g6IEJyYW5jaCk6IG51bWJlcjtcbn1cblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFRyZWVHZW5lcmF0b3IgaW1wbGVtZW50cyBJVHJlZUdlbmVyYXRvclBhcmFtZXRlcnMge1xuICAgIHB1YmxpYyBjb25zdHJ1Y3RvcihvcHRpb25zOiBUcmVlR2VuZXJhdG9yT3B0aW9ucykge1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgICAgICB0aGlzLnBhcmVudENvbnRhaW5lciA9IHRoaXMub3B0aW9ucy5wYXJlbnRDb250YWluZXI7XG5cbiAgICAgICAgLy8gaGllcmFyY2h5IG9mIHRyYW5zZm9ybSBkaXZzXG4gICAgICAgIHRoaXMuY29udGFpbmVyQmFzZSA9IHRoaXMuY3JlYXRlVHJhbnNmb3JtQ29udGFpbmVyRGl2KCk7XG4gICAgICAgIHRoaXMuY29udGFpbmVyVHJhbnNmb3JtU2NhbGVUcmVlUGFydHMgPSB0aGlzLmNyZWF0ZVRyYW5zZm9ybUNvbnRhaW5lckRpdigpO1xuICAgICAgICB0aGlzLmNvbnRhaW5lclRyYW5zZm9ybUFsaWdubWVudCA9IHRoaXMuY3JlYXRlVHJhbnNmb3JtQ29udGFpbmVyRGl2KCk7XG5cbiAgICAgICAgdGhpcy5jb250YWluZXJCYXNlLmFwcGVuZCh0aGlzLmNvbnRhaW5lclRyYW5zZm9ybVNjYWxlVHJlZVBhcnRzKTtcbiAgICAgICAgdGhpcy5jb250YWluZXJUcmFuc2Zvcm1BbGlnbm1lbnQuYXBwZW5kKHRoaXMuY29udGFpbmVyQmFzZSk7XG5cbiAgICAgICAgdGhpcy5wYXJlbnRDb250YWluZXIuYXBwZW5kKHRoaXMuY29udGFpbmVyVHJhbnNmb3JtQWxpZ25tZW50KTtcblxuICAgICAgICAvLyBzZXR1cCBQUk5HJ3NcbiAgICAgICAgaWYgKG9wdGlvbnMuc2VyaWFsaXplZEpTT04pXG4gICAgICAgICAgICB0aGlzLnNlcmlhbGl6ZWRWYWx1ZXMgPSBvcHRpb25zLnNlcmlhbGl6ZWRKU09OO1xuXG4gICAgICAgIHRoaXMucHJuZ3MuRFJBVy5pbml0KHRoaXMub3B0aW9ucy5zZWVkKTtcbiAgICAgICAgdGhpcy5wcm5ncy5HUk9XLmluaXQodGhpcy5vcHRpb25zLnNlZWQpO1xuXG4gICAgICAgIC8vIHBlcmZvcm0gaW5pdGlhbCByZXNpemUgdG8gcGFyZW50IGNvbnRhaW5lclxuICAgICAgICB0aGlzLnJlc2l6ZVRvQ29udGFpbmVyKCk7XG5cbiAgICAgICAgLy8gc2V0dXAgcmVzaXplIGV2ZW50IGZvciBmdXR1cmUgd2luZG93IHJlc2l6ZXNcbiAgICAgICAgdGhpcy5yZXNpemVFdmVudExpc3RlbmVyID0gdGhpcy5yZXNpemVUb0NvbnRhaW5lci5iaW5kKHRoaXMpO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy5yZXNpemVFdmVudExpc3RlbmVyKTtcblxuICAgICAgICAvLyBzdGFydCBncm93IGFuaW1hdGlvblxuICAgICAgICAvLyB0aGlzLmdyb3dBbmltYXRpb24oKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2hha2UoKSB7XG4gICAgICAgIGNvbnN0IGN3ID0gdGhpcy5nZXRQUk5HKCdEUkFXJykucmFuZG9tKCkgPiAwLjU7XG4gICAgICAgIHRoaXMudHJlZVBhcnRzXG4gICAgICAgICAgICAuZmlsdGVyKHRyZWVQYXJ0ID0+IHRyZWVQYXJ0IGluc3RhbmNlb2YgVHJlZVBhcnRMZWFmKVxuICAgICAgICAgICAgLmZvckVhY2godHJlZVBhcnQgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHNoYWtlRGVsYXkgPSB0aGlzLmdldFBSTkcoJ0RSQVcnKS5mbG9hdEluUmFuZ2UoMCwgMTIwMCk7XG4gICAgICAgICAgICAgICAgdGhpcy5hbmltYXRpb25Hcm91cC5hZGRBbmltYXRpb24oXG4gICAgICAgICAgICAgICAgICAgIHNldEFuaW1hdGlvblRpbWVvdXQoe1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2s6ICgpID0+ICg8VHJlZVBhcnRMZWFmPnRyZWVQYXJ0KS5zaGFrZShjdyksXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lOiBzaGFrZURlbGF5XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHVibGljIGFzeW5jIGdyb3coKSB7XG4gICAgICAgIHdoaWxlICghdGhpcy5kZXN0cm95ZWQgJiYgIXRoaXMuaXNGaW5pc2hlZEdyb3dpbmcpIHtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuZ3Jvd1N0ZXAoKTtcbiAgICAgICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIDApKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByb3RlY3RlZCBnZXRUcmVlUGFydChicmFuY2g6IEJyYW5jaCk6IFRyZWVQYXJ0R3Jvd2VyIHtcbiAgICAgICAgbGV0IHJldFRyZWVQYXJ0OiBUcmVlUGFydEdyb3dlciB8IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKHRoaXMuYnJhbmNoVG9UcmVlUGFydC5oYXMoYnJhbmNoKSkge1xuICAgICAgICAgICAgcmV0VHJlZVBhcnQgPSB0aGlzLmJyYW5jaFRvVHJlZVBhcnQuZ2V0KGJyYW5jaCkhO1xuICAgICAgICB9IGVsc2UgaWYgKGJyYW5jaC5wYXJlbnQgJiYgdGhpcy5icmFuY2hUb1RyZWVQYXJ0LmhhcyhicmFuY2gucGFyZW50KSkge1xuICAgICAgICAgICAgcmV0VHJlZVBhcnQgPSB0aGlzLmJyYW5jaFRvVHJlZVBhcnQuZ2V0KGJyYW5jaC5wYXJlbnQpITtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldFRyZWVQYXJ0ID0gPFRyZWVQYXJ0R3Jvd2VyIHwgdW5kZWZpbmVkPnRoaXMudHJlZVBhcnRzLmZpbmQodHJlZVBhcnQgPT4gKHRyZWVQYXJ0IGluc3RhbmNlb2YgVHJlZVBhcnRHcm93ZXIpICYmICg8VHJlZVBhcnRHcm93ZXI+dHJlZVBhcnQpLmJyYW5jaGVzLmluY2x1ZGVzKGJyYW5jaCkpO1xuICAgICAgICAgICAgY29uc29sZS5hc3NlcnQocmV0VHJlZVBhcnQpO1xuICAgICAgICAgICAgcmV0VHJlZVBhcnQgPSByZXRUcmVlUGFydCE7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5icmFuY2hUb1RyZWVQYXJ0LnNldChicmFuY2gsIHJldFRyZWVQYXJ0KTtcbiAgICAgICAgcmV0dXJuIHJldFRyZWVQYXJ0O1xuICAgIH1cblxuICAgIHByaXZhdGUgY3JlYXRlVHJhbnNmb3JtQ29udGFpbmVyRGl2KCk6IEhUTUxEaXZFbGVtZW50IHtcbiAgICAgICAgY29uc3QgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgZWwuc3R5bGUud2lkdGggPSAnMTAwJSc7XG4gICAgICAgIGVsLnN0eWxlLmhlaWdodCA9ICcxMDAlJztcbiAgICAgICAgZWwuc3R5bGUubGVmdCA9ICcwcHgnO1xuICAgICAgICBlbC5zdHlsZS50b3AgPSAnMHB4JztcbiAgICAgICAgZWwuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgICAgICBlbC5zdHlsZS50cmFuc2Zvcm1PcmlnaW4gPSAndG9wIGxlZnQnO1xuICAgICAgICByZXR1cm4gZWw7XG4gICAgfVxuXG4gICAgcHVibGljIGZhZGVBbmltYXRpb24oKSB7XG4gICAgICAgIHRoaXMudHJlZVBhcnRzLmZvckVhY2goKHRyZWVQYXJ0KSA9PiB7XG4gICAgICAgICAgICB0cmVlUGFydC5mYWRlSW4oKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHVibGljIGdyb3dBbmltYXRpb24oKSB7XG4gICAgICAgIHRoaXMuY29udGFpbmVyVHJhbnNmb3JtU2NhbGVUcmVlUGFydHMuc3R5bGUudHJhbnNmb3JtT3JpZ2luID0gJzUwJSA5MCUnOyAvLzkwJSwgYXNzdW1pbmcgdmVydGljYWwgb2Zmc2V0IGZvciBhIHBvdCBvciBvdGhlciBvYnNjdXJpbmcgb2JqZWN0XG4gICAgICAgIHRoaXMuYW5pbWF0aW9uR3JvdXAuYWRkQW5pbWF0aW9uKFxuICAgICAgICAgICAgc3RhcnRBbmltYXRpb24oe1xuICAgICAgICAgICAgICAgIGFuaW1hdGU6ICh0OiBudW1iZXIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZW5kVGltZSA9IDUwMDA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHZhbCA9IE1hdGgubWF4KDAsIE1hdGgubWluKDEsICh0KSAvIChlbmRUaW1lKSkpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbnRhaW5lclRyYW5zZm9ybVNjYWxlVHJlZVBhcnRzLnN0eWxlLnNjYWxlID0gdmFsICsgJyc7XG4gICAgICAgICAgICAgICAgICAgIGlmICh2YWwgPj0gMSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBBbmltYXRpb25TdGF0ZS5ET05FO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgIClcbiAgICB9XG5cbiAgICBwdWJsaWMgZGVzdHJveSgpIHtcbiAgICAgICAgdGhpcy5kZXN0cm95ZWQgPSB0cnVlO1xuXG4gICAgICAgIHRoaXMuY29udGFpbmVyQmFzZS5yZW1vdmUoKTtcbiAgICAgICAgdGhpcy5hbmltYXRpb25Hcm91cC5jYW5jZWwoKTtcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMucmVzaXplRXZlbnRMaXN0ZW5lcik7XG4gICAgfVxuXG4gICAgcHVibGljIGFwcGVuZEVsZW1lbnQoZGl2OiBIVE1MRWxlbWVudCwgZ3JvdXBlZFdpdGhUcmVlUGFydHM6IGJvb2xlYW4gPSB0cnVlKSB7XG4gICAgICAgIGlmIChncm91cGVkV2l0aFRyZWVQYXJ0cylcbiAgICAgICAgICAgIHRoaXMuY29udGFpbmVyVHJhbnNmb3JtU2NhbGVUcmVlUGFydHMuYXBwZW5kKGRpdik7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRoaXMuY29udGFpbmVyQmFzZS5hcHBlbmQoZGl2KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHJlc2l6ZVRvQ29udGFpbmVyKCkge1xuICAgICAgICBjb25zdCBvdXRlckNvbnRhaW5lcldpZHRoID0gdGhpcy5wYXJlbnRDb250YWluZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGg7XG4gICAgICAgIGNvbnN0IG91dGVyQ29udGFpbmVySGVpZ2h0ID0gdGhpcy5wYXJlbnRDb250YWluZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0O1xuICAgICAgICBjb25zdCBpbnRlcm5hbFNpemUgPSBUcmVlR2VuZXJhdG9yLlJFRkVSRU5DRV9IRUlHSFQ7XG4gICAgICAgIGNvbnN0IHR4ID0gb3V0ZXJDb250YWluZXJXaWR0aCAvIGludGVybmFsU2l6ZTtcbiAgICAgICAgY29uc3QgdHkgPSBvdXRlckNvbnRhaW5lckhlaWdodCAvIGludGVybmFsU2l6ZTtcbiAgICAgICAgY29uc3Qgc2NhbGVUb0JvcmRlciA9ICh0eCA8IHR5KSA/IHR4IDogdHk7XG5cbiAgICAgICAgdGhpcy5jb250YWluZXJCYXNlLnN0eWxlLndpZHRoID0gYCR7aW50ZXJuYWxTaXplfXB4YDtcbiAgICAgICAgdGhpcy5jb250YWluZXJCYXNlLnN0eWxlLmhlaWdodCA9IGAke2ludGVybmFsU2l6ZX1weGA7XG4gICAgICAgIHRoaXMuY29udGFpbmVyQmFzZS5zdHlsZS50cmFuc2Zvcm0gPSBgc2NhbGUoJHtzY2FsZVRvQm9yZGVyfSlgO1xuXG4gICAgICAgIHRoaXMuY29udGFpbmVyVHJhbnNmb3JtQWxpZ25tZW50LnN0eWxlLndpZHRoID0gYCR7aW50ZXJuYWxTaXplICogc2NhbGVUb0JvcmRlcn1weGA7XG4gICAgICAgIHRoaXMuY29udGFpbmVyVHJhbnNmb3JtQWxpZ25tZW50LnN0eWxlLmhlaWdodCA9IGAke2ludGVybmFsU2l6ZSAqIHNjYWxlVG9Cb3JkZXJ9cHhgO1xuXG4gICAgICAgIGlmICh0eCA8IHR5KSB7XG4gICAgICAgICAgICAvLyBzY2FsZSB0byBYXG4gICAgICAgICAgICB0aGlzLmNvbnRhaW5lclRyYW5zZm9ybUFsaWdubWVudC5zdHlsZS50b3AgPSAnJztcbiAgICAgICAgICAgIHRoaXMuY29udGFpbmVyVHJhbnNmb3JtQWxpZ25tZW50LnN0eWxlLmJvdHRvbSA9ICcwcHgnO1xuICAgICAgICAgICAgdGhpcy5jb250YWluZXJUcmFuc2Zvcm1BbGlnbm1lbnQuc3R5bGUubGVmdCA9ICcwcHgnO1xuICAgICAgICAgICAgdGhpcy5jb250YWluZXJUcmFuc2Zvcm1BbGlnbm1lbnQuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgwLCAwKSc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBzY2FsZSB0byBZXG4gICAgICAgICAgICB0aGlzLmNvbnRhaW5lclRyYW5zZm9ybUFsaWdubWVudC5zdHlsZS50b3AgPSAnMHB4JztcbiAgICAgICAgICAgIHRoaXMuY29udGFpbmVyVHJhbnNmb3JtQWxpZ25tZW50LnN0eWxlLmxlZnQgPSAnNTAlJztcbiAgICAgICAgICAgIHRoaXMuY29udGFpbmVyVHJhbnNmb3JtQWxpZ25tZW50LnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoLTUwJSwgMCknO1xuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICBwdWJsaWMgb25GaW5pc2hlZEdyb3dpbmcoKSB7IFxuICAgICAgICB0aGlzLmFuaW1hdGlvbkdyb3VwLmFkZEFuaW1hdGlvbihcbiAgICAgICAgICAgIHNldEFuaW1hdGlvbkludGVydmFsKHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjazogKCkgPT4gdGhpcy5zaGFrZSgpLFxuICAgICAgICAgICAgICAgIHRpbWU6IDIwMDBcbiAgICAgICAgICAgIH0pXG4gICAgICAgICk7XG5cbiAgICAgICAgY29uc29sZS5sb2coYEdyb3dpbmcgY29tcGxldGVkLmApO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRSZW5kZXJTY2FsaW5nKCk6IG51bWJlciB7IHJldHVybiB0aGlzLm9wdGlvbnMucmVuZGVyU2NhbGluZyA/PyAxOyB9XG5cbiAgICBwdWJsaWMgYWJzdHJhY3QgZ2V0T3V0bGluZVRoaWNrbmVzcygpOiBudW1iZXI7XG5cbiAgICBwdWJsaWMgYWJzdHJhY3QgZ2V0QnJhbmNoVGV4dHVyZVBhdHRlcm4oZ3Jvd3RoOiBWZWN0b3IyLCB0ZXh0dXJlTmFtZT86IHN0cmluZyk6IENhbnZhc1BhdHRlcm47XG5cbiAgICBwdWJsaWMgYWJzdHJhY3QgZ2V0TGVhZlN0ZW5jaWxUZXh0dXJlKCk6IEhUTUxJbWFnZUVsZW1lbnQ7XG5cbiAgICBwdWJsaWMgYWJzdHJhY3QgZ2V0TGVhZk91dGxpbmVUZXh0dXJlKCk6IEhUTUxJbWFnZUVsZW1lbnQ7XG5cbiAgICBwdWJsaWMgYWJzdHJhY3QgZ2V0TGVhZlRleHR1cmVQYXR0ZXJuKCk6IENhbnZhc1BhdHRlcm47XG5cbiAgICBwdWJsaWMgYWJzdHJhY3QgbWFya0xlYWZSZWFjaGVkKGRlcHRoOiBudW1iZXIsIGxlYWY6IExlYWYpOiB2b2lkO1xuXG4gICAgcHVibGljIGFic3RyYWN0IGdldEJyYW5jaFdpZHRoKGRlcHRoOiBudW1iZXIsIGJyYW5jaDogQnJhbmNoKTogbnVtYmVyO1xuXG4gICAgcHVibGljIGdyb3dTdGVwKCkge1xuICAgICAgICBjb25zb2xlLmFzc2VydCghdGhpcy5pc0ZpbmlzaGVkR3Jvd2luZyk7XG5cbiAgICAgICAgLy8gY2hlY2sgaWYgYWxsIHBhcnRzIGFuZCB0aGVyZWZvcmUgdGhlIHRyZWUgYXJlIGZpbmlzaGVkIGdyb3dpbmdcbiAgICAgICAgdGhpcy5pc0ZpbmlzaGVkR3Jvd2luZyA9IHRoaXMudHJlZVBhcnRzLmV2ZXJ5KCh0cmVlUGFydCkgPT4gISh0cmVlUGFydCBpbnN0YW5jZW9mIFRyZWVQYXJ0R3Jvd2VyKSB8fCB0cmVlUGFydC5pc0ZpbmlzaGVkR3Jvd2luZygpKTtcbiAgICAgICAgaWYgKHRoaXMuaXNGaW5pc2hlZEdyb3dpbmcpIHtcbiAgICAgICAgICAgIHRoaXMub25GaW5pc2hlZEdyb3dpbmcoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGdyb3cgaW5kaXZpZHVhbCB0cmVlcGFydHNcbiAgICAgICAgdGhpcy50cmVlUGFydHMuZm9yRWFjaCh0cmVlUGFydCA9PiB7XG4gICAgICAgICAgICBpZiAoISh0cmVlUGFydCBpbnN0YW5jZW9mIFRyZWVQYXJ0R3Jvd2VyKSkge1xuICAgICAgICAgICAgICAgIHRyZWVQYXJ0LmRyYXcoKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmICh0cmVlUGFydC5pc0ZpbmlzaGVkR3Jvd2luZygpKVxuICAgICAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICAgICAgdHJlZVBhcnQuc3RlcCgpO1xuICAgICAgICAgICAgdHJlZVBhcnQuZHJhdygpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0VGVtcENhbnZhcyhpZHg6IG51bWJlcik6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCB7XG4gICAgICAgIGNvbnN0IGN0eCA9IHRoaXMudGVtcENhbnZhc1tpZHhdO1xuICAgICAgICBjdHguY2xlYXJSZWN0KDAsIDAsIGN0eC5jYW52YXMud2lkdGgsIGN0eC5jYW52YXMuaGVpZ2h0KTtcbiAgICAgICAgcmV0dXJuIGN0eDtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0U2VyaWFsaXplZEtleSgpOiBudW1iZXIgIHsgXG4gICAgICAgIHJldHVybiB0aGlzLnNlcmlhbGl6ZWRJZHhLZXkrKztcbiAgICB9XG4gICAgcHVibGljIHNldFNlcmlhbGl6ZWRWYWx1ZShrZXk6IG51bWJlciwgdmFsdWU6IGFueSkgIHsgXG4gICAgICAgIHRoaXMuc2VyaWFsaXplZFZhbHVlc1trZXldID0gdmFsdWU7XG4gICAgfVxuICAgIHB1YmxpYyBnZXRTZXJpYWxpemVkVmFsdWUoa2V5OiBudW1iZXIpOiBzdHJpbmcgfCBudW1iZXIge1xuICAgICAgICBjb25zdCB2YWx1ZSA9IHRoaXMuc2VyaWFsaXplZFZhbHVlc1trZXldO1xuICAgICAgICBjb25zb2xlLmFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkLCBgU2VyaWFsaXplZCB2YWx1ZSBhdHRlbXB0aW5nIHRvIGJlIHJlYWQgYmFjayB0aGF0IGRvZXNuJ3QgZXhpc3QuIEFyZSB3ZSBpbi1zeW5jP2ApO1xuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuXG4gICAgcHVibGljIGdldFNlcmlhbGl6ZWRKU09OKCk6IHN0cmluZyB7XG4gICAgICAgIHRoaXMudHJlZVBhcnRzLmZvckVhY2godHJlZVBhcnQgPT4ge1xuICAgICAgICAgICAgdHJlZVBhcnQuc2VyaWFsaXplKCk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodGhpcy5zZXJpYWxpemVkVmFsdWVzKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgaXNTZXJpYWxpemVkUGxheWJhY2soKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiAodGhpcy5vcHRpb25zLnNlcmlhbGl6ZWRKU09OICE9PSB1bmRlZmluZWQpO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRQUk5HKHR5cGU6ICdHUk9XJyB8ICdEUkFXJykge1xuICAgICAgICByZXR1cm4gdGhpcy5wcm5nc1t0eXBlXTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0QW5pbWF0aW9uR3JvdXAoKTogQW5pbWF0aW9uR3JvdXAge1xuICAgICAgICByZXR1cm4gdGhpcy5hbmltYXRpb25Hcm91cDtcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IFJFRkVSRU5DRV9IRUlHSFQ6IG51bWJlciA9IDEwMjQ7XG5cbiAgICBwcml2YXRlIHJlc2l6ZUV2ZW50TGlzdGVuZXI6ICgpID0+IHZvaWQ7XG5cbiAgICBwcm90ZWN0ZWQgdHJlZVBhcnRzOiBBcnJheTxUcmVlUGFydD4gPSBbXTtcblxuICAgIHByaXZhdGUgYnJhbmNoVG9UcmVlUGFydDogTWFwPEJyYW5jaCwgVHJlZVBhcnRHcm93ZXI+ID0gbmV3IE1hcCgpO1xuXG4gICAgcHJpdmF0ZSBwcm5ncyA9IHtcbiAgICAgICAgJ0dST1cnOiBuZXcgTWVyc2VubmVUd2lzdGVyQWRhcHRlcigpLFxuICAgICAgICAnRFJBVyc6IG5ldyBNZXJzZW5uZVR3aXN0ZXJBZGFwdGVyKClcbiAgICB9O1xuICAgIFxuICAgIHByaXZhdGUgZGVzdHJveWVkOiBib29sZWFuID0gZmFsc2U7XG5cbiAgICBwcml2YXRlIGFuaW1hdGlvbkdyb3VwOiBBbmltYXRpb25Hcm91cCA9IG5ldyBBbmltYXRpb25Hcm91cCgpO1xuICAgIFxuICAgIHByaXZhdGUgc2VyaWFsaXplZElkeEtleTogbnVtYmVyID0gMDtcbiAgICBwcml2YXRlIHNlcmlhbGl6ZWRWYWx1ZXM6IFJlY29yZDxzdHJpbmcsIGFueT4gPSB7fTtcblxuICAgIHByb3RlY3RlZCBpc0ZpbmlzaGVkR3Jvd2luZzogYm9vbGVhbiA9IGZhbHNlO1xuICAgIHByaXZhdGUgcGFyZW50Q29udGFpbmVyOiBIVE1MRGl2RWxlbWVudDtcblxuICAgIHByaXZhdGUgY29udGFpbmVyQmFzZTogSFRNTERpdkVsZW1lbnQ7XG4gICAgcHJpdmF0ZSBjb250YWluZXJUcmFuc2Zvcm1BbGlnbm1lbnQ6IEhUTUxEaXZFbGVtZW50O1xuICAgIHByaXZhdGUgY29udGFpbmVyVHJhbnNmb3JtU2NhbGVUcmVlUGFydHM6IEhUTUxEaXZFbGVtZW50O1xuXG4gICAgcHJpdmF0ZSB0ZW1wQ2FudmFzOiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkRbXSA9IG5ldyBBcnJheSgzKS5maWxsKG51bGwpLm1hcCh4ID0+IENhbnZhc0hlbHBlci5jcmVhdGVUZW1wQ2FudmFzKDIwMCwgMjAwKSk7XG4gICAgcHJpdmF0ZSBvcHRpb25zOiBUcmVlR2VuZXJhdG9yT3B0aW9ucztcbn1cbiIsImltcG9ydCB7IEJCb3ggfSBmcm9tIFwiLi4vLi4vdXRpbHMvbGluZWFyL2Jib3hcIjtcbmltcG9ydCB7IFZlY3RvcjIgfSBmcm9tIFwiLi4vLi4vdXRpbHMvbGluZWFyL3ZlY3RvcjJcIjtcbmltcG9ydCB7IFRyZWVHZW5lcmF0b3IgfSBmcm9tIFwiLi4vdHJlZUdlbmVyYXRvclwiO1xuaW1wb3J0IHsgQ2FudmFzTGF5ZXIsIFRyZWVQYXJ0LCBUcmVlUGFydE9wdGlvbnMgfSBmcm9tIFwiLi90cmVlUGFydFwiO1xuXG5leHBvcnQgaW50ZXJmYWNlIFN0YXRpY1RyZWVQYXJ0T3B0aW9ucyBleHRlbmRzIFRyZWVQYXJ0T3B0aW9ucyB7XG4gICAgaW1hZ2U6IEhUTUxJbWFnZUVsZW1lbnQsXG59XG5leHBvcnQgaW50ZXJmYWNlIFN0YXRpY1RyZWVQYXJ0RmFjdG9yeU9wdGlvbnMge1xuICAgIHRyZWVHZW5lcmF0b3I6IFRyZWVHZW5lcmF0b3IsIFxuICAgIHpJbmRleDogbnVtYmVyLCBcbiAgICBwb3M6IFZlY3RvcjIsIFxuICAgIGltYWdlOiBIVE1MSW1hZ2VFbGVtZW50LFxufVxuXG5leHBvcnQgY2xhc3MgU3RhdGljVHJlZVBhcnQgZXh0ZW5kcyBUcmVlUGFydCB7XG4gICAgcHVibGljIHN0YXRpYyBmcm9tSW1hZ2Uob3B0aW9uczogU3RhdGljVHJlZVBhcnRGYWN0b3J5T3B0aW9ucyk6IFN0YXRpY1RyZWVQYXJ0IHtcbiAgICAgICAgY29uc3Qgc3RhdGljVHJlZVBhcnQgPSBuZXcgU3RhdGljVHJlZVBhcnQoe1xuICAgICAgICAgICAgdHJlZUdlbmVyYXRvcjogb3B0aW9ucy50cmVlR2VuZXJhdG9yLFxuICAgICAgICAgICAgaW1hZ2U6IG9wdGlvbnMuaW1hZ2UsXG4gICAgICAgICAgICBiYm94OiBuZXcgQkJveChvcHRpb25zLnBvcy5jbG9uZSgpLCBvcHRpb25zLnBvcy5jbG9uZSgpLmFkZEluUGxhY2VGcm9tRmxvYXRzKG9wdGlvbnMuaW1hZ2Uud2lkdGgsIG9wdGlvbnMuaW1hZ2UuaGVpZ2h0KSksXG4gICAgICAgICAgICBvcmlnaW46IG9wdGlvbnMucG9zLFxuICAgICAgICAgICAgekluZGV4OiBvcHRpb25zLnpJbmRleCxcbiAgICAgICAgICAgIGdyb3dXaXRoVHJlZTogZmFsc2VcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBzdGF0aWNUcmVlUGFydDtcbiAgICB9XG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihvcHRpb25zOiBTdGF0aWNUcmVlUGFydE9wdGlvbnMpIHtcbiAgICAgICAgc3VwZXIob3B0aW9ucyk7XG4gICAgICAgIHRoaXMuc3RhdGljT3B0aW9ucyA9IG9wdGlvbnM7XG5cbiAgICAgICAgdGhpcy5pbWdMYXllciA9IHRoaXMuY3JlYXRlQ2FudmFzTGF5ZXIoKTtcbiAgICB9XG4gICAgcHJvdGVjdGVkIGRyYXdMYXllcnMoKSB7XG4gICAgICAgIGlmICh0aGlzLmRyYXduKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB0aGlzLmRyYXdXaXRoVHJhbnNmb3JtKHRoaXMuaW1nTGF5ZXIuY2FudmFzLCAoY3R4KSA9PiB0aGlzLmRyYXdJbWdMYXllcihjdHgpKTtcbiAgICAgICAgdGhpcy5kcmF3biA9IHRydWU7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBkcmF3SW1nTGF5ZXIoY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQpIHtcbiAgICAgICAgY3R4LmRyYXdJbWFnZSh0aGlzLnN0YXRpY09wdGlvbnMuaW1hZ2UsIHRoaXMub3B0aW9ucy5iYm94Lm1pbkNvcm5lci54LCB0aGlzLm9wdGlvbnMuYmJveC5taW5Db3JuZXIueSwgdGhpcy5vcHRpb25zLmJib3gud2lkdGgsIHRoaXMub3B0aW9ucy5iYm94LmhlaWdodCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdGF0aWNPcHRpb25zOiBTdGF0aWNUcmVlUGFydE9wdGlvbnM7XG5cbiAgICBwcml2YXRlIGRyYXduOiBib29sZWFuID0gZmFsc2U7XG4gICAgXG4gICAgcHJpdmF0ZSBpbWdMYXllcjogQ2FudmFzTGF5ZXI7XG59IiwiaW1wb3J0IHsgQnJhbmNoIH0gZnJvbSBcIi4uL2NvbXBvbmVudHMvYnJhbmNoLmpzXCI7XG5pbXBvcnQgeyBCQm94IH0gZnJvbSBcIi4uLy4uL3V0aWxzL2xpbmVhci9iYm94LmpzXCI7XG5pbXBvcnQgeyBCcmFuY2hHcm93ZXIgfSBmcm9tIFwiLi4vYnJhbmNoR3Jvd2VyLmpzXCJcbmltcG9ydCB7IFRyZWVQYXJ0LCBUcmVlUGFydE9wdGlvbnMsIENhbnZhc0xheWVyIH0gZnJvbSBcIi4vdHJlZVBhcnQuanNcIjtcbmltcG9ydCB7IExlYWYgfSBmcm9tIFwiLi4vY29tcG9uZW50cy9sZWFmLmpzXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgVHJlZVBhcnRHcm93ZXJPcHRpb25zIGV4dGVuZHMgVHJlZVBhcnRPcHRpb25zIHtcbiAgICBicmFuY2hHcm93ZXI6IEJyYW5jaEdyb3dlclxufVxuXG5leHBvcnQgY2xhc3MgVHJlZVBhcnRHcm93ZXIgZXh0ZW5kcyBUcmVlUGFydCB7XG4gICAgcHVibGljIGNvbnN0cnVjdG9yKG9wdGlvbnM6IFRyZWVQYXJ0R3Jvd2VyT3B0aW9ucykge1xuICAgICAgICBzdXBlcihvcHRpb25zKTtcbiAgICAgICAgdGhpcy5ncm93ZXJPcHRpb25zID0gb3B0aW9ucztcblxuICAgICAgICB0aGlzLmNsaXBwZWRCb3VuZHMgPSBuZXcgQkJveChvcHRpb25zLm9yaWdpbiwgb3B0aW9ucy5vcmlnaW4pO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5icmFuY2hMYXllciA9IHRoaXMuY3JlYXRlQ2FudmFzTGF5ZXIoKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IHN0YXJ0aW5nQnJhbmNoV2lkdGgoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3N0YXJ0aW5nQnJhbmNoV2lkdGg7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgZ2V0IGJyYW5jaGVzKCk6IEJyYW5jaFtdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ3Jvd2VyT3B0aW9ucy5icmFuY2hHcm93ZXIuZ2V0QnJhbmNoZXMoKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IGxlYWZzKCk6IExlYWZbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdyb3dlck9wdGlvbnMuYnJhbmNoR3Jvd2VyLmdldExlYWZzKCk7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXJ0KCkge1xuICAgICAgICBjb25zdCBzdGFydGluZ0JyYW5jaCA9IHRoaXMuZ3Jvd2VyT3B0aW9ucy5icmFuY2hHcm93ZXIuc3RhcnRpbmdCcmFuY2g7XG4gICAgICAgIHRoaXMuX3N0YXJ0aW5nQnJhbmNoV2lkdGggPSBzdGFydGluZ0JyYW5jaD8uYnJhbmNoV2lkdGggPz8gMDtcblxuICAgICAgICB0aGlzLmdyb3dlck9wdGlvbnMuYnJhbmNoR3Jvd2VyLnN0YXJ0KCk7XG4gICAgfVxuXG4gICAgcHVibGljIHN0ZXAoKSB7XG4gICAgICAgIHRoaXMuZ3Jvd2VyT3B0aW9ucy5icmFuY2hHcm93ZXIuc3RlcCgpO1xuICAgICAgICBjb25zdCBuZXdCcmFuY2hlcyA9IHRoaXMuZ3Jvd2VyT3B0aW9ucy5icmFuY2hHcm93ZXIuZ2V0TmV3QnJhbmNoZXMoKTtcblxuICAgICAgICBpZiAodGhpcy5ncm93ZXJPcHRpb25zLmJyYW5jaEdyb3dlci5pc0ZpbmlzaGVkR3Jvd2luZygpKSB7XG4gICAgICAgICAgICB0aGlzLm9uRmluaXNoZWRHcm93aW5nKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgaXNGaW5pc2hlZEdyb3dpbmcoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLmdyb3dlck9wdGlvbnMuYnJhbmNoR3Jvd2VyLmlzRmluaXNoZWRHcm93aW5nKCk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGFmdGVyRHJhd0xheWVycygpOiB2b2lkIHtcbiAgICAgICAgc3VwZXIuYWZ0ZXJEcmF3TGF5ZXJzKCk7XG5cbiAgICAgICAgaWYgKHRoaXMuZmluaXNoZWRHcm93aW5nKSB7XG4gICAgICAgICAgICB0aGlzLmNsaXBDb250YWluZXJEaXYodGhpcy5jbGlwcGVkQm91bmRzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByb3RlY3RlZCBvbkZpbmlzaGVkR3Jvd2luZygpIHtcbiAgICAgICAgY29uc29sZS5hc3NlcnQoIXRoaXMuZmluaXNoZWRHcm93aW5nKTtcblxuICAgICAgICB0aGlzLmZpbmlzaGVkR3Jvd2luZyA9IHRydWU7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBkcmF3QnJhbmNoZXMoY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQpIHtcbiAgICAgICAgY29uc3QgbmV3QnJhbmNoZXMgPSB0aGlzLmdyb3dlck9wdGlvbnMuYnJhbmNoR3Jvd2VyLmdldE5ld0JyYW5jaGVzKCk7XG5cbiAgICAgICAgbmV3QnJhbmNoZXMuZm9yRWFjaCgoYnJhbmNoKSA9PiBcbiAgICAgICAgICAgIGJyYW5jaC5kcmF3KGN0eClcbiAgICAgICAgKTtcblxuICAgICAgICBuZXdCcmFuY2hlcy5mb3JFYWNoKChicmFuY2gpID0+IHtcbiAgICAgICAgICAgIHRoaXMuY2xpcHBlZEJvdW5kcy5tYXhpbWl6ZUFnYWluc3RQb2ludChicmFuY2gucG9zaXRpb24pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgZHJhd0xheWVycygpIHtcbiAgICAgICAgdGhpcy5kcmF3V2l0aFRyYW5zZm9ybSh0aGlzLmJyYW5jaExheWVyLmNhbnZhcywgKGN0eCkgPT4gdGhpcy5kcmF3QnJhbmNoZXMoY3R4KSk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGdyb3dlck9wdGlvbnM6IFRyZWVQYXJ0R3Jvd2VyT3B0aW9ucztcblxuICAgIHByaXZhdGUgX3N0YXJ0aW5nQnJhbmNoV2lkdGg6IG51bWJlciA9IDA7XG5cbiAgICBwcml2YXRlIGZpbmlzaGVkR3Jvd2luZzogYm9vbGVhbiA9IGZhbHNlO1xuXG4gICAgcHJpdmF0ZSBjbGlwcGVkQm91bmRzOiBCQm94O1xuXG4gICAgcHJpdmF0ZSBicmFuY2hMYXllcjogQ2FudmFzTGF5ZXI7XG59IiwiaW1wb3J0IHsgSVRyZWVHZW5lcmF0b3JQYXJhbWV0ZXJzIH0gZnJvbSBcIi4uL3RyZWVHZW5lcmF0b3IuanNcIjtcbmltcG9ydCB7IEJCb3ggfSBmcm9tIFwiLi4vLi4vdXRpbHMvbGluZWFyL2Jib3guanNcIjtcbmltcG9ydCB7IEFuaW1hdGlvblN0YXRlLCBzdGFydEFuaW1hdGlvbiB9IGZyb20gXCIuLi8uLi91dGlscy9hbmltYXRpb25IZWxwZXIuanNcIjtcbmltcG9ydCB7IFZlY3RvcjIgfSBmcm9tIFwiLi4vLi4vdXRpbHMvbGluZWFyL3ZlY3RvcjIuanNcIjtcblxuXG5leHBvcnQgaW50ZXJmYWNlIENhbnZhc0xheWVyIHtcbiAgICB1aWQ6IG51bWJlcjtcbiAgICBjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFRyZWVQYXJ0T3B0aW9ucyB7XG4gICAgdHJlZUdlbmVyYXRvcjogSVRyZWVHZW5lcmF0b3JQYXJhbWV0ZXJzLFxuICAgIGJib3g6IEJCb3gsXG5cbiAgICBvdmVyZHJhd1dpZHRoPzogbnVtYmVyO1xuICAgIGRlcHRoPzogbnVtYmVyO1xuICAgIG9yaWdpbjogVmVjdG9yMjtcbiAgICB6SW5kZXg/OiBudW1iZXI7XG4gICAgZ3Jvd1dpdGhUcmVlPzogYm9vbGVhbjtcbiAgICBmYWRlSW4/OiBib29sZWFuO1xufVxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgVHJlZVBhcnQge1xuICAgIHB1YmxpYyBjb25zdHJ1Y3RvcihvcHRpb25zOiBUcmVlUGFydE9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcblxuICAgICAgICB0aGlzLmNvbnRhaW5lckRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICB0aGlzLmNvbnRhaW5lckRpdi5zdHlsZS5wb2ludGVyRXZlbnRzID0gJ25vbmUnO1xuICAgICAgICBvcHRpb25zLnRyZWVHZW5lcmF0b3IuYXBwZW5kRWxlbWVudCh0aGlzLmNvbnRhaW5lckRpdiwgb3B0aW9ucy5ncm93V2l0aFRyZWUpO1xuICAgICAgICB0aGlzLnNldENvbnRhaW5lckRpdkF0dHJpYnV0ZXMoKTtcbiAgICB9XG4gICAgXG4gICAgcHVibGljIGluaXQoKSB7XG4gICAgICAgIGNvbnN0IHBsYXlpbmdCYWNrID0gdGhpcy5vcHRpb25zLnRyZWVHZW5lcmF0b3IuaXNTZXJpYWxpemVkUGxheWJhY2soKTtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5mYWRlSW4gJiYgcGxheWluZ0JhY2spXG4gICAgICAgICAgICB0aGlzLmZhZGVJbigpO1xuICAgIH1cblxuICAgIHB1YmxpYyBpc1Rlcm1pbmFsKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcHVibGljIGZhZGVJbigpIHtcbiAgICAgICAgY29uc3QgYW5pbWF0aW9uR3JvdXAgPSB0aGlzLm9wdGlvbnMudHJlZUdlbmVyYXRvci5nZXRBbmltYXRpb25Hcm91cCgpO1xuXG4gICAgICAgIC8vIGZhZGUgaW4gbGVhZnMgYW5kIGJyYW5jaGVzXG4gICAgICAgIHRoaXMuY2FudmFzTGF5ZXJzLmZvckVhY2goY2FudmFzTGF5ZXIgPT4ge1xuICAgICAgICAgICAgY29uc3QgRkFERV9FTkRfVElNRTogbnVtYmVyID0gNTAwO1xuICAgICAgICAgICAgY29uc3QgY2FudmFzID0gY2FudmFzTGF5ZXIuY2FudmFzO1xuICAgICAgICAgICAgY2FudmFzLnN0eWxlLm9wYWNpdHkgPSAnMC4wMCc7XG5cbiAgICAgICAgICAgIGFuaW1hdGlvbkdyb3VwLmFkZEFuaW1hdGlvbihcbiAgICAgICAgICAgICAgICBzdGFydEFuaW1hdGlvbih7XG4gICAgICAgICAgICAgICAgICAgIGFuaW1hdGU6ICh0OiBudW1iZXIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHZhbCA9IE1hdGgubWluKDEsIE1hdGgubWF4KDAsIHQgLyBGQURFX0VORF9USU1FKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYW52YXMuc3R5bGUub3BhY2l0eSA9IHZhbCsnJztcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2YWwgPj0gMSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gQW5pbWF0aW9uU3RhdGUuRE9ORTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICApO1xuICAgICAgICB9KVxuICAgIH1cblxuICAgIHByb3RlY3RlZCBjcmVhdGVDYW52YXNMYXllcigpOiBDYW52YXNMYXllciB7XG4gICAgICAgIGNvbnN0IGxheWVyRGF0YSA9IHtcbiAgICAgICAgICAgIHVpZDogdGhpcy5vcHRpb25zLnRyZWVHZW5lcmF0b3IuZ2V0U2VyaWFsaXplZEtleSgpLFxuICAgICAgICAgICAgZGlydHk6IGZhbHNlLFxuICAgICAgICAgICAgY2FudmFzOiB0aGlzLmNyZWF0ZUNhbnZhcygpXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy50cmVlR2VuZXJhdG9yLmlzU2VyaWFsaXplZFBsYXliYWNrKCkpIHtcbiAgICAgICAgICAgIGNvbnN0IGN0eCA9IGxheWVyRGF0YS5jYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpITtcbiAgICAgICAgICAgIGNvbnN0IGltYWdlID0gbmV3IEltYWdlKCk7XG4gICAgICAgICAgICBjb25zdCBzZXJpYWxpemVkVmFsdWUgPSA8c3RyaW5nPnRoaXMub3B0aW9ucy50cmVlR2VuZXJhdG9yLmdldFNlcmlhbGl6ZWRWYWx1ZShsYXllckRhdGEudWlkKTtcbiAgICAgICAgICAgIGltYWdlLm9ubG9hZCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICBjdHguZHJhd0ltYWdlKGltYWdlLCAwLCAwLCBjdHguY2FudmFzLndpZHRoLCBjdHguY2FudmFzLmhlaWdodCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaWYgKHNlcmlhbGl6ZWRWYWx1ZSlcbiAgICAgICAgICAgICAgICBpbWFnZS5zcmMgPSA8c3RyaW5nPnNlcmlhbGl6ZWRWYWx1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuY2FudmFzTGF5ZXJzLnB1c2gobGF5ZXJEYXRhKTtcbiAgICAgICAgdGhpcy5jb250YWluZXJEaXYuYXBwZW5kQ2hpbGQobGF5ZXJEYXRhLmNhbnZhcyk7XG5cbiAgICAgICAgcmV0dXJuIGxheWVyRGF0YTtcbiAgICB9XG4gICAgXG4gICAgcHJpdmF0ZSBjcmVhdGVDYW52YXMoKTogSFRNTENhbnZhc0VsZW1lbnQge1xuICAgICAgICBjb25zdCByZW5kZXJTY2FsYXIgPSB0aGlzLm9wdGlvbnMudHJlZUdlbmVyYXRvci5nZXRSZW5kZXJTY2FsaW5nKCk7XG4gICAgICAgIGNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgICAgICBjYW52YXMuc2V0QXR0cmlidXRlKCd3aWR0aCcsICh0aGlzLm9wdGlvbnMuYmJveC53aWR0aCArIFRyZWVQYXJ0LkNBTlZBU19CVUZGRVJfTUFSR0lOKSAqIHJlbmRlclNjYWxhciArICcnKTtcbiAgICAgICAgY2FudmFzLnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgKHRoaXMub3B0aW9ucy5iYm94LmhlaWdodCArICBUcmVlUGFydC5DQU5WQVNfQlVGRkVSX01BUkdJTikgKiByZW5kZXJTY2FsYXIgKyAnJyk7XG4gICAgICAgIGNhbnZhcy5zdHlsZS5wb2ludGVyRXZlbnRzID0gJ25vbmUnO1xuICAgICAgICBjYW52YXMuc3R5bGUud2lkdGggPSB0aGlzLm9wdGlvbnMuYmJveC53aWR0aCArIFRyZWVQYXJ0LkNBTlZBU19CVUZGRVJfTUFSR0lOICsgJ3B4JztcbiAgICAgICAgY2FudmFzLnN0eWxlLmhlaWdodCA9IHRoaXMub3B0aW9ucy5iYm94LmhlaWdodCArIFRyZWVQYXJ0LkNBTlZBU19CVUZGRVJfTUFSR0lOICsgJ3B4JztcbiAgICAgICAgY2FudmFzLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICAgICAgY2FudmFzLnN0eWxlLmxlZnQgPSAoVHJlZVBhcnQuQ0FOVkFTX0JVRkZFUl9NQVJHSU4gKiAtMC41KSArICdweCc7XG4gICAgICAgIGNhbnZhcy5zdHlsZS50b3AgPSAoVHJlZVBhcnQuQ0FOVkFTX0JVRkZFUl9NQVJHSU4gKiAtMC41KSArICdweCc7XG4gICAgICAgIHJldHVybiBjYW52YXM7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIHBpeGVsc1RvUmVsYXRpdmUoeDogbnVtYmVyLCB5OiBudW1iZXIpOiBWZWN0b3IyIHtcbiAgICAgICAgcmV0dXJuIG5ldyBWZWN0b3IyKFxuICAgICAgICAgICAgKHggLSB0aGlzLm9wdGlvbnMuYmJveC5taW5Db3JuZXIueCkgLyB0aGlzLm9wdGlvbnMuYmJveC53aWR0aCxcbiAgICAgICAgICAgICh5IC0gdGhpcy5vcHRpb25zLmJib3gubWluQ29ybmVyLnkpIC8gdGhpcy5vcHRpb25zLmJib3guaGVpZ2h0XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcHVibGljIHNldENvbnRhaW5lckRpdkF0dHJpYnV0ZXMoKSB7XG4gICAgICAgIHRoaXMuY29udGFpbmVyRGl2LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICAgICAgdGhpcy5jb250YWluZXJEaXYuc3R5bGUubGVmdCA9IHRoaXMub3B0aW9ucy5iYm94Lm1pbkNvcm5lci54ICsgJ3B4JztcbiAgICAgICAgdGhpcy5jb250YWluZXJEaXYuc3R5bGUudG9wID0gdGhpcy5vcHRpb25zLmJib3gubWluQ29ybmVyLnkgKyAncHgnO1xuICAgICAgICB0aGlzLmNvbnRhaW5lckRpdi5zdHlsZS53aWR0aCA9IHRoaXMub3B0aW9ucy5iYm94LndpZHRoICsgJ3B4JztcbiAgICAgICAgdGhpcy5jb250YWluZXJEaXYuc3R5bGUuaGVpZ2h0ID0gdGhpcy5vcHRpb25zLmJib3guaGVpZ2h0ICsgJ3B4JztcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5vcmlnaW4pIHtcbiAgICAgICAgICAgIGNvbnN0IHRyYW5zZm9ybU9yaWdpbiA9IHRoaXMucGl4ZWxzVG9SZWxhdGl2ZSh0aGlzLm9wdGlvbnMub3JpZ2luLngsIHRoaXMub3B0aW9ucy5vcmlnaW4ueSk7XG4gICAgICAgICAgICB0aGlzLmNvbnRhaW5lckRpdi5zdHlsZS50cmFuc2Zvcm1PcmlnaW4gPSBgXG4gICAgICAgICAgICAgICAgJHt0cmFuc2Zvcm1PcmlnaW4ueCAqIDEwMCArICclJ31cbiAgICAgICAgICAgICAgICAke3RyYW5zZm9ybU9yaWdpbi55ICogMTAwICsgJyUnfVxuICAgICAgICAgICAgYDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNvbnRhaW5lckRpdi5zdHlsZS50cmFuc2Zvcm0gPSBgcm90YXRlKCR7dGhpcy5iYXNlQW5nbGV9cmFkKWA7XG4gICAgICAgIHRoaXMuY29udGFpbmVyRGl2LnN0eWxlLnpJbmRleCA9ICgodGhpcy5vcHRpb25zLnpJbmRleCA/PyAwKSArICgodGhpcy5vcHRpb25zLmRlcHRoID8/IDApIC8gMTAwKSkgKyAnJztcbiAgICAgICAgdGhpcy5jb250YWluZXJEaXYuc3R5bGUuYm94U2l6aW5nID0gJ2JvcmRlci1ib3gnO1xuICAgIH1cblxuICAgIHB1YmxpYyBjbGlwQ29udGFpbmVyRGl2KHRhcmdldEJvdW5kczogQkJveCkge1xuICAgICAgICBjb25zdCBiYm94QSA9IHRoaXMub3B0aW9ucy5iYm94O1xuICAgICAgICBcbiAgICAgICAgY29uc3QgYmJveERpZmZYID0gdGFyZ2V0Qm91bmRzLm1pbkNvcm5lci54IC0gYmJveEEubWluQ29ybmVyLng7XG4gICAgICAgIGNvbnN0IGJib3hEaWZmWSA9IHRhcmdldEJvdW5kcy5taW5Db3JuZXIueSAtIGJib3hBLm1pbkNvcm5lci55O1xuXG4gICAgICAgIHRoaXMuY2FudmFzTGF5ZXJzLmZvckVhY2goKGxheWVyKSA9PiB7XG4gICAgICAgICAgICBsYXllci5jYW52YXMuc3R5bGUubGVmdCA9IHBhcnNlRmxvYXQobGF5ZXIuY2FudmFzLnN0eWxlLmxlZnQpIC0gYmJveERpZmZYICsgJ3B4JztcbiAgICAgICAgICAgIGxheWVyLmNhbnZhcy5zdHlsZS50b3AgPSBwYXJzZUZsb2F0KGxheWVyLmNhbnZhcy5zdHlsZS50b3ApIC0gYmJveERpZmZZICsgJ3B4JztcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5vcHRpb25zLmJib3ggPSB0YXJnZXRCb3VuZHM7XG4gICAgICAgIHRoaXMuc2V0Q29udGFpbmVyRGl2QXR0cmlidXRlcygpO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBkcmF3V2l0aFRyYW5zZm9ybShjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50LCBmdW5jOiAoY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQpID0+IHZvaWQpIHtcbiAgICAgICAgY29uc3QgY3R4ID0gPENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRD5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgICAgY29uc3Qgc2NhbGFyID0gdGhpcy5vcHRpb25zLnRyZWVHZW5lcmF0b3IuZ2V0UmVuZGVyU2NhbGluZygpO1xuICAgICAgICBjdHguc2F2ZSgpO1xuICAgICAgICB7XG4gICAgICAgICAgICBjdHguc2NhbGUoc2NhbGFyLCBzY2FsYXIpO1xuICAgICAgICAgICAgY3R4LnRyYW5zbGF0ZSgtdGhpcy5vcHRpb25zLmJib3gubWluQ29ybmVyLngsIC10aGlzLm9wdGlvbnMuYmJveC5taW5Db3JuZXIueSk7XG4gICAgICAgICAgICBjdHgudHJhbnNsYXRlKFRyZWVQYXJ0LkNBTlZBU19CVUZGRVJfTUFSR0lOICogMC41LCBUcmVlUGFydC5DQU5WQVNfQlVGRkVSX01BUkdJTiAqIDAuNSk7XG4gICAgICAgICAgICBmdW5jKGN0eCk7XG4gICAgICAgIH1cbiAgICAgICAgY3R4LnJlc3RvcmUoKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgYWJzdHJhY3QgZHJhd0xheWVycygpOiB2b2lkO1xuXG4gICAgcHJvdGVjdGVkIGFmdGVyRHJhd0xheWVycygpIHtcblxuICAgIH1cblxuICAgIHB1YmxpYyBkcmF3KCkge1xuICAgICAgICB0aGlzLmRyYXdMYXllcnMoKTtcbiAgICAgICAgdGhpcy5hZnRlckRyYXdMYXllcnMoKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2VyaWFsaXplKCkge1xuICAgICAgICB0aGlzLmNhbnZhc0xheWVycy5mb3JFYWNoKChsYXllcikgPT4ge1xuICAgICAgICAgICAgdGhpcy5vcHRpb25zLnRyZWVHZW5lcmF0b3Iuc2V0U2VyaWFsaXplZFZhbHVlKGxheWVyLnVpZCwgbGF5ZXIuY2FudmFzLnRvRGF0YVVSTCgpKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdGF0aWMgQ0FOVkFTX0JVRkZFUl9NQVJHSU46IG51bWJlciA9IDMwMDtcblxuICAgIHByb3RlY3RlZCByZWFkb25seSBvcHRpb25zOiBUcmVlUGFydE9wdGlvbnM7XG5cbiAgICBwcm90ZWN0ZWQgY29udGFpbmVyRGl2OiBIVE1MRGl2RWxlbWVudDtcblxuICAgIHByb3RlY3RlZCBiYXNlQW5nbGU6IG51bWJlciA9IDA7XG5cbiAgICBwcml2YXRlIGNhbnZhc0xheWVyczogQXJyYXk8Q2FudmFzTGF5ZXI+ID0gW107XG59IiwiaW1wb3J0IHsgVHJlZVBhcnRHcm93ZXIgfSBmcm9tIFwiLi90ZWVQYXJ0R3Jvd2VyLmpzXCI7XG5cbmV4cG9ydCBjbGFzcyBUcmVlUGFydEludGVyIGV4dGVuZHMgVHJlZVBhcnRHcm93ZXIge1xuICAgIHB1YmxpYyBpc1Rlcm1pbmFsKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufSIsImltcG9ydCB7IFRyZWVHZW5lcmF0b3IgfSBmcm9tIFwiLi4vdHJlZUdlbmVyYXRvci5qc1wiO1xuaW1wb3J0IHsgTGVhZiB9IGZyb20gIFwiLi4vY29tcG9uZW50cy9sZWFmLmpzXCI7XG5pbXBvcnQgeyBzdGFydEFuaW1hdGlvbiwgc2V0QW5pbWF0aW9uVGltZW91dCwgQW5pbWF0aW9uU3RhdGUsIEFuaW1hdGlvbiB9IGZyb20gXCIuLi8uLi91dGlscy9hbmltYXRpb25IZWxwZXIuanNcIjtcbmltcG9ydCB7IEFuaW1hdGlvbkZ1bmN0aW9ucyB9IGZyb20gXCIuLi8uLi91dGlscy9hbmltYXRpb24vZnVuY3Rpb25zLmpzXCI7XG5pbXBvcnQgeyBWZWN0b3IyIH0gZnJvbSBcIi4uLy4uL3V0aWxzL2xpbmVhci92ZWN0b3IyLmpzXCI7XG5pbXBvcnQgeyBDYW52YXNMYXllciB9IGZyb20gXCIuL3RyZWVQYXJ0LmpzXCI7XG5pbXBvcnQgeyBUcmVlUGFydEdyb3dlciwgVHJlZVBhcnRHcm93ZXJPcHRpb25zIH0gZnJvbSBcIi4vdGVlUGFydEdyb3dlci5qc1wiO1xuXG5cbmV4cG9ydCBjbGFzcyBUcmVlUGFydExlYWYgZXh0ZW5kcyBUcmVlUGFydEdyb3dlciB7XG4gICAgcHVibGljIGNvbnN0cnVjdG9yKG9wdGlvbnM6IFRyZWVQYXJ0R3Jvd2VyT3B0aW9ucykge1xuICAgICAgICBzdXBlcihvcHRpb25zKTtcblxuICAgICAgICB0aGlzLmxlYWZDbHVzdGVyTGF5ZXJzID0gbmV3IEFycmF5KFRyZWVQYXJ0TGVhZi5MRUFGX0xBWUVSX0NPVU5UKVxuICAgICAgICAgICAgLmZpbGwobnVsbClcbiAgICAgICAgICAgIC5tYXAoeCA9PiB0aGlzLmNyZWF0ZUNhbnZhc0xheWVyKCkpO1xuICAgICAgICB0aGlzLmxlYWZMYXllcnNUb0Ryb3AgPSB0aGlzLmxlYWZDbHVzdGVyTGF5ZXJzLnNsaWNlKCk7XG5cbiAgICAgICAgdGhpcy5sZWFmQ2x1c3RlckxheWVycy5mb3JFYWNoKChsYXllcikgPT4gdGhpcy5sYXllclRvTGVhZnMuc2V0KGxheWVyLCBbXSkpO1xuXG4gICAgICAgIHRoaXMuY29udGFpbmVyRGl2LnN0eWxlLmN1cnNvciA9ICdncmFiJztcblxuICAgICAgICB0aGlzLnVwZGF0ZVBvaW50ZXJQcm9wZXJ0eSgpO1xuXG4gICAgICAgIHRoaXMuc2V0dXBEcmFnKCk7XG4gICAgICAgIHRoaXMuc2V0dXBDbGljaygpO1xuICAgIH1cblxuICAgIHB1YmxpYyBpc1Rlcm1pbmFsKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldCBkcm9wcGVkQWxsTGVhZnMoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiAodGhpcy5sZWFmTGF5ZXJzVG9Ecm9wLmxlbmd0aCA9PSAwKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNldHVwRHJhZygpIHtcbiAgICAgICAgY29uc3QgYW5pbWF0aW9uR3JvdXAgPSB0aGlzLm9wdGlvbnMudHJlZUdlbmVyYXRvci5nZXRBbmltYXRpb25Hcm91cCgpO1xuICAgICAgICBjb25zdCBGT1JDRV9SRUxFQVNFX0FOR0xFX1RIUkVTSE9MRCA9IE1hdGguUEkgKiAwLjc1O1xuICAgICAgICBjb25zdCBEUkFHX0RBTVBORVJfU0NBTEFSID0gMC43O1xuXG4gICAgICAgIGxldCB0cmFuc2Zvcm1PcmlnaW5DbGllbnQ6IFZlY3RvcjI7XG5cbiAgICAgICAgbGV0IGN1cnJlbnREcmFnUG9zOiBWZWN0b3IyO1xuICAgICAgICBsZXQgZHJhZ1N0YXJ0UG9zOiBWZWN0b3IyO1xuXG4gICAgICAgIGxldCBjdXJyZW50QW5nbGU6IG51bWJlcjtcbiAgICAgICAgbGV0IGxhc3RBbmdsZTogbnVtYmVyID0gMDtcblxuICAgICAgICBsZXQgYmFzZUNsaWVudFJlY3Q6IERPTVJlY3Q7XG5cbiAgICAgICAgY29uc3QgZ2V0Qm91bmRpbmdDbGllbnRSZWN0V2l0aG91dFRyYW5zZm9ybSA9ICgpID0+IHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogVGhlIHB1cnBvc2Ugb2YgdGhpcyBmdW5jdGlvbiBpcyB0byBnZXQgdGhlIGJvdW5kaW5nLWJveCBvZiB0aGUgdHJlZS1wYXJ0IHdpdGhvdXRcbiAgICAgICAgICAgICAqIHRoZSByb3RhdGlvbiB0cmFuc2Zvcm0uIFRoaXMgaXMgcmVxdWlyZWQsIGFzIGlmIHdlIHdlcmUgdG8gcXVlcnkgdGhlIGJvdW5kaW5nLWJveFxuICAgICAgICAgICAgICogd2l0aCB0aGUgcm90YXRpb24gYXBwbGllZCwgdGhlIGNhbGN1bGF0ZWQgbW91c2UgYW5nbGVzIHdvdWxkIGJlIGluY29ycmVjdCAodGhleSBhc3N1bWUgQUFCQikuXG4gICAgICAgICAgICAgKi9cblxuICAgICAgICAgICAgY29uc3QgdG1wVHJhbnNmb3JtQ1NWID0gdGhpcy5jb250YWluZXJEaXYuc3R5bGUudHJhbnNmb3JtO1xuICAgICAgICAgICAgdGhpcy5jb250YWluZXJEaXYuc3R5bGUudHJhbnNmb3JtID0gJyc7XG4gICAgICAgICAgICBjb25zdCBjbGllbnRSZWN0ID0gdGhpcy5jb250YWluZXJEaXYuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgICB0aGlzLmNvbnRhaW5lckRpdi5zdHlsZS50cmFuc2Zvcm0gPSB0bXBUcmFuc2Zvcm1DU1Y7XG4gICAgICAgICAgICByZXR1cm4gY2xpZW50UmVjdDtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBtb3VzZU1vdmUgPSAoZTogTW91c2VFdmVudCkgPT4ge1xuICAgICAgICAgICAgY3VycmVudERyYWdQb3MgPSBuZXcgVmVjdG9yMihlLmNsaWVudFgsIGUuY2xpZW50WSkuc3VidHJhY3QodHJhbnNmb3JtT3JpZ2luQ2xpZW50ISk7XG4gICAgICAgICAgICBjb25zdCBzID0gKGRyYWdTdGFydFBvcy54ID4gMSkgPyAxIDogLTE7XG5cbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnREcmFnQW5nbGUgPSBNYXRoLmF0YW4yKGN1cnJlbnREcmFnUG9zLnkgKiBzLCBjdXJyZW50RHJhZ1Bvcy54ICogcyk7ICAgICAgICAgICAgICAgIC8vIGFuZ2xlIGZyb20gdGhlIGN1cnJlbnQgbW91c2UgcG9zaXRpb24gdG8gdHJhbnNmb3JtIG9yaWdpblxuICAgICAgICAgICAgY29uc3Qgc3RhcnREcmFnQW5nbGUgPSBNYXRoLmF0YW4yKGRyYWdTdGFydFBvcyEueSAqIHMsIGRyYWdTdGFydFBvcyEueCAqIHMpOyAgICAgICAgICAgICAgICAgICAgLy8gYW5nbGUgZnJvbSBzdGFydGluZyBtb3VzZSBwb3NpdGlvbiB0byB0cmFuc2Zvcm0gb3JpZ2luXG4gICAgICAgICAgICBjb25zdCByYXdBbmdsZSA9IChjdXJyZW50RHJhZ0FuZ2xlIC0gc3RhcnREcmFnQW5nbGUgKyBsYXN0QW5nbGUpOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBjYWxjdWxhdGVkIGFuZ2xlIGZvciB0aGUgdHJlZS1wYXJ0IHJvdGF0aW9uIHRvIHRyYWNrIG1vdXNlIGRyYWdnaW5nXG5cbiAgICAgICAgICAgIC8vIGNhbGN1bGF0ZSBkYW1wZW5lZCBhbmdsZSB3aXRoIFMtc2hhcGVkIGZhbGxvZmYgYXMgdGhlIHVzZXIgZHJhZ3MgdG8gdGhlIGV4dHJlbWVzIG9mICsvLSBzaWRlXG4gICAgICAgICAgICBjb25zdCBkYW1wZW5lZEFuZ2xlID0gKDEgLSBNYXRoLm1pbigxLCBBbmltYXRpb25GdW5jdGlvbnMuc2lnbW9pZF8wXzEoTWF0aC5hYnMocmF3QW5nbGUgKiBEUkFHX0RBTVBORVJfU0NBTEFSKSkpKTtcblxuICAgICAgICAgICAgLy8gaWYgdGhlIHVzZXIgZHJhZ3MgdGhlIHRyZWUtcGFydCBwYXN0IHRoZSByb3RhdGlvbiB0aHJlc2hvbGQsIGZvcmNlIHJlbGVhc2VcbiAgICAgICAgICAgIGlmIChNYXRoLmFicyhyYXdBbmdsZSkgPiBGT1JDRV9SRUxFQVNFX0FOR0xFX1RIUkVTSE9MRCkge1xuICAgICAgICAgICAgICAgIG1vdXNlVXAoZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjdXJyZW50QW5nbGUgPSAocmF3QW5nbGUgKiBkYW1wZW5lZEFuZ2xlKTtcblxuICAgICAgICAgICAgdGhpcy5jb250YWluZXJEaXYuc3R5bGUudHJhbnNmb3JtID0gYHJvdGF0ZSgke2N1cnJlbnRBbmdsZSArIHRoaXMuYmFzZUFuZ2xlfXJhZClgOyAgIC8vIHNldCBDU1MgdHJhbnNmb3JtXG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBtb3VzZURvd24gPSAoZTogTW91c2VFdmVudCkgPT4geztcbiAgICAgICAgICAgIGlmICh0aGlzLmlzTGVhZkNsdXN0ZXJEcm9wcGluZylcbiAgICAgICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgICAgIHRoaXMuc2hha2luZ0FuaW1hdGlvbj8uY2FuY2VsKCk7XG4gICAgICAgICAgICB0aGlzLnNoYWtpbmdBbmltYXRpb24gPSBudWxsO1xuXG4gICAgICAgICAgICB0aGlzLnNwcmluZ0FuaW1hdGlvbj8uY2FuY2VsKCk7XG4gICAgICAgICAgICB0aGlzLnNwcmluZ0FuaW1hdGlvbiA9IG51bGw7XG5cbiAgICAgICAgICAgIGJhc2VDbGllbnRSZWN0ID0gZ2V0Qm91bmRpbmdDbGllbnRSZWN0V2l0aG91dFRyYW5zZm9ybSgpO1xuXG4gICAgICAgICAgICAvLyBjYWxjdWxhdGUgc3RhcnRpbmcgZHJhZyBwb3NpdGlvblxuICAgICAgICAgICAgY29uc3Qgc3RhcnRQb3NSZWxhdGl2ZSA9IHRoaXMucGl4ZWxzVG9SZWxhdGl2ZShcbiAgICAgICAgICAgICAgICB0aGlzLmdyb3dlck9wdGlvbnMuYnJhbmNoR3Jvd2VyLnN0YXJ0aW5nUG9pbnQueCxcbiAgICAgICAgICAgICAgICB0aGlzLmdyb3dlck9wdGlvbnMuYnJhbmNoR3Jvd2VyLnN0YXJ0aW5nUG9pbnQueVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHRyYW5zZm9ybU9yaWdpbkNsaWVudCA9IG5ldyBWZWN0b3IyKFxuICAgICAgICAgICAgICAgIGJhc2VDbGllbnRSZWN0IS54ICsgc3RhcnRQb3NSZWxhdGl2ZS54ICogYmFzZUNsaWVudFJlY3QhLndpZHRoLFxuICAgICAgICAgICAgICAgIGJhc2VDbGllbnRSZWN0IS55ICsgc3RhcnRQb3NSZWxhdGl2ZS55ICogYmFzZUNsaWVudFJlY3QhLmhlaWdodFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGRyYWdTdGFydFBvcyA9IG5ldyBWZWN0b3IyKGUuY2xpZW50WCwgZS5jbGllbnRZKS5zdWJ0cmFjdCh0cmFuc2Zvcm1PcmlnaW5DbGllbnQhKTtcblxuICAgICAgICAgICAgdGhpcy5jb250YWluZXJEaXYucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgbW91c2VEb3duKTtcbiAgICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIG1vdXNlTW92ZSk7XG4gICAgICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgbW91c2VVcCk7XG5cbiAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmcgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbW91c2VVcCA9IChlOiBNb3VzZUV2ZW50KSA9PiB7XG4gICAgICAgICAgICBsYXN0QW5nbGUgPSBjdXJyZW50QW5nbGU7XG5cbiAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIHN0YXJ0U3ByaW5nQW5pbWF0aW9uKCk7XG5cbiAgICAgICAgICAgIHRoaXMuY29udGFpbmVyRGl2LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIG1vdXNlRG93bik7XG4gICAgICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBtb3VzZU1vdmUpO1xuICAgICAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIG1vdXNlVXApO1xuICAgICAgICB9XG5cbiAgICAgICAgXG4gICAgICAgIGNvbnN0IHN0YXJ0U3ByaW5nQW5pbWF0aW9uID0gKCkgPT4ge1xuICAgICAgICAgICAgbGV0IGZpcnN0VDogbnVtYmVyIHwgbnVsbCA9IG51bGw7XG4gICAgICAgICAgICBsZXQgdmVsb2NpdHk6IG51bWJlciA9IC1jdXJyZW50QW5nbGUgKiA1O1xuICAgICAgICAgICAgbGV0IGxhc3RUOiBudW1iZXIgPSAwO1xuXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMuc3ByaW5nQW5pbWF0aW9uID0gYW5pbWF0aW9uR3JvdXAuYWRkQW5pbWF0aW9uKFxuICAgICAgICAgICAgICAgIHN0YXJ0QW5pbWF0aW9uKHtcbiAgICAgICAgICAgICAgICAgICAgYW5pbWF0ZTogKHQ6IG51bWJlcikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlyc3RUID8/PSB0O1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFzdFQgPz89IHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0b3RhbFQgPSAodCAtIGZpcnN0VCkgLyAxMDAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZGVsdGFUID0gdG90YWxUIC0gbGFzdFQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYXN0VCA9IHRvdGFsVDtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYWNjZWxlcmF0aW9uID0gLSgxMDApICogY3VycmVudEFuZ2xlO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZGFtcG5lciA9IE1hdGgubWluKDEsIEFuaW1hdGlvbkZ1bmN0aW9ucy5zaWdtb2lkXzBfMSh0b3RhbFQgKiAwLjIpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZlbG9jaXR5ICs9IGFjY2VsZXJhdGlvbiAqIGRlbHRhVDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZlbG9jaXR5ICo9ICgxIC0gZGFtcG5lcik7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50QW5nbGUgKz0gKHZlbG9jaXR5ICogZGVsdGFUKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RBbmdsZSA9IGN1cnJlbnRBbmdsZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY29udGFpbmVyRGl2LnN0eWxlLnRyYW5zZm9ybSA9IGByb3RhdGUoJHtjdXJyZW50QW5nbGUgKyB0aGlzLmJhc2VBbmdsZX1yYWQpYDtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKE1hdGguYWJzKHZlbG9jaXR5KSA8IDAuMSAmJiBNYXRoLmFicyhhY2NlbGVyYXRpb24pIDwgMC4xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kcm9wTGVhZkNsdXN0ZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gQW5pbWF0aW9uU3RhdGUuRE9ORTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgb25Eb25lOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNwcmluZ0FuaW1hdGlvbiA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuY29udGFpbmVyRGl2LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIG1vdXNlRG93bik7XG4gICAgfVxuXG4gICAgcHVibGljIHNldHVwQ2xpY2soKSB7XG4gICAgICAgIHRoaXMuY29udGFpbmVyRGl2LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGUpID0+IHtcbiAgICAgICAgICAgIGlmICghdGhpcy5pc0ZpbmlzaGVkR3Jvd2luZygpIHx8ICF0aGlzLmlzVGVybWluYWwoKSlcbiAgICAgICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgICAgIHRoaXMuZHJvcFJhbmRvbUxlYWZzKCAxICsgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKDMgKyAxKSkpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2hha2UoY3c6IGJvb2xlYW4pIHtcbiAgICAgICAgaWYgKHRoaXMuc2hha2luZ0FuaW1hdGlvbilcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICBpZiAodGhpcy5kcmFnZ2luZyB8fCB0aGlzLnNwcmluZ0FuaW1hdGlvbiB8fCB0aGlzLmxlYWZDbHVzdGVyRHJvcHBpbmcpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIFxuICAgICAgICBjb25zdCBhbmltYXRpb25Hcm91cCA9IHRoaXMub3B0aW9ucy50cmVlR2VuZXJhdG9yLmdldEFuaW1hdGlvbkdyb3VwKCk7XG5cbiAgICAgICAgY29uc3QgU0hBS0VfVElNRTogbnVtYmVyID0gdGhpcy5vcHRpb25zLnRyZWVHZW5lcmF0b3IuZ2V0UFJORygnRFJBVycpLmZsb2F0SW5SYW5nZSg0MDAwLCA3MDAwKTtcbiAgICAgICAgY29uc3QgTUFYX0FOR0xFOiBudW1iZXIgPSB0aGlzLm9wdGlvbnMudHJlZUdlbmVyYXRvci5nZXRQUk5HKCdEUkFXJykuZmxvYXRJblJhbmdlKDEsIDMpO1xuXG4gICAgICAgIHRoaXMuc2hha2luZ0FuaW1hdGlvbiA9IGFuaW1hdGlvbkdyb3VwLmFkZEFuaW1hdGlvbihcbiAgICAgICAgICAgIHN0YXJ0QW5pbWF0aW9uKHtcbiAgICAgICAgICAgICAgICBhbmltYXRlOiAodDogbnVtYmVyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHRhcmdldEFuZ2xlID0gTUFYX0FOR0xFICogKGN3ID8gMSA6IC0xKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb250YWluZXJEaXYuc3R5bGUudHJhbnNmb3JtID0gYHJvdGF0ZSgke3RoaXMuYmFzZUFuZ2xlICsgdGFyZ2V0QW5nbGUgKiBNYXRoLnBvdyhNYXRoLnNpbihNYXRoLlBJICogMiAqICh0IC8gU0hBS0VfVElNRSkpLCAzKX1kZWcpYDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHQgPj0gU0hBS0VfVElNRSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBBbmltYXRpb25TdGF0ZS5ET05FO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgb25Eb25lOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2hha2luZ0FuaW1hdGlvbiA9IG51bGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICApO1xuICAgIH1cblxuICAgIHB1YmxpYyBkcm9wUmFuZG9tTGVhZnMobGVhZkNvdW50OiBudW1iZXIpIHtcbiAgICAgICAgaWYgKHRoaXMuZHJvcHBlZEFsbExlYWZzKVxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IHBybmcgPSB0aGlzLm9wdGlvbnMudHJlZUdlbmVyYXRvci5nZXRQUk5HKCdEUkFXJyk7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZWFmQ291bnQ7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgbGF5ZXJJZHggPSBwcm5nLmludEluUmFuZ2UoMCwgdGhpcy5sZWFmTGF5ZXJzVG9Ecm9wLmxlbmd0aCAtIDEpO1xuICAgICAgICAgICAgY29uc3QgbGF5ZXIgPSB0aGlzLmxlYWZMYXllcnNUb0Ryb3BbbGF5ZXJJZHhdO1xuXG4gICAgICAgICAgICBjb25zdCBsYXllckxlYWZzID0gdGhpcy5sYXllclRvTGVhZnMuZ2V0KGxheWVyKSE7XG4gICAgICAgICAgICBpZiAoIWxheWVyTGVhZnMubGVuZ3RoKVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICBjb25zdCBsZWFmSWR4ID0gcHJuZy5pbnRJblJhbmdlKDAsIGxheWVyTGVhZnMubGVuZ3RoIC0gMSk7XG4gICAgICAgICAgICBjb25zdCBsZWFmID0gbGF5ZXJMZWFmc1tsZWFmSWR4XTtcbiAgICAgICAgICAgIHRoaXMuZHJvcExlYWYobGVhZik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgZHJvcExlYWZDbHVzdGVyKCkge1xuICAgICAgICBpZiAodGhpcy5pc0xlYWZDbHVzdGVyRHJvcHBpbmcpXG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgaWYgKCF0aGlzLmxlYWZMYXllcnNUb0Ryb3AubGVuZ3RoKVxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IGxlYWZMYXllciA9IHRoaXMubGVhZkxheWVyc1RvRHJvcC5wb3AoKSE7XG4gICAgICAgIGNvbnN0IGxlYWZzSW5MYXllciA9IHRoaXMubGF5ZXJUb0xlYWZzLmdldChsZWFmTGF5ZXIpITtcbiAgICAgICAgXG4gICAgICAgIGxlYWZzSW5MYXllci5mb3JFYWNoKChsZWFmKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBkcm9wRGVsYXkgPSB0aGlzLm9wdGlvbnMudHJlZUdlbmVyYXRvci5nZXRQUk5HKCdEUkFXJykuaW50SW5SYW5nZSgwLCAzMDAwKTtcbiAgICAgICAgICAgIHRoaXMuZHJvcExlYWYobGVhZiwgZHJvcERlbGF5KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgYW5pbWF0aW9uR3JvdXAgPSB0aGlzLm9wdGlvbnMudHJlZUdlbmVyYXRvci5nZXRBbmltYXRpb25Hcm91cCgpO1xuXG4gICAgICAgIGFuaW1hdGlvbkdyb3VwLmFkZEFuaW1hdGlvbihcbiAgICAgICAgICAgIHN0YXJ0QW5pbWF0aW9uKHtcbiAgICAgICAgICAgICAgICBhbmltYXRlOiAodDogbnVtYmVyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG9wYWNpdHkgPSAxLjAgLSBNYXRoLm1pbigxLjAsIHQgLyA1MDApO1xuICAgICAgICAgICAgICAgICAgICBsZWFmTGF5ZXIuY2FudmFzLnN0eWxlLm9wYWNpdHkgPSBvcGFjaXR5ICsgJyc7XG4gICAgICAgICAgICAgICAgICAgIGlmIChvcGFjaXR5IDwgMClcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBBbmltYXRpb25TdGF0ZS5ET05FO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICk7XG5cbiAgICAgICAgYW5pbWF0aW9uR3JvdXAuYWRkQW5pbWF0aW9uKFxuICAgICAgICAgICAgc2V0QW5pbWF0aW9uVGltZW91dCh7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2s6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pc0xlYWZDbHVzdGVyRHJvcHBpbmcgPSBmYWxzZVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdGltZTogODAwMFxuICAgICAgICAgICAgfSlcbiAgICAgICAgKTtcblxuICAgICAgICB0aGlzLmlzTGVhZkNsdXN0ZXJEcm9wcGluZyA9IHRydWU7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBkcm9wTGVhZihsZWFmOiBMZWFmLCBkcm9wRGVsYXk/OiBudW1iZXIpIHtcbiAgICAgICAgY29uc29sZS5hc3NlcnQodGhpcy5pc0ZpbmlzaGVkR3Jvd2luZygpKTtcbiAgICAgICAgY29uc3QgYW5pbWF0aW9uR3JvdXAgPSB0aGlzLm9wdGlvbnMudHJlZUdlbmVyYXRvci5nZXRBbmltYXRpb25Hcm91cCgpO1xuICAgICAgICBjb25zdCBsZWFmRWxlbWVudCA9IGxlYWYuY3JlYXRlRWxlbWVudCgpO1xuICAgICAgICBsZWFmRWxlbWVudC5zdHlsZS56SW5kZXggPSB0aGlzLmNvbnRhaW5lckRpdi5zdHlsZS56SW5kZXg7XG4gICAgICAgIGNvbnN0IHN0YXJ0WSA9IHBhcnNlRmxvYXQobGVhZkVsZW1lbnQuc3R5bGUudG9wKTtcbiAgICAgICAgY29uc3Qgc3BlZWQgPSB0aGlzLm9wdGlvbnMudHJlZUdlbmVyYXRvci5nZXRQUk5HKCdEUkFXJykuZmxvYXRJblJhbmdlKDIwMCwgMzAwKTtcblxuICAgICAgICBjb25zdCBGQURFX1RJTUVfU0VDT05EUzogbnVtYmVyID0gMTtcbiAgICAgICAgY29uc3QgRkFERV9FTkRfWTogbnVtYmVyID0gKFRyZWVHZW5lcmF0b3IuUkVGRVJFTkNFX0hFSUdIVCk7XG4gICAgICAgIGNvbnN0IEZBREVfU1RBUlRfWSA9IEZBREVfRU5EX1kgLSAoc3BlZWQgLyBGQURFX1RJTUVfU0VDT05EUyk7XG5cbiAgICAgICAgYW5pbWF0aW9uR3JvdXAuYWRkQW5pbWF0aW9uKFxuICAgICAgICAgICAgc2V0QW5pbWF0aW9uVGltZW91dCh7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2s6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uR3JvdXAuYWRkQW5pbWF0aW9uKFxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRBbmltYXRpb24oe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGU6ICh0OiBudW1iZXIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV3WTogbnVtYmVyID0gKHN0YXJ0WSArICh0IC8gMTAwMCkgKiBzcGVlZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdZID4gRkFERV9FTkRfWSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGVhZkVsZW1lbnQucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gQW5pbWF0aW9uU3RhdGUuRE9ORTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZWFmRWxlbWVudC5zdHlsZS5vcGFjaXR5ID0gTWF0aC5tYXgoMCwgKEZBREVfRU5EX1kgLSBuZXdZKSAvIChGQURFX0VORF9ZIC0gRkFERV9TVEFSVF9ZKSkgKyAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGVhZkVsZW1lbnQuc3R5bGUudG9wID0gbmV3WSArICdweCc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHRpbWU6IGRyb3BEZWxheSA/PyAwXG4gICAgICAgICAgICB9KVxuICAgICAgICApO1xuXG4gICAgICAgIGFuaW1hdGlvbkdyb3VwLmFkZEFuaW1hdGlvbihcbiAgICAgICAgICAgIHN0YXJ0QW5pbWF0aW9uKHtcbiAgICAgICAgICAgICAgICBhbmltYXRlOiAodDogbnVtYmVyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG9wYWNpdHkgPSBNYXRoLm1pbigxLjAsICh0IC8gMjAwKSk7XG4gICAgICAgICAgICAgICAgICAgIGxlYWZFbGVtZW50LnN0eWxlLm9wYWNpdHkgPSBvcGFjaXR5ICsgJyc7XG4gICAgICAgICAgICAgICAgICAgIGlmIChvcGFjaXR5ID49IDEuMClcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBBbmltYXRpb25TdGF0ZS5ET05FO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICk7XG5cbiAgICAgICAgdGhpcy5jb250YWluZXJEaXYuYWZ0ZXIobGVhZkVsZW1lbnQpO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBkcmF3TGF5ZXJzKCkge1xuICAgICAgICBzdXBlci5kcmF3TGF5ZXJzKCk7XG5cbiAgICAgICAgY29uc3QgcmFuZG9tTGVhZkNsdXN0ZXJMYXllciA9IHRoaXMubGVhZkNsdXN0ZXJMYXllcnNbdGhpcy5vcHRpb25zLnRyZWVHZW5lcmF0b3IuZ2V0UFJORygnR1JPVycpLmludEluUmFuZ2UoMCwgVHJlZVBhcnRMZWFmLkxFQUZfTEFZRVJfQ09VTlQgLSAxKV07XG4gICAgICAgIHRoaXMuZHJhd1dpdGhUcmFuc2Zvcm0ocmFuZG9tTGVhZkNsdXN0ZXJMYXllci5jYW52YXMsIChjdHgpID0+IHRoaXMuZHJhd0xlYWZzKGN0eCwgcmFuZG9tTGVhZkNsdXN0ZXJMYXllcikpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZHJhd0xlYWZzKGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCBsYXllcjogQ2FudmFzTGF5ZXIpIHtcbiAgICAgICAgaWYgKCF0aGlzLmlzVGVybWluYWwoKSlcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IG5ld0xlYWZzID0gdGhpcy5ncm93ZXJPcHRpb25zLmJyYW5jaEdyb3dlci5nZXROZXdMZWFmcygpO1xuICAgICAgICBjb25zdCByb3RhdGVkTGVhZkNvdW50OiBudW1iZXIgPSB0aGlzLm9wdGlvbnMudHJlZUdlbmVyYXRvci5nZXRQUk5HKCdHUk9XJykuaW50SW5SYW5nZSgxLCAyKTtcblxuICAgICAgICBuZXdMZWFmcy5mb3JFYWNoKChsZWFmKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmxheWVyVG9MZWFmcy5nZXQobGF5ZXIpPy5wdXNoKGxlYWYpO1xuICAgICAgICAgICAgbGVhZi5kcmF3KGN0eCk7XG5cbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcm90YXRlZExlYWZDb3VudDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgcm90YXRlZExlYWYgPSBsZWFmLmNsb25lKClcbiAgICAgICAgICAgICAgICB0aGlzLmxheWVyVG9MZWFmcy5nZXQobGF5ZXIpPy5wdXNoKHJvdGF0ZWRMZWFmKTtcbiAgICAgICAgICAgICAgICByb3RhdGVkTGVhZi5kcmF3KGN0eCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBvbkZpbmlzaGVkR3Jvd2luZygpIHtcbiAgICAgICAgc3VwZXIub25GaW5pc2hlZEdyb3dpbmcoKTtcbiAgICAgICAgdGhpcy51cGRhdGVQb2ludGVyUHJvcGVydHkoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHVwZGF0ZVBvaW50ZXJQcm9wZXJ0eSgpIHtcbiAgICAgICAgaWYgKCF0aGlzLmxlYWZDbHVzdGVyRHJvcHBpbmcgJiYgdGhpcy5pc0ZpbmlzaGVkR3Jvd2luZygpKSB7XG4gICAgICAgICAgICB0aGlzLmNvbnRhaW5lckRpdi5zdHlsZS5wb2ludGVyRXZlbnRzID0gJ2F1dG8nO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5jb250YWluZXJEaXYuc3R5bGUucG9pbnRlckV2ZW50cyA9ICdub25lJztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgc3RhdGljIExFQUZfTEFZRVJfQ09VTlQ6IG51bWJlciA9IDU7XG5cbiAgICBwcml2YXRlIGdldCBpc0xlYWZDbHVzdGVyRHJvcHBpbmcoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLmxlYWZDbHVzdGVyRHJvcHBpbmc7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzZXQgaXNMZWFmQ2x1c3RlckRyb3BwaW5nKHZhbCkge1xuICAgICAgICB0aGlzLmxlYWZDbHVzdGVyRHJvcHBpbmcgPSB2YWw7XG4gICAgICAgIHRoaXMudXBkYXRlUG9pbnRlclByb3BlcnR5KCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzaGFraW5nQW5pbWF0aW9uOiBBbmltYXRpb24gfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIHNwcmluZ0FuaW1hdGlvbjogQW5pbWF0aW9uIHwgbnVsbCA9IG51bGw7XG5cbiAgICBwcml2YXRlIGRyYWdnaW5nOiBib29sZWFuID0gZmFsc2U7XG5cbiAgICBwcml2YXRlIGxlYWZDbHVzdGVyRHJvcHBpbmc6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAgIHByaXZhdGUgbGF5ZXJUb0xlYWZzOiBNYXA8Q2FudmFzTGF5ZXIsIEFycmF5PExlYWY+PiA9IG5ldyBNYXAoKTtcblxuICAgIHByaXZhdGUgbGVhZkxheWVyc1RvRHJvcDogQXJyYXk8Q2FudmFzTGF5ZXI+O1xuXG4gICAgcHJpdmF0ZSBsZWFmQ2x1c3RlckxheWVyczogQXJyYXk8Q2FudmFzTGF5ZXI+O1xufSIsImltcG9ydCB7IFRyZWVHZW5lcmF0b3IsIFRyZWVHZW5lcmF0b3JPcHRpb25zIH0gZnJvbSBcIi4uLy4uL3RyZWVHZW5lcmF0b3IuanNcIjtcbmltcG9ydCB7IFZlY3RvcjIgfSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvbGluZWFyL3ZlY3RvcjIuanNcIjtcbmltcG9ydCB7IEJCb3ggfSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvbGluZWFyL2Jib3guanNcIjtcbmltcG9ydCB7IFNwYWNlQ29sb25pemVyIH0gZnJvbSBcIi4uLy4uL3NwYWNlQ29sb25pemVyLmpzXCI7XG5pbXBvcnQgeyBCcmFuY2gsIEJyYW5jaE9wdGlvbnMgfSBmcm9tIFwiLi4vLi4vY29tcG9uZW50cy9icmFuY2guanNcIjtcbmltcG9ydCB7IExlYWYgfSBmcm9tIFwiLi4vLi4vY29tcG9uZW50cy9sZWFmLmpzXCI7XG5pbXBvcnQgeyBDYW52YXNIZWxwZXIgfSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvY2FudmFzSGVscGVyLmpzXCI7XG5pbXBvcnQgeyBNZXRhYmFsbFN1cmZhY2UgfSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvbWV0YWJhbGxzLmpzXCI7XG5pbXBvcnQgeyBzZXRBbmltYXRpb25JbnRlcnZhbCB9IGZyb20gXCIuLi8uLi8uLi91dGlscy9hbmltYXRpb25IZWxwZXIuanNcIjtcbmltcG9ydCB7IFRyZWVQYXJ0TGVhZiB9IGZyb20gXCIuLi8uLi90cmVlUGFydHMvdHJlZVBhcnRMZWFmLmpzXCI7XG5pbXBvcnQgeyBUcmVlUGFydEludGVyIH0gZnJvbSBcIi4uLy4uL3RyZWVQYXJ0cy90cmVlUGFydEludGVyLmpzXCI7XG5pbXBvcnQgeyBTdGF0aWNUcmVlUGFydCB9IGZyb20gXCIuLi8uLi90cmVlUGFydHMvc3RhdGljVHJlZVBhcnQuanNcIjtcblxuZXhwb3J0IGNsYXNzIEJvbnNhaVNhcGNlQ29sb25pemVyIGV4dGVuZHMgU3BhY2VDb2xvbml6ZXIge1xuICAgIHByb3RlY3RlZCBiaWFzR3Jvd3RoVmVjdG9yKGdyb3d0aFZlY3RvcjogVmVjdG9yMik6IFZlY3RvcjIge1xuICAgICAgICBzd2l0Y2ggKHRoaXMub3B0aW9ucy5kZXB0aCkge1xuICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgIGdyb3d0aFZlY3RvciA9IGdyb3d0aFZlY3Rvci5yYW5kb21pemVBbmdsZSgwLCAwLjcsIHRoaXMub3B0aW9ucy50cmVlR2VuZXJhdG9yLmdldFBSTkcoJ0dST1cnKS5mbG9hdEluUmFuZ2UoMCwgMSkpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgICAgIGdyb3d0aFZlY3RvciA9IGdyb3d0aFZlY3Rvci5yYW5kb21pemVBbmdsZSgwLCAwLjQsIHRoaXMub3B0aW9ucy50cmVlR2VuZXJhdG9yLmdldFBSTkcoJ0dST1cnKS5mbG9hdEluUmFuZ2UoMCwgMSkpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBncm93dGhWZWN0b3I7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgQm9uc2FpR2VuZXJhdG9yIGV4dGVuZHMgVHJlZUdlbmVyYXRvciB7XG4gICAgcHVibGljIHN0YXRpYyBhc3luYyBsb2FkUmVzb3VyY2VzKCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAgICAgICAoYXN5bmMgKCkgPT4gQm9uc2FpR2VuZXJhdG9yLnBvdEZyb250SW1hZ2UgPSBhd2FpdCBDYW52YXNIZWxwZXIubG9hZEltYWdlKCdyZXNvdXJjZXMvYm9uc2FpL2ltYWdlcy9wb3RfZnJvbnQucG5nJykpKCksXG4gICAgICAgICAgICAoYXN5bmMgKCkgPT4gQm9uc2FpR2VuZXJhdG9yLnBvdEJhY2tJbWFnZSA9IGF3YWl0IENhbnZhc0hlbHBlci5sb2FkSW1hZ2UoJ3Jlc291cmNlcy9ib25zYWkvaW1hZ2VzL3BvdF9iYWNrLnBuZycpKSgpLFxuICAgICAgICAgICAgKGFzeW5jICgpID0+IEJvbnNhaUdlbmVyYXRvci5tYWluQnJhbmNoSW1hZ2UgPSBhd2FpdCBDYW52YXNIZWxwZXIubG9hZEltYWdlKCdyZXNvdXJjZXMvYm9uc2FpL2ltYWdlcy9iYXJrX3RleHR1cmUuanBnJykpKCksXG4gICAgICAgICAgICAoYXN5bmMgKCkgPT4gQm9uc2FpR2VuZXJhdG9yLmxlYWZUZXh0dXJlSW1hZ2UgPSBhd2FpdCBDYW52YXNIZWxwZXIubG9hZEltYWdlKCdyZXNvdXJjZXMvYm9uc2FpL2ltYWdlcy9sZWFmX3RleHR1cmUuanBnJykpKCksXG4gICAgICAgICAgICAoYXN5bmMgKCkgPT4gQm9uc2FpR2VuZXJhdG9yLmxlYWZTdGVuY2lsSW1hZ2UgPSBhd2FpdCBDYW52YXNIZWxwZXIubG9hZEltYWdlKCdyZXNvdXJjZXMvYm9uc2FpL2ltYWdlcy9sZWFmX3N0ZW5jaWwucG5nJykpKCksXG4gICAgICAgICAgICAoYXN5bmMgKCkgPT4gQm9uc2FpR2VuZXJhdG9yLmxlYWZPdXRsaW5lSW1hZ2UgPSBhd2FpdCBDYW52YXNIZWxwZXIubG9hZEltYWdlKCdyZXNvdXJjZXMvYm9uc2FpL2ltYWdlcy9sZWFmX291dGxpbmUucG5nJykpKClcbiAgICAgICAgXSlcbiAgICB9XG5cbiAgICBwdWJsaWMgY29uc3RydWN0b3Iob3B0aW9uczogVHJlZUdlbmVyYXRvck9wdGlvbnMpIHtcbiAgICAgICAgc3VwZXIob3B0aW9ucyk7XG5cbiAgICAgICAgLy8gc2V0dXAgcGF0dGVybnNcbiAgICAgICAgY29uc3QgZHVtbXlDYW52YXMgPSBDYW52YXNIZWxwZXIuY3JlYXRlVGVtcENhbnZhcygxLCAxKTtcbiAgICAgICAgdGhpcy5tYWluQnJhbmNoUGF0dGVybiA9IDxDYW52YXNQYXR0ZXJuPmR1bW15Q2FudmFzLmNyZWF0ZVBhdHRlcm4oQm9uc2FpR2VuZXJhdG9yLm1haW5CcmFuY2hJbWFnZSwgJ3JlcGVhdCcpO1xuICAgICAgICB0aGlzLmxlYWZUZXh0dXJlUGF0dGVybiA9IDxDYW52YXNQYXR0ZXJuPmR1bW15Q2FudmFzLmNyZWF0ZVBhdHRlcm4oQm9uc2FpR2VuZXJhdG9yLmxlYWZUZXh0dXJlSW1hZ2UsICdyZXBlYXQnKTtcbiAgICAgICAgdGhpcy5sZWFmT3V0bGluZUltYWdlID0gPEhUTUxJbWFnZUVsZW1lbnQ+Qm9uc2FpR2VuZXJhdG9yLmxlYWZPdXRsaW5lSW1hZ2UuY2xvbmVOb2RlKCk7XG4gICAgICAgIHRoaXMubGVhZlN0ZW5jaWxJbWFnZSA9IDxIVE1MSW1hZ2VFbGVtZW50PkJvbnNhaUdlbmVyYXRvci5sZWFmU3RlbmNpbEltYWdlLmNsb25lTm9kZSgpO1xuXG4gICAgICAgIHRoaXMuZ2VuZXJhdGVQb3RMYXllcigpO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5nZW5lcmF0ZVRydW5rTGF5ZXIoKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZGVzdHJveSgpOiB2b2lkIHtcbiAgICAgICAgc3VwZXIuZGVzdHJveSgpO1xuICAgIH1cblxuICAgIHB1YmxpYyBvbkZpbmlzaGVkR3Jvd2luZygpOiB2b2lkIHtcbiAgICAgICAgc3VwZXIub25GaW5pc2hlZEdyb3dpbmcoKTtcbiAgICAgICAgdGhpcy5zZXR1cEFuaW1hdGlvbnMoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGRyb3BMZWFmcygpIHtcbiAgICAgICAgY29uc3QgbGVhZlRyZWVQYXJ0cyA9IHRoaXMudHJlZVBhcnRzLmZpbHRlcih0cmVlUGFydCA9PiB0cmVlUGFydC5pc1Rlcm1pbmFsKCkpO1xuICAgICAgICBjb25zdCByYW5kb21UcmVlUGFydCA9IGxlYWZUcmVlUGFydHNbTWF0aC5mbG9vcihsZWFmVHJlZVBhcnRzLmxlbmd0aCAqIE1hdGgucmFuZG9tKCkpXTtcbiAgICAgICAgKDxUcmVlUGFydExlYWY+cmFuZG9tVHJlZVBhcnQpLmRyb3BSYW5kb21MZWFmcygxICsgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKDMgKyAxKSkpO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXR1cEFuaW1hdGlvbnMoKSB7XG4gICAgICAgIGNvbnNvbGUuYXNzZXJ0KHRoaXMuaXNGaW5pc2hlZEdyb3dpbmcpO1xuICAgICAgICB0aGlzLmdldEFuaW1hdGlvbkdyb3VwKCkuYWRkQW5pbWF0aW9uKFxuICAgICAgICAgICAgc2V0QW5pbWF0aW9uSW50ZXJ2YWwoe1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJvcExlYWZzKCk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0aW1lOiA1ICogMTAwMFxuICAgICAgICAgICAgfSlcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0T3V0bGluZVRoaWNrbmVzcygpOiBudW1iZXIgeyByZXR1cm4gMTsgfVxuXG4gICAgcHVibGljIGdldEJyYW5jaFRleHR1cmVQYXR0ZXJuKGdyb3d0aDogVmVjdG9yMiwgdGV4dHVyZU5hbWU/OiBzdHJpbmcpOiBDYW52YXNQYXR0ZXJuIHtcbiAgICAgICAgc3dpdGNoICh0ZXh0dXJlTmFtZSkge1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB0aGlzLm1haW5CcmFuY2hQYXR0ZXJuLnNldFRyYW5zZm9ybShuZXcgRE9NTWF0cml4KCkudHJhbnNsYXRlU2VsZihncm93dGgueCwgZ3Jvd3RoLnkpLnNjYWxlU2VsZigwLjIsIDAuMikpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1haW5CcmFuY2hQYXR0ZXJuO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGdldExlYWZTdGVuY2lsVGV4dHVyZSgpOiBIVE1MSW1hZ2VFbGVtZW50IHtcbiAgICAgICAgcmV0dXJuIHRoaXMubGVhZlN0ZW5jaWxJbWFnZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0TGVhZk91dGxpbmVUZXh0dXJlKCk6IEhUTUxJbWFnZUVsZW1lbnQge1xuICAgICAgICByZXR1cm4gdGhpcy5sZWFmT3V0bGluZUltYWdlO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRMZWFmVGV4dHVyZVBhdHRlcm4ocmFuZFg/OiBudW1iZXIsIHJhbmRZPzogbnVtYmVyKTogQ2FudmFzUGF0dGVybiB7XG4gICAgICAgIHRoaXMubGVhZlRleHR1cmVQYXR0ZXJuLnNldFRyYW5zZm9ybShuZXcgRE9NTWF0cml4KCkudHJhbnNsYXRlU2VsZihyYW5kWCA/PyB0aGlzLmdldFBSTkcoJ0RSQVcnKS5mbG9hdEluUmFuZ2UoMCwgNDAwKSwgcmFuZFkgPz8gdGhpcy5nZXRQUk5HKCdEUkFXJykuZmxvYXRJblJhbmdlKDAsIDQwMCkpLnNjYWxlU2VsZigwLjMsIDAuMykpO1xuICAgICAgICByZXR1cm4gdGhpcy5sZWFmVGV4dHVyZVBhdHRlcm47XG4gICAgfVxuXG4gICAgcHVibGljIG1hcmtMZWFmUmVhY2hlZChkZXB0aDogbnVtYmVyLCBsZWFmOiBMZWFmKSB7XG4gICAgICAgIHN3aXRjaCAoZGVwdGgpIHtcbiAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICB0aGlzLmdlbmVyYXRlU3BsaXRMYXllcihkZXB0aCArIDEsIGxlYWYpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmdldFBSTkcoJ0dST1cnKS5yYW5kb20oKSA+IDAuNSlcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nZW5lcmF0ZVNwbGl0TGF5ZXIoZGVwdGggKyAxLCBsZWFmKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICB0aGlzLmdlbmVyYXRlTGVhZkxheWVyKGRlcHRoICsgMSwgbGVhZik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZW5lcmF0ZVBvdExheWVyKCkge1xuICAgICAgICBjb25zdCBwb3RQb3NpdGlvbiA9IG5ldyBWZWN0b3IyKFxuICAgICAgICAgICAgVHJlZUdlbmVyYXRvci5SRUZFUkVOQ0VfSEVJR0hUIC8gMiAtIEJvbnNhaUdlbmVyYXRvci5wb3RCYWNrSW1hZ2Uud2lkdGggLyAyLCBcbiAgICAgICAgICAgIFRyZWVHZW5lcmF0b3IuUkVGRVJFTkNFX0hFSUdIVCAtIEJvbnNhaUdlbmVyYXRvci5wb3RCYWNrSW1hZ2UuaGVpZ2h0KTtcbiAgICAgICAgdGhpcy50cmVlUGFydHMucHVzaChTdGF0aWNUcmVlUGFydC5mcm9tSW1hZ2Uoe1xuICAgICAgICAgICAgdHJlZUdlbmVyYXRvcjogdGhpcyxcbiAgICAgICAgICAgIHBvczogcG90UG9zaXRpb24sXG4gICAgICAgICAgICBpbWFnZTogQm9uc2FpR2VuZXJhdG9yLnBvdEJhY2tJbWFnZSxcbiAgICAgICAgICAgIHpJbmRleDogLTFcbiAgICAgICAgfSkpO1xuICAgICAgICB0aGlzLnRyZWVQYXJ0cy5wdXNoKFN0YXRpY1RyZWVQYXJ0LmZyb21JbWFnZSh7XG4gICAgICAgICAgICB0cmVlR2VuZXJhdG9yOiB0aGlzLFxuICAgICAgICAgICAgcG9zOiBwb3RQb3NpdGlvbixcbiAgICAgICAgICAgIGltYWdlOiBCb25zYWlHZW5lcmF0b3IucG90RnJvbnRJbWFnZSxcbiAgICAgICAgICAgIHpJbmRleDogMVxuICAgICAgICB9KSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZW5lcmF0ZVRydW5rTGF5ZXIoKSB7XG4gICAgICAgIGNvbnN0IGJib3ggPSBuZXcgQkJveChuZXcgVmVjdG9yMigwLCAwKSwgbmV3IFZlY3RvcjIoVHJlZUdlbmVyYXRvci5SRUZFUkVOQ0VfSEVJR0hULCBUcmVlR2VuZXJhdG9yLlJFRkVSRU5DRV9IRUlHSFQpKTtcblxuICAgICAgICBjb25zdCBicmFuY2hHcm93ZXIgPSBuZXcgQm9uc2FpU2FwY2VDb2xvbml6ZXIoe1xuICAgICAgICAgICAgdHJlZUdlbmVyYXRvcjogdGhpcyxcbiAgICAgICAgICAgIGRlcHRoOiAwLFxuICAgICAgICAgICAgc3RhcnRpbmdQb2ludDogQm9uc2FpR2VuZXJhdG9yLkdST1dfT1JJR0lOLFxuICAgICAgICAgICAgYmJveDogYmJveCxcbiAgICAgICAgICAgIGxlYWZDb3VudDogNyxcbiAgICAgICAgICAgIGxlYWZBdHRyYWN0aW9uRGlzdGFuY2U6IFRyZWVHZW5lcmF0b3IuUkVGRVJFTkNFX0hFSUdIVCAqIDAuNzUsXG4gICAgICAgICAgICBzcGF3blBvaW50czogbmV3IEFycmF5KDEwKS5maWxsKG51bGwpLm1hcCh4ID0+XG4gICAgICAgICAgICAgICAgbmV3IFZlY3RvcjIodGhpcy5nZXRQUk5HKCdHUk9XJykuZmxvYXRJblJhbmdlKDAsIFRyZWVHZW5lcmF0b3IuUkVGRVJFTkNFX0hFSUdIVCAtIDEwMCksIHRoaXMuZ2V0UFJORygnR1JPVycpLmZsb2F0SW5SYW5nZShUcmVlR2VuZXJhdG9yLlJFRkVSRU5DRV9IRUlHSFQgKiAwLjQsIFRyZWVHZW5lcmF0b3IuUkVGRVJFTkNFX0hFSUdIVCAqIDAuNikpXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgYnJhbmNoTGVuZ3RoOiA3XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IG5ld1RyZWVQYXJ0ID0gbmV3IFRyZWVQYXJ0SW50ZXIoe1xuICAgICAgICAgICAgdHJlZUdlbmVyYXRvcjogdGhpcyxcbiAgICAgICAgICAgIGJib3g6IGJib3gsXG4gICAgICAgICAgICBvcmlnaW46IEJvbnNhaUdlbmVyYXRvci5HUk9XX09SSUdJTixcbiAgICAgICAgICAgIGJyYW5jaEdyb3dlcjogYnJhbmNoR3Jvd2VyLFxuICAgICAgICAgICAgb3ZlcmRyYXdXaWR0aDogMjAwLFxuICAgICAgICAgICAgZmFkZUluOiBmYWxzZVxuICAgICAgICB9KTtcblxuICAgICAgICBuZXdUcmVlUGFydC5pbml0KCk7XG4gICAgICAgIG5ld1RyZWVQYXJ0LnN0YXJ0KCk7XG4gICAgICAgIHRoaXMudHJlZVBhcnRzLnB1c2gobmV3VHJlZVBhcnQpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2VuZXJhdGVTcGxpdExheWVyKGRlcHRoOiBudW1iZXIsIGxlYWY6IExlYWYpIHtcbiAgICAgICAgaWYgKCFsZWFmLnBhcmVudClcbiAgICAgICAgICAgIHJldHVybiBjb25zb2xlLmFzc2VydChmYWxzZSk7XG5cbiAgICAgICAgY29uc3QgRVhUUlVERV9SQU5HRSA9IFsxMDAsIDIwMF07XG4gICAgICAgIGNvbnN0IEVYVFJVREVfQU5HTExFX01JTkRJRkYgPSBNYXRoLlBJICogMC4xO1xuICAgICAgICBjb25zdCBFWFRSVURFX0FOR0xFX01BWERJRkYgPSBNYXRoLlBJICogMC4yNTtcblxuICAgICAgICBjb25zdCBwcm5nID0gdGhpcy5nZXRQUk5HKCdHUk9XJyk7XG5cbiAgICAgICAgY29uc3QgYnJhbmNoOiBCcmFuY2ggPSBsZWFmLnBhcmVudDtcbiAgICAgICAgY29uc3QgcG9zaXRpb246IFZlY3RvcjIgPSBicmFuY2gucG9zaXRpb247XG5cbiAgICAgICAgY29uc3QgZXh0cnVkZURpcjogVmVjdG9yMiA9IHBvc2l0aW9uLnN1YnRyYWN0KEJvbnNhaUdlbmVyYXRvci5HUk9XX09SSUdJTikubm9ybWFsaXplKCkucmFuZG9taXplQW5nbGUoRVhUUlVERV9BTkdMTEVfTUlORElGRiwgRVhUUlVERV9BTkdMRV9NQVhESUZGLCBwcm5nLnJhbmRvbSgpKTtcbiAgICAgICAgY29uc3QgZXh0cnVkZUxlbmd0aDogbnVtYmVyID0gcHJuZy5mbG9hdEluUmFuZ2UoRVhUUlVERV9SQU5HRVswXSwgRVhUUlVERV9SQU5HRVsxXSk7XG4gICAgICAgIGNvbnN0IGV4dHJ1ZGVQb3NpdGlvbiA9IHBvc2l0aW9uLmFkZChleHRydWRlRGlyLnNjYWxlKGV4dHJ1ZGVMZW5ndGgpKTtcblxuICAgICAgICBjb25zdCBwYXJ0U2l6ZTogbnVtYmVyID0gMzAwO1xuICAgICAgICBjb25zdCBwYXJ0Qm91bmRzID0gbmV3IFZlY3RvcjIocGFydFNpemUsIHBhcnRTaXplKTtcbiAgICAgICAgY29uc3QgYmJveCA9IEJCb3guZnJvbVBvc2l0aW9uQW5kU2l6ZShuZXcgVmVjdG9yMihwb3NpdGlvbi54IC0gcGFydEJvdW5kcy54ICogMC41LCBwb3NpdGlvbi55IC0gcGFydEJvdW5kcy55KSwgcGFydEJvdW5kcyk7XG5cbiAgICAgICAgY29uc3QgYnJhbmNoR3Jvd2VyID0gbmV3IEJvbnNhaVNhcGNlQ29sb25pemVyKHtcbiAgICAgICAgICAgIHRyZWVHZW5lcmF0b3I6IHRoaXMsXG4gICAgICAgICAgICBkZXB0aDogZGVwdGgsXG4gICAgICAgICAgICBwYXJlbnRCcmFuY2g6IGJyYW5jaCxcbiAgICAgICAgICAgIHN0YXJ0aW5nUG9pbnQ6IHBvc2l0aW9uLFxuICAgICAgICAgICAgYmJveDogYmJveCxcbiAgICAgICAgICAgIGxlYWZDb3VudDogMSxcbiAgICAgICAgICAgIGxlYWZBdHRyYWN0aW9uRGlzdGFuY2U6IHBhcnRTaXplLFxuICAgICAgICAgICAgYnJhbmNoTGVuZ3RoOiA1LFxuICAgICAgICAgICAgc3Bhd25Qb2ludHM6IFtleHRydWRlUG9zaXRpb25dXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IG5ld1RyZWVQYXJ0ID0gbmV3IFRyZWVQYXJ0SW50ZXIoe1xuICAgICAgICAgICAgdHJlZUdlbmVyYXRvcjogdGhpcyxcbiAgICAgICAgICAgIGRlcHRoOiBkZXB0aCxcbiAgICAgICAgICAgIGJib3g6IGJib3gsXG4gICAgICAgICAgICBvcmlnaW46IHBvc2l0aW9uLFxuICAgICAgICAgICAgYnJhbmNoR3Jvd2VyOiBicmFuY2hHcm93ZXIsXG4gICAgICAgICAgICBmYWRlSW46IHRydWVcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbmV3VHJlZVBhcnQuaW5pdCgpO1xuICAgICAgICBuZXdUcmVlUGFydC5zdGFydCgpO1xuICAgICAgICB0aGlzLnRyZWVQYXJ0cy5wdXNoKG5ld1RyZWVQYXJ0KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdlbmVyYXRlTGVhZkxheWVyKGRlcHRoOiBudW1iZXIsIGxlYWY6IExlYWYpIHtcbiAgICAgICAgaWYgKCFsZWFmLnBhcmVudClcbiAgICAgICAgICAgIHJldHVybiBjb25zb2xlLmFzc2VydChmYWxzZSk7XG5cbiAgICAgICAgY29uc3QgcHJuZyA9IHRoaXMuZ2V0UFJORygnR1JPVycpO1xuXG4gICAgICAgIGNvbnN0IGJyYW5jaDogQnJhbmNoID0gbGVhZi5wYXJlbnQ7XG4gICAgICAgIGNvbnN0IHBvc2l0aW9uOiBWZWN0b3IyID0gYnJhbmNoLnBvc2l0aW9uO1xuXG4gICAgICAgIGNvbnN0IGJib3hTY2FsYXI6IG51bWJlciA9IHBybmcuZmxvYXRJblJhbmdlKDEsIDEuMik7XG4gICAgICAgIGNvbnN0IGJib3ggPSBuZXcgQkJveChwb3NpdGlvbi5zdWJ0cmFjdChuZXcgVmVjdG9yMigyNTAgKiBiYm94U2NhbGFyLCAxNTAgKiBiYm94U2NhbGFyKSksIHBvc2l0aW9uLmFkZChuZXcgVmVjdG9yMigyNTAgKiBiYm94U2NhbGFyLCAzMCkpKTtcblxuICAgICAgICBjb25zdCBsZWFmQ291bnQ6IG51bWJlciA9IDIwMCAqIE1hdGgucG93KGJib3hTY2FsYXIsIDIpO1xuICAgICAgICBjb25zdCBsZWFmQXR0cmFjdGlvbkRpc3RhbmNlOiBudW1iZXIgPSBwcm5nLmludEluUmFuZ2UoNTAsIDEwMCkgKiBiYm94U2NhbGFyO1xuICAgICAgICBjb25zdCBzdXJmYWNlU2NhbGFyOiBudW1iZXIgPSBiYm94LndpZHRoIC8gNTAwO1xuICAgICAgICBjb25zdCBtZXRhYmFsbFN1cmZhY2U6IE1ldGFiYWxsU3VyZmFjZSA9IG5ldyBNZXRhYmFsbFN1cmZhY2Uoe1xuICAgICAgICAgICAgdGhyZXNob2xkOiAxLFxuICAgICAgICAgICAgcG9pbnRzOiBbXG4gICAgICAgICAgICAgICAgeyB4OiBiYm94Lm1pbkNvcm5lci54ICsgYmJveC53aWR0aCAqIDAuMiwgeTogcG9zaXRpb24ueSwgcjogWzMwLCA2MF0sIGQ6IFswLCAzMF0gfSxcbiAgICAgICAgICAgICAgICB7IHg6IGJib3gubWluQ29ybmVyLnggKyBiYm94LndpZHRoICogMC40LCB5OiBwb3NpdGlvbi55LCByOiBbMzAsIDYwXSwgZDogWzAsIDMwXSB9LFxuICAgICAgICAgICAgICAgIHsgeDogYmJveC5taW5Db3JuZXIueCArIGJib3gud2lkdGggKiAwLjYsIHk6IHBvc2l0aW9uLnksIHI6IFszMCwgNjBdLCBkOiBbMCwgMzBdIH0sXG4gICAgICAgICAgICAgICAgeyB4OiBiYm94Lm1pbkNvcm5lci54ICsgYmJveC53aWR0aCAqIDAuOCwgeTogcG9zaXRpb24ueSwgcjogWzMwLCA2MF0sIGQ6IFswLCAzMF0gfSxcbiAgICAgICAgICAgICAgICB7IHg6IGJib3gubWluQ29ybmVyLnggKyBiYm94LndpZHRoICogMC41LCB5OiBwb3NpdGlvbi55LCByOiBbMjAsIDMwXSwgZDogWzAsIDMwXSB9LFxuICAgICAgICAgICAgXS5tYXAoYmFzZVBvcyA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3Qgb2Zmc2V0UG9zID0gbmV3IFZlY3RvcjIoYmFzZVBvcy54LCBiYXNlUG9zLnkpO1xuICAgICAgICAgICAgICAgIGNvbnN0IG1heERpc3QgPSBwcm5nLmZsb2F0SW5SYW5nZShiYXNlUG9zLmRbMF0sIGJhc2VQb3MuZFsxXSkgKiBzdXJmYWNlU2NhbGFyO1xuICAgICAgICAgICAgICAgIG9mZnNldFBvcy5yYW5kb21pemVPZmZzZXRJblBsYWNlKG1heERpc3QsIHBybmcuZmxvYXRJblJhbmdlKDAsIDEpKTtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICB4OiBvZmZzZXRQb3MueCxcbiAgICAgICAgICAgICAgICAgICAgeTogb2Zmc2V0UG9zLnksXG4gICAgICAgICAgICAgICAgICAgIHI6IHBybmcuZmxvYXRJblJhbmdlKGJhc2VQb3MuclswXSwgYmFzZVBvcy5yWzFdKSAqIHN1cmZhY2VTY2FsYXJcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSlcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgYnJhbmNoR3Jvd2VyID0gbmV3IEJvbnNhaVNhcGNlQ29sb25pemVyKHtcbiAgICAgICAgICAgIHRyZWVHZW5lcmF0b3I6IHRoaXMsXG4gICAgICAgICAgICBkZXB0aDogZGVwdGgsXG4gICAgICAgICAgICBzdGFydGluZ1BvaW50OiBwb3NpdGlvbixcbiAgICAgICAgICAgIHBvc2l0aW9uUHJlZGljYXRlOiAoYmJveCwgcG9zKSA9PiBtZXRhYmFsbFN1cmZhY2Uuc3BhY2VPY2N1cGllZChwb3MueCwgcG9zLnkpLFxuICAgICAgICAgICAgcGFyZW50QnJhbmNoOiBicmFuY2gsXG4gICAgICAgICAgICBiYm94OiBiYm94LFxuICAgICAgICAgICAgbGVhZkNvdW50OiBsZWFmQ291bnQsXG4gICAgICAgICAgICBsZWFmQXR0cmFjdGlvbkRpc3RhbmNlOiBsZWFmQXR0cmFjdGlvbkRpc3RhbmNlICogYmJveFNjYWxhcixcbiAgICAgICAgICAgIHNwYXduUG9pbnRzOiBbXSxcbiAgICAgICAgICAgIGJyYW5jaExlbmd0aDogNVxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBuZXdUcmVlUGFydCA9IG5ldyBUcmVlUGFydExlYWYoe1xuICAgICAgICAgICAgdHJlZUdlbmVyYXRvcjogdGhpcyxcbiAgICAgICAgICAgIG9yaWdpbjogcG9zaXRpb24sXG4gICAgICAgICAgICBkZXB0aDogZGVwdGgsXG4gICAgICAgICAgICBiYm94OiBiYm94LFxuICAgICAgICAgICAgYnJhbmNoR3Jvd2VyOiBicmFuY2hHcm93ZXIsXG4gICAgICAgICAgICBmYWRlSW46IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIG5ld1RyZWVQYXJ0LnN0YXJ0KCk7XG4gICAgICAgIG5ld1RyZWVQYXJ0LmluaXQoKTtcbiAgICAgICAgdGhpcy50cmVlUGFydHMucHVzaChuZXdUcmVlUGFydCk7XG4gICAgfVxuXG4gICAgcHVibGljIGdldEJyYW5jaFdpZHRoKGRlcHRoOiBudW1iZXIsIGJyYW5jaDogQnJhbmNoKTogbnVtYmVyIHtcbiAgICAgICAgY29uc3QgdHJlZVBhcnQgPSB0aGlzLmdldFRyZWVQYXJ0KGJyYW5jaCk7XG4gICAgICAgIGNvbnN0IGRlcHRoUGFyYW1zID0gQm9uc2FpR2VuZXJhdG9yLnRyZWVXaWR0aFBhcmFtc1tkZXB0aF07XG5cbiAgICAgICAgY29uc3QgZGVwdGhTdGFydFkgPSBkZXB0aCA9PSAwID8gZGVwdGhQYXJhbXMubWluU3RhcnRXaWR0aCA6IE1hdGgubWF4KGRlcHRoUGFyYW1zLm1pblN0YXJ0V2lkdGgsIHRyZWVQYXJ0LnN0YXJ0aW5nQnJhbmNoV2lkdGgpO1xuICAgICAgICBjb25zdCB3aWR0aCA9IGRlcHRoUGFyYW1zLndpZHRoRihkZXB0aFN0YXJ0WSwgYnJhbmNoLmdyb3d0aExvY2FsLnkpO1xuXG4gICAgICAgIHJldHVybiBNYXRoLm1heChkZXB0aFBhcmFtcy50YXJnZXRXaWR0aCwgd2lkdGgpO1xuICAgIH1cblxuICAgIHByaXZhdGUgc3RhdGljIEdST1dfT1JJR0lOOiBWZWN0b3IyID0gbmV3IFZlY3RvcjIoVHJlZUdlbmVyYXRvci5SRUZFUkVOQ0VfSEVJR0hUICogMC41LCBUcmVlR2VuZXJhdG9yLlJFRkVSRU5DRV9IRUlHSFQgLSAxMDApO1xuXG4gICAgcHJpdmF0ZSBzdGF0aWMgdHJlZVdpZHRoUGFyYW1zID0gW1xuICAgICAgICB7XG4gICAgICAgICAgICBtaW5TdGFydFdpZHRoOiAxNDAsXG4gICAgICAgICAgICB0YXJnZXRXaWR0aDogMzAsXG4gICAgICAgICAgICB3aWR0aEY6IChzdGFydEdyb3d0aDogbnVtYmVyLCBncm93dGhMb2NhbDogbnVtYmVyKSA9PiBzdGFydEdyb3d0aCArIGdyb3d0aExvY2FsICogLTAuMTdcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgbWluU3RhcnRXaWR0aDogMCxcbiAgICAgICAgICAgIHRhcmdldFdpZHRoOiAxNSxcbiAgICAgICAgICAgIHdpZHRoRjogKHN0YXJ0R3Jvd3RoOiBudW1iZXIsIGdyb3d0aExvY2FsOiBudW1iZXIpID0+IHN0YXJ0R3Jvd3RoICsgZ3Jvd3RoTG9jYWwgKiAtMC4xNVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBtaW5TdGFydFdpZHRoOiAwLFxuICAgICAgICAgICAgdGFyZ2V0V2lkdGg6IDcsXG4gICAgICAgICAgICB3aWR0aEY6IChzdGFydEdyb3d0aDogbnVtYmVyLCBncm93dGhMb2NhbDogbnVtYmVyKSA9PiBzdGFydEdyb3d0aCArIGdyb3d0aExvY2FsICogLTAuMTVcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgbWluU3RhcnRXaWR0aDogMCxcbiAgICAgICAgICAgIHRhcmdldFdpZHRoOiAzLFxuICAgICAgICAgICAgd2lkdGhGOiAoc3RhcnRHcm93dGg6IG51bWJlciwgZ3Jvd3RoTG9jYWw6IG51bWJlcikgPT4gc3RhcnRHcm93dGggKyBncm93dGhMb2NhbCAqIC0xLjUsXG4gICAgICAgIH1cbiAgICBdO1xuXG4gICAgcHJpdmF0ZSBtYWluQnJhbmNoUGF0dGVybjogQ2FudmFzUGF0dGVybjtcbiAgICBwcml2YXRlIGxlYWZTdGVuY2lsSW1hZ2U6IEhUTUxJbWFnZUVsZW1lbnQ7XG4gICAgcHJpdmF0ZSBsZWFmT3V0bGluZUltYWdlOiBIVE1MSW1hZ2VFbGVtZW50O1xuICAgIHByaXZhdGUgbGVhZlRleHR1cmVQYXR0ZXJuOiBDYW52YXNQYXR0ZXJuO1xuXG4gICAgcHJpdmF0ZSBzdGF0aWMgcG90RnJvbnRJbWFnZTogSFRNTEltYWdlRWxlbWVudDtcbiAgICBwcml2YXRlIHN0YXRpYyBwb3RCYWNrSW1hZ2U6IEhUTUxJbWFnZUVsZW1lbnQ7XG4gICAgcHJpdmF0ZSBzdGF0aWMgbWFpbkJyYW5jaEltYWdlOiBIVE1MSW1hZ2VFbGVtZW50O1xuICAgIHByaXZhdGUgc3RhdGljIGxlYWZPdXRsaW5lSW1hZ2U6IEhUTUxJbWFnZUVsZW1lbnQ7XG4gICAgcHJpdmF0ZSBzdGF0aWMgbGVhZlRleHR1cmVJbWFnZTogSFRNTEltYWdlRWxlbWVudDtcbiAgICBwcml2YXRlIHN0YXRpYyBsZWFmU3RlbmNpbEltYWdlOiBIVE1MSW1hZ2VFbGVtZW50O1xufVxuIiwiZXhwb3J0IG5hbWVzcGFjZSBBbmltYXRpb25GdW5jdGlvbnMge1xuICAgIGV4cG9ydCBjb25zdCBzaWdtb2lkXzBfMSA9ICh0OiBudW1iZXIpID0+IDIgKiAoLTAuNSArIDEgLyAoMSArIE1hdGguZXhwKC10KSkpO1xufSIsIm5hbWVzcGFjZSBBbmltYXRpb25NYW5hZ2VyIHtcbiAgICBsZXQgdG90YWxIaWRkZW5UaW1lOiBudW1iZXIgPSAwO1xuICAgIGxldCBoaWRkZW5TdGFydFRpbWU6IG51bWJlciA9IDA7XG4gICAgXG4gICAgbGV0IGFuaW1hdGlvbkV4cGxpY2l0UGF1c2VkOiBib29sZWFuID0gZmFsc2U7XG4gICAgbGV0IGFuaW1hdGlvblBsYXk6IGJvb2xlYW4gPSB0cnVlO1xuXG4gICAgc2V0dXBQYXVzZUxpc3RlbmVycygpO1xuXG4gICAgZnVuY3Rpb24gcmVmcmVzaFBsYXlpbmdTdGF0dXMoKSB7XG4gICAgICAgIGNvbnN0IGFuaW1hdGlvblBsYXlOb3cgPSAoXG4gICAgICAgICAgICBkb2N1bWVudC52aXNpYmlsaXR5U3RhdGUgPT0gJ3Zpc2libGUnICYmIFxuICAgICAgICAgICAgIWFuaW1hdGlvbkV4cGxpY2l0UGF1c2VkXG4gICAgICAgICk7XG5cbiAgICAgICAgaWYgKGFuaW1hdGlvblBsYXkgPT0gYW5pbWF0aW9uUGxheU5vdykge1xuICAgICAgICAgICAgLy8gdW5jaGFuZ2VkXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gZWxzZSBpZiAoYW5pbWF0aW9uUGxheU5vdykge1xuICAgICAgICAgICAgLy8gc3RhcnRcbiAgICAgICAgICAgIHRvdGFsSGlkZGVuVGltZSArPSAocGVyZm9ybWFuY2Uubm93KCkgLSBoaWRkZW5TdGFydFRpbWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gc3RvcFxuICAgICAgICAgICAgaGlkZGVuU3RhcnRUaW1lID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgYW5pbWF0aW9uUGxheSA9IGFuaW1hdGlvblBsYXlOb3c7XG5cbiAgICAgICAgb25FdmVudC5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudChhbmltYXRpb25QbGF5ID8gJ3N0YXJ0JyA6ICdzdG9wJywge1xuICAgICAgICAgICAgZGV0YWlsOiB7IHBsYXlpbmc6IGZhbHNlIH1cbiAgICAgICAgfSkpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNldHVwUGF1c2VMaXN0ZW5lcnMoKSB7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCAoKSA9PiByZWZyZXNoUGxheWluZ1N0YXR1cygpKTtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndmlzaWJpbGl0eWNoYW5nZScsIHJlZnJlc2hQbGF5aW5nU3RhdHVzKTtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIChlKSA9PiB7XG4gICAgICAgICAgICBpZiAoZS5rZXkgIT0gJ3AnIHx8IGUucmVwZWF0KVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIGFuaW1hdGlvbkV4cGxpY2l0UGF1c2VkID0gdHJ1ZTtcbiAgICAgICAgICAgIHJlZnJlc2hQbGF5aW5nU3RhdHVzKCk7XG4gICAgICAgIH0pXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgKGUpID0+IHtcbiAgICAgICAgICAgIGlmICgoZS5rZXkgIT0gJ3AnKSlcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICBhbmltYXRpb25FeHBsaWNpdFBhdXNlZCA9IGZhbHNlO1xuICAgICAgICAgICAgcmVmcmVzaFBsYXlpbmdTdGF0dXMoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGdldFRvdGFsUGxheVRpbWUoKSB7XG4gICAgICAgIHJldHVybiBwZXJmb3JtYW5jZS5ub3coKSAtIGdldFRvdGFsUGF1c2VkVGltZSgpO1xuICAgIH1cblxuICAgIGV4cG9ydCBmdW5jdGlvbiBnZXRUb3RhbFBhdXNlZFRpbWUoKSB7XG4gICAgICAgIGlmIChhbmltYXRpb25QbGF5KSB7XG4gICAgICAgICAgICByZXR1cm4gdG90YWxIaWRkZW5UaW1lO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRvdGFsSGlkZGVuVGltZSArICAocGVyZm9ybWFuY2Uubm93KCkgLSBoaWRkZW5TdGFydFRpbWUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGlzUGxheWluZygpIHtcbiAgICAgICAgcmV0dXJuIGFuaW1hdGlvblBsYXk7XG4gICAgfVxuXG4gICAgZXhwb3J0IGNvbnN0IG9uRXZlbnQgPSBuZXcgRXZlbnRUYXJnZXQoKTtcbn1cblxuLy8gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuLy8gICAgIGNvbnNvbGUubG9nKGBUID0gJHtBbmltYXRpb25NYW5hZ2VyLmdldFRvdGFsUGxheVRpbWUoKX1gKTtcbi8vIH0sIDMwKTtcblxuaW50ZXJmYWNlIFZpc2libGVUaW1lck9wdGlvbnMge1xuICAgIG9uRmlyZTogKCkgPT4gdm9pZCxcbiAgICB0aW1lOiBudW1iZXIsXG4gICAgcmVwZWF0OiBib29sZWFuXG59XG5cbmNsYXNzIFZpc2libGVUaW1lciB7XG4gICAgcHVibGljIGNvbnN0cnVjdG9yKG9wdGlvbnM6IFZpc2libGVUaW1lck9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICAgICAgdGhpcy5kZWx0YVN0YXJ0VCA9IHBlcmZvcm1hbmNlLm5vdygpO1xuXG4gICAgICAgIEFuaW1hdGlvbk1hbmFnZXIub25FdmVudC5hZGRFdmVudExpc3RlbmVyKCdzdGFydCcsIHRoaXMuYW5pbWF0aW9uU3RhcnRMaXN0ZW5lciA9ICgpID0+IHRoaXMuc3RhcnQoKSk7XG4gICAgICAgIEFuaW1hdGlvbk1hbmFnZXIub25FdmVudC5hZGRFdmVudExpc3RlbmVyKCdzdG9wJywgdGhpcy5hbmltYXRpb25TdG9wTGlzdGVuZXIgPSAoKSA9PiB0aGlzLnN0b3AoKSk7XG5cbiAgICAgICAgaWYgKEFuaW1hdGlvbk1hbmFnZXIuaXNQbGF5aW5nKCkpXG4gICAgICAgICAgICB0aGlzLnN0YXJ0KCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdG9wKCkge1xuICAgICAgICB0aGlzLmRlbHRhVCArPSAocGVyZm9ybWFuY2Uubm93KCkgLSB0aGlzLmRlbHRhU3RhcnRUKTtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMudGltZW91dCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdGFydCgpIHtcbiAgICAgICAgdGhpcy5kZWx0YVN0YXJ0VCA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgICAgICBjb25zdCB0aW1lUmVtYWluaW5nID0gKHRoaXMub3B0aW9ucy50aW1lIC0gdGhpcy5kZWx0YVQpO1xuICAgICAgICB0aGlzLnRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHRoaXMuZmlyZSgpLCB0aW1lUmVtYWluaW5nKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGZpcmUoKSB7XG4gICAgICAgIHRoaXMub3B0aW9ucy5vbkZpcmUoKTtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5yZXBlYXQpIHtcbiAgICAgICAgICAgIHRoaXMuZGVsdGFUID0gMDtcbiAgICAgICAgICAgIHRoaXMuc3RhcnQoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZGlzcG9zZSgpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHB1YmxpYyBkaXNwb3NlKCkge1xuICAgICAgICBjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0KTtcbiAgICAgICAgQW5pbWF0aW9uTWFuYWdlci5vbkV2ZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3N0YXJ0JywgdGhpcy5hbmltYXRpb25TdGFydExpc3RlbmVyKTtcbiAgICAgICAgQW5pbWF0aW9uTWFuYWdlci5vbkV2ZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3N0b3AnLCB0aGlzLmFuaW1hdGlvblN0b3BMaXN0ZW5lcik7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhbmltYXRpb25TdGFydExpc3RlbmVyOiAoZTogYW55KSA9PiB2b2lkO1xuICAgIHByaXZhdGUgYW5pbWF0aW9uU3RvcExpc3RlbmVyOiAoZTogYW55KSA9PiB2b2lkO1xuXG4gICAgcHJpdmF0ZSBvcHRpb25zOiBWaXNpYmxlVGltZXJPcHRpb25zO1xuXG4gICAgcHJpdmF0ZSB0aW1lb3V0OiBhbnkgPSBudWxsO1xuICAgIHByaXZhdGUgZGVsdGFTdGFydFQ6IG51bWJlciA9IDA7XG4gICAgcHJpdmF0ZSBkZWx0YVQ6IG51bWJlciA9IDA7XG59XG5cbmV4cG9ydCBjbGFzcyBBbmltYXRpb25Hcm91cCB7XG4gICAgcHVibGljIGFkZEFuaW1hdGlvbih0cmFjazogQW5pbWF0aW9uKTogQW5pbWF0aW9uIHtcbiAgICAgICAgdGhpcy50cmFja3MucHVzaCh0cmFjayk7XG4gICAgICAgIHJldHVybiB0cmFjaztcbiAgICB9XG4gICAgcHVibGljIGNhbmNlbCgpIHtcbiAgICAgICAgdGhpcy50cmFja3MuZm9yRWFjaCgodHJhY2spID0+IHRyYWNrLmNhbmNlbCgpKTtcbiAgICB9XG4gICAgcHJpdmF0ZSB0cmFja3M6IEFycmF5PEFuaW1hdGlvbj4gPSBbXTtcbn1cblxuZXhwb3J0IGNsYXNzIEFuaW1hdGlvbiB7XG4gICAgcHVibGljIGNhbmNlbCgpIHtcbiAgICAgICAgdGhpcy5jYW5jZWxsZWQgPSB0cnVlO1xuICAgIH1cbiAgICBwdWJsaWMgZ2V0IGlzQ2FuY2VsbGVkKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5jYW5jZWxsZWQ7IH1cbiAgICBwcml2YXRlIGNhbmNlbGxlZDogYm9vbGVhbiA9IGZhbHNlO1xufVxuXG5cbmV4cG9ydCBlbnVtIEFuaW1hdGlvblN0YXRlIHsgQU5JTUFUSU5HLCBET05FIH07XG5leHBvcnQgaW50ZXJmYWNlIEFuaW1hdGlvbk9wdGlvbnMge1xuICAgIGFuaW1hdGU6ICh0OiBudW1iZXIpID0+IEFuaW1hdGlvblN0YXRlIHwgdm9pZDtcbiAgICBvbkJlZm9yZT86ICgpID0+IHZvaWQ7XG4gICAgb25Eb25lPzogKCkgPT4gdm9pZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0YXJ0QW5pbWF0aW9uKG9wdGlvbnM6IEFuaW1hdGlvbk9wdGlvbnMpOiBBbmltYXRpb24ge1xuICAgIGNvbnN0IGFuaW1hdGlvblRyYWNrID0gbmV3IEFuaW1hdGlvbigpO1xuICAgIGNvbnN0IHN0YXJ0VGltZSA9IEFuaW1hdGlvbk1hbmFnZXIuZ2V0VG90YWxQbGF5VGltZSgpO1xuICAgIFxuICAgIG9wdGlvbnMub25CZWZvcmU/LigpO1xuXG4gICAgY29uc3QgZnVuYyA9ICgpID0+IHtcbiAgICAgICAgaWYgKGFuaW1hdGlvblRyYWNrLmlzQ2FuY2VsbGVkKVxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCByZWxhdGl2ZVRpbWUgPSBBbmltYXRpb25NYW5hZ2VyLmdldFRvdGFsUGxheVRpbWUoKSAtIHN0YXJ0VGltZTtcbiAgICAgICAgICAgIGNvbnN0IGNvbnRpbnVlQW5pbWF0aW9uID0gb3B0aW9ucy5hbmltYXRlKHJlbGF0aXZlVGltZSk7XG4gICAgICAgICAgICBzd2l0Y2goY29udGludWVBbmltYXRpb24pIHtcbiAgICAgICAgICAgICAgICBjYXNlIEFuaW1hdGlvblN0YXRlLkRPTkU6XG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMub25Eb25lPy4oKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBBbmltYXRpb25TdGF0ZS5BTklNQVRJTkc6XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgZnVuYygpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuYygpO1xuXG4gICAgcmV0dXJuIGFuaW1hdGlvblRyYWNrO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEFuaW1hdGlvblRpbWVyT3B0aW9ucyB7XG4gICAgY2FsbGJhY2s6ICgpID0+IHZvaWQ7XG4gICAgdGltZTogbnVtYmVyO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0QW5pbWF0aW9uSW50ZXJ2YWwob3B0aW9uczogQW5pbWF0aW9uVGltZXJPcHRpb25zKTogQW5pbWF0aW9uIHtcbiAgICBjb25zdCBhbmltYXRpb25UcmFjayA9IG5ldyBBbmltYXRpb24oKTtcblxuICAgIGNvbnN0IHRpbWVyOiBWaXNpYmxlVGltZXIgPSBuZXcgVmlzaWJsZVRpbWVyKHtcbiAgICAgICAgb25GaXJlOiAoKSA9PiB7XG4gICAgICAgICAgICBpZiAoYW5pbWF0aW9uVHJhY2suaXNDYW5jZWxsZWQpIHtcbiAgICAgICAgICAgICAgICB0aW1lci5kaXNwb3NlKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb3B0aW9ucy5jYWxsYmFjaygpO1xuICAgICAgICB9LFxuICAgICAgICB0aW1lOiBvcHRpb25zLnRpbWUsXG4gICAgICAgIHJlcGVhdDogdHJ1ZVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIGFuaW1hdGlvblRyYWNrO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0QW5pbWF0aW9uVGltZW91dChvcHRpb25zOiBBbmltYXRpb25UaW1lck9wdGlvbnMpOiBBbmltYXRpb24ge1xuICAgIGNvbnN0IGFuaW1hdGlvblRyYWNrID0gbmV3IEFuaW1hdGlvbigpO1xuXG4gICAgY29uc3QgdGltZXI6IFZpc2libGVUaW1lciA9IG5ldyBWaXNpYmxlVGltZXIoe1xuICAgICAgICBvbkZpcmU6ICgpID0+IHtcbiAgICAgICAgICAgIGlmIChhbmltYXRpb25UcmFjay5pc0NhbmNlbGxlZCkge1xuICAgICAgICAgICAgICAgIHRpbWVyLmRpc3Bvc2UoKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvcHRpb25zLmNhbGxiYWNrKCk7XG4gICAgICAgIH0sXG4gICAgICAgIHRpbWU6IG9wdGlvbnMudGltZSxcbiAgICAgICAgcmVwZWF0OiBmYWxzZVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIGFuaW1hdGlvblRyYWNrO1xufSIsImV4cG9ydCBuYW1lc3BhY2UgQ2FudmFzSGVscGVyIHtcbiAgICBjb25zdCBjYWNoZWRDYW52YXNlczogTWFwPG51bWJlciwgQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEPiA9IG5ldyBNYXAoKTtcbiAgICBleHBvcnQgZnVuY3Rpb24gZ2V0VGVtcENhbnZhcyhzaXplOiBudW1iZXIpIHtcbiAgICAgICAgbGV0IGNhbnZhcyA9IGNhY2hlZENhbnZhc2VzLmdldChzaXplKTtcbiAgICAgICAgaWYgKCFjYW52YXMpIHtcbiAgICAgICAgICAgIGNhbnZhcyA9IGNyZWF0ZVRlbXBDYW52YXMoc2l6ZSwgc2l6ZSk7XG4gICAgICAgICAgICBjYWNoZWRDYW52YXNlcy5zZXQoc2l6ZSwgY2FudmFzKTtcbiAgICAgICAgfVxuICAgICAgICBjYW52YXMuY2xlYXJSZWN0KDAsIDAsIHNpemUsIHNpemUpO1xuICAgICAgICByZXR1cm4gY2FudmFzO1xuICAgIH1cblxuICAgIGV4cG9ydCBmdW5jdGlvbiBjcmVhdGVUZW1wQ2FudmFzKHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyKTogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEIHtcbiAgICAgICAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcbiAgICAgICAgY2FudmFzLndpZHRoID0gd2lkdGg7XG4gICAgICAgIGNhbnZhcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgICAgIGNvbnN0IGNvbnRleHQgPSA8Q2FudmFzUmVuZGVyaW5nQ29udGV4dDJEPmNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XG4gICAgICAgIGNvbnRleHQuaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XG4gICAgICAgIHJldHVybiBjb250ZXh0O1xuICAgIH1cblxuICAgIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBsb2FkSW1hZ2UodXJsOiBzdHJpbmcsIGltZ0VsZW1lbnQ/OiBIVE1MSW1hZ2VFbGVtZW50KTogUHJvbWlzZTxIVE1MSW1hZ2VFbGVtZW50PiB7XG4gICAgICAgIGxldCBpbWcgPSBpbWdFbGVtZW50IHx8IG5ldyBJbWFnZSgpO1xuICAgICAgICBsZXQgaW5zdGFudExvYWRGcm9tQ2FjaGU6IGJvb2xlYW4gPSBmYWxzZTtcbiAgICAgICAgaW1nLm9ubG9hZCA9ICgpID0+IGluc3RhbnRMb2FkRnJvbUNhY2hlID0gdHJ1ZTtcbiAgICAgICAgaW1nLnNyYyA9IHVybDtcbiAgICAgICAgaWYgKGluc3RhbnRMb2FkRnJvbUNhY2hlKVxuICAgICAgICAgICAgcmV0dXJuIGltZztcbiAgICAgICAgYXdhaXQgbmV3IFByb21pc2UocmVzb2x2ZSA9PiBpbWcub25sb2FkID0gcmVzb2x2ZSk7XG4gICAgICAgIHJldHVybiBpbWc7XG4gICAgfVxuXG4gICAgY29uc3QgY2FjaGVkSW1hZ2VCb3JkZXJzOiBNYXA8SFRNTEltYWdlRWxlbWVudCwgQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEPiA9IG5ldyBNYXAoKTsgLy9jcmVhdGVUZW1wQ2FudmFzKClcbiAgICBjb25zdCBvZmZzZXRzOiBBcnJheTxbbnVtYmVyLCBudW1iZXJdPiA9IFtbLTEsIC0xXSwgWzAsIC0xXSwgWzEsIC0xXSwgWy0xLCAwXSwgWzEsIDBdLCBbLTEsIDFdLCBbMCwgMV0sIFsxLCAxXV07XG4gICAgZXhwb3J0IGZ1bmN0aW9uIGRyYXdJbWFnZUJvcmRlcihpbWc6IEhUTUxJbWFnZUVsZW1lbnQsIGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCB0aGlja25lc3M6IG51bWJlcikge1xuICAgICAgICBsZXQgYm9yZGVyQ3R4ID0gY2FjaGVkSW1hZ2VCb3JkZXJzLmdldChpbWcpO1xuICAgICAgICBpZiAoIWJvcmRlckN0eCkge1xuICAgICAgICAgICAgYm9yZGVyQ3R4ID0gY3JlYXRlVGVtcENhbnZhcyg8bnVtYmVyPmltZy53aWR0aCwgPG51bWJlcj5pbWcuaGVpZ2h0KTtcblxuICAgICAgICAgICAgLy8gZHJhdyB0aGUgaW1hZ2UgaW4gOCBjb21wYXNzIG9mZnNldHMgd2l0aCBzY2FsaW5nXG4gICAgICAgICAgICBmb3IgKGNvbnN0IFt4T2Zmc2V0LCB5T2Zmc2V0XSBvZiBvZmZzZXRzKSB7XG4gICAgICAgICAgICAgICAgYm9yZGVyQ3R4LmRyYXdJbWFnZShpbWcsIHhPZmZzZXQgKiB0aGlja25lc3MsIHlPZmZzZXQgKiB0aGlja25lc3MpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBmaWxsIHNwbGF0dGVkIGFyZWEgd2l0aCBibGFjayB0byBjcmVhdGUgdGhlIGJvcmRlciByZWdpb25cbiAgICAgICAgICAgIGJvcmRlckN0eC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnc291cmNlLWluJztcbiAgICAgICAgICAgIGJvcmRlckN0eC5maWxsU3R5bGUgPSAnYmxhY2snO1xuICAgICAgICAgICAgYm9yZGVyQ3R4LmZpbGxSZWN0KDAsIDAsIDxudW1iZXI+aW1nLndpZHRoLCA8bnVtYmVyPmltZy5oZWlnaHQpO1xuXG4gICAgICAgICAgICBjYWNoZWRJbWFnZUJvcmRlcnMuc2V0KGltZywgYm9yZGVyQ3R4KTtcbiAgICAgICAgfVxuICAgICAgICBjdHguZHJhd0ltYWdlKGJvcmRlckN0eC5jYW52YXMsIDAsIDApO1xuICAgICAgICBjdHguZHJhd0ltYWdlKGltZywgMCwgMCk7XG4gICAgfVxuXG4gICAgLy8gY29uc3QgY2FjaGVkSW1hZ2VXaXRoQm9yZGVyOiBNYXA8Q2FudmFzSW1hZ2VTb3VyY2UsIENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRD4gPSBuZXcgTWFwKCk7XG4gICAgLy8gZXhwb3J0IGZ1bmN0aW9uIGRyYXdJbWFnZVdpdGhCb3JkZXIoaW1nOiBDYW52YXNJbWFnZVNvdXJjZSwgaW1nU2l6ZTogbnVtYmVyLCBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCB8IG51bGwsIHRoaWNrbmVzczogbnVtYmVyKTogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEIHtcbiAgICAvLyAgIGlmIChjYWNoZWRJbWFnZVdpdGhCb3JkZXIuaGFzKGltZykpXG4gICAgLy8gICAgIHJldHVybiA8Q2FudmFzUmVuZGVyaW5nQ29udGV4dDJEPmNhY2hlZEltYWdlV2l0aEJvcmRlci5nZXQoaW1nKTtcbiAgICAvLyAgIGNvbnN0IHRtcEN0eCA9IGNyZWF0ZVRlbXBDYW52YXMoaW1nU2l6ZSwgaW1nU2l6ZSk7XG4gICAgLy8gICB7XG4gICAgLy8gICAgIGRyYXdJbWFnZUJvcmRlcihpbWcsIGltZ1NpemUsIHRtcEN0eCwgdGhpY2tuZXNzKTtcbiAgICAvLyAgICAgY3R4LmRyYXdJbWFnZShpbWcsIDAsIDApO1xuICAgIC8vICAgfVxuICAgIC8vICAgY2FjaGVkSW1hZ2VXaXRoQm9yZGVyLnNldChpbWcsIGN0eCk7XG4gICAgLy8gICByZXR1cm4gY3R4O1xuICAgIC8vIH1cbn0iLCJpbXBvcnQgeyBWZWN0b3IyIH0gZnJvbSBcIi4vdmVjdG9yMlwiO1xuXG5leHBvcnQgY2xhc3MgQkJveCB7XG4gICAgcHVibGljIGNvbnN0cnVjdG9yKG1pbkNvcm5lcjogVmVjdG9yMiwgbWF4Q29ybmVyOiBWZWN0b3IyKSB7XG4gICAgICAgIHRoaXMubWluQ29ybmVyID0gbWluQ29ybmVyLmNsb25lKCk7XG4gICAgICAgIHRoaXMubWF4Q29ybmVyID0gbWF4Q29ybmVyLmNsb25lKCk7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBmcm9tUG9zaXRpb25BbmRTaXplKG1pbkNvcm5lcjogVmVjdG9yMiwgc2l6ZTogVmVjdG9yMikge1xuICAgICAgICBjb25zdCBuZXdNaW5Db3JuZXIgPSBtaW5Db3JuZXI7XG4gICAgICAgIGNvbnN0IG5ld01heENvcm5lciA9IG1pbkNvcm5lci5hZGQoc2l6ZSk7XG4gICAgICAgIHJldHVybiBuZXcgQkJveChuZXdNaW5Db3JuZXIsIG5ld01heENvcm5lcik7XG5cbiAgICB9XG5cbiAgICBwdWJsaWMgaW50ZXJzZWN0cyhiYm94OiBCQm94KTogYm9vbGVhbiB7IHJldHVybiBCQm94LmludGVyc2VjdHModGhpcywgYmJveCk7IH1cblxuICAgIHB1YmxpYyBnZXQgd2lkdGgoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMubWF4Q29ybmVyLnggLSB0aGlzLm1pbkNvcm5lci54OyB9XG4gICAgcHVibGljIGdldCBoZWlnaHQoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMubWF4Q29ybmVyLnkgLSB0aGlzLm1pbkNvcm5lci55OyB9XG4gICAgcHVibGljIGdldCBjZW50ZXIoKTogVmVjdG9yMiB7IHJldHVybiB0aGlzLm1pbkNvcm5lci5hZGQodGhpcy5zaXplLnNjYWxlKDAuNSkpOyB9XG4gICAgcHVibGljIGdldCBzaXplKCk6IFZlY3RvcjIgeyByZXR1cm4gbmV3IFZlY3RvcjIodGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpOyB9XG5cbiAgICBwdWJsaWMgbWF4aW1pemVBZ2FpbnN0UG9pbnQocG9zOiBWZWN0b3IyKSB7XG4gICAgICAgIHRoaXMubWluQ29ybmVyLnggPSBNYXRoLm1pbih0aGlzLm1pbkNvcm5lci54LCBwb3MueCk7XG4gICAgICAgIHRoaXMubWluQ29ybmVyLnkgPSBNYXRoLm1pbih0aGlzLm1pbkNvcm5lci55LCBwb3MueSk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLm1heENvcm5lci54ID0gTWF0aC5tYXgodGhpcy5tYXhDb3JuZXIueCwgcG9zLngpO1xuICAgICAgICB0aGlzLm1heENvcm5lci55ID0gTWF0aC5tYXgodGhpcy5tYXhDb3JuZXIueSwgcG9zLnkpO1xuICAgIH1cblxuICAgIHB1YmxpYyBjbG9uZSgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBCQm94KHRoaXMubWluQ29ybmVyLmNsb25lKCksIHRoaXMubWF4Q29ybmVyLmNsb25lKCkpO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXRaZXJvKCkge1xuICAgICAgICB0aGlzLm1pbkNvcm5lciA9IFZlY3RvcjIuWmVybztcbiAgICAgICAgdGhpcy5tYXhDb3JuZXIgPSBWZWN0b3IyLlplcm87XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBpbnRlcnNlY3RzKGJib3hBOiBCQm94LCBiYm94QjogQkJveCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gIShcbiAgICAgICAgICAgIChiYm94QS5taW5Db3JuZXIueCA+IGJib3hCLm1heENvcm5lci54KSB8fCAoYmJveEEubWF4Q29ybmVyLnggPCBiYm94Qi5taW5Db3JuZXIueCkgfHxcbiAgICAgICAgICAgIChiYm94QS5taW5Db3JuZXIueSA+IGJib3hCLm1heENvcm5lci55KSB8fCAoYmJveEEubWF4Q29ybmVyLnkgPCBiYm94Qi5taW5Db3JuZXIueSlcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgbWluQ29ybmVyOiBWZWN0b3IyO1xuICAgIHB1YmxpYyBtYXhDb3JuZXI6IFZlY3RvcjI7XG59XG4iLCJleHBvcnQgY2xhc3MgVmVjdG9yMiB7XG4gICAgcHVibGljIGNvbnN0cnVjdG9yKHg6IG51bWJlciA9IDAsIHk6IG51bWJlciA9IDApIHsgdGhpcy5feCA9IHg7IHRoaXMuX3kgPSB5OyB9XG4gICAgcHVibGljIGNvcHlGcm9tKG90aGVyVmVjdG9yOiBWZWN0b3IyKTogVmVjdG9yMiB7IHRoaXMuX3ggPSBvdGhlclZlY3Rvci54OyB0aGlzLl95ID0gb3RoZXJWZWN0b3IueTsgcmV0dXJuIHRoaXM7IH1cbiAgICBwdWJsaWMgY2xvbmUoKTogVmVjdG9yMiB7IHJldHVybiBuZXcgVmVjdG9yMih0aGlzLl94LCB0aGlzLl95KTsgfVxuICAgIHB1YmxpYyBhZGQob3RoZXJWZWN0b3I6IFZlY3RvcjIpOiBWZWN0b3IyIHsgcmV0dXJuIHRoaXMuY2xvbmUoKS5hZGRJblBsYWNlKG90aGVyVmVjdG9yKTsgfVxuICAgIHB1YmxpYyBzdWJ0cmFjdChvdGhlclZlY3RvcjogVmVjdG9yMik6IFZlY3RvcjIgeyByZXR1cm4gdGhpcy5jbG9uZSgpLnN1YnRyYWN0SW5QbGFjZShvdGhlclZlY3Rvcik7IH1cbiAgICBwdWJsaWMgc2NhbGUoc2NhbGFyOiBudW1iZXIpOiBWZWN0b3IyIHsgcmV0dXJuIHRoaXMuY2xvbmUoKS5zY2FsZUluUGxhY2Uoc2NhbGFyKTsgfVxuICAgIHB1YmxpYyBlbGVtZW50TXVsdGlwbHkoeDogbnVtYmVyLCB5OiBudW1iZXIpOiBWZWN0b3IyIHsgcmV0dXJuIG5ldyBWZWN0b3IyKHRoaXMuX3ggKiB4LCB0aGlzLl95ICogeSk7IH1cbiAgICBwdWJsaWMgZG90KG90aGVyVmVjOiBWZWN0b3IyKTogbnVtYmVyIHsgcmV0dXJuICh0aGlzLl94ICogb3RoZXJWZWMueCArIHRoaXMuX3kgKiBvdGhlclZlYy55KTsgfVxuICAgIHB1YmxpYyBhZGRJblBsYWNlRnJvbUZsb2F0cyh4OiBudW1iZXIsIHk6IG51bWJlcik6IFZlY3RvcjIgeyB0aGlzLl94ICs9IHg7IHRoaXMuX3kgKz0geTsgcmV0dXJuIHRoaXM7IH1cbiAgICBwdWJsaWMgc3VidHJhY3RJblBsYWNlRnJvbUZsb2F0cyh4OiBudW1iZXIsIHk6IG51bWJlcik6IFZlY3RvcjIgeyB0aGlzLl94IC09IHg7IHRoaXMuX3kgLT0geTsgcmV0dXJuIHRoaXM7IH1cbiAgICBwdWJsaWMgYWRkRnJvbUZsb2F0cyh4OiBudW1iZXIsIHk6IG51bWJlcik6IFZlY3RvcjIgeyByZXR1cm4gbmV3IFZlY3RvcjIodGhpcy5feCArIHgsIHRoaXMuX3kgKyB5KTsgfVxuICAgIHB1YmxpYyBhZGRJblBsYWNlKG90aGVyVmVjdG9yOiBWZWN0b3IyKTogVmVjdG9yMiB7IHRoaXMuX3ggKz0gb3RoZXJWZWN0b3IuX3g7IHRoaXMuX3kgKz0gb3RoZXJWZWN0b3IuX3k7IHJldHVybiB0aGlzOyB9XG4gICAgcHVibGljIHN1YnRyYWN0SW5QbGFjZShvdGhlclZlY3RvcjogVmVjdG9yMik6IFZlY3RvcjIgeyB0aGlzLl94IC09IG90aGVyVmVjdG9yLl94OyB0aGlzLl95IC09IG90aGVyVmVjdG9yLl95OyByZXR1cm4gdGhpczsgfVxuICAgIHB1YmxpYyBzY2FsZUluUGxhY2Uoc2NhbGFyOiBudW1iZXIpOiBWZWN0b3IyIHsgdGhpcy5feCAqPSBzY2FsYXI7IHRoaXMuX3kgKj0gc2NhbGFyOyByZXR1cm4gdGhpczsgfVxuICAgIHB1YmxpYyBub3JtYWxpemUoKTogVmVjdG9yMiB7IGNvbnN0IGxlbmd0aCA9IHRoaXMubGVuZ3RoKCk7IHRoaXMuX3ggLz0gbGVuZ3RoOyB0aGlzLl95IC89IGxlbmd0aDsgcmV0dXJuIHRoaXM7IH1cbiAgICBwdWJsaWMgZXF1YWxzKG90aGVyVmVjOiBWZWN0b3IyKTogYm9vbGVhbiB7IHJldHVybiAodGhpcy5feCA9PSBvdGhlclZlYy54ICYmIHRoaXMuX3kgPT0gb3RoZXJWZWMueSkgfTtcbiAgICBwdWJsaWMgbm9ybWFsKCk6IFZlY3RvcjIgeyByZXR1cm4gbmV3IFZlY3RvcjIoLXRoaXMuX3ksIHRoaXMuX3gpOyB9XG4gICAgcHVibGljIGZsb29yKCk6IFZlY3RvcjIgeyByZXR1cm4gbmV3IFZlY3RvcjIoTWF0aC5mbG9vcih0aGlzLl94KSwgTWF0aC5mbG9vcih0aGlzLl95KSk7IH1cbiAgICBwdWJsaWMgbGVuZ3RoKCk6IG51bWJlciB7IHJldHVybiBNYXRoLnNxcnQodGhpcy5feCAqIHRoaXMuX3ggKyB0aGlzLl95ICogdGhpcy5feSk7IH1cbiAgICBwdWJsaWMgcmFuZG9taXplT2Zmc2V0SW5QbGFjZShtYXhEaXN0OiBudW1iZXIsIHJhbmRvbT86IG51bWJlcik6IFZlY3RvcjIge1xuICAgICAgICByYW5kb20gPSByYW5kb20gPz8gTWF0aC5yYW5kb20oKTtcbiAgICAgICAgY29uc3QgYW5nbGUgPSByYW5kb20gKiBNYXRoLlBJICogMjtcbiAgICAgICAgdGhpcy5feCArPSBNYXRoLmNvcyhhbmdsZSkgKiBtYXhEaXN0O1xuICAgICAgICB0aGlzLl95ICs9IE1hdGguc2luKGFuZ2xlKSAqIG1heERpc3Q7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBwdWJsaWMgZ2V0IGFuZ2xlKCk6IG51bWJlciB7IHJldHVybiBNYXRoLmF0YW4yKHRoaXMuX3ksIHRoaXMuX3gpOyB9XG4gICAgcHVibGljIHJhbmRvbWl6ZUFuZ2xlKG1pbkFuZ2xlRGlmZjogbnVtYmVyLCBtYXhBbmdsZURpZmY6IG51bWJlciwgcmFuZG9tOiBudW1iZXIpOiBWZWN0b3IyIHtcbiAgICAgICAgcmFuZG9tID0gcmFuZG9tID8/IE1hdGgucmFuZG9tKCk7XG4gICAgICAgIGNvbnN0IGxlbmd0aDogbnVtYmVyID0gdGhpcy5sZW5ndGgoKTtcbiAgICAgICAgY29uc3QgZGlyID0gcmFuZG9tID4gMC41O1xuICAgICAgICBjb25zdCBjdXJyZW50QW5nbGU6IG51bWJlciA9IE1hdGguYXRhbjIodGhpcy5feSwgdGhpcy5feCk7XG4gICAgICAgIGNvbnN0IG5ld0FuZ2xlOiBudW1iZXIgPSBjdXJyZW50QW5nbGUgKyAocmFuZG9tID4gMC41ID8gMSA6IC0xKSAqIChtaW5BbmdsZURpZmYgKyAobWF4QW5nbGVEaWZmIC0gbWluQW5nbGVEaWZmKSAqIHJhbmRvbSk7XG4gICAgICAgIHJldHVybiBuZXcgVmVjdG9yMihNYXRoLmNvcyhuZXdBbmdsZSksIE1hdGguc2luKG5ld0FuZ2xlKSkuc2NhbGUobGVuZ3RoKTtcbiAgICB9XG4gICAgcHVibGljIHN0YXRpYyBmcm9tQW5nbGUoYW5nbGU6IG51bWJlcik6IFZlY3RvcjIge1xuICAgICAgICByZXR1cm4gbmV3IFZlY3RvcjIoTWF0aC5jb3MoYW5nbGUpLCBNYXRoLnNpbihhbmdsZSkpO1xuICAgIH1cbiAgICBwdWJsaWMgc3RhdGljIGdldCBPbmUoKTogVmVjdG9yMiB7IHJldHVybiBuZXcgVmVjdG9yMigxLjAsIDEuMCk7IH1cbiAgICBwdWJsaWMgc3RhdGljIGdldCBaZXJvKCk6IFZlY3RvcjIgeyByZXR1cm4gbmV3IFZlY3RvcjIoMC4wLCAwLjApOyB9XG4gICAgcHVibGljIGdldCB4KCk6IG51bWJlciB7IHJldHVybiB0aGlzLl94OyB9IHB1YmxpYyBzZXQgeCh4OiBudW1iZXIpIHsgdGhpcy5feCA9IHg7IH1cbiAgICBwdWJsaWMgZ2V0IHkoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuX3k7IH0gcHVibGljIHNldCB5KHk6IG51bWJlcikgeyB0aGlzLl95ID0geTsgfVxuICAgIHByaXZhdGUgX3g6IG51bWJlcjsgcHJpdmF0ZSBfeTogbnVtYmVyO1xufVxuIiwiZXhwb3J0IGludGVyZmFjZSBNZXRhYmFsbE9wdGlvbnMge1xuICAgIHRocmVzaG9sZD86IG51bWJlcjtcbiAgICBwb2ludHM6IEFycmF5PE1ldGFQb2ludD47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTWV0YVBvaW50IHtcbiAgICB4OiBudW1iZXI7XG4gICAgeTogbnVtYmVyO1xuICAgIHI6IG51bWJlcjtcbn07XG5cbmV4cG9ydCBjbGFzcyBNZXRhYmFsbFN1cmZhY2Uge1xuICAgIHB1YmxpYyBjb25zdHJ1Y3RvcihvcHRpb25zOiBNZXRhYmFsbE9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy50aHJlc2hvbGQgPSBvcHRpb25zLnRocmVzaG9sZCA/PyAxO1xuICAgICAgICB0aGlzLnBvaW50cyA9IG9wdGlvbnMucG9pbnRzO1xuICAgIH1cblxuICAgIHB1YmxpYyBzcGFjZU9jY3VwaWVkKHg6IG51bWJlciwgeTogbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgICAgIGNvbnN0IHZhbDogbnVtYmVyID0gdGhpcy5wb2ludHMucmVkdWNlKChzdW0sIHBvaW50KSA9PiBzdW0gKyB0aGlzLmdldEFkZGl0aXZlTWV0YWJhbGxWYWx1ZShwb2ludCwgeCwgeSksIDApO1xuICAgICAgICByZXR1cm4gdmFsID4gdGhpcy50aHJlc2hvbGQ7XG4gICAgfVxuXG4gICAgcHVibGljIGdlbmVyYXRlQ2FudmFzT3V0bGluZShjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCkge1xuICAgICAgICBjb25zdCBpbWFnZURhdGEgPSBjdHguY3JlYXRlSW1hZ2VEYXRhKGN0eC5jYW52YXMud2lkdGgsIGN0eC5jYW52YXMuaGVpZ2h0KTtcbiAgICAgICAgY29uc3QgZGF0YSA9IGltYWdlRGF0YS5kYXRhO1xuXG4gICAgICAgIGxldCB4ID0gMCwgeSA9IDA7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkgKz0gNCkge1xuICAgICAgICAgICAgZGF0YVtpICsgMF0gPSB0aGlzLnNwYWNlT2NjdXBpZWQoeCwgeSkgPyAyNTUgOiAwO1xuICAgICAgICAgICAgZGF0YVtpICsgM10gPSAyNTU7XG4gICAgICAgICAgICBpZiAoKyt4ID09IGN0eC5jYW52YXMud2lkdGgpIHtcbiAgICAgICAgICAgICAgICB4ID0gMDtcbiAgICAgICAgICAgICAgICB5Kys7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjdHgucHV0SW1hZ2VEYXRhKGltYWdlRGF0YSwgMCwgMCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRBZGRpdGl2ZU1ldGFiYWxsVmFsdWUocG9pbnQ6IE1ldGFQb2ludCwgeDogbnVtYmVyLCB5OiBudW1iZXIpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gKHBvaW50LnIgKiBwb2ludC5yKSAvICgoKHggLSBwb2ludC54KSAqICh4IC0gcG9pbnQueCkpICsgKCh5IC0gcG9pbnQueSkgKiAoeSAtIHBvaW50LnkpKSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB0aHJlc2hvbGQ6IG51bWJlcjtcbiAgICBwcml2YXRlIHBvaW50czogQXJyYXk8TWV0YVBvaW50Pjtcbn0iLCIvKlxuICogVHlwZVNjcmlwdCBwb3J0IGJ5IFRoaWxvIFBsYW56XG4gKlxuICogaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vdGhpbG9wbGFuei82YWJmMDRmOTU3MTk3ZTllMzkxMlxuICovXG5cbi8qXG4gIEkndmUgd3JhcHBlZCBNYWtvdG8gTWF0c3Vtb3RvIGFuZCBUYWt1amkgTmlzaGltdXJhJ3MgY29kZSBpbiBhIG5hbWVzcGFjZVxuICBzbyBpdCdzIGJldHRlciBlbmNhcHN1bGF0ZWQuIE5vdyB5b3UgY2FuIGhhdmUgbXVsdGlwbGUgcmFuZG9tIG51bWJlciBnZW5lcmF0b3JzXG4gIGFuZCB0aGV5IHdvbid0IHN0b21wIGFsbCBvdmVyIGVhY2hvdGhlcidzIHN0YXRlLlxuICBcbiAgSWYgeW91IHdhbnQgdG8gdXNlIHRoaXMgYXMgYSBzdWJzdGl0dXRlIGZvciBNYXRoLnJhbmRvbSgpLCB1c2UgdGhlIHJhbmRvbSgpXG4gIG1ldGhvZCBsaWtlIHNvOlxuICBcbiAgdmFyIG0gPSBuZXcgTWVyc2VubmVUd2lzdGVyKCk7XG4gIHZhciByYW5kb21OdW1iZXIgPSBtLnJhbmRvbSgpO1xuICBcbiAgWW91IGNhbiBhbHNvIGNhbGwgdGhlIG90aGVyIGdlbnJhbmRfe2Zvb30oKSBtZXRob2RzIG9uIHRoZSBpbnN0YW5jZS5cbiAgSWYgeW91IHdhbnQgdG8gdXNlIGEgc3BlY2lmaWMgc2VlZCBpbiBvcmRlciB0byBnZXQgYSByZXBlYXRhYmxlIHJhbmRvbVxuICBzZXF1ZW5jZSwgcGFzcyBhbiBpbnRlZ2VyIGludG8gdGhlIGNvbnN0cnVjdG9yOlxuICB2YXIgbSA9IG5ldyBNZXJzZW5uZVR3aXN0ZXIoMTIzKTtcbiAgYW5kIHRoYXQgd2lsbCBhbHdheXMgcHJvZHVjZSB0aGUgc2FtZSByYW5kb20gc2VxdWVuY2UuXG4gIFNlYW4gTWNDdWxsb3VnaCAoYmFua3NlYW5AZ21haWwuY29tKVxuKi9cblxuLyogXG4gICBBIEMtcHJvZ3JhbSBmb3IgTVQxOTkzNywgd2l0aCBpbml0aWFsaXphdGlvbiBpbXByb3ZlZCAyMDAyLzEvMjYuXG4gICBDb2RlZCBieSBUYWt1amkgTmlzaGltdXJhIGFuZCBNYWtvdG8gTWF0c3Vtb3RvLlxuIFxuICAgQmVmb3JlIHVzaW5nLCBpbml0aWFsaXplIHRoZSBzdGF0ZSBieSB1c2luZyBpbml0X2dlbnJhbmQoc2VlZCkgIFxuICAgb3IgaW5pdF9ieV9hcnJheShpbml0X2tleSwga2V5X2xlbmd0aCkuXG4gXG4gICBDb3B5cmlnaHQgKEMpIDE5OTcgLSAyMDAyLCBNYWtvdG8gTWF0c3Vtb3RvIGFuZCBUYWt1amkgTmlzaGltdXJhLFxuICAgQWxsIHJpZ2h0cyByZXNlcnZlZC4gICAgICAgICAgICAgICAgICAgICAgICAgIFxuIFxuICAgUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0XG4gICBtb2RpZmljYXRpb24sIGFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnNcbiAgIGFyZSBtZXQ6XG4gXG4gICAgIDEuIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0XG4gICAgICAgIG5vdGljZSwgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cbiBcbiAgICAgMi4gUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZSBjb3B5cmlnaHRcbiAgICAgICAgbm90aWNlLCB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZVxuICAgICAgICBkb2N1bWVudGF0aW9uIGFuZC9vciBvdGhlciBtYXRlcmlhbHMgcHJvdmlkZWQgd2l0aCB0aGUgZGlzdHJpYnV0aW9uLlxuIFxuICAgICAzLiBUaGUgbmFtZXMgb2YgaXRzIGNvbnRyaWJ1dG9ycyBtYXkgbm90IGJlIHVzZWQgdG8gZW5kb3JzZSBvciBwcm9tb3RlIFxuICAgICAgICBwcm9kdWN0cyBkZXJpdmVkIGZyb20gdGhpcyBzb2Z0d2FyZSB3aXRob3V0IHNwZWNpZmljIHByaW9yIHdyaXR0ZW4gXG4gICAgICAgIHBlcm1pc3Npb24uXG4gXG4gICBUSElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTXG4gICBcIkFTIElTXCIgQU5EIEFOWSBFWFBSRVNTIE9SIElNUExJRUQgV0FSUkFOVElFUywgSU5DTFVESU5HLCBCVVQgTk9UXG4gICBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRCBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1JcbiAgIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFSRSBESVNDTEFJTUVELiAgSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVCBPV05FUiBPUlxuICAgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1IgQU5ZIERJUkVDVCwgSU5ESVJFQ1QsIElOQ0lERU5UQUwsIFNQRUNJQUwsXG4gICBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyAoSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sXG4gICBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTOyBMT1NTIE9GIFVTRSwgREFUQSwgT1JcbiAgIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OIEFOWSBUSEVPUlkgT0ZcbiAgIExJQUJJTElUWSwgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVCAoSU5DTFVESU5HXG4gICBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSkgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFIE9GIFRISVNcbiAgIFNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLlxuIFxuIFxuICAgQW55IGZlZWRiYWNrIGlzIHZlcnkgd2VsY29tZS5cbiAgIGh0dHA6Ly93d3cubWF0aC5zY2kuaGlyb3NoaW1hLXUuYWMuanAvfm0tbWF0L01UL2VtdC5odG1sXG4gICBlbWFpbDogbS1tYXQgQCBtYXRoLnNjaS5oaXJvc2hpbWEtdS5hYy5qcCAocmVtb3ZlIHNwYWNlKVxuKi9cblxuZXhwb3J0IGNsYXNzIE1lcnNlbm5lVHdpc3RlciB7XG4gICAgLyogUGVyaW9kIHBhcmFtZXRlcnMgKi9cbiAgICBwcml2YXRlIE4gPSA2MjQ7XG4gICAgcHJpdmF0ZSBNID0gMzk3O1xuICAgIHByaXZhdGUgTUFUUklYX0EgPSAweDk5MDhiMGRmOyAgIC8qIGNvbnN0YW50IHZlY3RvciBhICovXG4gICAgcHJpdmF0ZSBVUFBFUl9NQVNLID0gMHg4MDAwMDAwMDsgLyogbW9zdCBzaWduaWZpY2FudCB3LXIgYml0cyAqL1xuICAgIHByaXZhdGUgTE9XRVJfTUFTSyA9IDB4N2ZmZmZmZmY7IC8qIGxlYXN0IHNpZ25pZmljYW50IHIgYml0cyAqL1xuXG4gICAgcHJpdmF0ZSBtdCA9IG5ldyBBcnJheSh0aGlzLk4pOyAvKiB0aGUgYXJyYXkgZm9yIHRoZSBzdGF0ZSB2ZWN0b3IgKi9cbiAgICBwcml2YXRlIG10aSA9IHRoaXMuTiArIDE7ICAvKiBtdGk9PU4rMSBtZWFucyBtdFtOXSBpcyBub3QgaW5pdGlhbGl6ZWQgKi9cblxuICAgIGNvbnN0cnVjdG9yKHNlZWQ/OiBudW1iZXIpIHtcbiAgICAgICAgaWYgKHNlZWQgPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBzZWVkID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5pbml0X2dlbnJhbmQoc2VlZCk7XG4gICAgfVxuXG4gICAgLyogaW5pdGlhbGl6ZXMgbXRbTl0gd2l0aCBhIHNlZWQgKi9cbiAgICBwcml2YXRlIGluaXRfZ2VucmFuZChzOiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5tdFswXSA9IHMgPj4+IDA7XG4gICAgICAgIGZvciAodGhpcy5tdGkgPSAxOyB0aGlzLm10aSA8IHRoaXMuTjsgdGhpcy5tdGkrKykge1xuICAgICAgICAgICAgcyA9IHRoaXMubXRbdGhpcy5tdGkgLSAxXSBeICh0aGlzLm10W3RoaXMubXRpIC0gMV0gPj4+IDMwKTtcbiAgICAgICAgICAgIHRoaXMubXRbdGhpcy5tdGldID0gKCgoKChzICYgMHhmZmZmMDAwMCkgPj4+IDE2KSAqIDE4MTI0MzMyNTMpIDw8IDE2KSArIChzICYgMHgwMDAwZmZmZikgKiAxODEyNDMzMjUzKVxuICAgICAgICAgICAgICAgICsgdGhpcy5tdGk7XG4gICAgICAgICAgICAvKiBTZWUgS251dGggVEFPQ1AgVm9sMi4gM3JkIEVkLiBQLjEwNiBmb3IgbXVsdGlwbGllci4gKi9cbiAgICAgICAgICAgIC8qIEluIHRoZSBwcmV2aW91cyB2ZXJzaW9ucywgTVNCcyBvZiB0aGUgc2VlZCBhZmZlY3QgICAqL1xuICAgICAgICAgICAgLyogb25seSBNU0JzIG9mIHRoZSBhcnJheSBtdFtdLiAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAvKiAyMDAyLzAxLzA5IG1vZGlmaWVkIGJ5IE1ha290byBNYXRzdW1vdG8gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXMubXRbdGhpcy5tdGldID4+Pj0gMDtcbiAgICAgICAgICAgIC8qIGZvciA+MzIgYml0IG1hY2hpbmVzICovXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiBpbml0aWFsaXplIGJ5IGFuIGFycmF5IHdpdGggYXJyYXktbGVuZ3RoICovXG4gICAgLyogaW5pdF9rZXkgaXMgdGhlIGFycmF5IGZvciBpbml0aWFsaXppbmcga2V5cyAqL1xuICAgIC8qIGtleV9sZW5ndGggaXMgaXRzIGxlbmd0aCAqL1xuICAgIC8qIHNsaWdodCBjaGFuZ2UgZm9yIEMrKywgMjAwNC8yLzI2ICovXG4gICAgaW5pdF9ieV9hcnJheShpbml0X2tleTogQXJyYXk8bnVtYmVyPiwga2V5X2xlbmd0aDogbnVtYmVyKSB7XG4gICAgICAgIHZhciBpLCBqLCBrO1xuICAgICAgICB0aGlzLmluaXRfZ2VucmFuZCgxOTY1MDIxOCk7XG4gICAgICAgIGkgPSAxOyBqID0gMDtcbiAgICAgICAgayA9ICh0aGlzLk4gPiBrZXlfbGVuZ3RoID8gdGhpcy5OIDoga2V5X2xlbmd0aCk7XG4gICAgICAgIGZvciAoOyBrOyBrLS0pIHtcbiAgICAgICAgICAgIHZhciBzID0gdGhpcy5tdFtpIC0gMV0gXiAodGhpcy5tdFtpIC0gMV0gPj4+IDMwKVxuICAgICAgICAgICAgdGhpcy5tdFtpXSA9ICh0aGlzLm10W2ldIF4gKCgoKChzICYgMHhmZmZmMDAwMCkgPj4+IDE2KSAqIDE2NjQ1MjUpIDw8IDE2KSArICgocyAmIDB4MDAwMGZmZmYpICogMTY2NDUyNSkpKVxuICAgICAgICAgICAgICAgICsgaW5pdF9rZXlbal0gKyBqOyAvKiBub24gbGluZWFyICovXG4gICAgICAgICAgICB0aGlzLm10W2ldID4+Pj0gMDsgLyogZm9yIFdPUkRTSVpFID4gMzIgbWFjaGluZXMgKi9cbiAgICAgICAgICAgIGkrKzsgaisrO1xuICAgICAgICAgICAgaWYgKGkgPj0gdGhpcy5OKSB7IHRoaXMubXRbMF0gPSB0aGlzLm10W3RoaXMuTiAtIDFdOyBpID0gMTsgfVxuICAgICAgICAgICAgaWYgKGogPj0ga2V5X2xlbmd0aCkgaiA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChrID0gdGhpcy5OIC0gMTsgazsgay0tKSB7XG4gICAgICAgICAgICB2YXIgcyA9IHRoaXMubXRbaSAtIDFdIF4gKHRoaXMubXRbaSAtIDFdID4+PiAzMCk7XG4gICAgICAgICAgICB0aGlzLm10W2ldID0gKHRoaXMubXRbaV0gXiAoKCgoKHMgJiAweGZmZmYwMDAwKSA+Pj4gMTYpICogMTU2NjA4Mzk0MSkgPDwgMTYpICsgKHMgJiAweDAwMDBmZmZmKSAqIDE1NjYwODM5NDEpKVxuICAgICAgICAgICAgICAgIC0gaTsgLyogbm9uIGxpbmVhciAqL1xuICAgICAgICAgICAgdGhpcy5tdFtpXSA+Pj49IDA7IC8qIGZvciBXT1JEU0laRSA+IDMyIG1hY2hpbmVzICovXG4gICAgICAgICAgICBpKys7XG4gICAgICAgICAgICBpZiAoaSA+PSB0aGlzLk4pIHsgdGhpcy5tdFswXSA9IHRoaXMubXRbdGhpcy5OIC0gMV07IGkgPSAxOyB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm10WzBdID0gMHg4MDAwMDAwMDsgLyogTVNCIGlzIDE7IGFzc3VyaW5nIG5vbi16ZXJvIGluaXRpYWwgYXJyYXkgKi9cbiAgICB9XG5cbiAgICAvKiBnZW5lcmF0ZXMgYSByYW5kb20gbnVtYmVyIG9uIFswLDB4ZmZmZmZmZmZdLWludGVydmFsICovXG4gICAgZ2VucmFuZF9pbnQzMigpIHtcbiAgICAgICAgdmFyIHk7XG4gICAgICAgIHZhciBtYWcwMSA9IG5ldyBBcnJheSgweDAsIHRoaXMuTUFUUklYX0EpO1xuICAgICAgICAvKiBtYWcwMVt4XSA9IHggKiBNQVRSSVhfQSAgZm9yIHg9MCwxICovXG5cbiAgICAgICAgaWYgKHRoaXMubXRpID49IHRoaXMuTikgeyAvKiBnZW5lcmF0ZSBOIHdvcmRzIGF0IG9uZSB0aW1lICovXG4gICAgICAgICAgICB2YXIga2s7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLm10aSA9PSB0aGlzLk4gKyAxKSAgIC8qIGlmIGluaXRfZ2VucmFuZCgpIGhhcyBub3QgYmVlbiBjYWxsZWQsICovXG4gICAgICAgICAgICAgICAgdGhpcy5pbml0X2dlbnJhbmQoNTQ4OSk7IC8qIGEgZGVmYXVsdCBpbml0aWFsIHNlZWQgaXMgdXNlZCAqL1xuXG4gICAgICAgICAgICBmb3IgKGtrID0gMDsga2sgPCB0aGlzLk4gLSB0aGlzLk07IGtrKyspIHtcbiAgICAgICAgICAgICAgICB5ID0gKHRoaXMubXRba2tdICYgdGhpcy5VUFBFUl9NQVNLKSB8ICh0aGlzLm10W2trICsgMV0gJiB0aGlzLkxPV0VSX01BU0spO1xuICAgICAgICAgICAgICAgIHRoaXMubXRba2tdID0gdGhpcy5tdFtrayArIHRoaXMuTV0gXiAoeSA+Pj4gMSkgXiBtYWcwMVt5ICYgMHgxXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvciAoOyBrayA8IHRoaXMuTiAtIDE7IGtrKyspIHtcbiAgICAgICAgICAgICAgICB5ID0gKHRoaXMubXRba2tdICYgdGhpcy5VUFBFUl9NQVNLKSB8ICh0aGlzLm10W2trICsgMV0gJiB0aGlzLkxPV0VSX01BU0spO1xuICAgICAgICAgICAgICAgIHRoaXMubXRba2tdID0gdGhpcy5tdFtrayArICh0aGlzLk0gLSB0aGlzLk4pXSBeICh5ID4+PiAxKSBeIG1hZzAxW3kgJiAweDFdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgeSA9ICh0aGlzLm10W3RoaXMuTiAtIDFdICYgdGhpcy5VUFBFUl9NQVNLKSB8ICh0aGlzLm10WzBdICYgdGhpcy5MT1dFUl9NQVNLKTtcbiAgICAgICAgICAgIHRoaXMubXRbdGhpcy5OIC0gMV0gPSB0aGlzLm10W3RoaXMuTSAtIDFdIF4gKHkgPj4+IDEpIF4gbWFnMDFbeSAmIDB4MV07XG5cbiAgICAgICAgICAgIHRoaXMubXRpID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIHkgPSB0aGlzLm10W3RoaXMubXRpKytdO1xuXG4gICAgICAgIC8qIFRlbXBlcmluZyAqL1xuICAgICAgICB5IF49ICh5ID4+PiAxMSk7XG4gICAgICAgIHkgXj0gKHkgPDwgNykgJiAweDlkMmM1NjgwO1xuICAgICAgICB5IF49ICh5IDw8IDE1KSAmIDB4ZWZjNjAwMDA7XG4gICAgICAgIHkgXj0gKHkgPj4+IDE4KTtcblxuICAgICAgICByZXR1cm4geSA+Pj4gMDtcbiAgICB9XG5cbiAgICAvKiBnZW5lcmF0ZXMgYSByYW5kb20gbnVtYmVyIG9uIFswLDB4N2ZmZmZmZmZdLWludGVydmFsICovXG4gICAgZ2VucmFuZF9pbnQzMSgpIHtcbiAgICAgICAgcmV0dXJuICh0aGlzLmdlbnJhbmRfaW50MzIoKSA+Pj4gMSk7XG4gICAgfVxuXG4gICAgLyogZ2VuZXJhdGVzIGEgcmFuZG9tIG51bWJlciBvbiBbMCwxXS1yZWFsLWludGVydmFsICovXG4gICAgZ2VucmFuZF9yZWFsMSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2VucmFuZF9pbnQzMigpICogKDEuMCAvIDQyOTQ5NjcyOTUuMCk7XG4gICAgICAgIC8qIGRpdmlkZWQgYnkgMl4zMi0xICovXG4gICAgfVxuXG4gICAgLyogZ2VuZXJhdGVzIGEgcmFuZG9tIG51bWJlciBvbiBbMCwxKS1yZWFsLWludGVydmFsICovXG4gICAgcmFuZG9tKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZW5yYW5kX2ludDMyKCkgKiAoMS4wIC8gNDI5NDk2NzI5Ni4wKTtcbiAgICAgICAgLyogZGl2aWRlZCBieSAyXjMyICovXG4gICAgfVxuXG4gICAgLyogZ2VuZXJhdGVzIGEgcmFuZG9tIG51bWJlciBvbiAoMCwxKS1yZWFsLWludGVydmFsICovXG4gICAgZ2VucmFuZF9yZWFsMygpIHtcbiAgICAgICAgcmV0dXJuICh0aGlzLmdlbnJhbmRfaW50MzIoKSArIDAuNSkgKiAoMS4wIC8gNDI5NDk2NzI5Ni4wKTtcbiAgICAgICAgLyogZGl2aWRlZCBieSAyXjMyICovXG4gICAgfVxuXG4gICAgLyogZ2VuZXJhdGVzIGEgcmFuZG9tIG51bWJlciBvbiBbMCwxKSB3aXRoIDUzLWJpdCByZXNvbHV0aW9uKi9cbiAgICBnZW5yYW5kX3JlczUzKCkge1xuICAgICAgICB2YXIgYSA9IHRoaXMuZ2VucmFuZF9pbnQzMigpID4+PiA1LCBiID0gdGhpcy5nZW5yYW5kX2ludDMyKCkgPj4+IDY7XG4gICAgICAgIHJldHVybiAoYSAqIDY3MTA4ODY0LjAgKyBiKSAqICgxLjAgLyA5MDA3MTk5MjU0NzQwOTkyLjApO1xuICAgIH1cblxuICAgIC8qIFRoZXNlIHJlYWwgdmVyc2lvbnMgYXJlIGR1ZSB0byBJc2FrdSBXYWRhLCAyMDAyLzAxLzA5IGFkZGVkICovXG59IiwiaW1wb3J0IHsgTWVyc2VubmVUd2lzdGVyIH0gZnJvbSBcIi4vbWVyc2VubmVUd2lzdGVyXCI7XG5pbXBvcnQgeyBQUk5HIH0gZnJvbSBcIi4vcHJuZ1wiO1xuXG5leHBvcnQgY2xhc3MgTWVyc2VubmVUd2lzdGVyQWRhcHRlciBpbXBsZW1lbnRzIFBSTkcge1xuICAgIHB1YmxpYyBpbml0KHNlZWQ6IG51bWJlcik6IHZvaWQge1xuICAgICAgICB0aGlzLm1lcnNlbm5lVHdpc3RlciA9IG5ldyBNZXJzZW5uZVR3aXN0ZXIoc2VlZCk7XG4gICAgfVxuICAgIHB1YmxpYyByYW5kb20oKTogbnVtYmVyIHtcbiAgICAgICAgY29uc29sZS5hc3NlcnQodGhpcy5tZXJzZW5uZVR3aXN0ZXIpO1xuICAgICAgICBjb25zdCB0d2lzdGVyID0gPE1lcnNlbm5lVHdpc3Rlcj50aGlzLm1lcnNlbm5lVHdpc3RlcjtcbiAgICAgICAgcmV0dXJuIHR3aXN0ZXIucmFuZG9tKCk7XG4gICAgfVxuICAgIHB1YmxpYyBmbG9hdEluUmFuZ2UobWluOiBudW1iZXIsIG1heDogbnVtYmVyKTogbnVtYmVyIHtcbiAgICAgICAgY29uc29sZS5hc3NlcnQodGhpcy5tZXJzZW5uZVR3aXN0ZXIpO1xuICAgICAgICBjb25zdCB0d2lzdGVyID0gPE1lcnNlbm5lVHdpc3Rlcj50aGlzLm1lcnNlbm5lVHdpc3RlcjtcbiAgICAgICAgcmV0dXJuIG1pbiArIHR3aXN0ZXIucmFuZG9tKCkgKiAobWF4IC0gbWluKTtcbiAgICB9XG4gICAgcHVibGljIGludEluUmFuZ2UobWluOiBudW1iZXIsIG1heDogbnVtYmVyKTogbnVtYmVyIHtcbiAgICAgICAgY29uc29sZS5hc3NlcnQodGhpcy5tZXJzZW5uZVR3aXN0ZXIpO1xuICAgICAgICBjb25zdCB0d2lzdGVyID0gPE1lcnNlbm5lVHdpc3Rlcj50aGlzLm1lcnNlbm5lVHdpc3RlcjtcbiAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IobWluICsgdHdpc3Rlci5yYW5kb20oKSAqIChtYXggLSBtaW4gKyAxKSk7XG4gICAgfVxuICAgIHByaXZhdGUgbWVyc2VubmVUd2lzdGVyPzogTWVyc2VubmVUd2lzdGVyO1xufSIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IHsgQm9uc2FpR2VuZXJhdG9yIH0gZnJvbSBcIi4vdHJlZS90eXBlcy9ib25zYWkvYm9uc2FpR2VuZXJhdG9yLmpzXCI7XG5cbmZ1bmN0aW9uIGRvd25sb2FkKGZpbGVuYW1lOiBzdHJpbmcsIHRleHQ6IHN0cmluZykge1xuICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCAnZGF0YTp0ZXh0L3BsYWluO2NoYXJzZXQ9dXRmLTgsJyArIGVuY29kZVVSSUNvbXBvbmVudCh0ZXh0KSk7XG4gICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2Rvd25sb2FkJywgZmlsZW5hbWUpO1xuXG4gICAgZWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZWxlbWVudCk7XG5cbiAgICBlbGVtZW50LmNsaWNrKCk7XG5cbiAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGVsZW1lbnQpO1xufVxuXG5mdW5jdGlvbiBjeXJiNTMoc3RyOiBzdHJpbmcsIHNlZWQ6IG51bWJlciA9IDApIHtcbiAgICBsZXQgaDEgPSAweGRlYWRiZWVmIF4gc2VlZCwgaDIgPSAweDQxYzZjZTU3IF4gc2VlZDtcbiAgICBmb3IobGV0IGkgPSAwLCBjaDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xuICAgICAgY2ggPSBzdHIuY2hhckNvZGVBdChpKTtcbiAgICAgIGgxID0gTWF0aC5pbXVsKGgxIF4gY2gsIDI2NTQ0MzU3NjEpO1xuICAgICAgaDIgPSBNYXRoLmltdWwoaDIgXiBjaCwgMTU5NzMzNDY3Nyk7XG4gICAgfVxuICAgIGgxICA9IE1hdGguaW11bChoMSBeIChoMSA+Pj4gMTYpLCAyMjQ2ODIyNTA3KTtcbiAgICBoMSBePSBNYXRoLmltdWwoaDIgXiAoaDIgPj4+IDEzKSwgMzI2NjQ4OTkwOSk7XG4gICAgaDIgID0gTWF0aC5pbXVsKGgyIF4gKGgyID4+PiAxNiksIDIyNDY4MjI1MDcpO1xuICAgIGgyIF49IE1hdGguaW11bChoMSBeIChoMSA+Pj4gMTMpLCAzMjY2NDg5OTA5KTtcbiAgICByZXR1cm4gNDI5NDk2NzI5NiAqICgyMDk3MTUxICYgaDIpICsgKGgxID4+PiAwKTtcbn07XG5cbmNvbnN0IHRvVGl0bGVDYXNlID0gKHN0cjogc3RyaW5nKSA9PiBzdHIucmVwbGFjZSgvXFx3XFxTKi9nLCAodHh0KSA9PiB0eHQuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyB0eHQuc3Vic3RyaW5nKDEpLnRvTG93ZXJDYXNlKCkpO1xuXG4oYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IFNUQVJUSU5HX1NFRUQgPSA5NjQ0O1xuICAgIGNvbnN0IFNUQVJUSU5HX1RFWFQgPSBcIlpFTklUVURFXCI7XG5cbiAgICBhd2FpdCBCb25zYWlHZW5lcmF0b3IubG9hZFJlc291cmNlcygpO1xuXG4gICAgbGV0IGJvbnNhaUdlbmVyYXRvcjogQm9uc2FpR2VuZXJhdG9yO1xuICAgIGxldCBzZWVkOiBudW1iZXIgfCBudWxsID0gbnVsbDtcblxuICAgIGNvbnN0IGJ0blNlcmlhbGl6ZSA9ICA8SFRNTERpdkVsZW1lbnQ+ZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2J0blNlcmlhbGl6ZScpO1xuICAgIGNvbnN0IGJ0blJlZ2VuZXJhdGUgPSA8SFRNTERpdkVsZW1lbnQ+ZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2J0blJlZ2VuZXJhdGUnKTtcbiAgICBjb25zdCBpbnBTZWVkVGV4dCA9IDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNpbnBTZWVkVGV4dCcpO1xuICAgIGNvbnN0IHR4dFRyZWVUaXRsZSA9IDxIVE1MRWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjdHh0VHJlZVRpdGxlJyk7XG4gICAgY29uc3QgdHJlZUNvbnRhaW5lciA9IDxIVE1MRGl2RWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjdHJlZUdlbmVyYXRvckNvbnRhaW5lcicpO1xuXG4gICAgbGV0IGZpcnN0ID0gdHJ1ZTtcbiAgICBhc3luYyBmdW5jdGlvbiBnZW5lcmF0ZUJvbnNhaSgpIHtcbiAgICAgICAgLy8gY2FsY3VsYXRlIG51bWVyaWMgc2VlZFxuICAgICAgICBpZiAoZmlyc3QpIHtcbiAgICAgICAgICAgIGlucFNlZWRUZXh0LnZhbHVlID0gU1RBUlRJTkdfVEVYVDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaW5wU2VlZFRleHQudmFsdWUpIHtcbiAgICAgICAgICAgIC8vIGZyb20gZW50ZXJlZCBzdHJpbmdcbiAgICAgICAgICAgIHNlZWQgPSBjeXJiNTMoaW5wU2VlZFRleHQudmFsdWUudG9VcHBlckNhc2UoKSk7XG4gICAgICAgICAgICBpZiAoZmlyc3QpXG4gICAgICAgICAgICAgICAgc2VlZCA9IFNUQVJUSU5HX1NFRUQ7XG4gICAgICAgICAgICB0eHRUcmVlVGl0bGUuc3R5bGUudmlzaWJpbGl0eSA9ICd2aXNpYmxlJztcbiAgICAgICAgICAgIHR4dFRyZWVUaXRsZS5pbm5lckhUTUwgPSBgXCIke3RvVGl0bGVDYXNlKGlucFNlZWRUZXh0LnZhbHVlKX1cImA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyByYW5kb21cbiAgICAgICAgICAgIHR4dFRyZWVUaXRsZS5zdHlsZS52aXNpYmlsaXR5ID0gJ2hpZGRlbic7XG4gICAgICAgICAgICBzZWVkID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTAwMDApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gZGV0ZXJtaW5lIGlmIHNlcmlhbGl6ZWQganNvbiBwcmVzZW50XG4gICAgICAgIGNvbnN0IHNlcmlhbGl6ZWRKU09OID0gZmlyc3QgPyBcbiAgICAgICAgICAgIGF3YWl0ICgoYXdhaXQgZmV0Y2goYC4vcmVzb3VyY2VzL2JvbnNhaS9zZXJpYWxpemVkL3RyZWVfc2VyaWFsaXplZF8ke3NlZWR9Lmpzb25gKSkuanNvbigpKSA6IFxuICAgICAgICAgICAgbnVsbDtcblxuICAgICAgICAvLyBzZXQgdGhlIHJlbmRlcmluZyBzY2FsZVxuICAgICAgICBjb25zdCByZXNvbHV0aW9uU2NhbGFyID0gKE1hdGgubWluKHdpbmRvdy5zY3JlZW4uaGVpZ2h0LCB3aW5kb3cuc2NyZWVuLndpZHRoKSAvIEJvbnNhaUdlbmVyYXRvci5SRUZFUkVOQ0VfSEVJR0hUKSAqIHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvO1xuXG4gICAgICAgIC8vIGRlc3Ryb3kgZXhpc3RpbmcgYm9uc2FpIGlmIHByZXNlbnRcbiAgICAgICAgaWYgKGJvbnNhaUdlbmVyYXRvcilcbiAgICAgICAgICAgIGJvbnNhaUdlbmVyYXRvci5kZXN0cm95KCk7XG5cbiAgICAgICAgLy8gY3JlYXRlIG5ldyBib25zYWlcbiAgICAgICAgY29uc29sZS5sb2coYFN0YXJ0aW5nIGdlbmVyYXRpb24gd2l0aCBzZWVkOiAke3NlZWR9YCk7XG4gICAgICAgIGJvbnNhaUdlbmVyYXRvciA9IG5ldyBCb25zYWlHZW5lcmF0b3IoeyBcbiAgICAgICAgICAgIHBhcmVudENvbnRhaW5lcjogdHJlZUNvbnRhaW5lciwgXG4gICAgICAgICAgICBkZWJ1Z2dpbmc6IGZhbHNlLCBcbiAgICAgICAgICAgIHJlbmRlclNjYWxpbmc6IHJlc29sdXRpb25TY2FsYXIsIFxuICAgICAgICAgICAgc2VlZDogc2VlZCEsIFxuICAgICAgICAgICAgc2VyaWFsaXplZEpTT046IHNlcmlhbGl6ZWRKU09OID8/IHVuZGVmaW5lZFxuICAgICAgICB9KTtcblxuICAgICAgICBmaXJzdCA9IGZhbHNlO1xuXG4gICAgICAgIC8vIHN0YXJ0IGdyb3d0aFxuICAgICAgICBib25zYWlHZW5lcmF0b3IuZ3JvdygpO1xuICAgIH1cblxuICAgIGJ0blNlcmlhbGl6ZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgY29uc3Qgc2VyaWFsaXplZEpTT04gPSBib25zYWlHZW5lcmF0b3IuZ2V0U2VyaWFsaXplZEpTT04oKTtcbiAgICAgICAgZG93bmxvYWQoYHRyZWVfc2VyaWFsaXplZF8ke3NlZWR9Lmpzb25gLCBzZXJpYWxpemVkSlNPTik7XG4gICAgfSk7XG5cbiAgICBidG5SZWdlbmVyYXRlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICBib25zYWlHZW5lcmF0b3I/LmRlc3Ryb3koKTtcbiAgICAgICAgZ2VuZXJhdGVCb25zYWkoKTtcbiAgICB9KTtcblxuICAgIGdlbmVyYXRlQm9uc2FpKCk7XG59KSgpO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9