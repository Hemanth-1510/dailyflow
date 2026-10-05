import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  const passwordHash = await bcrypt.hash('password123', 12)

  const user = await prisma.user.upsert({
    where: { email: 'demo@dailyflow.app' },
    update: {},
    create: {
      email: 'demo@dailyflow.app',
      name: 'Alex Johnson',
      passwordHash,
      onboardingDone: true,
      categories: {
        create: [
          { name: 'Work', color: '#6366f1', icon: 'briefcase', description: 'Deep work & client tasks' },
          { name: 'Personal', color: '#ec4899', icon: 'user', description: 'Errands & personal goals' },
          { name: 'Health', color: '#10b981', icon: 'heart', description: 'Workouts & wellness' },
          { name: 'Learning', color: '#f59e0b', icon: 'book', description: 'Courses & reading' },
        ],
      },
    },
    include: { categories: true },
  })

  console.log('Seed user created:', user.email)

  const workCat = user.categories.find((c) => c.name === 'Work')

  await prisma.task.createMany({
    data: [
      {
        userId: user.id,
        categoryId: workCat?.id,
        title: 'Review Q4 Productivity Roadmap',
        description: 'Analyze quarterly objectives and sprint priorities.',
        estimatedDuration: 45,
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        date: new Date(),
      },
      {
        userId: user.id,
        categoryId: workCat?.id,
        title: 'Submit DailyFlow architecture review',
        description: 'Finalize Next.js 15 app router structure & database schema.',
        estimatedDuration: 30,
        priority: 'URGENT',
        status: 'COMPLETED',
        completedAt: new Date(),
        date: new Date(),
      },
    ],
  })

  console.log('Seed tasks created successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
