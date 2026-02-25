import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import Item from '@/models/Item';
import ClaimRequest from '@/models/ClaimRequest';
import { getUserFromRequest } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function GET(req, { params }) {
    try {
        const { id } = await params;
        const authUser = getUserFromRequest(req);
        if (!authUser) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        await connectToDatabase();
        const user = await User.findById(id).select('-passwordHash');

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(user, { status: 200 });
    } catch (error) {
        console.error('Fetch user API error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        const { id } = await params;
        const authUser = getUserFromRequest(req);
        if (!authUser) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        // Current implementation restricts users to updating only themselves
        if (authUser.id !== id) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        await connectToDatabase();
        const user = await User.findById(id);

        if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

        const { name, email, password } = await req.json();

        if (name) user.name = name;
        if (email) user.email = email;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.passwordHash = await bcrypt.hash(password, salt);
        }

        await user.save();

        const updatedUser = { id: user._id, name: user.name, email: user.email };
        return NextResponse.json(updatedUser, { status: 200 });
    } catch (error) {
        console.error('Update user API error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const { id } = await params;
        const authUser = getUserFromRequest(req);
        if (!authUser) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        // Current implementation restricts users to deleting only themselves
        if (authUser.id !== id) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        await connectToDatabase();
        const user = await User.findById(id);

        if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

        // Cascade delete all references when deleting a user
        const userItems = await Item.find({ userId: id }).select('_id');
        const userItemIds = userItems.map(item => item._id);

        // Delete claims submitted BY the user and claims submitted ON the user's items
        await ClaimRequest.deleteMany({
            $or: [
                { requesterId: id },
                { itemId: { $in: userItemIds } },
            ],
        });
        await Item.deleteMany({ userId: id });
        await User.findByIdAndDelete(id);

        return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Delete user API error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
