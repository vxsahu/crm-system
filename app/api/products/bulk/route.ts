import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';

// Bulk DELETE - Delete multiple products
export async function DELETE(request: Request) {
    try {
        await dbConnect();
        const { ids } = await request.json();

        if (!Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({
                error: 'Invalid request',
                details: 'ids must be a non-empty array'
            }, { status: 400 });
        }

        console.log('Bulk delete request for', ids.length, 'products');

        const result = await Product.deleteMany({ _id: { $in: ids } });

        console.log('Bulk delete successful:', result.deletedCount, 'products deleted');

        return NextResponse.json({
            success: true,
            deletedCount: result.deletedCount
        }, { status: 200 });

    } catch (error) {
        console.error('Bulk delete failed:', error);
        return NextResponse.json({
            error: 'Failed to delete products',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}

// Bulk PATCH - Update status for multiple products
export async function PATCH(request: Request) {
    try {
        await dbConnect();
        const { ids, status } = await request.json();

        if (!Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({
                error: 'Invalid request',
                details: 'ids must be a non-empty array'
            }, { status: 400 });
        }

        if (!status) {
            return NextResponse.json({
                error: 'Invalid request',
                details: 'status is required'
            }, { status: 400 });
        }

        console.log('Bulk status update request:', ids.length, 'products to', status);

        const result = await Product.updateMany(
            { _id: { $in: ids } },
            { $set: { status } }
        );

        console.log('Bulk update successful:', result.modifiedCount, 'products updated');

        return NextResponse.json({
            success: true,
            modifiedCount: result.modifiedCount
        }, { status: 200 });

    } catch (error) {
        console.error('Bulk update failed:', error);
        return NextResponse.json({
            error: 'Failed to update products',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
