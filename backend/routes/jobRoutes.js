const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const authenticateToken = require('../middleware/authenticateToken');
const authenticate = require("../middleware/auth");
// ✅ إضافة وظيفة جديدة (Job)
router.post('/jobs', authenticateToken, async (req, res) => {
  const {
    candidateName,
    specialization,
    skills,
    country,
    city,
    status,
    fileUrl
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
        fileUrl,
      },
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
