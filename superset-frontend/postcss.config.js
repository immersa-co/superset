module.exports = {
  plugins: [
    'tailwindcss',
    'autoprefixer',
    'postcss-preset-env',
    [
      'postcss-pxtorem',
      {
        rootValue: 16,
        propList: ['*'],
      },
    ],
    process.env.NODE_ENV === 'production' ? 'cssnano' : '',
  ],
};
