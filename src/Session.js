export default class Session {
    
    constructor (data) {
        this.data = data
    }

    Clipboard = {
        get data () {
            return this.data.Clipboard
        },
        set data (value) {
            this.data.Clipboard = value
            return true
        },
        get lastItem () {
            return this.data[this.data.length-1]
        }
    }
}