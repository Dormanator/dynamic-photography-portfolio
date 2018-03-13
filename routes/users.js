const express = require('express'),
    router = express.Router(),
    passport = require('passport'),
    crypto = require('crypto'),
    async = require('async'),
    nodemailer = require('nodemailer'),
    User = require('../models/user');

// DEFINING NODEMAILER TRANSPORT MECHANISM
const smtpTransport = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'ryansnodemailer@gmail.com',
        pass: process.env.GMAILPW
    }
});

// REGISTER ROUTES
router.get('/register', (req, res) => {
    res.render('users/register');
});

router.post('/register', (req, res) => {
    const newUser = new User({ username: req.body.username, email: req.body.email.toLowerCase() });
    User.register(newUser, req.body.password, (err, user) => {
        if (err) {
            req.flash('error', err.message);
            return res.redirect('register');
        }
        passport.authenticate('local')(req, res, () => {
            req.flash('success', 'Welcome to your portfolio ' + user.username);
            res.redirect('/photos');
        });
    });
});

// LOGIN ROUTES
router.get('/login', (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect('/photos');
    }
    res.render('users/login');
});

router.post('/login', passport.authenticate('local',
    {
        successRedirect: '/photos',
        failureRedirect: '/login'
    }), (req, res) => {
    });

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', 'Logged you out!');
    res.redirect('/photos');
});

// FORGOT PASSWORD FORM
router.get('/forgot', (req, res) => {
    res.render('users/forgot');
});

// REQUEST FOR EMAIL WITH TEMP 1HR TOKEN TO CHANGE PASSWORD
router.post('/forgot', (req, res, next) => {
    async.waterfall([
        (done) => {
            crypto.randomBytes(20, (err, buf) => {
                if (err) {
                    req.flash('error', 'Sorry, there was trouble creating the temporary link');
                    return res.redirect('/forgot');
                }
                const token = buf.toString('hex');
                done(err, token);
            });
        },
        (token, done) => {
            User.findOne({ email: req.body.email.toLowerCase() }, (err, user) => {
                if (!user || err) {
                    req.flash('error', 'No account with that email address exists.');
                    return res.redirect('/forgot');
                }

                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                user.save((err) => {
                    if (err) {
                        req.flash('error', 'Sorry, there was trouble creating the temporary token');
                        return res.redirect('/forgot');
                    }
                    done(err, token, user);
                });
            });
        },
        (token, user, done) => {
            const mailOptions = {
                to: user.email,
                from: 'ryansnodemailer@gmail.com',
                subject: 'Node.js Password Reset',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                    'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                    'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            smtpTransport.sendMail(mailOptions, (err) => {
                if (err) {
                    req.flash('error', 'Sorry, there was trouble sending the temporary link');
                    return res.redirect('/forgot');
                }
                req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
                done(err, 'done');
            });
        }
    ], (err) => {
        if (err) {
            req.flash('error', 'Opps, something went wrong sending your password reset link');
            return next(err);
        }
        res.redirect('/forgot');
    });
});

// SHOW FORM TO EDIT PASSWORD
router.get('/reset/:token', (req, res) => {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, (err, user) => {
        if (!user || err) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('/forgot');
        }
        res.render('users/reset', { token: req.params.token });
    });
});

// CHANGE PASSWORD AND RESAVE USER, THEN NOTIFY USER VIA EMAIL
router.post('/reset/:token', (req, res) => {
    async.waterfall([
        (done) => {
            User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, (err, user) => {
                if (!user || err) {
                    req.flash('error', 'Password reset token is invalid or has expired.');
                    return res.redirect('back');
                }
                if (req.body.password === req.body.confirm) {
                    user.setPassword(req.body.password, (err) => {
                        if (err) {
                            req.flash('error', 'Sorry, there was trouble setting your new password');
                            return res.redirect('back');
                        }
                        user.resetPasswordToken = undefined;
                        user.resetPasswordExpires = undefined;

                        user.save((err) => {
                            req.logIn(user, (err) => {
                                if (err) {
                                    req.flash('error', 'Sorry, there was trouble saving your new password');
                                    return res.redirect('back');
                                }
                                done(err, user);
                            });
                        });
                    })
                } else {
                    req.flash("error", "Passwords do not match.");
                    return res.redirect('back');
                }
            });
        },
        (user, done) => {
            const mailOptions = {
                to: user.email,
                from: 'ryansnodemailer@gmail.com',
                subject: 'Your password has been changed',
                text: 'Hello,\n\n' +
                    'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
            };
            smtpTransport.sendMail(mailOptions, (err) => {
                if (err) {
                    req.flash('error', 'Sorry, there was trouble sending the confirmation email');
                    return res.redirect('back');
                }
                req.flash('success', 'Success! Your password has been changed.');
                done(err);
            });
        }
    ], (err) => {
        if (err) {
            req.flash('error', 'Opps looks like something might have gone wrong');
            return res.redirect('back');
        }
        res.redirect('/photos');
    });
});

module.exports = router;
