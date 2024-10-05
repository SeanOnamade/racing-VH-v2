import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';
const UserSchema = new Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password'))
        return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});
UserSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password);
};
export const User = model('User', UserSchema);
