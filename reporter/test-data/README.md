This folder uses snapshots.

For updating the result snapshots, run:

    node --no-warnings examples/mars-rover/tests.ts > reporter/test-data/mars-rover.json
    node --no-warnings examples/firmware/tests.ts > reporter/test-data/firmware.json

For updating the report snapshots, run:

    cat reporter/test-data/mars-rover.json  | node --no-warnings reporter/markdown-cli.ts > reporter/test-data/mars-rover.md
    cat reporter/test-data/firmware.json  | node --no-warnings reporter/markdown-cli.ts > reporter/test-data/firmware.md
