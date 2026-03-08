import mongoose from 'mongoose';
import log from '../logger';

// Import models BEFORE connecting to MongoDB
// import '../model/parent.model';
// import '../model/student.model';
// import '../model/invoice.model';
// import '../model/fee.model'; 
// import '../model/class.model'; 
// import '../model/sundry-item.model'; 
// import '../model/check-in.model'
// import '../model/business.model's

export const connectToDatabase = async () => {
    try {
        if (mongoose.connection.readyState === 1) {
            log.warn('Worker: Already connected to MongoDB');
            return;
        }

        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/scanserve', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        // Fix ensureIndex deprecation warning
        mongoose.set('useCreateIndex', true);

        log.info('Worker: MongoDB connected');
    } catch (error) {
        log.error('Worker: MongoDB connection error:', error);
        process.exit(1); // Exit worker process if DB connection fails
    }
};

export default connectToDatabase;
