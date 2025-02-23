import { Service } from "@hology/core/gameplay";
import { signal } from "@preact/signals-react"
import arcweaveProject from '../arcweave.json'
//import arcweaveProject from 'virtual:arcweave'
import { StoryOption, ArcweaveStory } from "@hology/arcweave";

console.log(arcweaveProject)

export type DialogueStoryEnd = {
  body: string
  restartButtonText: string
}

export type DialogueElement = {
  speakerName?: string
  content: string
  options: StoryOption[]
  end: boolean,
  storyEnd: DialogueStoryEnd|null
}

@Service()
class DialogueService {
  readonly activeDialogue = signal<DialogueElement|null>(null)
  story?: ArcweaveStory<typeof arcweaveProject>

  async init() {
    this.story = new ArcweaveStory(await getProjectData())
  }

  startDialogue(objId: string) {
    if (this.story == null) {return}
    const characterId = this.story?.findComponentId({attribute: [
      {name: 'object_id', value: objId}, 
      {name: 'object_type', value: 'character'}
    ]})
    if (characterId == null) {
      console.error(`Could not find character with object_id ${objId}`)
      return
    }
    const startElementId = this.story?.findElementId({attribute: [{name: 'dialogue', value: 'start'}], componentId: characterId})
    if (startElementId == null) {
      console.error(`Could not find dialogue start for character with object_id ${objId}`)
      return
    }
    this.story?.setCurrentElement(startElementId)
    this.updateActiveDialogue()
  }

  endDialogue() {
    this.activeDialogue.value = null
  }

  selectOption(path: StoryOption) {
    if (this.story == null) {return}
    this.story?.selectOption(path)
    this.updateActiveDialogue()
  }

  private updateActiveDialogue() {
    if (this.story == null) {return}
    const element = this.story?.getCurrentElement()
    if (element == null) {
      this.activeDialogue.value = null
      return
    }
    const storyEndComponent = element.components.find(c => c.attributes['object_type'] === 'story_end')
    const storyEnd = storyEndComponent != null
      ? {
        body: typeof storyEndComponent.attributes.body === 'string' 
          ? storyEndComponent.attributes.body
          : 'Game over',
        restartButtonText: typeof storyEndComponent.attributes.restart_button_text === 'string' 
          ? storyEndComponent.attributes.restart_button_text
          : 'Restart',
      } satisfies DialogueStoryEnd
      : null
    this.activeDialogue.value = {
      speakerName: element.components.find(c => c.attributes['object_id'] != null)?.name,
      content: element.content,
      options: element.options,
      end: element.attributes['dialogue'] === 'end' || element.options.length === 0,
      storyEnd: storyEnd
    }
  }

  getCharacter(objectId: string) {
    if (this.story == null) {return}
    const componentId = this.story.findComponentId({attribute: [{name: 'object_id', value: objectId}, {name: 'object_type', value: 'character'}]})
    if (componentId == null) {
      throw "No copmonent exists with object id " + objectId
    }
    const attributes = this.story.getComponentAttributes(componentId)
    return {
      id: componentId,
      mustache: attributes.mustache != null && typeof attributes.mustache === 'string' 
        ? Number.parseInt(attributes.mustache) : undefined
    }
  }
}

export { DialogueService }

export type StoryCharacter = {
  mustache?: number
}

const corsAnywhere = 'https://cors-anywhere.herokuapp.com/'
const url = 'https://arcweave.com/api/';
const defaultProjectHash = 'dQlAKGj6ng'
const apiKey: string|undefined = import.meta.env?.VITE_AW_API_KEY

async function getProjectData(): Promise<typeof arcweaveProject> {
  // Instead of using the api, it can just use the import json export as part of the project.
  //return arcweaveProject
  
  const search = window.location.search;
  const params = new URLSearchParams(search);
  const projectHash = params.get('project') ?? defaultProjectHash

  const options = {
    method: 'GET',
    headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Accept': 'application/json'
    }
  };

  if (apiKey != null) {
    const response = await fetch(url + projectHash + '/json', options)
      .then(response => {
        if (!response.ok) {
            throw new Error(`Failed to fetch Arcweave Project. HTTP error. Status: ${response.status}`);
        }
        return response.json();
    })
    return response
  } else {
    return arcweaveProject
  }
}