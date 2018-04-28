import { Product } from 'gif-cube-shared';

export class Order {
    public static forProduct(product: Product): Order {
        return new Order(product);
    }

    private constructor(
        public readonly product: Product
    ) { }

    public get totalCost(): number {
        return this.product.baseCost + this.shippingCost!;
    }

    public get shippingCost(): number {
        // Using fixed shipping cost
        return 10;
    }
}