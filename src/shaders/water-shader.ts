
import { NodeShader, NodeShaderOutput, Parameter } from "@hology/core/shader/shader";
import { rgb, standardMaterial } from "@hology/core/shader-nodes";
import { Color } from 'three';

export default class WaterShader extends NodeShader {
   
  @Parameter()
  color: Color = new Color()

  @Parameter()
  normalMap: Texture = new Texture()

  output(): NodeShaderOutput {
    return {
      color: standardMaterial({color: rgb(this.color)})
    }
  } 

}
