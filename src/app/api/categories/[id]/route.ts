import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()

  try {
    const updated = await prisma.category.update({
      where: { id, userId: session.user.id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.color && { color: body.color }),
        ...(body.icon && { icon: body.icon }),
        ...(body.description !== undefined && { description: body.description }),
      },
    })

    return NextResponse.json({ category: updated })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const { searchParams } = new URL(req.url)
  const reassignToId = searchParams.get('reassignTo')

  try {
    if (reassignToId) {
      await prisma.task.updateMany({
        where: { categoryId: id, userId: session.user.id },
        data: { categoryId: reassignToId },
      })
    }

    await prisma.category.delete({
      where: { id, userId: session.user.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}
