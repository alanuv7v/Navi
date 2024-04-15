import global from "../global/global"
import * as Editor from "./Editor"
import { createMirrorLink } from "./Editor"
import * as yamlUtils from "./global/yamlUtils"
import { log } from "./Logs"

export function createMirrorLinks (raw) {
    let yamlLines = yamlUtils.parse(raw)
    for (let i=0; i<yamlLines.length; i++) {
      let line = yamlLines[i]
      const checkLink = line.value[0]==="@" || line.value ==='"@"' || line.value ==="@"
      if (!checkLink) continue
      Editor.document.edited.links.push(line)
      let mirrorLinkValue = "@"
      let mirrorTarget = line.key
      let mirrorLinkTie = yamlUtils.getPath(Editor.document.name, i, yamlLines)
      createMirrorLink(mirrorLinkValue, mirrorTarget, mirrorLinkTie, global.docs)
    }
}

export function UnirrorLinks (raw) {
  let yamlLines = yamlUtils.parse(raw)
  for (let i=0; i<yamlLines.length; i++) {
    let line = yamlLines[i]

    Editor.document.original.links.filter(l => {
      Editor.document.edited.links.find(ll => )
    })


    const checkLink = line.value[0]==="@" || line.value ==='"@"' || line.value ==="@"
    if (!checkLink) continue
    let mirrorLinkValue = "@"
    let mirrorTarget = line.key
    let mirrorLinkTie = yamlUtils.getPath(Editor.document.name, i, yamlLines)
    createMirrorLink(mirrorLinkValue, mirrorTarget, mirrorLinkTie, global.docs)
  }
}