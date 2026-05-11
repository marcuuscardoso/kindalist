import { createApp } from './app'
import { env } from './infrastructure/config/env'

const app = createApp()

app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`)
})
