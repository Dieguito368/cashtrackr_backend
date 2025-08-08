import request from "supertest";
import server from "../../server";
import db from "../../config/db";
import { AuthController } from "../../controllers/AuthController";


beforeAll(async () => {
    await db.authenticate();
    await db.sync();
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
});