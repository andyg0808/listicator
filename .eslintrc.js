module.exports = {
  extends: ["react-app"],
  plugins: ["@typescript-eslint"],
  parser: "@typescript-eslint/parser",
  overrides: [
    {
      files: ["*.jsx"],
    },
    {
      files: ["*.ts?(x)"],
    },
    {
      files: ["src/LexerViewer.tsx", "src/ParserViewer.tsx"],
      rules: {
        "@typescript-eslint/ban-ts-comment": 0,
      },
    },
  ],
};
