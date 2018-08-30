import DXFVectorizer from '../vectorizer/DXFVectorizer';
import Viewer from './Viewer';
import OrbitController from '../controller/OrbitController';
/**
 *
 * @extends {Viewer}
 * @class DXFViewer
 * @example
 *  let dxfViewer= new DXFViewer(data, parent, width, height, font) 
 */
export default class DXFViewer extends Viewer {
    /**
     * DXFViewer class for a dxf object.
     * @constructor
     * @param {Object} data - the dxf object
     * @param {Object} parent - the parent element to which we attach the rendering canvas
     * @param {Number} width - width of the rendering canvas in pixels
     * @param {Number} height - height of the rendering canvas in pixels
     * @param {Object} font - a font loaded with THREE.FontLoader 
     */
    constructor(data, parent, width, height, font) {
        super();
        let $parent = $(parent);
        if (!parent) return null;

        this.width = width || parent.clientWidth;
        this.height = height || parent.clientHeight;
        this.aspectRatio = this.height == 0 ? 0 : this.width / this.height;
        this.font = font;
        this._parent = parent;
        this._data = data;

        this._scene = new THREE.Scene();
        this._vectorizer = new DXFVectorizer();
        this._vectorizer.font = font;
        this._viewPort = {};
        this.__createScene();

        this._camera = new THREE.OrthographicCamera(this._viewPort.left, this._viewPort.right, this._viewPort.top, this._viewPort.bottom, 1, 19);
        this._camera.position.z = 10;
        this._camera.position.x = this._viewPort.center.x;
        this._camera.position.y = this._viewPort.center.y;

        this._renderer = new THREE.WebGLRenderer();
        this._renderer.setSize(width, height);
        this._renderer.setClearColor(0xfffffff, 1);

        $parent.append(this._renderer.domElement);
        $parent.show();

        let controls = new OrbitController(this._camera, parent);
        controls.target.x = this._camera.position.x;
        controls.target.y = this._camera.position.y;
        controls.target.z = 0;
        controls.config.zoomSpeed = 3;

        controls.addEventListener('change', this.render.bind(this));
        this.render();
        controls.update();

        $parent.on('click', (event) => {
            let $el = $(this._renderer.domElement);

            let vector = new THREE.Vector3((event.pageX - $el.offset().left) / $el.innerWidth() * 2 - 1, -((event.pageY - $el.offset().top) / $el.innerHeight()) * 2 + 1, 0.5);
            vector.unproject(this._camera);

            let dir = vector.sub(this._camera.position).normalize();

            let distance = -this._camera.position.z / dir.z;

            let pos = this._camera.position.clone().add(dir.multiplyScalar(distance));

            console.log(pos.x, pos.y); // Position in cad that is clicked
        });
    }

    /**
     * Render the scene
     * @public 
     */
    render() {
        this._renderer.render(this._scene, this._camera);
    }

    resize(width, height) {
        //update width and height
        this.width = width;
        this.height = height;
        this.aspectRatio = this.aspectRatio = this.height == 0 ? 0 : this.width / this.height;

        //update camera
        let originalWidth = this._renderer.domElement.width;
        let originalHeight = this._renderer.domElement.height;

        let hscale = width / originalWidth;
        let vscale = height / originalHeight;

        this._camera.top = vscale * this._camera.top;
        this._camera.bottom = vscale * this._camera.bottom;
        this._camera.left = hscale * this._camera.left;
        this._camera.right = hscale * this._camera.right;

        //Update renderer
        let devicePxRatio = window.devicePixelRatio || 1;
        width = Math.floor(width * devicePxRatio);
        height = Math.floor(height * devicePxRatio);
        this._renderer.setSize(width, height);
        this._renderer.setClearColor(0xfffffff, 1);
        this.render();
    }

    __createScene() {
        let dims = {
            min: {
                x: false,
                y: false,
                z: false
            },
            max: {
                x: false,
                y: false,
                z: false
            }
        };
        for (let i = 0; i < this._data.entities.length; i++) {
            let entity = this._data.entities[i];
            let obj = null;
            if (entity.type === 'DIMENSION') {
                if (entity.block) {
                    let block = this._data.blocks[entity.block];
                    if (!block) {
                        console.error('Missing referenced block "' + entity.block + '"');
                        continue;
                    }
                    for (let j = 0; j < block.entities.length; j++) {
                        obj = this._vectorizer.drawEntity(block.entities[j], this._data);
                    }
                } else {
                    console.log('WARNING: No block for DIMENSION entity');
                }
            } else {
                obj = this._vectorizer.drawEntity(entity, this._data);
            }

            if (obj) {
                let bbox = new THREE.Box3().setFromObject(obj);
                if (bbox.min.x && (dims.min.x === false || dims.min.x > bbox.min.x)) dims.min.x = bbox.min.x;
                if (bbox.min.y && (dims.min.y === false || dims.min.y > bbox.min.y)) dims.min.y = bbox.min.y;
                if (bbox.min.z && (dims.min.z === false || dims.min.z > bbox.min.z)) dims.min.z = bbox.min.z;
                if (bbox.max.x && (dims.max.x === false || dims.max.x < bbox.max.x)) dims.max.x = bbox.max.x;
                if (bbox.max.y && (dims.max.y === false || dims.max.y < bbox.max.y)) dims.max.y = bbox.max.y;
                if (bbox.max.z && (dims.max.z === false || dims.max.z < bbox.max.z)) dims.max.z = bbox.max.z;
                this._scene.add(obj);
            }
        }

        let upperRightCorner = {
            x: dims.max.x,
            y: dims.max.y
        };
        let lowerLeftCorner = {
            x: dims.min.x,
            y: dims.min.y
        };

        // Figure out the current viewport extents
        let vp_width = upperRightCorner.x - lowerLeftCorner.x;
        let vp_height = upperRightCorner.y - lowerLeftCorner.y;
        let center = {
            x: vp_width / 2 + lowerLeftCorner.x,
            y: vp_height / 2 + lowerLeftCorner.y
        };

        // Fit all objects into current ThreeDXF DXFViewer
        let extentsAspectRatio = Math.abs(vp_width / vp_height);
        if (this.aspectRatio > extentsAspectRatio) {
            vp_width = vp_height * this.aspectRatio;
        } else {
            vp_height = vp_width / this.aspectRatio;
        }

        this._viewPort = {
            bottom: -vp_height / 2,
            left: -vp_width / 2,
            top: vp_height / 2,
            right: vp_width / 2,
            center: {
                x: center.x,
                y: center.y
            }
        };
    }
}