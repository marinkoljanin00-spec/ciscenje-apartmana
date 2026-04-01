module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo-experimental.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo-experimental.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo-experimental.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo-experimental.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo-experimental.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo-experimental.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo-experimental.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo-experimental.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/app/api/jobs/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DELETE",
    ()=>DELETE,
    "GET",
    ()=>GET,
    "POST",
    ()=>POST,
    "dynamic",
    ()=>dynamic
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$neondatabase$2b$serverless$40$0$2e$10$2e$4$2f$node_modules$2f40$neondatabase$2f$serverless$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@neondatabase+serverless@0.10.4/node_modules/@neondatabase/serverless/index.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.0_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/headers.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.0_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/server.js [app-route] (ecmascript)");
;
;
;
const dynamic = "force-dynamic";
const SESSION_COOKIE = "marketplace_session";
function getSQL() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        throw new Error("DATABASE_URL is not set");
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$neondatabase$2b$serverless$40$0$2e$10$2e$4$2f$node_modules$2f40$neondatabase$2f$serverless$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["neon"])(databaseUrl);
}
async function getCurrentUser() {
    try {
        const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
        const sessionCookie = cookieStore.get(SESSION_COOKIE);
        if (!sessionCookie?.value) {
            return null;
        }
        const [userId] = sessionCookie.value.split(":");
        if (!userId) {
            return null;
        }
        const sql = getSQL();
        const users = await sql`
      SELECT id, email, full_name, role, created_at 
      FROM users WHERE id = ${parseInt(userId, 10)}
    `;
        if (users.length === 0) {
            return null;
        }
        return users[0];
    } catch  {
        return null;
    }
}
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const role = searchParams.get("role");
        const userId = searchParams.get("userId");
        const filterUrgent = searchParams.get("urgent");
        const filterType = searchParams.get("propertyType");
        // Try to get user from cookie first, then fall back to userId param
        let clientId = null;
        const user = await getCurrentUser();
        if (user) {
            clientId = user.id;
        } else if (userId) {
            clientId = parseInt(userId, 10);
        }
        const sql = getSQL();
        if (role === "client" && clientId) {
            // Return client's own jobs with application count
            const jobs = await sql`
        SELECT j.id, j.title, j.location, j.price, j.status, j.created_at, j.cleaner_id,
               j.property_type, j.is_urgent, j.description,
               u.full_name as cleaner_name, u.phone as cleaner_phone, u.email as cleaner_email,
               (SELECT COUNT(*) FROM applications WHERE job_id = j.id) as application_count
        FROM jobs j
        LEFT JOIN users u ON j.cleaner_id = u.id
        WHERE j.client_id = ${clientId}
        ORDER BY j.is_urgent DESC, j.created_at DESC
      `;
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                jobs
            });
        } else {
            // Return all open jobs for cleaners with filters
            let jobs;
            if (filterUrgent === 'true' && filterType) {
                jobs = await sql`
          SELECT j.id, j.title, j.location, j.price, j.status, j.created_at, j.property_type, j.is_urgent, j.description, j.latitude, j.longitude,
                 u.full_name as client_name
          FROM jobs j
          JOIN users u ON j.client_id = u.id
          WHERE j.status = 'open' AND j.is_urgent = true AND j.property_type = ${filterType}
          ORDER BY j.is_urgent DESC, j.created_at DESC
        `;
            } else if (filterUrgent === 'true') {
                jobs = await sql`
          SELECT j.id, j.title, j.location, j.price, j.status, j.created_at, j.property_type, j.is_urgent, j.description, j.latitude, j.longitude,
                 u.full_name as client_name
          FROM jobs j
          JOIN users u ON j.client_id = u.id
          WHERE j.status = 'open' AND j.is_urgent = true
          ORDER BY j.created_at DESC
        `;
            } else if (filterType) {
                jobs = await sql`
          SELECT j.id, j.title, j.location, j.price, j.status, j.created_at, j.property_type, j.is_urgent, j.description, j.latitude, j.longitude,
                 u.full_name as client_name
          FROM jobs j
          JOIN users u ON j.client_id = u.id
          WHERE j.status = 'open' AND j.property_type = ${filterType}
          ORDER BY j.is_urgent DESC, j.created_at DESC
        `;
            } else {
                jobs = await sql`
          SELECT j.id, j.title, j.location, j.price, j.status, j.created_at, j.property_type, j.is_urgent, j.description, j.latitude, j.longitude,
                 u.full_name as client_name
          FROM jobs j
          JOIN users u ON j.client_id = u.id
          WHERE j.status = 'open'
          ORDER BY j.is_urgent DESC, j.created_at DESC
        `;
            }
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                jobs
            });
        }
    } catch  {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            jobs: []
        });
    }
}
async function POST(request) {
    try {
        const { title, location, price, userId, propertyType, isUrgent, description, latitude, longitude } = await request.json();
        // Try to get user from cookie first, then fall back to userId from body
        let clientId = null;
        const user = await getCurrentUser();
        if (user) {
            clientId = user.id;
        } else if (userId) {
            clientId = parseInt(userId, 10);
        }
        if (!clientId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "Niste prijavljeni."
            }, {
                status: 401
            });
        }
        if (!title || !location || isNaN(price)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "Sva polja su obavezna."
            }, {
                status: 400
            });
        }
        // Calculate final price (1.5x for urgent)
        const finalPrice = isUrgent ? price * 1.5 : price;
        const sql = getSQL();
        const result = await sql`
      INSERT INTO jobs (title, location, price, status, client_id, property_type, is_urgent, description, latitude, longitude, created_at)
      VALUES (${title}, ${location}, ${finalPrice}, 'open', ${clientId}, ${propertyType || 'stan'}, ${isUrgent || false}, ${description || null}, ${latitude || null}, ${longitude || null}, NOW())
      RETURNING id, title, location, price, status, property_type, is_urgent, created_at
    `;
        // Update client's total_spent
        await sql`UPDATE users SET total_spent = total_spent + ${finalPrice} WHERE id = ${clientId}`;
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            job: result[0]
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Nepoznata greška";
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: message
        }, {
            status: 500
        });
    }
}
async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const jobId = searchParams.get("jobId");
        const userId = searchParams.get("userId");
        if (!jobId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "jobId je obavezan"
            }, {
                status: 400
            });
        }
        const sql = getSQL();
        // Verify ownership
        const job = await sql`SELECT client_id, price FROM jobs WHERE id = ${parseInt(jobId)}`;
        if (job.length === 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "Posao nije pronađen"
            }, {
                status: 404
            });
        }
        if (job[0].client_id !== parseInt(userId || '0')) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "Nemate dozvolu za brisanje ovog posla"
            }, {
                status: 403
            });
        }
        // Delete job (applications will be cascade deleted)
        await sql`DELETE FROM jobs WHERE id = ${parseInt(jobId)}`;
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Nepoznata greška";
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: message
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0--tt9a._.js.map