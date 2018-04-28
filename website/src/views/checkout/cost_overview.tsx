import * as React from 'react'
import { Order } from '../../model/order';
import { Address } from 'gif-cube-shared';


interface CostOverviewProps {
    readonly order: Order
    readonly address: Address;
    readonly onDidUpdate: (updatedOrder: Order) => void
}


export class CostOverview extends React.Component<CostOverviewProps> {
    componentWillReceiveProps(newProps: CostOverviewProps) {
        if (this.props.order !== newProps.order) {
            this.setState({
                error: undefined
            });
        }
    }

    render() {
        const totalCost = this.props.order.product.baseCost + (this.props.order.shippingCost)
        return (
            <div className='cost-overview'>
                <div className='cost-line-items'>
                    <LineItem label={this.props.order.product.title} value={this.props.order.product.baseCost} />
                    <LineItem label={'Shipping'} value={this.props.order.shippingCost!} />
                    <div className='cost-divider' />
                    <LineItem label='Total' className='total-cost' value={totalCost} />
                </div>
            </div>
        )
    }
}

const LineItem = (props: { label: string, value: number, className?: string }) =>
    <div className={'cost-line-item ' + (props.className || '')}>
        <span className='cost-line-item-label'>{props.label}</span> <span className='cost-line-item-value'>${props.value}</span>
    </div >

