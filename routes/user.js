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
        //return res.redirect(`/user/api/tasks/${token.id}`);
        //Check if user exists
        // let user = await User.findOne({ phoneNumber });
        // if (!user) return res.status(401).json({ msg: "Invalid Phone Number or Password" });
        // //Validate the password
        // const isMatch = await User.validatePassword(password, user.password);
        // if (!isMatch) return res.status(401).json({ msg: "Invalid Phone Number or Password" });

        //Return jsonwebtoken
       
    } catch(err){
        console.log(err);
        res.status(500).json({msg:'Incorrect Phone number or Password!'});
    }
    
});
// Assuming you have a route to get tasks based on user ID
router.get('/api/tasks/:id', async (req, res) => {
    // try {
    //   const userId = req.params.id;
      
    //   // Add your logic to fetch tasks associated with the provided user ID
    //   // This is a simplified example; replace it with your actual implementation
    //   const tasks = await Task.find({ user_id: userId });
  
    //   res.json({ success: true, tasks });
    // } catch (error) {
    //   console.error('Error fetching tasks:', error);
    //   res.status(500).json({ success: false, error: 'Internal Server Error' });
    // }
    res.json({ success: true});
  });
  

  
//   // Example usage
//   generateUniqueNumericId()
//     .then(uniqueId => {
//       console.log('Generated unique numeric ID:', uniqueId);
//     })
//     .catch(error => {
//       console.error('Error:', error);
//     });
// @route   POST api/auth/register
// @desc    Register a new user
// @access  Public
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