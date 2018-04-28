import * as React from 'react';

export class LoadingSpinner extends React.PureComponent<{ active: boolean, style?: any }> {
    render() {
        return (
            <span style={this.props.style} className={'material-icons loading-spinner ' + (this.props.active ? '' : 'hidden')}>autorenew</span>
        )
    }
}