import { Router } from "express";
import {
  createCourse,
  deleteCourse,
  getAllCourses,
  updateCourse,
} from "../controllers/course.js";
import isAuth from "../middleware/is-auth.js";
import { body } from "express-validator";

const router = Router();

router.get("/", isAuth, getAllCourses);

router.post(
  "/",
  [
    body("title", "Course title is required.").trim().notEmpty(),
    body("description", "Course description is required.").trim().notEmpty(),
    body("price", "Course price is required.").isFloat({ gt: 0 }),
    body("startDate", "Start date is required.").isISO8601(),
    body("endDate", "End date is required.").isISO8601(),
    body("appointment", "At least one appointment is required.")
      .isArray({ min: 1 })
      .custom((arr) => {
        if (!arr.every((d: string) => !isNaN(Date.parse(d)))) {
          throw new Error("All appointments must be valid dates.");
        }
        return true;
      }),
  ],
  isAuth,
  createCourse
);

router.put(
  "/:courseId",
  [
    body("title", "Course title is required.").trim().notEmpty(),
    body("description", "Course description is required.").trim().notEmpty(),
    body("price", "Course price is required.").isFloat({ gt: 0 }),
    body("startDate", "Start date is required.").isISO8601(),
    body("endDate", "End date is required.").isISO8601(),
    body("appointment", "At least one appointment is required.")
      .isArray({ min: 1 })
      .custom((arr) => {
        if (!arr.every((d: string) => !isNaN(Date.parse(d)))) {
          throw new Error("All appointments must be valid dates.");
        }
        return true;
      }),
  ],
  isAuth,
  updateCourse
);

router.delete("/:courseId", isAuth, deleteCourse);

export default router;
