import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  username: string;
  password: string;
  budget: number;
  team: mongoose.Types.ObjectId[];
  comparePassword: (candidatePassword: string) => Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    budget: { type: Number, required: true, default: 9000000 },
    team: [{ type: Schema.Types.ObjectId, ref: "Player" }],
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error: unknown) {
    next(error instanceof Error ? error : new Error(String(error)));
  }
});

// Method to compare password
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Static method to find user by username
UserSchema.statics.findByUsername = async function (username: string) {
  return this.findOne({ username });
};

// Define a user type for the return type
interface UserDocument extends mongoose.Document {
  username: string;
  password: string;
  budget: number;
  team: mongoose.Types.ObjectId[];
  role?: string;
  [key: string]: unknown;
}

// Static method to authenticate user
UserSchema.statics.authenticate = async function (
  username: string,
  password: string
): Promise<{ user: UserDocument | null; error: string | null }> {
  try {
    const user = await this.findOne({ username });

    if (!user) {
      return { user: null, error: "User not found" };
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return { user: null, error: "Invalid password" };
    }

    return { user, error: null };
  } catch (error: unknown) {
    return {
      user: null,
      error: error instanceof Error ? error.message : "Authentication error",
    };
  }
};

// Delete the model if it exists to avoid overwrite warnings
if (mongoose.models.User) {
  mongoose.deleteModel("User");
}

const User = mongoose.model<IUser>("User", UserSchema);

export default User;
