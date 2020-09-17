import { setUpCamera, setUpRender, setUpLight } from "./helper";
import * as THREE from "three";
import * as d3 from "d3-geo";
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
const geomentryConnfig = {
  steps: 5,
  depth: 2,
  bevelEnabled: false,
  curveSegments: 30
};
class Base3dMap {
  constructor(setting) {
    this.mapData = setting.mapData; 
    this.color = new THREE.Color('#0099f1');
    this.init();
    this.animate();
  }
   /**
    * @desc 鼠标事件处理
    */
   mouseEvent(event , cb) {
     if (!this.raycaster) {
       this.raycaster = new THREE.Raycaster();
     }
     if (!this.mouse) {
       this.mouse = new THREE.Vector2();
     }
     if (!this.meshes) {
       this.meshes = [];
       this.group.children.forEach(g => {
         g.children.forEach(mesh => {
           this.meshes.push(mesh);
         });
       });
     }
 
     // 将鼠标位置归一化为设备坐标。x 和 y 方向的取值范围是 (-1 to +1)
     this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
     this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

 
     // 通过摄像机和鼠标位置更新射线
     this.raycaster.setFromCamera(this.mouse, this.camera);
     // 计算物体和射线的焦点
     const intersects = this.raycaster.intersectObjects(this.meshes);
     if (intersects.length > 0) {
	    cb(event, intersects[0].object.parent, this.meshes);
     }
   }
   // 对外监听接口
   on(eventName, func) {
	   const mouseEvent = this.mouseEvent;
	   const eventHandler = (event) => {
		   mouseEvent.apply(this, [event, func])
	   }
	   document.body.addEventListener(eventName, eventHandler, {
		  passive: true
	   });
   }
  init() {
    this.scene = new THREE.Scene();
    this.setUpCamera = setUpCamera;
    this.camera = this.setUpCamera(this.scene, { x: 90, y: 0, z: 130 });
    this.renderer = setUpRender();
    setUpLight(this.scene);
    this.setHelper();
    this.renderer.render(this.scene, this.camera);
    document.getElementById("app").appendChild(this.renderer.domElement);
    this.setControls();
  }
  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.renderer.render(this.scene, this.camera);
  }
  /**
   * @desc 设置参考线
   */
  setHelper() {
    const axesHelper = new THREE.AxesHelper(105);
    this.scene.add(axesHelper);
  }
  setControls() {
    new OrbitControls(this.camera, this.renderer.domElement);
  }
  /**
   * @desc 经纬度转换成墨卡托投影
   * @param {array} 传入经纬度
   * @return array [x,y,z]
   */
  lnglatToMector(lnglat) {
    if (!this.projection) {
      this.projection = d3
        .geoMercator()
        .center([108.904496, 32.668849])
        // .scale(100)
        .rotate(Math.PI / 4)
        .translate([0, -20]);
    }
    const [y, x] = this.projection([...lnglat]);
    let z = 0;
    return [x, y, z];
  }
  /**
   * @desc 绘制地图
   */
  drawMap() {
    if (!this.mapData) {
      console.error("this.mapData 数据不能是null");
      return;
    }
    // 把经纬度转换成x,y,z 坐标
    this.mapData.features.forEach((d) => {
      // 每个省份一个维度
      d.vector3 = [];
      d.geometry.coordinates.forEach((coordinates, i) => {
        d.vector3[i] = [];
        coordinates.forEach((c, j) => {
          if (c[0] instanceof Array) {
            d.vector3[i][j] = [];
            c.forEach((cinner) => {
              let cp = this.lnglatToMector(cinner);
              d.vector3[i][j].push(cp);
            });
          } else {
            let cp = this.lnglatToMector(c);
            d.vector3[i].push(cp);
          }
        });
      });
    });

    // 绘制地图模型
    const group = new THREE.Group();
    const lineGroup = new THREE.Group();
    this.mapData.features.forEach((d) => {
      //每个省份
      const g = new THREE.Group(); // 用于存放每个地图模块。||省份
	  g.properties = d.properties;
      d.vector3.forEach((points) => {
        // 多个面
        if (points[0][0] instanceof Array) {
          points.forEach((p) => {
            const mesh = this.drawModel(p);
            const lineMesh = this.drawLine(p);
			mesh.line = lineMesh;
            lineGroup.add(lineMesh);
            g.add(mesh);
          });
        } else {
          // 单个面
          const mesh = this.drawModel(points);
          const lineMesh = this.drawLine(points);
		  mesh.line = lineMesh;
          lineGroup.add(lineMesh);
          g.add(mesh);
        }
      });
      group.add(g);
    });
    this.group = group; // 丢到全局去
    this.scene.add(lineGroup);
    this.scene.add(group);
  }
  drawModel(points) {
    const shape = new THREE.Shape();
    points.forEach((d, i) => {
      const [x, y] = d;
      if (i === 0) {
        shape.moveTo(x, y);
      } else if (i === points.length - 1) {
        shape.quadraticCurveTo(x, y, x, y);
      } else {
        shape.lineTo(x, y);
      }
    });

    const geometry = new THREE.ExtrudeGeometry(shape, geomentryConnfig);
    const material = new THREE.MeshBasicMaterial({
      color: this.color,
    });
    const mesh = new THREE.Mesh(geometry, material);
    return mesh;
  }
    /**
     * @desc 绘制线条
     * @param {} points
     */
    drawLine(points) {
      const material = new THREE.LineDashedMaterial({
        color: '#fff',
		linewidth: 6,
		dashSize: .3,
		gapSize: .6,
      });
      const geometry = new THREE.Geometry();
      points.forEach(d => {
        const [x, y, z] = d;
        geometry.vertices.push(new THREE.Vector3(x, y, z + 2));
      });
      const line = new THREE.Line(geometry, material);
	  line.computeLineDistances();
      return line;
    }
}

export default Base3dMap;
