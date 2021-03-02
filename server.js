const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const cors = require('cors')
const errorhandler = require('errorhandler')
const apiRouter = require('./api/api')

const app = express()

const PORT = process.env.PORT || 4000

app.use(morgan('dev'))
app.use(bodyParser.json())
app.use(errorhandler())
app.use(cors())

app.use('/api', apiRouter)

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
})

module.exports = app