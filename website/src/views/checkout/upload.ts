import { CubeData } from "../../3d_renderer";
import { PrintableCube } from "gif-cube-shared";

/**
 * Convert the cubedata to json
 */
export const toUpload = (cubeData: CubeData): PrintableCube => {
    const dataCanvas = document.createElement('canvas')

    const ctx = dataCanvas.getContext('2d')
    if (!ctx) {
        throw new Error('Could not create canvas');
    }

    const width = cubeData.width;
    const height = cubeData.height;

    const output: any = { width, height };
    for (const face of ['front', 'left', 'back', 'right', 'top', 'bottom']) {
        const data = cubeData[face as keyof CubeData] as ImageData;
        dataCanvas.width = data.width
        dataCanvas.height = data.height

        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, data.width, data.height);

        ctx.putImageData(data, 0, 0);
        const out = dataCanvas.toDataURL();
        if (!out.startsWith('data:image/png;base64,')) {
            throw new Error('Could not create img');
        }
        output[face] = out.replace(/^data:image\/png;base64,/, '')
    }
    return output;
}