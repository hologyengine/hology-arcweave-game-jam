import { inject, Service } from "@hology/core/gameplay"
import {
  InputService,
  Keybind,
  Mousebind,
  Wheelbind,
} from "@hology/core/gameplay/input"
import Character from "../actors/character"

enum InputAction {
  moveForward,
  moveBackward,
  moveLeft,
  moveRight,
  jump,
  sprint,
  crouch,
  rotate,
  rotateCamera,
  zoomCamera
}

@Service()
class PlayerController {
  private inputService = inject(InputService)
  private character?: Character

  constructor() {
    this.inputService.setKeybind(InputAction.jump, new Keybind(" "))
    this.inputService.setKeybind(InputAction.sprint, new Keybind("Shift"))
    this.inputService.setKeybind(InputAction.moveForward, new Keybind("w"))
    this.inputService.setKeybind(InputAction.moveBackward, new Keybind("s"))
    this.inputService.setKeybind(InputAction.moveLeft, new Keybind("a"))
    this.inputService.setKeybind(InputAction.moveRight, new Keybind("d"))
    this.inputService.setMousebind(
      InputAction.rotate,
      new Mousebind(0.01, true, "x")
    )
    this.inputService.setMousebind(
      InputAction.rotateCamera,
      new Mousebind(0.003, false, "y")
    )
    this.inputService.setWheelbind(
      InputAction.zoomCamera,
      new Wheelbind(0.0003, false)
    )
  }

  public setup(character: Character) {
    this.inputService.stop()
    this.character = character
    this.bindCharacterInput()
    this.inputService.start()
  }

  private bindCharacterInput() {
    if (this.character == null) {
      return
    }
    const playerMove = this.character.movement.directionInput
    const playerJump = this.character.movement.jumpInput
    const playerSprint = this.character.movement.sprintInput

    this.inputService.bindToggle(InputAction.jump, playerJump.toggle)
    this.inputService.bindToggle(InputAction.sprint, playerSprint.toggle)
    this.inputService.bindToggle(InputAction.moveForward, playerMove.togglePositiveY)
    this.inputService.bindToggle(InputAction.moveBackward, playerMove.toggleNegativeY)
    this.inputService.bindToggle(InputAction.moveLeft, playerMove.toggleNegativeX)
    this.inputService.bindToggle(InputAction.moveRight, playerMove.togglePositiveX)
    this.inputService.bindDelta(
      InputAction.rotate,
      (delta) => {
        this.character?.movement.rotationInput.rotateY(delta)
        this.character?.thirdPersonCamera.rotationInput.rotateY(delta)
      }
    )
    this.inputService.bindDelta(
      InputAction.rotateCamera,
      this.character.thirdPersonCamera.rotationInput.rotateX
    )
    this.inputService.bindDelta(
      InputAction.zoomCamera,
      this.character.thirdPersonCamera.zoomInput.increment
    )

  }
}

export default PlayerController
