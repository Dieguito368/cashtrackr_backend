import request from "supertest";
import server from "../../server";
import db from "../../config/db";
import { AuthController } from "../../controllers/AuthController";
import User from "../../models/User";
import *  as authUtils from "../../utils/auth";
import *  as jwtUtils from "../../utils/jwt";

beforeAll(async () => {
    await db.authenticate();

    await db.sync({ force: true });
});

afterAll(async () => {
    await db.close();
});

describe("Authentication - Create Account", () => {
    it("Should display validation errors when form is empty", async () => {
        const res = await request(server)
            .post("/api/auth/create-account")
            .send({});

        const createAccountMock = jest.spyOn(AuthController, "createAccount");

        expect(res.statusCode).toBe(400);
        expect(res.statusCode).not.toBe(200);
        expect(res.body).toHaveProperty("errors");
        expect(res.body.errors).toHaveLength(5);
        expect(createAccountMock).not.toHaveBeenCalled();
    });

    it("Should return 400 status code when the email is invalid", async () => {
        const res = await request(server)
            .post("/api/auth/create-account")
            .send({
                name: "Diego",
                email: "not_valid_email",
                password: "12345678"
            });

        const createAccountMock = jest.spyOn(AuthController, "createAccount");

        expect(res.statusCode).toBe(400);
        expect(res.statusCode).not.toBe(200);
        expect(res.body).toHaveProperty("errors");
        expect(res.body.errors).toHaveLength(1);
        expect(res.body.errors[0]).toHaveProperty("msg", "Email no válido");
        expect(createAccountMock).not.toHaveBeenCalled();
    });

    it("Should return 400 status code when the password is less than 8 characters", async () => {
        const res = await request(server)
            .post("/api/auth/create-account")
            .send({
                name: "Diego",
                email: "bautistadiego368@gmail.com",
                password: "12345"
            });

        const createAccountMock = jest.spyOn(AuthController, "createAccount");

        expect(res.statusCode).toBe(400);
        expect(res.statusCode).not.toBe(200);
        expect(res.body).toHaveProperty("errors");
        expect(res.body.errors).toHaveLength(1);
        expect(res.body.errors[0]).toHaveProperty("msg", "El password es muy corto, debe tener al menos 8 caracteres");
        expect(createAccountMock).not.toHaveBeenCalled();
    });

    it("Should create a new user and return a success message", async () => {
        const res = await request(server)
            .post("/api/auth/create-account")
            .send({
                name: "Diego",
                email: "bautistadiego368@gmail.com",
                password: "12345678"
            });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty("message", "Cuenta creada correctamente");
        expect(res.body.ok).toBeTruthy();
    });

    it("Should return 409 conflict when a user is already registered", async () => {
        const userData = {
            name: "Diego",
            email: "bautistadiego368@gmail.com",
            password: "12345678"
        }

        const res = await request(server)
            .post("/api/auth/create-account")
            .send(userData);


        expect(res.statusCode).toBe(409);
        expect(res.statusCode).not.toBe(201);
        expect(res.body.ok).toBeFalsy();
        expect(res.body).toHaveProperty("message", "Ya existe una cuenta con ese Email");
        expect(res.body).not.toHaveProperty("errors");
    });
});

describe("Authentication - Account Confirmation with Token is empty", () => {
    it("Should display error if token is empty", async () => {
        const response = await request(server).post("/api/auth/confirm-account").send({ token: "" });

        expect(response.statusCode).toBe(400);
        expect(response.statusCode).not.toBe(200);
        expect(response.body).toHaveProperty("errors");
        expect(response.body.errors[0]).toHaveProperty("msg", "El token no puede ir vacio");
        expect(response.body.errors).toHaveLength(3);
    });

    it("Should display error if token is not valid", async () => {
        const response = await request(server)
            .post("/api/auth/confirm-account")
            .send({
                token: "not_valid"
            });

        expect(response.statusCode).toBe(400);
        expect(response.statusCode).not.toBe(200);
        expect(response.body).toHaveProperty("errors");
        expect(response.body.errors[1]).toHaveProperty("msg", "Token no válido");
        expect(response.body.errors).toHaveLength(2);
    });

    it("Should return error when token format is valid but does not exists", async () => {
        const response = await request(server)
            .post("/api/auth/confirm-account")
            .send({
                token: 123456
            });
        
        expect(response.statusCode).toBe(401);
        expect(response.statusCode).not.toBe(200);
        expect(response.body).toHaveProperty("ok");
        expect(response.body.ok).toBeFalsy();
        expect(response.body).toHaveProperty("message", "Token no válido");
    });
    
    it("Should confirm account with a valid token", async () => {
        const token = globalThis.cashTrackrConfirmationToken;

        const response = await request(server)
            .post("/api/auth/confirm-account")
            .send({ token });
        
        expect(response.statusCode).toBe(200);
        expect(response.statusCode).not.toBe(400);
        expect(response.body).toHaveProperty("ok");
        expect(response.body.ok).toBeTruthy();
        expect(response.body).toHaveProperty("message", "Cuenta confirmada correctamente");
    });
});

describe("Authentication - Login", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("Should display validation errors when the form is empty", async () => {
        const response = await request(server)
            .post("/api/auth/login")
            .send({});

        const loginMock = jest.spyOn(AuthController, "login");

        expect(response.status).toBe(400);
        expect(response.status).not.toBe(200);
        expect(response.body).toHaveProperty("errors");
        expect(response.body.errors).toHaveLength(3);
        expect(response.body.errors).not.toHaveLength(1);
        expect(response.body.errors[0]).toHaveProperty("msg", "El email no puede ir vacio");
        expect(response.body.errors[2]).toHaveProperty("msg", "El password no puede ir vacio");
        expect(loginMock).not.toHaveBeenCalled();
    });

    it("Should return 400 bad request when the email is invalid", async () => {
        const response = await request(server)
            .post("/api/auth/login")
            .send({
                email: "invalid_email",
                password: "12345678"
            });
        
        const loginMock = jest.spyOn(AuthController, "login");

        expect(response.status).toBe(400);
        expect(response.status).not.toBe(200);
        expect(response.body).toHaveProperty("errors");
        expect(response.body.errors).toHaveLength(1);
        expect(response.body.errors).not.toHaveLength(2);
        expect(response.body.errors[0]).toHaveProperty("msg", "Email no válido");
        expect(loginMock).not.toHaveBeenCalled();
    });

    it("Should return a 404 error if the user is not found", async () => {
        const response = await request(server)
            .post("/api/auth/login")
            .send({
                email: "user_not_found@test.com",
                password: "13112002"
            });

        expect(response.status).toBe(404);
        expect(response.status).not.toBe(200);
        expect(response.body).toHaveProperty("ok");
        expect(response.body.ok).toBeFalsy();
        expect(response.body).toHaveProperty("message", "No pudimos encontrar su cuenta de CrashTrackr");
    });
    
    // it("Should return a 403 error if the user account is not confirmed", async () => {
    //     (jest.spyOn(User, "findOne") as jest.Mock).mockResolvedValue({ 
    //         id: 1,
    //         confirmed: false,
    //         password: "hashedPassword",
    //         email: "user_not_confirmed@test.com"
    //     });
        
    //     const response = await request(server)
    //         .post("/api/auth/login")
    //         .send({
    //             email: "user_not_confirmed@test.com",
    //             password: "hashedPassword"
    //         });
        
    //     expect(response.status).toBe(403);
    //     expect(response.status).not.toBe(200);
    //     expect(response.body).toHaveProperty("ok");
    //     expect(response.body.ok).toBeFalsy();
    //     expect(response.body).toHaveProperty("message", "La cuenta no ha sido confirmada");
    // });

    it("Should return a 403 error if the user account is not confirmed", async () => {
        const userData = {
            email: "new_user@test.com",
            password: "password",
            name: "Test"    
        }

        await request(server).post("/api/auth/create-account").send(userData);

        const response = await request(server)
            .post("/api/auth/login")
            .send({
                email: userData.email,
                password: userData.password
            });
        
        expect(response.status).toBe(403);
        expect(response.status).not.toBe(200);
        expect(response.body).toHaveProperty("ok");
        expect(response.body.ok).toBeFalsy();
        expect(response.body).toHaveProperty("message", "La cuenta no ha sido confirmada");
    });

    it("Should return a 401 error if the password is incorrect", async () => {
        const findOneMock = (jest.spyOn(User, "findOne") as jest.Mock).mockResolvedValue({
            id: 1,
            confirmed: true,
            password: "hashedPassword",
            email: "user_confirmed@test.com"
        });

        const checkPasswordMock = jest.spyOn(authUtils, "checkPassword").mockResolvedValue(false);

        const response = await request(server)
            .post("/api/auth/login")
            .send({
                email: "user_confirmed@test.com",
                password: "wrong-password"
            });

        expect(response.status).toBe(401);
        expect(response.status).not.toBe(200);
        expect(response.body).toHaveProperty("ok");
        expect(response.body.ok).toBeFalsy();
        expect(response.body).toHaveProperty("message", "La contraseña no es correcta");
        expect(findOneMock).toHaveBeenCalledTimes(1);
        expect(checkPasswordMock).toHaveBeenCalledTimes(1);
    });

    it("Should log in successfully and return a token when credentials are valid", async () => {
        const findOneMock = (jest.spyOn(User, "findOne") as jest.Mock).mockResolvedValue({
            id: 1,
            confirmed: true,
            password: "hashedPassword",
            email: "user_confirmed@test.com"
        });

        const checkPasswordMock = jest.spyOn(authUtils, "checkPassword").mockResolvedValue(true);

        const generateJWTMock = jest.spyOn(jwtUtils, "generateJWT").mockReturnValue("jwt_token");

        const response = await request(server)
            .post("/api/auth/login")
            .send({
                email: "user_confirmed@test.com",
                password: "correct-password"
            });
        
        expect(response.status).toBe(200);
        expect(response.status).not.toBe(400);
        expect(response.body).toHaveProperty("ok");
        expect(response.body.ok).toBeTruthy();
        expect(response.body).toHaveProperty("token", "jwt_token");

        expect(findOneMock).toHaveBeenCalled();
        expect(findOneMock).toHaveBeenCalledTimes(1);
        
        expect(checkPasswordMock).toHaveBeenCalled();
        expect(checkPasswordMock).toHaveBeenCalledTimes(1);
        expect(checkPasswordMock).toHaveBeenCalledWith("correct-password", "hashedPassword");
        
        expect(generateJWTMock).toHaveBeenCalled();
        expect(generateJWTMock).toHaveBeenCalledTimes(1);
        expect(generateJWTMock).toHaveBeenCalledWith(1);
    });
});

let jwt: string;

const authenticateUser = async () => {
    const response = await request(server)
        .post("/api/auth/login")
        .send({ 
            email: "bautistadiego368@gmail.com", 
            password: "12345678" 
        });

    expect(response.statusCode).toBe(200);
    expect(response.statusCode).not.toBe(400);
    expect(response.body).toHaveProperty("ok", true);
    expect(response.body).toHaveProperty("token", response.body.token);

    jwt = response.body.token;
}

describe("GET /api/budgets", () => {
    beforeAll(async () => {
        jest.restoreAllMocks();
        
        await authenticateUser();
    });

    it("Should reject authenticated access to budgets without a JWT", async () => {
        const response = await request(server).get("/api/budgets");

        expect(response.statusCode).toBe(401);
        expect(response.statusCode).not.toBe(200);
        expect(response.body).toHaveProperty("ok", false);
        expect(response.body).toHaveProperty("message", "No autorizado");
    });
   
    it("Should reject authenticated access to budgets without a valid JWT", async () => {
        const response = await request(server).get("/api/budgets").auth("invalid_token", { type: "bearer" });

        expect(response.statusCode).toBe(401);
        expect(response.statusCode).not.toBe(200);
        expect(response.body).toHaveProperty("ok", false);
        expect(response.body).toHaveProperty("message", "Token no válido");
    });

    it("Should allow authenticated access to budgets with a valid jwt", async () => {
        const response = await request(server).get("/api/budgets").auth(jwt, { type: "bearer" });

        expect(response.statusCode).toBe(200);
        expect(response.statusCode).not.toBe(400);
        expect(response.body).toHaveProperty("ok", true);
        expect(response.body).toHaveProperty("budgets");
        expect(response.body.budgets).toHaveLength(0);
    });
});

describe("POST /api/budgets", () => {
    beforeAll(async () => {
        await authenticateUser();
    });

    it("Should reject authenticated post request to budgets without a jwt", async () => {
        const response = await request(server).post("/api/budgets");

        expect(response.statusCode).toBe(401);
        expect(response.statusCode).not.toBe(200);
        expect(response.body).toHaveProperty("ok", false);
        expect(response.body).toHaveProperty("message", "No autorizado");
    });

    it("Should display errors validation when the empty form is submitted", async () => {
        const response = await request(server).post("/api/budgets")
            .auth(jwt, { type: "bearer" })
            .send({ })

        expect(response.statusCode).toBe(400);
        expect(response.statusCode).not.toBe(200);
        expect(response.body).toHaveProperty("errors");
        expect(response.body.errors).toHaveLength(4);
        expect(response.body.errors[0]).toHaveProperty("msg", "El nombre del presupuesto no puede ir vacio");
        expect(response.body.errors[1]).toHaveProperty("msg", "La cantidad del presupuesto no puede ir vacio");
    });

    it("Should display errors validation when an invalid amount is submitted in the form", async () => {
        const response = await request(server).post("/api/budgets")
            .auth(jwt, { type: "bearer" })
            .send({ 
                name: "Test", 
                amount: "invalid_amount", 
            })

        expect(response.statusCode).toBe(400);
        expect(response.statusCode).not.toBe(200);
        expect(response.body).toHaveProperty("errors");
        expect(response.body.errors).toHaveLength(2);
        expect(response.body.errors[0]).toHaveProperty("msg", "La cantidad del presupuesto debe ser un número");
    });

    it("Should display errors validation when an amount less than or equal to 0 is submitted in the form", async () => {
        const response = await request(server).post("/api/budgets")
            .auth(jwt, { type: "bearer" })
            .send({ 
                name: "Test", 
                amount: 0, 
            });

        expect(response.statusCode).toBe(400);
        expect(response.statusCode).not.toBe(200);
        expect(response.body).toHaveProperty("errors");
        expect(response.body.errors).toHaveLength(1);
        expect(response.body.errors[0]).toHaveProperty("msg", "La cantidad del presupuesto debe ser mayor a 0");
    });

    it("Should create a budget successfully", async () => {
        const response = await request(server).post("/api/budgets")
            .auth(jwt, { type: "bearer" })
            .send({ 
                name: "Test", 
                amount: 100, 
            });

        expect(response.statusCode).toBe(201);
        expect(response.statusCode).not.toBe(400);
        expect(response.body).toHaveProperty("ok", true);
        expect(response.body).toHaveProperty("message", "Presupuesto creado correctamente");
    });
});

describe("GET /api/budgets/:id", () => {
     beforeAll(async () => {
        await authenticateUser();
    });

    it("Should reject authenticated get request to budget id without a jwt", async () => {
        const response = await request(server).get("/api/budgets/1");

        expect(response.statusCode).toBe(401);
        expect(response.statusCode).not.toBe(200);
        expect(response.body).toHaveProperty("ok", false);
        expect(response.body).toHaveProperty("message", "No autorizado");
    });

    it("Should return 400 bad request when id is not valid", async () => {
        const response = await request(server).get("/api/budgets/invalid_id").auth(jwt, { type: "bearer" });

        expect(response.statusCode).toBe(400);
        expect(response.statusCode).not.toBe(401);
        expect(response.statusCode).not.toBe(200);
        expect(response.body).toHaveProperty("errors");
        expect(response.body.errors).toHaveLength(1);
        expect(response.body.errors[0]).toHaveProperty("msg", "ID de presupuesto no válido");
    });

    it("Should return 404 when a budget does not exists", async () => {
        const response = await request(server).get("/api/budgets/100").auth(jwt, { type: "bearer" });

        expect(response.statusCode).toBe(404);
        expect(response.statusCode).not.toBe(200);
        expect(response.statusCode).not.toBe(400);
        expect(response.statusCode).not.toBe(401);
        expect(response.body).toHaveProperty("ok", false);
        expect(response.body).toHaveProperty("message", "Presupuesto no encontrado");
    });

    it("Should return a single budget by id", async () => {
        const response = await request(server).get("/api/budgets/1").auth(jwt, { type: "bearer" });

        expect(response.statusCode).toBe(200);
        expect(response.statusCode).not.toBe(404);
        expect(response.statusCode).not.toBe(400);
        expect(response.statusCode).not.toBe(401);
        expect(response.body).toHaveProperty("ok", true);
        expect(response.body).toHaveProperty("budget");
        expect(response.body.budget).toHaveProperty("id", 1);
    });
});

describe("PUT /api/budgets/:id", () => {
     beforeAll(async () => {
        await authenticateUser();
    });

    it("Should reject authenticated put request to budget id without a jwt", async () => {
        const response = await request(server).put("/api/budgets/1");

        expect(response.statusCode).toBe(401);
        expect(response.statusCode).not.toBe(200);
        expect(response.body).toHaveProperty("ok", false);
        expect(response.body).toHaveProperty("message", "No autorizado");
    });

    it("Should display validation errora if the form is empty", async () => {
        const response = await request(server)
            .put("/api/budgets/1")
            .auth(jwt, { type: "bearer" })
            .send({ });

        expect(response.statusCode).toBe(400);
        expect(response.statusCode).not.toBe(401);
        expect(response.statusCode).not.toBe(200);
        expect(response.body).toHaveProperty("errors");
        expect(response.body.errors).toHaveLength(4);
        expect(response.body.errors[0]).toHaveProperty("msg", "El nombre del presupuesto no puede ir vacio");
        expect(response.body.errors[1]).toHaveProperty("msg", "La cantidad del presupuesto no puede ir vacio");
    });

    it("Should update a budget by id and return a success", async () => {
        const response = await request(server)
            .put("/api/budgets/1")
            .auth(jwt, { type: "bearer" })
            .send({ 
                name: "Updated_test",
                amount: 200
            });

        expect(response.statusCode).toBe(200);
        expect(response.statusCode).not.toBe(401);
        expect(response.statusCode).not.toBe(400);
        expect(response.statusCode).not.toBe(404);
        expect(response.body).toHaveProperty("ok", true);
        expect(response.body.ok).not.toBeFalsy();
        expect(response.body).toHaveProperty("message", "Presupuesto actualizado correctamente");
    });
});

describe("DELETE /api/budgets/:id", () => {
     beforeAll(async () => {
        await authenticateUser();
    });

    it("Should reject authenticated put request to budget id without a jwt", async () => {
        const response = await request(server).delete("/api/budgets/1");

        expect(response.statusCode).toBe(401);
        expect(response.statusCode).not.toBe(200);
        expect(response.body).toHaveProperty("ok", false);
        expect(response.body).toHaveProperty("message", "No autorizado");
    });

    it("Should return 404 when a budget does not exists", async () => {
        const response = await request(server).delete("/api/budgets/100").auth(jwt, { type: "bearer" });

        expect(response.statusCode).toBe(404);
        expect(response.statusCode).not.toBe(200);
        expect(response.statusCode).not.toBe(400);
        expect(response.statusCode).not.toBe(401);
        expect(response.body).toHaveProperty("ok", false);
        expect(response.body).toHaveProperty("message", "Presupuesto no encontrado");
    });

    it("Should delete a budget and return a success message", async () => {
        const response = await request(server)
            .delete("/api/budgets/1")
            .auth(jwt, { type: "bearer" });

        expect(response.statusCode).toBe(200);
        expect(response.statusCode).not.toBe(401);
        expect(response.statusCode).not.toBe(400);
        expect(response.statusCode).not.toBe(404);
        expect(response.body).toHaveProperty("ok", true);
        expect(response.body.ok).not.toBeFalsy();
        expect(response.body).toHaveProperty("message", "Presupuesto eliminado correctamente");
    });
});