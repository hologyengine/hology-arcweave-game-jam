import { Service, GameInstance, inject, PhysicsSystem, World } from '@hology/core/gameplay';
import { SpawnPoint } from '@hology/core/gameplay/actors';
import Character from '../actors/character';
import PlayerController from './player-controller';
import { DialogueService } from './dialogue-service';
import CharacterSpawnPoint from '../actors/character-spawn';

@Service()
class Game extends GameInstance {
  private world = inject(World)
  private playerController = inject(PlayerController)
  private physics = inject(PhysicsSystem)
  private dialogueService = inject(DialogueService)

  async onStart() {
    this.physics.showDebug = false

    await this.dialogueService.init()

    const spawnPoint = this.world.actors.find(a => a instanceof SpawnPoint && !(a instanceof CharacterSpawnPoint)) as SpawnPoint
    const character = await spawnPoint.spawnActor(Character)
    this.playerController.setup(character)
  }
}

export default Game
