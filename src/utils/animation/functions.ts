export namespace AnimationFunctions {
    export const sigmoid_0_1 = (t: number) => 2 * (-0.5 + 1 / (1 + Math.exp(-t)));
}