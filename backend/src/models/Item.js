import mongoose from 'mongoose';

const ItemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a title'],
        maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
        type: String,
        required: [true, 'Please provide a description'],
    },
    category: {
        type: String,
        required: [true, 'Please provide a category'],
    },
    location: {
        type: String,
        required: [true, 'Please provide a location'],
    },
    date: {
        type: Date,
        required: [true, 'Please provide the date of the event'],
    },
    imageUrl: {
        type: String,
        default: '',
    },
    status: {
        type: String,
        enum: ['lost', 'found', 'recovered'],
        required: true,
        default: 'lost',
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.Item || mongoose.model('Item', ItemSchema);
