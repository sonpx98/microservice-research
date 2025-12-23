module.exports = {
    async up(db, client) {
        const session = client.startSession();
        try {
            await session.withTransaction(async () => {
                const cursor = db.collection('news').find({});
                while (await cursor.hasNext()) {
                    const doc = await cursor.next();
                    if (doc.pubDate && typeof doc.pubDate === 'string') {
                        await db.collection('news').updateOne(
                            { _id: doc._id },
                            { $set: { pubDate: new Date(doc.pubDate) } },
                            { session }
                        );
                    }
                }
            });
        } finally {
            await session.endSession();
        }
    },

    async down(db, client) {
        const session = client.startSession();
        try {
            await session.withTransaction(async () => {
                const cursor = db.collection('news').find({});
                while (await cursor.hasNext()) {
                    const doc = await cursor.next();
                    if (doc.pubDate && doc.pubDate instanceof Date) {
                        await db.collection('news').updateOne(
                            { _id: doc._id },
                            { $set: { pubDate: doc.pubDate.toISOString() } },
                            { session }
                        );
                    }
                }
            });
        } finally {
            await session.endSession();
        }
    }
};
