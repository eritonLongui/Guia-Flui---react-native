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

    owner: 'marcomendessv',

    plugins,

    extra: {
      ...appJson.expo.extra,
      googleMapsApiKey,
      eas: {
        ...(appJson.expo.extra?.eas ?? {}),
        projectId: '54541afd-a5e4-43ad-b58f-344f0dd06020',
      },
    },
  },
};
