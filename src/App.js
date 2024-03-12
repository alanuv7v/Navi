import van from "vanjs-core"
const t = van.tags
const {div, span, button, textarea, input, a} = t
const d = div

import { createEvent, createStore } from "effector" 

import nestedObj from "./libs/nestedObj"
import * as yaml from 'yaml'
import File from "./comps/FileViewer/File"
import Folder from "./comps/FileViewer/Folder"
import {createBlock as Block} from "./comps/FileViewer/Block"
import { MultilineTextarea, resizeTextarea } from "./comps/MultilineTextarea"
import Head from "./comps/FileViewer/Head"
import Body from "./comps/FileViewer/Body"
import AutoComplete from "./comps/AutoComplete"
import objectToBlocks from "./comps/FileViewer/objectToBlocks"
import blocksToObject from "./comps/FileViewer/blocksToObject"
import Dexie from "dexie"

/* 
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
codeanywhere에서 변경사항 있을 시 커밋 뿐만 아니라 push도 꼭 해야한다. 하고나서 깃허브에서 잘됬는지 한번더 확인할것
*/

//util
const log = (text) => console.log(text)


//global variables
const global = {}

let head = (async function () {return await import('./data/docs/Alan.yaml')})()

global.thisDoc = import('./data/docs/Alan.yaml').then((module) => {return module.default})
global.thisDocName = "Alan"

global.docYAML = import('./data/docs/Alan.txt')
let initTargets = {
  'MultilineTextarea' : []
}
const docsDB = new Dexie('docs');

docsDB.version(1).stores({
    docs: '++id, usage, filehandle'
});

const FileList = async (head, path) => {
    let pathResult = nestedObj(head, path)
    let items = []
    let depth = 0
    let indexInDepth = 0

    items = await objectToBlocks(head, global)
    return items
}

const FileViewer = (path) => {
  let This = "root"
  return div(
      {class: "FileViewer"},
      div({class: "h-flex Block", style: "margin-bottom: 0px;"},
        div({class: "Name"}, This),
        div({class: "h-flex"}, span("["),a("edit"), span("]"))
      ),
      global.FileList
  )
}

async function updateFileList(head, path) {
  let list = await FileList(head, path)
  for (let item of list) {
    global.FileList.append(item)
  }
  return list
}



const MenuItem = (menuIndex, name, action, children) => {
  console.log('At MenuItem init, menus.getState() = ', JSON.stringify(menus.getState(), null, 2) + '. Index is ' + menuIndex)  
  return button({onclick: (event) => {
    action();
    if (children) updateContextMenu({fromIndex: menuIndex, toAdd: children});
  }}, name
  )
}

const Menu = (menuItems) => {
  let index = menus.getState().length
  let MenuItems = []
  for (let m of menuItems) {
    MenuItems.push(MenuItem(index, m.name, m.action, m.children))
  }
  return div({style: "display: flex; flex-direction: row"}, MenuItems)
}
global.menus = createStore([])
let menus = global.menus

menus.watch(ms => {
  if (global.ContextMenu) {
    while (global.ContextMenu.hasChildNodes()) {
      global.ContextMenu.firstChild.remove() 
    }
    for (let menuItems of ms) {
      menuItems = Array.isArray(menuItems) ? menuItems : [menuItems]
      global.ContextMenu.append(Menu(menuItems))
    }
  }
})

let updateContextMenu = createEvent()

menus
  .on(updateContextMenu, function(prev, props) {
        let {fromIndex, toAdd} = props
        console.log('update ContextMenu: ' + JSON.stringify([...prev.slice(0, fromIndex), toAdd], null, 2))
        return [...prev.slice(0, fromIndex), toAdd]
      })

  /* 
function updateMenus(fromIndex, childrenMenus) {
  menus.val = [...menus.val.slice(0, fromIndex), childrenMenus]
  return menus.val
} */




let defaultMenu = [
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
        if (global.FileViewer.style.width === "100%") global.FileViewer.style.width = "1000px"
        else global.FileViewer.style.width = "100%"
    }
    },
    {name: 'Blocks to YAML',
    action: function () {
        console.log(blocksToObject(Array.from(global.FileList.children)))
    }
    }
]

//yaml: 
/* `
name: Item
action: 
    args: []
    body: "alert"
children: 
    - {
        name:
        action:
        children:
    }
    - {}
    - {}

` */


function init() {

  for (let mt of initTargets['MultilineTextarea']) {
    resizeTextarea(mt.children[0], mt.children[1])
  }

  updateContextMenu({fromIndex: 0, toAdd: defaultMenu})


}




const Group = (name, innie) => {
  return div({class: "group"},
    div({style: "text-align: center; width: 100%; align-items: center;"}, name),
    div({style: "display: flex; flex-direction: row; align-items: center;"},
      innie
    )
  )
}

global.TextModifiers = div(
  {id: "TextModifiers", class:"main"},
  Group(
    "Syntax",
    [button(
      {onclick: () => {
        let newBlock = Head("Item", null, [global.thisDocName, "Item"], global)
        if (global.SelectedBlock) {
          newBlock.depth(Math.max(1, global.SelectedBlock.depth_))
          global.FileList.insertBefore(newBlock, global.SelectedBlock.nextSibling)
          return
        }
        global.FileList.append(newBlock)
        newBlock.depth(1)
      }},    
      "#Key"),
    button(
      {onclick: () => {
        let newBlock = Body("body", null, global)
        if (global.SelectedBlock) {
          global.FileList.insertBefore(newBlock, global.SelectedBlock.nextSibling)
          return
        }
        global.FileList.append(newBlock)
      }},    
      "Value"),
    button({
      onclick: () => {
        global.SelectedBlock.depth(-1)
      }
    }, "<depth-"),
    button({
      onclick: () => {
        global.SelectedBlock.depth(+1)
      }
    }, ">depth+"),
    button("[link]"),
    button("[tie|link]")]
  ),
  Group(
    "Style",
    [button("!Bold!"),
    button("_Underline_"),
    button("/Italic/"),
    button("~Strike~"),]
  ),
  Group(
    "Organize",
    [button("* Ul"),
    button("1. Ol"),
    button("“quote”"),]
  ),
  Group(
    "Custom",
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
    global.docs = await listAllFilesAndDirs(directoryHandle);
    console.log(await global.docs)

    let root = global.docs.find((d) => {return d.name==="@root"})

    global.docsDB = docsDB
    
    await docsDB.docs.add({
        usage: "lastOpened",
		filehandle: root
	});
    console.log(await docsDB)
    
}

//App

global.View = div({id: "view", class:"main"})
global.FileViewer = FileViewer([])
global.View.append(global.FileViewer)
global.FileList = div({id: "FileList"})
global.FileViewer.append(global.FileList)
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

const App = (head) => {
    
    return div({id: 'App', /* style: "display: flex; flex-direction: row; " */},
      div({id: "header", style: "display: flex; flex-direction: row; align-items: center; "},
        button({onclick: 
            (event) => {onFileInputClick(event)}
        },  
        "root: Alan"),
        button("◁"),
        button("▷"),
        button({onclick: () => updateFileViewer(path.slice(0, -1))}, "⇑"),
        button("⇓"),
        button("⟳"),
        input({style: "flex-grow: 1;", type: "text", value: "@root", placeholder: "search a thot", onchange: async function (event) {
            let searchResult = global.docs.find((doc) => {
                let docName = doc.name.slice(0, doc.name.lastIndexOf(".")) //removing the extension str
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
    )
}
  
head.then((h) => {
    console.log("GLOBAL:", global)
    global.head = h.default
    head = h.default
    van.add(document.body, App({"Root": h.default}))
    updateFileList(head, [])
    init()


})

