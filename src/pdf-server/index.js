import express from 'express';
import { exists, writeFile, readFile } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import crypto, { createHash } from 'crypto';
import fs from 'fs/promises';

const existsAsync = promisify(exists);
const execAsync = promisify(exec);
const writeFileAsync = promisify(writeFile);
const readFileAsync = promisify(readFile);

const app = express();

const promises = {};

export const render = async ({
  site = process.env.SITE,
  id,
  cachePath,
  password,
  test,
}) => {
  const preprocess = await readFileAsync('./preprocess.js');
  const preprocessCover = await readFileAsync('./preprocess-cover.js');

  await writeFileAsync(
    `${cachePath}.main.js`,
    `
      Prince.trackBoxes = true;
      document.body.className += ' prince';
      Prince.registerPostLayoutFunc(function () {
        ${preprocess}
      });
    `
  );

  console.info('creating content', id);
  var { stdout, stderr } = await execAsync(
    `prince -j ${site}/books/${id}/ -o ${cachePath}.main.pdf --script=${cachePath}.main.js`,
    { stdio: 'inherit' }
  );
  process.stdout.write(stdout);
  process.stderr.write(stderr);

  let { stdout: out } = await execAsync(
    `pdfinfo ${cachePath}.main.pdf | grep "Pages:"`
  );
  out = out.toString().replace(/^Pages:\s+/, '');
  const pages = parseInt(out, 10);

  console.info('generating cover vars', id);
  await writeFileAsync(
    `${cachePath}.cover.js`,
    `
      Prince.registerPostLayoutFunc(function () {
        var style = document.createElement('style');
        var pages = ${pages};
        var height = 10.75;
        var width = 6.25;
        var hinge = 0.394;
        var margin = 0.125;
        var wrap = 0.625;
        var spine = ((2.125 - 0.25) / (800 - 24)) * (pages - 24) + 0.25;
        var fullWidth = width * 2 + wrap * 2 + spine;
        var fullHeight = height;

        style.innerHTML = '
          :root {
            --pages: ' + pages + ';
            --cover-size: ' + fullWidth + 'in ' + fullHeight + 'in;
          }
        ';

        document.head.appendChild(style);

        ${preprocessCover}
      });
    `
  );

  console.info('creating cover', id);
  var { stdout, stderr } = await execAsync(
    `prince --script=${cachePath}.cover.js -j ${site}/books/${id}-cover/ -o ${cachePath}.cover.pdf`,
    { stdio: 'inherit' }
  );

  console.info('splicing', id);

  const encrypt = password ? `--encrypt ${password} ${password} 128 --` : '';
  await execAsync(
    `qpdf --empty ${encrypt} --pages ${cachePath}.cover.pdf 2 ${cachePath}.main.pdf 2-r2 -- ${cachePath}`
  );
  console.info('done', id);
  await fs.rm(`${cachePath}.main.pdf`, { force: true });
  await fs.rm(`${cachePath}.main.js`, { force: true });
  await fs.rm(`${cachePath}.cover.pdf`, { force: true });
  await fs.rm(`${cachePath}.cover.js`, { force: true });
};

const renderBook = async (req, res) => {
  const { site = process.env.SITE, id } = req.params;
  let { test = false, force } = req.query;

  test = !!(test && test === 'true');
  force = !!force;

  if (test) {
    force = true;
  }

  const siteHash = crypto
    .createHash('sha256')
    .update(site)
    .digest()
    .toString('hex');

  const cachePath = path.resolve(
    process.env.CACHE_DIR,
    `${siteHash}-${id}${test ? '.test' : ''}.pdf`
  );

  try {
    if (promises[cachePath]) {
      await promises[cachePath];
    }

    if (!force) {
      if (await existsAsync(cachePath)) {
        res.set('Content-Type', 'application/pdf').sendFile(cachePath);
        return;
      }
      res.status(404).set('Content-Type', 'text/plain').send('404 Not Found');
      return;
    }

    const promise = render({
      site: /https?:/.test(site) ? site : `https://${site}`,
      id,
      cachePath,
      test,
    });
    promises[cachePath] = promise;
    await promise;

    res.set('Content-Type', 'application/pdf').sendFile(cachePath);
  } catch (err) {
    console.error(err);
    res.status(500).send('500 Internal Server Error');
  } finally {
    delete promises[cachePath];
  }
};

app.get('/books/:site/:id', async (req, res) => {
  await renderBook(req, res);
});

app.get('/books/:id', async (req, res) => {
  await renderBook(req, res);
});

app.listen(process.env.PORT ?? 8080);
