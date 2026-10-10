// Copies the web game into ./www so Capacitor can package it as an Android / iOS app.
import { cpSync, rmSync, mkdirSync } from 'node:fs';

const files = ['index.html', 'manifest.webmanifest', 'sw.js', 'css', 'js', 'icons'];
rmSync('www', { recursive: true, force: true });
mkdirSync('www');
for (const f of files) cpSync(f, `www/${f}`, { recursive: true });
console.log('www/ ready');
