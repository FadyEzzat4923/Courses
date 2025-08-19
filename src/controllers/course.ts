import { Request, Response } from "express";
import Admin from "../models/admin.js";
import Course from "../models/course.js";
import { validationResult } from "express-validator";

export async function getAllCourses(req: Request, res: Response) {
  const { adminId } = req.auth!;
  try {
    const admin = await Admin.findById(adminId).populate("courses");

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    return res.status(200).json({ courses: admin.courses });
  } catch (err) {
    return res.status(500).json({ message: "Something went wrong" });
  }
}

export async function createCourse(req: Request, res: Response) {
  const validation = validationResult(req);
  if (!validation.isEmpty()) {
    const errors: {
      title?: string;
      description?: string;
      price?: number;
      startDate?: Date;
      endDate?: Date;
      appointment?: Date[];
    } = {};
    for (const err of validation.array()) {
      if ("path" in err) {
        errors[err.path as keyof typeof errors] = err.msg;
      }
    }
    return res.status(400).json({ errors });
  }
  const { adminId } = req.auth!;
  const { title, description, price, startDate, endDate, appointment } =
    req.body;
  const course = new Course({
    title,
    description,
    price,
    appointment,
    startDate,
    endDate,
  });
  try {
    await course.save();
    await Admin.findByIdAndUpdate(adminId, {
      $push: { courses: course._id },
    });
    return res
      .status(201)
      .json({ message: "Course created successfully.", course });
  } catch (err) {
    return res.status(500).json({ message: "Something went wrong" });
  }
}
