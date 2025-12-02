const dns = require('dns');

const hostname = '_mongodb._tcp.cluster0.rwuiuqw.mongodb.net';

try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
  console.log('Set DNS to Google DNS');
  
  dns.resolveTxt(hostname, (err, records) => {
    if (err) {
      console.error('❌ TXT lookup failed:', err.message);
    } else {
      console.log('✅ TXT records:', JSON.stringify(records, null, 2));
    }
  });
} catch (e) {
  console.error('Error:', e.message);
}
