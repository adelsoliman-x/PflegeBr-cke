const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const authenticateToken = require('../middleware/authenticateToken');
const authenticate = require("../middleware/auth");
// ✅ إضافة وظيفة جديدة (Job)
router.post('/', authenticateToken, async (req, res) => {
  const {
    candidateName,
    specialization,
    skills,
    country,
    city,
    status,
    files // 👈 دي هتبقى array of objects: { name, url }
  } = req.body;

  try {
    const newJob = await prisma.job.create({
      data: {
        candidateName,
        specialization,
        skills,
        country,
        city,
        status,
        fileUrls: {
          set: files.map(file => file.url) // ✅ ناخد الـ URL بس
        }
      }
    });

    res.status(201).json({ message: 'Job created', job: newJob });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating job' });
  }
});


// ✅ جلب كل الوظائف (المشترك فقط)
router.get("/", authenticate, async (req, res) => {
  try {
    const jobs = await prisma.job.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(jobs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching jobs" });
  }
});

module.exports = router;
