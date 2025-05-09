// design-service/src/routes/design-routes.js
const express = require("express");
const designController = require("../controllers/design-controllers");
const authenticatedRequest = require("../middleware/auth-middleware");

const router = express.Router();

// Define routes with middleware applied to each
router.get("/", authenticatedRequest, designController.getUserDesigns);
router.get("/:id", authenticatedRequest, designController.getUserDesignsByID);
router.post("/", authenticatedRequest, designController.saveDesign);
router.delete("/:id", authenticatedRequest, designController.deleteDesign);

module.exports = router;