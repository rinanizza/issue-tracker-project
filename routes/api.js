'use strict';

const mongoose = require('mongoose');
const { Issue, Project } = require('../models.js');

module.exports = function (app) {
  app.route('/api/issues/:project')
  
    .get(async function (req, res){
      let project = req.params.project;
      let filter = req.query;
      try {
        let issues = await Issue.find({ project, ...filter });
        res.json(issues);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    })
    
    .post(async function (req, res){
      let project = req.params.project;
      let { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;
      if (!issue_title || !issue_text || !created_by) {
        return res.json({ error: 'required field(s) missing' });
      }
      try {
        let issue = new Issue({
          project,
          issue_title,
          issue_text,
          created_by,
          assigned_to: assigned_to || '',
          status_text: status_text || '',
          created_on: new Date(),
          updated_on: new Date(),
          open: true,
        });
        let savedIssue = await issue.save();
        res.json(savedIssue);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    })
    
    .put(async function (req, res){
      let project = req.params.project;
      let { _id, ...updateFields } = req.body;
      if (!_id) {
        return res.json({ error: 'missing _id' });
      }
      if (!mongoose.Types.ObjectId.isValid(_id)) {
        return res.status(400).json({ error: 'could not update' }); // Corrected error message
      }
      if (Object.keys(updateFields).length === 0) {
        return res.json({ error: 'no update field(s) sent', _id });
      }
      try {
        let issue = await Issue.findByIdAndUpdate(_id, { $set: updateFields }, { new: true });
        if (!issue) {
          return res.json({ error: 'could not update', _id });
        }
        res.json({ result: 'successfully updated', _id });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    })
    
    .delete(async function (req, res){
      let project = req.params.project;
      let { _id } = req.body;
      if (!_id) {
        return res.status(400).json({ error: 'missing _id' }); // Ensure 400 status for missing _id
      }
      if (!mongoose.Types.ObjectId.isValid(_id)) {
        return res.status(400).json({ error: 'could not delete' }); // Corrected error message for invalid _id
      }
      try {
        let issue = await Issue.findByIdAndDelete(_id);
        if (!issue) {
          return res.status(400).json({ error: 'could not delete', _id }); // Ensure 400 status for delete failure
        }
        res.status(200).json({ result: 'successfully deleted', _id }); // Ensure 200 status for successful deletion
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    })
    
    
  }
