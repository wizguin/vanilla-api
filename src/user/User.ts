import { InvalidUsernameError, UserNotFoundError } from '../errors/Errors'
import Database from '../database/Database'

import { hash } from 'bcrypt'
import type { User } from '@prisma/client'

export interface CreateUser {
    username: string,
    email: string,
    password: string,
    color: number
}

// Letters, numbers, spaces, at least one letter
const validNameRegex = /^(?=.*[a-zA-Z])[a-zA-Z0-9 ]*$/

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

export async function validateName(name: string) {
    name = name.trim().replace(/\s+/g, ' ')

    if (name.length < 4 || name.length > 12) {
        throw new InvalidUsernameError()
    }

    if (name.toLowerCase().startsWith('penguin')) {
        throw new InvalidUsernameError()
    }

    if (!validNameRegex.test(name)) {
        throw new InvalidUsernameError()
    }

    name = toTitleCase(name)

    const user = await Database.user.findFirst({
        where: {
            username: name
        }
    })

    if (user !== null) {
        throw new InvalidUsernameError()
    }

    return name
}

export function validateColor(color: string) {
    const parsed = parseInt(color)

    if (!isNaN(parsed) && parsed >= 1 && parsed <= 12) {
        return parsed
    }

    return 1
}

function toTitleCase(str: string) {
    return str.replace(/\w\S*/g, (word: string) => (
        word.charAt(0).toUpperCase() + word.substring(1).toLowerCase()
    ))
}
