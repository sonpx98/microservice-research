const mongoose = require('mongoose');

const uri = 'mongodb://user:password@127.0.0.1:27017/pikaflow?authSource=admin';

const readingSchema = new mongoose.Schema({
    title: String,
    level: String,
    topic: String
});
const Reading = mongoose.model('Reading', readingSchema);

async function check() {
    try {
        await mongoose.connect(uri);
        console.log('Connected to DB');
        const count = await Reading.countDocuments();
        console.log(`Total Readings: ${count}`);
        if (count > 0) {
            const sample = await Reading.findOne();
            console.log('Sample:', sample);
        }
    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

check();
