const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);
let deleteID;
describe("Functional Tests", function() {
  let testIssueId;

  // Create an issue for testing purposes
  before(async function() {
    let res = await chai.request(server)
      .post("/api/issues/projects")
      .send({
        issue_title: "Test Issue",
        issue_text: "This is a test issue",
        created_by: "Test User",
        assigned_to: "Test Assignee",
        status_text: "Test Status",
      });
    testIssueId = res.body._id; // Save the created issue ID for further tests
  });

  it("Create an issue with every field: Post request to /api/issues/{project}", async function() {
    let res = await chai.request(server)
    .keepOpen()
      .post("/api/issues/projects")
      .send({
        issue_title: "Test Issue",
        issue_text: "This is a test issue",
        created_by: "Test User",
        assigned_to: "Test Assignee",
        status_text: "Test Status",
      });
    assert.equal(res.status, 200);
    assert.equal(res.body.issue_title, "Test Issue");
    assert.equal(res.body.issue_text, "This is a test issue");
    assert.equal(res.body.created_by, "Test User");
    assert.equal(res.body.assigned_to, "Test Assignee");
    assert.equal(res.body.status_text, "Test Status");
  });

  it("Create an issue with only required fields: POST request to /api/issues/{project}", async function() {
    let res = await chai.request(server)
      .post("/api/issues/projects")
      .send({
        issue_title: "Test Issue",
        issue_text: "This is a test issue",
        created_by: "Test User",
        assigned_to: "",
        status_text: "",
      });
    assert.equal(res.status, 200);
    assert.equal(res.body.issue_title, "Test Issue");
    assert.equal(res.body.issue_text, "This is a test issue");
    assert.equal(res.body.created_by, "Test User");
    assert.equal(res.body.assigned_to, "");
    assert.equal(res.body.status_text, "");
  });

  it("Create an issue with missing required fields: POST request to /api/issues/{project}", async function() {
    let res = await chai.request(server)
      .post('/api/issues/projects')
      .send({
        issue_title: "",
        issue_text: "",
        created_by: "fCC",
        assigned_to: "",
        status_text: "",
      });
    assert.equal(res.status, 200);
    assert.equal(res.body.error, "required field(s) missing");
  });

  //////////////// GET REQUEST TESTS /////////////////////

  it("View issues on a project: GET request to /api/issues/{project}", async function() {
    let res = await chai.request(server)
      .get("/api/issues/test-data-abc123");
    assert.equal(res.status, 200);
    assert.isArray(res.body.length, 4);
  });

  it("View issues on a project with one filter: GET request to /api/issues/{project}", async function() {
    let res = await chai.request(server)
      .get("/api/issues/projects")
      .query({ open: true });

    assert.equal(res.status, 200);
    assert.isArray(res.body);
    assert.isAtLeast(res.body.length, 1); 

    assert.deepEqual(res.body[0], {
        _id: testIssueId, 
        issue_title: "Test Issue",
        issue_text: "This is a test issue",
        created_on: res.body[0].created_on,
        updated_on: res.body[0].updated_on, 
        created_by: "Test User",
        assigned_to: "Test Assignee",
        open: true,
        status_text: "Test Status",
    });
});


it("View issues on a project with multiple filters: GET request to /api/issues/{project}", async function() {
  // Replace 'projects' with your actual project identifier if needed
  let res = await chai.request(server)
    .get("/api/issues/projects?open=true&assigned_to=Test+Assignee");

  assert.equal(res.status, 200);
  assert.isArray(res.body);

  assert.isAtLeast(res.body.length, 1);
  assert.deepEqual(res.body[0], {
    _id: testIssueId, 
      issue_title: "Test Issue",
      issue_text: "This is a test issue",
      created_on: "", 
      updated_on: "", 
      created_by: "Test User",
      assigned_to: "",
      open: true,
      status_text: "",
  });
});

  //////////////// PUT REQUEST TESTS /////////////////////
  it('Update one field on an issue', async function() {
    let issue = await chai.request(server)
      .post('/api/issues/projects')
      .send({
        issue_title: 'Test Issue',
        issue_text: 'This is a test issue',
        created_by: 'Test User',
      });
    let res = await chai.request(server)
      .put('/api/issues/projects')
      .send({
        _id: testIssueId,
        issue_title: 'Updated Issue',
      });
    assert.equal(res.status, 200);
    assert.equal(res.body.result, 'successfully updated');
  });

  it('Update multiple fields on an issue', async function() {
    let issue = await chai.request(server)
      .post('/api/issues/projects')
      .send({
        issue_title: 'Test Issue',
        issue_text: 'This is a test issue',
        created_by: 'Test User',
      });
    let res = await chai.request(server)
      .put('/api/issues/projects')
      .send({
        _id: testIssueId,
        issue_title: 'Updated Issue',
        issue_text: 'Updated issue text',
      });
    assert.equal(res.status, 200);
    assert.equal(res.body.result, 'successfully updated');
  });

  it('Update an issue with missing _id', async function() {
    let res = await chai.request(server)
      .put('/api/issues/projects')
      .send({
        issue_title: 'Updated Issue',
      });
    assert.equal(res.status, 200);
    assert.equal(res.body.error, 'missing _id');
  });

 it('Update an issue with no fields to update', async function() {
    let issue = await chai.request(server)
      .post('/api/issues/projects')
      .send({
        issue_title: 'Test Issue',
        issue_text: 'This is a test issue',
        created_by: 'Test User',
      });
    let res = await chai.request(server)
      .put('/api/issues/projects')
      .send({
        _id: testIssueId,
      });
    assert.equal(res.status, 200);
    assert.equal(res.body.error, 'no update field(s) sent');
  });

  it('Update an issue with an invalid _id', async function() {
    let res = await chai.request(server)
      .put('/api/issues/test-project')
      .send({
        _id: 'invalid-id',
        issue_title: 'Updated Issue',
      });
    assert.equal(res.status, 400);
    assert.equal(res.body.error, 'could not update');
  });

//////////////// DELETE REQUEST TESTS /////////////////////

 it('Delete an issue', async function() {
    let issue = await chai.request(server)
      .post('/api/issues/projects')
      .send({
        _id: testIssueId,
        issue_title: 'Test Issue',
        issue_text: 'This is a test issue',
        created_by: 'Test User',
      });
    let res = await chai.request(server)
      .delete('/api/issues/test-project')
      .send({
        _id: issue.body._id,
      });
    assert.equal(res.status, 200);
    assert.equal(res.body.result, 'successfully deleted');
  });

  it('Delete an issue with an invalid _id: DELETE request to /api/issues/{project}', async function() {
    let res = await chai.request(server)
      .delete('/api/issues/projects')
      .send({
        _id: '66b3cd03f678d62b872ef51dinvalid-id',
      });
    assert.equal(res.status, 400);
    assert.equal(res.body.error, 'could not delete');
  });

  it('Delete an issue with missing _id', async function() {
    let res = await chai.request(server)
      .delete('/api/issues/test-project')
      .send({});
    assert.equal(res.status, 400);
    assert.equal(res.body.error, 'missing _id');
  });
}); 