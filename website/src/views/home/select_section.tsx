import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { PreviewCube } from '../../components/preview_cube';
import { Gif } from '../../load_gif';


class Frame extends React.Component<{ imageData: Gif, i: number }> {
    componentDidMount() {
        const element = ReactDOM.findDOMNode(this);
        const canvas = element as HTMLCanvasElement
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Could not create ctx')
        }
        canvas.width = this.props.imageData.width;
        canvas.height = this.props.imageData.height;
        ctx.putImageData(this.props.imageData.frames[this.props.i].data, 0, 0);
    }

    render() {
        return <canvas />
    }
}

interface CubeSectionProps {
    imageData: any;
    gif: string;
}

interface CubeSectionState {
    sample?: any;
}


const sampleSize = 256;

export class HowItWorksSelectSection extends React.Component<CubeSectionProps, CubeSectionState> {
    constructor(props: CubeSectionProps) {
        super(props)
        this.state = {}
    }

    render() {
        const frames = (index: number, skip: number): undefined | JSX.Element => {
            if (!this.props.imageData || index > this.props.imageData.frames.length) {
                return
            }

            return (
                <div className='gif-frame'>
                    <Frame imageData={this.props.imageData} i={index} />
                    {frames(index + skip, skip)}
                </div>
            )
        }

        return (
            <div className='how-it-works-section how-it-works-select-section'>
                <div className='how-it-works-body'>
                    <div className='how-it-works-step'>
                        <img src={this.props.gif} />
                        <p>Upload a gif or select one from giphy.</p>
                    </div>
                    <div className='how-it-works-step cube-body-section'>
                        <div className='gif-frames-container'>
                            <div className='gif-frames'>
                                {frames(0, 16)}
                            </div>
                        </div>
                        <p>Gif Cube breaks your gif into frames...</p>
                    </div>
                    <div className='how-it-works-step'>
                        <PreviewCube
                            imageData={this.props.imageData}
                            sampleWidth={sampleSize}
                            sampleHeight={sampleSize} />
                        <p>... and connects the frames into a solid image cube</p>
                    </div>
                </div>
            </div>
        );
    }
}

