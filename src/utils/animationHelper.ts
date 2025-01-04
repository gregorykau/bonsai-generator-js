namespace AnimationManager {
    let totalHiddenTime: number = 0;
    let hiddenStartTime: number = 0;
    
    let animationExplicitPaused: boolean = false;
    let animationPlay: boolean = true;

    setupPauseListeners();

    function refreshPlayingStatus() {
        const animationPlayNow = (
            document.visibilityState == 'visible' && 
            !animationExplicitPaused
        );

        if (animationPlay == animationPlayNow) {
            // unchanged
            return;
        } else if (animationPlayNow) {
            // start
            totalHiddenTime += (performance.now() - hiddenStartTime);
        } else {
            // stop
            hiddenStartTime = performance.now();
        }
    
        animationPlay = animationPlayNow;

        onEvent.dispatchEvent(new CustomEvent(animationPlay ? 'start' : 'stop', {
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
        })
        document.addEventListener('keyup', (e) => {
            if ((e.key != 'p'))
                return;
            animationExplicitPaused = false;
            refreshPlayingStatus();
        });
    }

    export function getTotalPlayTime() {
        return performance.now() - getTotalPausedTime();
    }

    export function getTotalPausedTime() {
        if (animationPlay) {
            return totalHiddenTime;
        } else {
            return totalHiddenTime +  (performance.now() - hiddenStartTime);
        }
    }

    export function isPlaying() {
        return animationPlay;
    }

    export const onEvent = new EventTarget();
}

interface VisibleTimerOptions {
    onFire: () => void,
    time: number,
    repeat: boolean
}

class VisibleTimer {
    public constructor(options: VisibleTimerOptions) {
        this.options = options;
        this.deltaStartT = performance.now();

        AnimationManager.onEvent.addEventListener('start', this.animationStartListener = () => this.start());
        AnimationManager.onEvent.addEventListener('stop', this.animationStopListener = () => this.stop());

        if (AnimationManager.isPlaying())
            this.start();
    }

    private stop() {
        this.deltaT += (performance.now() - this.deltaStartT);
        clearTimeout(this.timeout);
    }

    private start() {
        this.deltaStartT = performance.now();
        const timeRemaining = (this.options.time - this.deltaT);
        this.timeout = setTimeout(() => this.fire(), timeRemaining);
    }

    private fire() {
        this.options.onFire();
        if (this.options.repeat) {
            this.deltaT = 0;
            this.start();
        } else {
            this.dispose();
        }
    };

    public dispose() {
        clearTimeout(this.timeout);
        AnimationManager.onEvent.removeEventListener('start', this.animationStartListener);
        AnimationManager.onEvent.removeEventListener('stop', this.animationStopListener);
    }

    private animationStartListener: (e: any) => void;
    private animationStopListener: (e: any) => void;

    private options: VisibleTimerOptions;

    private timeout: any = null;
    private deltaStartT: number = 0;
    private deltaT: number = 0;
}

export class AnimationGroup {
    public addAnimation(track: Animation): Animation {
        this.tracks.push(track);
        return track;
    }
    public cancel() {
        this.tracks.forEach((track) => track.cancel());
    }
    private tracks: Array<Animation> = [];
}

export class Animation {
    public cancel() {
        this.cancelled = true;
    }
    public get isCancelled(): boolean { return this.cancelled; }
    private cancelled: boolean = false;
}


export enum AnimationState { ANIMATING, DONE };
export interface AnimationOptions {
    animate: (t: number) => AnimationState | void;
    onBefore?: () => void;
    onDone?: () => void;
}

export function startAnimation(options: AnimationOptions): Animation {
    const animationTrack = new Animation();
    const startTime = AnimationManager.getTotalPlayTime();
    
    options.onBefore?.();

    const func = () => {
        if (animationTrack.isCancelled)
            return;

        requestAnimationFrame(() => {
            const relativeTime = AnimationManager.getTotalPlayTime() - startTime;
            const continueAnimation = options.animate(relativeTime);
            switch(continueAnimation) {
                case AnimationState.DONE:
                    options.onDone?.();
                    break;
                case AnimationState.ANIMATING:
                default:
                    func();
                    break;
            }
        });
    }

    func();

    return animationTrack;
}

export interface AnimationTimerOptions {
    callback: () => void;
    time: number;
}

export function setAnimationInterval(options: AnimationTimerOptions): Animation {
    const animationTrack = new Animation();

    const timer: VisibleTimer = new VisibleTimer({
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

export function setAnimationTimeout(options: AnimationTimerOptions): Animation {
    const animationTrack = new Animation();

    const timer: VisibleTimer = new VisibleTimer({
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