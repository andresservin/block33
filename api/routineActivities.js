const express = require('express');
const router = express.Router();
const { updateRoutineActivity, canEditRoutineActivity, destroyRoutineActivity, getRoutineActivityById } = require('../db');
const client = require('../db/client');
const { requireUser, requiredNotSent } = require('./utils')
const { getAllRoutineActivities } = require('../db/routine_activities');

// GET /api/routine_activities
router.get('/', async (req, res, next) => {
  try {
    const routineActivities = await getAllRoutineActivities();
    res.json(routineActivities);
  } catch (error) {
    next(error);
  }
});


// PATCH /api/routine_activities/:routineActivityId
router.patch('/:routineActivityId', requireUser, async (req, res, next) => {
  const { routineActivityId } = req.params;
  const { count, duration } = req.body;

  try {
      const routineActivity = await getRoutineActivityById(routineActivityId);
      if (!routineActivity) {
          return res.status(404).json({
              name: "NotFound",
              message: `No routine activity found with ID ${routineActivityId}`
          });
      }

      if (!await canEditRoutineActivity(routineActivityId, req.user.id)) {
          return res.status(403).json({
              name: "Unauthorized",
              message: "You are not authorized to update this routine activity"
          });
      }

      const updatedRoutineActivity = await updateRoutineActivity({
          id: routineActivityId,
          count: count ? count * 2 : routineActivity.count, // Doubling the count
          duration: duration ? duration * 2 : routineActivity.duration // Doubling the duration
      });

      res.status(200).json(updatedRoutineActivity);
  } catch (error) {
      console.error(`Failed to update routine activity: ${error}`);
      next(error);
  }
});

// DELETE /api/routine_activities/:routineActivityId
router.delete('/:routineActivityId', requireUser, async (req, res, next) => {
  try {
    // First, check if the current user is authorized to delete this routine_activity
    if (!await canEditRoutineActivity(req.params.routineActivityId, req.user.id)) {
      return res.status(403).json({
        name: "Unauthorized",
        message: "You are not authorized to delete this routine activity"
      });
    }

    // If authorized, proceed to delete
    const deletedRoutineActivity = await destroyRoutineActivity(req.params.routineActivityId);
    if (!deletedRoutineActivity) {
      return res.status(404).json({
        name: "NotFound",
        message: "Routine activity not found"
      });
    }

    res.status(200).json({
      message: "Routine activity successfully deleted",
      routineActivity: deletedRoutineActivity
    });
  } catch (error) {
    console.error(`Failed to delete routine activity: ${error}`);
    next(error);
  }
});


module.exports = router;

