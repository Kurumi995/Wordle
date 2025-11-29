import { authService } from "../services/authService.js";

const register = async (req, res) => {
  const { username, password } = req.body;

  try {      
    await authService.registerUser(username, password);
    res.sendStatus(200);
  } catch (error) {
    res.status(500).json({error: error.message});
  }
}

const login = async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const user = await authService.validateLogin(username, password);
    res.status(200).json(user);
  } catch (error) {
    res.status(401).json({error: error.message});
  }
}

export const authControllers = {
  register, 
  login
}

