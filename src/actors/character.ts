
import { Actor, AnimationState, AnimationStateMachine, AssetLoader, BaseActor, RootMotionClip, attach, inject } from "@hology/core/gameplay";
import { CharacterAnimationComponent, CharacterMovementComponent, CharacterMovementMode, ThirdPersonCameraComponent } from "@hology/core/gameplay/actors";
import { DoubleSide, Material, Mesh } from "three";
import { DialogueService } from "../services/dialogue-service";

@Actor()
class Character extends BaseActor {
  private animation = attach(CharacterAnimationComponent)
  public readonly movement = attach(CharacterMovementComponent, {
    maxSpeed: 8,
    maxSpeedSprint: 14,
    maxSpeedBackwards: 8,
    snapToGround: 0.1,
    autoStepMinWidth: 0,
    autoStepMaxHeight: 0.1,
    fallingReorientation: true,
    fallingMovementControl: 0.2,
    colliderHeight: 1.8,
    colliderRadius: 0.75,
    jumpVelocity: 12.5,
    offset: 0.01,
    gravityOverride: -30,
    rotateToMovementDirection: true,
    smoothRotation: true
  })
  public readonly thirdPersonCamera = attach(ThirdPersonCameraComponent, {
    height: 1.9,
    offsetX: 0,
    offsetZ: 0,
    minDistance: 10,
    maxDistance: 10,
    distance: 10,
    fixedBehind: false
  })

  private assetLoader = inject(AssetLoader)
  private dialogueService = inject(DialogueService)

  private info? = this.dialogueService.getCharacter('odysseus')

  async onInit(): Promise<void> {
    this.thirdPersonCamera.camera.far = 2000

    const { scene, animations } = await this.assetLoader.getModelByAssetName('Butler_Anim')
    //const animations: AnimationClip[] = []
    //const scene = new Mesh(new SphereGeometry(1), new MeshBasicMaterial({color: 'blue'}))
    this.object.add(scene)
    scene.scale.multiplyScalar(1.5)

    // Hide mushtaches 
    scene.traverse(o => {
      if (mustaches.includes(o.name)) {
        o.visible = false
      }
    }) 
    // Show mustache
    if (this.info?.mustache != null) {
      if (this.info.mustache in mustaches) {
        scene.traverse(o => {
          if (o.name === mustaches[this.info!.mustache!]) {
            o.visible = true
          }
        })
      } else {
        console.error("No mustache exist with number " + this.info.mustache)
      }
    }
    

    scene.traverse(o => {
      if (o instanceof Mesh) {
        o.castShadow = true
        if (o.material instanceof Material) {
          //o.material = material
          console.log(o.material)
          o.material.transparent = false
          o.material.side = DoubleSide
          o.material.depthWrite = true
          o.material.alphaTest = 0.1
        }
        const path: string[] = []
        o.traverseAncestors(a => {
          path.push(a.name)
        })
        path.push(o.name)
        console.log(path.join(' -> '))
      }
    })

    const clips = Object.fromEntries(animations.map(clip => [clip.name, clip]))
  
    const idle = new AnimationState(clips['Rig|Unarmed_Pose'])
    const walk = new AnimationState(RootMotionClip.fromClipWithDistance(clips['Rig|Walking_C'], 3))
    const jump = new AnimationState(clips.Jump_Idle)
    const sprint = new AnimationState(clips['Running '])
    console.log(clips)

    idle.transitionsBetween(walk, () => this.movement.horizontalSpeed > 0)
    walk.transitionsBetween(sprint, () => this.movement.isSprinting)
    sprint.transitionsTo(idle, () => this.movement.horizontalSpeed == 0)
  
    for (const state of [idle, walk, sprint]) {
      state.transitionsBetween(jump, () => this.movement.mode === CharacterMovementMode.falling)
    }

    const sm = new AnimationStateMachine(idle)

    this.animation.setup(scene)
    this.animation.playStateMachine(sm)

    this.handleDialogues()
  }

  private handleDialogues() {
    let pointerLockElement: Element|null = null
    const unsubscribe = this.dialogueService.activeDialogue.subscribe(activeDialogue => {
      if (activeDialogue != null) {
        if (this.thirdPersonCamera.isMouseLocked) {
          pointerLockElement = window.document.pointerLockElement
          this.thirdPersonCamera.showCursor()
        }
      } else if (activeDialogue == null && pointerLockElement != null) {  
        this.thirdPersonCamera.hideCursor()
        pointerLockElement = null
      }
    })
    this.disposed.subscribe(() => unsubscribe())
  }

}

export default Character



const mustaches = [
  'Mustache_01',
  'Mustache_02',
  'Mustache_03',
]