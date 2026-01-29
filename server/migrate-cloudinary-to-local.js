#!/usr/bin/env node
/**
 * Database Migration Script: Cloudinary URLs to Local Filenames
 * 
 * Use this script to migrate existing Cloudinary URLs in the database
 * to the new local filename format.
 * 
 * Usage: node migrate-cloudinary-to-local.js
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const Application = require('./models/Application');

async function migrationCloudinaryToLocal() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    // Find all applications with Cloudinary URLs
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
        // Extract useful information from Cloudinary URL
        // Format: https://res.cloudinary.com/...resumes/resume_[id]_[timestamp]_[name].pdf
        
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

// Run migration
migrationCloudinaryToLocal();
