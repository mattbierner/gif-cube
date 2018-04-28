import { Address, products } from 'gif-cube-shared';
import * as React from 'react';
import { Elements, ReactStripeElements, StripeProvider, injectStripe } from 'react-stripe-elements';
import { SiteFooter } from '../../components/footer';
import * as config from '../../config';
import { Gif } from '../../load_gif';
import { Order } from '../../model/order';
import { ShippingForm } from './address';
import { CostOverview } from './cost_overview';
import { PaymentSection } from './payment_section';
import { ProductList } from './products';
import { PreviewCube } from '../../components/preview_cube';
import { CubeData } from '3d_renderer';
import { toUpload } from './upload';

interface CheckoutViewProps {
    gif: Gif

    cubeData: CubeData;

    onDidOrder: (orderId: string) => void
}

interface CheckoutViewState {
    order: Order
    address: Address
    email: string;
}


export class CheckoutView extends React.Component<CheckoutViewProps, CheckoutViewState> {
    constructor(props: CheckoutViewProps) {
        super(props)
        this.state = {
            order: Order.forProduct(Array.from(products.values())[0]),
            address: Address.empty,
            email: '',
        }
    }

    render() {
        return (
            <StripeProvider apiKey={config.stipePublicKey}>
                <Elements>
                    <div>
                        <div className='page checkout-page'>
                            <PreviewCube
                                imageData={this.props.gif}
                                sampleWidth={256}
                                sampleHeight={256}
                                modifyCube={this.modifyCube.bind(this)}
                                hideAxisMarkers={true} />

                            <CheckoutForm
                                order={this.state.order}
                                onDidOrder={this.props.onDidOrder}
                                address={this.state.address}
                                onUpdateOrder={newOrder => this.updateOrder(newOrder)}
                                onUpdateAddress={newAddress => this.updateAddress(newAddress)}
                                cubeData={this.props.cubeData}
                                email={this.state.email}
                                onUpdateEmail={newEmail => { this.setState({ email: newEmail }) }} />
                        </div>
                        <div className='spacer' />
                        <SiteFooter />
                    </div>
                </Elements>
            </StripeProvider>
        )
    }

    private updateOrder(newOrder: Order) {
        this.setState({
            order: newOrder
        })
    }

    private updateAddress(newAddress: Address) {
        this.setState({
            address: newAddress,
            order: Order.forProduct(this.state.order.product) // reset costs
        })
    }

    private modifyCube(plane: THREE.Object3D, elapsed: number) {
        const rate = (10 / 1000)
        plane.rotateY(rate);
    }
}


interface CheckoutFormProps {
    onUpdateOrder: (order: Order) => void
    onUpdateAddress: (address: Address) => void

    onUpdateEmail: (email: string) => void

    order: Order
    address: Address
    cubeData: CubeData
    email: string

    onDidOrder: (orderId: string) => void
}

interface CheckourFromState {
    orderError?: string;
    submitting: boolean;
}

const CheckoutForm = injectStripe(class extends React.Component<CheckoutFormProps, CheckourFromState> {
    constructor(props: CheckoutFormProps) {
        super(props)
        this.state = {
            submitting: false
        }
    }

    render() {
        return (
            <form onSubmit={e => this.onSubmit(e)}>
                <SectionHeader
                    title='Size'
                    blurb='How big you would like your gif cube?'
                    details={<span>(see <a href='/faq.html' target='_blank'>faq</a> for info about the cubes and how they are made)</span>} />

                <ProductList
                    selectedProduct={this.props.order.product.type}
                    onDidChangeProduct={product => this.props.onUpdateOrder(Order.forProduct(product))} />

                <SectionHeader
                    title='Shipping'
                    blurb='Where should we ship your gif cube?'
                    details='(currently United States only)' />

                <ShippingForm
                    address={this.props.address}
                    onChange={this.props.onUpdateAddress} />

                <SectionHeader title='Checkout' />

                <CostOverview
                    order={this.props.order}
                    address={this.props.address}
                    onDidUpdate={this.props.onUpdateOrder} />

                <PaymentSection
                    order={this.props.order}
                    address={this.props.address}
                    email={this.props.email}
                    onUpdateEmail={this.props.onUpdateEmail}
                    lastOrderError={this.state.orderError}
                    inProgress={this.state.submitting} />
            </form>
        )
    }

    private async onSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
        this.setState({
            orderError: undefined,
            submitting: true
        });

        e.preventDefault();
        let token: stripe.Token | undefined;
        try {
            const response = await this.stripe.createToken();
            token = response.token;
        } catch {
            this.setState({
                orderError: 'Error requesting payment token',
                submitting: false,
            });
            return;
        }

        if (token) {
            await this.doSubmit(token);
        } else {
            this.setState({
                orderError: 'Checkout error. Please check payment method',
                submitting: false
            })
        }
    }

    private get stripe(): ReactStripeElements.StripeProps {
        return (this.props as any).stripe
    }

    private async doSubmit(token: stripe.Token) {
        try {
            const orderResponse = await fetch(config.orderEndpoint, {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    cubeData: toUpload(this.props.cubeData),

                    address: this.props.address.toJson(),
                    product: this.props.order.product.type,
                    email: this.props.email,

                    stripeToken: token.id,

                    // Validate all costs server side :)
                    expectedCosts: {
                        base: this.props.order.product.baseCost,
                        shipping: this.props.order.shippingCost,
                        total: this.props.order.totalCost
                    }
                })
            })

            const result = await orderResponse.json();
            if (!orderResponse.ok) {
                this.setState({
                    orderError: result.error || 'An error occurred while placing your order. Your card has not been charged.',
                    submitting: false
                })
                return;
            }

            this.props.onDidOrder(result.orderId)
            this.setState({
                orderError: '',
                submitting: false
            });
        } catch {
            this.setState({
                orderError: 'An error occurred while placing your order. Your card has not been charged.',
                submitting: false
            })
        }
    }
})

const SectionHeader = (props: { title: string, blurb?: string, details?: JSX.Element | string }) =>
    <div className='section-header'>
        <h1>{props.title}</h1>
        {props.blurb && <p>{props.blurb}</p>}
        {props.details && <p className='details'>{props.details}</p>}
    </div>


