const express = require('express')
const sqlite3 = require('sqlite3')

const seriesRouter = express.Router()

const db = new sqlite3.Database(process.env.TEST_DATABASE || '../database.sqlite')

seriesRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM Series`, (err, series) => {
        if (err) {
            next(err)
        } else {
            res.status(200).send({series: series})
        }
    })
})



module.exports = seriesRouter