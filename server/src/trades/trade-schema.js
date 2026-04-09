import mongoose from 'mongoose'

const { Schema } = mongoose

const allowedSides = ['long', 'short']
const allowedStatuses = ['planned', 'open', 'closed', 'cancelled']

const tradeSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    index: true,
  },
  symbol: {
    type: String,
    trim: true,
    uppercase: true,
    default: '',
  },
  market: {
    type: String,
    trim: true,
    default: '',
  },
  side: {
    type: String,
    enum: allowedSides,
    default: 'long',
  },
  status: {
    type: String,
    enum: allowedStatuses,
    default: 'planned',
  },
  strategy: {
    type: String,
    trim: true,
    default: '',
  },
  timeframe: {
    type: String,
    trim: true,
    default: '',
  },
  session: {
    type: String,
    trim: true,
    default: '',
  },
  entryPrice: {
    type: Number,
    default: null,
  },
  stopLoss: {
    type: Number,
    default: null,
  },
  takeProfit: {
    type: Number,
    default: null,
  },
  exitPrice: {
    type: Number,
    default: null,
  },
  quantity: {
    type: Number,
    default: null,
    min: 0,
  },
  riskAmount: {
    type: Number,
    default: null,
    min: 0,
  },
  realizedPnl: {
    type: Number,
    default: null,
  },
  fees: {
    type: Number,
    default: 0,
    min: 0,
  },
  conviction: {
    type: Number,
    default: null,
    min: 1,
    max: 5,
  },
  tags: {
    type: [String],
    default: [],
  },
  screenshotUrl: {
    type: String,
    default: '',
    trim: true,
  },
  setupNotes: {
    type: String,
    default: '',
    trim: true,
  },
  reviewNotes: {
    type: String,
    default: '',
    trim: true,
  },
  openedAt: {
    type: Date,
    default: Date.now,
  },
  closedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
})

tradeSchema.index({
  userId: 1,
  openedAt: -1,
  createdAt: -1,
})

export { allowedSides, allowedStatuses }
export default mongoose.model('Trade', tradeSchema)
