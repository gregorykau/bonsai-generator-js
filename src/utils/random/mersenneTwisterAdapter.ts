import { MersenneTwister } from "./mersenneTwister";
import { PRNG } from "./prng";

export class MersenneTwisterAdapter implements PRNG {
    public init(seed: number): void {
        this.mersenneTwister = new MersenneTwister(seed);
    }
    public random(): number {
        console.assert(this.mersenneTwister);
        const twister = <MersenneTwister>this.mersenneTwister;
        return twister.random();
    }
    public floatInRange(min: number, max: number): number {
        console.assert(this.mersenneTwister);
        const twister = <MersenneTwister>this.mersenneTwister;
        return min + twister.random() * (max - min);
    }
    public intInRange(min: number, max: number): number {
        console.assert(this.mersenneTwister);
        const twister = <MersenneTwister>this.mersenneTwister;
        return Math.floor(min + twister.random() * (max - min + 1));
    }
    private mersenneTwister?: MersenneTwister;
}