import van from "vanjs-core"
const t = van.tags
const {div, span, button, textarea, input, a} = t
const d = div

import nestedObj from "./libs/nestedObj"
import * as yaml from 'yaml'

import AutoComplete from "./AutoComplete"
import { objectToBlocks, blocksToObject } from "../calc/Editor"
import Dexie from "dexie"

import { pureFileName } from "./libs/utils"
import createMirrorLink from "../calc/createMirrorLink"
import * as yamlUtils from "../calc/global/yamlUtils"

import debug from "./global/debug"
import global from "../global/global"
import ContextMenu from "../calc/ContextMenu"

/* 
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
codeanywhere에서 변경사항 있을 시 커밋 뿐만 아니라 push도 꼭 해야한다. 하고나서 깃허브에서 잘됬는지 한번더 확인할것
*/

let initMenuData = [
    {name: 'Item', 
    action: function() {alert('!')}, 
    children: [
        {name: 'child 1'}, 
        {name: 'child 2', action: function() {alert('child 2')}, 
            children: [{name: 'childrennnn'}]
        }
    ]
    },
    {name: 'fit to viewport',
    action: function () {
        if (global.InnerView.style.width === "100%") global.InnerView.style.width = "1000px"
        else global.InnerView.style.width = "100%"
    }
    },
    {name: 'Blocks to YAML',
    action: function () {
        console.log(blocksToObject(Array.from(global.Editor.blocks.children)))
    }
    }
]


function init() {
  ContextMenu
}




const Group = (name, innie) => {
  return div({class: "group"},
    div({style: "text-align: center; width: 100%; align-items: center;"}, name),
    div({style: "display: flex; flex-direction: row; align-items: center;"},
      innie
    )
  )
}
/* 
    button({
      onclick: () => {
        global.SelectedBlock.depth(-1)
      }
    }, "<depth-"),
    button({
      onclick: () => {
        global.SelectedBlock.depth(+1)
      }
    }, ">depth+"), */
global.TextModifiers = div(
  {id: "TextModifiers", class:"main"},
  Group(
    "Syntax",
    [button(
      {onclick: () => {
        let newBlock = Head("Item", null, [global.thisDoc.name, "Item"], global)
        if (global.SelectedBlock) {
          newBlock.depth(Math.max(1, global.SelectedBlock.depth_))
          global.Editor.blocks.insertBefore(newBlock, global.SelectedBlock.nextSibling)
          return
        }
        global.Editor.blocks.append(newBlock)
        newBlock.depth(1)
      }},    
      "#Key"),
    button(
      {onclick: () => {
        let newBlock = Body("body", null, global)
        if (global.SelectedBlock) {
          global.Editor.blocks.insertBefore(newBlock, global.SelectedBlock.nextSibling)
          return
        }
        global.Editor.blocks.append(newBlock)
      }},    
      "Value"),
    button("[link]"),
    button("[tie|link]")]
  ),
  Group(
    "Style",
    [button("!Bold!"),
    button("_Underline_"),
    button("/Italic/"),
    button("~Strike~"),
    button("“quote”"),]
  ),
  Group(
    "Compile",
    [button("?c.compile")]
  ),
)

async function listAllFilesAndDirs(dirHandle) {
    const files = [];
    for await (let [name, handle] of dirHandle) {
        const {kind} = handle;
        if (handle.kind === 'directory') {
            files.push({name, handle, kind, children: await listAllFilesAndDirs(handle)});
        } else {
            files.push({name, handle, kind});
        }
    }
    return files;
}

async function onFileInputClick(e) {
    const directoryHandle = await window.showDirectoryPicker()
    await directoryHandle.requestPermission()

    global.root = directoryHandle

    //save root directory handle to IndexedDB
    RootDB.roots.add({
        usage: "lastOpenedRoot",
        handle: directoryHandle
    })
    openLastOpenedRoot()

}

function YAMLPreview() {
  return textarea({class: "YAMLpreview window", onblur: (event) => {
    let yamlLines = yamlUtils.parse(event.target.value)
    for (let i=0; i<yamlLines.length; i++) {
      let line = yamlLines[i]
      const checkLink = line.value[0]==="@" || line.value ==='"@"' || line.value ==="@"
      if (!checkLink) continue
      let mirrorLinkValue = "@"
      let mirrorTarget = line.key
      let mirrorLinkTie = yamlUtils.getPath(global.thisDoc.name, i, yamlLines)
      let res = createMirrorLink(mirrorLinkValue, mirrorTarget, mirrorLinkTie, global.docs)
      console.log(res)
      if (res) debug.log(`Created mirror link. target: [${mirrorTarget}], key(tie): "${mirrorLinkTie}", value: "${mirrorLinkValue}".`)
    }
  }})
}

//App

global.View = div({id: "view", class:"main"})
global.Editor = Editor([])
global.YAMLPreview = YAMLPreview()
global.InnerView = div({class: "InnerView"},
  global.Editor,
  global.YAMLPreview
)
global.View.append(global.InnerView)
global.ContextMenu = d({style: "bottom: 0px; display: flex; flex-direction: column-reverse; z-index: 2; width: 100%; padding: 0.5em;"})
global._path = "Alan.yaml"
Object.defineProperty(global, 'path', {
    get: function() {
        return this._path
    },
    set: function(p) {
        this._path = p + ".yaml"
        return true
    }
});
global.path = "Alan"
global.LogPreview = div({id: "LogPreview"})
global.RootIO = button({onclick: 
  (event) => {onFileInputClick(event)}
}, "root: ")

const App = () => {
    
    return div({id: 'App', /* style: "display: flex; flex-direction: row; " */},
      div({id: "header", style: "display: flex; flex-direction: row; align-items: center; "},
        global.RootIO,
        button("◁"),
        button("▷"),
        button({onclick: () => updateFileViewer(path.slice(0, -1))}, "⇑"),
        button("⇓"),
        button("⟳"),
        input({style: "flex-grow: 1;", type: "text", value: "@root", placeholder: "search a thot", 
        onchange: async function (event) {
            let searchResult = global.docs.find((doc) => {
                let docName = pureFilename(doc.name) //removing the extension str
                return docName === event.target.value
            })
            let file = await searchResult.handle.getFile() // get Blob
            let obj = await yaml.parse(await file.text())
            console.log(global.docs, searchResult, await obj)
        },
        oninput: (event) => {
            AutoComplete(event.target, global.docs)
        }
        }),
        button("👁 All"),
      ),
      global.View, 
      global.TextModifiers,
      global.ContextMenu,
      global.LogPreview,
    )
}

    
van.add(document.body, App())
init()


//Init DB

//if RootDB already exists in the browser, Dexie will open the existing one
//otherwise Dexie will create a new one and return it
//so don't worry about creating duplicated DB
let RootDB = new Dexie("RootsDB");

RootDB.version(1).stores({
  roots: `
    ++id,
    usage,
    handle`,
});

global.DB = RootDB
global.thisDoc = {}


async function openRoot(handle) {
  global.root = handle
  global.docs = await listAllFilesAndDirs(handle)
  if (!(await handle.queryPermission()) === "granted") {
    await handle.requestPermission()
  } 
  return true
}

//open lastOpened root
async function openLastOpenedRoot() {
  if (RootDB.roots.where("usage").equals("lastOpenedRoot")) { 
    let lastOpenedRootHandle = (await RootDB.roots.where("usage").equals("lastOpenedRoot").toArray())[0].handle
    await openRoot(lastOpenedRootHandle)
    global.config = await parseDoc(global.docs.find((doc) => {return doc.name === "_config.yaml"}).handle)
    console.log(global.config.root, global.docs)
    let rootDoc = await global.docs.find((doc) => {return doc.name === global.config.root}).handle
    openDoc(rootDoc).then(() => {
      global.RootIO.innerText = "root: " + global.thisDoc.name
    })
  } else {
    debug.log("Open a root to explore and edit.")
  }
}

async function parseDoc(handle) {
  if (!(await handle.queryPermission()) === "granted") {
    await handle.requestPermission()
  } 
  let docFile = await handle.getFile()
  let docRaw = await docFile.text()
  return await yaml.parse(docRaw)
}


async function openDoc(handle) {
    if (!(await handle.queryPermission()) === "granted") {
      await handle.requestPermission()
    } 
    let docFile = await handle.getFile()
    let docRaw = await docFile.text()
    global.thisDoc.original = docRaw
    global.thisDoc.parsed = yaml.parse(docRaw)
    global.thisDoc.name = pureFilename(handle.name)

    updateEditor(global.thisDoc.parsed, [])
    debug.log(`Successfully opened the document [${global.thisDoc.name}]`)
    return true
}
global.openDoc = openDoc

openLastOpenedRoot()
console.log("GLOBAL:", global)