export async function GET(request: Request) {
    try {
        const evoluOwnerId: String = await request.json()
        const dbName = 'evolu-' + evoluOwnerId

        const checkDbResponse = await fetch(
            `https://api.turso.tech/v1/organizations/ibbs/databases/${dbName}`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.TURSO_API_TOKEN}`,
                    'Content-Type': 'application/json',
                },
            }
        )

        if (!checkDbResponse.ok) {
            throw new Error(
                `Database check failed: ${checkDbResponse.statusText}`
            )
        }

        const usage = await fetch(
            `https://api.turso.tech/v1/organizations/ibbs/databases/${dbName}/usage`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${process.env.TURSO_API_TOKEN}`,
                    'Content-Type': 'application/json',
                },
            }
        )

        if (!usage.ok) {
            throw new Error(`Usage check failed: ${usage.statusText}`)
        }

        return usage
    } catch (error) {
        return new Response(
            JSON.stringify({
                error:
                    error instanceof Error
                        ? error.message
                        : 'An unknown error occurred',
            }),
            { status: 500 }
        )
    }
}
