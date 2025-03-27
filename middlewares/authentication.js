const jwt = require('jsonwebtoken');
const passport = require("passport");
const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
const User = require('../models/userModel')

// Secret Key
const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";

const generateToken = (user, res) => {
	const token = jwt.sign(
		{ id: user._id, role: user.role },
		SECRET_KEY,
		{ expiresIn: "1h" }      // Token expires in 1 hour
	);

	// Set the cookie
	res.cookie("authToken", token, {
		httpOnly: true,     // Prevents client-side JavaScript access
		secure: process.env.NODE_ENV === "production", // Set secure in production
		sameSite: "strict", // Helps against CSRF attacks
		maxAge: 3600000     // 1 hour expiration in milliseconds
	});

	return token;
};

// authentication 
const options = {
	jwtFromRequest: ExtractJwt.fromExtractors([
		(req) => req?.cookies?.authToken // Extract JWT from cookies
	]),
	secretOrKey: SECRET_KEY
};

passport.use(
	new JwtStrategy(options, async (jwt_payload, done) => {
		try {
			const user = await User.findById(jwt_payload.id);
			if (user) {
				return done(null, user);
			} else {
				return done(null, false);
			}
		} catch (error) {
			return done(error, false);
		}
	})
);


const authorize = (roles = []) => (req, res, next) => {
	passport.authenticate('jwt', { session: false }, async (err, user, info) => {
		if (err) return res.render('404');
		if (!user) return res.status(401).render('401');

		if (!roles.length) {
			req.user = user;
			return next(null);
		} else {
			if (roles.includes(user.role)) {
				req.user = user;

				// req.user.isAdmin = true

				return next(null);
			} else {
				return res.status(403).render('403');
			}
		}
	})(req, res, next);
}

module.exports = { generateToken, authorize };