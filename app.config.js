const appJson = require('./app.json');

const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY ?? '';

const plugins = appJson.expo.plugins.map((plugin) => {
  if (Array.isArray(plugin) && plugin[0] === 'react-native-maps') {
    return [
      'react-native-maps',
      {
        iosGoogleMapsApiKey: googleMapsApiKey,
        androidGoogleMapsApiKey: googleMapsApiKey,
      },
    ];
  }
  return plugin;
});

/** @type {import('expo/config').ExpoConfig} */
module.exports = {
  expo: {
    ...appJson.expo,
    plugins,
    extra: {
      ...appJson.expo.extra,
      eas: {
        projectId: '296debf2-3fec-4861-90c7-ab2cd004795f',
      },
    },
  },
};
