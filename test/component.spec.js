'use strict';

const fs = require('fs');

require('should');
const rewire = require('rewire');

const plugin = rewire('../plugin');

describe('Component tests: Drone Maven Auth', () => {
  describe('without secrets', () => {
    it('should produce servers, profiles, and active profiles', () => {
      const processMock = {
        env: {
          PLUGIN_SERVERS: '[{"id": 123, "username": "bobo", "password": "ziphead"}]',
          PLUGIN_PROFILES: '[{"id": 321, "repositories": [{"id": 765, "name": "escenic", "url": "http://me.co", "layout": "default"}], "plugin_repositories": [{"id": 345, "name": "escenic2", "url": "http://me2.co", "layout": "default"}]}]',
          PLUGIN_ACTIVE_PROFILES: 'foo,bar'
        },
        exit: () => { }
      };
      const revert = plugin.__set__('process', processMock);

      plugin.init();
      const actual = fs.readFileSync('settings.xml', 'UTF-8');

      actual.should.eql('<settings xmlns="http://maven.apache.org/SETTINGS/1.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.0.0 http://maven.apache.org/xsd/settings-1.0.0.xsd"><localRepository>undefined/.m2</localRepository><servers><server><id>123</id><username>bobo</username><password>ziphead</password></server></servers><profiles><profile><id>321</id><repositories><repository><id>765</id><name>escenic</name><url>http://me.co</url><layout>default</layout></repository></repositories><pluginRepositories><pluginRepository><id>345</id><name>escenic2</name><url>http://me2.co</url><layout>default</layout></pluginRepository></pluginRepositories></profile></profiles><activeProfiles><activeProfile>foo</activeProfile><activeProfile>bar</activeProfile></activeProfiles></settings>');
      revert();
    });
    it('should produce only profiles, and active profiles', () => {
      const processMock = {
        env: {
          PLUGIN_PROFILES: '[{"id": "aa", "repositories": [{"id": "aa", "name": "nexus", "url": "http://ip:8081/nexus/content/groups/public/", "layout": "default"}]}]',
          PLUGIN_ACTIVE_PROFILES: 'aa'
        },
        exit: () => { }
      };
      const revert = plugin.__set__('process', processMock);

      plugin.init();
      const actual = fs.readFileSync('settings.xml', 'UTF-8');
      actual.should.eql('<settings xmlns="http://maven.apache.org/SETTINGS/1.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.0.0 http://maven.apache.org/xsd/settings-1.0.0.xsd"><localRepository>undefined/.m2</localRepository><servers></servers><profiles><profile><id>aa</id><repositories><repository><id>aa</id><name>nexus</name><url>http://ip:8081/nexus/content/groups/public/</url><layout>default</layout></repository></repositories><pluginRepositories></pluginRepositories></profile></profiles><activeProfiles><activeProfile>aa</activeProfile></activeProfiles></settings>');
      revert();
    });
    it('should profiles, properties and active profiles', () => {
      const processMock = {
        env: {
          PLUGIN_PROFILES: '[{"id": 321, "repositories": [{"id": 765, "name": "escenic", "url": "http://me.co", "layout": "default"}], "properties": { "property.1": "value1", "property.2": "value2" }}]',
          PLUGIN_ACTIVE_PROFILES: '321'
        },
        exit: () => { }
      };
      const revert = plugin.__set__('process', processMock);

      plugin.init();
      const actual = fs.readFileSync('settings.xml', 'UTF-8');

      actual.should.eql('<settings xmlns="http://maven.apache.org/SETTINGS/1.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.0.0 http://maven.apache.org/xsd/settings-1.0.0.xsd"><localRepository>undefined/.m2</localRepository><servers></servers><profiles><profile><id>321</id><properties><property.1>value1</property.1><property.2>value2</property.2></properties><repositories><repository><id>765</id><name>escenic</name><url>http://me.co</url><layout>default</layout></repository></repositories><pluginRepositories></pluginRepositories></profile></profiles><activeProfiles><activeProfile>321</activeProfile></activeProfiles></settings>');
      revert();
    });
  });
  describe('with secrets', () => {
    it('should produce servers, profiles, and active profiles', () => {
      const processMock = {
        env: {
          MAVEN_SERVERS: '[{"id": 123, "username": "bobo", "password": "ziphead"}]',
          PLUGIN_PROFILES: '[{"id": 321, "repositories": [{"id": 765, "name": "escenic", "url": "http://me.co", "layout": "default"}], "plugin_repositories": [{"id": 345, "name": "escenic2", "url": "http://me2.co", "layout": "default"}]}]',
          PLUGIN_ACTIVE_PROFILES: 'foo,bar'
        },
        exit: () => { }
      };
      const revert = plugin.__set__('process', processMock);

      plugin.init();
      const actual = fs.readFileSync('settings.xml', 'UTF-8');

      actual.should.eql('<settings xmlns="http://maven.apache.org/SETTINGS/1.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.0.0 http://maven.apache.org/xsd/settings-1.0.0.xsd"><localRepository>undefined/.m2</localRepository><servers><server><id>123</id><username>bobo</username><password>ziphead</password></server></servers><profiles><profile><id>321</id><repositories><repository><id>765</id><name>escenic</name><url>http://me.co</url><layout>default</layout></repository></repositories><pluginRepositories><pluginRepository><id>345</id><name>escenic2</name><url>http://me2.co</url><layout>default</layout></pluginRepository></pluginRepositories></profile></profiles><activeProfiles><activeProfile>foo</activeProfile><activeProfile>bar</activeProfile></activeProfiles></settings>');
      revert();
    });
  });
});