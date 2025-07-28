const fs = require('fs');
const path = require('path');
const firebaseClientConfig = require('../firebaseClientConfig');

const configPath = path.join(__dirname, '..', 'public', 'firebaseConfig.js');
const configContent = `export default ${JSON.stringify(firebaseClientConfig, null, 2)};\n`;

fs.writeFileSync(configPath, configContent);
console.log('Firebase client config generated successfully.');
