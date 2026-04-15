module.exports = {
  configureWebpack: {
    devtool: 'source-map'
  },

  transpileDependencies: [
    'vuetify',
    'ethers',
    '@noble/curves',
    '@noble/hashes'
  ]
}
