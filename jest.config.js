/*module.exports = {
    preset: 'react-native',
    transform: {
      '^.+\\.[t|j]sx?$': 'babel-jest',
    },
    transformIgnorePatterns: [
      'node_modules/(?!(react-native|my-project|react-native-button)/)',
    ],
  };*/
module.exports = {
    preset: 'ts-jest',
    transform: {
        '^.+\\.(ts|tsx)?$': 'ts-jest',
        '^.+\\.(js|jsx)$': 'babel-jest',
    },
    globals: {
        "ts-jest": {
            isolatedModules: true,
        },
    },
};
/*module.exports = {
    verbose: true,
    setupFilesAfterEnv: ["<rootDir>src/setupTests.ts"],
    moduleFileExtensions: ["js", "jsx", "ts", "tsx"],
    moduleDirectories: ["node_modules", "src"],
    moduleNameMapper: {
      "\\.(css|less|scss)$": "identity-obj-proxy"
    },
    transform: {
      '^.+\\.(ts|tsx)?$': 'ts-jest',
      "^.+\\.(js|jsx)$": "babel-jest",
      //"^.+\\.[t|j]sx?$": "babel-jest",
      "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": "<rootDir>/__mocks__/file.js",
    },
    //transformIgnorePatterns: ["/node_modules/(?!react-file-drop)"],
  };*/
  

  
  