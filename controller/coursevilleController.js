const dotenv = require("dotenv");
dotenv.config();
const https = require("https");
const url = require("url");
const querystring = require("querystring");
const coursevilleUtils = require("../utils/coursevilleUtils");

const redirect_uri = `http://${process.env.backendIPAddress}/courseville/access_token`;
const authorization_url = `https://www.mycourseville.com/api/oauth/authorize?response_type=code&client_id=${process.env.client_id}&redirect_uri=${redirect_uri}`;
const access_token_url = "https://www.mycourseville.com/api/oauth/access_token";

exports.authApp = (req, res) => {
  res.redirect(authorization_url);
};

exports.accessToken = (req, res) => {
  const parsedUrl = url.parse(req.url);
  const parsedQuery = querystring.parse(parsedUrl.query);

  if (parsedQuery.error) {
    res.writeHead(400, { "Content-Type": "text/plain" });
    res.end(`Authorization error: ${parsedQuery.error_description}`);
    return;
  }

  if (parsedQuery.code) {
    const postData = querystring.stringify({
      grant_type: "authorization_code",
      code: parsedQuery.code,
      client_id: process.env.client_id,
      client_secret: process.env.client_secret,
      redirect_uri: redirect_uri,
    });

    const tokenOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": postData.length,
      },
    };

    const tokenReq = https.request(
      access_token_url,
      tokenOptions,
      (tokenRes) => {
        let tokenData = "";
        tokenRes.on("data", (chunk) => {
          tokenData += chunk;
        });
        tokenRes.on("end", () => {
          const token = JSON.parse(tokenData);
          req.session.token = token;
          if (token) {
            res.writeHead(302, {
              Location: `http://${process.env.frontendIPAddress}/`,
            });
            res.end();
          }
        });
      }
    );
    tokenReq.on("error", (err) => {
      console.error(err);
    });
    tokenReq.write(postData);
    tokenReq.end();
  } else {
    res.writeHead(302, { Location: authorization_url });
    res.end();
  }
};

// Example: Send "GET" request to CV endpoint to get user profile information
exports.getProfileInformation = (req, res) => {
  try {
    const profileOptions = {
      headers: {
        Authorization: `Bearer ${req.session.token.access_token}`,
      },
    };
    const profileReq = https.request(
      "https://www.mycourseville.com/api/v1/public/users/me",
      profileOptions,
      (profileRes) => {
        let profileData = "";
        profileRes.on("data", (chunk) => {
          profileData += chunk;
        });
        profileRes.on("end", () => {
          const profile = JSON.parse(profileData);
          res.send(profile);
          res.end();
        });
      }
    );
    profileReq.on("error", (err) => {
      console.error(err);
    });
    profileReq.end();
  } catch (error) {
    console.log("Please logout, then login again.");
  }
};

exports.getCourses = async (req, res) => {
  try {
    const options = {
      headers: {
        Authorization: `Bearer ${req.session.token.access_token}`,
      },
    };
    const cv_cids = await coursevilleUtils.requestCourses(options);
    const courses_with_info = await Promise.all(cv_cids.map(async cv_cid => {
      let info = await coursevilleUtils.requestCourseInfo(cv_cid, options);
      let schedule = await coursevilleUtils.requestCourseSchedule(cv_cid, options);
      let schedule_time = schedule.map(e => {
        return {
          start_time: e.start_epoch,
          end_time: e.end_epoch,
        }
      });
      let link = `https://www.mycourseville.com/?q=courseville/course/${cv_cid}`;
      return {
        cv_cid: cv_cid,
        course_name: info.title,
        schedule: schedule_time,
        link: link,
      };
    }));
    res.send({
      courses: courses_with_info,
    });
    res.end();
  } catch (error) {
    console.log(error);
  }
};

exports.getAssignments = async (req, res) => {
  try {
    const options = {
      headers: {
        Authorization: `Bearer ${req.session.token.access_token}`,
      },
    };
    const cv_cids = await coursevilleUtils.requestCourses(options);
    let assignments_ids = [];
    const req_assignments = await Promise.all(cv_cids.map(async cv_cid => {
      let assignments = await coursevilleUtils.requestAssignments(cv_cid, options);
      let promises = assignments.map((e) => {
        assignments_ids.push({
          cv_cid: cv_cid,
          itemid: e
        });
      });
      await Promise.all(promises);
    }));
    let promises = assignments_ids.map(async (e) => {
      const assignment = await coursevilleUtils.requestAssignmentInfo(e.itemid, options);
      return {
        itemid: e.itemid,
        title: assignment.title,
        duetime: assignment.duetime,
        link: `https://www.mycourseville.com/?q=courseville/worksheet/${e.cv_cid}/${e.itemid}`,
      };
    })
    const assignments = await Promise.all(promises);
    res.send(assignments)
    res.end()
  } catch (error) {
    console.log(error);
  }
};

exports.logout = (req, res) => {
  req.session.destroy();
  res.redirect(`http://${process.env.frontendIPAddress}/`);
  res.end();
};