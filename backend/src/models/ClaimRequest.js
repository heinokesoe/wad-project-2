import mongoose from 'mongoose';

const ClaimRequestSchema = new mongoose.Schema({
    itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',
        required: [true, 'Please provide the related Item ID'],
    },
    requesterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide the User ID who is requesting'],
    },
    message: {
        type: String,
        required: [true, 'Please provide a message for the claim'],
        maxlength: [500, 'Message cannot be more than 500 characters'],
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.ClaimRequest || mongoose.model('ClaimRequest', ClaimRequestSchema);
