export const CourseQueries = {
  list: "SELECT * FROM courses ORDER BY created_at DESC",
  schedule: "INSERT INTO course_schedule (course_id, start_date) VALUES (?, ?)",
  enroll: "INSERT INTO enrollments (course_id, user_id) VALUES (?, ?)"
};
