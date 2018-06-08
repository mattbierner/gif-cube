import * as React from 'react';

import THREE = require('three');
import { loadGif, Gif } from '../../load_gif';
import { PreviewCube } from '../../components/preview_cube';

interface PrintSectionProps { }

interface PrintSectionState {
    gif: Gif | undefined
    rotation: number
}

const sampleSize = 256;

export class PrintSection extends React.Component<PrintSectionProps, PrintSectionState> {
    private readonly gif = '/images/rainbow.gif'

    constructor(props: PrintSectionProps) {
        super(props)
        this.state = {
            rotation: 0,
            gif: undefined
        }
    }

    componentDidMount() {
        loadGif(this.gif).then(gif => {
            this.setState({ gif })
        })
    }

    render() {
        const currentSpin = (4 + Math.floor((this.state.rotation / (Math.PI * 2)) * 16)) % 16;

        const frames: JSX.Element[] = [];
        for (let i = 0; i < 16; ++i) {
            frames.push(<img key={i}
                src={`/images/spins/spin-${i + 1}.jpg`}
                style={{ display: i === currentSpin ? 'block' : 'none' }}
            />);
        }

        return (
            <div className='how-it-works-section how-it-works-print-section'>
                <div className='how-it-works-body'>
                    <div className='how-it-works-step'>
                        <PreviewCube
                            imageData={this.state.gif}
                            sampleWidth={sampleSize}
                            sampleHeight={sampleSize}
                            modifyCube={this.modifyCube.bind(this)} />
                        <p>Once you find the perfect cube...</p>
                    </div>
                    <div className='how-it-works-step'>
                        <div>
                            {frames}
                        </div>
                        <p>... checkout and receive a physical copy of it!</p>
                    </div>
                </div>
            </div>
        );
    }

    private modifyCube(plane: THREE.Object3D, elapsed: number) {
        const rate = 0.025;
        plane.rotateY(-rate);
        this.setState({ rotation: (this.state.rotation + rate) % (Math.PI * 2) })
    }
}
