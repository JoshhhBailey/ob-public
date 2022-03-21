!function(t,e,i){"use strict";async function s(t){const s=new e.GLTFLoader,n=await s.loadAsync(t);console.log("Model Data: ",n);return{luneModel:function(t){const e=t.scene.children[0],s=new i.MeshStandardMaterial({color:"#00C5C0",metalness:.5,roughness:.5});t.scene.traverse((t=>{t.isMesh&&(t.material=s)}));let n=e.position.y;return e.rotate=!1,e.angle=Math.PI/2,e.rotation.y=0,e.maxRot=0,e.savedRot=0,e.tick=t=>{e.position.y=.1*Math.sin(n),n+=2*t,e.rotate&&(e.maxRot>=.01?(e.rotation.y=Math.sin(e.angle)*e.maxRot,e.angle+=2*t,e.maxRot-=.002):e.maxRot<=-.01?(e.rotation.y=Math.sin(e.angle)*e.maxRot,e.angle-=2*t,e.maxRot+=.002):(e.rotation.y=0,e.rotate=!1,e.angle=Math.PI/2,e.maxRot=0))},e.hit=()=>{console.log("Hero hit!")},e}(n)}}const n=(t,e,i)=>{e.aspect=t.clientWidth/t.clientHeight,e.updateProjectionMatrix(),i.setSize(t.clientWidth,t.clientHeight),i.setPixelRatio(window.devicePixelRatio)};class o{constructor(t,e,i){n(t,e,i),window.addEventListener("resize",(()=>{n(t,e,i),this.onResize()}))}onResize(){}}const a=new i.Clock;class c{constructor(t,e,i){this.camera=t,this.scene=e,this.renderer=i,this.updatables=[]}start(){this.renderer.setAnimationLoop((()=>{this.tick(),this.renderer.render(this.scene,this.camera)}))}stop(){this.renderer.setAnimationLoop(null)}tick(){const t=a.getDelta();for(const e of this.updatables)e.tick(t)}}class r{constructor(t,e,s){this.raycaster=new i.Raycaster,this.pickedObject=null,this.mouseDown=!1,this.prevPosition={x:-1e5,y:-1e5},this.currPosition={x:-1e5,y:-1e5},this.canvas=t,this.scene=e,this.camera=s,window.addEventListener("mousedown",(t=>{this.mouseDown=!0,this.currPosition=this.setPickPosition(t),this.pick(),this.prevPosition=this.setPickPosition(t),null!=this.pickedObject&&(this.pickedObject.parent.rotate=!1)})),window.addEventListener("mouseup",(()=>{null!=this.pickedObject&&(this.pickedObject.parent.rotate=!0,this.pickedObject=null),this.mouseDown=!1})),window.addEventListener("mousemove",(t=>{this.mouseDown&&null!=this.pickedObject&&(this.currPosition=this.setPickPosition(t),this.rotateObject())})),window.addEventListener("mouseout",(()=>{this.mouseDown||this.clearPickPosition()})),window.addEventListener("mouseleave",(()=>{this.mouseDown||this.clearPickPosition()}))}tick(t){}setPickPosition(t){const e=this.canvas.getBoundingClientRect(),i=(t.clientX-e.left)*this.canvas.width/e.width,s=(t.clientY-e.top)*this.canvas.height/e.height;return{x:i/this.canvas.width*2-1,y:s/this.canvas.height*-2+1}}clearPickPosition(){this.currPosition.x=-1e5,this.currPosition.y=-1e5,this.prevPosition.x=-1e5,this.prevPosition.y=-1e5}pick(){this.raycaster.setFromCamera(this.currPosition,this.camera);const t=this.raycaster.intersectObjects(this.scene.children);t.length?(this.pickedObject=t[0].object,this.pickedObject.parent.hit(),this.pickedObject.parent.savedRot=this.pickedObject.parent.rotation.y):console.log("Nothing hit!")}rotateObject(){let t=-1*(this.prevPosition.x-this.currPosition.x);this.pickedObject.parent.rotation.y=this.pickedObject.parent.savedRot+t,this.pickedObject.parent.maxRot=this.pickedObject.parent.savedRot+t,this.pickedObject.parent.angle=Math.PI/2}}let h,d,l,p;t.World=class{options=void 0;constructor(t,e){h=function(){const t=new i.PerspectiveCamera(75,1,.1,100);return t.position.set(0,0,10),t}(),d=function(){const t=new i.WebGLRenderer({antialias:!0});return t.physicallyCorrectLights=!0,t}(),l=function(){const t=new i.Scene;return t.background=new i.Color("gray"),t}(),p=new c(h,l,d),t.append(d.domElement),new r(d.domElement,l,h);const{mainLight:s,leftLight:n,rightLight:a}=function(){const t=new i.DirectionalLight("white",3);t.position.set(5,0,10),new i.DirectionalLightHelper(t);const e=new i.PointLight("#0000FF",8,5);e.position.set(-2,2,2),new i.PointLightHelper(e);const s=new i.PointLight("#00FEFE",3,5);return s.position.set(2,0,2),new i.PointLightHelper(s),{mainLight:t,leftLight:e,rightLight:s}}();l.add(s,n,a),new o(t,h,d),this.options=e}async init(){const{luneModel:t}=await s(this.options.luneModel);p.updatables.push(t),l.add(t)}render(){d.render(l,h)}start(){p.start()}stop(){p.stop()}},Object.defineProperty(t,"__esModule",{value:!0})}({},THREE.GLTFLoader,THREE);
