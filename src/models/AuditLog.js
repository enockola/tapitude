const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    actorUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    action: {
      type: String,
      required: true
    },
    targetType: {
      type: String
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId
    },
    metadata: {
      type: Object,
      default: {}
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("AuditLog", auditLogSchema);
