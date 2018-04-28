export interface PrintableCube {
    /**
     * Width of the cube. Scaled to be between 0 and 1
     */
    readonly width: number;

    /**
     * Height of the cube. Scaled to be between 0 and 1
     */
    readonly height: number;

    readonly front: string;
    readonly left: string;
    readonly right: string;
    readonly back: string;
    readonly top: string;
    readonly bottom: string
}