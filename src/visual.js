import * as THREE from "three"
import SL from "./SoundLoader.js"

class Particle extends THREE.Object3D {
    constructor() {
        super();
        //0xCECCFF
        this.add(new THREE.Mesh(
            new THREE.BoxGeometry(1.0, 1.0, 1.0),
            // new THREE.CircleGeometry(2.0, 10.0),// Geometry(1.0, 1.0, 1.0),
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
                    float brightness = 0.7 + 0.3 * dot(vnorm, light);

                    float highlight = dot(vdirs, light) * 0.4;

                    gl_FragColor = vec4(vec3(0.7, 0.8, 0.67) * brightness + highlight, 1.0);
                }
                `
            })
        ));

        this._position = new THREE.Vector3(0.0, 0.0, 0.0);
        this._scale = new THREE.Vector3(0.2, 0.2, 0.2);
        this._rotation = new THREE.Vector3(0.0, 0.0, 0.0);

        this._ready = true;
    }

    update(t, dt, fft) {
        //Make Move
        var fftnorm = fft / 255.0;
        
        this._scale.z = this._scale.y = this._scale.x = 0.01 + fftnorm * fftnorm * 1.0;
        
        this._position.z = fftnorm * 10.0;

        if(fftnorm > 0.9) {
            this._rotation.x += Math.PI * 0.1;
            this._rotation.y += Math.PI * 0.1;
            // this._ready = false;
            // switch((Math.random() * 2.999) << 0) {
            //     case 0: this._rotation.x += Math.PI * 0.5; break;
            //     case 1: this._rotation.y += Math.PI * 0.5; break;
            //     case 2: this._rotation.z += Math.PI * 0.5; break;
            // }
        } 
        // if(this._ready == false) {
        //     // var dist = new THREE.Vector3(
        //     //     this._rotation.x - this.rotation.x,
        //     //     this._rotation.y - this.rotation.y,
        //     //     this._rotation.z - this.rotation.z
        //     // );
        //     // if(dist.length() < 1.0) 
        //     this.ready = true;
        // }

        //Make Smooth

        this.rotation.x += (this._rotation.x - this.rotation.x) * dt * 5.0;
        this.rotation.y += (this._rotation.y - this.rotation.y) * dt * 5.0;
        this.rotation.z += (this._rotation.z - this.rotation.z) * dt * 5.0;

        this.position.x += (this._position.x - this.position.x) * dt * 10.0;
        this.position.y += (this._position.y - this.position.y) * dt * 10.0;
        this.position.z += (this._position.z - this.position.z) * dt * 10.0;
        
        this.scale.x += (this._scale.x - this.scale.x) * dt * 1.0;
        this.scale.y += (this._scale.y - this.scale.y) * dt * 1.0;
        this.scale.z += (this._scale.z - this.scale.z) * dt * 1.0;
    }
}



class Visual {
    constructor() {
        
        //Set Sound Loader 
        SL.setup();

        //Set Renderer
        this.rdrr = new THREE.WebGLRenderer({alpha : false, antialias : true});
        this.rdrr.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.rdrr.domElement);

        this.camera = new THREE.PerspectiveCamera(60.0, window.innerWidth / window.innerHeight , 1.0, 1000.0);
        this.camera.position.z  = 30.0;
        this.camera._position = new THREE.Vector3(0.0, 0.0, 30.0);

        this.scene = new THREE.Scene();
        // this.scene.add(?);
        for(var x = 0;  x < 21 ; x++) {
            for(var y = 0; y < 21; y++) {
                const object = new Particle();
                this.scene.add(object);

                object._position.x = (x - 10.0) * 1.2; 
                object._position.y = (y - 10.0) * 1.2; 
                object._position.z = 0;
            }
        }



        this.fxtexture = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
            minFilter : THREE.LinearFilter,
            magFilter : THREE.LinearFilter,
        });
        this.hightexture = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
            minFilter : THREE.LinearFilter,
            magFilter : THREE.LinearFilter,
        });
        
        
        this.fxcamera = new THREE.Camera();
        this.fxscene = new THREE.Scene();
        this.fxscene.add(new THREE.Mesh(
            new THREE.PlaneGeometry(2.0, 2.0),
            new THREE.ShaderMaterial({
                uniforms : {
                    uResolution : { type : "2f", value : [window.innerWidth, window.innerHeight]},
                    uTexture : { type : "t", value : this.fxtexture.texture},
                    uHighTexture : { type : "t", value : this.hightexture.texture}
                },
                vertexShader : `
                //Pass Through
                varying vec2 vtex;
                void main(void) {
                    vtex = uv;
                    gl_Position = vec4(position, 1.0);
                }
                `,
                fragmentShader : `
                uniform vec2 uResolution;
                uniform sampler2D uTexture;
                uniform sampler2D uHighTexture;
                varying vec2 vtex;

                //noise 

                //glow
                vec4 glow() {
                    vec2 offsetx = vec2(5.0, 0.0) / uResolution;
                    vec2 offsety = vec2(0.0, 5.0) / uResolution;
                    vec4 result = vec4(0.0);

                    for(float d = 1.0; d <= 5.0; d += 1.0) {
                        result += texture2D(uHighTexture, vtex + offsetx * d) / d;
                        result += texture2D(uHighTexture, vtex - offsetx * d) / d;
                        result += texture2D(uHighTexture, vtex + offsety * d) / d;
                        result += texture2D(uHighTexture, vtex - offsety * d) / d;
                    }

                    return result * 1.;
                }
                
                float rand(vec2 co)
                {
                    return fract(sin(dot(co.xy,vec2(12.9898,78.233))) * 43758.5453);
                }
                

                void main(void) {
                    float len = rand(vtex.xy);
                    float rad = rand(vtex.yx);
                    vec2 offset = len * 10.0 / uResolution * vec2(sin(rad), cos(rad));

                    gl_FragColor = glow() + texture2D(uTexture, vtex + offset);
                }
                `
            })
        ))
        this.highcamera = new THREE.Camera();
        this.highscene = new THREE.Scene();
        this.highscene.add(new THREE.Mesh(
            new THREE.PlaneGeometry(2.0, 2.0),
            new THREE.ShaderMaterial({
                uniforms : {
                    uTexture : { type : "t", value : this.fxtexture.texture}
                },
                vertexShader : `
                //Pass Through
                varying vec2 vtex;
                void main(void) {
                    vtex = uv;
                    gl_Position = vec4(position, 1.0);
                }
                `,
                fragmentShader : `
                uniform sampler2D uTexture;
                varying vec2 vtex;

                void main(void) {
                    float color = length(texture2D(uTexture, vtex).rgb) / length(vec3(1.0, 1.0, 1.0));
                    color *= color;
                    color *= color;
                    color *= color;
                    color *= color;
                    color *= color;
                    color *= color;
                    
                    gl_FragColor = vec4(color);
                }
                `

            })
        ));
    }

    update(t, dt) {
        //Sound Loader Update
        SL.update();

        //Camera Position Update
        this.camera._position.x += 0.01 * SL.fft[0] * 0.1 * Math.sin(t * 0.0006 * SL.fft[2] / 128.0 * Math.PI);
        this.camera._position.y += 0.01 * SL.fft[1] * 0.1 * Math.cos(t * 0.00056 * SL.fft[3] / 128.0 * Math.PI);

        this.camera._position.x = Math.abs(this.camera._position.x) > 4.0 ? Math.sign(this.camera._position.x) * 4.0 : this.camera._position.x;  
        this.camera._position.y = Math.abs(this.camera._position.y) > 4.0 ? Math.sign(this.camera._position.y) * 4.0 : this.camera._position.y;  

        this.camera.position.x += (this.camera._position.x - this.camera.position.x) * dt * 10.0;
        this.camera.position.y += (this.camera._position.y - this.camera.position.y) * dt * 10.0;

        this.camera.lookAt(new THREE.Vector3(0.0, 0.0, 0.0));
        
        //Each Particles Update
        this.scene.children.forEach((object)=>{
            var len = new THREE.Vector2(object._position.x, object._position.y);
            var fft = SL.fft[(len.length() * 2) << 0];
            object.update(t, dt, fft);
        });

        this.rdrr.render(this.scene, this.camera, this.fxtexture);
        this.rdrr.render(this.highscene, this.highcamera, this.hightexture);
        this.rdrr.render(this.fxscene, this.fxcamera);
    }
}


export default Visual;