const express = require('express'),
    router = express.Router();

// ROOT ROUTE
router.get('/', (req, res) => {
    res.redirect('/photos');
});

router.get('*', (req, res) => {
    req.flash('error', 'Sorry, page not found.');
    res.redirect('/photos');
});

module.exports = router;


