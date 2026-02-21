import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Item from '@/models/Item';
import { getUserFromRequest } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function GET(req) {
    try {
        await connectToDatabase();

        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search');
        const status = searchParams.get('status');
        const category = searchParams.get('category');
        const userId = searchParams.get('userId');
        const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
        const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
        const skip = (page - 1) * limit;

        let query = {};
        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }
        if (status) query.status = status;
        if (category) query.category = category;
        if (userId) query.userId = userId;

        const [items, total] = await Promise.all([
            Item.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('userId', 'name'),
            Item.countDocuments(query),
        ]);

        return NextResponse.json(
            { items, total, page, pages: Math.ceil(total / limit) },
            { status: 200 }
        );
    } catch (error) {
        console.error('Fetch items API error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const user = getUserFromRequest(req);
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await connectToDatabase();

        let data = {};

        // Check content type to handle both JSON and FormData
        const contentType = req.headers.get('content-type') || '';
        if (contentType.includes('multipart/form-data')) {
            const formData = await req.formData();
            data = {
                title: formData.get('title'),
                description: formData.get('description'),
                category: formData.get('category'),
                status: formData.get('status'),
                location: formData.get('location'),
                date: formData.get('date'),
                questions: formData.get('questions'),
            };

            const image = formData.get('image');
            if (image && typeof image === 'object') {
                const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];
                if (!allowedTypes.includes(image.type)) {
                    return NextResponse.json({ message: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' }, { status: 400 });
                }

                const bytes = await image.arrayBuffer();
                const buffer = Buffer.from(bytes);

                const uploadDir = '/app/uploads';
                await mkdir(uploadDir, { recursive: true }).catch(console.error);

                const ext = image.name.split('.').pop().toLowerCase();
                const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;
                const filepath = path.join(uploadDir, filename);

                await writeFile(filepath, buffer);
                data.imageUrl = `/uploads/${filename}`;
            } else {
                data.imageUrl = formData.get('imageUrl');
            }
        } else {
            data = await req.json();
        }

        if (!data.title || !data.description || !data.category || !data.location || !data.date) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        const newItem = await Item.create({
            ...data,
            userId: user.id
        });

        return NextResponse.json(newItem, { status: 201 });
    } catch (error) {
        console.error('Create item API error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
