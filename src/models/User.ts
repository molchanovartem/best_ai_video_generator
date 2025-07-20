import { Document, Schema, model } from "mongoose";
import { randomBytes } from 'crypto';

export interface IUser extends Document {
   telegramId: number;
   firstName: string;
   username: string;

   balanceVoiced: number;
   balanceSilent: number;
   invitedFriends: number;
   referralCode: string;
   createdAt: Date;
}

const UserSchema = new Schema<IUser>({
   telegramId: { type: Number, required: [true, 'Telegram ID is required'], unique: true },
   firstName: { type: String},
   username: { type: String },
   balanceVoiced: { type: Number, default: 0 },
   balanceSilent: { type: Number, default: 0 },
   invitedFriends: { type: Number, default: 0 },
   referralCode: { type: String, default: () => randomBytes(16).toString('hex') }
}, {
    timestamps: true,
});

export const User = model<IUser>('User', UserSchema);