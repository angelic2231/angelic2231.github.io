import { exec, spawn } from "child_process"
import { createServer } from "net"

// clear screen
process.stdout.write("\x1b[2J\x1b[0f")

// find free port
function getPort() {
  return new Promise((resolve, reject) => {
    const srv = createServer()
    srv.listen(0, () => {
      const port = srv.address().port
      srv.close(() => resolve(port))
    })
    srv.on("error", reject)
  })
}

const port = await getPort()
const wsPort = await getPort()
const url = `http://localhost:${port}`

console.log(`\x1b[32m[Server]\x1b[0m Local: \x1b[36m\x1b[4m${url}\x1b[0m \x1b[90m(ws: ${wsPort})\x1b[0m`)

// open in browser
setTimeout(() => exec(`start "" "${url}"`), 2000)

// run quartz dev server
spawn(process.execPath, ["./quartz/bootstrap-cli.mjs", "build", "--serve", "--port", String(port), "--wsPort", String(wsPort)], {
  stdio: "inherit",
})
