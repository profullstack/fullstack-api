const Controller = require('./controller');
const Coinpayments = require('coinpayments');
const ObjectId = require('mongodb').ObjectId;
const rp = require('request-promise');

const options = {
  key: process.env.COINPAYMENTS_KEY,
  secret: process.env.COINPAYMENTS_SECRET
};

const client = new Coinpayments(options);

class Transactions extends Controller {
  constructor() {
    super();
    this.planTypes = {
      yearly: {
        amount: 200,
        subscriptionLength: 60 * 60 * 24 * 365
      },
      quarterly: {
        amount: 60,
        subscriptionLength: 60 * 60 * 24 * 90
      }
    };
    this.collection = 'transactions';
  }

  async getRates(ctx) {
    const rateOptions = { accepted: 1 };
    const rates = await client.rates(rateOptions);
    Object.keys(rates)
      .forEach(key => {
        if (rates[key].accepted !== 1) delete rates[key];
      });
    ctx.body = rates;
  }

  async getStatus(ctx) {
    const statusOptions = { txid: ctx.request.query.id };
    ctx.body = await client.getTx(statusOptions);
  }

  async createTransaction(ctx) {
    const planData = this.planTypes[ctx.request.body.planType];
    if (!planData) {
      ctx.status = 400;
      ctx.body = 'invalid plan type provided';
      return;
    }
    const quoteCurrency = 'usd';
    const baseCurrency = ctx.request.body.baseCurrency ? ctx.request.body.baseCurrency.toLowerCase() : 'btc';
    const user = await ctx.mongo.db(process.env.TORULA_MONGODB_NAME)
      .collection('accounts')
      .findOne({
        _id: ObjectId(ctx.state.user._id)
      });
    const tOptions = {
      currency1: quoteCurrency,
      currency2: baseCurrency,
      amount: planData.amount,
      buyer_email: user.email
    };
    ctx.request.body = await client.createTransaction(tOptions);
    const qrBuffer = await rp.get({
      uri: ctx.request.body.qrcode_url,
      encoding: null
    });
    delete ctx.request.body.qrcode_url;
    ctx.request.body.qrcode = qrBuffer.toString('base64');
    ctx.request.body.quoteCurrency = quoteCurrency;
    ctx.request.body.baseCurrency = baseCurrency;
    ctx.request.body.planType = planData;
    ctx.request.body.status = '0';
    await this.post(ctx);
  }

  async checkTransaction(ctx) {
    // get matching transaction
    console.log(ctx.request);
    console.log(ctx.request.body);
    const transaction = await ctx.mongo
      .db(process.env.TORULA_MONGODB_NAME)
      .collection(this.collection)
      .findOne({
        txn_id: ctx.request.body.txn_id
      });
    if (transaction && transaction.status === '0') {
      if (ctx.request.body.status === '1') {
        // get user that is subscribing
        const user = await ctx.mongo.db(process.env.TORULA_MONGODB_NAME)
          .collection('accounts')
          .findOne({
            _id: transaction.createdBy
          });
        // top up expiration date
        let expDate = new Date();
        if (user.expiresAt) {
          const expiresAt = new Date(user.expiresAt);
          // only top up expiresAt if its greater than the current date
          if (expiresAt > expDate) {
            expDate = expiresAt;
          }
        }
        const newTime = expDate.getSeconds() + transaction.planType.subscriptionLength;
        expDate = new Date(expDate.setSeconds(newTime));
        await ctx.mongo
          .db(process.env.TORULA_MONGODB_NAME)
          .collection('accounts')
          .updateOne({
            _id: transaction.createdBy
          }, {
            $set: {
              expiresAt: expDate.toISOString(),
              updatedAt: new Date().toISOString()
            }
          });
      }
      // update transaction status
      ctx.body = await ctx.mongo
        .db(process.env.TORULA_MONGODB_NAME)
        .collection(this.collection)
        .updateOne({
          txn_id: ctx.request.body.txn_id
        }, {
          $set: {
            status: ctx.request.body.status.toString(),
            updatedAt: new Date().toISOString()
          }
        });
    } else {
      ctx.status = 500;
      ctx.body = 'transaction already completed, wasn\'t completed, or doesn\'t exist';
    }
  }
}

module.exports = Transactions;
