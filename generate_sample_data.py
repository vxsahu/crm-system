import pandas as pd
import random
from datetime import datetime, timedelta

def generate_sample_data(num_records=50):
    brands = ['Dell', 'HP', 'Lenovo', 'Apple', 'Asus']
    products = ['Laptop', 'Desktop', 'Monitor', 'Mobile', 'Tablet']
    cpus = ['i3', 'i5', 'i7', 'Ryzen 5', 'Ryzen 7']
    rams = ['4GB', '8GB', '16GB', '32GB']
    hdds = ['256GB SSD', '512GB SSD', '1TB HDD', '1TB SSD']
    
    data = []
    
    start_date = datetime.now() - timedelta(days=180)
    
    for i in range(num_records):
        brand = random.choice(brands)
        product = random.choice(products)
        model_no = f"{brand[:2].upper()}-{random.randint(1000, 9999)}"
        
        # Determine status and billing
        is_sold = random.random() > 0.3 # 70% sold
        status = 'Sale' if is_sold else 'In Stock'
        
        if is_sold:
            is_billed = random.random() > 0.2 # 80% of sold items are billed
            invoice_no = f"INV-{random.randint(10000, 99999)}" if is_billed else 'Billing Pending'
        else:
            invoice_no = ''
            
        # Date distribution
        date_offset = random.randint(0, 180)
        date = (start_date + timedelta(days=date_offset)).strftime('%Y-%m-%d')
        
        row = {
            'Tag No.': f"TAG-{1000+i}",
            'Brand': brand,
            'Model -No.': model_no,
            'Product': product,
            'Cpu': random.choice(cpus),
            'Ram': random.choice(rams),
            'HDD': random.choice(hdds),
            'Serial-No.': f"SN{random.randint(100000, 999999)}",
            'Status': status,
            'Invoice No.': invoice_no,
            'Date': date,
            'Tax Inculding Amount': random.randint(15000, 80000),
            'Gate Pass No': f"GP-{random.randint(100, 999)}"
        }
        data.append(row)
        
    df = pd.DataFrame(data)
    df.to_excel('sample_inventory.xlsx', index=False)
    print("Sample inventory file created: sample_inventory.xlsx")

if __name__ == "__main__":
    generate_sample_data()
