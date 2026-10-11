const { createHmac, randomBytes } = require('node:crypto');
const {Schema, model} = require('mongoose');
const { createTokenForUser } = require('../services/authentication');


const userShema = new Schema({
    fullName:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true,
    },
    salt:{
        type: String,
    },
    password:{
        type: String,
        required: true
    },
    profileImageURL:{
        type: String,
        default: '/images/default.jpg'
    },
    role:{
        type: String,
        enum: ['USER', 'ADMIN'],
        default: 'USER'
    },
    bio:{
        type: String,
        default: "",
        maxlanght: 30
    },
    website:{
        type: String,
        default: "",
    },
    location:{
        type: String,
        default: "",
    },
    
},{timestamps: true})

userShema.pre('save', function(next){
    const user = this;
    if(!user.isModified("password")) return;

    const salt = randomBytes(16).toString();
    const hashedPassword = createHmac('sha256', salt).update(user.password).digest('hex');

    this.salt = salt;
    this.password = hashedPassword;
    
})

userShema.static("matchpasswordAndGenerateToken", async function (email, password, fullName){
    const user = await this.findOne({email});
    if(!user) throw new Error('User Not Fund!')

    const salt = user.salt;
    const hashedPassword = user.password;

   const userProvidedHash = createHmac("sha256", salt)
   .update(password)
   .digest('hex')

   if(hashedPassword !== userProvidedHash) throw new Error('Incorrect Password!')

    const token = createTokenForUser(user)
   return token;
})

const User = model('User',userShema )

module.exports = User