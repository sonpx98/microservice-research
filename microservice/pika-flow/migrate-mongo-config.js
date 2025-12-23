module.exports = {
    mongodb: {
        // TODO Change (or use 'mongodb://localhost:27017') if your database is not 'mongodb://user:password@localhost:27017'
        url: process.env.MONGO_URI || "mongodb://user:password@localhost:27017",

        // TODO Change this to your database name:
        databaseName: "pikaflow",

        options: {
            //   connectTimeoutMS: 3600000, // increase connection timeout to 1 hour
            //   socketTimeoutMS: 3600000, // increase socket timeout to 1 hour
        }
    },

    // The migrations dir, can be an relative or absolute path. Only edit this when really necessary.
    migrationsDir: "migrations",

    // The mongodb collection where the applied changes are stored. Only edit this when really necessary.
    changelogCollectionName: "changelog",

    // The file extension to create migrations and search for in migration dir 
    migrationFileExtension: ".js",

    // Enable the algorithm to create a checksum of the file contents and use that in the comparison to determine
    // if the file should be run.  Requires that using the M3 method of running migrations.
    useFileHash: false,

    // Don't change this, unless you know what you are doing
    moduleSystem: 'commonjs',
};
