import * as React from 'react';
import * as THREE from 'three';
import { CubeRenderer } from '../3d_renderer';
import { Gif } from '../load_gif';
import { GifRenderer } from './gif_renderer';

interface PreviewCubeProps {
    imageData: Gif | undefined;
    sampleWidth: number;
    sampleHeight: number;

    modifyCube?: (plane: THREE.Object3D, elapsed: number) => void;

    hideAxisMarkers?: boolean;
}

export class PreviewCube extends React.Component<PreviewCubeProps> {
    private _renderer?: CubeRenderer;
    private _animating = false;
    private _lastUpdateTime: number | undefined;

    componentDidMount() {
        if (this.modifyCube) {
            this._animating = true
            this._lastUpdateTime = Date.now()
            requestAnimationFrame(() => { this.modifyCube() })
        }
    }

    componentWillUnmount() {
        this._animating = false
    }

    render() {
        return (
            <div className='preview-cube'>
                <GifRenderer
                    imageData={this.props.imageData}
                    sampleWidth={this.props.sampleWidth}
                    sampleHeight={this.props.sampleHeight}
                    renderer={renderer => { this._renderer = renderer }}
                    rendererOptions={{
                        enableControls: false,
                        hideAxisMarkers: this.props.hideAxisMarkers
                    }} />
            </div>
        )
    }

    private modifyCube() {
        if (!this._renderer || !this.props.modifyCube || !this._animating) {
            return;
        }

        const previousUpdate = this._lastUpdateTime;
        this._lastUpdateTime = Date.now()

        const elapsed = this._lastUpdateTime - previousUpdate!;
        this._renderer.modifyCube((plane: THREE.Object3D) => {
            this.props.modifyCube!(plane, elapsed)
        })

        requestAnimationFrame(() => { this.modifyCube() })
    }
}