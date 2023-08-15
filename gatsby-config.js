require('@babel/register')({
  presets: ['@babel/react', '@babel/env'],
  plugins: [
    [
      'babel-plugin-transform-require-ignore',
      {
        extensions: ['.less', '.sass', '.scss'],
      },
    ],
  ],
  exclude: ['node_modules'],
});

module.exports = require('./gatsby-config.esm.jsx');
