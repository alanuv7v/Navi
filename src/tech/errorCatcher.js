import Logger from "./gui/Logger";

export default function () {

    window.onunhandledrejection = event => {
        Logger.log(`UNHANDLED PROMISE REJECTION: ${event.reason}`, "error");
    };
      
    window.onerror = function(message, source, lineNumber, colno, error) {
        Logger.log(`UNHANDLED ERROR: ${error.stack}`, "error");
    };

    window.addEventListener("error", function (e) {
        Logger.log(`UNHANDLED ERROR: ${error.stack}`, "error");
        return false;
     })

}
