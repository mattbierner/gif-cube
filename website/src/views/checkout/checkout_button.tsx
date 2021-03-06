import * as React from 'react'
import { Order } from '../../model/order';
import { LoadingSpinner } from '../../components/loading_spinner';

interface CheckoutButtonProps {
    order: Order
    disabled?: boolean;
    inProgress: boolean
}

export class CheckoutButton extends React.PureComponent<CheckoutButtonProps> {
    render() {
        return (
            <button
                className='big-button'
                type='submit'
                disabled={this.props.disabled}
            >Pay ${this.props.order.totalCost} <LoadingSpinner active={this.props.inProgress} /></button>
        )
    }
}