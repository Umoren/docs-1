require("dotenv").config()
const express = require("express")
const cors = require("cors")
const { FrontendApi, Configuration } = require("@ory/client-fetch")

const app = express()

const ory = new FrontendApi(
    new Configuration({
        // Points to the local Ory API server (Ory TunneL).
        basePath: process.env.ORY_URL || "http://localhost:4000",
        baseOptions: { withCredentials: true },
    }),
)

app.use(
    cors({
        origin: process.env.UI_URL || "http://localhost:8080",
        credentials: true, // <- Required for CORS to accept cookies and tokens.
    }),
)

app.use((req, res, next) => {

    // A simple middleware to authenticate the request.
    ory
        .toSession({
            // This is important - you need to forward the cookies (think of it as a token)
            // to Ory:
            cookie: req.headers.cookie,
        })
        .then(({ data }) => {
            req.session = data
            next()
        })
        .catch((error) => {
            console.error("Authentication error:", error)
            res.status(401)
            res.json({ error: "Unauthorized" })
        })
})

app.get("/api/hello", (req, res) => {

    if (!req.session) {
        return res.status(401).json({ error: "No session found" });
    }

    try {
        res.json({
            message: "Hello from our API!",
            session_id: req.session.id,
            identity_traits: req.session?.identity?.traits || null,
        })
    } catch (error) {
        console.error("Error processing /api/hello request:", error);
        res.status(500).json({ error: "Internal server error" });
    }
})

const port = process.env.PORT || 8081
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})