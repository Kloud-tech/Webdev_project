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
    required: true,
    trim: true,
    uppercase: true,
  },
  market: {
    type: String,
    required: true,
    trim: true,
  },
  side: {
    type: String,
    required: true,
    enum: allowedSides,
  },
  status: {
    type: String,
    required: true,
    enum: allowedStatuses,
    default: 'planned',
  },
  strategy: {
    type: String,
    required: true,
    trim: true,
  },
  timeframe: {
    type: String,
    required: true,
    trim: true,
  },
  session: {
    type: String,
    required: true,
    trim: true,
  },
  entryPrice: {
    type: Number,
    required: true,
  },
  stopLoss: {
    type: Number,
    required: true,
  },
  takeProfit: {
    type: Number,
    required: true,
  },
  exitPrice: {
    type: Number,
    default: null,
  },
  quantity: {
    type: Number,
    required: true,
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
    required: true,
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
