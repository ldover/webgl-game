import {ObjectLoader} from "./object-loader";
import {Collider} from "../collider/collider";
import {
    IndexBufferManager, NormalBufferManager, TextureBufferManager,
    VertexBufferManager
} from "../shader/buffer-manager";
import {Renderer} from "../render/renderer";
import {ShaderLoader} from "../shader/shader-loader";

let CANNON = require('cannon');
let mat4 = require('gl-matrix').mat4;


export class GameObject {
    constructor(dataPath) {
        this.dataPath = dataPath;
        this.mesh = ObjectLoader.getMesh(ObjectLoader.getObjectData(this.dataPath));
        this.mvMatrix = mat4.identity(mat4.create());
    }

    render() {
        this.setMatrixUniforms();
        Renderer.drawObject(this);
    }

    setMatrixUniforms() {
        ShaderLoader.setMatrixUniforms(this.mvMatrix);
    }

    initializeBuffers() {
        this.vertexBuffer = new VertexBufferManager(this.mesh).initializeMeshBuffer();
        this.normalBuffer = new NormalBufferManager(this.mesh).initializeMeshBuffer();
        this.textureBuffer = new TextureBufferManager(this.mesh).initializeMeshBuffer();
        this.indexBuffer = new IndexBufferManager(this.mesh).initializeMeshBuffer();
    }

    /**
     *
     * @param t - translation matrix
     * @param r - rotation matrix
     * @param s - scaling matrix
     */
    setInitialPosition(t, r, s) {
        throw Error('Not Implemented');
    }
}

export class MovingObject extends GameObject{
    constructor(dataPath) {
        super(dataPath);
        this.body = Collider.getMovingBodyFromMesh(this.mesh);  // CANNON.Body
    }

    _translate() {
        mat4.translate(this.mvMatrix, this.mvMatrix, [this.body.position.x, this.body.position.y, this.body.position.z]);
    }

    _rotate() {
        let quaternion = this.body.quaternion;
        let vecX = new CANNON.Vec3(1, 0, 0);
        let vecY = new CANNON.Vec3(0, 1, 0);
        let vecZ = new CANNON.Vec3(0, 0, 1);

        let rx = quaternion.toAxisAngle(vecX);
        let ry = quaternion.toAxisAngle(vecY);
        let rz = quaternion.toAxisAngle(vecZ);

        mat4.rotate(this.mvMatrix, this.mvMatrix, rx[1], [1, 0, 0]);
        mat4.rotate(this.mvMatrix, this.mvMatrix, ry[1], [0, 1, 0]);
        mat4.rotate(this.mvMatrix, this.mvMatrix, rz[1], [0, 0, 1]);
    }

    _scale() {

    }

    transform() {
        this.mvMatrix = this._getIdentityMatrix();

        this._translate();
        this._rotate();
        this._scale();

    }

    _getIdentityMatrix() {
        return mat4.identity(mat4.create());
    }


}

export class StationaryObject extends GameObject {
    // without transformations
    constructor(dataPath) {
        super(dataPath);
        this.body = Collider.getStaticBodyFromMesh(this.mesh);
    }
}