import * as THREE from 'three';
import OrbitControls from './OrbitControls';
const ResizeSensor = require('imports-loader?this=>window!css-element-queries/src/ResizeSensor');

import createImageData from './create_image_data';

import cubeShader from './shaders/cube_face_shader';
import { Gif, Frame } from './load_gif';

const cubeMaterial = new THREE.ShaderMaterial(cubeShader);

const CAMERA_BASE = 1;

type Sampler = (dest: ImageData, frame: Frame, x: number, y: number) => void

/**
 * Create a plane from 4 points.
 */
export const createPlane = (name: string, a: any, b: any, c: any, d: any, mat: any) => {
    const indices = new Uint32Array([0, 1, 2, 0, 2, 3]);

    const vertices = new Float32Array([
        a.x, a.y, a.z,
        b.x, b.y, b.z,
        c.x, c.y, c.z,
        d.x, d.y, d.z
    ]);

    const uv = new Float32Array([
        0, 0,
        1, 0,
        1, 1,
        0, 1
    ]);

    const geometry = new THREE.BufferGeometry();

    geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.addAttribute('uv', new THREE.BufferAttribute(uv, 2));

    geometry.setIndex(new THREE.BufferAttribute(indices, 1));

    const mesh = new THREE.Mesh(geometry, mat);
    mesh.name = name;
    (mesh.geometry as any).vertices = [a, b, c, d];
    return mesh;
};

/**
 * Helper to  create a texture from image data.
 */
const createTextureFromImageData = (imageData: any) => {
    const text = new THREE.Texture(imageData);
    text.minFilter = THREE.NearestFilter;
    text.needsUpdate = true;
    return text;
};

export interface CubeData {
    readonly width: number;
    readonly height: number;

    readonly front: ImageData;
    readonly right: ImageData;
    readonly back: ImageData;
    readonly left: ImageData;
    readonly top: ImageData;
    readonly bottom: ImageData;
}

export interface CubeRendererOptions {
    enableControls: boolean
    hideAxisMarkers?: boolean
}

export class CubeRenderer {
    private _container: HTMLElement;
    private _options: CubeRendererOptions;
    private _scene: THREE.Scene;
    private _uiScene: THREE.Scene;
    private animate: () => void;
    private _renderer!: THREE.WebGLRenderer;
    private _camera!: THREE.OrthographicCamera;
    private _controls: any;
    private _axis!: THREE.Object3D;
    private _cube!: THREE.Object3D;
    private disposed: boolean = false;
    private _holeMaterial: THREE.MeshBasicMaterial;

    constructor(
        canvas: HTMLCanvasElement,
        container: HTMLElement,
        options: CubeRendererOptions,
        private readonly onDidUpdateCubeData?: (cubeData: CubeData) => void
    ) {
        this._options = Object.assign({}, { enableControls: true }, options);

        this._container = container;
        this._scene = new THREE.Scene();
        this._uiScene = new THREE.Scene();

        this._holeMaterial = new THREE.MeshBasicMaterial()
        this._holeMaterial.color.set('#444')
        this._holeMaterial.side = THREE.DoubleSide;

        this.initRenderer(canvas);
        this.initCamera(CAMERA_BASE, CAMERA_BASE);
        this.initControls(canvas);
        new ResizeSensor(container, this.onResize.bind(this));
        this.onResize();

        this.initGeometry();

        this.animate = () => this.animateImpl();
        this.animateImpl();
    }

    private initRenderer(canvas: HTMLCanvasElement) {
        this._renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            alpha: true
        });
        this._renderer.autoClear = false;
        this._renderer.setClearColor(0xffffff, 0);
        this._renderer.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1);
    }

    private initCamera(width: number, height: number) {
        this._camera = new THREE.OrthographicCamera(width / - 2, width / 2, height / 2, height / - 2, -10, 10);
        this.resetCamera();
    }

    private initControls(container: HTMLElement) {
        if (!this._options.enableControls) {
            return
        }
        this._controls = new OrbitControls(this._camera, container);
        this._controls.enableDamping = true;
        this._controls.dampingFactor = 0.25;
        this._controls.enableZoom = true;
        this._controls.minZoom = 0.01;
        this._controls.maxZoom = 20;
    }

    private onResize() {
        const width = this._container.clientWidth;
        const height = this._container.clientHeight;

        this._renderer.setSize(width, height);

        const aspect = width / height;
        this._camera.left = -CAMERA_BASE * aspect;
        this._camera.right = CAMERA_BASE * aspect;
        this._camera.top = CAMERA_BASE;
        this._camera.bottom = -CAMERA_BASE;
        this._camera.updateProjectionMatrix();
    }

    private initGeometry() {
        this.initAxis();
    }

    private initAxis() {
        if (this._options.hideAxisMarkers) {
            return;
        }

        const size = 0.4;
        const origin = new THREE.Vector3(-0.6, -0.6, 0.6);

        const axis = [
            { color: 0xff0000, vector: new THREE.Vector3(size, 0, 0) },
            { color: 0x00ff00, vector: new THREE.Vector3(0, size, 0) },
            { color: 0x0000ff, vector: new THREE.Vector3(0, 0, -size) }];

        this._axis = new THREE.Object3D();
        for (const a of axis) {
            const material = new THREE.LineBasicMaterial({ color: a.color });
            const geometry = new THREE.Geometry();
            geometry.vertices.push(origin, new THREE.Vector3().addVectors(origin, a.vector));

            this._axis.add(new THREE.Line(geometry, material));
        }
        this._scene.add(this._axis);
    }

    public dispose() {
        this._scene.remove(this._cube);

        if (this._controls) {
            this._controls.dispose();
        }

        this._renderer.dispose();

        this.disposed = true;
    }

    /**
     * Set the camera to its original position
     */
    public resetCamera() {
        this.setCameraPosition(1, 1, 1);
    }

    /**
     * Switch to default front view.
     */
    public goToFrontView() {
        this.setCameraPosition(0, 0, 1.5);
    }

    /**
     * Switch to default side view.
     */
    public goToSideView() {
        this.setCameraPosition(1.5, 0, 0);
    }

    /**
     * Switch to default top view.
     */
    public goToTopView() {
        this.setCameraPosition(0, 1.5, 0);
    }

    private setCameraPosition(x: number, y: number, z: number) {
        if (this._controls) {
            this._controls.reset();
        }
        this._camera.position.set(x, y, z);
        this._camera.rotation.set(0, 0, 0);
        this._camera.lookAt(new THREE.Vector3());
    }

    public setSampleSize(x: number, y: number) {

    }

    public modifyCube(f: (x: any) => void) {
        if (this._cube) {
            f(this._cube)
        }
    }

    /**
     * Set the currently rendered image.
     */
    public setGif(imageData: Gif) {
        let initialTransform = new THREE.Matrix4();
        if (this._cube) {
            initialTransform = this._cube.matrix.clone();
            this._scene.remove(this._cube);
        }

        const scale = Math.max(imageData.width, imageData.height);

        const w = imageData.width / scale / 2;
        const h = imageData.height / scale / 2;
        const d = 1 / 2;
        const faces = this.getFaceMaterials(imageData);

        this._cube = new THREE.Object3D();
        this._cube.add(
            createPlane('front',
                new THREE.Vector3(-w, -h, d), new THREE.Vector3(w, -h, d), new THREE.Vector3(w, h, d), new THREE.Vector3(-w, h, d),
                faces.front));

        this._cube.add(
            createPlane('right',
                new THREE.Vector3(w, -h, d), new THREE.Vector3(w, -h, -d), new THREE.Vector3(w, h, -d), new THREE.Vector3(w, h, d),
                faces.right));

        this._cube.add(
            createPlane('back',
                new THREE.Vector3(-w, -h, -d), new THREE.Vector3(w, -h, -d), new THREE.Vector3(w, h, -d), new THREE.Vector3(-w, h, -d),
                faces.back));

        this._cube.add(
            createPlane('left',
                new THREE.Vector3(-w, -h, d), new THREE.Vector3(-w, -h, -d), new THREE.Vector3(-w, h, -d), new THREE.Vector3(-w, h, d),
                faces.left));

        this._cube.add(
            createPlane('top',
                new THREE.Vector3(-w, h, -d), new THREE.Vector3(w, h, -d), new THREE.Vector3(w, h, d), new THREE.Vector3(-w, h, d),
                faces.top));

        this._cube.add(
            createPlane('bottom',
                new THREE.Vector3(-w, -h, -d), new THREE.Vector3(w, -h, -d), new THREE.Vector3(w, -h, d), new THREE.Vector3(-w, -h, d),
                faces.bottom));

        // Draw hole
        const holeY = -h - 0.0001
        const holeSize = 0.25
        const holeWidth = (imageData.width / scale) * holeSize
        const holeDepth = holeSize;
        this._cube.add(
            createPlane('bottom',
                new THREE.Vector3(-holeWidth, holeY, -holeDepth), new THREE.Vector3(holeWidth, holeY, -holeDepth), new THREE.Vector3(holeWidth, holeY, holeDepth), new THREE.Vector3(-holeWidth, holeY, holeDepth),
                this._holeMaterial));

        this._cube.applyMatrix(initialTransform);
        this._scene.add(this._cube);
    }

    private copyRgba(dest: any, destIndex: number, src: any, srcIndex: number) {
        destIndex *= 4;
        srcIndex *= 4;

        dest[destIndex++] = src[srcIndex++];
        dest[destIndex++] = src[srcIndex++];
        dest[destIndex++] = src[srcIndex++];
        dest[destIndex] = 255
    }

    private sampleData(imageData: Gif, f: Sampler) {
        const data = createImageData(imageData.width, imageData.height);
        for (let x = 0; x < imageData.width; ++x) {
            const frameIndex = Math.floor(x / imageData.width * imageData.frames.length);
            const frame = imageData.frames[frameIndex];
            for (let y = 0; y < imageData.height; ++y) {
                f(data, frame, x, y);
            }
        }
        return data;
    }

    private sampleDataTop(imageData: Gif, f: Sampler) {
        const data = createImageData(imageData.width, imageData.height);
        for (let y = 0; y < imageData.height; ++y) {
            const frameIndex = Math.floor(y / imageData.height * imageData.frames.length);
            const frame = imageData.frames[frameIndex];
            for (let x = 0; x < imageData.width; ++x) {
                f(data, frame, x, y);
            }
        }
        return data;
    }

    private frontImage(imageData: Gif) {
        return imageData.frames[0].data;
    }

    private rightImage(imageData: Gif) {
        return this.sampleData(imageData, (data, frame, x, y) =>
            this.copyRgba(
                data.data,
                y * imageData.width + x,
                frame.data.data,
                y * imageData.width + (imageData.width - 1)));
    }

    private backImage(imageData: Gif) {
        return imageData.frames[imageData.frames.length - 1].data;
    }

    private leftImage(imageData: Gif) {
        return this.sampleData(imageData, (data, frame, x, y) =>
            this.copyRgba(
                data.data,
                y * imageData.width + x,
                frame.data.data,
                y * imageData.width + 0));
    }

    private topImage(imageData: Gif) {
        return this.sampleDataTop(imageData, (data, frame, x, y) =>
            this.copyRgba(
                data.data,
                y * imageData.width + x,
                frame.data.data,
                x));
    }

    private bottomImage(imageData: Gif) {
        return this.sampleDataTop(imageData, (data, frame, x, y) =>
            this.copyRgba(
                data.data,
                y * imageData.width + x,
                frame.data.data,
                x + (imageData.height - 1) * imageData.width));
    }

    private getFaceMaterials(imageData: Gif) {
        const images = this.getFaceImages(imageData)
        if (this.onDidUpdateCubeData) {
            this.onDidUpdateCubeData(images);
        }

        return ['front', 'right', 'back', 'left', 'top', 'bottom'].reduce((out, name) => {
            const mat = cubeMaterial.clone();
            mat.uniforms.tDiffuse.value = createTextureFromImageData((images as any)[name]);
            out[name] = mat;
            return out;
        }, Object.create(null));
    }

    private getFaceImages(imageData: Gif): CubeData {
        const scale = Math.max(imageData.width, imageData.height);
        const width = imageData.width / scale;
        const height = imageData.height / scale;

        return {
            width,
            height,
            front: this.frontImage(imageData),
            right: this.rightImage(imageData),
            back: this.backImage(imageData),
            left: this.leftImage(imageData),
            top: this.topImage(imageData),
            bottom: this.bottomImage(imageData),
        };
    }


    /**
     * Main render loop function.
     */
    private animateImpl() {
        if (this.disposed) {
            return;
        }

        requestAnimationFrame(this.animate);

        this.update();
        this.render();
    }

    private update() {
        if (this._controls) {
            this._controls.update();
        }
    }

    /**
     * Main render function.
     */
    private render() {
        this._renderer.clear();
        this._renderer.render(this._scene, this._camera);
        this._renderer.clearDepth();
        this._renderer.render(this._uiScene, this._camera);
    }
}
