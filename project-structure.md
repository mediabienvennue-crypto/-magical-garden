# Magical Garden — Next.js Project Structure

Designed so adding a new level/stage never requires new folders or routes —
everything routes through dynamic segments driven by the `levels` / `subjects` tables.

```
magical-garden/
├── app/
│   ├── (marketing)/
│   │   ├── page.tsx                      # Public landing page
│   │   └── layout.tsx
│   │
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx             # Parent signup
│   │   └── onboarding/
│   │       ├── page.tsx                  # Psychological onboarding quiz entry
│   │       └── steps/
│   │           ├── name-age.tsx
│   │           ├── hobbies.tsx
│   │           ├── favorite-fruit.tsx
│   │           ├── dream-job.tsx
│   │           └── review.tsx
│   │
│   ├── (dashboard)/
│   │   ├── layout.tsx                    # <-- DashboardLayout with 2 ad slots (see file 3)
│   │   ├── garden/
│   │   │   └── page.tsx                  # "My Magical Garden" — all subject trees
│   │   ├── subjects/
│   │   │   └── [subjectSlug]/
│   │   │       ├── page.tsx              # Tree detail + chapters list
│   │   │       └── chapters/
│   │   │           └── [chapterId]/
│   │   │               ├── study/page.tsx    # 20-min Study Mode
│   │   │               └── quiz/page.tsx     # Interactive quiz
│   │   ├── reward/
│   │   │   └── page.tsx                  # 5-7 min Mini-Game Reward Mode (locked/unlocked by timer state)
│   │   ├── forum/
│   │   │   └── page.tsx                  # Student forum (triggers Rain Animation)
│   │   ├── profile/
│   │   │   └── page.tsx
│   │   └── parent/
│   │       ├── page.tsx                  # Parent dashboard: tree health overview
│   │       ├── subscription/
│   │       │   ├── page.tsx              # Status + grace period banner
│   │       │   └── upload-receipt/page.tsx
│   │       └── settings/page.tsx
│   │
│   ├── (admin)/
│   │   ├── layout.tsx
│   │   ├── stages/page.tsx               # CRUD educational_stages
│   │   ├── levels/page.tsx               # CRUD levels (add Primary 1-5, Middle, High here)
│   │   ├── subjects/page.tsx             # CRUD subjects
│   │   ├── chapters/[levelSubjectId]/page.tsx
│   │   └── subscriptions/page.tsx        # Review uploaded receipts
│   │
│   ├── api/
│   │   ├── webhooks/
│   │   │   └── payment-reminder/route.ts # 48h reminder cron trigger
│   │   ├── ai/
│   │   │   ├── motivational-tip/route.ts # dream-job-based tips
│   │   │   └── generate-podcast/route.ts # NotebookLM pipeline trigger
│   │   └── cron/
│   │       └── check-subscriptions/route.ts
│   │
│   └── globals.css
│
├── components/
│   ├── garden/
│   │   ├── SubjectTree.tsx               # SVG tree, health-state driven (fill-amber-600 etc.)
│   │   ├── RainAnimation.tsx             # Framer Motion rain/XP effect
│   │   ├── FruitAsset.tsx                # Renders child's favorite fruit
│   │   └── TreeHealthBadge.tsx
│   ├── study-loop/
│   │   ├── StudyTimer.tsx                # 20/5-7/30 min countdown engine
│   │   ├── StudyModeScreen.tsx
│   │   ├── RewardModeGate.tsx
│   │   └── LockScreen.tsx                # 30-min cap lock + parent notification trigger
│   ├── onboarding/
│   │   └── OnboardingQuizCard.tsx
│   ├── ads/
│   │   ├── TopBannerSlot.tsx
│   │   └── SidebarBannerSlot.tsx
│   ├── subscription/
│   │   └── SubscriptionStatusBanner.tsx
│   └── ui/                               # shared buttons, inputs, modals (shadcn-style)
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                     # browser client
│   │   ├── server.ts                     # server component / route handler client
│   │   └── middleware.ts
│   ├── subscription/
│   │   └── getSubscriptionState.ts       # mirrors get_subscription_state() SQL fn
│   ├── trees/
│   │   └── getTreeHealth.ts              # mirrors get_tree_health() SQL fn
│   └── ai/
│       └── motivationalTips.ts
│
├── hooks/
│   ├── useStudyTimer.ts
│   ├── useSubjectTrees.ts
│   └── useSubscriptionStatus.ts
│
├── types/
│   ├── database.types.ts                 # generated via `supabase gen types typescript`
│   └── domain.ts                         # Level, Subject, Tree, OnboardingProfile, etc.
│
├── middleware.ts                         # gates access based on subscription_state
├── tailwind.config.ts
└── package.json
```

## Why this scales

- **No hardcoded grade routes.** `/subjects/[subjectSlug]` + a `levelId` pulled from the
  logged-in student's `students.level_id` means adding "Primary 3" is a database insert,
  not a new folder.
- **Admin panel drives curriculum.** New stages/levels/subjects/chapters are created through
  `(admin)` routes that write to the dynamic tables — zero redeploys needed to add content.
- **`middleware.ts`** reads `parent_subscription_status` view once per request to decide
  whether core subjects should render locked + ads active, keeping the Day-8/Day-30 logic
  in one place instead of scattered across pages.
