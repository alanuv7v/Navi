import global from "../global/global"
import * as Editor from "./Editor"
import { createMirrorLink } from "./Editor"
import * as yamlUtils from "./global/yamlUtils"
import { log } from "./Logs"
import deepEqual from "deep-equal"

export function createMirrorLinks () {
    let yamlLines = yamlUtils.parse(global.DOM.RawEditor.value)
    for (let i=0; i<yamlLines.length; i++) {
      let line = yamlLines[i]
      const checkLink = line.value[0]==="@" || line.value ==='"@"' || line.value ==="@"
      if (!checkLink) continue
      Editor.document.edited.links.push(line)
      let mirrorLinkValue = "@"
      let mirrorTarget = line.key
      let mirrorLinkTie = yamlUtils.getPath(Editor.document.name, i, yamlLines)
      createMirrorLink(mirrorLinkValue, mirrorTarget, mirrorLinkTie)
    }
}

export function UnmirrorLinks () {
  let deletedLinks = Editor.document.original.links.filter(l => {
    !Editor.document.edited.links.find(ll => deepEqual(l, ll))
  })
  console.log(deletedLinks)
  /* for (let link of deletedLinks) {
    let path = link.key.split("/")
    Editor.deleteProperty(path[0], path.slice(1))
  } */
}