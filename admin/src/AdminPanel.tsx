import axios from "axios"
import "notyf/notyf.min.css"

export function AdminPanel() {
    const sendNotification = async (type: string) => {
        try {
            await axios.post("http://localhost:5000/trigger-notification", {
                type,
            })
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div>
            <h2>Admin panel</h2>
            <div>
                <button onClick={() => sendNotification("info")}>
                    This is an info message from admin panel.
                </button>
                <button onClick={() => sendNotification("warning")}>
                    This is a warning message from admin panel.
                </button>
                <button onClick={() => sendNotification("error")}>
                    This is an error message from admin panel.
                </button>
            </div>
        </div>
    )
}
