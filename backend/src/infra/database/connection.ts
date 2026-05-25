import mongoose from "mongoose"

const getMongoConfig = () => {
    const mongoUri = process.env.MONGO_URI
    const dbName = process.env.MONGODB_DB_NAME
    return { mongoUri, dbName }
}

let listenersAttached = false

const attachConnectionListeners = () => {
    if (listenersAttached) return
    listenersAttached = true

    mongoose.connection.on("error", (error) => {
        console.error("MongoDB connection error", error)
    })
}

export const connectMongo = async () => {
    if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) {
        return
    }

    const { mongoUri, dbName } = getMongoConfig()

    if (!mongoUri || !dbName) {
        console.warn("MongoDB env vars missing; skipping connection")
        return
    }

    try {
        attachConnectionListeners()
        await mongoose.connect(mongoUri, { dbName })
    } catch (error) {
        console.error("Failed to connect to MongoDB", error)
        throw error
    }
}

export const disconnectMongo = async () => {
    if (mongoose.connection.readyState === 0) {
        return
    }

    try {
        await mongoose.disconnect()
    } catch (error) {
        console.error("Failed to disconnect from MongoDB", error)
        throw error
    }
}
