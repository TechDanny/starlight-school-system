const express = require("express");
const session = require("express-session");
const flash = require("connect-flash");
const dotenv = require("dotenv");
const multer = require("multer");
const mongoose = require("mongoose");

const ObjectId = require("mongoose").Types.ObjectId;

dotenv.config();

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//student collection
const studentSchema = new mongoose.Schema({
  grades: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Grade",
    },
  ],
  studentId: Number,
  firstName: String,
  lastName: String,
  sex: String,
  dob: Date,
  admissionYear: Number,
  studentClass: String,
  parentPhone: String,
  report: String,
  passport: String,
});

//teacher collection
const teacherSchema = new mongoose.Schema({
  teacherID: Number,
  firstName: String,
  lastName: String,
  sex: String,
  teacherClass: String,
  phoneNumber: String,
  password: String,
  passport: String,
});

//contact collection
const contactMessageSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
});

//grade collection
const gradeSchema = new mongoose.Schema({
  studentId: {
    type: Number,
    ref: "Student",
  },
  examType: String,
  mathGrade: Number,
  englishGrade: Number,
  kiswahiliGrade: Number,
  scienceGrade: Number,
  computerGrade: Number,
  frenchGrade: Number,
  totalGrade: Number,
});

const Grade = mongoose.model("Grade", gradeSchema);

const Teacher = mongoose.model("Teacher", teacherSchema);

const Student = mongoose.model("Student", studentSchema);

const ContactMessage = mongoose.model("ContactMessage", contactMessageSchema);

// Set up multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// Create the multer instance
const upload = multer({ storage: storage });

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
  })
);

// Flash middleware
app.use(flash());

// Middleware for flash messages
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.formSubmitted = req.session.formSubmitted;
  delete req.session.formSubmitted;
  next();
});

// Routes
app.get("/", (req, res) => {
  res.render("index", { title: "home" });
});

app.post("/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    const contactMessage = new ContactMessage({
      name,
      email,
      message,
    });

    await contactMessage.save();

    req.session.formSubmitted = true;
    res.redirect("/");
  } catch (error) {
    console.error(error);
    res.redirect("/");
  }
});

app.get("/login", (req, res) => {
  res.render("login", { title: "login", req: req });
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const teacher = await Teacher.findOne({ firstName: username });
  if (teacher && teacher.password === password) {
    req.session.isTeacherLoggedIn = true;
    req.session.teacherId = teacher._id;
    res.redirect("/teacher-dashboard");
  } else if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    req.session.isAdminLoggedIn = true;
    res.redirect("/dashboard");
  } else {
    req.flash("error_msg", "Incorrect username or password");
    res.redirect("/login");
  }
});

app.get("/teacher-dashboard", async (req, res) => {
  try {
    if (req.session.isTeacherLoggedIn) {
      const teacher = await Teacher.findById(req.session.teacherId);
      const students = await Student.find({
        studentClass: teacher.teacherClass,
      }).populate("grades");

      res.render("teacherDash", {
        teacher,
        students,
        title: "Teacher Dashboard",
      });
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.error(error);
    req.flash("error_msg", "Error fetching teacher");
    res.redirect("/");
  }
});

app.get("/teacher-dashboard/my-students", async (req, res) => {
  try {
    if (req.session.isTeacherLoggedIn) {
      const teacher = await Teacher.findById(req.session.teacherId);
      const students = await Student.find({
        studentClass: teacher.teacherClass,
      }).populate("grades");

      res.json(students);
    } else {
      res.status(401).json({ error: "Unauthorized" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/submit-grades", async (req, res) => {
  try {
    const {
      studentId,
      examType,
      mathGrade,
      englishGrade,
      kiswahiliGrade,
      scienceGrade,
      computerGrade,
      frenchGrade,
      totalGrade,
    } = req.body;

    const student = await Student.findOne({ studentId: studentId });

    const newGrade = new Grade({
      studentId: student.studentId,
      examType,
      mathGrade,
      englishGrade,
      kiswahiliGrade,
      scienceGrade,
      computerGrade,
      frenchGrade,
      totalGrade,
    });

    await newGrade.save();
    req.flash("success_msg", "Grades submitted successfully");
    res.redirect("/submit-grades");
  } catch (error) {
    console.error(error);
    req.flash("error_msg", "Error submitting grades");
    res.redirect("/submit-grades");
  }
});

app.get("/teacher-dashboard/account", async (req, res) => {
  try {
    if (req.session.isTeacherLoggedIn) {
      const teacher = await Teacher.findById(req.session.teacherId);
      res.render("teacherDash", { teacher, title: "Account" });
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.error(error);
    req.flash("error_msg", "Error fetching teacher");
    res.redirect("/");
  }
});

app.post("/teacher-dashboard/account", async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const teacher = await Teacher.findById(req.session.teacherId);

    if (teacher && teacher.password === currentPassword) {
      if (newPassword === confirmPassword) {
        teacher.password = newPassword;
        await teacher.save();

        req.flash("success_msg", "Password updated successfully");
        res.redirect("/teacher-dashboard");
      } else {
        req.flash(
          "error_msg",
          "New password and confirm password do not match"
        );
        res.redirect("/teacher-dashboard");
      }
    } else {
      req.flash("error_msg", "Incorrect current password");
      res.redirect("/teacher-dashboard");
    }
  } catch (error) {
    console.error(error);
    req.flash("error_msg", "Error updating password");
    res.redirect("/teacher-dashboard");
  }
});

app.get("/dashboard", async (req, res) => {
  try {
    if (req.session.isAdminLoggedIn) {
      // Fetch all students and teachers from the database
      const students = await Student.find();
      const teachers = await Teacher.find();

      const totalStudents = students.length;
      const totalTeachers = teachers.length;
      const totalMaleStudents = students.filter(
        (student) => student.sex === "male"
      ).length;
      const totalFemaleStudents = students.filter(
        (student) => student.sex === "female"
      ).length;

      const section = req.query.section || "dashboard";

      res.render("dashboard", {
        students,
        teachers,
        defaultSection: section,
        req: req,
        successMessage: req.flash("successMessage"),
        totalStudents,
        totalMaleStudents,
        totalFemaleStudents,
        totalTeachers,
      });
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.error(error);
    req.flash("error_msg", "Error fetching students");
    res.redirect("/");
  }
});

// Add Students route
app.get("/add-students", (req, res) => {
  res.render("dashboard", {
    title: "Add Students",
    defaultSection: "add-students",
  });
});

app.post("/add-students", upload.single("passport"), async (req, res) => {
  try {
    const {
      studentId,
      firstName,
      lastName,
      sex,
      dob,
      admissionYear,
      studentClass,
      parentPhone,
      report,
    } = req.body;

    // Checks if the file is present
    const passport = req.file ? req.file.filename : "";

    const newStudent = new Student({
      studentId,
      firstName,
      lastName,
      sex,
      dob,
      admissionYear,
      studentClass,
      parentPhone,
      report,
      passport,
    });

    await newStudent.save();

    req.flash("success_msg", "Student added successfully");
    res.redirect("/dashboard");
  } catch (error) {
    console.error(error);
    req.flash("error_msg", "Error adding student");
    res.redirect("/dashboard");
  }
});

app.get("/manage-students", async (req, res) => {
  try {
    if (req.session.isAdminLoggedIn) {
      const students = await Student.find();

      res.render("dashboard", { students, defaultSection: "manage-students" });
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.error(error);
    req.flash("error_msg", "Error fetching students");
    res.redirect("/");
  }
});

app.post("/delete-student/:id", async (req, res) => {
  try {
    if (req.session.isAdminLoggedIn) {
      const studentId = req.params.id;
      await Student.findOneAndDelete({ studentId });
      req.flash("successMessage", `Successfully deleted the student`);
      res.redirect("/dashboard");
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.error(error);
    req.flash("errorMessage", "Error deleting student");
    res.redirect("/dashboard");
  }
});

app.get("/add-teachers", (req, res) => {
  res.render("dashboard", {
    title: "Add Teachers",
    defaultSection: "add-teachers",
  });
});

app.post("/add-teachers", upload.single("passport"), async (req, res) => {
  try {
    const {
      teacherID,
      firstName,
      lastName,
      sex,
      teacherClass,
      phoneNumber,
      password,
    } = req.body;

    const passport = req.file ? req.file.filename : "";
    const newTeacher = new Teacher({
      teacherID,
      firstName,
      lastName,
      sex,
      teacherClass,
      phoneNumber,
      password,
      passport,
    });

    await newTeacher.save();

    req.flash("success_msg", "Teacher added successfully");
    res.redirect("/dashboard");
  } catch (error) {
    console.error(error);
    req.flash("error_msg", "Error adding teacher");
    res.redirect("/dashboard");
  }
});

app.get("/manage-teachers", async (req, res) => {
  try {
    if (req.session.isAdminLoggedIn) {
      const teachers = await Teacher.find();

      const section = req.query.section || "dashboard";

      res.render("dashboard", { teachers, defaultSection: section });
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.error(error);
    req.flash("error_msg", "Error fetching teachers");
    res.redirect("/");
  }
});

app.post("/delete-teacher/:id", async (req, res) => {
  try {
    if (req.session.isAdminLoggedIn) {
      const teacherID = req.params.id;

      await Teacher.findOneAndDelete({ teacherID });

      req.flash("successMessage", `Successfully deleted the teacher`);

      res.redirect("/dashboard");
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.error(error);
    req.flash("errorMessage", "Error deleting teacher");
    res.redirect("/dashboard");
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
