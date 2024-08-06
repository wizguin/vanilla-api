import Get from './routes/Get'
import Join from './routes/Join'
import Login from './routes/Login'

import fastify from 'fastify'
import fastifyFormBody from '@fastify/formbody'

const app = fastify({
    ignoreDuplicateSlashes: true,
    ignoreTrailingSlash: true,
    logger: true
})

app.register(fastifyFormBody)

const routes = [Get, Join, Login]

for (const route of routes) {
    app.register(route, { prefix: '/php' })
}

app.listen({ port: 7000 }, err => {
    if (err) {
        app.log.error(err)
        process.exit(1)
    }
})
