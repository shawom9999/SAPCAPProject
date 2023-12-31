using db from '../db/data-model';

service CatalogService @(requires : 'authenticated-user'){
    
    entity Departments as projection on db.DEPARTMENTS;
    entity Projects as projection on db.PROJECTS;
    entity Technologies as projection on db.TECHNOLOGIES;
    entity Countries as projection on db.COUNTRIES;
    entity States as projection on db.STATE;


    entity Employees as projection on db.EMPLOYEES {
        *,
        // LINK_TO_EMP_DEPT : redirected to EmpDept,
        LINK_TO_EMP_ADD  : redirected to Address,
        LINK_TO_EMP_TECH : redirected to EmpTechnology,
        LINK_TO_EMP_PROJ : redirected to EmpProjects,
        LINK_TO_DEPARTMENT : redirected to Departments
    } actions {
        action updateSelectedProjects(selectedProjects : array of {
            EMP_ID: Integer64;
            PROJECT_ID: String(36)
        });
        action updateSelectedTechnologies(selectedTechnolgies : array of {
            EMP_ID: Integer64;
            TECH_ID: String(36)
        });
        action updateAddress(aAddress : array of {
            EMP_EMP_ID        : Integer64;
            COUNTRY_ID        : String(3);
            STATE_ID          : String(36);
            REGION            : String(100);
            LOCATION_DETAILS  : String(256);
            ADD_TYPE_ID       : String(36);
        });

    };

    // entity EmpDept as projection on db.EMP_DEPT{
    //     *,
    //     LINK_TO_DEPARTMENT : redirected to Departments
    // };

    entity EmpTechnology as projection on db.EMP_TECH {
        *,
        LINK_TO_TECHNOLOGIES : redirected to Technologies
    };

    entity EmpProjects as projection on db.EMP_PROJ {
        *,
        LINK_TO_PROJECTS : redirected to Projects,
        LINK_TO_TECHNOLOGIES : redirected to Technologies
    };

    // entity EmpAddress as projection on db.EMP_ADDRESS {
    //     *,
    //     LINK_TO_ADDRESS : redirected to Address
    // };   

    entity Address as projection on db.ADDRESS {
        *,
        LINK_TO_ADD_TYPE : redirected to AddressType,
        LINK_TO_COUNTRY  : redirected to Countries,
        LINK_TO_STATE    : redirected to States
    };

    entity AddressType as projection on db.ADDRESS_TYPE;

}