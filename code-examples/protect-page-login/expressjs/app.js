// Copyright © 2022 Ory Corp
// SPDX-License-Identifier: Apache-2.0

const express = require("express")
const cookieParser = require("cookie-parser")
const path = require("path")
const { FrontendApi, Configuration } = require("@ory/client")

const app = express()
const port = 3000

app.use(express.json())
app.use(cookieParser())

app.set("view engine", "pug")
app.set("views", path.join(__dirname, "views"))

// Initialize Ory client, pointing to the Ory Proxy on port 4000
const ory = new FrontendApi(
    new Configuration({
        basePath: process.env.ORY_SDK_URL || "http://localhost:4000/.ory",
        baseOptions: {
            withCredentials: true,
        },
    })
)

// Session middleware checks for a valid session
async function sessionMiddleware(req, res, next) {

    try {
        const { data: session } = await ory.toSession({
            cookie: req.header("cookie"),
        })

        if (!session || !session.active) {
            console.log("No active session, redirecting to login...")
            return res.redirect("/.ory/ui/login")
        }

        req.sessionData = session
        next()
    } catch (error) {
        console.error("Session error:", error?.response?.data || error)
        return res.redirect("/.ory/ui/login")
    }
}

app.get("/", sessionMiddleware, (req, res) => {
    // Retrieve the session from middleware
    const session = req.sessionData

    res.render("index", {
        title: "Dashboard",
        identity: session.identity,
        sessionData: JSON.stringify(session, null, 2),
    })
})

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`)
    console.log("Make sure to access it via: http://localhost:4000 once Ory Proxy is running!")
})

