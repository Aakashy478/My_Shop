
// const crypto = require('crypto');

// const algorithm = 'aes-256-cbc';
// const key = crypto.scryptSync('your-secure-password', 'salt', 32); // Derive a 32-byte key from a password

// // Encryption function
// function encrypt(text) {
//     const iv = crypto.randomBytes(16); // Generate a new IV for each encryption
//     const cipher = crypto.createCipheriv(algorithm, key, iv);
//     let encrypted = cipher.update(text, 'utf8', 'hex');
//     encrypted += cipher.final('hex');

//     return iv.toString('hex') + ':' + encrypted; // Store IV + encrypted data
// }

// // Decryption function
// function decrypt(encryptedText) {
//     const textParts = encryptedText.split(':');

//     if (textParts.length !== 2) {
//         throw new Error("Invalid encrypted data format");
//     }

//     const iv = Buffer.from(textParts[0], 'hex');
//     const encryptedData = Buffer.from(textParts[1], 'hex');
//     const decipher = crypto.createDecipheriv(algorithm, key, iv);

//     let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
//     decrypted += decipher.final('utf8');

//     return decrypted;
// }


// module.exports = { encrypt, decrypt };

// const ENC_SECRET_KEY = "6a1d2b3c4e5f67890123456789abcdef0123456789abcdef0123456789abcdef"; // 32-byte key (64 hex chars)
// const ENC_IV = "1234567890abcdef1234567890abcdef"; // 16-byte IV (32 hex chars)
// const ALGORITHM = "aes-256-cbc";


// Authentication using passport-js

// const passport = require("passport");
// const { Strategy, ExtractJwt } = require("passport-jwt");

// const opts = {
//     jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//     secretOrKey: process.env.JWT_SECRET,
// };

// passport.use(
//     new Strategy(opts, (jwt_payload, done) => {
//         User.findById(jwt_payload.id)
//             .then((user) => (user ? done(null, user) : done(null, false)))
//             .catch((err) => done(err, false));
//     })
// );