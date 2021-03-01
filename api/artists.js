const errorHandler = require('errorhandler')
const express = require('express')
const artistsRouter = express.Router()
const sqlite3 = require('sqlite3')
const db = new sqlite3.Database(process.env.TEST_DATABASE || '../database.sqlite')

artistsRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Artist WHERE is_currently_employed = 1', (err, rows) => {
        if (err) {
            next(err)
        }

        res.status(200).send({artists: rows})
    })
})

artistsRouter.param('artistId', (req, res, next, id) => {
    db.get('SELECT * FROM Artist WHERE id=$id', {$id: id}, 
    (err, row) => {
        if (err) {
            next(err)
        }
        if (row) {
            req.artist = row
            next()
        } else {
            res.sendStatus(404)
        }
    })
})

artistsRouter.get('/:artistId', (req, res, next) => {
    const artistId = req.params.artistId
    db.get('SELECT * FROM Artist WHERE id=$artistId', {$artistId: artistId}, 
    (err, row) => {
        if (err) {
            next(err)
        }
        res.status(200).send({artist: row})
    })
})

const validationCheck = (req, res, next) => {
    if (
        req.body.artist.name &&
        req.body.artist.dateOfBirth &&
        req.body.artist.biography
    ) {
        next()
    } else {
        res.sendStatus(400)
    }
}

artistsRouter.post('/', validationCheck, (req, res, next) => {
    const isCurrentlyEmployed = req.body.artist.isCurrentlyEmployed === 0 ? 0 : 1
    db.run(`INSERT INTO Artist (name, date_of_birth, biography, is_currently_employed)
        VALUES ($name, $dateOfBirth, $biography, $isCurrentlyEmployed)`, {
            $name: req.body.artist.name,
            $dateOfBirth: req.body.artist.dateOfBirth,
            $biography: req.body.artist.biography,
            $isCurrentlyEmployed: isCurrentlyEmployed
        }, (err) => {
            if (err) {
                next(err)
            }
            db.get(`SELECT * FROM Artist WHERE id=${this.lastID}`, (err, row) => {
                res.status(201).send({artist: row})
            })
        })
})

module.exports = artistsRouter