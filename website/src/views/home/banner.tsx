import * as React from 'react';

import { loadGif, Gif } from '../../load_gif';
import { Link } from 'react-router-dom';
import { getGiphy } from '../../giphy';
import { PreviewCube } from '../../components/preview_cube';
import { LoadingSpinner } from '../../components/loading_spinner';


interface BannerState {
    gif?: Gif
}

export class Banner extends React.Component<{}, BannerState> {
    private ready: boolean = false;
    constructor(props: any) {
        super(props)
        this.state = {
            gif: undefined,
        }
    }

    componentDidMount() {
        const imageLoop = () => {
            if (!this.ready) {
                return;
            }
            getGiphy().random('cat')
                .then((x: any) => x.data.fixed_width_downsampled_url)
                .then(loadGif)
                .then((gif: Gif) => {
                    if (!this.ready) {
                        return;
                    }
                    this.setState({ gif })
                    setTimeout(imageLoop, 2000);
                })
                .catch(imageLoop)
        }
        this.ready = true;
        imageLoop();
    }

    componentWillUnmount() {
        this.ready = false;
    }

    render() {
        return (
            <header id='site-header' className='site-banner'>
                <PreviewCube
                    imageData={this.state.gif}
                    hideAxisMarkers={true}
                    sampleWidth={240}
                    sampleHeight={240}
                    modifyCube={(cube, elapsed) => this.modifyCube(cube, elapsed)} />
                {this.state.gif ? null : <LoadingSpinner style={{ position: 'absolute', top: '120px' }} active={true} />}
                <h1 className='site-blurb'>cube you a gif</h1>
                <Link to='/select' className={'big-button-link get-started-button'}>Get Started</Link>
            </header>
        )
    }

    private modifyCube(plane: THREE.Object3D, elapsed: number) {
        const rate = (20 / 1000)
        // plane.rotateY(rate);
        plane.rotateY(rate);
    }
}
