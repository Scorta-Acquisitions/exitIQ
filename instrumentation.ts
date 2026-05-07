import { registerOTel } from "@vercel/otel"

export function register() {
  registerOTel({
    serviceName: "scorta-api",
    attributes: {
      // Populated automatically by Vercel; useful for correlating traces to deploys
      "deployment.environment": process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development",
      "service.version": process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "local",
    },
  })

  // Catch unhandled promise rejections that escape individual try/catch blocks.
  // These surface in Vercel Function logs as "UnhandledPromiseRejection" without context;
  // this handler adds a structured log line before Node terminates the process.
  if (process.env.NEXT_RUNTIME === "nodejs") {
    process.on("unhandledRejection", (reason: unknown) => {
      const error = reason instanceof Error ? reason.message : String(reason)
      console.error(
        JSON.stringify({
          t: new Date().toISOString(),
          lvl: "error",
          evt: "unhandled_rejection",
          svc: "scorta-api",
          error,
        })
      )
    })
  }
}
