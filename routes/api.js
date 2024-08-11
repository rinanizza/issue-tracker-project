"use strict";
const mongoose = require("mongoose");
const IssueModel = require("../models").Issue;
const ProjectModel = require("../models").Project;
const { Types: { ObjectId } } = mongoose; // Use mongoose.Types.ObjectId

module.exports = function (app) {
  app
  .route("/api/issues/:project")
  .get(async function (req, res) {
    let projectName = req.params.project;
    const {
      _id,
      open,
      issue_title,
      issue_text,
      created_by,
      assigned_to,
      status_text,
    } = req.query;
  
    try {
      // Create an array to build the aggregation pipeline
      const query = [
        { $match: { name: projectName } },
        { $unwind: "$issues" }
      ];
    
      // Add conditional match stages based on query parameters
      if (_id && mongoose.Types.ObjectId.isValid(_id)) {
        query.push({ $match: { "issues._id": new mongoose.Types.ObjectId(_id) } });
      }
    
      if (open !== undefined) {
        query.push({ $match: { "issues.open": open === 'true' } }); // Ensure open is compared as a boolean
      }
    
      if (issue_title) {
        query.push({ $match: { "issues.issue_title": issue_title } });
      }
    
      if (issue_text) {
        query.push({ $match: { "issues.issue_text": issue_text } });
      }
    
      if (created_by) {
        query.push({ $match: { "issues.created_by": created_by } });
      }
    
      if (assigned_to) {
        query.push({ $match: { "issues.assigned_to": assigned_to } });
      }
    
      if (status_text) {
        query.push({ $match: { "issues.status_text": status_text } });
      }
    
      // Execute the aggregation pipeline
      const data = await ProjectModel.aggregate(query);
    
      // Map the issues from each project and ensure response is an array
      const mappedData = data.flatMap(item => item.issues);
    
      // Send the response
      res.json(mappedData);
    } catch (err) {
      res.status(500).send(err.message);
    }
  })
  
    .post(async function (req, res) {
      let project = req.params.project;
      const {
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
      } = req.body;
    
      if (!issue_title || !issue_text || !created_by) {
        return res.json({ error: "required field(s) missing" });
      }
    
      const newIssue = new IssueModel({
        issue_title: issue_title || "",
        issue_text: issue_text || "",
        created_on: new Date(),
        updated_on: new Date(),
        created_by: created_by || "",
        assigned_to: assigned_to || "",
        open: true,
        status_text: status_text || "",
      });
    
      try {
        const projectdata = await ProjectModel.findOne({ name: project }).exec();
    
        if (!projectdata) {
          const newProject = new ProjectModel({ name: project });
          newProject.issues.push(newIssue);
          const savedProject = await newProject.save();
          return res.json(newIssue);
        } else {
          projectdata.issues.push(newIssue);
          const savedProject = await projectdata.save();
          return res.json(newIssue);
        }
      } catch (err) {
        res.send("There was an error saving in post");
      }
    })
    
    .put(async function (req, res) {
      let project = req.params.project;
      const {
        _id,
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
        open,
      } = req.body;
    
      if (!_id) {
        return res.json({ error: "missing _id" });
      }
    
      if (
        !issue_title &&
        !issue_text &&
        !created_by &&
        !assigned_to &&
        !status_text &&
        !open
      ) {
        return res.json({ error: "no update field(s) sent", _id: _id });
      }
    
      try {
        const projectdata = await ProjectModel.findOne({ name: project }).exec();
    
        if (!projectdata) {
          return res.json({ error: "could not update", _id: _id });
        }
    
        const issueData = projectdata.issues.id(_id);
    
        if (!issueData) {
          return res.json({ error: "could not update", _id: _id });
        }
    
        issueData.issue_title = issue_title || issueData.issue_title;
        issueData.issue_text = issue_text || issueData.issue_text;
        issueData.created_by = created_by || issueData.created_by;
        issueData.assigned_to = assigned_to || issueData.assigned_to;
        issueData.status_text = status_text || issueData.status_text;
        issueData.updated_on = new Date();
        issueData.open = open;
    
        await projectdata.save();
        res.json({ result: "successfully updated", _id: _id });
      } catch (err) {
        res.json({ error: "could not update", _id: _id });
      }
    })
    
    .delete(async function (req, res) {
      let project = req.params.project;
      const { _id } = req.body;
    
      if (!_id) {
        return res.json({ error: "missing _id" });
      }
    
      try {
        // Convert _id to ObjectId if it's valid
        const objectId = mongoose.Types.ObjectId.isValid(_id) ? new mongoose.Types.ObjectId(_id) : null;
    
        if (!objectId) {
          return res.json({ error: "could not delete" });
        }
    
        const projectdata = await ProjectModel.findOne({ name: project }).exec();
        
        if (!projectdata) {
          return res.json({ error: "could not delete", _id });
        }
    
        // Remove issue from issues array
        const initialLength = projectdata.issues.length;
        projectdata.issues = projectdata.issues.filter(issue => !issue._id.equals(objectId));
    
        if (projectdata.issues.length === initialLength) {
          return res.json({ error: "could not delete", _id });
        }
    
        await projectdata.save();
    
        res.json({ result: "successfully deleted", _id });
      } catch (err) {
        console.error("Error during deletion:", err); // Log the error
        res.json({ error: "could not delete", _id });
      }
    });  
};
