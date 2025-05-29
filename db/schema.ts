import { relations } from 'drizzle-orm'
import { MAX_HEARTS } from '@/lib/constants'
import {
  integer,
  pgEnum,
  pgTable,
  boolean,
  serial,
  text,
  decimal,
  timestamp,
} from 'drizzle-orm/pg-core'

export const courses = pgTable('courses', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  imageSrc: text('imageSrc').notNull(),
})

export const courseRelations = relations(courses, ({ many }) => ({
  userProgress: many(userProgress),
  units: many(units),
}))

export const units = pgTable('units', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  courseId: integer('course_id')
    .references(() => courses.id, { onDelete: 'cascade' })
    .notNull(),
  order: integer('order').notNull(),
  nft: text('nft').notNull(),
  nftMetadata: text('nft_metadata').notNull(),
  nftImageSrc: text('nft_image_src').notNull(),
})

export const unitRelations = relations(units, ({ one, many }) => ({
  course: one(courses, {
    fields: [units.courseId],
    references: [courses.id],
  }),
  lessons: many(lessons),
  redeemedBy: many(userRedeemedNfts),
}))

export const lessons = pgTable('lessons', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  unitId: integer('unit_id')
    .references(() => units.id, { onDelete: 'cascade' })
    .notNull(),
  order: integer('order').notNull(),
})

export const lessonRelations = relations(lessons, ({ one, many }) => ({
  unit: one(units, {
    fields: [lessons.unitId],
    references: [units.id],
  }),
  challenges: many(challenges),
}))

export const challengesEnum = pgEnum('type', ['SELECT', 'ASSIST'])

export const challenges = pgTable('challenges', {
  id: serial('id').primaryKey(),
  lessonId: integer('lesson_id')
    .references(() => lessons.id, { onDelete: 'cascade' })
    .notNull(),
  type: challengesEnum('type').notNull(),
  question: text('question').notNull(),
  order: integer('order').notNull(),
})

export const challengeRelations = relations(challenges, ({ one, many }) => ({
  lesson: one(lessons, {
    fields: [challenges.lessonId],
    references: [lessons.id],
  }),
  challengeOptions: many(challengeOptions),
  challengeProgress: many(challengeProgress),
}))

export const challengeOptions = pgTable('challenge_options', {
  id: serial('id').primaryKey(),
  challengeId: integer('challenge_id')
    .references(() => challenges.id, { onDelete: 'cascade' })
    .notNull(),
  text: text('text').notNull(),
  correct: boolean('correct').notNull(),
  imgSrc: text('img_src'),
  audioSrc: text('audio_src'),
})

export const challengeOptionsRelations = relations(
  challengeOptions,
  ({ one }) => ({
    challenge: one(challenges, {
      fields: [challengeOptions.challengeId],
      references: [challenges.id],
    }),
  }),
)
export const challengeProgress = pgTable('challenge_progress', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  challengeId: integer('challenge_id')
    .references(() => challenges.id, { onDelete: 'cascade' })
    .notNull(),
  completed: boolean('completed').notNull().default(false),
})

export const challengeProgressRelations = relations(
  challengeProgress,
  ({ one }) => ({
    challenge: one(challenges, {
      fields: [challengeProgress.challengeId],
      references: [challenges.id],
    }),
  }),
)

export const userProgress = pgTable('user_progress', {
  userId: text('user_id').primaryKey(),
  userName: text('user_name').notNull().default('User'),
  userImageSrc: text('user_name_src').notNull().default('/mascot.svg'),
  activeCourseId: integer('active_course_id').references(() => courses.id, {
    onDelete: 'cascade',
  }),
  hearts: integer('hearts').notNull().default(MAX_HEARTS),
  points: integer('points').notNull().default(0),
  tokens: integer('tokens').notNull().default(0),
  walletAddress: text('wallet_address'),
})

export const userProgressRelations = relations(
  userProgress,
  ({ one, many }) => ({
    activeCourse: one(courses, {
      fields: [userProgress.activeCourseId],
      references: [courses.id],
    }),
    redeemedNfts: many(userRedeemedNfts),
    subscription: one(userSubscription, {
      fields: [userProgress.userId],
      references: [userSubscription.userId],
    }),
  }),
)

export const userRedeemedNfts = pgTable('user_redeemed_nfts', {
  id: serial('id').primaryKey(),
  userId: text('user_id')
    .references(() => userProgress.userId, { onDelete: 'cascade' })
    .notNull(),
  unitId: integer('unit_id')
    .references(() => units.id, { onDelete: 'cascade' })
    .notNull(),
  mintAddress: text('mint_address').notNull(),
  transactionSignature: text('transaction_signature').notNull(),
  redeemedAt: timestamp('redeemed_at').defaultNow().notNull(),
})

export const userRedeemedNftsRelations = relations(
  userRedeemedNfts,
  ({ one }) => ({
    user: one(userProgress, {
      fields: [userRedeemedNfts.userId],
      references: [userProgress.userId],
    }),
    unit: one(units, {
      fields: [userRedeemedNfts.unitId],
      references: [units.id],
    }),
  }),
)

//only stripe based
// export const userSubscription = pgTable('user_subscription', {
//   id: serial('id').primaryKey(),
//   userId: text('user_id').notNull().unique(),
//   stripeCustomerId: text('stripe_customer_id').notNull().unique(),
//   stripeSubscriptionId: text('stripe_subscription_id').notNull().unique(),
//   stripePriceId: text('stripe_price_id').notNull(),
//   stripeCurrentPeriodEnd: timestamp('stripe_current_period_end').notNull(),
// })

// ✅ Payment method enum
export const paymentMethodEnum = pgEnum('payment_method', ['stripe', 'solana'])

export const subscriptionStatusEnum = pgEnum('subscription_status', [
  'active',
  'cancelled',
  'expired',
  'pending',
])

export const userSubscription = pgTable('user_subscription', {
  id: serial('id').primaryKey(),

  userId: text('user_id')
    .notNull()
    .references(() => userProgress.userId, { onDelete: 'cascade' }),

  paymentMethod: paymentMethodEnum('payment_method').notNull(),

  // optional reference to plan metadata
  // pricingPlanId: integer('pricing_plan_id').references(() => pricingPlans.id, {
  //   onDelete: 'set null',
  // }),

  // common subscription state
  subscriptionStatus: subscriptionStatusEnum('subscription_status')
    .notNull()
    .default('pending'),
  subscriptionStart: timestamp('subscription_start').defaultNow().notNull(),
  subscriptionEnd: timestamp('subscription_end').notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const userSubscriptionRelations = relations(
  userSubscription,
  ({ one }) => ({
    user: one(userProgress, {
      fields: [userSubscription.userId],
      references: [userProgress.userId],
    }),
    //   pricingPlan: one(pricingPlans, {
    //     fields: [userSubscription.pricingPlanId],
    //     references: [pricingPlans.id],
    //   }),
  }),
)

// ─────────────────────────────────────────────────────────────────────────────
// 2) Stripe-specific details (1:1)
// ─────────────────────────────────────────────────────────────────────────────

export const stripeSubscriptionDetails = pgTable(
  'stripe_subscription_details',
  {
    id: serial('id').primaryKey(),

    userSubscriptionId: integer('user_subscription_id')
      .notNull()
      .unique()
      .references(() => userSubscription.id, { onDelete: 'cascade' }),

    stripeCustomerId: text('stripe_customer_id').notNull(),
    stripeSubscriptionId: text('stripe_subscription_id').notNull(),
    stripePriceId: text('stripe_price_id').notNull(),
    stripeCurrentPeriodEnd: timestamp('stripe_current_period_end').notNull(),
  },
)

export const stripeSubscriptionRelations = relations(
  stripeSubscriptionDetails,
  ({ one }) => ({
    subscription: one(userSubscription, {
      fields: [stripeSubscriptionDetails.userSubscriptionId],
      references: [userSubscription.id],
    }),
  }),
)

// ─────────────────────────────────────────────────────────────────────────────
// 3) Solana-specific details (1:1)
// ─────────────────────────────────────────────────────────────────────────────
export const solanaSubscriptionDetails = pgTable(
  'solana_subscription_details',
  {
    id: serial('id').primaryKey(),

    userSubscriptionId: integer('user_subscription_id')
      .notNull()
      .unique()
      .references(() => userSubscription.id, { onDelete: 'cascade' }),

    reference: text('reference').notNull(),
    solanaWalletAddress: text('solana_wallet_address').notNull(),
    solanaTransactionSignature: text('solana_transaction_signature').notNull(),
    solanaTokenAmount: decimal('solana_token_amount', {
      precision: 20,
      scale: 9,
    }).notNull(),
    solanaTransactionStatus: text('solana_transaction_status').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
)

export const solanaSubscriptionRelations = relations(
  solanaSubscriptionDetails,
  ({ one }) => ({
    subscription: one(userSubscription, {
      fields: [solanaSubscriptionDetails.userSubscriptionId],
      references: [userSubscription.id],
    }),
  }),
)

// ─────────────────────────────────────────────────────────────────────────────
// 4) Payment history for audit trail and Pricing Plans (totally for future plans only)
// ─────────────────────────────────────────────────────────────────────────────

// // ✅ Payment history for audit trail
// export const paymentHistory = pgTable('payment_history', {
//   id: serial('id').primaryKey(),
//   userId: text('user_id')
//     .references(() => userProgress.userId, { onDelete: 'cascade' })
//     .notNull(),

//   paymentMethod: paymentMethodEnum('payment_method').notNull(),

//   // Stripe payment details
//   stripePaymentIntentId: text('stripe_payment_intent_id'),
//   stripeAmount: integer('stripe_amount'), // in cents
//   stripeCurrency: text('stripe_currency'),

//   // Solana payment details
//   solanaTransactionSignature: text('solana_transaction_signature'),
//   solanaFromAddress: text('solana_from_address'),
//   solanaToAddress: text('solana_to_address'),
//   solanaAmount: decimal('solana_amount', { precision: 20, scale: 9 }),
//   solanaTokenMint: text('solana_token_mint'), // SOL, USDC, etc.

//   // Common fields
//   status: text('status').notNull(), // 'pending', 'completed', 'failed'
//   description: text('description').notNull(),
//   createdAt: timestamp('created_at').defaultNow().notNull(),
// })

// export const paymentHistoryRelations = relations(paymentHistory, ({ one }) => ({
//   user: one(userProgress, {
//     fields: [paymentHistory.userId],
//     references: [userProgress.userId],
//   }),
// }))

// // ✅ Pricing plans table
// export const pricingPlans = pgTable('pricing_plans', {
//   id: serial('id').primaryKey(),
//   name: text('name').notNull(), // "Monthly Premium", "Yearly Premium"
//   description: text('description').notNull(),

//   // Stripe pricing
//   stripePriceId: text('stripe_price_id'),
//   stripeAmount: integer('stripe_amount'), // in cents
//   stripeCurrency: text('stripe_currency'),

//   // Solana pricing
//   solanaAmount: decimal('solana_amount', { precision: 20, scale: 9 }),
//   solanaTokenMint: text('solana_token_mint').default('SOL'),

//   // Plan details
//   durationDays: integer('duration_days').notNull(), // 30 for monthly, 365 for yearly
//   features: text('features').array().notNull(), // JSON array of features
//   isActive: boolean('is_active').notNull().default(true),

//   createdAt: timestamp('created_at').defaultNow().notNull(),
//   updatedAt: timestamp('updated_at').defaultNow().notNull(),
// })
