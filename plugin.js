'use strict';

let fs = require('fs');

/* eslint-disable no-console */
const log = console.log;
const logDebug = msg => {
  if (process.env.PLUGIN_DEBUG) console.debug(msg);
};
const logError = console.error;
/* eslint-enable no-console */

const generateServer = server =>
  `<server><id>${server.id}</id><username>${
    server.username
  }</username><password>${server.password}</password></server>`;

const generateRepository = type => repo =>
  `<${type}><id>${repo.id}</id><name>${repo.name}</name><url>${
    repo.url
  }</url><layout>${repo.layout}</layout></${type}>`;

const generateProfile = profile =>
  `<profile><id>${profile.id}</id><repositories>${
    profile.hasOwnProperty('repositories')
      ? profile.repositories.map(generateRepository('repository')).join('')
      : ''
  }</repositories><pluginRepositories>${
    profile.hasOwnProperty('plugin_repositories')
      ? profile.plugin_repositories
        .map(generateRepository('pluginRepository'))
        .join('')
      : ''
  }</pluginRepositories></profile>`;

const generateActiveProfile = profile =>
  `<activeProfile>${profile}</activeProfile>`;

const parseParam = param => {
  let config = [];
  const env = process.env[`PLUGIN_${param.toUpperCase()}`];

  if (env) {
    if (param === 'active_profiles') {
      config = env.split(',');
    } else {
      try {
        config = JSON.parse(env);
      } catch (ignore) {
        logError(`-- Error: cannot parse ${param} data`);
        process.exit(1);
      }
    }
  }
  logDebug(`-- Found ${param}: ${config.length}`);

  return config;
};

module.exports = {
  init: () => {
    log('-- Preparing Maven for authentication...');

    const config = ['servers', 'profiles', 'active_profiles'].reduce(function(
      acc,
      val
    ) {
      acc[val] = parseParam(val);
      return acc;
    },
    {});

    const data = `<settings xmlns="http://maven.apache.org/SETTINGS/1.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.0.0 http://maven.apache.org/xsd/settings-1.0.0.xsd"><localRepository>${
      process.env.PWD
    }/.m2</localRepository><servers>${config.servers
      .map(generateServer)
      .join('')}</servers><profiles>${config.profiles
      .map(generateProfile)
      .join('')}</profiles><activeProfiles>${config.active_profiles
      .map(generateActiveProfile)
      .join('')}</activeProfiles></settings>`;
    try {
      fs.writeFileSync('settings.xml', data);
      log('-- Maven authentication done!');
    } catch (ignore) {
      logError('-- Error: cannot write file');
      return process.exit(1);
    }
    return process.exit(0);
  }
};
