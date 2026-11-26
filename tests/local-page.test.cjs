'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {sameLocalPage}=require('../core/local-page.cjs');
const lower='file:///c:/Users/Op/VerseCue/resources/app.asar/ui/index.html';

test('Windows: the drive letter and folder case do not matter, and the query is ignored',()=>{
  assert.equal(sameLocalPage('file:///C:/Users/Op/VerseCue/resources/app.asar/ui/index.html',lower,'win32'),true);
  assert.equal(sameLocalPage('file:///C:/USERS/op/versecue/resources/app.asar/ui/index.html?mode=compact',lower,'win32'),true);
});

test('Windows: other pages, folders, hosts, fragments and schemes are refused',()=>{
  assert.equal(sameLocalPage('file:///C:/Users/Op/VerseCue/resources/app.asar/ui/other.html',lower,'win32'),false);
  assert.equal(sameLocalPage('file:///D:/Users/Op/VerseCue/resources/app.asar/ui/index.html',lower,'win32'),false);
  assert.equal(sameLocalPage('file://server/share/ui/index.html',lower,'win32'),false);
  assert.equal(sameLocalPage(lower+'#x',lower,'win32'),false);
  assert.equal(sameLocalPage('https://example.com/ui/index.html',lower,'win32'),false);
  assert.equal(sameLocalPage('file:///C:/Users/Op/VerseCue/resources/app.asar/ui/../ui/index.html/..',lower,'win32'),false);
  assert.equal(sameLocalPage('not a url',lower,'win32'),false);
});

test('macOS and Linux compare exactly',()=>{
  const mac='file:///Applications/VerseCue.app/Contents/Resources/app.asar/ui/index.html';
  assert.equal(sameLocalPage(mac+'?x=1',mac,'darwin'),true);
  assert.equal(sameLocalPage(mac.replace('VerseCue.app','versecue.app'),mac,'darwin'),false);
});
