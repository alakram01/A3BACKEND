const supertest = require("supertest");
const app = require("./server");
const http = require("http");
const request = require("supertest");
const { describe, test } = require("@jest/globals");
// Your test code here

// describe("POST /users", () => {
//   describe("given a username and password", () => {
//     test("should respond with 200", async () => {
//       const response = await request(app).post("/users").send({
//         username: "username",
//         password: "password",
//       });
//       expect(response.statusCode).toBe(200);
//     });
//   });

//   test("should validate the request body and return a 400 status code if fields are missing", async () => {
//     const response = await supertest(app).post("/users").send({});
//     expect(response.statusCode).toBe(400);
//   });
// });

describe("POST /register", () => {
  describe("given a email and password", () => {
    test("should respond with 200", async () => {
      const response = await supertest(app).post("/register").send({
        email: "xyz1248949@gmail.com",
        name: "joe",
        password: "Chris123456@",
      });
      expect(response.statusCode).toBe(200);
    });
    test("should validate the request body and return a 400 status code if fields are missing", async () => {
      const response = await supertest(app).post("/register").send({});
      expect(response.statusCode).toBe(789);
    });
  });
});

describe("POST /signin", () => {
  describe("given a email and password", () => {
    test("should respond with 200", async () => {
      const response = await supertest(app).post("/signin").send({
        email: "xyz1238@gmail.com",
        password: "Chris123456@",
      });
      expect(response.statusCode).toBe(200);
    });
  });
  test("should validate the request body and return a 400 status code if fields are missing", async () => {
    const response = await supertest(app).post("/signin").send({});
    expect(response.statusCode).toBe(400);
  });
});
// test("should respond with 400 for invalid credentials", async () => {
//   const response = await supertest(app).post("/login").send({
//     email: "wrong",
//     password: "credentials"
//   });
//   expect(response.statusCode).toBe(400);
// });

describe("GET /", () => {
  test('should respond with success when statement is "test"', async () => {
    const response = await supertest(app).get("/").send({ statement: "test" });
    expect(response.statusCode).toBe(200);
    expect(response.body).toBe("Success"); // Assuming you expect the response body to be 'Success'
  });
});

describe("POST /clientprofile", () => {
  describe("given a client info", () => {
    test("should respond with 200", async () => {
      const requestData = {
        fullname: "John Doe",
        name: "SRK",
        address1: "123 Main St",
        city: "Anytown",
        selectedState: "NY",
        zipcode: "12345",
        id: 4,
      };
      const response = await supertest(app)
        .post("/clientprofile")
        .send(requestData);
      console.log("Response:", response.body);
      expect(response.statusCode).toBe(200);
    });
  });

  describe("when email and password is not there", () => {});
});

describe("POST /updateprofile", () => {
  describe("given a client info", () => {
    test("should respond with 200", async () => {
      const requestData = {
        fullname: "John Doe",
        address1: "123 Main St",
        city: "Anytown",
        selectedState: "NY",
        zipcode: "12345",
        id: 4,
      };
      const response = await supertest(app)
        .post("/updateprofile")
        .send(requestData);
      console.log("Response:", response.body);
      expect(response.statusCode).toBe(200);
    });
  });

  describe("when email and password is not there", () => {});
});

describe("POST /qoutehistory", () => {
  describe("given a id for quote history", () => {
    test("should respond with 200", async () => {
      const response = await supertest(app).post("/qoutehistory").send({
        id: 12534,
      });
      expect(response.statusCode).toBe(200);
    });
  });

  describe("when email and password is not there", () => {});
});

describe("POST /GetQuote", () => {
  describe("given a id for quote history", () => {
    test("should respond with 200", async () => {
      const response = await supertest(app).post("/GetQuote").send({
        gallonsRequested: 799,
        deliveryDate: "01-10-2024",
        deliveryAddress: "789 St",
        id: 4,
        clientName: "Cena Doe",
      });
      expect(response.statusCode).toBe(200);
    });
  });

  describe("when email and password is not there", () => {});
});

describe("POST /PseudoQuote", () => {
  describe("given a id for quote history", () => {
    test("should respond with 200", async () => {
      const response = await supertest(app).post("/PseudoQuote").send({
        gallonsRequested: 799,
        deliveryDate: "01-10-2024",
        deliveryAddress: "789 St",
        id: 4,
        clientName: "Cena Doe",
      });
      expect(response.statusCode).toBe(200);
    });
  });

  describe("when email and password is not there", () => {});
});

// const server = http.createServer(app);

// afterAll(async () => {
//   // Close the server after all tests are done
//   await new Promise((resolve) => server.close(resolve));
// });

// // describe('post  /clientprofile', () => {
// //   const userData = {
// //     id: '123', // Provide appropriate user ID
// //     fullname: 'John Doe',
// //     address1: '123 Main St',
// //     address2: '',
// //     city: 'Anytown',
// //     selectedState: 'NY',
// //     zipcode: '12345',
// //   };

// //   it('should update user profile', async () => {
// //     const response = await request(app)
// //       //.post('/clientprofile')
// //       //.send(userData);

// //     // Check the response status code
// //     //received(response.statusCode).toBe(200);

// //     // Check if the response body contains updated user profile data
// //     expect(response.body.id).toBe(userData.id);
// //     expect(response.body.fullname).toBe(userData.fullname);
// //     expect(response.body.address1).toBe(userData.address1);
// //     expect(response.body.address2).toBe(userData.address2);
// //     expect(response.body.city).toBe(userData.city);
// //     expect(response.body.selectedState).toBe(userData.selectedState);
// //     expect(response.body.zipcode).toBe(userData.zipcode);
// //     // Add more assertions as needed to validate the response
// //   });
// // });
