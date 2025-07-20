import { Document, Schema, Types, model } from "mongoose";

export interface IOrder extends Document {
   userId: Types.ObjectId; // Reference to the user
   productId: number;
   price: number;
   createdAt: Date;
}

const OrderSchema = new Schema<IOrder>({
   userId: { type: Schema.Types.ObjectId, ref: 'User', required: [true, 'User ID is required'] },
   productId: { type: Number, required: [true, 'Product ID is required'] },
   price: { type: Number, required: [true, 'Price is required'] }
}, {
    timestamps: true,
});

export const Order = model<IOrder>('Order', OrderSchema); 