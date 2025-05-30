# 🦄 DegenLingo

> Learn like a duelist, earn like a degenerate.
> A Duolingo‑style language app powered by Solana, NeonDB, Stripe & more!

---

## 🚀 Why DegenLingo?

Whether you're stacking sats, stacking tokens, or stacking vocab, DegenLingo is your one‑stop Web3‑infused language playground. Level up your language skills while minting NFTs, earning tokens for progress, and celebrating every win with confetti! 🎉

---

## ✨ Key Features

- **Interactive Lessons**
  Bite‑sized exercises, progress bars, and confetti celebrations for each milestone (`react-circular-progressbar`, `react-confetti`, `sonner`).
- **Dual‑Mode Payments**
  Accept both Stripe (fiat) and Solana (crypto) for premium packs and in‑app purchases.
- **On‑Chain Badge Minting**
  Early adopters earn exclusive NFT badges via Metaplex as proof of OG status.
- **Token Rewards**
  Earn native tokens for lesson completions, streaks, and special challenges—redeemable for perks or swapped on-chain.
- **Serverless NeonDB + Drizzle ORM**
  Lightning‑fast data storage with zero‑config migrations & Drizzle Studio UI (`drizzle-kit`, `@neondatabase/serverless`).
- **Solana Wallet Login**
  Connect your Phantom or Solflare wallet in one click using `@solana/wallet-adapter-react` + `@wallet-adapter-wallets`.
- **Clerk Authentication**
  Magic links, OAuth, and passwordless flows (`@clerk/nextjs`).
- **Admin Dashboard**
  Spin up a React‑Admin panel in seconds to manage users, content, tokens, and badge drops (`react-admin`, `ra-data-simple-rest`).
- **Dark/Light Themes**
  Toggle between cozy dark mode or bright light mode with `next-themes`.
- **TypeScript & Next.js 15**
  Future‑proof stack with the latest Next.js turbo‑charged capabilities.

---

## 🛠️ Tech Stack

| Layer            | Tech / Library                                |
| ---------------- | --------------------------------------------- |
| Framework        | Next.js 15, React 19                          |
| Styling          | Tailwind CSS 4, `tailwind-merge`, Animate.css |
| State Management | Zustand                                       |
| ORM & DB         | Drizzle ORM + migrations/seeds, NeonDB        |
| Web3             | Solana Web3.js, Metaplex UMI, UMI adapters    |
| Payments         | Stripe, Solana Program payments               |
| Auth             | Clerk                                         |
| Admin UI         | React Admin + Simple REST provider            |
| Notifications    | Sonner                                        |
| Logging          | Winston                                       |
| Misc             | Confetti, Progress Bars, CVA, clsx            |

---

## 🏗️ Installation & Setup

1. **Clone & install**

   ```bash
   git clone https://github.com/KitsuneKode/degenlingo.git
   cd degenlingo
   bun install       # or `npm install` / `yarn`
   ```

2. **Environment Variables**
   Create a `.env` at project root with:

   ```env
   DATABASE_URL=…         # NeonDB connection string
   CLERK_SECRET=…         # Clerk API key
   NEXT_PUBLIC_CLERK=…    # Clerk frontend key
   STRIPE_SECRET_KEY=…    # Stripe secret key
   SOLANA_RPC_URL=…       # (optional) custom Solana RPC endpoint
   TOKEN_MINT_ADDRESS=…   # Your SPL token mint for rewards
   NFT_COLLECTION=…       # Metaplex candy machine or collection ID
   ```

3. **Generate & Migrate DB**

   ```bash
   bun run db:generate    # produce Drizzle definitions
   bun run db:migrate     # apply latest migrations
   bun run db:seed        # seed with sample lessons & users
   ```

4. **Run Locally**

   ```bash
   bun dev                # http://localhost:3000
   bun run db:studio      # Drizzle Studio at http://localhost:8080
   ```

5. **Build & Start**

   ```bash
   bun run build
   bun start
   ```

---

## 🧙‍♂️ Contributing

We ❤️ community magic! To join:

1. Fork the repo
2. Create a branch: `git checkout -b fix/amazing-feature`
3. Commit: `git commit -m "feat: add pirate mode"`
4. Push & open a PR!

Run `bun run format` & `bun run lint` before each PR.

---

## 📦 Scripts Overview

| Script              | Description                       |
| ------------------- | --------------------------------- |
| `dev`               | Start Next dev server             |
| `build`             | Compile & optimize for production |
| `start`             | Run the built app                 |
| `lint`              | Run ESLint checks                 |
| `format`            | Run Prettier formatting           |
| `db:generate`       | Generate Drizzle ORM types        |
| `db:migrate`        | Apply DB migrations               |
| `db:seed`           | Seed the database                 |
| `db:studio`         | Launch Drizzle Studio UI          |
| `db:reset`          | Drop & reset DB                   |
| ~~`deploy:vercel`~~ | ~~Deploy to Vercel~~ (autodeploy) |

---

## 🚀 Deploying

### Vercel

1. Link your GitHub repo to Vercel
2. Add environment variables in Vercel dashboard
3. Push to `main` → automatic builds & deploys

---

### Future Plans

#### Docker

```bash
docker build -t degenlingo .
docker-compose up
```

---

## 🎉 Early Adopter Rewards

- **NFT Badge Mint**: First 500 sign-ups get an exclusive on-chain badge!
- **Token Airdrop**: Milestone-based token distributions—complete 10 lessons to unlock your first token batch.

---

## 👑 License & Code of Conduct

- **License**: MIT
- **Code of Conduct**: Be awesome to each other. No rug pulls allowed!

---

## ✉️ Stay in Touch

Built with 🦊 by [KitsuneKode](mailto:bhuyanmanash2002@gmail.com).
Questions, feedback, or degen memes? Open an Issue or DM me!

> “To learn a language is to have one more window from which to look at the world.”
> And one more wallet to connect, of course. 😉
