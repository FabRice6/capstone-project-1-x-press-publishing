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
        !req.body.artist.name ||
        !req.body.artist.dateOfBirth ||
        !req.body.artist.biography
    ) {
        res.sendStatus(400)
    } else {
        next()
    }
}

artistsRouter.post('/', validationCheck, (req, res, next) => {
    const name = req.body.artist.name
    const dateOfBirth = req.body.artist.dateOfBirth
    const biography = req.body.artist.biography
    const isCurrentlyEmployed = req.body.artist.isCurrentlyEmployed === 0 ? 0 : 1

    const sql = `INSERT INTO Artist (name, date_of_birth, biography, is_currently_employed)
        VALUES ($name, $dateOfBirth, $biography, $isCurrentlyEmployed)`

    const values = {
        $name: name,
        $dateOfBirth: dateOfBirth,
        $biography: biography,
        $isCurrentlyEmployed: isCurrentlyEmployed
    }

    db.run(sql, values, (error) => {
        if (error) {
            next(error)
        } else {
            db.get(`SELECT * FROM Artist WHERE Artist.id = ${this.lastID}`,
            (error, artist) => {
                res.status(201).send({artist: artist})
            })
        }
    })
})

// // This code is the exact same as the solution but doesn't pass the tests...
// artistsRouter.post('/', (req, res, next) => {
//     const name = req.body.artist.name
//     const dateOfBirth = req.body.artist.dateOfBirth
//     const biography = req.body.artist.biography
//     const isCurrentlyEmployed = req.body.artist.isCurrentlyEmployed === 0 ? 0 : 1
//     if (!name || !dateOfBirth || !biography) {
//         return res.sendStatus(400)
//     }

//     const sql = `INSERT INTO Artist (name, date_of_birth, biography, is_currently_employed)
//         VALUES ($name, $dateOfBirth, $biography, $isCurrentlyEmployed)`

    // const values = {
    //     $name: name,
    //     $dateOfBirth: dateOfBirth,
    //     $biography: biography,
    //     $isCurrentlyEmployed: isCurrentlyEmployed
    // }

//     db.run(sql, values, (error) => {
//         if (error) {
//             next(error)
//         } else {
//             db.get(`SELECT * FROM Artist WHERE Artist.id = ${this.lastID}`,
//             (error, artist) => {
//                 res.status(201).send({artist: artist})
//             })
//         }
//     })
// })

artistsRouter.put('/:artistId', validationCheck, (req, res, next) => {
    const id = req.params.artistId
    const name = req.body.artist.name
    const dateOfBirth = req.body.artist.dateOfBirth
    const biography = req.body.artist.biography
    const isCurrentlyEmployed = req.body.artist.isCurrentlyEmployed === 0 ? 0 : 1

    const sql = `UPDATE Artist 
        SET name=$name, date_of_birth=$dateOfBirth, biography=$biography, is_currently_employed=$isCurrentlyEmployed
        WHERE id=$id`
    const values = {
        $id: id,
        $name: name,
        $dateOfBirth: dateOfBirth,
        $biography: biography,
        $isCurrentlyEmployed: isCurrentlyEmployed
    }

    db.run(sql, values, (error) => {
        if (error) {
            next(error)
        } else {
            db.get(`SELECT * FROM Artist WHERE Artist.id = ${id}`,
            (error, artist) => {
                res.status(200).send({artist: artist})
            })
        }
    })
})

artistsRouter.delete('/:artistId', (req, res, next) => {
    const id = req.params.artistId
    
    const sql = `UPDATE Artist
        SET is_currently_employed=0
        WHERE id=${id}`
    
    db.run(sql, (err) => {
        if (err) {
            next(err)
        } else {
            db.get(`SELECT * FROM Artist WHERE Artist.id = ${id}`,
            (error, artist) => {
                res.status(200).send({artist: artist})
            })
        }
    })
})

module.exports = artistsRouter