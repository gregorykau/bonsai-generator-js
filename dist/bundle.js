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
        this._position = options.position;
        // set texture offset
        if (this.parent) {
            const length = (this._position.subtract(this.parent.endPos)).length();
            this.growthTotal.y = this.parent.growthTotal.y + length;
            if (this.isFirstBranch) {
                this.growthLocal.x = options.context.treeGenerator.getPRNG('GROW').floatInRange(0, 1024);
                this.growthLocal.y = 0;
            }
            else {
                this.growthLocal.x = this.growthLocal.x;
                this.growthLocal.y = this.parent.growthLocal.y + length;
            }
        }
    }
    extrude(direction) {
        this._childCount++;
        return new Branch({
            position: this.endPos.add(direction),
            parent: this,
            context: this.options.context
        });
    }
    get isFirstBranch() {
        var _a, _b, _c;
        return (((_a = this.options.context) === null || _a === void 0 ? void 0 : _a.treePart) != ((_c = (_b = this.options.parent) === null || _b === void 0 ? void 0 : _b.context) === null || _c === void 0 ? void 0 : _c.treePart));
    }
    get context() {
        return this.options.context;
    }
    get angle() {
        if (!this.parent)
            return NaN;
        return Math.atan2(this.endPos.x - this.startPos.x, this.startPos.y - this.endPos.y);
    }
    get direction() {
        if (!this.parent)
            return _utils_linear_vector2_js__WEBPACK_IMPORTED_MODULE_0__.Vector2.Zero;
        return this.endPos.subtract(this.startPos).normalize();
    }
    get branchWidth() {
        return this.options.context.treeGenerator.getBranchWidth(this);
    }
    get branchHeight() {
        if (!this.parent)
            return 0;
        return this.endPos.subtract(this.startPos).length();
    }
    get parent() { return this._parent; }
    get growthTotal() { return this._growthTotal; }
    get growthLocal() { return this._growthLocal; }
    get endPos() { return this._position; }
    get startPos() {
        if (!this.parent)
            return this.endPos;
        if (this.isFirstBranch)
            return this.parent.endPos.subtract(this.options.context.treePart.position);
        return this.parent.endPos;
    }
    get endPosGlobal() {
        return this.options.context.treePart.positionGlobal.add(this.endPos);
    }
    get childCount() { return this._childCount; }
    distanceTo(leaf) { return leaf.position.subtract(this.endPos).length(); }
    draw(ctx, drawBorder = true) {
        if (!this.parent)
            return;
        if (this.options.context.isPlayback)
            return;
        if ((this.branchWidth / this.branchHeight) > 2)
            this.drawWithCircle(ctx, drawBorder);
        else
            this.drawWithRectangle(ctx, drawBorder);
        console.assert(!this.drawn);
        this.drawn = true;
    }
    drawWithRectangle(ctx, drawBorder) {
        if (!this.parent)
            return console.assert(false);
        const circleRadius = this.branchWidth / 2;
        const tempCanvas = this.options.context.treeGenerator.getTempCanvas(0);
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
            this.drawTexture(this.options.context.treeGenerator.getTempCanvas(1), tempCanvas);
            tempCanvas.globalCompositeOperation = 'source-out';
        }
        tempCanvas.restore();
        // copy rendered branch to target canvas
        ctx.save();
        {
            ctx.translate(this.startPos.x, this.startPos.y);
            ctx.rotate(this.angle);
            ctx.drawImage(tempCanvas.canvas, -this.branchWidth / 2, -(this.branchHeight));
        }
        ctx.restore();
        // draw outline
        if (drawBorder) {
            const outlineWidth = this.options.context.treeGenerator.getOutlineThickness();
            ctx.save();
            {
                ctx.save();
                ctx.globalCompositeOperation = 'destination-over';
                ctx.fillStyle = 'black';
                ctx.translate(this.startPos.x, this.startPos.y);
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
                ctx.translate(this.endPos.x, this.endPos.y);
                ctx.beginPath();
                ctx.arc(0, 0, circleRadius + outlineWidth, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
                ctx.save();
                ctx.globalCompositeOperation = 'destination-over';
                ctx.fillStyle = 'black';
                ctx.translate(this.startPos.x, this.startPos.y);
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
        const tempCanvas = this.options.context.treeGenerator.getTempCanvas(0);
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
                this.drawTexture(this.options.context.treeGenerator.getTempCanvas(1), tempCanvas);
                tempCanvas.globalCompositeOperation = 'source-out';
            }
            tempCanvas.restore();
        }
        // copy rendered branch to target canvas
        ctx.save();
        ctx.translate(this.startPos.x, this.startPos.y);
        ctx.rotate(this.angle);
        ctx.translate(-circleRadius, -circleRadius);
        ctx.drawImage(tempCanvas.canvas, 0, 0);
        ctx.restore();
        // draw outline
        if (drawBorder) {
            const outlineWidth = this.options.context.treeGenerator.getOutlineThickness();
            ctx.save();
            ctx.translate(this.startPos.x, this.startPos.y);
            ctx.rotate(this.angle);
            ctx.beginPath();
            // don't draw bottom border half if this is the start of a new tree part
            const drawBottomBorder = !this.isFirstBranch;
            if (drawBottomBorder) {
                ctx.arc(0, 0, circleRadius + outlineWidth, 0, Math.PI * 2);
            }
            else {
                ctx.arc(0, 0, circleRadius + outlineWidth, Math.PI + 0.3, Math.PI * 2 - 0.3);
            }
            ctx.globalCompositeOperation = 'destination-over';
            ctx.fillStyle = 'black';
            ctx.fill();
            ctx.restore();
            ctx.globalCompositeOperation = 'source-over';
        }
    }
    drawTexture(tempCanvas, ctx) {
        tempCanvas.fillStyle = this.options.context.treeGenerator.getBranchTexturePattern(this.growthTotal);
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
/* harmony import */ var _utils_canvasHelper_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/canvasHelper.js */ "./src/utils/canvasHelper.ts");

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
            rotated: true,
            context: this.options.context
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
        leafElement.style.left = (parent.endPosGlobal.x - canvasSize * 0.5) + 'px';
        leafElement.style.top = (parent.endPosGlobal.y - canvasSize * 0.5) + 'px';
        const ctx = leafElement.getContext('2d');
        ctx.scale(renderScale, renderScale);
        ctx.translate(canvasSize * 0.5, canvasSize * 0.5);
        this.drawLeaf(ctx);
        return leafElement;
    }
    intersects(entity) {
        const distance = entity.endPos.subtract(this.position).length();
        return (distance <= this.attractionDistance);
    }
    draw(ctx) {
        var _a;
        if (!this.parent)
            return;
        if ((_a = this.options.context) === null || _a === void 0 ? void 0 : _a.isPlayback)
            return;
        ctx.save();
        ctx.translate(this.parent.endPos.x, this.parent.endPos.y);
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
        _utils_canvasHelper_js__WEBPACK_IMPORTED_MODULE_0__.CanvasHelper.drawImageBorder(leafStencil, ctx, 1);
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
/* harmony import */ var _utils_linear_vector2_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/linear/vector2.js */ "./src/utils/linear/vector2.ts");

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
            let leafPosition = _utils_linear_vector2_js__WEBPACK_IMPORTED_MODULE_0__.Vector2.Zero;
            if ((_a = this.options.spawnPoints) === null || _a === void 0 ? void 0 : _a[i]) {
                // leaf position explicitly specified
                leafPosition = this.options.spawnPoints[i];
            }
            else {
                // leaf position random point in bounds with respect to predicate
                for (let j = 0; j < 100; j++) {
                    leafPosition = new _utils_linear_vector2_js__WEBPACK_IMPORTED_MODULE_0__.Vector2(this.options.treeGenerator.getPRNG('GROW').floatInRange(0, this.options.size.x), this.options.treeGenerator.getPRNG('GROW').floatInRange(0, this.options.size.y));
                    if (!this.options.positionPredicate || this.options.positionPredicate(leafPosition))
                        break;
                }
            }
            const leaf = this.options.createLeaf(leafPosition);
            this.activeLeafs.add(leaf);
        }
    }
    placeBranches() {
        var _a, _b;
        const startingPos = this.options.origin.add((_b = (_a = this.options.parentBranch) === null || _a === void 0 ? void 0 : _a.direction.scale(this.options.branchLength)) !== null && _b !== void 0 ? _b : _utils_linear_vector2_js__WEBPACK_IMPORTED_MODULE_0__.Vector2.Zero);
        const startingBranch = this.options.createFirstBranch(startingPos);
        this.branches.push(startingBranch);
        this.activeBranches.add(startingBranch);
        this.oldBranches.add(startingBranch);
    }
    getClosestBranch(leaf) {
        let closestBranch = null;
        let closestDistance = Number.POSITIVE_INFINITY;
        this.activeBranches.forEach((branch) => {
            if (!leaf.intersects(branch))
                return;
            // NOTE: If a branch has 2 children already, we ought not extrude from it further.
            // A tri or greater branch junction is both not in keeping with a typical tree structure, and can result in 
            // infinite growth loops where branch growth gets "stuck" between two attracting leafs.
            if (branch.childCount >= 2)
                return;
            const distanceToBranch = branch.distanceTo(leaf);
            if (distanceToBranch < closestDistance) {
                closestDistance = distanceToBranch;
                closestBranch = branch;
            }
        });
        return closestBranch;
    }
    step() {
        this.branchesLastLength = (this.stepCount == 0 ? 0 : this.branches.length);
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
                const attractionVec = leaf.position.subtract(closestBranch.endPos);
                branchToAttractionVec.set(closestBranch, ((_a = branchToAttractionVec.get(closestBranch)) !== null && _a !== void 0 ? _a : _utils_linear_vector2_js__WEBPACK_IMPORTED_MODULE_0__.Vector2.Zero).addInPlace(attractionVec));
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
            const newBranch = branch.extrude(vFinalGrowthVector);
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
    getLeafs() { return this.leafs; }
    getBranches() { return this.branches; }
    getStepCount() { return this.stepCount; }
    get startingPoint() { return this.options.origin; }
    get startingBranch() {
        var _a;
        return (_a = this.options.parentBranch) !== null && _a !== void 0 ? _a : null;
    }
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
        var _a, _b;
        this.treeParts = [];
        this.prngs = {
            'GROW': new _utils_random_mersenneTwisterAdapter_js__WEBPACK_IMPORTED_MODULE_1__.MersenneTwisterAdapter(),
            'DRAW': new _utils_random_mersenneTwisterAdapter_js__WEBPACK_IMPORTED_MODULE_1__.MersenneTwisterAdapter()
        };
        this.destroyed = false;
        this.animationGroup = new _utils_animationHelper_js__WEBPACK_IMPORTED_MODULE_2__.AnimationGroup();
        this.isFinishedGrowing = false;
        this.tempCanvas = new Array(3).fill(null).map(x => _utils_canvasHelper_js__WEBPACK_IMPORTED_MODULE_0__.CanvasHelper.createTempCanvas(200, 200));
        this.options = options;
        this.parentContainer = this.options.parentContainer;
        this.myContext = {
            isPlayback: options.serializedJSON != null,
            serializedValues: (_a = options.serializedJSON) !== null && _a !== void 0 ? _a : {},
            serializedIdxKey: 0,
            debugging: (_b = this.options.debugging) !== null && _b !== void 0 ? _b : false,
        };
        this.treePartContext = Object.assign(Object.assign({}, this.myContext), { treeGenerator: this });
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
    shake() {
        const cw = this.getPRNG('DRAW').random() > 0.5;
        this.treeParts
            .filter(treePart => treePart.depth >= 0)
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
                this.growStep();
                yield new Promise((resolve) => setTimeout(resolve, 1));
            }
        });
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
    onFinishedGrowing() {
        this.animationGroup.addAnimation((0,_utils_animationHelper_js__WEBPACK_IMPORTED_MODULE_2__.setAnimationInterval)({
            callback: () => this.shake(),
            time: 2000
        }));
        this.treeParts
            .forEach(treePart => {
            if (!(treePart instanceof _treeParts_teePartGrower_js__WEBPACK_IMPORTED_MODULE_3__.TreePartGrower))
                return;
            treePart.clip();
        });
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
        // grow individual tree-parts
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
    getSerializedJSON() {
        this.treeParts.forEach(treePart => {
            treePart.serialize();
        });
        return JSON.stringify(this.myContext.serializedValues);
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
/* harmony import */ var _utils_linear_vector2__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/linear/vector2 */ "./src/utils/linear/vector2.ts");
/* harmony import */ var _treePart__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./treePart */ "./src/tree/treeParts/treePart.ts");


class StaticTreePart extends _treePart__WEBPACK_IMPORTED_MODULE_1__.TreePart {
    static fromImage(options) {
        return new StaticTreePart({
            context: options.context,
            image: options.image,
            position: options.pos,
            size: new _utils_linear_vector2__WEBPACK_IMPORTED_MODULE_0__.Vector2(options.image.width, options.image.height),
            origin: options.pos,
            depth: options.depth,
            zIndex: options.zIndex,
            growWithTree: false
        });
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
        ctx.drawImage(this.staticOptions.image, 0, 0, this.options.size.x, this.options.size.y);
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
/* harmony import */ var _treePart_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./treePart.js */ "./src/tree/treeParts/treePart.ts");
/* harmony import */ var _utils_linear_vector2_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../utils/linear/vector2.js */ "./src/utils/linear/vector2.ts");


class TreePartGrower extends _treePart_js__WEBPACK_IMPORTED_MODULE_0__.TreePart {
    constructor(options) {
        super(options);
        this._startingBranchWidth = 0;
        this.boundsMinPos = new _utils_linear_vector2_js__WEBPACK_IMPORTED_MODULE_1__.Vector2(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
        this.boundsMaxPos = new _utils_linear_vector2_js__WEBPACK_IMPORTED_MODULE_1__.Vector2(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY);
        this.branchLayer = this.createCanvasLayer();
    }
    set branchGrower(value) {
        this._branchGrower = value;
    }
    get branchGrower() {
        return this._branchGrower;
    }
    get startingBranchWidth() {
        return this._startingBranchWidth;
    }
    get branches() {
        var _a, _b;
        return (_b = (_a = this.branchGrower) === null || _a === void 0 ? void 0 : _a.getBranches()) !== null && _b !== void 0 ? _b : [];
    }
    get leafs() {
        var _a, _b;
        return (_b = (_a = this.branchGrower) === null || _a === void 0 ? void 0 : _a.getLeafs()) !== null && _b !== void 0 ? _b : [];
    }
    start() {
        var _a, _b, _c;
        const startingBranch = (_a = this.branchGrower) === null || _a === void 0 ? void 0 : _a.startingBranch;
        this._startingBranchWidth = (_b = startingBranch === null || startingBranch === void 0 ? void 0 : startingBranch.branchWidth) !== null && _b !== void 0 ? _b : 0;
        console.assert(this.branchGrower);
        (_c = this.branchGrower) === null || _c === void 0 ? void 0 : _c.start();
    }
    step() {
        var _a, _b, _c, _d;
        (_a = this.branchGrower) === null || _a === void 0 ? void 0 : _a.step();
        (_c = (_b = this.branchGrower) === null || _b === void 0 ? void 0 : _b.getNewBranches()) === null || _c === void 0 ? void 0 : _c.forEach((branch) => {
            const pos = branch.endPos;
            this.boundsMinPos.x = Math.min(pos.x, this.boundsMinPos.x);
            this.boundsMinPos.y = Math.min(pos.y, this.boundsMinPos.y);
            this.boundsMaxPos.x = Math.max(pos.x, this.boundsMaxPos.x);
            this.boundsMaxPos.y = Math.max(pos.y, this.boundsMaxPos.y);
        });
        if ((_d = this.branchGrower) === null || _d === void 0 ? void 0 : _d.isFinishedGrowing())
            this.onFinishedGrowing();
    }
    onFinishedGrowing() {
    }
    isFinishedGrowing() {
        var _a, _b;
        return (_b = (_a = this.branchGrower) === null || _a === void 0 ? void 0 : _a.isFinishedGrowing()) !== null && _b !== void 0 ? _b : false;
    }
    afterDrawLayers() {
        super.afterDrawLayers();
    }
    clip() {
        this.offsetBounds({ minPos: this.boundsMinPos, maxPos: this.boundsMaxPos });
    }
    drawBranches(ctx) {
        var _a, _b;
        (_b = (_a = this.branchGrower) === null || _a === void 0 ? void 0 : _a.getNewBranches()) === null || _b === void 0 ? void 0 : _b.forEach((branch) => branch.draw(ctx));
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
        this.shakingAnimation = null;
        this.baseAngle = 0;
        this.canvasLayers = [];
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
        }
        else {
            options.context.treeGenerator.appendElement(this.containerDiv, options.growWithTree);
        }
    }
    get depth() { var _a; return (_a = this.options.depth) !== null && _a !== void 0 ? _a : 0; }
    get position() { return this.options.position; }
    get size() { return this.options.size; }
    get container() { return this.canvasDiv; }
    get positionGlobal() {
        return (this.options.parent ? this.options.parent.positionGlobal : _utils_linear_vector2_js__WEBPACK_IMPORTED_MODULE_1__.Vector2.Zero).add(this.originalPosition);
    }
    init() {
        if (this.options.fadeIn && this.options.context.isPlayback)
            this.fadeIn();
    }
    isTerminal() {
        return false;
    }
    fadeIn() {
        const animationGroup = this.options.context.treeGenerator.getAnimationGroup();
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
            uid: this.options.context.serializedIdxKey++,
            dirty: false,
            canvas: this.createCanvas()
        };
        if (this.options.context.isPlayback) {
            const ctx = layerData.canvas.getContext("2d");
            const image = new Image();
            const serializedValue = this.options.context.serializedValues[layerData.uid];
            image.onload = () => {
                ctx.drawImage(image, 0, 0, ctx.canvas.width, ctx.canvas.height);
            };
            if (serializedValue)
                image.src = serializedValue;
        }
        this.canvasLayers.push(layerData);
        this.canvasDiv.appendChild(layerData.canvas);
        return layerData;
    }
    createCanvas() {
        const renderScalar = this.options.context.treeGenerator.getRenderScaling();
        const canvas = document.createElement('canvas');
        canvas.setAttribute('width', (this.options.size.x + TreePart.CANVAS_BUFFER_MARGIN) * renderScalar + '');
        canvas.setAttribute('height', (this.options.size.y + TreePart.CANVAS_BUFFER_MARGIN) * renderScalar + '');
        canvas.style.pointerEvents = 'none';
        canvas.style.width = this.options.size.x + TreePart.CANVAS_BUFFER_MARGIN + 'px';
        canvas.style.height = this.options.size.y + TreePart.CANVAS_BUFFER_MARGIN + 'px';
        canvas.style.position = 'absolute';
        canvas.style.left = (TreePart.CANVAS_BUFFER_MARGIN * -0.5) + 'px';
        canvas.style.top = (TreePart.CANVAS_BUFFER_MARGIN * -0.5) + 'px';
        return canvas;
    }
    pixelsToRelative(x, y) {
        return new _utils_linear_vector2_js__WEBPACK_IMPORTED_MODULE_1__.Vector2(x / this.options.size.x, y / this.options.size.y);
    }
    setContainerDivAttributes() {
        var _a;
        this.containerDiv.style.position = 'absolute';
        this.containerDiv.style.left = this.options.position.x + 'px';
        this.containerDiv.style.top = this.options.position.y + 'px';
        this.containerDiv.style.width = this.options.size.x + 'px';
        this.containerDiv.style.height = this.options.size.y + 'px';
        this.containerDiv.style.zIndex = ((_a = this.options.zIndex) !== null && _a !== void 0 ? _a : 0) + '';
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
    drawWithTransform(canvas, func) {
        const ctx = canvas.getContext('2d');
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
    afterDrawLayers() {
    }
    shake(cw) {
        if (this.shakingAnimation)
            return;
        const animationGroup = this.options.context.treeGenerator.getAnimationGroup();
        const SHAKE_TIME = this.options.context.treeGenerator.getPRNG('DRAW').floatInRange(5000, 10000);
        const MAX_ANGLE = this.options.context.treeGenerator.getPRNG('DRAW').floatInRange(0.5, 1);
        this.shakingAnimation = animationGroup.addAnimation((0,_utils_animationHelper_js__WEBPACK_IMPORTED_MODULE_0__.startAnimation)({
            animate: (t) => {
                const targetAngle = MAX_ANGLE * (cw ? 1 : -1);
                this.canvasDiv.style.transform = `rotate(${this.baseAngle + targetAngle * Math.pow(Math.sin(Math.PI * 2 * (t / SHAKE_TIME)), 3)}deg)`;
                if (t >= SHAKE_TIME)
                    return _utils_animationHelper_js__WEBPACK_IMPORTED_MODULE_0__.AnimationState.DONE;
            },
            onDone: () => {
                this.shakingAnimation = null;
            }
        }));
    }
    draw() {
        this.drawLayers();
        this.afterDrawLayers();
    }
    serialize() {
        this.canvasLayers.forEach((layer) => {
            this.options.context.serializedValues[layer.uid] = layer.canvas.toDataURL();
        });
    }
    offsetBounds(newBounds) {
        const xDiff = newBounds.minPos.x;
        const yDiff = newBounds.minPos.y;
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
/* harmony import */ var _teePartGrower_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./teePartGrower.js */ "./src/tree/treeParts/teePartGrower.ts");



class TreePartLeaf extends _teePartGrower_js__WEBPACK_IMPORTED_MODULE_2__.TreePartGrower {
    constructor(options) {
        super(options);
        this.springAnimation = null;
        this.dragging = false;
        this.leafClusterDropping = false;
        this.leafLayer = this.createCanvasLayer();
        this.containerDiv.style.cursor = 'grab';
        this.updatePointerProperty();
        this.setupClick();
    }
    isTerminal() {
        return true;
    }
    setupClick() {
        this.containerDiv.addEventListener('click', (e) => {
            e.preventDefault();
            if (!this.isFinishedGrowing() || !this.isTerminal())
                return;
            this.dropRandomLeafs(1 + Math.floor(Math.random() * (3 + 1)));
        });
    }
    shake(cw) {
        if (this.dragging || this.springAnimation || this.leafClusterDropping)
            return;
        super.shake(cw);
    }
    dropRandomLeafs(leafCount) {
        const prng = this.options.context.treeGenerator.getPRNG('DRAW');
        const leafs = this.branchGrower.getLeafs();
        if (!leafs.length)
            return;
        for (let i = 0; i < leafCount; i++) {
            const leaf = leafs[prng.intInRange(0, leafs.length - 1)];
            this.dropLeaf(leaf);
        }
    }
    dropLeaf(leaf, dropDelay) {
        console.assert(this.isFinishedGrowing());
        const animationGroup = this.options.context.treeGenerator.getAnimationGroup();
        const leafElement = leaf.createElement();
        leafElement.style.zIndex = this.containerDiv.style.zIndex;
        const startY = parseFloat(leafElement.style.top);
        const speed = this.options.context.treeGenerator.getPRNG('DRAW').floatInRange(200, 300);
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
        this.options.context.treeGenerator.appendElement(leafElement);
    }
    drawLayers() {
        super.drawLayers();
        this.drawWithTransform(this.leafLayer.canvas, (ctx) => this.drawLeafs(ctx, this.leafLayer));
    }
    drawLeafs(ctx, layer) {
        if (!this.isTerminal())
            return;
        const newLeafs = this.branchGrower.getNewLeafs();
        const rotatedLeafCount = this.options.context.treeGenerator.getPRNG('GROW').intInRange(1, 2);
        newLeafs.forEach((leaf) => {
            leaf.draw(ctx);
            for (let i = 0; i < rotatedLeafCount; i++) {
                const rotatedLeaf = leaf.clone();
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
}


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
/* harmony import */ var _spaceColonizer_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../spaceColonizer.js */ "./src/tree/spaceColonizer.ts");
/* harmony import */ var _components_branch_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../components/branch.js */ "./src/tree/components/branch.ts");
/* harmony import */ var _components_leaf_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../components/leaf.js */ "./src/tree/components/leaf.ts");
/* harmony import */ var _utils_canvasHelper_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../utils/canvasHelper.js */ "./src/utils/canvasHelper.ts");
/* harmony import */ var _utils_metaballs_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../../utils/metaballs.js */ "./src/utils/metaballs.ts");
/* harmony import */ var _utils_animationHelper_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../../utils/animationHelper.js */ "./src/utils/animationHelper.ts");
/* harmony import */ var _treeParts_treePartLeaf_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../treeParts/treePartLeaf.js */ "./src/tree/treeParts/treePartLeaf.ts");
/* harmony import */ var _treeParts_treePartInter_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../treeParts/treePartInter.js */ "./src/tree/treeParts/treePartInter.ts");
/* harmony import */ var _treeParts_staticTreePart_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../treeParts/staticTreePart.js */ "./src/tree/treeParts/staticTreePart.ts");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};











class BonsaiSapceColonizer extends _spaceColonizer_js__WEBPACK_IMPORTED_MODULE_2__.SpaceColonizer {
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
                (() => __awaiter(this, void 0, void 0, function* () { return BonsaiGenerator.potFrontImage = yield _utils_canvasHelper_js__WEBPACK_IMPORTED_MODULE_5__.CanvasHelper.loadImage('resources/bonsai/images/pot_front.png'); }))(),
                (() => __awaiter(this, void 0, void 0, function* () { return BonsaiGenerator.potBackImage = yield _utils_canvasHelper_js__WEBPACK_IMPORTED_MODULE_5__.CanvasHelper.loadImage('resources/bonsai/images/pot_back.png'); }))(),
                (() => __awaiter(this, void 0, void 0, function* () { return BonsaiGenerator.mainBranchImage = yield _utils_canvasHelper_js__WEBPACK_IMPORTED_MODULE_5__.CanvasHelper.loadImage('resources/bonsai/images/bark_texture.jpg'); }))(),
                (() => __awaiter(this, void 0, void 0, function* () { return BonsaiGenerator.leafTextureImage = yield _utils_canvasHelper_js__WEBPACK_IMPORTED_MODULE_5__.CanvasHelper.loadImage('resources/bonsai/images/leaf_texture.jpg'); }))(),
                (() => __awaiter(this, void 0, void 0, function* () { return BonsaiGenerator.leafStencilImage = yield _utils_canvasHelper_js__WEBPACK_IMPORTED_MODULE_5__.CanvasHelper.loadImage('resources/bonsai/images/leaf_stencil.png'); }))(),
                (() => __awaiter(this, void 0, void 0, function* () { return BonsaiGenerator.leafOutlineImage = yield _utils_canvasHelper_js__WEBPACK_IMPORTED_MODULE_5__.CanvasHelper.loadImage('resources/bonsai/images/leaf_outline.png'); }))()
            ]);
        });
    }
    constructor(options) {
        super(options);
        // setup patterns
        const dummyCanvas = _utils_canvasHelper_js__WEBPACK_IMPORTED_MODULE_5__.CanvasHelper.createTempCanvas(1, 1);
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
        this.getAnimationGroup().addAnimation((0,_utils_animationHelper_js__WEBPACK_IMPORTED_MODULE_7__.setAnimationInterval)({
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
        this.treeParts.push(_treeParts_staticTreePart_js__WEBPACK_IMPORTED_MODULE_10__.StaticTreePart.fromImage({
            context: this.treePartContext,
            pos: potPosition,
            image: BonsaiGenerator.potBackImage,
            zIndex: -1,
            depth: -1
        }));
        this.treeParts.push(_treeParts_staticTreePart_js__WEBPACK_IMPORTED_MODULE_10__.StaticTreePart.fromImage({
            context: this.treePartContext,
            pos: potPosition,
            image: BonsaiGenerator.potFrontImage,
            zIndex: 1,
            depth: -1
        }));
    }
    generateTrunkLayer() {
        const newTreePart = new _treeParts_treePartInter_js__WEBPACK_IMPORTED_MODULE_9__.TreePartInter({
            context: this.treePartContext,
            position: _utils_linear_vector2_js__WEBPACK_IMPORTED_MODULE_1__.Vector2.Zero,
            size: new _utils_linear_vector2_js__WEBPACK_IMPORTED_MODULE_1__.Vector2(_treeGenerator_js__WEBPACK_IMPORTED_MODULE_0__.TreeGenerator.REFERENCE_HEIGHT, _treeGenerator_js__WEBPACK_IMPORTED_MODULE_0__.TreeGenerator.REFERENCE_HEIGHT),
            origin: BonsaiGenerator.GROW_ORIGIN,
            overdrawWidth: 200,
            fadeIn: false
        });
        const context = Object.assign(Object.assign({}, this.treePartContext), { treePart: newTreePart });
        newTreePart.branchGrower = new BonsaiSapceColonizer({
            treeGenerator: this,
            depth: 0,
            origin: BonsaiGenerator.GROW_ORIGIN,
            size: new _utils_linear_vector2_js__WEBPACK_IMPORTED_MODULE_1__.Vector2(_treeGenerator_js__WEBPACK_IMPORTED_MODULE_0__.TreeGenerator.REFERENCE_HEIGHT, _treeGenerator_js__WEBPACK_IMPORTED_MODULE_0__.TreeGenerator.REFERENCE_HEIGHT),
            leafCount: 7,
            spawnPoints: new Array(10).fill(null).map(x => new _utils_linear_vector2_js__WEBPACK_IMPORTED_MODULE_1__.Vector2(this.getPRNG('GROW').floatInRange(0, _treeGenerator_js__WEBPACK_IMPORTED_MODULE_0__.TreeGenerator.REFERENCE_HEIGHT - 100), this.getPRNG('GROW').floatInRange(_treeGenerator_js__WEBPACK_IMPORTED_MODULE_0__.TreeGenerator.REFERENCE_HEIGHT * 0.4, _treeGenerator_js__WEBPACK_IMPORTED_MODULE_0__.TreeGenerator.REFERENCE_HEIGHT * 0.6))),
            branchLength: 10,
            createFirstBranch: (pos) => {
                return new _components_branch_js__WEBPACK_IMPORTED_MODULE_3__.Branch({
                    position: pos,
                    context: context
                });
            },
            createLeaf: (pos) => {
                return new _components_leaf_js__WEBPACK_IMPORTED_MODULE_4__.Leaf({
                    treeGenerator: this,
                    position: pos,
                    attractionDistance: _treeGenerator_js__WEBPACK_IMPORTED_MODULE_0__.TreeGenerator.REFERENCE_HEIGHT * 0.75,
                    context: context
                });
            }
        });
        newTreePart.init();
        newTreePart.start();
        this.treeParts.push(newTreePart);
    }
    generateSplitLayer(depth, leaf) {
        var _a;
        if (!leaf.parent)
            return console.assert(false);
        const treePart = (_a = leaf.parent.context) === null || _a === void 0 ? void 0 : _a.treePart;
        const LAYER_SIZE = 300;
        const EXTRUDE_RANGE = [100, 150];
        const EXTRUDE_ANGLLE_MIN_DIFF = Math.PI * 0.1;
        const EXTRUDE_ANGLE_MAX_DIFF = Math.PI * 0.25;
        const prng = this.getPRNG('GROW');
        const branch = leaf.parent;
        const extrudeDir = branch.endPosGlobal.subtract(BonsaiGenerator.GROW_ORIGIN).normalize().randomizeAngle(EXTRUDE_ANGLLE_MIN_DIFF, EXTRUDE_ANGLE_MAX_DIFF, prng.random());
        const extrudeLength = prng.floatInRange(EXTRUDE_RANGE[0], EXTRUDE_RANGE[1]);
        const extrudePosition = branch.endPos.add(extrudeDir.scale(extrudeLength));
        const position = branch.endPos.add(new _utils_linear_vector2_js__WEBPACK_IMPORTED_MODULE_1__.Vector2(-LAYER_SIZE * 0.5, -LAYER_SIZE));
        const origin = branch.endPos.subtract(position);
        const size = new _utils_linear_vector2_js__WEBPACK_IMPORTED_MODULE_1__.Vector2(LAYER_SIZE, LAYER_SIZE);
        const newTreePart = new _treeParts_treePartInter_js__WEBPACK_IMPORTED_MODULE_9__.TreePartInter({
            context: this.treePartContext,
            depth: depth,
            position: position,
            size: size,
            parent: treePart,
            origin: origin,
            fadeIn: true
        });
        const context = Object.assign(Object.assign({}, this.treePartContext), { treePart: newTreePart });
        newTreePart.branchGrower = new BonsaiSapceColonizer({
            treeGenerator: this,
            depth: depth,
            parentBranch: branch,
            origin: origin,
            size: size,
            leafCount: 1,
            branchLength: 8,
            spawnPoints: [extrudePosition.subtract(position)],
            createFirstBranch: (pos) => {
                return new _components_branch_js__WEBPACK_IMPORTED_MODULE_3__.Branch({
                    position: pos,
                    parent: branch,
                    context: context
                });
            },
            createLeaf: (pos) => {
                return new _components_leaf_js__WEBPACK_IMPORTED_MODULE_4__.Leaf({
                    treeGenerator: this,
                    position: pos,
                    attractionDistance: LAYER_SIZE,
                    context: context
                });
            }
        });
        newTreePart.init();
        newTreePart.start();
        this.treeParts.push(newTreePart);
    }
    generateLeafLayer(depth, leaf) {
        var _a;
        if (!leaf.parent)
            return console.assert(false);
        const treePart = (_a = leaf.parent.context) === null || _a === void 0 ? void 0 : _a.treePart;
        const prng = this.getPRNG('GROW');
        const branch = leaf.parent;
        const LEAF_SCALE = prng.floatInRange(1, 1.2);
        const size = new _utils_linear_vector2_js__WEBPACK_IMPORTED_MODULE_1__.Vector2(500 * LEAF_SCALE, 200 * LEAF_SCALE);
        const position = branch.endPos.subtractFromFloats(size.x * 0.5, size.y - 10);
        const origin = branch.endPos.subtract(position);
        const leafCount = 200 * Math.pow(LEAF_SCALE, 2);
        const leafAttractionDistance = prng.intInRange(50, 100) * LEAF_SCALE;
        const surfaceScalar = size.x / 500;
        const metaballSurface = new _utils_metaballs_js__WEBPACK_IMPORTED_MODULE_6__.MetaballSurface({
            threshold: 1,
            points: [
                { x: size.x * 0.2, y: size.y, r: [30, 60], d: [0, 30] },
                { x: size.x * 0.4, y: size.y, r: [30, 60], d: [0, 30] },
                { x: size.x * 0.6, y: size.y, r: [30, 60], d: [0, 30] },
                { x: size.x * 0.8, y: size.y, r: [30, 60], d: [0, 30] },
                { x: size.x * 0.5, y: size.y, r: [20, 30], d: [0, 30] },
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
        const newTreePart = new _treeParts_treePartLeaf_js__WEBPACK_IMPORTED_MODULE_8__.TreePartLeaf({
            context: this.treePartContext,
            origin: origin,
            parent: treePart,
            depth: depth,
            position: position,
            size: size,
            fadeIn: true
        });
        const context = Object.assign(Object.assign({}, this.treePartContext), { treePart: newTreePart });
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
            createFirstBranch: (pos) => {
                return new _components_branch_js__WEBPACK_IMPORTED_MODULE_3__.Branch({
                    position: pos,
                    parent: branch,
                    context: context
                });
            },
            createLeaf: (pos) => {
                return new _components_leaf_js__WEBPACK_IMPORTED_MODULE_4__.Leaf({
                    treeGenerator: this,
                    position: pos,
                    attractionDistance: leafAttractionDistance * LEAF_SCALE,
                    context: context
                });
            }
        });
        newTreePart.start();
        newTreePart.init();
        this.treeParts.push(newTreePart);
    }
    getBranchWidth(branch) {
        var _a;
        const treePart = (_a = branch.context) === null || _a === void 0 ? void 0 : _a.treePart;
        switch (treePart.depth) {
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
}
BonsaiGenerator.GROW_ORIGIN = new _utils_linear_vector2_js__WEBPACK_IMPORTED_MODULE_1__.Vector2(_treeGenerator_js__WEBPACK_IMPORTED_MODULE_0__.TreeGenerator.REFERENCE_HEIGHT * 0.5, _treeGenerator_js__WEBPACK_IMPORTED_MODULE_0__.TreeGenerator.REFERENCE_HEIGHT - 100);


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
})(CanvasHelper || (CanvasHelper = {}));


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
    subtractFromFloats(x, y) { return this.clone().subtractInPlaceFromFloats(x, y); }
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
    static dot(a, b) {
        return ((a.x * b.x) + (a.y * b.y));
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
(() => __awaiter(void 0, void 0, void 0, function* () {
    const STARTING_SEED = 2568;
    const STARTING_TEXT = "ZENITUDE";
    yield _tree_types_bonsai_bonsaiGenerator_js__WEBPACK_IMPORTED_MODULE_0__.BonsaiGenerator.loadResources();
    let bonsaiGenerator;
    let seed = null;
    const btnSerialize = document.querySelector('#btnSerialize');
    const btnRegenerate = document.querySelector('#btnRegenerate');
    const inpSeedText = document.querySelector('#inpSeedText');
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
                if (first || (STARTING_TEXT == inpSeedText.value))
                    seed = STARTING_SEED;
            }
            else {
                // random
                seed = Math.floor(Math.random() * 10000);
            }
            // determine if serialized json present
            const serializedJSON = first ?
                yield ((yield fetch(`./resources/bonsai/serialized/tree_serialized_${seed}.json`)).json()) :
                null;
            // set the rendering scale
            const resolutionScalar = (window.screen.height / _tree_types_bonsai_bonsaiGenerator_js__WEBPACK_IMPORTED_MODULE_0__.BonsaiGenerator.REFERENCE_HEIGHT) * window.devicePixelRatio;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Q0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7Z0JBQzNCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUMxRSxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO1lBQy9FLENBQUM7WUFDRCxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDN0UsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO1lBRXZFLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO1FBQ2pCLENBQUM7UUFFRCxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztRQUV4QixlQUFlO1FBQ2YsQ0FBQyxJQUFJLENBQUMsQ0FBQyxL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QWE7Z0JBQzlCLFNBQVMsRUFBRSxLQUFLO2dCQUNoQixhQUFhLEVBQUUsZ0JBQWdCO2dCQUMvQixJQUFJLEVBQUUsSUFBSztnQkFDWCxjQUFjLEVBQUUsY0FBYyxhQUFkLGNBQWMsY0FBZCxjQUFjLEdBQUksU0FBUzthQUM5QyxDQUFDLENBQUM7WUFFSCxLQUFLLEdBQUcsS0FBSyxDQUFDO1lBRWQsZUFBZTtZQUNmLGVBQWUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUMzQixDQUFDO0tBQUE7SUFFRCxZQUFZLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRTtRQUN4QyxNQUFNLGNBQWMsR0FBRyxlQUFlLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUMzRCxRQUFRLENBQUMsbUJBQW1CLElBQUksT0FBTyxFQUFFLGNBQWMsQ0FBQyxDQUFDO0lBQzdELENBQUMsQ0FBQyxDQUFDO0lBRUgsYUFBYSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUU7UUFDekMsZUFBZSxhQUFmLGVBQWUsdUJBQWYsZUFBZSxDQUFFLE9BQU8sRUFBRSxDQUFDO1FBQzNCLGNBQWMsRUFBRSxDQUFDO0lBQ3JCLENBQUMsQ0FBQyxDQUFDO0lBRUgsY0FBYyxFQUFFLENBQUM7QUFDckIsQ0FBQyxFQUFDLEVBQUUsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL3RyZWVnZW5lcmF0b3IvLi9zcmMvdHJlZS9jb21wb25lbnRzL2JyYW5jaC50cyIsIndlYnBhY2s6Ly90cmVlZ2VuZXJhdG9yLy4vc3JjL3RyZWUvY29tcG9uZW50cy9sZWFmLnRzIiwid2VicGFjazovL3RyZWVnZW5lcmF0b3IvLi9zcmMvdHJlZS9zcGFjZUNvbG9uaXplci50cyIsIndlYnBhY2s6Ly90cmVlZ2VuZXJhdG9yLy4vc3JjL3RyZWUvdHJlZUdlbmVyYXRvci50cyIsIndlYnBhY2s6Ly90cmVlZ2VuZXJhdG9yLy4vc3JjL3RyZWUvdHJlZVBhcnRzL3N0YXRpY1RyZWVQYXJ0LnRzIiwid2VicGFjazovL3RyZWVnZW5lcmF0b3IvLi9zcmMvdHJlZS90cmVlUGFydHMvdGVlUGFydEdyb3dlci50cyIsIndlYnBhY2s6Ly90cmVlZ2VuZXJhdG9yLy4vc3JjL3RyZWUvdHJlZVBhcnRzL3RyZWVQYXJ0LnRzIiwid2VicGFjazovL3RyZWVnZW5lcmF0b3IvLi9zcmMvdHJlZS90cmVlUGFydHMvdHJlZVBhcnRJbnRlci50cyIsIndlYnBhY2s6Ly90cmVlZ2VuZXJhdG9yLy4vc3JjL3RyZWUvdHJlZVBhcnRzL3RyZWVQYXJ0TGVhZi50cyIsIndlYnBhY2s6Ly90cmVlZ2VuZXJhdG9yLy4vc3JjL3RyZWUvdHlwZXMvYm9uc2FpL2JvbnNhaUdlbmVyYXRvci50cyIsIndlYnBhY2s6Ly90cmVlZ2VuZXJhdG9yLy4vc3JjL3V0aWxzL2FuaW1hdGlvbkhlbHBlci50cyIsIndlYnBhY2s6Ly90cmVlZ2VuZXJhdG9yLy4vc3JjL3V0aWxzL2NhbnZhc0hlbHBlci50cyIsIndlYnBhY2s6Ly90cmVlZ2VuZXJhdG9yLy4vc3JjL3V0aWxzL2xpbmVhci92ZWN0b3IyLnRzIiwid2VicGFjazovL3RyZWVnZW5lcmF0b3IvLi9zcmMvdXRpbHMvbWV0YWJhbGxzLnRzIiwid2VicGFjazovL3RyZWVnZW5lcmF0b3IvLi9zcmMvdXRpbHMvcmFuZG9tL21lcnNlbm5lVHdpc3Rlci50cyIsIndlYnBhY2s6Ly90cmVlZ2VuZXJhdG9yLy4vc3JjL3V0aWxzL3JhbmRvbS9tZXJzZW5uZVR3aXN0ZXJBZGFwdGVyLnRzIiwid2VicGFjazovL3RyZWVnZW5lcmF0b3Ivd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vdHJlZWdlbmVyYXRvci93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vdHJlZWdlbmVyYXRvci93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL3RyZWVnZW5lcmF0b3Ivd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly90cmVlZ2VuZXJhdG9yLy4vc3JjL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SVRyZWVHZW5lcmF0b3JQYXJhbWV0ZXJzfSBmcm9tIFwiLi4vdHJlZUdlbmVyYXRvci5qc1wiO1xuaW1wb3J0IHtWZWN0b3IyfSBmcm9tIFwiLi4vLi4vdXRpbHMvbGluZWFyL3ZlY3RvcjIuanNcIjtcbmltcG9ydCB7TGVhZn0gZnJvbSBcIi4vbGVhZi5qc1wiO1xuaW1wb3J0IHsgVHJlZVBhcnQsIFRyZWVQYXJ0Q29udGV4dCB9IGZyb20gXCIuLi90cmVlUGFydHMvdHJlZVBhcnQuanNcIjtcblxuZXhwb3J0IGludGVyZmFjZSBCcmFuY2hPcHRpb25zIHtcbiAgICBwb3NpdGlvbjogVmVjdG9yMjtcbiAgICBwYXJlbnQ/OiBCcmFuY2g7XG4gICAgY29udGV4dDogQnJhbmNoQ29udGV4dDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBCcmFuY2hDb250ZXh0IGV4dGVuZHMgVHJlZVBhcnRDb250ZXh0IHtcbiAgICB0cmVlUGFydDogVHJlZVBhcnQ7XG59XG5cbmV4cG9ydCBjbGFzcyBCcmFuY2gge1xuICAgIHB1YmxpYyBjb25zdHJ1Y3RvcihvcHRpb25zOiBCcmFuY2hPcHRpb25zKSB7XG4gICAgICAgIC8vIHNldCBkZWZhdWx0IG9wdGlvbnNcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICAgICAgdGhpcy5fcGFyZW50ID0gb3B0aW9ucy5wYXJlbnQgPz8gbnVsbDtcbiAgICAgICAgdGhpcy5fcG9zaXRpb24gPSBvcHRpb25zLnBvc2l0aW9uO1xuXG4gICAgICAgIFxuICAgICAgICAvLyBzZXQgdGV4dHVyZSBvZmZzZXRcbiAgICAgICAgaWYgKHRoaXMucGFyZW50KSB7XG4gICAgICAgICAgICBjb25zdCBsZW5ndGggPSAodGhpcy5fcG9zaXRpb24uc3VidHJhY3QodGhpcy5wYXJlbnQuZW5kUG9zKSkubGVuZ3RoKCk7XG4gICAgICAgICAgICB0aGlzLmdyb3d0aFRvdGFsLnkgPSB0aGlzLnBhcmVudC5ncm93dGhUb3RhbC55ICsgbGVuZ3RoO1xuICAgICAgICAgICAgaWYgKHRoaXMuaXNGaXJzdEJyYW5jaCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZ3Jvd3RoTG9jYWwueCA9IG9wdGlvbnMuY29udGV4dC50cmVlR2VuZXJhdG9yLmdldFBSTkcoJ0dST1cnKS5mbG9hdEluUmFuZ2UoMCwgMTAyNCk7XG4gICAgICAgICAgICAgICAgdGhpcy5ncm93dGhMb2NhbC55ID0gMDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5ncm93dGhMb2NhbC54ID0gdGhpcy5ncm93dGhMb2NhbC54O1xuICAgICAgICAgICAgICAgIHRoaXMuZ3Jvd3RoTG9jYWwueSA9IHRoaXMucGFyZW50IS5ncm93dGhMb2NhbC55ICsgbGVuZ3RoO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGV4dHJ1ZGUoZGlyZWN0aW9uOiBWZWN0b3IyKTogQnJhbmNoIHtcbiAgICAgICAgdGhpcy5fY2hpbGRDb3VudCsrO1xuICAgICAgICByZXR1cm4gbmV3IEJyYW5jaCh7XG4gICAgICAgICAgICBwb3NpdGlvbjogdGhpcy5lbmRQb3MuYWRkKGRpcmVjdGlvbiksXG4gICAgICAgICAgICBwYXJlbnQ6IHRoaXMsXG4gICAgICAgICAgICBjb250ZXh0OiB0aGlzLm9wdGlvbnMuY29udGV4dFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IGlzRmlyc3RCcmFuY2goKSB7XG4gICAgICAgIHJldHVybiAodGhpcy5vcHRpb25zLmNvbnRleHQ/LnRyZWVQYXJ0ICE9IHRoaXMub3B0aW9ucy5wYXJlbnQ/LmNvbnRleHQ/LnRyZWVQYXJ0KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IGNvbnRleHQoKTogQnJhbmNoQ29udGV4dCB8IHVuZGVmaW5lZCB7XG4gICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnMuY29udGV4dDtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IGFuZ2xlKCk6IG51bWJlciB7XG4gICAgICAgIGlmICghdGhpcy5wYXJlbnQpXG4gICAgICAgICAgICByZXR1cm4gTmFOO1xuICAgICAgICByZXR1cm4gTWF0aC5hdGFuMih0aGlzLmVuZFBvcy54IC0gdGhpcy5zdGFydFBvcy54LCB0aGlzLnN0YXJ0UG9zLnkgLSB0aGlzLmVuZFBvcy55KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IGRpcmVjdGlvbigpOiBWZWN0b3IyIHtcbiAgICAgICAgaWYgKCF0aGlzLnBhcmVudClcbiAgICAgICAgICAgIHJldHVybiBWZWN0b3IyLlplcm87XG4gICAgICAgIHJldHVybiB0aGlzLmVuZFBvcy5zdWJ0cmFjdCh0aGlzLnN0YXJ0UG9zKS5ub3JtYWxpemUoKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IGJyYW5jaFdpZHRoKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnMuY29udGV4dC50cmVlR2VuZXJhdG9yLmdldEJyYW5jaFdpZHRoKHRoaXMpO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgYnJhbmNoSGVpZ2h0KCk6IG51bWJlciB7XG4gICAgICAgIGlmICghdGhpcy5wYXJlbnQpXG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgcmV0dXJuIHRoaXMuZW5kUG9zLnN1YnRyYWN0KHRoaXMuc3RhcnRQb3MpLmxlbmd0aCgpO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgcGFyZW50KCk6IEJyYW5jaCB8IG51bGwgeyByZXR1cm4gdGhpcy5fcGFyZW50OyB9XG5cbiAgICBwdWJsaWMgZ2V0IGdyb3d0aFRvdGFsKCk6IFZlY3RvcjIgeyByZXR1cm4gdGhpcy5fZ3Jvd3RoVG90YWw7IH1cblxuICAgIHB1YmxpYyBnZXQgZ3Jvd3RoTG9jYWwoKTogVmVjdG9yMiB7IHJldHVybiB0aGlzLl9ncm93dGhMb2NhbDsgfVxuXG4gICAgcHVibGljIGdldCBlbmRQb3MoKTogVmVjdG9yMiB7IHJldHVybiB0aGlzLl9wb3NpdGlvbjsgfVxuXG4gICAgcHVibGljIGdldCBzdGFydFBvcygpOiBWZWN0b3IyIHtcbiAgICAgICAgaWYgKCF0aGlzLnBhcmVudClcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmVuZFBvcztcbiAgICAgICAgaWYgKHRoaXMuaXNGaXJzdEJyYW5jaClcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnBhcmVudC5lbmRQb3Muc3VidHJhY3QodGhpcy5vcHRpb25zLmNvbnRleHQhLnRyZWVQYXJ0LnBvc2l0aW9uKTtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyZW50LmVuZFBvcztcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IGVuZFBvc0dsb2JhbCgpOiBWZWN0b3IyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucy5jb250ZXh0IS50cmVlUGFydC5wb3NpdGlvbkdsb2JhbC5hZGQodGhpcy5lbmRQb3MpO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgY2hpbGRDb3VudCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5fY2hpbGRDb3VudDsgfVxuXG4gICAgcHVibGljIGRpc3RhbmNlVG8obGVhZjogTGVhZikgeyByZXR1cm4gbGVhZi5wb3NpdGlvbi5zdWJ0cmFjdCh0aGlzLmVuZFBvcykubGVuZ3RoKCk7IH1cblxuICAgIHB1YmxpYyBkcmF3KGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCBkcmF3Qm9yZGVyOiBib29sZWFuID0gdHJ1ZSkge1xuICAgICAgICBpZiAoIXRoaXMucGFyZW50KVxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIGlmKHRoaXMub3B0aW9ucy5jb250ZXh0LmlzUGxheWJhY2spXG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgaWYgKCh0aGlzLmJyYW5jaFdpZHRoIC8gdGhpcy5icmFuY2hIZWlnaHQpID4gMilcbiAgICAgICAgICAgIHRoaXMuZHJhd1dpdGhDaXJjbGUoY3R4LCBkcmF3Qm9yZGVyKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGhpcy5kcmF3V2l0aFJlY3RhbmdsZShjdHgsIGRyYXdCb3JkZXIpO1xuXG4gICAgICAgIGNvbnNvbGUuYXNzZXJ0KCF0aGlzLmRyYXduKTtcbiAgICAgICAgdGhpcy5kcmF3biA9IHRydWU7ICBcbiAgICB9XG5cbiAgICBwcml2YXRlIGRyYXdXaXRoUmVjdGFuZ2xlKGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCBkcmF3Qm9yZGVyOiBib29sZWFuKSB7XG4gICAgICAgIGlmICghdGhpcy5wYXJlbnQpXG4gICAgICAgICAgICByZXR1cm4gY29uc29sZS5hc3NlcnQoZmFsc2UpO1xuXG4gICAgICAgIGNvbnN0IGNpcmNsZVJhZGl1czogbnVtYmVyID0gdGhpcy5icmFuY2hXaWR0aCAvIDI7XG4gICAgICAgIGNvbnN0IHRlbXBDYW52YXMgPSB0aGlzLm9wdGlvbnMuY29udGV4dC50cmVlR2VuZXJhdG9yLmdldFRlbXBDYW52YXMoMCk7XG5cbiAgICAgICAgLy8gIGRyYXcgYnJhbmNoIHRvIHRlbXBvcmFyeSBjYW52YXNcbiAgICAgICAgdGVtcENhbnZhcy5zYXZlKCk7XG4gICAgICAgIHtcbiAgICAgICAgICAgIC8vICAgIHByZXBhcmUgdGVtcG9yYXJ5IGNhbnZhc1xuICAgICAgICAgICAgdGVtcENhbnZhcy5maWxsU3R5bGUgPSAnYmxhY2snO1xuXG4gICAgICAgICAgICAvLyAgICBkcmF3IHJlY3RhbmdsZSBtYXNrXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGVtcENhbnZhcy5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgICAgICB0ZW1wQ2FudmFzLnJlY3QoMCwgMCwgdGhpcy5icmFuY2hXaWR0aCwgdGhpcy5icmFuY2hIZWlnaHQgKyAyKTtcbiAgICAgICAgICAgICAgICB0ZW1wQ2FudmFzLmZpbGwoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gICAgZHJhdyBzZW1pLWNpcmNsZSBtYXNrIHRvIGNhcCBvZmYgc3RhcnQgKHByZXZlbnQgZ2FwcyBiZXR3ZWVuIGJyYW5jaGVzKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRlbXBDYW52YXMuc2F2ZSgpO1xuICAgICAgICAgICAgICAgIHRlbXBDYW52YXMudHJhbnNsYXRlKGNpcmNsZVJhZGl1cywgdGhpcy5icmFuY2hIZWlnaHQpO1xuICAgICAgICAgICAgICAgIHRlbXBDYW52YXMuYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICAgICAgdGVtcENhbnZhcy5hcmMoMCwgMCwgY2lyY2xlUmFkaXVzLCAwLCBNYXRoLlBJKTtcbiAgICAgICAgICAgICAgICBjb25zdCBncmFkaWVudCA9IHRlbXBDYW52YXMuY3JlYXRlTGluZWFyR3JhZGllbnQoMCwgMCwgMCwgY2lyY2xlUmFkaXVzKTtcbiAgICAgICAgICAgICAgICBncmFkaWVudC5hZGRDb2xvclN0b3AoMC4zLCAncmdiYSgwLDAsMCwxKScpO1xuICAgICAgICAgICAgICAgIGdyYWRpZW50LmFkZENvbG9yU3RvcCgxLCAncmdiYSgwLDAsMCwwKScpO1xuICAgICAgICAgICAgICAgIHRlbXBDYW52YXMuZmlsbFN0eWxlID0gZ3JhZGllbnQ7XG4gICAgICAgICAgICAgICAgdGVtcENhbnZhcy5maWxsKCk7XG4gICAgICAgICAgICAgICAgdGVtcENhbnZhcy5yZXN0b3JlKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGZpbGwgJ21hc2tlZCcgYXJlYSB3aXRoIGJyYW5jaCB0ZXh0dXJlXG4gICAgICAgICAgICB0ZW1wQ2FudmFzLmZpbHRlciA9ICdub25lJztcbiAgICAgICAgICAgIHRlbXBDYW52YXMuZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ3NvdXJjZS1pbic7XG4gICAgICAgICAgICB0aGlzLmRyYXdUZXh0dXJlKHRoaXMub3B0aW9ucy5jb250ZXh0LnRyZWVHZW5lcmF0b3IuZ2V0VGVtcENhbnZhcygxKSwgdGVtcENhbnZhcyk7XG4gICAgICAgICAgICB0ZW1wQ2FudmFzLmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdzb3VyY2Utb3V0JztcbiAgICAgICAgfVxuICAgICAgICB0ZW1wQ2FudmFzLnJlc3RvcmUoKTtcblxuICAgICAgICAvLyBjb3B5IHJlbmRlcmVkIGJyYW5jaCB0byB0YXJnZXQgY2FudmFzXG4gICAgICAgIGN0eC5zYXZlKCk7XG4gICAgICAgIHtcbiAgICAgICAgICAgIGN0eC50cmFuc2xhdGUodGhpcy5zdGFydFBvcy54LCB0aGlzLnN0YXJ0UG9zLnkpO1xuICAgICAgICAgICAgY3R4LnJvdGF0ZSh0aGlzLmFuZ2xlKTtcbiAgICAgICAgICAgIGN0eC5kcmF3SW1hZ2UodGVtcENhbnZhcy5jYW52YXMsIC10aGlzLmJyYW5jaFdpZHRoIC8gMiwgLSh0aGlzLmJyYW5jaEhlaWdodCkpO1xuICAgICAgICB9XG4gICAgICAgIGN0eC5yZXN0b3JlKCk7XG5cbiAgICAgICAgLy8gZHJhdyBvdXRsaW5lXG4gICAgICAgIGlmIChkcmF3Qm9yZGVyKSB7XG4gICAgICAgICAgICBjb25zdCBvdXRsaW5lV2lkdGg6IG51bWJlciA9IHRoaXMub3B0aW9ucy5jb250ZXh0LnRyZWVHZW5lcmF0b3IuZ2V0T3V0bGluZVRoaWNrbmVzcygpO1xuICAgICAgICAgICAgY3R4LnNhdmUoKTtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjdHguc2F2ZSgpO1xuICAgICAgICAgICAgICAgIGN0eC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnZGVzdGluYXRpb24tb3Zlcic7XG4gICAgICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9ICdibGFjayc7XG4gICAgICAgICAgICAgICAgY3R4LnRyYW5zbGF0ZSh0aGlzLnN0YXJ0UG9zLngsIHRoaXMuc3RhcnRQb3MueSk7XG4gICAgICAgICAgICAgICAgY3R4LnJvdGF0ZSh0aGlzLmFuZ2xlKTtcblxuICAgICAgICAgICAgICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgICAgICBjdHguYXJjKDAsIDAsIGNpcmNsZVJhZGl1cyArIG91dGxpbmVXaWR0aCwgMCwgTWF0aC5QSSAqIDIpO1xuICAgICAgICAgICAgICAgIGN0eC5maWxsKCk7XG5cbiAgICAgICAgICAgICAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICAgICAgY3R4LmFyYygwLCAwLCBjaXJjbGVSYWRpdXMgKyBvdXRsaW5lV2lkdGgsIDAsIE1hdGguUEkgKiAyKTtcbiAgICAgICAgICAgICAgICBjdHguZmlsbCgpO1xuXG4gICAgICAgICAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgICAgIGN0eC5yZWN0KCgtdGhpcy5icmFuY2hXaWR0aCAvIDIpIC0gb3V0bGluZVdpZHRoLCAwLCB0aGlzLmJyYW5jaFdpZHRoICsgKG91dGxpbmVXaWR0aCAqIDIpLCAtdGhpcy5icmFuY2hIZWlnaHQpO1xuICAgICAgICAgICAgICAgIGN0eC5maWxsKCk7XG5cbiAgICAgICAgICAgICAgICBjdHgucmVzdG9yZSgpO1xuXG4gICAgICAgICAgICAgICAgY3R4LnNhdmUoKTtcbiAgICAgICAgICAgICAgICBjdHguZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ2Rlc3RpbmF0aW9uLW92ZXInO1xuICAgICAgICAgICAgICAgIGN0eC5maWxsU3R5bGUgPSAnYmxhY2snO1xuICAgICAgICAgICAgICAgIGN0eC50cmFuc2xhdGUodGhpcy5lbmRQb3MueCwgdGhpcy5lbmRQb3MueSk7XG4gICAgICAgICAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgICAgIGN0eC5hcmMoMCwgMCwgY2lyY2xlUmFkaXVzICsgb3V0bGluZVdpZHRoLCAwLCBNYXRoLlBJICogMik7XG4gICAgICAgICAgICAgICAgY3R4LmZpbGwoKTtcbiAgICAgICAgICAgICAgICBjdHgucmVzdG9yZSgpO1xuXG4gICAgICAgICAgICAgICAgY3R4LnNhdmUoKTtcbiAgICAgICAgICAgICAgICBjdHguZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ2Rlc3RpbmF0aW9uLW92ZXInO1xuICAgICAgICAgICAgICAgIGN0eC5maWxsU3R5bGUgPSAnYmxhY2snO1xuICAgICAgICAgICAgICAgIGN0eC50cmFuc2xhdGUodGhpcy5zdGFydFBvcy54LCB0aGlzLnN0YXJ0UG9zLnkpO1xuICAgICAgICAgICAgICAgIGN0eC5yb3RhdGUodGhpcy5hbmdsZSk7XG4gICAgICAgICAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgICAgIGN0eC5yZWN0KCgtdGhpcy5icmFuY2hXaWR0aCAvIDIpIC0gb3V0bGluZVdpZHRoLCAwLCB0aGlzLmJyYW5jaFdpZHRoICsgKG91dGxpbmVXaWR0aCAqIDIpLCAtdGhpcy5icmFuY2hIZWlnaHQpO1xuICAgICAgICAgICAgICAgIGN0eC5maWxsKCk7XG4gICAgICAgICAgICAgICAgY3R4LnJlc3RvcmUoKTtcbiAgICAgICAgICAgICAgICBjdHguZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ3NvdXJjZS1vdmVyJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGN0eC5yZXN0b3JlKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGRyYXdXaXRoQ2lyY2xlKGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCBkcmF3Qm9yZGVyOiBib29sZWFuKSB7XG4gICAgICAgIGlmICghdGhpcy5wYXJlbnQpXG4gICAgICAgICAgICByZXR1cm4gY29uc29sZS5hc3NlcnQoZmFsc2UpO1xuXG4gICAgICAgIGNvbnN0IHRlbXBDYW52YXMgPSB0aGlzLm9wdGlvbnMuY29udGV4dC50cmVlR2VuZXJhdG9yLmdldFRlbXBDYW52YXMoMCk7XG4gICAgICAgIGNvbnN0IGNpcmNsZVJhZGl1czogbnVtYmVyID0gdGhpcy5icmFuY2hXaWR0aCAvIDI7XG5cbiAgICAgICAgLy8gIGRyYXcgYnJhbmNoIHRvIHRlbXBvcmFyeSBjYW52YXNcbiAgICAgICAge1xuICAgICAgICAgICAgLy8gICAgcHJlcGFyZSB0ZW1wb3JhcnkgY2FudmFzXG4gICAgICAgICAgICB0ZW1wQ2FudmFzLnNhdmUoKTtcbiAgICAgICAgICAgIHRlbXBDYW52YXMuZmlsbFN0eWxlID0gJ2JsYWNrJztcblxuICAgICAgICAgICAgLy8gICAgZHJhdyBjaXJjbGVcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0ZW1wQ2FudmFzLnNhdmUoKTtcbiAgICAgICAgICAgICAgICB0ZW1wQ2FudmFzLnRyYW5zbGF0ZShjaXJjbGVSYWRpdXMsIGNpcmNsZVJhZGl1cyk7XG4gICAgICAgICAgICAgICAgdGVtcENhbnZhcy5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgICAgICB0ZW1wQ2FudmFzLmFyYygwLCAwLCBjaXJjbGVSYWRpdXMsIDAsIE1hdGguUEkgKiAyKTtcbiAgICAgICAgICAgICAgICBjb25zdCBncmFkaWVudCA9IHRlbXBDYW52YXMuY3JlYXRlUmFkaWFsR3JhZGllbnQoMCwgMCwgMCwgMCwgMCwgY2lyY2xlUmFkaXVzKTtcbiAgICAgICAgICAgICAgICBncmFkaWVudC5hZGRDb2xvclN0b3AoMC44LCAncmdiYSgwLDAsMCwxKScpO1xuICAgICAgICAgICAgICAgIGdyYWRpZW50LmFkZENvbG9yU3RvcCgxLCAncmdiYSgwLDAsMCwwLjEpJyk7XG4gICAgICAgICAgICAgICAgdGVtcENhbnZhcy5maWxsU3R5bGUgPSBncmFkaWVudDtcbiAgICAgICAgICAgICAgICB0ZW1wQ2FudmFzLmZpbGwoKTtcbiAgICAgICAgICAgICAgICB0ZW1wQ2FudmFzLnJlc3RvcmUoKTtcbiAgICAgICAgICAgICAgICB0ZW1wQ2FudmFzLmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdzb3VyY2UtaW4nO1xuICAgICAgICAgICAgICAgIHRoaXMuZHJhd1RleHR1cmUodGhpcy5vcHRpb25zLmNvbnRleHQudHJlZUdlbmVyYXRvci5nZXRUZW1wQ2FudmFzKDEpLCB0ZW1wQ2FudmFzKTtcbiAgICAgICAgICAgICAgICB0ZW1wQ2FudmFzLmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdzb3VyY2Utb3V0JztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGVtcENhbnZhcy5yZXN0b3JlKCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBjb3B5IHJlbmRlcmVkIGJyYW5jaCB0byB0YXJnZXQgY2FudmFzXG4gICAgICAgIGN0eC5zYXZlKCk7XG4gICAgICAgIGN0eC50cmFuc2xhdGUodGhpcy5zdGFydFBvcy54LCB0aGlzLnN0YXJ0UG9zLnkpO1xuICAgICAgICBjdHgucm90YXRlKHRoaXMuYW5nbGUpO1xuICAgICAgICBjdHgudHJhbnNsYXRlKC1jaXJjbGVSYWRpdXMsIC1jaXJjbGVSYWRpdXMpO1xuICAgICAgICBjdHguZHJhd0ltYWdlKHRlbXBDYW52YXMuY2FudmFzLCAwLCAwKTtcbiAgICAgICAgY3R4LnJlc3RvcmUoKTtcblxuICAgICAgICAvLyBkcmF3IG91dGxpbmVcbiAgICAgICAgaWYgKGRyYXdCb3JkZXIpIHtcbiAgICAgICAgICAgIGNvbnN0IG91dGxpbmVXaWR0aDogbnVtYmVyID0gdGhpcy5vcHRpb25zLmNvbnRleHQudHJlZUdlbmVyYXRvci5nZXRPdXRsaW5lVGhpY2tuZXNzKCk7XG4gICAgICAgICAgICBjdHguc2F2ZSgpO1xuICAgICAgICAgICAgY3R4LnRyYW5zbGF0ZSh0aGlzLnN0YXJ0UG9zLngsIHRoaXMuc3RhcnRQb3MueSk7XG4gICAgICAgICAgICBjdHgucm90YXRlKHRoaXMuYW5nbGUpO1xuICAgICAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgLy8gZG9uJ3QgZHJhdyBib3R0b20gYm9yZGVyIGhhbGYgaWYgdGhpcyBpcyB0aGUgc3RhcnQgb2YgYSBuZXcgdHJlZSBwYXJ0XG4gICAgICAgICAgICBjb25zdCBkcmF3Qm90dG9tQm9yZGVyID0gIXRoaXMuaXNGaXJzdEJyYW5jaDtcbiAgICAgICAgICAgIGlmIChkcmF3Qm90dG9tQm9yZGVyKSB7XG4gICAgICAgICAgICAgICAgY3R4LmFyYygwLCAwLCBjaXJjbGVSYWRpdXMgKyBvdXRsaW5lV2lkdGgsIDAsIE1hdGguUEkgKiAyKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY3R4LmFyYygwLCAwLCBjaXJjbGVSYWRpdXMgKyBvdXRsaW5lV2lkdGgsIE1hdGguUEkgKyAwLjMsIE1hdGguUEkgKiAyIC0gMC4zKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGN0eC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnZGVzdGluYXRpb24tb3Zlcic7XG4gICAgICAgICAgICBjdHguZmlsbFN0eWxlID0gJ2JsYWNrJztcbiAgICAgICAgICAgIGN0eC5maWxsKCk7XG4gICAgICAgICAgICBjdHgucmVzdG9yZSgpO1xuICAgICAgICAgICAgY3R4Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdzb3VyY2Utb3Zlcic7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgZHJhd1RleHR1cmUodGVtcENhbnZhczogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCkge1xuICAgICAgICB0ZW1wQ2FudmFzLmZpbGxTdHlsZSA9IHRoaXMub3B0aW9ucy5jb250ZXh0LnRyZWVHZW5lcmF0b3IuZ2V0QnJhbmNoVGV4dHVyZVBhdHRlcm4odGhpcy5ncm93dGhUb3RhbCk7XG4gICAgICAgIHRlbXBDYW52YXMuYmVnaW5QYXRoKCk7XG4gICAgICAgIHRlbXBDYW52YXMucmVjdCgwLCAwLCA8bnVtYmVyPnRlbXBDYW52YXMuY2FudmFzLndpZHRoLCA8bnVtYmVyPnRlbXBDYW52YXMuY2FudmFzLmhlaWdodCk7XG4gICAgICAgIHRlbXBDYW52YXMuZmlsbCgpO1xuICAgICAgICBjdHguZHJhd0ltYWdlKHRlbXBDYW52YXMuY2FudmFzLCAwLCAwKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgb3B0aW9uczogQnJhbmNoT3B0aW9ucztcblxuICAgIHByaXZhdGUgX2dyb3d0aExvY2FsOiBWZWN0b3IyID0gbmV3IFZlY3RvcjIoMCwgMCk7XG4gICAgcHJpdmF0ZSBfZ3Jvd3RoVG90YWw6IFZlY3RvcjIgPSBuZXcgVmVjdG9yMigwLCAwKTtcblxuICAgIHByaXZhdGUgX3Bvc2l0aW9uOiBWZWN0b3IyO1xuICAgIHByaXZhdGUgX3BhcmVudDogQnJhbmNoIHwgbnVsbDtcblxuICAgIHByaXZhdGUgX2NoaWxkQ291bnQ6IG51bWJlciA9IDA7XG5cbiAgICBwcml2YXRlIGRyYXduOiBib29sZWFuID0gZmFsc2U7XG59IiwiaW1wb3J0IHsgSVRyZWVHZW5lcmF0b3JQYXJhbWV0ZXJzIH0gZnJvbSBcIi4uL3RyZWVHZW5lcmF0b3IuanNcIjtcbmltcG9ydCB7IFZlY3RvcjIgfSBmcm9tIFwiLi4vLi4vdXRpbHMvbGluZWFyL3ZlY3RvcjIuanNcIjtcbmltcG9ydCB7IEJyYW5jaCB9IGZyb20gXCIuL2JyYW5jaC5qc1wiO1xuaW1wb3J0IHsgQ2FudmFzSGVscGVyIH0gZnJvbSBcIi4uLy4uL3V0aWxzL2NhbnZhc0hlbHBlci5qc1wiO1xuaW1wb3J0IHsgQnJhbmNoQ29udGV4dCB9IGZyb20gXCIuL2JyYW5jaC5qc1wiO1xuaW1wb3J0IHsgVHJlZVBhcnQsIFRyZWVQYXJ0Q29udGV4dCB9IGZyb20gXCIuLi90cmVlUGFydHMvdHJlZVBhcnQuanNcIjtcblxuZXhwb3J0IGludGVyZmFjZSBMZWFmT3B0aW9ucyB7XG4gICAgdHJlZUdlbmVyYXRvcjogSVRyZWVHZW5lcmF0b3JQYXJhbWV0ZXJzLFxuICAgIHBvc2l0aW9uOiBWZWN0b3IyLFxuICAgIGF0dHJhY3Rpb25EaXN0YW5jZTogbnVtYmVyO1xuICAgIHJvdGF0ZWQ/OiBib29sZWFuO1xuICAgIGNvbnRleHQ6IEJyYW5jaENvbnRleHQ7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTGVhZkNvbnRleHQgZXh0ZW5kcyBUcmVlUGFydENvbnRleHQge1xuICAgIHRyZWVQYXJ0OiBUcmVlUGFydDtcbn1cblxuZXhwb3J0IGNsYXNzIExlYWYge1xuICAgIHB1YmxpYyBjb25zdHJ1Y3RvcihvcHRpb25zOiBMZWFmT3B0aW9ucykge1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgICAgICB0aGlzLl9wb3NpdGlvbiA9IG9wdGlvbnMucG9zaXRpb247XG4gICAgICAgIHRoaXMuYXR0cmFjdGlvbkRpc3RhbmNlID0gb3B0aW9ucy5hdHRyYWN0aW9uRGlzdGFuY2U7XG5cbiAgICAgICAgY29uc3QgcHJuZyA9IHRoaXMub3B0aW9ucy50cmVlR2VuZXJhdG9yLmdldFBSTkcoJ0RSQVcnKTtcblxuICAgICAgICB0aGlzLnJvdGF0aW9uID0gdGhpcy5vcHRpb25zLnJvdGF0ZWQgPyBwcm5nLmZsb2F0SW5SYW5nZSgtMS41LCAxLjUpIDogMDtcbiAgICAgICAgdGhpcy5sZWFmT2Zmc2V0cyA9IFtcbiAgICAgICAgICAgIHBybmcuaW50SW5SYW5nZSgwLCA0MDApLFxuICAgICAgICAgICAgcHJuZy5pbnRJblJhbmdlKDAsIDQwMClcbiAgICAgICAgXVxuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgcG9zaXRpb24oKTogVmVjdG9yMiB7IHJldHVybiB0aGlzLl9wb3NpdGlvbjsgfVxuICAgIHB1YmxpYyBnZXQgcGFyZW50KCk6IEJyYW5jaCB8IG51bGwgeyByZXR1cm4gdGhpcy5fcGFyZW50OyB9XG4gICAgcHVibGljIHNldCBwYXJlbnQodmFsdWU6IEJyYW5jaCB8IG51bGwpIHsgdGhpcy5fcGFyZW50ID0gdmFsdWU7IH1cblxuICAgIHB1YmxpYyBjbG9uZSgpOiBMZWFmIHtcbiAgICAgICAgY29uc3QgbGVhZiA9IG5ldyBMZWFmKHtcbiAgICAgICAgICAgIHRyZWVHZW5lcmF0b3I6IHRoaXMub3B0aW9ucy50cmVlR2VuZXJhdG9yLFxuICAgICAgICAgICAgcG9zaXRpb246IHRoaXMub3B0aW9ucy5wb3NpdGlvbi5jbG9uZSgpLFxuICAgICAgICAgICAgYXR0cmFjdGlvbkRpc3RhbmNlOiB0aGlzLm9wdGlvbnMuYXR0cmFjdGlvbkRpc3RhbmNlLFxuICAgICAgICAgICAgcm90YXRlZDogdHJ1ZSxcbiAgICAgICAgICAgIGNvbnRleHQ6IHRoaXMub3B0aW9ucy5jb250ZXh0XG4gICAgICAgIH0pO1xuICAgICAgICBsZWFmLnBhcmVudCA9IHRoaXMucGFyZW50O1xuICAgICAgICByZXR1cm4gbGVhZjtcbiAgICB9XG5cbiAgICBwdWJsaWMgY3JlYXRlRWxlbWVudCgpOiBIVE1MQ2FudmFzRWxlbWVudCB7XG4gICAgICAgIGNvbnN0IHBhcmVudCA9IDxCcmFuY2g+dGhpcy5wYXJlbnQ7XG5cbiAgICAgICAgY29uc3QgcmVuZGVyU2NhbGUgPSB0aGlzLm9wdGlvbnMudHJlZUdlbmVyYXRvci5nZXRSZW5kZXJTY2FsaW5nKCk7XG4gICAgICAgIGNvbnN0IGNhbnZhc1NpemUgPSA1MDtcbiAgICAgICAgY29uc3QgbGVhZkVsZW1lbnQ6IEhUTUxDYW52YXNFbGVtZW50ID0gPEhUTUxDYW52YXNFbGVtZW50PmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuXG4gICAgICAgIGxlYWZFbGVtZW50LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICAgICAgbGVhZkVsZW1lbnQuc3R5bGUucG9pbnRlckV2ZW50cyA9ICdub25lJztcbiAgICAgICAgbGVhZkVsZW1lbnQud2lkdGggPSBjYW52YXNTaXplICogcmVuZGVyU2NhbGU7XG4gICAgICAgIGxlYWZFbGVtZW50LmhlaWdodCA9IGNhbnZhc1NpemUgKiByZW5kZXJTY2FsZTtcbiAgICAgICAgbGVhZkVsZW1lbnQuc3R5bGUud2lkdGggPSBjYW52YXNTaXplICsgJ3B4JztcbiAgICAgICAgbGVhZkVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gY2FudmFzU2l6ZSArICdweCc7XG4gICAgICAgIGxlYWZFbGVtZW50LnN0eWxlLmxlZnQgPSAocGFyZW50LmVuZFBvc0dsb2JhbC54IC0gY2FudmFzU2l6ZSAqIDAuNSkgKyAncHgnO1xuICAgICAgICBsZWFmRWxlbWVudC5zdHlsZS50b3AgPSAocGFyZW50LmVuZFBvc0dsb2JhbC55IC0gY2FudmFzU2l6ZSAqIDAuNSkgKyAncHgnO1xuXG4gICAgICAgIGNvbnN0IGN0eCA9IDxDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQ+bGVhZkVsZW1lbnQuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgICAgY3R4LnNjYWxlKHJlbmRlclNjYWxlLCByZW5kZXJTY2FsZSk7XG4gICAgICAgIGN0eC50cmFuc2xhdGUoY2FudmFzU2l6ZSAqIDAuNSwgY2FudmFzU2l6ZSAqIDAuNSk7XG4gICAgICAgIHRoaXMuZHJhd0xlYWYoY3R4KTtcblxuICAgICAgICByZXR1cm4gbGVhZkVsZW1lbnQ7XG4gICAgfVxuXG4gICAgcHVibGljIGludGVyc2VjdHMoZW50aXR5OiBCcmFuY2gpOiBib29sZWFuIHtcbiAgICAgICAgY29uc3QgZGlzdGFuY2UgPSBlbnRpdHkuZW5kUG9zLnN1YnRyYWN0KHRoaXMucG9zaXRpb24pLmxlbmd0aCgpO1xuICAgICAgICByZXR1cm4gKGRpc3RhbmNlIDw9IHRoaXMuYXR0cmFjdGlvbkRpc3RhbmNlKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZHJhdyhjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCkge1xuICAgICAgICBpZiAoIXRoaXMucGFyZW50KVxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIGlmKHRoaXMub3B0aW9ucy5jb250ZXh0Py5pc1BsYXliYWNrKVxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIGN0eC5zYXZlKCk7XG4gICAgICAgIGN0eC50cmFuc2xhdGUodGhpcy5wYXJlbnQuZW5kUG9zLngsIHRoaXMucGFyZW50LmVuZFBvcy55KTtcbiAgICAgICAgdGhpcy5kcmF3TGVhZihjdHgpO1xuICAgICAgICBjdHgucmVzdG9yZSgpO1xuICAgIH1cblxuICAgIHB1YmxpYyBkcmF3TGVhZihjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCkge1xuICAgICAgICBpZiAoIXRoaXMucGFyZW50KVxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IHRlbXBDYW52YXMgPSB0aGlzLm9wdGlvbnMudHJlZUdlbmVyYXRvci5nZXRUZW1wQ2FudmFzKDApO1xuICAgICAgICBjb25zdCBsZWFmU3RlbmNpbCA9IHRoaXMub3B0aW9ucy50cmVlR2VuZXJhdG9yLmdldExlYWZTdGVuY2lsVGV4dHVyZSgpO1xuICAgICAgICBjb25zdCBsZWFmVGV4dHVyZSA9IHRoaXMub3B0aW9ucy50cmVlR2VuZXJhdG9yLmdldExlYWZUZXh0dXJlUGF0dGVybih0aGlzLmxlYWZPZmZzZXRzWzBdLCB0aGlzLmxlYWZPZmZzZXRzWzFdKTtcblxuICAgICAgICB0ZW1wQ2FudmFzLnNhdmUoKTtcbiAgICAgICAge1xuICAgICAgICAgICAgdGVtcENhbnZhcy5kcmF3SW1hZ2UobGVhZlN0ZW5jaWwsIDAsIDApO1xuICAgICAgICAgICAgdGVtcENhbnZhcy5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgIHRlbXBDYW52YXMucmVjdCgwLCAwLCAxNSwgMTUpO1xuICAgICAgICAgICAgdGVtcENhbnZhcy5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnc291cmNlLWluJztcbiAgICAgICAgICAgIHRlbXBDYW52YXMuZmlsbFN0eWxlID0gbGVhZlRleHR1cmU7XG4gICAgICAgICAgICB0ZW1wQ2FudmFzLmZpbGwoKTtcbiAgICAgICAgfVxuICAgICAgICB0ZW1wQ2FudmFzLmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdzb3VyY2Utb3Zlcic7XG4gICAgICAgIHRlbXBDYW52YXMucmVzdG9yZSgpO1xuXG4gICAgICAgIGN0eC5zYXZlKCk7XG4gICAgICAgIGN0eC5yb3RhdGUodGhpcy5wYXJlbnQ/LmFuZ2xlICsgdGhpcy5yb3RhdGlvbik7XG4gICAgICAgIGN0eC50cmFuc2xhdGUoLTE1IC8gMiwgLTE1KTtcbiAgICAgICAgQ2FudmFzSGVscGVyLmRyYXdJbWFnZUJvcmRlcihsZWFmU3RlbmNpbCwgY3R4LCAxKTtcbiAgICAgICAgY3R4LmRyYXdJbWFnZSh0ZW1wQ2FudmFzLmNhbnZhcywgMCwgMCk7XG4gICAgICAgIGN0eC5kcmF3SW1hZ2UodGhpcy5vcHRpb25zLnRyZWVHZW5lcmF0b3IuZ2V0TGVhZk91dGxpbmVUZXh0dXJlKCksIDAsIDApO1xuICAgICAgICBjdHgucmVzdG9yZSgpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9wdGlvbnM6IExlYWZPcHRpb25zO1xuICAgIHByaXZhdGUgX3Bvc2l0aW9uOiBWZWN0b3IyO1xuICAgIHByaXZhdGUgX3BhcmVudDogQnJhbmNoIHwgbnVsbCA9IG51bGw7XG5cbiAgICBwcml2YXRlIGxlYWZPZmZzZXRzOiBbbnVtYmVyLCBudW1iZXJdO1xuICAgIHByaXZhdGUgcm90YXRpb246IG51bWJlcjtcblxuICAgIHByaXZhdGUgYXR0cmFjdGlvbkRpc3RhbmNlOiBudW1iZXI7XG59XG4iLCJpbXBvcnQgeyBUcmVlR2VuZXJhdG9yLCBUcmVlR2VuZXJhdG9yT3B0aW9ucyB9IGZyb20gXCIuL3RyZWVHZW5lcmF0b3IuanNcIjtcbmltcG9ydCB7IEJyYW5jaCwgQnJhbmNoT3B0aW9ucyB9IGZyb20gXCIuL2NvbXBvbmVudHMvYnJhbmNoLmpzXCI7XG5pbXBvcnQgeyBMZWFmLCBMZWFmT3B0aW9ucyB9IGZyb20gXCIuL2NvbXBvbmVudHMvbGVhZi5qc1wiO1xuaW1wb3J0IHsgVmVjdG9yMiB9IGZyb20gXCIuLi91dGlscy9saW5lYXIvdmVjdG9yMi5qc1wiO1xuaW1wb3J0IHsgQnJhbmNoR3Jvd2VyIH0gZnJvbSBcIi4vYnJhbmNoR3Jvd2VyLmpzXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgU3BhY2VDb2xvbml6ZXJPcHRpb25zIHtcbiAgICB0cmVlR2VuZXJhdG9yOiBUcmVlR2VuZXJhdG9yO1xuICAgIGRlcHRoOiBudW1iZXI7XG4gICAgb3JpZ2luOiBWZWN0b3IyO1xuICAgIHNpemU6IFZlY3RvcjI7XG4gICAgbGVhZkNvdW50OiBudW1iZXI7XG4gICAgcGFyZW50QnJhbmNoPzogQnJhbmNoO1xuICAgIGJyYW5jaExlbmd0aDogbnVtYmVyO1xuICAgIHNwYXduUG9pbnRzPzogQXJyYXk8VmVjdG9yMj47XG4gICAgcG9zaXRpb25QcmVkaWNhdGU/OiAocG9zOiBWZWN0b3IyKSA9PiBib29sZWFuO1xuXG4gICAgY3JlYXRlRmlyc3RCcmFuY2g6IChwb3M6IFZlY3RvcjIpID0+IEJyYW5jaDtcbiAgICBjcmVhdGVMZWFmOiAocG9zOiBWZWN0b3IyKSA9PiBMZWFmO1xufVxuXG5leHBvcnQgY2xhc3MgU3BhY2VDb2xvbml6ZXIgaW1wbGVtZW50cyBCcmFuY2hHcm93ZXIge1xuICAgIHB1YmxpYyBjb25zdHJ1Y3RvcihvcHRpb25zOiBTcGFjZUNvbG9uaXplck9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhcnQoKSB7XG4gICAgICAgIHRoaXMucGxhY2VMZWF2ZXMoKTtcbiAgICAgICAgdGhpcy5wbGFjZUJyYW5jaGVzKCk7XG4gICAgfVxuXG4gICAgZ2V0IGFuZ2xlKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnMucGFyZW50QnJhbmNoPy5hbmdsZSA/PyAwO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBiaWFzR3Jvd3RoVmVjdG9yKGdyb3d0aFZlY3RvcjogVmVjdG9yMik6IFZlY3RvcjIge1xuICAgICAgICByZXR1cm4gZ3Jvd3RoVmVjdG9yO1xuICAgIH1cblxuICAgIHByaXZhdGUgcGxhY2VMZWF2ZXMoKSB7XG4gICAgICAgIC8vIHBsYWNlIG4gbGVhZnNcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLm9wdGlvbnMubGVhZkNvdW50OyBpKyspIHtcblxuICAgICAgICAgICAgbGV0IGxlYWZQb3NpdGlvbjogVmVjdG9yMiA9IFZlY3RvcjIuWmVybztcblxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5zcGF3blBvaW50cz8uW2ldKSB7XG4gICAgICAgICAgICAgICAgLy8gbGVhZiBwb3NpdGlvbiBleHBsaWNpdGx5IHNwZWNpZmllZFxuICAgICAgICAgICAgICAgIGxlYWZQb3NpdGlvbiA9IHRoaXMub3B0aW9ucy5zcGF3blBvaW50c1tpXTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gbGVhZiBwb3NpdGlvbiByYW5kb20gcG9pbnQgaW4gYm91bmRzIHdpdGggcmVzcGVjdCB0byBwcmVkaWNhdGVcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IDEwMDsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgIGxlYWZQb3NpdGlvbiA9IG5ldyBWZWN0b3IyKFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zLnRyZWVHZW5lcmF0b3IuZ2V0UFJORygnR1JPVycpLmZsb2F0SW5SYW5nZSgwLCB0aGlzLm9wdGlvbnMuc2l6ZS54KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy50cmVlR2VuZXJhdG9yLmdldFBSTkcoJ0dST1cnKS5mbG9hdEluUmFuZ2UoMCwgdGhpcy5vcHRpb25zLnNpemUueSksXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy5vcHRpb25zLnBvc2l0aW9uUHJlZGljYXRlIHx8IHRoaXMub3B0aW9ucy5wb3NpdGlvblByZWRpY2F0ZShsZWFmUG9zaXRpb24pKVxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cblxuICAgICAgICAgICAgY29uc3QgbGVhZjogTGVhZiA9IHRoaXMub3B0aW9ucy5jcmVhdGVMZWFmKGxlYWZQb3NpdGlvbik7XG4gICAgICAgICAgICB0aGlzLmFjdGl2ZUxlYWZzLmFkZChsZWFmKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgcGxhY2VCcmFuY2hlcygpIHtcbiAgICAgICAgY29uc3Qgc3RhcnRpbmdQb3MgPSB0aGlzLm9wdGlvbnMub3JpZ2luLmFkZCh0aGlzLm9wdGlvbnMucGFyZW50QnJhbmNoPy5kaXJlY3Rpb24uc2NhbGUodGhpcy5vcHRpb25zLmJyYW5jaExlbmd0aCkgPz8gVmVjdG9yMi5aZXJvKTtcbiAgICAgICAgY29uc3Qgc3RhcnRpbmdCcmFuY2ggPSB0aGlzLm9wdGlvbnMuY3JlYXRlRmlyc3RCcmFuY2goc3RhcnRpbmdQb3MpO1xuICAgICAgICB0aGlzLmJyYW5jaGVzLnB1c2goc3RhcnRpbmdCcmFuY2gpO1xuICAgICAgICB0aGlzLmFjdGl2ZUJyYW5jaGVzLmFkZChzdGFydGluZ0JyYW5jaCk7XG4gICAgICAgIHRoaXMub2xkQnJhbmNoZXMuYWRkKHN0YXJ0aW5nQnJhbmNoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldENsb3Nlc3RCcmFuY2gobGVhZjogTGVhZik6IEJyYW5jaCB8IG51bGwge1xuICAgICAgICBsZXQgY2xvc2VzdEJyYW5jaDogQnJhbmNoIHwgbnVsbCA9IG51bGw7XG4gICAgICAgIGxldCBjbG9zZXN0RGlzdGFuY2UgPSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFk7XG4gICAgICAgIHRoaXMuYWN0aXZlQnJhbmNoZXMuZm9yRWFjaCgoYnJhbmNoKSA9PiB7XG4gICAgICAgICAgICBpZiAoIWxlYWYuaW50ZXJzZWN0cyhicmFuY2gpKVxuICAgICAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICAgICAgLy8gTk9URTogSWYgYSBicmFuY2ggaGFzIDIgY2hpbGRyZW4gYWxyZWFkeSwgd2Ugb3VnaHQgbm90IGV4dHJ1ZGUgZnJvbSBpdCBmdXJ0aGVyLlxuICAgICAgICAgICAgLy8gQSB0cmkgb3IgZ3JlYXRlciBicmFuY2gganVuY3Rpb24gaXMgYm90aCBub3QgaW4ga2VlcGluZyB3aXRoIGEgdHlwaWNhbCB0cmVlIHN0cnVjdHVyZSwgYW5kIGNhbiByZXN1bHQgaW4gXG4gICAgICAgICAgICAvLyBpbmZpbml0ZSBncm93dGggbG9vcHMgd2hlcmUgYnJhbmNoIGdyb3d0aCBnZXRzIFwic3R1Y2tcIiBiZXR3ZWVuIHR3byBhdHRyYWN0aW5nIGxlYWZzLlxuICAgICAgICAgICAgaWYgKGJyYW5jaC5jaGlsZENvdW50ID49IDIpXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgICAgICBjb25zdCBkaXN0YW5jZVRvQnJhbmNoID0gYnJhbmNoLmRpc3RhbmNlVG8obGVhZik7XG4gICAgICAgICAgICBpZiAoZGlzdGFuY2VUb0JyYW5jaCA8IGNsb3Nlc3REaXN0YW5jZSkge1xuICAgICAgICAgICAgICAgIGNsb3Nlc3REaXN0YW5jZSA9IGRpc3RhbmNlVG9CcmFuY2g7XG4gICAgICAgICAgICAgICAgY2xvc2VzdEJyYW5jaCA9IGJyYW5jaDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGNsb3Nlc3RCcmFuY2g7XG4gICAgfVxuXG4gICAgcHVibGljIHN0ZXAoKSB7XG4gICAgICAgIHRoaXMuYnJhbmNoZXNMYXN0TGVuZ3RoID0gKHRoaXMuc3RlcENvdW50ID09IDAgPyAwIDogdGhpcy5icmFuY2hlcy5sZW5ndGgpO1xuICAgICAgICB0aGlzLnJlYWNoZWRMZWFmc0xhc3RMZW5ndGggPSB0aGlzLnJlYWNoZWRMZWFmcy5sZW5ndGg7XG5cbiAgICAgICAgY29uc3QgY3VycmVudFJlYWNoZWRMZWFmczogQXJyYXk8TGVhZj4gPSBbXTtcblxuICAgICAgICBjb25zdCBicmFuY2hUb0F0dHJhY3Rpb25WZWM6IE1hcDxCcmFuY2gsIFZlY3RvcjI+ID0gbmV3IE1hcCgpO1xuXG4gICAgICAgIC8vIGFwcGx5IGxlYWYgaW5mbHVlbmNlcyB0byBicmFuY2hlc1xuICAgICAgICB0aGlzLmFjdGl2ZUxlYWZzLmZvckVhY2goKGxlYWY6IExlYWYpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGNsb3Nlc3RCcmFuY2ggPSB0aGlzLmdldENsb3Nlc3RCcmFuY2gobGVhZik7XG4gICAgICAgICAgICBpZiAoIWNsb3Nlc3RCcmFuY2gpXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgICAgICBpZiAoY2xvc2VzdEJyYW5jaC5kaXN0YW5jZVRvKGxlYWYpIDwgKHRoaXMub3B0aW9ucy5icmFuY2hMZW5ndGgpKSB7XG4gICAgICAgICAgICAgICAgLy8gbGVhZiByZWFjaGVkIGJ5IGNsb3Nlc3QgYnJhbmNoXG5cbiAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZUxlYWZzLmRlbGV0ZShsZWFmKTtcbiAgICAgICAgICAgICAgICBsZWFmLnBhcmVudCA9IGNsb3Nlc3RCcmFuY2g7XG4gICAgICAgICAgICAgICAgY3VycmVudFJlYWNoZWRMZWFmcy5wdXNoKGxlYWYpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBsZWFmIG5vdCB5ZXQgcmVhY2hlZCwgYXBwbHkgYXR0cmFjdGlvbiB0byBjbG9zZXN0IGJyYW5jaFxuXG4gICAgICAgICAgICAgICAgY29uc3QgYXR0cmFjdGlvblZlYyA9IGxlYWYucG9zaXRpb24uc3VidHJhY3QoY2xvc2VzdEJyYW5jaC5lbmRQb3MpO1xuICAgICAgICAgICAgICAgIGJyYW5jaFRvQXR0cmFjdGlvblZlYy5zZXQoY2xvc2VzdEJyYW5jaCwgKGJyYW5jaFRvQXR0cmFjdGlvblZlYy5nZXQoY2xvc2VzdEJyYW5jaCkgPz8gVmVjdG9yMi5aZXJvKS5hZGRJblBsYWNlKGF0dHJhY3Rpb25WZWMpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gcmVtb3ZlIGlkbGUgYnJhbmNoZXMgKHRob3NlIHRoYXQgZGlkIG5vdCBncm93IHNpbmNlIGxhc3Qgc3RlcClcbiAgICAgICAgdGhpcy5vbGRCcmFuY2hlcy5mb3JFYWNoKChicmFuY2gpID0+IHtcbiAgICAgICAgICAgIGlmIChicmFuY2hUb0F0dHJhY3Rpb25WZWMuaGFzKGJyYW5jaCkpXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgdGhpcy5hY3RpdmVCcmFuY2hlcy5kZWxldGUoYnJhbmNoKTtcbiAgICAgICAgICAgIHRoaXMub2xkQnJhbmNoZXMuZGVsZXRlKGJyYW5jaCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIGdyb3cgYnJhbmNoZXMgdG93YXJkcyB0aGVpciBpbmZsdWVuY2VzXG4gICAgICAgIGJyYW5jaFRvQXR0cmFjdGlvblZlYy5mb3JFYWNoKChhdHRyYWN0aW9uVmVjOiBWZWN0b3IyLCBicmFuY2g6IEJyYW5jaCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZ3Jvd1ZlYzogVmVjdG9yMiA9IGF0dHJhY3Rpb25WZWMubm9ybWFsaXplKCkuc2NhbGVJblBsYWNlKHRoaXMub3B0aW9ucy5icmFuY2hMZW5ndGgpO1xuICAgICAgICAgICAgY29uc3QgdkZpbmFsR3Jvd3RoVmVjdG9yOiBWZWN0b3IyID0gdGhpcy5iaWFzR3Jvd3RoVmVjdG9yKGdyb3dWZWMpO1xuICAgICAgICAgICAgY29uc3QgbmV3QnJhbmNoOiBCcmFuY2ggPSBicmFuY2guZXh0cnVkZSh2RmluYWxHcm93dGhWZWN0b3IpO1xuXG4gICAgICAgICAgICB0aGlzLmJyYW5jaGVzLnB1c2gobmV3QnJhbmNoKTtcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlQnJhbmNoZXMuYWRkKG5ld0JyYW5jaCk7XG4gICAgICAgICAgICB0aGlzLm9sZEJyYW5jaGVzLmFkZChuZXdCcmFuY2gpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBvbmx5IG1hcmsgbGVhZnMgYXMgcmVhY2hlZCBpZiB0aGV5IGFyZSB0ZXJtaW5hbCBsZWFmcyAobm8gYnJhbmNoIGlzIGdyb3dpbmcgZnJvbSB0aGVtKVxuICAgICAgICBjdXJyZW50UmVhY2hlZExlYWZzLmZvckVhY2goKHBlbmRpbmdMZWFmID0+IHtcbiAgICAgICAgICAgIGlmIChwZW5kaW5nTGVhZi5wYXJlbnQ/LmNoaWxkQ291bnQgIT0gMClcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMucmVhY2hlZExlYWZzLnB1c2gocGVuZGluZ0xlYWYpO1xuICAgICAgICAgICAgdGhpcy5sZWFmcy5wdXNoKHBlbmRpbmdMZWFmKTtcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy50cmVlR2VuZXJhdG9yLm1hcmtMZWFmUmVhY2hlZCh0aGlzLm9wdGlvbnMuZGVwdGgsIHBlbmRpbmdMZWFmKTtcbiAgICAgICAgfSkpO1xuICAgICAgICBcbiAgICAgICAgLy8gc3RlcCBjb21wbGV0ZVxuICAgICAgICB0aGlzLnN0ZXBDb3VudCsrO1xuICAgIH1cblxuICAgIHB1YmxpYyBpc0ZpbmlzaGVkR3Jvd2luZygpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuICh0aGlzLnN0ZXBDb3VudCAhPSAwICYmIHRoaXMub2xkQnJhbmNoZXMuc2l6ZSA9PSAwKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0TmV3QnJhbmNoZXMoKTogQXJyYXk8QnJhbmNoPiB7XG4gICAgICAgIHJldHVybiB0aGlzLmJyYW5jaGVzLnNsaWNlKHRoaXMuYnJhbmNoZXNMYXN0TGVuZ3RoKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0TmV3TGVhZnMoKTogQXJyYXk8TGVhZj4ge1xuICAgICAgICByZXR1cm4gdGhpcy5yZWFjaGVkTGVhZnMuc2xpY2UodGhpcy5yZWFjaGVkTGVhZnNMYXN0TGVuZ3RoKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0TGVhZnMoKTogQXJyYXk8TGVhZj4geyByZXR1cm4gdGhpcy5sZWFmczsgfVxuICAgIHB1YmxpYyBnZXRCcmFuY2hlcygpOiBBcnJheTxCcmFuY2g+IHsgcmV0dXJuIHRoaXMuYnJhbmNoZXM7IH1cbiAgICBwdWJsaWMgZ2V0U3RlcENvdW50KCk6IG51bWJlciB7IHJldHVybiB0aGlzLnN0ZXBDb3VudDsgfVxuXG4gICAgcHVibGljIGdldCBzdGFydGluZ1BvaW50KCk6IFZlY3RvcjIgeyByZXR1cm4gdGhpcy5vcHRpb25zLm9yaWdpbjsgfVxuICAgIHB1YmxpYyBnZXQgc3RhcnRpbmdCcmFuY2goKTogQnJhbmNoIHwgbnVsbCB7XG4gICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnMucGFyZW50QnJhbmNoID8/IG51bGw7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdGVwQ291bnQ6IG51bWJlciA9IDA7XG5cbiAgICBwcml2YXRlIGJyYW5jaGVzTGFzdExlbmd0aDogbnVtYmVyID0gMDtcbiAgICBwcml2YXRlIGJyYW5jaGVzOiBCcmFuY2hbXSA9IFtdO1xuXG4gICAgcHJpdmF0ZSByZWFjaGVkTGVhZnNMYXN0TGVuZ3RoOiBudW1iZXIgPSAwO1xuICAgIHByaXZhdGUgbGVhZnM6IExlYWZbXSA9IFtdO1xuICAgIHByaXZhdGUgcmVhY2hlZExlYWZzOiBMZWFmW10gPSBbXTtcblxuICAgIHByaXZhdGUgYWN0aXZlTGVhZnM6IFNldDxMZWFmPiA9IG5ldyBTZXQoKTtcbiAgICBwcml2YXRlIGFjdGl2ZUJyYW5jaGVzOiBTZXQ8QnJhbmNoPiA9IG5ldyBTZXQoKTtcbiAgICBwcml2YXRlIG9sZEJyYW5jaGVzOiBTZXQ8QnJhbmNoPiA9IG5ldyBTZXQoKTtcblxuICAgIHByb3RlY3RlZCBvcHRpb25zOiBTcGFjZUNvbG9uaXplck9wdGlvbnM7XG59IiwiaW1wb3J0IHsgTGVhZiB9IGZyb20gXCIuL2NvbXBvbmVudHMvbGVhZi5qc1wiO1xuaW1wb3J0IHsgQnJhbmNoIH0gZnJvbSBcIi4vY29tcG9uZW50cy9icmFuY2guanNcIjtcbmltcG9ydCB7IFRyZWVQYXJ0LCBUcmVlUGFydENvbnRleHQgfSBmcm9tIFwiLi90cmVlUGFydHMvdHJlZVBhcnQuanNcIjtcbmltcG9ydCB7IFZlY3RvcjIgfSBmcm9tIFwiLi4vdXRpbHMvbGluZWFyL3ZlY3RvcjIuanNcIjtcbmltcG9ydCB7IENhbnZhc0hlbHBlciB9IGZyb20gXCIuLi91dGlscy9jYW52YXNIZWxwZXIuanNcIjtcbmltcG9ydCB7IFBSTkcgfSBmcm9tIFwiLi4vdXRpbHMvcmFuZG9tL3BybmcuanNcIjtcbmltcG9ydCB7IE1lcnNlbm5lVHdpc3RlckFkYXB0ZXIgfSBmcm9tIFwiLi4vdXRpbHMvcmFuZG9tL21lcnNlbm5lVHdpc3RlckFkYXB0ZXIuanNcIjtcbmltcG9ydCB7IEFuaW1hdGlvbkdyb3VwLCBBbmltYXRpb25TdGF0ZSwgc2V0QW5pbWF0aW9uVGltZW91dCwgc3RhcnRBbmltYXRpb24gfSBmcm9tIFwiLi4vdXRpbHMvYW5pbWF0aW9uSGVscGVyLmpzXCI7XG5pbXBvcnQgeyBUcmVlUGFydEdyb3dlciB9IGZyb20gXCIuL3RyZWVQYXJ0cy90ZWVQYXJ0R3Jvd2VyLmpzXCI7XG5pbXBvcnQgeyBUcmVlUGFydExlYWYgfSBmcm9tIFwiLi90cmVlUGFydHMvdHJlZVBhcnRMZWFmLmpzXCI7XG5pbXBvcnQgeyBzZXRBbmltYXRpb25JbnRlcnZhbCB9IGZyb20gXCIuLi91dGlscy9hbmltYXRpb25IZWxwZXIuanNcIjtcblxuZXhwb3J0IGludGVyZmFjZSBUcmVlR2VuZXJhdG9yT3B0aW9ucyB7XG4gICAgZGVidWdnaW5nPzogYm9vbGVhbjtcbiAgICByZW5kZXJTY2FsaW5nPzogbnVtYmVyO1xuICAgIHNlZWQ6IG51bWJlcjtcbiAgICBwYXJlbnRDb250YWluZXI6IEhUTUxEaXZFbGVtZW50O1xuICAgIHNlcmlhbGl6ZWRKU09OPzogUmVjb3JkPHN0cmluZywgYW55Pjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJVHJlZUdlbmVyYXRvclBhcmFtZXRlcnMge1xuICAgIGFwcGVuZEVsZW1lbnQoZGl2OiBIVE1MRWxlbWVudCwgZ3Jvd1dpdGhUcmVlPzogYm9vbGVhbik6IHZvaWQ7XG4gICAgbWFya0xlYWZSZWFjaGVkKGRlcHRoOiBudW1iZXIsIGxlYWY6IExlYWYpOiB2b2lkO1xuXG4gICAgZ2V0UFJORyh0eXBlOiAnR1JPVycgfCAnRFJBVycpOiBQUk5HO1xuXG4gICAgZ2V0QW5pbWF0aW9uR3JvdXAoKTogQW5pbWF0aW9uR3JvdXA7XG4gICAgXG4gICAgZ2V0UmVuZGVyU2NhbGluZygpOiBudW1iZXI7XG4gICAgZ2V0T3V0bGluZVRoaWNrbmVzcygpOiBudW1iZXI7XG4gICAgZ2V0VGVtcENhbnZhcyhpZHg6IG51bWJlcik6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRDtcbiAgICBnZXRMZWFmU3RlbmNpbFRleHR1cmUoKTogSFRNTEltYWdlRWxlbWVudDtcbiAgICBnZXRMZWFmT3V0bGluZVRleHR1cmUoKTogSFRNTEltYWdlRWxlbWVudDtcbiAgICBnZXRMZWFmVGV4dHVyZVBhdHRlcm4oeE9mZnNldDogbnVtYmVyLCB5T2Zmc2V0OiBudW1iZXIpOiBDYW52YXNQYXR0ZXJuO1xuICAgIGdldEJyYW5jaFRleHR1cmVQYXR0ZXJuKGdyb3d0aDogVmVjdG9yMiwgdGV4dHVyZU5hbWU/OiBzdHJpbmcpOiBDYW52YXNQYXR0ZXJuO1xuICAgIGdldEJyYW5jaFdpZHRoKGJyYW5jaDogQnJhbmNoKTogbnVtYmVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFRyZWVHZW5lcmF0b3JDb250ZXh0IHtcbiAgICBkZWJ1Z2dpbmc6IGJvb2xlYW47XG4gICAgaXNQbGF5YmFjazogYm9vbGVhbjtcbiAgICBzZXJpYWxpemVkVmFsdWVzOiBSZWNvcmQ8c3RyaW5nLCBhbnk+O1xuICAgIHNlcmlhbGl6ZWRJZHhLZXk6IG51bWJlcjtcbn1cblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFRyZWVHZW5lcmF0b3IgaW1wbGVtZW50cyBJVHJlZUdlbmVyYXRvclBhcmFtZXRlcnMge1xuICAgIHByb3RlY3RlZCBjb25zdHJ1Y3RvcihvcHRpb25zOiBUcmVlR2VuZXJhdG9yT3B0aW9ucykge1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgICAgICB0aGlzLnBhcmVudENvbnRhaW5lciA9IHRoaXMub3B0aW9ucy5wYXJlbnRDb250YWluZXI7XG5cbiAgICAgICAgdGhpcy5teUNvbnRleHQgPSB7XG4gICAgICAgICAgICBpc1BsYXliYWNrOiBvcHRpb25zLnNlcmlhbGl6ZWRKU09OICE9IG51bGwsXG4gICAgICAgICAgICBzZXJpYWxpemVkVmFsdWVzOiBvcHRpb25zLnNlcmlhbGl6ZWRKU09OID8/IHt9LFxuICAgICAgICAgICAgc2VyaWFsaXplZElkeEtleTogMCxcbiAgICAgICAgICAgIGRlYnVnZ2luZzogdGhpcy5vcHRpb25zLmRlYnVnZ2luZyA/PyBmYWxzZSxcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnRyZWVQYXJ0Q29udGV4dCA9IHtcbiAgICAgICAgICAgIC4uLnRoaXMubXlDb250ZXh0LFxuICAgICAgICAgICAgdHJlZUdlbmVyYXRvcjogdGhpc1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gaGllcmFyY2h5IG9mIHRyYW5zZm9ybSBkaXZzXG4gICAgICAgIHRoaXMuY29udGFpbmVyQmFzZSA9IHRoaXMuY3JlYXRlVHJhbnNmb3JtQ29udGFpbmVyRGl2KCk7XG4gICAgICAgIHRoaXMuY29udGFpbmVyVHJhbnNmb3JtU2NhbGVUcmVlUGFydHMgPSB0aGlzLmNyZWF0ZVRyYW5zZm9ybUNvbnRhaW5lckRpdigpO1xuICAgICAgICB0aGlzLmNvbnRhaW5lclRyYW5zZm9ybUFsaWdubWVudCA9IHRoaXMuY3JlYXRlVHJhbnNmb3JtQ29udGFpbmVyRGl2KCk7XG5cbiAgICAgICAgdGhpcy5jb250YWluZXJCYXNlLmFwcGVuZCh0aGlzLmNvbnRhaW5lclRyYW5zZm9ybVNjYWxlVHJlZVBhcnRzKTtcbiAgICAgICAgdGhpcy5jb250YWluZXJUcmFuc2Zvcm1BbGlnbm1lbnQuYXBwZW5kKHRoaXMuY29udGFpbmVyQmFzZSk7XG5cbiAgICAgICAgdGhpcy5wYXJlbnRDb250YWluZXIuYXBwZW5kKHRoaXMuY29udGFpbmVyVHJhbnNmb3JtQWxpZ25tZW50KTtcblxuICAgICAgICAvLyBzZXR1cCBQUk5HJ3NcbiAgICAgICAgaWYgKG9wdGlvbnMuc2VyaWFsaXplZEpTT04pXG4gICAgICAgICAgICB0aGlzLm15Q29udGV4dC5zZXJpYWxpemVkVmFsdWVzID0gb3B0aW9ucy5zZXJpYWxpemVkSlNPTjtcblxuICAgICAgICB0aGlzLnBybmdzLkRSQVcuaW5pdCh0aGlzLm9wdGlvbnMuc2VlZCk7XG4gICAgICAgIHRoaXMucHJuZ3MuR1JPVy5pbml0KHRoaXMub3B0aW9ucy5zZWVkKTtcblxuICAgICAgICAvLyBwZXJmb3JtIGluaXRpYWwgcmVzaXplIHRvIHBhcmVudCBjb250YWluZXJcbiAgICAgICAgdGhpcy5yZXNpemVUb0NvbnRhaW5lcigpO1xuXG4gICAgICAgIC8vIHNldHVwIHJlc2l6ZSBldmVudCBmb3IgZnV0dXJlIHdpbmRvdyByZXNpemVzXG4gICAgICAgIHRoaXMucmVzaXplRXZlbnRMaXN0ZW5lciA9IHRoaXMucmVzaXplVG9Db250YWluZXIuYmluZCh0aGlzKTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMucmVzaXplRXZlbnRMaXN0ZW5lcik7XG4gICAgfVxuXG4gICAgcHVibGljIHNoYWtlKCkge1xuICAgICAgICBjb25zdCBjdyA9IHRoaXMuZ2V0UFJORygnRFJBVycpLnJhbmRvbSgpID4gMC41O1xuICAgICAgICB0aGlzLnRyZWVQYXJ0c1xuICAgICAgICAgICAgLmZpbHRlcih0cmVlUGFydCA9PiB0cmVlUGFydC5kZXB0aCA+PSAwKVxuICAgICAgICAgICAgLmZvckVhY2godHJlZVBhcnQgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHNoYWtlRGVsYXkgPSB0aGlzLmdldFBSTkcoJ0RSQVcnKS5mbG9hdEluUmFuZ2UoMCwgMTIwMCk7XG4gICAgICAgICAgICAgICAgdGhpcy5hbmltYXRpb25Hcm91cC5hZGRBbmltYXRpb24oXG4gICAgICAgICAgICAgICAgICAgIHNldEFuaW1hdGlvblRpbWVvdXQoe1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2s6ICgpID0+ICg8VHJlZVBhcnRMZWFmPnRyZWVQYXJ0KS5zaGFrZShjdyksXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lOiBzaGFrZURlbGF5XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHVibGljIGFzeW5jIGdyb3coKSB7XG4gICAgICAgIHdoaWxlICghdGhpcy5kZXN0cm95ZWQgJiYgIXRoaXMuaXNGaW5pc2hlZEdyb3dpbmcpIHtcbiAgICAgICAgICAgIHRoaXMuZ3Jvd1N0ZXAoKTtcbiAgICAgICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIDEpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgY3JlYXRlVHJhbnNmb3JtQ29udGFpbmVyRGl2KCk6IEhUTUxEaXZFbGVtZW50IHtcbiAgICAgICAgY29uc3QgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgZWwuc3R5bGUud2lkdGggPSAnMTAwJSc7XG4gICAgICAgIGVsLnN0eWxlLmhlaWdodCA9ICcxMDAlJztcbiAgICAgICAgZWwuc3R5bGUubGVmdCA9ICcwcHgnO1xuICAgICAgICBlbC5zdHlsZS50b3AgPSAnMHB4JztcbiAgICAgICAgZWwuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgICAgICBlbC5zdHlsZS50cmFuc2Zvcm1PcmlnaW4gPSAndG9wIGxlZnQnO1xuICAgICAgICByZXR1cm4gZWw7XG4gICAgfVxuXG4gICAgcHVibGljIGZhZGVBbmltYXRpb24oKSB7XG4gICAgICAgIHRoaXMudHJlZVBhcnRzLmZvckVhY2goKHRyZWVQYXJ0KSA9PiB7XG4gICAgICAgICAgICB0cmVlUGFydC5mYWRlSW4oKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHVibGljIGdyb3dBbmltYXRpb24oKSB7XG4gICAgICAgIHRoaXMuY29udGFpbmVyVHJhbnNmb3JtU2NhbGVUcmVlUGFydHMuc3R5bGUudHJhbnNmb3JtT3JpZ2luID0gJzUwJSA5MCUnOyAvLzkwJSwgYXNzdW1pbmcgdmVydGljYWwgb2Zmc2V0IGZvciBhIHBvdCBvciBvdGhlciBvYnNjdXJpbmcgb2JqZWN0XG4gICAgICAgIHRoaXMuYW5pbWF0aW9uR3JvdXAuYWRkQW5pbWF0aW9uKFxuICAgICAgICAgICAgc3RhcnRBbmltYXRpb24oe1xuICAgICAgICAgICAgICAgIGFuaW1hdGU6ICh0OiBudW1iZXIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZW5kVGltZSA9IDUwMDA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHZhbCA9IE1hdGgubWF4KDAsIE1hdGgubWluKDEsICh0KSAvIChlbmRUaW1lKSkpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbnRhaW5lclRyYW5zZm9ybVNjYWxlVHJlZVBhcnRzLnN0eWxlLnNjYWxlID0gdmFsICsgJyc7XG4gICAgICAgICAgICAgICAgICAgIGlmICh2YWwgPj0gMSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBBbmltYXRpb25TdGF0ZS5ET05FO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgIClcbiAgICB9XG5cbiAgICBwdWJsaWMgZGVzdHJveSgpIHtcbiAgICAgICAgdGhpcy5kZXN0cm95ZWQgPSB0cnVlO1xuXG4gICAgICAgIHRoaXMuY29udGFpbmVyQmFzZS5yZW1vdmUoKTtcbiAgICAgICAgdGhpcy5hbmltYXRpb25Hcm91cC5jYW5jZWwoKTtcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMucmVzaXplRXZlbnRMaXN0ZW5lcik7XG4gICAgfVxuXG4gICAgcHVibGljIGFwcGVuZEVsZW1lbnQoZGl2OiBIVE1MRWxlbWVudCwgZ3JvdXBlZFdpdGhUcmVlUGFydHM6IGJvb2xlYW4gPSB0cnVlKSB7XG4gICAgICAgIGlmIChncm91cGVkV2l0aFRyZWVQYXJ0cylcbiAgICAgICAgICAgIHRoaXMuY29udGFpbmVyVHJhbnNmb3JtU2NhbGVUcmVlUGFydHMuYXBwZW5kKGRpdik7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRoaXMuY29udGFpbmVyQmFzZS5hcHBlbmQoZGl2KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHJlc2l6ZVRvQ29udGFpbmVyKCkge1xuICAgICAgICBjb25zdCBvdXRlckNvbnRhaW5lckhlaWdodCA9IHRoaXMucGFyZW50Q29udGFpbmVyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmhlaWdodDtcbiAgICAgICAgY29uc3QgaW50ZXJuYWxTaXplID0gVHJlZUdlbmVyYXRvci5SRUZFUkVOQ0VfSEVJR0hUO1xuICAgICAgICBjb25zdCBzY2FsZVkgPSBvdXRlckNvbnRhaW5lckhlaWdodCAvIGludGVybmFsU2l6ZTtcblxuICAgICAgICB0aGlzLmNvbnRhaW5lckJhc2Uuc3R5bGUud2lkdGggPSBgJHtpbnRlcm5hbFNpemV9cHhgO1xuICAgICAgICB0aGlzLmNvbnRhaW5lckJhc2Uuc3R5bGUuaGVpZ2h0ID0gYCR7aW50ZXJuYWxTaXplfXB4YDtcbiAgICAgICAgdGhpcy5jb250YWluZXJCYXNlLnN0eWxlLnRyYW5zZm9ybSA9IGBzY2FsZSgke3NjYWxlWX0pYDtcblxuICAgICAgICB0aGlzLmNvbnRhaW5lclRyYW5zZm9ybUFsaWdubWVudC5zdHlsZS53aWR0aCA9IGAke2ludGVybmFsU2l6ZSAqIHNjYWxlWX1weGA7XG4gICAgICAgIHRoaXMuY29udGFpbmVyVHJhbnNmb3JtQWxpZ25tZW50LnN0eWxlLmhlaWdodCA9IGAke2ludGVybmFsU2l6ZSAqIHNjYWxlWX1weGA7XG5cbiAgICAgICAgdGhpcy5jb250YWluZXJUcmFuc2Zvcm1BbGlnbm1lbnQuc3R5bGUudG9wID0gJzBweCc7XG4gICAgICAgIHRoaXMuY29udGFpbmVyVHJhbnNmb3JtQWxpZ25tZW50LnN0eWxlLmxlZnQgPSAnNTAlJztcbiAgICAgICAgdGhpcy5jb250YWluZXJUcmFuc2Zvcm1BbGlnbm1lbnQuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgtNTAlLCAwKSc7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIG9uRmluaXNoZWRHcm93aW5nKCkgeyBcbiAgICAgICAgdGhpcy5hbmltYXRpb25Hcm91cC5hZGRBbmltYXRpb24oXG4gICAgICAgICAgICBzZXRBbmltYXRpb25JbnRlcnZhbCh7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2s6ICgpID0+IHRoaXMuc2hha2UoKSxcbiAgICAgICAgICAgICAgICB0aW1lOiAyMDAwXG4gICAgICAgICAgICB9KVxuICAgICAgICApO1xuXG4gICAgICAgIHRoaXMudHJlZVBhcnRzXG4gICAgICAgICAgICAuZm9yRWFjaCh0cmVlUGFydCA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCEodHJlZVBhcnQgaW5zdGFuY2VvZiBUcmVlUGFydEdyb3dlcikpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB0cmVlUGFydC5jbGlwKCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICBjb25zb2xlLmxvZyhgR3Jvd2luZyBjb21wbGV0ZWQuYCk7XG4gICAgfVxuXG4gICAgcHVibGljIGdldFJlbmRlclNjYWxpbmcoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMub3B0aW9ucy5yZW5kZXJTY2FsaW5nID8/IDE7IH1cblxuICAgIHB1YmxpYyBhYnN0cmFjdCBnZXRPdXRsaW5lVGhpY2tuZXNzKCk6IG51bWJlcjtcblxuICAgIHB1YmxpYyBhYnN0cmFjdCBnZXRCcmFuY2hUZXh0dXJlUGF0dGVybihncm93dGg6IFZlY3RvcjIsIHRleHR1cmVOYW1lPzogc3RyaW5nKTogQ2FudmFzUGF0dGVybjtcblxuICAgIHB1YmxpYyBhYnN0cmFjdCBnZXRMZWFmU3RlbmNpbFRleHR1cmUoKTogSFRNTEltYWdlRWxlbWVudDtcblxuICAgIHB1YmxpYyBhYnN0cmFjdCBnZXRMZWFmT3V0bGluZVRleHR1cmUoKTogSFRNTEltYWdlRWxlbWVudDtcblxuICAgIHB1YmxpYyBhYnN0cmFjdCBnZXRMZWFmVGV4dHVyZVBhdHRlcm4oKTogQ2FudmFzUGF0dGVybjtcblxuICAgIHB1YmxpYyBhYnN0cmFjdCBtYXJrTGVhZlJlYWNoZWQoZGVwdGg6IG51bWJlciwgbGVhZjogTGVhZik6IHZvaWQ7XG5cbiAgICBwdWJsaWMgYWJzdHJhY3QgZ2V0QnJhbmNoV2lkdGgoYnJhbmNoOiBCcmFuY2gpOiBudW1iZXI7XG5cbiAgICBwdWJsaWMgZ3Jvd1N0ZXAoKSB7XG4gICAgICAgIGNvbnNvbGUuYXNzZXJ0KCF0aGlzLmlzRmluaXNoZWRHcm93aW5nKTtcblxuICAgICAgICAvLyBjaGVjayBpZiBhbGwgcGFydHMgYW5kIHRoZXJlZm9yZSB0aGUgdHJlZSBhcmUgZmluaXNoZWQgZ3Jvd2luZ1xuICAgICAgICB0aGlzLmlzRmluaXNoZWRHcm93aW5nID0gdGhpcy50cmVlUGFydHMuZXZlcnkoKHRyZWVQYXJ0KSA9PiAhKHRyZWVQYXJ0IGluc3RhbmNlb2YgVHJlZVBhcnRHcm93ZXIpIHx8IHRyZWVQYXJ0LmlzRmluaXNoZWRHcm93aW5nKCkpO1xuICAgICAgICBpZiAodGhpcy5pc0ZpbmlzaGVkR3Jvd2luZykge1xuICAgICAgICAgICAgdGhpcy5vbkZpbmlzaGVkR3Jvd2luZygpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gZ3JvdyBpbmRpdmlkdWFsIHRyZWUtcGFydHNcbiAgICAgICAgdGhpcy50cmVlUGFydHMuZm9yRWFjaCh0cmVlUGFydCA9PiB7XG4gICAgICAgICAgICBpZiAoISh0cmVlUGFydCBpbnN0YW5jZW9mIFRyZWVQYXJ0R3Jvd2VyKSkge1xuICAgICAgICAgICAgICAgIHRyZWVQYXJ0LmRyYXcoKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmICh0cmVlUGFydC5pc0ZpbmlzaGVkR3Jvd2luZygpKVxuICAgICAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICAgICAgdHJlZVBhcnQuc3RlcCgpO1xuICAgICAgICAgICAgdHJlZVBhcnQuZHJhdygpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0VGVtcENhbnZhcyhpZHg6IG51bWJlcik6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCB7XG4gICAgICAgIGNvbnN0IGN0eCA9IHRoaXMudGVtcENhbnZhc1tpZHhdO1xuICAgICAgICBjdHguY2xlYXJSZWN0KDAsIDAsIGN0eC5jYW52YXMud2lkdGgsIGN0eC5jYW52YXMuaGVpZ2h0KTtcbiAgICAgICAgcmV0dXJuIGN0eDtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0U2VyaWFsaXplZEpTT04oKTogc3RyaW5nIHtcbiAgICAgICAgdGhpcy50cmVlUGFydHMuZm9yRWFjaCh0cmVlUGFydCA9PiB7XG4gICAgICAgICAgICB0cmVlUGFydC5zZXJpYWxpemUoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh0aGlzLm15Q29udGV4dC5zZXJpYWxpemVkVmFsdWVzKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgaXNTZXJpYWxpemVkUGxheWJhY2soKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiAodGhpcy5vcHRpb25zLnNlcmlhbGl6ZWRKU09OICE9PSB1bmRlZmluZWQpO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRQUk5HKHR5cGU6ICdHUk9XJyB8ICdEUkFXJykge1xuICAgICAgICByZXR1cm4gdGhpcy5wcm5nc1t0eXBlXTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0QW5pbWF0aW9uR3JvdXAoKTogQW5pbWF0aW9uR3JvdXAge1xuICAgICAgICByZXR1cm4gdGhpcy5hbmltYXRpb25Hcm91cDtcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IFJFRkVSRU5DRV9IRUlHSFQ6IG51bWJlciA9IDEwMjQ7XG5cbiAgICBwcml2YXRlIHJlc2l6ZUV2ZW50TGlzdGVuZXI6ICgpID0+IHZvaWQ7XG5cbiAgICBwcm90ZWN0ZWQgdHJlZVBhcnRzOiBBcnJheTxUcmVlUGFydD4gPSBbXTtcblxuICAgIHByaXZhdGUgcHJuZ3MgPSB7XG4gICAgICAgICdHUk9XJzogbmV3IE1lcnNlbm5lVHdpc3RlckFkYXB0ZXIoKSxcbiAgICAgICAgJ0RSQVcnOiBuZXcgTWVyc2VubmVUd2lzdGVyQWRhcHRlcigpXG4gICAgfTtcblxuICAgIHByaXZhdGUgbXlDb250ZXh0OiBUcmVlR2VuZXJhdG9yQ29udGV4dDtcbiAgICBwcm90ZWN0ZWQgdHJlZVBhcnRDb250ZXh0OiBUcmVlUGFydENvbnRleHQ7XG4gICAgXG4gICAgcHJpdmF0ZSBkZXN0cm95ZWQ6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAgIHByaXZhdGUgYW5pbWF0aW9uR3JvdXA6IEFuaW1hdGlvbkdyb3VwID0gbmV3IEFuaW1hdGlvbkdyb3VwKCk7XG4gICAgXG4gICAgcHJvdGVjdGVkIGlzRmluaXNoZWRHcm93aW5nOiBib29sZWFuID0gZmFsc2U7XG4gICAgcHJpdmF0ZSBwYXJlbnRDb250YWluZXI6IEhUTUxEaXZFbGVtZW50O1xuXG4gICAgcHJpdmF0ZSBjb250YWluZXJCYXNlOiBIVE1MRGl2RWxlbWVudDtcbiAgICBwcml2YXRlIGNvbnRhaW5lclRyYW5zZm9ybUFsaWdubWVudDogSFRNTERpdkVsZW1lbnQ7XG4gICAgcHJpdmF0ZSBjb250YWluZXJUcmFuc2Zvcm1TY2FsZVRyZWVQYXJ0czogSFRNTERpdkVsZW1lbnQ7XG5cbiAgICBwcml2YXRlIHRlbXBDYW52YXM6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRFtdID0gbmV3IEFycmF5KDMpLmZpbGwobnVsbCkubWFwKHggPT4gQ2FudmFzSGVscGVyLmNyZWF0ZVRlbXBDYW52YXMoMjAwLCAyMDApKTtcbiAgICBwcml2YXRlIG9wdGlvbnM6IFRyZWVHZW5lcmF0b3JPcHRpb25zO1xufVxuIiwiaW1wb3J0IHtWZWN0b3IyfSBmcm9tIFwiLi4vLi4vdXRpbHMvbGluZWFyL3ZlY3RvcjJcIjtcbmltcG9ydCB7VHJlZUdlbmVyYXRvcn0gZnJvbSBcIi4uL3RyZWVHZW5lcmF0b3JcIjtcbmltcG9ydCB7Q2FudmFzTGF5ZXIsIFRyZWVQYXJ0LCBUcmVlUGFydENvbnRleHQsIFRyZWVQYXJ0T3B0aW9uc30gZnJvbSBcIi4vdHJlZVBhcnRcIjtcblxuZXhwb3J0IGludGVyZmFjZSBTdGF0aWNUcmVlUGFydE9wdGlvbnMgZXh0ZW5kcyBUcmVlUGFydE9wdGlvbnMge1xuICAgIGltYWdlOiBIVE1MSW1hZ2VFbGVtZW50LFxufVxuZXhwb3J0IGludGVyZmFjZSBTdGF0aWNUcmVlUGFydEZhY3RvcnlPcHRpb25zIHtcbiAgICBjb250ZXh0OiBUcmVlUGFydENvbnRleHQsXG4gICAgekluZGV4OiBudW1iZXIsIFxuICAgIHBvczogVmVjdG9yMiwgXG4gICAgaW1hZ2U6IEhUTUxJbWFnZUVsZW1lbnQsXG4gICAgZGVwdGg6IG51bWJlclxufVxuXG5leHBvcnQgY2xhc3MgU3RhdGljVHJlZVBhcnQgZXh0ZW5kcyBUcmVlUGFydCB7XG4gICAgcHVibGljIHN0YXRpYyBmcm9tSW1hZ2Uob3B0aW9uczogU3RhdGljVHJlZVBhcnRGYWN0b3J5T3B0aW9ucyk6IFN0YXRpY1RyZWVQYXJ0IHtcbiAgICAgICAgcmV0dXJuIG5ldyBTdGF0aWNUcmVlUGFydCh7XG4gICAgICAgICAgICBjb250ZXh0OiBvcHRpb25zLmNvbnRleHQsXG4gICAgICAgICAgICBpbWFnZTogb3B0aW9ucy5pbWFnZSxcbiAgICAgICAgICAgIHBvc2l0aW9uOiBvcHRpb25zLnBvcyxcbiAgICAgICAgICAgIHNpemU6IG5ldyBWZWN0b3IyKG9wdGlvbnMuaW1hZ2Uud2lkdGgsIG9wdGlvbnMuaW1hZ2UuaGVpZ2h0KSxcbiAgICAgICAgICAgIG9yaWdpbjogb3B0aW9ucy5wb3MsXG4gICAgICAgICAgICBkZXB0aDogb3B0aW9ucy5kZXB0aCxcbiAgICAgICAgICAgIHpJbmRleDogb3B0aW9ucy56SW5kZXgsXG4gICAgICAgICAgICBncm93V2l0aFRyZWU6IGZhbHNlXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKG9wdGlvbnM6IFN0YXRpY1RyZWVQYXJ0T3B0aW9ucykge1xuICAgICAgICBzdXBlcihvcHRpb25zKTtcbiAgICAgICAgdGhpcy5zdGF0aWNPcHRpb25zID0gb3B0aW9ucztcblxuICAgICAgICB0aGlzLmltZ0xheWVyID0gdGhpcy5jcmVhdGVDYW52YXNMYXllcigpO1xuICAgIH1cbiAgICBwcm90ZWN0ZWQgZHJhd0xheWVycygpIHtcbiAgICAgICAgaWYgKHRoaXMuZHJhd24pXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIHRoaXMuZHJhd1dpdGhUcmFuc2Zvcm0odGhpcy5pbWdMYXllci5jYW52YXMsIChjdHgpID0+IHRoaXMuZHJhd0ltZ0xheWVyKGN0eCkpO1xuICAgICAgICB0aGlzLmRyYXduID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGRyYXdJbWdMYXllcihjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCkge1xuICAgICAgICBjdHguZHJhd0ltYWdlKHRoaXMuc3RhdGljT3B0aW9ucy5pbWFnZSwgMCwgMCwgdGhpcy5vcHRpb25zLnNpemUueCwgdGhpcy5vcHRpb25zLnNpemUueSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdGF0aWNPcHRpb25zOiBTdGF0aWNUcmVlUGFydE9wdGlvbnM7XG5cbiAgICBwcml2YXRlIGRyYXduOiBib29sZWFuID0gZmFsc2U7XG4gICAgXG4gICAgcHJpdmF0ZSBpbWdMYXllcjogQ2FudmFzTGF5ZXI7XG59IiwiaW1wb3J0IHsgQnJhbmNoIH0gZnJvbSBcIi4uL2NvbXBvbmVudHMvYnJhbmNoLmpzXCI7XG5pbXBvcnQgeyBCcmFuY2hHcm93ZXIgfSBmcm9tIFwiLi4vYnJhbmNoR3Jvd2VyLmpzXCJcbmltcG9ydCB7IFRyZWVQYXJ0LCBUcmVlUGFydE9wdGlvbnMsIENhbnZhc0xheWVyIH0gZnJvbSBcIi4vdHJlZVBhcnQuanNcIjtcbmltcG9ydCB7IExlYWYgfSBmcm9tIFwiLi4vY29tcG9uZW50cy9sZWFmLmpzXCI7XG5pbXBvcnQgeyBWZWN0b3IyIH0gZnJvbSBcIi4uLy4uL3V0aWxzL2xpbmVhci92ZWN0b3IyLmpzXCI7XG5cblxuZXhwb3J0IGNsYXNzIFRyZWVQYXJ0R3Jvd2VyIGV4dGVuZHMgVHJlZVBhcnQge1xuICAgIHB1YmxpYyBjb25zdHJ1Y3RvcihvcHRpb25zOiBUcmVlUGFydE9wdGlvbnMpIHtcbiAgICAgICAgc3VwZXIob3B0aW9ucyk7XG4gICAgICAgIHRoaXMuYm91bmRzTWluUG9zID0gbmV3IFZlY3RvcjIoTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZLCBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkpO1xuICAgICAgICB0aGlzLmJvdW5kc01heFBvcyA9IG5ldyBWZWN0b3IyKE51bWJlci5ORUdBVElWRV9JTkZJTklUWSwgTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZKTtcblxuICAgICAgICB0aGlzLmJyYW5jaExheWVyID0gdGhpcy5jcmVhdGVDYW52YXNMYXllcigpO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXQgYnJhbmNoR3Jvd2VyKHZhbHVlOiBCcmFuY2hHcm93ZXIpIHtcbiAgICAgICAgdGhpcy5fYnJhbmNoR3Jvd2VyID0gdmFsdWU7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBicmFuY2hHcm93ZXIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9icmFuY2hHcm93ZXIhO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgc3RhcnRpbmdCcmFuY2hXaWR0aCgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5fc3RhcnRpbmdCcmFuY2hXaWR0aDtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBnZXQgYnJhbmNoZXMoKTogQnJhbmNoW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5icmFuY2hHcm93ZXI/LmdldEJyYW5jaGVzKCkgPz8gW107XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBsZWFmcygpOiBMZWFmW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5icmFuY2hHcm93ZXI/LmdldExlYWZzKCkgPz8gW107XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXJ0KCkge1xuICAgICAgICBjb25zdCBzdGFydGluZ0JyYW5jaCA9IHRoaXMuYnJhbmNoR3Jvd2VyPy5zdGFydGluZ0JyYW5jaDtcbiAgICAgICAgdGhpcy5fc3RhcnRpbmdCcmFuY2hXaWR0aCA9IHN0YXJ0aW5nQnJhbmNoPy5icmFuY2hXaWR0aCA/PyAwO1xuXG4gICAgICAgIGNvbnNvbGUuYXNzZXJ0KHRoaXMuYnJhbmNoR3Jvd2VyKTtcbiAgICAgICAgdGhpcy5icmFuY2hHcm93ZXI/LnN0YXJ0KCk7XG4gICAgfVxuXG4gICAgcHVibGljIHN0ZXAoKSB7XG4gICAgICAgIHRoaXMuYnJhbmNoR3Jvd2VyPy5zdGVwKCk7XG4gICAgICAgIHRoaXMuYnJhbmNoR3Jvd2VyPy5nZXROZXdCcmFuY2hlcygpPy5mb3JFYWNoKChicmFuY2gpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHBvcyA9IGJyYW5jaC5lbmRQb3M7XG5cbiAgICAgICAgICAgIHRoaXMuYm91bmRzTWluUG9zLnggPSBNYXRoLm1pbihwb3MueCwgdGhpcy5ib3VuZHNNaW5Qb3MueCk7XG4gICAgICAgICAgICB0aGlzLmJvdW5kc01pblBvcy55ID0gTWF0aC5taW4ocG9zLnksIHRoaXMuYm91bmRzTWluUG9zLnkpO1xuXG4gICAgICAgICAgICB0aGlzLmJvdW5kc01heFBvcy54ID0gTWF0aC5tYXgocG9zLngsIHRoaXMuYm91bmRzTWF4UG9zLngpO1xuICAgICAgICAgICAgdGhpcy5ib3VuZHNNYXhQb3MueSA9IE1hdGgubWF4KHBvcy55LCB0aGlzLmJvdW5kc01heFBvcy55KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKHRoaXMuYnJhbmNoR3Jvd2VyPy5pc0ZpbmlzaGVkR3Jvd2luZygpKVxuICAgICAgICAgICAgdGhpcy5vbkZpbmlzaGVkR3Jvd2luZygpO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBvbkZpbmlzaGVkR3Jvd2luZygpIHtcblxuICAgIH1cblxuICAgIHB1YmxpYyBpc0ZpbmlzaGVkR3Jvd2luZygpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYnJhbmNoR3Jvd2VyPy5pc0ZpbmlzaGVkR3Jvd2luZygpID8/IGZhbHNlO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBhZnRlckRyYXdMYXllcnMoKTogdm9pZCB7XG4gICAgICAgIHN1cGVyLmFmdGVyRHJhd0xheWVycygpO1xuICAgIH1cblxuICAgIHB1YmxpYyBjbGlwKCkge1xuICAgICAgICB0aGlzLm9mZnNldEJvdW5kcyh7bWluUG9zOiB0aGlzLmJvdW5kc01pblBvcywgbWF4UG9zOiB0aGlzLmJvdW5kc01heFBvc30pO1xuICAgIH1cblxuICAgIHByaXZhdGUgZHJhd0JyYW5jaGVzKGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEKSB7XG4gICAgICAgIHRoaXMuYnJhbmNoR3Jvd2VyPy5nZXROZXdCcmFuY2hlcygpPy5mb3JFYWNoKChicmFuY2gpID0+IFxuICAgICAgICAgICAgYnJhbmNoLmRyYXcoY3R4KVxuICAgICAgICApO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBkcmF3TGF5ZXJzKCkge1xuICAgICAgICB0aGlzLmRyYXdXaXRoVHJhbnNmb3JtKHRoaXMuYnJhbmNoTGF5ZXIuY2FudmFzLCAoY3R4KSA9PiB0aGlzLmRyYXdCcmFuY2hlcyhjdHgpKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgX2JyYW5jaEdyb3dlcj86IEJyYW5jaEdyb3dlcjtcblxuICAgIHByaXZhdGUgX3N0YXJ0aW5nQnJhbmNoV2lkdGg6IG51bWJlciA9IDA7XG5cbiAgICBwcml2YXRlIGJyYW5jaExheWVyOiBDYW52YXNMYXllcjtcblxuICAgIHByaXZhdGUgYm91bmRzTWluUG9zOiBWZWN0b3IyO1xuICAgIHByaXZhdGUgYm91bmRzTWF4UG9zOiBWZWN0b3IyO1xufSIsImltcG9ydCB7IElUcmVlR2VuZXJhdG9yUGFyYW1ldGVycywgVHJlZUdlbmVyYXRvciwgVHJlZUdlbmVyYXRvckNvbnRleHQgfSBmcm9tIFwiLi4vdHJlZUdlbmVyYXRvci5qc1wiO1xuaW1wb3J0IHsgc3RhcnRBbmltYXRpb24sIEFuaW1hdGlvblN0YXRlLCBBbmltYXRpb24gfSBmcm9tIFwiLi4vLi4vdXRpbHMvYW5pbWF0aW9uSGVscGVyLmpzXCI7XG5pbXBvcnQgeyBWZWN0b3IyIH0gZnJvbSBcIi4uLy4uL3V0aWxzL2xpbmVhci92ZWN0b3IyLmpzXCI7XG5cblxuZXhwb3J0IGludGVyZmFjZSBDYW52YXNMYXllciB7XG4gICAgdWlkOiBudW1iZXI7XG4gICAgY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBUcmVlUGFydE9wdGlvbnMge1xuICAgIHBvc2l0aW9uOiBWZWN0b3IyLFxuICAgIHNpemU6IFZlY3RvcjIsXG4gICAgcGFyZW50PzogVHJlZVBhcnQ7XG4gICAgb3ZlcmRyYXdXaWR0aD86IG51bWJlcjtcbiAgICBkZXB0aD86IG51bWJlcjtcbiAgICBvcmlnaW46IFZlY3RvcjI7XG4gICAgekluZGV4PzogbnVtYmVyO1xuICAgIGdyb3dXaXRoVHJlZT86IGJvb2xlYW47XG4gICAgZmFkZUluPzogYm9vbGVhbjtcbiAgICBjb250ZXh0OiBUcmVlUGFydENvbnRleHRcbn1cblxuZXhwb3J0IGludGVyZmFjZSBUcmVlUGFydENvbnRleHQgZXh0ZW5kcyBUcmVlR2VuZXJhdG9yQ29udGV4dCB7XG4gICAgdHJlZUdlbmVyYXRvcjogSVRyZWVHZW5lcmF0b3JQYXJhbWV0ZXJzO1xufVxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgVHJlZVBhcnQge1xuICAgIHByb3RlY3RlZCBjb25zdHJ1Y3RvcihvcHRpb25zOiBUcmVlUGFydE9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcblxuICAgICAgICB0aGlzLm9yaWdpbmFsUG9zaXRpb24gPSB0aGlzLm9wdGlvbnMucG9zaXRpb24uY2xvbmUoKTtcblxuICAgICAgICB0aGlzLmNvbnRhaW5lckRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICB0aGlzLmNvbnRhaW5lckRpdi5zdHlsZS50b3VjaEFjdGlvbiA9ICdub25lJztcbiAgICAgICAgdGhpcy5jb250YWluZXJEaXYuc3R5bGUucG9pbnRlckV2ZW50cyA9ICdub25lJztcbiAgICAgICAgaWYgKG9wdGlvbnMuY29udGV4dC5kZWJ1Z2dpbmcpIHtcbiAgICAgICAgICAgIHRoaXMuY29udGFpbmVyRGl2LnN0eWxlLmJvcmRlciA9ICcxcHggc29saWQgYmxhY2snO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jYW52YXNEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgdGhpcy5jYW52YXNEaXYuc3R5bGUucG9pbnRlckV2ZW50cyA9ICdub25lJztcbiAgICAgICAgdGhpcy5jYW52YXNEaXYuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgICAgICB0aGlzLmNhbnZhc0Rpdi5zdHlsZS5sZWZ0ID0gJzBweCc7XG4gICAgICAgIHRoaXMuY2FudmFzRGl2LnN0eWxlLnRvcCA9ICcwcHgnO1xuICAgICAgICB0aGlzLmNhbnZhc0Rpdi5zdHlsZS53aWR0aCA9ICcxMDAlJztcbiAgICAgICAgdGhpcy5jYW52YXNEaXYuc3R5bGUuaGVpZ2h0ID0gJzEwMCUnO1xuXG4gICAgICAgIHRoaXMuc2V0Q29udGFpbmVyRGl2QXR0cmlidXRlcygpO1xuXG4gICAgICAgIHRoaXMuY29udGFpbmVyRGl2LmFwcGVuZENoaWxkKHRoaXMuY2FudmFzRGl2KTtcblxuICAgICAgICBpZiAob3B0aW9ucy5wYXJlbnQpIHtcbiAgICAgICAgICAgIG9wdGlvbnMucGFyZW50LmNvbnRhaW5lci5hcHBlbmQodGhpcy5jb250YWluZXJEaXYpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgb3B0aW9ucy5jb250ZXh0LnRyZWVHZW5lcmF0b3IuYXBwZW5kRWxlbWVudCh0aGlzLmNvbnRhaW5lckRpdiwgb3B0aW9ucy5ncm93V2l0aFRyZWUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBkZXB0aCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5vcHRpb25zLmRlcHRoID8/IDA7IH1cbiAgICBcbiAgICBwdWJsaWMgZ2V0IHBvc2l0aW9uKCk6IFZlY3RvcjIgeyByZXR1cm4gdGhpcy5vcHRpb25zLnBvc2l0aW9uOyB9XG4gICAgcHVibGljIGdldCBzaXplKCk6IFZlY3RvcjIgeyByZXR1cm4gdGhpcy5vcHRpb25zLnNpemU7IH1cblxuICAgIHByaXZhdGUgZ2V0IGNvbnRhaW5lcigpOiBIVE1MRWxlbWVudCB7IHJldHVybiB0aGlzLmNhbnZhc0RpdjsgfVxuXG4gICAgcHVibGljIGdldCBwb3NpdGlvbkdsb2JhbCgpOiBWZWN0b3IyIHsgXG4gICAgICAgIHJldHVybiAodGhpcy5vcHRpb25zLnBhcmVudCA/IHRoaXMub3B0aW9ucy5wYXJlbnQhLnBvc2l0aW9uR2xvYmFsIDogVmVjdG9yMi5aZXJvKS5hZGQodGhpcy5vcmlnaW5hbFBvc2l0aW9uKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgaW5pdCgpIHtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5mYWRlSW4gJiYgdGhpcy5vcHRpb25zLmNvbnRleHQuaXNQbGF5YmFjaylcbiAgICAgICAgICAgIHRoaXMuZmFkZUluKCk7XG4gICAgfVxuXG4gICAgcHVibGljIGlzVGVybWluYWwoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZmFkZUluKCkge1xuICAgICAgICBjb25zdCBhbmltYXRpb25Hcm91cCA9IHRoaXMub3B0aW9ucy5jb250ZXh0LnRyZWVHZW5lcmF0b3IuZ2V0QW5pbWF0aW9uR3JvdXAoKTtcblxuICAgICAgICAvLyBmYWRlIGluIGxlYWZzIGFuZCBicmFuY2hlc1xuICAgICAgICB0aGlzLmNhbnZhc0xheWVycy5mb3JFYWNoKGNhbnZhc0xheWVyID0+IHtcbiAgICAgICAgICAgIGNvbnN0IEZBREVfRU5EX1RJTUU6IG51bWJlciA9IDUwMDtcbiAgICAgICAgICAgIGNvbnN0IGNhbnZhcyA9IGNhbnZhc0xheWVyLmNhbnZhcztcbiAgICAgICAgICAgIGNhbnZhcy5zdHlsZS5vcGFjaXR5ID0gJzAuMDAnO1xuXG4gICAgICAgICAgICBhbmltYXRpb25Hcm91cC5hZGRBbmltYXRpb24oXG4gICAgICAgICAgICAgICAgc3RhcnRBbmltYXRpb24oe1xuICAgICAgICAgICAgICAgICAgICBhbmltYXRlOiAodDogbnVtYmVyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB2YWwgPSBNYXRoLm1pbigxLCBNYXRoLm1heCgwLCB0IC8gRkFERV9FTkRfVElNRSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FudmFzLnN0eWxlLm9wYWNpdHkgPSB2YWwrJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodmFsID49IDEpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEFuaW1hdGlvblN0YXRlLkRPTkU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgY3JlYXRlQ2FudmFzTGF5ZXIoKTogQ2FudmFzTGF5ZXIge1xuICAgICAgICBjb25zdCBsYXllckRhdGEgPSB7XG4gICAgICAgICAgICB1aWQ6IHRoaXMub3B0aW9ucy5jb250ZXh0LnNlcmlhbGl6ZWRJZHhLZXkrKyxcbiAgICAgICAgICAgIGRpcnR5OiBmYWxzZSxcbiAgICAgICAgICAgIGNhbnZhczogdGhpcy5jcmVhdGVDYW52YXMoKVxuICAgICAgICB9O1xuXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuY29udGV4dC5pc1BsYXliYWNrKSB7XG4gICAgICAgICAgICBjb25zdCBjdHggPSBsYXllckRhdGEuY2FudmFzLmdldENvbnRleHQoXCIyZFwiKSE7XG4gICAgICAgICAgICBjb25zdCBpbWFnZSA9IG5ldyBJbWFnZSgpO1xuICAgICAgICAgICAgY29uc3Qgc2VyaWFsaXplZFZhbHVlID0gPHN0cmluZz50aGlzLm9wdGlvbnMuY29udGV4dC5zZXJpYWxpemVkVmFsdWVzW2xheWVyRGF0YS51aWRdO1xuICAgICAgICAgICAgaW1hZ2Uub25sb2FkID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIGN0eC5kcmF3SW1hZ2UoaW1hZ2UsIDAsIDAsIGN0eC5jYW52YXMud2lkdGgsIGN0eC5jYW52YXMuaGVpZ2h0KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpZiAoc2VyaWFsaXplZFZhbHVlKVxuICAgICAgICAgICAgICAgIGltYWdlLnNyYyA9IDxzdHJpbmc+c2VyaWFsaXplZFZhbHVlO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jYW52YXNMYXllcnMucHVzaChsYXllckRhdGEpO1xuICAgICAgICB0aGlzLmNhbnZhc0Rpdi5hcHBlbmRDaGlsZChsYXllckRhdGEuY2FudmFzKTtcblxuICAgICAgICByZXR1cm4gbGF5ZXJEYXRhO1xuICAgIH1cbiAgICBcbiAgICBwcml2YXRlIGNyZWF0ZUNhbnZhcygpOiBIVE1MQ2FudmFzRWxlbWVudCB7XG4gICAgICAgIGNvbnN0IHJlbmRlclNjYWxhciA9IHRoaXMub3B0aW9ucy5jb250ZXh0LnRyZWVHZW5lcmF0b3IuZ2V0UmVuZGVyU2NhbGluZygpO1xuICAgICAgICBjb25zdCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICAgICAgY2FudmFzLnNldEF0dHJpYnV0ZSgnd2lkdGgnLCAodGhpcy5vcHRpb25zLnNpemUueCArIFRyZWVQYXJ0LkNBTlZBU19CVUZGRVJfTUFSR0lOKSAqIHJlbmRlclNjYWxhciArICcnKTtcbiAgICAgICAgY2FudmFzLnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgKHRoaXMub3B0aW9ucy5zaXplLnkgKyAgVHJlZVBhcnQuQ0FOVkFTX0JVRkZFUl9NQVJHSU4pICogcmVuZGVyU2NhbGFyICsgJycpO1xuICAgICAgICBjYW52YXMuc3R5bGUucG9pbnRlckV2ZW50cyA9ICdub25lJztcbiAgICAgICAgY2FudmFzLnN0eWxlLndpZHRoID0gdGhpcy5vcHRpb25zLnNpemUueCArIFRyZWVQYXJ0LkNBTlZBU19CVUZGRVJfTUFSR0lOICsgJ3B4JztcbiAgICAgICAgY2FudmFzLnN0eWxlLmhlaWdodCA9IHRoaXMub3B0aW9ucy5zaXplLnkgKyBUcmVlUGFydC5DQU5WQVNfQlVGRkVSX01BUkdJTiArICdweCc7XG4gICAgICAgIGNhbnZhcy5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgICAgIGNhbnZhcy5zdHlsZS5sZWZ0ID0gKFRyZWVQYXJ0LkNBTlZBU19CVUZGRVJfTUFSR0lOICogLTAuNSkgKyAncHgnO1xuICAgICAgICBjYW52YXMuc3R5bGUudG9wID0gKFRyZWVQYXJ0LkNBTlZBU19CVUZGRVJfTUFSR0lOICogLTAuNSkgKyAncHgnO1xuICAgICAgICByZXR1cm4gY2FudmFzO1xuICAgIH1cblxuICAgIHByaXZhdGUgcGl4ZWxzVG9SZWxhdGl2ZSh4OiBudW1iZXIsIHk6IG51bWJlcik6IFZlY3RvcjIge1xuICAgICAgICByZXR1cm4gbmV3IFZlY3RvcjIoXG4gICAgICAgICAgICB4IC8gdGhpcy5vcHRpb25zLnNpemUueCxcbiAgICAgICAgICAgIHkgLyB0aGlzLm9wdGlvbnMuc2l6ZS55XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzZXRDb250YWluZXJEaXZBdHRyaWJ1dGVzKCkge1xuICAgICAgICB0aGlzLmNvbnRhaW5lckRpdi5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgICAgIHRoaXMuY29udGFpbmVyRGl2LnN0eWxlLmxlZnQgPSB0aGlzLm9wdGlvbnMucG9zaXRpb24ueCArICdweCc7XG4gICAgICAgIHRoaXMuY29udGFpbmVyRGl2LnN0eWxlLnRvcCA9IHRoaXMub3B0aW9ucy5wb3NpdGlvbi55ICsgJ3B4JztcbiAgICAgICAgdGhpcy5jb250YWluZXJEaXYuc3R5bGUud2lkdGggPSB0aGlzLm9wdGlvbnMuc2l6ZS54ICsgJ3B4JztcbiAgICAgICAgdGhpcy5jb250YWluZXJEaXYuc3R5bGUuaGVpZ2h0ID0gdGhpcy5vcHRpb25zLnNpemUueSArICdweCc7XG4gICAgICAgIHRoaXMuY29udGFpbmVyRGl2LnN0eWxlLnpJbmRleCA9ICh0aGlzLm9wdGlvbnMuekluZGV4ID8/IDApICsgJyc7XG4gICAgICAgIHRoaXMuY29udGFpbmVyRGl2LnN0eWxlLmJveFNpemluZyA9ICdib3JkZXItYm94JztcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5vcmlnaW4gJiYgIXRoaXMuY29udGFpbmVyRGl2LnN0eWxlLnRyYW5zZm9ybU9yaWdpbikge1xuICAgICAgICAgICAgY29uc3QgdHJhbnNmb3JtT3JpZ2luID0gdGhpcy5waXhlbHNUb1JlbGF0aXZlKHRoaXMub3B0aW9ucy5vcmlnaW4ueCwgdGhpcy5vcHRpb25zLm9yaWdpbi55KTtcbiAgICAgICAgICAgIHRoaXMuY2FudmFzRGl2LnN0eWxlLnRyYW5zZm9ybU9yaWdpbiA9IGBcbiAgICAgICAgICAgICAgICAke3RyYW5zZm9ybU9yaWdpbi54ICogMTAwICsgJyUnfVxuICAgICAgICAgICAgICAgICR7dHJhbnNmb3JtT3JpZ2luLnkgKiAxMDAgKyAnJSd9XG4gICAgICAgICAgICBgO1xuICAgICAgICAgICAgdGhpcy5jYW52YXNEaXYuc3R5bGUudHJhbnNmb3JtID0gYHJvdGF0ZSgke3RoaXMuYmFzZUFuZ2xlfXJhZClgO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGRyYXdXaXRoVHJhbnNmb3JtKGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQsIGZ1bmM6IChjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCkgPT4gdm9pZCkge1xuICAgICAgICBjb25zdCBjdHggPSA8Q2FudmFzUmVuZGVyaW5nQ29udGV4dDJEPmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICBjb25zdCBzY2FsYXIgPSB0aGlzLm9wdGlvbnMuY29udGV4dC50cmVlR2VuZXJhdG9yLmdldFJlbmRlclNjYWxpbmcoKTtcbiAgICAgICAgY3R4LnNhdmUoKTtcbiAgICAgICAge1xuICAgICAgICAgICAgY3R4LnNjYWxlKHNjYWxhciwgc2NhbGFyKTtcbiAgICAgICAgICAgIC8vIGN0eC50cmFuc2xhdGUoLXRoaXMub3B0aW9ucy5wb3NpdGlvbi54LCAtdGhpcy5vcHRpb25zLnBvc2l0aW9uLnkpO1xuICAgICAgICAgICAgY3R4LnRyYW5zbGF0ZShUcmVlUGFydC5DQU5WQVNfQlVGRkVSX01BUkdJTiAqIDAuNSwgVHJlZVBhcnQuQ0FOVkFTX0JVRkZFUl9NQVJHSU4gKiAwLjUpO1xuICAgICAgICAgICAgZnVuYyhjdHgpO1xuICAgICAgICB9XG4gICAgICAgIGN0eC5yZXN0b3JlKCk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGFic3RyYWN0IGRyYXdMYXllcnMoKTogdm9pZDtcblxuICAgIHByb3RlY3RlZCBhZnRlckRyYXdMYXllcnMoKSB7XG5cbiAgICB9XG5cbiAgICBwdWJsaWMgc2hha2UoY3c6IGJvb2xlYW4pIHtcbiAgICAgICAgaWYgKHRoaXMuc2hha2luZ0FuaW1hdGlvbilcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICBjb25zdCBhbmltYXRpb25Hcm91cCA9IHRoaXMub3B0aW9ucy5jb250ZXh0LnRyZWVHZW5lcmF0b3IuZ2V0QW5pbWF0aW9uR3JvdXAoKTtcblxuICAgICAgICBjb25zdCBTSEFLRV9USU1FOiBudW1iZXIgPSB0aGlzLm9wdGlvbnMuY29udGV4dC50cmVlR2VuZXJhdG9yLmdldFBSTkcoJ0RSQVcnKS5mbG9hdEluUmFuZ2UoNTAwMCwgMTAwMDApO1xuICAgICAgICBjb25zdCBNQVhfQU5HTEU6IG51bWJlciA9IHRoaXMub3B0aW9ucy5jb250ZXh0LnRyZWVHZW5lcmF0b3IuZ2V0UFJORygnRFJBVycpLmZsb2F0SW5SYW5nZSgwLjUsIDEpO1xuXG4gICAgICAgIHRoaXMuc2hha2luZ0FuaW1hdGlvbiA9IGFuaW1hdGlvbkdyb3VwLmFkZEFuaW1hdGlvbihcbiAgICAgICAgICAgIHN0YXJ0QW5pbWF0aW9uKHtcbiAgICAgICAgICAgICAgICBhbmltYXRlOiAodDogbnVtYmVyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHRhcmdldEFuZ2xlID0gTUFYX0FOR0xFICogKGN3ID8gMSA6IC0xKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jYW52YXNEaXYuc3R5bGUudHJhbnNmb3JtID0gYHJvdGF0ZSgke3RoaXMuYmFzZUFuZ2xlICsgdGFyZ2V0QW5nbGUgKiBNYXRoLnBvdyhNYXRoLnNpbihNYXRoLlBJICogMiAqICh0IC8gU0hBS0VfVElNRSkpLCAzKX1kZWcpYDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHQgPj0gU0hBS0VfVElNRSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBBbmltYXRpb25TdGF0ZS5ET05FO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgb25Eb25lOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2hha2luZ0FuaW1hdGlvbiA9IG51bGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZHJhdygpIHtcbiAgICAgICAgdGhpcy5kcmF3TGF5ZXJzKCk7XG4gICAgICAgIHRoaXMuYWZ0ZXJEcmF3TGF5ZXJzKCk7XG4gICAgfVxuXG4gICAgcHVibGljIHNlcmlhbGl6ZSgpIHtcbiAgICAgICAgdGhpcy5jYW52YXNMYXllcnMuZm9yRWFjaCgobGF5ZXIpID0+IHtcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5jb250ZXh0LnNlcmlhbGl6ZWRWYWx1ZXNbbGF5ZXIudWlkXSA9IGxheWVyLmNhbnZhcy50b0RhdGFVUkwoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIG9mZnNldEJvdW5kcyhuZXdCb3VuZHM6IHttaW5Qb3M6IFZlY3RvcjIsIG1heFBvczogVmVjdG9yMn0pIHtcbiAgICAgICAgY29uc3QgeERpZmYgPSBuZXdCb3VuZHMubWluUG9zLnhcbiAgICAgICAgY29uc3QgeURpZmYgPSBuZXdCb3VuZHMubWluUG9zLnlcbiAgICAgICAgY29uc3Qgd2lkdGggPSBNYXRoLmFicyhuZXdCb3VuZHMubWF4UG9zLnggLSBuZXdCb3VuZHMubWluUG9zLngpO1xuICAgICAgICBjb25zdCBoZWlnaHQgPSBNYXRoLmFicyhuZXdCb3VuZHMubWF4UG9zLnkgLSBuZXdCb3VuZHMubWluUG9zLnkpO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5wb3NpdGlvbi54ICs9IG5ld0JvdW5kcy5taW5Qb3MueDtcbiAgICAgICAgdGhpcy5wb3NpdGlvbi55ICs9IG5ld0JvdW5kcy5taW5Qb3MueTtcbiAgICAgICAgdGhpcy5zaXplLnggPSB3aWR0aDtcbiAgICAgICAgdGhpcy5zaXplLnkgPSBoZWlnaHQ7XG4gICAgICAgIFxuICAgICAgICB0aGlzLmNhbnZhc0Rpdi5zdHlsZS5sZWZ0ID0gLXhEaWZmICsgJ3B4JztcbiAgICAgICAgdGhpcy5jYW52YXNEaXYuc3R5bGUudG9wID0gLXlEaWZmICsgJ3B4JztcbiAgICAgICAgXG4gICAgICAgIHRoaXMuc2V0Q29udGFpbmVyRGl2QXR0cmlidXRlcygpO1xuICAgIH1cblxuICAgIHByaXZhdGUgc3RhdGljIENBTlZBU19CVUZGRVJfTUFSR0lOOiBudW1iZXIgPSAzMDA7XG5cbiAgICBwcm90ZWN0ZWQgc2hha2luZ0FuaW1hdGlvbjogQW5pbWF0aW9uIHwgbnVsbCA9IG51bGw7XG5cbiAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgb3B0aW9uczogVHJlZVBhcnRPcHRpb25zO1xuXG4gICAgcHJvdGVjdGVkIGNvbnRhaW5lckRpdjogSFRNTERpdkVsZW1lbnQ7XG4gICAgcHJvdGVjdGVkIGNhbnZhc0RpdjogSFRNTERpdkVsZW1lbnQ7XG5cbiAgICBwcml2YXRlIG9yaWdpbmFsUG9zaXRpb246IFZlY3RvcjI7XG5cbiAgICBwcml2YXRlIGJhc2VBbmdsZTogbnVtYmVyID0gMDtcblxuICAgIHByaXZhdGUgY2FudmFzTGF5ZXJzOiBBcnJheTxDYW52YXNMYXllcj4gPSBbXTtcbn0iLCJpbXBvcnQgeyBUcmVlUGFydEdyb3dlciB9IGZyb20gXCIuL3RlZVBhcnRHcm93ZXIuanNcIjtcblxuZXhwb3J0IGNsYXNzIFRyZWVQYXJ0SW50ZXIgZXh0ZW5kcyBUcmVlUGFydEdyb3dlciB7XG4gICAgcHVibGljIGlzVGVybWluYWwoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59IiwiaW1wb3J0IHsgVHJlZUdlbmVyYXRvciB9IGZyb20gXCIuLi90cmVlR2VuZXJhdG9yLmpzXCI7XG5pbXBvcnQgeyBMZWFmIH0gZnJvbSAgXCIuLi9jb21wb25lbnRzL2xlYWYuanNcIjtcbmltcG9ydCB7IHN0YXJ0QW5pbWF0aW9uLCBzZXRBbmltYXRpb25UaW1lb3V0LCBBbmltYXRpb25TdGF0ZSwgQW5pbWF0aW9uIH0gZnJvbSBcIi4uLy4uL3V0aWxzL2FuaW1hdGlvbkhlbHBlci5qc1wiO1xuaW1wb3J0IHsgQ2FudmFzTGF5ZXIsIFRyZWVQYXJ0T3B0aW9ucyB9IGZyb20gXCIuL3RyZWVQYXJ0LmpzXCI7XG5pbXBvcnQgeyBUcmVlUGFydEdyb3dlciB9IGZyb20gXCIuL3RlZVBhcnRHcm93ZXIuanNcIjtcblxuXG5leHBvcnQgY2xhc3MgVHJlZVBhcnRMZWFmIGV4dGVuZHMgVHJlZVBhcnRHcm93ZXIge1xuICAgIHB1YmxpYyBjb25zdHJ1Y3RvcihvcHRpb25zOiBUcmVlUGFydE9wdGlvbnMpIHtcbiAgICAgICAgc3VwZXIob3B0aW9ucyk7XG5cbiAgICAgICAgdGhpcy5sZWFmTGF5ZXIgPSB0aGlzLmNyZWF0ZUNhbnZhc0xheWVyKCk7XG5cbiAgICAgICAgdGhpcy5jb250YWluZXJEaXYuc3R5bGUuY3Vyc29yID0gJ2dyYWInO1xuXG4gICAgICAgIHRoaXMudXBkYXRlUG9pbnRlclByb3BlcnR5KCk7XG5cbiAgICAgICAgdGhpcy5zZXR1cENsaWNrKCk7XG4gICAgfVxuXG4gICAgcHVibGljIGlzVGVybWluYWwoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXR1cENsaWNrKCkge1xuICAgICAgICB0aGlzLmNvbnRhaW5lckRpdi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKSA9PiB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBpZiAoIXRoaXMuaXNGaW5pc2hlZEdyb3dpbmcoKSB8fCAhdGhpcy5pc1Rlcm1pbmFsKCkpXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgICAgICB0aGlzLmRyb3BSYW5kb21MZWFmcyggMSArIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqICgzICsgMSkpKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHVibGljIHNoYWtlKGN3OiBib29sZWFuKSB7XG4gICAgICAgIGlmICh0aGlzLmRyYWdnaW5nIHx8IHRoaXMuc3ByaW5nQW5pbWF0aW9uIHx8IHRoaXMubGVhZkNsdXN0ZXJEcm9wcGluZylcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICBzdXBlci5zaGFrZShjdyk7XG4gICAgfVxuXG4gICAgcHVibGljIGRyb3BSYW5kb21MZWFmcyhsZWFmQ291bnQ6IG51bWJlcikge1xuICAgICAgICBjb25zdCBwcm5nID0gdGhpcy5vcHRpb25zLmNvbnRleHQudHJlZUdlbmVyYXRvci5nZXRQUk5HKCdEUkFXJyk7XG4gICAgICAgIGNvbnN0IGxlYWZzID0gdGhpcy5icmFuY2hHcm93ZXIuZ2V0TGVhZnMoKTtcbiAgICAgICAgaWYgKCFsZWFmcy5sZW5ndGgpXG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZWFmQ291bnQ7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgbGVhZiA9IGxlYWZzW3BybmcuaW50SW5SYW5nZSgwLCBsZWFmcy5sZW5ndGggLSAxKV07XG4gICAgICAgICAgICB0aGlzLmRyb3BMZWFmKGxlYWYpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBkcm9wTGVhZihsZWFmOiBMZWFmLCBkcm9wRGVsYXk/OiBudW1iZXIpIHtcbiAgICAgICAgY29uc29sZS5hc3NlcnQodGhpcy5pc0ZpbmlzaGVkR3Jvd2luZygpKTtcbiAgICAgICAgY29uc3QgYW5pbWF0aW9uR3JvdXAgPSB0aGlzLm9wdGlvbnMuY29udGV4dC50cmVlR2VuZXJhdG9yLmdldEFuaW1hdGlvbkdyb3VwKCk7XG4gICAgICAgIGNvbnN0IGxlYWZFbGVtZW50ID0gbGVhZi5jcmVhdGVFbGVtZW50KCk7XG4gICAgICAgIGxlYWZFbGVtZW50LnN0eWxlLnpJbmRleCA9IHRoaXMuY29udGFpbmVyRGl2LnN0eWxlLnpJbmRleDtcbiAgICAgICAgY29uc3Qgc3RhcnRZID0gcGFyc2VGbG9hdChsZWFmRWxlbWVudC5zdHlsZS50b3ApO1xuICAgICAgICBjb25zdCBzcGVlZCA9IHRoaXMub3B0aW9ucy5jb250ZXh0LnRyZWVHZW5lcmF0b3IuZ2V0UFJORygnRFJBVycpLmZsb2F0SW5SYW5nZSgyMDAsIDMwMCk7XG5cbiAgICAgICAgY29uc3QgRkFERV9USU1FX1NFQ09ORFM6IG51bWJlciA9IDE7XG4gICAgICAgIGNvbnN0IEZBREVfRU5EX1k6IG51bWJlciA9IChUcmVlR2VuZXJhdG9yLlJFRkVSRU5DRV9IRUlHSFQpO1xuICAgICAgICBjb25zdCBGQURFX1NUQVJUX1kgPSBGQURFX0VORF9ZIC0gKHNwZWVkIC8gRkFERV9USU1FX1NFQ09ORFMpO1xuXG4gICAgICAgIGFuaW1hdGlvbkdyb3VwLmFkZEFuaW1hdGlvbihcbiAgICAgICAgICAgIHNldEFuaW1hdGlvblRpbWVvdXQoe1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbkdyb3VwLmFkZEFuaW1hdGlvbihcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0QW5pbWF0aW9uKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRlOiAodDogbnVtYmVyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5ld1k6IG51bWJlciA9IChzdGFydFkgKyAodCAvIDEwMDApICogc3BlZWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3WSA+IEZBREVfRU5EX1kpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlYWZFbGVtZW50LnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEFuaW1hdGlvblN0YXRlLkRPTkU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGVhZkVsZW1lbnQuc3R5bGUub3BhY2l0eSA9IE1hdGgubWF4KDAsIChGQURFX0VORF9ZIC0gbmV3WSkgLyAoRkFERV9FTkRfWSAtIEZBREVfU1RBUlRfWSkpICsgJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlYWZFbGVtZW50LnN0eWxlLnRvcCA9IG5ld1kgKyAncHgnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0aW1lOiBkcm9wRGVsYXkgPz8gMFxuICAgICAgICAgICAgfSlcbiAgICAgICAgKTtcblxuICAgICAgICBhbmltYXRpb25Hcm91cC5hZGRBbmltYXRpb24oXG4gICAgICAgICAgICBzdGFydEFuaW1hdGlvbih7XG4gICAgICAgICAgICAgICAgYW5pbWF0ZTogKHQ6IG51bWJlcikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBvcGFjaXR5ID0gTWF0aC5taW4oMS4wLCAodCAvIDIwMCkpO1xuICAgICAgICAgICAgICAgICAgICBsZWFmRWxlbWVudC5zdHlsZS5vcGFjaXR5ID0gb3BhY2l0eSArICcnO1xuICAgICAgICAgICAgICAgICAgICBpZiAob3BhY2l0eSA+PSAxLjApXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gQW5pbWF0aW9uU3RhdGUuRE9ORTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICApO1xuXG4gICAgICAgIHRoaXMub3B0aW9ucy5jb250ZXh0LnRyZWVHZW5lcmF0b3IuYXBwZW5kRWxlbWVudChsZWFmRWxlbWVudCk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGRyYXdMYXllcnMoKSB7XG4gICAgICAgIHN1cGVyLmRyYXdMYXllcnMoKTtcblxuICAgICAgICB0aGlzLmRyYXdXaXRoVHJhbnNmb3JtKHRoaXMubGVhZkxheWVyLmNhbnZhcywgKGN0eCkgPT4gdGhpcy5kcmF3TGVhZnMoY3R4LCB0aGlzLmxlYWZMYXllcikpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZHJhd0xlYWZzKGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCBsYXllcjogQ2FudmFzTGF5ZXIpIHtcbiAgICAgICAgaWYgKCF0aGlzLmlzVGVybWluYWwoKSlcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IG5ld0xlYWZzID0gdGhpcy5icmFuY2hHcm93ZXIuZ2V0TmV3TGVhZnMoKTtcbiAgICAgICAgY29uc3Qgcm90YXRlZExlYWZDb3VudDogbnVtYmVyID0gdGhpcy5vcHRpb25zLmNvbnRleHQudHJlZUdlbmVyYXRvci5nZXRQUk5HKCdHUk9XJykuaW50SW5SYW5nZSgxLCAyKTtcblxuICAgICAgICBuZXdMZWFmcy5mb3JFYWNoKChsZWFmOiBMZWFmKSA9PiB7XG4gICAgICAgICAgICBsZWFmLmRyYXcoY3R4KTtcblxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCByb3RhdGVkTGVhZkNvdW50OyBpKyspIHtcbiAgICAgICAgICAgICAgICBjb25zdCByb3RhdGVkTGVhZiA9IGxlYWYuY2xvbmUoKVxuICAgICAgICAgICAgICAgIHJvdGF0ZWRMZWFmLmRyYXcoY3R4KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIG9uRmluaXNoZWRHcm93aW5nKCkge1xuICAgICAgICBzdXBlci5vbkZpbmlzaGVkR3Jvd2luZygpO1xuICAgICAgICB0aGlzLnVwZGF0ZVBvaW50ZXJQcm9wZXJ0eSgpO1xuICAgIH1cblxuICAgIHByaXZhdGUgdXBkYXRlUG9pbnRlclByb3BlcnR5KCkge1xuICAgICAgICBpZiAoIXRoaXMubGVhZkNsdXN0ZXJEcm9wcGluZyAmJiB0aGlzLmlzRmluaXNoZWRHcm93aW5nKCkpIHtcbiAgICAgICAgICAgIHRoaXMuY29udGFpbmVyRGl2LnN0eWxlLnBvaW50ZXJFdmVudHMgPSAnYXV0byc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmNvbnRhaW5lckRpdi5zdHlsZS5wb2ludGVyRXZlbnRzID0gJ25vbmUnO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBsZWFmTGF5ZXI6IENhbnZhc0xheWVyO1xuXG4gICAgcHJpdmF0ZSBzcHJpbmdBbmltYXRpb246IEFuaW1hdGlvbiB8IG51bGwgPSBudWxsO1xuXG4gICAgcHJpdmF0ZSBkcmFnZ2luZzogYm9vbGVhbiA9IGZhbHNlO1xuXG4gICAgcHJpdmF0ZSBsZWFmQ2x1c3RlckRyb3BwaW5nOiBib29sZWFuID0gZmFsc2U7XG59IiwiaW1wb3J0IHtUcmVlR2VuZXJhdG9yLCBUcmVlR2VuZXJhdG9yT3B0aW9uc30gZnJvbSBcIi4uLy4uL3RyZWVHZW5lcmF0b3IuanNcIjtcbmltcG9ydCB7VmVjdG9yMn0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL2xpbmVhci92ZWN0b3IyLmpzXCI7XG5pbXBvcnQge1NwYWNlQ29sb25pemVyfSBmcm9tIFwiLi4vLi4vc3BhY2VDb2xvbml6ZXIuanNcIjtcbmltcG9ydCB7QnJhbmNoLCBCcmFuY2hPcHRpb25zfSBmcm9tIFwiLi4vLi4vY29tcG9uZW50cy9icmFuY2guanNcIjtcbmltcG9ydCB7TGVhZiwgTGVhZk9wdGlvbnN9IGZyb20gXCIuLi8uLi9jb21wb25lbnRzL2xlYWYuanNcIjtcbmltcG9ydCB7Q2FudmFzSGVscGVyfSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvY2FudmFzSGVscGVyLmpzXCI7XG5pbXBvcnQge01ldGFiYWxsU3VyZmFjZX0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL21ldGFiYWxscy5qc1wiO1xuaW1wb3J0IHtzZXRBbmltYXRpb25JbnRlcnZhbH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL2FuaW1hdGlvbkhlbHBlci5qc1wiO1xuaW1wb3J0IHtUcmVlUGFydExlYWZ9IGZyb20gXCIuLi8uLi90cmVlUGFydHMvdHJlZVBhcnRMZWFmLmpzXCI7XG5pbXBvcnQge1RyZWVQYXJ0SW50ZXJ9IGZyb20gXCIuLi8uLi90cmVlUGFydHMvdHJlZVBhcnRJbnRlci5qc1wiO1xuaW1wb3J0IHtTdGF0aWNUcmVlUGFydH0gZnJvbSBcIi4uLy4uL3RyZWVQYXJ0cy9zdGF0aWNUcmVlUGFydC5qc1wiO1xuaW1wb3J0IHtUcmVlUGFydEdyb3dlcn0gZnJvbSBcIi4uLy4uL3RyZWVQYXJ0cy90ZWVQYXJ0R3Jvd2VyLmpzXCI7XG5pbXBvcnQgeyBCcmFuY2hDb250ZXh0IH0gZnJvbSBcIi4uLy4uL2NvbXBvbmVudHMvYnJhbmNoLmpzXCI7XG5cbmV4cG9ydCBjbGFzcyBCb25zYWlTYXBjZUNvbG9uaXplciBleHRlbmRzIFNwYWNlQ29sb25pemVyIHtcbiAgICBwcm90ZWN0ZWQgYmlhc0dyb3d0aFZlY3Rvcihncm93dGhWZWN0b3I6IFZlY3RvcjIpOiBWZWN0b3IyIHtcbiAgICAgICAgc3dpdGNoICh0aGlzLm9wdGlvbnMuZGVwdGgpIHtcbiAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICBncm93dGhWZWN0b3IgPSBncm93dGhWZWN0b3IucmFuZG9taXplQW5nbGUoMCwgMC43LCB0aGlzLm9wdGlvbnMudHJlZUdlbmVyYXRvci5nZXRQUk5HKCdHUk9XJykuZmxvYXRJblJhbmdlKDAsIDEpKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgICBncm93dGhWZWN0b3IgPSBncm93dGhWZWN0b3IucmFuZG9taXplQW5nbGUoMCwgMC40LCB0aGlzLm9wdGlvbnMudHJlZUdlbmVyYXRvci5nZXRQUk5HKCdHUk9XJykuZmxvYXRJblJhbmdlKDAsIDEpKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZ3Jvd3RoVmVjdG9yO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIEJvbnNhaUdlbmVyYXRvciBleHRlbmRzIFRyZWVHZW5lcmF0b3Ige1xuICAgIHB1YmxpYyBzdGF0aWMgYXN5bmMgbG9hZFJlc291cmNlcygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICAgICAgKGFzeW5jICgpID0+IEJvbnNhaUdlbmVyYXRvci5wb3RGcm9udEltYWdlID0gYXdhaXQgQ2FudmFzSGVscGVyLmxvYWRJbWFnZSgncmVzb3VyY2VzL2JvbnNhaS9pbWFnZXMvcG90X2Zyb250LnBuZycpKSgpLFxuICAgICAgICAgICAgKGFzeW5jICgpID0+IEJvbnNhaUdlbmVyYXRvci5wb3RCYWNrSW1hZ2UgPSBhd2FpdCBDYW52YXNIZWxwZXIubG9hZEltYWdlKCdyZXNvdXJjZXMvYm9uc2FpL2ltYWdlcy9wb3RfYmFjay5wbmcnKSkoKSxcbiAgICAgICAgICAgIChhc3luYyAoKSA9PiBCb25zYWlHZW5lcmF0b3IubWFpbkJyYW5jaEltYWdlID0gYXdhaXQgQ2FudmFzSGVscGVyLmxvYWRJbWFnZSgncmVzb3VyY2VzL2JvbnNhaS9pbWFnZXMvYmFya190ZXh0dXJlLmpwZycpKSgpLFxuICAgICAgICAgICAgKGFzeW5jICgpID0+IEJvbnNhaUdlbmVyYXRvci5sZWFmVGV4dHVyZUltYWdlID0gYXdhaXQgQ2FudmFzSGVscGVyLmxvYWRJbWFnZSgncmVzb3VyY2VzL2JvbnNhaS9pbWFnZXMvbGVhZl90ZXh0dXJlLmpwZycpKSgpLFxuICAgICAgICAgICAgKGFzeW5jICgpID0+IEJvbnNhaUdlbmVyYXRvci5sZWFmU3RlbmNpbEltYWdlID0gYXdhaXQgQ2FudmFzSGVscGVyLmxvYWRJbWFnZSgncmVzb3VyY2VzL2JvbnNhaS9pbWFnZXMvbGVhZl9zdGVuY2lsLnBuZycpKSgpLFxuICAgICAgICAgICAgKGFzeW5jICgpID0+IEJvbnNhaUdlbmVyYXRvci5sZWFmT3V0bGluZUltYWdlID0gYXdhaXQgQ2FudmFzSGVscGVyLmxvYWRJbWFnZSgncmVzb3VyY2VzL2JvbnNhaS9pbWFnZXMvbGVhZl9vdXRsaW5lLnBuZycpKSgpXG4gICAgICAgIF0pXG4gICAgfVxuXG4gICAgcHVibGljIGNvbnN0cnVjdG9yKG9wdGlvbnM6IFRyZWVHZW5lcmF0b3JPcHRpb25zKSB7XG4gICAgICAgIHN1cGVyKG9wdGlvbnMpO1xuXG4gICAgICAgIC8vIHNldHVwIHBhdHRlcm5zXG4gICAgICAgIGNvbnN0IGR1bW15Q2FudmFzID0gQ2FudmFzSGVscGVyLmNyZWF0ZVRlbXBDYW52YXMoMSwgMSk7XG4gICAgICAgIHRoaXMubWFpbkJyYW5jaFBhdHRlcm4gPSA8Q2FudmFzUGF0dGVybj5kdW1teUNhbnZhcy5jcmVhdGVQYXR0ZXJuKEJvbnNhaUdlbmVyYXRvci5tYWluQnJhbmNoSW1hZ2UsICdyZXBlYXQnKTtcbiAgICAgICAgdGhpcy5sZWFmVGV4dHVyZVBhdHRlcm4gPSA8Q2FudmFzUGF0dGVybj5kdW1teUNhbnZhcy5jcmVhdGVQYXR0ZXJuKEJvbnNhaUdlbmVyYXRvci5sZWFmVGV4dHVyZUltYWdlLCAncmVwZWF0Jyk7XG4gICAgICAgIHRoaXMubGVhZk91dGxpbmVJbWFnZSA9IDxIVE1MSW1hZ2VFbGVtZW50PkJvbnNhaUdlbmVyYXRvci5sZWFmT3V0bGluZUltYWdlLmNsb25lTm9kZSgpO1xuICAgICAgICB0aGlzLmxlYWZTdGVuY2lsSW1hZ2UgPSA8SFRNTEltYWdlRWxlbWVudD5Cb25zYWlHZW5lcmF0b3IubGVhZlN0ZW5jaWxJbWFnZS5jbG9uZU5vZGUoKTtcblxuICAgICAgICB0aGlzLmdlbmVyYXRlUG90TGF5ZXIoKTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuZ2VuZXJhdGVUcnVua0xheWVyKCk7XG4gICAgfVxuXG4gICAgcHVibGljIGRlc3Ryb3koKTogdm9pZCB7XG4gICAgICAgIHN1cGVyLmRlc3Ryb3koKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgb25GaW5pc2hlZEdyb3dpbmcoKTogdm9pZCB7XG4gICAgICAgIHN1cGVyLm9uRmluaXNoZWRHcm93aW5nKCk7XG4gICAgICAgIHRoaXMuc2V0dXBBbmltYXRpb25zKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBkcm9wTGVhZnMoKSB7XG4gICAgICAgIGNvbnN0IGxlYWZUcmVlUGFydHMgPSB0aGlzLnRyZWVQYXJ0cy5maWx0ZXIodHJlZVBhcnQgPT4gdHJlZVBhcnQuaXNUZXJtaW5hbCgpKTtcbiAgICAgICAgY29uc3QgcmFuZG9tVHJlZVBhcnQgPSBsZWFmVHJlZVBhcnRzW01hdGguZmxvb3IobGVhZlRyZWVQYXJ0cy5sZW5ndGggKiBNYXRoLnJhbmRvbSgpKV07XG4gICAgICAgICg8VHJlZVBhcnRMZWFmPnJhbmRvbVRyZWVQYXJ0KS5kcm9wUmFuZG9tTGVhZnMoMSArIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqICgzICsgMSkpKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNldHVwQW5pbWF0aW9ucygpIHtcbiAgICAgICAgY29uc29sZS5hc3NlcnQodGhpcy5pc0ZpbmlzaGVkR3Jvd2luZyk7XG4gICAgICAgIHRoaXMuZ2V0QW5pbWF0aW9uR3JvdXAoKS5hZGRBbmltYXRpb24oXG4gICAgICAgICAgICBzZXRBbmltYXRpb25JbnRlcnZhbCh7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2s6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcm9wTGVhZnMoKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHRpbWU6IDUgKiAxMDAwXG4gICAgICAgICAgICB9KVxuICAgICAgICApO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRPdXRsaW5lVGhpY2tuZXNzKCk6IG51bWJlciB7IHJldHVybiAxOyB9XG5cbiAgICBwdWJsaWMgZ2V0QnJhbmNoVGV4dHVyZVBhdHRlcm4oZ3Jvd3RoOiBWZWN0b3IyLCB0ZXh0dXJlTmFtZT86IHN0cmluZyk6IENhbnZhc1BhdHRlcm4ge1xuICAgICAgICBzd2l0Y2ggKHRleHR1cmVOYW1lKSB7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHRoaXMubWFpbkJyYW5jaFBhdHRlcm4uc2V0VHJhbnNmb3JtKG5ldyBET01NYXRyaXgoKS50cmFuc2xhdGVTZWxmKGdyb3d0aC54LCBncm93dGgueSkuc2NhbGVTZWxmKDAuMiwgMC4yKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubWFpbkJyYW5jaFBhdHRlcm47XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0TGVhZlN0ZW5jaWxUZXh0dXJlKCk6IEhUTUxJbWFnZUVsZW1lbnQge1xuICAgICAgICByZXR1cm4gdGhpcy5sZWFmU3RlbmNpbEltYWdlO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRMZWFmT3V0bGluZVRleHR1cmUoKTogSFRNTEltYWdlRWxlbWVudCB7XG4gICAgICAgIHJldHVybiB0aGlzLmxlYWZPdXRsaW5lSW1hZ2U7XG4gICAgfVxuXG4gICAgcHVibGljIGdldExlYWZUZXh0dXJlUGF0dGVybihyYW5kWD86IG51bWJlciwgcmFuZFk/OiBudW1iZXIpOiBDYW52YXNQYXR0ZXJuIHtcbiAgICAgICAgdGhpcy5sZWFmVGV4dHVyZVBhdHRlcm4uc2V0VHJhbnNmb3JtKG5ldyBET01NYXRyaXgoKS50cmFuc2xhdGVTZWxmKHJhbmRYID8/IHRoaXMuZ2V0UFJORygnRFJBVycpLmZsb2F0SW5SYW5nZSgwLCA0MDApLCByYW5kWSA/PyB0aGlzLmdldFBSTkcoJ0RSQVcnKS5mbG9hdEluUmFuZ2UoMCwgNDAwKSkuc2NhbGVTZWxmKDAuMywgMC4zKSk7XG4gICAgICAgIHJldHVybiB0aGlzLmxlYWZUZXh0dXJlUGF0dGVybjtcbiAgICB9XG5cbiAgICBwdWJsaWMgbWFya0xlYWZSZWFjaGVkKGRlcHRoOiBudW1iZXIsIGxlYWY6IExlYWYpIHtcbiAgICAgICAgc3dpdGNoIChkZXB0aCkge1xuICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgIHRoaXMuZ2VuZXJhdGVTcGxpdExheWVyKGRlcHRoICsgMSwgbGVhZik7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZ2V0UFJORygnR1JPVycpLnJhbmRvbSgpID4gMC41KVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmdlbmVyYXRlU3BsaXRMYXllcihkZXB0aCArIDEsIGxlYWYpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgIHRoaXMuZ2VuZXJhdGVMZWFmTGF5ZXIoZGVwdGggKyAxLCBsZWFmKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGdlbmVyYXRlUG90TGF5ZXIoKSB7XG4gICAgICAgIGNvbnN0IHBvdFBvc2l0aW9uID0gbmV3IFZlY3RvcjIoXG4gICAgICAgICAgICBUcmVlR2VuZXJhdG9yLlJFRkVSRU5DRV9IRUlHSFQgLyAyIC0gQm9uc2FpR2VuZXJhdG9yLnBvdEJhY2tJbWFnZS53aWR0aCAvIDIsIFxuICAgICAgICAgICAgVHJlZUdlbmVyYXRvci5SRUZFUkVOQ0VfSEVJR0hUIC0gQm9uc2FpR2VuZXJhdG9yLnBvdEJhY2tJbWFnZS5oZWlnaHQpO1xuICAgICAgICB0aGlzLnRyZWVQYXJ0cy5wdXNoKFN0YXRpY1RyZWVQYXJ0LmZyb21JbWFnZSh7XG4gICAgICAgICAgICBjb250ZXh0OiB0aGlzLnRyZWVQYXJ0Q29udGV4dCxcbiAgICAgICAgICAgIHBvczogcG90UG9zaXRpb24sXG4gICAgICAgICAgICBpbWFnZTogQm9uc2FpR2VuZXJhdG9yLnBvdEJhY2tJbWFnZSxcbiAgICAgICAgICAgIHpJbmRleDogLTEsXG4gICAgICAgICAgICBkZXB0aDogLTFcbiAgICAgICAgfSkpO1xuICAgICAgICB0aGlzLnRyZWVQYXJ0cy5wdXNoKFN0YXRpY1RyZWVQYXJ0LmZyb21JbWFnZSh7XG4gICAgICAgICAgICBjb250ZXh0OiB0aGlzLnRyZWVQYXJ0Q29udGV4dCxcbiAgICAgICAgICAgIHBvczogcG90UG9zaXRpb24sXG4gICAgICAgICAgICBpbWFnZTogQm9uc2FpR2VuZXJhdG9yLnBvdEZyb250SW1hZ2UsXG4gICAgICAgICAgICB6SW5kZXg6IDEsXG4gICAgICAgICAgICBkZXB0aDogLTFcbiAgICAgICAgfSkpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2VuZXJhdGVUcnVua0xheWVyKCkge1xuICAgICAgICBjb25zdCBuZXdUcmVlUGFydCA9IG5ldyBUcmVlUGFydEludGVyKHtcbiAgICAgICAgICAgIGNvbnRleHQ6IHRoaXMudHJlZVBhcnRDb250ZXh0LFxuICAgICAgICAgICAgcG9zaXRpb246IFZlY3RvcjIuWmVybyxcbiAgICAgICAgICAgIHNpemU6IG5ldyBWZWN0b3IyKFRyZWVHZW5lcmF0b3IuUkVGRVJFTkNFX0hFSUdIVCwgVHJlZUdlbmVyYXRvci5SRUZFUkVOQ0VfSEVJR0hUKSxcbiAgICAgICAgICAgIG9yaWdpbjogQm9uc2FpR2VuZXJhdG9yLkdST1dfT1JJR0lOLFxuICAgICAgICAgICAgb3ZlcmRyYXdXaWR0aDogMjAwLFxuICAgICAgICAgICAgZmFkZUluOiBmYWxzZVxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBjb250ZXh0OiBCcmFuY2hDb250ZXh0ID0ge1xuICAgICAgICAgICAgLi4udGhpcy50cmVlUGFydENvbnRleHQsXG4gICAgICAgICAgICB0cmVlUGFydDogbmV3VHJlZVBhcnRcbiAgICAgICAgfTtcblxuICAgICAgICBuZXdUcmVlUGFydC5icmFuY2hHcm93ZXIgPSBuZXcgQm9uc2FpU2FwY2VDb2xvbml6ZXIoe1xuICAgICAgICAgICAgdHJlZUdlbmVyYXRvcjogdGhpcyxcbiAgICAgICAgICAgIGRlcHRoOiAwLFxuICAgICAgICAgICAgb3JpZ2luOiBCb25zYWlHZW5lcmF0b3IuR1JPV19PUklHSU4sXG4gICAgICAgICAgICBzaXplOiBuZXcgVmVjdG9yMihUcmVlR2VuZXJhdG9yLlJFRkVSRU5DRV9IRUlHSFQsIFRyZWVHZW5lcmF0b3IuUkVGRVJFTkNFX0hFSUdIVCksXG4gICAgICAgICAgICBsZWFmQ291bnQ6IDcsXG4gICAgICAgICAgICBzcGF3blBvaW50czogbmV3IEFycmF5KDEwKS5maWxsKG51bGwpLm1hcCh4ID0+XG4gICAgICAgICAgICAgICAgbmV3IFZlY3RvcjIodGhpcy5nZXRQUk5HKCdHUk9XJykuZmxvYXRJblJhbmdlKDAsIFRyZWVHZW5lcmF0b3IuUkVGRVJFTkNFX0hFSUdIVCAtIDEwMCksIHRoaXMuZ2V0UFJORygnR1JPVycpLmZsb2F0SW5SYW5nZShUcmVlR2VuZXJhdG9yLlJFRkVSRU5DRV9IRUlHSFQgKiAwLjQsIFRyZWVHZW5lcmF0b3IuUkVGRVJFTkNFX0hFSUdIVCAqIDAuNikpXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgYnJhbmNoTGVuZ3RoOiAxMCxcbiAgICAgICAgICAgIGNyZWF0ZUZpcnN0QnJhbmNoOiAocG9zOiBWZWN0b3IyKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBCcmFuY2goe1xuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogcG9zLFxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0OiBjb250ZXh0XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjcmVhdGVMZWFmOiAocG9zOiBWZWN0b3IyKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBMZWFmKHtcbiAgICAgICAgICAgICAgICAgICAgdHJlZUdlbmVyYXRvcjogdGhpcyxcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IHBvcyxcbiAgICAgICAgICAgICAgICAgICAgYXR0cmFjdGlvbkRpc3RhbmNlOiBUcmVlR2VuZXJhdG9yLlJFRkVSRU5DRV9IRUlHSFQgKiAwLjc1LFxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0OiBjb250ZXh0XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIG5ld1RyZWVQYXJ0LmluaXQoKTtcbiAgICAgICAgbmV3VHJlZVBhcnQuc3RhcnQoKTtcblxuICAgICAgICB0aGlzLnRyZWVQYXJ0cy5wdXNoKG5ld1RyZWVQYXJ0KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdlbmVyYXRlU3BsaXRMYXllcihkZXB0aDogbnVtYmVyLCBsZWFmOiBMZWFmKSB7XG4gICAgICAgIGlmICghbGVhZi5wYXJlbnQpXG4gICAgICAgICAgICByZXR1cm4gY29uc29sZS5hc3NlcnQoZmFsc2UpO1xuXG4gICAgICAgIGNvbnN0IHRyZWVQYXJ0ID0gbGVhZi5wYXJlbnQuY29udGV4dD8udHJlZVBhcnQ7XG5cbiAgICAgICAgY29uc3QgTEFZRVJfU0laRTogbnVtYmVyID0gMzAwO1xuICAgICAgICBjb25zdCBFWFRSVURFX1JBTkdFID0gWzEwMCwgMTUwXTtcbiAgICAgICAgY29uc3QgRVhUUlVERV9BTkdMTEVfTUlOX0RJRkYgPSBNYXRoLlBJICogMC4xO1xuICAgICAgICBjb25zdCBFWFRSVURFX0FOR0xFX01BWF9ESUZGID0gTWF0aC5QSSAqIDAuMjU7XG5cbiAgICAgICAgY29uc3QgcHJuZyA9IHRoaXMuZ2V0UFJORygnR1JPVycpO1xuXG4gICAgICAgIGNvbnN0IGJyYW5jaDogQnJhbmNoID0gbGVhZi5wYXJlbnQ7XG5cbiAgICAgICAgY29uc3QgZXh0cnVkZURpcjogVmVjdG9yMiA9IGJyYW5jaC5lbmRQb3NHbG9iYWwuc3VidHJhY3QoQm9uc2FpR2VuZXJhdG9yLkdST1dfT1JJR0lOKS5ub3JtYWxpemUoKS5yYW5kb21pemVBbmdsZShFWFRSVURFX0FOR0xMRV9NSU5fRElGRiwgRVhUUlVERV9BTkdMRV9NQVhfRElGRiwgcHJuZy5yYW5kb20oKSk7XG4gICAgICAgIGNvbnN0IGV4dHJ1ZGVMZW5ndGg6IG51bWJlciA9IHBybmcuZmxvYXRJblJhbmdlKEVYVFJVREVfUkFOR0VbMF0sIEVYVFJVREVfUkFOR0VbMV0pO1xuICAgICAgICBjb25zdCBleHRydWRlUG9zaXRpb24gPSBicmFuY2guZW5kUG9zLmFkZChleHRydWRlRGlyLnNjYWxlKGV4dHJ1ZGVMZW5ndGgpKTtcblxuICAgICAgICBjb25zdCBwb3NpdGlvbjogVmVjdG9yMiA9IGJyYW5jaC5lbmRQb3MuYWRkKG5ldyBWZWN0b3IyKC1MQVlFUl9TSVpFICogMC41LCAtTEFZRVJfU0laRSkpO1xuICAgICAgICBjb25zdCBvcmlnaW46IFZlY3RvcjIgPSBicmFuY2guZW5kUG9zLnN1YnRyYWN0KHBvc2l0aW9uKTtcbiAgICAgICAgY29uc3Qgc2l6ZTogVmVjdG9yMiA9IG5ldyBWZWN0b3IyKExBWUVSX1NJWkUsIExBWUVSX1NJWkUpO1xuXG4gICAgICAgIGNvbnN0IG5ld1RyZWVQYXJ0ID0gbmV3IFRyZWVQYXJ0SW50ZXIoe1xuICAgICAgICAgICAgY29udGV4dDogdGhpcy50cmVlUGFydENvbnRleHQsXG4gICAgICAgICAgICBkZXB0aDogZGVwdGgsXG4gICAgICAgICAgICBwb3NpdGlvbjogcG9zaXRpb24sXG4gICAgICAgICAgICBzaXplOiBzaXplLFxuICAgICAgICAgICAgcGFyZW50OiB0cmVlUGFydCxcbiAgICAgICAgICAgIG9yaWdpbjogb3JpZ2luLFxuICAgICAgICAgICAgZmFkZUluOiB0cnVlXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IGNvbnRleHQ6IEJyYW5jaENvbnRleHQgPSB7XG4gICAgICAgICAgICAuLi50aGlzLnRyZWVQYXJ0Q29udGV4dCxcbiAgICAgICAgICAgIHRyZWVQYXJ0OiBuZXdUcmVlUGFydFxuICAgICAgICB9O1xuXG4gICAgICAgIG5ld1RyZWVQYXJ0LmJyYW5jaEdyb3dlciA9IG5ldyBCb25zYWlTYXBjZUNvbG9uaXplcih7XG4gICAgICAgICAgICB0cmVlR2VuZXJhdG9yOiB0aGlzLFxuICAgICAgICAgICAgZGVwdGg6IGRlcHRoLFxuICAgICAgICAgICAgcGFyZW50QnJhbmNoOiBicmFuY2gsXG4gICAgICAgICAgICBvcmlnaW46IG9yaWdpbixcbiAgICAgICAgICAgIHNpemU6IHNpemUsXG4gICAgICAgICAgICBsZWFmQ291bnQ6IDEsXG4gICAgICAgICAgICBicmFuY2hMZW5ndGg6IDgsXG4gICAgICAgICAgICBzcGF3blBvaW50czogW2V4dHJ1ZGVQb3NpdGlvbi5zdWJ0cmFjdChwb3NpdGlvbildLFxuICAgICAgICAgICAgY3JlYXRlRmlyc3RCcmFuY2g6IChwb3M6IFZlY3RvcjIpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEJyYW5jaCh7XG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBwb3MsXG4gICAgICAgICAgICAgICAgICAgIHBhcmVudDogYnJhbmNoLFxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0OiBjb250ZXh0XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjcmVhdGVMZWFmOiAocG9zOiBWZWN0b3IyKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBMZWFmKHtcbiAgICAgICAgICAgICAgICAgICAgdHJlZUdlbmVyYXRvcjogdGhpcyxcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IHBvcyxcbiAgICAgICAgICAgICAgICAgICAgYXR0cmFjdGlvbkRpc3RhbmNlOiBMQVlFUl9TSVpFLFxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0OiBjb250ZXh0XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIG5ld1RyZWVQYXJ0LmluaXQoKTtcbiAgICAgICAgbmV3VHJlZVBhcnQuc3RhcnQoKTtcbiAgICAgICAgdGhpcy50cmVlUGFydHMucHVzaChuZXdUcmVlUGFydCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZW5lcmF0ZUxlYWZMYXllcihkZXB0aDogbnVtYmVyLCBsZWFmOiBMZWFmKSB7XG4gICAgICAgIGlmICghbGVhZi5wYXJlbnQpXG4gICAgICAgICAgICByZXR1cm4gY29uc29sZS5hc3NlcnQoZmFsc2UpO1xuXG4gICAgICAgIGNvbnN0IHRyZWVQYXJ0ID0gbGVhZi5wYXJlbnQuY29udGV4dD8udHJlZVBhcnQ7XG5cbiAgICAgICAgY29uc3QgcHJuZyA9IHRoaXMuZ2V0UFJORygnR1JPVycpO1xuXG4gICAgICAgIGNvbnN0IGJyYW5jaDogQnJhbmNoID0gbGVhZi5wYXJlbnQ7XG5cbiAgICAgICAgY29uc3QgTEVBRl9TQ0FMRTogbnVtYmVyID0gcHJuZy5mbG9hdEluUmFuZ2UoMSwgMS4yKTtcbiAgICAgICAgY29uc3Qgc2l6ZTogVmVjdG9yMiA9IG5ldyBWZWN0b3IyKDUwMCAqIExFQUZfU0NBTEUsIDIwMCAqIExFQUZfU0NBTEUpO1xuICAgICAgICBjb25zdCBwb3NpdGlvbjogVmVjdG9yMiA9IGJyYW5jaC5lbmRQb3Muc3VidHJhY3RGcm9tRmxvYXRzKHNpemUueCAqIDAuNSwgc2l6ZS55IC0gMTApO1xuICAgICAgICBjb25zdCBvcmlnaW46IFZlY3RvcjIgPSBicmFuY2guZW5kUG9zLnN1YnRyYWN0KHBvc2l0aW9uKTtcblxuICAgICAgICBjb25zdCBsZWFmQ291bnQ6IG51bWJlciA9IDIwMCAqIE1hdGgucG93KExFQUZfU0NBTEUsIDIpO1xuICAgICAgICBjb25zdCBsZWFmQXR0cmFjdGlvbkRpc3RhbmNlOiBudW1iZXIgPSBwcm5nLmludEluUmFuZ2UoNTAsIDEwMCkgKiBMRUFGX1NDQUxFO1xuXG4gICAgICAgIGNvbnN0IHN1cmZhY2VTY2FsYXI6IG51bWJlciA9IHNpemUueCAvIDUwMDtcblxuICAgICAgICBjb25zdCBtZXRhYmFsbFN1cmZhY2U6IE1ldGFiYWxsU3VyZmFjZSA9IG5ldyBNZXRhYmFsbFN1cmZhY2Uoe1xuICAgICAgICAgICAgdGhyZXNob2xkOiAxLFxuICAgICAgICAgICAgcG9pbnRzOiBbXG4gICAgICAgICAgICAgICAgeyB4OiBzaXplLnggKiAwLjIsIHk6IHNpemUueSwgcjogWzMwLCA2MF0sIGQ6IFswLCAzMF0gfSxcbiAgICAgICAgICAgICAgICB7IHg6IHNpemUueCAqIDAuNCwgeTogc2l6ZS55LCByOiBbMzAsIDYwXSwgZDogWzAsIDMwXSB9LFxuICAgICAgICAgICAgICAgIHsgeDogc2l6ZS54ICogMC42LCB5OiBzaXplLnksIHI6IFszMCwgNjBdLCBkOiBbMCwgMzBdIH0sXG4gICAgICAgICAgICAgICAgeyB4OiBzaXplLnggKiAwLjgsIHk6IHNpemUueSwgcjogWzMwLCA2MF0sIGQ6IFswLCAzMF0gfSxcbiAgICAgICAgICAgICAgICB7IHg6IHNpemUueCAqIDAuNSwgeTogc2l6ZS55LCByOiBbMjAsIDMwXSwgZDogWzAsIDMwXSB9LFxuICAgICAgICAgICAgXS5tYXAoYmFzZVBvcyA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3Qgb2Zmc2V0UG9zID0gbmV3IFZlY3RvcjIoYmFzZVBvcy54LCBiYXNlUG9zLnkpO1xuICAgICAgICAgICAgICAgIGNvbnN0IG1heERpc3QgPSBwcm5nLmZsb2F0SW5SYW5nZShiYXNlUG9zLmRbMF0sIGJhc2VQb3MuZFsxXSkgKiBzdXJmYWNlU2NhbGFyO1xuICAgICAgICAgICAgICAgIG9mZnNldFBvcy5yYW5kb21pemVPZmZzZXRJblBsYWNlKG1heERpc3QsIHBybmcuZmxvYXRJblJhbmdlKDAsIDEpKTtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICB4OiBvZmZzZXRQb3MueCxcbiAgICAgICAgICAgICAgICAgICAgeTogb2Zmc2V0UG9zLnksXG4gICAgICAgICAgICAgICAgICAgIHI6IHBybmcuZmxvYXRJblJhbmdlKGJhc2VQb3MuclswXSwgYmFzZVBvcy5yWzFdKSAqIHN1cmZhY2VTY2FsYXJcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSlcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgbmV3VHJlZVBhcnQgPSBuZXcgVHJlZVBhcnRMZWFmKHtcbiAgICAgICAgICAgIGNvbnRleHQ6IHRoaXMudHJlZVBhcnRDb250ZXh0LFxuICAgICAgICAgICAgb3JpZ2luOiBvcmlnaW4sXG4gICAgICAgICAgICBwYXJlbnQ6IHRyZWVQYXJ0LFxuICAgICAgICAgICAgZGVwdGg6IGRlcHRoLFxuICAgICAgICAgICAgcG9zaXRpb246IHBvc2l0aW9uLFxuICAgICAgICAgICAgc2l6ZTogc2l6ZSxcbiAgICAgICAgICAgIGZhZGVJbjogdHJ1ZVxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBjb250ZXh0OiBCcmFuY2hDb250ZXh0ID0ge1xuICAgICAgICAgICAgLi4udGhpcy50cmVlUGFydENvbnRleHQsXG4gICAgICAgICAgICB0cmVlUGFydDogbmV3VHJlZVBhcnRcbiAgICAgICAgfTtcblxuICAgICAgICBuZXdUcmVlUGFydC5icmFuY2hHcm93ZXIgPSBuZXcgQm9uc2FpU2FwY2VDb2xvbml6ZXIoe1xuICAgICAgICAgICAgdHJlZUdlbmVyYXRvcjogdGhpcyxcbiAgICAgICAgICAgIGRlcHRoOiBkZXB0aCxcbiAgICAgICAgICAgIG9yaWdpbjogb3JpZ2luLFxuICAgICAgICAgICAgcG9zaXRpb25QcmVkaWNhdGU6IChwb3MpID0+IG1ldGFiYWxsU3VyZmFjZS5zcGFjZU9jY3VwaWVkKHBvcy54LCBwb3MueSksXG4gICAgICAgICAgICBwYXJlbnRCcmFuY2g6IGJyYW5jaCxcbiAgICAgICAgICAgIHNpemU6IHNpemUsXG4gICAgICAgICAgICBsZWFmQ291bnQ6IGxlYWZDb3VudCxcbiAgICAgICAgICAgIHNwYXduUG9pbnRzOiBbXSxcbiAgICAgICAgICAgIGJyYW5jaExlbmd0aDogNSxcbiAgICAgICAgICAgIGNyZWF0ZUZpcnN0QnJhbmNoOiAocG9zOiBWZWN0b3IyKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBCcmFuY2goe1xuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogcG9zLFxuICAgICAgICAgICAgICAgICAgICBwYXJlbnQ6IGJyYW5jaCxcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dDogY29udGV4dFxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY3JlYXRlTGVhZjogKHBvczogVmVjdG9yMikgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgTGVhZih7XG4gICAgICAgICAgICAgICAgICAgIHRyZWVHZW5lcmF0b3I6IHRoaXMsXG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBwb3MsXG4gICAgICAgICAgICAgICAgICAgIGF0dHJhY3Rpb25EaXN0YW5jZTogbGVhZkF0dHJhY3Rpb25EaXN0YW5jZSAqIExFQUZfU0NBTEUsXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQ6IGNvbnRleHRcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgbmV3VHJlZVBhcnQuc3RhcnQoKTtcbiAgICAgICAgbmV3VHJlZVBhcnQuaW5pdCgpO1xuICAgICAgICB0aGlzLnRyZWVQYXJ0cy5wdXNoKG5ld1RyZWVQYXJ0KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0QnJhbmNoV2lkdGgoYnJhbmNoOiBCcmFuY2gpOiBudW1iZXIge1xuICAgICAgICBjb25zdCB0cmVlUGFydCA9IDxUcmVlUGFydEdyb3dlcj5icmFuY2guY29udGV4dD8udHJlZVBhcnQhO1xuXG4gICAgICAgIHN3aXRjaCh0cmVlUGFydC5kZXB0aCkge1xuICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICAgIHJldHVybiBNYXRoLm1heCgzMCwgMTQwICsgYnJhbmNoLmdyb3d0aExvY2FsLnkgKiAtMC4xNyk7XG4gICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgcmV0dXJuIE1hdGgubWF4KDE1LCB0cmVlUGFydC5zdGFydGluZ0JyYW5jaFdpZHRoICsgYnJhbmNoLmdyb3d0aExvY2FsLnkgKiAtMC4xNSk7XG4gICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIE1hdGgubWF4KDcsIHRyZWVQYXJ0LnN0YXJ0aW5nQnJhbmNoV2lkdGggKyBicmFuY2guZ3Jvd3RoTG9jYWwueSAqIC0wLjE1KTtcbiAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgICByZXR1cm4gTWF0aC5tYXgoMywgdHJlZVBhcnQuc3RhcnRpbmdCcmFuY2hXaWR0aCArIGJyYW5jaC5ncm93dGhMb2NhbC55ICogLTEuNSk7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdGF0aWMgR1JPV19PUklHSU46IFZlY3RvcjIgPSBuZXcgVmVjdG9yMihUcmVlR2VuZXJhdG9yLlJFRkVSRU5DRV9IRUlHSFQgKiAwLjUsIFRyZWVHZW5lcmF0b3IuUkVGRVJFTkNFX0hFSUdIVCAtIDEwMCk7XG5cbiAgICBwcml2YXRlIG1haW5CcmFuY2hQYXR0ZXJuOiBDYW52YXNQYXR0ZXJuO1xuICAgIHByaXZhdGUgbGVhZlN0ZW5jaWxJbWFnZTogSFRNTEltYWdlRWxlbWVudDtcbiAgICBwcml2YXRlIGxlYWZPdXRsaW5lSW1hZ2U6IEhUTUxJbWFnZUVsZW1lbnQ7XG4gICAgcHJpdmF0ZSBsZWFmVGV4dHVyZVBhdHRlcm46IENhbnZhc1BhdHRlcm47XG5cbiAgICBwcml2YXRlIHN0YXRpYyBwb3RGcm9udEltYWdlOiBIVE1MSW1hZ2VFbGVtZW50O1xuICAgIHByaXZhdGUgc3RhdGljIHBvdEJhY2tJbWFnZTogSFRNTEltYWdlRWxlbWVudDtcbiAgICBwcml2YXRlIHN0YXRpYyBtYWluQnJhbmNoSW1hZ2U6IEhUTUxJbWFnZUVsZW1lbnQ7XG4gICAgcHJpdmF0ZSBzdGF0aWMgbGVhZk91dGxpbmVJbWFnZTogSFRNTEltYWdlRWxlbWVudDtcbiAgICBwcml2YXRlIHN0YXRpYyBsZWFmVGV4dHVyZUltYWdlOiBIVE1MSW1hZ2VFbGVtZW50O1xuICAgIHByaXZhdGUgc3RhdGljIGxlYWZTdGVuY2lsSW1hZ2U6IEhUTUxJbWFnZUVsZW1lbnQ7XG59XG4iLCJuYW1lc3BhY2UgQW5pbWF0aW9uTWFuYWdlciB7XG4gICAgbGV0IHRvdGFsSGlkZGVuVGltZTogbnVtYmVyID0gMDtcbiAgICBsZXQgaGlkZGVuU3RhcnRUaW1lOiBudW1iZXIgPSAwO1xuICAgIFxuICAgIGxldCBhbmltYXRpb25FeHBsaWNpdFBhdXNlZDogYm9vbGVhbiA9IGZhbHNlO1xuICAgIGxldCBhbmltYXRpb25QbGF5OiBib29sZWFuID0gdHJ1ZTtcblxuICAgIHNldHVwUGF1c2VMaXN0ZW5lcnMoKTtcblxuICAgIGZ1bmN0aW9uIHJlZnJlc2hQbGF5aW5nU3RhdHVzKCkge1xuICAgICAgICBjb25zdCBhbmltYXRpb25QbGF5Tm93ID0gKFxuICAgICAgICAgICAgZG9jdW1lbnQudmlzaWJpbGl0eVN0YXRlID09ICd2aXNpYmxlJyAmJiBcbiAgICAgICAgICAgICFhbmltYXRpb25FeHBsaWNpdFBhdXNlZFxuICAgICAgICApO1xuXG4gICAgICAgIGlmIChhbmltYXRpb25QbGF5ID09IGFuaW1hdGlvblBsYXlOb3cpIHtcbiAgICAgICAgICAgIC8vIHVuY2hhbmdlZFxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGVsc2UgaWYgKGFuaW1hdGlvblBsYXlOb3cpIHtcbiAgICAgICAgICAgIC8vIHN0YXJ0XG4gICAgICAgICAgICB0b3RhbEhpZGRlblRpbWUgKz0gKHBlcmZvcm1hbmNlLm5vdygpIC0gaGlkZGVuU3RhcnRUaW1lKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIHN0b3BcbiAgICAgICAgICAgIGhpZGRlblN0YXJ0VGltZSA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIGFuaW1hdGlvblBsYXkgPSBhbmltYXRpb25QbGF5Tm93O1xuXG4gICAgICAgIG9uRXZlbnQuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoYW5pbWF0aW9uUGxheSA/ICdzdGFydCcgOiAnc3RvcCcsIHtcbiAgICAgICAgICAgIGRldGFpbDogeyBwbGF5aW5nOiBmYWxzZSB9XG4gICAgICAgIH0pKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzZXR1cFBhdXNlTGlzdGVuZXJzKCkge1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgKCkgPT4gcmVmcmVzaFBsYXlpbmdTdGF0dXMoKSk7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3Zpc2liaWxpdHljaGFuZ2UnLCByZWZyZXNoUGxheWluZ1N0YXR1cyk7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAoZSkgPT4ge1xuICAgICAgICAgICAgaWYgKGUua2V5ICE9ICdwJyB8fCBlLnJlcGVhdClcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICBhbmltYXRpb25FeHBsaWNpdFBhdXNlZCA9IHRydWU7XG4gICAgICAgICAgICByZWZyZXNoUGxheWluZ1N0YXR1cygpO1xuICAgICAgICB9KVxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIChlKSA9PiB7XG4gICAgICAgICAgICBpZiAoKGUua2V5ICE9ICdwJykpXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgYW5pbWF0aW9uRXhwbGljaXRQYXVzZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIHJlZnJlc2hQbGF5aW5nU3RhdHVzKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGV4cG9ydCBmdW5jdGlvbiBnZXRUb3RhbFBsYXlUaW1lKCkge1xuICAgICAgICByZXR1cm4gcGVyZm9ybWFuY2Uubm93KCkgLSBnZXRUb3RhbFBhdXNlZFRpbWUoKTtcbiAgICB9XG5cbiAgICBleHBvcnQgZnVuY3Rpb24gZ2V0VG90YWxQYXVzZWRUaW1lKCkge1xuICAgICAgICBpZiAoYW5pbWF0aW9uUGxheSkge1xuICAgICAgICAgICAgcmV0dXJuIHRvdGFsSGlkZGVuVGltZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0b3RhbEhpZGRlblRpbWUgKyAgKHBlcmZvcm1hbmNlLm5vdygpIC0gaGlkZGVuU3RhcnRUaW1lKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGV4cG9ydCBmdW5jdGlvbiBpc1BsYXlpbmcoKSB7XG4gICAgICAgIHJldHVybiBhbmltYXRpb25QbGF5O1xuICAgIH1cblxuICAgIGV4cG9ydCBjb25zdCBvbkV2ZW50ID0gbmV3IEV2ZW50VGFyZ2V0KCk7XG59XG5cbmludGVyZmFjZSBWaXNpYmxlVGltZXJPcHRpb25zIHtcbiAgICBvbkZpcmU6ICgpID0+IHZvaWQsXG4gICAgdGltZTogbnVtYmVyLFxuICAgIHJlcGVhdDogYm9vbGVhblxufVxuXG5jbGFzcyBWaXNpYmxlVGltZXIge1xuICAgIHB1YmxpYyBjb25zdHJ1Y3RvcihvcHRpb25zOiBWaXNpYmxlVGltZXJPcHRpb25zKSB7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgICAgIHRoaXMuZGVsdGFTdGFydFQgPSBwZXJmb3JtYW5jZS5ub3coKTtcblxuICAgICAgICBBbmltYXRpb25NYW5hZ2VyLm9uRXZlbnQuYWRkRXZlbnRMaXN0ZW5lcignc3RhcnQnLCB0aGlzLmFuaW1hdGlvblN0YXJ0TGlzdGVuZXIgPSAoKSA9PiB0aGlzLnN0YXJ0KCkpO1xuICAgICAgICBBbmltYXRpb25NYW5hZ2VyLm9uRXZlbnQuYWRkRXZlbnRMaXN0ZW5lcignc3RvcCcsIHRoaXMuYW5pbWF0aW9uU3RvcExpc3RlbmVyID0gKCkgPT4gdGhpcy5zdG9wKCkpO1xuXG4gICAgICAgIGlmIChBbmltYXRpb25NYW5hZ2VyLmlzUGxheWluZygpKVxuICAgICAgICAgICAgdGhpcy5zdGFydCgpO1xuICAgIH1cblxuICAgIHByaXZhdGUgc3RvcCgpIHtcbiAgICAgICAgdGhpcy5kZWx0YVQgKz0gKHBlcmZvcm1hbmNlLm5vdygpIC0gdGhpcy5kZWx0YVN0YXJ0VCk7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnRpbWVvdXQpO1xuICAgIH1cblxuICAgIHByaXZhdGUgc3RhcnQoKSB7XG4gICAgICAgIHRoaXMuZGVsdGFTdGFydFQgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICAgICAgY29uc3QgdGltZVJlbWFpbmluZyA9ICh0aGlzLm9wdGlvbnMudGltZSAtIHRoaXMuZGVsdGFUKTtcbiAgICAgICAgdGhpcy50aW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB0aGlzLmZpcmUoKSwgdGltZVJlbWFpbmluZyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBmaXJlKCkge1xuICAgICAgICB0aGlzLm9wdGlvbnMub25GaXJlKCk7XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMucmVwZWF0KSB7XG4gICAgICAgICAgICB0aGlzLmRlbHRhVCA9IDA7XG4gICAgICAgICAgICB0aGlzLnN0YXJ0KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmRpc3Bvc2UoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwdWJsaWMgZGlzcG9zZSgpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMudGltZW91dCk7XG4gICAgICAgIEFuaW1hdGlvbk1hbmFnZXIub25FdmVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdzdGFydCcsIHRoaXMuYW5pbWF0aW9uU3RhcnRMaXN0ZW5lcik7XG4gICAgICAgIEFuaW1hdGlvbk1hbmFnZXIub25FdmVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdzdG9wJywgdGhpcy5hbmltYXRpb25TdG9wTGlzdGVuZXIpO1xuICAgIH1cblxuICAgIHByaXZhdGUgYW5pbWF0aW9uU3RhcnRMaXN0ZW5lcjogKGU6IGFueSkgPT4gdm9pZDtcbiAgICBwcml2YXRlIGFuaW1hdGlvblN0b3BMaXN0ZW5lcjogKGU6IGFueSkgPT4gdm9pZDtcblxuICAgIHByaXZhdGUgb3B0aW9uczogVmlzaWJsZVRpbWVyT3B0aW9ucztcblxuICAgIHByaXZhdGUgdGltZW91dDogYW55ID0gbnVsbDtcbiAgICBwcml2YXRlIGRlbHRhU3RhcnRUOiBudW1iZXIgPSAwO1xuICAgIHByaXZhdGUgZGVsdGFUOiBudW1iZXIgPSAwO1xufVxuXG5leHBvcnQgY2xhc3MgQW5pbWF0aW9uR3JvdXAge1xuICAgIHB1YmxpYyBhZGRBbmltYXRpb24odHJhY2s6IEFuaW1hdGlvbik6IEFuaW1hdGlvbiB7XG4gICAgICAgIHRoaXMudHJhY2tzLnB1c2godHJhY2spO1xuICAgICAgICByZXR1cm4gdHJhY2s7XG4gICAgfVxuICAgIHB1YmxpYyBjYW5jZWwoKSB7XG4gICAgICAgIHRoaXMudHJhY2tzLmZvckVhY2goKHRyYWNrKSA9PiB0cmFjay5jYW5jZWwoKSk7XG4gICAgfVxuICAgIHByaXZhdGUgdHJhY2tzOiBBcnJheTxBbmltYXRpb24+ID0gW107XG59XG5cbmV4cG9ydCBjbGFzcyBBbmltYXRpb24ge1xuICAgIHB1YmxpYyBjYW5jZWwoKSB7XG4gICAgICAgIHRoaXMuY2FuY2VsbGVkID0gdHJ1ZTtcbiAgICB9XG4gICAgcHVibGljIGdldCBpc0NhbmNlbGxlZCgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuY2FuY2VsbGVkOyB9XG4gICAgcHJpdmF0ZSBjYW5jZWxsZWQ6IGJvb2xlYW4gPSBmYWxzZTtcbn1cblxuXG5leHBvcnQgZW51bSBBbmltYXRpb25TdGF0ZSB7IEFOSU1BVElORywgRE9ORSB9O1xuZXhwb3J0IGludGVyZmFjZSBBbmltYXRpb25PcHRpb25zIHtcbiAgICBhbmltYXRlOiAodDogbnVtYmVyKSA9PiBBbmltYXRpb25TdGF0ZSB8IHZvaWQ7XG4gICAgb25CZWZvcmU/OiAoKSA9PiB2b2lkO1xuICAgIG9uRG9uZT86ICgpID0+IHZvaWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdGFydEFuaW1hdGlvbihvcHRpb25zOiBBbmltYXRpb25PcHRpb25zKTogQW5pbWF0aW9uIHtcbiAgICBjb25zdCBhbmltYXRpb25UcmFjayA9IG5ldyBBbmltYXRpb24oKTtcbiAgICBjb25zdCBzdGFydFRpbWUgPSBBbmltYXRpb25NYW5hZ2VyLmdldFRvdGFsUGxheVRpbWUoKTtcbiAgICBcbiAgICBvcHRpb25zLm9uQmVmb3JlPy4oKTtcblxuICAgIGNvbnN0IGZ1bmMgPSAoKSA9PiB7XG4gICAgICAgIGlmIChhbmltYXRpb25UcmFjay5pc0NhbmNlbGxlZClcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcmVsYXRpdmVUaW1lID0gQW5pbWF0aW9uTWFuYWdlci5nZXRUb3RhbFBsYXlUaW1lKCkgLSBzdGFydFRpbWU7XG4gICAgICAgICAgICBjb25zdCBjb250aW51ZUFuaW1hdGlvbiA9IG9wdGlvbnMuYW5pbWF0ZShyZWxhdGl2ZVRpbWUpO1xuICAgICAgICAgICAgc3dpdGNoKGNvbnRpbnVlQW5pbWF0aW9uKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBBbmltYXRpb25TdGF0ZS5ET05FOlxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLm9uRG9uZT8uKCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgQW5pbWF0aW9uU3RhdGUuQU5JTUFUSU5HOlxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIGZ1bmMoKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmMoKTtcblxuICAgIHJldHVybiBhbmltYXRpb25UcmFjaztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBBbmltYXRpb25UaW1lck9wdGlvbnMge1xuICAgIGNhbGxiYWNrOiAoKSA9PiB2b2lkO1xuICAgIHRpbWU6IG51bWJlcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldEFuaW1hdGlvbkludGVydmFsKG9wdGlvbnM6IEFuaW1hdGlvblRpbWVyT3B0aW9ucyk6IEFuaW1hdGlvbiB7XG4gICAgY29uc3QgYW5pbWF0aW9uVHJhY2sgPSBuZXcgQW5pbWF0aW9uKCk7XG5cbiAgICBjb25zdCB0aW1lcjogVmlzaWJsZVRpbWVyID0gbmV3IFZpc2libGVUaW1lcih7XG4gICAgICAgIG9uRmlyZTogKCkgPT4ge1xuICAgICAgICAgICAgaWYgKGFuaW1hdGlvblRyYWNrLmlzQ2FuY2VsbGVkKSB7XG4gICAgICAgICAgICAgICAgdGltZXIuZGlzcG9zZSgpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG9wdGlvbnMuY2FsbGJhY2soKTtcbiAgICAgICAgfSxcbiAgICAgICAgdGltZTogb3B0aW9ucy50aW1lLFxuICAgICAgICByZXBlYXQ6IHRydWVcbiAgICB9KTtcblxuICAgIHJldHVybiBhbmltYXRpb25UcmFjaztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldEFuaW1hdGlvblRpbWVvdXQob3B0aW9uczogQW5pbWF0aW9uVGltZXJPcHRpb25zKTogQW5pbWF0aW9uIHtcbiAgICBjb25zdCBhbmltYXRpb25UcmFjayA9IG5ldyBBbmltYXRpb24oKTtcblxuICAgIGNvbnN0IHRpbWVyOiBWaXNpYmxlVGltZXIgPSBuZXcgVmlzaWJsZVRpbWVyKHtcbiAgICAgICAgb25GaXJlOiAoKSA9PiB7XG4gICAgICAgICAgICBpZiAoYW5pbWF0aW9uVHJhY2suaXNDYW5jZWxsZWQpIHtcbiAgICAgICAgICAgICAgICB0aW1lci5kaXNwb3NlKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb3B0aW9ucy5jYWxsYmFjaygpO1xuICAgICAgICB9LFxuICAgICAgICB0aW1lOiBvcHRpb25zLnRpbWUsXG4gICAgICAgIHJlcGVhdDogZmFsc2VcbiAgICB9KTtcblxuICAgIHJldHVybiBhbmltYXRpb25UcmFjaztcbn0iLCJleHBvcnQgbmFtZXNwYWNlIENhbnZhc0hlbHBlciB7XG4gICAgY29uc3QgY2FjaGVkQ2FudmFzZXM6IE1hcDxudW1iZXIsIENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRD4gPSBuZXcgTWFwKCk7XG4gICAgZXhwb3J0IGZ1bmN0aW9uIGdldFRlbXBDYW52YXMoc2l6ZTogbnVtYmVyKSB7XG4gICAgICAgIGxldCBjYW52YXMgPSBjYWNoZWRDYW52YXNlcy5nZXQoc2l6ZSk7XG4gICAgICAgIGlmICghY2FudmFzKSB7XG4gICAgICAgICAgICBjYW52YXMgPSBjcmVhdGVUZW1wQ2FudmFzKHNpemUsIHNpemUpO1xuICAgICAgICAgICAgY2FjaGVkQ2FudmFzZXMuc2V0KHNpemUsIGNhbnZhcyk7XG4gICAgICAgIH1cbiAgICAgICAgY2FudmFzLmNsZWFyUmVjdCgwLCAwLCBzaXplLCBzaXplKTtcbiAgICAgICAgcmV0dXJuIGNhbnZhcztcbiAgICB9XG5cbiAgICBleHBvcnQgZnVuY3Rpb24gY3JlYXRlVGVtcENhbnZhcyh3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcik6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCB7XG4gICAgICAgIGNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XG4gICAgICAgIGNhbnZhcy53aWR0aCA9IHdpZHRoO1xuICAgICAgICBjYW52YXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgICAgICBjb25zdCBjb250ZXh0ID0gPENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRD5jYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xuICAgICAgICBjb250ZXh0LmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xuICAgICAgICByZXR1cm4gY29udGV4dDtcbiAgICB9XG5cbiAgICBleHBvcnQgYXN5bmMgZnVuY3Rpb24gbG9hZEltYWdlKHVybDogc3RyaW5nLCBpbWdFbGVtZW50PzogSFRNTEltYWdlRWxlbWVudCk6IFByb21pc2U8SFRNTEltYWdlRWxlbWVudD4ge1xuICAgICAgICBsZXQgaW1nID0gaW1nRWxlbWVudCB8fCBuZXcgSW1hZ2UoKTtcbiAgICAgICAgbGV0IGluc3RhbnRMb2FkRnJvbUNhY2hlOiBib29sZWFuID0gZmFsc2U7XG4gICAgICAgIGltZy5vbmxvYWQgPSAoKSA9PiBpbnN0YW50TG9hZEZyb21DYWNoZSA9IHRydWU7XG4gICAgICAgIGltZy5zcmMgPSB1cmw7XG4gICAgICAgIGlmIChpbnN0YW50TG9hZEZyb21DYWNoZSlcbiAgICAgICAgICAgIHJldHVybiBpbWc7XG4gICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHJlc29sdmUgPT4gaW1nLm9ubG9hZCA9IHJlc29sdmUpO1xuICAgICAgICByZXR1cm4gaW1nO1xuICAgIH1cblxuICAgIGNvbnN0IGNhY2hlZEltYWdlQm9yZGVyczogTWFwPEhUTUxJbWFnZUVsZW1lbnQsIENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRD4gPSBuZXcgTWFwKCk7IC8vY3JlYXRlVGVtcENhbnZhcygpXG4gICAgY29uc3Qgb2Zmc2V0czogQXJyYXk8W251bWJlciwgbnVtYmVyXT4gPSBbWy0xLCAtMV0sIFswLCAtMV0sIFsxLCAtMV0sIFstMSwgMF0sIFsxLCAwXSwgWy0xLCAxXSwgWzAsIDFdLCBbMSwgMV1dO1xuICAgIGV4cG9ydCBmdW5jdGlvbiBkcmF3SW1hZ2VCb3JkZXIoaW1nOiBIVE1MSW1hZ2VFbGVtZW50LCBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgdGhpY2tuZXNzOiBudW1iZXIpIHtcbiAgICAgICAgbGV0IGJvcmRlckN0eCA9IGNhY2hlZEltYWdlQm9yZGVycy5nZXQoaW1nKTtcbiAgICAgICAgaWYgKCFib3JkZXJDdHgpIHtcbiAgICAgICAgICAgIGJvcmRlckN0eCA9IGNyZWF0ZVRlbXBDYW52YXMoPG51bWJlcj5pbWcud2lkdGgsIDxudW1iZXI+aW1nLmhlaWdodCk7XG5cbiAgICAgICAgICAgIC8vIGRyYXcgdGhlIGltYWdlIGluIDggY29tcGFzcyBvZmZzZXRzIHdpdGggc2NhbGluZ1xuICAgICAgICAgICAgZm9yIChjb25zdCBbeE9mZnNldCwgeU9mZnNldF0gb2Ygb2Zmc2V0cykge1xuICAgICAgICAgICAgICAgIGJvcmRlckN0eC5kcmF3SW1hZ2UoaW1nLCB4T2Zmc2V0ICogdGhpY2tuZXNzLCB5T2Zmc2V0ICogdGhpY2tuZXNzKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gZmlsbCBzcGxhdHRlZCBhcmVhIHdpdGggYmxhY2sgdG8gY3JlYXRlIHRoZSBib3JkZXIgcmVnaW9uXG4gICAgICAgICAgICBib3JkZXJDdHguZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ3NvdXJjZS1pbic7XG4gICAgICAgICAgICBib3JkZXJDdHguZmlsbFN0eWxlID0gJ2JsYWNrJztcbiAgICAgICAgICAgIGJvcmRlckN0eC5maWxsUmVjdCgwLCAwLCA8bnVtYmVyPmltZy53aWR0aCwgPG51bWJlcj5pbWcuaGVpZ2h0KTtcblxuICAgICAgICAgICAgY2FjaGVkSW1hZ2VCb3JkZXJzLnNldChpbWcsIGJvcmRlckN0eCk7XG4gICAgICAgIH1cbiAgICAgICAgY3R4LmRyYXdJbWFnZShib3JkZXJDdHguY2FudmFzLCAwLCAwKTtcbiAgICAgICAgY3R4LmRyYXdJbWFnZShpbWcsIDAsIDApO1xuICAgIH1cbn0iLCJleHBvcnQgY2xhc3MgVmVjdG9yMiB7XG4gICAgcHVibGljIGNvbnN0cnVjdG9yKHg6IG51bWJlciA9IDAsIHk6IG51bWJlciA9IDApIHsgdGhpcy5feCA9IHg7IHRoaXMuX3kgPSB5OyB9XG4gICAgcHVibGljIGNvcHlGcm9tKG90aGVyVmVjdG9yOiBWZWN0b3IyKTogVmVjdG9yMiB7IHRoaXMuX3ggPSBvdGhlclZlY3Rvci54OyB0aGlzLl95ID0gb3RoZXJWZWN0b3IueTsgcmV0dXJuIHRoaXM7IH1cbiAgICBwdWJsaWMgY2xvbmUoKTogVmVjdG9yMiB7IHJldHVybiBuZXcgVmVjdG9yMih0aGlzLl94LCB0aGlzLl95KTsgfVxuICAgIHB1YmxpYyBhZGQob3RoZXJWZWN0b3I6IFZlY3RvcjIpOiBWZWN0b3IyIHsgcmV0dXJuIHRoaXMuY2xvbmUoKS5hZGRJblBsYWNlKG90aGVyVmVjdG9yKTsgfVxuICAgIHB1YmxpYyBzdWJ0cmFjdChvdGhlclZlY3RvcjogVmVjdG9yMik6IFZlY3RvcjIgeyByZXR1cm4gdGhpcy5jbG9uZSgpLnN1YnRyYWN0SW5QbGFjZShvdGhlclZlY3Rvcik7IH1cbiAgICBwdWJsaWMgc3VidHJhY3RGcm9tRmxvYXRzKHg6IG51bWJlciwgeTogbnVtYmVyKTogVmVjdG9yMiB7IHJldHVybiB0aGlzLmNsb25lKCkuc3VidHJhY3RJblBsYWNlRnJvbUZsb2F0cyh4LCB5KTsgfVxuICAgIHB1YmxpYyBzY2FsZShzY2FsYXI6IG51bWJlcik6IFZlY3RvcjIgeyByZXR1cm4gdGhpcy5jbG9uZSgpLnNjYWxlSW5QbGFjZShzY2FsYXIpOyB9XG4gICAgcHVibGljIGVsZW1lbnRNdWx0aXBseSh4OiBudW1iZXIsIHk6IG51bWJlcik6IFZlY3RvcjIgeyByZXR1cm4gbmV3IFZlY3RvcjIodGhpcy5feCAqIHgsIHRoaXMuX3kgKiB5KTsgfVxuICAgIHB1YmxpYyBkb3Qob3RoZXJWZWM6IFZlY3RvcjIpOiBudW1iZXIgeyByZXR1cm4gKHRoaXMuX3ggKiBvdGhlclZlYy54ICsgdGhpcy5feSAqIG90aGVyVmVjLnkpOyB9XG4gICAgcHVibGljIGFkZEluUGxhY2VGcm9tRmxvYXRzKHg6IG51bWJlciwgeTogbnVtYmVyKTogVmVjdG9yMiB7IHRoaXMuX3ggKz0geDsgdGhpcy5feSArPSB5OyByZXR1cm4gdGhpczsgfVxuICAgIHB1YmxpYyBzdWJ0cmFjdEluUGxhY2VGcm9tRmxvYXRzKHg6IG51bWJlciwgeTogbnVtYmVyKTogVmVjdG9yMiB7IHRoaXMuX3ggLT0geDsgdGhpcy5feSAtPSB5OyByZXR1cm4gdGhpczsgfVxuICAgIHB1YmxpYyBhZGRGcm9tRmxvYXRzKHg6IG51bWJlciwgeTogbnVtYmVyKTogVmVjdG9yMiB7IHJldHVybiBuZXcgVmVjdG9yMih0aGlzLl94ICsgeCwgdGhpcy5feSArIHkpOyB9XG4gICAgcHVibGljIGFkZEluUGxhY2Uob3RoZXJWZWN0b3I6IFZlY3RvcjIpOiBWZWN0b3IyIHsgdGhpcy5feCArPSBvdGhlclZlY3Rvci5feDsgdGhpcy5feSArPSBvdGhlclZlY3Rvci5feTsgcmV0dXJuIHRoaXM7IH1cbiAgICBwdWJsaWMgc3VidHJhY3RJblBsYWNlKG90aGVyVmVjdG9yOiBWZWN0b3IyKTogVmVjdG9yMiB7IHRoaXMuX3ggLT0gb3RoZXJWZWN0b3IuX3g7IHRoaXMuX3kgLT0gb3RoZXJWZWN0b3IuX3k7IHJldHVybiB0aGlzOyB9XG4gICAgcHVibGljIHNjYWxlSW5QbGFjZShzY2FsYXI6IG51bWJlcik6IFZlY3RvcjIgeyB0aGlzLl94ICo9IHNjYWxhcjsgdGhpcy5feSAqPSBzY2FsYXI7IHJldHVybiB0aGlzOyB9XG4gICAgcHVibGljIG5vcm1hbGl6ZSgpOiBWZWN0b3IyIHsgY29uc3QgbGVuZ3RoID0gdGhpcy5sZW5ndGgoKTsgdGhpcy5feCAvPSBsZW5ndGg7IHRoaXMuX3kgLz0gbGVuZ3RoOyByZXR1cm4gdGhpczsgfVxuICAgIHB1YmxpYyBlcXVhbHMob3RoZXJWZWM6IFZlY3RvcjIpOiBib29sZWFuIHsgcmV0dXJuICh0aGlzLl94ID09IG90aGVyVmVjLnggJiYgdGhpcy5feSA9PSBvdGhlclZlYy55KSB9O1xuICAgIHB1YmxpYyBub3JtYWwoKTogVmVjdG9yMiB7IHJldHVybiBuZXcgVmVjdG9yMigtdGhpcy5feSwgdGhpcy5feCk7IH1cbiAgICBwdWJsaWMgZmxvb3IoKTogVmVjdG9yMiB7IHJldHVybiBuZXcgVmVjdG9yMihNYXRoLmZsb29yKHRoaXMuX3gpLCBNYXRoLmZsb29yKHRoaXMuX3kpKTsgfVxuICAgIHB1YmxpYyBsZW5ndGgoKTogbnVtYmVyIHsgcmV0dXJuIE1hdGguc3FydCh0aGlzLl94ICogdGhpcy5feCArIHRoaXMuX3kgKiB0aGlzLl95KTsgfVxuICAgIHB1YmxpYyByYW5kb21pemVPZmZzZXRJblBsYWNlKG1heERpc3Q6IG51bWJlciwgcmFuZG9tPzogbnVtYmVyKTogVmVjdG9yMiB7XG4gICAgICAgIHJhbmRvbSA9IHJhbmRvbSA/PyBNYXRoLnJhbmRvbSgpO1xuICAgICAgICBjb25zdCBhbmdsZSA9IHJhbmRvbSAqIE1hdGguUEkgKiAyO1xuICAgICAgICB0aGlzLl94ICs9IE1hdGguY29zKGFuZ2xlKSAqIG1heERpc3Q7XG4gICAgICAgIHRoaXMuX3kgKz0gTWF0aC5zaW4oYW5nbGUpICogbWF4RGlzdDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIHB1YmxpYyBnZXQgYW5nbGUoKTogbnVtYmVyIHsgcmV0dXJuIE1hdGguYXRhbjIodGhpcy5feSwgdGhpcy5feCk7IH1cbiAgICBwdWJsaWMgcmFuZG9taXplQW5nbGUobWluQW5nbGVEaWZmOiBudW1iZXIsIG1heEFuZ2xlRGlmZjogbnVtYmVyLCByYW5kb206IG51bWJlcik6IFZlY3RvcjIge1xuICAgICAgICByYW5kb20gPSByYW5kb20gPz8gTWF0aC5yYW5kb20oKTtcbiAgICAgICAgY29uc3QgbGVuZ3RoOiBudW1iZXIgPSB0aGlzLmxlbmd0aCgpO1xuICAgICAgICBjb25zdCBkaXIgPSByYW5kb20gPiAwLjU7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRBbmdsZTogbnVtYmVyID0gTWF0aC5hdGFuMih0aGlzLl95LCB0aGlzLl94KTtcbiAgICAgICAgY29uc3QgbmV3QW5nbGU6IG51bWJlciA9IGN1cnJlbnRBbmdsZSArIChyYW5kb20gPiAwLjUgPyAxIDogLTEpICogKG1pbkFuZ2xlRGlmZiArIChtYXhBbmdsZURpZmYgLSBtaW5BbmdsZURpZmYpICogcmFuZG9tKTtcbiAgICAgICAgcmV0dXJuIG5ldyBWZWN0b3IyKE1hdGguY29zKG5ld0FuZ2xlKSwgTWF0aC5zaW4obmV3QW5nbGUpKS5zY2FsZShsZW5ndGgpO1xuICAgIH1cbiAgICBwdWJsaWMgc3RhdGljIGZyb21BbmdsZShhbmdsZTogbnVtYmVyKTogVmVjdG9yMiB7XG4gICAgICAgIHJldHVybiBuZXcgVmVjdG9yMihNYXRoLmNvcyhhbmdsZSksIE1hdGguc2luKGFuZ2xlKSk7XG4gICAgfVxuICAgIHB1YmxpYyBzdGF0aWMgZG90KGE6IFZlY3RvcjIsIGI6IFZlY3RvcjIpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gKChhLnggKiBiLngpICsgKGEueSAqIGIueSkpO1xuICAgIH1cbiAgICBwdWJsaWMgc3RhdGljIGdldCBPbmUoKTogVmVjdG9yMiB7IHJldHVybiBuZXcgVmVjdG9yMigxLjAsIDEuMCk7IH1cbiAgICBwdWJsaWMgc3RhdGljIGdldCBaZXJvKCk6IFZlY3RvcjIgeyByZXR1cm4gbmV3IFZlY3RvcjIoMC4wLCAwLjApOyB9XG4gICAgcHVibGljIGdldCB4KCk6IG51bWJlciB7IHJldHVybiB0aGlzLl94OyB9IHB1YmxpYyBzZXQgeCh4OiBudW1iZXIpIHsgdGhpcy5feCA9IHg7IH1cbiAgICBwdWJsaWMgZ2V0IHkoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuX3k7IH0gcHVibGljIHNldCB5KHk6IG51bWJlcikgeyB0aGlzLl95ID0geTsgfVxuICAgIHByaXZhdGUgX3g6IG51bWJlcjsgcHJpdmF0ZSBfeTogbnVtYmVyO1xufVxuIiwiZXhwb3J0IGludGVyZmFjZSBNZXRhYmFsbE9wdGlvbnMge1xuICAgIHRocmVzaG9sZD86IG51bWJlcjtcbiAgICBwb2ludHM6IEFycmF5PE1ldGFQb2ludD47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTWV0YVBvaW50IHtcbiAgICB4OiBudW1iZXI7XG4gICAgeTogbnVtYmVyO1xuICAgIHI6IG51bWJlcjtcbn07XG5cbmV4cG9ydCBjbGFzcyBNZXRhYmFsbFN1cmZhY2Uge1xuICAgIHB1YmxpYyBjb25zdHJ1Y3RvcihvcHRpb25zOiBNZXRhYmFsbE9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy50aHJlc2hvbGQgPSBvcHRpb25zLnRocmVzaG9sZCA/PyAxO1xuICAgICAgICB0aGlzLnBvaW50cyA9IG9wdGlvbnMucG9pbnRzO1xuICAgIH1cblxuICAgIHB1YmxpYyBzcGFjZU9jY3VwaWVkKHg6IG51bWJlciwgeTogbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgICAgIGNvbnN0IHZhbDogbnVtYmVyID0gdGhpcy5wb2ludHMucmVkdWNlKChzdW0sIHBvaW50KSA9PiBzdW0gKyB0aGlzLmdldEFkZGl0aXZlTWV0YWJhbGxWYWx1ZShwb2ludCwgeCwgeSksIDApO1xuICAgICAgICByZXR1cm4gdmFsID4gdGhpcy50aHJlc2hvbGQ7XG4gICAgfVxuXG4gICAgcHVibGljIGdlbmVyYXRlQ2FudmFzT3V0bGluZShjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCkge1xuICAgICAgICBjb25zdCBpbWFnZURhdGEgPSBjdHguY3JlYXRlSW1hZ2VEYXRhKGN0eC5jYW52YXMud2lkdGgsIGN0eC5jYW52YXMuaGVpZ2h0KTtcbiAgICAgICAgY29uc3QgZGF0YSA9IGltYWdlRGF0YS5kYXRhO1xuXG4gICAgICAgIGxldCB4ID0gMCwgeSA9IDA7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkgKz0gNCkge1xuICAgICAgICAgICAgZGF0YVtpICsgMF0gPSB0aGlzLnNwYWNlT2NjdXBpZWQoeCwgeSkgPyAyNTUgOiAwO1xuICAgICAgICAgICAgZGF0YVtpICsgM10gPSAyNTU7XG4gICAgICAgICAgICBpZiAoKyt4ID09IGN0eC5jYW52YXMud2lkdGgpIHtcbiAgICAgICAgICAgICAgICB4ID0gMDtcbiAgICAgICAgICAgICAgICB5Kys7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjdHgucHV0SW1hZ2VEYXRhKGltYWdlRGF0YSwgMCwgMCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRBZGRpdGl2ZU1ldGFiYWxsVmFsdWUocG9pbnQ6IE1ldGFQb2ludCwgeDogbnVtYmVyLCB5OiBudW1iZXIpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gKHBvaW50LnIgKiBwb2ludC5yKSAvICgoKHggLSBwb2ludC54KSAqICh4IC0gcG9pbnQueCkpICsgKCh5IC0gcG9pbnQueSkgKiAoeSAtIHBvaW50LnkpKSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB0aHJlc2hvbGQ6IG51bWJlcjtcbiAgICBwcml2YXRlIHBvaW50czogQXJyYXk8TWV0YVBvaW50Pjtcbn0iLCIvKlxuICogVHlwZVNjcmlwdCBwb3J0IGJ5IFRoaWxvIFBsYW56XG4gKlxuICogaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vdGhpbG9wbGFuei82YWJmMDRmOTU3MTk3ZTllMzkxMlxuICovXG5cbi8qXG4gIEkndmUgd3JhcHBlZCBNYWtvdG8gTWF0c3Vtb3RvIGFuZCBUYWt1amkgTmlzaGltdXJhJ3MgY29kZSBpbiBhIG5hbWVzcGFjZVxuICBzbyBpdCdzIGJldHRlciBlbmNhcHN1bGF0ZWQuIE5vdyB5b3UgY2FuIGhhdmUgbXVsdGlwbGUgcmFuZG9tIG51bWJlciBnZW5lcmF0b3JzXG4gIGFuZCB0aGV5IHdvbid0IHN0b21wIGFsbCBvdmVyIGVhY2hvdGhlcidzIHN0YXRlLlxuICBcbiAgSWYgeW91IHdhbnQgdG8gdXNlIHRoaXMgYXMgYSBzdWJzdGl0dXRlIGZvciBNYXRoLnJhbmRvbSgpLCB1c2UgdGhlIHJhbmRvbSgpXG4gIG1ldGhvZCBsaWtlIHNvOlxuICBcbiAgdmFyIG0gPSBuZXcgTWVyc2VubmVUd2lzdGVyKCk7XG4gIHZhciByYW5kb21OdW1iZXIgPSBtLnJhbmRvbSgpO1xuICBcbiAgWW91IGNhbiBhbHNvIGNhbGwgdGhlIG90aGVyIGdlbnJhbmRfe2Zvb30oKSBtZXRob2RzIG9uIHRoZSBpbnN0YW5jZS5cbiAgSWYgeW91IHdhbnQgdG8gdXNlIGEgc3BlY2lmaWMgc2VlZCBpbiBvcmRlciB0byBnZXQgYSByZXBlYXRhYmxlIHJhbmRvbVxuICBzZXF1ZW5jZSwgcGFzcyBhbiBpbnRlZ2VyIGludG8gdGhlIGNvbnN0cnVjdG9yOlxuICB2YXIgbSA9IG5ldyBNZXJzZW5uZVR3aXN0ZXIoMTIzKTtcbiAgYW5kIHRoYXQgd2lsbCBhbHdheXMgcHJvZHVjZSB0aGUgc2FtZSByYW5kb20gc2VxdWVuY2UuXG4gIFNlYW4gTWNDdWxsb3VnaCAoYmFua3NlYW5AZ21haWwuY29tKVxuKi9cblxuLyogXG4gICBBIEMtcHJvZ3JhbSBmb3IgTVQxOTkzNywgd2l0aCBpbml0aWFsaXphdGlvbiBpbXByb3ZlZCAyMDAyLzEvMjYuXG4gICBDb2RlZCBieSBUYWt1amkgTmlzaGltdXJhIGFuZCBNYWtvdG8gTWF0c3Vtb3RvLlxuIFxuICAgQmVmb3JlIHVzaW5nLCBpbml0aWFsaXplIHRoZSBzdGF0ZSBieSB1c2luZyBpbml0X2dlbnJhbmQoc2VlZCkgIFxuICAgb3IgaW5pdF9ieV9hcnJheShpbml0X2tleSwga2V5X2xlbmd0aCkuXG4gXG4gICBDb3B5cmlnaHQgKEMpIDE5OTcgLSAyMDAyLCBNYWtvdG8gTWF0c3Vtb3RvIGFuZCBUYWt1amkgTmlzaGltdXJhLFxuICAgQWxsIHJpZ2h0cyByZXNlcnZlZC4gICAgICAgICAgICAgICAgICAgICAgICAgIFxuIFxuICAgUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0XG4gICBtb2RpZmljYXRpb24sIGFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnNcbiAgIGFyZSBtZXQ6XG4gXG4gICAgIDEuIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0XG4gICAgICAgIG5vdGljZSwgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cbiBcbiAgICAgMi4gUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZSBjb3B5cmlnaHRcbiAgICAgICAgbm90aWNlLCB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZVxuICAgICAgICBkb2N1bWVudGF0aW9uIGFuZC9vciBvdGhlciBtYXRlcmlhbHMgcHJvdmlkZWQgd2l0aCB0aGUgZGlzdHJpYnV0aW9uLlxuIFxuICAgICAzLiBUaGUgbmFtZXMgb2YgaXRzIGNvbnRyaWJ1dG9ycyBtYXkgbm90IGJlIHVzZWQgdG8gZW5kb3JzZSBvciBwcm9tb3RlIFxuICAgICAgICBwcm9kdWN0cyBkZXJpdmVkIGZyb20gdGhpcyBzb2Z0d2FyZSB3aXRob3V0IHNwZWNpZmljIHByaW9yIHdyaXR0ZW4gXG4gICAgICAgIHBlcm1pc3Npb24uXG4gXG4gICBUSElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTXG4gICBcIkFTIElTXCIgQU5EIEFOWSBFWFBSRVNTIE9SIElNUExJRUQgV0FSUkFOVElFUywgSU5DTFVESU5HLCBCVVQgTk9UXG4gICBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRCBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1JcbiAgIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFSRSBESVNDTEFJTUVELiAgSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVCBPV05FUiBPUlxuICAgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1IgQU5ZIERJUkVDVCwgSU5ESVJFQ1QsIElOQ0lERU5UQUwsIFNQRUNJQUwsXG4gICBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyAoSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sXG4gICBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTOyBMT1NTIE9GIFVTRSwgREFUQSwgT1JcbiAgIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OIEFOWSBUSEVPUlkgT0ZcbiAgIExJQUJJTElUWSwgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVCAoSU5DTFVESU5HXG4gICBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSkgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFIE9GIFRISVNcbiAgIFNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLlxuIFxuIFxuICAgQW55IGZlZWRiYWNrIGlzIHZlcnkgd2VsY29tZS5cbiAgIGh0dHA6Ly93d3cubWF0aC5zY2kuaGlyb3NoaW1hLXUuYWMuanAvfm0tbWF0L01UL2VtdC5odG1sXG4gICBlbWFpbDogbS1tYXQgQCBtYXRoLnNjaS5oaXJvc2hpbWEtdS5hYy5qcCAocmVtb3ZlIHNwYWNlKVxuKi9cblxuZXhwb3J0IGNsYXNzIE1lcnNlbm5lVHdpc3RlciB7XG4gICAgLyogUGVyaW9kIHBhcmFtZXRlcnMgKi9cbiAgICBwcml2YXRlIE4gPSA2MjQ7XG4gICAgcHJpdmF0ZSBNID0gMzk3O1xuICAgIHByaXZhdGUgTUFUUklYX0EgPSAweDk5MDhiMGRmOyAgIC8qIGNvbnN0YW50IHZlY3RvciBhICovXG4gICAgcHJpdmF0ZSBVUFBFUl9NQVNLID0gMHg4MDAwMDAwMDsgLyogbW9zdCBzaWduaWZpY2FudCB3LXIgYml0cyAqL1xuICAgIHByaXZhdGUgTE9XRVJfTUFTSyA9IDB4N2ZmZmZmZmY7IC8qIGxlYXN0IHNpZ25pZmljYW50IHIgYml0cyAqL1xuXG4gICAgcHJpdmF0ZSBtdCA9IG5ldyBBcnJheSh0aGlzLk4pOyAvKiB0aGUgYXJyYXkgZm9yIHRoZSBzdGF0ZSB2ZWN0b3IgKi9cbiAgICBwcml2YXRlIG10aSA9IHRoaXMuTiArIDE7ICAvKiBtdGk9PU4rMSBtZWFucyBtdFtOXSBpcyBub3QgaW5pdGlhbGl6ZWQgKi9cblxuICAgIGNvbnN0cnVjdG9yKHNlZWQ/OiBudW1iZXIpIHtcbiAgICAgICAgaWYgKHNlZWQgPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBzZWVkID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5pbml0X2dlbnJhbmQoc2VlZCk7XG4gICAgfVxuXG4gICAgLyogaW5pdGlhbGl6ZXMgbXRbTl0gd2l0aCBhIHNlZWQgKi9cbiAgICBwcml2YXRlIGluaXRfZ2VucmFuZChzOiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5tdFswXSA9IHMgPj4+IDA7XG4gICAgICAgIGZvciAodGhpcy5tdGkgPSAxOyB0aGlzLm10aSA8IHRoaXMuTjsgdGhpcy5tdGkrKykge1xuICAgICAgICAgICAgcyA9IHRoaXMubXRbdGhpcy5tdGkgLSAxXSBeICh0aGlzLm10W3RoaXMubXRpIC0gMV0gPj4+IDMwKTtcbiAgICAgICAgICAgIHRoaXMubXRbdGhpcy5tdGldID0gKCgoKChzICYgMHhmZmZmMDAwMCkgPj4+IDE2KSAqIDE4MTI0MzMyNTMpIDw8IDE2KSArIChzICYgMHgwMDAwZmZmZikgKiAxODEyNDMzMjUzKVxuICAgICAgICAgICAgICAgICsgdGhpcy5tdGk7XG4gICAgICAgICAgICAvKiBTZWUgS251dGggVEFPQ1AgVm9sMi4gM3JkIEVkLiBQLjEwNiBmb3IgbXVsdGlwbGllci4gKi9cbiAgICAgICAgICAgIC8qIEluIHRoZSBwcmV2aW91cyB2ZXJzaW9ucywgTVNCcyBvZiB0aGUgc2VlZCBhZmZlY3QgICAqL1xuICAgICAgICAgICAgLyogb25seSBNU0JzIG9mIHRoZSBhcnJheSBtdFtdLiAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAvKiAyMDAyLzAxLzA5IG1vZGlmaWVkIGJ5IE1ha290byBNYXRzdW1vdG8gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXMubXRbdGhpcy5tdGldID4+Pj0gMDtcbiAgICAgICAgICAgIC8qIGZvciA+MzIgYml0IG1hY2hpbmVzICovXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiBpbml0aWFsaXplIGJ5IGFuIGFycmF5IHdpdGggYXJyYXktbGVuZ3RoICovXG4gICAgLyogaW5pdF9rZXkgaXMgdGhlIGFycmF5IGZvciBpbml0aWFsaXppbmcga2V5cyAqL1xuICAgIC8qIGtleV9sZW5ndGggaXMgaXRzIGxlbmd0aCAqL1xuICAgIC8qIHNsaWdodCBjaGFuZ2UgZm9yIEMrKywgMjAwNC8yLzI2ICovXG4gICAgaW5pdF9ieV9hcnJheShpbml0X2tleTogQXJyYXk8bnVtYmVyPiwga2V5X2xlbmd0aDogbnVtYmVyKSB7XG4gICAgICAgIHZhciBpLCBqLCBrO1xuICAgICAgICB0aGlzLmluaXRfZ2VucmFuZCgxOTY1MDIxOCk7XG4gICAgICAgIGkgPSAxOyBqID0gMDtcbiAgICAgICAgayA9ICh0aGlzLk4gPiBrZXlfbGVuZ3RoID8gdGhpcy5OIDoga2V5X2xlbmd0aCk7XG4gICAgICAgIGZvciAoOyBrOyBrLS0pIHtcbiAgICAgICAgICAgIHZhciBzID0gdGhpcy5tdFtpIC0gMV0gXiAodGhpcy5tdFtpIC0gMV0gPj4+IDMwKVxuICAgICAgICAgICAgdGhpcy5tdFtpXSA9ICh0aGlzLm10W2ldIF4gKCgoKChzICYgMHhmZmZmMDAwMCkgPj4+IDE2KSAqIDE2NjQ1MjUpIDw8IDE2KSArICgocyAmIDB4MDAwMGZmZmYpICogMTY2NDUyNSkpKVxuICAgICAgICAgICAgICAgICsgaW5pdF9rZXlbal0gKyBqOyAvKiBub24gbGluZWFyICovXG4gICAgICAgICAgICB0aGlzLm10W2ldID4+Pj0gMDsgLyogZm9yIFdPUkRTSVpFID4gMzIgbWFjaGluZXMgKi9cbiAgICAgICAgICAgIGkrKzsgaisrO1xuICAgICAgICAgICAgaWYgKGkgPj0gdGhpcy5OKSB7IHRoaXMubXRbMF0gPSB0aGlzLm10W3RoaXMuTiAtIDFdOyBpID0gMTsgfVxuICAgICAgICAgICAgaWYgKGogPj0ga2V5X2xlbmd0aCkgaiA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChrID0gdGhpcy5OIC0gMTsgazsgay0tKSB7XG4gICAgICAgICAgICB2YXIgcyA9IHRoaXMubXRbaSAtIDFdIF4gKHRoaXMubXRbaSAtIDFdID4+PiAzMCk7XG4gICAgICAgICAgICB0aGlzLm10W2ldID0gKHRoaXMubXRbaV0gXiAoKCgoKHMgJiAweGZmZmYwMDAwKSA+Pj4gMTYpICogMTU2NjA4Mzk0MSkgPDwgMTYpICsgKHMgJiAweDAwMDBmZmZmKSAqIDE1NjYwODM5NDEpKVxuICAgICAgICAgICAgICAgIC0gaTsgLyogbm9uIGxpbmVhciAqL1xuICAgICAgICAgICAgdGhpcy5tdFtpXSA+Pj49IDA7IC8qIGZvciBXT1JEU0laRSA+IDMyIG1hY2hpbmVzICovXG4gICAgICAgICAgICBpKys7XG4gICAgICAgICAgICBpZiAoaSA+PSB0aGlzLk4pIHsgdGhpcy5tdFswXSA9IHRoaXMubXRbdGhpcy5OIC0gMV07IGkgPSAxOyB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm10WzBdID0gMHg4MDAwMDAwMDsgLyogTVNCIGlzIDE7IGFzc3VyaW5nIG5vbi16ZXJvIGluaXRpYWwgYXJyYXkgKi9cbiAgICB9XG5cbiAgICAvKiBnZW5lcmF0ZXMgYSByYW5kb20gbnVtYmVyIG9uIFswLDB4ZmZmZmZmZmZdLWludGVydmFsICovXG4gICAgZ2VucmFuZF9pbnQzMigpIHtcbiAgICAgICAgdmFyIHk7XG4gICAgICAgIHZhciBtYWcwMSA9IG5ldyBBcnJheSgweDAsIHRoaXMuTUFUUklYX0EpO1xuICAgICAgICAvKiBtYWcwMVt4XSA9IHggKiBNQVRSSVhfQSAgZm9yIHg9MCwxICovXG5cbiAgICAgICAgaWYgKHRoaXMubXRpID49IHRoaXMuTikgeyAvKiBnZW5lcmF0ZSBOIHdvcmRzIGF0IG9uZSB0aW1lICovXG4gICAgICAgICAgICB2YXIga2s7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLm10aSA9PSB0aGlzLk4gKyAxKSAgIC8qIGlmIGluaXRfZ2VucmFuZCgpIGhhcyBub3QgYmVlbiBjYWxsZWQsICovXG4gICAgICAgICAgICAgICAgdGhpcy5pbml0X2dlbnJhbmQoNTQ4OSk7IC8qIGEgZGVmYXVsdCBpbml0aWFsIHNlZWQgaXMgdXNlZCAqL1xuXG4gICAgICAgICAgICBmb3IgKGtrID0gMDsga2sgPCB0aGlzLk4gLSB0aGlzLk07IGtrKyspIHtcbiAgICAgICAgICAgICAgICB5ID0gKHRoaXMubXRba2tdICYgdGhpcy5VUFBFUl9NQVNLKSB8ICh0aGlzLm10W2trICsgMV0gJiB0aGlzLkxPV0VSX01BU0spO1xuICAgICAgICAgICAgICAgIHRoaXMubXRba2tdID0gdGhpcy5tdFtrayArIHRoaXMuTV0gXiAoeSA+Pj4gMSkgXiBtYWcwMVt5ICYgMHgxXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvciAoOyBrayA8IHRoaXMuTiAtIDE7IGtrKyspIHtcbiAgICAgICAgICAgICAgICB5ID0gKHRoaXMubXRba2tdICYgdGhpcy5VUFBFUl9NQVNLKSB8ICh0aGlzLm10W2trICsgMV0gJiB0aGlzLkxPV0VSX01BU0spO1xuICAgICAgICAgICAgICAgIHRoaXMubXRba2tdID0gdGhpcy5tdFtrayArICh0aGlzLk0gLSB0aGlzLk4pXSBeICh5ID4+PiAxKSBeIG1hZzAxW3kgJiAweDFdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgeSA9ICh0aGlzLm10W3RoaXMuTiAtIDFdICYgdGhpcy5VUFBFUl9NQVNLKSB8ICh0aGlzLm10WzBdICYgdGhpcy5MT1dFUl9NQVNLKTtcbiAgICAgICAgICAgIHRoaXMubXRbdGhpcy5OIC0gMV0gPSB0aGlzLm10W3RoaXMuTSAtIDFdIF4gKHkgPj4+IDEpIF4gbWFnMDFbeSAmIDB4MV07XG5cbiAgICAgICAgICAgIHRoaXMubXRpID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIHkgPSB0aGlzLm10W3RoaXMubXRpKytdO1xuXG4gICAgICAgIC8qIFRlbXBlcmluZyAqL1xuICAgICAgICB5IF49ICh5ID4+PiAxMSk7XG4gICAgICAgIHkgXj0gKHkgPDwgNykgJiAweDlkMmM1NjgwO1xuICAgICAgICB5IF49ICh5IDw8IDE1KSAmIDB4ZWZjNjAwMDA7XG4gICAgICAgIHkgXj0gKHkgPj4+IDE4KTtcblxuICAgICAgICByZXR1cm4geSA+Pj4gMDtcbiAgICB9XG5cbiAgICAvKiBnZW5lcmF0ZXMgYSByYW5kb20gbnVtYmVyIG9uIFswLDB4N2ZmZmZmZmZdLWludGVydmFsICovXG4gICAgZ2VucmFuZF9pbnQzMSgpIHtcbiAgICAgICAgcmV0dXJuICh0aGlzLmdlbnJhbmRfaW50MzIoKSA+Pj4gMSk7XG4gICAgfVxuXG4gICAgLyogZ2VuZXJhdGVzIGEgcmFuZG9tIG51bWJlciBvbiBbMCwxXS1yZWFsLWludGVydmFsICovXG4gICAgZ2VucmFuZF9yZWFsMSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2VucmFuZF9pbnQzMigpICogKDEuMCAvIDQyOTQ5NjcyOTUuMCk7XG4gICAgICAgIC8qIGRpdmlkZWQgYnkgMl4zMi0xICovXG4gICAgfVxuXG4gICAgLyogZ2VuZXJhdGVzIGEgcmFuZG9tIG51bWJlciBvbiBbMCwxKS1yZWFsLWludGVydmFsICovXG4gICAgcmFuZG9tKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZW5yYW5kX2ludDMyKCkgKiAoMS4wIC8gNDI5NDk2NzI5Ni4wKTtcbiAgICAgICAgLyogZGl2aWRlZCBieSAyXjMyICovXG4gICAgfVxuXG4gICAgLyogZ2VuZXJhdGVzIGEgcmFuZG9tIG51bWJlciBvbiAoMCwxKS1yZWFsLWludGVydmFsICovXG4gICAgZ2VucmFuZF9yZWFsMygpIHtcbiAgICAgICAgcmV0dXJuICh0aGlzLmdlbnJhbmRfaW50MzIoKSArIDAuNSkgKiAoMS4wIC8gNDI5NDk2NzI5Ni4wKTtcbiAgICAgICAgLyogZGl2aWRlZCBieSAyXjMyICovXG4gICAgfVxuXG4gICAgLyogZ2VuZXJhdGVzIGEgcmFuZG9tIG51bWJlciBvbiBbMCwxKSB3aXRoIDUzLWJpdCByZXNvbHV0aW9uKi9cbiAgICBnZW5yYW5kX3JlczUzKCkge1xuICAgICAgICB2YXIgYSA9IHRoaXMuZ2VucmFuZF9pbnQzMigpID4+PiA1LCBiID0gdGhpcy5nZW5yYW5kX2ludDMyKCkgPj4+IDY7XG4gICAgICAgIHJldHVybiAoYSAqIDY3MTA4ODY0LjAgKyBiKSAqICgxLjAgLyA5MDA3MTk5MjU0NzQwOTkyLjApO1xuICAgIH1cblxuICAgIC8qIFRoZXNlIHJlYWwgdmVyc2lvbnMgYXJlIGR1ZSB0byBJc2FrdSBXYWRhLCAyMDAyLzAxLzA5IGFkZGVkICovXG59IiwiaW1wb3J0IHsgTWVyc2VubmVUd2lzdGVyIH0gZnJvbSBcIi4vbWVyc2VubmVUd2lzdGVyXCI7XG5pbXBvcnQgeyBQUk5HIH0gZnJvbSBcIi4vcHJuZ1wiO1xuXG5leHBvcnQgY2xhc3MgTWVyc2VubmVUd2lzdGVyQWRhcHRlciBpbXBsZW1lbnRzIFBSTkcge1xuICAgIHB1YmxpYyBpbml0KHNlZWQ6IG51bWJlcik6IHZvaWQge1xuICAgICAgICB0aGlzLm1lcnNlbm5lVHdpc3RlciA9IG5ldyBNZXJzZW5uZVR3aXN0ZXIoc2VlZCk7XG4gICAgfVxuICAgIHB1YmxpYyByYW5kb20oKTogbnVtYmVyIHtcbiAgICAgICAgY29uc29sZS5hc3NlcnQodGhpcy5tZXJzZW5uZVR3aXN0ZXIpO1xuICAgICAgICBjb25zdCB0d2lzdGVyID0gPE1lcnNlbm5lVHdpc3Rlcj50aGlzLm1lcnNlbm5lVHdpc3RlcjtcbiAgICAgICAgcmV0dXJuIHR3aXN0ZXIucmFuZG9tKCk7XG4gICAgfVxuICAgIHB1YmxpYyBmbG9hdEluUmFuZ2UobWluOiBudW1iZXIsIG1heDogbnVtYmVyKTogbnVtYmVyIHtcbiAgICAgICAgY29uc29sZS5hc3NlcnQodGhpcy5tZXJzZW5uZVR3aXN0ZXIpO1xuICAgICAgICBjb25zdCB0d2lzdGVyID0gPE1lcnNlbm5lVHdpc3Rlcj50aGlzLm1lcnNlbm5lVHdpc3RlcjtcbiAgICAgICAgcmV0dXJuIG1pbiArIHR3aXN0ZXIucmFuZG9tKCkgKiAobWF4IC0gbWluKTtcbiAgICB9XG4gICAgcHVibGljIGludEluUmFuZ2UobWluOiBudW1iZXIsIG1heDogbnVtYmVyKTogbnVtYmVyIHtcbiAgICAgICAgY29uc29sZS5hc3NlcnQodGhpcy5tZXJzZW5uZVR3aXN0ZXIpO1xuICAgICAgICBjb25zdCB0d2lzdGVyID0gPE1lcnNlbm5lVHdpc3Rlcj50aGlzLm1lcnNlbm5lVHdpc3RlcjtcbiAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IobWluICsgdHdpc3Rlci5yYW5kb20oKSAqIChtYXggLSBtaW4gKyAxKSk7XG4gICAgfVxuICAgIHByaXZhdGUgbWVyc2VubmVUd2lzdGVyPzogTWVyc2VubmVUd2lzdGVyO1xufSIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IHsgQm9uc2FpR2VuZXJhdG9yIH0gZnJvbSBcIi4vdHJlZS90eXBlcy9ib25zYWkvYm9uc2FpR2VuZXJhdG9yLmpzXCI7XG5cbmZ1bmN0aW9uIGRvd25sb2FkKGZpbGVuYW1lOiBzdHJpbmcsIHRleHQ6IHN0cmluZykge1xuICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCAnZGF0YTp0ZXh0L3BsYWluO2NoYXJzZXQ9dXRmLTgsJyArIGVuY29kZVVSSUNvbXBvbmVudCh0ZXh0KSk7XG4gICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2Rvd25sb2FkJywgZmlsZW5hbWUpO1xuXG4gICAgZWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZWxlbWVudCk7XG5cbiAgICBlbGVtZW50LmNsaWNrKCk7XG5cbiAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGVsZW1lbnQpO1xufVxuXG5mdW5jdGlvbiBjeXJiNTMoc3RyOiBzdHJpbmcsIHNlZWQ6IG51bWJlciA9IDApIHtcbiAgICBsZXQgaDEgPSAweGRlYWRiZWVmIF4gc2VlZCwgaDIgPSAweDQxYzZjZTU3IF4gc2VlZDtcbiAgICBmb3IobGV0IGkgPSAwLCBjaDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xuICAgICAgY2ggPSBzdHIuY2hhckNvZGVBdChpKTtcbiAgICAgIGgxID0gTWF0aC5pbXVsKGgxIF4gY2gsIDI2NTQ0MzU3NjEpO1xuICAgICAgaDIgPSBNYXRoLmltdWwoaDIgXiBjaCwgMTU5NzMzNDY3Nyk7XG4gICAgfVxuICAgIGgxICA9IE1hdGguaW11bChoMSBeIChoMSA+Pj4gMTYpLCAyMjQ2ODIyNTA3KTtcbiAgICBoMSBePSBNYXRoLmltdWwoaDIgXiAoaDIgPj4+IDEzKSwgMzI2NjQ4OTkwOSk7XG4gICAgaDIgID0gTWF0aC5pbXVsKGgyIF4gKGgyID4+PiAxNiksIDIyNDY4MjI1MDcpO1xuICAgIGgyIF49IE1hdGguaW11bChoMSBeIChoMSA+Pj4gMTMpLCAzMjY2NDg5OTA5KTtcbiAgICByZXR1cm4gNDI5NDk2NzI5NiAqICgyMDk3MTUxICYgaDIpICsgKGgxID4+PiAwKTtcbn07XG5cblxuKGFzeW5jICgpID0+IHtcbiAgICBjb25zdCBTVEFSVElOR19TRUVEID0gMjU2ODtcbiAgICBjb25zdCBTVEFSVElOR19URVhUID0gXCJaRU5JVFVERVwiO1xuXG4gICAgYXdhaXQgQm9uc2FpR2VuZXJhdG9yLmxvYWRSZXNvdXJjZXMoKTtcblxuICAgIGxldCBib25zYWlHZW5lcmF0b3I6IEJvbnNhaUdlbmVyYXRvcjtcbiAgICBsZXQgc2VlZDogbnVtYmVyIHwgbnVsbCA9IG51bGw7XG5cbiAgICBjb25zdCBidG5TZXJpYWxpemUgPSAgPEhUTUxEaXZFbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNidG5TZXJpYWxpemUnKTtcbiAgICBjb25zdCBidG5SZWdlbmVyYXRlID0gPEhUTUxEaXZFbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNidG5SZWdlbmVyYXRlJyk7XG4gICAgY29uc3QgaW5wU2VlZFRleHQgPSA8SFRNTElucHV0RWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjaW5wU2VlZFRleHQnKTtcbiAgICBjb25zdCB0cmVlQ29udGFpbmVyID0gPEhUTUxEaXZFbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyN0cmVlR2VuZXJhdG9yQ29udGFpbmVyJyk7XG5cbiAgICBsZXQgZmlyc3QgPSB0cnVlO1xuICAgIGFzeW5jIGZ1bmN0aW9uIGdlbmVyYXRlQm9uc2FpKCkge1xuICAgICAgICAvLyBjYWxjdWxhdGUgbnVtZXJpYyBzZWVkXG4gICAgICAgIGlmIChmaXJzdCkge1xuICAgICAgICAgICAgaW5wU2VlZFRleHQudmFsdWUgPSBTVEFSVElOR19URVhUO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpbnBTZWVkVGV4dC52YWx1ZSkge1xuICAgICAgICAgICAgLy8gZnJvbSBlbnRlcmVkIHN0cmluZ1xuICAgICAgICAgICAgc2VlZCA9IGN5cmI1MyhpbnBTZWVkVGV4dC52YWx1ZS50b1VwcGVyQ2FzZSgpKTtcbiAgICAgICAgICAgIGlmIChmaXJzdCB8fCAoU1RBUlRJTkdfVEVYVCA9PSBpbnBTZWVkVGV4dC52YWx1ZSkpXG4gICAgICAgICAgICAgICAgc2VlZCA9IFNUQVJUSU5HX1NFRUQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyByYW5kb21cbiAgICAgICAgICAgIHNlZWQgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMDAwMCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBkZXRlcm1pbmUgaWYgc2VyaWFsaXplZCBqc29uIHByZXNlbnRcbiAgICAgICAgY29uc3Qgc2VyaWFsaXplZEpTT04gPSBmaXJzdCA/IFxuICAgICAgICAgICAgYXdhaXQgKChhd2FpdCBmZXRjaChgLi9yZXNvdXJjZXMvYm9uc2FpL3NlcmlhbGl6ZWQvdHJlZV9zZXJpYWxpemVkXyR7c2VlZH0uanNvbmApKS5qc29uKCkpIDogXG4gICAgICAgICAgICBudWxsO1xuXG4gICAgICAgIC8vIHNldCB0aGUgcmVuZGVyaW5nIHNjYWxlXG4gICAgICAgIGNvbnN0IHJlc29sdXRpb25TY2FsYXIgPSAod2luZG93LnNjcmVlbi5oZWlnaHQgLyBCb25zYWlHZW5lcmF0b3IuUkVGRVJFTkNFX0hFSUdIVCkgKiB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbztcblxuICAgICAgICAvLyBkZXN0cm95IGV4aXN0aW5nIGJvbnNhaSBpZiBwcmVzZW50XG4gICAgICAgIGlmIChib25zYWlHZW5lcmF0b3IpXG4gICAgICAgICAgICBib25zYWlHZW5lcmF0b3IuZGVzdHJveSgpO1xuXG4gICAgICAgIC8vIGNyZWF0ZSBuZXcgYm9uc2FpXG4gICAgICAgIGNvbnNvbGUubG9nKGBTdGFydGluZyBnZW5lcmF0aW9uIHdpdGggc2VlZDogJHtzZWVkfWApO1xuICAgICAgICBib25zYWlHZW5lcmF0b3IgPSBuZXcgQm9uc2FpR2VuZXJhdG9yKHsgXG4gICAgICAgICAgICBwYXJlbnRDb250YWluZXI6IHRyZWVDb250YWluZXIsIFxuICAgICAgICAgICAgZGVidWdnaW5nOiBmYWxzZSwgXG4gICAgICAgICAgICByZW5kZXJTY2FsaW5nOiByZXNvbHV0aW9uU2NhbGFyLCBcbiAgICAgICAgICAgIHNlZWQ6IHNlZWQhLCBcbiAgICAgICAgICAgIHNlcmlhbGl6ZWRKU09OOiBzZXJpYWxpemVkSlNPTiA/PyB1bmRlZmluZWRcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZmlyc3QgPSBmYWxzZTtcblxuICAgICAgICAvLyBzdGFydCBncm93dGhcbiAgICAgICAgYm9uc2FpR2VuZXJhdG9yLmdyb3coKTtcbiAgICB9XG5cbiAgICBidG5TZXJpYWxpemUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHNlcmlhbGl6ZWRKU09OID0gYm9uc2FpR2VuZXJhdG9yLmdldFNlcmlhbGl6ZWRKU09OKCk7XG4gICAgICAgIGRvd25sb2FkKGB0cmVlX3NlcmlhbGl6ZWRfJHtzZWVkfS5qc29uYCwgc2VyaWFsaXplZEpTT04pO1xuICAgIH0pO1xuXG4gICAgYnRuUmVnZW5lcmF0ZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgYm9uc2FpR2VuZXJhdG9yPy5kZXN0cm95KCk7XG4gICAgICAgIGdlbmVyYXRlQm9uc2FpKCk7XG4gICAgfSk7XG5cbiAgICBnZW5lcmF0ZUJvbnNhaSgpO1xufSkoKTtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==