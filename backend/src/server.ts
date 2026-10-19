import { env } from './env'
import express from 'express'
import cors from 'cors'
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import { typeDefs } from './graphql/typeDefs'
import { resolvers } from './graphql/resolvers'
import { buildContext, type Context } from './context'

async function main() {
  const server = new ApolloServer<Context>({ typeDefs, resolvers })
  await server.start()

  const app = express()
  const origin = env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(',').map((o) => o.trim())

  app.use(cors({ origin }))
  app.get('/health', (_, res) => {
    res.json({ status: 'ok' })
  })
  app.use('/graphql', express.json(), expressMiddleware(server, { context: buildContext }))

  app.listen(env.PORT, () => {
    console.log(`🚀 Financy API ready at http://localhost:${env.PORT}/graphql`)
  })
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
