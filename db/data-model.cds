namespace db;

entity DEPARTMENTS {
  key DEPT_ID       : Integer64;
      DEPT_NAME     : String;
      MANAGER_ID    : Integer64;
}

entity PROJECTS {
  key PROJECT_ID      : UUID;
      PROJECT_Name    : String(100);
      CLIENT_NAME     : String(100);
      CLIENT_LOCATION : String(256);
      PROJECT_TYPE_ID : String(32);
      PROJECT_IMPL_ID : String(100);
}

entity TECHNOLOGIES {
  key TECH_ID       : UUID;
      TECH_NAME     : String(100);
}

entity COUNTRIES {
  key COUNTRY_ID    :String(3);
      COUNTRY_NAME  : String(100);
}

entity STATE {
  key COUNTRY_ID  : String(3);
  key STATE_ID    : String(36);
      STATE_NAME  : String(100);
}

entity EMPLOYEES {
  key EMP_ID        : Integer64;      
      FIRST_NAME    : String(32);
      MIDDLE_NAME   : String(32);
      LAST_NAME     : String(32);
      PHONE         : Integer64;
      EMAIL         : String(100);
      DATEOFBIRTH   : Date;
      DEPT_ID       : Integer64;
      SALARY        : Integer64;
      CURRENCY      : String(3);
      // LINK_TO_EMP_DEPT : Composition of many EMP_DEPT on LINK_TO_EMP_DEPT.EMP = $self;
      LINK_TO_EMP_ADD  : Composition of many ADDRESS on LINK_TO_EMP_ADD.EMP = $self;
      LINK_TO_EMP_TECH : Association[1.. *] to EMP_TECH on LINK_TO_EMP_TECH.EMP_ID = EMP_ID;
      LINK_TO_EMP_PROJ : Association[1.. *] to EMP_PROJ on LINK_TO_EMP_PROJ.EMP_ID = EMP_ID;
      LINK_TO_DEPARTMENT : Association[1..1] to DEPARTMENTS on LINK_TO_DEPARTMENT.DEPT_ID = DEPT_ID;
}

// entity EMP_DEPT {
//   key ID            : UUID;      
//       DEPT_ID       : Integer64;
//       EMP           : Association to EMPLOYEES;
//       LINK_TO_DEPARTMENT : Association[1..1] to DEPARTMENTS on LINK_TO_DEPARTMENT.DEPT_ID = DEPT_ID;
// }

entity EMP_TECH {
  key ID      : UUID;
      EMP_ID  : Integer64;
      TECH_ID : UUID;
      LINK_TO_TECHNOLOGIES : Association[1..1] to TECHNOLOGIES on LINK_TO_TECHNOLOGIES.TECH_ID = TECH_ID;
}

entity EMP_PROJ {
  key ID          : UUID;
      EMP_ID      : Integer64;
      PROJECT_ID  : UUID;
      TECH_ID     : UUID;
      LINK_TO_PROJECTS     : Association[1..1] to PROJECTS on LINK_TO_PROJECTS.PROJECT_ID = PROJECT_ID;
      LINK_TO_TECHNOLOGIES : Association[1..1] to TECHNOLOGIES on LINK_TO_TECHNOLOGIES.TECH_ID = TECH_ID;
}

// entity EMP_ADDRESS {
//   key ID          : UUID;
//       EMP         : Association to EMPLOYEES;
//       ADDRESS_ID  : Integer64;
//       LINK_TO_ADDRESS : Composition of many ADDRESS on LINK_TO_ADDRESS.ADDRESS = $self;
// }

entity ADDRESS {
  key ID                : UUID;
      // ADDRESS           : Association to EMP_ADDRESS;
      EMP               : Association to EMPLOYEES;
      COUNTRY_ID        : String(3);
      STATE_ID          : String(36);
      REGION            : String(100);
      LOCATION_DETAILS  : String(256);
      ADD_TYPE_ID       : UUID;
      LINK_TO_COUNTRY   : Association[1..1] to COUNTRIES on LINK_TO_COUNTRY.COUNTRY_ID = COUNTRY_ID;
      LINK_TO_STATE     : Association[1..1] to STATE on LINK_TO_STATE.STATE_ID = STATE_ID;
      LINK_TO_ADD_TYPE  : Association[1..1] to ADDRESS_TYPE on LINK_TO_ADD_TYPE.ADD_TYPE_ID = ADD_TYPE_ID;
}

entity ADDRESS_TYPE {
  key ADD_TYPE_ID       : UUID;
      ADD_TYPE          : String(36);
}