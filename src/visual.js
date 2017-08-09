import * as THREE from "three"
import SL from "./SoundLoader.js"

class Particle extends THREE.Object3D {
    constructor() {
        super();
        //0xCECCFF
        this.add(new THREE.Mesh(
            new THREE.BoxGeometry(1.0, 1.0, 1.0),
            new THREE.ShaderMaterial({
                uniforms : {},
                vertexShader : `
                varying vec2 vtex;
                varying vec3 vnorm;
                varying vec3 vdirs;
                void main(void) {
                    vtex = uv;
                    vnorm = normal;
                    vdirs = normalize(position);
                    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
                }
                `,
                fragmentShader : `
                varying vec2 vtex;
                varying vec3 vnorm;
                varying vec3 vdirs;
                
                void main(void) {
                    vec3 light = normalize(vec3( 1.0, 2.0 ,1.0));
                    float brightness = 0.5 + 0.5 * dot(vnorm, light);

                    float highlight = dot(vdirs, light) * 0.3;

                    gl_FragColor = vec4(vec3(0.7, 0.8, 1.0) * brightness + highlight, 1.0);
                }
                `
            })
        ));

        this._position = new THREE.Vector3(0.0, 0.0, 0.0);
        this._scale = new THREE.Vector3(0.2, 0.2, 0.2);


    }

    update(t, dt, fft) {
        this._scale.z = this._scale.y = this._scale.x = 0.2 + (fft / 255.0) * 1.0;
        this._position.z = (fft/255) * 10.0;

        this.position.x += (this._position.x - this.position.x) * dt * 5.0;
        this.position.y += (this._position.y - this.position.y) * dt * 5.0;
        this.position.z += (this._position.z - this.position.z) * dt * 5.0;
        
        this.scale.x += (this._scale.x - this.scale.x) * dt * 1.0;
        this.scale.y += (this._scale.y - this.scale.y) * dt * 1.0;
        this.scale.z += (this._scale.z - this.scale.z) * dt * 5.0;
    }
}



class Visual {
    constructor() {
        
        //Set Sound Loader 
        SL.setup();

        //Set Renderer
        this.rdrr = new THREE.WebGLRenderer({alpha : true, antialias : true});
        this.rdrr.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.rdrr.domElement);

        this.camera = new THREE.PerspectiveCamera(60.0, window.innerWidth / window.innerHeight , 1.0, 1000.0);
        this.camera.position.z  = 30.0;


        this.scene = new THREE.Scene();
        // this.scene.add(?);
        for(var x = 0;  x < 21 ; x++) {
            for(var y = 0; y < 21; y++) {
                const object = new Particle();
                this.scene.add(object);

                object._position.x = (x - 10) * 1.2; 
                object._position.y = (y - 10) * 1.2; 
                object._position.z = 0;
            }
        }

    }

    update(t, dt) {
        //Sound Loader Update
        SL.update();

        //Camera Position Update
        this.camera.position.x = 5 * Math.sin(t * 0.0006 * Math.PI);
        this.camera.position.y = 5 * Math.cos(t * 0.00056 * Math.PI);
        this.camera.lookAt(new THREE.Vector3(0.0, 0.0, 0.0));
        
        //Each Particles Update
        this.scene.children.forEach((object)=>{
            var len = new THREE.Vector2(object.position.x, object.position.y);
            var fft = SL.fft[(len.length() * 2) << 0];
            object.update(t, dt, fft);
        });

        this.rdrr.render(this.scene, this.camera);
    }
}


export default Visual;