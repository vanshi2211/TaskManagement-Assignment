const { Router } =  require("express");
const User = require("../models/users");
const Task  = require("../models/task");
const { generateUniqueNumericId } = require('../utils/userUtils');
const router = Router();

//Login 
//Signup


router.post("/signin", async(req,res)=>
{
    const {phoneNumber, password}  = req.body;
    try{
        if(!phoneNumber || !password) return res.status(400).json({msg:"Missing fields"});
        const token = await User.matchPasswordAndGenerateToken(phoneNumber, password);
        console.log('working',token.id);
        return res.cookie("token",token).json({msg: "You have been successfully logged in!",token});
        
    } catch(err){
        console.log(err);
        res.status(500).json({msg:'Incorrect Phone number or Password!'});
    }
    
});

router.post('/signup', async (req, res) => {
    console.log(req.body);
    try
	{
        const { phoneNumber, password, priority } = req.body;
        console.log(phoneNumber,password,priority);

        // Simple validation
        if (!phoneNumber || !password) {
            return res.status(400).json({ msg: 'Please enter all field' });
        }
        const user = await User.findOne({ phoneNumber })
        if(user){return res.json({msg: 'User with this phone number already exists!'})};
        // Generate a unique numeric ID for the new user
        const uniqueId = await generateUniqueNumericId();

        // Create a new user with the generated ID
        const newUser = new User({
            id: uniqueId,
            phoneNumber,
            priority,
            password
        });
    
        // Save the new user to the database
        const savedUser = await newUser.save();
    
        res.json({ success: true, userId: savedUser.id });
    }
    catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  });


module.exports = router;