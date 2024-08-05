import fastify from 'fastify'
import fastifyFormBody from '@fastify/formbody'

const app = fastify({
    ignoreDuplicateSlashes: true,
    ignoreTrailingSlash: true,
    logger: true
})

app.register(fastifyFormBody)

app.listen({ port: 7000 }, err => {
    if (err) {
        app.log.error(err)
        process.exit(1)
    }
})
