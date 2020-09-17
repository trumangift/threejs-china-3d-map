import * as THREE from "three";

export const createMesh = () => {
  let cubeGeometry = new THREE.BoxGeometry(14, 14, 41);
  let cubeMaterial = new THREE.MeshLambertMaterial({
    color: 0xff0000
  });
  let cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
  return cube;
};
