import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import emailOtpModel from "../src/models/emailOtp.js";
import userModelSchema from "../src/models/userModel.js";

dotenv.config();

const BASE = "http://localhost:5000/api/auth";
const testEmail = `authtest_${Date.now()}@example.com`;
const testPassword = "testpass123";
const testOtp = "654321";

const request = async (path, options = {}) => {
    const response = await fetch(`${BASE}${path}`, {
        headers: { "Content-Type": "application/json", ...options.headers },
        ...options,
    });

    const body = await response.json().catch(() => ({}));
    return { status: response.status, body };
};

const seedOtp = async (email, code) => {
    const codeHash = await bcrypt.hash(code, 10);
    await emailOtpModel.create({
        email,
        purpose: "registration",
        codeHash,
        expireAt: new Date(Date.now() + 5 * 60 * 1000),
        attempts: 0,
        consumeAt: null,
    });
};

const cleanup = async (email) => {
    await userModelSchema.deleteOne({ email });
    await emailOtpModel.deleteMany({ email });
};

const assert = (label, condition, details = "") => {
    const status = condition ? "PASS" : "FAIL";
    console.log(`[${status}] ${label}${details ? ` — ${details}` : ""}`);
    if (!condition) process.exitCode = 1;
};

await mongoose.connect(process.env.MONGO_URI);
await cleanup(testEmail);

console.log("\n=== Auth API Test Flow ===\n");
console.log(`Test email: ${testEmail}\n`);

let r = await request("/request-otp", { method: "POST", body: JSON.stringify({}) });
assert("request-otp rejects missing email", r.status === 400, `status ${r.status}`);

r = await request("/verify-otp", { method: "POST", body: JSON.stringify({ email: testEmail, otp: "000000" }) });
assert("verify-otp rejects invalid OTP", r.status === 400, `status ${r.status}`);

r = await request("/login", { method: "POST", body: JSON.stringify({}) });
assert("login rejects missing fields", r.status === 400, `status ${r.status}`);

r = await request("/login", { method: "POST", body: JSON.stringify({ email: testEmail, password: "wrong" }) });
assert("login rejects unknown user", r.status === 400, `status ${r.status}`);

r = await request("/profile", { method: "GET" });
assert("profile requires auth", r.status === 401, `status ${r.status}`);

r = await request("/profile", { method: "PUT", body: JSON.stringify({ businessName: "Test" }) });
assert("update profile requires auth", r.status === 401, `status ${r.status}`);

await seedOtp(testEmail, testOtp);

r = await request("/verify-otp", { method: "POST", body: JSON.stringify({ email: testEmail, otp: testOtp }) });
assert("verify-otp accepts valid OTP", r.status === 200, `status ${r.status}`);

r = await request("/register", {
    method: "POST",
    body: JSON.stringify({
        username: "Auth Test User",
        email: testEmail,
        password: testPassword,
        emailOtp: testOtp,
        businessName: "Auth Test Business",
    }),
});
assert("register creates user", r.status === 201 && r.body.token, `status ${r.status}`);
const token = r.body.token;

r = await request("/register", {
    method: "POST",
    body: JSON.stringify({
        username: "Duplicate",
        email: testEmail,
        password: testPassword,
        emailOtp: testOtp,
    }),
});
assert("register rejects duplicate email", r.status === 400, `status ${r.status}`);

r = await request("/request-otp", { method: "POST", body: JSON.stringify({ email: testEmail }) });
assert("request-otp rejects existing user", r.status === 400, `status ${r.status}`);

r = await request("/login", { method: "POST", body: JSON.stringify({ email: testEmail, password: testPassword }) });
assert("login succeeds", r.status === 200 && r.body.token, `status ${r.status}`);

r = await request("/login", { method: "POST", body: JSON.stringify({ email: testEmail, password: "wrongpass" }) });
assert("login rejects wrong password", r.status === 400, `status ${r.status}`);

r = await request("/profile", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
});
assert("get profile with token", r.status === 200 && r.body.user?.email === testEmail, `status ${r.status}`);

r = await request("/profile", {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ businessName: "Updated Business", timezone: "UTC" }),
});
assert("update profile with token", r.status === 200 && r.body.user?.businessName === "Updated Business", `status ${r.status}`);

r = await request("/profile", {
    method: "GET",
    headers: { Authorization: "Bearer invalid-token" },
});
assert("profile rejects invalid token", r.status === 401, `status ${r.status}`);

await cleanup(testEmail);
await mongoose.disconnect();

console.log("\n=== Done ===\n");
