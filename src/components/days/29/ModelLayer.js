import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import mapboxgl from 'mapbox-gl'

export class ModelLayer {
  constructor(id, modelUrl, modelTransformInfo) {
    this.id = id
    this.type = 'custom'
    this.renderingMode = '3d'
    this.modelUrl = modelUrl
    this.modelTransform = this.transformModel(modelTransformInfo)
  }

  onAdd(map, gl) {
    this.camera = new THREE.Camera()
    this.scene = new THREE.Scene()

    // create two three.js lights to illuminate the model
    const directionalLight = new THREE.DirectionalLight(0xffffff)
    directionalLight.position.set(0, -70, 100).normalize()
    this.scene.add(directionalLight)

    const directionalLight2 = new THREE.DirectionalLight(0xffffff)
    directionalLight2.position.set(0, 70, 100).normalize()
    this.scene.add(directionalLight2)

    // use the three.js GLTF loader to add the 3D model to the three.js scene
    const loader = new GLTFLoader()
    loader.load(this.modelUrl, (gltf) => {
      this.scene.add(gltf.scene)
    })
    this.map = map

    // use the MapLibre GL JS map canvas for three.js
    this.renderer = new THREE.WebGLRenderer({
      canvas: map.getCanvas(),
      context: gl,
      antialias: true,
    })

    this.renderer.autoClear = false
  }

  transformModel({ modelOrigin, modelAltitude, modelRotate }) {
    const modelAsMercatorCoordinate = mapboxgl.MercatorCoordinate.fromLngLat(modelOrigin, modelAltitude)

    // transformation parameters to position, rotate and scale the 3D model onto the map
    const modelTransform = {
      translateX: modelAsMercatorCoordinate.x,
      translateY: modelAsMercatorCoordinate.y,
      translateZ: modelAsMercatorCoordinate.z,
      rotateX: modelRotate[0],
      rotateY: modelRotate[1],
      rotateZ: modelRotate[2],
      /* Since our 3D model is in real world meters, a scale transform needs to be
       * applied since the CustomLayerInterface expects units in MercatorCoordinates.
       */
      scale: modelAsMercatorCoordinate.meterInMercatorCoordinateUnits() * 10,
    }

    return modelTransform
  }

  updateTransform(modelTransformInfo) {
    this.modelTransform = this.transformModel(modelTransformInfo)
    this.map.triggerRepaint()
  }

  render(gl, matrix) {
    const rotationX = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(1, 0, 0), this.modelTransform.rotateX)
    const rotationY = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 1, 0), this.modelTransform.rotateY)
    const rotationZ = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 0, 1), this.modelTransform.rotateZ)

    const m = new THREE.Matrix4().fromArray(matrix)
    const l = new THREE.Matrix4()
      .makeTranslation(this.modelTransform.translateX, this.modelTransform.translateY, this.modelTransform.translateZ)
      .scale(new THREE.Vector3(this.modelTransform.scale, -this.modelTransform.scale, this.modelTransform.scale))
      .multiply(rotationX)
      .multiply(rotationY)
      .multiply(rotationZ)

    this.camera.projectionMatrix = m.multiply(l)
    this.renderer.resetState()
    this.renderer.render(this.scene, this.camera)
  }
}
