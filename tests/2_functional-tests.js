const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");
require("../db-connection");

chai.use(chaiHttp);

let deleteID;

suite("Functional Tests", function () {
  suite("Routing Tests", function () {
    suite("POST request Tests", function () {
      test("Create an issue with every field: POST request to /api/issues/{project}", function (done) {
        chai
          .request(server)
          .post("/api/issues/projects")
          .set("content-type", "application/json")
          .send({
            issue_title: "Issue",
            issue_text: "Functional Test",
            created_by: "fCC",
            assigned_to: "Dom",
            status_text: "Not Done",
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            deleteID = res.body._id;
            assert.equal(res.body.issue_title, "Issue");
            assert.equal(res.body.assigned_to, "Dom");
            assert.equal(res.body.created_by, "fCC");
            assert.equal(res.body.status_text, "Not Done");
            assert.equal(res.body.issue_text, "Functional Test");
            done();
          });
      }).timeout(10000);

      test("Create an issue with only required fields: POST request to /api/issues/{project}", function (done) {
        chai
          .request(server)
          .post("/api/issues/projects")
          .set("content-type", "application/json")
          .send({
            issue_title: "Issue",
            issue_text: "Functional Test",
            created_by: "fCC",
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.issue_title, "Issue");
            assert.equal(res.body.created_by, "fCC");
            assert.equal(res.body.issue_text, "Functional Test");
            assert.isEmpty(res.body.assigned_to);
            assert.isEmpty(res.body.status_text);
            done();
          });
      }).timeout(5000);

      test("Create an issue with missing required fields: POST request to /api/issues/{project}", function (done) {
        chai
          .request(server)
          .post("/api/issues/projects")
          .set("content-type", "application/json")
          .send({
            issue_title: "",
            issue_text: "",
            created_by: "fCC",
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.error, "required field(s) missing");
            done();
          });
      }).timeout(5000);
    });

    suite("GET request Tests", function () {
      test("View issues on a project: GET request to /api/issues/{project}", function (done) {
        chai
          .request(server)
          .get("/api/issues/get_issues_test_329467")
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            done();
          });
      });

      test("View issues on a project with one filter: GET request to /api/issues/{project}", function (done) {
        chai
          .request(server)
          .get("/api/issues/get_issues_test_329467")
          .query({ _id: "66b7f301c5f3f3cb428a0eee" })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.lengthOf(res.body, 1);
            assert.deepEqual(res.body[0], {
              _id: "66b7f301c5f3f3cb428a0eee",
              issue_title: "To be Filtered",
              issue_text: "Filter Issues Test",
              created_on: "2024-08-10T23:08:49.476Z", // Adjust this if needed
              updated_on: "2024-08-10T23:08:49.476Z", // Adjust this if needed
              created_by: "Alice",
              assigned_to: "Bob",
              open: true,
              status_text: "",
            });
            done();
          });
      });

      test("View issues on a project with multiple filters: GET request to /api/issues/{project}", function (done) {
        chai
          .request(server)
          .get("/api/issues/get_issues_test_710724")
          .query({
            issue_title: "To be Filtered",
            issue_text: "Filter Issues Test",
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.lengthOf(res.body, 4);
            assert.deepEqual(res.body[0], {
              _id: "66b7e4de7ad0c45f16555092",
              issue_title: "To be Filtered",
              issue_text: "Filter Issues Test",
              created_on: "2024-08-10T22:08:30.733Z", // Adjust this if needed 
              updated_on: "2024-08-10T22:08:30.733Z", // Adjust this if needed
              created_by: "Alice",
              assigned_to: "Bob",
              open: true,
              status_text: "",
            });
            done();
          });
      });
    });

    suite("PUT request Tests", function () {
      test("Update one field on an issue: PUT request to /api/issues/{project}", function (done) {
        chai
          .request(server)
          .put("/api/issues/fcc-project")
          .send({
            _id: "66b7e4dd7ad0c45f16555077",
            issue_title: "different",
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.result, "successfully updated");
            assert.equal(res.body._id, "66b7e4dd7ad0c45f16555077");
            done();
          });
      });

      test("Update multiple fields on an issue: PUT request to /api/issues/{project}", function (done) {
        chai
          .request(server)
          .put("/api/issues/apitest")
          .send({
            _id: "66b7e45c7ad0c45f16555059",
             issue_title: "Challenge",
             issue_text: "Updated Issue Text",
             created_by: "Updated Created By",
             assigned_to: "Updated Assigned To",
             status_text: "Updated Status Text",
             open: true,
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.result, "successfully updated");
            done();
          });
      });

      test("Update an issue with missing _id: PUT request to /api/issues/{project}", function (done) {
        chai
          .request(server)
          .put("/api/issues/fcc-project")
          .send({
            issue_title: "update",
            issue_text: "update",
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.error, "missing _id");
            done();
          });
      });

      test("Update an issue with no fields to update: PUT request to /api/issues/{project}", function (done) {
        chai
          .request(server)
          .put("/api/issues/fcc-project")
          .send({
            _id: "66b7e4dd7ad0c45f16555079",
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.error, "no update field(s) sent");
            done();
          });
      });

      test("Update an issue with an invalid _id: PUT request to /api/issues/{project}", function (done) {
        chai
          .request(server)
          .put("/api/issues/fcc-project")
          .send({
            _id: "invalid_id",
            issue_title: "update",
            issue_text: "update",
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.error, "could not update");
            done();
          });
      });
    });

    suite("DELETE request Tests", function () {
      test("Delete an issue: DELETE request to /api/issues/{project}", function (done) {
        chai
          .request(server)
          .delete("/api/issues/projects")
          .send({
            _id: deleteID,
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.result, "successfully deleted");
            done();
          });
      });

      test("Delete an issue with an invalid _id: DELETE request to /api/issues/{project}", function (done) {
        chai
          .request(server)
          .delete("/api/issues/projects")
          .send({
            _id: "invalid_id",
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.error, "could not delete");
            done();
          });
      });

      test("Delete an issue with missing _id: DELETE request to /api/issues/{project}", function (done) {
        chai
          .request(server)
          .delete("/api/issues/projects")
          .send({})
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.error, "missing _id");
            done();
          });
      });
    });
  });
});
