const fs = require('fs/promises');

const args = process.argv.slice(2);

(async function () {
  try {
    await fs.unlink('.env');
  } catch (err) {
    console.log(err);
  } finally {
    await fs.writeFile('.env', args.join('\n'));
  }
})();
