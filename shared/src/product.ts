export enum ProductType {
    unknown = 'unknown',
    cube15 = 'cube15',
    cube25 = 'cube25'
}

export namespace ProductType {
    export function fromString(value: string) {
        switch (value) {
            case ProductType.cube15:
                return ProductType.cube15;

            case ProductType.cube25:
                return ProductType.cube25;

            default:
                return ProductType.unknown;
        }
    }
}

export interface Product {
    readonly type: ProductType
    readonly title: string
    readonly description: string
    readonly baseCost: number;
    readonly scale: number;
}

export const products = new Map<ProductType, Product>([
    [ProductType.cube15, {
        type: ProductType.cube15,
        title: 'Cube',
        description: '1.5 inch cube.',
        baseCost: 25.00,
        scale: 1.5
    }],
    [ProductType.cube25, {
        type: ProductType.cube25,
        title: 'Big Cube',
        description: '2.5 inch cube.',
        baseCost: 60.00,
        scale: 2.5
    }],
]);