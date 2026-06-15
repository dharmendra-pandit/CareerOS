import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI
const options = {}

let client: MongoClient
let clientPromise: Promise<MongoClient> | null = null

export function getMongoClientPromise(): Promise<MongoClient> {
  if (clientPromise) {
    return clientPromise
  }

  // Fallback check to avoid crashing Next.js during build evaluation when MONGODB_URI is not set or placeholder
  if (!uri || uri === 'your_mongodb_atlas_uri_here' || (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://'))) {
    throw new Error('MONGODB_URI is not configured with a valid connection string in the .env file.')
  }

  if (process.env.NODE_ENV === 'development') {
    const globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>
    }

    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri, options)
      globalWithMongo._mongoClientPromise = client.connect()
    }
    clientPromise = globalWithMongo._mongoClientPromise
  } else {
    client = new MongoClient(uri, options)
    clientPromise = client.connect()
  }

  return clientPromise
}

export async function getDb(dbName = 'career_os') {
  const promise = getMongoClientPromise()
  const resolvedClient = await promise
  return resolvedClient.db(dbName)
}
export default getMongoClientPromise
