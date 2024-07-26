import refs from "../DOMRefs"
import Logger from "../prototypes/view/Logger"

export default function (action) {
    
    refs("CommandPalette").focus()
    refs("CommandPalette").placeholder = "arguments..."

    let onArgumentsSubmit = async (event) => {

        let actionResult = await action(event.target.value)
        Logger.log(`action result: ${actionResult}`)
        
        refs("CommandPalette").placeholder = ""
        refs("CommandPalette").removeEventListener("blur", onArgumentsSubmit)
    }

    refs("CommandPalette").addEventListener("blur", onArgumentsSubmit)

}