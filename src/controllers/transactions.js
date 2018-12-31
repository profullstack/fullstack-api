const Controller = require('./controller');
const Coinpayments = require('coinpayments');
const ObjectId = require('mongodb').ObjectId;

const options = {
  key: process.env.COINPAYMENTS_KEY,
  secret: process.env.COINPAYMENTS_SECRET
};

const client = new Coinpayments(options);

class Transactions extends Controller {
  constructor() {
    super();
    this.collection = 'transactions';
  }

  async createTransaction(ctx) {
    const user = await ctx.db.collection('accounts')
      .findOne({
        _id: ObjectId(ctx.state.user._id)
      });
    const tOptions = {
      currency1: 'usd',
      currency2: 'btc',
      amount: 4,
      buyer_email: user.email
    };
    ctx.request.body = await client.createTransaction(tOptions);
    ctx.request.body.status = '0';
    await this.post(ctx);
  }

  async checkTransaction(ctx) {
    // get matching transaction, TODO: check txn_id in body
    const transaction = await ctx.db.collection(this.collection).findOne({
      txn_id: ctx.request.body.txn_id
    });
    // TODO: check status in body
    if (transaction && transaction.status === '0') {
      if (ctx.request.body.status === '1') {
        // get user that is subscribing
        const user = await ctx.db.collection('accounts').findOne({
          _id: transaction.createdBy
        });
        // top up expiration date
        let expDate = user.expiresAt ? new Date(user.expiresAt) : new Date();
        expDate = new Date(expDate.setFullYear(expDate.getFullYear() + 1));
        await ctx.db.collection('accounts').updateOne({
          _id: transaction.createdBy
        }, {
          $set: {
            expiresAt: expDate.toISOString(),
            updatedAt: new Date().toISOString()
          }
        });
      }
      // update transaction status
      ctx.body = await ctx.db.collection(this.collection).updateOne({
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
