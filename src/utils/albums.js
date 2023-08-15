export const fetchAlbum = async albumId => {
  let response;

  response = await fetch(
    `https://gosolid.dev/photos/${albumId}/sharedstreams/webstream`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        Accept: '*/*',
      },
      credentials: 'include',
      body: JSON.stringify({
        streamCtag: null,
      }),
    }
  );
  const webstream = await response.json();

  const photoGuids = webstream.photos.map(photo => photo.photoGuid);

  response = await fetch(
    `https://gosolid.dev/photos/${albumId}/sharedstreams/webasseturls`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        Accept: '*/*',
      },
      credentials: 'include',
      body: JSON.stringify({ photoGuids }),
    }
  );

  const assets = await response.json();

  webstream.photos.forEach(photo => {
    for (const k in photo.derivatives) {
      const { checksum } = photo.derivatives[k];
      const asset = assets.items[checksum];
      photo.derivatives[
        k
      ].url = `https://${asset.url_location}${asset.url_path}`;
    }
  });

  return webstream;
};

export const fetchAlbums = async albums => {
  return Promise.all(
    albums.map(album => fetchAlbum(album.replace(/^.*#/, '')))
  );
};
