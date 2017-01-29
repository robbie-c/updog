## READ THIS FIRST (written in 2017)

I wrote this in 2015 in my spare time to teach myself React and see how it felt to write a greenfield project with universal React rendering, something I would take for granted now. I also wanted to toy around with WebRTC and WebSockets. I made a lot of decisions back then that I wouldn't make now, the list of which is too long to put here ;)

In a similar vein, I am porting this to TypeScript and tidying up some of those previous bad decisions (notably switching to Redux from my custom-rolled alternative).
 
I suspect the project will be pretty broken for a while, until the porting is done. If you'd like to see what the code used to look like, check out https://github.com/robbie-c/updog/tree/v0.1.0

Since 2015, services like Discord, Curse, and Slack have grown in popularity, and the technology side of this is now just plumbing. I think there would be value to the world in there being a decent FOSS alternative that people could host themselves, but unless I have a lot more free time, this won't be that. You should probably check out / support https://github.com/mumble-voip/mumble

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
