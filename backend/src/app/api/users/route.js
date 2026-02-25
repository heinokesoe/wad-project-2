import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { getUserFromRequest } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function GET(req) {
    try {
        const user = getUserFromRequest(req);
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        await connectToDatabase();
        const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });

        return NextResponse.json(users, { status: 200 });
    } catch (error) {
        console.error('Fetch users API error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await connectToDatabase();
        const { name, email, password } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ message: 'User already exists' }, { status: 400 });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = await User.create({ name, email, passwordHash });

        const userResponse = {
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
        };

        return NextResponse.json(userResponse, { status: 201 });
    } catch (error) {
        console.error('Create user API error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
