import { createRequest, createResponse } from "node-mocks-http";
import { AuthController } from "../../../controllers/AuthController";
import User from "../../../models/User";
import { checkPassword, hashPassword } from "../../../utils/auth";
import { generateToken } from "../../../utils/token";
import { AuthEmail } from "../../../emails/AuthEmail";
import { generateJWT } from "../../../utils/jwt";

jest.mock("../../../models/User");
jest.mock("../../../utils/auth");
jest.mock("../../../utils/token");
jest.mock("../../../utils/jwt");

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
        
        (User.build as jest.Mock).mockReturnValue(mockUser);
        
        (hashPassword as jest.Mock).mockResolvedValue("hashedpassword");

        (generateToken as jest.Mock).mockReturnValue("123456");

        jest.spyOn(AuthEmail, "sendConfirmationEmail").mockImplementation(() => Promise.resolve());

        await AuthController.createAccount(req, res);

        const data = res._getJSONData();

        expect(User.build).toHaveBeenCalledWith(req.body);
        expect(User.build).toHaveBeenCalledTimes(1);
        expect(mockUser.save).toHaveBeenCalled();
        expect(mockUser.password).toBe("hashedpassword");
        expect(mockUser.token).toBe("123456");
        expect(AuthEmail.sendConfirmationEmail).toHaveBeenCalledWith({
            name: req.body.name,
            email: req.body.email,
            token: "123456"
        });
        expect(AuthEmail.sendConfirmationEmail).toHaveBeenCalledTimes(1);
        expect(res.statusCode).toBe(201);
        expect(res.statusCode).not.toBe(500);
        expect(data).toHaveProperty("ok", true);
        expect(data).not.toHaveProperty("ok", false);
        expect(data).toHaveProperty("message", "Cuenta creada correctamente");
    });
});

describe("AuthController.login", () => {
    it("Should return 404 if user exists is not found", async () => {
        (User.findOne as jest.Mock).mockResolvedValue(null);

        const req = createRequest({ 
            method: "POST",
            url: "/api/auth/login",
            body: { email: "test@test.com", password: "test" }
        });

        const res = createResponse();

        await AuthController.login(req, res);

        const data = res._getJSONData();

        expect(res.statusCode).toBe(404);
        expect(data).toHaveProperty("ok", false);
        expect(data).not.toHaveProperty("ok", true);
        expect(data).toHaveProperty("message", "No pudimos encontrar su cuenta de CrashTrackr");
    }); 

    it("Should return 403 if the account has not been confirmed", async () => {
        (User.findOne as jest.Mock).mockResolvedValue({ 
            id: 1,
            email: "test@test.com",
            password: "password",
            confirmed: false
        });

        const req = createRequest({ 
            method: "POST",
            url: "/api/auth/login",
            body: { email: "test@test.com", password: "test" }
        });

        const res = createResponse();

        await AuthController.login(req, res);

        const data = res._getJSONData();

        expect(res.statusCode).toBe(403);
        expect(data).toHaveProperty("ok", false);
        expect(data).not.toHaveProperty("ok", true);
        expect(data).toHaveProperty("message", "La cuenta no ha sido confirmada");
    });

    it("Should return 401 if the password is incorrect", async () => {
        const userMock = {
            id: 1,
            email: "test@test.com",
            password: "password",
            confirmed: true
        };

        (User.findOne as jest.Mock).mockResolvedValue(userMock);

        const req = createRequest({ 
            method: "POST",
            url: "/api/auth/login",
            body: { email: "test@test.com", password: "test" }
        });

        const res = createResponse();

        (checkPassword as jest.Mock).mockResolvedValue(false);

        await AuthController.login(req, res);

        const data = res._getJSONData();

        expect(res.statusCode).toBe(401);
        expect(checkPassword).toHaveBeenCalledWith(req.body.password, userMock.password);
        expect(checkPassword).toHaveBeenCalledTimes(1);
        expect(data).toHaveProperty("ok", false);
        expect(data).not.toHaveProperty("ok", true);
        expect(data).toHaveProperty("message", "La contraseña no es correcta");
    }); 

    it("Should return a JWT if authentication is successfull", async () => {
        const userMock = {
            id: 1,
            email: "test@test.com",
            password: "hashed_password",
            confirmed: true
        };


        const req = createRequest({ 
            method: "POST",
            url: "/api/auth/login",
            body: { email: "test@test.com", password: "password" }
        });

        const res = createResponse();

        const fakejwt = "fakejwt";

        (User.findOne as jest.Mock).mockResolvedValue(userMock);
        (checkPassword as jest.Mock).mockResolvedValue(true);
        (generateJWT as jest.Mock).mockReturnValue(fakejwt);

        await AuthController.login(req, res);

        const data = res._getJSONData();

        expect(res.statusCode).toBe(200);
        expect(generateJWT).toHaveBeenCalledTimes(1);
        expect(generateJWT).toHaveBeenCalledWith(userMock.id);
        expect(data).toHaveProperty("ok", true);
        expect(data).not.toHaveProperty("ok", false);
        expect(data).toHaveProperty("token", "fakejwt");
    }); 
});