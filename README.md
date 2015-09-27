## Overview

This project aims to create chat-room functionality with audio, video, and screen sharing. Users should be able to create a new room very easily, and invite people just by sharing a link.

## Motivation

This project exists because currently using TeamSpeak or Skype for gaming chat for small (e.g. 5) groups is a bit crap. TeamSpeak is a pain for initial configuration, whereas Skype has poor audio quality and being in a conversation means your phone rings when anyone wants to play.

With the semi-recent introduction of WebRTC to modern browsers, the audio quality of that should be a lot better than that of Skype. The server doesn't process any media (instead the clients use a full-mesh) so can be very lightweight.

## Installation

For development, just run
> gulp dev

This builds the client side JavaScript and runs the server, using nodemon to rebuild and restart if there are any changes. This means you can just leave it running in the background and examine the output for log messages.

For production, instead run
> gulp build
> node src/runServer.js

This is currently setup with running on Heroku in mind, so there is an npm postinstall script which builds, and npm starts runs the server. (this also means that we can't use devDependencies as Heroku needs to know how to build)

## Tests

TODO write some tests :P

## Contributors

Right now this is just me (Robbie), but if you'd like to help out please let me know!

## License

There's currently no license, which means the code is copyrighted by default, and you will need to ask my permission to use it. This is because I don't know what I want to do with this project yet. If you want to contribute I will need to fix this.
