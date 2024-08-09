require('dotenv').config(); // Load environment variables from .env file
const mongoose = require('mongoose');
const Issue = require('./models'); // Adjust path if needed

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

const seedDB = async () => {
  await connectDB();

  try {
    // Example of adding new data
    const issues = [
      {
        issue_title: 'Test Issue 1',
        issue_text: 'This is the first test issue',
        created_by: 'User1',
        assigned_to: 'Assignee1',
        status_text: 'Open',
      },
      {
        issue_title: 'Test Issue 2',
        issue_text: 'This is the second test issue',
        created_by: 'User2',
        assigned_to: 'Assignee2',
        status_text: 'Closed',
      },
    ];

    // Check if the issue already exists before adding
    for (const issueData of issues) {
      const existingIssue = await Issue.findOne({ issue_title: issueData.issue_title });
      if (!existingIssue) {
        await Issue.create(issueData);
        console.log(`Created new issue: ${issueData.issue_title}`);
      } else {
        console.log(`Issue already exists: ${issueData.issue_title}`);
      }
    }

    console.log('Database seeded successfully');
  } catch (err) {
    console.error('Error seeding database:', err.message);
  } finally {
    mongoose.connection.close();
  }
};

seedDB();
