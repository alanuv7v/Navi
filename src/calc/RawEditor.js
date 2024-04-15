import Editor from "./Editor"

export default RawEditor = {
    createMirrorLinks (raw) {
        let yamlLines = yamlUtils.parse(raw)
        for (let i=0; i<yamlLines.length; i++) {
          let line = yamlLines[i]
          const checkLink = line.value[0]==="@" || line.value ==='"@"' || line.value ==="@"
          if (!checkLink) continue
          let mirrorLinkValue = "@"
          let mirrorTarget = line.key
          let mirrorLinkTie = yamlUtils.getPath(global.thisDoc.name, i, yamlLines)
          let res = Editor.createMirrorLink(mirrorLinkValue, mirrorTarget, mirrorLinkTie, global.docs)
          console.log(res)
          if (res) debug.log(`Created mirror link. target: [${mirrorTarget}], key(tie): "${mirrorLinkTie}", value: "${mirrorLinkValue}".`)
        }
    }
}
