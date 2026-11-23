import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import Order from '../src/models/Order.js';
import Product from '../src/models/Product.js';
import { confirmDemoPayment } from '../src/controllers/demoPaymentController.js';

const id = '507f1f77bcf86cd799439011';
const user = '507f191e810c19729de860ea';
const makeRes = () => ({ statusCode: 200, status(n) { this.statusCode=n; return this; }, json(v) { this.body=v; return this; } });
const original = { startSession: mongoose.startSession, findOne: Order.findOne, updateOne: Product.updateOne };
async function scenario({ outcome='success', stock=true, paid=false, owner=true }={}) {
  const order = { _id:id, user, paymentStatus: paid?'paid':'pending', items:[{product:id,quantity:2}], save:async()=>{} };
  let stockUpdates=0, sessionEnded=false;
  mongoose.startSession = async () => ({ withTransaction: async fn=>fn(), endSession: async()=>{sessionEnded=true} });
  Order.findOne = () => ({ session:async()=>owner?order:null });
  Product.updateOne = async()=>{stockUpdates++;return {modifiedCount:stock?1:0}};
  const res=makeRes();
  try { await confirmDemoPayment({body:{orderId:id,outcome},user:{_id:user}},res,e=>{throw e}); return {res,order,stockUpdates,sessionEnded}; }
  finally { mongoose.startSession=original.startSession; Order.findOne=original.findOne; Product.updateOne=original.updateOne; }
}
test('success updates order and inventory',async()=>{const x=await scenario();assert.equal(x.res.statusCode,200);assert.equal(x.order.paymentStatus,'paid');assert.equal(x.order.orderStatus,'processing');assert.equal(x.stockUpdates,1);assert.equal(x.sessionEnded,true)});
test('decline never decrements inventory',async()=>{const x=await scenario({outcome:'failure'});assert.equal(x.order.paymentStatus,'failed');assert.equal(x.stockUpdates,0)});
test('duplicate finalization is rejected',async()=>{const x=await scenario({paid:true});assert.equal(x.res.statusCode,409);assert.equal(x.stockUpdates,0)});
test('foreign user cannot finalize order',async()=>{const x=await scenario({owner:false});assert.equal(x.res.statusCode,404);assert.equal(x.stockUpdates,0)});
test('insufficient stock prevents paid transition',async()=>{const x=await scenario({stock:false});assert.equal(x.res.statusCode,409);assert.equal(x.order.paymentStatus,'pending')});
test('invalid request rejected before transaction',async()=>{const res=makeRes();await confirmDemoPayment({body:{orderId:'invalid',outcome:'success'},user:{_id:user}},res,()=>{});assert.equal(res.statusCode,400)});
