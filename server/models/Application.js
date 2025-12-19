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