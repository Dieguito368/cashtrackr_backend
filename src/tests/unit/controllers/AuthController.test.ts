import { createRequest, createResponse } from "node-mocks-http";
import { AuthController } from "../../../controllers/AuthController";
import User from "../../../models/User";
import { hashPassword } from "../../../utils/auth";
import { generateToken } from "../../../utils/token";
import { AuthEmail } from "../../../emails/AuthEmail";

jest.mock("../../../models/User");
jest.mock("../../../utils/auth");
jest.mock("../../../utils/token");

describe("AuthController.createAccount", () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })
    
    it("Should return a 409 status and a error message if the email is already register", async () => {
        (User.findOne as jest.Mock).mockResolvedValue(true);

        const req = createRequest({
            method: "POST",
            url: "/api/auth/create-account",
            body: { email: "test@test.com", password: "test" }
        });

        const res = createResponse();

        await AuthController.createAccount(req, res);

        const data = res._getJSONData();

        expect(res.statusCode).toBe(409);
        expect(res.statusCode).not.toBe(200);
        expect(data).toHaveProperty("ok", false);
        expect(data).not.toHaveProperty("ok", true);
        expect(data).toHaveProperty("message", "Ya existe una cuenta con ese Email");
        expect(User.findOne).toHaveBeenCalled();
        expect(User.findOne).toHaveBeenCalledTimes(1);
    });

    it("Should register a new user and return a success message", async () => {
        const req = createRequest({
            method: "POST", 
            url: "/api/auth/create-account",
            body: { email: "test@test.com", password: "test", name: "testname" }
        });

        const res = createResponse();
        
        const mockUser = { 
            ...req.body,
            save: jest.fn()
        };
        
        (User.create as jest.Mock).mockResolvedValue(mockUser);
        
        (hashPassword as jest.Mock).mockResolvedValue("hashedpassword");

        (generateToken as jest.Mock).mockReturnValue("123456");

        jest.spyOn(AuthEmail, "sendConfirmationEmail").mockImplementation(() => Promise.resolve());

        await AuthController.createAccount(req, res);

        const data = res._getJSONData();

        expect(User.create).toHaveBeenCalledWith(req.body);
        expect(User.create).toHaveBeenCalledTimes(1);
        expect(mockUser.save).toHaveBeenCalled();
        expect(mockUser.password).toBe("hashedpassword");
        expect(mockUser.token).toBe("123456");
        expect(AuthEmail.sendConfirmationEmail).toHaveBeenCalledWith({
            name: req.name,
            email: req.email,
            token: "123456"
        });
        expect(AuthEmail.sendConfirmationEmail).toHaveBeenCalledTimes(1);
        expect(res.statusCode).toBe(201);
        expect(res.statusCode).not.toBe(500);
        expect(data).toHaveProperty("ok", true);
        expect(data).not.toHaveProperty("ok", false);
        expect(data).not.toHaveProperty("message", "Cuenta creada correctamente");
    });

    // PENDIENTE
    it("Error", async () => {
        const req = createRequest({
            method: "POST",
            url: "/api/auth/create-account",
            body: { email: "test@test.com", password: "test", name: "testname" }
        });

        const res = createResponse();

        await AuthController.createAccount(req, res);
    });
});
