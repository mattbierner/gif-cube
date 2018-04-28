import * as React from 'react';
import { CubeRenderer, CubeData } from '../../3d_renderer';
import { GifRenderer } from '../../components/gif_renderer';
import { Gif, loadGif } from '../../load_gif';

interface CreateViewProps {
    gif: Gif

    onDidUpdateCubeData: (cubeData: CubeData) => void
}

export class CreateView extends React.Component<CreateViewProps> {
    private _renderer?: CubeRenderer;

    constructor(props: CreateViewProps) {
        super(props)
        this.state = {}
    }

    componentDidMount() {
        loadGif('/images/example.gif').then(gif => this.setState({ gif }))
    }

    render() {
        if (!this.props.gif) {
            return <div />
        }
        return (
            <div className='gif-renderer'>
                <div className='three-container'>
                    <div className='three-view-controls-wrapper'>
                        <div className='three-controls three-view-controls'>
                            <button onClick={() => this._renderer!.goToFrontView()}>Front</button>
                            <button onClick={() => this._renderer!.goToSideView()}>Side</button>
                            <button onClick={() => this._renderer!.goToTopView()}>Top</button>
                            <button onClick={() => this._renderer!.resetCamera()}>Reset Camera</button>
                        </div>
                    </div>

                    <GifRenderer
                        imageData={this.props.gif}
                        sampleWidth={512}
                        sampleHeight={512}
                        renderer={renderer => this._renderer = renderer}
                        onDidUpdateCubeData={this.props.onDidUpdateCubeData}
                        rendererOptions={{
                            enableControls: true
                        }} />
                </div>
            </div>
        )
    }
}
