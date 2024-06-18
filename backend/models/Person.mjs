// Person.mjs
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const personSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
});

// Method to compare passwords according to username
personSchema.methods.isValidPassword = async function (password) {
  try {
    console.log(`Validating password for username: ${this.username}`);
    console.log(`Password: ${password}`);
    
    const isValid = await bcrypt.compare(password, this.password);
    return isValid;
  } catch (error) {
    throw new Error(error);
  }
};

const Person = mongoose.model('Person', personSchema);

export default Person;
