This folder uses snapshots.

For updating the result snapshots, run:

    npx tsx examples/mars-rover/tests.ts > reporter/test-data/mars-rover.json
    npx tsx examples/firmware/tests.ts > reporter/test-data/firmware.json

For updating the report snapshots, run:

    cat reporter/test-data/mars-rover.json  | npx tsx reporter/markdown-cli.ts > reporter/test-data/mars-rover.md
    cat reporter/test-data/firmware.json  | npx tsx reporter/markdown-cli.ts > reporter/test-data/firmware.md
