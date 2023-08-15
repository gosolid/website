import books from './books.json' assert { type: 'json' };
import { render } from './index.js';

const main = async () => {
  const startTime = Date.now();
  await Promise.all(
    books.books.map(async book => {
      const startTime = Date.now();
      console.info('building', book.id);
      await render({
        id: book.id,
        cachePath: `/books/${book.id}.pdf`,
        password: book.password,
      });
      console.info(
        'built',
        book.id,
        'in',
        ((Date.now() - startTime) / 1000).toFixed(3) + 's'
      );
    })
  );
  console.info(
    'finished building books in',
    ((Date.now() - startTime) / 1000).toFixed(3) + 's'
  );
  process.exit(0);
};

main().catch(err => {
  console.error(err);
  process.exit(1);
});
