const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const Application = require('./models/Application');

async function migrationCloudinaryToLocal() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    const applications = await Application.find({
      resumeUrl: { $regex: 'cloudinary.com' }
    });

    if (applications.length === 0) {
      console.log('✓ No Cloudinary URLs found. Database already migrated or no uploads yet.');
      await mongoose.connection.close();
      return;
    }

    console.log(`Found ${applications.length} applications with Cloudinary URLs`);

    let migrated = 0;
    let errors = 0;

    for (const app of applications) {
      try {
        
        const urlMatch = app.resumeUrl.match(/resumes\/(resume_[^\/]+\.pdf)/);
        const filename = urlMatch ? urlMatch[1] : `resume_${app._id}_${Date.now()}.pdf`;

        // Update the application with new local filename
        app.resumeUrl = filename;
        await app.save();

        migrated++;
        console.log(`✓ Migrated: ${app._id} → ${filename}`);
      } catch (error) {
        errors++;
        console.error(`✗ Error migrating ${app._id}:`, error.message);
      }
    }

    console.log(`\n=== Migration Summary ===`);
    console.log(`Successfully migrated: ${migrated}/${applications.length}`);
    if (errors > 0) {
      console.log(`Errors encountered: ${errors}`);
    }

    await mongoose.connection.close();
    console.log('✓ Database connection closed');

  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

migrationCloudinaryToLocal();
