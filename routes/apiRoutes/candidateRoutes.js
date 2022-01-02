const express = require('express');
const router = express.Router();
const db = require('../../db/connection');
const inputCheck = require('../../utils/inputCheck');


// Get all candidates
router.get('/candidates', (req, res) => {
    const sql = `SELECT candidates.*, parties.name 
    AS party_name 
    FROM candidates 
    LEFT JOIN parties 
    ON candidates.party_id = parties.id`;

    db.query(sql, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({
            message: 'success',
            data: rows
        });
    });
});

// Get a single candidate
// In the database call, we'll assign the captured value populated 
//in the req.params object with the key id to params. The database 
//call will then query the candidates table with this id and retrieve 
//the row specified. Because params can be accepted in the database call 
//as an array, params is assigned as an array with a single element, req.params.id
router.get('/candidate/:id', (req, res) => {
    const sql = `SELECT candidates.*, parties.name 
    AS party_name 
    FROM candidates 
    LEFT JOIN parties 
    ON candidates.party_id = parties.id 
    WHERE candidates.id = ?`;

    const params = [req.params.id];

    db.query(sql, params, (err, row) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({
            message: 'success',
            data: row
        });
    });
});

// Create a candidate - The SQL command and the SQL parameters were 
//assigned to the sql and params variables
//we're using object destructuring to pull the body property out of the 
//request object. Until now, we've been passing the entire request object 
//to the routes in the req parameter. In the callback function block, we assign 
//errors to receive the return from the inputCheck function
router.post('/candidate', ({ body }, res) => {
    const errors = inputCheck(body, 'first_name', 'last_name', 'industry_connected');
    if (errors) {
        res.status(400).json({ error: errors });
        return;
    }
    const sql = `INSERT INTO candidates (first_name, last_name, industry_connected)
    VALUES (?,?,?)`;
    const params = [body.first_name, body.last_name, body.industry_connected];

    db.query(sql, params, (err, result) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({
            message: 'success',
            data: body
        });
    });

});

// Update a candidate's party
router.put('/candidate/:id', (req, res) => {
    // Candidate is allowed to not have party affiliation
   const errors = inputCheck(req.body, 'party_id');
   if (errors) {
       res.status(400).json({ error: errors });
       return;
   }
   const sql = `UPDATE candidates SET party_id = ? 
                WHERE id = ?`;
   const params = [req.body.party_id, req.params.id];
   db.query(sql, params, (err, result) => {
       if (err) {
           res.status(400).json({ error: err.message });
           // check if a record was found
       } else if (!result.affectedRows) {
           res.json({
               message: 'Candidate not found'
           });
       } else {
           res.json({
               message: 'success',
               data: req.body,
               changes: result.affectedRows
           });
       }
   });
});

// Delete a candidate
router.delete('/candidate/:id', (req, res) => {
    const sql = `DELETE FROM candidates WHERE id = ?`;
    const params = [req.params.id];

    db.query(sql, params, (err, result) => {
        if (err) {
            res.statusMessage(400).json({ error: res.message });
        } else if (!result.affectedRows) {
            res.json({
                message: 'Candidate not found'
            });
        } else {
            res.json({
                message: 'deleted',
                changes: result.affectedRows,
                id: req.params.id
            });
        }
    });
});




module.exports = router;