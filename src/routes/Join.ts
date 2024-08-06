import { validateColor, validateName } from '../user/User'
import { buildError } from '../response/Response'
import { createUser } from '../user/User'
import { InvalidUsernameError } from '../errors/Errors'

import type { FastifyInstance } from 'fastify'

export default async function (app: FastifyInstance) {
    app.post<{
        Body: {
            AffiliateId: string,
            NameKey: string,
            ParentHint: string,
            ParentPassword: string,
            IsSafeMode: string,
            Password: string,
            Email: string,
            Username: string,
            Colour: string,
            AgeGroup: string
        }
    }>('/join.php', async (request, reply) => {
        try {
            const body = request.body

            const name = await validateName(body.Username)
            const color = validateColor(body.Colour)

            await createUser({
                username: name,
                email: body.Email,
                password: body.Password,
                color: color
            })

            reply.send(buildError(0))

        } catch (error) {
            if (error instanceof InvalidUsernameError) {
                reply.send(error.response)

            } else {
                console.log(error)

                reply.callNotFound()
            }
        }
    })
}
