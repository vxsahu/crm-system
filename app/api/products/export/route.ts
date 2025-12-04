import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import { requireAuth, unauthorizedResponse } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    // Require authentication
    await requireAuth();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const billing = searchParams.get('billing');
    const search = searchParams.get('search');

    const query: any = {};

    // Apply Filters
    if (status && status !== 'ALL') {
      query.status = status;
    }

    if (billing && billing !== 'ALL') {
      query.billingStatus = billing;
    }

    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      query.$or = [
        { tagNumber: searchRegex },
        { productName: searchRegex },
        { serialNumber: searchRegex },
        { category: searchRegex }
      ];
    }

    await dbConnect();

    // Create a stream
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Start fetching and writing in the background
    (async () => {
      try {
        // Write BOM for Excel compatibility
        await writer.write(encoder.encode('\uFEFF'));

        // Write Header
        const headers = ['Tag Number', 'Product Name', 'Category', 'Specs', 'Gate Number', 'Purchase Date', 'Serial No', 'Status', 'Billing', 'Invoice', 'Price', 'Sold Date', 'Sold Price', 'Sell Invoice', 'Remark'];
        await writer.write(encoder.encode(headers.join(',') + '\n'));

        // Fetch products using a cursor for memory efficiency
        const cursor = Product.find(query).sort({ createdAt: -1 }).cursor();

        for await (const doc of cursor) {
          const p = doc.toObject();
          
          // Format Product Name with Specs
          const productNameWithSpecs = `${p.productName}${p.specifications ? ` - ${p.specifications}` : ''}`;

          const row = [
            p.tagNumber,
            `"${productNameWithSpecs.replace(/"/g, '""')}"`,
            `"${p.category.replace(/"/g, '""')}"`,
            `"${(p.specifications || '').replace(/"/g, '""')}"`,
            p.purchaseDate,
            p.serialNumber,
            p.gateNumber || '',
            p.status,
            p.billingStatus,
            p.invoiceNumber || 'N/A',
            p.purchasePrice,
            p.soldDate || '',
            p.soldPrice || '',
            p.sellInvoiceNumber || '',
            `"${(p.remark || '').replace(/"/g, '""')}"`
          ].join(',');

          await writer.write(encoder.encode(row + '\n'));
        }

      } catch (error) {
        console.error('Stream writing error:', error);
        // We can't really change the status code now since headers are sent
        // But we can verify the stream closes
      } finally {
        await writer.close();
      }
    })();

    return new NextResponse(stream.readable, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="inventory_export_${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });

  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }
    console.error('Export failed:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
