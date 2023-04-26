const https = require("https");

class CoursevilleUtils {
    static requestCourses(options) {
        return new Promise((resolve, reject) => {
          const coursesReq = https.request(
            "https://www.mycourseville.com/api/v1/public/get/user/courses",
            options,
            (coursesRes) => {
              let coursesData = "";
              coursesRes.on("data", (chunk) => {
                coursesData += chunk;
              });
              coursesRes.on("end", () => {
                const courses = JSON.parse(coursesData).data.student;
                const cv_cids = courses.map(e => e.cv_cid);
                resolve(cv_cids);
              });
            }
          );
          coursesReq.on("error", (err) => {
            reject(err);
          });
          coursesReq.end();
        });
      };
      
      static requestCourseInfo(cv_cid, options) {
        return new Promise((resolve, reject) => {
          const courseReq = https.request(
            `https://www.mycourseville.com/api/v1/public/get/course/info?cv_cid=${cv_cid}`,
            options,
            (courseRes) => {
              let courseData = "";
              courseRes.on("data", (chunk) => {
                courseData += chunk;
              });
              courseRes.on("end", () => {
                const courseInfo = JSON.parse(courseData).data;
                resolve(courseInfo);
              });
            }
          );
          courseReq.on("error", (err) => {
            console.error(err);
          });
          courseReq.end();
        });
      }
      
      static requestCourseSchedule(cv_cid, options) {
        return new Promise((resolve, reject) => {
          const scheduleReq = https.request(
            `https://www.mycourseville.com/api/v1/public/get/course/schedule?cv_cid=${cv_cid}`,
            options,
            (scheduleRes) => {
              let scheduleData = "";
              scheduleRes.on("data", (chunk) => {
                scheduleData += chunk;
              });
              scheduleRes.on("end", () => {
                const schedule = JSON.parse(scheduleData).data;
                resolve(schedule);
              });
            }
          );
          scheduleReq.on("error", (err) => {
            console.error(err);
          });
          scheduleReq.end();
        });
      }
      
      static requestAssignments(cv_cid, options) {
        return new Promise((resolve, reject) => {
          const assignmentsReq = https.request(
            `https://www.mycourseville.com/api/v1/public/get/course/assignments?cv_cid=${cv_cid}`,
            options,
            (assignmentsRes) => {
              let assignmentsData = "";
              assignmentsRes.on("data", (chunk) => {
                assignmentsData += chunk;
              });
              assignmentsRes.on("end", () => {
                const assignments = JSON.parse(assignmentsData).data;
                const assignments_ids = assignments.map(e => e.itemid);
                resolve(assignments_ids);
              });
            }
          );
          assignmentsReq.on("error", (err) => {
            reject(err);
          });
          assignmentsReq.end();
        });
      };
      
      static requestAssignmentInfo(itemid, options) {
        return new Promise((resolve, reject) => {
          const assignmentReq = https.request(
            `https://www.mycourseville.com/api/v1/public/get/item/assignment?item_id=${itemid}`,
            options,
            (assignmentRes) => {
              let assignmentData = "";
              assignmentRes.on("data", (chunk) => {
                assignmentData += chunk;
              });
              assignmentRes.on("end", () => {
                const assignment = JSON.parse(assignmentData).data;
                resolve(assignment);
              });
            }
          );
          assignmentReq.on("error", (err) => {
            reject(err);
          });
          assignmentReq.end();
        });
      };
  }
  
module.exports = CoursevilleUtils;