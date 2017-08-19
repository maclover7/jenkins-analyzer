var request = require('request-promise');
var Promise = require('bluebird');

var getHost = function() {
  return new Promise(function(resolve, reject) {
    var host = process.env.JENKINS_HOST;

    if (!host) {
      reject(new Error("You must provide a Jenkins host URL via the JENKINS_HOST env var"));
    } else {
      resolve(host);
    }
  });
}

var getJobs = function(host) {
  return new Promise(function(resolve, reject) {
    request("https://" + host + "/view/All/api/json")
    .then(function(response) {
      resolve(
        JSON.parse(response).jobs
      );
    })
    .catch(function(err) {
      reject(err);
    });
  });
};

getHost()
.then(getJobs)
.then(function(jobs) {
  console.log("Job statistics:");
  console.log("=====");

  var stats = {
    total: function(jobs) { return jobs },
    unbuilt: function(jobs) { return jobs.filter(function(job) { return job.color === "notbuilt" }) },
    matrix: function(jobs) { return jobs.filter(function(job) { return job._class === "hudson.matrix.MatrixProject" }) },
    multijob: function(jobs) { return jobs.filter(function(job) { return job._class === "com.tikal.jenkins.plugins.multijob.MultiJobProject" }) },
    freestyle: function(jobs) { return jobs.filter(function(job) { return job._class === "hudson.model.FreeStyleProject" }) }
  }

  Object.keys(stats).forEach(function(statsKey) {
    var length = stats[statsKey].call(null, jobs).length;
    console.log("- " + statsKey + " jobs: " + length);
  });
})
.catch(function(err) {
  throw err;
});
