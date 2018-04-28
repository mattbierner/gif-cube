import * as THREE from 'three';

export default {
    uniforms: {
        tDiffuse: { type: 't' }
    },
    vertexShader: `
        varying vec2 vUv;

        void main() {
            vUv = uv;
            vec4 pos = modelViewMatrix * vec4(position, 1.0); 
            gl_Position = projectionMatrix * pos;
        }
    `,
    fragmentShader: `
        uniform sampler2D tDiffuse;

        varying vec2 vUv;

        void main() {
            gl_FragColor = texture2D(tDiffuse, vUv);
        }
    `,
    side: THREE.DoubleSide,
    transparent: true,
};