const express = require("express"),
  router = express.Router(),
  nodemailer = require("nodemailer"),
  request = require("request");

router.get("/", (req, res) => {
  res.render("contact/contact");
});

router.post("/send", (req, res) => {
  const captcha = req.body["g-recaptcha-response"];
  if (!captcha) {
    console.log(req.body);
    req.flash("error", "Please select captcha");
    return res.redirect("back");
  }
  // secret key
  const secretKey = process.env.CAPTCHA;
  // Verify URL
  const verifyURL = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captcha}&remoteip=${
    req.connection.remoteAddress
  }`;
  // Make request to Verify URL
  request.get(verifyURL, (err, response, body) => {
    // if not successful
    if (body.success !== undefined && !body.success) {
      req.flash("error", "Captcha Failed");
      return res.redirect("/contact");
    }
    const smtpTransport = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "ryansnodemailer@gmail.com",
        pass: process.env.GMAILPW
      }
    });

    const mailOptions = {
      from: "ryansnodemailer@gmail.com",
      to: "haleycox74@outlook.com",
      replyTo: req.body.email,
      subject: "Portfolio contact request from: " + req.body.name,
      text:
        "You have received an email from... Name: " +
        req.body.name +
        " Phone: " +
        req.body.phone +
        " Email: " +
        req.body.email +
        " Message: " +
        req.body.message,
      html:
        "<h3>You have received an email from...</h3><ul><li>Name: " +
        req.body.name +
        " </li><li>Phone: " +
        req.body.phone +
        " </li><li>Email: " +
        req.body.email +
        " </li></ul><p>Message: <br/><br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" +
        req.body.message +
        " </p>"
    };

    smtpTransport.sendMail(mailOptions, function(err, info) {
      if (err) {
        console.log(err);
        req.flash(
          "error",
          "Opps. Something went wrong. Please try again later!"
        );
        res.redirect("/contact");
      } else {
        req.flash(
          "success",
          "Thank you for your interest. I will contact you shortly."
        );
        res.redirect("/photos");
      }
    });
  });
});

module.exports = router;
