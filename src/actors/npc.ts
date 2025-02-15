
import {Actor, AnimationState, AnimationStateMachine, attach, BaseActor, Parameter, inject} from '@hology/core/gameplay';
import { CharacterAnimationComponent } from "@hology/core/gameplay/actors";
import {Mesh, MeshBasicMaterial, Object3D, SphereGeometry, DoubleSide, Material} from 'three';
import { DialogueStartComponent } from "../components/dialogue-start";
import {DialogueService, StoryCharacter} from '../services/dialogue-service';

@Actor()
class Npc extends BaseActor {

  private dialogueStart = attach(DialogueStartComponent)
  private animation = attach(CharacterAnimationComponent)

  public health: number = 50

  private dialogueService = inject(DialogueService)

  private info?: StoryCharacter

  @Parameter()
  private model?: Object3D

  async onInit(): Promise<void> {
    if (this.model == null) {
      this.model = new Mesh(new SphereGeometry(1), new MeshBasicMaterial({color: this.dialogueStart.objId ? 'white' : 'red'}))
    } else {
      // Fix materials and disable AO
      this.model.traverse(o => {
        if (o instanceof Mesh) {
          o.castShadow = true
          if (o.material instanceof Material) {
            o.material.transparent = false
            o.material.side = DoubleSide
            o.material.depthWrite = true
            o.material.alphaTest = 0.1
          }
        }
      })
      this.model.scale.multiplyScalar(1.5)
    }
    
    const animations = this.model.animations
    this.object.add(this.model)

    if (this.dialogueStart.objId != null) {
      this.info = this.dialogueService.getCharacter(this.dialogueStart.objId)
    }

    const clips = Object.fromEntries(animations.map(clip => [clip.name, clip]))  

    const idle = new AnimationState(clips.Idle)
    const sit = new AnimationState(clips.Lie_Pose)

    idle.transitionsBetween(sit, () => this.health < 40)
    
    const sm = new AnimationStateMachine(idle)

    this.animation.setup(this.model)
    this.animation.playStateMachine(sm)
  }

}

export default Npc
