// The index.js file will act as a central hub to pull them all together

const express = require('express');
const router = express.Router();

router.use(require('./candidateRoutes'));
router.use(require('./partyRoutes'));
router.use(require('./voterRoutes'));
router.use(require('./voteRoutes')); // tell the router object to use the votes route alongside the others

module.exports = router;