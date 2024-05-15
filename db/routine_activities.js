const client = require('./client');
const util = require('./util');

async function getRoutineActivityById(id){
  try {
    const {rows: [routineActivity]} = await client.query(`
      SELECT * FROM routine_activities
      WHERE id = $1
    `, [id]);
    return routineActivity;
  } catch (error) {
    throw error;
  }
}

async function addActivityToRoutine({
  routineId,
  activityId,
  count,
  duration,
}) {
  try {
    const { rows: [routineActivity] } = await client.query(`
    INSERT INTO routine_activities ( "routineId", "activityId", count , duration)
    VALUES($1, $2, $3, $4)
    ON CONFLICT ("routineId", "activityId") DO NOTHING
    RETURNING *;
      `, [ routineId, activityId, count, duration]);
    return routineActivity;
  } catch (error) {
    throw error;
  }
}

async function getAllRoutineActivities() {
  try {
    const {rows} = await client.query(`
      SELECT * FROM routine_activities;
    `);
    return rows;
  } catch (error) {
    throw error;
  }
}

async function getRoutineActivitiesByRoutine({id}) {
  try {
    const {rows} = await client.query(`
      SELECT * FROM routine_activities
      WHERE "routineId" = ${id}
    `);
    return rows;
  } catch (error) {
    throw error;
  }
}

async function updateRoutine({id, ...fields}) {
  try {
    const toUpdate = {}
    for(let column in fields) {
      if(fields[column] !== undefined) toUpdate[column] = fields[column];
    }
    let routine;
    if (util.dbFields(fields).insert.length > 0) {
      const {rows} = await client.query(`
          UPDATE routines 
          SET ${ util.dbFields(toUpdate).insert }
          WHERE id=${ id }
          RETURNING *;
      `, Object.values(toUpdate));
      routine = rows[0];
      return routine;
    }
  } catch (error) {
    throw error;
  }
}
async function updateRoutineActivity ({id, ...fields}) {
  try {
    const toUpdate = {}
    for(let column in fields) {
      if(fields[column] !== undefined) toUpdate[column] = fields[column];
    }
    let routineActivity;
    if (util.dbFields(fields).insert.length > 0) {
      const {rows} = await client.query(`
        UPDATE routine_activities
        SET ${ util.dbFields(toUpdate).insert }
        WHERE id = ${ id }
        RETURNING *;
      `, Object.values(toUpdate));
      routineActivity = rows[0];
      return routineActivity;
    }
  } catch (error) {
    throw error;
  }
}

async function destroyRoutineActivity(id) {
  try {
    const {rows: [routineActivity]} = await client.query(`
        DELETE FROM routine_activities 
        WHERE id = $1
        RETURNING *;
    `, [id]);
    return routineActivity;
  } catch (error) {
    throw error;
  }
}

/*
async function canEditRoutineActivity(routineActivityId, userId) {
  try {
    // Correct the case sensitivity issue by adding double quotes around "routineId"
    const { rows: [routineActivity] } = await client.query(`
      SELECT routines.creatorId FROM routine_activities
      JOIN routines ON routine_activities."routineId" = routines.id
      WHERE routine_activities.id = $1;
    `, [routineActivityId]);

    if (!routineActivity) {
      console.log('Routine activity not found.');
      return false;
    }

    console.log(`Routine owner ID: ${routineActivity.creatorId}, User ID: ${userId}`);
    return parseInt(routineActivity.creatorId) === parseInt(userId);
  } catch (error) {
    console.error(`Error checking edit permissions: ${error}`);
    return false;
  }
}
*/
async function canEditRoutineActivity(routineActivityId, userId) {
  try {
    const { rows: [routineActivity] } = await client.query(`
    SELECT routines."creatorId" FROM routine_activities
    JOIN routines ON routine_activities."routineId" = routines.id
    WHERE routine_activities.id = $1;
`, [routineActivityId]);

  console.log('Checked permissions for routineActivityId:', routineActivityId, 'with userId:', userId);


      if (!routineActivity) {
          console.log('Routine activity not found.');
          return false;
      }

      console.log(`Routine owner ID: ${routineActivity.creatorId}, User ID: ${userId}`);
      return routineActivity.creatorId === userId;
  } catch (error) {
      console.error(`Error checking edit permissions: ${error}`);
      return false;
      console.error('Failed to check permissions for routine activity:', error);

  }
}






module.exports = {
  getRoutineActivityById,
  addActivityToRoutine,
  getAllRoutineActivities,
  getRoutineActivitiesByRoutine,
  updateRoutineActivity,
  destroyRoutineActivity,
  canEditRoutineActivity,
};