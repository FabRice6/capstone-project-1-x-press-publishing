const express = require('express')
const issuesRouter = express.Router({mergeParams: true})
const sqlite3 = require('sqlite3')
const artistsRouter = require('./artists')
const db = new sqlite3.Database(process.env.TEST_DATABASE || '../database.sqlite')

issuesRouter.param('issueId', (req, res, next, id) => {
    const sql = 'SELECT * FROM Issue WHERE Issue.id=$id'
    const value = {$id: id}
    db.get(sql, value, (err, issue) => {
        if (issue) {
            next()
        } else {
            res.sendStatus(404)
        }
    })
})

issuesRouter.get('/', (req, res, next) => {
    const sql = `SELECT * FROM Issue WHERE Issue.series_id=${req.params.seriesId}`
    db.all(sql, (err, issues) => {
        if (err) {
            next(err)
        } else {
            res.status(200).send({issues: issues})
        }
    })
})

issuesRouter.post('/', (req, res, next) => {
    const name = req.body.issue.name,
          issueNumber = req.body.issue.issueNumber,
          publicationDate = req.body.issue.publicationDate,
          artistId = req.body.issue.artistId;
    const artistSql = 'SELECT * FROM Artist WHERE Artist.id = $artistId';
    const artistValues = {$artistId: artistId};
    db.get(artistSql, artistValues, (error, artist) => {
      if (error) {
        next(error);
      } else {
        if (!name || !issueNumber || !publicationDate || !artist) {
          return res.sendStatus(400);
        }
  
        const sql = 'INSERT INTO Issue (name, issue_number, publication_date, artist_id, series_id)' +
            'VALUES ($name, $issueNumber, $publicationDate, $artistId, $seriesId)';
        const values = {
          $name: name,
          $issueNumber: issueNumber,
          $publicationDate: publicationDate,
          $artistId: artistId,
          $seriesId: req.params.seriesId
        };
  
        db.run(sql, values, function(error) {
          if (error) {
            next(error);
          } else {
            db.get(`SELECT * FROM Issue WHERE Issue.id = ${this.lastID}`,
              (error, issue) => {
                res.status(201).json({issue: issue});
              });
          }
        });
        }
    });
});

issuesRouter.put('/:issueId', (req, res, next) => {
    const name = req.body.issue.name
    const issueNumber = req.body.issue.issueNumber
    const publicationDate = req.body.issue.publicationDate
    const artistId = req.body.issue.artistId
    const seriesId = req.params.seriesId
    const issueId = req.params.issueId

    const artistSql = 'SELECT * FROM Artist WHERE Artist.id=$artistId'
    const artistValue = {$artistId: artistId}
    db.get(artistSql, artistValue, (err, artist) => {
        if (err) {
            next(err)
        } else if (!name || !issueNumber || !publicationDate || !artist) {
            res.sendStatus(400)
        } else {
            const sql = 'UPDATE Issue ' +
                'SET name=$name, issue_number=$issueNumber, publication_date=$publicationDate, artist_id=$artistId, series_id=$seriesId ' +
                'WHERE Issue.id=$issueId'
            const values = {
                $name: name,
                $issueNumber: issueNumber,
                $publicationDate: publicationDate,
                $artistId: artistId,
                $seriesId: seriesId,
                $issueId: issueId,
            }
            db.run(sql, values, (err) => {
                if (err) {
                    next(err)
                } else {
                    db.get(`SELECT * FROM Issue WHERE Issue.id=${issueId}`, (err, issue) => {
                        res.status(200).send({issue: issue})
                    })
                }
            })
        }
    })

})

issuesRouter.delete('/:issueId', (req, res, next) => {
    const issueId = req.params.issueId
    const sql = `DELETE FROM Issue WHERE Issue.id=${issueId}`
    db.run(sql, (err) => {
        if (err) {
            next(err)
        } else {
            res.status(204).send()
        }
    })
})

module.exports = issuesRouter