import { getCrumb, getUserByUsername } from '../user/User'
import { IncorrectPasswordError, UserNotFoundError } from '../errors/Errors'
import { buildResponse } from '../response/Response'
import Database from '../database/Database'

import { compare, hash } from 'bcrypt'
import type { FastifyInstance } from 'fastify'
import { randomBytes } from 'crypto'
import type { User } from '@prisma/client'

export default async function(app: FastifyInstance) {
    app.post<{
        Body: {
            Username: string,
            Password: string
        }
    }>('/login.php', async(request, reply) => {
        try {
            const { Username, Password } = request.body

            const user = await getUserByUsername(Username)

            await verifyPassword(user, Password)

            const loginKey = await setLoginKey(user)

            reply.send(getResponse(user, loginKey))

        } catch (error) {
            if (error instanceof IncorrectPasswordError) {
                reply.send(error.response)

            } else if (error instanceof UserNotFoundError) {
                reply.send(error.response)

            } else {
                reply.send(new UserNotFoundError().response)
            }
        }
    })
}

async function verifyPassword(user: User, password: string) {
    const match = await compare(password, user.password)

    if (!match) {
        throw new IncorrectPasswordError()
    }
}

async function setLoginKey(user: User) {
    const loginKey = randomBytes(16).toString('hex')
    const loginKeyHash = await hash(loginKey, 10)

    await Database.user.update({
        where: {
            username: user.username
        },
        data: {
            loginKey: loginKeyHash
        }
    })

    return loginKey
}

function getResponse(user: User, loginKey: string) {
    const crumb = getCrumb(user)
    const joinTime = getDateString(user.joinTime)

    return buildResponse({
        crumb: crumb,
        k1: loginKey,
        c: user.coins,
        s: 0,
        jd: joinTime,
        ed: 86400
    })
}

function getDateString(date: Date) {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()

    return `${year}-${month}-${day}`
}
