---
type: category
title: Solid
author: Timothy
showMeta: false
showLink: false
showTitle: false
---

<div style="float: left;">

@import(/imports/header)

</div>

<div class="example">

### install

```bash
npm install -g @gosolid/solid
```

### index.js

```typescript
import express from 'express';

const app = express();

app.get('/', (req, res, next) => {
  res.send('Hello Solid!');
});

express.listen(3000, () => {
  console.info('🚀 server listening on port 3000');
});
```

### run

```bash
solid index.js
```

</div>

<div style="clear: both;">
