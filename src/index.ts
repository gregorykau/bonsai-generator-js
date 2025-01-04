import { BonsaiGenerator } from "./tree/types/bonsai/bonsaiGenerator.js";

function download(filename: string, text: string) {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

function cyrb53(str: string, seed: number = 0) {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for(let i = 0, ch; i < str.length; i++) {
      ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1  = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2  = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};


(async () => {
    const STARTING_SEED = 2568;
    const STARTING_TEXT = "ZENITUDE";

    await BonsaiGenerator.loadResources();

    let bonsaiGenerator: BonsaiGenerator;
    let seed: number | null = null;

    const btnSerialize =  <HTMLDivElement>document.querySelector('#btnSerialize');
    const btnRegenerate = <HTMLDivElement>document.querySelector('#btnRegenerate');
    const inpSeedText = <HTMLInputElement>document.querySelector('#inpSeedText');
    const treeContainer = <HTMLDivElement>document.querySelector('#treeGeneratorContainer');

    let first = true;
    async function generateBonsai() {
        // calculate numeric seed
        if (first) {
            inpSeedText.value = STARTING_TEXT;
        }
        if (inpSeedText.value) {
            // from entered string
            seed = cyrb53(inpSeedText.value.toUpperCase());
            if (first || (STARTING_TEXT == inpSeedText.value))
                seed = STARTING_SEED;
        } else {
            // random
            seed = Math.floor(Math.random() * 10000);
        }

        // determine if serialized json present
        const serializedJSON = first ? 
            await ((await fetch(`./resources/bonsai/serialized/tree_serialized_${seed}.json`)).json()) : 
            null;

        // set the rendering scale
        const resolutionScalar = (window.screen.height / BonsaiGenerator.REFERENCE_HEIGHT) * window.devicePixelRatio;

        // destroy existing bonsai if present
        if (bonsaiGenerator)
            bonsaiGenerator.destroy();

        // create new bonsai
        console.log(`Starting generation with seed: ${seed}`);
        bonsaiGenerator = new BonsaiGenerator({ 
            parentContainer: treeContainer, 
            debugging: false, 
            renderScaling: resolutionScalar, 
            seed: seed!, 
            serializedJSON: serializedJSON ?? undefined
        });

        first = false;

        // start growth
        bonsaiGenerator.grow();
    }

    btnSerialize.addEventListener('click', () => {
        const serializedJSON = bonsaiGenerator.getSerializedJSON();
        download(`tree_serialized_${seed}.json`, serializedJSON);
    });

    btnRegenerate.addEventListener('click', () => {
        bonsaiGenerator?.destroy();
        generateBonsai();
    });

    generateBonsai();
})();
