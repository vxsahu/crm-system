const dns = require('dns');

console.log('Current DNS servers:', dns.getServers());

const hostname = '_mongodb._tcp.cluster0.rwuiuqw.mongodb.net';

console.log(`\nAttempting to resolve SRV for ${hostname}...`);

// Try with default DNS
dns.resolveSrv(hostname, (err, addresses) => {
  if (err) {
    console.error('❌ Default DNS failed:', err.message);
  } else {
    console.log('✅ Default DNS success:', addresses);
  }
});

// Try setting Google DNS
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
  console.log('\nSet DNS servers to Google DNS (8.8.8.8, 8.8.4.4)');
  console.log('New DNS servers:', dns.getServers());
  
  dns.resolveSrv(hostname, (err, addresses) => {
    if (err) {
      console.error('❌ Google DNS failed:', err.message);
    } else {
      console.log('✅ Google DNS success:', addresses);
    }
  });
} catch (e) {
  console.error('Failed to set DNS servers:', e.message);
}
