import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import { requireAuth, unauthorizedResponse } from '@/lib/auth';

export async function GET() {
  try {
    // Require authentication
    await requireAuth();
    
    await dbConnect();
    const products = await Product.find({}).sort({ createdAt: -1 });
    // Map _id to id for frontend compatibility
    const formattedProducts = products.map(doc => ({
      ...doc.toObject(),
      id: doc._id.toString(),
      _id: undefined,
      __v: undefined
    }));
    return NextResponse.json(formattedProducts);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }
    console.error('Failed to fetch products:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Require authentication
    await requireAuth();
    
    await dbConnect();
    const body = await request.json();

    console.log('POST /api/products - Received:', Array.isArray(body) ? `Array of ${body.length} items` : 'Single item');

    // Check if it's a bulk insert (array) or single insert
    if (Array.isArray(body)) {
      console.log('Bulk insert - Sample item:', body[0]);

      // Validate that array is not empty
      if (body.length === 0) {
        return NextResponse.json({
          error: 'Empty array',
          details: 'Cannot import empty product list'
        }, { status: 400 });
      }

      // Check for duplicates in the incoming list itself
      const tagMap = new Map<string, number[]>(); // Map tag to row numbers
      const serialMap = new Map<string, number[]>(); // Map serial to row numbers

      body.forEach((item: any, index: number) => {
        const rowNum = index + 2; // Excel row (accounting for header)
        
        // Track tag numbers
        if (!tagMap.has(item.tagNumber)) {
          tagMap.set(item.tagNumber, []);
        }
        tagMap.get(item.tagNumber)!.push(rowNum);
        
        // Track serial numbers (skip N/A to allow multiple N/A entries)
        if (item.serialNumber && item.serialNumber !== 'N/A') {
          if (!serialMap.has(item.serialNumber)) {
            serialMap.set(item.serialNumber, []);
          }
          serialMap.get(item.serialNumber)!.push(rowNum);
        }
      });

      // Find duplicates
      const duplicatesInRequest: string[] = [];

      tagMap.forEach((rows, tag) => {
        if (rows.length > 1) {
          duplicatesInRequest.push(`Tag "${tag}" in rows: ${rows.join(', ')}`);
        }
      });

      serialMap.forEach((rows, serial) => {
        if (rows.length > 1) {
          duplicatesInRequest.push(`Serial "${serial}" in rows: ${rows.join(', ')}`);
        }
      });

      if (duplicatesInRequest.length > 0) {
        return NextResponse.json({
          error: 'Duplicate items found in file',
          details: duplicatesInRequest.slice(0, 5).join(' | ') + (duplicatesInRequest.length > 5 ? ' | ...' : '')
        }, { status: 400 });
      }

      // Check for duplicates in Database (exclude N/A serials)
      const tagNumbers = body.map((p: any) => p.tagNumber);
      const serialNumbers = body
        .map((p: any) => p.serialNumber)
        .filter((s: string) => s && s !== 'N/A');

      const existingTags = await Product.find({ 
        tagNumber: { $in: tagNumbers } 
      }).select('tagNumber');

      const existingSerials = serialNumbers.length > 0 
        ? await Product.find({ 
            serialNumber: { $in: serialNumbers } 
          }).select('serialNumber')
        : [];

      const dbDuplicates: string[] = [];
      if (existingTags.length > 0) {
        const duplicateTags = existingTags.map(p => `"${p.tagNumber}"`).join(', ');
        dbDuplicates.push(`Tag numbers already in database: ${duplicateTags}`);
      }
      if (existingSerials.length > 0) {
        const duplicateSerials = existingSerials.map(p => `"${p.serialNumber}"`).join(', ');
        dbDuplicates.push(`Serial numbers already in database: ${duplicateSerials}`);
      }

      if (dbDuplicates.length > 0) {
        return NextResponse.json({
          error: 'Duplicate items found in database',
          details: dbDuplicates.join(' | ')
        }, { status: 409 });
      }

      // Insert products - insertMany returns array of documents
      const products = await Product.insertMany(body, {
        ordered: false // Continue inserting even if some fail
      });

      console.log('Bulk insert successful:', products.length, 'products');

      // Format response - products is already an array of documents
      const formattedProducts = products.map(doc => ({
        ...doc.toObject(),
        id: doc._id.toString(),
        _id: undefined,
        __v: undefined
      }));

      return NextResponse.json(formattedProducts, { status: 201 });
    } else {
      const product = await Product.create(body);
      const productDoc = Array.isArray(product) ? product[0] : product;

      return NextResponse.json({
        ...productDoc.toObject(),
        id: productDoc._id.toString(),
        _id: undefined,
        __v: undefined
      }, { status: 201 });
    }
  } catch (error: any) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }
    
    console.error('Failed to create product(s):', error);

    // Enhanced error details
    const errorDetails = {
      message: error.message,
      name: error.name,
      code: error.code,
      validationErrors: error.errors ? Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      })) : undefined
    };

    console.error('Error details:', errorDetails);

    return NextResponse.json({
      error: 'Failed to create product(s)',
      details: error.message || String(error),
      validation: errorDetails.validationErrors
    }, { status: 500 });
  }
}
