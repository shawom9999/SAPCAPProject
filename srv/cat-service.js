module.exports = (srv => {
    const {
        EMP_TECH,
        EMP_PROJ,
        ADDRESS
    } = cds.entities('db');

    srv.on("updateSelectedProjects", "Employees", async (req) => {
        try {
            const empId = req.params[0].EMP_ID;
            let aProjId = this.req.data.selectedProjects;

            await cds.run(`DELETE from DB_EMP_PROJ where EMP_ID = ?`, [empId]).catch((error) => {
                throw error;
            });

            if (aProjId.length > 0) {
                await cds.run(INSERT.into(EMP_PROJ).entries(aProjId)).catch((error) => {
                    throw error;
                });
            }

            await runTransactionQuery(req);
            req.reply(req.data);
        } catch (err) {
            throw err;
        }
    });

    srv.on("updateSelectedTechnologies", "Employees", async (req) => {
        try {
            const empId = req.params[0].EMP_ID;
            let aSelTech = this.req.data.selectedTechnolgies;

            await cds.run(`DELETE from DB_EMP_TECH where EMP_ID = ?`, [empId]).catch((error) => {
                throw error;
            });

            if (aSelTech.length > 0) {
                await cds.run(INSERT.into(EMP_TECH).entries(aSelTech)).catch((error) => {
                    throw error;
                });
            }

            await runTransactionQuery(req);
            req.reply(req.data);
        } catch (err) {
            throw err;
        }
    });

    srv.on("updateAddress", "Employees", async (req) => {
        try {
            const empId = req.params[0].EMP_ID;
            let aAddress = this.req.data.aAddress;

            await cds.run(`DELETE from DB_ADDRESS where EMP_EMP_ID = ?`, [empId]).catch((error) => {
                throw error;
            });

            if (aAddress.length > 0) {
                await cds.run(INSERT.into(ADDRESS).entries(aAddress)).catch((error) => {
                    throw error;
                });
            }

            await runTransactionQuery(req);
            req.reply(req.data);
        } catch (err) {
            throw err;
        }
    });
})