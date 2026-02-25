import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { signToken } from '@/lib/auth';
import { rateLimit } from '@/lib/rateLimit';

const checkRateLimit = rateLimit({ limit: 10, windowMs: 60 * 1000 });

export async function POST(req) {
    if (!checkRateLimit(req)) {
        return NextResponse.json({ message: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    try {
        await connectToDatabase();
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json(
                { message: 'Please provide email and password' },
                { status: 400 }
            );
        }

        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json(
                { message: 'Invalid credentials' },
                { status: 401 }
            );
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return NextResponse.json(
                { message: 'Invalid credentials' },
                { status: 401 }
            );
        }

        const token = signToken({ id: user._id, email: user.email });

        return NextResponse.json(
            {
                message: 'Login successful',
                token,
                user: { id: user._id, name: user.name, email: user.email },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Login API error:', error);
        return NextResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
