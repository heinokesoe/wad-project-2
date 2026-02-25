import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { signToken } from '@/lib/auth';
import { rateLimit } from '@/lib/rateLimit';

const checkRateLimit = rateLimit({ limit: 5, windowMs: 60 * 1000 });

export async function POST(req) {
    if (!checkRateLimit(req)) {
        return NextResponse.json({ message: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    try {
        await connectToDatabase();
        const { name, email, password } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json(
                { message: 'Please provide all required fields' },
                { status: 400 }
            );
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { message: 'Email already registered' },
                { status: 409 }
            );
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            name,
            email,
            passwordHash,
        });

        const token = signToken({ id: newUser._id, email: newUser.email });

        return NextResponse.json(
            {
                message: 'Registration successful',
                token,
                user: { id: newUser._id, name: newUser.name, email: newUser.email },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Register API error:', error);
        return NextResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
