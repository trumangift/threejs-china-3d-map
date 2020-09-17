import React, { useState, useEffect } from "react";
import axios from "axios";
import * as THREE from 'three';
import Rich3dMap from "./rich3dMap";
import { util } from "./util";
import throttle from 'lodash.throttle';
import "./styles.css";
const subCitys = {
	'新疆维吾尔自治区': [
		{
			name: '乌鲁木齐市',
			center: [87.617733,43.792818, 0],
			height: 10
		},
		{
			name: '吐鲁番市',
			center: [89.182324,42.947627, 0],
			height: 17
		},
	    {
			name: '哈密市',
			center: [93.509174,42.833888, 0],
			height: 5
		},
		{
			name: '克拉玛依市',
			center: [84.882267,44.327207, 0],
			height: 4
		}
	],
	'西藏自治区': [
		{
			name: '拉萨市',
			center: [91.132212,29.660361],
			height: 20
		},
		{
			name: '日喀则市',
			center: [88.885148,29.267519],
			height: 18
		},
		{
			name: '昌都市',
			center: [97.178452,31.136875],
			height: 16
		},
		{
			name: '林芝市',
			center: [94.362348,29.654693],
			height: 25
		},
		{
			name: '山南市',
			center: [91.766529,29.236023],
			height: 10
		},
		{
			name: '那曲市',
			center: [92.060214,31.476004],
			height: 8
		}
	],
};
export default function App() {
  useEffect(() => {
    axios.get("all_china.json", "", { dataType: "json" }).then((res) => {
      const mapData = util.decode(res.data);
      const base3dMap = new Rich3dMap({ mapData });
      base3dMap.drawMap();
	  const moveCb = (event, target, meshes) => {
		  const {properties} = target;
		  const cp = properties.cp || properties.center;
		  if (!cp) {
			  console.warn(properties.name + ' cp is null');
			  return;
		  }
		  let subCity = subCitys[properties.name];
		  base3dMap.removeSixMeshs();
		  base3dMap.removeAllText();
		  base3dMap.emptyAllPlanes();
		  base3dMap.removeSixLines();

		  if(subCity) {
			  subCity.forEach((city, i) => {
				  let center = base3dMap.lnglatToMector(city.center);
				  const name = city.name + '_' + i;
				  base3dMap.drawLightBar(name, city.height, ...center);
				  base3dMap.drawText(city.name, city.height, ...center);
			  });
		  }
		  // reset olded plusd z mesh
		  meshes.forEach(mesh => {
			  if (mesh.positionCopy) {
				    const line = mesh.line;
					mesh.position.z =  mesh.positionCopy.z;
					line.position.z =  line.positionCopy.z;
					mesh.material.color = base3dMap.color;
					delete mesh.positionCopy;
					delete line.positionCopy;
			  }
		  });
	  	  target.children.forEach(mesh => {
			  const line = mesh.line;
			  mesh.material.color= new THREE.Color('rgb(227, 87, 81)');
			  mesh.positionCopy = Object.assign({}, mesh.position);
			  line.positionCopy = Object.assign({}, line.position);
			  mesh.position.z = 3;
			  line.position.z = 3;
		  });
	  };
	  base3dMap.on('mousemove', moveCb);
    });
  });
  return <div id="app"></div>;
}
