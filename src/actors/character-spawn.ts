


import { Actor, inject, Parameter } from "@hology/core/gameplay";
import { SpawnPoint } from "@hology/core/gameplay/actors";
import { DialogueService } from "../services/dialogue-service";
import Npc from "./npc";
import { firstValueFrom } from "rxjs";

@Actor()
class CharacterSpawnPoint extends SpawnPoint {

  private readonly dialogueService = inject(DialogueService)

  @Parameter()
  private objectId?: string

  async onBeginPlay(): Promise<void> {
    
    console.log("IS READY", await firstValueFrom(this.dialogueService.ready))
    if (this.objectId != null) {
      const spawnPointInfo = this.dialogueService.getSpawnPoint(this.objectId)
      const characterInfo = spawnPointInfo?.character
      if (characterInfo != null) {
        // @ts-expect-error world will be exposed in future version
        const npc = await this.world.spawnActor(Npc, this.position, this.rotation)

        if (characterInfo.objectId == null) {
          console.error("Missing object_id property on character component")
          return 
        }
        npc.dialogueStart.objId = characterInfo.objectId

        if (characterInfo.asset == null) {
          console.error("Missing asset property on character component")
          return 
        }
        await npc.setModelByAssetName(characterInfo.asset)
      }
    }
  }

}

export default CharacterSpawnPoint
