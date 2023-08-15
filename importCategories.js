const yaml = require('js-yaml');
const fs = require('fs');
let categories = require('./src/content/categories.json');
const glob = require('glob');
const path = require('path');
const fetch = require('node-fetch');

const flattenCategories = (categories, parent = null, out = []) => {
  categories.forEach(category => {
    out.push({
      name: category.name,
      slug: category.slug,
      parent,
    });

    if (category.children) {
      flattenCategories(category.children, category.slug, out);
    }
  });

  return out;
};

categories = flattenCategories(categories);

const download = async (url, fileName) => {
  console.info(`fetching ${url} to ${fileName}`);
  const response = await fetch(url);
  const stream = fs.createWriteStream(fileName);
  await new Promise((resolve, reject) => {
    response.body.pipe(stream);
    response.body.on('error', err => reject(err));
    stream.on('finish', resolve);
  });
};

const locations = [
  { lat: 53.4187359, lon: -2.2890471, name: 'Sale Moor, UK', radius: 1 },
  {
    lat: 53.4835212,
    lon: -2.2353233,
    name: 'Tib Street, Manchester, UK',
    radius: 0.5,
  },
  { lat: 36.8550873, lon: -5.3236225, name: 'El Gastor, Spain', radius: 5 },
  { lat: 53.452366, lon: -2.3544934, name: 'Urmston Library, UK', radius: 1 },
  {
    lat: 39.0627809,
    lon: -120.0403045,
    name: 'Lake Tahoe, CA, USA',
    radius: 5,
  },
  {
    lat: 53.4526767,
    lon: -2.3723183,
    name: 'Moorside Unit, Urmston, UK',
    radius: 1,
  },
  { lat: 53.5025711, lon: -2.2779918, name: 'Salford, UK', radius: 3 },
  { lat: 41.7721639, lon: 12.2443989, name: 'Fiumicino, Italy', radius: 2 },
  {
    lat: 42.2352673,
    lon: 12.6207308,
    name: 'Torrita Tiberina, Italy',
    radius: 5,
  },
  { lat: 42.384404, lon: 12.6442692, name: 'Vacone, Italy', radius: 5 },
  { lat: 42.5669662, lon: 12.648888, name: 'Terni, Italy', radius: 5 },
];

const coordDistance = (lat1, lon1, lat2, lon2, debug = false) => {
  lat1 = (lat1 * Math.PI) / 180;
  lon1 = (lon1 * Math.PI) / 180;
  lat2 = (lat2 * Math.PI) / 180;
  lon2 = (lon2 * Math.PI) / 180;

  return (
    6371 *
    Math.acos(
      Math.max(
        -1,
        Math.min(
          1,
          Math.sin(lat1) * Math.sin(lat2) +
            Math.cos(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1)
        )
      )
    )
  );
};

const findLocation = (lat, lon) => {
  lat = parseFloat(lat);
  lon = parseFloat(lon);
  return locations.find(x => coordDistance(x.lat, x.lon, lat, lon) <= x.radius);
};

const main = async () => {
  await Promise.all(
    glob.sync('**/*.md', { cwd: 'src/content' }).map(async fileName => {
      fileName = `src/content/${fileName}`;
      const file = fs.readFileSync(fileName);
      let [_, fm, ...md] = file.toString('utf8').split(/---\n/gm);
      fm = yaml.safeLoad(fm);
      md = md.join('---\n');

      md = md.replace(
        /<audio.*<source.*src="([^"]*)".*/g,
        (g, g1) => `\`audio: ${g1}\`\n`
      );

      md = md.replace(/https?:\/\/timothydiary.org/g, '');

      const replaceFilePaths = await Promise.all(
        md
          .match(
            /(?:http[^")`]*)?\/?wp-content\/[^")`]*\.(?:jpg|jpeg|png|m4a|mp3)/gm
          )
          ?.map(async originalUrl => {
            let url = originalUrl;
            const baseName = path.basename(url);
            if (url.startsWith('wp-content')) {
              url = `https://timothydiary.org/${url}`;
            }
            if (url.startsWith('/')) {
              url = `https://timothydiary.org${url}`;
            }
            const savedToFileName = path.resolve(
              path.dirname(fileName),
              baseName
            );
            await download(url, savedToFileName);
            return { from: originalUrl, to: `./${baseName}` };
          }) ?? []
      );

      for (const { from, to } of replaceFilePaths) {
        md = md.replace(new RegExp(`${from}[^")\`]*`, 'g'), to);
      }

      if (fm.category) {
        fm.categories = fm.category
          .map(category => {
            return categories.find(c => c.name === category)?.slug;
          })
          .filter(x => !!x);
      }

      if (fm.geo_latitude && fm.geo_longitude) {
        fm.location = findLocation(
          fm.geo_latitude[0],
          fm.geo_longitude[0]
        )?.name;
      }

      fm = {
        title: fm.title,
        date: fm.date,
        author: fm.author,
        type: fm.type,
        ...(fm.categories ? { categories: fm.categories } : {}),
        ...(fm.location ? { location: fm.location } : {}),
      };

      const out = `---\n${yaml.dump(fm)}---\n${md}\n`;

      fs.writeFileSync(fileName, out);
    })
  );
};

main().catch(err => console.error(err));
