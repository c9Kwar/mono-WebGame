'use strict';
const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const root=path.join(__dirname,'..');
const units=fs.readdirSync(__dirname).filter(name=>name.endsWith('.test.cjs')).sort();
if(!units.length)throw Error('No regression tests discovered.');
const commands=[['--check','dist/storage.js'],['--check','dist/game.js'],['--check','dist/field-attacks.js'],['--test',...units.map(name=>'tests/'+name)],...['content-update','assets-ui','images','balance-simulation','passive-budget','chapter-economy-simulation','jade-balance'].map(name=>['tests/'+name+'.cjs'])];
for(const args of commands){const result=spawnSync(process.execPath,args,{cwd:root,stdio:'inherit'});if(result.error)throw result.error;if(result.status!==0)process.exit(result.status||1);}
console.log('PASS all unit, compatibility, asset, image and balance checks.');
