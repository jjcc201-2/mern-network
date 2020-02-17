const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI');


//Using async/await over the classic promises as it seems to be the new standard
const connectDB = async () => { 
	try {
		await mongoose.connect(db, { //as mongoose.connect returns a promise, we put it within an await
			useNewUrlParser: true,
			useUnifiedTopology: true
		});
		console.log('MongoDB Connected...');
    }
    catch (err) {
		console.error(err.message);
		// Exit process with failure
		process.exit(1);
	}
};

module.exports = connectDB;