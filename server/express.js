import express from 'express'
import cookieParser from 'cookie-parser'
import compress from 'compression'
import cors from 'cors'
import helmet from 'helmet'
import Template from './../template'
import userRoutes from './routes/user.routes'
import authRoutes from './routes/auth.routes'
import path from 'path'
import devBundle from './devBundle' //Закомментировать для продакшена

// Modules for server-side rendering
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import { StaticRouter }from 'react-router-dom'
import MainRouter from './../client/MainRouter'
import { ServerStyleSheets, ThemeProvider } from '@material-ui/styles'
import theme from './../client/theme'

const app = express()
devBundle.compile(app) // Закомментировать для продакшена
const CURRENT_WORKING_DIR = process.cwd()
// app.get('/', (req, res) => {
//     res.status(200).send(Template())
// })

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())
app.use(compress())
app.use(helmet())
app.use(cors())
// app.use((err, req, res, next) => {
//     if (err.name === 'UnauthorizedError') {
//         res.status(401).json({"error": err.name + ": " + err.message})
//     } else if (err) {
//         res.status(400).json({"error" : err.name + ": " + err.message})
//         console.log(err)
//     }
// })
app.use('/dist', express.static(path.join(CURRENT_WORKING_DIR, 'dist')))

// Mounts routes
app.use('/', userRoutes)
app.use('/', authRoutes)

app.get('*', (req, res) => {
    const sheets = new ServerStyleSheets()
    const context = {}
    const markup = ReactDOMServer.renderToString(
        sheets.collect(
            <StaticRouter location={req.url} context={context}>
                <ThemeProvider theme={theme}>
                    <MainRouter />
                </ThemeProvider>

            </StaticRouter>
        )
    )
    if (context.url) {
        return res.redirect(303, context.url)
    }
    const css = sheets.toString()
    res.status(200).send(Template({
        markup: markup,
        css: css
    })) 
})
// Catch unauthorized errors
app.use((err,req, res, next) => {
    if (err.name === 'UnauthorizedError'){
        res.status(401).json({"error": err.name + ": " + err.message})
    } else if (err) {
        res.status(400).json({"error": err.name + ": " + err.message})
        console.log(err)
    }
})

export default app