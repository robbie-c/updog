const os = require('os');

export const hostname = os.hostname();
export const isClient = typeof window !== 'undefined';
export const isDebug = true; // TODO
export const iceServers = [
    {
        urls: 'stun:stun.l.google.com:19302'
    }
];


