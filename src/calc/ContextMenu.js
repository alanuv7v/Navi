import global from "../global/global";

export default ContextMenu  = {
    MenuItem: (rowIndex, name, action, children) => {
        return button({onclick: (event) => {
          action();
          if (children) updateContextMenu(rowIndex,  children);
        }}, name)
    },
    Row: (data) => {
        return div(
            {style: "display: flex; flex-direction: row"}, 
            data.map(i => MenuItem(index, i.name, i.action, i.children))
        )
    },
    replace: (rowsData) => {
        global.contextMenu = rowsData
        //remove prev
        global.DOM.ContextMenu.innerHTML = ""
        /* while (global.ContextMenu.hasChildNodes()) {
            global.ContextMenu.firstChild.remove() 
        } */
        let rows = rowsData.map((r) => this.Row(r))
        for (let row of rows) {
            global.DOM.ContextMenu.append(row)
        }
    },
    update: (fromRowIndex, nextRowData) => {
        this.replace([...global.contextMenu.slice(0, fromRowIndex), nextRowData])
    }
}
