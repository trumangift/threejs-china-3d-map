import * as THREE from "three";
//相机
export const setUpCamera = (scene, position) => {
  const { x, y, z } = position;
  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  /** 摆放相机的位置 */
  camera.up.x = 0;
  camera.up.y = 0;
  camera.up.z = 1; //保证z轴在上面
  camera.position.set(x, y, z);
  camera.lookAt(scene.position);
  return camera;
};
// 渲染器
export const setUpRender = () => {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setClearColor(new THREE.Color(0xffffff));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.setPixelRatio(window.devicePixelRatio);
  return renderer;
};
export const debounce = (fn, time = 500)  => {
	var timeout = null;
	var _this = this;
	return function() {
		var args = arguments;
		if (timeout) {
			return;
		}
		timeout = setTimeout(() => {
			fn.apply(_this, Array.prototype.slice.apply(args));
			clearTimeout(timeout);
			timeout = null;
		}, time);
	}
}
// 光线
export const setUpLight = (scene) => {
  var intensity = 2.5;
  var distance = 10;
  var decay = 2.0;
  var light = new THREE.PointLight( 0x000000, intensity, distance, decay );
  // light.position.set( 50, 50, 50 );
  // scene.add(light);
};
