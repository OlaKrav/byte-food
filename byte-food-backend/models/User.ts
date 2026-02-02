import { Schema, model } from 'mongoose';

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String },
    avatar: { type: String },
    googleId: { type: String, unique: true, sparse: true },
    passwordHash: { type: String, required: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

export const User = model('User', userSchema);
