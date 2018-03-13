const cloudinary = require('cloudinary'),
    Photo = require('../models/photo');

// CLOUDINARY SETUP TO HOST THE IMAGE FILE
cloudinary.config({
    cloud_name: 'dj12y8ion',
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const middleware = {};

middleware.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash('error', 'You don\'t have permission to do that!');
    res.redirect('/photos');
}

middleware.checkPhotoOwnership = (req, res, next) => {
    if (req.isAuthenticated()) {
        Photo.findById(req.params.id, (err, foundPhoto) => {
            if (err || !foundPhoto) {
                req.flash('error', 'Photo not found!');
                res.redirect('/photos');
            } else if (foundPhoto.author.id.equals(req.user._id) || req.user.isAdmin) {
                req.photo = foundPhoto;
                next();
            } else {
                req.flash('error', 'You don\'t have permission to do that!');
                res.redirect('back');
            }
        });
    } else {
        req.flash('error', 'You don\'t have permission to do that!');
        res.redirect('/photos');
    }
}

middleware.uploadImg = (req, res, next) => {
    // container to store options, we want to create several image size refernces
    // so we can show smaller images on smaller screens, respect other's data
    const options = {
        eager: [
            { width: 260, height: 260, crop: "limit" },
            { width: 576, height: 700, crop: "limit" },
            { width: 768, height: 768, crop: "limit" },
            { width: 1000, height: 1000, crop: "limit" }
        ]
    };
    // if an image file was given
    if (Boolean(req.file)) {
        // if we are working with an existing photo
        if (req.photo) {
            // set the image to replace the exisiting one
            options.public_id = req.photo.image.id;
        }
        // upload the image
        cloudinary.v2.uploader.upload(req.file.path, options, (err, result) => {
            if (err) {
                req.flash('error', 'Opps. Something went wrong uploading your image.');
                return res.redirect('back');
            }
            // set the req image object to be saved to the db containing refernces to the various image sizes
            req.image = {
                id: result.public_id,
                thumb: result.eager[0].secure_url,
                small: result.eager[1].secure_url,
                medium: result.eager[2].secure_url,
                large: result.eager[3].secure_url
            };
            next();
        });
    } else {
        next();
    }
}

middleware.deleteImg = (req, res, next) => {
    cloudinary.v2.uploader.destroy(req.photo.image.id, (err, result) => {
        if (err) {
            req.flash('error', 'Unable to deleted old image');
        }
        next();
    });
}

module.exports = middleware;