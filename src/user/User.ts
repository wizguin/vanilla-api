import { UserNotFoundError } from '../errors/Errors'
import Database from '../database/Database'

import type { User } from '@prisma/client'

export async function getUserByUsername(username: string) {
    if (!username) {
        throw new UserNotFoundError()
    }

    return await getUser({ username: username })
}

export async function getUserById(id: number) {
    if (!id) {
        throw new UserNotFoundError()
    }

    return await getUser({ id: id })
}

async function getUser(where: Record<string, number | string>) {
    const user = await Database.user.findFirst({
        where: where
    })

    if (!user) {
        throw new UserNotFoundError()
    }

    return user
}

export function getCrumb(user: User) {
    const x = 0
    const y = 0
    const frame = 0
    const member = 1

    return [
        user.id,
        user.username,
        user.color,
        user.head,
        user.face,
        user.neck,
        user.body,
        user.hand,
        user.feet,
        user.flag,
        user.photo,
        x,
        y,
        frame,
        member
    ].join('|')
}
