const XLSX = require('xlsx');

function generateSampleData(numRecords = 50) {
    const brands = ['Dell', 'HP', 'Lenovo', 'Apple', 'Asus'];
    const products = ['Laptop', 'Desktop', 'Monitor', 'Mobile', 'Tablet'];
    const cpus = ['i3', 'i5', 'i7', 'Ryzen 5', 'Ryzen 7'];
    const rams = ['4GB', '8GB', '16GB', '32GB'];
    const hdds = ['256GB SSD', '512GB SSD', '1TB HDD', '1TB SSD'];
    
    const data = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 180);
    
    for (let i = 0; i < numRecords; i++) {
        const brand = brands[Math.floor(Math.random() * brands.length)];
        const category = products[Math.floor(Math.random() * products.length)];
        const modelNo = `${brand.substring(0, 2).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const productName = `${brand} ${modelNo}`;
        
        // Specifications
        const cpu = cpus[Math.floor(Math.random() * cpus.length)];
        const ram = rams[Math.floor(Math.random() * rams.length)];
        const hdd = hdds[Math.floor(Math.random() * hdds.length)];
        const specifications = `CPU: ${cpu} | RAM: ${ram} | Storage: ${hdd}`;

        // Determine status and billing
        const isSold = Math.random() > 0.3; // 70% sold
        const status = isSold ? 'Sold' : 'In Stock';
        
        let invoiceNo = 'N/A';
        let billingStatus = 'Unbilled';
        
        if (isSold) {
            const isBilled = Math.random() > 0.2; // 80% of sold items are billed
            if (isBilled) {
                invoiceNo = `INV-${Math.floor(10000 + Math.random() * 90000)}`;
                billingStatus = 'Billed';
            } else {
                invoiceNo = 'N/A';
                billingStatus = 'Unbilled';
            }
        } else if (status === 'Returned') {
             billingStatus = 'Unbilled';
        } else {
             // In Stock
             billingStatus = 'Unbilled';
        }
            
        // Date distribution
        const dateOffset = Math.floor(Math.random() * 180);
        const date = new Date(startDate);
        date.setDate(date.getDate() + dateOffset);
        const dateStr = date.toISOString().split('T')[0];
        
        const row = {
            'Tag Number': `TAG-${1000+i}`,
            'Product Name': productName,
            'Category': category,
            'Specifications': specifications,
            'Purchase Date': dateStr,
            'Serial No': `SN${Math.floor(100000 + Math.random() * 900000)}`,
            'Status': status,
            'Billing': billingStatus,
            'Invoice No': invoiceNo,
            'Price': Math.floor(15000 + Math.random() * 65000),
            'Gate No': `GP-${Math.floor(100 + Math.random() * 900)}`,
            'Remark': `Generated Test Data. Gate Pass: GP-${Math.floor(100 + Math.random() * 900)}`
        };
        data.push(row);
    }
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventory");
    
    XLSX.writeFile(wb, 'sample_inventory_export_format.xlsx');
    console.log("Sample inventory file created: sample_inventory_export_format.xlsx");
}

generateSampleData();
