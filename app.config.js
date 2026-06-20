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

    slug: 'guia-flui',

    owner: 'eritonlonguis-organization',

    plugins,

    extra: {
      ...appJson.expo.extra,
      eas: {
        projectId: 'c0350f61-bb5c-4340-8752-45b30ce97fe2',
      },
    },
  },
};
