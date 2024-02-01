const JWT = require("jsonwebtoken");

const secret = process.env.SECRET;

function createTokenForUser(user) {
    const payload = {
        _id: user.id,
        //taking data from user object
        //INCOMPLETE

    };
    const token = JWT.sign(payload, secret);
    return token;
}

function validateToken(token)
{
    const payload = JWT.verify(token,secret);
    // console.log('payload: ',payload);
    return payload;
}

module.exports = {
    createTokenForUser,
    validateToken
    
}