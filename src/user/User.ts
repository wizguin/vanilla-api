import Database from '../database/Database'
import { UserNotFoundError } from '../errors/Errors'

import { hash } from 'bcrypt'
import type { User } from '@prisma/client'

export interface CreateUser {
    username: string,
    email: string,
    password: string,
    color: number
}

export async function getUserByUsername(username: string) {
    if (!username) {
        throw new UserNotFoundError()
    }

    return getUser({ username: username })
}

export async function getUserById(id: number) {
    if (!id) {
        throw new UserNotFoundError()
    }

    return getUser({ id: id })
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

export async function createUser(data: CreateUser) {
    const passwordHash = await hash(data.password, 10)

    const user = await Database.user.create({
        data: {
            username: data.username,
            email: data.email,
            password: passwordHash,
            color: data.color
        }
    })

    await Database.inventory.create({
        data: {
            userId: user.id,
            itemId: data.color
        }
    })

    await Database.playerRoom.create({
        data: {
            userId: user.id
        }
    })
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
