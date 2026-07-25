const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const createAuditLog = require("../utils/auditLogger");

/*
====================================
MAIL TRANSPORT (same pattern as orderController)
====================================
*/
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// REGISTER ADMIN / STAFF (Only available to existing admins)
const registerAdmin = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        message: "Invalid email address"
      });
    }
    if (
      !validator.isStrongPassword(password, {
        minLength: 8,
        minUppercase: 1,
        minLowercase: 1,
        minNumbers: 1,
        minSymbols: 1
      })
    ) {
      return res.status(400).json({
        message: "Password must contain uppercase, lowercase, number and symbol."
      });
    }
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // CHECK EXISTING
    // CHECK EXISTING
    const existingAdmin = await Admin.findOne({
      email: email.toLowerCase()
    });

    if (existingAdmin) {
      return res.status(400).json({
        message: "Account already exists with this email"
      });
    }

    // HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    // CREATE USER
    const admin = await Admin.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || "staff",
    });
    await createAuditLog({
      req,
      adminId: req.admin._id,
      action: "CREATE",
      module: "ADMIN",
      targetId: admin._id,
      description: `Created admin account: ${admin.email}`,
    });
    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        createdAt: admin.createdAt,
      },
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// LOGIN ADMIN / STAFF
const loginAdmin = async (req, res) => {

  try {

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        message: "Invalid email format"
      });
    }

    const admin = await Admin.findOne({
      email: email.toLowerCase()
    });

    if (!admin) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    if (
      admin.lockUntil &&
      admin.lockUntil > Date.now()
    ) {
      return res.status(423).json({
        message:
          "Account locked because of multiple failed login attempts. Please try again later."
      });
    }

    const match = await bcrypt.compare(
      password,
      admin.password
    );

    if (!match) {

      admin.failedLoginAttempts += 1;

      if (admin.failedLoginAttempts >= 5) {

        admin.lockUntil =
          Date.now() + 30 * 60 * 1000;

      }

      await admin.save();

      return res.status(401).json({
        message: "Invalid email or password"
      });

    }

    admin.failedLoginAttempts = 0;
    admin.lockUntil = null;
    admin.lastLogin = new Date();

    await admin.save();
    await createAuditLog({
      req,
      adminId: admin._id,
      action: "LOGIN",
      module: "AUTH",
      description: `${admin.name} logged into admin panel`,
    });
    const token = jwt.sign(
      {
        _id: admin._id,
        role: admin.role,
        name: admin.name
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    return res.status(200).json({

      message: "Login successful",

      token,

      user: {

        id: admin._id,

        name: admin.name,

        email: admin.email,

        role: admin.role

      }

    });

  }

  catch (error) {

    return res.status(500).json({
      message: error.message
    });

  }

};
// FORGOT PASSWORD — request a reset link (Public)
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({
        message: "A valid email is required"
      });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() });

    // Don't reveal whether the email exists — same response either way.
    if (!admin) {
      return res.status(200).json({
        message: "If an account exists for this email, a reset link has been sent."
      });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    admin.resetPasswordToken = hashedToken;
    admin.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes
    await admin.save();

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const resetUrl = `${clientUrl}/admin/reset-password/${rawToken}`;

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: admin.email,
        subject: "Reset your Comfort Livings admin password",
        html: `
          <h2>Password Reset Request</h2>
          <p>Hi ${admin.name}, we received a request to reset your admin password.</p>
          <p><a href="${resetUrl}">Click here to reset your password</a></p>
          <p>This link will expire in 30 minutes. If you did not request this, you can safely ignore this email.</p>
        `
      });
    } catch (mailError) {
      // Roll back the token so a broken mail server doesn't leave a
      // dangling reset token the admin can never see.
      admin.resetPasswordToken = undefined;
      admin.resetPasswordExpire = undefined;
      await admin.save();
      return res.status(500).json({
        message: "Failed to send reset email. Please try again later."
      });
    }

    await createAuditLog({
      req,
      adminId: admin._id,
      action: "UPDATE",
      module: "AUTH",
      targetId: admin._id,
      description: `Password reset requested for ${admin.email}`,
    });

    return res.status(200).json({
      message: "If an account exists for this email, a reset link has been sent."
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// RESET PASSWORD — consume the token and set a new password (Public)
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Reset token is required" });
    }

    if (
      !validator.isStrongPassword(password, {
        minLength: 8,
        minUppercase: 1,
        minLowercase: 1,
        minNumbers: 1,
        minSymbols: 1
      })
    ) {
      return res.status(400).json({
        message: "Password must contain uppercase, lowercase, number and symbol."
      });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const admin = await Admin.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!admin) {
      return res.status(400).json({
        message: "Reset link is invalid or has expired. Please request a new one."
      });
    }

    admin.password = await bcrypt.hash(password, 10);
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpire = undefined;
    admin.failedLoginAttempts = 0;
    admin.lockUntil = null;
    await admin.save();

    await createAuditLog({
      req,
      adminId: admin._id,
      action: "UPDATE",
      module: "AUTH",
      targetId: admin._id,
      description: `Password reset completed for ${admin.email}`,
    });

    return res.status(200).json({
      message: "Password reset successfully. You can now sign in with your new password."
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// GET ALL ADMINS / STAFF
const getUsers = async (req, res) => {

  try {

    const users = await Admin
      .find()
      .select("-password -resetPasswordToken -resetPasswordExpire");

    return res.status(200).json({
      success: true,
      users
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }

};
// DELETE USER (Admin only)
const deleteUser = async (req, res) => {
  try {
    const user = await Admin.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    await createAuditLog({
      req,
      adminId: req.admin._id,
      action: "DELETE",
      module: "ADMIN",
      targetId: user._id,
      description: `Deleted admin account: ${user.email}`,
    });
    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerAdmin,
  loginAdmin,
  forgotPassword,
  resetPassword,
  getUsers,
  deleteUser,
};