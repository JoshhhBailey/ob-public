(function (exports, GLTFLoader_js, three) {
  'use strict';

  function setupModel(data) {
    const model = data.scene.children[0];

    // Assign new material
    const luneMaterial = new three.MeshStandardMaterial({ color: '#00C5C0', metalness: 0.5, roughness: 0.5});
    data.scene.traverse((o) => {
      if (o.isMesh)
      {
        o.material = luneMaterial;
      }
    });

    // Bounce variables
    let yPos = model.position.y;
    let bounceHeight = 0.1;
    let bounceSpeed = 2;

    // Rotation variables
    model.rotate = false;
    model.angle = Math.PI / 2;
    model.rotation.y = 0;
    model.maxRot = 0;
    model.savedRot = 0;
    let rotSpeed = 2;
    let rotReduce = 0.002;

    model.tick = (delta) => {
      // Bounce
      model.position.y = Math.sin(yPos) * bounceHeight;
      yPos += bounceSpeed * delta;

      // Rotation
      if (model.rotate)
      {
        // Right
        if (model.maxRot >= 0.01)
        {
          model.rotation.y = Math.sin(model.angle) * model.maxRot;
          model.angle += rotSpeed * delta;
          model.maxRot -= rotReduce;
        }
        // Left
        else if (model.maxRot <= -0.01)
        {
          model.rotation.y = Math.sin(model.angle) * model.maxRot;
          model.angle -= rotSpeed * delta;
          model.maxRot += rotReduce;
        }
        else
        {
          model.rotation.y = 0;
          model.rotate = false;
          model.angle = Math.PI / 2;
          model.maxRot = 0;
        }
      }
    };

    model.hit = () => {
      console.log("Hero hit!");
    };

    return model;
  }

  async function loadModel(modelPath) {
    const loader = new GLTFLoader_js.GLTFLoader();

    // Load model
    const luneData = await loader.loadAsync(modelPath);
    console.log('Model Data: ', luneData);

    // Handle materials, animation etc
    const luneModel = setupModel(luneData);

    return { luneModel };
  }

  function createCamera()
  {
    const camera = new three.PerspectiveCamera(75, 1, 0.1, 100);

    camera.position.set(0, 0, 10);

    return camera;
  }

  function createLights()
  {
    const mainLight = new three.DirectionalLight('white', 3);
    mainLight.position.set(5, 0, 10);
    new three.DirectionalLightHelper(mainLight);
    
    // Left highlight
    const leftLight = new three.PointLight('#0000FF', 8, 5);
    leftLight.position.set(-2, 2, 2);
    new three.PointLightHelper(leftLight);

    // Right highlight
    const rightLight = new three.PointLight('#00FEFE', 3, 5);
    rightLight.position.set(2, 0, 2);
    new three.PointLightHelper(rightLight);

    return { mainLight, leftLight, rightLight/*, helper, helper2, helper3*/};
  }

  function createScene()
  {
    const scene = new three.Scene();

    scene.background = new three.Color('gray');

    return scene;
  }

  function createRenderer()
  {
    const renderer = new three.WebGLRenderer({ antialias: true/*, alpha : true*/ });

    // Set background as clear when embedded in site
    // Make sure to enable alpha and remove scene.background from scene.js
    //renderer.setClearColor(0x000000, 0);

    renderer.physicallyCorrectLights = true;

    return renderer;
  }

  const setSize = (container, camera, renderer) => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
  };

  class Resizer
  {
    constructor(container, camera, renderer) 
    {
      // Set initial size
      setSize(container, camera, renderer);

      // On window resize
      window.addEventListener('resize', () => {
        setSize(container, camera, renderer);
        this.onResize();    // Custom actions
      });
    }

    onResize() {}
  }

  const clock = new three.Clock();

  class Loop
  {
    constructor(camera, scene, renderer)
    {
      this.camera = camera;
      this.scene = scene;
      this.renderer = renderer;
      this.updatables = [];
    }

    start()
    {
      this.renderer.setAnimationLoop(() => {
        // Update animated objects
        this.tick();

        // Render new frame
        this.renderer.render(this.scene, this.camera);
      });
    }

    stop()
    {
      this.renderer.setAnimationLoop(null);
    }

    tick()
    {
      // Get time between frames (ms)
      const delta = clock.getDelta();

      for (const object of this.updatables) {
        object.tick(delta);
      }
    }
  }

  class MouseManager
  {
    constructor(canvas, scene, camera)
    {
      this.raycaster = new three.Raycaster();
      this.pickedObject = null;

      this.mouseDown = false;
      this.prevPosition = { x: -100000, y: -100000 };
      this.currPosition = { x: -100000, y: -100000 };
      //this.clickTimer = 0.5;
      
      this.canvas = canvas;
      this.scene = scene;
      this.camera = camera;

      // DESKTOP EVENTS
      window.addEventListener('mousedown', (event) => {
        this.mouseDown = true;
        this.currPosition = this.setPickPosition(event);
        this.pick();
        this.prevPosition = this.setPickPosition(event);

        if (this.pickedObject != null)
        {
          this.pickedObject.parent.rotate = false;
        }
      });

      window.addEventListener('mouseup', () => {
        //console.log("Mouse up");
        if (this.pickedObject != null)
        {
          this.pickedObject.parent.rotate = true;
          this.pickedObject = null;
        }
        this.mouseDown = false;
      });

      // Mouse over
      window.addEventListener('mousemove', (event) => {

        if (this.mouseDown && this.pickedObject != null)
        {
          //console.log("mouse down and move");
          this.currPosition = this.setPickPosition(event);
          this.rotateObject();
        }
      });
      // Mouse off canvas
      window.addEventListener('mouseout', () => {
        if (!this.mouseDown)
        {
          this.clearPickPosition();
        }
      });
      // Mouse off object
      window.addEventListener('mouseleave', () => {
        if (!this.mouseDown)
        {
          this.clearPickPosition();
        }
      });

      // MOBILE EVENTS
      // Touch
      /*window.addEventListener('touchstart', (event) => {
        event.preventDefault();   // Disable scrolling
        this.setPickPosition(event.touches[0]);
      }, {passive: false});

      // Touch and drag
      window.addEventListener('touchmove', (event) => {
        this.setPickPosition(event.touches[0]);
      });

      // Release touch
      window.addEventListener('touchend', () => {
        this.clearPickPosition();
      });*/
    }

    tick(delta)
    {
      /*if (this.mouseDown)
      {
        this.clickTimer -= delta;
      }
      if (this.clickTimer <= 0)
      {
        if (this.pickedObject != null)
        {
          this.pickedObject.parent.rotate = true;
          this.pickedObject = null;
        }
        this.mouseDown = false;
        this.clickTimer = 0.5;
      }*/
    }
       
    setPickPosition(event)
    {
      const rect = this.canvas.getBoundingClientRect();

      // Pixel coordinates
      const pixelPos = {
        x: (event.clientX - rect.left) * this.canvas.width  / rect.width,
        y: (event.clientY - rect.top ) * this.canvas.height / rect.height
      };

      // Screen space coordinates, -1 < xy < 1
      const screenPos = {
        x: (pixelPos.x / this.canvas.width) *  2 - 1,
        y: (pixelPos.y / this.canvas.height) * -2 + 1   // Flip Y
      };

      return screenPos;
    }

    clearPickPosition()
    {
      this.currPosition.x = -100000;
      this.currPosition.y = -100000;
      this.prevPosition.x = -100000;
      this.prevPosition.y = -100000;
    }

    pick()
    {
      // Fire ray
      this.raycaster.setFromCamera(this.currPosition, this.camera);

      // Get intersected objects
      const intersectedObjects = this.raycaster.intersectObjects(this.scene.children);
      if (intersectedObjects.length)
      {
        // Get closest object
        this.pickedObject = intersectedObjects[0].object;
        
        // Do something to object
        this.pickedObject.parent.hit();
        this.pickedObject.parent.savedRot = this.pickedObject.parent.rotation.y;
      }
      else
      {
        console.log("Nothing hit!");
      }
    }

    rotateObject()
    {
      let offset = (this.prevPosition.x - this.currPosition.x) * -1;

      this.pickedObject.parent.rotation.y = this.pickedObject.parent.savedRot + offset;
      this.pickedObject.parent.maxRot = this.pickedObject.parent.savedRot + offset;
      this.pickedObject.parent.angle = Math.PI / 2;
    }
  }

  // Module scoped (can't access them from outside the module)
  let camera;
  let renderer;
  let scene;
  let loop;

  class World
  {
    options = undefined;
    constructor(container, options)
    {
      camera = createCamera();
      renderer = createRenderer();
      scene = createScene();
      loop = new Loop(camera, scene, renderer);
      container.append(renderer.domElement);
      //controls = createControls(camera, renderer.domElement);
      new MouseManager(renderer.domElement, scene, camera);
      //loop.updatables.push(mouseManager);

      const { mainLight, leftLight, rightLight/*, helper, helper2, helper3*/ } = createLights();

      //loop.updatables.push(controls);

      scene.add(mainLight, leftLight, rightLight/*, helper, helper2, helper3*/);

      new Resizer(container, camera, renderer);
      this.options = options;
    }

    async init()
    {
      // Create hero model
      const { luneModel } = await loadModel(this.options.luneModel);

      // Focus camera on hero model
      //controls.target.copy(luneModel.position);

      loop.updatables.push(luneModel);

      scene.add(luneModel);
    }

    render()
    {
      renderer.render(scene, camera);
    }

    start()
    {
      loop.start();
    }

    stop()
    {
      loop.stop();
    }
  }

  exports.World = World;

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;

})({}, THREE.GLTFLoader, THREE);
