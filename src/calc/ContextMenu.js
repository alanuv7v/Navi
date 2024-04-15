import global from "../global/global";
import van from "vanjs-core"
const {div, span, button, textarea, input, a} = van.tags

const MenuItem = (rowIndex, name, action, children) => {
    return button({onclick: (event) => {
        console.log("row: " + rowIndex)
        action();
        if (children) stack(rowIndex,  children);
    }}, name)
}
const Row = (index, data) => {
    return div(
        {style: "display: flex; flex-direction: row"}, 
        data.map(i => MenuItem(index, i.name, i.action, i.children))
    )
}
export const replace = (rowsData) => {
    console.log(rowsData)
    global.contextMenu = rowsData
    //remove prev
    global.DOM.ContextMenu.innerHTML = ""
    /* while (global.ContextMenu.hasChildNodes()) {
        global.ContextMenu.firstChild.remove() 
    } */
    for (let i=0; i < rowsData.length; i++) {
        let data = rowsData[i]
        global.DOM.ContextMenu.append(Row(i, data))
    }
}
export const stack = (fromRowIndex, nextRowData) => {
    console.log(global.contextMenu)
    replace([...global.contextMenu.slice(0, fromRowIndex+1), nextRowData])
}