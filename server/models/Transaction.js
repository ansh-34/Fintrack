import mongoose from "mongoose";
import { TX_TYPE_LIST, PAYMENT_METHODS, CATEGORIES } from "../config/constants.js";

const transactionSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be greater than 0"],
    },
    type: {
      type: String,
      enum: TX_TYPE_LIST,
      required: [true, "Type is required (income or expense)"],
    },
    category: {
      type: String,
      enum: CATEGORIES,
      required: [true, "Category is required"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
      default: Date.now,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    merchant: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },
    paymentMethod: {
      type: String,
      enum: PAYMENT_METHODS,
      default: "cash",
    },
    tags: {
      type: [String],
      default: [],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// automatically exclude soft-deleted records
transactionSchema.pre(/^find/, function () {
  if (this.getQuery().includeDeleted !== true) {
    this.where({ isDeleted: false });
  }
  // clean up custom flag
  delete this.getQuery().includeDeleted;
});

transactionSchema.index({ createdBy: 1, type: 1 });
transactionSchema.index({ createdBy: 1, date: -1 });
transactionSchema.index({ category: 1 });

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;
