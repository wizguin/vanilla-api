import { validateColor, validateEmail, validateName, validatePassword } from '../user/Validation'
import { buildError } from '../response/Response'
import { createUser } from '../user/User'
import { InvalidJoinError } from '../errors/Errors'

import type { FastifyInstance } from 'fastify'

export default async function(app: FastifyInstance) {
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
    }>('/join.php', async(request, reply) => {
        try {
            const body = request.body

            const username = await validateName(body.Username)
            const email = validateEmail(body.Email)
            const password = validatePassword(body.Password)
            const color = validateColor(body.Colour)

            await createUser({
                username,
                email,
                password,
                color
            })

            reply.send(buildError(0))

        } catch (error) {
            if (error instanceof InvalidJoinError) {
                reply.send(error.response)

            } else {
                console.log(error)

                reply.callNotFound()
            }
        }
    })
}
