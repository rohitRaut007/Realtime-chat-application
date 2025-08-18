import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/libs.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const signup = async (req, res) => {
    const {fullName, email, password} = req.body;
    try{

        if(!fullName || !email || !password){
            return res.status(400).json({message: "All fields are required"});
        }

        if(password.length < 6){
            return res.status(400).json({message: "Password must be at least 6 characters long"});
        }

        const user = await User.findOne({email})

        if(user){
            return res.status(400).json({message: "User already exists"});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
    
        const newUser = new User({
            fullName,
            email,
            password: hashedPassword
        })

        if(newUser){
            generateToken(newUser._id, res)
            await newUser.save();
            return res.status(201).json({
                id:newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePicture: newUser.profilePicture,
                message: "User created successfully"});
        }
        else{
            return res.status(400).json({message: "Error creating user"});
        }

    }catch(error){
        console.error("Signup error:", error);
        return res.status(500).json({message: "Internal server error"});

    }
}

export const login = async (req, res) => {
    const {email, password} = req.body;
    try {

        const user = await User.findOne({email});
        if(!user){
            return res.status(404).json({message: "Invalid Credentials"});
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if(!isPasswordCorrect){
            return res.status(400).json({message: "Invalid Credentials"});
        }

        generateToken(user._id, res);

        return res.status(200).json({
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePicture: user.profilePicture,
            message: "Login successful"
        });
        
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({message: "Internal server error"});
        
    }
    
  
}

export const logout = (req, res) => {
    try {
        res.cookie('jwt', '', {
        maxAge: 0, // Set cookie to expire immediately
    });
    return res.status(200).json({message: "Logout successful"});
    } catch (error) {
        console.error("Logout error:", error);
        return res.status(500).json({message: "Internal server error"});
    }
  
}

export const updateProfile = async (req, res) => {
   try {
    // 🔁 standardize on 'profilePicture'
    const { profilePicture } = req.body;
    const userId = req.user._id; // requires protectRoute to set req.user

    if (!profilePicture) {
      return res.status(400).json({ message: "Profile picture is required" });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePicture);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePicture: uploadResponse.secure_url },
      { new: true }
    ).select("-password"); // don’t leak password hash

    return res.status(200).json({
      id: updatedUser._id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      profilePicture: updatedUser.profilePicture,
    });
  } catch (error) {
    console.log("error in update profile:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const checkAuth = (req, res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.error("Check auth error:", error);
        return res.status(500).json({message: "Internal server error"});
        
    }

}