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
        amount: 125,
        subscriptionLength: 60 * 60 * 24 * 365,
        referralLength: 60 * 60 * 24 * 30
      },
      quarterly: {
        amount: 40,
        subscriptionLength: 60 * 60 * 24 * 90,
        referralLength: 60 * 60 * 24 * 14
      },
      monthly: {
        amount: 15,
        subscriptionLength: 60 * 60 * 24 * 30,
        referralLength: 60 * 60 * 24 * 7
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
    ctx.request.body.referred = user.referred;
    await this.post(ctx);
  }

  getStartTime(userExpiresAt) {
    let expDate = new Date();
    if (userExpiresAt) {
      const expiresAt = new Date(userExpiresAt);
      // only top up expiresAt if its greater than the current date
      if (expiresAt > expDate) {
        expDate = expiresAt;
      }
    }
    return expDate;
  }

  async getAllReferralsByUser(ctx) {
    const user = await this.getUserById(ctx);
    const transactions = await ctx.mongo
      .db(process.env.TORULA_MONGODB_NAME)
      .collection(this.collection)
      .find({ 'referred.user': user.username }).toArray();
    ctx.body = transactions;
  }

  async getAllReferrals(ctx) {
    const transactions = await ctx.mongo
      .db(process.env.TORULA_MONGODB_NAME)
      .collection(this.collection)
      .aggregate([
        {
          $match: { 'referred.user': { $ne: null }, status: '1', 'referred.reseller': true }
        },
        {
          $group: {
            _id: '$referred.user',
            totalReferredAmount: { $sum: '$planType.amount' }
          }
        }
      ]);
    const transactionArr = await transactions.toArray();
    // eslint-disable-next-line no-restricted-syntax
    for (const transaction of transactionArr) {
      // eslint-disable-next-line no-await-in-loop
      const user = await ctx.mongo
        .db(process.env.TORULA_MONGODB_NAME)
        .collection('accounts')
        .findOne({ username: transaction._id });
      transaction.btcAddress = user.btcAddress;
      transaction.paid = user.paid || 0;
      transaction.earned = transaction.totalReferredAmount * 0.20;
      transaction.remaining = transaction.earned - transaction.paid;
    }
    ctx.body = transactionArr;
  }

  async paidUser(ctx) {
    ctx.body = await ctx.mongo
      .db(process.env.TORULA_MONGODB_NAME)
      .collection('accounts')
      .findOneAndUpdate({
        username: ctx.request.body.user
      }, {
        $set: {
          paid: ctx.request.body.paid
        }
      }, {
        returnOriginal: false,
        returnNewDocument: true
      });
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
        if (user) {
          // top up expiration date
          let expDate = this.getStartTime(user.expiresAt);
          let newTime = expDate.getSeconds() + transaction.planType.subscriptionLength;
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
          // top up referrer, if they are not a reseller
          if (transaction.referred && !transaction.referred.reseller) {
            // get user that is referring
            const referrer = await ctx.mongo.db(process.env.TORULA_MONGODB_NAME)
              .collection('accounts')
              .findOne({
                username: transaction.referred.user
              });
            if (referrer) {
              // top up referrer expiration date
              expDate = this.getStartTime(referrer.expiresAt);
              newTime = expDate.getSeconds() + transaction.planType.referralLength;
              expDate = new Date(expDate.setSeconds(newTime));
              await ctx.mongo
                .db(process.env.TORULA_MONGODB_NAME)
                .collection('accounts')
                .updateOne({
                  _id: referrer._id
                }, {
                  $set: {
                    expiresAt: expDate.toISOString(),
                    updatedAt: new Date().toISOString()
                  }
                });
            }
          }
        }
      }

      const updateObj = {
        received_amount: ctx.request.body.received_amount,
        received_confirms: ctx.request.body.received_confirms,
        status_text: ctx.request.body.status_text,
        status: ctx.request.body.status,
        updatedAt: new Date().toISOString()
      };
      // update transaction status
      ctx.body = await ctx.mongo
        .db(process.env.TORULA_MONGODB_NAME)
        .collection(this.collection)
        .updateOne({
          txn_id: ctx.request.body.txn_id
        }, {
          $set: updateObj
        });
    } else {
      ctx.status = 500;
      ctx.body = 'transaction already completed, wasn\'t completed, or doesn\'t exist';
    }
  }
}

module.exports = Transactions;
