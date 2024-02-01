const { Schema, model, Types } = require('mongoose');
const {createTokenForUser} = require("../services/authentication");
const { createHmac, randomBytes } = require("crypto");
// const uid = require('uid');
// Define the User schema.

const userSchema = new Schema(
    {
        id: {
            type: Number
          },
        phoneNumber: {
            type: String,
            required: true,
            unique: true,
        },
        priority: {
            type: Number,
            enum : [0,1,2],
            required: [true, 'Priority must be 0, 1, 2'],
        },
        salt: {
            type: String,

        },
        password: {
            type: String,
            required: true,
        }
    }
);


userSchema.pre("save", function (next) {
    const user = this;
    if(!user.isModified("password"))return;
    const salt = randomBytes(16).toString();
    const hashedPassword = createHmac
    ("sha256",salt)
        .update(user.password)
        .digest("hex")
    this.salt = salt;
    this.password = hashedPassword;
    
    next();
})

userSchema.static("matchPasswordAndGenerateToken", async function (phoneNumber, password)
{
    const user = await this.findOne({ phoneNumber })
    if (!user) throw new Error("User not found!");
    const salt = user.salt;
    const hashedPassword = user.password;

    const userProvideHash = createHmac
    ("sha256", salt)
        .update(password)
        .digest("hex");
    if(hashedPassword !== userProvideHash)
        throw new Error("Incorrect Password!");
    const id = user.id;
    const token = createTokenForUser(user);
    return {id, token};
})

const User = model("user",userSchema);

module.exports = User;