const express = require("express"),
  router = express.Router(),
  Photo = require("../models/photo");

// Index - show all photos across all tags
router.get("/", (req, res) => {
  Photo.find({ tag: { $exists: true } }, (err, foundPhotos) => {
    if (err || !foundPhotos) {
      req.flash(
        "error",
        "Opps, something went wrong with the database query. Please try again."
      );
      res.redirect("back");
    } else {
      res.render("photos/index", { photos: foundPhotos });
    }
  });
});

// filter - show select group of photos based on tag
router.get("/:id/photos", (req, res) => {
  const tags = ["people", "places", "things", "animals"];
  if (tags.includes(req.params.id)) {
    Photo.find({ tag: req.params.id }, (err, foundPhotos) => {
      if (err || !foundPhotos) {
        req.flash(
          "error",
          "Opps, something went wrong with the database query. Please try again."
        );
        res.redirect("back");
      } else {
        res.render("photos/index", { photos: foundPhotos });
      }
    });
  } else {
    req.flash("error", "Not a valid photo tag");
    res.redirect("/photos");
  }
});

module.exports = router;
