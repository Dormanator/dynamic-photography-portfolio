const express = require('express'),
    router = express.Router(),
    multer = require('multer'),
    Photo = require('../models/photo'),
    middleware = require('../middleware/index');

// MULTER SETUP FOR HANDLING IMAGE FILE
const storage = multer.diskStorage({
    filename: (req, file, cb) => {
        cb(null, Date.now() + file.originalname);
    }
}),
    imageFilter = (req, file, cb) => {
        const MAX_FILE_SIZE_BYTES = 3000000;
        // accept only images
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
            return cb(new Error('Only image files are allowed!'), false);
            // that are no greater than 3mb
        } else if (file.size > MAX_FILE_SIZE_BYTES) {
            return cb(new Error('Image must be 3MB or less'), false);
        }
        cb(null, true);
    };
const upload = multer({ storage: storage, fileFilter: imageFilter });

// INDEX - List all entries
router.get('/', (req, res) => {
    Photo.find({}, (err, foundPhotos) => {
        if (err) {
            req.flash('error', 'Opps, something went wrong with the database query. Please try again.');
            res.redirect('back');
        } else {
            res.render('photos/index', { photos: foundPhotos });
        }
    });
});

// NEW - New photo form
router.get('/new', middleware.isLoggedIn, (req, res) => {
    res.render('photos/new');
});

// CREATE - Add a new photo, then redirect
router.post('/', middleware.isLoggedIn, upload.single('image'), middleware.uploadImg, (req, res) => {
    req.body.photo.image = req.image;
    req.body.photo.author = {
        id: req.user._id,
        username: req.user.username
    };
    Photo.create(req.body.photo, (err, photo) => {
        if (err) {
            req.flash('error', 'Opps, something went wrong saving your photo. Please try again.');
            return res.redirect('back');
        }
        req.flash('success', 'Your photo has been added!');
        res.redirect('/photos/' + photo.id);
    });
});

// filter - show select group of photos based on value
router.get('/tag/:category', (req, res) => {
    const tags = ['people', 'places', 'things', 'animals'];
    if (tags.includes(req.params.category)) {
        Photo.find({ 'tag': req.params.category }, (err, foundPhotos) => {
            if (err) {
                req.flash('error', 'Opps, something went wrong with the database query. Please try again.');
                res.redirect('back');
            } else {
                res.render('photos/index', { photos: foundPhotos });
            }
        });
    } else {
        req.flash('error', 'Not a valid photo tag');
        res.redirect('/photos');
    }
});

// SHOW - Show info about a specific photo
router.get('/:id', (req, res) => {
    Photo.findById(req.params.id, (err, foundPhoto) => {
        if (err || !foundPhoto) {
            req.flash('error', 'Opps, something went wrong retrieving the photo. Please try again.');
            res.redirect('back');
            console.log(err);
        } else {
            res.render('photos/show', { photo: foundPhoto });
        }
    });
});

// EDIT - Show edit form for one entry
router.get('/:id/edit', middleware.checkPhotoOwnership, (req, res) => {
    res.render('photos/edit', { photo: req.photo });
});

// UPDATE - Update a single entry, then redirect somewhere
router.put('/:id', middleware.checkPhotoOwnership, upload.single('image'), middleware.uploadImg, (req, res) => {
    // if a new file was given save the new image object with an updated url
    // the version number in teh url will change and prevent caching problems
    if (Boolean(req.file)) {
        req.body.photo.image = req.image;
    }
    // else just update the db entry
    Photo.findByIdAndUpdate(req.params.id, req.body.photo, (err, updatedPhoto) => {
        if (err) {
            req.flash('error', 'Opps, something went wrong saving your updates. Please try again.');
            res.redirect('/photos');
            console.log(err);
        } else {
            req.flash('success', 'You\'ve updated your photo!');
            res.redirect('/photos/' + req.params.id);
        }
    });
});

// DESTROY - Delete a single entry, then redirect somewhere
router.delete('/:id', middleware.checkPhotoOwnership, middleware.deleteImg, (req, res) => {
    Photo.findByIdAndRemove(req.params.id, (err) => {
        if (err) {
            req.flash('error', 'Opps, something went wrong deleting your photo. Please try again.');
            res.redirect('back');
            console.log(err);
        } else {
            req.flash('success', 'Your photo was deleted!');
            res.redirect('/photos');
        }
    });
});

module.exports = router;