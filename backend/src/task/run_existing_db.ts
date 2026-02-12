import mongoose from 'mongoose';
import connectDB from '../config/db';
import model_managed_asset from '../models/model_managed_asset';
import { eLog } from '../utils/util';

const run = async () => {
    try {
        await connectDB();
        const result = await model_managed_asset.updateMany(
            {
                "config.blockBadWordsEnabled": { $exists: false },
                "config.badWords": { $exists: false }
            },
            {
                $set: {
                    "config.badWords": [],
                    "config.blockBadWordsEnabled": false
                }
            }
        );
        eLog('Update result:', result);
    } catch (error) {
        eLog('Error updating documents:', error);
    } finally {
        await mongoose.disconnect();
        eLog('Disconnected from MongoDB.');
    }
};

run();
