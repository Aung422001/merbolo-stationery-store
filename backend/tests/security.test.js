import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import User from '../src/models/User.js';
import { protect } from '../src/middleware/auth.js';
import { admin } from '../src/middleware/admin.js';
import { errorHandler } from '../src/middleware/errorHandler.js';

const makeRes=()=>({statusCode:200,status(n){this.statusCode=n;return this},json(v){this.body=v;return this}});
test('missing bearer token is rejected',async()=>{const res=makeRes();let called=false;await protect({headers:{}},res,()=>{called=true});assert.equal(res.statusCode,401);assert.equal(called,false)});
test('invalid JWT is rejected',async()=>{const res=makeRes();await protect({headers:{authorization:'Bearer invalid.jwt.token'}},res,()=>{});assert.equal(res.statusCode,401)});
test('expired JWT is rejected',async()=>{const old=process.env.JWT_SECRET;process.env.JWT_SECRET='unit-test-secret';try{const token=jwt.sign({id:'507f191e810c19729de860ea'},process.env.JWT_SECRET,{expiresIn:-1});const res=makeRes();await protect({headers:{authorization:'Bearer '+token}},res,()=>{});assert.equal(res.statusCode,401)}finally{if(old===undefined)delete process.env.JWT_SECRET;else process.env.JWT_SECRET=old}});
test('non-admin is denied access',()=>{const res=makeRes();let called=false;admin({user:{role:'user'}},res,()=>{called=true});assert.equal(res.statusCode,403);assert.equal(called,false)});
test('admin role is allowed',()=>{const res=makeRes();let called=false;admin({user:{role:'admin'}},res,()=>{called=true});assert.equal(called,true)});
test('internal errors are masked in production',()=>{const old=process.env.NODE_ENV;process.env.NODE_ENV='production';try{const res=makeRes();errorHandler(new Error('private database password'),{},res,()=>{});assert.equal(res.statusCode,500);assert.equal(res.body.message,'Internal server error');assert.equal(JSON.stringify(res.body).includes('private database password'),false)}finally{if(old===undefined)delete process.env.NODE_ENV;else process.env.NODE_ENV=old}});
