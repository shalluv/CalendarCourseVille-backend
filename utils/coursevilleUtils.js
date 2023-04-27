const https = require('https');

class CoursevilleUtils {
  static async getProfileInformation(req) {
    return new Promise((resolve, reject) => {
      const profileOptions = {
        headers: {
          Authorization: `Bearer ${req.session.token.access_token}`,
        },
      };
      const profileReq = https.request(
        'https://www.mycourseville.com/api/v1/public/users/me',
        profileOptions,
        (profileRes) => {
          let profileData = '';
          profileRes.on('data', (chunk) => {
            profileData += chunk;
          });
          profileRes.on('end', () => {
            const profile = JSON.parse(profileData);
            resolve(profile);
          });
        }
      );
      profileReq.on('error', (err) => {
        reject(err);
      });
      profileReq.end();
    });
  }

  static async getCourses(req) {
    const options = {
      headers: {
        Authorization: `Bearer ${req.session.token.access_token}`,
      },
    };
    const cv_cids = await this.requestCourses(options);
    const courses_with_info = await Promise.all(
      cv_cids.map(async (cv_cid) => {
        let info = await this.requestCourseInfo(cv_cid, options);
        let schedule = await this.requestCourseSchedule(cv_cid, options);
        let online_meetings = await this.requestOnlineMeetings(cv_cid, options);
        let schedule_time = schedule.map((e) => {
          return {
            start_time: e.start_epoch,
            end_time: e.end_epoch,
          };
        });
        let link = `https://www.mycourseville.com/?q=courseville/course/${cv_cid}`;
        return {
          cv_cid: cv_cid,
          course_name: info.title,
          schedule: schedule_time,
          online_meetings: online_meetings,
          link: link,
        };
      })
    );
    return {
      courses: courses_with_info,
    };
  }

  static async getAssignments(req) {
    const options = {
      headers: {
        Authorization: `Bearer ${req.session.token.access_token}`,
      },
    };
    const cv_cids = await this.requestCourses(options);
    let assignments_ids = [];
    const req_assignments = await Promise.all(
      cv_cids.map(async (cv_cid) => {
        let assignments = await this.requestAssignments(cv_cid, options);
        let promises = assignments.map((e) => {
          assignments_ids.push({
            cv_cid: cv_cid,
            itemid: e,
          });
        });
        await Promise.all(promises);
      })
    );
    let promises = assignments_ids.map(async (e) => {
      const assignment = await this.requestAssignmentInfo(e.itemid, options);
      return {
        itemid: e.itemid,
        title: assignment.title,
        duetime: assignment.duetime,
        link: `https://www.mycourseville.com/?q=courseville/worksheet/${e.cv_cid}/${e.itemid}`,
      };
    });
    const assignments = await Promise.all(promises);
    return assignments;
  }

  static requestCourses(options) {
    return new Promise((resolve, reject) => {
      const coursesReq = https.request(
        'https://www.mycourseville.com/api/v1/public/get/user/courses',
        options,
        (coursesRes) => {
          let coursesData = '';
          coursesRes.on('data', (chunk) => {
            coursesData += chunk;
          });
          coursesRes.on('end', () => {
            const courses = JSON.parse(coursesData).data.student;
            const cv_cids = courses.map((e) => e.cv_cid);
            resolve(cv_cids);
          });
        }
      );
      coursesReq.on('error', (err) => {
        reject(err);
      });
      coursesReq.end();
    });
  }

  static requestCourseInfo(cv_cid, options) {
    return new Promise((resolve, reject) => {
      const courseReq = https.request(
        `https://www.mycourseville.com/api/v1/public/get/course/info?cv_cid=${cv_cid}`,
        options,
        (courseRes) => {
          let courseData = '';
          courseRes.on('data', (chunk) => {
            courseData += chunk;
          });
          courseRes.on('end', () => {
            const courseInfo = JSON.parse(courseData).data;
            resolve(courseInfo);
          });
        }
      );
      courseReq.on('error', (err) => {
        reject(err);
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
          let scheduleData = '';
          scheduleRes.on('data', (chunk) => {
            scheduleData += chunk;
          });
          scheduleRes.on('end', () => {
            const schedule = JSON.parse(scheduleData).data;
            resolve(schedule);
          });
        }
      );
      scheduleReq.on('error', (err) => {
        reject(err);
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
          let assignmentsData = '';
          assignmentsRes.on('data', (chunk) => {
            assignmentsData += chunk;
          });
          assignmentsRes.on('end', () => {
            const assignments = JSON.parse(assignmentsData).data;
            const assignments_ids = assignments.map((e) => e.itemid);
            resolve(assignments_ids);
          });
        }
      );
      assignmentsReq.on('error', (err) => {
        reject(err);
      });
      assignmentsReq.end();
    });
  }

  static requestAssignmentInfo(itemid, options) {
    return new Promise((resolve, reject) => {
      const assignmentReq = https.request(
        `https://www.mycourseville.com/api/v1/public/get/item/assignment?item_id=${itemid}`,
        options,
        (assignmentRes) => {
          let assignmentData = '';
          assignmentRes.on('data', (chunk) => {
            assignmentData += chunk;
          });
          assignmentRes.on('end', () => {
            const assignment = JSON.parse(assignmentData).data;
            resolve(assignment);
          });
        }
      );
      assignmentReq.on('error', (err) => {
        reject(err);
      });
      assignmentReq.end();
    });
  }

  static requestOnlineMeetings(cv_cid, options) {
    return new Promise((resolve, reject) => {
      const meetingsReq = https.request(
        `https://www.mycourseville.com/api/v1/public/get/course/onlinemeetings?cv_cid=${cv_cid}`,
        options,
        (meetingsRes) => {
          let meetingsData = '';
          meetingsRes.on('data', (chunk) => {
            meetingsData += chunk;
          });
          meetingsRes.on('end', () => {
            const meetings = JSON.parse(meetingsData).data;
            const meeting_links = meetings.map((meeting) => {
              return {
                start_epoch: meeting.start_epoch,
                duration_minute: meeting.duration_minute,
                link: meeting.json_property.zoom.creating_response.join_url,
              }
            });
            resolve(meeting_links);
          });
        }
      );
      meetingsReq.on('error', (err) => {
        reject(err);
      });
      meetingsReq.end();
    });
  }
}

module.exports = CoursevilleUtils;
