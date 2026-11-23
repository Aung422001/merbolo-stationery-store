import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import Order from '../src/models/Order.js';
import Product from '../src/models/Product.js';
import { confirmDemoPayment } from '../src/controllers/demoPaymentController.js';

const user = new mongoose.Types.ObjectId();
const otherUser = new mongoose.Types.ObjectId();
const category = new mongoose.Types.ObjectId();
let replset;
const response = () => ({statusCode:200,status(n){this.statusCode=n;return this},json(body){this.body=body;return this}});
async function pay(orderId, outcome='success', userId=user) {
  const res=response();
  await confirmDemoPayment({body:{orderId:String(orderId),outcome},user:{_id:userId}},res,e=>{throw e});
  return res;
}
async function fixture(stock=2,quantity=1) {
  const product=await Product.create({name:'Test notebook',slug:'notebook-'+new mongoose.Types.ObjectId(),price:100,category,stock});
  const create=async(owner=user)=>Order.create({user:owner,items:[{product:product._id,name:product.name,price:100,quantity}],shippingAddress:{line1:'Test',city:'Bangkok',province:'Bangkok',postalCode:'10110'},subtotal:100,shippingFee:50,total:150,isDemo:true,paymentProvider:'demo'});
  return {product,create};
}
test('real replica-set transaction integration', {timeout:120000}, async t=>{
  replset=await MongoMemoryReplSet.create({replSet:{count:1,storageEngine:'wiredTiger'}});
  await mongoose.connect(replset.getUri());
  t.after(async()=>{await mongoose.disconnect();await replset.stop()});
  await t.test('successful payment decrements stock once; duplicate rejected',async()=>{
    const {product,create}=await fixture();
    const order=await create();
    assert.equal((await pay(order._id)).statusCode,200);
    assert.equal((await pay(order._id)).statusCode,409);
    assert.equal((await Product.findById(product._id)).stock,1);
    assert.equal((await Order.findById(order._id)).paymentStatus,'paid');
  });
  await t.test('declined payment does not decrement stock',async()=>{
    const {product,create}=await fixture();
    const order=await create();
    assert.equal((await pay(order._id,'failure')).statusCode,200);
    assert.equal((await Product.findById(product._id)).stock,2);
    assert.equal((await Order.findById(order._id)).paymentStatus,'failed');
  });
  await t.test('foreign user cannot finalize an order',async()=>{
    const {product,create}=await fixture();
    const order=await create(otherUser);
    assert.equal((await pay(order._id)).statusCode,404);
    assert.equal((await Product.findById(product._id)).stock,2);
  });
  await t.test('insufficient stock rolls back multi-item inventory changes',async()=>{
    const {product,create}=await fixture(1);
    const order=await create();
    const unavailable=await Product.create({name:'Unavailable',slug:'unavailable-'+new mongoose.Types.ObjectId(),price:100,category,stock:0});
    order.items.push({product:unavailable._id,name:'Unavailable',price:100,quantity:1});
    await order.save();
    assert.equal((await pay(order._id)).statusCode,409);
    assert.equal((await Product.findById(product._id)).stock,1);
    assert.equal((await Order.findById(order._id)).paymentStatus,'pending');
  });
  await t.test('parallel orders never oversell the last unit',async()=>{
    const {product,create}=await fixture(1);
    const [a,b]=await Promise.all([create(),create()]);
    const outcomes=await Promise.all([pay(a._id),pay(b._id)]);
    assert.equal(outcomes.filter(x=>x.statusCode===200).length,1);
    assert.equal((await Product.findById(product._id)).stock,0);
    assert.equal(await Order.countDocuments({_id:{$in:[a._id,b._id]},paymentStatus:'paid'}),1);
  });
});
