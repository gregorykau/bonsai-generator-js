export interface PRNG {
    init(seed: number): void;
    random(): number;
    floatInRange(min: number, max: number): number;
    intInRange(min: number, max: number): number;
}