import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Item from '@/models/Item';
import ClaimRequest from '@/models/ClaimRequest';
import { getUserFromRequest } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function GET(req, { params }) {
    try {
        const { id } = await params;
        await connectToDatabase();
        const item = await Item.findById(id).populate('userId', 'name email');

        if (!item) {
            return NextResponse.json({ message: 'Item not found' }, { status: 404 });
        }

        return NextResponse.json(item, { status: 200 });
    } catch (error) {
        console.error('Fetch item by ID API error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        const { id } = await params;
        const user = getUserFromRequest(req);
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await connectToDatabase();
        const item = await Item.findById(id);

        if (!item) {
            return NextResponse.json({ message: 'Item not found' }, { status: 404 });
        }

        if (item.userId.toString() !== user.id) {
            return NextResponse.json({ message: 'Forbidden: You can only edit your own posts' }, { status: 403 });
        }

        let updates = {};
        const contentType = req.headers.get('content-type') || '';

        if (contentType.includes('multipart/form-data')) {
            const formData = await req.formData();

            // Only add fields that are provided
            ['title', 'description', 'category', 'status', 'location', 'date', 'questions'].forEach(key => {
                const value = formData.get(key);
                if (value !== null) updates[key] = value;
            });

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
                updates.imageUrl = `/uploads/${filename}`;
            } else {
                const imageUrl = formData.get('imageUrl');
                if (imageUrl !== null) updates.imageUrl = imageUrl;
            }
        } else {
            updates = await req.json();
        }

        const updatedItem = await Item.findByIdAndUpdate(id, updates, { new: true });

        return NextResponse.json(updatedItem, { status: 200 });
    } catch (error) {
        console.error('Update item API error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const { id } = await params;
        const user = getUserFromRequest(req);
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await connectToDatabase();
        const item = await Item.findById(id);

        if (!item) {
            return NextResponse.json({ message: 'Item not found' }, { status: 404 });
        }

        if (item.userId.toString() !== user.id) {
            return NextResponse.json({ message: 'Forbidden: You can only delete your own posts' }, { status: 403 });
        }

        await ClaimRequest.deleteMany({ itemId: id });
        await Item.findByIdAndDelete(id);

        return NextResponse.json({ message: 'Item deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Delete item API error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
