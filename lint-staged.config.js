module.exports = {
  './**/*{.js,.jsx,.ts,.tsx}': ['prettier --write'],
  // Compiles all TypeScript without emitting JS files to
  // check for type errors. This is specified in a separate file
  // so that lint-staged doesn't pass any arguments to tsc
  './**/*.ts?(x)': () => 'yarn check-types',
  './**/*{.js,.jsx,.ts,.tsx}': ['yarn lint']
};
