

import { NodeShaderMaterial, float, lambertMaterial, mix, rgb, rgba, smoothstep, textureSampler2d, transformed, varyingAttributes, varyingFloat, vec2 } from "@hology/core/shader-nodes";
import { NodeShader, NodeShaderOutput, Parameter } from "@hology/core/shader/shader";
import { Color, Texture } from "three";

export default class GrassShader extends NodeShader {
  @Parameter()
  color: Color

  @Parameter()
  colorBottom: Color

  @Parameter()
  alphaMap: Texture

  output(): NodeShaderOutput {
    const distanceFromCamera = transformed.mvPosition.z.multiply(float(-1))
    const distanceAlpha = varyingFloat(smoothstep(float(1000), float(60) , distanceFromCamera))    

    const tipColor = rgb(this.color ?? 0xffffff)
    
    const gradientColor = mix(
      tipColor,
      rgb(this.colorBottom),
      varyingAttributes.uv.y
    )

    const alpha = this.alphaMap != null 
      ? textureSampler2d(this.alphaMap).sample(varyingAttributes.uv.multiply(vec2(1, -1))).r
      : float(1)

    const lambertColor = lambertMaterial({color: gradientColor}).rgb

    return {
      color: rgba(lambertColor, alpha.multiply(distanceAlpha)),
      alphaTest: 0.8
    }
  }
}
