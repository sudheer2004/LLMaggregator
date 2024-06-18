import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import { GoogleGenerativeAI } from '@google/generative-ai';
import MistralClient from '@mistralai/mistralai';
import passport from 'passport';
import session from 'express-session';
import { Strategy as LocalStrategy } from 'passport-local';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import Person from './models/Person.mjs'; // Adjust path as needed

dotenv.config();

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json()); // Parse JSON bodies
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:5500'], // Adjust this to match your frontend's origins
}));

// Setup express-session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'default_secret',
  resave: false,
  saveUninitialized: false,
}));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Event listeners for the database connection
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Database is connected successfully');
});

// Passport Local Strategy
passport.use(new LocalStrategy(
  {
    usernameField: 'username',
    passwordField: 'password',
  },
  async (username, password, done) => {
    try {
      const user = await Person.findOne({ username });
      if (!user) {
        return done(null, false, { message: 'You are not registered' });
      }
      const isMatch = await user.isValidPassword(password);
      if (!isMatch) {
        return done(null, false, { message: 'Incorrect password' });
      }
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// Serialize and Deserialize User
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await Person.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Initialize Passport and session
app.use(passport.initialize());
app.use(passport.session());

// Login endpoint
app.post('/login', passport.authenticate('local'), (req, res) => {
  // Redirect to http://localhost:3000 upon successful login
  res.redirect('http://localhost:3000');
});

// Sign up endpoint (assuming it's similar to previous implementation)
app.post('/signup', async (req, res) => {
  const { username, password, email } = req.body;
  try {
    const existingUser = await Person.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10); // Hash password before saving
    const newUser = new Person({ username, password: hashedPassword, email });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error });
  }
});

const PORT = process.env.PORT || 3000;

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const mistralClient = new MistralClient(process.env.MISTRAL_API_KEY);

// API endpoint (assuming it's similar to previous implementation)
// ...

// Default welcome endpoint
app.get('/', (req, res) => {
  res.send('Welcome to the LLM Aggregator API');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
