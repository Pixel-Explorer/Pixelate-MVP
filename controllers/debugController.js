const { Router } = require('express');
const fs = require('fs');
const path = require('path');

const router = Router();

router.get('/_debug/secrets', (req, res) => {
  const dir = '/etc/secrets';
  let mounted = [];
  const previews = {};

  try {
    const files = fs.readdirSync(dir);
    mounted = files.slice(0, 2);
    mounted.forEach((file) => {
      const filePath = path.join(dir, file);
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const preview = content.split('\n').slice(0, 20).join('\n');
        previews[file] = preview;
      } catch (err) {
        previews[file] = `Error reading: ${err.message}`;
      }
    });
  } catch (err) {
    // directory may not exist
  }

  res.json({ mounted, previews });
});

module.exports = router;
