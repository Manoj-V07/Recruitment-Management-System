const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
    {
        jobId : {
            type: mongoose.Schema.Types.ObjectId,
            ref : 'jobs',
            required : true,
        },
        candidateId : {
            type: mongoose.Schema.Types.ObjectId,
            ref : 'users',
            required : true,
        },
        status : {
            type : String,
            enum : ['applied','shortlisted','rejected'],
            default : 'applied'
        },
        resumeUrl : {
            type : String,
            required : false,
        },
        resumeFilename : {
            type : String,
            required : false,
        },
        appliedAt : {
            type : Date,
            default : Date.now,
        }
    },
    {
        timestamps : true,
    }
);

module.exports = mongoose.model('applications',applicationSchema);