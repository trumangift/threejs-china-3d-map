import * as THREE from "three";
import Base3dMap from './base3dMap.js';
import lightray from './lightray.jpg';
import light_yellow from './lightray_yellow.jpg';

class Rich3dMap extends Base3dMap {
	constructor(setting) {
	    super(setting);
		this.textures = [new THREE.TextureLoader().load(lightray), new THREE.TextureLoader().load(light_yellow)];
		this.textColor = new THREE.Color('rgb(60,60,60)');
		this.startIndex = 0;
		this.frequency = 20;
	}
	removeSixMeshs() {
		this.sixMeshs 
		&& this.sixMeshs.forEach(mesh => {
			this.scene.remove(mesh);
		});
		this.sixMeshs = [];
	}
	removeSixLines() {
		this.sixLines
		&& this.sixLines.forEach(mesh => {
			this.scene.remove(mesh);
		});
		this.sixLines = [];
	}
	// 重写父类animate
	animate() {
		super.animate();
		this.startIndex++;
		if (this.startIndex > this.frequency) {
			this.startIndex = 0;
		}
		this.doAnimate();
	}
	drawLightBar(name, height,x,y,z) {
		this.sixMeshs = this.sixMeshs || [];
		this.planes = this.planes || [];
		this.sixLines = this.sixLines || [];
		var sixMesh = this.drawSixMesh(1, 6);
		var sixLine = this.drawSixLine(0.7, 6);
		sixMesh.position.set(x,y,z+6);
		sixLine.position.set(x,y,z+6);
		let [plane, plane2] = this.drawPlane(x,y,z, height);
		plane.position.set(x, y, z + height / 2 + 6);
		plane2.position.set(x, y, z + height / 2 + 6);
		plane2.name = name;
	}
	emptyAllPlanes() {
		this.planes && this.planes.forEach(plane => {
			this.scene.remove(plane);
		});
		this.planes = [];
	}
	drawSixMesh(radius, size=6) {
		let circleGeometry = new THREE.CircleGeometry( radius, size );
		var starsMaterial = new THREE.MeshBasicMaterial( { color: new THREE.Color('#ffeb3b') } );
		let sixMesh = new THREE.Mesh(circleGeometry, starsMaterial);
		this.sixMeshs.push(sixMesh);
		this.scene.add(sixMesh);
		return sixMesh;
	}
	drawSixLine(radius, size=6) {
		let circleGeometry = new THREE.CircleGeometry( radius, size );
		var starsMaterial = new THREE.MeshBasicMaterial( { color: new THREE.Color('#ffeb3b') } );
		let sixLine = new THREE.LineLoop(circleGeometry, starsMaterial);
		circleGeometry.vertices.shift();
		this.sixLines.push(sixLine);
		this.scene.add(sixLine);
		return sixLine;
	}
    drawPlane(x,y,z,high = 20) {
		const geometry = new THREE.PlaneGeometry(2, high);
		let plane;
		let plane2;
		const material = new THREE.MeshBasicMaterial({
		  depthTest: false,
		  transparent: true,
	      opacity: .5,
		  map: this.textures[1],
		  color: new THREE.Color("rgb(255,255,255)"),
		  side: THREE.DoubleSide,
		  blending: THREE.AdditiveBlending
		});
		plane = new THREE.Mesh(geometry, material);
		plane.rotation.x = Math.PI / 2;
		plane.rotation.z = Math.PI;
		plane.position.set(x, y, z + high / 2 + 7);
		plane2 = plane.clone();
		plane2.rotation.y = Math.PI / 2;
		this.scene.add(plane);
		this.scene.add(plane2);
		this.planes = this.planes.concat([plane, plane2]);
		return [plane, plane2];
	}
	removeAllText() {
		this.fontMeshs
		&& this.fontMeshs.forEach(mesh => {
			this.scene.remove(mesh);
		});
		this.fontMeshs = [];
	}
	drawText(text,height,x,y,z) {
		this.fontMeshs = this.fontMeshs || [];
		var loader = new THREE.FontLoader();
		if (!this.font) {
			loader.load('FZShuSong-Z01S_Regular.json',  ( response ) => {
				this.font = response;
				this.createText(text,x,y,z + height + 5);
			});	
		} else {
			this.createText(text,x,y,z + height + 5);
		}
	}
	createText(text,x,y,z) {
		var geometry =
		new THREE.TextGeometry(text, {
			font: this.font,
			size: 1.4,
			height: 1,
			bevelEnabled: false
		}), fontMesh;
			
		const material = new THREE.MeshBasicMaterial( { color:  this.textColor} )
		fontMesh = new THREE.Mesh(geometry, material);
		fontMesh.rotation.z = 1.5453;
		fontMesh.rotation.y =  .8
		fontMesh.position.set(x,y -3,z);
		this.fontMeshs.push(fontMesh)
		this.scene.add(fontMesh);
	}
	doAnimate() {
		const ratio = this.startIndex / this.frequency;
		this.sixLines && this.sixLines.forEach(line => {
			line.scale.set(1 + ratio, 1 + ratio, 1);
		});
	}
}
export default Rich3dMap;

 