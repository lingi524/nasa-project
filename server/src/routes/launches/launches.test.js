const request = require('supertest');
const app = require('../../app');

describe('Test GET /launches', () => {
  test('It should respond with 200 seccess', async () => {
    const response = await request(app)
    .get('/launches')
    .expect('Content-Type', /json/)
    .expect(200)
  })
});

describe('Test POST /launches', () => {
  const completeLaunchData = {
    mission: "USS",
    rocket: "NCC",
    target: "Kepler",
    launchDate: "January 17, 2024"
  }
  const invalidLaunchDate = {
    mission: "USS",
    rocket: "NCC",
    target: "Kepler",
    launchDate: "Zooom"
  }

  const launchDataWithoutDate = {
    mission: "USS",
    rocket: "NCC",
    target: "Kepler",
  }

  test('It should respond with 201 created', async () => {
    const response = await request(app)
    .post('/launches')
    .send(completeLaunchData)
    .expect('Content-Type', /json/)
    .expect(201);

    const requestDate = new Date(completeLaunchData.launchDate).valueOf();
    const responseDate = new Date(response.body.launchDate).valueOf();
    expect(responseDate).toBe(requestDate);

    expect(response.body).toMatchObject(launchDataWithoutDate)
  });

  test('It should catch missing required poroperties', async () => {
    const response = await request(app)
    .post('/launches')
    .send(launchDataWithoutDate)
    .expect('Content-Type', /json/)
    .expect(400);

    expect(response.body).toStrictEqual({
      error: "Missing required launch property"
    });
  });

  test('It should catch invalid dates', async() => {
    const response = await request(app)
    .post('/launches')
    .send(invalidLaunchDate)
    .expect('Content-Type', /json/)
    .expect(400);

    expect(response.body).toStrictEqual({
      error: "Invalid launch date"
    });
  });
});



