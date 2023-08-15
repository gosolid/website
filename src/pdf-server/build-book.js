import { render } from './index.js';
import books from './books.json' assert { type: 'json' };

const main = async () => {
  const id = process.argv[2];

  const book = books.find(book => book.id === id);

  await render({
    id: book.id,
    password: book.password,
    cachePath: `/books/${book.id}.pdf`,
  });
  process.exit(0);
};

main().catch(err => {
  console.error(err);
  process.exit(1);
});
