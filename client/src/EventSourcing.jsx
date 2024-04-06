import React, { useEffect, useState } from "react"
import { Notyf } from "notyf"
import "notyf/notyf.min.css"
import { Box, Typography, IconButton, Popover, Badge, Button } from "@mui/material"
import NotificationsIcon from "@mui/icons-material/Notifications"
import { Calendar, dateFnsLocalizer } from "react-big-calendar"
import format from "date-fns/format"
import parse from "date-fns/parse"
import startOfWeek from "date-fns/startOfWeek"
import getDay from "date-fns/getDay"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { EventSourcePolyfill } from "event-source-polyfill"

const locales = {
    "en-US": require("date-fns/locale/en-US"),
}

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
})

export function EventSourcing() {
    const [messages, setMessages] = useState([])
    const [events, setEvents] = useState([])
    const [anchorEl, setAnchorEl] = useState(null)
    const notyf = new Notyf({ duration: 2000, position: { x: "right", y: "bottom" } })

    useEffect(() => {
        subscribe()
    }, [])

    // const sendNotification = async type => {
    //     let message
    //     switch (type) {
    //         case "info":
    //             message = "This is an info message."
    //             break
    //         case "warning":
    //             message = "This is a warning message."
    //             break
    //         case "error":
    //             message = "This is an error message."
    //             break
    //         default:
    //             notyf.error("Unknown notification type")
    //             return
    //     }

    //     await axios.post("http://localhost:5000/new-messages", {
    //         message,
    //         id: Date.now(),
    //     })

    //     notyf.success("Notification sent")
    // }

    function handleClick(event) {
        setAnchorEl(event.currentTarget)
    }

    function handleClose() {
        setAnchorEl(null)
    }

    async function subscribe() {
        const eventSource = new EventSourcePolyfill(`http://localhost:5000/connect`, {
            heartbeatTimeout: 60000,
        })
        eventSource.onmessage = function (event) {
            const message = JSON.parse(event.data)
            notyf.success("New notification received")
            setMessages(prev => [message, ...prev])
            const newEvent = {
                title: message.message,
                start: new Date(message.id),
                end: new Date(message.id + 60000),
                allDay: false,
            }
            setEvents(prevEvents => [...prevEvents, newEvent])
        }

        eventSource.addEventListener("newEvent", function (event) {
            const newEvent = JSON.parse(event.data)
            setEvents(prevEvents => [
                ...prevEvents,
                {
                    ...newEvent,
                    start: new Date(newEvent.start),
                    end: new Date(newEvent.end),
                },
            ])
        })
    }

    function addNewEvent() {
        setEvents(prev => [
            ...prev,
            {
                title: "New Event",
                start: new Date(),
                end: new Date(),
                allDay: false,
            },
        ])
    }

    const open = Boolean(anchorEl)
    const id = open ? "simple-popover" : undefined

    return (
        <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Box
                sx={{
                    top: 16,
                    right: 16,
                    display: "flex",
                    height: "100vh",
                    width: "100vw",
                }}
            >
                <Calendar
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ flex: 1, height: "700px" }}
                    localizer={localizer}
                />
                <Box>
                    <IconButton color="inherit" onClick={handleClick}>
                        <Badge badgeContent={messages.length} color="error">
                            <NotificationsIcon />
                        </Badge>
                    </IconButton>
                </Box>

                <Popover
                    id={id}
                    open={open}
                    anchorEl={anchorEl}
                    onClose={handleClose}
                    anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "right",
                    }}
                    transformOrigin={{
                        vertical: "top",
                        horizontal: "right",
                    }}
                >
                    <Box sx={{ p: 2, minWidth: "380px" }}>
                        <Typography sx={{ mb: 2, fontSize: "20px", letterSpacing: "0.6px" }}>
                            Notifications
                        </Typography>
                        {messages.map((item, index) => (
                            <Typography
                                key={item.id}
                                sx={{
                                    mb: 1,
                                    color: "info.main",
                                    borderBottom: "1px solid #ccc",
                                }}
                            >
                                {new Date(item.id).toLocaleTimeString()}: {item.message}
                            </Typography>
                        ))}
                    </Box>
                </Popover>
                <Box>
                    <Button onClick={addNewEvent}>Add new event</Button>
                </Box>
            </Box>
        </Box>
    )
}

export default EventSourcing
