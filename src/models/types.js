// Model/type definitions.
//
// NOTE on TypeScript: a full TS migration would mean re-scaffolding this
// entire Vite project (`npm create vite -- --template react-ts`) and
// converting every existing .jsx file -- that's a large, separate, breaking
// change to code that already works today. Instead, these JSDoc @typedef
// blocks give the same IDE autocomplete/type-checking benefit in plain JS,
// and can be converted 1:1 into real TypeScript interfaces later with
// minimal rework if/when the project is migrated.

/**
 * @typedef {Object} Patient
 * @property {string} id
 * @property {string} qrToken
 * @property {string} name
 * @property {number|string} age
 * @property {string} gender
 * @property {string} contact
 * @property {string} bloodGroup
 * @property {string} diagnosis
 * @property {string} medicalHistory
 * @property {string} description
 * @property {PatientFile[]} files
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} PatientFile
 * @property {string} id
 * @property {string} name
 * @property {string} type
 * @property {number} size
 * @property {string} dataUrl
 * @property {string} [description]
 * @property {string} uploadedAt
 */

/**
 * @typedef {Object} Doctor
 * @property {string} id
 * @property {string} name
 * @property {string} specialization
 * @property {string} license
 * @property {number|string} experience
 * @property {"Pending"|"Approved"|"Rejected"} status
 * @property {string} createdAt
 */

/**
 * @typedef {Object} Appointment
 * @property {string} id
 * @property {string} doctorName
 * @property {string} date
 * @property {string} time
 * @property {string} reason
 * @property {"Upcoming"|"Cancelled"|"Completed"} status
 * @property {string} createdAt
 */

/**
 * @typedef {Object} AuditLogEntry
 * @property {string} id
 * @property {string} action
 * @property {string} details
 * @property {string} time
 * @property {string} browser
 */

/**
 * @typedef {Object} SystemStatus
 * @property {number} cpuUsagePercent
 * @property {number} memoryUsagePercent
 * @property {"connected"|"disconnected"} databaseStatus
 * @property {number} apiResponseTimeMs
 * @property {number} activeUsers
 * @property {boolean} simulated - true until a real backend reports this
 */

/**
 * @typedef {Object} SecurityEvent
 * @property {string} id
 * @property {"failed-login"|"blocked-user"|"suspicious-activity"} type
 * @property {string} detail
 * @property {string} time
 */

/**
 * @typedef {"Super Admin"|"Admin"|"Doctor"|"Patient"|"Moderator"|"Receptionist"} RoleName
 */

/**
 * @typedef {"view"|"create"|"edit"|"delete"|"export"|"approve"|"assign"} PermissionKey
 */

/**
 * @typedef {Object} RolePermissions
 * @property {RoleName} role
 * @property {Record<PermissionKey, boolean>} permissions
 */

export {}; // this file only exports types (via JSDoc), no runtime values
