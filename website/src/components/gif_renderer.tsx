import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { CubeRenderer, CubeRendererOptions, CubeData } from '../3d_renderer';
import { Gif } from '../load_gif';

interface GifRendererViewProps {
    sampleWidth: number;
    sampleHeight: number;
    imageData: Gif | undefined;
    renderer?: (renderer: CubeRenderer) => void
    rendererOptions: CubeRendererOptions
    onDidUpdateCubeData?: (cubeData: CubeData) => void
}

export class GifRenderer extends React.PureComponent<GifRendererViewProps> {
    private _3dCanvas?: HTMLCanvasElement;
    private _renderer?: CubeRenderer;

    componentDidMount() {
        this._3dCanvas = ReactDOM.findDOMNode(this) as HTMLCanvasElement
        this._renderer = new CubeRenderer(this._3dCanvas!, this._3dCanvas!.parentNode as HTMLElement, this.props.rendererOptions, this.props.onDidUpdateCubeData);
        if (this.props.renderer) {
            this.props.renderer(this._renderer)
        }

        if (this.props.imageData) {
            this._renderer.setGif(this.props.imageData);
        }
        this._renderer.setSampleSize(this.props.sampleWidth, this.props.sampleHeight);
    }

    componentWillReceiveProps(newProps: GifRendererViewProps) {
        if (this.props.imageData !== newProps.imageData) {
            if (newProps.imageData) {
                this._renderer!.setGif(newProps.imageData);
            }
        }

        if (this.props.sampleWidth !== newProps.sampleWidth || this.props.sampleHeight !== newProps.sampleHeight) {
            this._renderer!.setSampleSize(newProps.sampleWidth, newProps.sampleHeight);
        }
    }

    componentWillUnmount() {
        if (this._renderer) {
            this._renderer.dispose();
            this._renderer = undefined;
        }
        this._3dCanvas = undefined;
    }

    render() {
        return (
            <canvas className='three-canvas' />
        )
    }
}