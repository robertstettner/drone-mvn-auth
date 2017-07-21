'use strict';

require('should');
const sinon = require('sinon');
require('should-sinon');
const rewire = require('rewire');

const plugin = rewire('../plugin');

describe('Unit tests: Drone Maven Auth', () => {
    describe('logDebug()', () => {
        const logDebug = plugin.__get__('logDebug');
        it('should invoke console.debug under debug mode', () => {
            const processMock = {
                env: {
                    PLUGIN_DEBUG: 'true'
                }
            };
            const consoleMock = {
                debug: sinon.spy()
            };
            const revert1 = plugin.__set__('process', processMock);
            const revert2 = plugin.__set__('console', consoleMock);

            logDebug('asdasd');
            consoleMock.debug.should.be.calledOnce();
            consoleMock.debug.should.be.calledWith('asdasd');

            revert1();
            revert2();
        });
    });
    describe('generateServer()', () => {
        const generateServer = plugin.__get__('generateServer');
        it('should return interpolated server template', () => {
            generateServer({
                id: 123,
                username: 'bobo',
                password: 'ziphead'
            }).should.eql('<server><id>123</id><username>bobo</username><password>ziphead</password></server>');
        });
    });
    describe('generateRepository()', () => {
        const generateRepository = plugin.__get__('generateRepository');
        it('should function that eventually returns interpolated repository template', () => {
            generateRepository('myType')({
                id: 123,
                name: 'bobo',
                url: 'http://www.google.com',
                layout: 'default'
            }).should.eql('<myType><id>123</id><name>bobo</name><url>http://www.google.com</url><layout>default</layout></myType>');
        });
    });
    describe('generateProfile()', () => {
        const generateProfile = plugin.__get__('generateProfile');
        it('should return interpolated profile template', () => {
            const generateRepositoryStub = sinon.stub().returns(() => 'dabba');
            const revert = plugin.__set__('generateRepository', generateRepositoryStub);
            generateProfile({
                id: 123,
                repositories: [1, 2],
                plugin_repositories: [3]
            }).should.eql('<profile><id>123</id><repositories>dabbadabba</repositories><pluginRepositories>dabba</pluginRepositories></profile>');
            generateRepositoryStub.should.have.callCount(2);
            revert();
        });
    });
    describe('generateActiveProfile()', () => {
        const generateActiveProfile = plugin.__get__('generateActiveProfile');
        it('should return interpolated active profile template', () => {
            generateActiveProfile('jojo').should.eql('<activeProfile>jojo</activeProfile>');
        });
    });
    describe('parseParam()', () => {
        const parseParam = plugin.__get__('parseParam');
        it('should return empty array when envvar not found', () => {
            const actual = parseParam('notfound');
            actual.should.be.an.Array();
            actual.should.be.empty();
        });
        it('should parse json when not active profiles', () => {
            const processMock = {
                env: {
                    PLUGIN_SERVERS: '[{"id": 123, "username": "bobo", "password": "ziphead"}]'
                },
                exit: sinon.stub()
            };
            const revert = plugin.__set__('process', processMock);
            parseParam('servers').should.eql([{
                id: 123,
                username: 'bobo',
                password: 'ziphead'
            }]);
            processMock.exit.should.have.callCount(0);
            revert();
        });
        it('should parse json when active profiles', () => {
            const processMock = {
                env: {
                    PLUGIN_ACTIVE_PROFILES: 'fuzz,bizz'
                },
                exit: sinon.stub()
            };
            const revert = plugin.__set__('process', processMock);
            parseParam('active_profiles').should.eql(["fuzz","bizz"]);
            processMock.exit.should.have.callCount(0);
            revert();
        });
        it('should invoke process.exit with error code when failed to parse invalid json', () => {
            const processMock = {
                env: {
                    PLUGIN_SERVERS: '[{"id": 123, "username": "bobo", "password": ziphead}]'
                },
                exit: sinon.stub()
            };
            const revert = plugin.__set__('process', processMock);
            parseParam('servers');
            processMock.exit.should.have.callCount(1);
            processMock.exit.should.be.calledWith(1);
            revert();
        });
    });
    describe('init()', () => {
        it('should write a settings.xml file with all the data', () => {
            const processMock = {
                env: {
                    PWD: '/root',
                    PLUGIN_SERVERS: '[{"id": 123, "username": "bobo", "password": ziphead}]'
                },
                exit: sinon.stub()
            };
            const fsMock = {
                writeFileSync: sinon.stub()
            };
            const parseParamStub = sinon.stub().returns([1,2,3]);
            const revert1 = plugin.__set__('process', processMock);
            const revert2 = plugin.__set__('parseParam', parseParamStub);
            const revert3 = plugin.__set__('fs', fsMock);
            const revert4 = plugin.__set__('generateActiveProfile', a => a);
            const revert5 = plugin.__set__('generateProfile', a => a);
            const revert6 = plugin.__set__('generateServer', a => a);

            plugin.init();

            parseParamStub.should.have.callCount(3);
            fsMock.writeFileSync.should.have.callCount(1);
            fsMock.writeFileSync.should.be.calledWith('settings.xml','<settings xmlns="http://maven.apache.org/SETTINGS/1.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.0.0 http://maven.apache.org/xsd/settings-1.0.0.xsd"><localRepository>/root/.m2</localRepository><servers>123</servers><profiles>123</profiles><activeProfiles>123</activeProfiles></settings>');
            processMock.exit.should.have.callCount(1);
            processMock.exit.should.be.calledWith(0);

            revert1();
            revert2();
            revert3();
            revert4();
            revert5();
            revert6();
        });
        it('should invoke process.exit with error code when failed to write file', () => {
            const processMock = {
                env: {
                    PWD: '/root',
                    PLUGIN_SERVERS: '[{"id": 123, "username": "bobo", "password": ziphead}]'
                },
                exit: sinon.stub()
            };
            const fsMock = {
                writeFileSync: sinon.stub().throws('Holy crap!')
            };
            const parseParamStub = sinon.stub().returns([1,2,3]);
            const revert1 = plugin.__set__('process', processMock);
            const revert2 = plugin.__set__('parseParam', parseParamStub);
            const revert3 = plugin.__set__('fs', fsMock);
            const revert4 = plugin.__set__('generateActiveProfile', a => a);
            const revert5 = plugin.__set__('generateProfile', a => a);
            const revert6 = plugin.__set__('generateServer', a => a);

            plugin.init();

            parseParamStub.should.have.callCount(3);
            fsMock.writeFileSync.should.have.callCount(1);
            fsMock.writeFileSync.should.be.calledWith('settings.xml','<settings xmlns="http://maven.apache.org/SETTINGS/1.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.0.0 http://maven.apache.org/xsd/settings-1.0.0.xsd"><localRepository>/root/.m2</localRepository><servers>123</servers><profiles>123</profiles><activeProfiles>123</activeProfiles></settings>');
            fsMock.writeFileSync.should.threw('Holy crap!');
            processMock.exit.should.have.callCount(1);
            processMock.exit.should.be.calledWith(1);

            revert1();
            revert2();
            revert3();
            revert4();
            revert5();
            revert6();
        });
    });
});