# drone-mvn-auth
[![Build Status](https://travis-ci.org/robertstettner/drone-mvn-auth.svg?branch=master)](https://travis-ci.org/robertstettner/drone-mvn-auth)
[![Coverage Status](https://coveralls.io/repos/github/robertstettner/drone-mvn-auth/badge.svg?branch=master)](https://coveralls.io/github/robertstettner/drone-mvn-auth?branch=master)

Drone plugin for generating the `settings.xml` with the server authentication for a Maven repository.

Please note that dependencies are saved in the `.m2` directory.

## Configuration

The following parameters are used to configure the plugin:

- `servers[]`: the servers
- `servers[].id`: the server id
- `servers[].username`: the server username
- `servers[].password`: the server password
- `profiles[]`: the profiles
- `profiles[].id`: the profile id
- `profiles[].repositories[]`: the profile's repositories
- `profiles[].repositories[].id`: the profile's repository id
- `profiles[].repositories[].name`: the profile's repository name
- `profiles[].repositories[].url`: the profile's repository url
- `profiles[].repositories[].layout`: the profile's repository layout
- `profiles[].plugin_repositories[]`: the profile's plugin repositories
- `profiles[].plugin_repositories[].id`: the profile's plugin repository id
- `profiles[].plugin_repositories[].name`: the profile's plugin repository name
- `profiles[].plugin_repositories[].url`: the profile's plugin repository url
- `profiles[].plugin_repositories[].layout`: the profile's plugin repository layout
- `active_profiles[]`: the active profiles
- `debug`: debug mode (optional: set to `true` for verbose messages)

### Drone configuration example

```yaml
pipeline:
  build:
    image: maven:3-alpine
    commands:
      - mvn install -gs settings.xml
      
  authenticate:
    image: robertstettner/drone-mvn-auth
    pull: true
    servers:
      - id: release
        username: ${NEXUS_USERNAME}
        password: ${NEXUS_PASSWORD}
      - id: snapshot
        username: ${NEXUS_USERNAME}
        password: ${NEXUS_PASSWORD}
    profiles:
      - id: my-profile
        repositories:
          - id: myRepo
            name: Repository for my libraries
            url: http://maven.my.com
            layout: default
        plugin_repositories:
          - id: myRepo
            name: Repository for my libraries
            url: http://maven.my.com
            layout: default
    active_profiles:
      - my-profile
              
    
  deploy:
    image: maven:3-alpine
    commands:
      - mvn clean deploy -gs settings.xml
```

## License

MIT